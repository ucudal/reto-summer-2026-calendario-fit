/*
  Componente: Sidebar
  Que hace:
  - Muestra acciones rapidas.
  - Muestra checkboxes de calendarios visibles.
  - Permite abrir modal de crear grupo.
*/

function Sidebar(props) {
  const {
    calendars,
    onToggleCalendarVisible,
    onOpenCreateGroup,
    onExportExcel,
    onImportExcel
  } = props;

  return (
    <aside className="sidebar">
      <div className="card side-card">
        <h2 className="side-title">Acciones rapidas</h2>
        <button className="action-btn action-btn-main" type="button">CREAR ASIGNATURA</button>
        <button className="action-btn" type="button">CREAR DOCENTE</button>
        <button className="action-btn" type="button" onClick={onOpenCreateGroup}>CREAR GRUPO</button>
      </div>

      <div className="card side-card">
        <h2 className="side-title">Calendarios visibles</h2>

        <div className="calendar-list">
          {calendars.map((calendar) => (
            <label key={calendar.id} className="calendar-option">
              <input
                type="checkbox"
                checked={calendar.visible}
                onChange={(event) => onToggleCalendarVisible(calendar.id, event.target.checked)}
              />
              <span>{calendar.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="export-btn" type="button" onClick={onExportExcel}>EXPORTAR EXCEL (PARA USO INTERNO)</button>
      <button className="export-btn" type="button" onClick={onImportExcel}>IMPORTAR EXCEL (MODULOS)</button>
    </aside>
  );
}

window.Sidebar = Sidebar;
