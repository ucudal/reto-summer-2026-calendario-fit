(function () {
  function useCalendarVisibility(data, setData) {
    const visibleCalendars = data.calendars.filter((c) => c.visible);
    // Global alerts: collect alerts from all calendars so the UI shows
    // alertas globalizadas aunque se abra una carrera concreta.
    const allAlerts = data.calendars.flatMap((c) => c.alerts || []);
    // Keep `visibleAlerts` returning the global set (asked behaviour).
    const visibleAlerts = allAlerts;

    function toggleCalendarVisible(calendarId, checked) {
      setData((prev) => ({
        ...prev,
        calendars: prev.calendars.map((c) =>
          c.id === calendarId ? { ...c, visible: checked } : c,
        ),
      }));
    }

    return { visibleCalendars, visibleAlerts, toggleCalendarVisible };
  }

  window.useCalendarVisibility = useCalendarVisibility;
})();
