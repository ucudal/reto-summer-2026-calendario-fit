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
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const careerDropdownRef = React.useRef(null);

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

  const startTimes = ["08:00", "09:30", "11:00", "12:25", "16:50", "18:15", "19:45", "21:15"];
  const endTimes = ["09:20", "10:50", "12:20", "13:45", "18:10", "19:35", "21:05", "22:35"];
  const groupColors = window.AppData?.GROUP_COLORS || ["#A0C4FF"];

  React.useEffect(() => {
    if (!isOpen) return;

    setGroupName("");
    setTeacherSearch("");
    setSelectedTeachers([]);
    setAvailableTeachers([]);
    setIsCareerDropdownOpen(false);
    setCareerOptions([]);
    setSelectedCareers([]);
    setSelectedDays([]);
    setDayTimeRanges({});
    setError("");
    setIsSaving(false);
  }, [isOpen, subject, careers]);

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
            const apellido = String(row?.apellido || "").trim();
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
    if (!isOpen || !subject) return;

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

        const response = await window.api.materias.listarCarrerasPlanes(subject);
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
        setSelectedCareers(unique.map((item) => item.key));
      } catch (e) {
        if (!isCancelled) {
          setCareerOptions([]);
          setSelectedCareers([]);
        }
      }
    }

    loadCareerPlanOptions();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, subject]);

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

  if (!isOpen || !subject) return null;

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

    if (finalSelectedCareers.length === 0) {
      setError("No hay carreras disponibles para crear el grupo.");
      return;
    }

    const selectedMeta = careerOptions.filter((option) => finalSelectedCareers.includes(option.key));
    // Si hay diferencias entre carreras, usamos el primer año/semestre disponible.
    // (segun tu criterio actual, esto no debe bloquear la creación del grupo)
    const resolvedSemester = Number(selectedMeta[0]?.semestre || 1);
    const resolvedYear = Number(selectedMeta[0]?.anio || 1);

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
        (m) => String(m.nombre || "").trim().toLowerCase() === String(subject || "").trim().toLowerCase()
      );
      if (!materia?.id) {
        setError("No se encontró la materia en la base de datos.");
        setIsSaving(false);
        return;
      }

      const codigo = groupName.trim();
      const activeCalendar = (calendars || []).find(
        c => c.visible && c.lectiveTerm
      );

      const lective = activeCalendar?.lectiveTerm || null;

      const groupColor = pickGroupColorForCalendar(resolvedSemester, resolvedYear);
      const createResp = await window.api.grupos.crear({
        codigo,
        idMateria: materia.id,
        horasSemestrales: totalModules * 20,
        esContrasemestre: false,
        cupo: 30,
        color: groupColor,
        carreras: finalSelectedCareers,
        semestreLectivoNumero: lective?.numeroSem,
        anioLectivo: lective?.anio,
        semestre: resolvedSemester,
        anio: resolvedYear
      });

      if (!createResp?.success) {
        setError(createResp?.error || "No se pudo crear el grupo en la base.");
        setIsSaving(false);
        return;
      }

      const idGrupo = Number(createResp?.data?.id || 0);
      if (!idGrupo) {
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
        const horariosResp = await window.api.grupos.agregarHorarios(idGrupo, horariosPayload);
        if (!horariosResp?.success) {
          setError(horariosResp?.error || "No se pudieron guardar horarios.");
          setIsSaving(false);
          return;
        }
      }

      if (selectedTeachers.length > 0 && window.api?.docentes?.listar && window.api?.grupos?.asignarProfesor) {
        const docentesResp = await window.api.docentes.listar();
        const docentes = docentesResp?.success && Array.isArray(docentesResp.data) ? docentesResp.data : [];

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

          await window.api.grupos.asignarProfesor({
            idGrupo,
            idProfesor: docente.id,
            carga: i === 0 ? "Titular" : "Ayudante",
            esPrincipal: i === 0
          });
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

      if (onSaveGroups) {
        onSaveGroups(payloadSchedules, subject, String(resolvedYear));
      }

      if (onGroupCreated) {
        await onGroupCreated();
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
          <h2 className="modal-title">Grupos por horario / {subject}</h2>
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
          </div>

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

          <button type="button" className="add-schedule-btn second-step-submit" onClick={handleAddGroup} disabled={isSaving}>
            {isSaving ? "Guardando..." : "+ Agregar grupo"}
          </button>
        </div>
      </section>
    </div>
  );
}

window.SubjectGroupsModal = SubjectGroupsModal;
