import "server-only";
import type { RowDataPacket } from "mysql2";
import { db } from "@/app/_lib/db.server";
import type {
  AlertItem,
  AlertLevel,
  Category,
  CategoryId,
  MonthCompare,
  Snapshot,
  Transaction,
} from "./types";
import { CATEGORY_META, CATEGORY_ORDER, mccToCategory } from "./persona-categories";

// "Gasto consumo" — lo que la UI muestra como spentThisMonth y lo que va al sparkline.
// Excluye transferencias, retiros, pagos a crédito y abonos a inversión.
const SPENDING_TIPOS = ["compra", "pago_servicio", "cargo_recurrente"] as const;

const ASSET_PRODUCTOS = [
  "cuenta_debito",
  "cuenta_negocios",
  "inversion_hey",
] as const;

// Operaciones que en la UI se muestran con monto negativo.
const OUTFLOW_TIPOS: ReadonlySet<string> = new Set([
  "compra",
  "pago_servicio",
  "cargo_recurrente",
  "transf_salida",
  "retiro_cajero",
  "pago_credito",
  "abono_inversion",
]);

const PRETTY_TIPO: Record<string, string> = {
  transf_salida: "Transferencia enviada",
  transf_entrada: "Transferencia recibida",
  retiro_cajero: "Retiro en cajero",
  pago_credito: "Pago de crédito",
  abono_inversion: "Abono a inversión",
  retiro_inversion: "Retiro de inversión",
  deposito_oxxo: "Depósito OXXO",
  deposito_farmacia: "Depósito farmacia",
  cashback: "Cashback",
  devolucion: "Devolución",
  pago_servicio: "Pago de servicio",
  cargo_recurrente: "Cargo recurrente",
  compra: "Compra",
};

// El dataset llega hasta 2025-12-15. Usamos la fecha máxima como "hoy" del demo
// y la cacheamos a nivel módulo (la data no cambia).
let _dataNow: Date | null = null;
async function getDataNow(): Promise<Date> {
  if (_dataNow) return _dataNow;
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT MAX(fecha_hora) AS d FROM transacciones",
  );
  const raw = rows[0]?.d;
  _dataNow = raw instanceof Date ? raw : new Date(String(raw ?? "2025-12-15T23:59:59"));
  return _dataNow;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

export type FullPersonaFinance = {
  snapshot: Snapshot;
  comparativa: MonthCompare;
  categories: Category[];
  transactions: Transaction[];
  alerts: Record<string, AlertItem>;
};

export async function loadPersonaFinance(
  userId: string,
  ingresoMensual: number,
): Promise<FullPersonaFinance> {
  const dataNow = await getDataNow();
  const mStart = startOfMonth(dataNow);
  const mEnd = endOfMonth(dataNow);
  const pmStart = new Date(dataNow.getFullYear(), dataNow.getMonth() - 1, 1);
  const pmEnd = endOfMonth(pmStart);
  const sparkStart = new Date(dataNow);
  sparkStart.setDate(sparkStart.getDate() - 13);
  sparkStart.setHours(0, 0, 0, 0);

  const [balance, monthly, categoriesRaw, txns, sparkRows, creditUtil] =
    await Promise.all([
      queryBalance(userId),
      queryMonthSpend(userId, mStart, mEnd, pmStart, pmEnd),
      queryCategoriesThisMonth(userId, mStart, mEnd),
      queryRecentTransactions(userId, 10),
      querySparkline(userId, sparkStart, dataNow),
      queryCreditUtilization(userId),
    ]);

  const categories = buildCategories(categoriesRaw);
  const topCat: CategoryId = categories[0]?.spent ? categories[0].id : "otros";
  const sparkline = buildSparkline(sparkRows, sparkStart, 14);

  const snapshot: Snapshot = {
    balance,
    spentThisMonth: monthly.thisMonth,
    spentPct:
      balance > 0
        ? Math.min(100, Math.round((monthly.thisMonth / balance) * 100))
        : 0,
    topCategoryId: topCat,
    sparkline,
  };

  const delta = monthly.thisMonth - monthly.prevMonth;
  const deltaPct =
    monthly.prevMonth > 0 ? Math.round((delta / monthly.prevMonth) * 100) : 0;

  const comparativa: MonthCompare = {
    thisMonth: monthly.thisMonth,
    prevMonth: monthly.prevMonth,
    delta,
    deltaPct,
  };

  const alerts = buildAlerts({
    balance,
    ingresoMensual,
    spentThisMonth: monthly.thisMonth,
    prevMonthSpent: monthly.prevMonth,
    deltaPct,
    topCat,
    topSpent: categories[0]?.spent ?? 0,
    creditUtil,
  });

  return { snapshot, comparativa, categories, transactions: txns, alerts };
}

// ─── Queries ─────────────────────────────────────────────────────────────

async function queryBalance(userId: string): Promise<number> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT COALESCE(SUM(saldo_actual), 0) AS balance
     FROM productos
     WHERE user_id = ?
       AND estatus = 'activo'
       AND tipo_producto IN (?, ?, ?)`,
    [userId, ...ASSET_PRODUCTOS],
  );
  return Number(rows[0]?.balance ?? 0);
}

async function queryMonthSpend(
  userId: string,
  mStart: Date,
  mEnd: Date,
  pmStart: Date,
  pmEnd: Date,
): Promise<{ thisMonth: number; prevMonth: number }> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT
        COALESCE(SUM(CASE WHEN fecha_hora >= ? AND fecha_hora <= ? THEN monto END), 0) AS this_m,
        COALESCE(SUM(CASE WHEN fecha_hora >= ? AND fecha_hora <= ? THEN monto END), 0) AS prev_m
      FROM transacciones
      WHERE user_id = ?
        AND tipo_operacion IN (?, ?, ?)
        AND estatus = 'completada'`,
    [mStart, mEnd, pmStart, pmEnd, userId, ...SPENDING_TIPOS],
  );
  return {
    thisMonth: Number(rows[0]?.this_m ?? 0),
    prevMonth: Number(rows[0]?.prev_m ?? 0),
  };
}

type CategoryRaw = { mcc: string; spent: number };
async function queryCategoriesThisMonth(
  userId: string,
  mStart: Date,
  mEnd: Date,
): Promise<CategoryRaw[]> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT c.categoria_mcc AS mcc, COALESCE(SUM(t.monto), 0) AS spent
       FROM transacciones t
       JOIN comercios c ON c.comercio_id = t.comercio_id
      WHERE t.user_id = ?
        AND t.tipo_operacion IN (?, ?, ?)
        AND t.estatus = 'completada'
        AND t.fecha_hora >= ? AND t.fecha_hora <= ?
      GROUP BY c.categoria_mcc`,
    [userId, ...SPENDING_TIPOS, mStart, mEnd],
  );
  return rows.map((r) => ({ mcc: String(r.mcc), spent: Number(r.spent) }));
}

export async function queryRecentTransactions(
  userId: string,
  limit: number,
): Promise<Transaction[]> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT t.transaccion_id, t.fecha_hora, t.tipo_operacion, t.monto,
            c.nombre AS comercio_nombre, c.categoria_mcc
       FROM transacciones t
       LEFT JOIN comercios c ON c.comercio_id = t.comercio_id
      WHERE t.user_id = ?
        AND t.estatus = 'completada'
      ORDER BY t.fecha_hora DESC
      LIMIT ?`,
    [userId, limit],
  );
  return rows.map((r) => {
    const tipo = String(r.tipo_operacion);
    const sign = OUTFLOW_TIPOS.has(tipo) ? -1 : 1;
    const merchant =
      (r.comercio_nombre ? String(r.comercio_nombre) : null) ??
      PRETTY_TIPO[tipo] ??
      tipo;
    const fecha =
      r.fecha_hora instanceof Date ? r.fecha_hora : new Date(String(r.fecha_hora));
    return {
      id: String(r.transaccion_id),
      date: fecha.toISOString(),
      merchant,
      amount: sign * Number(r.monto),
      category: mccToCategory(r.categoria_mcc as string | null),
    };
  });
}

async function querySparkline(
  userId: string,
  start: Date,
  end: Date,
): Promise<{ d: string; total: number }[]> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT DATE(fecha_hora) AS d, COALESCE(SUM(monto), 0) AS total
       FROM transacciones
      WHERE user_id = ?
        AND tipo_operacion IN (?, ?, ?)
        AND estatus = 'completada'
        AND fecha_hora >= ? AND fecha_hora <= ?
      GROUP BY DATE(fecha_hora)
      ORDER BY d ASC`,
    [userId, ...SPENDING_TIPOS, start, end],
  );
  return rows.map((r) => {
    const raw = r.d instanceof Date ? r.d.toISOString().slice(0, 10) : String(r.d);
    return { d: raw.slice(0, 10), total: Number(r.total) };
  });
}

async function queryCreditUtilization(
  userId: string,
): Promise<number | null> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT MAX(utilizacion_pct) AS max_util
       FROM productos
      WHERE user_id = ?
        AND estatus = 'activo'
        AND tipo_producto LIKE 'tarjeta_credito%'`,
    [userId],
  );
  const raw = rows[0]?.max_util;
  return raw == null ? null : Number(raw);
}

// ─── Builders ────────────────────────────────────────────────────────────

function buildCategories(raw: CategoryRaw[]): Category[] {
  const totals: Record<CategoryId, number> = {
    comida: 0,
    transporte: 0,
    compras: 0,
    entretenimiento: 0,
    servicios: 0,
    salud: 0,
    otros: 0,
  };
  for (const r of raw) {
    totals[mccToCategory(r.mcc)] += r.spent;
  }
  return CATEGORY_ORDER.map((id) => ({
    id,
    name: CATEGORY_META[id].name,
    spent: Math.round(totals[id] * 100) / 100,
    accentVar: CATEGORY_META[id].accentVar,
  })).sort((a, b) => b.spent - a.spent);
}

function buildSparkline(
  rows: { d: string; total: number }[],
  start: Date,
  days: number,
): number[] {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.d, r.total);
  const out: number[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < days; i++) {
    const key = cursor.toISOString().slice(0, 10);
    out.push(Math.round((map.get(key) ?? 0) * 100) / 100);
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

// ─── Alertas (rule-based sobre datos reales) ─────────────────────────────

function formatMXN(n: number): string {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function buildAlerts(input: {
  balance: number;
  ingresoMensual: number;
  spentThisMonth: number;
  prevMonthSpent: number;
  deltaPct: number;
  topCat: CategoryId;
  topSpent: number;
  creditUtil: number | null;
}): Record<string, AlertItem> {
  const alerts: Record<string, AlertItem> = {};

  // 1. Comparación con mes pasado (sólo si hay base + cambio relevante)
  if (input.prevMonthSpent > 0 && Math.abs(input.deltaPct) >= 10) {
    const arriba = input.deltaPct > 0;
    const level: AlertLevel = arriba ? "warning" : "success";
    alerts["gasto-vs-mes"] = {
      id: "gasto-vs-mes",
      level,
      title: `Tu gasto este mes está ${Math.abs(input.deltaPct)}% ${arriba ? "arriba" : "abajo"} del mes pasado`,
      body: `Llevas ${formatMXN(input.spentThisMonth)} este mes vs ${formatMXN(input.prevMonthSpent)} del anterior.`,
      cta: "Ver gráfica",
      href: "/app/grafica/general",
    };
  }

  // 2. Top categoría — sólo si hubo gasto este mes
  if (input.topSpent > 0) {
    const meta = CATEGORY_META[input.topCat];
    alerts["top-categoria"] = {
      id: "top-categoria",
      level: "info",
      title: `Tu top categoría este mes es ${meta.name}`,
      body: `Llevas ${formatMXN(input.topSpent)} en ${meta.name.toLowerCase()}.`,
      cta: "Ver detalle",
      href: `/app/grafica/${input.topCat}`,
    };
  }

  // 3. Utilización alta de tarjeta de crédito
  if (input.creditUtil !== null && input.creditUtil >= 0.7) {
    const pct = Math.round(input.creditUtil * 100);
    alerts["credito-uso"] = {
      id: "credito-uso",
      level: "warning",
      title: `Tu tarjeta de crédito está al ${pct}% de uso`,
      body: "Considera abonarle para liberar línea y evitar intereses.",
      cta: "Pagar ahora",
      href: "/app/movimientos",
    };
  }

  // 4. Salud del saldo — fallback si quedó espacio
  if (
    Object.keys(alerts).length < 3 &&
    input.balance > 0 &&
    input.ingresoMensual > 0
  ) {
    const ratio = input.balance / input.ingresoMensual;
    if (ratio < 1) {
      alerts["saldo-bajo"] = {
        id: "saldo-bajo",
        level: "warning",
        title: "Tu saldo está por debajo de un mes de ingreso",
        body: `Tienes ${formatMXN(input.balance)} disponible vs ${formatMXN(input.ingresoMensual)} de ingreso mensual.`,
      };
    } else if (ratio >= 3) {
      alerts["saldo-saludable"] = {
        id: "saldo-saludable",
        level: "success",
        title: "Tu saldo equivale a 3+ meses de ingreso",
        body: `Tienes ${formatMXN(input.balance)} disponibles. Considera mover una parte a inversión.`,
        cta: "Ver opciones",
        href: "/app/agente",
      };
    }
  }

  return alerts;
}
