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

  const hasLectiveTerms = availableSemesters.length > 0;

  const yearOptions = Array.from({ length: 10 }, (_, i) => String(2026 + i));

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
              {availableSemesters.map((term) => (
                <option key={term.idSemestre} value={term.idSemestre}>{window.AppData.formatLectiveTerm(term)}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Nuevo semestre
            <select
              className="form-input"
              value={form.newSemester}
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
              value={form.newYear}
              onChange={(event) => onChange("newYear", event.target.value)}
              required
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
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
