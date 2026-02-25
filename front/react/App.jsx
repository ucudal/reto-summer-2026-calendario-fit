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
    TIME_BLOCKS,
    ROW_HEIGHT,
    HEADER_HEIGHT,
    TIME_COL_WIDTH,
    COLOR_BY_TYPE,
    cloneInitialData,
    timeToMinutes,
    yearFromCalendarName,
    yearLabel
  } = window.AppData;
  const createCareerModalFns = window.CreateCareerModalFunctions;
  const createGroupModalFns = window.CreateGroupModalFunctions;
  const createTeacherModalFns = window.CreateTeacherModalFunctions;
  const groupsModalFns = window.GroupsModalFunctions;
  const subjectGroupsModalFns = window.SubjectGroupsModalFunctions;
  const createNewGroupModalFns = window.CreateNewGroupModalFunctions;

  // Estado raiz con datos del proyecto.
  const [data, setData] = React.useState(cloneInitialData());
  const plansByCareer = data.careerPlans || {};

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
    ...createNewGroupModalFns.createInitialGroupForm({
      DAYS,
      TIME_BLOCKS,
      selectedCareer,
      selectedPlan,
      plansByCareer
    })
  });

  // Estado visual del modal de carrera.
  const [isCreateCareerOpen, setIsCreateCareerOpen] = React.useState(false);

  // Estado de error del modal de carrera.
  const [careerModalError, setCareerModalError] = React.useState("");

  // Formulario del modal de carrera.
  const [careerForm, setCareerForm] = React.useState({
    nombre: ""
  });

  // Estado visual del modal de docente.
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = React.useState(false);

  // Estado de error del modal de docente.
  const [teacherModalError, setTeacherModalError] = React.useState("");

  // Formulario del modal de docente.
  const [teacherForm, setTeacherForm] = React.useState({
    nombre: "",
    apellido: "",
    correo: ""
  });

  // Estado visual del modal de semestre.
  const [isCreateSemesterOpen, setIsCreateSemesterOpen] = React.useState(false);

  // Estado de error del modal de semestre.
  const [semesterModalError, setSemesterModalError] = React.useState("");

  // Formulario del modal de semestre.
  const [semesterForm, setSemesterForm] = React.useState({
    sourceLectiveTerm: "",
    newLectiveName: ""
  });

  // Horas posibles para "desde".
  const hourOptionsFrom = React.useMemo(() => {
    return TIME_BLOCKS.map((block) => block.start);
  }, [TIME_BLOCKS]);

  // Horas posibles para "hasta".
  const hourOptionsTo = React.useMemo(() => {
    return TIME_BLOCKS.map((block) => block.end);
  }, [TIME_BLOCKS]);

    // Detectar semestre lectivo actual (del primero visible o del primero en general)
  const [currentLectiveTerm, setCurrentLectiveTerm] = React.useState(() => {
    if (data.calendars.length > 0) {
      return data.semesters[0] || "";
    }
    return "";
  });

  // Calendarios visibles para pintar y alertar.
  const visibleCalendars = data.calendars.filter(
    (calendar) => 
      calendar.visible &&
      calendar.lectiveTerm === currentLectiveTerm
    );

  const existingSubjectClasses = React.useMemo(() => {
    if (!selectedSubject) return [];

    const targetCalendar = findCalendarForYear("1", data.calendars);
    if (!targetCalendar) return [];

    return targetCalendar.classes.filter(
      (classItem) => classItem.title === selectedSubject && classItem.type === "practice"
    );
  }, [data.calendars, selectedSubject]);

  // Lista plana de alertas de calendarios visibles.
  const visibleAlerts = visibleCalendars.flatMap((calendar) => calendar.alerts);

  // Semestres disponibles para copiar (todas las carreras/planes).
  const availableSemesters = React.useMemo(() => {
    return data.calendars;
  }, [data.calendars]);

  // Devuelve los planes habilitados para las carreras elegidas en el modal.
  const availablePlansForGroup = React.useMemo(() => {
    const selectedCareers = groupForm.careers || [];
    const merged = selectedCareers.flatMap((career) => plansByCareer[career] || []);
    return [...new Set(merged)];
  }, [groupForm.careers, plansByCareer]);

  const createNewGroupHandlers = createNewGroupModalFns.createNewGroupModalHandlers({
    DAYS,
    TIME_BLOCKS,
    selectedCareer,
    selectedPlan,
    plansByCareer,
    setGroupForm,
    setModalError,
    setIsCreateNewGroupOpen,
    createGroupModalFns,
    groupForm,
    data,
    availablePlansForGroup,
    hourOptionsFrom,
    hourOptionsTo,
    timeToMinutes,
    yearLabel,
    findCalendarForYear,
    addGroupToCalendar,
    setData
  });

  const subjectGroupsModalHandlers = subjectGroupsModalFns.createSubjectGroupsModalHandlers({
    setIsGroupsListOpen,
    setIsSubjectGroupsModalOpen,
    setSelectedSubject,
    setData,
    replaceSubjectGroupsInCalendar
  });

  const groupsModalHandlers = groupsModalFns.createGroupsModalHandlers({
    setIsGroupsListOpen,
    openSubjectGroupsModal: subjectGroupsModalHandlers.openSubjectGroupsModal,
    openCreateNewGroupModal: createNewGroupHandlers.openCreateNewGroupModal
  });

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
    createCareerModalFns.confirmCreateCareer({
      careerForm,
      careers,
      setCareerModalError,
      setCareers,
      setSelectedCareer,
      closeCreateCareerModal
    });
  }

  // Abre modal para crear docente.
  function openCreateTeacherModal() {
    setTeacherForm({ nombre: "", apellido: "", correo: "" });
    setTeacherModalError("");
    setIsCreateTeacherOpen(true);
  }

  // Cierra modal de docente.
  function closeCreateTeacherModal() {
    setTeacherModalError("");
    setIsCreateTeacherOpen(false);
  }

  // Actualiza campo del modal de docente.
  function updateTeacherForm(field, value) {
    setTeacherForm((prev) => ({ ...prev, [field]: value }));
  }

  // Confirma creacion de docente (llama IPC a backend y guarda en BD).
  async function confirmCreateTeacher() {
    await createTeacherModalFns.confirmCreateTeacher({
      teacherForm,
      setTeacherModalError,
      closeCreateTeacherModal
    });
  }

  // Abre modal para crear semestre.
  function openCreateSemesterModal() {
    setSemesterForm({
      sourceLectiveTerm: "",
      newLectiveName: ""
    });
    setSemesterModalError("");
    setIsCreateSemesterOpen(true);
  }

  // Cierra modal de semestre.
  function closeCreateSemesterModal() {
    setSemesterModalError("");
    setIsCreateSemesterOpen(false);
  }

  // Actualiza campo del modal de semestre.
  function updateSemesterForm(field, value) {
    setSemesterForm((prev) => ({ ...prev, [field]: value }));
  }

  // Crea copias de todos los calendarios de un semestre lectivo con nuevo nombre.
  function confirmCreateSemester() {
    const { sourceLectiveTerm, newLectiveName } = semesterForm;

    const sourceTerm = String(sourceLectiveTerm || "").trim();
    const newName = String(newLectiveName || "").trim();

    if (!sourceTerm) {
      setSemesterModalError("Debe seleccionar el semestre lectivo a copiar.");
      return;
    }

    if (!newName) {
      setSemesterModalError("Debe ingresar el nombre del nuevo semestre lectivo.");
      return;
    }

    // Buscar todos los calendarios que pertenecen al semestre lectivo origen
    const calendarsToCopy = data.calendars.filter(
      (calendar) => calendar.lectiveTerm === sourceTerm
    );

    if (calendarsToCopy.length === 0) {
      setSemesterModalError("No hay calendarios para ese semestre lectivo.");
      return;
    }

    const timestamp = Date.now();

    // Crear copias con el nuevo nombre de semestre lectivo
    const newCalendars = calendarsToCopy.map((sourceCalendar, index) => ({
      id: `${sourceCalendar.id}-copy-${timestamp}-${index}`,
      name: sourceCalendar.name,
      subtitle: sourceCalendar.subtitle,
      plan: sourceCalendar.plan,
      year: sourceCalendar.year,
      period: sourceCalendar.period,
      lectiveTerm: newName,
      createdAt: timestamp,
      visible: true,
      classes: sourceCalendar.classes.map((clase) => ({ ...clase })),
      alerts: []
    }));

    // Ocultar calendarios del semestre origen y mostrar solo los nuevos
    setData((prev) => ({
      ...prev,
      calendars: prev.calendars
        .map((calendar) => {
          // Si pertenece al semestre origen, ocultarlo
          if (calendar.lectiveTerm === sourceTerm) {
            return { ...calendar, visible: false };
          }
          return calendar;
        })
        .concat(newCalendars)
    }));

    closeCreateSemesterModal();
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

  // Devuelve calendario destino segun año elegido.
  function findCalendarForYear(selectedYear, calendars) {
    const calendarsInContext = calendars.filter((calendar) => {
      if (calendar.subtitle !== selectedCareer) return false;
      if (calendar.plan && calendar.plan !== selectedPlan) return false;
      return true;
    });

    const calendarsOfYear = calendarsInContext.filter((calendar) => {
      const resolvedYear = calendar.year || yearFromCalendarName(calendar.name);
      return resolvedYear === selectedYear;
    });

    if (calendarsOfYear.length === 0) return null;

    const calendarsWithExplicitYear = calendarsOfYear.filter((calendar) => calendar.year === selectedYear);
    if (calendarsWithExplicitYear.length > 0) {
      return calendarsWithExplicitYear
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
    }

    // Prioriza uno visible del año; si no, toma el primero del año.
    return calendarsOfYear.find((calendar) => calendar.visible) || calendarsOfYear[0];
  }

  /*
    Funcion simple para principiantes:
    - Recibe el estado actual (prevData)
    - Busca el calendario del año elegido
    - Agrega el nuevo grupo al array "classes" de ese calendario
    - Devuelve el nuevo estado
  */
  function addGroupToCalendar(prevData, selectedYear, newGroups) {
    const targetCalendar = findCalendarForYear(selectedYear, prevData.calendars);

    // Si no existe calendario para ese año, no cambia nada.
    if (!targetCalendar) return prevData;

    return {
      ...prevData,
      calendars: prevData.calendars.map((calendar) => {
        if (calendar.id !== targetCalendar.id) return calendar;

        // Importante: NO reemplaza grupos existentes.
        // Siempre agrega al final, asi pueden coexistir varios
        // en el mismo dia y horario.
        return {
          ...calendar,
          classes: [...calendar.classes, ...newGroups]
        };
      })
    };
  }

  function replaceSubjectGroupsInCalendar(prevData, selectedYear, subject, newGroups) {
    const targetCalendar = findCalendarForYear(selectedYear, prevData.calendars);

    if (!targetCalendar) return prevData;

    return {
      ...prevData,
      calendars: prevData.calendars.map((calendar) => {
        if (calendar.id !== targetCalendar.id) return calendar;

        const classesWithoutSubjectPractice = calendar.classes.filter(
          (classItem) => !(classItem.title === subject && classItem.type === "practice")
        );

        return {
          ...calendar,
          classes: [...classesWithoutSubjectPractice, ...newGroups]
        };
      })
    };
  }



  const lectiveTerms = React.useMemo(() => {
    const termsSet = new Set(data.calendars.map((calendar) => calendar.lectiveTerm).filter(Boolean));
    return Array.from(termsSet);
  }, [data.calendars]);

  return (
    <>
      <HeaderBar
        careers={careers}
        plans={data.plans}
        selectedCareer={selectedCareer}
        selectedPlan={selectedPlan}
        currentLectiveTerm={currentLectiveTerm}
        onCareerChange={setSelectedCareer}
        onPlanChange={setSelectedPlan}
        onOpenCreateSemester={openCreateSemesterModal}
        onOpenCreateCareer={openCreateCareerModal}
        onOpenCreateGroup={groupsModalHandlers.openGroupsListModal}
        onLectiveTermChange={setCurrentLectiveTerm}
        lectiveTerms={data.semesters}
      />

      <main className="page">
        <section className="layout">
          <Sidebar
            calendars={data.calendars}
            onToggleCalendarVisible={toggleCalendarVisible}
            onOpenCreateGroup={groupsModalHandlers.openGroupsListModal}
            onOpenCreateTeacher={openCreateTeacherModal}
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
                  days={DAYS}
                  timeBlocks={TIME_BLOCKS}
                  rowHeight={ROW_HEIGHT}
                  headerHeight={HEADER_HEIGHT}
                  timeColWidth={TIME_COL_WIDTH}
                  colorByType={COLOR_BY_TYPE}
                />
              ))}
            </div>
          </section>
        </section>
      </main>

      <GroupsModal
        isOpen={isGroupsListOpen}
        calendars={visibleCalendars}
        subjectsList={undefined}
        onClose={groupsModalHandlers.closeGroupsListModal}
        onSelectSubject={groupsModalHandlers.openSubjectGroupsModal}
      />

      <SubjectGroupsModal
        isOpen={isSubjectGroupsModalOpen}
        subject={selectedSubject}
        careers={careers}
        days={DAYS}
        existingClasses={existingSubjectClasses}
        onBack={subjectGroupsModalHandlers.backToGroupsList}
        onClose={subjectGroupsModalHandlers.closeSubjectGroupsModal}
        onSaveGroups={subjectGroupsModalHandlers.saveGroupsToCalendar}
      />

      <CreateNewGroupModal
        isOpen={isCreateNewGroupOpen}
        form={groupForm}
        years={["1", "2", "3"]}
        days={DAYS}
        hourOptionsFrom={hourOptionsFrom}
        hourOptionsTo={hourOptionsTo}
        careerOptions={careers}
        planOptions={availablePlansForGroup}
        onClose={createNewGroupHandlers.closeCreateNewGroupModal}
        onChange={createNewGroupHandlers.updateGroupForm}
        onToggleList={createNewGroupHandlers.toggleGroupFormList}
        onSubmit={createNewGroupHandlers.confirmCreateGroup}
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

      <CreateTeacherModal
        isOpen={isCreateTeacherOpen}
        form={teacherForm}
        errorMessage={teacherModalError}
        onClose={closeCreateTeacherModal}
        onChange={updateTeacherForm}
        onSubmit={confirmCreateTeacher}
      />

      <CreateSemesterModal
        isOpen={isCreateSemesterOpen}
        form={semesterForm}
        availableSemesters={availableSemesters}
        errorMessage={semesterModalError}
        onClose={closeCreateSemesterModal}
        onChange={updateSemesterForm}
        onSubmit={confirmCreateSemester}
      />
    </>
  );
}

window.App = App;
