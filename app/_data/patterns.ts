// HAVI pattern dictionary — pattern-match mock brain (D-48). Order matters:
// specific patterns first, catch-all (fallback) MUST be last.

import { mockAlerts } from "./mock";
import type { HaviPattern } from "./types";

const id = () => `m-${Math.random().toString(36).slice(2, 10)}`;

export const haviPatterns: HaviPattern[] = [
  {
    match: /\btransfer(ir|encia)|enviar(\s+a)?\b/iu,
    reply: () => ({
      from: "havi",
      kind: "transfer",
      recipient: "Mariana",
      amount: 500,
    }),
  },
  {
    match: /\bsaldo|cu[áa]nto tengo|balance\b/iu,
    reply: () => ({
      from: "havi",
      kind: "snapshot",
    }),
  },
  {
    match: /\bgast(é|amos|o|aste|os)|en qu[ée] gast|gasto del mes\b/iu,
    reply: () => ({
      from: "havi",
      kind: "actions",
      text: "Llevas $3,280.50 este mes. ¿Cómo quieres verlo?",
      actions: [
        { label: "Ver gráfica", target: "/app/grafica/general" },
        { label: "Movimientos", target: "/app/movimientos" },
        { label: "Comparar vs mes pasado", target: "/app/comparativa" },
      ],
    }),
  },
  {
    match: /\bpagar(\s+(la\s+)?tarjeta)?|fecha de corte|vence\b/iu,
    reply: () => ({
      from: "havi",
      kind: "alert",
      alert: mockAlerts["tarjeta-vence"],
    }),
  },
  {
    match: /\bmeta|ahorr(o|ar|amos)|presupuesto\b/iu,
    reply: () => ({
      from: "havi",
      kind: "alert",
      alert: mockAlerts["meta-ahorro"],
    }),
  },
  {
    match: /\bcomparativ(a|o)|mes (pasado|anterior)\b/iu,
    reply: () => ({
      from: "havi",
      kind: "actions",
      text: "Te comparo este mes vs el anterior.",
      actions: [{ label: "Ver comparativa", target: "/app/comparativa" }],
    }),
  },
  {
    match: /\bmovimientos|histor(ial|ia)|transacciones\b/iu,
    reply: () => ({
      from: "havi",
      kind: "actions",
      text: "Estos son tus últimos movimientos.",
      actions: [{ label: "Ver movimientos", target: "/app/movimientos" }],
    }),
  },
  {
    match: /\bcomida|caf[ée]|restaurante|sushi\b/iu,
    reply: () => ({
      from: "havi",
      kind: "alert",
      alert: mockAlerts["gasto-comida-alto"],
    }),
  },
  {
    match: /\bayuda|qué puedes hacer|funciones\b/iu,
    reply: () => ({
      from: "havi",
      kind: "text",
      text:
        "Puedo mostrarte tu saldo, gastos por categoría, comparativas mensuales, " +
        "alertas y movimientos. También conectarte con un agente humano si lo necesitas.",
    }),
  },
  // Catch-all — MUST be last. Surfaces handoff to human agent.
  {
    match: /.*/u,
    reply: () => ({
      from: "havi",
      kind: "fallback",
    }),
  },
];

export function dispatchHavi(input: string): { kind: string; payload: ReturnType<HaviPattern["reply"]> } {
  for (const p of haviPatterns) {
    if (p.match.test(input)) {
      return { kind: "matched", payload: p.reply(input) };
    }
  }
  // Should never reach (catch-all is last) but just in case:
  return {
    kind: "matched",
    payload: { from: "havi", kind: "fallback" },
  };
}

export function newMessageId(): string {
  return id();
}
