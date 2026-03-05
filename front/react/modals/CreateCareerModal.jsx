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
    onDelete,
    isEditMode = false
  } = props;

  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  // Reset confirmation state when the modal opens/closes or editMode changes
  React.useEffect(() => {
    setConfirmingDelete(false);
  }, [isOpen, isEditMode]);

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

          <div style={{ display: "flex", gap: "8px", justifyContent: isEditMode && onDelete ? "space-between" : "flex-end" }}>
            {isEditMode && onDelete && !confirmingDelete && (
              <button
                type="button"
                className="modal-confirm-btn"
                style={{ backgroundColor: "#dc3545" }}
                onClick={(e) => {
                  e.preventDefault();
                  setConfirmingDelete(true);
                }}
              >
                Eliminar
              </button>
            )}
            {isEditMode && onDelete && confirmingDelete && (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#dc3545", fontWeight: 600 }}>¿Confirmar?</span>
                <button
                  type="button"
                  className="modal-confirm-btn"
                  style={{ backgroundColor: "#dc3545", padding: "6px 12px", fontSize: "13px" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmingDelete(false);
                    onDelete();
                  }}
                >
                  Sí, eliminar
                </button>
                <button
                  type="button"
                  className="modal-confirm-btn"
                  style={{ backgroundColor: "#6c757d", padding: "6px 12px", fontSize: "13px" }}
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmingDelete(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
            <button type="submit" className="modal-confirm-btn">Confirmar</button>
          </div>
        </form>
      </section>
    </div>
  );
}

window.CreateCareerModal = CreateCareerModal;

