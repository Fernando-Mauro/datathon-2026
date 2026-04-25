/* Shared primitives for V2 — minimal, conversational hey */

const { useState, useEffect, useRef } = React;

const V2Icon = ({ name, size = 22, color = "currentColor", strokeWidth = 1.75 }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "send": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "mic": return <svg {...p}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/></svg>;
    case "list": return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case "bell": return <svg {...p}><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 004 0"/></svg>;
    case "headset": return <svg {...p}><path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="2" y="14" width="5" height="6" rx="1.5"/><rect x="17" y="14" width="5" height="6" rx="1.5"/><path d="M22 17v1a3 3 0 01-3 3h-3"/></svg>;
    case "check-circle": return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>;
    case "alert": return <svg {...p}><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18v.01"/></svg>;
    case "x-circle": return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>;
    case "info": return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.01"/></svg>;
    case "plus": return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case "transfer": return <svg {...p}><path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/></svg>;
    case "card": return <svg {...p}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg>;
    case "qr": return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v3M14 21h3M21 17v4"/></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "chevron-left": return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>;
    case "chevron-right": return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case "close": return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "trend-up": return <svg {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>;
    case "trend-down": return <svg {...p}><path d="M3 7l6 6 4-4 8 8"/><path d="M14 17h7v-7"/></svg>;
    case "sparkles": return <svg {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z"/></svg>;
    case "user": return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    case "menu": return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case "wallet": return <svg {...p}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 14h2"/></svg>;
    case "coffee": return <svg {...p}><path d="M4 8h13v6a4 4 0 01-4 4H8a4 4 0 01-4-4V8z"/><path d="M17 10h2a2 2 0 010 4h-2"/><path d="M7 4v2M11 4v2M15 4v2"/></svg>;
    case "bag": return <svg {...p}><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>;
    case "uber": return <svg {...p}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 12h8"/></svg>;
    default: return null;
  }
};

const HaviOrb = ({ size = 56, animated = true, scale = 1 }) => (
  <div style={{ position: "relative", width: size, height: size, flex: "none", filter: "drop-shadow(0 0 24px rgba(180,120,255,0.35))" }}>
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: "conic-gradient(from 0deg, #FF3D5A 0deg, #FF8A3D 50deg, #FFD93D 100deg, #4FE56F 160deg, #4FD8E0 220deg, #3478F6 280deg, #B084FF 320deg, #FF3D5A 360deg)",
      animation: animated ? "haviSpin 8s linear infinite" : "none",
    }}/>
    <div style={{ position: "absolute", inset: size * 0.07, borderRadius: "50%", background: "#000" }}/>
  </div>
);

window.V2Icon = V2Icon;
window.HaviOrb = HaviOrb;
