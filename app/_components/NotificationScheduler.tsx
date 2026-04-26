"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePersona } from "@/app/_hooks/usePersona";
import { listNotifications, type NotificationItem } from "@/app/_lib/api";

// Solo agendamos toasts para notifs que caigan dentro de los próximos
// 30 minutos — más allá no tiene sentido mantener timers vivos.
const HORIZON_MS = 30 * 60 * 1000;

/**
 * Al cambiar la persona activa, fetchea TODAS sus notifs y agenda toasts
 * con setTimeout para las futuras dentro de HORIZON_MS. Las pasadas no
 * se tocan (la página /app/notificaciones las muestra como "ya pasaron").
 *
 * Cancela todos los timers cuando cambia la persona o se desmonta.
 */
export function NotificationScheduler() {
  const { persona, hydrated } = usePersona();
  const router = useRouter();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Guardrail anti doble-toast cuando React StrictMode monta dos veces.
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!hydrated || !persona) return;

    const userId = persona.id;
    let cancelled = false;

    void (async () => {
      let items: NotificationItem[] = [];
      try {
        items = await listNotifications(userId);
      } catch (err) {
        console.error("[scheduler] failed to load notifications", err);
        return;
      }
      if (cancelled) return;

      const now = Date.now();
      for (const n of items) {
        const at = new Date(n.scheduledAt).getTime();
        const delay = at - now;
        if (delay <= 0 || delay > HORIZON_MS) continue;
        if (firedRef.current.has(n.id)) continue;

        const t = setTimeout(() => {
          firedRef.current.add(n.id);
          toast(n.title, {
            description: n.body,
            duration: 8000,
            action: {
              label: "Habla con HAVI",
              onClick: () => router.push(`/app?notif=${encodeURIComponent(n.id)}`),
            },
          });
        }, delay);
        timersRef.current.push(t);
      }
    })();

    return () => {
      cancelled = true;
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current = [];
      firedRef.current = new Set();
    };
  }, [persona, hydrated, router]);

  return null;
}
