/*
  Archivo: subjectGroupsModalFunctions.js
  Que guarda:
  - Funciones de logica para manejar el flujo de SubjectGroupsModal.
  - No renderiza UI.
*/

function createSubjectGroupsModalHandlers(params) {
  const {
    setIsGroupsListOpen,
    setIsSubjectGroupsModalOpen,
    setSelectedSubject,
    setData,
    replaceSubjectGroupsInCalendar,
    subjects
  } = params;

  function openSubjectGroupsModal(subjectName) {
    setSelectedSubject(subjectName);
    setIsSubjectGroupsModalOpen(true);
    setIsGroupsListOpen(false);
  }

  function closeSubjectGroupsModal() {
    setIsSubjectGroupsModalOpen(false);
    setSelectedSubject(null);
  }

  function backToGroupsList() {
    closeSubjectGroupsModal();
    setIsGroupsListOpen(true);
  }

  // Función helper para extraer semestre y año de un string como "2do s 3er año" → { semester: "2do", year: "3" }
  function extractSemesterAndYear(semesterString) {
    if (!semesterString) return { semester: "1er", year: "1" };
    
    // Extrae semestre del inicio: "1er" o "2do"
    const semesterMatch = semesterString.match(/^(\d+(?:er|do))\s*s/i);
    const semester = semesterMatch ? semesterMatch[1].toLowerCase() : "1er";
    
    // Extrae año del final
    const yearMatch = semesterString.match(/(\d+)(?:er|do|to)?\s*a[ñn]o/i);
    const year = yearMatch ? yearMatch[1] : "1";
    
    return { semester, year };
  }

  function saveGroupsToCalendar(schedules, subject, _ignoredYear) {
    // Buscar la asignatura en subjects para obtener carrerasSemestre
    const subjectData = subjects.find(s => s.nombre === subject);
    
    if (!subjectData) {
      console.warn(`No se encontró información para la asignatura "${subject}". Usando semestre/año por defecto.`);
    }

    // Agrupar clases por semestre+año del calendario
    const classesByCalendar = {};

    schedules.forEach((schedule) => {
      schedule.groups.forEach((group) => {
        // Determinar semestre y año del calendario basándose en las carreras del grupo
        let targetSemester = "1er";
        let targetYear = "1";
        
        if (subjectData && subjectData.carrerasSemestre && group.assignedCareers.length > 0) {
          // Obtener semestre y año de todas las carreras asignadas al grupo
          const semesterYearPairs = group.assignedCareers
            .map(career => {
              const semesterInfo = subjectData.carrerasSemestre[career];
              return semesterInfo ? extractSemesterAndYear(semesterInfo) : null;
            })
            .filter(pair => pair !== null);
          
          // Usar el primer par encontrado (asumiendo que todas las carreras del grupo están en el mismo semestre/año)
          if (semesterYearPairs.length > 0) {
            targetSemester = semesterYearPairs[0].semester;
            targetYear = semesterYearPairs[0].year;
          }
        }

        // Crear clases para cada día del horario
        schedule.days.forEach((day) => {
          const classItem = {
            title: subject,
            group: group.name,
            detail: `Docentes: ${group.teachers.join(", ") || "Sin asignar"} | Carreras: ${group.assignedCareers.join(", ")}`,
            day: day,
            start: schedule.fromTime,
            end: schedule.toTime,
            type: "practice",
            careers: group.assignedCareers,
            teachers: group.teachers,
            plans: [] // Por ahora sin planes
          };
          
          // Agrupar por clave semestre+año
          const calendarKey = `${targetSemester}_${targetYear}`;
          if (!classesByCalendar[calendarKey]) {
            classesByCalendar[calendarKey] = { semester: targetSemester, year: targetYear, classes: [] };
          }
          classesByCalendar[calendarKey].classes.push(classItem);
        });
      });
    });

    // Guardar clases en cada calendario correspondiente
    Object.values(classesByCalendar).forEach((calendarData) => {
      setData((prev) =>
        replaceSubjectGroupsInCalendar(prev, calendarData.semester, calendarData.year, subject, calendarData.classes)
      );
    });
  }

  return {
    openSubjectGroupsModal,
    closeSubjectGroupsModal,
    backToGroupsList,
    saveGroupsToCalendar
  };
}

window.SubjectGroupsModalFunctions = {
  createSubjectGroupsModalHandlers
};
