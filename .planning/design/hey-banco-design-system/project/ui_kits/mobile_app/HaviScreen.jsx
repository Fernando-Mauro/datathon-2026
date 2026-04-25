/* HAVI chat screen */

const HaviScreen = ({ onBack }) => {
  const [messages, setMessages] = React.useState([
    { id: 1, from: "havi", text: "¡Pregúntale a HAVI! Resuelve al instante tus dudas sobre promociones, uso de la app, requisitos y beneficios de nuestros productos.", time: "11:46" }
  ]);
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
    const userMsg = { id: Date.now(), from: "user", text: input, time };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, {
        id: Date.now()+1, from: "havi",
        text: "Claro, te ayudo. Tu Crédito personal puede ir desde $1,000 hasta $400,000 según tu perfil. ¿Quieres simularlo?",
        time
      }]);
    }, 700);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <HeyHeader title="HAVI" showBack onBack={onBack}/>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map(m => (
          <div key={m.id} style={{
            alignSelf: m.from === "user" ? "flex-end" : "flex-start",
            maxWidth: "82%",
            background: m.from === "user" ? "#3478F6" : "#1A1A1A",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 12,
            fontSize: 14,
            lineHeight: 1.45
          }}>
            {m.text}
            <div style={{ fontSize: 11, color: m.from === "user" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)", textAlign: "right", marginTop: 4 }}>
              {m.time}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0E0E0E", padding: "10px 16px 14px" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <button onClick={() => setMessages(messages.slice(0,1))} style={{ background: "none", border: "none", color: "#4A90FF", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Limpiar conversación
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999, padding: "6px 6px 6px 16px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Escribe tu pregunta aquí"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit", padding: "6px 0" }}
          />
          <button onClick={input.trim() ? send : undefined} style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "#fff", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", cursor: "pointer", flex: "none"
          }}>
            <Icon name={input.trim() ? "send" : "mic"} size={18} color="#000"/>
          </button>
        </div>
      </div>
    </div>
  );
};

window.HaviScreen = HaviScreen;
