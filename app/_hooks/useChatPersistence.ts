"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Hub } from "aws-amplify/utils";
import type { ChatMessage } from "@/app/_data/types";

const KEY_PREFIX = "havi-chat-v2-";
const VERSION = 2;

type StoredShape = {
  version: number;
  messages: ChatMessage[];
  updatedAt: string;
};

function keyFor(scope: string): string {
  return `${KEY_PREFIX}${scope}`;
}

function read(scope: string, initial: ChatMessage[]): ChatMessage[] {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(keyFor(scope));
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as StoredShape;
    if (parsed.version !== VERSION) return initial;
    return parsed.messages;
  } catch {
    return initial;
  }
}

/** Borra el chat de un scope específico. */
function clearScope(scope: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(keyFor(scope));
  } catch {
    /* ignore */
  }
}

/** Borra TODOS los chats almacenados (sign-out). */
function clearAll() {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) toRemove.push(k);
    }
    for (const k of toRemove) window.localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

/**
 * Persistencia de chat scoped por persona.
 * @param initial mensajes iniciales si no hay nada guardado para ese scope.
 * @param scope id de la persona activa — cambiar el scope re-hidrata desde
 *              su propio slot de localStorage (cada persona ve su propio chat).
 */
export function useChatPersistence(initial: ChatMessage[], scope: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const hydratedFor = useRef<string | null>(null);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-hidrata cuando cambia el scope (incluyendo el primer mount).
  useEffect(() => {
    if (hydratedFor.current === scope) return;
    hydratedFor.current = scope;
    const stored = read(scope, initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // Debounced write — sólo escribe si ya hidratamos para el scope actual,
  // para evitar pisar localStorage con el `initial` antes de leer.
  useEffect(() => {
    if (hydratedFor.current !== scope) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      try {
        const payload: StoredShape = {
          version: VERSION,
          messages,
          updatedAt: new Date().toISOString(),
        };
        window.localStorage.setItem(keyFor(scope), JSON.stringify(payload));
      } catch {
        /* quota or disabled — ignore */
      }
    }, 250);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [messages, scope]);

  // En sign-out, borra todo el historial de chats.
  useEffect(() => {
    return Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedOut") {
        clearAll();
        setMessages(initial);
      }
    });
  }, [initial]);

  const reset = useCallback(() => {
    clearScope(scope);
    setMessages(initial);
  }, [scope, initial]);

  return { messages, setMessages, reset } as const;
}
