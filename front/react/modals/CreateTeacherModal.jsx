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
    onChange,
    onSubmit
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

        <h2 id="teacherModalTitle" className="modal-title">Crear docente</h2>

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
            Correo
            <input
              className="form-input"
              type="email"
              value={form.correo}
              onChange={(event) => onChange("correo", event.target.value)}
              placeholder="ejemplo@ucu.edu.uy"
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

window.CreateTeacherModal = CreateTeacherModal;
