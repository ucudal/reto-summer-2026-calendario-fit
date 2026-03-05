/*
  Componente: AlertsPanel
  Que hace:
  - Recibe lista de alertas ya calculada.
  - Si no hay alertas, muestra mensaje vacio.
*/

function AlertsPanel(props) {
  const { alerts } = props;

  return (
    <div className="card alerts-card">
      <h2 className="section-title">Alertas activas</h2>

      <ul className="alerts-list">
        {alerts.length === 0 && (
          <li>No hay alertas para los calendarios seleccionados.</li>
        )}

        {alerts.map((message, index) => (
          <li key={`${message}-${index}`}>
            <span className="warn">[!]</span>
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}

window.AlertsPanel = AlertsPanel;
