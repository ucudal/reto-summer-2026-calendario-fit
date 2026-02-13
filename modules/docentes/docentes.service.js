import {
  crearDocente,
  eliminarDocente,
  modificarDocente,
  obtenerDocentePorId,
  listarDocentes
} from './docentes.repository.js';


/**
 * Alta de docente
 */
export function altaDocente(data) {
  validarDocente(data);

  return crearDocente({
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    email: data.email.trim().toLowerCase()
  });
}


/**
 * Modificación de docente
 */
export function actualizarDocente(data) {
  if (!data.id) {
    throw new Error("ID requerido para modificar docente");
  }

  validarDocente(data);

  const existente = obtenerDocentePorId(data.id);
  if (!existente) {
    throw new Error("Docente no encontrado");
  }

  return modificarDocente({
    id: data.id,
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    email: data.email.trim().toLowerCase()
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

  if (!data.email || data.email.trim() === "") {
    throw new Error("El email es obligatorio");
  }

  if (!validarEmail(data.email)) {
    throw new Error("Email inválido");
  }
}


function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
