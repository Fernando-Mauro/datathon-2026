/* Sub-screens reached from chat actions */

const FONT_STACK_SS = '"IBM Plex Sans", "Inter", system-ui, sans-serif';
const FONT_SERIF_SS = '"IBM Plex Serif", Georgia, serif';

const SubScreen = ({ name, onBack }) => {
  const titles = {
    "spend-chart": "Gasto por categoría",
    "transactions": "Movimientos recientes",
    "compare": "Comparativa mensual",
    "alert-create": "Nueva alerta",
    "account": "Cuenta principal",
    "card-pay": "Pagar tarjeta",
    "card-detail": "Tarjeta de Crédito",
    "transfer-confirm": "Transferencia enviada",
    "goals": "Mis metas"
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000", color: "#fff", fontFamily: FONT_STACK_SS }}>
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, flex: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6, display: "flex" }}>
          <V2Icon name="chevron-left" size={22}/>
        </button>
        <span style={{ fontSize: 15, fontWeight: 500, flex: 1, fontFamily: FONT_SERIF_SS }}>{titles[name] || name}</span>
        <HaviOrb size={22}/>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {name === "spend-chart" && <SpendChart/>}
        {name === "transactions" && <TransactionsList/>}
        {name === "compare" && <CompareView/>}
        {name === "alert-create" && <AlertCreate/>}
        {name === "account" && <AccountView/>}
        {name === "card-pay" && <CardPay/>}
        {name === "card-detail" && <CardDetail/>}
        {name === "transfer-confirm" && <TransferConfirm/>}
        {name === "goals" && <GoalsView/>}
      </div>
    </div>
  );
};

const SpendChart = () => {
  const cats = [
    { name: "Comida", amount: 1240, pct: 38, color: "#FFB547" },
    { name: "Transporte", amount: 890, pct: 27, color: "#4FD8E0" },
    { name: "Compras", amount: 720, pct: 22, color: "#FF6FD3" },
    { name: "Otros", amount: 430, pct: 13, color: "#B084FF" }
  ];
  return (
    <div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>Esta semana</div>
      <div style={{ fontSize: 36, fontWeight: 600, fontFamily: FONT_SERIF_SS, letterSpacing: "-0.02em", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>$3,280.50</div>
      <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginTop: 20 }}>
        {cats.map((c, i) => <div key={i} style={{ width: `${c.pct}%`, background: c.color, animation: `growBar 600ms ${i * 80}ms cubic-bezier(0.32, 0.72, 0, 1) both`, transformOrigin: "left" }}/>)}
      </div>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column" }}>
        {cats.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color }}/>
            <span style={{ flex: 1, fontSize: 14 }}>{c.name}</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{c.pct}%</span>
            <span style={{ fontWeight: 500, fontFamily: FONT_SERIF_SS, fontVariantNumeric: "tabular-nums", minWidth: 70, textAlign: "right", fontSize: 15 }}>${c.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TransactionsList = () => {
  const txs = [
    { merchant: "Starbucks Coffee", date: "Hoy 11:42", amount: -68, icon: "coffee", color: "#FFB547" },
    { merchant: "Uber", date: "Hoy 10:18", amount: -125, icon: "uber", color: "#4FD8E0" },
    { merchant: "Amazon MX", date: "Ayer", amount: -899, icon: "bag", color: "#FF6FD3" },
    { merchant: "Mariana López", date: "Ayer", amount: 1200, icon: "transfer", color: "#4FE5A1" },
    { merchant: "Walmart", date: "23 abr", amount: -540, icon: "bag", color: "#FF6FD3" },
    { merchant: "Spotify", date: "22 abr", amount: -129, icon: "card", color: "#B084FF" },
    { merchant: "Uber Eats", date: "22 abr", amount: -210, icon: "coffee", color: "#FFB547" }
  ];
  return (
    <div>
      {txs.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid rgba(255,255,255,0.06)" : "none", animation: `fadeInUp 280ms ${i * 40}ms both` }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${t.color}29`, color: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <V2Icon name={t.icon} size={18} color={t.color}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{t.merchant}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{t.date}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: t.amount > 0 ? "#4FE5A1" : "#fff", fontVariantNumeric: "tabular-nums", fontFamily: FONT_SERIF_SS }}>
            {t.amount > 0 ? "+" : "−"}${Math.abs(t.amount).toLocaleString("es-MX")}
          </div>
        </div>
      ))}
    </div>
  );
};

const CompareView = () => (
  <div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>Abril vs Marzo</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
      <div style={{ background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Marzo</div>
        <div style={{ fontSize: 22, fontWeight: 600, fontFamily: FONT_SERIF_SS, marginTop: 4 }}>$2,480</div>
      </div>
      <div style={{ background: "rgba(255,111,211,0.08)", border: "1px solid rgba(255,111,211,0.32)", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Abril</div>
        <div style={{ fontSize: 22, fontWeight: 600, fontFamily: FONT_SERIF_SS, marginTop: 4, color: "#FF6FD3" }}>$3,280</div>
        <div style={{ fontSize: 11, color: "#FF6FD3", marginTop: 4 }}>↑ 32%</div>
      </div>
    </div>
    <div style={{ marginTop: 24, padding: 16, background: "rgba(255,181,71,0.08)", border: "1px solid rgba(255,181,71,0.32)", borderRadius: 16, display: "flex", gap: 12 }}>
      <V2Icon name="alert" size={20} color="#FFB547"/>
      <div style={{ fontSize: 13, lineHeight: 1.5 }}>Tu gasto en <strong>Comida</strong> subió 48% este mes.</div>
    </div>
  </div>
);

const AlertCreate = () => (
  <div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>Avisarme cuando</div>
    <div style={{ marginTop: 16, background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Mi gasto en Comida supere</div>
      <div style={{ fontSize: 36, fontWeight: 600, fontFamily: FONT_SERIF_SS, marginTop: 8 }}>$1,500<span style={{ color: "rgba(255,255,255,0.4)" }}>.00</span></div>
    </div>
    <button style={{ width: "100%", marginTop: 20, background: "#3478F6", color: "#fff", border: "none", borderRadius: 999, padding: 14, fontFamily: FONT_STACK_SS, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Crear alerta</button>
  </div>
);

const AccountView = () => (
  <div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>Saldo disponible</div>
    <div style={{ fontSize: 44, fontWeight: 600, fontFamily: FONT_SERIF_SS, letterSpacing: "-0.02em", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>$12,450.30</div>
    <div style={{ fontSize: 13, color: "#4FE5A1", marginTop: 4 }}>+$1,200 hoy</div>
    <div style={{ marginTop: 24 }}><TransactionsList/></div>
  </div>
);

const CardPay = () => (
  <div>
    <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #000 100%)", border: "1px solid rgba(180,120,255,0.3)", borderRadius: 20, padding: 20 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Pago para no generar intereses</div>
      <div style={{ fontSize: 40, fontWeight: 600, fontFamily: FONT_SERIF_SS, marginTop: 8 }}>$4,820.00</div>
      <div style={{ fontSize: 13, color: "#FFB547", marginTop: 4 }}>Vence en 6 días</div>
    </div>
    <div style={{ marginTop: 20, padding: 16, background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Pagar desde</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <V2Icon name="wallet" size={18}/><span style={{ fontSize: 14 }}>Cuenta principal · $12,450.30</span>
      </div>
    </div>
    <button style={{ width: "100%", marginTop: 20, background: "#3478F6", color: "#fff", border: "none", borderRadius: 999, padding: 14, fontFamily: FONT_STACK_SS, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Pagar $4,820.00</button>
  </div>
);

const CardDetail = () => (
  <div>
    <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #000 100%)", border: "1px solid rgba(180,120,255,0.3)", borderRadius: 20, padding: 24, height: 180, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ fontSize: 13, fontFamily: FONT_SERIF_SS, fontWeight: 600 }}>hey, Crédito</div>
      <div>
        <div style={{ fontSize: 16, letterSpacing: "0.2em", fontFamily: "ui-monospace, monospace" }}>•••• 4821</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>FERNANDO M.</div>
      </div>
    </div>
    <div style={{ marginTop: 20 }}><TransactionsList/></div>
  </div>
);

const TransferConfirm = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 40 }}>
    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(79,229,161,0.16)", color: "#4FE5A1", display: "flex", alignItems: "center", justifyContent: "center", animation: "scaleIn 400ms cubic-bezier(0.32, 0.72, 0, 1) both" }}>
      <V2Icon name="check-circle" size={42} color="#4FE5A1"/>
    </div>
    <div style={{ fontSize: 22, fontWeight: 500, fontFamily: FONT_SERIF_SS, marginTop: 24, letterSpacing: "-0.01em" }}>Transferencia enviada</div>
    <div style={{ fontSize: 36, fontWeight: 600, fontFamily: FONT_SERIF_SS, marginTop: 12, fontVariantNumeric: "tabular-nums" }}>$500.00</div>
    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>a Mariana López · Ahora</div>
  </div>
);

const GoalsView = () => (
  <div>
    <div style={{ background: "rgba(79,229,161,0.08)", border: "1px solid rgba(79,229,161,0.32)", borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 13, color: "#4FE5A1", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>Vacaciones · Diciembre</div>
      <div style={{ fontSize: 26, fontWeight: 600, fontFamily: FONT_SERIF_SS, marginTop: 4 }}>$8,400 <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>/ $15,000</span></div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginTop: 12, overflow: "hidden" }}>
        <div style={{ width: "56%", height: "100%", background: "#4FE5A1", animation: "growBar 700ms cubic-bezier(0.32,0.72,0,1) both", transformOrigin: "left" }}/>
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 10 }}>Vas 32% adelante de lo planeado</div>
    </div>
  </div>
);

const HumanAgentScreen = ({ onBack }) => {
  const [step, setStep] = useState("connecting"); // connecting | connected
  useEffect(() => {
    const t = setTimeout(() => setStep("connected"), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000", color: "#fff", fontFamily: FONT_STACK_SS }}>
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, flex: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6, display: "flex" }}>
          <V2Icon name="close" size={22}/>
        </button>
        <span style={{ fontSize: 15, fontWeight: 500, flex: 1, fontFamily: FONT_SERIF_SS }}>Centro de ayuda</span>
      </div>

      {step === "connecting" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 20 }}>
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(52,120,246,0.3)", borderTopColor: "#3478F6", animation: "spin 1s linear infinite" }}/>
            <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "rgba(52,120,246,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <V2Icon name="headset" size={26} color="#3478F6"/>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontFamily: FONT_SERIF_SS, fontWeight: 500 }}>Conectando con un agente</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.5 }}>Tiempo de espera estimado: menos de 2 minutos</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(79,229,161,0.16)", color: "#4FE5A1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SERIF_SS, fontWeight: 600, fontSize: 17 }}>S</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Sofía Martínez</div>
              <div style={{ fontSize: 12, color: "#4FE5A1", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4FE5A1" }}/> En línea · Agente hey,
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ alignSelf: "flex-start", maxWidth: "78%", background: "#1A1A1A", padding: "10px 14px", borderRadius: 18, borderBottomLeftRadius: 6, fontSize: 14, lineHeight: 1.45, animation: "fadeInUp 280ms both" }}>
              ¡Hola Fernando! Soy Sofía. Veo que HAVI te transfirió. ¿En qué te puedo ayudar?
            </div>
          </div>
          <div style={{ padding: "8px 16px 24px", flex: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#141414", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 6px 6px 18px" }}>
              <input placeholder="Escribe a Sofía..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: FONT_STACK_SS, padding: "8px 0" }}/>
              <button style={{ width: 38, height: 38, borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", flex: "none" }}>
                <V2Icon name="send" size={16}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.SubScreen = SubScreen;
window.HumanAgentScreen = HumanAgentScreen;
