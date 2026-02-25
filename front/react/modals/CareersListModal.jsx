/*
  Componente: CareersListModal
  Que hace:
  - Muestra modal con listado de carreras existentes.
  - Permite buscar carreras alfabéticamente.
  - Permite seleccionar una carrera para ver/editar/eliminar.
  - Permite crear nueva carrera.
*/

function CareersListModal(props) {
  const {
    isOpen,
    careers,
    onClose,
    onSelectCareer,
    onCreateNew
  } = props;

  // Estado del buscador
  const [searchTerm, setSearchTerm] = React.useState("");

  // Si no esta abierto, no renderiza nada.
  if (!isOpen) return null;

  // Filtra carreras según término de búsqueda
  const filteredCareers = careers
    .filter((career) => career.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

  return (
    <div className="modal-backdrop groups-list-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="group-modal groups-list-modal" role="dialog" aria-modal="true" aria-labelledby="careersModalTitle">

        <div className="modal-header-with-button">
          <h2 id="careersModalTitle" className="modal-title">Gestión de Carreras</h2>
          <button type="button" className="modal-header-btn" onClick={onCreateNew}>
            + Nueva Carrera
          </button>
        </div>

        <div className="subject-search-container">
          <input
            type="text"
            className="subject-search-input"
            placeholder="Buscar carrera..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="subjects-list">
          {filteredCareers.length === 0 ? (
            <p className="no-subjects-message">
              {careers.length === 0 
                ? "No hay carreras disponibles" 
                : "No se encontraron carreras"}
            </p>
          ) : (
            filteredCareers.map((career) => (
              <div 
                key={career} 
                className="subject-item"
                onClick={() => onSelectCareer(career)}
              >
                <div className="subject-info">
                  <span className="subject-name">{career}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

window.CareersListModal = CareersListModal;
