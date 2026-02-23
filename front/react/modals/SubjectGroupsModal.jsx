/*
  Componente: SubjectGroupsModal
  Que hace:
  - Muestra modal para gestionar grupos de una asignatura específica.
  - Permite agregar horarios con días seleccionables y módulos.
  - Permite crear grupos por cada horario.
  - Permite asignar docentes y carreras a cada grupo.
*/

function SubjectGroupsModal(props) {
  const {
    isOpen,
    subject,
    careers,
    days,
    onClose,
    onBack,
    onSaveGroups
  } = props;

  // Estado para horarios de la asignatura
  const [schedules, setSchedules] = React.useState([]);

  // Estado para controlar qué dropdown de carreras está abierto
  const [openCareerDropdown, setOpenCareerDropdown] = React.useState(null);

  // Estado para controlar qué buscador de docentes está abierto
  const [openTeacherSearch, setOpenTeacherSearch] = React.useState(null);

  // Estado para búsqueda de docentes
  const [teacherSearchTerm, setTeacherSearchTerm] = React.useState("");

  // Estado para agregar nuevo horario
  const [newSchedule, setNewSchedule] = React.useState({
    selectedDays: [],
    fromTime: "08:00",
    toTime: "09:20"
  });

  // Cierra el dropdown cuando se hace clic fuera
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (openCareerDropdown && !event.target.closest('.career-dropdown-container')) {
        setOpenCareerDropdown(null);
      }
      if (openTeacherSearch && !event.target.closest('.teacher-search-container')) {
        setOpenTeacherSearch(null);
        setTeacherSearchTerm("");
      }
    }
    
    if (openCareerDropdown || openTeacherSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openCareerDropdown, openTeacherSearch]);

  // Si no está abierto, no renderiza nada
  if (!isOpen || !subject) return null;

  // Lista mock de docentes
  const availableTeachers = [
    "Javier Yannone",
    "Angel Mamberto",
    "María González",
    "Carlos Rodríguez",
    "Ana Martínez",
    "Pedro Sánchez",
    "Laura Fernández",
    "Diego López",
    "Carolina Pérez",
    "Martín Torres"
  ];

  // Horas de inicio de módulos
  const startTimes = ["08:00", "09:30", "11:00", "12:25", "16:50", "18:15", "19:45", "21:15"];
  
  // Horas de fin de módulos
  const endTimes = ["09:20", "10:50", "12:20", "13:45", "18:10", "19:35", "21:05", "22:35"];

  // Cambia selección de día
  function toggleDay(day) {
    setNewSchedule((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day]
    }));
  }

  // Agrega nuevo horario
  function addSchedule() {
    if (newSchedule.selectedDays.length === 0) {
      alert("Selecciona al menos un día");
      return;
    }

    if (!newSchedule.fromTime || !newSchedule.toTime) {
      alert("Selecciona horario de inicio y fin");
      return;
    }

    const schedule = {
      id: Date.now(),
      days: [...newSchedule.selectedDays],
      fromTime: newSchedule.fromTime,
      toTime: newSchedule.toTime,
      groups: []
    };

    setSchedules((prev) => [...prev, schedule]);
    setNewSchedule({ selectedDays: [], fromTime: "08:00", toTime: "09:20" });
  }

  // Agrega grupo a un horario
  function addGroupToSchedule(scheduleId) {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            groups: [
              ...sch.groups,
              {
                id: Date.now(),
                name: `Grupo ${String.fromCharCode(65 + sch.groups.length)}`,
                teachers: [],
                assignedCareers: [...careers]
              }
            ]
          };
        }
        return sch;
      })
    );
  }

  // Actualiza grupo
  function updateGroup(scheduleId, groupId, field, value) {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            groups: sch.groups.map((grp) =>
              grp.id === groupId ? { ...grp, [field]: value } : grp
            )
          };
        }
        return sch;
      })
    );
  }

  // Toggle carrera de un grupo
  function toggleCareerForGroup(scheduleId, groupId, careerName) {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            groups: sch.groups.map((grp) => {
              if (grp.id === groupId) {
                const assigned = grp.assignedCareers.includes(careerName)
                  ? grp.assignedCareers.filter((c) => c !== careerName)
                  : [...grp.assignedCareers, careerName];
                return { ...grp, assignedCareers: assigned };
              }
              return grp;
            })
          };
        }
        return sch;
      })
    );
  }

  // Agrega docente a un grupo
  function addTeacherToGroup(scheduleId, groupId, teacherName) {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            groups: sch.groups.map((grp) => {
              if (grp.id === groupId && !grp.teachers.includes(teacherName)) {
                return { ...grp, teachers: [...grp.teachers, teacherName] };
              }
              return grp;
            })
          };
        }
        return sch;
      })
    );
    setTeacherSearchTerm("");
    setOpenTeacherSearch(null);
  }

  // Elimina docente de un grupo
  function removeTeacherFromGroup(scheduleId, groupId, teacherName) {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            groups: sch.groups.map((grp) => {
              if (grp.id === groupId) {
                return { ...grp, teachers: grp.teachers.filter(t => t !== teacherName) };
              }
              return grp;
            })
          };
        }
        return sch;
      })
    );
  }

  // Toggle todas las carreras de un grupo
  function toggleAllCareersForGroup(scheduleId, groupId) {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            groups: sch.groups.map((grp) => {
              if (grp.id === groupId) {
                const allSelected = grp.assignedCareers.length === careers.length;
                return { ...grp, assignedCareers: allSelected ? [] : [...careers] };
              }
              return grp;
            })
          };
        }
        return sch;
      })
    );
  }

  // Elimina horario
  function removeSchedule(scheduleId) {
    setSchedules((prev) => prev.filter((sch) => sch.id !== scheduleId));
  }

  // Elimina grupo
  function removeGroup(scheduleId, groupId) {
    setSchedules((prev) =>
      prev.map((sch) => {
        if (sch.id === scheduleId) {
          return {
            ...sch,
            groups: sch.groups.filter((grp) => grp.id !== groupId)
          };
        }
        return sch;
      })
    );
  }

  // Actualiza días de un horario
  function updateScheduleDays(scheduleId, days) {
    setSchedules((prev) =>
      prev.map((sch) =>
        sch.id === scheduleId ? { ...sch, days } : sch
      )
    );
  }

  // Actualiza horario de inicio de un horario
  function updateScheduleTime(scheduleId, field, value) {
    setSchedules((prev) =>
      prev.map((sch) =>
        sch.id === scheduleId ? { ...sch, [field]: value } : sch
      )
    );
  }

  // Función para guardar y cerrar (usa año 1 por defecto, vendrá de BD)
  function handleSaveAndClose() {
    if (onSaveGroups) {
      onSaveGroups(schedules, subject, "1");
    }
    onBack();
  }

  return (
    <div
      className="modal-backdrop groups-list-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onBack();
      }}
    >
      <section className="group-modal groups-list-modal subject-groups-modal-container" role="dialog" aria-modal="true">
        <div className="modal-header-with-button">
          <button
            type="button"
            className="modal-back-btn"
            aria-label="Volver"
            onClick={onBack}
          >
            ← Volver
          </button>
          <h2 className="modal-title">Grupos por horario / {subject}</h2>
        </div>

        <div className="subject-groups-modal-scroll">
        {/* Sección para agregar nuevo horario */}
        <div className="subject-schedule-form">
          <div className="form-new-group-header">+ Nuevo horario</div>

          <div className="form-section">
            <div className="days-selector">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${
                    newSchedule.selectedDays.includes(day) ? "active" : ""
                  }`}
                  onClick={() => toggleDay(day)}
                >
                  {day}.
                </button>
              ))}
            </div>
          </div>

          <div className="form-section modules-section">
            <label className="time-select-label">
              Desde
              <select
                className="modules-dropdown-btn"
                value={newSchedule.fromTime}
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    fromTime: e.target.value
                  }))
                }
              >
                {startTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>

            <label className="time-select-label">
              Hasta
              <select
                className="modules-dropdown-btn"
                value={newSchedule.toTime}
                onChange={(e) =>
                  setNewSchedule((prev) => ({
                    ...prev,
                    toTime: e.target.value
                  }))
                }
              >
                {endTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            className="add-schedule-btn"
            onClick={addSchedule}
          >
            + Agregar horario
          </button>
        </div>

        {/* Lista de horarios con grupos */}
        <div className="schedules-list">
          {schedules.length === 0 ? (
            <p className="empty-schedules-message">
              Aún no hay ningún horario creado
            </p>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="schedule-card">
                {/* Sección de grupos */}
                <div className="schedule-groups-section">
                  {schedule.groups.length === 0 ? (
                    <button
                      type="button"
                      className="modules-dropdown-btn"
                      onClick={() => addGroupToSchedule(schedule.id)}
                    >
                      + Crear primer grupo
                    </button>
                  ) : (
                    <>
                      {schedule.groups.map((group) => (
                        <div key={group.id} className="group-card-wrapper">
                          {/* Encabezado del grupo */}
                          <div className="group-card-header-row">
                            <h3 className="group-card-title">{group.name}</h3>
                            <button
                              type="button"
                              className="group-delete-btn-inline"
                              onClick={() => removeGroup(schedule.id, group.id)}
                            >
                              🗑
                            </button>
                          </div>

                          {/* Grid de 3 columnas */}
                          <div className="group-grid-3col">
                            {/* Columna 1: Buscador de docentes */}
                            <div className="teacher-search-container">
                              <input
                                type="text"
                                placeholder="Buscar docente"
                                className="modules-dropdown-btn teacher-search-input"
                                value={openTeacherSearch === `${schedule.id}-${group.id}` ? teacherSearchTerm : ""}
                                onFocus={() => setOpenTeacherSearch(`${schedule.id}-${group.id}`)}
                                onChange={(e) => setTeacherSearchTerm(e.target.value)}
                              />

                              {openTeacherSearch === `${schedule.id}-${group.id}` && (
                                <div className="dropdown-menu-absolute">
                                  {availableTeachers
                                    .filter(teacher => 
                                      teacher.toLowerCase().includes(teacherSearchTerm.toLowerCase()) &&
                                      !group.teachers.includes(teacher)
                                    )
                                    .map((teacher) => (
                                      <div
                                        key={teacher}
                                        className="dropdown-item-block"
                                        onClick={() => addTeacherToGroup(schedule.id, group.id, teacher)}
                                      >
                                        {teacher}
                                      </div>
                                    ))}
                                  {availableTeachers.filter(teacher => 
                                    teacher.toLowerCase().includes(teacherSearchTerm.toLowerCase()) &&
                                    !group.teachers.includes(teacher)
                                  ).length === 0 && (
                                    <div className="dropdown-empty-message">
                                      No hay docentes disponibles
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Columna 2: Chips de docentes o mensaje */}
                            <div className="teacher-chips-container">
                              {group.teachers.length === 0 ? (
                                <span className="teacher-empty-message">Docente sin asignar</span>
                              ) : (
                                group.teachers.map((teacher) => (
                                  <span key={teacher} className="teacher-chip">
                                    {teacher}
                                    <button
                                      type="button"
                                      onClick={() => removeTeacherFromGroup(schedule.id, group.id, teacher)}
                                      className="teacher-chip-remove-btn"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>

                            {/* Columna 3: Selector de carreras */}
                            <div className="career-dropdown-container">
                              <button
                                type="button"
                                className="modules-dropdown-btn group-careers-select career-dropdown-btn-full"
                                onClick={() => {
                                  const dropdownId = `${schedule.id}-${group.id}`;
                                  setOpenCareerDropdown(openCareerDropdown === dropdownId ? null : dropdownId);
                                }}
                              >
                                {group.assignedCareers.length === 0
                                  ? "Seleccionar carreras"
                                  : group.assignedCareers.length === careers.length
                                  ? "Todas las carreras"
                                  : `${group.assignedCareers.length} seleccionadas`}
                                {" ▼"}
                              </button>

                              {openCareerDropdown === `${schedule.id}-${group.id}` && (
                                <div className="dropdown-menu-absolute">
                                  <label className="dropdown-item-block dropdown-item-bold">
                                    <input
                                      type="checkbox"
                                      checked={group.assignedCareers.length === careers.length}
                                      onChange={() => toggleAllCareersForGroup(schedule.id, group.id)}
                                    />
                                    {" "}Todas las carreras
                                  </label>
                                  {careers.map((career) => (
                                    <label key={career} className="dropdown-item-block">
                                      <input
                                        type="checkbox"
                                        checked={group.assignedCareers.includes(career)}
                                        onChange={() => toggleCareerForGroup(schedule.id, group.id, career)}
                                      />
                                      {" "}{career}
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="modules-dropdown-btn new-group-btn-spaced"
                        onClick={() => addGroupToSchedule(schedule.id)}
                      >
                        + Nuevo grupo
                      </button>
                    </>
                  )}
                </div>

                {/* Separador visual */}
                <div className="schedule-divider"></div>

                {/* Sección de días y horarios */}
                <div className="schedule-footer">
                  <div className="days-selector">
                    {days.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${
                          schedule.days.includes(day) ? "active" : ""
                        }`}
                        onClick={() => {
                          const newDays = schedule.days.includes(day)
                            ? schedule.days.filter((d) => d !== day)
                            : [...schedule.days, day];
                          updateScheduleDays(schedule.id, newDays);
                        }}
                      >
                        {day}.
                      </button>
                    ))}
                  </div>

                  <div className="form-section modules-section">
                    <label className="time-select-label">
                      Desde
                      <select
                        className="modules-dropdown-btn"
                        value={schedule.fromTime}
                        onChange={(e) =>
                          updateScheduleTime(schedule.id, "fromTime", e.target.value)
                        }
                      >
                        {startTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="time-select-label">
                      Hasta
                      <select
                        className="modules-dropdown-btn"
                        value={schedule.toTime}
                        onChange={(e) =>
                          updateScheduleTime(schedule.id, "toTime", e.target.value)
                        }
                      >
                        {endTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    type="button"
                    className="schedule-delete-btn"
                    onClick={() => removeSchedule(schedule.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        </div>

        {/* Botón para guardar y cerrar */}
        <div className="subject-groups-modal-footer">
          <button
            type="button"
            className="add-schedule-btn"
            onClick={handleSaveAndClose}
          >
            Guardar y cerrar
          </button>
        </div>
      </section>
    </div>
  );
}

window.SubjectGroupsModal = SubjectGroupsModal;
