(function () {
    function useCalendarVisibility(data, setData) {
        const [activeLectiveTerm, setActiveLectiveTermState] = React.useState("");

        const lectiveTerms = React.useMemo(() => {
            const seen = new Set();
            const unique = [];

            (data.calendars || []).forEach((calendar) => {
                const term = String(calendar?.lectiveTerm || "").trim();
                if (!term || seen.has(term)) return;
                seen.add(term);
                unique.push(term);
            });

            return unique.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
        }, [data.calendars]);

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
            setData(prev => ({
                ...prev,
                calendars: prev.calendars.map(c =>
                    c.id === calendarId ? { ...c, visible: checked } : c
                )
            }));
        }

        function setActiveLectiveTerm(nextTerm) {
            const selectedTerm = String(nextTerm || "").trim();
            if (!selectedTerm) return;

            setActiveLectiveTermState(selectedTerm);
            setData((prev) => ({
                ...prev,
                calendars: prev.calendars.map((calendar) => ({
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