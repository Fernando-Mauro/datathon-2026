"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckSquare,
  FileText,
  LineChart,
  Loader2,
  PieChart,
  Radar,
  Square,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { AppHeader } from "@/app/_components/AppHeader";
import {
  deleteSavedChart,
  listSavedCharts,
  type SavedChart,
} from "@/app/_lib/api";

const CHART_ICON: Record<string, LucideIcon> = {
  bar: BarChart3,
  horizontal_bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  radial_bar: Radar,
};

const CHART_LABEL: Record<string, string> = {
  bar: "Barras",
  horizontal_bar: "Barras horizontales",
  line: "Línea",
  pie: "Pastel",
  radial_bar: "Radial",
};

const REPORT_LABEL: Record<string, string> = {
  spending_by_category: "Gasto por categoría",
  monthly_trend: "Tendencia mensual",
  top_merchants: "Top comercios",
  income_vs_spending: "Ingreso vs gasto",
  spending_by_weekday: "Por día de la semana",
  balance_by_product: "Saldo por producto",
  freeform: "Reporte libre",
};

export default function GuardadosPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await listSavedCharts();
        if (!cancelled) setItems(data);
      } catch (err) {
        console.error("[guardados] list error", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onDelete = async (id: string) => {
    const prev = items;
    setItems((arr) => arr.filter((x) => x.id !== id));
    setSelected((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    try {
      await deleteSavedChart(id);
    } catch (err) {
      console.error("[guardados] delete error", err);
      setItems(prev);
      setError(err instanceof Error ? err.message : "Error al borrar");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const goToBuilder = () => {
    if (selected.size === 0) return;
    // Mantén el orden del listado original al pasarlos al builder.
    const orderedIds = items.filter((i) => selected.has(i.id)).map((i) => i.id);
    const ids = orderedIds.join(",");
    router.push(`/app/guardados/builder?ids=${encodeURIComponent(ids)}`);
  };

  const selectedCount = useMemo(() => selected.size, [selected]);

  return (
    <div className="flex min-h-screen flex-col bg-hey-bg">
      <div className="lg:hidden">
        <AppHeader />
      </div>
      <section className="hey-app-frame flex flex-col gap-2 px-4 py-6 lg:px-8 lg:py-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <p className="hey-eyebrow">Reportes guardados</p>
            <h1 className="font-serif text-[28px] font-bold leading-tight text-hey-fg-1 lg:text-[36px]">
              Tus bloques
            </h1>
            <p className="mt-1 text-[14px] leading-snug text-hey-fg-2">
              Combina varios bloques en un PDF unificado para presentarlos.
            </p>
          </div>
          {!loading && items.length > 0 ? (
            selectMode ? (
              <button
                type="button"
                onClick={exitSelectMode}
                className="inline-flex items-center gap-1.5 rounded-hey-pill border border-hey-divider bg-hey-surface-1 px-3 py-2 text-[12px] font-medium text-hey-fg-2 transition hover:text-hey-fg-1"
              >
                <X size={14} strokeWidth={2.2} />
                Salir
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectMode(true)}
                className="inline-flex items-center gap-1.5 rounded-hey-pill border border-hey-divider bg-hey-surface-1 px-3 py-2 text-[12px] font-medium text-hey-fg-1 transition hover:bg-hey-surface-2"
              >
                <CheckSquare size={14} strokeWidth={2.2} className="text-hey-blue" />
                Seleccionar
              </button>
            )
          ) : null}
        </div>
      </section>

      <section className="hey-app-frame flex flex-col gap-2 px-4 pb-32 lg:px-8">
        {loading ? (
          <div className=" flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-hey-fg-3" size={20} />
          </div>
        ) : error ? (
          <div className=" rounded-hey-md border border-hey-divider bg-hey-surface-1 p-4 text-[13px] text-hey-fg-2">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className=" rounded-hey-md border border-dashed border-hey-divider bg-hey-surface-1 p-8 text-center">
            <p className="text-[14px] text-hey-fg-2">
              No has guardado ningún reporte todavía.
            </p>
            <p className="mt-1 text-[12px] text-hey-fg-3">
              Genera una gráfica en el chat y dale al icono de bookmark.
            </p>
          </div>
        ) : (
          items.map((item, i) => (
            <SavedChartBlock
              key={item.id}
              item={item}
              index={i}
              selectMode={selectMode}
              selected={selected.has(item.id)}
              onSelectToggle={() => toggleSelect(item.id)}
              onDelete={() => onDelete(item.id)}
            />
          ))
        )}
      </section>

      {/* Sticky bottom bar — aparece en modo selección con count + CTA */}
      {selectMode ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-hey-divider bg-hey-surface-1/95 backdrop-blur-sm lg:left-[72px]">
          <div className="hey-app-frame flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
            <span className="text-[13px] text-hey-fg-2">
              <span className="font-semibold text-hey-fg-1">{selectedCount}</span>{" "}
              {selectedCount === 1 ? "bloque" : "bloques"} seleccionado
              {selectedCount === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={goToBuilder}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-1.5 rounded-hey-pill bg-hey-blue px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-hey-blue-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileText size={14} strokeWidth={2.4} />
              Generar reporte
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SavedChartBlock({
  item,
  index,
  selectMode,
  selected,
  onSelectToggle,
  onDelete,
}: {
  item: SavedChart;
  index: number;
  selectMode: boolean;
  selected: boolean;
  onSelectToggle: () => void;
  onDelete: () => void;
}) {
  const savedAt = new Date(item.createdAt).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const Icon = CHART_ICON[item.chartType] ?? BarChart3;
  const reportLabel = REPORT_LABEL[item.reportType] ?? item.reportType;
  const chartLabel = CHART_LABEL[item.chartType] ?? item.chartType;
  const rowsLabel = `${item.data.length} ${item.data.length === 1 ? "fila" : "filas"}`;

  const wrapperClass = selectMode
    ? `cursor-pointer transition ${
        selected
          ? "border-hey-blue bg-hey-surface-2"
          : "border-hey-divider bg-hey-surface-1 hover:border-hey-fg-3"
      }`
    : "border-hey-divider bg-hey-surface-1 hover:border-hey-fg-3";

  const wrapperProps = selectMode
    ? {
        onClick: onSelectToggle,
        role: "checkbox" as const,
        "aria-checked": selected,
        tabIndex: 0,
      }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
      className={`flex items-center gap-3 rounded-hey-md border p-3 lg:gap-4 lg:p-4 ${wrapperClass}`}
      {...wrapperProps}
    >
      {/* Icono del tipo de gráfica */}
      <div
        className="flex h-10 w-10 flex-none items-center justify-center rounded-hey-pill bg-hey-surface-2 text-hey-blue lg:h-12 lg:w-12"
        aria-hidden
      >
        <Icon size={18} strokeWidth={2} />
      </div>

      {/* Metadata */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <h3 className="font-serif text-[14px] font-semibold leading-tight text-hey-fg-1 truncate lg:text-[15px]">
          {item.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-hey-fg-3">
          <span>{reportLabel}</span>
          <span aria-hidden>·</span>
          <span>{chartLabel}</span>
          <span aria-hidden>·</span>
          <span>{rowsLabel}</span>
          <span aria-hidden>·</span>
          <span>{item.personaUserId}</span>
          <span aria-hidden className="hidden lg:inline">·</span>
          <span className="hidden lg:inline">{savedAt}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-none items-center gap-1">
        {selectMode ? (
          <SelectIndicator selected={selected} />
        ) : (
          <DeleteButton onClick={onDelete} />
        )}
      </div>
    </motion.div>
  );
}

function SelectIndicator({ selected }: { selected: boolean }) {
  return (
    <div
      className={`flex h-7 w-7 flex-none items-center justify-center rounded-hey-pill transition ${
        selected
          ? "bg-hey-blue text-white"
          : "border border-hey-divider bg-hey-surface-1 text-hey-fg-3"
      }`}
      aria-hidden
    >
      {selected ? (
        <CheckSquare size={14} strokeWidth={2.4} />
      ) : (
        <Square size={14} strokeWidth={2.2} />
      )}
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-hey-pill border border-hey-divider bg-hey-surface-1 px-2 py-1 text-[11px] text-hey-fg-2 transition hover:text-hey-fg-1"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onClick}
          className="rounded-hey-pill bg-hey-error px-2 py-1 text-[11px] font-medium text-white transition hover:opacity-90"
        >
          Borrar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      title="Borrar"
      aria-label="Borrar guardado"
      className="flex h-7 w-7 flex-none items-center justify-center rounded-hey-pill border border-hey-divider bg-hey-surface-1 text-hey-fg-2 transition hover:border-hey-error hover:text-hey-error"
    >
      <Trash2 size={13} strokeWidth={2.2} />
    </button>
  );
}
