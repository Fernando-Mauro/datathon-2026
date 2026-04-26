// Shared types for the conversational HAVI experience.
// All financial figures are in MXN (centavos NOT used — values are float pesos).

export type CategoryId =
  | "comida"
  | "transporte"
  | "servicios"
  | "entretenimiento"
  | "compras"
  | "salud"
  | "otros";

export type Category = {
  id: CategoryId;
  name: string;
  spent: number;
  /** CSS variable name (without `var()`) for the chip accent. */
  accentVar: string;
};

export type Transaction = {
  id: string;
  /** ISO 8601 — the chat home + movimientos render relative dates from here. */
  date: string;
  merchant: string;
  amount: number;
  category: CategoryId;
};

export type Snapshot = {
  balance: number;
  spentThisMonth: number;
  /** 0–100, % of balance available consumed. */
  spentPct: number;
  topCategoryId: CategoryId;
  /** 14 daily points, oldest → newest. */
  sparkline: number[];
};

export type MonthCompare = {
  thisMonth: number;
  prevMonth: number;
  /** signed delta in pesos. */
  delta: number;
  /** signed delta as % of prevMonth (rounded to integer). */
  deltaPct: number;
};

export type AlertLevel = "warning" | "success" | "info" | "error";

export type AlertItem = {
  id: string;
  level: AlertLevel;
  title: string;
  body: string;
  cta?: string;
  /** Sub-route to open on CTA tap (e.g., `/app/movimientos`). */
  href?: string;
};

export type ChatActionPill = {
  label: string;
  /** Either a sub-route (`/app/grafica/comida`) or a synthetic message id (`agent:start`). */
  target: string;
};

/** Tipos de visualización soportados por HavicaChart (Nivo-backed). */
export type ChartType =
  | "bar"
  | "horizontal_bar"
  | "line"
  | "pie"
  | "radial_bar";

/** Reporte renderizable en el chat — viene del Lambda `report-handler`. */
export type ReportChart = {
  reportType: string;
  chartType: ChartType;
  title: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  series?: string[];
  sql: string;
  source: "template" | "freeform";
};

export type ChatMessage =
  | { id: string; from: "user"; kind: "text"; text: string }
  | { id: string; from: "havi"; kind: "text"; text: string }
  | { id: string; from: "havi"; kind: "snapshot" }
  | {
      id: string;
      from: "havi";
      kind: "actions";
      text: string;
      actions: ChatActionPill[];
    }
  | { id: string; from: "havi"; kind: "alert"; alert: AlertItem }
  | { id: string; from: "havi"; kind: "transfer"; recipient: string; amount: number }
  | { id: string; from: "havi"; kind: "chart"; chart: ReportChart }
  | { id: string; from: "havi"; kind: "fallback" };

export type HaviResponse = Omit<ChatMessage, "id" | "from"> & { from: "havi" };

export type HaviPattern = {
  match: RegExp;
  /** Returns the message body (id + from injected by the dispatcher). */
  reply: (input: string) => HaviResponse;
};
