/* hey banco UI kit — primitives shared across components */

const { useState, useEffect, useRef } = React;

// ─── Icons (inline so the kit is self-contained) ───────────────────
const Icon = ({ name, size = 22, color = "currentColor", strokeWidth = 2 }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round"
  };
  switch (name) {
    case "home": return <svg {...props}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z"/></svg>;
    case "dollar": return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 9.5C15 8.12 13.66 7 12 7s-3 1.12-3 2.5S10.34 12 12 12s3 1.12 3 2.5S13.66 17 12 17s-3-1.12-3-2.5"/></svg>;
    case "transfer": return <svg {...props}><path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/></svg>;
    case "inbox": return <svg {...props}><path d="M3 13l3-7h12l3 7v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z"/><path d="M3 13h5l1 2h6l1-2h5"/></svg>;
    case "card": return <svg {...props}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/><path d="M6 15h3"/></svg>;
    case "money-bag": return <svg {...props}><path d="M9 4h6l1.5 3H7.5L9 4z"/><path d="M7.5 7C5 9 3.5 12 3.5 15c0 3.5 3 6 8.5 6s8.5-2.5 8.5-6c0-3-1.5-6-4-8"/><path d="M12 11v6"/><path d="M14 13h-3a1.5 1.5 0 100 3h2a1.5 1.5 0 110 3H10"/></svg>;
    case "car": return <svg {...props}><path d="M5 17h14M3 17v-4l2-5h14l2 5v4"/><circle cx="7.5" cy="17" r="1.5" fill={color}/><circle cx="16.5" cy="17" r="1.5" fill={color}/></svg>;
    case "piggy": return <svg {...props}><path d="M14 6H9a6 6 0 00-6 6v1h2v3l1.5 1V18h3v-2h4v2h3v-2c1.5-1 2.5-2.5 2.5-4 0-1-.4-2-1-2.7"/><circle cx="9" cy="11" r="0.7" fill={color}/></svg>;
    case "people": return <svg {...props}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6.5c1.5-1.5 4-1.5 5 0 1.5 1.5 0 4-2.5 6-2.5-2-4-4.5-2.5-6z"/></svg>;
    case "sliders": return <svg {...props}><path d="M4 7h10M18 7h2"/><path d="M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>;
    case "user": return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    case "chevron-right": return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case "chevron-left": return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case "chevron-down": return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case "mic": return <svg {...props}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/></svg>;
    case "send": return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "search": return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    default: return null;
  }
};

// ─── HAVI ring (animated rotation) ─────────────────────────────────
const HaviRing = ({ size = 56, label = "HAVI", animated = true }) => (
  <div style={{
    position: "relative", width: size, height: size,
    flex: "none"
  }}>
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: "conic-gradient(from 0deg, #FF3D5A 0deg, #FF8A3D 50deg, #FFD93D 100deg, #4FE56F 160deg, #4FD8E0 220deg, #3478F6 280deg, #B084FF 320deg, #FF3D5A 360deg)",
      animation: animated ? "haviSpin 8s linear infinite" : "none"
    }}/>
    <div style={{
      position: "absolute", inset: size * 0.07, borderRadius: "50%", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.18, fontWeight: 800, letterSpacing: "0.04em"
    }}>{label}</div>
  </div>
);

// ─── Header ────────────────────────────────────────────────────────
const HeyHeader = ({ title, name, showBack = false, onBack, trailing }) => (
  <div style={{
    height: 56, padding: "0 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#000", color: "#fff", flex: "none"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 60 }}>
      {showBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", padding: 4, cursor: "pointer" }}>
          <Icon name="chevron-left" size={24}/>
        </button>
      )}
      {name && (
        <>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.04em" }}>hey,</span>
          <span style={{ fontWeight: 600, fontSize: 17 }}>{name}</span>
        </>
      )}
    </div>
    {title && (
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 17 }}>
        {title}<Icon name="chevron-down" size={16}/>
      </div>
    )}
    <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 60, justifyContent: "flex-end" }}>
      {trailing}
    </div>
  </div>
);

// ─── Promo banner ──────────────────────────────────────────────────
const PromoBanner = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    width: "100%", background: "#2D6FF0", color: "#fff",
    border: "none", padding: "14px 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 500,
    cursor: "pointer", textAlign: "left"
  }}>
    <span>{children}</span>
    <Icon name="chevron-right" size={18}/>
  </button>
);

// ─── Section header ────────────────────────────────────────────────
const SectionHeader = ({ children, action, onAction }) => (
  <div style={{
    padding: "20px 20px 12px", display: "flex",
    alignItems: "center", justifyContent: "space-between"
  }}>
    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff" }}>{children}</h3>
    {action && (
      <button onClick={onAction} style={{ background: "none", border: "none", color: "#4A90FF", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: 0 }}>
        {action}
      </button>
    )}
  </div>
);

// ─── Icon chip (tinted circle behind a stroke glyph) ──────────────
const IconChip = ({ icon, color = "#B084FF", size = 44 }) => {
  // 16% opacity background derived from color
  const bg = (() => {
    const c = color.replace("#", "");
    const r = parseInt(c.slice(0,2), 16);
    const g = parseInt(c.slice(2,4), 16);
    const b = parseInt(c.slice(4,6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.16)`;
  })();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flex: "none"
    }}>
      <Icon name={icon} size={size * 0.5} color={color}/>
    </div>
  );
};

// ─── List row ──────────────────────────────────────────────────────
const ListRow = ({ icon, color, title, subtitle, rightTitle, rightSubtitle, onClick }) => (
  <button onClick={onClick} style={{
    width: "100%", padding: "14px 20px", background: "transparent", border: "none",
    display: "flex", alignItems: subtitle ? "flex-start" : "center", gap: 16,
    borderBottom: "1px solid rgba(255,255,255,0.08)", cursor: onClick ? "pointer" : "default",
    fontFamily: "Inter, sans-serif", textAlign: "left", color: "#fff"
  }}>
    {icon && <IconChip icon={icon} color={color}/>}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2, lineHeight: 1.4 }}>{subtitle}</div>}
    </div>
    {(rightTitle || rightSubtitle) && (
      <div style={{ textAlign: "right", flex: "none" }}>
        {rightTitle && <div style={{ fontSize: 15, fontWeight: 700 }}>{rightTitle}</div>}
        {rightSubtitle && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{rightSubtitle}</div>}
      </div>
    )}
  </button>
);

// ─── Bottom tab bar ───────────────────────────────────────────────
const TabBar = ({ active, onChange, badges = {} }) => {
  const tabs = [
    { id: "inicio", label: "Inicio", icon: "home" },
    { id: "pagos", label: "Pagos", icon: "dollar" },
    { id: "havi", label: "HAVI", icon: null },
    { id: "transferir", label: "Transferir", icon: "transfer" },
    { id: "buzon", label: "Buzón", icon: "inbox" }
  ];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-around",
      padding: "8px 8px 24px", background: "#000",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      flex: "none"
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        const isHavi = t.id === "havi";
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background: "none", border: "none", padding: "4px 8px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
            cursor: "pointer", fontFamily: "Inter, sans-serif",
            position: "relative", marginTop: isHavi ? -10 : 0
          }}>
            {isHavi ? (
              <HaviRing size={52}/>
            ) : (
              <div style={{ position: "relative" }}>
                <Icon name={t.icon} size={24}/>
                {badges[t.id] && (
                  <div style={{
                    position: "absolute", top: -4, right: -8, background: "#3478F6", color: "#fff",
                    fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 999, minWidth: 16, textAlign: "center"
                  }}>{badges[t.id]}</div>
                )}
              </div>
            )}
            {!isHavi && <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400 }}>{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

// ─── Primary button ────────────────────────────────────────────────
const PrimaryButton = ({ children, onClick, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: "100%", background: disabled ? "rgba(255,255,255,0.06)" : "#3478F6",
    color: disabled ? "rgba(255,255,255,0.4)" : "#fff",
    border: "none", padding: "14px 20px", borderRadius: 999,
    fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer"
  }}>
    {children}
  </button>
);

// expose globally for other JSX scripts
Object.assign(window, {
  Icon, HaviRing, HeyHeader, PromoBanner, SectionHeader, IconChip, ListRow, TabBar, PrimaryButton
});
