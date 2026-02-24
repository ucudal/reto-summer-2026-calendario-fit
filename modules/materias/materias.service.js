import {
    crearMateria,
    listarMaterias
} from './materias.repository.js';

export function altaMateria(data) {
    validarMateria(data);

    return crearMateria({
        nombre: data.nombre.trim(),
        tipo: data.tipo.trim(),
        creditos: data.creditos,
        tieneContrasemestre: data.tieneContrasemestre  
    });
}

export async function obtenerMaterias() {
    return await listarMaterias();
}

/**
 * Validaciones básicas
 */
function validarMateria(data) {
    console.log(data);
  if (!data.nombre || data.nombre.trim() === "") {
    throw new Error("El nombre es obligatorio");
  }

  if (!data.tipo || data.tipo.trim() === "") {
    throw new Error("El tipo es obligatorio");
  }

  if (!data.creditos) {
    throw new Error("Los creditos son obligatorios");
  }

}