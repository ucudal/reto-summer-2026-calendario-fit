/*
  Componente: HeaderBar
  Que hace:
  - Muestra la franja azul superior con titulo y marca.
  - No tiene logica compleja ni estado.
*/

function HeaderBar() {
  return (
    <header className="app-header">
      <div className="header-title">Sistema de gestion de calendarios academicos</div>
      <div className="header-brand">UCU</div>
    </header>
  );
}

// Se exporta al objeto global para mantener simple la carga por scripts.
window.HeaderBar = HeaderBar;
