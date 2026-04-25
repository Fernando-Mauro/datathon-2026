"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Category } from "@/app/_data/types";
import { formatMXN } from "@/app/_data/format";

type Props = {
  categories: readonly Category[];
};

export function BarChart({ categories }: Props) {
  const reduce = useReducedMotion();
  const max = Math.max(...categories.map((c) => c.spent));
  return (
    <ul className="flex flex-col gap-3">
      {categories.map((c, i) => {
        const pct = (c.spent / max) * 100;
        return (
          <li key={c.id} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-[13px]">
              <span className="font-medium text-hey-fg-1">{c.name}</span>
              <span className="hey-amount font-medium text-hey-fg-1">{formatMXN(c.spent)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-hey-surface-2">
              <motion.div
                initial={reduce ? { width: `${pct}%` } : { scaleX: 0, width: `${pct}%` }}
                animate={reduce ? { width: `${pct}%` } : { scaleX: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.32, 0.72, 0, 1] }}
                className="h-full origin-left rounded-full"
                style={{ background: `var(${c.accentVar})` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
