function AlertsView() {
  const alerts = [
    {
      id: 1,
      type: "error",
      icon: "⚠️",
      message: "Fundamentos matemáticos (compartida) se superpone con Física 1 (Ing. Industrial)."
    },
    {
      id: 2,
      type: "warning",
      icon: "👤",
      message: "Programación 1 aún no ha confirmado docente."
    },
    {
      id: 3,
      type: "warning",
      icon: "👤",
      message: "Programación 1 aún no ha confirmado docente."
    }
  ];

  return (
    <div className="menu">
      <h3>Alertas activas</h3>
      <div className="alertsList">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            <span className="alertIcon">{alert.icon}</span>
            <p className="alertMessage">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertsView;