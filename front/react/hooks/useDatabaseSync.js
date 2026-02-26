(function () {
    function useDatabaseSync({ selectedCareer, setSelectedCareer, setData }) {
        const { TIME_BLOCKS } = window.AppData;
        const DEFAULT_LECTIVE_TERM = "Semestre lectivo actual";

        const [dbGroups, setDbGroups] = React.useState([]);
        const [careers, setCareers] = React.useState([]);

        function normalizeText(value) {
            return String(value || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();
        }

        function normalizeDayToUi(dayText) {
            const value = normalizeText(dayText);
            if (value === "lunes" || value === "lun") return "LUN";
            if (value === "martes" || value === "mar") return "MAR";
            if (value === "miercoles" || value === "mie") return "MIE";
            if (value === "jueves" || value === "jue") return "JUE";
            if (value === "viernes" || value === "vie") return "VIE";
            if (value === "sabado" || value === "sab") return "SAB";
            return "";
        }

        function getCalendarIdFromDbGroup(grupo) {
            const semestre = Number(grupo.semestre || 1) === 2 ? 2 : 1;
            const rawYear = Number(grupo.anio || 1);
            const year = rawYear >= 1 && rawYear <= 5 ? rawYear : 1;
            return `s${semestre}y${year}`;
        }

        function extractLectiveYearFromCode(codigo) {
            const text = String(codigo || "").trim();
            const match = text.match(/__LY(\d{4})(?:S[12])?$/);
            return match ? match[1] : "";
        }

        function extractLectiveSemesterFromCode(codigo) {
            const text = String(codigo || "").trim();
            const match = text.match(/__LY\d{4}S([12])$/);
            return match ? match[1] : "";
        }

        function stripLectiveSuffixFromCode(codigo) {
            return String(codigo || "").replace(/__LY\d{4}(?:S[12])?$/, "").trim();
        }

        function getLectiveTermFromGroup(grupo) {
            const lectiveYear = extractLectiveYearFromCode(grupo?.codigo);
            if (!lectiveYear) return "";
            const lectiveSemesterFromCode = extractLectiveSemesterFromCode(grupo?.codigo);
            const resolvedLectiveSemester =
                lectiveSemesterFromCode === "1" || lectiveSemesterFromCode === "2"
                    ? Number(lectiveSemesterFromCode)
                    : Number(grupo?.semestre || 1);
            const semesterLabel = resolvedLectiveSemester === 2 ? "2do semestre" : "1er semestre";
            return `${semesterLabel} ${lectiveYear}`;
        }

        function mapDbGroupToClasses(grupo) {
            const horarios = Array.isArray(grupo.horarios) ? grupo.horarios : [];
            const teachers = Array.isArray(grupo.docentes) ? grupo.docentes : [];
            const uiCode = stripLectiveSuffixFromCode(grupo?.codigo);
            const modulosByDay = new Map();

            horarios.forEach((h) => {
                const modulo = Number(h.modulo);
                const day = normalizeDayToUi(h.dia);
                const block = TIME_BLOCKS[modulo - 1];
                if (!day || !block) return;

                const prev = modulosByDay.get(day) || [];
                prev.push(modulo);
                modulosByDay.set(day, prev);
            });

            const mergedClasses = [];

            modulosByDay.forEach((modulos, day) => {
                const uniqueSorted = [...new Set(modulos)].sort((a, b) => a - b);
                if (uniqueSorted.length === 0) return;

                let runStart = uniqueSorted[0];
                let runEnd = uniqueSorted[0];

                function pushRun(startModulo, endModulo) {
                    const startBlock = TIME_BLOCKS[startModulo - 1];
                    const endBlock = TIME_BLOCKS[endModulo - 1];
                    if (!startBlock || !endBlock) return;

                    mergedClasses.push({
                        title: grupo.nombreMateria || `Materia ${grupo.idMateria}`,
                        classNumber: uiCode,
                        credits: Number(grupo.creditosMateria || 0),
                        teachers,
                        day,
                        start: startBlock.start,
                        end: endBlock.end,
                        type: "practice"
                    });
                }

                for (let i = 1; i < uniqueSorted.length; i += 1) {
                    const current = uniqueSorted[i];
                    if (current === runEnd + 1) {
                        runEnd = current;
                        continue;
                    }

                    pushRun(runStart, runEnd);
                    runStart = current;
                    runEnd = current;
                }

                pushRun(runStart, runEnd);
            });

            return mergedClasses;
        }

        async function reloadGroupsFromDb() {
            if (!window.api?.grupos?.listar) return;
            const response = await window.api.grupos.listar();
            if (response?.success) setDbGroups(response.data || []);
        }

        React.useEffect(() => {
            reloadGroupsFromDb();
        }, []);

        React.useEffect(() => {
            let cancelled = false;

            async function loadCareers() {
                if (!window.api?.carreras?.listar) return;
                const response = await window.api.carreras.listar();
                if (!cancelled && response?.success) {
                    const names = (response.data || [])
                        .map((r) => String(r?.nombre || "").trim())
                        .filter(Boolean);
                    setCareers(names);
                }
            }

            loadCareers();
            return () => { cancelled = true; };
        }, []);

        React.useEffect(() => {
            if (!Array.isArray(careers) || careers.length === 0) return;
            const exists = careers.some((name) => name === selectedCareer);
            if (exists) return;
            if (typeof setSelectedCareer === "function") {
                setSelectedCareer(careers[0]);
            }
        }, [careers, selectedCareer, setSelectedCareer]);

        function getCalendarKeyFromId(calendarId) {
            const id = String(calendarId || "");
            const match = id.match(/s([12])y([1-5])/);
            if (!match) return "";
            return `s${match[1]}y${match[2]}`;
        }

        React.useEffect(() => {
            const selectedCareerNormalized = normalizeText(selectedCareer);
            const classesByCalendarAndTerm = new Map();

            let filteredGroups = dbGroups.filter((grupo) => {
                const groupCareers = Array.isArray(grupo.carreras) ? grupo.carreras : [];
                if (!selectedCareer) return true;
                if (groupCareers.length === 0) return true;
                return groupCareers.some(
                    (name) => normalizeText(name) === selectedCareerNormalized
                );
            });

            // Si por un estado viejo se eligio una carrera que ya no existe, evitamos dejar el calendario vacio.
            if (filteredGroups.length === 0 && selectedCareer) {
                filteredGroups = dbGroups;
            }

            filteredGroups.forEach((grupo) => {
                const calendarId = getCalendarIdFromDbGroup(grupo); // key base: s{sem}y{anio}
                const lectiveTerm = getLectiveTermFromGroup(grupo);
                const blocks = mapDbGroupToClasses(grupo);
                const keyWithTerm = `${calendarId}||${lectiveTerm || "*"}`;
                const prev = classesByCalendarAndTerm.get(keyWithTerm) || [];
                classesByCalendarAndTerm.set(keyWithTerm, [...prev, ...blocks]);
            });

            setData((prev) => ({
                ...prev,
                calendars: prev.calendars.map((calendar) => ({
                    ...calendar,
                    subtitle: selectedCareer || calendar.subtitle,
                    classes: (() => {
                        const calendarKey = getCalendarKeyFromId(calendar.id);
                        const calendarTerm = String(calendar.lectiveTerm || "").trim();
                        const exact = classesByCalendarAndTerm.get(`${calendarKey}||${calendarTerm}`) || [];
                        const wildcard = classesByCalendarAndTerm.get(`${calendarKey}||*`) || [];

                        // Semestres lectivos nuevos (ej: "1er semestre 2029"):
                        // solo muestran grupos con LY exacto para evitar mezcla con historicos.
                        if (calendarTerm && calendarTerm !== DEFAULT_LECTIVE_TERM) {
                            return exact;
                        }

                        // Vista legacy/default: mantiene compatibilidad con grupos viejos sin LY.
                        return [...exact, ...wildcard];
                    })()
                }))
            }));
        }, [dbGroups, selectedCareer]);

        return { careers, setCareers, reloadGroupsFromDb };
    }

    window.useDatabaseSync = useDatabaseSync;
})();
