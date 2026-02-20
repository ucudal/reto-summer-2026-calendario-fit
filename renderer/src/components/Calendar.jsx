function Calendar() {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const timeSlots = [
    "08:00", "09:20", "09:30", "10:50", "11:00", "12:20", "12:25", "13:45",
    "13:55", "15:15", "15:20", "16:40", "16:50", "18:10", "18:15", "19:15"
  ];

  return (
    <div className="calendar">
      <div className="calendarHeader">
        <div className="timeColumnHeader">Hora</div>
        {days.map((day) => (
          <div key={day} className="dayHeader">
            {day}
          </div>
        ))}
      </div>
      <div className="calendarGrid">
        {timeSlots.map((time, index) => (
          <div key={time} className={`timeRow ${index % 2 === 1 ? 'periodEnd' : ''}`}>
            <div className="timeCell">{time}</div>
            {days.map((day) => (
              <div key={`${day}-${time}`} className="gridCell"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;