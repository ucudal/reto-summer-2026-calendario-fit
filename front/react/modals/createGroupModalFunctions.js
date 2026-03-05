/*
  Archivo: createGroupModalFunctions.js
  Que guarda:
  - Funciones de logica del modal "Crear grupo".
  - No renderiza UI.
*/

function validateTimes(params) {
  const { fromTime, toTime, hourOptionsFrom, hourOptionsTo, timeToMinutes } = params;

  const fromMinutes = timeToMinutes(fromTime);
  const toMinutes = timeToMinutes(toTime);
  const validFrom = hourOptionsFrom.includes(fromTime);
  const validTo = hourOptionsTo.includes(toTime);

  if (fromMinutes >= toMinutes) return "El horario 'desde' debe ser menor que 'hasta'.";
  if (!validFrom || !validTo) return "Elegi horarios validos de los bloques disponibles.";
  return "";
}

function confirmCreateGroup(params) {
  const {
    groupForm,
    data,
    hourOptionsFrom,
    hourOptionsTo,
    timeToMinutes,
    setModalError,
    yearLabel,
    findCalendarForYear,
    addGroupToCalendar,
    setData,
    closeCreateGroupModal
  } = params;

  const subject = String(groupForm.subject || "").trim();
  const selectedDays = groupForm.days || [];
  const year = groupForm.year;
  const fromTime = groupForm.fromTime;
  const toTime = groupForm.toTime;
  const selectedCareers = groupForm.careers || [];

  if (!subject) {
    setModalError("La materia es obligatoria.");
    return;
  }
  if (selectedDays.length === 0) {
    setModalError("Selecciona al menos un dia.");
    return;
  }
  if (selectedCareers.length === 0) {
    setModalError("Selecciona al menos una carrera.");
    return;
  }

  const timeError = validateTimes({
    fromTime,
    toTime,
    hourOptionsFrom,
    hourOptionsTo,
    timeToMinutes
  });
  if (timeError) {
    setModalError(timeError);
    return;
  }

  const target = findCalendarForYear(year, data.calendars);
  if (!target) {
    setModalError(`No existe un calendario para ${yearLabel(year)} año.`);
    return;
  }

  const newClasses = selectedDays.map((day) => ({
    title: subject,
    group: "Grupo creado manualmente",
    detail: `Carreras: ${selectedCareers.join(", ")}`,
    day,
    start: fromTime,
    end: toTime,
    type: "practice",
    careers: selectedCareers
  }));

  // @todo falta todo lo base, ACA BD NO OLVIDAR BD
  // Aca va la llamada para guardar el/los grupos en base de datos.
  // Ejemplo futuro: await backend.grupos.crear({ ...payloadConDiasCarrerasPlanes });

  setData((prev) => addGroupToCalendar(prev, year, newClasses));
  closeCreateGroupModal();
}

window.CreateGroupModalFunctions = {
  confirmCreateGroup,
  validateTimes
};
