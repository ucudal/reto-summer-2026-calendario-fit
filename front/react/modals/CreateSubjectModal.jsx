/*
  Componente: CreateSubjectModal
  -----------------------------
  Modal para crear o editar una asignatura/materia.
  Recibe todo por props y no guarda estado interno.
*/

function CreateSubjectModal(props) {
  const {
    isOpen,
    form,
    errorMessage,
    onClose,
    onBack,
    onChange,
    onCareerToggle,
    onSubmit,
    onDelete,
    isEditMode = false,
    availableCareers = []
  } = props;

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop groups-list-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="group-modal groups-list-modal" role="dialog" aria-modal="true" aria-labelledby="subjectModalTitle">
        <button type="button" className="modal-close-btn" aria-label="Cerrar" onClick={onClose}>X</button>

        {onBack ? (
          <div className="modal-header-with-back">
            <button type="button" className="modal-back-btn" onClick={onBack}>← Volver</button>
            <h2 id="subjectModalTitle" className="modal-title">{isEditMode ? 'Editar asignatura' : 'Crear asignatura'}</h2>
          </div>
        ) : (
          <h2 id="subjectModalTitle" className="modal-title">{isEditMode ? 'Editar asignatura' : 'Crear asignatura'}</h2>
        )}

        <form
          className="group-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="form-label">
            Nombre de la asignatura
            <input
              className="form-input"
              type="text"
              value={form.nombre}
              onChange={(event) => onChange("nombre", event.target.value)}
              placeholder="Ej: Programación 1"
              required
            />
          </label>

          <label className="form-label">
            Tipo
            <select
              className="form-input"
              value={form.tipo}
              onChange={(event) => onChange("tipo", event.target.value)}
              required
            >
              <option value="">Seleccione un tipo</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </label>

          <label className="form-label">
            Créditos
            <input
              className="form-input"
              type="number"
              min="1"
              value={form.creditos}
              onChange={(event) => onChange("creditos", event.target.value)}
              placeholder="Ej: 8"
              required
            />
          </label>

          <label className="checkbox-row" style={{ marginTop: '8px' }}>
            <input
              type="checkbox"
              checked={form.tieneContrasemestre}
              onChange={(event) => onChange("tieneContrasemestre", event.target.checked)}
            />
            <span>Tiene correlativa</span>
          </label>

          <fieldset className="form-fieldset">
            <legend className="form-legend">Carreras donde se dicta *</legend>
            <div className="checkbox-list">
              {availableCareers.length === 0 ? (
                <p className="checkbox-empty">No hay carreras disponibles. Por favor, cree una carrera primero.</p>
              ) : (
                availableCareers.map((career) => (
                  <label key={career} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.carreras.includes(career)}
                      onChange={() => onCareerToggle(career)}
                    />
                    <span>{career}</span>
                  </label>
                ))
              )}
            </div>
          </fieldset>

          {errorMessage && <div className="modal-error">{errorMessage}</div>}

          <div className="modal-actions">
            <button type="submit" className="modal-confirm-btn">{isEditMode ? 'Guardar cambios' : 'Confirmar'}</button>
            {isEditMode && onDelete && (
              <button type="button" className="modal-delete-btn" onClick={onDelete}>Eliminar asignatura</button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

window.CreateSubjectModal = CreateSubjectModal;
