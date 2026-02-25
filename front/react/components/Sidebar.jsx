/*
  Componente: Sidebar
  Que hace:
  - Muestra acciones rapidas.
  - Muestra checkboxes de calendarios visibles.
  - Permite abrir modal de crear grupo.
*/

function Sidebar(props) {

    const {
        onExportExcel,
        calendars,
        onToggleCalendarVisible,
        onOpenCreateGroup,
        onOpenCreateCareer,
        onOpenCreateTeacher,
        alerts = []
    } = props;

    const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = React.useState(false);

    // Cierra el dropdown cuando se hace clic fuera
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (isCalendarDropdownOpen && !event.target.closest('.calendar-dropdown-container')) {
                setIsCalendarDropdownOpen(false);
            }
        }

        if (isCalendarDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isCalendarDropdownOpen]);

    return (
        <aside className="sidebar">
            <div className="card side-card">
                <button className="action-btn" type="button">ASIGNATURAS</button>
                <button className="action-btn" type="button" onClick={onOpenCreateCareer}>CARRERAS</button>
                <button className="action-btn" type="button" onClick={onOpenCreateTeacher}>DOCENTES</button>
                <button className="action-btn" type="button" onClick={onOpenCreateGroup}>GRUPOS</button>
            </div>

            <div className="card side-card">
                <h2 className="side-title">Calendarios visibles</h2>

                <div className="calendar-dropdown-container">
                    <button
                        type="button"
                        className="calendar-dropdown-btn"
                        onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
                    >
                        {calendars.filter(c => c.visible).length} de {calendars.length} calendarios
                        <span className={`dropdown-arrow ${isCalendarDropdownOpen ? 'open' : ''}`}>▼</span>
                    </button>

                    {isCalendarDropdownOpen && (
                        <div className="calendar-dropdown-menu">
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

            <button className="export-btn" type="button">IMPORTAR DATOS</button>
            <button className="export-btn" type="button" onClick={onExportExcel}>EXPORTAR CALENDARIO EXCEL</button>
            <button className="export-btn" type="button">EXPORTAR EXCEL PARA USO INTERNO</button>
        </aside>
    );
}

window.Sidebar = Sidebar;
