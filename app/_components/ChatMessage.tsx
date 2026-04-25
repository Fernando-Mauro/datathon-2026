"use client";

import { motion } from "motion/react";
import type { ChatMessage } from "@/app/_data/types";
import { HaviRing } from "./HaviRing";
import { SnapshotCard } from "./SnapshotCard";
import { AlertCard } from "./AlertCard";
import { ActionPill } from "./ActionPill";
import { formatMXN } from "@/app/_data/format";

type Props = { message: ChatMessage };

export function ChatMessageView({ message }: Props) {
  if (message.from === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] rounded-hey-md bg-hey-blue px-4 py-2.5 text-[15px] text-white">
          {message.kind === "text" && message.text}
        </div>
      </motion.div>
    );
  }

  // HAVI side
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex items-start gap-3"
    >
      <HaviRing size={28} className="mt-1" />
      <div className="flex max-w-[88%] flex-1 flex-col gap-3">
        {renderHavi(message)}
      </div>
    </motion.div>
  );
}

function renderHavi(message: ChatMessage & { from: "havi" }) {
  switch (message.kind) {
    case "text":
      return (
        <div className="rounded-hey-md bg-hey-surface-2 px-4 py-2.5 text-[15px] text-hey-fg-1">
          {message.text}
        </div>
      );

    case "snapshot":
      return <SnapshotCard />;

    case "actions":
      return (
        <>
          <div className="rounded-hey-md bg-hey-surface-2 px-4 py-2.5 text-[15px] text-hey-fg-1">
            {message.text}
          </div>
          <div className="flex flex-wrap gap-2">
            {message.actions.map((a) => (
              <ActionPill key={a.label} label={a.label} href={a.target} />
            ))}
          </div>
        </>
      );

    case "alert":
      return <AlertCard alert={message.alert} />;

    case "transfer":
      return (
        <div className="rounded-hey-md bg-hey-surface-2 p-5">
          <p className="hey-eyebrow mb-2">Confirma la transferencia</p>
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <span className="text-[15px] text-hey-fg-2">A {message.recipient}</span>
            <span className="hey-amount text-[26px] font-semibold text-hey-fg-1">
              {formatMXN(message.amount)}
            </span>
          </div>
          <button
            type="button"
            disabled
            className="w-full rounded-hey-pill bg-hey-blue py-3 text-[14px] font-semibold text-white opacity-90"
          >
            Continuar
          </button>
          <p className="mt-2 text-center text-[11px] text-hey-fg-3">Vista previa — flujo decorativo</p>
        </div>
      );

    case "fallback":
      return (
        <>
          <div className="rounded-hey-md bg-hey-surface-2 px-4 py-2.5 text-[15px] text-hey-fg-1">
            No entendí muy bien — ¿quieres hablar con un agente?
          </div>
          <div>
            <ActionPill label="Hablar con agente" href="/app/agente" />
          </div>
        </>
      );
  }
}
