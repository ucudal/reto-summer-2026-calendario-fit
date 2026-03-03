import {
  crearSemestreLectivo,
  listarSemestresLectivos,
  obtenerSemestrePorNumeroYAnio,
  obtenerGruposPorSemestre,
  replicarGruposEnSemestre
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
    throw new Error(`El semestre ${parseTermLabel(numeroSemestre, anio)} ya existe`);
  }

  const result = crearSemestreLectivo(numeroSemestre, anio);
  const id = Number(result?.lastInsertRowid || 0);
  if (!id) {
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

/**
 * Replica todos los grupos de un semestre existente en un semestre nuevo.
 * @param {{ sourceNumero: number, sourceAnio: number, newNumero: number, newAnio: number }} params
 */
export async function replicarSemestreService({ sourceNumero, sourceAnio, newNumero, newAnio }) {
  if (![1, 2].includes(Number(sourceNumero))) {
    throw new Error("Número de semestre origen inválido (debe ser 1 o 2)");
  }
  if (![1, 2].includes(Number(newNumero))) {
    throw new Error("Número de semestre destino inválido (debe ser 1 o 2)");
  }
  if (!sourceAnio || Number(sourceAnio) < 2026) {
    throw new Error("Año del semestre origen inválido");
  }
  if (!newAnio || Number(newAnio) < 2026) {
    throw new Error("Año del semestre destino inválido");
  }

  // 1. Buscar el semestre origen
  const semestreOrigen = obtenerSemestrePorNumeroYAnio(Number(sourceNumero), Number(sourceAnio));
  if (!semestreOrigen?.id) {
    throw new Error(`No se encontró el semestre ${Number(sourceNumero) === 1 ? "1er" : "2do"} semestre de ${sourceAnio}`);
  }

  // 2. Verificar que el semestre destino no exista ya
  const semestreDestinoExistente = obtenerSemestrePorNumeroYAnio(Number(newNumero), Number(newAnio));
  if (semestreDestinoExistente?.id) {
    throw new Error(`El semestre destino ${parseTermLabel(newNumero, newAnio)} ya existe`);
  }

  // 3. Crear el semestre destino
  const created = crearSemestreLectivo(Number(newNumero), Number(newAnio));
  const newId = Number(created?.lastInsertRowid || 0);
  if (!newId) {
    throw new Error("No se pudo crear el semestre destino");
  }
  const semestreDestino = { id: newId };

  // 4. Obtener todos los grupos del semestre origen
  const gruposOrigen = obtenerGruposPorSemestre(semestreOrigen.id);
  if (gruposOrigen.length === 0) {
    return { created: 0, errors: ["El semestre origen no tiene grupos para copiar"] };
  }

  // 5. Replicar grupos en el semestre destino
  const resultado = replicarGruposEnSemestre(gruposOrigen, semestreDestino.id);

  return {
    created: resultado.created,
    errors: resultado.errors,
    lectiveTerm: parseTermLabel(newNumero, newAnio)
  };
}
