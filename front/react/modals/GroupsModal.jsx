/*
  Componente: GroupsModal
  Que hace:
  - Muestra modal con listado de asignaturas que ya tienen grupos creados.
  - Permite buscar asignaturas alfabéticamente.
  - Permite agregar grupos de nuevas asignaturas.
*/

function GroupsModal(props) {
  const {
    isOpen,
    calendars,
    onClose,
    onAddNewSubject,
    onSelectSubject
  } = props;

  // Estado del buscador
  const [searchTerm, setSearchTerm] = React.useState("");

  // Si no esta abierto, no renderiza nada.
  if (!isOpen) return null;

  // Extrae todas las asignaturas únicas con conteo de grupos
  function getSubjectsWithGroupCount() {
    const subjectMap = new Map();
    
    calendars.forEach((calendar) => {
      calendar.classes.forEach((classItem) => {
        const title = classItem.title;
        if (!subjectMap.has(title)) {
          subjectMap.set(title, []);
        }
        subjectMap.get(title).push(classItem);
      });
    });
    
    // Convierte a array, ordena alfabéticamente y filtra por búsqueda
    return Array.from(subjectMap.entries())
      .map(([name, classes]) => ({
        name,
        groupCount: classes.length,
        groups: classes
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((subject) => 
        subject.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
  }

  const subjects = getSubjectsWithGroupCount();

  return (
    <div className="modal-backdrop groups-list-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="group-modal groups-list-modal" role="dialog" aria-modal="true" aria-labelledby="groupModalTitle">

        <div className="modal-header-with-button">
          <h2 id="groupModalTitle" className="modal-title">Grupos por asignatura</h2>
          <button 
            type="button" 
            className="modal-add-btn" 
            aria-label="Agregar grupos de nueva asignatura"
            onClick={onAddNewSubject}
          >
            +
          </button>
        </div>

        <div className="subject-search-container">
          <input
            type="text"
            className="subject-search-input"
            placeholder="Buscar asignatura..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="subjects-list">
          {subjects.length === 0 ? (
            <p className="no-subjects-message">
              {calendars.length === 0 
                ? "No hay calendarios disponibles" 
                : "No hay asignaturas con grupos"}
            </p>
          ) : (
            subjects.map((subject) => (
              <div 
                key={subject.name} 
                className="subject-item"
                onClick={() => onSelectSubject(subject.name)}
              >
                <div className="subject-info">
                  <span className="subject-name">{subject.name}</span>
                  <span className="subject-group-count">
                    {subject.groupCount} {subject.groupCount === 1 ? "grupo" : "grupos"}
                  </span>
                </div>
                <button 
                  type="button" 
                  className="subject-item-delete"
                  aria-label={`Eliminar ${subject.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

window.GroupsModal = GroupsModal;
