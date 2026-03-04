(function () {
    function useSemesterManagement(data, setData, reloadGroupsFromDb) {
        const [isCreateSemesterOpen, setIsCreateSemesterOpen] = React.useState(false);
        const [semesterModalError, setSemesterModalError] = React.useState("");
        const [semesterLoading, setSemesterLoading] = React.useState(false);
        const [semesterForm, setSemesterForm] = React.useState({
            sourceSemester: "",       // "1", "2" o "__blank__"
            sourceYear: "2026",       // año del semestre a copiar
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

        function semesterOrdinalLabel(number) {
            if (number === 1) return "1er";
            if (number === 2) return "2do";
            if (number === 3) return "3er";
            if (number === 4) return "4to";
            if (number === 5) return "5to";
            if (number === 6) return "6to";
            if (number === 7) return "7mo";
            if (number === 8) return "8vo";
            if (number === 9) return "9no";
            return "10mo";
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
                    const semesterNumber = (year - 1) * 2 + semester;
                    const template = baseByCalendar.get(baseId);
                    result.push({
                        id: `${baseId}-${slug}`,
                        name: template?.name || `${semesterOrdinalLabel(semesterNumber)} semestre`,
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
            const currentYear = new Date().getFullYear();
            const defaultYear = String(currentYear < 2026 ? 2026 : currentYear);
            setSemesterForm({
                sourceSemester: "",
                sourceYear: defaultYear,
                newSemester: "1er semestre",
                newYear: defaultYear
            });
            setSemesterModalError("");
            setSemesterLoading(false);
            setIsCreateSemesterOpen(true);
        }

        function closeCreateSemesterModal() {
            setSemesterModalError("");
            setSemesterLoading(false);
            setIsCreateSemesterOpen(false);
        }

        function updateSemesterForm(field, value) {
            setSemesterForm(prev => ({ ...prev, [field]: value }));
        }

        async function confirmCreateSemester() {
            const sourceSemester = String(semesterForm.sourceSemester || "").trim();
            const sourceYear = String(semesterForm.sourceYear || "").trim();
            const selectedSemester = String(semesterForm.newSemester || "").trim();
            const selectedYear = String(semesterForm.newYear || "").trim();
            const newName = `${selectedSemester} ${selectedYear}`.trim();
            const parsed = parseLectiveTerm(newName);

            if (!sourceSemester) {
                setSemesterModalError("Debe seleccionar el tipo de semestre a copiar.");
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

            const isBlankSemester = sourceSemester === "__blank__";

            if (isBlankSemester) {
                // Crear semestre en la DB
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

                // Generar calendarios vacíos en frontend
                const copies = buildCalendarsForTerm(data.calendars, newName, true);

                setData(prev => ({
                    ...prev,
                    calendars: prev.calendars
                        .map((c) => ({ ...c, visible: false }))
                        .concat(copies)
                }));

                closeCreateSemesterModal();
                return;
            }

            // --- Replicar semestre desde la base de datos ---
            if (!window.api?.semestres?.replicar) {
                setSemesterModalError("La función de replicar semestre no está disponible.");
                return;
            }

            setSemesterLoading(true);
            setSemesterModalError("");

            try {
                const sourceNumero = Number(sourceSemester);
                const result = await window.api.semestres.replicar({
                    sourceNumero,
                    sourceAnio: Number(sourceYear),
                    newNumero: parsed.numeroSemestre,
                    newAnio: parsed.anio
                });

                if (!result.success) {
                    setSemesterModalError(result.error || "Error al replicar el semestre.");
                    setSemesterLoading(false);
                    return;
                }

                const resultData = result.data || {};
                const createdCount = resultData.created || 0;
                const errors = resultData.errors || [];

                if (errors.length > 0 && createdCount === 0) {
                    setSemesterModalError(errors.join(". "));
                    setSemesterLoading(false);
                    return;
                }

                // Crear calendarios en frontend para el nuevo semestre
                const newCalendars = buildCalendarsForTerm(data.calendars, newName, true);

                setData(prev => ({
                    ...prev,
                    calendars: prev.calendars
                        .map((c) => ({ ...c, visible: false }))
                        .concat(newCalendars)
                }));

                // Recargar grupos de la DB para que aparezcan los nuevos
                if (typeof reloadGroupsFromDb === "function") {
                    await reloadGroupsFromDb();
                }

                closeCreateSemesterModal();

                if (errors.length > 0) {
                    console.warn("Advertencias al replicar semestre:", errors);
                }
            } catch (err) {
                setSemesterModalError(err.message || "Error inesperado al replicar el semestre.");
                setSemesterLoading(false);
            }
        }

        return {
            isCreateSemesterOpen,
            semesterModalError,
            semesterLoading,
            semesterForm,
            openCreateSemesterModal,
            closeCreateSemesterModal,
            updateSemesterForm,
            confirmCreateSemester
        };
    }

    window.useSemesterManagement = useSemesterManagement;
})();
