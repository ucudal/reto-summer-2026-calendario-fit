import Calendar from "./Calendar"

function CalendarView () {
    return(
        <>
        <div className="menu">
            <div className="calendarInfo">
                <div>
                    <h2>1er semestre - Plan 2026</h2>
                    <h3>Ingeniería en informática</h3>
                </div>
                <p>* Además de estos cursos puedes hacer al menos uno del Core UCU en cualquiera de las áreas de Antropología y Filosofía, Ética y Ciudadanía o Sociedad y Religión 
* Plan 2021: si debes TI3 cursas TI3 plan 2026 y Fundamentos en Ciencias de la Computación 
* Plan 2021: si debes matemática 01 cursas Fundamentos matemáticos 2026</p>
            </div>
            <Calendar/>
        </div>
        </>
    )
}

export default CalendarView