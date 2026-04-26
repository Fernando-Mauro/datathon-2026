// Personas — admin signs in once (root) then impersonates one of these
// to see how HaviCA adapts. Each persona has its own complete mock dataset.

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

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// ─── Mariana — Emprendedora joven ────────────────────────────────────────
const mariana: Persona = {
  id: "mariana",
  firstName: "Mariana",
  fullName: "Mariana Rivera",
  headline: "Emprendedora · 28 años · CDMX",
  avatarVar: "--color-hey-accent-magenta",
  snapshot: {
    balance: 25420.00,
    spentThisMonth: 5840.20,
    spentPct: 22,
    topCategoryId: "comida",
    sparkline: [55, 62, 58, 70, 68, 75, 80, 72, 78, 82, 88, 85, 92, 88],
  },
  comparativa: { thisMonth: 5840.20, prevMonth: 4920.00, delta: 920.20, deltaPct: 19 },
  categories: [
    { id: "comida", name: "Comida", spent: 1820.50, accentVar: "--color-hey-accent-magenta" },
    { id: "transporte", name: "Transporte", spent: 1240.00, accentVar: "--color-hey-accent-cyan" },
    { id: "compras", name: "Compras", spent: 980.00, accentVar: "--color-hey-accent-sky" },
    { id: "entretenimiento", name: "Entretenimiento", spent: 720.50, accentVar: "--color-hey-accent-purple" },
    { id: "servicios", name: "Servicios", spent: 540.00, accentVar: "--color-hey-accent-amber" },
    { id: "salud", name: "Salud", spent: 380.20, accentVar: "--color-hey-accent-green" },
    { id: "otros", name: "Otros", spent: 159.00, accentVar: "--color-hey-fg-3" },
  ],
  transactions: [
    { id: "m-t1", date: daysAgo(0), merchant: "WeWork Reforma", amount: -3800.00, category: "servicios" },
    { id: "m-t2", date: daysAgo(0), merchant: "Café El Jarocho", amount: -89.00, category: "comida" },
    { id: "m-t3", date: daysAgo(1), merchant: "Cliente — pago factura", amount: 45000.00, category: "otros" },
    { id: "m-t4", date: daysAgo(2), merchant: "Sushi Roll", amount: -420.30, category: "comida" },
    { id: "m-t5", date: daysAgo(3), merchant: "Uber", amount: -180.00, category: "transporte" },
    { id: "m-t6", date: daysAgo(4), merchant: "Zara", amount: -890.00, category: "compras" },
    { id: "m-t7", date: daysAgo(5), merchant: "Netflix", amount: -219.00, category: "entretenimiento" },
    { id: "m-t8", date: daysAgo(7), merchant: "Total Fitness", amount: -650.00, category: "salud" },
    { id: "m-t9", date: daysAgo(9), merchant: "Costco", amount: -2400.00, category: "compras" },
    { id: "m-t10", date: daysAgo(12), merchant: "Spa Polanco", amount: -1200.00, category: "salud" },
  ],
  alerts: {
    "tarjeta-vence": {
      id: "tarjeta-vence",
      level: "warning",
      title: "Tu tarjeta de crédito vence en 6 días",
      body: "Llevas $5,840 gastados este mes. Págala antes del día 12 para evitar intereses.",
      cta: "Pagar ahora",
      href: "/app/movimientos",
    },
    "meta-ahorro": {
      id: "meta-ahorro",
      level: "success",
      title: "¡Vas adelante en tu meta de inversión!",
      body: "Has destinado 32% de tus ingresos al ahorro este mes. Sigue así.",
      cta: "Ver mis metas",
    },
    "gasto-comida-alto": {
      id: "gasto-comida-alto",
      level: "info",
      title: "Tu gasto en Comida está 18% arriba del mes pasado",
      body: "Llevas $1,820 vs $1,540 del mes pasado.",
      cta: "Crear alerta",
    },
  },
};

// ─── Carlos — Pensionado ────────────────────────────────────────────────
const carlos: Persona = {
  id: "carlos",
  firstName: "Carlos",
  fullName: "Carlos Mendoza",
  headline: "Pensionado · 64 años · Guadalajara",
  avatarVar: "--color-hey-accent-amber",
  snapshot: {
    balance: 82350.45,
    spentThisMonth: 9420.00,
    spentPct: 11,
    topCategoryId: "salud",
    sparkline: [30, 35, 40, 38, 42, 45, 50, 48, 55, 60, 65, 62, 68, 70],
  },
  comparativa: { thisMonth: 9420.00, prevMonth: 9680.00, delta: -260.00, deltaPct: -3 },
  categories: [
    { id: "salud", name: "Salud", spent: 3200.00, accentVar: "--color-hey-accent-green" },
    { id: "servicios", name: "Servicios", spent: 2840.00, accentVar: "--color-hey-accent-amber" },
    { id: "comida", name: "Comida", spent: 1980.00, accentVar: "--color-hey-accent-magenta" },
    { id: "transporte", name: "Transporte", spent: 720.00, accentVar: "--color-hey-accent-cyan" },
    { id: "entretenimiento", name: "Entretenimiento", spent: 380.00, accentVar: "--color-hey-accent-purple" },
    { id: "compras", name: "Compras", spent: 240.00, accentVar: "--color-hey-accent-sky" },
    { id: "otros", name: "Otros", spent: 60.00, accentVar: "--color-hey-fg-3" },
  ],
  transactions: [
    { id: "c-t1", date: daysAgo(0), merchant: "Farmacia San Pablo", amount: -480.00, category: "salud" },
    { id: "c-t2", date: daysAgo(0), merchant: "ISSSTE — consulta", amount: -350.00, category: "salud" },
    { id: "c-t3", date: daysAgo(2), merchant: "Pensión IMSS", amount: 18500.00, category: "otros" },
    { id: "c-t4", date: daysAgo(3), merchant: "CFE (luz)", amount: -890.00, category: "servicios" },
    { id: "c-t5", date: daysAgo(4), merchant: "Telmex", amount: -520.00, category: "servicios" },
    { id: "c-t6", date: daysAgo(5), merchant: "Mercado de Abastos", amount: -380.00, category: "comida" },
    { id: "c-t7", date: daysAgo(8), merchant: "Gas natural", amount: -640.00, category: "servicios" },
    { id: "c-t8", date: daysAgo(10), merchant: "Cardiólogo Dr. Pérez", amount: -1800.00, category: "salud" },
    { id: "c-t9", date: daysAgo(14), merchant: "Cinépolis", amount: -180.00, category: "entretenimiento" },
  ],
  alerts: {
    "salud-recordatorio": {
      id: "salud-recordatorio",
      level: "info",
      title: "Tu próxima consulta está en 5 días",
      body: "Cardiólogo Dr. Pérez — viernes a las 10:30 AM. Apártalo de tu calendario.",
      cta: "Ver detalles",
    },
    "ahorro-establecido": {
      id: "ahorro-establecido",
      level: "success",
      title: "Llevas $82,350 ahorrados",
      body: "Tu balance ha crecido 4% este trimestre. Considera mover una parte a inversión a plazo.",
      cta: "Hablar con asesor",
      href: "/app/agente",
    },
    "servicios-altos": {
      id: "servicios-altos",
      level: "warning",
      title: "CFE consumió 18% más de luz",
      body: "Este mes pagaste $890 vs $750 promedio. Revisa si algo quedó encendido.",
      cta: "Ver detalle",
    },
  },
};

// ─── Sofía — Estudiante universitaria ────────────────────────────────────
const sofia: Persona = {
  id: "sofia",
  firstName: "Sofía",
  fullName: "Sofía López",
  headline: "Estudiante · 21 años · Monterrey",
  avatarVar: "--color-hey-accent-purple",
  snapshot: {
    balance: 3240.50,
    spentThisMonth: 2180.00,
    spentPct: 67,
    topCategoryId: "comida",
    sparkline: [20, 25, 30, 28, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
  },
  comparativa: { thisMonth: 2180.00, prevMonth: 1840.00, delta: 340.00, deltaPct: 18 },
  categories: [
    { id: "comida", name: "Comida", spent: 820.00, accentVar: "--color-hey-accent-magenta" },
    { id: "transporte", name: "Transporte", spent: 480.00, accentVar: "--color-hey-accent-cyan" },
    { id: "entretenimiento", name: "Entretenimiento", spent: 380.00, accentVar: "--color-hey-accent-purple" },
    { id: "servicios", name: "Servicios", spent: 280.00, accentVar: "--color-hey-accent-amber" },
    { id: "compras", name: "Compras", spent: 140.00, accentVar: "--color-hey-accent-sky" },
    { id: "salud", name: "Salud", spent: 60.00, accentVar: "--color-hey-accent-green" },
    { id: "otros", name: "Otros", spent: 20.00, accentVar: "--color-hey-fg-3" },
  ],
  transactions: [
    { id: "s-t1", date: daysAgo(0), merchant: "OXXO", amount: -42.50, category: "comida" },
    { id: "s-t2", date: daysAgo(0), merchant: "Spotify Estudiante", amount: -65.00, category: "entretenimiento" },
    { id: "s-t3", date: daysAgo(1), merchant: "Beca semestral", amount: 4500.00, category: "otros" },
    { id: "s-t4", date: daysAgo(2), merchant: "Subway campus", amount: -120.00, category: "comida" },
    { id: "s-t5", date: daysAgo(3), merchant: "Metro MTY", amount: -30.00, category: "transporte" },
    { id: "s-t6", date: daysAgo(5), merchant: "Starbucks", amount: -78.00, category: "comida" },
    { id: "s-t7", date: daysAgo(7), merchant: "Cinépolis Junior", amount: -85.00, category: "entretenimiento" },
    { id: "s-t8", date: daysAgo(10), merchant: "Uber x4", amount: -240.00, category: "transporte" },
  ],
  alerts: {
    "limite-cerca": {
      id: "limite-cerca",
      level: "warning",
      title: "Llevas 67% de tu presupuesto del mes",
      body: "Te quedan $1,060 pesos para los próximos 18 días. Ojo con los Ubers.",
      cta: "Ver gráfica",
      href: "/app/grafica/general",
    },
    "ahorra-tip": {
      id: "ahorra-tip",
      level: "info",
      title: "Si llevaras tu lunch ahorrarías ~$600/mes",
      body: "Tu top categoría es Comida ($820). Llevar comida 3 veces por semana corta el gasto a la mitad.",
      cta: "Crear meta",
    },
    "beca-llego": {
      id: "beca-llego",
      level: "success",
      title: "Tu beca cayó hoy 🎓",
      body: "Recibiste $4,500. Te recomiendo apartar $500 antes de gastarlos.",
      cta: "Apartar ahora",
    },
  },
};

export const personas: Persona[] = [mariana, carlos, sofia];

export function getPersonaById(id: string | null | undefined): Persona | undefined {
  if (!id) return undefined;
  return personas.find((p) => p.id === id);
}
