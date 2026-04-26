"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppHeader } from "@/app/_components/AppHeader";
import { PageTransition } from "@/app/_components/PageTransition";

// Notificaciones fake — para datathon. La lógica real (detección predictiva,
// disparadores cron, push real) se implementaría en B-5+.
type NotifLevel = "predictive" | "warning" | "info" | "success";

type Notification = {
  id: string;
  level: NotifLevel;
  title: string;
  body: string;
  /** Tiempo relativo display ("hace 5 min", "hace 2 horas", etc). */
  when: string;
  /** Mensaje pre-cargado al chat cuando el usuario hace tap a "Habla con HAVI". */
  haviPrompt: string;
};

const NOTIFICATIONS: readonly Notification[] = [
  {
    id: "n1",
    level: "predictive",
    title: "Estás por gastar en Starbucks y tu flujo va negativo",
    body: "Detectamos que sueles pasar al Starbucks de Reforma a esta hora. Si compras hoy, tu saldo cierra el día en -$120. Plantéalo con HAVI antes de comprar.",
    when: "hace 4 min",
    haviPrompt:
      "Detectaste que voy a gastar en Starbucks pero mi flujo va negativo. ¿Qué me recomiendas hacer?",
  },
  {
    id: "n2",
    level: "warning",
    title: "Tu tarjeta de crédito está al 82% de uso",
    body: "Estás cerca del límite. Pagar al menos $1,500 antes del corte mejoraría tu utilización y tu score.",
    when: "hace 1 h",
    haviPrompt:
      "Mi tarjeta de crédito está al 82% de uso. ¿Cuánto debería pagar y por qué?",
  },
  {
    id: "n3",
    level: "info",
    title: "Cargo recurrente nuevo detectado",
    body: "Identificamos un nuevo cargo mensual: Spotify Premium $169. Si no lo reconoces, podemos ayudarte a darlo de baja.",
    when: "hace 3 h",
    haviPrompt:
      "Detectaste un cargo recurrente nuevo de Spotify. ¿Cómo verifico si es legítimo?",
  },
  {
    id: "n4",
    level: "predictive",
    title: "Si gastas como vas, terminas el mes en rojo",
    body: "Vas 38% arriba del promedio mensual. Al ritmo actual cerrarías el mes con saldo de -$430.",
    when: "ayer",
    haviPrompt:
      "Estoy gastando 38% más que el mes promedio. Muéstrame dónde está el incremento.",
  },
  {
    id: "n5",
    level: "success",
    title: "Llevas 3 semanas sin usar tu tarjeta de crédito",
    body: "Tu utilización bajó del 82% al 64%. Si mantienes el ritmo, recuperas tu score buró este trimestre.",
    when: "hace 2 días",
    haviPrompt: "Cuéntame el impacto de bajar mi utilización de crédito.",
  },
  {
    id: "n6",
    level: "warning",
    title: "Pago de crédito vence en 3 días",
    body: "Tu pago mínimo es $1,200. Pagar el saldo total ($4,850) te ahorraría $89 en intereses este mes.",
    when: "hace 3 días",
    haviPrompt: "¿Me conviene pagar el saldo total o sólo el mínimo de mi tarjeta?",
  },
] as const;

const LEVEL_META: Record<
  NotifLevel,
  { icon: LucideIcon; chipBg: string; chipFg: string; label: string }
> = {
  predictive: {
    icon: Sparkles,
    chipBg: "rgba(176, 132, 255, 0.16)",
    chipFg: "#B084FF",
    label: "Predictivo",
  },
  warning: {
    icon: AlertTriangle,
    chipBg: "rgba(255, 181, 71, 0.16)",
    chipFg: "#FFB547",
    label: "Atención",
  },
  info: {
    icon: Info,
    chipBg: "rgba(90, 182, 255, 0.16)",
    chipFg: "#5AB6FF",
    label: "Información",
  },
  success: {
    icon: CheckCircle,
    chipBg: "rgba(79, 229, 161, 0.16)",
    chipFg: "#4FE5A1",
    label: "Logro",
  },
};

export default function NotificacionesPage() {
  const router = useRouter();

  const askHavi = (prompt: string) => {
    router.push(`/app?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <PageTransition from="right">
      <div className="lg:hidden">
        <AppHeader title="Notificaciones" />
      </div>
      <section className="hey-app-frame flex flex-col gap-2 px-4 py-6 lg:px-8 lg:py-10">
        <p className="hey-eyebrow">Buzón de HAVI</p>
        <h1 className="font-serif text-[28px] font-bold leading-tight text-hey-fg-1 lg:text-[36px]">
          Notificaciones
        </h1>
        <p className="mt-1 text-[14px] leading-snug text-hey-fg-2">
          Alertas predictivas y avisos sobre tu cuenta. Toca una para hablarlo
          con HAVI antes de que pase.
        </p>
      </section>

      <section className="hey-app-frame flex flex-col gap-3 px-4 pb-12 lg:px-8">
        {NOTIFICATIONS.map((n, i) => (
          <NotificationCard
            key={n.id}
            notification={n}
            index={i}
            onAskHavi={() => askHavi(n.haviPrompt)}
          />
        ))}
      </section>
    </PageTransition>
  );
}

function NotificationCard({
  notification,
  index,
  onAskHavi,
}: {
  notification: Notification;
  index: number;
  onAskHavi: () => void;
}) {
  const meta = LEVEL_META[notification.level];
  const Icon = meta.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
      className="group flex flex-col gap-3 rounded-hey-md border border-hey-divider bg-hey-surface-1 p-4 transition hover:border-hey-fg-3"
    >
      <header className="flex items-start gap-3">
        <div
          aria-hidden
          className="flex h-9 w-9 flex-none items-center justify-center rounded-hey-pill"
          style={{ background: meta.chipBg, color: meta.chipFg }}
        >
          <Icon size={16} strokeWidth={2.2} />
        </div>
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span
              className="rounded-hey-pill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ background: meta.chipBg, color: meta.chipFg }}
            >
              {meta.label}
            </span>
            <span className="text-[11px] text-hey-fg-3">{notification.when}</span>
          </div>
          <h2 className="font-serif text-[15px] font-semibold leading-tight text-hey-fg-1 lg:text-[16px]">
            {notification.title}
          </h2>
        </div>
      </header>

      <p className="text-[13px] leading-snug text-hey-fg-2">{notification.body}</p>

      <button
        type="button"
        onClick={onAskHavi}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-hey-pill bg-hey-blue px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-hey-blue-hover active:opacity-80"
      >
        <MessageSquare size={14} strokeWidth={2.4} />
        Habla con HAVI
      </button>
    </motion.article>
  );
}
