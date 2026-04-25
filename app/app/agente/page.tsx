"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Headphones } from "lucide-react";
import { AppHeader } from "@/app/_components/AppHeader";
import { PageTransition } from "@/app/_components/PageTransition";

type AgentMessage = {
  id: string;
  from: "agent" | "user" | "system";
  text: string;
};

const SCRIPT: AgentMessage[] = [
  {
    id: "a1",
    from: "agent",
    text: "Hola, soy Sofía. Vi que HAVI no te entendió — ¿en qué puedo ayudarte?",
  },
];

export default function AgentePage() {
  const [phase, setPhase] = useState<"connecting" | "connected">("connecting");
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase("connected");
      setMessages(SCRIPT);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <PageTransition from="bottom">
      <AppHeader title="Agente humano" />
      <main className="hey-app-frame flex min-h-[calc(100vh-3.5rem)] flex-col px-4 py-6">
        {phase === "connecting" ? (
          <ConnectingState />
        ) : (
          <ConnectedState messages={messages} />
        )}
      </main>
    </PageTransition>
  );
}

function ConnectingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-hey-accent-cyan-bg text-hey-accent-cyan"
      >
        <Headphones size={32} strokeWidth={2} />
      </motion.div>
      <p className="font-serif text-[20px] font-semibold text-hey-fg-1">Conectando con un agente</p>
      <p className="text-[14px] text-hey-fg-2">Tiempo estimado: menos de 30 segundos</p>
    </div>
  );
}

function ConnectedState({ messages }: { messages: AgentMessage[] }) {
  return (
    <>
      <div className="mb-6 flex items-center gap-3 rounded-hey-md bg-hey-surface-2 p-4">
        <div className="relative">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-hey-accent-magenta-bg text-hey-accent-magenta font-serif font-semibold">
            SM
          </div>
          <span className="absolute right-0 bottom-0 inline-block h-3 w-3 rounded-full border-2 border-hey-bg bg-hey-success" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-hey-fg-1">Sofía Martínez</span>
          <span className="text-[12px] text-hey-success">En línea</span>
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-3">
        {messages.map((m) => (
          <li key={m.id} className="flex">
            <div className="max-w-[80%] rounded-hey-md bg-hey-surface-2 px-4 py-2.5 text-[14px] text-hey-fg-1">
              {m.text}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-hey-md border border-hey-divider px-4 py-3 text-center text-[12px] text-hey-fg-3">
        Esta conversación es decorativa — flujo real conecta a Sofía v2.
      </div>
    </>
  );
}
