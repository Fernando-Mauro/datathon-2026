"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { mockSnapshot, mockCategories, mockTransactions } from "@/app/_data/mock";
import { formatMXN, formatTransaction } from "@/app/_data/format";
import { Sparkline } from "./Sparkline";
import { HaviRing } from "./HaviRing";

const QUICK_ACTIONS: ReadonlyArray<{ label: string; href: string }> = [
  { label: "Ver mis movimientos", href: "/app/movimientos" },
  { label: "Comparar con mes anterior", href: "/app/comparativa" },
  { label: "Hablar con un agente", href: "/app/agente" },
];

export function ContextPane() {
  const { balance, spentThisMonth, spentPct, sparkline } = mockSnapshot;
  const topCategories = [...mockCategories].slice(0, 3);
  const recentTx = mockTransactions.slice(0, 4);

  return (
    <aside
      className="fixed top-0 right-0 z-30 hidden h-screen w-[320px] flex-col gap-4 overflow-y-auto border-l border-hey-divider bg-hey-bg px-5 py-6 lg:flex"
      style={{
        boxShadow:
          "inset 0 8px 16px -10px rgba(255,255,255,0.04), inset -1px 0 0 0 rgba(255,255,255,0.04)",
      }}
      aria-label="Panel de contexto"
    >
      {/* HAVI status pill */}
      <div className="flex items-center gap-2.5 rounded-hey-pill border border-hey-divider bg-hey-surface-1 px-3 py-2">
        <HaviRing size={20} />
        <span className="flex-1 text-[12px] font-medium text-hey-fg-1">HAVI en línea</span>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-hey-success" aria-hidden />
      </div>

      {/* Live snapshot — the hero number */}
      <section className="rounded-hey-md bg-hey-surface-2 p-5">
        <p className="hey-eyebrow mb-2">Saldo disponible</p>
        <div className="flex items-baseline gap-2">
          <span className="hey-amount text-[32px] font-semibold leading-none text-hey-fg-1">
            {formatMXN(balance)}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-hey-divider pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] uppercase tracking-wider text-hey-fg-3">Gastado mes</span>
            <span className="hey-amount text-[15px] font-medium text-hey-fg-1">
              {formatMXN(spentThisMonth)}
            </span>
            <span className="text-[11px] text-hey-fg-2">{spentPct}% del balance</span>
          </div>
          <Sparkline values={sparkline} width={92} height={32} />
        </div>
      </section>

      {/* Top categories */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[13px] font-semibold uppercase tracking-wider text-hey-fg-2">
            Top categorías
          </h3>
          <Link
            href="/app/grafica/general"
            className="text-[11px] font-medium text-hey-blue transition hover:text-hey-fg-1"
          >
            Ver todas
          </Link>
        </div>
        <ul className="flex flex-col gap-2">
          {topCategories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-hey-sm bg-hey-surface-1 px-3 py-2.5"
            >
              <span
                aria-hidden
                className="h-2 w-2 flex-none rounded-full"
                style={{ background: `var(${c.accentVar})` }}
              />
              <span className="flex-1 text-[13px] text-hey-fg-1">{c.name}</span>
              <span className="hey-amount text-[13px] font-medium text-hey-fg-1">
                {formatMXN(c.spent)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent activity */}
      <section className="flex flex-col gap-3">
        <h3 className="font-serif text-[13px] font-semibold uppercase tracking-wider text-hey-fg-2">
          Reciente
        </h3>
        <ul className="flex flex-col gap-1">
          {recentTx.map((t) => {
            const positive = t.amount > 0;
            return (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 border-b border-hey-divider px-1 py-2 last:border-b-0"
              >
                <span className="truncate text-[12px] text-hey-fg-1">{t.merchant}</span>
                <span
                  className={`hey-amount text-[12px] font-medium ${positive ? "text-hey-success" : "text-hey-fg-2"}`}
                >
                  {formatTransaction(t.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Quick actions */}
      <section className="mt-auto flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} strokeWidth={2.2} className="text-hey-blue" />
          <h3 className="font-serif text-[12px] font-semibold uppercase tracking-wider text-hey-fg-2">
            Sugerencias
          </h3>
        </div>
        <ul className="flex flex-col gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <li key={a.label}>
              <Link
                href={a.href}
                className="group flex items-center justify-between gap-2 rounded-hey-sm px-2.5 py-2 text-[12px] text-hey-fg-2 transition-colors hover:bg-hey-surface-2 hover:text-hey-fg-1"
              >
                <span>{a.label}</span>
                <ChevronRight
                  size={12}
                  strokeWidth={2.2}
                  className="opacity-40 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
