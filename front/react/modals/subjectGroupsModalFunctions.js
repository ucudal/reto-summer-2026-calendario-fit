/*
  Archivo: subjectGroupsModalFunctions.js
  Que guarda:
  - Funciones de logica para manejar el flujo de SubjectGroupsModal.
  - No renderiza UI.
*/

let openSubjectGroupsModalRequester = null;

function registerOpenSubjectGroupsModalRequester(handler) {
  if (typeof handler !== "function") return () => {};
  openSubjectGroupsModalRequester = handler;

  return () => {
    if (openSubjectGroupsModalRequester === handler) {
      openSubjectGroupsModalRequester = null;
    }
  };
}

function requestOpenSubjectGroupsModal(payload) {
  if (typeof openSubjectGroupsModalRequester === "function") {
    openSubjectGroupsModalRequester(payload);
  }
}

function createSubjectGroupsModalHandlers(params) {
  const {
    setIsGroupsListOpen,
    setIsSubjectGroupsModalOpen,
    setSelectedSubject,
    setData,
    replaceSubjectGroupsInCalendar,
    replaceSingleGroupInCalendar
  } = params;

  function openSubjectGroupsModal(subjectOrPayload) {
    if (typeof subjectOrPayload === "string") {
      setSelectedSubject(subjectOrPayload);
    } else {
      const payload = subjectOrPayload || {};
      const subjectName = String(payload.subjectName || payload.name || "").trim();
      if (!subjectName) return;

      setSelectedSubject({
        name: subjectName,
        mode: payload.mode === "edit" ? "edit" : "create",
        calendarId: String(payload.calendarId || "").trim(),
        selectedYear: String(payload.selectedYear || "").trim(),
        draft: payload.draft || null
      });
    }

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

  function saveGroupsToCalendar(schedules, subject, selectedYear, options = {}) {
    // Convierte todos los schedules y grupos al formato de calendar classes
    const allClasses = [];
    const groupRefFromOptions = String(options.groupRef || "").trim();

    schedules.forEach((schedule) => {
      schedule.groups.forEach((group) => {
        const groupRef = String(groupRefFromOptions || group.groupRef || group.name || "").trim();

        // Crea una clase por cada día seleccionado
        schedule.days.forEach((day) => {
          const classItem = {
            title: subject,
            group: group.name,
            classNumber: group.name,
            groupRef,
            detail: `Docentes: ${group.teachers.join(", ") || "Sin asignar"} | Carreras: ${group.assignedCareers.join(", ")}`,
            day: day,
            start: schedule.fromTime,
            end: schedule.toTime,
            type: "practice",
            color: group.color,
            careers: group.assignedCareers,
            teachers: group.teachers
          };
          allClasses.push(classItem);
        });
      });
    });

    // Sincroniza clases de la asignatura en el calendario del año seleccionado
    // (reemplaza grupos previos de práctica de la misma asignatura).
    setData((prev) => {
      if (options.mode === "edit" && replaceSingleGroupInCalendar) {
        return replaceSingleGroupInCalendar(
          prev,
          options.calendarId,
          selectedYear,
          subject,
          options.groupRef,
          allClasses
        );
      }

      return replaceSubjectGroupsInCalendar(prev, selectedYear, subject, allClasses);
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
  createSubjectGroupsModalHandlers,
  registerOpenSubjectGroupsModalRequester,
  requestOpenSubjectGroupsModal
};
