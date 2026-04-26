import "server-only";
import type { RowDataPacket } from "mysql2";
import { db } from "@/app/_lib/db.server";
import type { Persona } from "./personas";
import {
  rowToListItem,
  type PersonaListItem,
  type UserRow,
} from "./persona-mapper";
import { loadPersonaFinance } from "./persona-finance.server";

const SELECT_USER_LIST = "user_id, edad, genero, estado, ciudad, ocupacion";
const SELECT_USER_FULL = `${SELECT_USER_LIST}, ingreso_mensual_mxn`;

/** Página del directorio para el picker. */
export async function listPersonasPage(
  page: number,
  pageSize: number,
): Promise<PersonaListItem[]> {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.min(100, Math.floor(pageSize)));
  const offset = (safePage - 1) * safeSize;
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT ${SELECT_USER_LIST} FROM usuarios ORDER BY user_id LIMIT ? OFFSET ?`,
    [safeSize, offset],
  );
  return (rows as UserRow[]).map(rowToListItem);
}

/** Total de filas — para calcular cuántas páginas. */
export async function countPersonas(): Promise<number> {
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT COUNT(*) AS n FROM usuarios",
  );
  const n = rows[0]?.n;
  return typeof n === "number" ? n : Number(n ?? 0);
}

/**
 * Persona completa con datos financieros reales:
 * identidad desde `usuarios`, balance desde `productos`, gastos/categorías/
 * sparkline/transacciones desde `transacciones` (JOIN `comercios`), y alertas
 * derivadas de los mismos datos. El único campo derivado heurísticamente
 * son las alertas (reglas sobre métricas reales).
 */
export async function getFullPersona(userId: string): Promise<Persona | null> {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT ${SELECT_USER_FULL} FROM usuarios WHERE user_id = ? LIMIT 1`,
    [userId],
  );
  const row = (rows as (UserRow & { ingreso_mensual_mxn: number })[])[0];
  if (!row) return null;

  const identity = rowToListItem(row);
  const finance = await loadPersonaFinance(
    row.user_id,
    Number(row.ingreso_mensual_mxn),
  );

  return {
    id: identity.id,
    firstName: identity.firstName,
    fullName: identity.fullName,
    headline: identity.headline,
    avatarVar: identity.avatarVar,
    snapshot: finance.snapshot,
    comparativa: finance.comparativa,
    categories: finance.categories,
    transactions: finance.transactions,
    alerts: finance.alerts,
  };
}
