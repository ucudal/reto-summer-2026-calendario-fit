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
    timeBlocks,
    rowHeight,
    headerHeight,
    timeColWidth,
    colorByType,
    onSelectSubject
  } = props;

  // Ancho base de una columna de dia.
  const BASE_DAY_WIDTH = 170;

  // Devuelve rango de bloques (inicio/fin) para un item.
  function getBlockRange(item) {
    const startIndex = timeBlocks.findIndex((block) => block.start === item.start);
    const endIndex = timeBlocks.findIndex((block) => block.end === item.end);
    return { startIndex, endIndex };
  }

  // Dice si dos materias se pisan en algun bloque.
  function rangesOverlap(a, b) {
    return a.startIndex <= b.endIndex && b.startIndex <= a.endIndex;
  }

  /*
    Calcula layout por evento:
    - lane: columna interna del evento (0,1,2...)
    - laneCount: cuantas columnas comparte (2 si hay 2 solapadas, 3 si hay 3, etc)
    Tambien calcula factor de ancho por dia segun maximo solapamiento del dia.
  */
  const { layoutByIndex, dayWidthFactors } = React.useMemo(() => {
    const layout = {};
    const factors = days.map(() => 1);

    function finalizeComponent(componentEvents, dayIdx) {
      if (componentEvents.length === 0) return;

      // Asignacion greedy de lanes para intervalos.
      const laneEnds = [];
      const placements = [];

      componentEvents.forEach((event) => {
        let lane = -1;
        for (let i = 0; i < laneEnds.length; i += 1) {
          // Lane libre si el evento anterior en ese lane termina antes.
          if (laneEnds[i] < event.startIndex) {
            lane = i;
            break;
          }
        }

        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = event.endIndex;
        placements.push({ classIndex: event.classIndex, lane });
      });

      const laneCount = Math.max(laneEnds.length, 1);
      factors[dayIdx] = Math.max(factors[dayIdx], laneCount);

      placements.forEach((p) => {
        layout[p.classIndex] = {
          lane: p.lane,
          laneCount
        };
      });
    }

    days.forEach((day, dayIdx) => {
      const dayEvents = calendar.classes
        .map((item, classIndex) => {
          const range = getBlockRange(item);
          return {
            item,
            classIndex,
            startIndex: range.startIndex,
            endIndex: range.endIndex
          };
        })
        .filter(
          (x) => x.item.day === day && x.startIndex >= 0 && x.endIndex >= 0 && x.endIndex >= x.startIndex
        )
        .sort((a, b) => {
          if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
          if (a.endIndex !== b.endIndex) return a.endIndex - b.endIndex;
          return a.classIndex - b.classIndex;
        });

      let component = [];
      let componentMaxEnd = -1;

      dayEvents.forEach((event) => {
        // Si no conecta con el bloque actual, cerramos componente.
        if (component.length > 0 && event.startIndex > componentMaxEnd) {
          finalizeComponent(component, dayIdx);
          component = [];
          componentMaxEnd = -1;
        }

        component.push(event);
        componentMaxEnd = Math.max(componentMaxEnd, event.endIndex);
      });

      finalizeComponent(component, dayIdx);
    });

    return { layoutByIndex: layout, dayWidthFactors: factors };
  }, [calendar.classes, days, timeBlocks]);

  const totalUnits = dayWidthFactors.reduce((sum, value) => sum + value, 0) || 1;
  const dayMinWidths = dayWidthFactors.map((factor) => BASE_DAY_WIDTH * factor);
  const totalDaysMinWidth = dayMinWidths.reduce((sum, width) => sum + width, 0);
  const gridTotalMinWidth = timeColWidth + totalDaysMinWidth;
  const columnTemplate = [
    `${timeColWidth}px`,
    ...dayWidthFactors.map((factor) => `minmax(${BASE_DAY_WIDTH * factor}px, ${factor}fr)`)
  ].join(" ");

  function getDayStartPercent(dayIndex) {
    let unitsBefore = 0;
    for (let i = 0; i < dayIndex; i += 1) unitsBefore += dayWidthFactors[i] || 1;
    return (unitsBefore / totalUnits) * 100;
  }

  // Funcion local para calcular estilo absoluto de cada bloque.
  function getEventStyle(classItem, classIndex) {
    const dayIndex = days.indexOf(classItem.day);
    const startIndex = timeBlocks.findIndex((block) => block.start === classItem.start);
    const endIndex = timeBlocks.findIndex((block) => block.end === classItem.end);

    if (dayIndex < 0 || startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
      return { display: "none" };
    }

    const blocksUsed = endIndex - startIndex + 1;
    const top = headerHeight + startIndex * rowHeight + 2;
    const height = Math.max(blocksUsed * rowHeight - 4, 24);
    const laneInfo = layoutByIndex[classIndex] || { lane: 0, laneCount: 1 };
    const columns = Math.max(laneInfo.laneCount, 1);
    const safeSlotIndex = Math.max(laneInfo.lane, 0);
    const innerGap = 8; // separacion interna entre columnas del mismo bloque
    const perColumnGap = columns > 1 ? innerGap * (columns - 1) : 0;
    const dayPercent = ((dayWidthFactors[dayIndex] || 1) / totalUnits) * 100;
    const dayStartPercent = getDayStartPercent(dayIndex);
    const columnWidthExpr = `((${dayPercent}% - ${perColumnGap}px) / ${columns})`;

    return {
      left: `calc(${dayStartPercent}% + 4px + ${safeSlotIndex} * (${columnWidthExpr} + ${
        columns > 1 ? innerGap : 0
      }px))`,
      width: `calc(${columnWidthExpr} - 8px)`,
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
        <div className="grid-canvas" style={{ minWidth: `${gridTotalMinWidth}px` }}>
          <div
            className="schedule-grid"
            style={{
              width: "100%",
              gridTemplateColumns: columnTemplate,
              gridTemplateRows: `${headerHeight}px repeat(${timeBlocks.length}, ${rowHeight}px)`
            }}
          >
            <div className="cell header"></div>

            {days.map((day) => (
              <div key={day} className="cell header">{day}</div>
            ))}

            {timeBlocks.map((block) => (
              <React.Fragment key={`${block.start}-${block.end}`}>
                <div className="cell time">{block.label}</div>
                {days.map((day) => (
                  <div key={`${block.start}-${day}`} className="cell"></div>
                ))}
              </React.Fragment>
            ))}
          </div>

          <div
            className="events-layer"
            style={{
              left: `${timeColWidth}px`,
              width: `calc(100% - ${timeColWidth}px)`
            }}
          >
            {calendar.classes.map((classItem, index) => (
              <article
                key={`${calendar.id}-${index}`}
                className="event-card"
                style={getEventStyle(classItem, index)}
                onClick={() => {
                  if (onSelectSubject) {
                    onSelectSubject(classItem.title);
                  }
                }}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && onSelectSubject) {
                    onSelectSubject(classItem.title);
                  }
                }}
              >
                <div className="event-title">{classItem.title}</div>
                <div className="event-meta">{classItem.group}</div>
                <div className="event-meta">{classItem.detail}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.ScheduleGrid = ScheduleGrid;
