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
    onCareerSemesterChange,
    onSubmit,
    onDelete,
    isEditMode = false,
    availableCareers = []
  } = props;

  // Opciones de semestre y año
  const semesterOptions = [
    "1er s 1er año",
    "2do s 1er año",
    "1er s 2do año",
    "2do s 2do año",
    "1er s 3er año",
    "2do s 3er año",
    "1er s 4to año",
    "2do s 4to año",
    "1er s 5to año",
    "2do s 5to año"
  ];

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

          <div className="form-row">
            <label className="form-label form-label-compact">
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

            <label className="form-label form-label-compact">
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

            <label className="checkbox-row checkbox-main">
              <input
                type="checkbox"
                checked={form.tieneContrasemestre}
                onChange={(event) => onChange("tieneContrasemestre", event.target.checked)}
              />
              Es contrasemestre
            </label>
          </div>

          <label className="form-label">
            Requerimientos de salón
            <textarea
              className="form-input"
              rows="3"
              value={form.requerimientosSalon}
              onChange={(event) => onChange("requerimientosSalon", event.target.value)}
              placeholder="Ej: Laboratorio con 30 computadoras, proyector, pizarra digital..."
            />
          </label>

          <div>
            <label className="form-label">Carreras donde se dicta</label>
            <div className="form-fieldset" style={{ marginTop: '8px' }}>
              <div className="checkbox-list">
                {availableCareers.length === 0 ? (
                  <p className="checkbox-empty">No hay carreras disponibles. Por favor, cree una carrera primero.</p>
                ) : (
                  availableCareers.map((career) => (
                    <div key={career} style={{ marginBottom: '12px' }}>
                      <label className="checkbox-row" style={{ marginBottom: '4px' }}>
                        <input
                          type="checkbox"
                          checked={form.carreras.includes(career)}
                          onChange={() => onCareerToggle(career)}
                        />
                        <span>{career}</span>
                      </label>
                      {form.carreras.includes(career) && (
                        <div style={{ marginLeft: '28px', marginTop: '6px' }}>
                          <select
                            className="form-input"
                            style={{ fontSize: '12px', height: '32px' }}
                            value={form.carrerasSemestre[career] || ""}
                            onChange={(e) => onCareerSemesterChange(career, e.target.value)}
                            required
                          >
                            <option value="">Seleccione semestre y año</option>
                            {semesterOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

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
