"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/app/_data/types";
import { ChatMessageView } from "./ChatMessage";
import { HaviRing } from "./HaviRing";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  messages: readonly ChatMessage[];
  typing?: boolean;
};

export function MessagesList({ messages, typing }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  return (
    <div
      ref={ref}
      className="flex-1 overflow-y-auto"
      role="log"
      aria-live="polite"
    >
      <div className="hey-app-frame flex flex-col gap-4 px-4 pt-4 pb-6">
        {messages.map((m) => (
          <ChatMessageView key={m.id} message={m} />
        ))}
        {typing && (
          <div className="flex items-start gap-3">
            <HaviRing size={28} className="mt-1" />
            <div className="rounded-hey-md bg-hey-surface-2 px-3 py-2">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
