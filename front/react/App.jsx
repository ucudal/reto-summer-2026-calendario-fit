/*
  App principal.
  Version limpia post-merge para evitar pantalla en blanco.
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
    yearLabel
  } = window.AppData;

  const createCareerModalFns = window.CreateCareerModalFunctions;
  const createGroupModalFns = window.CreateGroupModalFunctions;
  const createTeacherModalFns = window.CreateTeacherModalFunctions;
  const groupsModalFns = window.GroupsModalFunctions;
  const subjectGroupsModalFns = window.SubjectGroupsModalFunctions;
  const createNewGroupModalFns = window.CreateNewGroupModalFunctions;

  const [data, setData] = React.useState(cloneInitialData());
  const [careers, setCareers] = React.useState(data.careers || []);
  const [selectedCareer, setSelectedCareer] = React.useState((data.careers || [])[0] || "");
  const [dbGroups, setDbGroups] = React.useState([]);

  const [isGroupsListOpen, setIsGroupsListOpen] = React.useState(false);
  const [isSubjectGroupsModalOpen, setIsSubjectGroupsModalOpen] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState(null);

  const [isCreateNewGroupOpen, setIsCreateNewGroupOpen] = React.useState(false);
  const [modalError, setModalError] = React.useState("");
  const [groupForm, setGroupForm] = React.useState(
    createNewGroupModalFns.createInitialGroupForm({ DAYS, TIME_BLOCKS, selectedCareer })
  );

  const [isCreateCareerOpen, setIsCreateCareerOpen] = React.useState(false);
  const [careerModalError, setCareerModalError] = React.useState("");
  const [careerForm, setCareerForm] = React.useState({ nombre: "" });

  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = React.useState(false);
  const [teacherModalError, setTeacherModalError] = React.useState("");
  const [teacherForm, setTeacherForm] = React.useState({ nombre: "", apellido: "", correo: "" });

  const [isCreateSemesterOpen, setIsCreateSemesterOpen] = React.useState(false);
  const [semesterModalError, setSemesterModalError] = React.useState("");
  const [semesterForm, setSemesterForm] = React.useState({ sourceLectiveTerm: "", newLectiveName: "" });

  const hourOptionsFrom = React.useMemo(() => TIME_BLOCKS.map((block) => block.start), [TIME_BLOCKS]);
  const hourOptionsTo = React.useMemo(() => TIME_BLOCKS.map((block) => block.end), [TIME_BLOCKS]);

  const visibleCalendars = data.calendars.filter((calendar) => calendar.visible);
  const visibleAlerts = visibleCalendars.flatMap((calendar) => calendar.alerts || []);

  const currentLectiveTerm = React.useMemo(() => {
    return visibleCalendars[0]?.lectiveTerm || data.calendars[0]?.lectiveTerm || "";
  }, [visibleCalendars, data.calendars]);

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function normalizeDayToUi(dayText) {
    const value = normalizeText(dayText);
    if (value === "lunes" || value === "lun") return "LUN";
    if (value === "martes" || value === "mar") return "MAR";
    if (value === "miercoles" || value === "mie") return "MIE";
    if (value === "jueves" || value === "jue") return "JUE";
    if (value === "viernes" || value === "vie") return "VIE";
    if (value === "sabado" || value === "sab") return "SAB";
    return "";
  }

  function getCalendarIdFromDbGroup(grupo) {
    const semestre = Number(grupo.semestre || 1) === 2 ? 2 : 1;
    const rawYear = Number(grupo.anio || 1);
    const year = rawYear >= 1 && rawYear <= 5 ? rawYear : 1;
    return `s${semestre}y${year}`;
  }

  function mapDbGroupToClasses(grupo) {
    const horarios = Array.isArray(grupo.horarios) ? grupo.horarios : [];
    const teachers = Array.isArray(grupo.docentes) ? grupo.docentes : [];

    return horarios
      .map((h) => {
        const modulo = Number(h.modulo);
        const block = TIME_BLOCKS[modulo - 1];
        const day = normalizeDayToUi(h.dia);

        if (!block || !day) return null;

        return {
          title: grupo.nombreMateria || `Materia ${grupo.idMateria}`,
          classNumber: String(grupo.codigo || ""),
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

  async function reloadGroupsFromDb() {
    try {
      if (!window.api?.grupos?.listar) return;
      const response = await window.api.grupos.listar();
      if (!response?.success || !Array.isArray(response.data)) return;
      setDbGroups(response.data);
    } catch (error) {
      console.error("No se pudieron recargar grupos desde DB:", error);
    }
  }

  React.useEffect(() => {
    let isCancelled = false;

    async function loadCareersFromDb() {
      try {
        if (!window.api?.carreras?.listar) return;
        const response = await window.api.carreras.listar();

        if (isCancelled) return;
        if (!response?.success || !Array.isArray(response.data)) return;

        const names = response.data
          .map((row) => String(row?.nombre || "").trim())
          .filter(Boolean);

        if (names.length === 0) return;

        setCareers(names);
        setSelectedCareer((prev) => (names.includes(prev) ? prev : names[0]));
      } catch (error) {
        console.error("No se pudieron cargar carreras desde DB:", error);
      }
    }

    loadCareersFromDb();

    return () => {
      isCancelled = true;
    };
  }, []);

  React.useEffect(() => {
    reloadGroupsFromDb();
  }, []);

  React.useEffect(() => {
    const selectedCareerNormalized = normalizeText(selectedCareer);

    const classesByCalendar = new Map();

    const allCareerNamesInGroups = new Set();
    dbGroups.forEach((grupo) => {
      const groupCareers = Array.isArray(grupo.carreras) ? grupo.carreras : [];
      groupCareers.forEach((name) => allCareerNamesInGroups.add(normalizeText(name)));
    });

    const shouldFilterByCareer =
      selectedCareerNormalized && allCareerNamesInGroups.has(selectedCareerNormalized);

    const filteredGroups = dbGroups.filter((grupo) => {
      const groupCareers = Array.isArray(grupo.carreras) ? grupo.carreras : [];

      if (!selectedCareer) return true;
      if (!shouldFilterByCareer) return true;
      if (groupCareers.length === 0) return true;

      return groupCareers.some((name) => normalizeText(name) === selectedCareerNormalized);
    });

    filteredGroups.forEach((grupo) => {
      const calendarId = getCalendarIdFromDbGroup(grupo);
      const blocks = mapDbGroupToClasses(grupo);
      const previous = classesByCalendar.get(calendarId) || [];
      classesByCalendar.set(calendarId, [...previous, ...blocks]);
    });

    setData((prev) => ({
      ...prev,
      calendars: prev.calendars.map((calendar) => ({
        ...calendar,
        subtitle: selectedCareer || calendar.subtitle,
        classes: classesByCalendar.get(calendar.id) || []
      }))
    }));
  }, [dbGroups, selectedCareer]);

  function findCalendarForYear(selectedYear, calendars) {
    const byYear = calendars.filter((calendar) => calendar.id.endsWith(`y${selectedYear}`));
    if (byYear.length === 0) return null;
    return byYear.find((calendar) => calendar.visible) || byYear[0];
  }

  function addGroupToCalendar(prevData, selectedYear, newGroups) {
    const target = findCalendarForYear(selectedYear, prevData.calendars);
    if (!target) return prevData;

    return {
      ...prevData,
      calendars: prevData.calendars.map((calendar) => {
        if (calendar.id !== target.id) return calendar;
        return {
          ...calendar,
          visible: true,
          classes: [...calendar.classes, ...newGroups]
        };
      })
    };
  }

  function replaceSubjectGroupsInCalendar(prevData, selectedYear, subject, newGroups) {
    const target = findCalendarForYear(selectedYear, prevData.calendars);
    if (!target) return prevData;

    return {
      ...prevData,
      calendars: prevData.calendars.map((calendar) => {
        if (calendar.id !== target.id) return calendar;

        const classesWithoutSubject = calendar.classes.filter(
          (classItem) => !(classItem.title === subject && classItem.type === "practice")
        );

        return {
          ...calendar,
          visible: true,
          classes: [...classesWithoutSubject, ...newGroups]
        };
      })
    };
  }

  function toggleCalendarVisible(calendarId, checked) {
    setData((prev) => ({
      ...prev,
      calendars: prev.calendars.map((calendar) =>
        calendar.id === calendarId ? { ...calendar, visible: checked } : calendar
      )
    }));
  }

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
      await window.exportSchedulesToExcel(data);
    } catch (error) {
      console.error("Error exportando calendario Excel:", error);
    }
  }

  async function handleExportExcelDatos() {
    try {
      if (!window.api?.exportaciones?.guardarExcel) return;
      await window.api.exportaciones.guardarExcel({
        defaultFileName: "calendario-bd.xlsx",
        sheetName: "Datos"
      });
    } catch (error) {
      console.error("Error exportando datos internos:", error);
    }
  }

  async function handleImportExcel() {
    try {
      if (!window.api?.exportaciones?.importarExcelModulos) return;
      await window.api.exportaciones.importarExcelModulos({ carreraNombre: selectedCareer });
      await reloadGroupsFromDb();
    } catch (error) {
      console.error("Error importando módulos desde Excel:", error);
    }
  }

  function openCreateSemesterModal() {
    setSemesterForm({ sourceLectiveTerm: "", newLectiveName: "" });
    setSemesterModalError("");
    setIsCreateSemesterOpen(true);
  }

  function closeCreateSemesterModal() {
    setSemesterModalError("");
    setIsCreateSemesterOpen(false);
  }

  function updateSemesterForm(field, value) {
    setSemesterForm((prev) => ({ ...prev, [field]: value }));
  }

  function confirmCreateSemester() {
    const sourceTerm = String(semesterForm.sourceLectiveTerm || "").trim();
    const newName = String(semesterForm.newLectiveName || "").trim();

    if (!sourceTerm) {
      setSemesterModalError("Debe seleccionar el semestre lectivo a copiar.");
      return;
    }

    if (!newName) {
      setSemesterModalError("Debe ingresar el nombre del nuevo semestre lectivo.");
      return;
    }

    const calendarsToCopy = data.calendars.filter((calendar) => calendar.lectiveTerm === sourceTerm);
    if (calendarsToCopy.length === 0) {
      setSemesterModalError("No hay calendarios para ese semestre lectivo.");
      return;
    }

    const now = Date.now();
    const copies = calendarsToCopy.map((calendar, index) => ({
      ...calendar,
      id: `${calendar.id}-copy-${now}-${index}`,
      lectiveTerm: newName,
      visible: true,
      classes: calendar.classes.map((item) => ({ ...item })),
      alerts: []
    }));

    setData((prev) => ({
      ...prev,
      calendars: prev.calendars
        .map((calendar) =>
          calendar.lectiveTerm === sourceTerm ? { ...calendar, visible: false } : calendar
        )
        .concat(copies)
    }));

    closeCreateSemesterModal();
  }

  return (
    <>
      <HeaderBar
        careers={careers}
        selectedCareer={selectedCareer}
        currentLectiveTerm={currentLectiveTerm}
        onCareerChange={setSelectedCareer}
        onOpenCreateSemester={openCreateSemesterModal}
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
            onExportExcelDatos={handleExportExcelDatos}
            onImportExcel={handleImportExcel}
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
        calendars={data.calendars}
        subjectsList={[]}
        selectedCareer={selectedCareer}
        onClose={groupsModalHandlers.closeGroupsListModal}
        onSelectSubject={groupsModalHandlers.openSubjectGroupsModal}
      />

      <SubjectGroupsModal
        isOpen={isSubjectGroupsModalOpen}
        subject={selectedSubject}
        careers={careers}
        days={DAYS}
        onBack={subjectGroupsModalHandlers.backToGroupsList}
        onClose={subjectGroupsModalHandlers.closeSubjectGroupsModal}
        onSaveGroups={subjectGroupsModalHandlers.saveGroupsToCalendar}
        onGroupCreated={reloadGroupsFromDb}
      />

      <CreateNewGroupModal
        isOpen={isCreateNewGroupOpen}
        form={groupForm}
        years={["1", "2", "3", "4", "5"]}
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

      <CreateSemesterModal
        isOpen={isCreateSemesterOpen}
        form={semesterForm}
        availableSemesters={data.calendars}
        errorMessage={semesterModalError}
        onClose={closeCreateSemesterModal}
        onChange={updateSemesterForm}
        onSubmit={confirmCreateSemester}
      />
    </>
  );
}

window.App = App;
