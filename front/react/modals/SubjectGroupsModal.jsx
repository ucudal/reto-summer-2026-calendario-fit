/*
  Componente: SubjectGroupsModal
  Que hace:
  - Es el segundo paso despues de elegir una materia.
  - Permite crear un grupo con: nombre, docentes, carreras, dias, desde y hasta.
  - Al confirmar, envia el grupo al calendario con onSaveGroups.
*/

function SubjectGroupsModal(props) {
  const {
    isOpen,
    subject,
    careers = [],
    selectedCareer = "",
    calendars = [],
    days = [],
    currentLectiveTerm = "",
    onClose,
    onBack,
    onSaveGroups,
    onGroupCreated
  } = props;

  const [groupName, setGroupName] = React.useState("");
  const [teacherSearch, setTeacherSearch] = React.useState("");
  const [selectedTeachers, setSelectedTeachers] = React.useState([]);
  const [availableTeachers, setAvailableTeachers] = React.useState([]);
  const [isCareerDropdownOpen, setIsCareerDropdownOpen] = React.useState(false);
  const [careerOptions, setCareerOptions] = React.useState([]);
  const [selectedCareers, setSelectedCareers] = React.useState([]);
  const [selectedDays, setSelectedDays] = React.useState([]);
  const [dayTimeRanges, setDayTimeRanges] = React.useState({});
  const [applyChangesToAllCareers, setApplyChangesToAllCareers] = React.useState(false);
  const [editScopeCareers, setEditScopeCareers] = React.useState([]);
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const careerDropdownRef = React.useRef(null);

  const subjectName = typeof subject === "string"
    ? subject
    : String(subject?.name || subject?.subjectName || "").trim();
  const editContext = subject && typeof subject === "object" ? subject : null;
  const isEditMode = Boolean(editContext?.mode === "edit");
  const draftEditCareers = toNormalizedCareerList(
    Array.isArray(editContext?.draft?.selectedCareers) ? editContext.draft.selectedCareers : []
  );
  const draftEditCareersKey = draftEditCareers.join("|");
  const editGroupCareersText = editScopeCareers.length > 0 ? editScopeCareers.join(", ") : "sin carreras";
  const lectiveTermLabel = String(currentLectiveTerm || "").trim() || "Sin semestre lectivo";

  // Fallback por si no hay backend de docentes disponible.
  const fallbackTeachers = [
    "Angel Mamberto",
    "Javier Yannone",
    "Maria Gonzalez",
    "Carlos Rodriguez",
    "Ana Martinez",
    "Pedro Sanchez",
    "Laura Fernandez",
    "Diego Lopez"
  ];

  const startTimes = ["08:00", "09:30", "11:00", "12:25", "13:50", "15:20", "16:50", "18:15", "19:45", "21:15"];
  const endTimes = ["09:20", "10:50", "12:20", "13:45", "15:10", "16:40", "18:10", "19:35", "21:05", "22:35"];
  const groupColors = window.AppData?.GROUP_COLORS || ["#A0C4FF"];

  React.useEffect(() => {
    if (!isOpen) return;

    const draft = editContext?.draft || null;

    setGroupName(String(draft?.groupName || "").trim());
    setTeacherSearch("");
    setSelectedTeachers(Array.isArray(draft?.selectedTeachers) ? [...draft.selectedTeachers] : []);
    setAvailableTeachers([]);
    setIsCareerDropdownOpen(false);
    setCareerOptions([]);
    setSelectedCareers(Array.isArray(draft?.selectedCareers) ? [...draft.selectedCareers] : []);
    setSelectedDays(Array.isArray(draft?.selectedDays) ? [...draft.selectedDays] : []);
    setDayTimeRanges(draft?.dayTimeRanges && typeof draft.dayTimeRanges === "object" ? { ...draft.dayTimeRanges } : {});
    setApplyChangesToAllCareers(false);
    setEditScopeCareers(draftEditCareers);
    setError("");
    setIsSaving(false);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  }, [isOpen, subject, careers, draftEditCareersKey]);

  React.useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function loadTeachers() {
      try {
        if (!window.api?.docentes?.listar) {
          if (!isCancelled) setAvailableTeachers(fallbackTeachers);
          return;
        }

        const response = await window.api.docentes.listar();
        if (isCancelled) return;

        if (!response?.success || !Array.isArray(response.data)) {
          setAvailableTeachers(fallbackTeachers);
          return;
        }

        const names = response.data
          .map((row) => {
            const nombre = String(row?.nombre || "").trim();
            const apellidoRaw = String(row?.apellido || "").trim();
            const apellido = apellidoRaw === "." ? "" : apellidoRaw;
            return `${nombre} ${apellido}`.trim();
          })
          .filter(Boolean);

        if (names.length === 0) {
          setAvailableTeachers(fallbackTeachers);
          return;
        }

        setAvailableTeachers([...new Set(names)]);
      } catch (error) {
        if (!isCancelled) setAvailableTeachers(fallbackTeachers);
      }
    }

    loadTeachers();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || !subjectName) return;

    let isCancelled = false;

    async function loadCareerPlanOptions() {
      try {
        if (!window.api?.materias?.listarCarrerasPlanes) {
          if (!isCancelled) {
            setCareerOptions([]);
            setSelectedCareers([]);
          }
          return;
        }

        const response = await window.api.materias.listarCarrerasPlanes(subjectName);
        if (isCancelled) return;

        if (!response?.success || !Array.isArray(response.data)) {
          setCareerOptions([]);
          setSelectedCareers([]);
          return;
        }

        const options = response.data
          .map((row) => ({
            key: String(row.carreraNombre || "").trim(),
            label: String(row.carreraNombre || "").trim(),
            semestre: Number(row.semestre),
            anio: Number(row.anio)
          }))
          .filter((row) => row.label && !row.label.includes("undefined"));

        const unique = [];
        const seen = new Set();
        for (const option of options) {
          if (seen.has(option.key)) continue;
          seen.add(option.key);
          unique.push(option);
        }

        setCareerOptions(unique);

        const preselected = Array.isArray(editContext?.draft?.selectedCareers)
          ? editContext.draft.selectedCareers.map((value) => String(value || "").trim())
          : [];

        if (preselected.length > 0) {
          const availableSet = new Set(unique.map((item) => item.key));
          const selected = preselected.filter((item) => availableSet.has(item));
          setSelectedCareers(selected.length > 0 ? selected : unique.map((item) => item.key));
        } else {
          setSelectedCareers(unique.map((item) => item.key));
        }
      } catch (e) {
        if (!isCancelled) {
          setCareerOptions([]);
          if (!Array.isArray(editContext?.draft?.selectedCareers)) {
            setSelectedCareers([]);
          }
        }
      }
    }

    loadCareerPlanOptions();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, subjectName, editContext]);

  React.useEffect(() => {
    if (!isOpen || !isCareerDropdownOpen) return;

    function handleOutsideClick(event) {
      if (!careerDropdownRef.current) return;
      if (!careerDropdownRef.current.contains(event.target)) {
        setIsCareerDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, isCareerDropdownOpen]);

  React.useEffect(() => {
    if (!isOpen || !isEditMode) return;
    if (!window.api?.grupos?.listar) return;

    let isCancelled = false;

    async function loadEditScopeCareers() {
      try {
        const originalGroupId = toGroupId(editContext?.draft?.groupRef);
        if (!originalGroupId) return;

        const groupsResp = await window.api.grupos.listar();
        if (isCancelled) return;
        const allGroups = groupsResp?.success && Array.isArray(groupsResp.data) ? groupsResp.data : [];
        const originalGroup = allGroups.find((group) => Number(group?.id) === originalGroupId);
        if (!originalGroup) return;

        const siblingGroups = allGroups.filter((group) => {
          if (!group || Number(group.id) <= 0) return false;
          const sameCode = String(group.codigo || "").trim() === String(originalGroup.codigo || "").trim();
          const sameSubject = Number(group.idMateria) === Number(originalGroup.idMateria);
          const sameSemester = Number(group.idSemestre) === Number(originalGroup.idSemestre);
          const sameLectiveSemester = Number(group.semestreLectivo || 0) === Number(originalGroup.semestreLectivo || 0);
          const sameLectiveYear = Number(group.anioLectivo || 0) === Number(originalGroup.anioLectivo || 0);
          return sameCode && sameSubject && sameSemester && sameLectiveSemester && sameLectiveYear;
        });

        const allSiblingCareers = siblingGroups.flatMap((group) =>
          Array.isArray(group?.carreras) ? group.carreras : []
        );
        const resolvedCareers = toNormalizedCareerList(
          allSiblingCareers.length > 0
            ? allSiblingCareers
            : Array.isArray(originalGroup?.carreras)
            ? originalGroup.carreras
            : draftEditCareers
        );
        setEditScopeCareers(resolvedCareers);
      } catch (e) {
        if (!isCancelled) {
          setEditScopeCareers(draftEditCareers);
        }
      }
    }

    loadEditScopeCareers();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, isEditMode, editContext, draftEditCareersKey]);

  if (!isOpen || !subjectName) return null;

  const filteredTeachers = availableTeachers.filter((teacher) => {
    const matches = teacher.toLowerCase().includes(teacherSearch.toLowerCase());
    const notSelected = !selectedTeachers.includes(teacher);
    return matches && notSelected;
  });

  function toggleDay(day) {
    setSelectedDays((prev) => {
      const isSelected = prev.includes(day);

      if (isSelected) {
        setDayTimeRanges((prevRanges) => {
          const next = { ...prevRanges };
          delete next[day];
          return next;
        });
        return prev.filter((item) => item !== day);
      }

      setDayTimeRanges((prevRanges) => ({
        ...prevRanges,
        [day]: prevRanges[day] || { fromTime: "08:00", toTime: "09:20" }
      }));
      return [...prev, day];
    });
  }

  function updateDayTime(day, field, value) {
    setDayTimeRanges((prev) => ({
      ...prev,
      [day]: {
        fromTime: prev[day]?.fromTime || "08:00",
        toTime: prev[day]?.toTime || "09:20",
        [field]: value
      }
    }));
  }

  function toggleCareer(optionKey) {
    setSelectedCareers((prev) =>
      prev.includes(optionKey) ? prev.filter((item) => item !== optionKey) : [...prev, optionKey]
    );
    setIsCareerDropdownOpen(false);
  }

  function addTeacher(teacher) {
    setSelectedTeachers((prev) => [...prev, teacher]);
    setTeacherSearch("");
  }

  function removeTeacher(teacher) {
    setSelectedTeachers((prev) => prev.filter((item) => item !== teacher));
  }

  function dayUiToDb(dayUi) {
    const key = String(dayUi || "").trim().toUpperCase();
    if (key === "LUN") return "Lunes";
    if (key === "MAR") return "Martes";
    if (key === "MIE") return "Miercoles";
    if (key === "JUE") return "Jueves";
    if (key === "VIE") return "Viernes";
    if (key === "SAB") return "Sabado";
    return "";
  }

  function parseLectiveTerm(text) {
    const value = String(text || "").trim().toLowerCase();
    const match = value.match(/^(1er|2do)\s+semestre\s+(\d{4})$/);
    if (!match) return null;
    const semestreLectivoNumero = match[1] === "2do" ? 2 : 1;
    const anioLectivo = Number(match[2]);
    return { semestreLectivoNumero, anioLectivo };
  }

  function pickGroupColorForCalendar(academicSemester, academicYear) {
    const targetPrefix = `s${Number(academicSemester || 1)}y${Number(academicYear || 1)}`;
    const byPrefix = (calendars || []).filter((calendar) => String(calendar.id || "").startsWith(targetPrefix));
    const byLective = byPrefix.filter(
      (calendar) => !currentLectiveTerm || String(calendar.lectiveTerm || "") === String(currentLectiveTerm)
    );
    const targetCalendars = byLective.length > 0 ? byLective : byPrefix;

    const usedColors = new Set();
    targetCalendars.forEach((calendar) => {
      (calendar.classes || []).forEach((item) => {
        const color = String(item?.color || "").trim();
        if (color) usedColors.add(color);
      });
    });

    const firstAvailable = groupColors.find((color) => !usedColors.has(color));
    if (firstAvailable) return firstAvailable;
    return groupColors[usedColors.size % groupColors.length] || "#A0C4FF";
  }

  function getVisibleCalendarAcademicTarget() {
    const byLective = (calendars || []).filter(
      (calendar) =>
        Boolean(calendar?.visible) &&
        (!currentLectiveTerm || String(calendar.lectiveTerm || "") === String(currentLectiveTerm))
    );
    const activeCalendar =
      byLective[0] || (calendars || []).find((calendar) => Boolean(calendar?.visible)) || null;
    const match = String(activeCalendar?.id || "").match(/s([12])y([1-5])/i);
    if (!match) return { semester: 1, year: 1 };
    return {
      semester: Number(match[1]) || 1,
      year: Number(match[2]) || 1
    };
  }

  function toNormalizedCareerList(items) {
    return [...new Set((items || []).map((value) => String(value || "").trim()).filter(Boolean))].sort();
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function findCareerByNormalized(careerList, target) {
    const targetNormalized = normalizeText(target);
    if (!targetNormalized) return "";
    return careerList.find((item) => normalizeText(item) === targetNormalized) || "";
  }

  function areCareerListsEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function buildDbHorariosPayloadFromSelection() {
    const payload = [];
    for (const day of selectedDays) {
      const dayRange = dayTimeRanges[day] || { fromTime: "08:00", toTime: "09:20" };
      const startIndex = startTimes.indexOf(dayRange.fromTime);
      const endIndex = endTimes.indexOf(dayRange.toTime);
      const dbDay = dayUiToDb(day);
      if (startIndex < 0 || endIndex < 0 || endIndex < startIndex || !dbDay) continue;

      for (let idx = startIndex; idx <= endIndex; idx += 1) {
        payload.push({ dia: dbDay, modulo: idx + 1 });
      }
    }
    return payload;
  }

  function toGroupId(groupRef) {
    const parsed = Number(String(groupRef || "").trim());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  async function buildTeacherAssignments() {
    if (selectedTeachers.length === 0) return [];
    if (!window.api?.docentes?.listar) return [];

    const docentesResp = await window.api.docentes.listar();
    const docentes = docentesResp?.success && Array.isArray(docentesResp.data) ? docentesResp.data : [];
    if (docentes.length === 0) return [];

    const assignments = [];
    for (let i = 0; i < selectedTeachers.length; i += 1) {
      const teacherName = selectedTeachers[i];
      const [nombre = "", ...rest] = String(teacherName).split(" ");
      const apellido = rest.join(" ").trim();
      const docente = docentes.find((d) => {
        const nom = String(d.nombre || "").trim().toLowerCase();
        const ape = String(d.apellido || "").trim().toLowerCase();
        return nom === nombre.toLowerCase() && ape === apellido.toLowerCase();
      });
      if (!docente?.id) continue;

      assignments.push({
        idProfesor: Number(docente.id),
        carga: i === 0 ? "Titular" : "Ayudante",
        esPrincipal: i === 0
      });
    }

    return assignments;
  }

  async function handleDeleteGroup() {
    if (isDeleting || isSaving) return;

    setError("");
    setIsDeleting(true);

    try {
      if (!window.api?.grupos?.eliminar || !window.api?.grupos?.listar) {
        setError("No está disponible la API para eliminar grupos.");
        setIsDeleting(false);
        return;
      }

      const originalGroupId = toGroupId(editContext?.draft?.groupRef);
      if (!originalGroupId) {
        setError("No se pudo identificar el grupo a eliminar.");
        setIsDeleting(false);
        return;
      }

      const groupsResp = await window.api.grupos.listar();
      const allGroups = groupsResp?.success && Array.isArray(groupsResp.data) ? groupsResp.data : [];
      const originalGroup = allGroups.find((group) => Number(group?.id) === originalGroupId);

      if (!originalGroup) {
        setError("No se encontró el grupo en la base de datos.");
        setIsDeleting(false);
        return;
      }

      const groupIdsToDelete = [originalGroupId];

      if (applyChangesToAllCareers) {
        const siblingGroups = allGroups.filter((group) => {
          if (!group || Number(group.id) <= 0) return false;
          if (Number(group.id) === originalGroupId) return false;
          const sameCode = String(group.codigo || "").trim() === String(originalGroup.codigo || "").trim();
          const sameSubject = Number(group.idMateria) === Number(originalGroup.idMateria);
          const sameSemester = Number(group.idSemestre) === Number(originalGroup.idSemestre);
          const sameLectiveSemester = Number(group.semestreLectivo || 0) === Number(originalGroup.semestreLectivo || 0);
          const sameLectiveYear = Number(group.anioLectivo || 0) === Number(originalGroup.anioLectivo || 0);
          return sameCode && sameSubject && sameSemester && sameLectiveSemester && sameLectiveYear;
        });

        for (const sibling of siblingGroups) {
          groupIdsToDelete.push(Number(sibling.id));
        }
      }

      for (const groupId of groupIdsToDelete) {
        const deleteResp = await window.api.grupos.eliminar(groupId);
        if (!deleteResp?.success) {
          setError(deleteResp?.error || `No se pudo eliminar el grupo ID ${groupId}.`);
          setIsDeleting(false);
          return;
        }
      }

      if (onSaveGroups) {
        for (const groupId of groupIdsToDelete) {
          onSaveGroups([], subjectName, String(editContext?.selectedYear || ""), {
            mode: "edit",
            calendarId: String(editContext?.calendarId || ""),
            groupRef: String(groupId)
          });
        }
      }

      if (onGroupCreated) {
        await onGroupCreated();
      }

      setShowDeleteConfirm(false);
      if (onClose) onClose();
      else onBack();
    } catch (e) {
      setError(e?.message || "Ocurrió un error eliminando el grupo.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleAddGroup() {
    if (isSaving) return;

    if (!groupName.trim()) {
      setError("Escribe un nombre de grupo.");
      return;
    }

    if (selectedDays.length === 0) {
      setError("Selecciona al menos un dia.");
      return;
    }

    const finalSelectedCareers =
      selectedCareers.length > 0
        ? [...selectedCareers]
        : careerOptions.length > 0
        ? careerOptions.map((option) => option.key)
        : careers.length > 0
        ? [careers[0]]
        : [];

    if (!isEditMode && finalSelectedCareers.length === 0) {
      setError("No hay carreras disponibles para crear el grupo.");
      return;
    }

    const selectedMeta = careerOptions.filter((option) => finalSelectedCareers.includes(option.key));
    const activeAcademic = getVisibleCalendarAcademicTarget();
    const metaSemester = Number(selectedMeta[0]?.semestre || 0);
    const metaYear = Number(selectedMeta[0]?.anio || 0);
    // Prioriza el calendario visible actual para que el grupo aparezca donde se está trabajando.
    const resolvedSemester =
      activeAcademic.semester || (metaSemester === 1 || metaSemester === 2 ? metaSemester : 1);
    const resolvedYear = activeAcademic.year || (metaYear >= 1 && metaYear <= 5 ? metaYear : 1);

    let totalModules = 0;
    for (const day of selectedDays) {
      const dayRange = dayTimeRanges[day] || { fromTime: "08:00", toTime: "09:20" };
      const startIndex = startTimes.indexOf(dayRange.fromTime);
      const endIndex = endTimes.indexOf(dayRange.toTime);
      if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
        setError(`Rango de horario inválido en ${day}.`);
        return;
      }
      totalModules += endIndex - startIndex + 1;
    }

    setError("");
    setIsSaving(true);

    const editedGroupColor = String(editContext?.draft?.color || "").trim();

    if (isEditMode) {
      try {
        if (
          !window.api?.grupos?.listar ||
          !window.api?.grupos?.actualizar ||
          !window.api?.grupos?.crear ||
          !window.api?.grupos?.agregarHorarios ||
          !window.api?.grupos?.reemplazarHorarios ||
          !window.api?.grupos?.reemplazarProfesores
        ) {
          setError("No está disponible la API de grupos.");
          setIsSaving(false);
          return;
        }

        const originalGroupId = toGroupId(editContext?.draft?.groupRef);
        if (!originalGroupId) {
          setError("No se pudo identificar el grupo original a editar.");
          setIsSaving(false);
          return;
        }

        const groupsResp = await window.api.grupos.listar();
        const allGroups = groupsResp?.success && Array.isArray(groupsResp.data) ? groupsResp.data : [];
        const originalGroup = allGroups.find((group) => Number(group?.id) === originalGroupId);
        if (!originalGroup) {
          setError("No se encontró el grupo original en la base de datos.");
          setIsSaving(false);
          return;
        }

        const originalCareers = toNormalizedCareerList(
          Array.isArray(originalGroup?.carreras) && originalGroup.carreras.length > 0
            ? originalGroup.carreras
            : editContext?.draft?.selectedCareers || []
        );
        let selectedCareerList = toNormalizedCareerList(finalSelectedCareers);
        if (applyChangesToAllCareers) {
          selectedCareerList = originalCareers;
        } else {
          const matchedCareer = findCareerByNormalized(originalCareers, selectedCareer);
          if (!matchedCareer) {
            setError("La carrera actual no pertenece a este grupo.");
            setIsSaving(false);
            return;
          }
          selectedCareerList = [matchedCareer];
        }
        const sameCareerSelection = areCareerListsEqual(originalCareers, selectedCareerList);
        const horariosPayload = buildDbHorariosPayloadFromSelection();
        const teacherAssignments = await buildTeacherAssignments();
        const calendarId = String(editContext?.calendarId || "").trim();
        const editedSemesterMatch = calendarId.match(/s([12])y/i);
        const editedSemester = editedSemesterMatch ? Number(editedSemesterMatch[1]) : resolvedSemester;
        const editedYear = Number(editContext?.selectedYear || resolvedYear);
        if (horariosPayload.length === 0) {
          setError("No se pudo construir el horario para guardar.");
          setIsSaving(false);
          return;
        }

        if (applyChangesToAllCareers) {
          const siblingGroups = allGroups.filter((group) => {
            if (!group || Number(group.id) <= 0) return false;
            const sameCode = String(group.codigo || "").trim() === String(originalGroup.codigo || "").trim();
            const sameSubject = Number(group.idMateria) === Number(originalGroup.idMateria);
            const sameSemester = Number(group.idSemestre) === Number(originalGroup.idSemestre);
            const sameLectiveSemester = Number(group.semestreLectivo || 0) === Number(originalGroup.semestreLectivo || 0);
            const sameLectiveYear = Number(group.anioLectivo || 0) === Number(originalGroup.anioLectivo || 0);
            return sameCode && sameSubject && sameSemester && sameLectiveSemester && sameLectiveYear;
          });

          if (siblingGroups.length === 0) {
            setError("No se encontraron grupos vinculados para actualizar.");
            setIsSaving(false);
            return;
          }

          for (const sibling of siblingGroups) {
            const siblingId = Number(sibling.id);
            if (!siblingId) continue;
            const siblingCareers = toNormalizedCareerList(Array.isArray(sibling.carreras) ? sibling.carreras : []);
            const updateResp = await window.api.grupos.actualizar({
              id: siblingId,
              codigo: groupName.trim(),
              idMateria: Number(sibling.idMateria),
              horasSemestrales: totalModules * 20,
              esContrasemestre: Boolean(sibling.esContrasemestre),
              cupo: Number(sibling.cupo || 30),
              color: editedGroupColor || String(sibling.color || "#A0C4FF"),
              idSemestre: Number(sibling.idSemestre),
              carreras: siblingCareers
            });

            if (!updateResp?.success) {
              setError(updateResp?.error || "No se pudo actualizar uno de los grupos vinculados.");
              setIsSaving(false);
              return;
            }

            const replaceResp = await window.api.grupos.reemplazarHorarios(siblingId, horariosPayload);
            if (!replaceResp?.success) {
              setError(replaceResp?.error || "No se pudieron reemplazar horarios en uno de los grupos vinculados.");
              setIsSaving(false);
              return;
            }

            const replaceTeachersResp = await window.api.grupos.reemplazarProfesores(siblingId, teacherAssignments);
            if (!replaceTeachersResp?.success) {
              setError(replaceTeachersResp?.error || "No se pudieron reemplazar docentes en uno de los grupos vinculados.");
              setIsSaving(false);
              return;
            }
          }

          if (onGroupCreated) {
            await onGroupCreated();
          }

          if (onClose) onClose();
          else onBack();
          return;
        }

        if (sameCareerSelection) {
          const updateResp = await window.api.grupos.actualizar({
            id: originalGroupId,
            codigo: groupName.trim(),
            idMateria: Number(originalGroup.idMateria),
            horasSemestrales: totalModules * 20,
            esContrasemestre: Boolean(originalGroup.esContrasemestre),
            cupo: Number(originalGroup.cupo || 30),
            color: editedGroupColor || String(originalGroup.color || "#A0C4FF"),
            idSemestre: Number(originalGroup.idSemestre),
            carreras: selectedCareerList
          });

          if (!updateResp?.success) {
            setError(updateResp?.error || "No se pudo actualizar el grupo.");
            setIsSaving(false);
            return;
          }

          const replaceResp = await window.api.grupos.reemplazarHorarios(originalGroupId, horariosPayload);
          if (!replaceResp?.success) {
            setError(replaceResp?.error || "No se pudieron reemplazar horarios.");
            setIsSaving(false);
            return;
          }

          const replaceTeachersResp = await window.api.grupos.reemplazarProfesores(originalGroupId, teacherAssignments);
          if (!replaceTeachersResp?.success) {
            setError(replaceTeachersResp?.error || "No se pudieron reemplazar docentes.");
            setIsSaving(false);
            return;
          }
        } else {
          const originalCareerSet = new Set(originalCareers);
          const splitCareers = selectedCareerList.filter((career) => originalCareerSet.has(career));
          const remainingCareers = originalCareers.filter((career) => !splitCareers.includes(career));

          if (splitCareers.length === 0) {
            setError("Selecciona al menos una carrera que pertenezca al grupo original.");
            setIsSaving(false);
            return;
          }

          if (remainingCareers.length === 0) {
            setError("Para mantener el mismo grupo, selecciona todas las carreras.");
            setIsSaving(false);
            return;
          }

          const originalCode = String(originalGroup?.codigo || "").trim();
          const requestedCode = String(groupName || "").trim();
          const splitCode = requestedCode || originalCode;

          if (!splitCode) {
            setError("No se pudo definir un código para el nuevo grupo.");
            setIsSaving(false);
            return;
          }

          const createResp = await window.api.grupos.crear({
            codigo: splitCode,
            idMateria: Number(originalGroup.idMateria),
            horasSemestrales: totalModules * 20,
            esContrasemestre: Boolean(originalGroup.esContrasemestre),
            cupo: Number(originalGroup.cupo || 30),
            color: editedGroupColor || String(originalGroup.color || "#A0C4FF"),
            carreras: splitCareers,
            semestreLectivoNumero: Number(originalGroup.semestreLectivo || 1),
            anioLectivo: Number(originalGroup.anioLectivo || 2026),
            semestre: editedSemester,
            anio: editedYear
          });

          if (!createResp?.success) {
            setError(createResp?.error || "No se pudo crear el nuevo grupo para la carrera seleccionada.");
            setIsSaving(false);
            return;
          }

          const newGroupId = Number(createResp?.data?.id || 0);
          if (!newGroupId) {
            setError("No se pudo obtener el ID del nuevo grupo.");
            setIsSaving(false);
            return;
          }

          const horariosResp = await window.api.grupos.agregarHorarios(newGroupId, horariosPayload);
          if (!horariosResp?.success) {
            setError(horariosResp?.error || "No se pudieron guardar horarios del nuevo grupo.");
            setIsSaving(false);
            return;
          }

          const replaceTeachersResp = await window.api.grupos.reemplazarProfesores(newGroupId, teacherAssignments);
          if (!replaceTeachersResp?.success) {
            setError(replaceTeachersResp?.error || "No se pudieron guardar docentes del nuevo grupo.");
            setIsSaving(false);
            return;
          }

          const originalUpdateResp = await window.api.grupos.actualizar({
            id: originalGroupId,
            codigo: originalCode || groupName.trim(),
            idMateria: Number(originalGroup.idMateria),
            horasSemestrales: Number(originalGroup.horasSemestrales || 0),
            esContrasemestre: Boolean(originalGroup.esContrasemestre),
            cupo: Number(originalGroup.cupo || 30),
            color: String(originalGroup.color || "#A0C4FF"),
            idSemestre: Number(originalGroup.idSemestre),
            carreras: remainingCareers
          });

          if (!originalUpdateResp?.success) {
            setError(originalUpdateResp?.error || "No se pudieron actualizar carreras del grupo original.");
            setIsSaving(false);
            return;
          }
        }

        if (onGroupCreated) {
          await onGroupCreated();
        }

        if (onClose) onClose();
        else onBack();
      } catch (e) {
        setError(e?.message || "Ocurrió un error actualizando el grupo.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    try {
      if (!window.api?.materias?.listar || !window.api?.grupos?.crear) {
        setError("No está disponible la API de grupos/materias.");
        setIsSaving(false);
        return;
      }

      const materiasResp = await window.api.materias.listar();
      if (!materiasResp?.success || !Array.isArray(materiasResp.data)) {
        setError("No se pudo obtener la materia seleccionada.");
        setIsSaving(false);
        return;
      }

      const materia = materiasResp.data.find(
        (m) => String(m.nombre || "").trim().toLowerCase() === String(subjectName || "").trim().toLowerCase()
      );
      if (!materia?.id) {
        setError("No se encontró la materia en la base de datos.");
        setIsSaving(false);
        return;
      }

      const codigo = groupName.trim();
      const lective = parseLectiveTerm(currentLectiveTerm);
      const groupColor = pickGroupColorForCalendar(resolvedSemester, resolvedYear);
      const createResp = await window.api.grupos.crear({
        codigo,
        idMateria: materia.id,
        horasSemestrales: totalModules * 20,
        esContrasemestre: false,
        cupo: 30,
        color: groupColor,
        carreras: finalSelectedCareers,
        semestreLectivoNumero: lective?.semestreLectivoNumero,
        anioLectivo: lective?.anioLectivo,
        semestre: resolvedSemester,
        anio: resolvedYear
      });

      if (!createResp?.success) {
        setError(createResp?.error || "No se pudo crear el grupo en la base.");
        setIsSaving(false);
        return;
      }

      const createdGroupIds = Array.isArray(createResp?.data?.ids)
        ? createResp.data.ids.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0)
        : [];
      if (createdGroupIds.length === 0) {
        const fallbackId = Number(createResp?.data?.id || 0);
        if (fallbackId > 0) {
          createdGroupIds.push(fallbackId);
        }
      }

      if (createdGroupIds.length === 0) {
        setError("No se pudo obtener el ID del grupo creado.");
        setIsSaving(false);
        return;
      }

      const horariosPayload = [];
      for (const day of selectedDays) {
        const dayRange = dayTimeRanges[day] || { fromTime: "08:00", toTime: "09:20" };
        const startIndex = startTimes.indexOf(dayRange.fromTime);
        const endIndex = endTimes.indexOf(dayRange.toTime);
        const dbDay = dayUiToDb(day);
        if (!dbDay) continue;
        for (let idx = startIndex; idx <= endIndex; idx += 1) {
          horariosPayload.push({ dia: dbDay, modulo: idx + 1 });
        }
      }

      if (horariosPayload.length > 0 && window.api?.grupos?.agregarHorarios) {
        for (const idGrupo of createdGroupIds) {
          const horariosResp = await window.api.grupos.agregarHorarios(idGrupo, horariosPayload);
          if (!horariosResp?.success) {
            setError(horariosResp?.error || "No se pudieron guardar horarios.");
            setIsSaving(false);
            return;
          }
        }
      }

      if (window.api?.grupos?.reemplazarProfesores) {
        const teacherAssignments = await buildTeacherAssignments();
        for (const idGrupo of createdGroupIds) {
          const replaceTeachersResp = await window.api.grupos.reemplazarProfesores(idGrupo, teacherAssignments);
          if (!replaceTeachersResp?.success) {
            setError(replaceTeachersResp?.error || "No se pudieron guardar docentes.");
            setIsSaving(false);
            return;
          }
        }
      }

      const payloadSchedules = selectedDays.map((day, index) => {
        const dayRange = dayTimeRanges[day] || { fromTime: "08:00", toTime: "09:20" };
        return {
          id: Date.now() + index,
          days: [day],
          fromTime: dayRange.fromTime,
          toTime: dayRange.toTime,
          groups: [
            {
              id: Date.now() + 1 + index,
              name: groupName.trim(),
              teachers: [...selectedTeachers],
              assignedCareers: [...finalSelectedCareers],
              color: groupColor
            }
          ]
        };
      });

      if (onGroupCreated) {
        await onGroupCreated();
      } else if (onSaveGroups) {
        // Fallback solo si no hay recarga desde DB disponible.
        onSaveGroups(payloadSchedules, subjectName, String(resolvedYear));
      }

      if (onClose) onClose();
      else onBack();
    } catch (e) {
      setError(e?.message || "Ocurrió un error guardando el grupo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop groups-list-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          if (onClose) onClose();
          else onBack();
        }
      }}
    >
      <section className="group-modal groups-list-modal second-step-modal" role="dialog" aria-modal="true">
        <div className="modal-header-with-button">
          <h2 className="modal-title">{`Paso 2 - Grupos por horario / ${subjectName} (${lectiveTermLabel})`}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => {
              if (onClose) onClose();
              else onBack();
            }}
          >
            X
          </button>
        </div>

        <div className="second-step-card">
          <input
            className="second-step-group-name"
            type="text"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Grupo A"
          />

          <div className="second-step-top-row">
            <div className="teacher-picker">
              <input
                className="second-step-teacher-search"
                type="text"
                placeholder="Buscar docente"
                value={teacherSearch}
                onChange={(event) => setTeacherSearch(event.target.value)}
              />

              {teacherSearch && (
                <div className="second-step-dropdown">
                  {filteredTeachers.length === 0 && (
                    <div className="second-step-dropdown-item">No se encontraron docentes.</div>
                  )}

                  {filteredTeachers.map((teacher) => (
                    <button
                      key={teacher}
                      type="button"
                      className="second-step-dropdown-item"
                      onClick={() => addTeacher(teacher)}
                    >
                      {teacher}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="second-step-teacher-chips">
              {selectedTeachers.map((teacher) => (
                <span key={teacher} className="teacher-chip">
                  {teacher}
                  <button type="button" className="teacher-chip-remove-btn" onClick={() => removeTeacher(teacher)}>
                    X
                  </button>
                </span>
              ))}
            </div>

            {!isEditMode && (
              <div className="second-step-careers" ref={careerDropdownRef}>
                <button
                  type="button"
                  className="second-step-careers-btn"
                  onClick={() => setIsCareerDropdownOpen((prev) => !prev)}
                >
                  {careerOptions.length === 0
                    ? "Sin carreras para esta materia"
                    : selectedCareers.length === careerOptions.length
                    ? "Todas las carreras posibles"
                    : `${selectedCareers.length} seleccionadas`}
                </button>

                {isCareerDropdownOpen && (
                  <div className="second-step-dropdown second-step-careers-dropdown">
                    {careerOptions.length === 0 && (
                      <div className="second-step-dropdown-item">No hay carreras para esta materia.</div>
                    )}

                    {careerOptions.map((option) => (
                      <label key={option.key} className="second-step-career-option">
                        <input
                          type="checkbox"
                          checked={selectedCareers.includes(option.key)}
                          onChange={() => toggleCareer(option.key)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditMode && (
            <div style={{ marginTop: "6px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <label className="second-step-career-option">
                <input
                  type="radio"
                  name="edit-career-scope"
                  checked={applyChangesToAllCareers}
                  onChange={() => setApplyChangesToAllCareers(true)}
                />
                <span>{`Aplicar a todas las carreras del grupo (${editGroupCareersText})`}</span>
              </label>
              <label className="second-step-career-option">
                <input
                  type="radio"
                  name="edit-career-scope"
                  checked={!applyChangesToAllCareers}
                  onChange={() => setApplyChangesToAllCareers(false)}
                />
                <span>Aplicar solo a la carrera actual ({selectedCareer || "sin carrera"})</span>
              </label>
            </div>
          )}

          <div className="days-selector second-step-days">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-btn ${selectedDays.includes(day) ? "active" : ""}`}
                onClick={() => toggleDay(day)}
              >
                {day}.
              </button>
            ))}
          </div>

          {selectedDays.map((day) => {
            const range = dayTimeRanges[day] || { fromTime: "08:00", toTime: "09:20" };
            return (
              <div key={day} className="second-step-time-row">
                <label className="second-step-time-label">{day}</label>

                <label className="second-step-time-label">
                  Desde
                  <select
                    className="second-step-time-select"
                    value={range.fromTime}
                    onChange={(event) => updateDayTime(day, "fromTime", event.target.value)}
                  >
                    {startTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </label>

                <label className="second-step-time-label">
                  Hasta
                  <select
                    className="second-step-time-select"
                    value={range.toTime}
                    onChange={(event) => updateDayTime(day, "toTime", event.target.value)}
                  >
                    {endTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })}

          {error && <div className="modal-error">{error}</div>}

          <button type="button" className="add-schedule-btn second-step-submit" onClick={handleAddGroup} disabled={isSaving || isDeleting}>
            {isSaving ? "Guardando..." : isEditMode ? "Guardar cambios" : "+ Agregar grupo"}
          </button>

          {isEditMode && !showDeleteConfirm && (
            <button
              type="button"
              className="add-schedule-btn second-step-submit"
              style={{
                backgroundColor: "#e74c3c",
                marginTop: "8px"
              }}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSaving || isDeleting}
            >
              Eliminar grupo
            </button>
          )}

          {isEditMode && showDeleteConfirm && (
            <div style={{
              marginTop: "10px",
              padding: "12px",
              border: "1px solid #e74c3c",
              borderRadius: "8px",
              backgroundColor: "#fff5f5"
            }}>
              <p style={{ margin: "0 0 8px", color: "#c0392b", fontWeight: "bold" }}>
                {applyChangesToAllCareers
                  ? "¿Eliminar este grupo y todos sus grupos hermanos (mismas carreras)?"
                  : "¿Eliminar este grupo? Se borrarán sus horarios, docentes asignados y relaciones con carreras."}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="add-schedule-btn second-step-submit"
                  style={{ backgroundColor: "#e74c3c", flex: 1 }}
                  onClick={handleDeleteGroup}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button
                  type="button"
                  className="add-schedule-btn second-step-submit"
                  style={{ backgroundColor: "#95a5a6", flex: 1 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

window.SubjectGroupsModal = SubjectGroupsModal;
