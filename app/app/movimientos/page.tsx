"use client";

import { AppHeader } from "@/app/_components/AppHeader";
import { TransactionRow } from "@/app/_components/TransactionRow";
import { PageTransition } from "@/app/_components/PageTransition";
import { useActivePersona } from "@/app/_hooks/usePersona";

export default function MovimientosPage() {
  const { transactions } = useActivePersona();
  return (
    <PageTransition from="right">
      <AppHeader title="Movimientos" />
      <main className="hey-app-frame px-4 py-4">
        {transactions.length === 0 ? (
          <p className="text-center text-[14px] text-hey-fg-2">
            Aún no tienes movimientos.
          </p>
        ) : (
          <ul className="flex flex-col">
            {transactions.map((t) => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </ul>
        )}
      </main>
    </PageTransition>
  );
}
