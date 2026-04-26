"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronRight, Loader2 } from "lucide-react";
import { usePersona } from "@/app/_hooks/usePersona";
import type { PersonaListItem } from "@/app/_data/persona-mapper";
import { pickPersonaAction } from "./actions";

export function PickerRow({
  item,
  index,
}: {
  item: PersonaListItem;
  index: number;
}) {
  const router = useRouter();
  const { setPersona } = usePersona();
  const [pending, start] = useTransition();

  // Dataset anónimo — el "avatar" muestra los últimos 3 dígitos del user_id
  // (e.g. USR-00001 → "001"), suficiente para diferenciar visualmente filas.
  const tail = item.id.match(/(\d+)\s*$/)?.[1] ?? item.id;
  const initials = tail.slice(-3);

  const onClick = () => {
    start(async () => {
      try {
        const full = await pickPersonaAction(item.id);
        setPersona(full);
        router.push("/app");
      } catch (err) {
        console.error("[picker] no se pudo cargar persona", err);
      }
    });
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={pending}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
      className="group flex w-full items-center gap-3 rounded-hey-md border border-hey-divider bg-hey-surface-1 px-4 py-3 text-left transition hover:border-hey-blue hover:bg-hey-surface-2 disabled:cursor-wait disabled:opacity-60"
    >
      <div
        aria-hidden
        className="flex h-11 w-11 flex-none items-center justify-center rounded-full font-serif text-[14px] font-bold"
        style={{
          background: `var(${item.avatarVar.replace(/--color-(.+)/, "--color-$1-bg")})`,
          color: `var(${item.avatarVar})`,
        }}
      >
        {initials}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <h2 className="font-serif text-[16px] font-semibold leading-tight text-hey-fg-1 truncate">
          {item.fullName}
        </h2>
        <p className="text-[12px] text-hey-fg-2 truncate">{item.headline}</p>
      </div>
      {pending ? (
        <Loader2
          size={18}
          strokeWidth={2.2}
          className="flex-none animate-spin text-hey-blue"
        />
      ) : (
        <ChevronRight
          size={18}
          strokeWidth={2.2}
          className="flex-none text-hey-fg-3 transition group-hover:text-hey-blue"
        />
      )}
    </motion.button>
  );
}
