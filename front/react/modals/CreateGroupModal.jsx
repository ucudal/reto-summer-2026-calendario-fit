/*
  Componente: CreateGroupModal
  Que hace:
  - Muestra modal para crear un grupo.
  - Todos los campos se controlan desde App (props).
  - No guarda datos directamente, solo llama callbacks.
*/

function CreateGroupModal(props) {
  const {
    isOpen,
    form,
    years,
    days,
    hourOptionsFrom,
    hourOptionsTo,
    onClose,
    onChange,
    onSubmit,
    errorMessage
  } = props;

  // Si no esta abierto, no renderiza nada.
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="group-modal" role="dialog" aria-modal="true" aria-labelledby="groupModalTitle">
        <button type="button" className="modal-close-btn" aria-label="Cerrar" onClick={onClose}>X</button>

        <h2 id="groupModalTitle" className="modal-title">Crear grupo</h2>

        <form
          className="group-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="form-label">
            Materia
            <input
              className="form-input"
              type="text"
              value={form.subject}
              onChange={(event) => onChange("subject", event.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Dia
            <select
              className="form-input"
              value={form.day}
              onChange={(event) => onChange("day", event.target.value)}
            >
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Anio
            <select
              className="form-input"
              value={form.year}
              onChange={(event) => onChange("year", event.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Horario desde
            <select
              className="form-input"
              value={form.fromTime}
              onChange={(event) => onChange("fromTime", event.target.value)}
            >
              {hourOptionsFrom.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Horario hasta
            <select
              className="form-input"
              value={form.toTime}
              onChange={(event) => onChange("toTime", event.target.value)}
            >
              {hourOptionsTo.map((hour) => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </label>

          {errorMessage && <div className="modal-error">{errorMessage}</div>}

          <button type="submit" className="modal-confirm-btn">Confirmar</button>
        </form>
      </section>
    </div>
  );
}

window.CreateGroupModal = CreateGroupModal;
