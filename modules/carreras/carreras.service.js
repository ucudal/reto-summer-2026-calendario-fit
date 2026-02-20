import {
  crearCarrera,
  eliminarCarrera,
  listarCarreras,
  modificarCarrera,
  obtenerCarreraPorId
} from './carreras.repository.js';

export function altaCarrera(data) {
  validarCarrera(data);

  return crearCarrera({
    nombre: data.nombre.trim()
  });
}

export function actualizarCarrera(data) {
  if (!data.id) {
    throw new Error('ID requerido para modificar carrera');
  }

  validarCarrera(data);

  const existente = obtenerCarreraPorId(data.id);
  if (!existente) {
    throw new Error('Carrera no encontrada');
  }

  return modificarCarrera(data.id, {
    nombre: data.nombre.trim()
  });
}

export function bajaCarrera(id) {
  if (!id) {
    throw new Error('ID requerido para eliminar carrera');
  }

  const existente = obtenerCarreraPorId(id);
  if (!existente) {
    throw new Error('Carrera no encontrada');
  }

  return eliminarCarrera(id);
}

export async function obtenerCarrera(id) {
  if (!id) {
    throw new Error('ID requerido');
  }

  return await obtenerCarreraPorId(id);
}

export async function obtenerCarreras() {
  return await listarCarreras();
}

function validarCarrera(data) {
  if (!data.nombre || data.nombre.trim() === '') {
    throw new Error('El nombre es obligatorio');
  }
}
