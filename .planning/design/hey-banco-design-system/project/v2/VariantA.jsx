/* Variant A — "Conversational"
   HAVI domina la pantalla. La entrada de texto es la navegación.
   Saldo y gasto aparecen como la primera "respuesta" de HAVI. */

const VariantA = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, from: "havi", kind: "intro", text: "hey, Fernando. ¿Qué hacemos hoy?" },
    { id: 2, from: "havi", kind: "snapshot",
      data: {
        balance: 12450.30,
        spent: 3280.50,
        spentPct: 32,
        topCat: "Comida",
        sparkline: [40, 38, 42, 35, 50, 45, 60, 55, 48, 62, 58, 70, 65, 72]
      }
    }
  ]);

  const suggestions = [
    "Transferir $500 a Mariana",
    "¿En qué gasté esta semana?",
    "Pagar mi tarjeta",
    "Mostrar movimientos"
  ];

  const send = (text) => {
    const t = text || input;
    if (!t.trim()) return;
    const userMsg = { id: Date.now(), from: "user", text: t };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      let reply;
      if (/transferir|mandar|enviar/i.test(t)) {
        reply = { id: Date.now()+1, from: "havi", kind: "transfer-card", amount: 500, to: "Mariana López" };
      } else if (/gast/i.test(t)) {
        reply = { id: Date.now()+1, from: "havi", kind: "spend-breakdown" };
      } else if (/movimient/i.test(t)) {
        reply = { id: Date.now()+1, from: "havi", kind: "transactions" };
      } else if (/pagar.*tarjeta|tarjeta/i.test(t)) {
        reply = { id: Date.now()+1, from: "havi", kind: "card-pay" };
      } else {
        reply = { id: Date.now()+1, from: "havi", kind: "text", text: "Listo. ¿Algo más?" };
      }
      setMessages(m => [...m, reply]);
    }, 600);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif", paddingTop: 50 }}>
      {/* Minimal header */}
      <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HaviOrb size={28}/>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>HAVI</span>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <V2Icon name="user" size={16}/>
        </div>
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map(m => <MessageBubble key={m.id} msg={m}/>)}
      </div>

      {/* Suggestions row */}
      <div style={{ padding: "0 16px 10px", display: "flex", gap: 8, overflowX: "auto", flex: "none" }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => send(s)} style={{
            flex: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999,
            padding: "8px 14px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap"
          }}>{s}</button>
        ))}
      </div>

      {/* Composer — siempre visible, único punto de entrada */}
      <div style={{ padding: "8px 16px 24px", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#141414", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 6px 6px 18px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Pregúntale a HAVI o escribe lo que quieras hacer"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit", padding: "8px 0" }}
          />
          <button onClick={() => input.trim() ? send() : null} style={{
            width: 38, height: 38, borderRadius: "50%",
            background: input.trim() ? "#3478F6" : "transparent",
            border: input.trim() ? "none" : "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", cursor: "pointer", flex: "none", transition: "background 150ms"
          }}>
            <V2Icon name={input.trim() ? "send" : "mic"} size={18} color="#fff"/>
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg }) => {
  if (msg.from === "user") {
    return (
      <div style={{ alignSelf: "flex-end", maxWidth: "78%", background: "#3478F6", color: "#fff", padding: "10px 14px", borderRadius: 18, borderBottomRightRadius: 6, fontSize: 14, lineHeight: 1.45 }}>
        {msg.text}
      </div>
    );
  }

  if (msg.kind === "intro") {
    return (
      <div style={{ alignSelf: "flex-start", padding: "8px 4px", color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
        {msg.text}
      </div>
    );
  }

  if (msg.kind === "snapshot") {
    const d = msg.data;
    const max = Math.max(...d.sparkline);
    return (
      <div style={{ alignSelf: "stretch", background: "linear-gradient(180deg, #131313 0%, #0a0a0a 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Saldo total</div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>${d.balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Gastaste esta semana</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#FF6FD3", fontVariantNumeric: "tabular-nums" }}>${d.spent.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>↑ {d.spentPct}% vs anterior</span>
            </div>
          </div>
          <svg width="100" height="40" viewBox="0 0 100 40" style={{ flex: "none" }}>
            <defs>
              <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FF6FD3" stopOpacity="0.6"/>
                <stop offset="1" stopColor="#FF6FD3" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polyline
              points={d.sparkline.map((v, i) => `${(i/(d.sparkline.length-1))*100},${40 - (v/max)*32 - 4}`).join(" ")}
              fill="none" stroke="#FF6FD3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <polygon
              points={`0,40 ${d.sparkline.map((v, i) => `${(i/(d.sparkline.length-1))*100},${40 - (v/max)*32 - 4}`).join(" ")} 100,40`}
              fill="url(#spark)"/>
          </svg>
        </div>

        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          <V2Icon name="sparkles" size={14} color="#B084FF"/>
          Tu mayor gasto fue en <strong style={{ color: "#fff", fontWeight: 600 }}>{d.topCat}</strong>. ¿Quieres verlo?
        </div>
      </div>
    );
  }

  if (msg.kind === "transfer-card") {
    return (
      <div style={{ alignSelf: "stretch", background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Confirma la transferencia</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(176,132,255,0.16)", color: "#B084FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>M</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{msg.to}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Frecuente</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>${msg.amount}</div>
        </div>
        <button style={{ width: "100%", marginTop: 14, background: "#3478F6", color: "#fff", border: "none", borderRadius: 999, padding: "12px", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Mantén para enviar
        </button>
      </div>
    );
  }

  if (msg.kind === "transactions") {
    const txs = [
      { merchant: "Starbucks Coffee",     cat: "Comida",      amount: -68, icon: "coffee", color: "#FFB547" },
      { merchant: "Uber",                 cat: "Transporte",  amount: -125, icon: "uber", color: "#4FD8E0" },
      { merchant: "Amazon MX",            cat: "Compras",     amount: -899, icon: "bag", color: "#FF6FD3" },
      { merchant: "Transferencia recibida", cat: "Mariana L.", amount: 1200, icon: "transfer", color: "#4FE5A1" }
    ];
    return (
      <div style={{ alignSelf: "stretch", background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 4, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px 6px", fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Últimos movimientos</div>
        {txs.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${t.color}29`, color: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <V2Icon name={t.icon} size={18} color={t.color}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.merchant}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{t.cat}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.amount > 0 ? "#4FE5A1" : "#fff", fontVariantNumeric: "tabular-nums" }}>
              {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString("es-MX")}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (msg.kind === "spend-breakdown") {
    const cats = [
      { name: "Comida", amount: 1240, pct: 38, color: "#FFB547" },
      { name: "Transporte", amount: 890, pct: 27, color: "#4FD8E0" },
      { name: "Compras", amount: 720, pct: 22, color: "#FF6FD3" },
      { name: "Otros", amount: 430, pct: 13, color: "#B084FF" }
    ];
    return (
      <div style={{ alignSelf: "stretch", background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 18 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Gasto por categoría · semana</div>
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 14 }}>
          {cats.map((c, i) => <div key={i} style={{ width: `${c.pct}%`, background: c.color }}/>)}
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {cats.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }}/>
              <span style={{ flex: 1 }}>{c.name}</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{c.pct}%</span>
              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", minWidth: 60, textAlign: "right" }}>${c.amount}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (msg.kind === "card-pay") {
    return (
      <div style={{ alignSelf: "stretch", background: "linear-gradient(135deg, #1a1a2e 0%, #000 100%)", border: "1px solid rgba(180,120,255,0.3)", borderRadius: 20, padding: 18 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Tarjeta de Crédito hey,</div>
        <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Pago para no generar intereses</div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>$4,820.00</div>
        <div style={{ fontSize: 12, color: "#FFB547", marginTop: 4 }}>Vence en 6 días</div>
        <button style={{ width: "100%", marginTop: 14, background: "#3478F6", color: "#fff", border: "none", borderRadius: 999, padding: "12px", fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Pagar $4,820.00
        </button>
      </div>
    );
  }

  return (
    <div style={{ alignSelf: "flex-start", maxWidth: "78%", background: "#1A1A1A", color: "#fff", padding: "10px 14px", borderRadius: 18, borderBottomLeftRadius: 6, fontSize: 14, lineHeight: 1.45 }}>
      {msg.text}
    </div>
  );
};

window.VariantA = VariantA;
