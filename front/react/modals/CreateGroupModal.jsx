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
    careerOptions,
    planOptions,
    onClose,
    onChange,
    onToggleList,
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

          <fieldset className="form-label form-fieldset">
            <legend className="form-legend">Dias (puedes elegir varios)</legend>
            <div className="checkbox-list">
              {days.map((day) => {
                const checked = (form.days || []).includes(day);
                return (
                  <label key={day} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => onToggleList("days", day, event.target.checked)}
                    />
                    <span>{day}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

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

          <fieldset className="form-label form-fieldset">
            <legend className="form-legend">Carreras (puedes elegir varias)</legend>
            <div className="checkbox-list">
              {careerOptions.map((career) => {
                const checked = (form.careers || []).includes(career);
                return (
                  <label key={career} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => onToggleList("careers", career, event.target.checked)}
                    />
                    <span>{career}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="form-label form-fieldset">
            <legend className="form-legend">Planes (segun carreras elegidas)</legend>
            <div className="checkbox-list">
              {planOptions.length === 0 && (
                <div className="checkbox-empty">Primero selecciona una carrera con planes.</div>
              )}
              {planOptions.map((plan) => {
                const checked = (form.plans || []).includes(plan);
                return (
                  <label key={plan} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => onToggleList("plans", plan, event.target.checked)}
                    />
                    <span>{plan}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {errorMessage && <div className="modal-error">{errorMessage}</div>}

          <button type="submit" className="modal-confirm-btn">Confirmar</button>
        </form>
      </section>
    </div>
  );
}

window.CreateGroupModal = CreateGroupModal;
