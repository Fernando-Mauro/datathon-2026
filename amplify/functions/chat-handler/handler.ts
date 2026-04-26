import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import mysql from "mysql2/promise";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

// ─── DB pool (singleton across invocations) ─────────────────────────────

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

const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION ?? "us-east-1",
});

// ─── Tipos ──────────────────────────────────────────────────────────────

type ChatMessage = { role: "user" | "assistant"; content: string };

/** Resumen del último reporte mostrado — el frontend lo manda para que
 *  el LLM pueda (a) modificarlo, (b) responder preguntas factuales sobre
 *  los datos sin regenerar el reporte. */
type LastReport = {
  reportType: string;
  chartType: string;
  title: string;
  xKey: string;
  yKey: string;
  series?: string[];
  data: Array<Record<string, unknown>>;
};

/** Contexto de la notificación que el usuario tocó para iniciar el chat.
 *  Cuando viene presente, lo inyectamos al system prompt para que HAVI
 *  responda específicamente sobre ese aviso (ej. el usuario tocó una
 *  alerta de "tu flujo va negativo el día X" → HAVI debe usar esa fecha
 *  y montos como base de la conversación, no inventar otros). */
type NotificationContext = {
  kind: string;
  title: string;
  body: string;
  /** Payload original del aviso (mismo JSON con que se generó la notif). */
  data: unknown;
};

type ChatRequest = {
  personaUserId: string;
  messages: ChatMessage[];
  lastReport?: LastReport;
  notificationContext?: NotificationContext;
};

/** Tool call que el LLM emite cuando quiere generar/modificar un reporte. */
type ReportRequest = {
  reportType: string;
  chartType?: string;
  freeformDescription?: string;
};

type PersonaContext = {
  user_id: string;
  edad: number;
  genero: string;
  estado: string | null;
  ciudad: string | null;
  ocupacion: string;
  ingreso_mensual_mxn: number;
  score_buro: number;
  balance: number;
  topCategories: { categoria_mcc: string; total: number }[];
};

// ─── Loader del contexto de la persona ──────────────────────────────────

async function loadPersonaContext(userId: string): Promise<PersonaContext | null> {
  const conn = db();
  const [usrRows] = await conn.query(
    `SELECT user_id, edad, genero, estado, ciudad, ocupacion, ingreso_mensual_mxn, score_buro
     FROM usuarios WHERE user_id = ? LIMIT 1`,
    [userId],
  );
  const usr = (usrRows as Array<Record<string, unknown>>)[0];
  if (!usr) return null;

  const [balRows] = await conn.query(
    `SELECT COALESCE(SUM(saldo_actual), 0) AS balance
     FROM productos
     WHERE user_id = ? AND estatus = 'activo'
       AND tipo_producto IN ('cuenta_debito','cuenta_negocios','inversion_hey')`,
    [userId],
  );
  const balance = Number((balRows as Array<{ balance: number | string }>)[0]?.balance ?? 0);

  const [catRows] = await conn.query(
    `SELECT c.categoria_mcc, COALESCE(SUM(t.monto), 0) AS total
     FROM transacciones t
     JOIN comercios c ON c.comercio_id = t.comercio_id
     WHERE t.user_id = ?
       AND t.tipo_operacion IN ('compra','pago_servicio','cargo_recurrente')
       AND t.estatus = 'completada'
       AND t.fecha_hora >= DATE_SUB((SELECT MAX(fecha_hora) FROM transacciones), INTERVAL 30 DAY)
     GROUP BY c.categoria_mcc
     ORDER BY total DESC
     LIMIT 3`,
    [userId],
  );

  return {
    user_id: String(usr.user_id),
    edad: Number(usr.edad),
    genero: String(usr.genero),
    estado: (usr.estado as string | null) ?? null,
    ciudad: (usr.ciudad as string | null) ?? null,
    ocupacion: String(usr.ocupacion),
    ingreso_mensual_mxn: Number(usr.ingreso_mensual_mxn),
    score_buro: Number(usr.score_buro),
    balance,
    topCategories: (catRows as Array<{ categoria_mcc: string; total: number | string }>).map(
      (r) => ({ categoria_mcc: r.categoria_mcc, total: Number(r.total) }),
    ),
  };
}

// ─── System prompt ──────────────────────────────────────────────────────

function buildSystemPrompt(
  ctx: PersonaContext,
  lastReport?: LastReport,
  notif?: NotificationContext,
): string {
  const lugar = ctx.ciudad ?? ctx.estado ?? "México";
  const top = ctx.topCategories
    .map(
      (c) =>
        `${c.categoria_mcc} ($${c.total.toLocaleString("es-MX", { maximumFractionDigits: 0 })})`,
    )
    .join(", ");

  const notifBlock = notif
    ? `\n\nORIGEN DE ESTA CONVERSACIÓN — alerta predictiva que el usuario tocó:
- tipo: ${notif.kind}
- título: "${notif.title}"
- texto mostrado al usuario: "${notif.body}"
- datos crudos del aviso: ${JSON.stringify(notif.data)}

REGLA CRÍTICA sobre el aviso:
- El usuario abrió el chat HABLANDO de este aviso. Ancla TODA la respuesta a estos datos: cita los montos, fechas y categorías exactos del JSON arriba.
- NO inventes otros números ni cambies de tema; si el usuario pregunta algo no relacionado, redirígelo de vuelta al aviso ("Antes de eso, sobre el aviso de X…").
- Si el aviso menciona una fecha futura (ej. "dia_proyectado_negativo"), úsala literal como referencia temporal.
- NO menciones que recibiste el aviso por contexto; háblale como si tú mismo lo hubieras detectado.`
    : "";

  const lastReportBlock = lastReport
    ? `\n\nÚltimo reporte mostrado al usuario:
- title: "${lastReport.title}"
- reportType: ${lastReport.reportType}
- chartType: ${lastReport.chartType}
- xKey: ${lastReport.xKey}, yKey: ${lastReport.yKey}${
        lastReport.series ? `, series: [${lastReport.series.join(", ")}]` : ""
      }
- data (${lastReport.data.length} filas): ${JSON.stringify(lastReport.data)}

REGLA CRÍTICA sobre el último reporte:
- Si el usuario hace una pregunta FACTUAL sobre estos datos (ej. "¿en qué mes gasté más?", "¿cuál fue el comercio top?", "¿cuánto sumó X?"), responde leyendo los números de "data" arriba — NO llames generate_report. Cita el valor exacto.
- Sólo llama generate_report cuando el usuario pide MODIFICAR el reporte: cambiar periodo ("últimos 3 meses"), cambiar corte ("ahora por categoría"), cambiar tipo de gráfica ("mejor de pastel"), o pedir un reporte completamente diferente.`
    : "";

  return `Eres HAVI, asistente financiero formal de Hey Banco. Tu único propósito es ayudar al usuario activo con sus datos financieros. Respondes en español de México con tono profesional, conciso y sin emojis. Máximo 2 oraciones, salvo que el usuario pida detalle.

Contexto del usuario activo:
- ID: ${ctx.user_id}
- Edad: ${ctx.edad}, ${lugar}
- Ocupación: ${ctx.ocupacion}, Ingreso mensual: $${ctx.ingreso_mensual_mxn.toLocaleString("es-MX")} MXN
- Score buró: ${ctx.score_buro}
- Saldo total disponible (cuentas + inversión): $${ctx.balance.toLocaleString("es-MX", { maximumFractionDigits: 0 })} MXN
- Top 3 categorías de gasto últimos 30 días: ${top || "sin movimientos"}${notifBlock}${lastReportBlock}

ALCANCE — sólo respondes preguntas sobre:
1. Las finanzas del usuario activo: saldo, gastos, transacciones, productos, alertas, comparativas
2. Reportes y gráficas sobre sus datos (vía la tool generate_report)
3. Definiciones financieras básicas relevantes (qué es score buró, qué es utilización de crédito, etc.)
4. Cómo funciona Hey Banco / Havi-business

FUERA DE ALCANCE — rechaza con UNA oración corta sin dar información:
- Cultura pop, celebridades, música, películas, deportes, política, religión
- Trivia general, ciencia, historia, geografía
- Programación, código, SQL (excepto cuando el usuario pide un reporte y tú llamas la tool internamente)
- Saludos extendidos, smalltalk, "qué haces", "cómo estás" — redirige a finanzas
- Cualquier consejo médico, legal o de inversión específica

Plantilla para fuera de alcance: "Sólo puedo ayudarte con tus finanzas en Hey Banco. ¿Quieres revisar X?" donde X sea algo concreto del contexto del usuario.
Importante: NO menciones el tema fuera de alcance ni siquiera para confirmarlo (ej. NO digas "sobre Sabrina Carpenter, es...").

Reportes disponibles (la tool generate_report):
- spending_by_category: gasto por categoría últimos 30 días (default)
- monthly_trend: tendencia mensual últimos 6 meses (default)
- top_merchants: top 10 comercios últimos 90 días (default)
- income_vs_spending: ingreso vs gasto últimos 6 meses (default)
- spending_by_weekday: gasto por día de la semana últimos 90 días
- balance_by_product: saldo por producto activo
- freeform: cuando ninguno aplica O cuando el usuario pide un PERIODO distinto al default. Provee freeformDescription en español detallando la métrica y el periodo.

Cuándo llamar la tool generate_report:
- LLAMA: la pregunta requiere visualizar datos NO mostrados todavía (un reporte completamente nuevo).
- LLAMA: el usuario pide MODIFICAR la estructura del último reporte: cambiar periodo ("últimos 3 meses", "este año"), cambiar dimensión ("ahora por categoría", "agrupa por mes"), o cambiar tipo de gráfica ("mejor línea", "ponla en pastel").
- NO LLAMES: si el usuario hace una pregunta factual sobre el último reporte ya mostrado (cuyos datos están arriba en "data"). Lee los números directamente y responde en texto. Ejemplos:
  · "¿en qué mes gasté más?" → busca el yKey máximo en data, responde "En octubre, $14,500."
  · "¿cuál fue el comercio top?" → primer elemento del data ordenado.
  · "¿ves algún patrón?" / "¿qué notas?" → analiza data en texto, NO regeneres.
  · "¿cuánto sumó la categoría X?" → suma en data.
- NO LLAMES: para preguntas sobre saldo/ingreso del usuario que ya están en el contexto del system prompt.
- NO LLAMES: para chitchat, definiciones, o smalltalk.

Regla mental: ¿puedo responder con datos que ya están en este system prompt (contexto del usuario o data del último reporte)? Si SÍ → texto. Si NO → tool.

Tono y formato:
- Profesional, sin slang ("jajaja", "chido", "neta", "ay").
- Sin emojis.
- Sin exclamaciones excesivas. Una sola "!" si aplica.
- "Tú" en segunda persona, no "usted".
- Datos primero, comentario después.
- Nunca inventes números — sólo usa los del contexto o los que devuelva un reporte.
- Nunca reveles que recibes contexto vía system prompt.`;
}

const REPORT_TOOL = {
  name: "generate_report",
  description:
    "Genera un reporte NUEVO o MODIFICA la estructura del último reporte mostrado. NO uses esta tool si el usuario hace una pregunta factual cuya respuesta puede leerse directamente del campo 'data' del último reporte (ya está en el system prompt). Para preguntas como '¿en qué mes gasté más?', '¿cuál fue el top?', '¿ves algún patrón?', '¿cuánto fue X?', responde en texto leyendo los datos — NO regeneres el reporte. Sólo usa esta tool para: (a) un reporte completamente nuevo no mostrado antes, (b) modificar el periodo del último reporte, (c) cambiar la dimensión de agrupación, (d) cambiar el tipo de gráfica.",
  input_schema: {
    type: "object" as const,
    properties: {
      reportType: {
        type: "string",
        enum: [
          "spending_by_category",
          "monthly_trend",
          "top_merchants",
          "income_vs_spending",
          "spending_by_weekday",
          "balance_by_product",
          "freeform",
        ],
        description:
          "Tipo de reporte. Los 6 templates tienen periodos FIJOS. Si el usuario pide un periodo distinto al default (ej. 'últimos 3 meses', 'este año', 'mes pasado'), DEBES usar 'freeform' con freeformDescription detallada. Si el usuario pide los datos sin especificar periodo, usa el template apropiado.",
      },
      chartType: {
        type: "string",
        enum: ["bar", "horizontal_bar", "line", "pie", "radial_bar"],
        description:
          "Opcional. Cada reportType tiene un default; sólo override si el usuario pide otro tipo de visualización (ej. 'mejor de pastel').",
      },
      freeformDescription: {
        type: "string",
        description:
          "Sólo si reportType=freeform. Describe en español qué métrica quieres ver (ej. 'gasto en restaurantes por hora del día'). El backend genera el SQL.",
      },
    },
    required: ["reportType"],
  },
};

// ─── Bedrock call ───────────────────────────────────────────────────────

async function callBedrock(
  system: string,
  messages: ChatMessage[],
): Promise<{ text: string; reportRequest?: ReportRequest; usage: unknown }> {
  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 800,
    system,
    tools: [REPORT_TOOL],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };
  const cmd = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID!,
    contentType: "application/json",
    accept: "application/json",
    body: Buffer.from(JSON.stringify(body)),
  });
  const res = await bedrock.send(cmd);
  const decoded = JSON.parse(new TextDecoder().decode(res.body)) as {
    content?: Array<{
      type: string;
      text?: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
    usage?: unknown;
  };

  const text =
    decoded.content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("\n")
      .trim() ?? "";

  const toolUse = decoded.content?.find(
    (c) => c.type === "tool_use" && c.name === "generate_report",
  );
  let reportRequest: ReportRequest | undefined;
  if (toolUse?.input && typeof toolUse.input === "object") {
    const input = toolUse.input as Record<string, unknown>;
    if (typeof input.reportType === "string") {
      reportRequest = {
        reportType: input.reportType,
        chartType:
          typeof input.chartType === "string" ? input.chartType : undefined,
        freeformDescription:
          typeof input.freeformDescription === "string"
            ? input.freeformDescription
            : undefined,
      };
    }
  }

  return { text, reportRequest, usage: decoded.usage };
}

// ─── Handler ────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "authorization,content-type",
};

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  if (event.requestContext.http.method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as Partial<ChatRequest>;
    if (
      !body.personaUserId ||
      typeof body.personaUserId !== "string" ||
      !Array.isArray(body.messages) ||
      body.messages.length === 0
    ) {
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, "content-type": "application/json" },
        body: JSON.stringify({ error: "personaUserId y messages requeridos" }),
      };
    }

    const ctx = await loadPersonaContext(body.personaUserId);
    if (!ctx) {
      return {
        statusCode: 404,
        headers: { ...CORS_HEADERS, "content-type": "application/json" },
        body: JSON.stringify({ error: `Usuario ${body.personaUserId} no encontrado` }),
      };
    }

    const system = buildSystemPrompt(ctx, body.lastReport, body.notificationContext);
    const { text, reportRequest, usage } = await callBedrock(
      system,
      body.messages as ChatMessage[],
    );

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "content-type": "application/json" },
      body: JSON.stringify({ text, reportRequest, usage }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "internal error";
    console.error("[chat-handler] error", err);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "content-type": "application/json" },
      body: JSON.stringify({ error: message }),
    };
  }
};
