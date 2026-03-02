/*
  Componente: GroupsModal
  Que hace:
  - Muestra modal con listado de materias.
  - Carga materias desde la BD (window.api.materias.listar).
  - Permite buscarlas y abrir detalle por materia.
*/

function GroupsModal(props) {
  const {
    isOpen,
    calendars,
    subjectsList,
    selectedCareer,
    onClose,
    onSelectSubject
  } = props;

  // Estado del buscador
  const [searchTerm, setSearchTerm] = React.useState("");
  const [dbSubjects, setDbSubjects] = React.useState([]);
  const [groupCountBySubject, setGroupCountBySubject] = React.useState({});
  const [isLoadingSubjects, setIsLoadingSubjects] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;

    const hasRealSubjects = Array.isArray(subjectsList) && subjectsList.length > 0;
    if (hasRealSubjects) {
      setDbSubjects([]);
      setIsLoadingSubjects(false);
      return;
    }

    let isMounted = true;
    setIsLoadingSubjects(true);

    async function loadSubjectsFromDb() {
      try {
        if (!window.api?.materias?.listar) {
          if (isMounted) setDbSubjects([]);
          return;
        }

        const response = await window.api.materias.listar();
        if (!isMounted) return;

        if (!response?.success || !Array.isArray(response.data)) {
          setDbSubjects([]);
          return;
        }

        const names = response.data
          .map((item) => String(item?.nombre || "").trim())
          .filter(Boolean);

        setDbSubjects([...new Set(names)]);

        if (window.api?.grupos?.listar) {
          const groupsResponse = await window.api.grupos.listar();
          if (!isMounted) return;

          if (groupsResponse?.success && Array.isArray(groupsResponse.data)) {
            const normalize = (value) =>
              String(value || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();

            const selectedCareerNormalized = normalize(selectedCareer);
            const counts = {};

            groupsResponse.data.forEach((groupItem) => {
              const subjectName = String(groupItem?.nombreMateria || "").trim();
              if (!subjectName) return;

              const groupCareers = Array.isArray(groupItem?.carreras) ? groupItem.carreras : [];
              if (selectedCareerNormalized) {
                const matchesCareer = groupCareers.some(
                  (careerName) => normalize(careerName) === selectedCareerNormalized
                );
                if (!matchesCareer) return;
              }

              counts[subjectName] = (counts[subjectName] || 0) + 1;
            });

            setGroupCountBySubject(counts);
          } else {
            setGroupCountBySubject({});
          }
        } else {
          setGroupCountBySubject({});
        }
      } catch (error) {
        if (isMounted) {
          setDbSubjects([]);
          setGroupCountBySubject({});
        }
      } finally {
        if (!isMounted) return;
        setIsLoadingSubjects(false);
      }
    }

    loadSubjectsFromDb();

    return () => {
      isMounted = false;
    };
  }, [isOpen, subjectsList, selectedCareer]);

  // Si no esta abierto, no renderiza nada.
  if (!isOpen) return null;

  // Extrae todas las asignaturas únicas con conteo de grupos
  function getSubjectsWithGroupCount() {
    // Usar subjectsList para mostrar todas, protegiendo null/undefined
    const hasRealSubjects = Array.isArray(subjectsList) && subjectsList.length > 0;
    const safeSubjects = hasRealSubjects ? subjectsList : dbSubjects;
    return safeSubjects
      .map((name) => {
        const groups = Number(groupCountBySubject[name] || 0);
        return {
          name,
          groupCount: groups
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
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

window.GroupsModal = GroupsModal;
