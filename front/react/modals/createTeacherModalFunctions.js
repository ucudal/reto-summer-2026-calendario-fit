/*
  Archivo: createTeacherModalFunctions.js
  Que guarda:
  - Funciones de logica para el modal "Crear docente".
  - No renderiza UI.
*/

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

async function confirmCreateTeacher(params) {
  const {
    teacherForm,
    teacherEditMode,
    setTeacherModalError,
    closeCreateTeacherModal
  } = params;

  const nombre = String(teacherForm.nombre || "").trim();
  const apellido = String(teacherForm.apellido || "").trim();
  const correo = String(teacherForm.correo || "").trim().toLowerCase();

  if (!nombre) {
    setTeacherModalError("El nombre es obligatorio.");
    return;
  }

  if (!apellido) {
    setTeacherModalError("El apellido es obligatorio.");
    return;
  }

  if (correo && !isValidEmail(correo)) {
    setTeacherModalError("El correo no tiene formato valido.");
    return;
  }

  try {
    let response;

    if (teacherEditMode && teacherEditMode.id) {
      // Modo edición: actualizar docente existente
      if (!window.api?.docentes?.actualizar) {
        setTeacherModalError("No se encontró la API de actualizar docentes en preload.");
        return;
      }
      response = await window.api.docentes.actualizar({ id: teacherEditMode.id, nombre, apellido, correo });
    } else {
      // Modo creación: crear nuevo docente
      if (!window.api?.docentes?.crear) {
        setTeacherModalError("No se encontró la API de docentes en preload.");
        return;
      }
      response = await window.api.docentes.crear({ nombre, apellido, correo });
    }

    if (!response?.success) {
      const backendError = String(response?.error || "");

      if (backendError.toLowerCase().includes("unique") || backendError.toLowerCase().includes("correo")) {
        setTeacherModalError("Ya existe un docente con ese correo.");
        return;
      }

      setTeacherModalError(backendError || (teacherEditMode ? "No se pudo actualizar el docente." : "No se pudo crear el docente."));
      return;
    }
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("correo")) {
      setTeacherModalError("Ya existe un docente con ese correo.");
      return;
    }
    setTeacherModalError(teacherEditMode ? "No se pudo actualizar el docente." : "No se pudo crear el docente.");
    return;
  }

  closeCreateTeacherModal();
}

async function deleteTeacher(params) {
  const { teacherId, setTeacherModalError, closeCreateTeacherModal } = params;

  if (!teacherId) {
    setTeacherModalError("No se puede eliminar: ID de docente no encontrado.");
    return;
  }

  try {
    if (!window.api?.docentes?.eliminar) {
      setTeacherModalError("No se encontró la API de eliminar docentes en preload.");
      return;
    }

    const response = await window.api.docentes.eliminar(teacherId);

    if (!response?.success) {
      setTeacherModalError(String(response?.error || "No se pudo eliminar el docente."));
      return;
    }
  } catch (error) {
    setTeacherModalError(String(error?.message || "No se pudo eliminar el docente."));
    return;
  }

  closeCreateTeacherModal();
}

window.CreateTeacherModalFunctions = {
  confirmCreateTeacher,
  deleteTeacher
};
