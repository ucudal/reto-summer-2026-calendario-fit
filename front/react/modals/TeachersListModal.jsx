/*
  Componente: TeachersListModal
  Que hace:
  - Muestra modal con listado de docentes existentes.
  - Permite buscar docentes alfabéticamente.
  - Permite seleccionar un docente para ver/editar/eliminar.
  - Permite crear nuevo docente.
*/

function TeachersListModal(props) {
  const {
    isOpen,
    teachers,
    onClose,
    onSelectTeacher,
    onCreateNew
  } = props;

  // Estado del buscador
  const [searchTerm, setSearchTerm] = React.useState("");

  // Si no esta abierto, no renderiza nada.
  if (!isOpen) return null;

  // Filtra docentes según término de búsqueda
  const filteredTeachers = teachers
    .filter((teacher) => {
      const fullName = `${teacher.nombre} ${teacher.apellido}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || 
             teacher.correo.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const nameA = `${a.apellido} ${a.nombre}`;
      const nameB = `${b.apellido} ${b.nombre}`;
      return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
    });

  return (
    <div className="modal-backdrop groups-list-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="group-modal groups-list-modal" role="dialog" aria-modal="true" aria-labelledby="teachersModalTitle">

        <div className="modal-header-with-button">
          <h2 id="teachersModalTitle" className="modal-title">Gestión de Docentes</h2>
          <button type="button" className="modal-header-btn" onClick={onCreateNew}>
            + Nuevo Docente
          </button>
        </div>

        <div className="subject-search-container">
          <input
            type="text"
            className="subject-search-input"
            placeholder="Buscar docente por nombre o correo..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="subjects-list">
          {filteredTeachers.length === 0 ? (
            <p className="no-subjects-message">
              {teachers.length === 0 
                ? "No hay docentes disponibles" 
                : "No se encontraron docentes"}
            </p>
          ) : (
            filteredTeachers.map((teacher) => (
              <div 
                key={teacher.id} 
                className="subject-item"
                onClick={() => onSelectTeacher(teacher)}
              >
                <div className="subject-info">
                  <span className="subject-name">{teacher.apellido}, {teacher.nombre}</span>
                  <span className="subject-group-count">{teacher.correo}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

window.TeachersListModal = TeachersListModal;
