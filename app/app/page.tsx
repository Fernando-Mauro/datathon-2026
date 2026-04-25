"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { AppHeader } from "@/app/_components/AppHeader";
import { Composer } from "@/app/_components/Composer";
import { MessagesList } from "@/app/_components/MessagesList";
import { SuggestionChips } from "@/app/_components/SuggestionChips";
import { SignOutButton } from "./SignOutButton";
import { useChatPersistence } from "@/app/_hooks/useChatPersistence";
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
  const { user } = useAuthenticator(({ user }) => [user]);
  const email = user?.signInDetails?.loginId;
  const [firstName, setFirstName] = useState<string>("amigo");

  // Resolve greeting from Cognito name → email local-part → "amigo".
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const attrs = await fetchUserAttributes();
        if (cancelled) return;
        const name = attrs.name?.trim().split(/\s+/)[0];
        if (name) {
          setFirstName(name);
          return;
        }
      } catch {
        /* fall through to fallbacks */
      }
      if (cancelled) return;
      const local = email?.split("@")[0];
      if (local) setFirstName(local);
    })();
    return () => {
      cancelled = true;
    };
  }, [email]);

  const intro = useMemo(() => buildIntro(firstName), [firstName]);
  const { messages, setMessages } = useChatPersistence(intro);
  const [typing, setTyping] = useState(false);

  // Refresh greeting in the intro message when firstName resolves post-mount.
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) return buildIntro(firstName);
      const first = prev[0];
      if (first.from === "havi" && first.kind === "text" && first.id === "intro-1") {
        const next: ChatMessage[] = [...prev];
        next[0] = {
          id: "intro-1",
          from: "havi",
          kind: "text",
          text: `hey, ${firstName}. ¿En qué te ayudo hoy?`,
        };
        return next;
      }
      return prev;
    });
  }, [firstName, setMessages]);

  const send = (text: string) => {
    const userMsg: ChatMessage = {
      id: newMessageId(),
      from: "user",
      kind: "text",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    const delay = 800 + Math.floor(Math.random() * 700); // 800–1500ms
    window.setTimeout(() => {
      const dispatched = dispatchHavi(text);
      const haviMsg = { ...dispatched.payload, id: newMessageId() } as ChatMessage;
      setMessages((prev) => [...prev, haviMsg]);
      setTyping(false);
    }, delay);
  };

  return (
    <div className="flex min-h-screen flex-col bg-hey-bg">
      {/* Mobile-only header — desktop uses SideRail (template.tsx) for chrome. */}
      <div className="lg:hidden">
        <AppHeader trailing={<SignOutButton variant="icon" />} />
      </div>
      <MessagesList messages={messages} typing={typing} />
      <SuggestionChips suggestions={SUGGESTIONS} onPick={send} />
      <Composer onSend={send} />
    </div>
  );
}
