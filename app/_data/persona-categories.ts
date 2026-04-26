// Mapeo de las categorías MCC del schema (comercios.categoria_mcc) a los
// CategoryId que usa la UI. Compartido entre cliente y servidor.

import type { CategoryId } from "./types";

type Mcc =
  | "supermercado"
  | "restaurante"
  | "delivery"
  | "entretenimiento"
  | "transporte"
  | "servicios_digitales"
  | "salud"
  | "educacion"
  | "ropa_accesorios"
  | "tecnologia"
  | "viajes"
  | "gobierno"
  | "hogar"
  | "transferencia"
  | "retiro_cajero";

const MCC_TO_CATEGORY: Record<Mcc, CategoryId> = {
  supermercado: "comida",
  restaurante: "comida",
  delivery: "comida",
  entretenimiento: "entretenimiento",
  viajes: "entretenimiento",
  transporte: "transporte",
  servicios_digitales: "servicios",
  educacion: "servicios",
  gobierno: "servicios",
  hogar: "servicios",
  salud: "salud",
  ropa_accesorios: "compras",
  tecnologia: "compras",
  transferencia: "otros",
  retiro_cajero: "otros",
};

export function mccToCategory(mcc: string | null | undefined): CategoryId {
  if (!mcc) return "otros";
  return MCC_TO_CATEGORY[mcc as Mcc] ?? "otros";
}

export const CATEGORY_META: Record<CategoryId, { name: string; accentVar: string }> = {
  comida: { name: "Comida", accentVar: "--color-hey-accent-magenta" },
  transporte: { name: "Transporte", accentVar: "--color-hey-accent-cyan" },
  compras: { name: "Compras", accentVar: "--color-hey-accent-sky" },
  entretenimiento: { name: "Entretenimiento", accentVar: "--color-hey-accent-purple" },
  servicios: { name: "Servicios", accentVar: "--color-hey-accent-amber" },
  salud: { name: "Salud", accentVar: "--color-hey-accent-green" },
  otros: { name: "Otros", accentVar: "--color-hey-fg-3" },
};

export const CATEGORY_ORDER: CategoryId[] = [
  "comida",
  "transporte",
  "compras",
  "entretenimiento",
  "servicios",
  "salud",
  "otros",
];
