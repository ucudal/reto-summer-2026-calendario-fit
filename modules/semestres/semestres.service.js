import {
  crearSemestreLectivo,
  listarSemestresLectivos,
  obtenerSemestrePorNumeroYAnio
} from "./semestres.repository.js";

function parseTermLabel(numeroSemestre, anio) {
  return `${Number(numeroSemestre) === 2 ? "2do" : "1er"} semestre ${Number(anio)}`;
}

export async function listarSemestresLectivosService() {
  const rows = await listarSemestresLectivos();
  return rows.map((row) => ({
    id: Number(row.id),
    numeroSemestre: Number(row.numeroSemestre),
    anio: Number(row.anio),
    lectiveTerm: parseTermLabel(row.numeroSemestre, row.anio)
  }));
}

export async function crearSemestreLectivoService(data) {
  const numeroSemestre = Number(data?.numeroSemestre || data?.semestreLectivoNumero || 0);
  const anio = Number(data?.anio || data?.anioLectivo || 0);

  if (numeroSemestre !== 1 && numeroSemestre !== 2) {
    throw new Error("Semestre lectivo inválido");
  }
  if (!anio || anio < 2026) {
    throw new Error("Año lectivo inválido");
  }

  const existente = obtenerSemestrePorNumeroYAnio(numeroSemestre, anio);
  if (existente?.id) {
    return {
      id: Number(existente.id),
      numeroSemestre,
      anio,
      lectiveTerm: parseTermLabel(numeroSemestre, anio),
      created: false
    };
  }

  const result = crearSemestreLectivo(numeroSemestre, anio);
  const id = Number(result?.lastInsertRowid || 0);
  if (!id) {
    const retry = obtenerSemestrePorNumeroYAnio(numeroSemestre, anio);
    if (retry?.id) {
      return {
        id: Number(retry.id),
        numeroSemestre,
        anio,
        lectiveTerm: parseTermLabel(numeroSemestre, anio),
        created: false
      };
    }
    throw new Error("No se pudo crear el semestre lectivo");
  }

  return {
    id,
    numeroSemestre,
    anio,
    lectiveTerm: parseTermLabel(numeroSemestre, anio),
    created: true
  };
}
