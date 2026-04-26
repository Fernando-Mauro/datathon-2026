import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import mysql from "mysql2/promise";
import { randomUUID } from "node:crypto";

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

type SaveRequest = {
  personaUserId: string;
  title: string;
  reportType: string;
  chartType: string;
  xKey: string;
  yKey: string;
  series?: string[];
  data: Array<Record<string, unknown>>;
  sql: string;
  source: "template" | "freeform";
};

// ─── CORS ────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
  "access-control-allow-headers": "authorization,content-type",
};

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { ...CORS_HEADERS, "content-type": "application/json" },
  body: JSON.stringify(body),
});

// ─── Helpers ─────────────────────────────────────────────────────────────

function getAdminSub(event: APIGatewayProxyEventV2WithJWTAuthorizer): string | null {
  const claims = event.requestContext.authorizer?.jwt?.claims;
  const sub = claims?.sub;
  return typeof sub === "string" ? sub : null;
}

// ─── Handler ─────────────────────────────────────────────────────────────

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  const adminSub = getAdminSub(event);
  if (!adminSub) {
    return json(401, { error: "JWT inválido — falta claim sub" });
  }

  try {
    if (method === "POST") {
      return await handleSave(event, adminSub);
    }
    if (method === "GET") {
      return await handleList(event, adminSub);
    }
    if (method === "DELETE") {
      return await handleDelete(event, adminSub);
    }
    return json(405, { error: `Método ${method} no permitido` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    console.error("[saved-charts-handler] error", err);
    return json(500, { error: message });
  }
};

// ─── POST /save-chart ────────────────────────────────────────────────────

async function handleSave(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  adminSub: string,
): Promise<APIGatewayProxyResultV2> {
  const body = JSON.parse(event.body ?? "{}") as Partial<SaveRequest>;

  // Validación de shape
  const missing: string[] = [];
  if (!body.personaUserId) missing.push("personaUserId");
  if (!body.title) missing.push("title");
  if (!body.reportType) missing.push("reportType");
  if (!body.chartType) missing.push("chartType");
  if (!body.xKey) missing.push("xKey");
  if (!body.yKey) missing.push("yKey");
  if (!Array.isArray(body.data)) missing.push("data");
  if (!body.sql) missing.push("sql");
  if (body.source !== "template" && body.source !== "freeform") missing.push("source");
  if (missing.length) {
    return json(400, { error: `Campos faltantes/invalidos: ${missing.join(", ")}` });
  }

  const id = randomUUID();
  const seriesJson = body.series ? JSON.stringify(body.series) : null;
  const dataJson = JSON.stringify(body.data);

  // Capeo defensivo del tamaño del payload (LONGTEXT de MariaDB aguanta 4GB pero
  // queremos evitar abuso).
  if (dataJson.length > 1_000_000) {
    return json(413, { error: "data demasiado grande (>1MB)" });
  }

  await db().query(
    `INSERT INTO saved_charts
      (id, admin_sub, persona_user_id, title, report_type, chart_type,
       x_key, y_key, series_json, data_json, sql_text, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      adminSub,
      body.personaUserId,
      body.title!.slice(0, 200),
      body.reportType,
      body.chartType,
      body.xKey,
      body.yKey,
      seriesJson,
      dataJson,
      body.sql,
      body.source,
    ],
  );

  return json(201, {
    id,
    title: body.title,
    createdAt: new Date().toISOString(),
  });
}

// ─── GET /saved-charts ───────────────────────────────────────────────────

async function handleList(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  adminSub: string,
): Promise<APIGatewayProxyResultV2> {
  const personaFilter = event.queryStringParameters?.personaUserId;

  const params: unknown[] = [adminSub];
  let where = "admin_sub = ?";
  if (personaFilter && /^USR-\d+$/.test(personaFilter)) {
    where += " AND persona_user_id = ?";
    params.push(personaFilter);
  }

  const [rows] = await db().query(
    `SELECT id, persona_user_id, title, report_type, chart_type,
            x_key, y_key, series_json, data_json, sql_text, source, created_at
       FROM saved_charts
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT 200`,
    params,
  );

  const items = (rows as Array<Record<string, unknown>>).map((r) => ({
    id: String(r.id),
    personaUserId: String(r.persona_user_id),
    title: String(r.title),
    reportType: String(r.report_type),
    chartType: String(r.chart_type),
    xKey: String(r.x_key),
    yKey: String(r.y_key),
    series: r.series_json ? (JSON.parse(String(r.series_json)) as string[]) : undefined,
    data: JSON.parse(String(r.data_json)) as Array<Record<string, unknown>>,
    sql: String(r.sql_text),
    source: String(r.source) as "template" | "freeform",
    createdAt:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : String(r.created_at),
  }));

  return json(200, { items });
}

// ─── DELETE /saved-charts/{id} ───────────────────────────────────────────

async function handleDelete(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
  adminSub: string,
): Promise<APIGatewayProxyResultV2> {
  const id = event.pathParameters?.id;
  if (!id || typeof id !== "string") {
    return json(400, { error: "id requerido en la ruta" });
  }
  // El WHERE por admin_sub asegura que un admin no pueda borrar guardados
  // de otro admin.
  const [result] = await db().query(
    "DELETE FROM saved_charts WHERE id = ? AND admin_sub = ?",
    [id, adminSub],
  );
  const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
  if (affected === 0) {
    return json(404, { error: "no encontrado" });
  }
  return json(200, { id, deleted: true });
}
