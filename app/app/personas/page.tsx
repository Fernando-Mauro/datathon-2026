"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { usePersona } from "@/app/_hooks/usePersona";
import { Wordmark } from "@/app/_components/Wordmark";
import { HaviRing } from "@/app/_components/HaviRing";
import { formatMXN } from "@/app/_data/format";
import type { Persona } from "@/app/_data/personas";

export default function PersonasPage() {
  const router = useRouter();
  const { allPersonas, setPersonaById } = usePersona();

  const enter = (id: string) => {
    setPersonaById(id);
    router.push("/app");
  };

  return (
    <main className="flex min-h-screen flex-col bg-hey-bg">
      <header className="hey-app-frame flex items-center justify-between px-4 py-6 lg:px-8">
        <Wordmark size="md" />
        <span className="hey-eyebrow">Modo administrador</span>
      </header>

      <section className="hey-app-frame flex flex-col gap-2 px-4 py-6 lg:px-8 lg:py-10">
        <p className="hey-eyebrow">Selecciona un usuario</p>
        <h1 className="font-serif text-[28px] font-bold leading-tight text-hey-fg-1 lg:text-[36px]">
          ¿Como quién entras a la conversación?
        </h1>
        <p className="mt-1 text-[14px] leading-snug text-hey-fg-2">
          HaviCA cambia su contexto financiero — saldo, movimientos, alertas — según la persona que elijas.
        </p>
      </section>

      <section className="hey-app-frame grid grid-cols-1 gap-3 px-4 pb-12 lg:grid-cols-2 lg:gap-4 lg:px-8">
        {allPersonas.map((p, i) => (
          <PersonaCard key={p.id} persona={p} onPick={enter} index={i} />
        ))}
      </section>

      <footer className="hey-app-frame flex items-center justify-center gap-2 px-4 pb-8 text-center text-[11px] text-hey-fg-3">
        <HaviRing size={14} />
        <span>HAVI atiende a cada uno con sus propios datos.</span>
      </footer>
    </main>
  );
}

function PersonaCard({
  persona,
  onPick,
  index,
}: {
  persona: Persona;
  onPick: (id: string) => void;
  index: number;
}) {
  const initials = persona.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: [0.32, 0.72, 0, 1] }}
      className="group flex flex-col gap-4 rounded-hey-md border border-hey-divider bg-hey-surface-1 p-5 transition hover:border-hey-blue hover:bg-hey-surface-2"
    >
      <header className="flex items-center gap-3">
        <div
          aria-hidden
          className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-serif text-[15px] font-bold text-hey-fg-1"
          style={{
            background: `var(${persona.avatarVar.replace(/--color-(.+)/, "--color-$1-bg")})`,
            color: `var(${persona.avatarVar})`,
          }}
        >
          {initials}
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <h2 className="font-serif text-[18px] font-semibold leading-tight text-hey-fg-1">
            {persona.fullName}
          </h2>
          <p className="text-[12px] text-hey-fg-2">{persona.headline}</p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 border-t border-hey-divider pt-4">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] uppercase tracking-wider text-hey-fg-3">Saldo</dt>
          <dd className="hey-amount text-[18px] font-semibold text-hey-fg-1">
            {formatMXN(persona.snapshot.balance)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] uppercase tracking-wider text-hey-fg-3">Gastado mes</dt>
          <dd className="hey-amount text-[18px] font-semibold text-hey-fg-1">
            {formatMXN(persona.snapshot.spentThisMonth)}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => onPick(persona.id)}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-hey-pill bg-hey-blue py-3 text-[14px] font-semibold text-white transition hover:bg-hey-blue-hover active:bg-hey-blue-press"
      >
        Entrar como {persona.firstName}
        <ArrowRight size={14} strokeWidth={2.4} />
      </button>
    </motion.article>
  );
}
