/*
  Componente: App (componente principal)
  Que hace:
  - Guarda todo el estado principal.
  - Coordina componentes visuales.
  - Carga grupos desde DB y los pinta en calendario.
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

  const [data, setData] = React.useState(cloneInitialData());

  const exampleCareers = data.careers;
  const [careers, setCareers] = React.useState(exampleCareers);
  const [selectedCareer, setSelectedCareer] = React.useState(exampleCareers[0]);
  const [dbGroups, setDbGroups] = React.useState([]);

  const [isGroupsListOpen, setIsGroupsListOpen] = React.useState(false);
  const [isSubjectGroupsModalOpen, setIsSubjectGroupsModalOpen] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState(null);

  const [isCreateNewGroupOpen, setIsCreateNewGroupOpen] = React.useState(false);
  const [modalError, setModalError] = React.useState("");

  const [groupForm, setGroupForm] = React.useState(
    createNewGroupModalFns.createInitialGroupForm({
      DAYS,
      TIME_BLOCKS,
      selectedCareer
    })
  );

  const [isCreateCareerOpen, setIsCreateCareerOpen] = React.useState(false);
  const [careerModalError, setCareerModalError] = React.useState("");
  const [careerForm, setCareerForm] = React.useState({ nombre: "" });

  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = React.useState(false);
  const [teacherModalError, setTeacherModalError] = React.useState("");
  const [teacherForm, setTeacherForm] = React.useState({
    nombre: "",
    apellido: "",
    correo: ""
  });

  const hourOptionsFrom = React.useMemo(() => TIME_BLOCKS.map((block) => block.start), [TIME_BLOCKS]);
  const hourOptionsTo = React.useMemo(() => TIME_BLOCKS.map((block) => block.end), [TIME_BLOCKS]);

  const visibleCalendars = data.calendars.filter((calendar) => calendar.visible);
  const visibleAlerts = visibleCalendars.flatMap((calendar) => calendar.alerts);

  function findCalendarForYear(selectedYear, calendars) {
    const calendarsOfYear = calendars.filter(
      (calendar) => yearFromCalendarName(calendar.name) === selectedYear
    );

    if (calendarsOfYear.length === 0) return null;
    return calendarsOfYear.find((calendar) => calendar.visible) || calendarsOfYear[0];
  }

  function addGroupToCalendar(prevData, selectedYear, newGroups) {
    const targetCalendar = findCalendarForYear(selectedYear, prevData.calendars);
    if (!targetCalendar) return prevData;

    return {
      ...prevData,
      calendars: prevData.calendars.map((calendar) => {
        if (calendar.id !== targetCalendar.id) return calendar;
        return {
          ...calendar,
          visible: true,
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
          visible: true,
          classes: [...classesWithoutSubjectPractice, ...newGroups]
        };
      })
    };
  }

  const existingSubjectClasses = React.useMemo(() => {
    if (!selectedSubject) return [];

    const targetCalendar = findCalendarForYear("1", data.calendars);
    if (!targetCalendar) return [];

    return targetCalendar.classes.filter(
      (classItem) => classItem.title === selectedSubject && classItem.type === "practice"
    );
  }, [data.calendars, selectedSubject]);

  function normalizeDayToUi(dayText) {
    const value = String(dayText || "").trim().toLowerCase();
    if (value === "lunes" || value === "lun") return "LUN";
    if (value === "martes" || value === "mar") return "MAR";
    if (value === "miercoles" || value === "miércoles" || value === "mie") return "MIE";
    if (value === "jueves" || value === "jue") return "JUE";
    if (value === "viernes" || value === "vie") return "VIE";
    if (value === "sabado" || value === "sábado" || value === "sab") return "SAB";
    return "";
  }

  function getCalendarIdFromDbGroup(grupo) {
    const semestre = Number(grupo.semestre || 1);
    const rawAnio = Number(grupo.anio || 1);
    const anio = rawAnio >= 1 && rawAnio <= 5 ? rawAnio : 1;
    const sem = semestre === 2 ? 2 : 1;
    return `s${sem}y${anio}`;
  }

  function mapDbGroupToClasses(grupo) {
    const horarios = Array.isArray(grupo.horarios) ? grupo.horarios : [];
    const title = grupo.nombreMateria || `Materia ${grupo.idMateria}`;
    const teachers = Array.isArray(grupo.docentes) ? grupo.docentes : [];

    return horarios
      .map((h) => {
        const modulo = Number(h.modulo);
        const block = TIME_BLOCKS[modulo - 1];
        const day = normalizeDayToUi(h.dia);
        if (!block || !day) return null;

        return {
          title,
          groupCode: `G-${grupo.id}`,
          classNumber: grupo.codigo || "",
          credits: Number(grupo.creditosMateria || 0),
          teachers,
          day,
          start: block.start,
          end: block.end,
          type: "practice"
        };
      })
      .filter(Boolean);
  }

  const reloadGroupsFromDb = React.useCallback(async () => {
    try {
      if (!window.api?.grupos?.listar) return;
      const response = await window.api.grupos.listar();
      if (!response?.success || !Array.isArray(response.data)) return;
      setDbGroups(response.data);
    } catch (error) {
      console.error("No se pudieron recargar grupos desde DB:", error);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function loadCareersFromDb() {
      try {
        if (!window.api?.carreras?.listar) return;
        const response = await window.api.carreras.listar();
        if (cancelled) return;
        if (!response?.success || !Array.isArray(response.data)) return;

        const names = response.data
          .map((item) => String(item?.nombre || "").trim())
          .filter(Boolean);

        if (names.length > 0) {
          setCareers(names);
          setSelectedCareer((prev) => (names.includes(prev) ? prev : names[0]));
        }
      } catch (error) {
        console.error("No se pudieron cargar carreras desde DB:", error);
      }
    }

    loadCareersFromDb();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let isCancelled = false;

    async function loadGroupsFromDb() {
      try {
        const response = await (window.api?.grupos?.listar?.() || Promise.resolve(null));
        if (!response?.success || !Array.isArray(response.data)) return;
        if (isCancelled) return;
        setDbGroups(response.data);
      } catch (error) {
        console.error("No se pudieron cargar grupos desde DB:", error);
      }
    }

    loadGroupsFromDb();
    return () => {
      isCancelled = true;
    };
  }, [TIME_BLOCKS]);

  React.useEffect(() => {
    function normalizeText(value) {
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    const classesByCalendar = new Map();
    const allGroupCareerNames = new Set();
    for (const grupo of dbGroups) {
      const groupCareers = Array.isArray(grupo.carreras) ? grupo.carreras : [];
      for (const careerName of groupCareers) {
        allGroupCareerNames.add(normalizeText(careerName));
      }
    }
    const selectedCareerNormalized = normalizeText(selectedCareer);
    const shouldApplyCareerFilter =
      selectedCareerNormalized && allGroupCareerNames.has(selectedCareerNormalized);

    const filteredGroups = dbGroups.filter((grupo) => {
      const groupCareers = Array.isArray(grupo.carreras) ? grupo.carreras : [];
      if (!selectedCareer) return true;
      if (!shouldApplyCareerFilter) return true;
      if (groupCareers.length === 0) return true;
      return groupCareers.some((careerName) => normalizeText(careerName) === selectedCareerNormalized);
    });

    for (const grupo of filteredGroups) {
      const calendarId = getCalendarIdFromDbGroup(grupo);
      const blocks = mapDbGroupToClasses(grupo);
      const prev = classesByCalendar.get(calendarId) || [];
      classesByCalendar.set(calendarId, [...prev, ...blocks]);
    }

    setData((prev) => ({
      ...prev,
      calendars: prev.calendars.map((calendar) => ({
        ...calendar,
        classes: classesByCalendar.get(calendar.id) || []
      }))
    }));
  }, [dbGroups, selectedCareer]);

  const createNewGroupHandlers = createNewGroupModalFns.createNewGroupModalHandlers({
    DAYS,
    TIME_BLOCKS,
    selectedCareer,
    setGroupForm,
    setModalError,
    setIsCreateNewGroupOpen,
    createGroupModalFns,
    groupForm,
    data,
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

  function openCreateCareerModal() {
    setCareerForm({ nombre: "" });
    setCareerModalError("");
    setIsCreateCareerOpen(true);
  }

  function closeCreateCareerModal() {
    setCareerModalError("");
    setIsCreateCareerOpen(false);
  }

  function updateCareerForm(field, value) {
    setCareerForm((prev) => ({ ...prev, [field]: value }));
  }

  async function confirmCreateCareer() {
    await createCareerModalFns.confirmCreateCareer({
      careerForm,
      careers,
      setCareerModalError,
      setCareers,
      setSelectedCareer,
      closeCreateCareerModal
    });
  }

  function openCreateTeacherModal() {
    setTeacherForm({ nombre: "", apellido: "", correo: "" });
    setTeacherModalError("");
    setIsCreateTeacherOpen(true);
  }

  function closeCreateTeacherModal() {
    setTeacherModalError("");
    setIsCreateTeacherOpen(false);
  }

  function updateTeacherForm(field, value) {
    setTeacherForm((prev) => ({ ...prev, [field]: value }));
  }

  async function confirmCreateTeacher() {
    await createTeacherModalFns.confirmCreateTeacher({
      teacherForm,
      setTeacherModalError,
      closeCreateTeacherModal
    });
  }

  async function handleExportExcel() {
    try {
      if (!window.exportSchedulesToExcel) return;
      const result = await window.exportSchedulesToExcel(data);

      if (result?.success) {
        await window.api?.mensajes?.mostrar?.("Excel exportado correctamente.", "info");
      } else {
        await window.api?.mensajes?.mostrar?.("Exportación cancelada.", "warning");
      }
    } catch (error) {
      console.error("Error exportando Excel:", error);
      await window.api?.mensajes?.mostrar?.(error.message || "Error al exportar Excel.", "error");
    }
  }

  function toggleCalendarVisible(calendarId, checked) {
    setData((prev) => ({
      ...prev,
      calendars: prev.calendars.map((calendar) =>
        calendar.id === calendarId ? { ...calendar, visible: checked } : calendar
      )
    }));
  }

  return (
    <>
      <HeaderBar
        careers={careers}
        selectedCareer={selectedCareer}
        onCareerChange={setSelectedCareer}
        onOpenCreateCareer={openCreateCareerModal}
        onOpenCreateGroup={groupsModalHandlers.openGroupsListModal}
      />

      <main className="page">
        <section className="layout">
          <Sidebar
            calendars={data.calendars}
            onToggleCalendarVisible={toggleCalendarVisible}
            onOpenCreateGroup={groupsModalHandlers.openGroupsListModal}
            onOpenCreateCareer={openCreateCareerModal}
            onOpenCreateTeacher={openCreateTeacherModal}
            onExportExcel={handleExportExcel}
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
        onClose={groupsModalHandlers.closeGroupsListModal}
        onAddNewSubject={groupsModalHandlers.handleAddNewSubjectFromList}
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
        onGroupCreated={reloadGroupsFromDb}
      />

      <CreateNewGroupModal
        isOpen={isCreateNewGroupOpen}
        form={groupForm}
        years={["1", "2", "3"]}
        days={DAYS}
        hourOptionsFrom={hourOptionsFrom}
        hourOptionsTo={hourOptionsTo}
        careerOptions={careers}
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
    </>
  );
}

window.App = App;
