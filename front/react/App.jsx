function App() {
  const {
    data,
    selectedCareer,
    setSelectedCareer,

    careers,
    reloadGroupsFromDb,

    visibleCalendars,
    visibleAlerts,
    toggleCalendarVisible,

    isCreateCareerOpen,
    careerForm,
    careerModalError,
    openCreateCareerModal,
    closeCreateCareerModal,
    updateCareerForm,
    confirmCreateCareer,

    isCreateTeacherOpen,
    teacherForm,
    teacherModalError,
    openCreateTeacherModal,
    closeCreateTeacherModal,
    updateTeacherForm,
    confirmCreateTeacher,

    isCreateSemesterOpen,
    semesterForm,
    semesterModalError,
    openCreateSemesterModal,
    closeCreateSemesterModal,
    updateSemesterForm,
    confirmCreateSemester,

    isGroupsListOpen,
    isSubjectGroupsModalOpen,
    isCreateNewGroupOpen,
    selectedSubject,
    groupForm,
    modalError,
    groupsModalHandlers,
    subjectGroupsModalHandlers,
    createNewGroupHandlers,

    handleExportExcel,
    handleExportExcelDatos,
    handleImportExcel
  } = window.useSchedulesApp();

  const {
    DAYS,
    TIME_BLOCKS,
    ROW_HEIGHT,
    HEADER_HEIGHT,
    TIME_COL_WIDTH,
    COLOR_BY_TYPE
  } = window.AppData;

  const DEFAULT_LECTIVE_TERM = "Semestre lectivo actual";

  const currentLectiveTerm = React.useMemo(() => {
    const visibleTerms = visibleCalendars
      .map((c) => String(c?.lectiveTerm || "").trim())
      .filter(Boolean);

    const nonDefaultVisible = visibleTerms.find((term) => term !== DEFAULT_LECTIVE_TERM);
    if (nonDefaultVisible) return nonDefaultVisible;

    const anyVisible = visibleTerms[0];
    if (anyVisible) return anyVisible;

    const allTerms = (data.calendars || [])
      .map((c) => String(c?.lectiveTerm || "").trim())
      .filter(Boolean);
    const nonDefaultAny = allTerms.find((term) => term !== DEFAULT_LECTIVE_TERM);
    return nonDefaultAny || allTerms[0] || "";
  }, [visibleCalendars, data.calendars]);

  const headerSemesterInfo = React.useMemo(() => {
    const value = String(currentLectiveTerm || "").trim();
    const match = value.match(/^(1er|2do)\s+semestre\s+(\d{4})$/i);
    if (match) return `${match[1].toLowerCase()} semestre año ${match[2]}`;
    return value || visibleCalendars[0]?.name || data.calendars.find((c) => c.visible)?.name || data.calendars[0]?.name || "";
  }, [currentLectiveTerm, visibleCalendars, data.calendars]);

  const calendarsForSidebar = React.useMemo(() => {
    if (!currentLectiveTerm) return data.calendars;
    const filtered = data.calendars.filter(
      (calendar) => String(calendar.lectiveTerm || "") === String(currentLectiveTerm)
    );
    return filtered.length > 0 ? filtered : data.calendars;
  }, [data.calendars, currentLectiveTerm]);

  const hourOptionsFrom = React.useMemo(() => TIME_BLOCKS.map((block) => block.start), [TIME_BLOCKS]);
  const hourOptionsTo = React.useMemo(() => TIME_BLOCKS.map((block) => block.end), [TIME_BLOCKS]);

  return (
    <>
      <HeaderBar
        careers={careers}
        selectedCareer={selectedCareer}
        currentLectiveTerm={headerSemesterInfo}
        onCareerChange={setSelectedCareer}
        onOpenCreateSemester={openCreateSemesterModal}
        onOpenCreateCareer={openCreateCareerModal}
        onOpenCreateGroup={groupsModalHandlers.openGroupsListModal}
      />

      <main className="page">
        <section className="layout">
          <Sidebar
            calendars={calendarsForSidebar}
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
