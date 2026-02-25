/*
  Componente: CreateSemesterModal
  --------------------------------
  Modal para crear un nuevo semestre copiando desde uno existente.
  Recibe todo por props y no guarda estado interno.
*/

function CreateSemesterModal(props) {
  const {
    isOpen,
    form,
    availableSemesters,
    errorMessage,
    onClose,
    onChange,
    onSubmit
  } = props;

  const hasAvailableSemesters = availableSemesters.length > 0;
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, index) => String(currentYear + index));

  // Extraer términos lectivos únicos de los calendarios disponibles
  const uniqueLectiveTerms = [...new Set(
    availableSemesters
      .map((calendar) => calendar.lectiveTerm)
      .filter((term) => term)
  )].sort();

  const hasLectiveTerms = uniqueLectiveTerms.length > 0;

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="group-modal" role="dialog" aria-modal="true" aria-labelledby="semesterModalTitle">
        <button type="button" className="modal-close-btn" aria-label="Cerrar" onClick={onClose}>X</button>

        <h2 id="semesterModalTitle" className="modal-title">Crear nuevo calendario</h2>

        <form
          className="group-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="form-label">
            Semestre lectivo a copiar
            <select
              className="form-input"
              value={form.sourceLectiveTerm}
              onChange={(event) => onChange("sourceLectiveTerm", event.target.value)}
              required
            >
              <option value="">
                {hasLectiveTerms
                  ? "-- Seleccione semestre lectivo --"
                  : "-- No hay semestres disponibles --"}
              </option>
              <option value="__blank__">Nuevo semestre en blanco</option>
              {uniqueLectiveTerms.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Semestre
            <select
              className="form-input"
              value={form.newSemester || "1er semestre"}
              onChange={(event) => onChange("newSemester", event.target.value)}
              required
            >
              <option value="1er semestre">1er semestre</option>
              <option value="2do semestre">2do semestre</option>
            </select>
          </label>

          <label className="form-label">
            Año
            <select
              className="form-input"
              value={form.newYear || yearOptions[0]}
              onChange={(event) => onChange("newYear", event.target.value)}
              required
            >
              {yearOptions.map((yearValue) => (
                <option key={yearValue} value={yearValue}>{yearValue}</option>
              ))}
            </select>
          </label>

          <div className="checkbox-empty">
            Se copiarán todos los calendarios (carreras/planes/años académicos) del semestre lectivo seleccionado con el nuevo nombre.
          </div>

          {errorMessage && <div className="modal-error">{errorMessage}</div>}

          <button
            type="submit"
            className="modal-confirm-btn"
            disabled={!form.sourceLectiveTerm || !form.newSemester || !form.newYear}
          >
            Crear semestre lectivo
          </button>
        </form>
      </section>
    </div>
  );
}

window.CreateSemesterModal = CreateSemesterModal;
