/*
  Componente: CreateTeacherModal
  ------------------------------
  Modal para crear docentes.
  Usa el estilo azul de los modales de grupos para mantener coherencia visual.
*/

function CreateTeacherModal(props) {
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

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop groups-list-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="group-modal groups-list-modal create-teacher-modal" role="dialog" aria-modal="true" aria-labelledby="teacherModalTitle">
        <button type="button" className="modal-close-btn" aria-label="Cerrar" onClick={onClose}>X</button>

        {onBack ? (
          <div className="modal-header-with-back">
            <button type="button" className="modal-back-btn" onClick={onBack}>← Volver</button>
            <h2 id="teacherModalTitle" className="modal-title">{isEditMode ? 'Editar docente' : 'Crear docente'}</h2>
          </div>
        ) : (
          <h2 id="teacherModalTitle" className="modal-title">{isEditMode ? 'Editar docente' : 'Crear docente'}</h2>
        )}

        <form
          className="group-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="form-label">
            Nombre
            <input
              className="form-input"
              type="text"
              value={form.nombre}
              onChange={(event) => onChange("nombre", event.target.value)}
              placeholder="Ej: Ana"
              required
            />
          </label>

          <label className="form-label">
            Apellido
            <input
              className="form-input"
              type="text"
              value={form.apellido}
              onChange={(event) => onChange("apellido", event.target.value)}
              placeholder="Ej: Gomez"
              required
            />
          </label>

          <label className="form-label">
            Correo (opcional)
            <input
              className="form-input"
              type="email"
              value={form.correo}
              onChange={(event) => onChange("correo", event.target.value)}
              placeholder="ejemplo@ucu.edu.uy"
            />
          </label>

          {errorMessage && <div className="modal-error">{errorMessage}</div>}

          <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: isEditMode ? 'space-between' : 'flex-end' }}>
            {isEditMode && onDelete && (
              <button
                type="button"
                className="modal-delete-btn"
                style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('¿Estás seguro de que deseas eliminar este docente? Se eliminarán también sus asignaciones a grupos.')) {
                    onDelete();
                  }
                }}
              >
                Eliminar
              </button>
            )}
            <button type="submit" className="modal-confirm-btn">Confirmar</button>
          </div>
        </form>
      </section>
    </div>
  );
}

window.CreateTeacherModal = CreateTeacherModal;
