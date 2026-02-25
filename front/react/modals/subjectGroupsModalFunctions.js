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
    replaceSubjectGroupsInCalendar
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
            teachers: group.teachers
          };
          allClasses.push(classItem);
        });
      });
    });

    // Sincroniza clases de la asignatura en el calendario del año seleccionado
    // (reemplaza grupos previos de práctica de la misma asignatura).
    setData((prev) =>
      replaceSubjectGroupsInCalendar(prev, selectedYear, subject, allClasses)
    );
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
