"use client";

import { AppHeader } from "@/app/_components/AppHeader";
import { TransactionRow } from "@/app/_components/TransactionRow";
import { PageTransition } from "@/app/_components/PageTransition";
import { mockTransactions } from "@/app/_data/mock";

export default function MovimientosPage() {
  return (
    <PageTransition from="right">
      <AppHeader title="Movimientos" />
      <main className="hey-app-frame px-4 py-4">
        {mockTransactions.length === 0 ? (
          <p className="text-center text-[14px] text-hey-fg-2">
            Aún no tienes movimientos.
          </p>
        ) : (
          <ul className="flex flex-col">
            {mockTransactions.map((t) => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </ul>
        )}
      </main>
    </PageTransition>
  );
}
