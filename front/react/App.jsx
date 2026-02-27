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
    isCareersListOpen,
    isCreateCareerOpen,
    careerForm,
    careerModalError,
    careerEditMode,
    careerOpenedFromList,
    openCareersListModal,
    closeCareersListModal,
    openCreateCareerModal,
    openCreateCareerFromList,
    closeCreateCareerModal,
    backToCareersListFromModal,
    selectCareerToManage,
    updateCareerForm,
    confirmCreateCareer,

    // Teacher
    teachers,
    isTeachersListOpen,
    isCreateTeacherOpen,
    teacherForm,
    teacherModalError,
    teacherEditMode,
    teacherOpenedFromList,
    openTeachersListModal,
    closeTeachersListModal,
    openCreateTeacherModal,
    openCreateTeacherFromList,
    closeCreateTeacherModal,
    backToTeachersListFromModal,
    selectTeacherToManage,
    updateTeacherForm,
    confirmCreateTeacher,

    // Subject
    subjects,
    isSubjectsListOpen,
    isCreateSubjectOpen,
    subjectModalError,
    subjectForm,
    subjectEditMode,
    subjectOpenedFromList,
    openSubjectsListModal,
    closeSubjectsListModal,
    openCreateSubjectFromList,
    closeCreateSubjectModal,
    backToSubjectsListFromModal,
    updateSubjectForm,
    toggleSubjectCareer,
    changeSubjectCareerSemester,
    selectSubjectToManage,
    confirmCreateSubject,
    deleteSubject,

    // Semester
    isCreateSemesterOpen,
    semesterForm,
    semesterModalError,
    openCreateSemesterModal,
    closeCreateSemesterModal,
    updateSemesterForm,
    confirmCreateSemester,
    selectedLectiveTerm,
    setSelectedLectiveTerm,
    availableLectiveTerms,
    currentLectiveTerm,

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
    handleExportExcelDatos,
    handleImportExcel

  } = window.useSchedulesApp();

  const {
    DAYS,
    TIME_BLOCKS,
    ROW_HEIGHT,
    HEADER_HEIGHT,
    TIME_COL_WIDTH,
    COLOR_BY_TYPE,
  } = window.AppData;

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
            availableLectiveTerms={availableLectiveTerms}
            selectedLectiveTerm={selectedLectiveTerm}
            onLectiveTermChange={setSelectedLectiveTerm}
        />

        <main className="page">
          <section className="layout">
            <Sidebar
                calendars={data.calendars}
                onToggleCalendarVisible={toggleCalendarVisible}
                onOpenSubjects={openSubjectsListModal}
                onOpenCreateGroup={groupsModalHandlers.openGroupsListModal}
                onOpenCreateCareer={openCareersListModal}
                onOpenCreateTeacher={openTeachersListModal}
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

        {/* CAREER MODALS */}
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
            isEditMode={Boolean(careerEditMode)}
        />

        {/* TEACHER MODALS */}
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
            isEditMode={Boolean(teacherEditMode)}
        />

        {/* SUBJECT MODALS */}
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
            isEditMode={Boolean(subjectEditMode)}
            availableCareers={careers}
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