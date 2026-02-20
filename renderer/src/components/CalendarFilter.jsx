import React, { useState } from 'react';

function CalendarFilter() {
  const calendars = [
    { id: 1, label: "1er semestre 1er año", checked: true },
    { id: 2, label: "2do semestre 1er año", checked: false },
    { id: 3, label: "1er semestre 2do año", checked: false },
    { id: 4, label: "2do semestre 2do año", checked: false },
    { id: 5, label: "3er año", checked: false },
    { id: 6, label: "4to año", checked: false },
    { id: 7, label: "5to año", checked: false },
  ];

  const [checkedItems, setCheckedItems] = useState(
    calendars.reduce((acc, cal) => {
      acc[cal.id] = cal.checked;
      return acc;
    }, {})
  );

  const handleCheckChange = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <div className="menu">
        <h3>Calendarios visibles</h3>
        <div className="filterCheckboxList">
          {calendars.map((calendar) => (
            <div key={calendar.id} className="checkboxItem">
              <input
                type="checkbox"
                id={`calendar-${calendar.id}`}
                checked={checkedItems[calendar.id]}
                onChange={() => handleCheckChange(calendar.id)}
              />
              <label htmlFor={`calendar-${calendar.id}`}>{calendar.label}</label>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default CalendarFilter;