"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AppHeader } from "@/app/_components/AppHeader";
import { PageTransition } from "@/app/_components/PageTransition";
import { mockComparativa } from "@/app/_data/mock";
import { formatMXN } from "@/app/_data/format";

export default function ComparativaPage() {
  const reduce = useReducedMotion();
  const { thisMonth, prevMonth, delta, deltaPct } = mockComparativa;
  const up = delta > 0;
  const max = Math.max(thisMonth, prevMonth);

  return (
    <PageTransition from="right">
      <AppHeader title="Mes vs mes anterior" />
      <main className="hey-app-frame flex flex-col gap-6 px-4 py-6">
        <div className="rounded-hey-md bg-hey-surface-2 p-5">
          <div className="flex items-center gap-2">
            <p className="hey-eyebrow">Este mes</p>
            <span
              className={`inline-flex items-center gap-1 rounded-hey-pill px-2 py-0.5 text-[11px] font-semibold ${
                up
                  ? "bg-hey-accent-amber-bg text-hey-warning"
                  : "bg-hey-accent-green-bg text-hey-success"
              }`}
            >
              {up ? <ArrowUpRight size={12} strokeWidth={2.4} /> : <ArrowDownRight size={12} strokeWidth={2.4} />}
              {up ? "+" : "−"}
              {Math.abs(deltaPct)}%
            </span>
          </div>
          <span className="hey-amount mt-1 block text-[40px] font-semibold leading-none text-hey-fg-1">
            {formatMXN(thisMonth)}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <Bar label="Este mes" amount={thisMonth} pct={(thisMonth / max) * 100} accent up={up} reduce={reduce} delay={0} />
          <Bar label="Mes anterior" amount={prevMonth} pct={(prevMonth / max) * 100} reduce={reduce} delay={0.08} />
        </div>

        <p className="rounded-hey-md bg-hey-surface-2 p-4 text-[13px] text-hey-fg-2">
          {up
            ? `Llevas ${formatMXN(delta)} más que el mes pasado. Te conviene revisar las categorías altas para ajustar.`
            : `Vas ${formatMXN(Math.abs(delta))} por debajo del mes pasado. Buen ritmo.`}
        </p>
      </main>
    </PageTransition>
  );
}

function Bar({
  label,
  amount,
  pct,
  accent,
  up,
  reduce,
  delay,
}: {
  label: string;
  amount: number;
  pct: number;
  accent?: boolean;
  up?: boolean;
  reduce: boolean | null;
  delay: number;
}) {
  const color = accent ? (up ? "var(--color-hey-warning)" : "var(--color-hey-success)") : "var(--color-hey-fg-2)";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-hey-fg-2">{label}</span>
        <span className="hey-amount font-medium text-hey-fg-1">{formatMXN(amount)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-hey-surface-2">
        <motion.div
          initial={reduce ? { width: `${pct}%` } : { scaleX: 0, width: `${pct}%` }}
          animate={reduce ? { width: `${pct}%` } : { scaleX: 1 }}
          transition={{ duration: 0.4, delay, ease: [0.32, 0.72, 0, 1] }}
          className="h-full origin-left rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
