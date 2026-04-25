/* Transfer screen — quick send/receive flow */

const TransferScreen = ({ onBack }) => {
  const [tab, setTab] = React.useState("enviar");
  const contacts = [
    { id: 1, name: "Mariana López",   handle: "@mari.lopez",   color: "#B084FF", initial: "M" },
    { id: 2, name: "Carlos Rodríguez", handle: "@crod",         color: "#FFB547", initial: "C" },
    { id: 3, name: "Ana Sofía Pérez",  handle: "@anasof",       color: "#FF6FD3", initial: "A" },
    { id: 4, name: "Diego Hernández",  handle: "@dieghdz",      color: "#4FD8E0", initial: "D" },
    { id: 5, name: "Lucía Mendoza",    handle: "@lulu",         color: "#5AB6FF", initial: "L" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <HeyHeader title="Transferir" showBack onBack={onBack}/>

      {/* Tabs */}
      <div style={{ display: "flex", padding: "8px 20px 16px", gap: 8 }}>
        {[{ id: "enviar", label: "Enviar" }, { id: "recibir", label: "Recibir" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "10px 16px", borderRadius: 999,
            border: "none", cursor: "pointer",
            background: tab === t.id ? "#fff" : "rgba(255,255,255,0.06)",
            color: tab === t.id ? "#000" : "#fff",
            fontFamily: "inherit", fontSize: 14, fontWeight: 600
          }}>{t.label}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1A1A1A", borderRadius: 999, padding: "10px 16px", color: "rgba(255,255,255,0.6)" }}>
          <Icon name="search" size={18}/>
          <input placeholder="Busca por nombre, CLABE o teléfono" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit" }}/>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "0 20px 24px" }}>
        {[
          { label: "Nuevo\ncontacto", icon: "people", color: "#B084FF" },
          { label: "Entre mis\ncuentas",   icon: "transfer", color: "#5AB6FF" },
          { label: "Servicios",   icon: "dollar", color: "#FFB547" },
          { label: "QR",          icon: "card",   color: "#FF6FD3" }
        ].map((a, i) => (
          <button key={i} style={{ background: "none", border: "none", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "inherit" }}>
            <IconChip icon={a.icon} color={a.color} size={48}/>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", whiteSpace: "pre-line", textAlign: "center", lineHeight: 1.3 }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Frequent contacts */}
      <SectionHeader>Frecuentes</SectionHeader>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {contacts.map(c => (
          <button key={c.id} onClick={() => alert(`Enviar a ${c.name}`)} style={{
            width: "100%", padding: "12px 20px", background: "transparent",
            border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
            color: "#fff", fontFamily: "inherit", textAlign: "left"
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `${c.color}29`, color: c.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 16
            }}>{c.initial}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{c.handle}</div>
            </div>
            <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.4)"/>
          </button>
        ))}
      </div>
    </div>
  );
};

window.TransferScreen = TransferScreen;
