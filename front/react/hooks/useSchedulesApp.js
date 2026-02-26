(function () {
    function useSchedulesApp() {
        const { cloneInitialData } = window.AppData;

        const [data, setData] = React.useState(cloneInitialData());
        const [selectedCareer, setSelectedCareer] = React.useState("");

        const db = window.useDatabaseSync({
            selectedCareer,
            setSelectedCareer,
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

        const groups = window.useGroupManagement({
            data,
            setData,
            selectedCareer,
            reloadGroupsFromDb: db.reloadGroupsFromDb
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
            ...db,
            ...visibility,
            ...career,
            ...semester,
            ...teacher,
            ...groups,
            ...excel
        };
    }

    window.useSchedulesApp = useSchedulesApp;
})();
