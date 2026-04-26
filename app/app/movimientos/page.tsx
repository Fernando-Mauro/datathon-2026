"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { AppHeader } from "@/app/_components/AppHeader";
import { TransactionRow } from "@/app/_components/TransactionRow";
import { PageTransition } from "@/app/_components/PageTransition";
import { useActivePersona } from "@/app/_hooks/usePersona";
import type { Transaction } from "@/app/_data/types";
import { getTransactionsPageAction } from "./actions";

const PAGE_SIZE = 25;

export default function MovimientosPage() {
  const persona = useActivePersona();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset a página 1 cuando cambia la persona.
  useEffect(() => {
    setPage(1);
  }, [persona.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await getTransactionsPageAction(persona.id, page, PAGE_SIZE);
        if (!cancelled) {
          setTransactions(data.items);
          setTotal(data.total);
        }
      } catch (err) {
        console.error("[movimientos] error", err);
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
  }, [persona.id, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const safePage = Math.min(page, totalPages);

  return (
    <PageTransition from="right">
      <AppHeader title="Movimientos" />
      <main className="hey-app-frame flex flex-col px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-hey-fg-3" size={20} />
          </div>
        ) : error ? (
          <p className="text-center text-[14px] text-hey-fg-2">
            No pude cargar los movimientos: {error}
          </p>
        ) : total === 0 ? (
          <p className="text-center text-[14px] text-hey-fg-2">
            Aún no tienes movimientos.
          </p>
        ) : (
          <>
            <ul className="flex flex-col">
              {transactions.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </ul>

            <nav
              aria-label="Paginación"
              className="mt-4 flex items-center justify-between gap-3"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-hey-pill border border-hey-divider bg-hey-surface-1 px-3 py-2 text-[12px] font-medium text-hey-fg-1 transition hover:bg-hey-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} strokeWidth={2.2} />
                Anterior
              </button>
              <span className="text-[12px] text-hey-fg-2">
                Página{" "}
                <span className="font-semibold text-hey-fg-1">{safePage}</span> de{" "}
                {totalPages}
                <span className="ml-2 text-hey-fg-3">
                  · {total.toLocaleString("es-MX")} movimientos
                </span>
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages || loading}
                className="inline-flex items-center gap-1 rounded-hey-pill border border-hey-divider bg-hey-surface-1 px-3 py-2 text-[12px] font-medium text-hey-fg-1 transition hover:bg-hey-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ChevronRight size={14} strokeWidth={2.2} />
              </button>
            </nav>
          </>
        )}
      </main>
    </PageTransition>
  );
}
