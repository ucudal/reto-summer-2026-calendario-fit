(function () {
    function useSemesterManagement(data, setData) {
        const [isCreateSemesterOpen, setIsCreateSemesterOpen] = React.useState(false);
        const [semesterModalError, setSemesterModalError] = React.useState("");
        const [dbSemesters, setDbSemesters] = React.useState([]);
        const [semesterForm, setSemesterForm] = React.useState({
            sourceLectiveTerm: "",
            newSemester: "1er semestre",
            newYear: String(new Date().getFullYear())
        });

        React.useEffect(() => {
            let cancelled = false;

            async function loadSemestersFromDb() {
                try {
                    if (!window.api?.semestres?.listar) return;
                    const response = await window.api.semestres.listar();
                    if (cancelled) return;
                    if (!response?.success || !Array.isArray(response.data)) return;
                    setDbSemesters(response.data);
                } catch (error) {
                    if (!cancelled) setDbSemesters([]);
                }
            }

            loadSemestersFromDb();
            return () => { cancelled = true; };
        }, []);

        function openCreateSemesterModal() {
            setSemesterForm({
                sourceLectiveTerm: "",
                newSemester: "1er semestre",
                newYear: String(new Date().getFullYear())
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

        async function confirmCreateSemester() {
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

            const alreadyExistsInDb = (dbSemesters || []).some(
                (row) => String(row?.nombre || "").trim().toLowerCase() === newName.toLowerCase()
            );
            if (alreadyExistsInDb) {
                setSemesterModalError("Ese semestre lectivo ya existe.");
                return;
            }

            const alreadyExistsInMemory = (data.calendars || []).some(
                (calendar) => String(calendar?.lectiveTerm || "").trim().toLowerCase() === newName.toLowerCase()
            );
            if (alreadyExistsInMemory) {
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
                if (calendarsToCopy.length === 0) {
                    setSemesterModalError("No hay calendarios para ese semestre lectivo.");
                    return;
                }
            }

            try {
                if (window.api?.semestres?.crear) {
                    const createResp = await window.api.semestres.crear({
                        nombre: newName,
                        esEnBlanco: isBlankSemester,
                        origenNombre: isBlankSemester ? null : sourceTerm
                    });
                    if (!createResp?.success) {
                        setSemesterModalError(createResp?.error || "No se pudo crear el semestre lectivo.");
                        return;
                    }
                    if (createResp?.data?.alreadyExists) {
                        setSemesterModalError("Ese semestre lectivo ya existe.");
                        return;
                    }
                    const refreshed = await window.api.semestres.listar();
                    if (refreshed?.success && Array.isArray(refreshed.data)) {
                        setDbSemesters(refreshed.data);
                    }
                }
            } catch (error) {
                const msg = String(error?.message || "");
                if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("existe")) {
                    setSemesterModalError("Ese semestre lectivo ya existe.");
                    return;
                }
                console.error("No se pudo guardar semestre lectivo en DB:", error);
                setSemesterModalError("No se pudo crear el semestre lectivo.");
                return;
            }

            const now = Date.now();
            const copies = calendarsToCopy.map((calendar, index) => ({
                ...calendar,
                id: `${calendar.id}-copy-${now}-${index}`,
                lectiveTerm: newName,
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

        return {
            isCreateSemesterOpen,
            semesterModalError,
            semesterForm,
            openCreateSemesterModal,
            closeCreateSemesterModal,
            updateSemesterForm,
            confirmCreateSemester
        };
    }

    window.useSemesterManagement = useSemesterManagement;
})();
