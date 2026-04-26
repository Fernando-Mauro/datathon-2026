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
import { getPersonaById, personas, type Persona } from "@/app/_data/personas";

const KEY = "havica-active-persona-v1";

type Ctx = {
  persona: Persona | null;
  setPersonaById: (id: string) => void;
  clearPersona: () => void;
  allPersonas: readonly Persona[];
};

const PersonaCtx = createContext<Ctx | null>(null);

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveId(readStored());
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
        setActiveId(null);
      }
    });
  }, []);

  const setPersonaById = useCallback((id: string) => {
    try {
      window.localStorage.setItem(KEY, id);
    } catch {
      /* ignore */
    }
    setActiveId(id);
  }, []);

  const clearPersona = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setActiveId(null);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      persona: getPersonaById(activeId) ?? null,
      setPersonaById,
      clearPersona,
      allPersonas: personas,
    }),
    [activeId, setPersonaById, clearPersona],
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
