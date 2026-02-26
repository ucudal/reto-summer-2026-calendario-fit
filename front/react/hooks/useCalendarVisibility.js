(function () {
    function useCalendarVisibility(data, setData) {
        const visibleCalendars = data.calendars.filter(c => c.visible);
        const visibleAlerts = visibleCalendars.flatMap(c => c.alerts || []);

        function toggleCalendarVisible(calendarId, checked) {
            setData(prev => ({
                ...prev,
                calendars: prev.calendars.map(c =>
                    c.id === calendarId ? { ...c, visible: checked } : c
                )
            }));
        }

        return { visibleCalendars, visibleAlerts, toggleCalendarVisible };
    }

    window.useCalendarVisibility = useCalendarVisibility;
})();