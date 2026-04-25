"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Hub } from "aws-amplify/utils";
import type { ChatMessage } from "@/app/_data/types";

const KEY = "havi-chat-v1";
const VERSION = 1;

type StoredShape = {
  version: number;
  messages: ChatMessage[];
  updatedAt: string;
};

function read(initial: ChatMessage[]): ChatMessage[] {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as StoredShape;
    if (parsed.version !== VERSION) return initial;
    return parsed.messages;
  } catch {
    return initial;
  }
}

function clear() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function useChatPersistence(initial: ChatMessage[]) {
  // SSR-safe init: server renders `initial`, client hydrates and then loads from storage.
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const hydrated = useRef(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage once after mount. The setState-in-effect is
  // intentional: SSR renders `initial`, then on the client we swap to the
  // persisted state. useSyncExternalStore would be the React-canonical fix
  // but adds significant complexity for a client-only persistence hook.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = read(initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== initial) setMessages(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced write on change.
  useEffect(() => {
    if (!hydrated.current) return;
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      try {
        const payload: StoredShape = {
          version: VERSION,
          messages,
          updatedAt: new Date().toISOString(),
        };
        window.localStorage.setItem(KEY, JSON.stringify(payload));
      } catch {
        /* quota or disabled — ignore */
      }
    }, 250);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [messages]);

  // Clear on sign-out (Pitfall 8 — Hub.listen returns cleanup directly).
  useEffect(() => {
    return Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedOut") {
        clear();
        setMessages(initial);
      }
    });
  }, [initial]);

  const reset = useCallback(() => {
    clear();
    setMessages(initial);
  }, [initial]);

  return { messages, setMessages, reset } as const;
}
