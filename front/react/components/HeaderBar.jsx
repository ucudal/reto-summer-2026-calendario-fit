/*
  Header principal.
  Muestra carrera seleccionada y botones de acciones.
*/

function HeaderBar(props) {
  const {
    careers = [],
    selectedCareer = "",
    currentLectiveTerm = "",
    onCareerChange = () => { },
    onOpenCreateSemester = () => { },
    onOpenCreateCareer = () => { },
    onOpenCreateGroup = () => { },
    availableLectiveTerms = [],
    selectedLectiveTerm = "",
    onLectiveTermChange = () => { },
  } = props;

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="header-title">Sistema de gestion de calendarios academicos</div>
        <img
          src="./react/assets/Logo-Universidad-Catolica.svg"
          alt="Logo Universidad Catolica del Uruguay"
          className="header-logo"
        />
      </div>

      <div className="header-controls">
        <select className="header-select" value={selectedCareer} onChange={(event) => onCareerChange(event.target.value)}>
          {careers.map((career) => (
            <option key={career} value={career}>{career}</option>
          ))}
        </select>

        <select
          className="header-select"
          value={selectedLectiveTerm}
          onChange={(e) => onLectiveTermChange(e.target.value)}
        >
          <option value="">Todos los semestres</option>

          {availableLectiveTerms.map(term => (
            <option key={term.idSemestre} value={term.idSemestre}>
              {formatLectiveTerm(term)}
            </option>
          ))}
        </select>

        <button className="header-btn" type="button" onClick={onOpenCreateSemester}>CREAR NUEVO SEMESTRE +</button>
        <button className="header-btn hidden-btn" type="button" onClick={onOpenCreateCareer}>CREAR CARRERA</button>
        <button className="header-btn hidden-btn" type="button" onClick={onOpenCreateGroup}>CREAR GRUPO</button>
      </div>
    </header>
  );
}

window.HeaderBar = HeaderBar;
