/* Home screen — replicates the dashboard from the reference screenshot */

const HomeScreen = ({ name, onTabChange, activeTab, onOpenProduct, onOpenHavi }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <HeyHeader name={name} trailing={
        <>
          <Icon name="sliders" size={22}/>
          <Icon name="user" size={22}/>
        </>
      }/>

      <PromoBanner onClick={() => alert("Validar perfil")}>
        Valida tu perfil y accede a más productos
      </PromoBanner>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Mis productos contratados */}
        <SectionHeader action="Ocultar saldos" onAction={() => {}}>
          Mis productos contratados
        </SectionHeader>
        <div>
          <ListRow icon="dollar" color="#B084FF" title="Cuentas"
                   rightTitle="$0.00" rightSubtitle="Suma total de las cuentas"
                   onClick={() => onOpenProduct("cuentas")}/>
          <ListRow icon="people" color="#FFB547" title="Refiere a tus amigos"
                   rightTitle="0" rightSubtitle="Mis referidos"
                   onClick={() => onOpenProduct("referidos")}/>
        </div>

        {/* Productos disponibles */}
        <SectionHeader>Productos disponibles para ti</SectionHeader>
        <div>
          <ListRow icon="card" color="#FFB547"
                   title="Tarjeta de Crédito"
                   subtitle="¡Obtén MSI, recompensas y más!"
                   onClick={() => onOpenProduct("tdc")}/>
          <ListRow icon="card" color="#FF8A3D"
                   title="Tarjeta de Crédito con Garantía*"
                   subtitle="La mejor opción para aprender a usar una tarjeta de crédito."
                   onClick={() => onOpenProduct("tdc-garantia")}/>
          <ListRow icon="money-bag" color="#FF6FD3"
                   title="Crédito personal"
                   subtitle="Solicita desde $1,000 hasta $400,000"
                   onClick={() => onOpenProduct("credito-personal")}/>
          <ListRow icon="car" color="#4FD8E0"
                   title="Crédito de auto"
                   subtitle="¡Encuentra tu auto al precio que quieres!"
                   onClick={() => onOpenProduct("credito-auto")}/>
          <ListRow icon="piggy" color="#5AB6FF"
                   title="Cuenta para menores"
                   subtitle="Enséñale a tus hijos a manejar su dinero"
                   onClick={() => onOpenProduct("menores")}/>
          <ListRow icon="dollar" color="#4FE5A1"
                   title="Inversión hey,"
                   subtitle="Haz crecer tu dinero desde $100"
                   onClick={() => onOpenProduct("inversion")}/>
        </div>

        <div style={{ height: 24 }}/>
      </div>

      <TabBar active={activeTab} onChange={(id) => id === "havi" ? onOpenHavi() : onTabChange(id)} badges={{ buzon: 2 }}/>
    </div>
  );
};

window.HomeScreen = HomeScreen;
