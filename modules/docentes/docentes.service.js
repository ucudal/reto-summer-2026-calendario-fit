import {
  crearDocente,
  eliminarDocente,
  modificarDocente,
  obtenerDocentePorId,
  listarDocentes
} from './docentes.repository.js';

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function resolveStoredEmail(inputEmail) {
  const normalized = normalizeEmail(inputEmail);
  return normalized || null;
}


/**
 * Alta de docente
 */
export function altaDocente(data) {
  validarDocente(data);

  return crearDocente({
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    correo: resolveStoredEmail(data.correo)
  });
}


/**
 * Modificación de docente
 */
export function actualizarDocente(data) {
  if (!data.id) {
    throw new Error("ID requerido para modificar docente");
  }

  const existente = obtenerDocentePorId(data.id);
  if (!existente) {
    throw new Error("Docente no encontrado");
  }

  validarDocente(data);

  return modificarDocente(data.id, {
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    correo: resolveStoredEmail(data.correo)
  });
}


/**
 * Baja de docente
 */
export function bajaDocente(id) {
  if (!id) {
    throw new Error("ID requerido para eliminar docente");
  }

  const existente = obtenerDocentePorId(id);
  if (!existente) {
    throw new Error("Docente no encontrado");
  }

  // Ambas operaciones se ejecutan atómicamente en el repositorio
  return eliminarDocente(id);
}


/**
 * Obtener uno
 */
export async function obtenerDocente(id) {
  if (!id) {
    throw new Error("ID requerido");
  }

  return await obtenerDocentePorId(id);
}


/**
 * Listar todos
 */
export async function obtenerDocentes() {
  return await listarDocentes();
}


/**
 * Validaciones básicas
 */
function validarDocente(data) {
  if (!data.nombre || data.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio");
  }

  if (!data.apellido || data.apellido.trim() === "") {
    throw new Error("El apellido es obligatorio");
  }

  const normalizedEmail = normalizeEmail(data.correo);
  if (normalizedEmail && !validarEmail(normalizedEmail)) {
    throw new Error("Email inválido");
  }
}


function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
