(function () {
    function useDatabaseSync({ selectedCareer, setData }) {
        const { TIME_BLOCKS } = window.AppData;

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

        function mapDbGroupToClasses(grupo) {
            const horarios = Array.isArray(grupo.horarios) ? grupo.horarios : [];
            const teachers = Array.isArray(grupo.docentes) ? grupo.docentes : [];

            return horarios
                .map((h) => {
                    const modulo = Number(h.modulo);
                    const block = TIME_BLOCKS[modulo - 1];
                    const day = normalizeDayToUi(h.dia);

                    if (!block || !day) return null;

                    return {
                        title: grupo.nombreMateria || `Materia ${grupo.idMateria}`,
                        classNumber: String(grupo.codigo || ""),
                        credits: Number(grupo.creditosMateria || 0),
                        teachers,
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
            const selectedCareerNormalized = normalizeText(selectedCareer);
            const classesByCalendar = new Map();

            const filteredGroups = dbGroups.filter((grupo) => {
                const groupCareers = Array.isArray(grupo.carreras) ? grupo.carreras : [];
                if (!selectedCareer) return true;
                if (groupCareers.length === 0) return true;
                return groupCareers.some(
                    (name) => normalizeText(name) === selectedCareerNormalized
                );
            });

            filteredGroups.forEach((grupo) => {
                const calendarId = getCalendarIdFromDbGroup(grupo);
                const blocks = mapDbGroupToClasses(grupo);
                const prev = classesByCalendar.get(calendarId) || [];
                classesByCalendar.set(calendarId, [...prev, ...blocks]);
            });

            setData((prev) => ({
                ...prev,
                calendars: prev.calendars.map((calendar) => ({
                    ...calendar,
                    subtitle: selectedCareer || calendar.subtitle,
                    classes: classesByCalendar.get(calendar.id) || []
                }))
            }));
        }, [dbGroups, selectedCareer]);

        return { careers, setCareers, reloadGroupsFromDb };
    }

    window.useDatabaseSync = useDatabaseSync;
})();
