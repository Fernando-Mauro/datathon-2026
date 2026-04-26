"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Info,
  MessageSquare,
  RefreshCw,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppHeader } from "@/app/_components/AppHeader";
import { PageTransition } from "@/app/_components/PageTransition";
import { useActivePersona } from "@/app/_hooks/usePersona";
import {
  listNotifications,
  type NotificationItem,
  type NotificationKind,
} from "@/app/_lib/api";

type KindMeta = {
  icon: LucideIcon;
  chipBg: string;
  chipFg: string;
  label: string;
};

const KIND_META: Record<NotificationKind, KindMeta> = {
  cashflow_risk: {
    icon: TrendingDown,
    chipBg: "rgba(255, 107, 107, 0.16)",
    chipFg: "#FF6B6B",
    label: "Predictivo",
  },
  suscripcion_subio: {
    icon: AlertTriangle,
    chipBg: "rgba(255, 181, 71, 0.16)",
    chipFg: "#FFB547",
    label: "Suscripción",
  },
  regano: {
    icon: AlertCircle,
    chipBg: "rgba(255, 107, 107, 0.16)",
    chipFg: "#FF6B6B",
    label: "Regaño",
  },
  recurrencia: {
    icon: Info,
    chipBg: "rgba(90, 182, 255, 0.16)",
    chipFg: "#5AB6FF",
    label: "Recurrente",
  },
  anomalia: {
    icon: Sparkles,
    chipBg: "rgba(176, 132, 255, 0.16)",
    chipFg: "#B084FF",
    label: "Anomalía",
  },
};

function formatRelative(target: Date, now: Date): { label: string; isPast: boolean } {
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs <= 0;
  const abs = Math.abs(diffMs);
  const min = Math.round(abs / 60_000);
  const hr = Math.round(abs / 3_600_000);
  const day = Math.round(abs / 86_400_000);

  let label: string;
  if (abs < 60_000) label = "ahora";
  else if (min < 60) label = `${min} min`;
  else if (hr < 24) label = `${hr} h`;
  else label = `${day} d`;

  return { label: isPast ? `hace ${label}` : `en ${label}`, isPast };
}

export default function NotificacionesPage() {
  const router = useRouter();
  const persona = useActivePersona();
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Force re-render every 30s so "hace 3 min" → "hace 4 min" etc.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await listNotifications(persona.id);
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "error desconocido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persona.id]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  // `tick` se incrementa cada 30s para forzar re-cálculo de "hace 3 min" → "hace 4 min".
  // ESLint no detecta el uso intencional, así que silenciamos.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => new Date(), [tick]);

  const askHavi = (notifId: string) => {
    router.push(`/app?notif=${encodeURIComponent(notifId)}`);
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
        {loading && <SkeletonState />}
        {error && <ErrorState error={error} />}
        {!loading && !error && items && items.length === 0 && <EmptyState />}
        {!loading && !error && items && items.length > 0 && (
          <>
            {items.map((n, i) => (
              <NotificationCard
                key={n.id}
                notification={n}
                index={i}
                now={now}
                onAskHavi={() => askHavi(n.id)}
              />
            ))}
          </>
        )}
      </section>
    </PageTransition>
  );
}

function NotificationCard({
  notification,
  index,
  now,
  onAskHavi,
}: {
  notification: NotificationItem;
  index: number;
  now: Date;
  onAskHavi: () => void;
}) {
  const meta = KIND_META[notification.kind];
  const Icon = meta.icon;
  const target = new Date(notification.scheduledAt);
  const { label: when, isPast } = formatRelative(target, now);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
      className={`group flex flex-col gap-3 rounded-hey-md border border-hey-divider bg-hey-surface-1 p-4 transition hover:border-hey-fg-3 ${
        isPast ? "" : "opacity-70"
      }`}
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
            <span className="inline-flex items-center gap-1 text-[11px] text-hey-fg-3">
              {!isPast && <Calendar size={11} strokeWidth={2.2} />}
              {when}
            </span>
          </div>
          <h2 className="font-serif text-[15px] font-semibold leading-tight text-hey-fg-1 lg:text-[16px]">
            {notification.title}
          </h2>
        </div>
      </header>

      <p className="text-[13px] leading-snug text-hey-fg-2">{notification.body}</p>

      {isPast ? (
        <button
          type="button"
          onClick={onAskHavi}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-hey-pill bg-hey-blue px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-hey-blue-hover active:opacity-80"
        >
          <MessageSquare size={14} strokeWidth={2.4} />
          Habla con HAVI
        </button>
      ) : (
        <div
          aria-disabled
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-hey-pill border border-hey-divider px-4 py-2 text-[12px] font-medium text-hey-fg-3"
        >
          <Calendar size={13} strokeWidth={2} />
          Llega {when}
        </div>
      )}
    </motion.article>
  );
}

function SkeletonState() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col gap-3 rounded-hey-md border border-hey-divider bg-hey-surface-1 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-hey-pill bg-hey-surface-2" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-3 w-20 rounded bg-hey-surface-2" />
              <div className="h-4 w-3/4 rounded bg-hey-surface-2" />
            </div>
          </div>
          <div className="h-3 w-full rounded bg-hey-surface-2" />
          <div className="h-8 w-32 rounded-hey-pill bg-hey-surface-2" />
        </div>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-hey-md border border-hey-divider bg-hey-surface-1 px-6 py-10 text-center">
      <CheckCircle size={32} strokeWidth={1.6} className="text-hey-fg-3" />
      <p className="text-[14px] font-semibold text-hey-fg-1">
        Sin notificaciones
      </p>
      <p className="text-[12px] text-hey-fg-3">
        Cuando HAVI detecte algo relevante, aparecerá aquí.
      </p>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-hey-md border border-hey-divider bg-hey-surface-1 px-6 py-10 text-center">
      <AlertCircle size={32} strokeWidth={1.6} className="text-hey-error" />
      <p className="text-[14px] font-semibold text-hey-fg-1">
        No pudimos cargar tus notificaciones
      </p>
      <p className="text-[12px] text-hey-fg-3">{error}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 inline-flex items-center gap-2 rounded-hey-pill border border-hey-divider px-3 py-1.5 text-[12px] font-medium text-hey-fg-1 hover:bg-hey-surface-2"
      >
        <RefreshCw size={12} strokeWidth={2.2} /> Reintentar
      </button>
    </div>
  );
}
