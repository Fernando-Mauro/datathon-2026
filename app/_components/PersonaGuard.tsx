"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePersona } from "@/app/_hooks/usePersona";

// Skip the gate on the picker route itself — that's where you choose.
function isPickerRoute(pathname: string) {
  return pathname === "/app/personas";
}

export function PersonaGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { persona, hydrated } = usePersona();

  useEffect(() => {
    if (isPickerRoute(pathname)) return;
    if (!hydrated) return; // wait for localStorage read on mount
    if (persona) return;
    router.replace("/app/personas");
  }, [hydrated, persona, pathname, router]);

  if (!isPickerRoute(pathname) && !persona) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-hey-bg">
        <p className="text-sm text-hey-fg-2">Cargando…</p>
      </main>
    );
  }

  return <>{children}</>;
}
