"use server";

import type { RowDataPacket } from "mysql2";
import { db } from "@/app/_lib/db.server";
import { mccToCategory } from "@/app/_data/persona-categories";
import type { Transaction } from "@/app/_data/types";

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

export type TransactionsPage = {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getTransactionsPageAction(
  personaUserId: string,
  page = 1,
  pageSize = 25,
): Promise<TransactionsPage> {
  if (typeof personaUserId !== "string" || !/^USR-\d+$/.test(personaUserId)) {
    throw new Error("personaUserId inválido");
  }
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.min(100, Math.floor(pageSize)));
  const offset = (safePage - 1) * safeSize;

  const [countRows, rowsRes] = await Promise.all([
    db().query<RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM transacciones WHERE user_id = ? AND estatus = 'completada'",
      [personaUserId],
    ),
    db().query<RowDataPacket[]>(
      `SELECT t.transaccion_id, t.fecha_hora, t.tipo_operacion, t.monto,
              c.nombre AS comercio_nombre, c.categoria_mcc
         FROM transacciones t
         LEFT JOIN comercios c ON c.comercio_id = t.comercio_id
        WHERE t.user_id = ?
          AND t.estatus = 'completada'
        ORDER BY t.fecha_hora DESC
        LIMIT ? OFFSET ?`,
      [personaUserId, safeSize, offset],
    ),
  ]);

  const total = Number((countRows[0] as Array<{ n: number | string }>)[0]?.n ?? 0);
  const rows = rowsRes[0] as RowDataPacket[];

  const items: Transaction[] = rows.map((r) => {
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

  return { items, total, page: safePage, pageSize: safeSize };
}
