(function () {
    function useGroupManagement({
                                    data,
                                    setData,
                                    selectedCareer,
                                    subjects = []
                                }) {
        const {
            DAYS,
            TIME_BLOCKS,
            timeToMinutes,
            yearLabel
        } = window.AppData;

        const createGroupModalFns = window.CreateGroupModalFunctions;
        const groupsModalFns = window.GroupsModalFunctions;
        const subjectGroupsModalFns = window.SubjectGroupsModalFunctions;
        const createNewGroupModalFns = window.CreateNewGroupModalFunctions;

        const [isGroupsListOpen, setIsGroupsListOpen] = React.useState(false);
        const [isSubjectGroupsModalOpen, setIsSubjectGroupsModalOpen] = React.useState(false);
        const [isCreateNewGroupOpen, setIsCreateNewGroupOpen] = React.useState(false);
        const [selectedSubject, setSelectedSubject] = React.useState(null);

        const [modalError, setModalError] = React.useState("");

        const [groupForm, setGroupForm] = React.useState(
            createNewGroupModalFns.createInitialGroupForm({
                DAYS,
                TIME_BLOCKS,
                selectedCareer
            })
        );

        function findCalendarForYear(selectedYear, calendars) {
            const byYear = calendars.filter(c =>
                c.id.endsWith(`y${selectedYear}`)
            );
            if (byYear.length === 0) return null;
            return byYear.find(c => c.visible) || byYear[0];
        }

        function addGroupToCalendar(prevData, selectedYear, newGroups) {
            const target = findCalendarForYear(selectedYear, prevData.calendars);
            if (!target) return prevData;

            return {
                ...prevData,
                calendars: prevData.calendars.map(calendar => {
                    if (calendar.id !== target.id) return calendar;
                    return {
                        ...calendar,
                        visible: true,
                        classes: [...calendar.classes, ...newGroups]
                    };
                })
            };
        }

        function replaceSubjectGroupsInCalendar(
            prevData,
            selectedYear,
            subject,
            newGroups
        ) {
            const target = findCalendarForYear(selectedYear, prevData.calendars);
            if (!target) return prevData;

            return {
                ...prevData,
                calendars: prevData.calendars.map(calendar => {
                    if (calendar.id !== target.id) return calendar;

                    const filtered = calendar.classes.filter(
                        c => !(c.title === subject && c.type === "practice")
                    );

                    return {
                        ...calendar,
                        visible: true,
                        classes: [...filtered, ...newGroups]
                    };
                })
            };
        }

        const createNewGroupHandlers =
            createNewGroupModalFns.createNewGroupModalHandlers({
                DAYS,
                TIME_BLOCKS,
                selectedCareer,
                setGroupForm,
                setModalError,
                setIsCreateNewGroupOpen,
                createGroupModalFns,
                groupForm,
                data,
                hourOptionsFrom: TIME_BLOCKS.map(b => b.start),
                hourOptionsTo: TIME_BLOCKS.map(b => b.end),
                timeToMinutes,
                yearLabel,
                findCalendarForYear,
                addGroupToCalendar,
                setData
            });

        const subjectGroupsModalHandlers =
            subjectGroupsModalFns.createSubjectGroupsModalHandlers({
                setIsGroupsListOpen,
                setIsSubjectGroupsModalOpen,
                setSelectedSubject,
                setData,
                replaceSubjectGroupsInCalendar,
                subjects
            });

        const groupsModalHandlers =
            groupsModalFns.createGroupsModalHandlers({
                setIsGroupsListOpen,
                openSubjectGroupsModal:
                subjectGroupsModalHandlers.openSubjectGroupsModal,
                openCreateNewGroupModal:
                createNewGroupHandlers.openCreateNewGroupModal
            });

        return {
            isGroupsListOpen,
            isSubjectGroupsModalOpen,
            isCreateNewGroupOpen,
            selectedSubject,
            groupForm,
            modalError,
            groupsModalHandlers,
            subjectGroupsModalHandlers,
            createNewGroupHandlers
        };
    }

    window.useGroupManagement = useGroupManagement;
})();