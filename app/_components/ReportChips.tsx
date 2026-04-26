// Chips de "Generar reporte" — UI temporal de B-2 para disparar reportes
// directo (sin pasar por el LLM aún). En B-3 esto lo activa el chat-handler
// vía suggested actions y este componente puede borrarse o esconderse.

import { BarChart3, LineChart, PieChart, type LucideIcon } from "lucide-react";

type ReportSpec = {
  type: string;
  label: string;
  icon: LucideIcon;
};

export const REPORT_SPECS: readonly ReportSpec[] = [
  { type: "spending_by_category", label: "Gasto por categoría", icon: PieChart },
  { type: "monthly_trend", label: "Tendencia mensual", icon: LineChart },
  { type: "top_merchants", label: "Top comercios", icon: BarChart3 },
  { type: "income_vs_spending", label: "Ingreso vs gasto", icon: BarChart3 },
  { type: "spending_by_weekday", label: "Por día de la semana", icon: BarChart3 },
  { type: "balance_by_product", label: "Saldo por producto", icon: BarChart3 },
];

type Props = {
  onPick: (reportType: string, label: string) => void;
  disabled?: boolean;
};

export function ReportChips({ onPick, disabled }: Props) {
  return (
    <div className="hey-app-frame flex flex-col gap-1 px-4 pt-2">
      <span className="hey-eyebrow text-[10px] text-hey-fg-3">Generar reporte</span>
      <div className="hey-scroll-x-hidden flex gap-2 pb-1">
        {REPORT_SPECS.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.type}
              type="button"
              disabled={disabled}
              onClick={() => onPick(r.type, r.label)}
              className="flex flex-none items-center gap-1.5 rounded-hey-pill border border-hey-outline bg-hey-surface-1 px-3 py-1.5 text-[12px] font-medium text-hey-fg-1 transition hover:bg-hey-surface-2 active:opacity-60 disabled:cursor-wait disabled:opacity-50"
            >
              <Icon size={13} strokeWidth={2.2} className="text-hey-blue" />
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
