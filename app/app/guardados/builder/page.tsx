"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  GripVertical,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { HavicaChart } from "@/app/_components/HavicaChart";
import { listSavedCharts, type SavedChart } from "@/app/_lib/api";
import { generateReportPdf } from "./pdf";

export default function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";

  const [items, setItems] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("Reporte unificado");
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const requestedIds = useMemo(
    () => idsParam.split(",").filter((id) => id.length > 0),
    [idsParam],
  );

  useEffect(() => {
    let cancelled = false;
    if (requestedIds.length === 0) {
      router.replace("/app/guardados");
      return;
    }
    void (async () => {
      try {
        const all = await listSavedCharts();
        // Mantén el orden de los IDs pasados en la URL.
        const map = new Map(all.map((x) => [x.id, x] as const));
        const ordered = requestedIds
          .map((id) => map.get(id))
          .filter((x): x is SavedChart => x !== undefined);
        if (!cancelled) setItems(ordered);
      } catch (err) {
        console.error("[builder] fetch error", err);
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
  }, [requestedIds, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((arr) => {
      const oldIdx = arr.findIndex((x) => x.id === active.id);
      const newIdx = arr.findIndex((x) => x.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return arr;
      return arrayMove(arr, oldIdx, newIdx);
    });
  };

  const removeItem = (id: string) => {
    setItems((arr) => arr.filter((x) => x.id !== id));
  };

  const onDownloadPdf = async () => {
    if (!printRef.current || items.length === 0) return;
    setExporting(true);
    try {
      await generateReportPdf({
        title: reportTitle,
        chartElements: Array.from(
          printRef.current.querySelectorAll<HTMLElement>("[data-chart-block]"),
        ),
      });
    } catch (err) {
      console.error("[builder] pdf error", err);
      setError(err instanceof Error ? err.message : "Error al generar PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-hey-bg">
      <section className="hey-app-frame flex flex-col gap-4 px-4 py-6 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/app/guardados")}
            className="inline-flex items-center gap-1.5 rounded-hey-pill border border-hey-divider bg-hey-surface-1 px-3 py-2 text-[12px] font-medium text-hey-fg-2 transition hover:text-hey-fg-1"
          >
            <ArrowLeft size={14} strokeWidth={2.2} />
            Volver
          </button>
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={exporting || items.length === 0}
            className="inline-flex items-center gap-1.5 rounded-hey-pill bg-hey-blue px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-hey-blue-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exporting ? (
              <Loader2 size={14} className="animate-spin" strokeWidth={2.4} />
            ) : (
              <Download size={14} strokeWidth={2.4} />
            )}
            {exporting ? "Generando…" : "Descargar PDF"}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <p className="hey-eyebrow">Constructor de reporte</p>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Título del reporte"
            className="border-0 border-b border-hey-divider bg-transparent pb-2 font-serif text-[28px] font-bold leading-tight text-hey-fg-1 outline-none transition focus:border-hey-blue lg:text-[36px]"
          />
          <p className="text-[13px] text-hey-fg-3">
            {items.length} {items.length === 1 ? "bloque" : "bloques"} · arrastra para
            reordenar
          </p>
        </div>
      </section>

      <section className="hey-app-frame px-4 pb-12 lg:px-8" ref={printRef}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-hey-fg-3" size={20} />
          </div>
        ) : error ? (
          <div className="rounded-hey-md border border-hey-divider bg-hey-surface-1 p-4 text-[13px] text-hey-fg-2">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-hey-md border border-dashed border-hey-divider bg-hey-surface-1 p-8 text-center text-[13px] text-hey-fg-2">
            No hay bloques. Vuelve atrás y selecciona al menos uno.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={items.map((x) => x.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <SortableBlock
                    key={item.id}
                    item={item}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>
    </div>
  );
}

function SortableBlock({
  item,
  onRemove,
}: {
  item: SavedChart;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} data-chart-block>
      <HavicaChart
        chart={item}
        actions={
          <div className="flex items-center gap-1">
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label="Reordenar"
              title="Arrastrar para reordenar"
              className="flex h-7 w-7 cursor-grab flex-none items-center justify-center rounded-hey-pill border border-hey-divider bg-hey-surface-1 text-hey-fg-2 transition hover:text-hey-fg-1 active:cursor-grabbing"
            >
              <GripVertical size={14} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Quitar del reporte"
              title="Quitar del reporte"
              className="flex h-7 w-7 flex-none items-center justify-center rounded-hey-pill border border-hey-divider bg-hey-surface-1 text-hey-fg-2 transition hover:border-hey-error hover:text-hey-error"
            >
              <Trash2 size={13} strokeWidth={2.2} />
            </button>
          </div>
        }
      />
    </div>
  );
}
