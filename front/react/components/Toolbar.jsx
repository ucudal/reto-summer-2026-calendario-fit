/*
  Componente: Toolbar
  Que hace:
  - Muestra select de carrera y plan.
  - Muestra botones de acciones superiores.
  - Dispara "onOpenCreateGroup" cuando se presiona CREAR GRUPO.
  - Dispara "onOpenCreateCareer" cuando se presiona CREAR CARRERA.
*/

function Toolbar(props) {
  const {
    careers,
    plans,
    selectedCareer,
    selectedPlan,
    onCareerChange,
    onPlanChange,
    onOpenCreateCareer,
    onOpenCreateGroup,
    onExportExcel
  } = props;

  return (
    <section className="toolbar card">
      <div className="toolbar-row">
        <select className="input-like" value={selectedCareer} onChange={(event) => onCareerChange(event.target.value)}>
          {careers.map((career) => (
            <option key={career} value={career}>{career}</option>
          ))}
        </select>

        <select className="input-like" value={selectedPlan} onChange={(event) => onPlanChange(event.target.value)}>
          {plans.map((plan) => (
            <option key={plan} value={plan}>{plan}</option>
          ))}
        </select>

        <button className="pill-btn" type="button">CREAR NUEVO SEMESTRE +</button>
        <button className="pill-btn" type="button" onClick={onOpenCreateCareer}>CREAR CARRERA</button>
        <button className="pill-btn" type="button" onClick={onOpenCreateGroup}>CREAR GRUPO</button>
        <button className="pill-btn" type="button" onClick={onExportExcel}>EXPORTAR</button>
      </div>

      <h1 className="career-title">{selectedCareer}</h1>
      <div className="plan-label">{selectedPlan}</div>
    </section>
  );
}

window.Toolbar = Toolbar;
