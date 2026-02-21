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
    onBack
  } = props;

  // Estado para horarios de la asignatura
  const [schedules, setSchedules] = React.useState([]);

  // Estado para agregar nuevo horario
  const [newSchedule, setNewSchedule] = React.useState({
    selectedDays: [],
    selectedModules: [],
    showModulesDropdown: false
  });

  // Si no está abierto, no renderiza nada
  if (!isOpen || !subject) return null;

  // Módulos predefinidos (ejemplo)
  const modules = [
    { id: 1, label: "08:00 - 09:20" },
    { id: 2, label: "09:30 - 10:50" },
    { id: 3, label: "11:00 - 12:20" },
    { id: 4, label: "13:45 - 15:15" },
    { id: 5, label: "15:20 - 16:40" },
    { id: 6, label: "18:00 - 19:20" }
  ];

  // Cambia selección de día
  function toggleDay(day) {
    setNewSchedule((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day]
    }));
  }

  // Cambia selección de módulo
  function toggleModule(moduleId) {
    setNewSchedule((prev) => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter((m) => m !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  }

  // Agrega nuevo horario
  function addSchedule() {
    if (newSchedule.selectedDays.length === 0 || newSchedule.selectedModules.length === 0) {
      alert("Selecciona al menos un día y un módulo");
      return;
    }

    const schedule = {
      id: Date.now(),
      days: [...newSchedule.selectedDays],
      modules: newSchedule.selectedModules.map((mid) =>
        modules.find((m) => m.id === mid)
      ),
      groups: []
    };

    setSchedules((prev) => [...prev, schedule]);
    setNewSchedule({ selectedDays: [], selectedModules: [], showModulesDropdown: false });
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
                teacher: "",
                assignedCareers: []
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

  // Actualiza módulos de un horario
  function updateScheduleModules(scheduleId, moduleIds) {
    const newModules = moduleIds.map((mid) =>
      modules.find((m) => m.id === mid)
    );
    setSchedules((prev) =>
      prev.map((sch) =>
        sch.id === scheduleId ? { ...sch, modules: newModules } : sch
      )
    );
  }

  return (
    <div
      className="modal-backdrop groups-list-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onBack();
      }}
    >
      <section className="group-modal groups-list-modal" role="dialog" aria-modal="true">
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

        {/* Sección para agregar nuevo horario */}
        <div className="subject-schedule-form">
          <div className="form-new-group-header">+ Nuevo grupo</div>

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
            <button
              type="button"
              className="modules-dropdown-btn"
              onClick={() =>
                setNewSchedule((prev) => ({
                  ...prev,
                  showModulesDropdown: !prev.showModulesDropdown
                }))
              }
            >
              Agregar módulos ▼
            </button>

            {newSchedule.showModulesDropdown && (
              <div className="modules-dropdown-menu">
                {modules.map((module) => (
                  <label key={module.id} className="module-dropdown-item">
                    <input
                      type="checkbox"
                      checked={newSchedule.selectedModules.includes(module.id)}
                      onChange={() => toggleModule(module.id)}
                    />
                    {module.label}
                  </label>
                ))}
              </div>
            )}

            <div className="selected-modules-display">
              {newSchedule.selectedModules.map((moduleId) => {
                const module = modules.find((m) => m.id === moduleId);
                return (
                  <button
                    key={moduleId}
                    type="button"
                    className="selected-module-chip"
                    onClick={() => toggleModule(moduleId)}
                  >
                    {module.label} ✕
                  </button>
                );
              })}
            </div>
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
                      className="add-first-group-btn"
                      onClick={() => addGroupToSchedule(schedule.id)}
                    >
                      + Crear primer grupo
                    </button>
                  ) : (
                    <>
                      {schedule.groups.map((group) => (
                        <div key={group.id} className="group-row">
                          <span className="group-name">{group.name}</span>
                          
                          <select
                            className="group-select group-teacher-select"
                            value={group.teacher}
                            onChange={(e) =>
                              updateGroup(
                                schedule.id,
                                group.id,
                                "teacher",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Docente sin asignar</option>
                            <option value="Javier Yannone">Javier Yannone</option>
                            <option value="Angel Mamberto">Angel Mamberto</option>
                          </select>

                          <select
                            className="group-select group-careers-select"
                            value={group.assignedCareers.length === careers.length ? "all" : ""}
                            onChange={(e) => {
                              if (e.target.value === "all") {
                                setSchedules((prev) =>
                                  prev.map((sch) =>
                                    sch.id === schedule.id
                                      ? {
                                          ...sch,
                                          groups: sch.groups.map((grp) =>
                                            grp.id === group.id
                                              ? { ...grp, assignedCareers: [...careers] }
                                              : grp
                                          )
                                        }
                                      : sch
                                  )
                                );
                              }
                            }}
                          >
                            <option value="">
                              {group.assignedCareers.length === 0
                                ? "Seleccionar"
                                : group.assignedCareers.length === careers.length
                                ? "Todas las carreras"
                                : `${group.assignedCareers.length} seleccionadas`}
                            </option>
                            <option value="all">Todas las carreras</option>
                          </select>

                          <button
                            type="button"
                            className="group-delete-btn-inline"
                            onClick={() => removeGroup(schedule.id, group.id)}
                          >
                            🗑
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="add-another-group-btn"
                        onClick={() => addGroupToSchedule(schedule.id)}
                      >
                        + Nuevo grupo
                      </button>
                    </>
                  )}
                </div>

                {/* Separador visual */}
                <div className="schedule-divider"></div>

                {/* Sección de días y módulos */}
                <div className="schedule-footer">
                  <div className="schedule-card-days-row">
                    {days.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`schedule-day-chip ${
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

                  <div className="schedule-modules-footer">
                    <select
                      className="modules-select"
                      value=""
                      onChange={(e) => {
                        const moduleId = parseInt(e.target.value);
                        if (moduleId) {
                          const currentIds = schedule.modules.map((m) => m.id);
                          if (!currentIds.includes(moduleId)) {
                            updateScheduleModules(schedule.id, [...currentIds, moduleId]);
                          }
                        }
                      }}
                    >
                      <option value="">Agregar módulos</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.label}
                        </option>
                      ))}
                    </select>

                    <div className="selected-modules-inline">
                      {schedule.modules.map((module) => (
                        <button
                          key={module.id}
                          type="button"
                          className="module-chip"
                          onClick={() => {
                            const newIds = schedule.modules
                              .filter((m) => m.id !== module.id)
                              .map((m) => m.id);
                            updateScheduleModules(schedule.id, newIds);
                          }}
                        >
                          {module.label} ✕
                        </button>
                      ))}
                    </div>
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
      </section>
    </div>
  );
}

window.SubjectGroupsModal = SubjectGroupsModal;
