import { crearSemestreLectivoRepo, listarSemestresLectivosRepo } from "./semestres.repository.js";

export function crearSemestreLectivo(data) {
  const nombre = String(data?.nombre || "").trim();
  if (!nombre) {
    throw new Error("El nombre del semestre lectivo es obligatorio");
  }

  try {
    const result = crearSemestreLectivoRepo({
      nombre,
      esEnBlanco: Boolean(data?.esEnBlanco),
      origenNombre: data?.origenNombre ? String(data.origenNombre).trim() : null
    });

    return {
      id: Number(result?.lastInsertRowid || 0),
      nombre,
      esEnBlanco: Boolean(data?.esEnBlanco),
      origenNombre: data?.origenNombre ? String(data.origenNombre).trim() : null
    };
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("unique")) {
      return {
        id: 0,
        nombre,
        esEnBlanco: Boolean(data?.esEnBlanco),
        origenNombre: data?.origenNombre ? String(data.origenNombre).trim() : null,
        alreadyExists: true
      };
    }
    throw error;
  }
}

export function listarSemestresLectivos() {
  return listarSemestresLectivosRepo();
}
