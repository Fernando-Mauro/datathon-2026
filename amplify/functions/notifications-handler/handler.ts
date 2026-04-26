import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import mysql from "mysql2/promise";

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
      timezone: "Z",
      waitForConnections: true,
      connectionLimit: 2,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
    });
  }
  return pool;
}

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,OPTIONS",
  "access-control-allow-headers": "authorization,content-type",
};

type NotificationRow = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  havi_prompt: string;
  havi_context: string | object;
  scheduled_at: Date;
};

type NotificationDTO = {
  id: string;
  userId: string;
  kind: string;
  title: string;
  body: string;
  haviPrompt: string;
  /** Solo presente en la respuesta de /notifications/{id} (no en la lista). */
  haviContext?: unknown;
  /** ISO 8601 UTC. */
  scheduledAt: string;
};

function toDTO(r: NotificationRow, includeContext: boolean): NotificationDTO {
  const dto: NotificationDTO = {
    id: r.id,
    userId: r.user_id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    haviPrompt: r.havi_prompt,
    scheduledAt: new Date(r.scheduled_at).toISOString(),
  };
  if (includeContext) {
    dto.haviContext =
      typeof r.havi_context === "string"
        ? safeParse(r.havi_context)
        : r.havi_context;
  }
  return dto;
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    // GET /notifications/{id}
    const idMatch = path.match(/\/notifications\/([A-Za-z0-9_-]+)$/);
    if (method === "GET" && idMatch) {
      const id = idMatch[1];
      const conn = db();
      const [rows] = await conn.query<mysql.RowDataPacket[]>(
        `SELECT id, user_id, kind, title, body, havi_prompt, havi_context, scheduled_at
         FROM notifications WHERE id = ? LIMIT 1`,
        [id],
      );
      const row = rows[0] as NotificationRow | undefined;
      if (!row) {
        return {
          statusCode: 404,
          headers: { ...CORS_HEADERS, "content-type": "application/json" },
          body: JSON.stringify({ error: "notification not found" }),
        };
      }
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, "content-type": "application/json" },
        body: JSON.stringify(toDTO(row, true)),
      };
    }

    // GET /notifications?personaUserId=USR-XXXXX
    if (method === "GET") {
      const userId = event.queryStringParameters?.personaUserId;
      if (!userId || !/^USR-\d{5}$/.test(userId)) {
        return {
          statusCode: 400,
          headers: { ...CORS_HEADERS, "content-type": "application/json" },
          body: JSON.stringify({ error: "personaUserId requerido (USR-NNNNN)" }),
        };
      }
      const conn = db();
      const [rows] = await conn.query<mysql.RowDataPacket[]>(
        `SELECT id, user_id, kind, title, body, havi_prompt, havi_context, scheduled_at
         FROM notifications WHERE user_id = ? ORDER BY scheduled_at DESC`,
        [userId],
      );
      const items = (rows as NotificationRow[]).map((r) => toDTO(r, false));
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, "content-type": "application/json" },
        body: JSON.stringify({ items }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "method not allowed" }),
    };
  } catch (err) {
    console.error("[notifications-handler] error", err);
    const message = err instanceof Error ? err.message : "internal error";
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "content-type": "application/json" },
      body: JSON.stringify({ error: message }),
    };
  }
};
