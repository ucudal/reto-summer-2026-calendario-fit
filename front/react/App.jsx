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

  const loadCareersFromDb = React.useCallback(async () => {
    try {
      const response = await window.api?.carreras?.listar?.();
      const rows = response?.success ? (response.data || []) : [];
      const names = rows
        .map((item) => item?.nombre)
        .filter((name) => typeof name === "string" && name.trim() !== "");

      if (names.length === 0) return;

      setCareers(names);
      setSelectedCareer((prev) => (names.includes(prev) ? prev : names[0]));
    } catch (error) {
      // Si falla la carga desde DB, se mantiene el fallback en memoria.
    }
  }, []);

  React.useEffect(() => {
    loadCareersFromDb().catch(() => {});
  }, [loadCareersFromDb]);

  // Estado visual del modal de grupo.
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);

  // Estado de error del modal de grupo.
  const [modalError, setModalError] = React.useState("");

  // Estado del formulario del modal.
  const [groupForm, setGroupForm] = React.useState({
    subject: "",
    days: [DAYS[0]],
    year: "1",
    fromTime: TIME_BLOCKS[0].start,
    toTime: TIME_BLOCKS[0].end,
    careers: [selectedCareer],
    plans: (plansByCareer[selectedCareer] || [selectedPlan]).slice(0, 1)
  });

  // Estado visual del modal de carrera.
  const [isCreateCareerOpen, setIsCreateCareerOpen] = React.useState(false);

  // Estado de error del modal de carrera.
  const [careerModalError, setCareerModalError] = React.useState("");

  // Formulario del modal de carrera.
  const [careerForm, setCareerForm] = React.useState({
    nombre: ""
  });

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

  // Lista plana de alertas de calendarios visibles.
  const visibleAlerts = visibleCalendars.flatMap((calendar) => calendar.alerts);

  // Devuelve los planes habilitados para las carreras elegidas en el modal.
  const availablePlansForGroup = React.useMemo(() => {
    const selectedCareers = groupForm.careers || [];
    const merged = selectedCareers.flatMap((career) => plansByCareer[career] || []);
    return [...new Set(merged)];
  }, [groupForm.careers, plansByCareer]);

  // Abre modal y limpia formulario.
  function openCreateGroupModal() {
    setGroupForm({
      subject: "",
      days: [DAYS[0]],
      year: "1",
      fromTime: TIME_BLOCKS[0].start,
      toTime: TIME_BLOCKS[0].end,
      careers: [selectedCareer],
      plans: (plansByCareer[selectedCareer] || [selectedPlan]).slice(0, 1)
    });
    setModalError("");
    setIsCreateGroupOpen(true);
  }

  // Cierra modal y limpia error.
  function closeCreateGroupModal() {
    setModalError("");
    setIsCreateGroupOpen(false);
  }

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

  // Actualiza 1 campo del formulario del modal.
  function updateGroupForm(field, value) {
    setGroupForm((prev) => ({ ...prev, [field]: value }));
  }

  // Agrega o quita 1 item de una lista de seleccion multiple del formulario.
  function toggleGroupFormList(field, value, checked) {
    setGroupForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const next = checked
        ? [...new Set([...current, value])]
        : current.filter((item) => item !== value);

      // Si cambiaron carreras, tambien hay que recalcular planes validos.
      if (field === "careers") {
        const validPlans = [...new Set(next.flatMap((career) => plansByCareer[career] || []))];
        const filteredPlans = (prev.plans || []).filter((plan) => validPlans.includes(plan));
        const plansToKeep = filteredPlans.length > 0 ? filteredPlans : validPlans.slice(0, 1);
        return { ...prev, careers: next, plans: plansToKeep };
      }

      return { ...prev, [field]: next };
    });
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

  // Confirma creacion del grupo en memoria.
  function confirmCreateGroup() {
    createGroupModalFns.confirmCreateGroup({
      groupForm,
      data,
      availablePlansForGroup,
      hourOptionsFrom,
      hourOptionsTo,
      timeToMinutes,
      setModalError,
      yearLabel,
      findCalendarForYear,
      addGroupToCalendar,
      setData,
      closeCreateGroupModal
    });
  }

  function toExportSafeName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 40) || "sin-filtro";
  }

  async function exportInternalExcel() {
    const exportApi = window.api?.exportaciones;
    if (!exportApi?.guardarExcel) {
      window.alert("No se pudo acceder a la API de Electron (preload). Reinicia la app.");
      await window.api?.mensajes?.mostrar?.(
        "No esta disponible la API de exportacion para Excel.",
        "error"
      );
      return;
    }

    const fileName = `calendario-bd-${toExportSafeName(selectedCareer)}-${toExportSafeName(selectedPlan)}.xlsx`;
    const response = await exportApi.guardarExcel({
      defaultFileName: fileName,
      sheetName: "DatosBD",
      filters: {
        carrera: selectedCareer
      }
    });

    if (response?.success) {
      await window.api?.mensajes?.mostrar?.(`Excel exportado en:\n${response.data.path}`, "info");
      return;
    }

    if (!response?.cancelled) {
      await window.api?.mensajes?.mostrar?.(
        `No se pudo exportar Excel: ${response?.error || "error desconocido"}`,
        "error"
      );
    }
  }

  async function importModulosExcel() {
    const exportApi = window.api?.exportaciones;
    if (!exportApi?.importarExcelModulos) {
      window.alert("No se pudo acceder a la API de importacion.");
      return;
    }

    const response = await exportApi.importarExcelModulos({
      carreraNombre: selectedCareer
    });

    if (response?.success) {
      const summary = response.data || {};
      const ins = summary.inserted || {};
      const linked = summary.linked || {};
      const skipped = summary.skipped || {};
      const message = [
        "Importacion finalizada.",
        `Filas procesadas: ${summary.totalRows || 0}`,
        `Insertados -> carreras:${ins.carreras || 0}, materias:${ins.materias || 0}, grupos:${ins.grupos || 0}, profesores:${ins.profesores || 0}, requerimientos:${ins.requerimientos || 0}, horarios:${ins.horarios || 0}`,
        `Vinculos -> materia_carrera:${linked.materiaCarrera || 0}, profesor_grupo:${linked.profesorGrupo || 0}, grupo_req:${linked.grupoReq || 0}, grupo_horario:${linked.grupoHorario || 0}`,
        `Omitidos -> sin ID clase:${skipped.rowsWithoutClassId || 0}, sin horario encontrado:${skipped.horariosNotFound || 0}, sin docente:${skipped.docentesSinNombre || 0}`
      ].join("\n");

      await window.api?.mensajes?.mostrar?.(message, "info");
      await loadCareersFromDb();
      return;
    }

    if (!response?.cancelled) {
      await window.api?.mensajes?.mostrar?.(
        `No se pudo importar Excel: ${response?.error || "error desconocido"}`,
        "error"
      );
    }
  }

  return (
    <>
      <HeaderBar />

      <main className="page">
        <Toolbar
          careers={careers}
          plans={data.plans}
          selectedCareer={selectedCareer}
          selectedPlan={selectedPlan}
          onCareerChange={setSelectedCareer}
          onPlanChange={setSelectedPlan}
          onOpenCreateCareer={openCreateCareerModal}
          onOpenCreateGroup={openCreateGroupModal}
          onExportExcel={exportInternalExcel}
        />

        <section className="layout">
          <Sidebar
            calendars={data.calendars}
            onToggleCalendarVisible={toggleCalendarVisible}
            onOpenCreateGroup={openCreateGroupModal}
            onExportExcel={exportInternalExcel}
            onImportExcel={importModulosExcel}
          />

          <section className="main-column">
            <AlertsPanel alerts={visibleAlerts} />

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

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        form={groupForm}
        years={["1", "2", "3"]}
        days={DAYS}
        hourOptionsFrom={hourOptionsFrom}
        hourOptionsTo={hourOptionsTo}
        careerOptions={careers}
        planOptions={availablePlansForGroup}
        onClose={closeCreateGroupModal}
        onChange={updateGroupForm}
        onToggleList={toggleGroupFormList}
        onSubmit={confirmCreateGroup}
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
    </>
  );
}

window.App = App;
