// Mock data for the conversational HAVI demo. All values are MXN, all transactions
// are fictitious but plausible. Replace with `fetch.ts` when real backend lands.

import type { AlertItem, Category, MonthCompare, Snapshot, Transaction } from "./types";

export const mockUserFirstName = "Fernando"; // Fallback only — Cognito `name` attr wins at runtime.

export const mockSnapshot: Snapshot = {
  balance: 12450.30,
  spentThisMonth: 3280.50,
  spentPct: 32,
  topCategoryId: "comida",
  sparkline: [40, 38, 42, 35, 50, 45, 60, 55, 48, 62, 58, 70, 65, 72],
};

export const mockCategories: Category[] = [
  { id: "comida", name: "Comida", spent: 1240.30, accentVar: "--color-hey-accent-magenta" },
  { id: "transporte", name: "Transporte", spent: 680.00, accentVar: "--color-hey-accent-cyan" },
  { id: "servicios", name: "Servicios", spent: 540.00, accentVar: "--color-hey-accent-amber" },
  { id: "entretenimiento", name: "Entretenimiento", spent: 380.20, accentVar: "--color-hey-accent-purple" },
  { id: "compras", name: "Compras", spent: 280.00, accentVar: "--color-hey-accent-sky" },
  { id: "salud", name: "Salud", spent: 120.00, accentVar: "--color-hey-accent-green" },
  { id: "otros", name: "Otros", spent: 40.00, accentVar: "--color-hey-fg-3" },
];

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const mockTransactions: Transaction[] = [
  { id: "t1", date: daysAgo(0), merchant: "Starbucks Reforma", amount: -78.00, category: "comida" },
  { id: "t2", date: daysAgo(0), merchant: "Uber", amount: -142.00, category: "transporte" },
  { id: "t3", date: daysAgo(1), merchant: "Rappi", amount: -245.50, category: "comida" },
  { id: "t4", date: daysAgo(1), merchant: "Cinépolis VIP", amount: -180.00, category: "entretenimiento" },
  { id: "t5", date: daysAgo(2), merchant: "Walmart Express", amount: -312.40, category: "compras" },
  { id: "t6", date: daysAgo(3), merchant: "CFE (luz)", amount: -540.00, category: "servicios" },
  { id: "t7", date: daysAgo(3), merchant: "Pago de nómina", amount: 18500.00, category: "otros" },
  { id: "t8", date: daysAgo(4), merchant: "Spotify Premium", amount: -119.00, category: "entretenimiento" },
  { id: "t9", date: daysAgo(5), merchant: "Farmacia Guadalajara", amount: -120.00, category: "salud" },
  { id: "t10", date: daysAgo(6), merchant: "Metrobús", amount: -36.00, category: "transporte" },
  { id: "t11", date: daysAgo(7), merchant: "Sushi Roll", amount: -420.30, category: "comida" },
  { id: "t12", date: daysAgo(9), merchant: "Liverpool", amount: -1280.00, category: "compras" },
  { id: "t13", date: daysAgo(11), merchant: "Mercado Local", amount: -185.00, category: "comida" },
  { id: "t14", date: daysAgo(14), merchant: "Uber Eats", amount: -195.00, category: "comida" },
  { id: "t15", date: daysAgo(18), merchant: "Gasolina Pemex", amount: -800.00, category: "transporte" },
];

export const mockComparativa: MonthCompare = {
  thisMonth: 3280.50,
  prevMonth: 2950.10,
  delta: 330.40,
  deltaPct: 11,
};

export const mockAlerts: Record<string, AlertItem> = {
  "tarjeta-vence": {
    id: "tarjeta-vence",
    level: "warning",
    title: "Tu tarjeta vence en 6 días",
    body: "Tu tarjeta de crédito hey vence el día 12. Págala antes para evitar intereses.",
    cta: "Pagar ahora",
    href: "/app/movimientos",
  },
  "meta-ahorro": {
    id: "meta-ahorro",
    level: "success",
    title: "¡Vas adelante en tu meta!",
    body: "Llevas 68% de tu meta mensual de ahorro. Sigue así y la cierras 4 días antes.",
    cta: "Ver mis metas",
  },
  "gasto-comida-alto": {
    id: "gasto-comida-alto",
    level: "info",
    title: "Tu gasto en Comida está 22% arriba",
    body: "Comparado con el mes pasado, llevas $1,240 vs $1,015. ¿Quieres crear una alerta?",
    cta: "Crear alerta",
  },
};
