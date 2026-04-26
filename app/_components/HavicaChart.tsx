"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveRadialBar } from "@nivo/radial-bar";
import type { ChartType, ReportChart } from "@/app/_data/types";
import { formatMXN } from "@/app/_data/format";
import { saveChart } from "@/app/_lib/api";
import { useActivePersona } from "@/app/_hooks/usePersona";

// Paleta — hex equivalents de los accent vars de globals.css.
const COLORS = [
  "#3478F6", // hey-blue
  "#FFB547", // amber
  "#FF6FD3", // magenta
  "#4FD8E0", // cyan
  "#B084FF", // purple
  "#4FE5A1", // green
  "#5AB6FF", // sky
];

const TEXT_BRIGHT = "rgba(255,255,255,0.92)";
const TEXT_DIM = "rgba(255,255,255,0.60)";
const GRID_LINE = "rgba(255,255,255,0.08)";
const SURFACE_1 = "#0E0E0E";
const SURFACE_2 = "#1A1A1A";

const NIVO_THEME = {
  background: "transparent",
  text: { fontSize: 11, fill: TEXT_DIM },
  axis: {
    domain: { line: { stroke: GRID_LINE, strokeWidth: 1 } },
    legend: { text: { fontSize: 11, fill: TEXT_DIM } },
    ticks: {
      line: { stroke: "transparent" },
      text: { fontSize: 10, fill: TEXT_DIM },
    },
  },
  grid: { line: { stroke: GRID_LINE, strokeDasharray: "3 3" } },
  legends: { text: { fontSize: 11, fill: TEXT_DIM } },
  labels: {
    text: { fontSize: 11, fill: TEXT_BRIGHT, fontWeight: 600 },
  },
  tooltip: {
    container: {
      background: SURFACE_1,
      color: TEXT_BRIGHT,
      fontSize: 12,
      borderRadius: 8,
      padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      border: `1px solid ${GRID_LINE}`,
    },
  },
} as const;

function abbrevMxn(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
  return `$${Math.round(v)}`;
}

const HEIGHT_BY_TYPE: Record<ChartType, number> = {
  bar: 300,
  horizontal_bar: 340,
  line: 300,
  pie: 340,
  radial_bar: 340,
};

const tooltipBoxStyle: React.CSSProperties = {
  background: SURFACE_1,
  color: TEXT_BRIGHT,
  fontSize: 12,
  padding: "8px 12px",
  borderRadius: 8,
  border: `1px solid ${GRID_LINE}`,
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
};

function dotStyle(color: string): React.CSSProperties {
  return {
    display: "inline-block",
    width: 8,
    height: 8,
    background: color,
    borderRadius: 2,
    marginRight: 6,
    verticalAlign: "middle",
  };
}

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Render principal de un chart.
 * - En el chat: se renderea sin `actions` y muestra el botón de guardar por default.
 * - En la vista de guardados: se pasa `actions` con botones custom (borrar, seleccionar).
 */
export function HavicaChart({
  chart,
  actions,
  footer,
}: {
  chart: ReportChart;
  actions?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-hey-md bg-hey-surface-2 p-4 min-w-0 w-full">
      <header className="mb-3 flex items-baseline justify-between gap-2 min-w-0">
        <h3 className="font-serif text-[14px] font-semibold leading-tight text-hey-fg-1 truncate">
          {chart.title}
        </h3>
        <div className="flex items-center gap-2 flex-none">
          <span className="hey-eyebrow text-[10px] text-hey-fg-3">
            {chart.source === "template" ? "Reporte" : "SQL generado"}
          </span>
          {actions ?? <DefaultSaveAction chart={chart} />}
        </div>
      </header>
      <div
        style={{ height: HEIGHT_BY_TYPE[chart.chartType] ?? 300 }}
        className="w-full min-w-0"
      >
        {chart.data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[12px] text-hey-fg-3">
              Sin datos para este reporte.
            </p>
          </div>
        ) : (
          <ChartImpl chart={chart} />
        )}
      </div>
      {footer}
    </div>
  );
}

/** Acción default — guardar a RDS. Sólo se renderea en contexto de chat
 *  (donde existe persona activa). */
function DefaultSaveAction({ chart }: { chart: ReportChart }) {
  const persona = useActivePersona();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const onSave = async () => {
    if (saveState !== "idle") return;
    setSaveState("saving");
    try {
      await saveChart(persona.id, chart);
      setSaveState("saved");
    } catch (err) {
      console.error("[saveChart] error", err);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2000);
    }
  };

  return <SaveButton state={saveState} onClick={onSave} />;
}

function SaveButton({
  state,
  onClick,
}: {
  state: SaveState;
  onClick: () => void;
}) {
  const disabled = state === "saving" || state === "saved";
  const label =
    state === "saving"
      ? "Guardando…"
      : state === "saved"
        ? "Guardado"
        : "Guardar reporte";
  const Icon =
    state === "saving" ? Loader2 : state === "saved" ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`flex h-7 w-7 flex-none items-center justify-center rounded-hey-pill transition ${
        state === "saved"
          ? "bg-hey-blue text-white"
          : "border border-hey-divider bg-hey-surface-1 text-hey-fg-2 hover:border-hey-blue hover:text-hey-fg-1"
      } disabled:cursor-default`}
    >
      <Icon
        size={14}
        strokeWidth={2.2}
        className={state === "saving" ? "animate-spin" : ""}
      />
    </button>
  );
}

function ChartImpl({ chart }: { chart: ReportChart }) {
  switch (chart.chartType) {
    case "bar":
    case "horizontal_bar":
      return <BarImpl chart={chart} />;
    case "line":
      return <LineImpl chart={chart} />;
    case "pie":
      return <PieImpl chart={chart} />;
    case "radial_bar":
      return <RadialBarImpl chart={chart} />;
    default:
      return <BarImpl chart={chart} />;
  }
}

function BarImpl({ chart }: { chart: ReportChart }) {
  const { data, xKey, yKey, series, chartType } = chart;
  const isHorizontal = chartType === "horizontal_bar";
  const keys = series ?? [yKey];
  const multiSeries = keys.length > 1;
  const colorByKey = (id: string) =>
    COLORS[Math.max(0, keys.indexOf(id)) % COLORS.length];

  // Si hay múltiples series, reservamos espacio en la parte inferior para
  // la leyenda. Una sola serie no necesita leyenda → margen normal.
  const bottomMargin = multiSeries ? (isHorizontal ? 60 : 64) : isHorizontal ? 28 : 36;

  return (
    <ResponsiveBar
      data={data as Array<Record<string, string | number>>}
      keys={keys}
      indexBy={xKey}
      layout={isHorizontal ? "horizontal" : "vertical"}
      groupMode={multiSeries ? "grouped" : "stacked"}
      margin={
        isHorizontal
          ? { top: 16, right: 60, bottom: bottomMargin, left: 110 }
          : { top: 16, right: 16, bottom: bottomMargin, left: 60 }
      }
      padding={0.32}
      innerPadding={multiSeries ? 2 : 0}
      borderRadius={4}
      colors={({ id }) => colorByKey(String(id))}
      colorBy="id"
      theme={NIVO_THEME}
      enableLabel
      label={(d) => abbrevMxn(d.value as number)}
      labelTextColor={TEXT_BRIGHT}
      labelSkipWidth={28}
      labelSkipHeight={14}
      labelOffset={isHorizontal ? 6 : 4}
      axisLeft={
        isHorizontal
          ? { tickSize: 0, tickPadding: 8 }
          : {
              tickSize: 0,
              tickPadding: 8,
              format: (v) => abbrevMxn(v as number),
            }
      }
      axisBottom={
        isHorizontal
          ? {
              tickSize: 0,
              tickPadding: 8,
              format: (v) => abbrevMxn(v as number),
            }
          : {
              tickSize: 0,
              tickPadding: 8,
              tickRotation: data.length > 6 ? -22 : 0,
            }
      }
      enableGridY={!isHorizontal}
      enableGridX={isHorizontal}
      tooltip={({ id, value, indexValue, color }) => (
        <div style={tooltipBoxStyle}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={dotStyle(color)} />
            <strong>{indexValue}</strong>
          </div>
          <div style={{ marginTop: 4, color: TEXT_DIM }}>
            {keys.length > 1 ? `${id}: ` : ""}
            {formatMXN(value as number)}
          </div>
        </div>
      )}
      animate
      motionConfig="gentle"
      legends={
        multiSeries
          ? [
              {
                dataFrom: "keys",
                anchor: "bottom",
                direction: "row",
                // Empuja la leyenda DEBAJO del eje X — el bottom margin de la
                // chart le hizo lugar arriba.
                translateY: bottomMargin - 8,
                itemWidth: 100,
                itemHeight: 14,
                itemDirection: "left-to-right",
                symbolSize: 10,
                symbolShape: "circle",
                itemTextColor: TEXT_DIM,
              },
            ]
          : []
      }
    />
  );
}

function LineImpl({ chart }: { chart: ReportChart }) {
  const { data, xKey, yKey, series } = chart;
  const keys = series ?? [yKey];

  const lineData = keys.map((k) => ({
    id: k,
    data: data.map((r) => ({
      x: String(r[xKey] ?? ""),
      y: Number(r[k] ?? 0),
    })),
  }));

  return (
    <ResponsiveLine
      data={lineData}
      margin={{ top: 16, right: 16, bottom: 36, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: 0, max: "auto" }}
      curve="monotoneX"
      colors={({ id }) =>
        COLORS[Math.max(0, keys.indexOf(String(id))) % COLORS.length]
      }
      theme={NIVO_THEME}
      axisLeft={{
        tickSize: 0,
        tickPadding: 8,
        format: (v) => abbrevMxn(v as number),
      }}
      axisBottom={{ tickSize: 0, tickPadding: 8 }}
      pointSize={9}
      pointColor={{ from: "color" }}
      pointBorderWidth={2}
      pointBorderColor={SURFACE_2}
      enableArea
      areaOpacity={0.18}
      lineWidth={2.5}
      enableGridX={false}
      enableGridY
      enableSlices="x"
      sliceTooltip={({ slice }) => (
        <div style={tooltipBoxStyle}>
          <strong>{String(slice.points[0]?.data.x ?? "")}</strong>
          {slice.points.map((p) => (
            <div
              key={p.id}
              style={{ marginTop: 4, color: TEXT_DIM }}
            >
              <span style={dotStyle(p.seriesColor)} />
              {keys.length > 1 ? `${p.seriesId}: ` : ""}
              {formatMXN(p.data.y as number)}
            </div>
          ))}
        </div>
      )}
      animate
      motionConfig="gentle"
    />
  );
}

function PieImpl({ chart }: { chart: ReportChart }) {
  const { data, xKey, yKey } = chart;
  const total = data.reduce((s, r) => s + Number(r[yKey] ?? 0), 0);
  const pieData = data.map((r, i) => ({
    id: String(r[xKey] ?? `slice-${i}`),
    label: String(r[xKey] ?? ""),
    value: Number(r[yKey] ?? 0),
  }));

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ResponsivePie
        data={pieData}
        margin={{ top: 16, right: 80, bottom: 16, left: 80 }}
        innerRadius={0.6}
        padAngle={0.6}
        cornerRadius={4}
        activeOuterRadiusOffset={6}
        colors={pieData.map((_, i) => COLORS[i % COLORS.length])}
        borderWidth={2}
        borderColor={SURFACE_2}
        theme={NIVO_THEME}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={TEXT_DIM}
        arcLinkLabelsThickness={1}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={20}
        arcLabel={(d) => abbrevMxn(d.value)}
        arcLabelsTextColor={TEXT_BRIGHT}
        tooltip={({ datum }) => (
          <div style={tooltipBoxStyle}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={dotStyle(datum.color)} />
              <strong>{datum.label}</strong>
            </div>
            <div style={{ marginTop: 4, color: TEXT_DIM }}>
              {formatMXN(datum.value)}
            </div>
          </div>
        )}
        animate
        motionConfig="gentle"
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: TEXT_DIM,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          Total
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: TEXT_BRIGHT,
            marginTop: 2,
          }}
        >
          {formatMXN(total)}
        </div>
      </div>
    </div>
  );
}

function RadialBarImpl({ chart }: { chart: ReportChart }) {
  const { data, xKey, yKey } = chart;

  // Un grupo por dato — Nivo dibuja N "tracks" concéntricos, cada uno con
  // su arco proporcional al value.
  const radialData = data.map((r) => ({
    id: String(r[xKey] ?? ""),
    data: [
      {
        x: String(r[xKey] ?? ""),
        y: Number(r[yKey] ?? 0),
      },
    ],
  }));

  const colorById = (groupId: string) => {
    const idx = radialData.findIndex((r) => r.id === groupId);
    return COLORS[Math.max(0, idx) % COLORS.length];
  };

  return (
    <ResponsiveRadialBar
      data={radialData}
      margin={{ top: 16, right: 100, bottom: 16, left: 16 }}
      colors={(d) => colorById(String(d.groupId ?? d.category ?? ""))}
      theme={NIVO_THEME}
      cornerRadius={4}
      padding={0.4}
      innerRadius={0.3}
      enableTracks
      tracksColor="rgba(255,255,255,0.04)"
      enableLabels={false}
      enableRadialGrid={false}
      enableCircularGrid={false}
      tooltip={({ bar }) => (
        <div style={tooltipBoxStyle}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={dotStyle(bar.color)} />
            <strong>{bar.groupId}</strong>
          </div>
          <div style={{ marginTop: 4, color: TEXT_DIM }}>
            {formatMXN(bar.value)}
          </div>
        </div>
      )}
      legends={[
        {
          anchor: "right",
          direction: "column",
          translateX: 80,
          itemsSpacing: 6,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 14,
          symbolSize: 10,
          symbolShape: "circle",
          itemTextColor: TEXT_DIM,
        },
      ]}
      animate
      motionConfig="gentle"
    />
  );
}
