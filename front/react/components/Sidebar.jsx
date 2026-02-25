/*
  Sidebar izquierda.
  Acciones rápidas + filtro de calendarios visibles.
*/

function Sidebar(props) {
  const {
    calendars = [],
    onToggleCalendarVisible = () => {},
    onOpenSubjects = () => {},
    onOpenCreateGroup = () => {},
    onOpenCreateCareer = () => {},
    onOpenCreateTeacher = () => {},
    onExportExcel = () => {},
    onExportExcelDatos = () => {},
    onImportExcel = () => {},
    alerts = []
  } = props;

  const [isCalendarsDropdownOpen, setIsCalendarsDropdownOpen] = React.useState(false);

  return (
    <aside className="sidebar">
      <div className="card side-card">
        <button className="action-btn" type="button" onClick={onOpenSubjects}>ASIGNATURAS</button>
        <button className="action-btn" type="button" onClick={onOpenCreateCareer}>CARRERAS</button>
        <button className="action-btn" type="button" onClick={onOpenCreateTeacher}>DOCENTES</button>
        <button className="action-btn" type="button" onClick={onOpenCreateGroup}>GRUPOS</button>
      </div>

      <div className="card side-card">
        <h2 className="side-title">Calendarios visibles</h2>

        <div className="calendar-dropdown">
          <button
            type="button"
            className="calendar-dropdown-trigger"
            onClick={() => setIsCalendarsDropdownOpen((prev) => !prev)}
          >
            Seleccionar calendarios
          </button>

          {isCalendarsDropdownOpen && (
            <div className="calendar-dropdown-menu">
              <div className="calendar-list">
                {calendars.map((calendar) => (
                  <label key={calendar.id} className="calendar-option">
                    <input
                      type="checkbox"
                      checked={Boolean(calendar.visible)}
                      onChange={(event) => onToggleCalendarVisible(calendar.id, event.target.checked)}
                    />
                    <span>{calendar.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card side-card alerts-side">
        <h2 className="side-title">Alertas activas</h2>
        <div className="alerts-scroll">
          {alerts.length === 0 && (
            <div className="no-alerts">No hay alertas para los calendarios seleccionados.</div>
          )}

          <ul className="alerts-list">
            {alerts.map((message, index) => (
              <li key={`${message}-${index}`} className="alert-item">
                <span className="alert-icon">❗</span>
                <div className="alert-text">{message}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button className="export-btn" type="button" onClick={onExportExcel}>EXPORTAR CALENDARIO EXCEL</button>
      <button className="export-btn" type="button" onClick={onExportExcelDatos}>EXPORTAR EXCEL (PARA USO INTERNO)</button>
      <button className="export-btn" type="button" onClick={onImportExcel}>IMPORTAR EXCEL (MODULOS)</button>
    </aside>
  );
}

window.Sidebar = Sidebar;
