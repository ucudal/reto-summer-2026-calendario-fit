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
    days = [],
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
  const [fromTime, setFromTime] = React.useState("08:00");
  const [toTime, setToTime] = React.useState("09:20");
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
    setFromTime("08:00");
    setToTime("09:20");
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
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
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

    const startIndex = startTimes.indexOf(fromTime);
    const endIndex = endTimes.indexOf(toTime);
    if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
      setError("Rango de horario inválido.");
      return;
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

      const codigo = `GRP-${Date.now()}`;
      const createResp = await window.api.grupos.crear({
        codigo,
        idMateria: materia.id,
        horasSemestrales: (endIndex - startIndex + 1) * 20,
        esContrasemestre: false,
        cupo: 30,
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

    const payloadSchedules = [
      {
        id: Date.now(),
        days: [...selectedDays],
        fromTime,
        toTime,
        groups: [
          {
            id: Date.now() + 1,
            name: groupName.trim(),
            teachers: [...selectedTeachers],
            assignedCareers: [...finalSelectedCareers]
          }
        ]
      }
    ];

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

          <div className="second-step-time-row">
            <label className="second-step-time-label">
              Desde
              <select className="second-step-time-select" value={fromTime} onChange={(event) => setFromTime(event.target.value)}>
                {startTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </label>

            <label className="second-step-time-label">
              Hasta
              <select className="second-step-time-select" value={toTime} onChange={(event) => setToTime(event.target.value)}>
                {endTimes.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </label>
          </div>

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
