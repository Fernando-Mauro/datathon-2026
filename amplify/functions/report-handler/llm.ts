import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { ChartType } from "./templates";

const SCHEMA_PROMPT = `Schema (RDS MariaDB, base "datathon"):

usuarios(user_id PK, edad, genero ENUM(M,H,SE), estado, ciudad, ocupacion ENUM(Empleado,Independiente,Estudiante,Empresario,Desempleado,Jubilado), ingreso_mensual_mxn, antiguedad_dias, es_hey_pro, score_buro)

productos(producto_id PK, user_id FK, tipo_producto ENUM(cuenta_debito,cuenta_negocios,inversion_hey,tarjeta_credito_hey,tarjeta_credito_garantizada,tarjeta_credito_negocios,credito_personal,credito_auto,credito_nomina,seguro_vida,seguro_compras), estatus ENUM(activo,inactivo,cancelado,bloqueado,en_mora,suspendido,revision_de_pagos), fecha_apertura DATE, limite_credito DECIMAL, saldo_actual DECIMAL, utilizacion_pct DECIMAL, monto_mensualidad DECIMAL)

transacciones(transaccion_id PK, user_id FK, producto_id FK, fecha_hora DATETIME, tipo_operacion ENUM(compra,transf_salida,transf_entrada,retiro_cajero,deposito_oxxo,deposito_farmacia,pago_servicio,pago_credito,abono_inversion,retiro_inversion,cargo_recurrente,cashback,devolucion), canal, monto DECIMAL, comercio_id FK, ciudad_transaccion, estatus ENUM(completada,no_procesada,en_disputa,revertida))

comercios(comercio_id PK, nombre, categoria_mcc ENUM(supermercado,restaurante,delivery,entretenimiento,transporte,servicios_digitales,salud,educacion,ropa_accesorios,tecnologia,viajes,gobierno,hogar,transferencia,retiro_cajero))

REGLAS DURAS:
- SOLO un statement SELECT o WITH...SELECT. No DML, no DDL.
- SIEMPRE filtra por user_id = ? (parámetro). Es el primer y único parámetro.
- LIMIT 1000 máximo (yo lo enforzo si lo omites).
- Para "gasto consumo" usa: t.tipo_operacion IN ('compra','pago_servicio','cargo_recurrente') AND t.estatus='completada'.
- Para "ingresos": tipo_operacion IN ('transf_entrada','deposito_oxxo','deposito_farmacia','retiro_inversion','cashback','devolucion').
- Datos llegan hasta 2025-12-15. Usa (SELECT MAX(fecha_hora) FROM transacciones) como anchor de "hoy".
- Categorías de gasto vienen de comercios JOIN por comercio_id. NO uses descripcion_libre.
- Nombres de columnas en el resultado: usa nombres claros en español (ej. "mes", "categoria", "total"). Esos son los keys que el frontend graficará.

OUTPUT: Responde SOLO con un objeto JSON dentro de un bloque \`\`\`json ... \`\`\`. Sin texto antes o después. Schema:

{
  "sql": "SELECT ...",
  "chartType": "bar" | "line" | "pie",
  "title": "Título corto y descriptivo",
  "xKey": "nombre_columna_eje_x",
  "yKey": "nombre_columna_eje_y"
}`;

const bedrock = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION ?? "us-east-1",
});

export type LlmReportPlan = {
  sql: string;
  chartType: ChartType;
  title: string;
  xKey: string;
  yKey: string;
};

export async function planReportFromDescription(
  description: string,
): Promise<LlmReportPlan> {
  const body = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 800,
    system: SCHEMA_PROMPT,
    messages: [
      {
        role: "user",
        content: `Genera un reporte para: "${description}"`,
      },
    ],
  };

  const cmd = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID!,
    contentType: "application/json",
    accept: "application/json",
    body: Buffer.from(JSON.stringify(body)),
  });
  const res = await bedrock.send(cmd);
  const decoded = JSON.parse(new TextDecoder().decode(res.body)) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = decoded.content?.find((c) => c.type === "text")?.text ?? "";

  const json = extractJson(text);
  if (!json) {
    throw new Error("LLM no devolvió JSON parseable");
  }

  // Mínima validación de shape
  if (
    typeof json.sql !== "string" ||
    typeof json.title !== "string" ||
    typeof json.xKey !== "string" ||
    typeof json.yKey !== "string"
  ) {
    throw new Error("LLM respondió JSON con shape incorrecta");
  }
  const chartType =
    typeof json.chartType === "string" && ["bar", "line", "pie"].includes(json.chartType)
      ? (json.chartType as ChartType)
      : "bar";
  return {
    sql: json.sql,
    chartType,
    title: json.title,
    xKey: json.xKey,
    yKey: json.yKey,
  };
}

function extractJson(text: string): Record<string, unknown> | null {
  // Busca el primer bloque ```json ... ```
  const blockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = blockMatch ? blockMatch[1] : text.trim();
  if (!candidate) return null;
  try {
    return JSON.parse(candidate);
  } catch {
    // Último intento: si el modelo respondió sin code fences pero JSON válido
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
