"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Hub } from "aws-amplify/utils";
import type { Persona } from "@/app/_data/personas";

// Bumped to v2 — antes guardábamos sólo el id (string), ahora el Persona completo.
// El cambio de key invalida cualquier valor v1 sin necesidad de migración.
const KEY = "havica-active-persona-v2";

type Ctx = {
  persona: Persona | null;
  /** True once the provider has finished reading localStorage on mount.
   *  Consumers (e.g. PersonaGuard) must wait for this before deciding
   *  there's no persona — the first render is always null on the client,
   *  even when localStorage has a value. */
  hydrated: boolean;
  setPersona: (p: Persona) => void;
  clearPersona: () => void;
};

const PersonaCtx = createContext<Ctx | null>(null);

function readStored(): Persona | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persona;
  } catch {
    return null;
  }
}

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Persona | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(readStored());
    setHydrated(true);
  }, []);

  // Clear active persona on sign-out.
  useEffect(() => {
    return Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedOut") {
        try {
          window.localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
        setActive(null);
      }
    });
  }, []);

  const setPersona = useCallback((p: Persona) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
    setActive(p);
  }, []);

  const clearPersona = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setActive(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ persona: active, hydrated, setPersona, clearPersona }),
    [active, hydrated, setPersona, clearPersona],
  );

  return <PersonaCtx.Provider value={value}>{children}</PersonaCtx.Provider>;
}

export function usePersona(): Ctx {
  const ctx = useContext(PersonaCtx);
  if (!ctx) {
    throw new Error("usePersona must be used inside <PersonaProvider> (mounted in app/app/template.tsx)");
  }
  return ctx;
}

/** Convenience hook — returns the active persona OR throws if not selected.
 *  Use this in components that should only render after PersonaGuard has gated the route. */
export function useActivePersona(): Persona {
  const { persona } = usePersona();
  if (!persona) {
    throw new Error("useActivePersona called without an active persona — should be gated by <PersonaGuard>");
  }
  return persona;
}
