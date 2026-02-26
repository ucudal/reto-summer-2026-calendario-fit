/*
  Componente: CreateCareerModal
  -----------------------------
  Modal simple para crear una carrera.
  Recibe todo por props y no guarda estado interno.
*/

function CreateCareerModal(props) {
  const {
    isOpen,
    form,
    errorMessage,
    onClose,
    onBack,
    onChange,
    onSubmit,
    isEditMode = false
  } = props;

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop groups-list-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="group-modal groups-list-modal" role="dialog" aria-modal="true" aria-labelledby="careerModalTitle">
        <button type="button" className="modal-close-btn" aria-label="Cerrar" onClick={onClose}>X</button>

        {onBack ? (
          <div className="modal-header-with-back">
            <button type="button" className="modal-back-btn" onClick={onBack}>← Volver</button>
            <h2 id="careerModalTitle" className="modal-title">{isEditMode ? 'Editar carrera' : 'Crear carrera'}</h2>
          </div>
        ) : (
          <h2 id="careerModalTitle" className="modal-title">{isEditMode ? 'Editar carrera' : 'Crear carrera'}</h2>
        )}

        <form
          className="group-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="form-label">
            Nombre de la carrera
            <input
              className="form-input"
              type="text"
              value={form.nombre}
              onChange={(event) => onChange("nombre", event.target.value)}
              placeholder="Ej: Ingenieria en Sistemas"
              required
            />
          </label>

          {errorMessage && <div className="modal-error">{errorMessage}</div>}

          <button type="submit" className="modal-confirm-btn">Confirmar</button>
        </form>
      </section>
    </div>
  );
}

window.CreateCareerModal = CreateCareerModal;

