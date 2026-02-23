import {
    crearMateria,
    listarMaterias,
    obtenerMateriaPorId as repoObtenerMateriaPorId,
    actualizarMateria as repoActualizarMateria,
    eliminarMateria
} from './materias.repository.js';

export async function altaMateria(data) {
    validarMateria(data);

    return await crearMateria({
        nombre: data.nombre.trim(),
        tipo: data.tipo.trim(),
        creditos: Number(data.creditos),
        tieneContrasemestre: Boolean(data.tieneContrasemestre)  
    });
}

export async function obtenerMaterias() {
    return await listarMaterias();
}

export async function obtenerMateriaPorId(id) {
  if (!id) {
    throw new Error("ID inválido");
  }
  const materia = await repoObtenerMateriaPorId(id);
  if (!materia) {
    throw new Error("Materia no encontrada");
  }
  return materia;
}

export async function actualizarMateria(id, datos) {
  if (!id) {
    throw new Error("ID inválido");
  }
  validarMateria(datos);
  return await repoActualizarMateria(id, {
    nombre: datos.nombre.trim(),
    tipo: datos.tipo.trim(),
    creditos: Number(datos.creditos),
    tieneContrasemestre: Boolean(datos.tieneContrasemestre)  
  });
}

export async function bajaMateria(id) {
  if (!id) {
    throw new Error("ID inválido");
  }
  return await eliminarMateria(id);
}

/**
 * Validaciones básicas
 */
function validarMateria(data) {
  if (!data.nombre || data.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio");
  }

  if (!data.tipo || data.tipo.trim() === "") {
    throw new Error("El tipo es obligatorio");
  }

  if (data.creditos === undefined || data.creditos === null || data.creditos === "") {
    throw new Error("Los créditos son obligatorios");
  }

  if (isNaN(Number(data.creditos))) {
    throw new Error("Los créditos deben ser un número");
  }

  if(Number(data.creditos) <= 0) {
    throw new Error("Los créditos deben ser mayores a 0");
  }

}