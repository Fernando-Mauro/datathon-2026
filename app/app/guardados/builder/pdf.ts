// Generación de PDF client-side: captura cada bloque como canvas via
// html2canvas, los pega en un PDF de jsPDF, y dispara descarga.
//
// Estrategia: 1 bloque por sección (no necesariamente por página).
// Si un bloque no cabe en lo que queda de la página actual, salta a la siguiente.

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Args = {
  title: string;
  chartElements: HTMLElement[];
};

const PAGE_MARGIN = 36; // pt (~12.7mm)
const TITLE_PT = 22;
const SUBTITLE_PT = 11;
const GAP = 24; // pt entre bloques

export async function generateReportPdf({ title, chartElements }: Args): Promise<void> {
  const pdf = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  // ─── Página de portada — fondo BLANCO, texto oscuro ───
  // jsPDF pinta blanco por default, no necesitamos rect explícito.
  pdf.setTextColor(20, 20, 20);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(TITLE_PT);
  pdf.text(title || "Reporte", PAGE_MARGIN, PAGE_MARGIN + TITLE_PT);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(SUBTITLE_PT);
  pdf.setTextColor(120, 120, 120);
  const subtitle = `Generado ${new Date().toLocaleString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })} · ${chartElements.length} ${chartElements.length === 1 ? "bloque" : "bloques"}`;
  pdf.text(subtitle, PAGE_MARGIN, PAGE_MARGIN + TITLE_PT + 18);

  // Línea divisoria
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.line(
    PAGE_MARGIN,
    PAGE_MARGIN + TITLE_PT + 30,
    pageWidth - PAGE_MARGIN,
    PAGE_MARGIN + TITLE_PT + 30,
  );

  let cursorY = PAGE_MARGIN + TITLE_PT + 50;

  for (let i = 0; i < chartElements.length; i++) {
    const el = chartElements[i];
    if (!el) continue;

    // Captura como canvas — fondo blanco con tema "print":
    // - bg de la card → blanco
    // - axis/labels/títulos del chart → texto oscuro
    // - grid/divisores → gris claro
    // Los colores DE LOS DATOS (bars/lines/pies) se respetan, son los que
    // identifican la información.
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: 1200,
      imageTimeout: 15000,
      onclone: (_clonedDoc, clonedEl) => {
        // Inyecta CSS print-mode en el clon. !important para ganar a los
        // attributes inline que pone Nivo via theme prop.
        const style = clonedEl.ownerDocument!.createElement("style");
        style.textContent = `
          [data-chart-block],
          [data-chart-block] .bg-hey-surface-2 {
            background: #ffffff !important;
            border: 1px solid #e5e5e5 !important;
          }
          [data-chart-block] h3,
          [data-chart-block] .text-hey-fg-1 {
            color: #1a1a1a !important;
          }
          [data-chart-block] .text-hey-fg-2,
          [data-chart-block] .text-hey-fg-3,
          [data-chart-block] .hey-eyebrow {
            color: #6a6a6a !important;
          }
          /* Nivo theme — todos los textos del chart a oscuro */
          [data-chart-block] svg text {
            fill: #4a4a4a !important;
          }
          /* Nivo grid + axis lines a gris claro */
          [data-chart-block] svg line[stroke^="rgba(255"],
          [data-chart-block] svg path[stroke^="rgba(255"] {
            stroke: rgba(0,0,0,0.10) !important;
          }
          /* Las bordes de los arcos del pie deben ser blancos para separar slices */
          [data-chart-block] svg path[stroke="#1A1A1A"],
          [data-chart-block] svg path[stroke="#1a1a1a"],
          [data-chart-block] svg rect[stroke="#1A1A1A"],
          [data-chart-block] svg rect[stroke="#1a1a1a"] {
            stroke: #ffffff !important;
          }
        `;
        clonedEl.appendChild(style);
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const aspect = canvas.height / canvas.width;
    const drawWidth = contentWidth;
    const drawHeight = drawWidth * aspect;

    // ¿Cabe en la página actual?
    const remaining = pageHeight - PAGE_MARGIN - cursorY;
    if (drawHeight + (i === 0 ? 0 : GAP) > remaining) {
      pdf.addPage();
      cursorY = PAGE_MARGIN;
    } else if (i > 0) {
      cursorY += GAP;
    }

    // Si el bloque es más alto que una página entera, escala para que quepa
    const maxHeightThisPage = pageHeight - PAGE_MARGIN - cursorY;
    let finalWidth = drawWidth;
    let finalHeight = drawHeight;
    if (drawHeight > maxHeightThisPage) {
      const scaleDown = maxHeightThisPage / drawHeight;
      finalHeight = drawHeight * scaleDown;
      finalWidth = drawWidth * scaleDown;
    }

    pdf.addImage(imgData, "PNG", PAGE_MARGIN, cursorY, finalWidth, finalHeight);
    cursorY += finalHeight;
  }

  // ─── Descargar ───
  const safeTitle = (title || "reporte")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `${safeTitle || "reporte"}-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
}
