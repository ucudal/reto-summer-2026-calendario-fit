(function () {
    function useCalendarVisibility(data, setData) {
        const [activeLectiveTerm, setActiveLectiveTermState] = React.useState("");
        const [dbLectiveTerms, setDbLectiveTerms] = React.useState([]);

        function buildTermSlug(term) {
            return String(term || "")
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "");
        }

        function ensureAllAcademicCalendarsForTerm(calendars, term) {
            const normalizedTerm = String(term || "").trim();
            if (!normalizedTerm) return calendars;

            const termCalendars = (calendars || []).filter(
                (calendar) => String(calendar?.lectiveTerm || "").trim() === normalizedTerm
            );
            const existingBaseIds = new Set(
                termCalendars
                    .map((calendar) => String(calendar?.id || "").match(/^(s[12]y[1-5])/i))
                    .filter(Boolean)
                    .map((match) => String(match[1]).toLowerCase())
            );

            if (existingBaseIds.size >= 10) return calendars;

            const byBaseTemplate = new Map();
            (calendars || []).forEach((calendar) => {
                const idMatch = String(calendar?.id || "").match(/^(s[12]y[1-5])/i);
                if (!idMatch) return;
                const baseId = String(idMatch[1]).toLowerCase();
                if (!byBaseTemplate.has(baseId)) {
                    byBaseTemplate.set(baseId, calendar);
                }
            });

            const slug = buildTermSlug(normalizedTerm);
            const toAppend = [];
            for (let year = 1; year <= 5; year += 1) {
                for (let semester = 1; semester <= 2; semester += 1) {
                    const baseId = `s${semester}y${year}`;
                    if (existingBaseIds.has(baseId)) continue;
                    const template = byBaseTemplate.get(baseId);
                    toAppend.push({
                        id: `${baseId}-${slug}`,
                        name: template?.name || `${semester === 1 ? "1er" : "2do"} semestre ${year}° año`,
                        subtitle: String(template?.subtitle || ""),
                        lectiveTerm: normalizedTerm,
                        visible: false,
                        classes: [],
                        alerts: []
                    });
                }
            }

            return (calendars || []).concat(toAppend);
        }

        React.useEffect(() => {
            let cancelled = false;

            async function loadLectiveTermsFromDb() {
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
                setDbLectiveTerms(terms);
            }

            loadLectiveTermsFromDb();
            return () => {
                cancelled = true;
            };
        }, [data.calendars.length]);

        const lectiveTerms = React.useMemo(() => {
            const seen = new Set();
            const unique = [];

            (data.calendars || []).forEach((calendar) => {
                const term = String(calendar?.lectiveTerm || "").trim();
                if (!term || seen.has(term)) return;
                seen.add(term);
                unique.push(term);
            });

            (dbLectiveTerms || []).forEach((term) => {
                const normalized = String(term || "").trim();
                if (!normalized || seen.has(normalized)) return;
                seen.add(normalized);
                unique.push(normalized);
            });

            return unique.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
        }, [data.calendars, dbLectiveTerms]);

        const visibleCalendars = data.calendars.filter(c => c.visible);
        const visibleAlerts = visibleCalendars.flatMap(c => c.alerts || []);

        React.useEffect(() => {
            const firstVisibleTerm = String(visibleCalendars[0]?.lectiveTerm || "").trim();

            if (firstVisibleTerm) {
                if (activeLectiveTerm !== firstVisibleTerm) {
                    setActiveLectiveTermState(firstVisibleTerm);
                }
                return;
            }

            if (lectiveTerms.length === 0) {
                if (activeLectiveTerm) setActiveLectiveTermState("");
                return;
            }

            if (!activeLectiveTerm || !lectiveTerms.includes(activeLectiveTerm)) {
                setActiveLectiveTermState(lectiveTerms[0]);
            }
        }, [visibleCalendars, lectiveTerms, activeLectiveTerm]);

    function toggleCalendarVisible(calendarId, checked) {
      setData((prev) => ({
        ...prev,
        calendars: prev.calendars.map((c) =>
          c.id === calendarId ? { ...c, visible: checked } : c,
        ),
      }));
    }

        function setActiveLectiveTerm(nextTerm) {
            const selectedTerm = String(nextTerm || "").trim();
            if (!selectedTerm) return;

            setActiveLectiveTermState(selectedTerm);
            setData((prev) => ({
                ...prev,
                calendars: ensureAllAcademicCalendarsForTerm(prev.calendars, selectedTerm).map((calendar) => ({
                    ...calendar,
                    visible: String(calendar?.lectiveTerm || "").trim() === selectedTerm
                }))
            }));
        }

        return {
            visibleCalendars,
            visibleAlerts,
            toggleCalendarVisible,
            lectiveTerms,
            activeLectiveTerm,
            setActiveLectiveTerm
        };
    }

  window.useCalendarVisibility = useCalendarVisibility;
})();
