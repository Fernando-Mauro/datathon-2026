"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/app/_components/AppHeader";
import { Composer } from "@/app/_components/Composer";
import { MessagesList } from "@/app/_components/MessagesList";
import { SuggestionChips } from "@/app/_components/SuggestionChips";
import { ReportChips } from "@/app/_components/ReportChips";
import { SignOutButton } from "./SignOutButton";
import { useChatPersistence } from "@/app/_hooks/useChatPersistence";
import { useActivePersona } from "@/app/_hooks/usePersona";
import { newMessageId } from "@/app/_data/patterns";
import {
  chat,
  report,
  type ChatMessage as ApiChatMessage,
  type LastReport,
  type ReportRequest,
} from "@/app/_lib/api";
import type { ChatMessage, ReportChart } from "@/app/_data/types";

const SUGGESTIONS = [
  "¿En qué gasté esta semana?",
  "¿Cómo está mi saldo?",
  "Quiero comparar con el mes pasado",
  "Dame consejos para ahorrar",
] as const;

function buildIntro(): ChatMessage[] {
  return [
    {
      id: "intro-1",
      from: "havi",
      kind: "text",
      text: "hey, ¿en qué te ayudo hoy?",
    },
    { id: "intro-2", from: "havi", kind: "snapshot" },
  ];
}

// Aplana los mensajes de chat al formato { role, content } que espera la API.
// Sólo enviamos los `text` — los snapshots/alerts/actions del histórico viven
// como UI cards pero no aportan al LLM.
function toApiHistory(messages: ChatMessage[]): ApiChatMessage[] {
  return messages
    .filter(
      (m): m is ChatMessage & { kind: "text"; text: string } =>
        m.kind === "text" && typeof (m as { text?: unknown }).text === "string",
    )
    .map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
    }));
}

export default function ChatHome() {
  const persona = useActivePersona();
  const intro = useMemo(() => buildIntro(), []);
  // Persistence keyed by persona id — each persona has its own chat history.
  const { messages, setMessages } = useChatPersistence(intro, persona.id);
  const [typing, setTyping] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  // Último reporte mostrado — se manda al chat para que el LLM pueda modificarlo
  // ("muéstramelo por mes", "y por categoría?").
  const [lastReport, setLastReport] = useState<LastReport | undefined>(undefined);

  const pushChart = (chart: ReportChart) => {
    setMessages((prev) => [
      ...prev,
      { id: newMessageId(), from: "havi", kind: "chart", chart },
    ]);
    setLastReport({
      reportType: chart.reportType,
      chartType: chart.chartType,
      title: chart.title,
      xKey: chart.xKey,
      yKey: chart.yKey,
      series: chart.series,
      data: chart.data.slice(0, 50), // cap para no inflar el prompt
    });
  };

  const runReport = async (req: ReportRequest) => {
    setReportLoading(true);
    try {
      const chart = await report(persona.id, req);
      pushChart(chart);
    } catch (err) {
      console.error("[report] error", err);
      setMessages((prev) => [
        ...prev,
        {
          id: newMessageId(),
          from: "havi",
          kind: "text",
          text:
            err instanceof Error
              ? `No pude generar el reporte: ${err.message}`
              : "No pude generar el reporte.",
        },
      ]);
    } finally {
      setReportLoading(false);
    }
  };

  const pickReport = async (reportType: string, label: string) => {
    setMessages((prev) => [
      ...prev,
      { id: newMessageId(), from: "user", kind: "text", text: `Generar reporte: ${label}` },
    ]);
    await runReport({ reportType });
  };

  const send = async (text: string) => {
    const userMsg: ChatMessage = { id: newMessageId(), from: "user", kind: "text", text };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const history = toApiHistory([...messages, userMsg]);
      const { text: replyText, reportRequest } = await chat(
        persona.id,
        history,
        lastReport,
      );
      if (replyText) {
        setMessages((prev) => [
          ...prev,
          { id: newMessageId(), from: "havi", kind: "text", text: replyText },
        ]);
      }
      // Si el LLM emitió una tool call de generar reporte, la disparamos.
      if (reportRequest) {
        await runReport(reportRequest);
      }
    } catch (err) {
      console.error("[chat] error", err);
      setMessages((prev) => [
        ...prev,
        {
          id: newMessageId(),
          from: "havi",
          kind: "text",
          text:
            err instanceof Error
              ? `No pude conectarme: ${err.message}`
              : "No pude conectarme. Intenta de nuevo.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // ─── Auto-send via ?prompt= (de notificaciones u otras CTAs) ───────────
  // Si llega un prompt en la URL, lo dispara una sola vez y limpia el query.
  // Esperamos a que el chat haya hidratado (messages.length > 0) para no
  // dispararlo antes de tener historia previa.
  const router = useRouter();
  const searchParams = useSearchParams();
  const triggeredPromptRef = useRef<string | null>(null);
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (!promptParam) return;
    if (triggeredPromptRef.current === promptParam) return;
    if (messages.length === 0) return;
    triggeredPromptRef.current = promptParam;
    void send(promptParam);
    router.replace("/app", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, messages.length]);

  return (
    <div className="flex min-h-screen flex-col bg-hey-bg">
      {/* Mobile-only header — desktop uses SideRail. */}
      <div className="lg:hidden">
        <AppHeader trailing={<SignOutButton variant="icon" />} />
      </div>
      <MessagesList messages={messages} typing={typing || reportLoading} />
      <ReportChips onPick={pickReport} disabled={reportLoading} />
      <SuggestionChips suggestions={SUGGESTIONS} onPick={send} />
      <Composer onSend={send} />
    </div>
  );
}
