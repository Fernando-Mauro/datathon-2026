"use client";

// HAVI snapshot — first message in chat. Balance + spent% + sparkline.
// Reads from the active persona (set in /app/personas picker).

import { useActivePersona } from "@/app/_hooks/usePersona";
import { formatMXN } from "@/app/_data/format";
import { Sparkline } from "./Sparkline";

export function SnapshotCard() {
  const { snapshot } = useActivePersona();
  const { balance, spentThisMonth, spentPct, sparkline } = snapshot;
  return (
    <div className="rounded-hey-md bg-hey-surface-2 p-5">
      <p className="hey-eyebrow mb-2">Tu mes</p>
      <div className="flex items-baseline gap-3">
        <span className="hey-amount text-[36px] font-semibold leading-none text-hey-fg-1">
          {formatMXN(balance)}
        </span>
        <span className="text-xs text-hey-fg-3">disponible</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-hey-fg-2">Has gastado</span>
          <span className="hey-amount text-base font-medium text-hey-fg-1">
            {formatMXN(spentThisMonth)} <span className="text-hey-fg-3">({spentPct}%)</span>
          </span>
        </div>
        <Sparkline values={sparkline} />
      </div>
    </div>
  );
}
