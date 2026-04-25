/* Product detail screen — generic detail view used when tapping a product */

const ProductDetailScreen = ({ product, onBack }) => {
  const products = {
    "cuentas":      { title: "Cuentas",                   color: "#B084FF", icon: "dollar",   tagline: "Suma total de las cuentas", body: "Aún no tienes cuentas activas. Abre tu primera cuenta hey, en menos de 5 minutos y empieza a mover tu dinero sin comisiones.", cta: "Abrir cuenta" },
    "tdc":          { title: "Tarjeta de Crédito",        color: "#FFB547", icon: "card",     tagline: "MSI, recompensas y más", body: "Compra hoy, paga después. Hasta 12 meses sin intereses en miles de comercios y recompensas en cada compra.", cta: "Solicitar tarjeta" },
    "credito-personal": { title: "Crédito personal",     color: "#FF6FD3", icon: "money-bag",tagline: "Desde $1,000 hasta $400,000", body: "Tasa fija, plazos de 6 a 36 meses y aprobación al instante. Sin papeleo, sin comisiones por apertura.", cta: "Simular crédito" },
    "credito-auto": { title: "Crédito de auto",           color: "#4FD8E0", icon: "car",      tagline: "Tu auto al precio que quieres", body: "Financiamos auto nuevo o seminuevo. Engánchalo desde 10% y elige plazo de hasta 60 meses.", cta: "Cotizar mi auto" },
    "menores":      { title: "Cuenta para menores",       color: "#5AB6FF", icon: "piggy",    tagline: "Enséñale a manejar su dinero", body: "Una cuenta para tu hijo o hija con tarjeta a su nombre, controles parentales y herramientas para aprender a ahorrar.", cta: "Abrir cuenta" },
    "inversion":    { title: "Inversión hey,",            color: "#4FE5A1", icon: "dollar",   tagline: "Haz crecer tu dinero desde $100", body: "Invierte desde $100 con rendimientos competitivos. Disponibilidad diaria, sin penalizaciones.", cta: "Empezar a invertir" },
    "tdc-garantia": { title: "Tarjeta con Garantía",      color: "#FF8A3D", icon: "card",     tagline: "Aprende a usar una tarjeta", body: "Construye tu historial crediticio con un depósito de garantía. La mejor opción si es tu primera tarjeta.", cta: "Solicitar tarjeta" },
    "referidos":    { title: "Refiere a tus amigos",      color: "#FFB547", icon: "people",   tagline: "Gana por cada amigo que invites", body: "Comparte tu código. Cuando tu amigo abra su cuenta hey, ambos reciben recompensas.", cta: "Compartir código" }
  };
  const p = products[product] || products["cuentas"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <HeyHeader title={p.title} showBack onBack={onBack}/>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
        <IconChip icon={p.icon} color={p.color} size={72}/>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 20, marginBottom: 6 }}>
          {p.title}
        </h1>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>{p.tagline}</div>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,0.85)", marginBottom: 28, textWrap: "pretty" }}>
          {p.body}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "transparent", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <ListRow title="Requisitos" rightTitle="" subtitle="INE vigente, comprobante de domicilio" onClick={() => {}}/>
          <ListRow title="Tasas y comisiones" subtitle="Consulta el desglose completo" onClick={() => {}}/>
          <ListRow title="Términos y condiciones" subtitle="Documento legal en PDF" onClick={() => {}}/>
        </div>
      </div>

      <div style={{ padding: "12px 20px 24px", background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <PrimaryButton onClick={() => alert(p.cta)}>{p.cta}</PrimaryButton>
      </div>
    </div>
  );
};

window.ProductDetailScreen = ProductDetailScreen;
