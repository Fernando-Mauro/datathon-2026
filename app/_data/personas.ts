// Tipo de la Persona activa — todos los datos vienen de RDS.
// Identidad: `_data/persona-mapper.ts` (queries en `personas.server.ts`).
// Financieros: `_data/persona-finance.server.ts` (queries reales sobre
// productos + transacciones + comercios).

import type { AlertItem, Category, MonthCompare, Snapshot, Transaction } from "./types";

export type Persona = {
  id: string;
  firstName: string;
  fullName: string;
  headline: string;
  /** CSS color for avatar — uses an existing accent token. */
  avatarVar: string;
  snapshot: Snapshot;
  comparativa: MonthCompare;
  categories: Category[];
  transactions: Transaction[];
  alerts: Record<string, AlertItem>;
};
