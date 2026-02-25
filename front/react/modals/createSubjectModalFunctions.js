/*
  Archivo: createSubjectModalFunctions.js
  Que guarda:
  - Funciones de logica del modal "Crear asignatura".
  - No renderiza UI.
*/

function confirmCreateSubject(params) {
  const {
    subjectForm,
    subjects,
    setSubjectModalError,
    setSubjects,
    closeCreateSubjectModal
  } = params;

  const nombre = String(subjectForm.nombre || "").trim();
  const tipo = String(subjectForm.tipo || "").trim();
  const creditos = parseInt(subjectForm.creditos);
  const tieneContrasemestre = Boolean(subjectForm.tieneContrasemestre);
  const carreras = subjectForm.carreras || [];

  // Validaciones
  if (!nombre) {
    setSubjectModalError("El nombre de la asignatura es obligatorio.");
    return;
  }

  if (!tipo) {
    setSubjectModalError("Debe seleccionar un tipo de asignatura.");
    return;
  }

  if (!creditos || creditos < 1) {
    setSubjectModalError("Los créditos deben ser un número mayor a 0.");
    return;
  }

  if (carreras.length === 0) {
    setSubjectModalError("Debe seleccionar al menos una carrera.");
    return;
  }

  // Verificar que no exista ya una materia con ese nombre
  const exists = subjects.some(s => s.nombre.toLowerCase() === nombre.toLowerCase());
  if (exists) {
    setSubjectModalError("Ya existe una asignatura con ese nombre.");
    return;
  }

  // Crear nueva materia
  const newSubject = {
    id: Date.now(), // ID temporal
    nombre,
    tipo,
    creditos,
    tieneContrasemestre,
    carreras: [...carreras]
  };

  setSubjects([...subjects, newSubject]);

  // @todo falta todo lo base, ACA BD NO OLVIDAR BD
  // Aca va la llamada para guardar la materia en base de datos.
  // Ejemplo futuro: await backend.materias.crear(newSubject);

  closeCreateSubjectModal();
}

function confirmEditSubject(params) {
  const {
    subjectForm,
    subjects,
    originalSubject,
    setSubjectModalError,
    setSubjects,
    closeCreateSubjectModal
  } = params;

  const nombre = String(subjectForm.nombre || "").trim();
  const tipo = String(subjectForm.tipo || "").trim();
  const creditos = parseInt(subjectForm.creditos);
  const tieneContrasemestre = Boolean(subjectForm.tieneContrasemestre);
  const carreras = subjectForm.carreras || [];

  // Validaciones
  if (!nombre) {
    setSubjectModalError("El nombre de la asignatura es obligatorio.");
    return;
  }

  if (!tipo) {
    setSubjectModalError("Debe seleccionar un tipo de asignatura.");
    return;
  }

  if (!creditos || creditos < 1) {
    setSubjectModalError("Los créditos deben ser un número mayor a 0.");
    return;
  }

  if (carreras.length === 0) {
    setSubjectModalError("Debe seleccionar al menos una carrera.");
    return;
  }

  // Verificar que no exista otra materia con ese nombre (excepto la actual)
  const exists = subjects.some(s => 
    s.id !== originalSubject.id && 
    s.nombre.toLowerCase() === nombre.toLowerCase()
  );
  if (exists) {
    setSubjectModalError("Ya existe otra asignatura con ese nombre.");
    return;
  }

  // Actualizar materia
  const updatedSubjects = subjects.map(s => 
    s.id === originalSubject.id 
      ? { ...s, nombre, tipo, creditos, tieneContrasemestre, carreras: [...carreras] }
      : s
  );

  setSubjects(updatedSubjects);

  // @todo falta todo lo base, ACA BD NO OLVIDAR BD
  // Aca va la llamada para actualizar la materia en base de datos.
  // Ejemplo futuro: await backend.materias.actualizar(originalSubject.id, updatedData);

  closeCreateSubjectModal();
}

function confirmDeleteSubject(params) {
  const {
    subjectForm,
    subjects,
    setSubjects,
    closeCreateSubjectModal
  } = params;

  if (!window.confirm(`¿Está seguro que desea eliminar la asignatura "${subjectForm.nombre}"?`)) {
    return;
  }

  const updatedSubjects = subjects.filter(s => s.id !== subjectForm.id);
  setSubjects(updatedSubjects);

  // @todo falta todo lo base, ACA BD NO OLVIDAR BD
  // Aca va la llamada para eliminar la materia en base de datos.
  // Ejemplo futuro: await backend.materias.eliminar(subjectForm.id);

  closeCreateSubjectModal();
}

window.CreateSubjectModalFunctions = {
  confirmCreateSubject,
  confirmEditSubject,
  confirmDeleteSubject
};
