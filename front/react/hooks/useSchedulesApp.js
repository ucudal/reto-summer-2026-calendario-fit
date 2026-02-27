(function () {
    function useSchedulesApp() {
        const { cloneInitialData } = window.AppData;

        const [data, setData] = React.useState(cloneInitialData());
        const [selectedCareer, setSelectedCareer] = React.useState("");
        const [selectedLectiveTerm, setSelectedLectiveTerm] = React.useState("");

        const db = window.useDatabaseSync({
            selectedCareer,
            data,
            setData
        });

        const visibility = window.useCalendarVisibility(data, setData);

        const career = window.useCareerManagement({
            careers: db.careers,
            setCareers: db.setCareers,
            setSelectedCareer
        });

        const semester = window.useSemesterManagement(data, setData);

        const teacher = window.useTeacherManagement();

        const subject = window.useSubjectManagement({
            careers: db.careers
        });

        const groups = window.useGroupManagement({
            data,
            setData,
            selectedCareer,
            reloadGroupsFromDb: db.reloadGroupsFromDb,
            subjects: subject.subjects
        });

        const excel = window.useExcelActions({
            data,
            selectedCareer,
            reloadGroupsFromDb: db.reloadGroupsFromDb
        });

        return {
            data,
            selectedCareer,
            setSelectedCareer,
            selectedLectiveTerm,
            setSelectedLectiveTerm,
            ...db,
            ...visibility,
            ...career,
            ...semester,
            ...teacher,
            ...subject,
            ...groups,
            ...excel
        };
    }

    window.useSchedulesApp = useSchedulesApp;
})();