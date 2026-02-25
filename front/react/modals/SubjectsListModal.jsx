/*
  Componente: SubjectsListModal
  Que hace:
  - Muestra modal con listado de materias/asignaturas existentes.
  - Permite buscar materias alfabéticamente.
  - Permite seleccionar una materia para ver/editar/eliminar.
  - Permite crear nueva materia.
*/

function SubjectsListModal(props) {
  const {
    isOpen,
    subjects,
    onClose,
    onSelectSubject,
    onCreateNew
  } = props;

  // Estado del buscador
  const [searchTerm, setSearchTerm] = React.useState("");

  // Si no esta abierto, no renderiza nada.
  if (!isOpen) return null;

  // Filtra materias según término de búsqueda
  const filteredSubjects = subjects
    .filter((subject) => subject.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

  return (
    <div className="modal-backdrop groups-list-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="group-modal groups-list-modal" role="dialog" aria-modal="true" aria-labelledby="subjectsModalTitle">

        <div className="modal-header-with-button">
          <h2 id="subjectsModalTitle" className="modal-title">Gestión de Asignaturas</h2>
          <button type="button" className="modal-header-btn" onClick={onCreateNew}>
            + Nueva Asignatura
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
          {filteredSubjects.length === 0 ? (
            <p className="no-subjects-message">
              {subjects.length === 0 
                ? "No hay asignaturas disponibles" 
                : "No se encontraron asignaturas"}
            </p>
          ) : (
            filteredSubjects.map((subject) => (
              <div 
                key={subject.id} 
                className="subject-item"
                onClick={() => onSelectSubject(subject)}
              >
                <div className="subject-info">
                  <span className="subject-name">{subject.nombre}</span>
                  <span className="subject-meta">Tipo {subject.tipo} • {subject.creditos} créditos</span>
                  {subject.requerimientosSalon && (
                    <span className="subject-requirements">Req: {subject.requerimientosSalon}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

window.SubjectsListModal = SubjectsListModal;
