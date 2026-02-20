/*
  Componente: ScheduleGrid
  Que hace:
  - Dibuja una tarjeta de calendario (titulo + subtitulo + grilla).
  - Dibuja bloques por horario (start/end) sin particiones de minutos.
*/

function ScheduleGrid(props) {
  const {
    calendar,
    days,
    startHour,
    endHour,
    rowHeight,
    headerHeight,
    timeColWidth,
    colorByType,
    timeToMinutes
  } = props;

  // Horas para filas (ejemplo: 8, 9, 10 ... 19).
  const hours = [];
  for (let hour = startHour; hour < endHour; hour += 1) {
    hours.push(hour);
  }

  // Funcion local para calcular estilo absoluto de cada bloque.
  function getEventStyle(classItem) {
    const dayIndex = days.indexOf(classItem.day);
    const startMinutes = timeToMinutes(classItem.start);
    const endMinutes = timeToMinutes(classItem.end);
    const baseMinutes = startHour * 60;

    const top = headerHeight + ((startMinutes - baseMinutes) / 60) * rowHeight + 2;
    const height = Math.max((((endMinutes - startMinutes) / 60) * rowHeight) - 4, 24);

    return {
      left: `calc(${timeColWidth}px + ${dayIndex} * ((100% - ${timeColWidth}px) / 6) + 4px)`,
      width: `calc((100% - ${timeColWidth}px) / 6 - 8px)`,
      top: `${top}px`,
      height: `${height}px`,
      background: colorByType[classItem.type] || "#8ca5ad"
    };
  }

  return (
    <section className="card schedule-card">
      <h3 className="schedule-title">{calendar.name}</h3>
      <div className="schedule-subtitle">{calendar.subtitle}</div>

      <div className="grid-shell">
        <div className="schedule-grid">
          <div className="cell header"></div>

          {days.map((day) => (
            <div key={day} className="cell header">{day}</div>
          ))}

          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="cell time">{String(hour).padStart(2, "0")}:00</div>
              {days.map((day) => (
                <div key={`${hour}-${day}`} className="cell"></div>
              ))}
            </React.Fragment>
          ))}
        </div>

        <div className="events-layer">
          {calendar.classes.map((classItem, index) => (
            <article key={`${calendar.id}-${index}`} className="event-card" style={getEventStyle(classItem)}>
              <div className="event-title">{classItem.title}</div>
              <div className="event-meta">{classItem.group}</div>
              <div className="event-meta">{classItem.detail}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

window.ScheduleGrid = ScheduleGrid;
