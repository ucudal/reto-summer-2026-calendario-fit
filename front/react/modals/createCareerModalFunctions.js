/*
  Archivo: createCareerModalFunctions.js
  Que guarda:
  - Funciones de logica del modal "Crear carrera".
  - No renderiza UI.
*/

async function confirmCreateCareer(params) {
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

  try {
    if (!window.api?.carreras?.crear) {
      setCareerModalError("No se encontro la API de carreras en preload.");
      return;
    }

    const response = await window.api.carreras.crear({ nombre });

    if (!response?.success) {
      const backendError = String(response?.error || "");
      if (backendError.toLowerCase().includes("unique") || backendError.toLowerCase().includes("existe")) {
        setCareerModalError("Esa carrera ya existe.");
        return;
      }

      setCareerModalError(backendError || "No se pudo crear la carrera.");
      return;
    }
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("existe")) {
      setCareerModalError("Esa carrera ya existe.");
      return;
    }
    setCareerModalError("No se pudo crear la carrera.");
    return;
  }

  const merged = [...new Set([...careers, nombre])];
  setCareers(merged);
  setSelectedCareer(nombre);

  // Nota: arriba ya se hizo la llamada real a backend/DB.

  closeCreateCareerModal();
}

window.CreateCareerModalFunctions = {
  confirmCreateCareer
};
