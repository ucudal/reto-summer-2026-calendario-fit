/*
  Componente: CreateSemesterModal
  --------------------------------
  Modal para crear un nuevo semestre, opcionalmente copiando desde uno existente.
  El semestre a copiar se elige con número (1 o 2) + año.
*/

function CreateSemesterModal(props) {
  const {
    isOpen,
    form,
    errorMessage,
    isLoading,
    onClose,
    onChange,
    onSubmit
  } = props;

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => String(currentYear + i));
  const isBlank = form.sourceSemester === "__blank__";

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
          <fieldset style={{ border: "1px solid #ddd", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
            <legend style={{ fontWeight: 600, fontSize: 14, padding: "0 6px" }}>Semestre lectivo a copiar</legend>

            <label className="form-label" style={{ marginBottom: 8 }}>
              Tipo
              <select
                className="form-input"
                value={form.sourceSemester}
                onChange={(event) => onChange("sourceSemester", event.target.value)}
                required
              >
                <option value="">-- Seleccione --</option>
                <option value="__blank__">Nuevo semestre en blanco</option>
                <option value="1">1er semestre</option>
                <option value="2">2do semestre</option>
              </select>
            </label>

            {!isBlank && form.sourceSemester !== "" && (
              <label className="form-label">
                Año del semestre a copiar
                <select
                  className="form-input"
                  value={form.sourceYear}
                  onChange={(event) => onChange("sourceYear", event.target.value)}
                  required
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </label>
            )}
          </fieldset>

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
            {isBlank
              ? "Se creará un semestre lectivo vacío."
              : "Se copiarán todos los grupos y horarios del semestre lectivo seleccionado al nuevo semestre."}
          </div>

          {errorMessage && <div className="modal-error">{errorMessage}</div>}

          <button
            type="submit"
            className="modal-confirm-btn"
            disabled={!form.sourceSemester || !form.newSemester || !form.newYear || isLoading}
          >
            {isLoading ? "Creando..." : "Crear semestre lectivo"}
          </button>
        </form>
      </section>
    </div>
  );
}

window.CreateSemesterModal = CreateSemesterModal;
