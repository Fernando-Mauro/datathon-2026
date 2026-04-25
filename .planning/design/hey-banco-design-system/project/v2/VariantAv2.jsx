/* Variante A v2 — Conversacional avanzado
   - Handoff a agente humano cuando HAVI no entiende
   - Botones que llevan a pantallas/gráficas
   - Transiciones animadas entre vistas
   - Tarjetas alert / success / warning
   - Tipografía formal (IBM Plex)
*/

const { useState, useEffect, useRef } = React;

const FONT_STACK = '"IBM Plex Sans", "Inter", system-ui, sans-serif';
const FONT_SERIF = '"IBM Plex Serif", Georgia, serif';

const VariantAv2 = () => {
  const [view, setView] = useState({ kind: "chat" }); // {kind:'chat'} | {kind:'screen', name, from} | {kind:'agent'}

  const goTo = (screen) => setView({ kind: "screen", name: screen });
  const back = () => setView({ kind: "chat" });
  const toAgent = () => setView({ kind: "agent" });

  return (
    <div style={{
      height: "100%", background: "#000", color: "#fff",
      fontFamily: FONT_STACK, position: "relative", overflow: "hidden",
      paddingTop: 50
    }}>
      {/* Chat layer */}
      <Slide visible={view.kind === "chat"}>
        <ChatScreen onNavigate={goTo} onAgent={toAgent}/>
      </Slide>

      {/* Sub-screens */}
      <Slide visible={view.kind === "screen"} from="right">
        {view.kind === "screen" && <SubScreen name={view.name} onBack={back}/>}
      </Slide>

      {/* Human agent */}
      <Slide visible={view.kind === "agent"} from="bottom">
        {view.kind === "agent" && <HumanAgentScreen onBack={back}/>}
      </Slide>
    </div>
  );
};

/* ---------- Slide transition wrapper ---------- */
const Slide = ({ visible, from = "right", children }) => {
  const [mounted, setMounted] = useState(visible);
  useEffect(() => {
    if (visible) setMounted(true);
    else { const t = setTimeout(() => setMounted(false), 320); return () => clearTimeout(t); }
  }, [visible]);
  if (!mounted) return null;
  const dir = from === "right" ? "translateX(100%)" : from === "bottom" ? "translateY(100%)" : "translateX(-100%)";
  return (
    <div style={{
      position: "absolute", inset: 0, paddingTop: 50,
      transform: visible ? "translate(0,0)" : dir,
      opacity: visible ? 1 : 0.4,
      transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1), opacity 320ms ease",
      background: "#000", zIndex: visible ? 2 : 1, willChange: "transform"
    }}>
      {children}
    </div>
  );
};

/* ---------- Chat screen ---------- */
const ChatScreen = ({ onNavigate, onAgent }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, from: "havi", kind: "intro", text: "Hola, Fernando. ¿En qué te ayudo hoy?" },
    { id: 2, from: "havi", kind: "snapshot",
      data: {
        balance: 12450.30, spent: 3280.50, spentPct: 32, topCat: "Comida",
        sparkline: [40, 38, 42, 35, 50, 45, 60, 55, 48, 62, 58, 70, 65, 72]
      }
    }
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const suggestions = [
    "¿En qué gasté esta semana?",
    "Transferir a Mariana",
    "Pagar mi tarjeta",
    "Movimientos recientes"
  ];

  const send = (text) => {
    const t = (text || input).trim();
    if (!t) return;
    setMessages(m => [...m, { id: Date.now(), from: "user", text: t }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const id = Date.now() + 1;
      let reply;
      if (/transferir|mandar|enviar/i.test(t)) {
        reply = { id, from: "havi", kind: "transfer-card", amount: 500, to: "Mariana López" };
      } else if (/gast/i.test(t)) {
        reply = { id, from: "havi", kind: "spend-actions" };
      } else if (/movimient/i.test(t)) {
        reply = { id, from: "havi", kind: "screen-action", title: "Tus movimientos recientes", subtitle: "Encontré 24 transacciones esta semana", screen: "transactions", icon: "list" };
      } else if (/tarjeta|pagar/i.test(t)) {
        reply = { id, from: "havi", kind: "alert-card", level: "warning", title: "Tu tarjeta vence en 6 días",
          body: "Paga $4,820.00 para no generar intereses.",
          actions: [{ label: "Pagar ahora", primary: true, screen: "card-pay" }, { label: "Ver detalle", screen: "card-detail" }] };
      } else if (/saldo|cuenta/i.test(t)) {
        reply = { id, from: "havi", kind: "screen-action", title: "Cuenta principal", subtitle: "$12,450.30 disponibles", screen: "account", icon: "wallet" };
      } else if (/ahorr|meta|presupuesto/i.test(t)) {
        reply = { id, from: "havi", kind: "alert-card", level: "success", title: "¡Vas adelante en tu meta!",
          body: "Has ahorrado $1,840 este mes — 32% sobre lo planeado.",
          actions: [{ label: "Ver mis metas", screen: "goals", primary: true }] };
      } else {
        // No entiende → ofrece handoff
        reply = { id, from: "havi", kind: "fallback" };
      }
      setMessages(m => [...m, reply]);
    }, 800);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HaviOrb size={28} animated={true}/>
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "0.02em" }}>HAVI</span>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <V2Icon name="user" size={16}/>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map(m => <MessageBubble key={m.id} msg={m} onNavigate={onNavigate} onAgent={onAgent}/>)}
        {typing && <TypingIndicator/>}
      </div>

      <div style={{ padding: "0 16px 10px", display: "flex", gap: 8, overflowX: "auto", flex: "none" }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => send(s)} style={{
            flex: "none", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999,
            padding: "8px 14px", fontSize: 12, fontFamily: FONT_STACK, cursor: "pointer", whiteSpace: "nowrap",
            letterSpacing: "0.01em"
          }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: "8px 16px 24px", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#141414", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 6px 6px 18px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Pregúntale a HAVI..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: FONT_STACK, padding: "8px 0", letterSpacing: "0.01em" }}/>
          <button onClick={() => send()} style={{
            width: 38, height: 38, borderRadius: "50%",
            background: input.trim() ? "#3478F6" : "transparent",
            border: input.trim() ? "none" : "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", cursor: "pointer", flex: "none", transition: "background 200ms"
          }}>
            <V2Icon name="send" size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Typing indicator ---------- */
const TypingIndicator = () => (
  <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: "#1A1A1A", padding: "12px 16px", borderRadius: 18, borderBottomLeftRadius: 6, animation: "fadeInUp 240ms ease both" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.5)",
        animation: `dotPulse 1.2s ${i * 0.15}s infinite ease-in-out`
      }}/>
    ))}
  </div>
);

/* ---------- Message bubble (with new card types) ---------- */
const MessageBubble = ({ msg, onNavigate, onAgent }) => {
  const enterStyle = { animation: "fadeInUp 280ms cubic-bezier(0.32, 0.72, 0, 1) both" };

  if (msg.from === "user") {
    return (
      <div style={{
        ...enterStyle,
        alignSelf: "flex-end", maxWidth: "78%",
        background: "#3478F6", color: "#fff",
        padding: "10px 14px", borderRadius: 18, borderBottomRightRadius: 6,
        fontSize: 14, lineHeight: 1.45, letterSpacing: "0.01em"
      }}>{msg.text}</div>
    );
  }

  if (msg.kind === "intro") {
    return (
      <div style={{ ...enterStyle, alignSelf: "flex-start", padding: "8px 4px", color: "#fff", fontSize: 22, fontWeight: 500, fontFamily: FONT_SERIF, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
        {msg.text}
      </div>
    );
  }

  if (msg.kind === "snapshot") {
    const d = msg.data;
    const max = Math.max(...d.sparkline);
    return (
      <div style={{ ...enterStyle, alignSelf: "stretch", background: "linear-gradient(180deg, #131313 0%, #0a0a0a 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
        <Eyebrow>Saldo total</Eyebrow>
        <div style={{ fontSize: 32, fontWeight: 600, fontFamily: FONT_SERIF, letterSpacing: "-0.02em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>${d.balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div>
        <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Eyebrow>Gastaste esta semana</Eyebrow>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: "#FF6FD3", fontVariantNumeric: "tabular-nums", fontFamily: FONT_SERIF }}>${d.spent.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>↑ {d.spentPct}%</span>
            </div>
          </div>
          <svg width="100" height="40" viewBox="0 0 100 40" style={{ flex: "none" }}>
            <defs>
              <linearGradient id="spkA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FF6FD3" stopOpacity="0.6"/>
                <stop offset="1" stopColor="#FF6FD3" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polyline points={d.sparkline.map((v, i) => `${(i/(d.sparkline.length-1))*100},${40 - (v/max)*32 - 4}`).join(" ")} fill="none" stroke="#FF6FD3" strokeWidth="1.8" strokeLinecap="round"/>
            <polygon points={`0,40 ${d.sparkline.map((v, i) => `${(i/(d.sparkline.length-1))*100},${40 - (v/max)*32 - 4}`).join(" ")} 100,40`} fill="url(#spkA)"/>
          </svg>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <ActionPill icon="trend-up" label="Ver gráfica" onClick={() => onNavigate("spend-chart")}/>
          <ActionPill icon="list" label="Movimientos" onClick={() => onNavigate("transactions")}/>
        </div>
      </div>
    );
  }

  if (msg.kind === "spend-actions") {
    return (
      <div style={{ ...enterStyle, alignSelf: "stretch" }}>
        <div style={{ background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
          <Eyebrow>Tu gasto esta semana</Eyebrow>
          <div style={{ fontSize: 26, fontWeight: 600, fontFamily: FONT_SERIF, letterSpacing: "-0.02em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>$3,280.50</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6, lineHeight: 1.5 }}>
            La mayor parte fue en <strong style={{ color: "#fff", fontWeight: 500 }}>Comida</strong> ($1,240). ¿Cómo lo quieres ver?
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <BigActionButton icon="trend-up" label="Gráfica por categoría" onClick={() => onNavigate("spend-chart")}/>
          <BigActionButton icon="list" label="Lista de movimientos" onClick={() => onNavigate("transactions")}/>
          <BigActionButton icon="calendar" label="Comparar vs mes anterior" onClick={() => onNavigate("compare")}/>
          <BigActionButton icon="bell" label="Crear alerta de gasto" onClick={() => onNavigate("alert-create")}/>
        </div>
      </div>
    );
  }

  if (msg.kind === "screen-action") {
    return (
      <div style={{ ...enterStyle, alignSelf: "stretch" }}>
        <button onClick={() => onNavigate(msg.screen)} style={{
          width: "100%", textAlign: "left", background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
          color: "#fff", fontFamily: FONT_STACK
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(52,120,246,0.16)", color: "#3478F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <V2Icon name={msg.icon || "list"} size={22} color="#3478F6"/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{msg.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{msg.subtitle}</div>
          </div>
          <V2Icon name="chevron-right" size={18} color="rgba(255,255,255,0.4)"/>
        </button>
      </div>
    );
  }

  if (msg.kind === "alert-card") {
    const palette = {
      success: { bg: "rgba(79,229,161,0.08)", border: "rgba(79,229,161,0.32)", icon: "check-circle", color: "#4FE5A1" },
      warning: { bg: "rgba(255,181,71,0.08)", border: "rgba(255,181,71,0.32)", icon: "alert", color: "#FFB547" },
      error:   { bg: "rgba(255,107,107,0.08)", border: "rgba(255,107,107,0.32)", icon: "x-circle", color: "#FF6B6B" },
      info:    { bg: "rgba(52,120,246,0.08)", border: "rgba(52,120,246,0.32)", icon: "info", color: "#3478F6" }
    }[msg.level || "info"];
    return (
      <div style={{
        ...enterStyle, alignSelf: "stretch",
        background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 20, padding: 18
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${palette.color}29`, color: palette.color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <V2Icon name={palette.icon} size={20} color={palette.color}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#fff", fontFamily: FONT_SERIF, letterSpacing: "-0.005em" }}>{msg.title}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4, lineHeight: 1.5 }}>{msg.body}</div>
          </div>
        </div>
        {msg.actions && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {msg.actions.map((a, i) => (
              <button key={i} onClick={() => onNavigate(a.screen)} style={{
                flex: 1, padding: "10px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500, fontFamily: FONT_STACK,
                cursor: "pointer", border: a.primary ? "none" : `1px solid ${palette.border}`,
                background: a.primary ? palette.color : "transparent",
                color: a.primary ? "#000" : "#fff"
              }}>{a.label}</button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (msg.kind === "transfer-card") {
    return (
      <div style={{ ...enterStyle, alignSelf: "stretch", background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
        <Eyebrow>Confirma la transferencia</Eyebrow>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(176,132,255,0.16)", color: "#B084FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontFamily: FONT_SERIF }}>M</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{msg.to}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Frecuente</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, fontFamily: FONT_SERIF, fontVariantNumeric: "tabular-nums" }}>${msg.amount}</div>
        </div>
        <button onClick={() => onNavigate("transfer-confirm")} style={{ width: "100%", marginTop: 14, background: "#3478F6", color: "#fff", border: "none", borderRadius: 999, padding: 12, fontFamily: FONT_STACK, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Continuar
        </button>
      </div>
    );
  }

  if (msg.kind === "fallback") {
    return (
      <div style={{ ...enterStyle, alignSelf: "stretch" }}>
        <div style={{ background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, fontFamily: FONT_STACK }}>
            No estoy seguro de cómo ayudarte con eso. ¿Quieres hablar con uno de nuestros agentes?
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={onAgent} style={{
              flex: 1, padding: "10px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500, fontFamily: FONT_STACK,
              cursor: "pointer", border: "none", background: "#3478F6", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
              <V2Icon name="headset" size={15}/> Hablar con agente
            </button>
            <button style={{
              flex: "none", padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, fontFamily: FONT_STACK,
              cursor: "pointer", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#fff"
            }}>Reintentar</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

/* ---------- Helpers ---------- */
const Eyebrow = ({ children }) => (
  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500, fontFamily: FONT_STACK }}>{children}</div>
);

const ActionPill = ({ icon, label, onClick }) => (
  <button onClick={onClick} style={{
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 999, padding: "8px 14px", fontSize: 12, color: "#fff", fontFamily: FONT_STACK,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500
  }}>
    <V2Icon name={icon} size={14}/> {label}
  </button>
);

const BigActionButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} style={{
    background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: 14, color: "#fff", fontFamily: FONT_STACK,
    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
    fontSize: 13, lineHeight: 1.3, textAlign: "left", fontWeight: 500, minHeight: 80
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(52,120,246,0.16)", color: "#3478F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <V2Icon name={icon} size={16} color="#3478F6"/>
    </div>
    <span>{label}</span>
  </button>
);

window.VariantAv2 = VariantAv2;
window.SubScreen = window.SubScreen || (() => null);
window.HumanAgentScreen = window.HumanAgentScreen || (() => null);
