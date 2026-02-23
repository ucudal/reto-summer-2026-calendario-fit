/*
  Archivo: createCareerModalFunctions.js
  Que guarda:
  - Funciones de logica del modal "Crear carrera".
  - No renderiza UI.
*/

function confirmCreateCareer(params) {
  const {
    careerForm,
    careers,
    setCareerModalError,
    setCareers,
    setSelectedCareer,
    closeCreateCareerModal
  } = params;

  const nombre = String(careerForm.nombre || "").trim();

  if (!nombre) {
    setCareerModalError("El nombre de la carrera es obligatorio.");
    return;
  }

  if (careers.includes(nombre)) {
    setCareerModalError("Esa carrera ya existe.");
    return;
  }

  const merged = [...new Set([...careers, nombre])];
  setCareers(merged);
  setSelectedCareer(nombre);

  // @todo falta todo lo base, ACA BD NO OLVIDAR BD
  // Aca va la llamada para guardar la carrera en base de datos.
  // Ejemplo futuro: await backend.carreras.crear({ nombre });

  closeCreateCareerModal();
}

window.CreateCareerModalFunctions = {
  confirmCreateCareer
};
