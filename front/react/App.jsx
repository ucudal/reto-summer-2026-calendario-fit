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
  const plansByCareer = data.careerPlans || {};

  const exampleCareers = data.careers;
  const [careers, setCareers] = React.useState(exampleCareers);
  const [selectedCareer, setSelectedCareer] = React.useState(exampleCareers[0]);
  const [selectedPlan, setSelectedPlan] = React.useState(data.plans[0]);

  const [isGroupsListOpen, setIsGroupsListOpen] = React.useState(false);
  const [isSubjectGroupsModalOpen, setIsSubjectGroupsModalOpen] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState(null);

  const [isCreateNewGroupOpen, setIsCreateNewGroupOpen] = React.useState(false);
  const [modalError, setModalError] = React.useState("");

  const [groupForm, setGroupForm] = React.useState(
    createNewGroupModalFns.createInitialGroupForm({
      DAYS,
      TIME_BLOCKS,
      selectedCareer,
      selectedPlan,
      plansByCareer
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

  const existingSubjectClasses = React.useMemo(() => {
    if (!selectedSubject) return [];

    const targetCalendar = findCalendarForYear("1", data.calendars);
    if (!targetCalendar) return [];

    return targetCalendar.classes.filter(
      (classItem) => classItem.title === selectedSubject
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
    const anio = rawAnio >= 1 && rawAnio <= 3 ? rawAnio : 1;

    if (anio === 1 && semestre === 1) return "s1y1";
    if (anio === 1 && semestre === 2) return "s2y1";
    if (anio === 2 && semestre === 1) return "s1y2";
    if (anio === 2 && semestre === 2) return "s2y2";
    return "s3";
  }

  function mapDbGroupToClasses(grupo) {
    const horarios = Array.isArray(grupo.horarios) ? grupo.horarios : [];
    const title = grupo.nombreMateria || `Materia ${grupo.idMateria}`;

    return horarios
      .map((h) => {
        const modulo = Number(h.modulo);
        const block = TIME_BLOCKS[modulo - 1];
        const day = normalizeDayToUi(h.dia);
        if (!block || !day) return null;

        return {
          title,
          group: grupo.codigo ? `Grupo ${grupo.codigo}` : "Grupo sin codigo",
          detail: `Cupo: ${grupo.cupo ?? "-"} | HS: ${grupo.horasSemestrales ?? "-"}`,
          day,
          start: block.start,
          end: block.end,
          type: "practice"
        };
      })
      .filter(Boolean);
  }

  React.useEffect(() => {
    let isCancelled = false;

    async function loadGroupsFromDb() {
      try {
        if (!window.api?.grupos?.listar) return;

        const response = await window.api.grupos.listar();
        if (!response?.success || !Array.isArray(response.data)) return;

        const classesByCalendar = new Map();
        for (const grupo of response.data) {
          const calendarId = getCalendarIdFromDbGroup(grupo);
          const blocks = mapDbGroupToClasses(grupo);
          const prev = classesByCalendar.get(calendarId) || [];
          classesByCalendar.set(calendarId, [...prev, ...blocks]);
        }

        if (isCancelled) return;

        setData((prev) => ({
          ...prev,
          calendars: prev.calendars.map((calendar) => ({
            ...calendar,
            classes: classesByCalendar.get(calendar.id) || []
          }))
        }));
      } catch (error) {
        console.error("No se pudieron cargar grupos desde DB:", error);
      }
    }

    loadGroupsFromDb();
    return () => {
      isCancelled = true;
    };
  }, [TIME_BLOCKS]);

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

  // Devuelve calendario destino segun anio elegido.
  function findCalendarForYear(selectedYear, calendars) {
    const calendarsOfYear = calendars.filter(
      (calendar) => yearFromCalendarName(calendar.name) === selectedYear
    );

    if (calendarsOfYear.length === 0) return null;

    // Prioriza uno visible del anio; si no, toma el primero del anio.
    return calendarsOfYear.find((calendar) => calendar.visible) || calendarsOfYear[0];
  }

  /*
    Funcion simple para principiantes:
    - Recibe el estado actual (prevData)
    - Busca el calendario del anio elegido
    - Agrega el nuevo grupo al array "classes" de ese calendario
    - Devuelve el nuevo estado
  */
  function addGroupToCalendar(prevData, selectedYear, newGroups) {
    const targetCalendar = findCalendarForYear(selectedYear, prevData.calendars);

    // Si no existe calendario para ese anio, no cambia nada.
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

        const classesWithoutSubject = calendar.classes.filter(
          (classItem) => classItem.title !== subject
        );

        return {
          ...calendar,
          classes: [...classesWithoutSubject, ...newGroups]
        };
      })
    };
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
                  onSelectSubject={subjectGroupsModalHandlers.openSubjectGroupsModal}
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
    </>
  );
}

window.App = App;
