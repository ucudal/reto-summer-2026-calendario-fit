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
    addGroupToCalendar
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

  function saveGroupsToCalendar(schedules, subject, selectedYear) {
    // Convierte todos los schedules y grupos al formato de calendar classes
    const allClasses = [];

    schedules.forEach((schedule) => {
      schedule.groups.forEach((group) => {
        // Crea una clase por cada día seleccionado
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
          allClasses.push(classItem);
        });
      });
    });

    // Agrega todas las clases al calendario del año seleccionado
    if (allClasses.length > 0) {
      setData((prev) => addGroupToCalendar(prev, selectedYear, allClasses));
    }
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
