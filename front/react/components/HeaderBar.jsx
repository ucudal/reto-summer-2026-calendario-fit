/*
  Componente: HeaderBar
  Que hace:
  - Muestra la franja azul superior con titulo y marca.
  - Muestra select de carrera.
  - Muestra botones de acciones superiores.
  - Dispara "onOpenCreateGroup" cuando se presiona CREAR GRUPO.
  - Dispara "onOpenCreateCareer" cuando se presiona CREAR CARRERA.
*/

function HeaderBar(props) {
  const {
    careers = [],
    selectedCareer = "",
    selectedPlan = "",
    currentLectiveTerm = "",
    onCareerChange = () => {},
    onPlanChange = () => {},
    onOpenCreateSemester = () => {},
    onOpenCreateCareer = () => {},
    onOpenCreateGroup = () => {}
  } = props;

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="header-title">Sistema de gestion de calendarios academicos</div>
        {currentLectiveTerm && (
          <div className="header-semester-info">{currentLectiveTerm}</div>
        )}
        <img src="./react/assets/Logo-Universidad-Catolica.svg" alt="Logo Universidad Catolica del Uruguay" className="header-logo" />
      </div>

      <div className="header-controls">
        <select className="header-select" value={selectedCareer} onChange={(event) => onCareerChange(event.target.value)}>
          {careers.map((career) => (
            <option key={career} value={career}>{career}</option>
          ))}
        </select>

        <button className="header-btn" type="button">Crear nuevo semestre +</button>
        <select className="header-select" value={selectedPlan} onChange={(event) => onPlanChange(event.target.value)}>
          {plans.map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
        </select>

        <div className="header-semester-wrap">
          <button className="header-btn" type="button" onClick={onOpenCreateSemester}>Crear nuevo semestre +</button>
        </div>
        <button className="header-btn hidden-btn" type="button" onClick={onOpenCreateCareer}>CREAR CARRERA</button>
        <button className="header-btn hidden-btn" type="button" onClick={onOpenCreateGroup}>CREAR GRUPO</button>
        <button className="header-btn hidden-btn" type="button">EXPORTAR</button>
      </div>
    </header>
  );
}

// Se exporta al objeto global para mantener simple la carga por scripts.
window.HeaderBar = HeaderBar;
