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

    // Career
    isCreateCareerOpen,
    careerForm,
    careerModalError,
    openCreateCareerModal,
    closeCreateCareerModal,
    updateCareerForm,
    confirmCreateCareer,

    // Teacher
    isCreateTeacherOpen,
    teacherForm,
    teacherModalError,
    openCreateTeacherModal,
    closeCreateTeacherModal,
    updateTeacherForm,
    confirmCreateTeacher,

    // Semester
    isCreateSemesterOpen,
    semesterForm,
    semesterModalError,
    openCreateSemesterModal,
    closeCreateSemesterModal,
    updateSemesterForm,
    confirmCreateSemester,

    // Groups
    isGroupsListOpen,
    isSubjectGroupsModalOpen,
    isCreateNewGroupOpen,
    selectedSubject,
    groupForm,
    modalError,
    groupsModalHandlers,
    subjectGroupsModalHandlers,
    createNewGroupHandlers,

    // Excel
    handleExportExcel,
    exportInternalExcel,
    importModulosExcel

  } = window.useSchedulesApp();

  const {
    DAYS,
    TIME_BLOCKS,
    ROW_HEIGHT,
    HEADER_HEIGHT,
    TIME_COL_WIDTH,
    COLOR_BY_TYPE
  } = window.AppData;

  const currentLectiveTerm =
      visibleCalendars[0]?.lectiveTerm ||
      data.calendars[0]?.lectiveTerm ||
      "";

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
                onExportExcelDatos={exportInternalExcel}
                onImportExcel={importModulosExcel}
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

        {/* GROUP MODALS */}
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
            careerOptions={careers}
            onClose={createNewGroupHandlers.closeCreateNewGroupModal}
            onChange={createNewGroupHandlers.updateGroupForm}
            onToggleList={createNewGroupHandlers.toggleGroupFormList}
            onSubmit={createNewGroupHandlers.confirmCreateGroup}
            errorMessage={modalError}
        />

        {/* CAREER MODAL */}
        <CreateCareerModal
            isOpen={isCreateCareerOpen}
            form={careerForm}
            errorMessage={careerModalError}
            onClose={closeCreateCareerModal}
            onChange={updateCareerForm}
            onSubmit={confirmCreateCareer}
        />

        {/* TEACHER MODAL */}
        <CreateTeacherModal
            isOpen={isCreateTeacherOpen}
            form={teacherForm}
            errorMessage={teacherModalError}
            onClose={closeCreateTeacherModal}
            onChange={updateTeacherForm}
            onSubmit={confirmCreateTeacher}
        />

        {/* SEMESTER MODAL */}
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
