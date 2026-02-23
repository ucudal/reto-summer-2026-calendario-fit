/*
  Componente: App (componente principal)
  Que hace:
  - Guarda todo el estado principal.
  - Coordina componentes visuales.
  - Maneja crear grupo desde modal.
*/

function App() {
  const {
    DAYS,
    START_HOUR,
    END_HOUR,
    ROW_HEIGHT,
    HEADER_HEIGHT,
    TIME_COL_WIDTH,
    COLOR_BY_TYPE,
    cloneInitialData,
    timeToMinutes,
    formatHour,
    yearFromCalendarName,
    yearLabel
  } = window.AppData;

  // Estado raiz con datos del proyecto.
  const [data, setData] = React.useState(cloneInitialData());

  // Carreras de ejemplo actuales (fallback si DB no tiene datos).
  const exampleCareers = data.careers;

  // Lista real que se muestra en el dropdown de carreras.
  const [careers, setCareers] = React.useState(exampleCareers);

  // Estado de selects superiores.
  const [selectedCareer, setSelectedCareer] = React.useState(exampleCareers[0]);
  const [selectedPlan, setSelectedPlan] = React.useState(data.plans[0]);

  // Estado visual del modal de lista de grupos.
  const [isGroupsListOpen, setIsGroupsListOpen] = React.useState(false);

  // Estado visual del modal de gestión de grupos por asignatura.
  const [isSubjectGroupsModalOpen, setIsSubjectGroupsModalOpen] = React.useState(false);

  // Asignatura seleccionada para gestionar grupos.
  const [selectedSubject, setSelectedSubject] = React.useState(null);

  // Estado visual del modal de crear nuevo grupo.
  const [isCreateNewGroupOpen, setIsCreateNewGroupOpen] = React.useState(false);

  // Estado de error del modal de crear grupo.
  const [modalError, setModalError] = React.useState("");

  // Estado del formulario del modal.
  const [groupForm, setGroupForm] = React.useState({
    subject: "",
    day: DAYS[0],
    year: "1",
    fromTime: formatHour(START_HOUR),
    toTime: formatHour(START_HOUR + 2)
  });

  // Estado visual del modal de carrera.
  const [isCreateCareerOpen, setIsCreateCareerOpen] = React.useState(false);

  // Estado de error del modal de carrera.
  const [careerModalError, setCareerModalError] = React.useState("");

  // Formulario del modal de carrera.
  const [careerForm, setCareerForm] = React.useState({
    nombre: ""
  });

  // Horas posibles para "desde".
  const hourOptionsFrom = React.useMemo(() => {
    const list = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour += 1) list.push(formatHour(hour));
    return list;
  }, [START_HOUR, END_HOUR, formatHour]);

  // Horas posibles para "hasta".
  const hourOptionsTo = React.useMemo(() => {
    const list = [];
    for (let hour = START_HOUR + 1; hour <= END_HOUR; hour += 1) list.push(formatHour(hour));
    return list;
  }, [START_HOUR, END_HOUR, formatHour]);

  // Calendarios visibles para pintar y alertar.
  const visibleCalendars = data.calendars.filter((calendar) => calendar.visible);

  // Lista plana de alertas de calendarios visibles.
  const visibleAlerts = window.calculateAlerts(visibleCalendars);
  // Abre el modal para ver lista de grupos.
  function openGroupsListModal() {
    setIsGroupsListOpen(true);
  }

  // Cierra el modal de lista de grupos.
  function closeGroupsListModal() {
    setIsGroupsListOpen(false);
  }

  // Abre el modal de gestión de grupos por asignatura.
  function openSubjectGroupsModal(subjectName) {
    setSelectedSubject(subjectName);
    setIsSubjectGroupsModalOpen(true);
    setIsGroupsListOpen(false);
  }

  // Cierra el modal de gestión de grupos por asignatura.
  function closeSubjectGroupsModal() {
    setIsSubjectGroupsModalOpen(false);
    setSelectedSubject(null);
  }

  // Vuelve a la lista de grupos desde gestión de una asignatura.
  function backToGroupsList() {
    setIsSubjectGroupsModalOpen(false);
    setSelectedSubject(null);
    setIsGroupsListOpen(true);
  }

  // Abre el modal para crear un nuevo grupo.
  function openCreateNewGroupModal() {
    setGroupForm({
      subject: "",
      day: DAYS[0],
      year: "1",
      fromTime: formatHour(START_HOUR),
      toTime: formatHour(START_HOUR + 2)
    });
    setModalError("");
    setIsCreateNewGroupOpen(true);
  }

  // Cierra el modal de crear nuevo grupo.
  function closeCreateNewGroupModal() {
    setModalError("");
    setIsCreateNewGroupOpen(false);
  }

  // Abre el modal de crear nuevo grupo desde la lista de grupos.
  function handleAddNewSubjectFromList() {
    closeGroupsListModal();
    openCreateNewGroupModal();
  }

  // Abre modal para crear carrera.
  function openCreateCareerModal() {
    setCareerForm({ nombre: "" });
    setCareerModalError("");
    setIsCreateCareerOpen(true);
  }

  // Cierra modal de carrera.
  function closeCreateCareerModal() {
    setCareerModalError("");
    setIsCreateCareerOpen(false);
  }

  // Actualiza campo del modal de carrera.
  function updateCareerForm(field, value) {
    setCareerForm((prev) => ({ ...prev, [field]: value }));
  }

  // Crea carrera solo en frontend (sin backend).
  function confirmCreateCareer() {
    const nombre = String(careerForm.nombre || "").trim();

    if (!nombre) {
      setCareerModalError("El nombre de la carrera es obligatorio.");
      return;
    }

    if (careers.includes(nombre)) {
      setCareerModalError("Esa carrera ya existe.");
      return;
    }

    const merged = [...new Set([...careers, nombre])];
    setCareers(merged);
    setSelectedCareer(nombre);
    closeCreateCareerModal();
  }

  // Actualiza 1 campo del formulario del modal.
  function updateGroupForm(field, value) {
    setGroupForm((prev) => ({ ...prev, [field]: value }));
  }

  // Cambia visibilidad de calendario por id.
  function toggleCalendarVisible(calendarId, checked) {
    setData((prev) => ({
      ...prev,
      calendars: prev.calendars.map((calendar) =>
        calendar.id === calendarId ? { ...calendar, visible: checked } : calendar
      )
    }));
  }

  // Devuelve calendario destino segun anio elegido.
  function findCalendarForYear(selectedYear, calendars) {
    const calendarsOfYear = calendars.filter(
      (calendar) => yearFromCalendarName(calendar.name) === selectedYear
    );

    if (calendarsOfYear.length === 0) return null;

    // Prioriza uno visible del anio; si no, toma el primero del anio.
    return calendarsOfYear.find((calendar) => calendar.visible) || calendarsOfYear[0];
  }

  // Validaciones simples de horario.
  function validateTimes(fromTime, toTime) {
    const fromMinutes = timeToMinutes(fromTime);
    const toMinutes = timeToMinutes(toTime);
    const minMinutes = START_HOUR * 60;
    const maxMinutes = END_HOUR * 60;

    if (fromMinutes >= toMinutes) return "El horario 'desde' debe ser menor que 'hasta'.";
    if (fromMinutes < minMinutes || toMinutes > maxMinutes) {
      return `El horario debe estar entre ${START_HOUR}:00 y ${END_HOUR}:00.`;
    }
    return "";
  }

  // Confirma creacion del grupo en memoria.
  function confirmCreateGroup() {
    const subject = groupForm.subject.trim();
    const day = groupForm.day;
    const year = groupForm.year;
    const fromTime = groupForm.fromTime;
    const toTime = groupForm.toTime;

    if (!subject) {
      setModalError("La materia es obligatoria.");
      return;
    }

    const timeError = validateTimes(fromTime, toTime);
    if (timeError) {
      setModalError(timeError);
      return;
    }

    const target = findCalendarForYear(year, data.calendars);
    if (!target) {
      setModalError(`No existe un calendario para ${yearLabel(year)} anio.`);
      return;
    }

    const newClass = {
      title: subject,
      group: "Grupo creado manualmente",
      detail: "Sin aula asignada",
      day,
      start: fromTime,
      end: toTime,
      type: "practice"
    };

    setData((prev) => ({
      ...prev,
      calendars: prev.calendars.map((calendar) => {
        if (calendar.id !== target.id) return calendar;
        return {
          ...calendar,
          classes: [...calendar.classes, newClass]
        };
      })
    }));

    closeCreateNewGroupModal();
    openGroupsListModal();
  }

  return (
    <>
      <HeaderBar
        careers={careers}
        plans={data.plans}
        selectedCareer={selectedCareer}
        selectedPlan={selectedPlan}
        onCareerChange={setSelectedCareer}
        onPlanChange={setSelectedPlan}
        onOpenCreateCareer={openCreateCareerModal}
        onOpenCreateGroup={openGroupsListModal}
      />

      <main className="page">
        <section className="layout">
          <Sidebar
            calendars={data.calendars}
            onToggleCalendarVisible={toggleCalendarVisible}
            onOpenCreateGroup={openGroupsListModal}
            alerts={visibleAlerts}
          />

          <section className="main-column">

            <div className="schedules-root">
              {visibleCalendars.length === 0 && (
                <section className="card schedule-card">
                  No hay calendarios visibles. Marca al menos uno en la izquierda.
                </section>
              )}

              {visibleCalendars.map((calendar) => (
                <ScheduleGrid
                  key={calendar.id}
                  calendar={calendar}
                  alerts={visibleAlerts}
                  days={DAYS}
                  startHour={START_HOUR}
                  endHour={END_HOUR}
                  rowHeight={ROW_HEIGHT}
                  headerHeight={HEADER_HEIGHT}
                  timeColWidth={TIME_COL_WIDTH}
                  colorByType={COLOR_BY_TYPE}
                  timeToMinutes={timeToMinutes}
                />
              ))}
            </div>
          </section>
        </section>
      </main>

      <GroupsModal
        isOpen={isGroupsListOpen}
        calendars={visibleCalendars}
        onClose={closeGroupsListModal}
        onAddNewSubject={handleAddNewSubjectFromList}
        onSelectSubject={openSubjectGroupsModal}
      />

      <SubjectGroupsModal
        isOpen={isSubjectGroupsModalOpen}
        subject={selectedSubject}
        careers={careers}
        days={DAYS}
        onBack={backToGroupsList}
        onClose={closeSubjectGroupsModal}
      />

      <CreateNewGroupModal
        isOpen={isCreateNewGroupOpen}
        form={groupForm}
        years={["1", "2", "3"]}
        days={DAYS}
        hourOptionsFrom={hourOptionsFrom}
        hourOptionsTo={hourOptionsTo}
        onClose={closeCreateNewGroupModal}
        onChange={updateGroupForm}
        onSubmit={confirmCreateGroup}
        errorMessage={modalError}
      />

      <CreateCareerModal
        isOpen={isCreateCareerOpen}
        form={careerForm}
        errorMessage={careerModalError}
        onClose={closeCreateCareerModal}
        onChange={updateCareerForm}
        onSubmit={confirmCreateCareer}
      />
    </>
  );
}

window.App = App;
