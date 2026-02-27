(function () {
    function useSemesterManagement(data, setData) {
        const [isCreateSemesterOpen, setIsCreateSemesterOpen] = React.useState(false);
        const [semesterModalError, setSemesterModalError] = React.useState("");
        const [semesterForm, setSemesterForm] = React.useState({
            sourceLectiveTerm: "",
            newSemester: "1er semestre",
            newYear: "2026"
        });

        function openCreateSemesterModal() {
            setSemesterForm({
                sourceLectiveTerm: "",
                newSemester: "1er semestre",
                newYear: String(new Date().getFullYear() < 2026 ? 2026 : new Date().getFullYear())
            });
            setSemesterModalError("");
            setIsCreateSemesterOpen(true);
        }

        function closeCreateSemesterModal() {
            setSemesterModalError("");
            setIsCreateSemesterOpen(false);
        }

        function updateSemesterForm(field, value) {
            setSemesterForm(prev => ({ ...prev, [field]: value }));
        }

        function confirmCreateSemester() {
            const sourceTerm = String(semesterForm.sourceLectiveTerm || "").trim();
            const selectedSemester = String(semesterForm.newSemester || "").trim();
            const selectedYear = String(semesterForm.newYear || "").trim();
            const newName = `${selectedSemester} ${selectedYear}`.trim();

            if (!sourceTerm) {
                setSemesterModalError("Debe seleccionar el semestre lectivo a copiar.");
                return;
            }

            if (!selectedSemester || !selectedYear) {
                setSemesterModalError("Debe seleccionar semestre y año para el nuevo semestre lectivo.");
                return;
            }

            const alreadyExists = (data.calendars || []).some(
                (calendar) => String(calendar?.lectiveTerm || "").trim().toLowerCase() === newName.toLowerCase()
            );
            if (alreadyExists) {
                setSemesterModalError("Ese semestre lectivo ya existe.");
                return;
            }

            const isBlankSemester = sourceTerm === "__blank__";
            let calendarsToCopy = [];

            if (isBlankSemester) {
                const templates = [];
                const seen = new Set();
                data.calendars.forEach((calendar) => {
                    const id = String(calendar.id || "");
                    const match = id.match(/^s([12])y([1-5])/);
                    if (!match) return;
                    const key = `${match[1]}-${match[2]}-${String(calendar.subtitle || "")}`;
                    if (seen.has(key)) return;
                    seen.add(key);
                    templates.push({
                        semester: match[1],
                        year: match[2],
                        subtitle: String(calendar.subtitle || "")
                    });
                });

                if (templates.length === 0) {
                    for (let year = 1; year <= 5; year += 1) {
                        for (let semester = 1; semester <= 2; semester += 1) {
                            templates.push({
                                semester: String(semester),
                                year: String(year),
                                subtitle: ""
                            });
                        }
                    }
                }

                calendarsToCopy = templates.map((tpl, index) => ({
                    id: `s${tpl.semester}y${tpl.year}-blank-${index}`,
                    name: `${tpl.semester === "1" ? "1er" : "2do"} semestre ${Number(tpl.year)}° año`,
                    subtitle: tpl.subtitle,
                    lectiveTerm: newName,
                    visible: true,
                    classes: [],
                    alerts: []
                }));
            } else {
                calendarsToCopy = data.calendars.filter(
                    (c) => String(c.lectiveTerm || "") === sourceTerm
                );
            }

            if (calendarsToCopy.length === 0) {
                setSemesterModalError("No hay calendarios para ese semestre lectivo.");
                return;
            }

            const now = Date.now();

            const newLectiveObject = {
                idSemestre: `sem-${Date.now()}`,
                numeroSem: 1,
                anio: newName
            };
            const copies = calendarsToCopy.map((calendar, index) => ({
                ...calendar,
                id: `${calendar.id}-copy-${now}-${index}`,
                lectiveTerm: newLectiveObject,
                visible: true,
                classes: isBlankSemester ? [] : (calendar.classes || []).map(item => ({ ...item })),
                alerts: []
            }));

            setData(prev => ({
                ...prev,
                calendars: prev.calendars
                    .map((c) => {
                        if (isBlankSemester) return { ...c, visible: false };
                        return String(c.lectiveTerm || "") === sourceTerm ? { ...c, visible: false } : c;
                    })
                    .concat(copies)
            }));

            closeCreateSemesterModal();
        }

        const [selectedLectiveTerm, setSelectedLectiveTerm] = React.useState("");

        const availableLectiveTerms = React.useMemo(() => {
            const seen = new Set();
            const unique = [];

            data.calendars.forEach(c => {
                if (!c.lectiveTerm) return;

                const { idSemestre, numeroSem, anio } = c.lectiveTerm;

                if (!seen.has(idSemestre)) {
                    seen.add(idSemestre);
                    unique.push({
                        idSemestre,
                        numeroSem,
                        anio
                    });
                }
            });

            return unique;
        }, [data.calendars]);

        const filteredCalendarsBySemester = React.useMemo(() => {
            if (!selectedLectiveTerm) return null;

            return data.calendars.filter(
                c => c.lectiveTerm?.idSemestre === selectedLectiveTerm
            );
        }, [data.calendars, selectedLectiveTerm]);

        const currentLectiveTerm = React.useMemo(() => {
            if (!filteredCalendarsBySemester || filteredCalendarsBySemester.length === 0) {
                return "";
            }

            const { formatLectiveTerm } = window.AppData;

            return formatLectiveTerm(
                filteredCalendarsBySemester[0].lectiveTerm
            );
        }, [filteredCalendarsBySemester]);

        return {
            isCreateSemesterOpen,
            semesterModalError,
            semesterForm,
            openCreateSemesterModal,
            closeCreateSemesterModal,
            updateSemesterForm,
            confirmCreateSemester,
            selectedLectiveTerm,
            setSelectedLectiveTerm,
            availableLectiveTerms,
            currentLectiveTerm
        };
    }

    window.useSemesterManagement = useSemesterManagement;
})();
