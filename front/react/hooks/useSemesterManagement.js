(function () {
    function useSemesterManagement(data, setData) {
        const [isCreateSemesterOpen, setIsCreateSemesterOpen] = React.useState(false);
        const [semesterModalError, setSemesterModalError] = React.useState("");
        const [semesterForm, setSemesterForm] = React.useState({
            sourceLectiveTerm: "",
            newSemester: "1er semestre",
            newYear: "2026"
        });

        function parseLectiveTerm(term) {
            const match = String(term || "").trim().match(/^(1er|2do)\s+semestre\s+(\d{4})$/i);
            if (!match) return null;
            return {
                numeroSemestre: String(match[1]).toLowerCase() === "2do" ? 2 : 1,
                anio: Number(match[2])
            };
        }

        function buildTermSlug(term) {
            return String(term || "")
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "");
        }

        function buildCalendarsForTerm(existingCalendars, lectiveTerm, makeVisible = false) {
            const slug = buildTermSlug(lectiveTerm);
            const baseByCalendar = new Map();

            (existingCalendars || []).forEach((calendar) => {
                const id = String(calendar?.id || "");
                const match = id.match(/^(s[12]y[1-5])/i);
                if (!match) return;
                const baseId = match[1].toLowerCase();
                if (!baseByCalendar.has(baseId)) baseByCalendar.set(baseId, calendar);
            });

            const result = [];
            for (let year = 1; year <= 5; year += 1) {
                for (let semester = 1; semester <= 2; semester += 1) {
                    const baseId = `s${semester}y${year}`;
                    const template = baseByCalendar.get(baseId);
                    result.push({
                        id: `${baseId}-${slug}`,
                        name: template?.name || `${semester === 1 ? "1er" : "2do"} semestre ${year}° año`,
                        subtitle: String(template?.subtitle || ""),
                        lectiveTerm,
                        visible: makeVisible,
                        classes: [],
                        alerts: []
                    });
                }
            }

            return result;
        }

        React.useEffect(() => {
            let cancelled = false;

            async function loadSemestresFromDb() {
                if (!window.api?.semestres?.listarLectivos) return;
                const response = await window.api.semestres.listarLectivos();
                if (cancelled || !response?.success) return;

                const terms = Array.from(
                    new Set(
                        (response.data || [])
                            .map((row) => String(row?.lectiveTerm || "").trim())
                            .filter(Boolean)
                    )
                );
                if (terms.length === 0) return;

                setData((prev) => {
                    const existingTerms = new Set(
                        (prev.calendars || [])
                            .map((calendar) => String(calendar?.lectiveTerm || "").trim())
                            .filter(Boolean)
                    );
                    const missingTerms = terms.filter((term) => !existingTerms.has(term));
                    if (missingTerms.length === 0) return prev;

                    const appended = missingTerms.flatMap((term) =>
                        buildCalendarsForTerm(prev.calendars, term, false)
                    );

                    return {
                        ...prev,
                        calendars: prev.calendars.concat(appended)
                    };
                });
            }

            loadSemestresFromDb();
            return () => {
                cancelled = true;
            };
        }, [setData]);

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

        async function confirmCreateSemester() {
            const sourceTerm = String(semesterForm.sourceLectiveTerm || "").trim();
            const selectedSemester = String(semesterForm.newSemester || "").trim();
            const selectedYear = String(semesterForm.newYear || "").trim();
            const newName = `${selectedSemester} ${selectedYear}`.trim();
            const parsed = parseLectiveTerm(newName);

            if (!sourceTerm) {
                setSemesterModalError("Debe seleccionar el semestre lectivo a copiar.");
                return;
            }

            if (!selectedSemester || !selectedYear) {
                setSemesterModalError("Debe seleccionar semestre y año para el nuevo semestre lectivo.");
                return;
            }

            if (!parsed) {
                setSemesterModalError("Semestre lectivo inválido.");
                return;
            }

            const alreadyExists = (data.calendars || []).some(
                (calendar) => String(calendar?.lectiveTerm || "").trim().toLowerCase() === newName.toLowerCase()
            );
            if (alreadyExists) {
                setSemesterModalError("Ese semestre lectivo ya existe.");
                return;
            }

            if (window.api?.semestres?.crearLectivo) {
                const created = await window.api.semestres.crearLectivo({
                    numeroSemestre: parsed.numeroSemestre,
                    anio: parsed.anio
                });
                if (!created?.success) {
                    setSemesterModalError(created?.error || "No se pudo crear el semestre lectivo en base de datos.");
                    return;
                }
            }

            const copies = buildCalendarsForTerm(data.calendars, newName, true);

            setData(prev => ({
                ...prev,
                calendars: prev.calendars
                    .map((c) => ({ ...c, visible: false }))
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
