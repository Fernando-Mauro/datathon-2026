import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "./_components/Wordmark";
import { HaviRing } from "./_components/HaviRing";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-hey-bg text-hey-fg-1">
      <header className="hey-app-frame flex h-14 items-center justify-between px-4">
        <Wordmark size="md" />
        <Link
          href="/login"
          className="rounded-hey-pill border border-hey-outline px-4 py-1.5 text-[13px] font-medium text-hey-fg-1 transition hover:border-hey-blue hover:text-hey-blue active:opacity-60"
        >
          Iniciar sesión
        </Link>
      </header>

      <main className="hey-app-frame flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <HaviRing size={96} />
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-[36px] font-semibold leading-tight text-hey-fg-1">
            Tu copiloto financiero, en una conversación.
          </h1>
          <p className="text-[15px] leading-snug text-hey-fg-2">
            Pregúntale a HAVI cuánto gastaste, paga tu tarjeta o revisa tus metas — sin menús, sin fricción.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-hey-pill bg-hey-blue px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-hey-blue-hover active:bg-hey-blue-press"
        >
          Entrar
          <ArrowRight size={16} strokeWidth={2.4} />
        </Link>
      </main>

      <footer className="hey-app-frame px-4 py-6 text-center text-[11px] text-hey-fg-3">
        datatón 2026 — demo conversacional inspirada en hey banco
      </footer>
    </div>
  );
}
