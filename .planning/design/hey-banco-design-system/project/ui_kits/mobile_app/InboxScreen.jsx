/* Inbox / Buzón screen */

const InboxScreen = ({ onBack }) => {
  const items = [
    { id: 1, title: "Tu solicitud de Crédito personal está aprobada",  preview: "¡Felicidades, Fernando! Tu solicitud por $25,000 fue aprobada. Revisa los detalles…", time: "Hoy", unread: true,  color: "#4FE5A1" },
    { id: 2, title: "Tarjeta de Crédito hey,",                         preview: "Empieza a usar tu nueva tarjeta digital ahora mismo en cualquier comercio.",         time: "Hoy", unread: true,  color: "#FFB547" },
    { id: 3, title: "Promoción exclusiva — 18 MSI",                    preview: "Por tiempo limitado, paga a 18 meses sin intereses con tu tarjeta hey,.",            time: "Ayer", unread: false, color: "#FF6FD3" },
    { id: 4, title: "Tu estado de cuenta de marzo",                    preview: "Ya está disponible tu estado de cuenta del periodo del 1 al 31 de marzo.",          time: "12 abr", unread: false, color: "#5AB6FF" },
    { id: 5, title: "Refiere a tus amigos y gana",                     preview: "Por cada amigo que abra su cuenta hey, recibes una recompensa.",                    time: "10 abr", unread: false, color: "#B084FF" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <HeyHeader title="Buzón" showBack onBack={onBack} trailing={<Icon name="search" size={22}/>}/>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {items.map(it => (
          <button key={it.id} style={{
            width: "100%", padding: "14px 20px", background: "transparent",
            border: "none", borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", gap: 14, cursor: "pointer", textAlign: "left",
            color: "#fff", fontFamily: "inherit"
          }}>
            <div style={{ position: "relative", flex: "none" }}>
              <IconChip icon="inbox" color={it.color} size={44}/>
              {it.unread && <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#3478F6", border: "2px solid #000" }}/>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: it.unread ? 700 : 500, flex: 1, lineHeight: 1.3 }}>{it.title}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", flex: "none" }}>{it.time}</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {it.preview}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

window.InboxScreen = InboxScreen;
