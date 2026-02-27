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
              {availableSemesters.map((term) => (
                <option
                  key={term.idSemestre}
                  value={term.idSemestre}
                >
                  {window.AppData.formatLectiveTerm(term)}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Nombre del nuevo semestre lectivo
            <input
              className="form-input"
              type="text"
              value={form.newLectiveName}
              onChange={(event) => onChange("newLectiveName", event.target.value)}
              placeholder="Ej: Primer semestre 2026"
              required
            />
          </label>

          <div className="checkbox-empty">
            Se copiarán todos los calendarios (carreras/planes/años académicos) del semestre lectivo seleccionado con el nuevo nombre.
          </div>

          {errorMessage && <div className="modal-error">{errorMessage}</div>}

          <button
            type="submit"
            className="modal-confirm-btn"
            disabled={!hasLectiveTerms || !form.sourceLectiveTerm || !form.newLectiveName}
          >
            Crear semestre lectivo
          </button>
        </form>
      </section>
    </div>
  );
}

window.CreateSemesterModal = CreateSemesterModal;
