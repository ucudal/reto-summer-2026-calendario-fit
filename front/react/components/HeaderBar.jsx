/*
  Header principal.
  Muestra carrera seleccionada y botones de acciones.
*/

function HeaderBar(props) {
  const {
    careers = [],
    lectiveTerms = [],
    selectedCareer = "",
    currentLectiveTerm = "",
    onCareerChange = () => {},
    onLectiveTermChange = () => {},
    onOpenCreateSemester = () => {},
    onOpenCreateCareer = () => {},
    onOpenCreateGroup = () => {}
  } = props;

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="header-title">Sistema de gestion de calendarios academicos | Facultad de Ingeniería y Tecnología</div>
        <img
          src="./react/assets/Logo-Universidad-Catolica.svg"
          alt="Logo Universidad Catolica del Uruguay"
          className="header-logo"
        />
      </div>

      <div className="header-controls">
        <div className="header-controls-left">
          <select className="header-select" value={selectedCareer} onChange={(event) => onCareerChange(event.target.value)}>
            {careers.map((career) => (
              <option key={career} value={career}>{career}</option>
            ))}
          </select>

          <select
            className="header-select"
            value={currentLectiveTerm}
            onChange={(event) => onLectiveTermChange(event.target.value)}
          >
            {lectiveTerms.length === 0 && (
              <option value="">Sin semestres lectivos</option>
            )}
            {lectiveTerms.map((term) => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>

          <button className="header-btn hidden-btn" type="button" onClick={onOpenCreateCareer}>CREAR CARRERA</button>
          <button className="header-btn hidden-btn" type="button" onClick={onOpenCreateGroup}>CREAR GRUPO</button>
        </div>

        <div className="header-controls-right">
          <button className="header-btn" type="button" onClick={onOpenCreateSemester}>CREAR NUEVO SEMESTRE LECTIVO +</button>
        </div>
      </div>
    </header>
  );
}

window.HeaderBar = HeaderBar;
