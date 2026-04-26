"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/app/_components/AppHeader";
import { Composer } from "@/app/_components/Composer";
import { MessagesList } from "@/app/_components/MessagesList";
import { SuggestionChips } from "@/app/_components/SuggestionChips";
import { SignOutButton } from "./SignOutButton";
import { useChatPersistence } from "@/app/_hooks/useChatPersistence";
import { useActivePersona } from "@/app/_hooks/usePersona";
import { dispatchHavi, newMessageId } from "@/app/_data/patterns";
import type { ChatMessage } from "@/app/_data/types";

const SUGGESTIONS = [
  "¿En qué gasté esta semana?",
  "Pagar tarjeta",
  "Ver mis movimientos",
  "Comparar con mes anterior",
] as const;

function buildIntro(firstName: string): ChatMessage[] {
  return [
    {
      id: "intro-1",
      from: "havi",
      kind: "text",
      text: `hey, ${firstName}. ¿En qué te ayudo hoy?`,
    },
    { id: "intro-2", from: "havi", kind: "snapshot" },
  ];
}

export default function ChatHome() {
  const persona = useActivePersona();
  const intro = useMemo(() => buildIntro(persona.firstName), [persona.firstName]);
  // Persistence keyed by persona id — each persona has its own chat history.
  const { messages, setMessages } = useChatPersistence(intro);
  const [typing, setTyping] = useState(false);

  const send = (text: string) => {
    const userMsg: ChatMessage = { id: newMessageId(), from: "user", kind: "text", text };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    const delay = 800 + Math.floor(Math.random() * 700); // 800–1500ms
    window.setTimeout(() => {
      const reply = dispatchHavi(text, persona);
      const haviMsg = { ...reply, id: newMessageId() } as ChatMessage;
      setMessages((prev) => [...prev, haviMsg]);
      setTyping(false);
    }, delay);
  };

  return (
    <div className="flex min-h-screen flex-col bg-hey-bg">
      {/* Mobile-only header — desktop uses SideRail. */}
      <div className="lg:hidden">
        <AppHeader trailing={<SignOutButton variant="icon" />} />
      </div>
      <MessagesList messages={messages} typing={typing} />
      <SuggestionChips suggestions={SUGGESTIONS} onPick={send} />
      <Composer onSend={send} />
    </div>
  );
}
