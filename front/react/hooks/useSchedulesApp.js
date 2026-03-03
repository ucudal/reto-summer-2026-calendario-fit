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

    function normalizeText(value) {
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    function getLectiveTermFromGroup(grupo) {
      const semestreLectivo = Number(grupo?.semestreLectivo || 0);
      const anioLectivo = Number(grupo?.anioLectivo || 0);
      if ((semestreLectivo !== 1 && semestreLectivo !== 2) || !anioLectivo) return "";
      return `${semestreLectivo === 1 ? "1er" : "2do"} semestre ${anioLectivo}`;
    }

    const didAutoSelectLectiveTermRef = React.useRef(false);

    React.useEffect(() => {
      if (!selectedCareer) return;
      if (!Array.isArray(db.dbGroups) || db.dbGroups.length === 0) return;
      if (didAutoSelectLectiveTermRef.current) return;
      if (visibility.activeLectiveTerm) {
        didAutoSelectLectiveTermRef.current = true;
        return;
      }

      const selectedCareerNormalized = normalizeText(selectedCareer);
      const termsWithGroups = [];
      const seen = new Set();

      db.dbGroups.forEach((group) => {
        const groupCareers = Array.isArray(group?.carreras) ? group.carreras : [];
        const matchesCareer = groupCareers.some((name) => normalizeText(name) === selectedCareerNormalized);
        if (!matchesCareer) return;

        const term = getLectiveTermFromGroup(group);
        if (!term || seen.has(term)) return;
        seen.add(term);
        termsWithGroups.push(term);
      });

      if (termsWithGroups.length === 0) return;

      const preferredTerm = termsWithGroups.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))[0];
      visibility.setActiveLectiveTerm(preferredTerm);
      didAutoSelectLectiveTermRef.current = true;
    }, [selectedCareer, db.dbGroups, visibility.activeLectiveTerm]);

    const career = window.useCareerManagement({
            careers: db.careers,
            setCareers: db.setCareers,
            careersData: db.careersData,
            setCareersData: db.setCareersData,
            setSelectedCareer,
            reloadGroupsFromDb: db.reloadGroupsFromDb
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
      reloadCareersFromDb: db.reloadCareersFromDb,
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
