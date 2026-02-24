/*
  Componente: GroupsModal
  Que hace:
  - Muestra modal con listado de asignaturas que ya tienen grupos creados.
  - Permite buscar asignaturas alfabéticamente.
  - Permite agregar grupos de nuevas asignaturas.
*/

function fetchMockSubjects() {
  const mockSubjects = [
    "Matematica Basica",
    "Algebra",
    "Programacion I",
    "Programacion II",
    "Arquitectura de Computadoras",
    "Base de Datos",
    "Sistemas Operativos",
    "Fisica I"
  ];

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockSubjects), 450);
  });
}

function GroupsModal(props) {
  const {
    isOpen,
    calendars,
    subjectsList,
    selectedCareer,
    onClose,
    onAddNewSubject,
    onSelectSubject
  } = props;

  // Estado del buscador
  const [searchTerm, setSearchTerm] = React.useState("");
  const [mockSubjects, setMockSubjects] = React.useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    const hasRealSubjects = Array.isArray(subjectsList) && subjectsList.length > 0;
    if (hasRealSubjects) {
      setMockSubjects([]);
      setIsLoadingSubjects(false);
      return;
    }

    let isMounted = true;
    setIsLoadingSubjects(true);

    fetchMockSubjects()
      .then((subjectsFromMockBackend) => {
        if (!isMounted) return;
        setMockSubjects(subjectsFromMockBackend);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingSubjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, subjectsList]);

  // Si no esta abierto, no renderiza nada.
  if (!isOpen) return null;

  // Extrae todas las asignaturas únicas con conteo de grupos
  function getSubjectsWithGroupCount() {
    // Mapear asignaturas a grupos existentes
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

    // Usar subjectsList para mostrar todas, protegiendo null/undefined
    const hasRealSubjects = Array.isArray(subjectsList) && subjectsList.length > 0;
    const safeSubjects = hasRealSubjects ? subjectsList : mockSubjects;
    return safeSubjects
      .map((name) => {
        const groups = subjectMap.get(name) || [];
        return {
          name,
          groupCount: groups.length,
          groups
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
      .filter((subject) => subject.name.toLowerCase().startsWith(searchTerm.toLowerCase()));
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
          {isLoadingSubjects ? (
            <p className="no-subjects-message">Cargando asignaturas...</p>
          ) : subjects.length === 0 ? (
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
