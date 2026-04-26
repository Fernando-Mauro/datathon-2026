"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import outputs from "@/amplify_outputs.json";
import type { ChartType, ReportChart } from "@/app/_data/types";

// `apiUrl` lo escribe `amplify/backend.ts` vía `backend.addOutput`.
// Si todavía no has corrido `npx ampx sandbox`, el campo no existe.
const API_URL: string | undefined = (outputs as { custom?: { apiUrl?: string } })
  .custom?.apiUrl;

export type ChatMessage = { role: "user" | "assistant"; content: string };

async function authedFetch(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<Response> {
  if (!API_URL) {
    throw new Error(
      "API URL no configurada. Corre `npx ampx sandbox` para deployar el backend y regenerar amplify_outputs.json.",
    );
  }
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    throw new Error("No hay sesión de Cognito. Reinicia sesión.");
  }
  return fetch(`${API_URL}${path}`, {
    method: init?.method ?? "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

export type LastReport = {
  reportType: string;
  chartType: string;
  title: string;
  xKey: string;
  yKey: string;
  series?: string[];
  /** Filas del reporte — el LLM las usa para responder preguntas factuales
   *  sin tener que regenerar la gráfica. Capeado a 50 filas en el cliente. */
  data: Array<Record<string, unknown>>;
};

export type ReportRequest = {
  reportType: string;
  chartType?: ChartType;
  freeformDescription?: string;
};

export type ChatResponse = {
  text: string;
  reportRequest?: ReportRequest;
};

export async function chat(
  personaUserId: string,
  messages: ChatMessage[],
  lastReport?: LastReport,
): Promise<ChatResponse> {
  const res = await authedFetch("/chat", {
    body: { personaUserId, messages, lastReport },
  });
  if (!res.ok) {
    throw new Error(`chat failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return res.json();
}

export async function report(
  personaUserId: string,
  req: ReportRequest,
): Promise<ReportChart> {
  const res = await authedFetch("/report", { body: { personaUserId, ...req } });
  if (!res.ok) {
    throw new Error(`report failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return res.json();
}

// ─── Saved charts ────────────────────────────────────────────────────────

export type SavedChartMeta = {
  id: string;
  title: string;
  createdAt: string;
};

/** Snapshot completo de un chart guardado — re-rendereable. */
export type SavedChart = ReportChart & {
  id: string;
  personaUserId: string;
  createdAt: string;
};

export async function saveChart(
  personaUserId: string,
  chart: ReportChart,
): Promise<SavedChartMeta> {
  const res = await authedFetch("/save-chart", {
    body: {
      personaUserId,
      title: chart.title,
      reportType: chart.reportType,
      chartType: chart.chartType,
      xKey: chart.xKey,
      yKey: chart.yKey,
      series: chart.series,
      data: chart.data,
      sql: chart.sql,
      source: chart.source,
    },
  });
  if (!res.ok) {
    throw new Error(`save failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  return res.json();
}

export async function listSavedCharts(
  personaUserId?: string,
): Promise<SavedChart[]> {
  const path = personaUserId
    ? `/saved-charts?personaUserId=${encodeURIComponent(personaUserId)}`
    : "/saved-charts";
  const res = await authedFetch(path, { method: "GET" });
  if (!res.ok) {
    throw new Error(`list failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as { items: SavedChart[] };
  return json.items;
}

export async function deleteSavedChart(id: string): Promise<void> {
  const res = await authedFetch(`/saved-charts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`delete failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
}
