"use client";

import { use } from "react";
import { AppHeader } from "@/app/_components/AppHeader";
import { BarChart } from "@/app/_components/BarChart";
import { PageTransition } from "@/app/_components/PageTransition";
import { useActivePersona } from "@/app/_hooks/usePersona";
import { formatMXN } from "@/app/_data/format";

type Params = { categoria: string };

export default function GraficaPage({ params }: { params: Promise<Params> }) {
  // Next 16: dynamic params is a Promise — `use(params)` on the client.
  const { categoria } = use(params);
  const { snapshot, categories } = useActivePersona();

  // "general" → all categories. Otherwise filter to one.
  const filtered =
    categoria === "general"
      ? categories
      : categories.filter((c) => c.id === categoria);

  const total = filtered.reduce((sum, c) => sum + c.spent, 0);
  const headerTitle =
    categoria === "general"
      ? "Tu gasto del mes"
      : `Gasto en ${filtered[0]?.name ?? categoria}`;

  return (
    <PageTransition from="right">
      <AppHeader title={headerTitle} />
      <main className="hey-app-frame px-4 py-6">
        <p className="hey-eyebrow mb-2">Total</p>
        <div className="mb-1 flex items-baseline gap-2">
          <span className="hey-amount text-[40px] font-semibold leading-none text-hey-fg-1">
            {formatMXN(total)}
          </span>
        </div>
        <p className="mb-6 text-[13px] text-hey-fg-2">
          {snapshot.spentPct}% de tu balance disponible
        </p>
        <BarChart categories={filtered} />
      </main>
    </PageTransition>
  );
}
