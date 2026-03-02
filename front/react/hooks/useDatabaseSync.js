(function () {
    function useDatabaseSync({ selectedCareer, setData }) {
        const { TIME_BLOCKS } = window.AppData;

        const [dbGroups, setDbGroups] = React.useState([]);
        const [careers, setCareers] = React.useState([]);
        const [careersData, setCareersData] = React.useState([]);

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

        function getCalendarIdFromDbGroup(grupo, selectedCareerNormalized) {
            let semestre = Number(grupo.semestre || 1);
            let rawYear = Number(grupo.anio || 1);

            const academicByCareer = Array.isArray(grupo?.academicByCareer) ? grupo.academicByCareer : [];
            if (selectedCareerNormalized) {
                // Con carrera filtrada, exigimos match explícito por carrera para evitar caídas al global.
                if (academicByCareer.length === 0) return "";
                const matching = academicByCareer.find(
                    (entry) => normalizeText(entry?.carrera) === selectedCareerNormalized
                );
                if (!matching) return "";
                semestre = Number(matching.semestre || semestre);
                rawYear = Number(matching.anio || rawYear);
            }

            semestre = semestre === 2 ? 2 : 1;
            const year = rawYear >= 1 && rawYear <= 5 ? rawYear : 1;
            return `s${semestre}y${year}`;
        }

        function getLectiveTermFromDbGroup(grupo) {
            const semestreLectivo = Number(grupo?.semestreLectivo || 0);
            const anioLectivo = Number(grupo?.anioLectivo || 0);

            if ((semestreLectivo !== 1 && semestreLectivo !== 2) || !anioLectivo) {
                return "";
            }

            return `${semestreLectivo === 1 ? "1er" : "2do"} semestre ${anioLectivo}`;
        }

        function getCalendarBaseId(calendarId) {
            const match = String(calendarId || "").match(/^s[12]y[1-5]/i);
            return match ? match[0].toLowerCase() : "";
        }

        function mapDbGroupToClasses(grupo) {
            const horarios = Array.isArray(grupo.horarios) ? grupo.horarios : [];
            const teachers = Array.isArray(grupo.docentes) ? grupo.docentes : [];
            const careers = Array.isArray(grupo.carreras) ? grupo.carreras : [];
            const groupCode = String(grupo.codigo || "").trim();
            const groupRef = String(grupo.id || groupCode || "").trim();

            return horarios
                .map((h) => {
                    const modulo = Number(h.modulo);
                    const block = TIME_BLOCKS[modulo - 1];
                    const day = normalizeDayToUi(h.dia);

                    if (!block || !day) return null;

                    return {
                        title: grupo.nombreMateria || `Materia ${grupo.idMateria}`,
                        group: groupCode,
                        classNumber: String(grupo.codigo || ""),
                        groupRef,
                        credits: Number(grupo.creditosMateria || 0),
                        teachers,
                        careers,
                        color: grupo.color || "",
                        day,
                        start: block.start,
                        end: block.end,
                        type: "practice"
                    };
                })
                .filter(Boolean);
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
                    const rawData = (response.data || []).filter(r => r?.nombre);
                    const names = rawData
                        .map((r) => String(r.nombre).trim())
                        .filter(Boolean);
                    setCareers(names);
                    setCareersData(rawData.map(r => ({ id: r.id, nombre: String(r.nombre).trim() })));
                }
            }

            loadCareers();
            return () => { cancelled = true; };
        }, []);

        async function reloadCareersFromDb() {
            if (!window.api?.carreras?.listar) return;
            const response = await window.api.carreras.listar();
            if (response?.success) {
                const names = (response.data || [])
                    .map((r) => String(r?.nombre || "").trim())
                    .filter(Boolean);
                setCareers(names);
            }
        }

        React.useEffect(() => {
            const selectedCareerNormalized = normalizeText(selectedCareer);
            const classesByCalendar = new Map();

            const filteredGroups = dbGroups.filter((grupo) => {
                const groupCareers = Array.isArray(grupo.carreras) ? grupo.carreras : [];
                if (!selectedCareer) return false;
                if (groupCareers.length === 0) return false;
                return groupCareers.some(
                    (name) => normalizeText(name) === selectedCareerNormalized
                );
            });

            filteredGroups.forEach((grupo) => {
                const calendarId = getCalendarIdFromDbGroup(grupo, selectedCareerNormalized);
                if (!calendarId) return;
                const lectiveTerm = getLectiveTermFromDbGroup(grupo);
                const blocks = mapDbGroupToClasses(grupo);
                const mapKey = `${String(calendarId).toLowerCase()}|${lectiveTerm}`;
                const prev = classesByCalendar.get(mapKey) || [];
                classesByCalendar.set(mapKey, [...prev, ...blocks]);
            });

            classesByCalendar.forEach((classItems, calendarId) => {
                const mergedByCode = new Map();

                classItems.forEach((item) => {
                    const mergeKey = [
                        String(item.title || "").trim().toLowerCase(),
                        String(item.group || item.classNumber || "").trim().toLowerCase(),
                        String(item.day || "").trim().toLowerCase(),
                        String(item.start || "").trim(),
                        String(item.end || "").trim()
                    ].join("|");

                    if (!mergedByCode.has(mergeKey)) {
                        mergedByCode.set(mergeKey, {
                            ...item,
                            teachers: Array.isArray(item.teachers) ? [...item.teachers] : [],
                            careers: Array.isArray(item.careers) ? [...item.careers] : []
                        });
                        return;
                    }

                    const existing = mergedByCode.get(mergeKey);
                    const mergedTeachers = new Set([...(existing.teachers || []), ...(item.teachers || [])]);
                    const mergedCareers = new Set([...(existing.careers || []), ...(item.careers || [])]);
                    existing.teachers = Array.from(mergedTeachers);
                    existing.careers = Array.from(mergedCareers);
                });

                classesByCalendar.set(calendarId, Array.from(mergedByCode.values()));
            });

            setData((prev) => ({
                ...prev,
                calendars: prev.calendars.map((calendar) => ({
                    ...calendar,
                    subtitle: selectedCareer || calendar.subtitle,
                    classes:
                        classesByCalendar.get(
                            `${getCalendarBaseId(calendar.id)}|${String(calendar?.lectiveTerm || "").trim()}`
                        ) ||
                        classesByCalendar.get(`${getCalendarBaseId(calendar.id)}|`) ||
                        []
                }))
            }));
        }, [dbGroups, selectedCareer]);

        return { careers, setCareers, careersData, setCareersData, reloadGroupsFromDb, reloadCareersFromDb };
    }

    window.useDatabaseSync = useDatabaseSync;
})();
