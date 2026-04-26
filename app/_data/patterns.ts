// HAVI pattern dictionary — persona-aware. Catch-all MUST be last.

import type { Persona } from "./personas";
import type { HaviResponse } from "./types";

const id = () => `m-${Math.random().toString(36).slice(2, 10)}`;

type Pattern = {
  match: RegExp;
  reply: (input: string, persona: Persona) => HaviResponse;
};

const patterns: Pattern[] = [
  {
    match: /\btransfer(ir|encia)|enviar(\s+a)?\b/iu,
    reply: () => ({ from: "havi", kind: "transfer", recipient: "Mariana", amount: 500 }),
  },
  {
    match: /\bsaldo|cu[áa]nto tengo|balance\b/iu,
    reply: () => ({ from: "havi", kind: "snapshot" }),
  },
  {
    match: /\bgast(é|amos|o|aste|os)|en qu[ée] gast|gasto del mes\b/iu,
    reply: (_, persona) => ({
      from: "havi",
      kind: "actions",
      text: `Llevas $${persona.snapshot.spentThisMonth.toLocaleString("es-MX")} este mes. ¿Cómo quieres verlo?`,
      actions: [
        { label: "Ver gráfica", target: "/app/grafica/general" },
        { label: "Movimientos", target: "/app/movimientos" },
        { label: "Comparar vs mes pasado", target: "/app/comparativa" },
      ],
    }),
  },
  {
    match: /\bpagar(\s+(la\s+)?tarjeta)?|fecha de corte|vence\b/iu,
    reply: (_, persona) => {
      const alert =
        persona.alerts["tarjeta-vence"] ??
        persona.alerts["servicios-altos"] ??
        Object.values(persona.alerts)[0];
      return alert
        ? { from: "havi", kind: "alert", alert }
        : { from: "havi", kind: "fallback" };
    },
  },
  {
    match: /\bmeta|ahorr(o|ar|amos)|presupuesto\b/iu,
    reply: (_, persona) => {
      const alert =
        persona.alerts["meta-ahorro"] ??
        persona.alerts["ahorro-establecido"] ??
        persona.alerts["beca-llego"] ??
        Object.values(persona.alerts)[0];
      return alert
        ? { from: "havi", kind: "alert", alert }
        : { from: "havi", kind: "fallback" };
    },
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
    reply: (_, persona) => {
      const alert =
        persona.alerts["gasto-comida-alto"] ??
        persona.alerts["limite-cerca"] ??
        persona.alerts["ahorra-tip"] ??
        Object.values(persona.alerts)[0];
      return alert
        ? { from: "havi", kind: "alert", alert }
        : { from: "havi", kind: "fallback" };
    },
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
  // Catch-all — MUST be last.
  {
    match: /.*/u,
    reply: () => ({ from: "havi", kind: "fallback" }),
  },
];

export function dispatchHavi(input: string, persona: Persona): HaviResponse {
  for (const p of patterns) {
    if (p.match.test(input)) return p.reply(input, persona);
  }
  return { from: "havi", kind: "fallback" };
}

export function newMessageId(): string {
  return id();
}
