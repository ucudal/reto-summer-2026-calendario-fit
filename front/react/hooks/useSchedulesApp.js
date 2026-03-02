(function () {
  function useSchedulesApp() {
    const { cloneInitialData } = window.AppData;

    const [data, setData] = React.useState(cloneInitialData());
    const [selectedCareer, setSelectedCareer] = React.useState("");

        const db = window.useDatabaseSync({
            selectedCareer,
            data,
            setData
        });

        React.useEffect(() => {
            if (selectedCareer) return;
            if (!Array.isArray(db.careers) || db.careers.length === 0) return;
            setSelectedCareer(String(db.careers[0] || ""));
        }, [selectedCareer, db.careers]);

    const visibility = window.useCalendarVisibility(data, setData);

    const career = window.useCareerManagement({
      careers: db.careers,
      setCareers: db.setCareers,
      setSelectedCareer,
    });

    const semester = window.useSemesterManagement(data, setData);

        const teacher = window.useTeacherManagement({
            reloadGroupsFromDb: db.reloadGroupsFromDb
        });

    const subject = window.useSubjectManagement({
      careers: db.careers,
    });

    const groups = window.useGroupManagement({
      data,
      setData,
      selectedCareer,
      reloadGroupsFromDb: db.reloadGroupsFromDb,
      subjects: subject.subjects,
    });

    const excel = window.useExcelActions({
      data,
      selectedCareer,
      reloadGroupsFromDb: db.reloadGroupsFromDb,
    });

    
    if (window.useAlerts) {
      window.useAlerts({ data, setData });
    }

    return {
      data,
      selectedCareer,
      setSelectedCareer,
      ...db,
      ...visibility,
      ...career,
      ...semester,
      ...teacher,
      ...subject,
      ...groups,
      ...excel,
    };
  }

  window.useSchedulesApp = useSchedulesApp;
})();
