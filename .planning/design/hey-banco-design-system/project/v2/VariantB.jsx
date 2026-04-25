/* Variant B — "Focus Mode"
   Una sola pregunta a la vez. Pantalla casi vacía.
   El gasto de la semana es el héroe. HAVI siempre disponible como FAB. */

const VariantB = () => {
  const [view, setView] = useState("home"); // home | havi | account
  const [haviInput, setHaviInput] = useState("");
  const [haviMsgs, setHaviMsgs] = useState([]);

  if (view === "havi") return <BHavi onClose={() => setView("home")} input={haviInput} setInput={setHaviInput} msgs={haviMsgs} setMsgs={setHaviMsgs}/>;
  if (view === "account") return <BAccount onClose={() => setView("home")}/>;

  const spent = 3280.50;
  const limit = 10000;
  const pct = (spent / limit) * 100;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif", paddingTop: 50, position: "relative" }}>
      {/* Header minimalísimo */}
      <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: "none" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>hey, Fernando</span>
        <V2Icon name="menu" size={20} color="rgba(255,255,255,0.6)"/>
      </div>

      {/* Hero — el gasto como protagonista */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 32px" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 12 }}>
          Has gastado esta semana
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          $3,280<span style={{ fontSize: 36, color: "rgba(255,255,255,0.4)" }}>.50</span>
        </div>

        {/* Barra de progreso ne\u00f3n */}
        <div style={{ marginTop: 28 }}>
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: "linear-gradient(90deg, #B084FF 0%, #FF6FD3 100%)",
              boxShadow: "0 0 16px rgba(255,111,211,0.5)",
              borderRadius: 3
            }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            <span>{Math.round(pct)}% de tu meta</span>
            <span>${limit.toLocaleString("es-MX")} límite</span>
          </div>
        </div>

        {/* Saldo \u2014 secundario */}
        <button onClick={() => setView("account")} style={{
          marginTop: 36, background: "transparent", border: "none",
          display: "flex", alignItems: "center", gap: 14, padding: 0, cursor: "pointer",
          color: "#fff", fontFamily: "inherit", textAlign: "left"
        }}>
          <div style={{ width: 4, height: 36, background: "#3478F6", borderRadius: 2, boxShadow: "0 0 12px rgba(52,120,246,0.6)" }}/>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Saldo disponible</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>$12,450.30</div>
          </div>
          <V2Icon name="chevron-right" size={18} color="rgba(255,255,255,0.4)" style={{ marginLeft: "auto" }}/>
        </button>
      </div>

      {/* HAVI FAB \u2014 \u00fanica acci\u00f3n disponible */}
      <div style={{ padding: "0 24px 32px", flex: "none", display: "flex", justifyContent: "center" }}>
        <button onClick={() => setView("havi")} style={{
          background: "transparent", border: "none", cursor: "pointer", padding: 0,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10
        }}>
          <HaviOrb size={64}/>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: "0.04em" }}>Toca para hablar con HAVI</span>
        </button>
      </div>
    </div>
  );
};

const BHavi = ({ onClose, input, setInput, msgs, setMsgs }) => {
  const send = (text) => {
    const t = text || input;
    if (!t.trim()) return;
    setMsgs(m => [...m, { id: Date.now(), from: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      setMsgs(m => [...m, { id: Date.now()+1, from: "havi", text: "Listo. " + (/transfer/i.test(t) ? "¿A quién?" : /gast/i.test(t) ? "Tu mayor gasto fue Comida ($1,240)." : "¿Algo más?") }]);
    }, 500);
  };
  const suggestions = ["Mi saldo", "Pagar tarjeta", "Transferir", "Gastos del mes"];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif", paddingTop: 50 }}>
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: "none" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6 }}>
          <V2Icon name="close" size={22}/>
        </button>
        <HaviOrb size={28}/>
        <div style={{ width: 34 }}/>
      </div>

      {msgs.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 32px" }}>
          <HaviOrb size={80} animated={true}/>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 32, marginBottom: 8 }}>¿Qué quieres hacer?</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0 }}>Escribe o di lo que necesites. Yo me encargo del resto.</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.map(m => (
            <div key={m.id} style={{
              alignSelf: m.from === "user" ? "flex-end" : "flex-start",
              maxWidth: "78%", background: m.from === "user" ? "#3478F6" : "#1A1A1A",
              padding: "10px 14px", borderRadius: 18,
              borderBottomRightRadius: m.from === "user" ? 6 : 18,
              borderBottomLeftRadius: m.from === "havi" ? 6 : 18,
              fontSize: 14, lineHeight: 1.45
            }}>{m.text}</div>
          ))}
        </div>
      )}

      <div style={{ padding: "0 20px 8px", display: "flex", gap: 8, overflowX: "auto", flex: "none" }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => send(s)} style={{
            flex: "none", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999,
            padding: "8px 14px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap"
          }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: "8px 20px 24px", flex: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#141414", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 6px 6px 18px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Escribe o pregunta..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit", padding: "8px 0" }}/>
          <button onClick={() => input.trim() ? send() : null} style={{ width: 38, height: 38, borderRadius: "50%", background: input.trim() ? "#3478F6" : "transparent", border: input.trim() ? "none" : "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", flex: "none" }}>
            <V2Icon name={input.trim() ? "send" : "mic"} size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const BAccount = ({ onClose }) => {
  const txs = [
    { merchant: "Starbucks Coffee", date: "Hoy", amount: -68, icon: "coffee", color: "#FFB547" },
    { merchant: "Uber", date: "Hoy", amount: -125, icon: "uber", color: "#4FD8E0" },
    { merchant: "Amazon MX", date: "Ayer", amount: -899, icon: "bag", color: "#FF6FD3" },
    { merchant: "Mariana López", date: "Ayer", amount: 1200, icon: "transfer", color: "#4FE5A1" },
    { merchant: "Walmart", date: "23 abr", amount: -540, icon: "bag", color: "#FF6FD3" },
    { merchant: "Spotify", date: "22 abr", amount: -129, icon: "card", color: "#B084FF" }
  ];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif", paddingTop: 50 }}>
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: "none" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6 }}>
          <V2Icon name="chevron-left" size={22}/>
        </button>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Cuenta principal</span>
        <div style={{ width: 34 }}/>
      </div>

      <div style={{ padding: "20px 24px 28px", flex: "none" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Saldo disponible</div>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>$12,450.30</div>
        <div style={{ fontSize: 13, color: "#4FE5A1", marginTop: 4 }}>+$1,200 hoy</div>

        {/* Acciones inline */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {[{ label: "Enviar", icon: "transfer" }, { label: "Recibir", icon: "qr" }, { label: "Pagar", icon: "card" }].map((a, i) => (
            <button key={i} style={{ flex: 1, background: "#141414", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 8px", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
              <V2Icon name={a.icon} size={20}/>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 24px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Movimientos</div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 24px" }}>
        {txs.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderRadius: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${t.color}29`, color: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <V2Icon name={t.icon} size={18} color={t.color}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.merchant}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{t.date}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.amount > 0 ? "#4FE5A1" : "#fff", fontVariantNumeric: "tabular-nums" }}>
              {t.amount > 0 ? "+" : "−"}${Math.abs(t.amount).toLocaleString("es-MX")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.VariantB = VariantB;
