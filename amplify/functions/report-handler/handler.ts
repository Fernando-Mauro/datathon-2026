import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import mysql from "mysql2/promise";
import {
  TEMPLATES,
  humanizeRows,
  type ChartType,
} from "./templates";
import { validateSql } from "./validate";
import { planReportFromDescription } from "./llm";

// ─── DB pool (singleton) ─────────────────────────────────────────────────

let pool: mysql.Pool | null = null;
function db(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      ssl: process.env.DB_SSL === "1" ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 2,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
    });
  }
  return pool;
}

// ─── Tipos ───────────────────────────────────────────────────────────────

type ReportRequest = {
  personaUserId: string;
  reportType: string; // "spending_by_category" | ... | "freeform"
  chartType?: ChartType;
  freeformDescription?: string;
};

type ReportResponse = {
  reportType: string;
  chartType: ChartType;
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  series?: string[]; // múltiples series (ej. ingreso vs gasto)
  sql: string; // visible para transparencia/debug
  source: "template" | "freeform";
};

// ─── CORS ────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "authorization,content-type",
};

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { ...CORS_HEADERS, "content-type": "application/json" },
  body: JSON.stringify(body),
});

// ─── Handler ─────────────────────────────────────────────────────────────

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  if (event.requestContext.http.method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as Partial<ReportRequest>;

    if (!body.personaUserId || typeof body.personaUserId !== "string") {
      return json(400, { error: "personaUserId requerido" });
    }
    if (!body.reportType || typeof body.reportType !== "string") {
      return json(400, { error: "reportType requerido" });
    }

    const userId = body.personaUserId;
    const reportType = body.reportType;

    // ─── Caso 1: template conocido ───
    if (TEMPLATES[reportType]) {
      const tpl = TEMPLATES[reportType];
      const built = tpl.build(userId);
      const [rows] = await db().query(built.sql, built.params);
      const data = humanizeRows(reportType, rows as Array<Record<string, unknown>>);
      const series = built.series ? built.series.split(",") : undefined;
      const resp: ReportResponse = {
        reportType,
        chartType: body.chartType ?? tpl.defaultChartType,
        title: tpl.title,
        data,
        xKey: built.xKey,
        yKey: built.yKey,
        series,
        sql: built.sql.trim().replace(/\s+/g, " "),
        source: "template",
      };
      return json(200, resp);
    }

    // ─── Caso 2: freeform ───
    if (reportType === "freeform") {
      if (!body.freeformDescription || typeof body.freeformDescription !== "string") {
        return json(400, {
          error: "freeformDescription requerido para reportType=freeform",
        });
      }

      const plan = await planReportFromDescription(body.freeformDescription);

      // Validar SQL del LLM
      const validation = validateSql(plan.sql);
      if (!validation.ok) {
        return json(400, {
          error: `SQL del LLM rechazado: ${validation.reason}`,
          sql: plan.sql,
        });
      }

      // Ejecutar con userId como único parámetro
      try {
        const [rows] = await db().query(validation.sql, [userId]);
        const resp: ReportResponse = {
          reportType: "freeform",
          chartType: body.chartType ?? plan.chartType,
          title: plan.title,
          data: rows as Array<Record<string, unknown>>,
          xKey: plan.xKey,
          yKey: plan.yKey,
          sql: validation.sql,
          source: "freeform",
        };
        return json(200, resp);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "DB error";
        return json(400, {
          error: `SQL falló: ${msg}`,
          sql: validation.sql,
        });
      }
    }

    return json(400, {
      error: `reportType desconocido: ${reportType}`,
      hint: `Templates disponibles: ${Object.keys(TEMPLATES).join(", ")}, freeform`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    console.error("[report-handler] error", err);
    return json(500, { error: message });
  }
};
