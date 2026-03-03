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
    careersData,
    careerEditMode,
    setCareerModalError,
    setCareers,
    setCareersData,
    setSelectedCareer,
    closeCreateCareerModal,
    reloadGroupsFromDb
  } = params;

  const nombre = String(careerForm.nombre || "").trim();

  if (!nombre) {
    setCareerModalError("El nombre de la carrera es obligatorio.");
    return;
  }

  const isEditing = careerEditMode && typeof careerEditMode === "object" && careerEditMode.id;

  // Si estamos editando, permitir que el nombre no cambie
  if (!isEditing && careers.includes(nombre)) {
    setCareerModalError("Esa carrera ya existe.");
    return;
  }

  // En edicion, verificar duplicado solo si el nombre cambio
  if (isEditing && nombre !== careerEditMode.nombre && careers.includes(nombre)) {
    setCareerModalError("Esa carrera ya existe.");
    return;
  }

  try {
    if (isEditing) {
      // ACTUALIZAR carrera existente
      if (!window.api?.carreras?.actualizar) {
        setCareerModalError("No se encontro la API de carreras en preload.");
        return;
      }

      const response = await window.api.carreras.actualizar({ id: careerEditMode.id, nombre });

      if (!response?.success) {
        const backendError = String(response?.error || "");
        if (backendError.toLowerCase().includes("unique") || backendError.toLowerCase().includes("existe")) {
          setCareerModalError("Esa carrera ya existe.");
          return;
        }
        setCareerModalError(backendError || "No se pudo actualizar la carrera.");
        return;
      }

      // Actualizar estado local
      const oldName = careerEditMode.nombre;
      const updatedNames = careers.map(c => c === oldName ? nombre : c);
      setCareers(updatedNames);
      setCareersData(careersData.map(c => c.id === careerEditMode.id ? { ...c, nombre } : c));
      setSelectedCareer(nombre);

      // Recargar grupos para que reflejen el nuevo nombre de carrera
      if (reloadGroupsFromDb) await reloadGroupsFromDb();
    } else {
      // CREAR nueva carrera
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

      const merged = [...new Set([...careers, nombre])];
      setCareers(merged);

      // Agregar a careersData con el ID retornado si es posible
      const newId = response?.data?.lastInsertRowid || response?.data?.changes;
      if (newId) {
        setCareersData([...careersData, { id: Number(newId), nombre }]);
      }
      setSelectedCareer(nombre);
    }
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("existe")) {
      setCareerModalError("Esa carrera ya existe.");
      return;
    }
    setCareerModalError(isEditing ? "No se pudo actualizar la carrera." : "No se pudo crear la carrera.");
    return;
  }

  closeCreateCareerModal();
}

async function deleteCareer(params) {
  const {
    careerEditMode,
    careers,
    careersData,
    setCareers,
    setCareersData,
    setSelectedCareer,
    setCareerModalError,
    closeCreateCareerModal,
    reloadGroupsFromDb
  } = params;

  const careerObj = (careerEditMode && typeof careerEditMode === "object") ? careerEditMode : null;

  if (!careerObj || !careerObj.id) {
    setCareerModalError("No se puede determinar la carrera a eliminar.");
    return;
  }

  try {
    if (!window.api?.carreras?.eliminar) {
      setCareerModalError("No se encontro la API de carreras en preload.");
      return;
    }

    const response = await window.api.carreras.eliminar(careerObj.id);

    if (!response?.success) {
      setCareerModalError(String(response?.error || "No se pudo eliminar la carrera."));
      return;
    }

    // Actualizar estado local
    const remainingCareers = careers.filter(c => c !== careerObj.nombre);
    setCareers(remainingCareers);
    setCareersData(careersData.filter(c => c.id !== careerObj.id));
    setSelectedCareer(remainingCareers.length > 0 ? remainingCareers[0] : "");

    // Recargar grupos para reflejar la eliminación
    if (reloadGroupsFromDb) await reloadGroupsFromDb();

    closeCreateCareerModal();
  } catch (error) {
    setCareerModalError(String(error?.message || "No se pudo eliminar la carrera."));
  }
}

window.CreateCareerModalFunctions = {
  confirmCreateCareer,
  deleteCareer
};
