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

  // Formulario del modal de carrera.
  const [careerForm, setCareerForm] = React.useState({
    nombre: ""
  });

  // Modo de edición de carrera (guarda el nombre original).
  const [careerEditMode, setCareerEditMode] = React.useState(null);

  // Indica si el modal de carrera fue abierto desde la lista.
  const [careerOpenedFromList, setCareerOpenedFromList] = React.useState(false);

  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = React.useState(false);
  const [teacherModalError, setTeacherModalError] = React.useState("");
  const [teacherForm, setTeacherForm] = React.useState({
    nombre: "",
    apellido: "",
    correo: ""
  });

  // Modo de edición de docente (guarda el ID del docente).
  const [teacherEditMode, setTeacherEditMode] = React.useState(null);

  // Indica si el modal de docente fue abierto desde la lista.
  const [teacherOpenedFromList, setTeacherOpenedFromList] = React.useState(false);

  // ===== GESTIÓN DE CARRERAS =====
  // Estado visual del modal de lista de carreras.
  const [isCareersListOpen, setIsCareersListOpen] = React.useState(false);

  // ===== GESTIÓN DE DOCENTES =====
  // Lista de docentes (mock data en memoria).
  const [teachers, setTeachers] = React.useState([
    { id: 1, nombre: "Javier", apellido: "Yannone", correo: "javier.yannone@ucu.edu.uy" },
    { id: 2, nombre: "Angel", apellido: "Mamberto", correo: "angel.mamberto@ucu.edu.uy" },
    { id: 3, nombre: "María", apellido: "González", correo: "maria.gonzalez@ucu.edu.uy" },
    { id: 4, nombre: "Carlos", apellido: "Rodríguez", correo: "carlos.rodriguez@ucu.edu.uy" }
  ]);

  // Estado visual del modal de lista de docentes.
  const [isTeachersListOpen, setIsTeachersListOpen] = React.useState(false);

  // ===== GESTIÓN DE ASIGNATURAS =====
  // Lista de asignaturas (mock data en memoria).
  const [subjects, setSubjects] = React.useState([
    { 
      id: 1, 
      nombre: "Programación 1", 
      tipo: "A", 
      creditos: 8,
      carreras: ["Ingeniería en Sistemas"],
      carrerasSemestre: { "Ingeniería en Sistemas": "1er s 1er año" },
      requerimientosSalon: "Laboratorio con 30 computadoras"
    },
    { 
      id: 2, 
      nombre: "Matemática Discreta", 
      tipo: "B", 
      creditos: 6,
      carreras: ["Ingeniería en Sistemas", "Ingeniería en Electrónica"],
      carrerasSemestre: { 
        "Ingeniería en Sistemas": "1er s 1er año",
        "Ingeniería en Electrónica": "1er s 1er año"
      },
      requerimientosSalon: ""
    }
  ]);

  // Estado visual del modal de lista de asignaturas.
  const [isSubjectsListOpen, setIsSubjectsListOpen] = React.useState(false);

  // Estado visual del modal de crear asignatura.
  const [isCreateSubjectOpen, setIsCreateSubjectOpen] = React.useState(false);

  // Estado de error del modal de asignatura.
  const [subjectModalError, setSubjectModalError] = React.useState("");

  // Formulario del modal de asignatura.
  const [subjectForm, setSubjectForm] = React.useState({
    id: null,
    nombre: "",
    tipo: "",
    creditos: "",
    carreras: [],
    carrerasSemestre: {},
    requerimientosSalon: ""
  });

  // Modo de edición de asignatura (guarda el objeto completo).
  const [subjectEditMode, setSubjectEditMode] = React.useState(null);

  // Indica si el modal de asignatura fue abierto desde la lista.
  const [subjectOpenedFromList, setSubjectOpenedFromList] = React.useState(false);

  // Horas posibles para "desde".
  const hourOptionsFrom = React.useMemo(() => {
    return TIME_BLOCKS.map((block) => block.start);
  }, [TIME_BLOCKS]);

  // Horas posibles para "hasta".
  const hourOptionsTo = React.useMemo(() => {
    return TIME_BLOCKS.map((block) => block.end);
  }, [TIME_BLOCKS]);

  // Calendarios visibles para pintar y alertar.
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
    replaceSubjectGroupsInCalendar,
    subjects
  });

  const groupsModalHandlers = groupsModalFns.createGroupsModalHandlers({
    setIsGroupsListOpen,
    openSubjectGroupsModal: subjectGroupsModalHandlers.openSubjectGroupsModal,
    openCreateNewGroupModal: createNewGroupHandlers.openCreateNewGroupModal
  });

  function openCreateCareerModal() {
    setCareerForm({ nombre: "" });
    setCareerModalError("");
    setCareerEditMode(null);
    setCareerOpenedFromList(false);
    setIsCreateCareerOpen(true);
  }

  function closeCreateCareerModal() {
    setCareerModalError("");
    setCareerEditMode(null);
    setCareerOpenedFromList(false);
    setIsCreateCareerOpen(false);
  }

  function updateCareerForm(field, value) {
    setCareerForm((prev) => ({ ...prev, [field]: value }));
  }

  // Crea o edita carrera según el modo.
  function confirmCreateCareer() {
    if (!careerForm.nombre.trim()) {
      setCareerModalError("El nombre no puede estar vacío");
      return;
    }

    if (careerEditMode) {
      // Modo edición
      setCareers((prev) => prev.map((c) => (c === careerEditMode ? careerForm.nombre : c)));
      if (selectedCareer === careerEditMode) {
        setSelectedCareer(careerForm.nombre);
      }
      closeCreateCareerModal();
      setIsCareersListOpen(true);
    } else {
      // Modo creación
      createCareerModalFns.confirmCreateCareer({
        careerForm,
        careers,
        setCareerModalError,
        setCareers,
        setSelectedCareer,
        closeCreateCareerModal
      });
    }
  }

  function openCreateTeacherModal() {
    setTeacherForm({ nombre: "", apellido: "", correo: "" });
    setTeacherModalError("");
    setTeacherEditMode(null);
    setTeacherOpenedFromList(false);
    setIsCreateTeacherOpen(true);
  }

  function closeCreateTeacherModal() {
    setTeacherModalError("");
    setTeacherEditMode(null);
    setTeacherOpenedFromList(false);
    setIsCreateTeacherOpen(false);
  }

  function updateTeacherForm(field, value) {
    setTeacherForm((prev) => ({ ...prev, [field]: value }));
  }

  // Crea o edita docente según el modo.
  async function confirmCreateTeacher() {
    if (!teacherForm.nombre.trim() || !teacherForm.apellido.trim() || !teacherForm.correo.trim()) {
      setTeacherModalError("Todos los campos son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(teacherForm.correo)) {
      setTeacherModalError("Ingrese un correo válido");
      return;
    }

    if (teacherEditMode) {
      // Modo edición
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherEditMode ? { ...t, ...teacherForm } : t))
      );
      closeCreateTeacherModal();
      setIsTeachersListOpen(true);
    } else {
      // Modo creación
      const newTeacher = {
        id: Date.now(),
        ...teacherForm
      };
      setTeachers((prev) => [...prev, newTeacher]);
      
      // Intentar guardar en backend (opcional)
      await createTeacherModalFns.confirmCreateTeacher({
        teacherForm,
        setTeacherModalError,
        closeCreateTeacherModal: () => {}
      });
      
      closeCreateTeacherModal();
    }
  }

  // ===== FUNCIONES DE GESTIÓN DE CARRERAS =====
  // Abre modal de lista de carreras.
  function openCareersListModal() {
    setIsCareersListOpen(true);
  }

  // Cierra modal de lista de carreras.
  function closeCareersListModal() {
    setIsCareersListOpen(false);
  }

  // Selecciona carrera para editar y abre modal en modo edición.
  function selectCareerToManage(career) {
    setCareerForm({ nombre: career });
    setCareerEditMode(career);
    setCareerModalError("");
    setCareerOpenedFromList(true);
    setIsCareersListOpen(false);
    setIsCreateCareerOpen(true);
  }

  // Elimina una carrera.
  function deleteCareer() {
    if (!careerEditMode) return;
    
    if (confirm(`¿Estás seguro de eliminar la carrera "${careerEditMode}"?`)) {
      setCareers((prev) => prev.filter((c) => c !== careerEditMode));
      if (selectedCareer === careerEditMode && careers.length > 1) {
        setSelectedCareer(careers.find((c) => c !== careerEditMode));
      }
      closeCreateCareerModal();
      setIsCareersListOpen(true);
    }
  }

  // Abre modal de crear carrera desde lista.
  function openCreateCareerFromList() {
    setCareerForm({ nombre: "" });
    setCareerModalError("");
    setCareerEditMode(null);
    setCareerOpenedFromList(true);
    setIsCareersListOpen(false);
    setIsCreateCareerOpen(true);
  }

  // Vuelve de crear/editar carrera a la lista.
  function backToCareersListFromModal() {
    closeCreateCareerModal();
    setIsCareersListOpen(true);
  }

  // ===== FUNCIONES DE GESTIÓN DE DOCENTES =====
  // Abre modal de lista de docentes.
  function openTeachersListModal() {
    setIsTeachersListOpen(true);
  }

  // Cierra modal de lista de docentes.
  function closeTeachersListModal() {
    setIsTeachersListOpen(false);
  }

  // Selecciona docente para editar y abre modal en modo edición.
  function selectTeacherToManage(teacher) {
    setTeacherForm({
      nombre: teacher.nombre,
      apellido: teacher.apellido,
      correo: teacher.correo
    });
    setTeacherEditMode(teacher.id);
    setTeacherModalError("");
    setTeacherOpenedFromList(true);
    setIsTeachersListOpen(false);
    setIsCreateTeacherOpen(true);
  }

  // Elimina un docente.
  function deleteTeacher() {
    if (!teacherEditMode) return;
    
    const teacher = teachers.find((t) => t.id === teacherEditMode);
    if (teacher && confirm(`¿Estás seguro de eliminar al docente "${teacher.apellido}, ${teacher.nombre}"?`)) {
      setTeachers((prev) => prev.filter((t) => t.id !== teacherEditMode));
      closeCreateTeacherModal();
      setIsTeachersListOpen(true);
    }
  }

  // Abre modal de crear docente desde lista.
  function openCreateTeacherFromList() {
    setTeacherForm({ nombre: "", apellido: "", correo: "" });
    setTeacherModalError("");
    setTeacherEditMode(null);
    setTeacherOpenedFromList(true);
    setIsTeachersListOpen(false);
    setIsCreateTeacherOpen(true);
  }

  // Vuelve de crear/editar docente a la lista.
  function backToTeachersListFromModal() {
    closeCreateTeacherModal();
    setIsTeachersListOpen(true);
  }

  // ===== FUNCIONES DE GESTIÓN DE ASIGNATURAS =====
  // Abre modal de lista de asignaturas.
  function openSubjectsListModal() {
    setIsSubjectsListOpen(true);
  }

  // Cierra modal de lista de asignaturas.
  function closeSubjectsListModal() {
    setIsSubjectsListOpen(false);
  }

  // Abre modal para crear asignatura.
  function openCreateSubjectModal() {
    setSubjectForm({
      id: null,
      nombre: "",
      tipo: "",
      creditos: "",
      tieneContrasemestre: false,
      carreras: [],
      carrerasSemestre: {}
    });
    setSubjectModalError("");
    setSubjectEditMode(null);
    setSubjectOpenedFromList(false);
    setIsCreateSubjectOpen(true);
  }

  // Cierra modal de asignatura.
  function closeCreateSubjectModal() {
    setSubjectModalError("");
    setSubjectEditMode(null);
    setSubjectOpenedFromList(false);
    setIsCreateSubjectOpen(false);
  }

  // Actualiza campo del modal de asignatura.
  function updateSubjectForm(field, value) {
    setSubjectForm((prev) => ({ ...prev, [field]: value }));
  }

  // Toggle de carrera en el formulario de asignatura.
  function toggleSubjectCareer(career) {
    setSubjectForm((prev) => {
      const carreras = prev.carreras || [];
      const carrerasSemestre = { ...prev.carrerasSemestre } || {};
      
      if (carreras.includes(career)) {
        // Desmarca: remover carrera y su semestre
        delete carrerasSemestre[career];
        return { 
          ...prev, 
          carreras: carreras.filter(c => c !== career),
          carrerasSemestre
        };
      } else {
        // Marca: agregar carrera (el semestre se asigna después)
        return { 
          ...prev, 
          carreras: [...carreras, career],
          carrerasSemestre
        };
      }
    });
  }

  // Cambia el semestre/año de una carrera.
  function changeSubjectCareerSemester(career, semester) {
    setSubjectForm((prev) => ({
      ...prev,
      carrerasSemestre: {
        ...prev.carrerasSemestre,
        [career]: semester
      }
    }));
  }

  // Crea o edita asignatura según el modo.
  function confirmCreateSubject() {
    const createSubjectModalFns = window.CreateSubjectModalFunctions;
    
    if (subjectEditMode) {
      // Modo edición
      createSubjectModalFns.confirmEditSubject({
        subjectForm,
        subjects,
        originalSubject: subjectEditMode,
        setSubjectModalError,
        setSubjects,
        closeCreateSubjectModal
      });
      setIsSubjectsListOpen(true);
    } else {
      // Modo creación
      createSubjectModalFns.confirmCreateSubject({
        subjectForm,
        subjects,
        setSubjectModalError,
        setSubjects,
        closeCreateSubjectModal
      });
    }
  }

  // Selecciona asignatura para editar y abre modal en modo edición.
  function selectSubjectToManage(subject) {
    setSubjectForm({
      id: subject.id,
      nombre: subject.nombre,
      tipo: subject.tipo,
      creditos: subject.creditos,
      tieneContrasemestre: subject.tieneContrasemestre,
      carreras: [...subject.carreras],
      carrerasSemestre: { ...subject.carrerasSemestre }
    });
    setSubjectEditMode(subject);
    setSubjectModalError("");
    setSubjectOpenedFromList(true);
    setIsSubjectsListOpen(false);
    setIsCreateSubjectOpen(true);
  }

  // Elimina una asignatura.
  function deleteSubject() {
    if (!subjectEditMode) return;
    
    const createSubjectModalFns = window.CreateSubjectModalFunctions;
    createSubjectModalFns.confirmDeleteSubject({
      subjectForm,
      subjects,
      setSubjects,
      closeCreateSubjectModal
    });
    setIsSubjectsListOpen(true);
  }

  // Abre modal de crear asignatura desde lista.
  function openCreateSubjectFromList() {
    setSubjectForm({
      id: null,
      nombre: "",
      tipo: "",
      creditos: "",
      tieneContrasemestre: false,
      carreras: [],
      carrerasSemestre: {}
    });
    setSubjectModalError("");
    setSubjectEditMode(null);
    setSubjectOpenedFromList(true);
    setIsSubjectsListOpen(false);
    setIsCreateSubjectOpen(true);
  }

  // Vuelve de crear/editar asignatura a la lista.
  function backToSubjectsListFromModal() {
    closeCreateSubjectModal();
    setIsSubjectsListOpen(true);
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

  function findCalendarForSemesterAndYear(selectedSemester, selectedYear, calendars) {
    // Normalizar semestre para matching ("1er" o "2do")
    const normalizedSemester = selectedSemester.toLowerCase();
    
    return calendars.find(calendar => {
      const name = calendar.name.toLowerCase();
      const hasSemester = name.includes(`${normalizedSemester} semestre`);
      const hasYear = yearFromCalendarName(name) === selectedYear;
      return hasSemester && hasYear;
    }) || null;
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

  function replaceSubjectGroupsInCalendar(prevData, selectedSemester, selectedYear, subject, newGroups) {
    const targetCalendar = findCalendarForSemesterAndYear(selectedSemester, selectedYear, prevData.calendars);

    if (!targetCalendar) {
      console.warn(`No se encontró calendario para ${selectedSemester} semestre ${selectedYear} año`);
      return prevData;
    }

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
            onOpenCreateTeacher={openTeachersListModal}
            onOpenCreateCareer={openCareersListModal}
            onOpenSubjects={openSubjectsListModal}
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
        subjects={subjects}
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

      <CareersListModal
        isOpen={isCareersListOpen}
        careers={careers}
        onClose={closeCareersListModal}
        onSelectCareer={selectCareerToManage}
        onCreateNew={openCreateCareerFromList}
      />

      <CreateCareerModal
        isOpen={isCreateCareerOpen}
        form={careerForm}
        errorMessage={careerModalError}
        onClose={closeCreateCareerModal}
        onBack={careerOpenedFromList ? backToCareersListFromModal : null}
        onChange={updateCareerForm}
        onSubmit={confirmCreateCareer}
        onDelete={careerEditMode ? deleteCareer : null}
        isEditMode={!!careerEditMode}
      />

      <TeachersListModal
        isOpen={isTeachersListOpen}
        teachers={teachers}
        onClose={closeTeachersListModal}
        onSelectTeacher={selectTeacherToManage}
        onCreateNew={openCreateTeacherFromList}
      />

      <CreateTeacherModal
        isOpen={isCreateTeacherOpen}
        form={teacherForm}
        errorMessage={teacherModalError}
        onClose={closeCreateTeacherModal}
        onBack={teacherOpenedFromList ? backToTeachersListFromModal : null}
        onChange={updateTeacherForm}
        onSubmit={confirmCreateTeacher}
        onDelete={teacherEditMode ? deleteTeacher : null}
        isEditMode={!!teacherEditMode}
      />

      <SubjectsListModal
        isOpen={isSubjectsListOpen}
        subjects={subjects}
        onClose={closeSubjectsListModal}
        onSelectSubject={selectSubjectToManage}
        onCreateNew={openCreateSubjectFromList}
      />

      <CreateSubjectModal
        isOpen={isCreateSubjectOpen}
        form={subjectForm}
        errorMessage={subjectModalError}
        onClose={closeCreateSubjectModal}
        onBack={subjectOpenedFromList ? backToSubjectsListFromModal : null}
        onChange={updateSubjectForm}
        onCareerToggle={toggleSubjectCareer}
        onCareerSemesterChange={changeSubjectCareerSemester}
        onSubmit={confirmCreateSubject}
        onDelete={subjectEditMode ? deleteSubject : null}
        isEditMode={!!subjectEditMode}
        availableCareers={careers}
      />
    </>
  );
}

window.App = App;
