// ETL: avisos_output.json → tabla `notifications`.
//
// Cada user puede generar hasta 5 notifs (uno por aspect no vacío del JSON).
// Anclamos `fecha_referencia` (2025-12-15) al ETL run time y comprimimos
// días reales a SECONDS_PER_DAY segundos demo, así algunas notifs caen en
// el pasado (visibles inmediatamente con "Habla con HAVI") y otras en el
// futuro cercano (dispararán como toast durante el demo).
//
// Run: bun scripts/load-notifications.ts
//   env: DB_HOST, DB_PORT, DB_USER (root), DB_PASSWORD, DB_NAME, DB_SSL
//   o usa los defaults inline (mismos que .env.local).

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import mysql from "mysql2/promise";

// ─── Config ─────────────────────────────────────────────────────────────

const DB = {
  host: process.env.DB_HOST ?? "datathon.cmz4qmgga8b8.us-east-1.rds.amazonaws.com",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "claudemalo2026",
  database: process.env.DB_NAME ?? "datathon",
  ssl: (process.env.DB_SSL ?? "1") === "1" ? { rejectUnauthorized: false } : undefined,
  // Server is in UTC; force the driver to send Date objects as UTC strings
  // instead of converting them to the client's local timezone.
  timezone: "Z",
};

const SOURCE = path.resolve(import.meta.dirname ?? __dirname, "../avisos_output.json");

// 1 día real → 20 segundos demo. Con fecha_referencia = 2025-12-15 anclada a
// ahora, una notif de cashflow proyectada a +30 días llega en ~10 min.
const SECONDS_PER_DAY = 20;

// fecha_referencia consistente en todo el dataset (verificado).
const FECHA_REFERENCIA = new Date("2025-12-15T12:00:00Z");
const ANCHOR = new Date(); // ahora.

const BATCH_SIZE = 500;

// ─── Tipos del JSON ─────────────────────────────────────────────────────

type SubidaSusc = {
  comercio: string;
  monto_anterior: number;
  monto_actual: number;
  incremento_mxn: number;
  incremento_pct: number;
  mes_anterior: string;
  mes_actual: string;
};

type Recurrencia = {
  comercio: string;
  categoria_mcc: string;
  n_veces: number;
  monto_promedio: number;
  dia_tipico: string;
  hora_tipica: number;
  ultima_fecha: string;
};

type Cashflow = {
  ingreso_mensual_mxn: number;
  ingresos_esperados_30d: number;
  gastos_esperados_30d: number;
  flujo_neto_30d: number;
  en_riesgo: boolean;
  dia_proyectado_negativo: string | null;
};

type Anomalia = {
  categoria_mcc: string;
  monto_actual: number;
  promedio_personal: number;
  desviacion_estandar: number;
  umbral_alerta: number;
  desviacion_pct: number;
};

type Regano = {
  categoria_mcc: string;
  mensaje: string;
  monto_actual: number;
  promedio_personal: number;
};

type Aviso = {
  user_id: string;
  fecha_referencia: string;
  recurrencias: Recurrencia[];
  suscripciones_subieron: SubidaSusc[];
  cashflow_30d: Cashflow;
  anomalias: Anomalia[];
  reporte_mes: { mes: string; ranking: unknown[]; regano: Regano | null };
};

type Kind =
  | "cashflow_risk"
  | "suscripcion_subio"
  | "regano"
  | "recurrencia"
  | "anomalia";

type Row = {
  id: string;
  user_id: string;
  kind: Kind;
  title: string;
  body: string;
  havi_prompt: string;
  havi_context: string;
  scheduled_at: Date;
};

// ─── Helpers ────────────────────────────────────────────────────────────

function makeId(): string {
  // 26 chars: 8 hex (timestamp) + 18 hex random.
  const ts = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0");
  const rand = crypto.randomBytes(9).toString("hex"); // 18 chars
  return (ts + rand).slice(0, 26);
}

function shiftToDemo(date: Date): Date {
  const diffDays =
    (date.getTime() - FECHA_REFERENCIA.getTime()) / (1000 * 60 * 60 * 24);
  return new Date(ANCHOR.getTime() + diffDays * SECONDS_PER_DAY * 1000);
}

function fmtMXN(n: number): string {
  return n.toLocaleString("es-MX", { maximumFractionDigits: 0 });
}

function lastDayOfMonth(yyyymm: string): Date {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0, 18, 0, 0)); // day 0 = last of prev month → m here is 1-based
}

function firstDayOfMonth(yyyymm: string): Date {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 9, 0, 0));
}

const MX_DAY: Record<string, string> = {
  Monday: "lunes",
  Tuesday: "martes",
  Wednesday: "miércoles",
  Thursday: "jueves",
  Friday: "viernes",
  Saturday: "sábado",
  Sunday: "domingo",
};

// ─── Generadores por kind ───────────────────────────────────────────────

function buildCashflow(a: Aviso): Row | null {
  if (!a.cashflow_30d.en_riesgo || !a.cashflow_30d.dia_proyectado_negativo) return null;
  const dia = a.cashflow_30d.dia_proyectado_negativo;
  // Disparo: 7 días reales antes del proyectado_negativo.
  const fireReal = new Date(`${dia}T09:00:00Z`);
  fireReal.setUTCDate(fireReal.getUTCDate() - 7);
  const flujo = a.cashflow_30d.flujo_neto_30d;
  return {
    id: makeId(),
    user_id: a.user_id,
    kind: "cashflow_risk",
    title: `Tu flujo va negativo: alcanzas el rojo el ${dia}`,
    body: `Al ritmo actual, en 30 días cierras con un flujo de $${fmtMXN(flujo)}. Día proyectado en negativo: ${dia}. Plantéalo con HAVI antes de que pase.`,
    havi_prompt: `Mi flujo de 30 días va en $${fmtMXN(flujo)} y proyectas que entro en negativo el ${dia}. ¿Qué me recomiendas hacer antes?`,
    havi_context: JSON.stringify({
      kind: "cashflow_risk",
      ingreso_mensual_mxn: a.cashflow_30d.ingreso_mensual_mxn,
      ingresos_esperados_30d: a.cashflow_30d.ingresos_esperados_30d,
      gastos_esperados_30d: a.cashflow_30d.gastos_esperados_30d,
      flujo_neto_30d: flujo,
      dia_proyectado_negativo: dia,
    }),
    scheduled_at: shiftToDemo(fireReal),
  };
}

function buildRegano(a: Aviso): Row | null {
  const r = a.reporte_mes.regano;
  if (!r) return null;
  // Regaño se dispara al cierre del mes del reporte.
  const fireReal = lastDayOfMonth(a.reporte_mes.mes);
  return {
    id: makeId(),
    user_id: a.user_id,
    kind: "regano",
    title: `Tu gasto en ${r.categoria_mcc} subió fuerte este mes`,
    body: `${r.mensaje} (gasto del mes: $${fmtMXN(r.monto_actual)}, tu promedio: $${fmtMXN(r.promedio_personal)}).`,
    havi_prompt: `Gasté $${fmtMXN(r.monto_actual)} en ${r.categoria_mcc}, contra mi promedio de $${fmtMXN(r.promedio_personal)}. Ayúdame a entender dónde recortar.`,
    havi_context: JSON.stringify({ kind: "regano", mes: a.reporte_mes.mes, ...r }),
    scheduled_at: shiftToDemo(fireReal),
  };
}

function buildSuscripcion(a: Aviso): Row | null {
  if (a.suscripciones_subieron.length === 0) return null;
  const s = a.suscripciones_subieron[0]; // primera; el resto se menciona si quieres en body
  const fireReal = firstDayOfMonth(s.mes_actual);
  const extra =
    a.suscripciones_subieron.length > 1
      ? ` (+${a.suscripciones_subieron.length - 1} suscripciones más subieron este periodo).`
      : "";
  return {
    id: makeId(),
    user_id: a.user_id,
    kind: "suscripcion_subio",
    title: `${s.comercio} subió de $${fmtMXN(s.monto_anterior)} a $${fmtMXN(s.monto_actual)}`,
    body: `Tu suscripción de ${s.comercio} aumentó ${s.incremento_pct.toFixed(1)}% en ${s.mes_actual} (era $${fmtMXN(s.monto_anterior)}, ahora $${fmtMXN(s.monto_actual)}).${extra}`,
    havi_prompt: `Mi suscripción de ${s.comercio} subió de $${fmtMXN(s.monto_anterior)} a $${fmtMXN(s.monto_actual)}. ¿Vale la pena seguir pagándola?`,
    havi_context: JSON.stringify({
      kind: "suscripcion_subio",
      principal: s,
      otras: a.suscripciones_subieron.slice(1),
    }),
    scheduled_at: shiftToDemo(fireReal),
  };
}

function buildRecurrencia(a: Aviso): Row | null {
  if (a.recurrencias.length === 0) return null;
  const r = a.recurrencias[0];
  // Próxima ocurrencia ~ ultima_fecha + 30 días (mensual aproximado).
  const ultima = new Date(r.ultima_fecha);
  const fireReal = new Date(ultima.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dia = MX_DAY[r.dia_tipico] ?? r.dia_tipico.toLowerCase();
  const extra =
    a.recurrencias.length > 1
      ? ` (+${a.recurrencias.length - 1} cargos recurrentes más detectados).`
      : "";
  return {
    id: makeId(),
    user_id: a.user_id,
    kind: "recurrencia",
    title: `Cargo recurrente detectado: ${r.comercio}`,
    body: `Cargo de ~$${fmtMXN(r.monto_promedio)} cada ${dia} en ${r.comercio} (categoría ${r.categoria_mcc}). Detectado ${r.n_veces} veces.${extra}`,
    havi_prompt: `Detectaste un cargo recurrente en ${r.comercio} de ~$${fmtMXN(r.monto_promedio)} cada ${dia}. Quiero entender cuánto me cuesta al año y si me conviene mantenerlo.`,
    havi_context: JSON.stringify({
      kind: "recurrencia",
      principal: r,
      otras: a.recurrencias.slice(1),
    }),
    scheduled_at: shiftToDemo(fireReal),
  };
}

function buildAnomalia(a: Aviso): Row | null {
  if (a.anomalias.length === 0) return null;
  const an = a.anomalias[0];
  // Anomalías se "detectan" cerca de fecha_referencia (datos recientes);
  // jitter ±0.3 días reales (~6s demo) para que no choquen exactas.
  const jitterDays = (Math.random() - 0.5) * 0.6;
  const fireReal = new Date(
    FECHA_REFERENCIA.getTime() + jitterDays * 24 * 60 * 60 * 1000,
  );
  return {
    id: makeId(),
    user_id: a.user_id,
    kind: "anomalia",
    title: `Gasto anómalo en ${an.categoria_mcc}`,
    body: `Detectamos un cargo de $${fmtMXN(an.monto_actual)} en ${an.categoria_mcc}, ${an.desviacion_pct.toFixed(0)}% sobre tu promedio de $${fmtMXN(an.promedio_personal)}.`,
    havi_prompt: `Tuve un gasto de $${fmtMXN(an.monto_actual)} en ${an.categoria_mcc}, fuera de mi promedio ($${fmtMXN(an.promedio_personal)}). ¿Qué pudo causarlo y cómo lo controlo?`,
    havi_context: JSON.stringify({ kind: "anomalia", principal: an, todas: a.anomalias }),
    scheduled_at: shiftToDemo(fireReal),
  };
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`[etl] reading ${SOURCE}`);
  const raw = fs.readFileSync(SOURCE, "utf-8");
  const data: Aviso[] = JSON.parse(raw);
  console.log(`[etl] ${data.length} users in source`);

  const rows: Row[] = [];
  for (const a of data) {
    const candidates: (Row | null)[] = [
      buildCashflow(a),
      buildRegano(a),
      buildSuscripcion(a),
      buildRecurrencia(a),
      buildAnomalia(a),
    ];
    for (const r of candidates) if (r) rows.push(r);
  }
  console.log(`[etl] generated ${rows.length} notifications`);

  // Distribución para sanity check.
  const byKind = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.kind] = (acc[r.kind] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`[etl] by kind:`, byKind);
  const past = rows.filter((r) => r.scheduled_at.getTime() <= ANCHOR.getTime()).length;
  console.log(`[etl] past=${past} future=${rows.length - past} (anchor=${ANCHOR.toISOString()})`);

  const conn = await mysql.createConnection(DB);
  try {
    console.log(`[etl] truncating notifications…`);
    await conn.query("DELETE FROM notifications");

    console.log(`[etl] inserting in batches of ${BATCH_SIZE}…`);
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const values = chunk.map((r) => [
        r.id,
        r.user_id,
        r.kind,
        r.title,
        r.body,
        r.havi_prompt,
        r.havi_context,
        r.scheduled_at,
      ]);
      await conn.query(
        `INSERT INTO notifications
           (id, user_id, kind, title, body, havi_prompt, havi_context, scheduled_at)
         VALUES ?`,
        [values],
      );
      process.stdout.write(`\r[etl] inserted ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
    }
    console.log(`\n[etl] done`);

    const [check] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT kind, COUNT(*) AS n FROM notifications GROUP BY kind`,
    );
    console.log(`[etl] verify:`, check);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
