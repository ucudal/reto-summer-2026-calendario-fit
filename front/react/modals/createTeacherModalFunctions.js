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

  if (!correo) {
    setTeacherModalError("El correo es obligatorio.");
    return;
  }

  if (!isValidEmail(correo)) {
    setTeacherModalError("El correo no tiene formato valido.");
    return;
  }

  try {
    if (!window.api?.docentes?.crear) {
      setTeacherModalError("No se encontro la API de docentes en preload.");
      return;
    }

    const response = await window.api.docentes.crear({ nombre, apellido, correo });

    if (!response?.success) {
      const backendError = String(response?.error || "");

      if (backendError.toLowerCase().includes("unique") || backendError.toLowerCase().includes("correo")) {
        setTeacherModalError("Ya existe un docente con ese correo.");
        return;
      }

      setTeacherModalError(backendError || "No se pudo crear el docente.");
      return;
    }
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("correo")) {
      setTeacherModalError("Ya existe un docente con ese correo.");
      return;
    }
    setTeacherModalError("No se pudo crear el docente.");
    return;
  }

  closeCreateTeacherModal();
}

window.CreateTeacherModalFunctions = {
  confirmCreateTeacher
};
