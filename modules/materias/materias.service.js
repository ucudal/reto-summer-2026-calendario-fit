import {
    crearMateria,
    listarCarrerasPorNombres,
    listarMaterias,
    listarCarrerasPlanesPorMateriaNombre as repoListarCarrerasPlanesPorMateriaNombre,
    obtenerMateriaPorId as repoObtenerMateriaPorId,
    actualizarMateria as repoActualizarMateria,
    eliminarMateria,
    reemplazarCarrerasMateria
} from './materias.repository.js';

export async function altaMateria(data) {
    validarMateria(data);

    const materiaResult = await crearMateria({
        nombre: data.nombre.trim(),
        tipo: data.tipo.trim(),
        creditos: Number(data.creditos),
        tieneContrasemestre: Boolean(data.tieneContrasemestre),
        requerimientosSalon: String(data.requerimientosSalon || "").trim() || null
    });

    const idMateria = Number(materiaResult?.lastInsertRowid || 0);
    if (idMateria > 0) {
      const filasCarreras = await construirFilasMateriaCarrera(
        idMateria,
        data.carrerasSemestre
      );
      reemplazarCarrerasMateria(idMateria, filasCarreras);
    }

    return materiaResult;
}

export async function obtenerMaterias() {
    return await listarMaterias();
}

export async function obtenerCarrerasPlanesPorMateriaNombre(nombreMateria) {
  const nombre = String(nombreMateria || "").trim();
  if (!nombre) {
    throw new Error("El nombre de la materia es obligatorio");
  }
  return await repoListarCarrerasPlanesPorMateriaNombre(nombre);
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
  const result = await repoActualizarMateria(id, {
    nombre: datos.nombre.trim(),
    tipo: datos.tipo.trim(),
    creditos: Number(datos.creditos),
    tieneContrasemestre: Boolean(datos.tieneContrasemestre),
    requerimientosSalon: String(datos.requerimientosSalon || "").trim() || null
  });

  const filasCarreras = await construirFilasMateriaCarrera(
    Number(id),
    datos.carrerasSemestre
  );
  reemplazarCarrerasMateria(Number(id), filasCarreras);

  return result;
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

/**
 * Convierte el objeto carrerasSemestre del front:
 * {
 *   "Ingenieria en Sistemas 2026": "1er s 1er año",
 *   "Ingenieria Electrica 2026": "2do s 3er año"
 * }
 * a filas para la tabla materia_carrera.
 */
async function construirFilasMateriaCarrera(idMateria, carrerasSemestre) {
  const safeMap = carrerasSemestre && typeof carrerasSemestre === "object"
    ? carrerasSemestre
    : {};

  const nombresCarreras = Object.keys(safeMap).map((item) => String(item || "").trim()).filter(Boolean);
  if (nombresCarreras.length === 0) return [];

  const carrerasDb = await listarCarrerasPorNombres(nombresCarreras);
  const carreraByNormalizedName = new Map(
    carrerasDb.map((item) => [normalizeKey(item.nombre), Number(item.id)])
  );

  const filas = [];
  for (const nombreCarrera of nombresCarreras) {
    const idCarrera = carreraByNormalizedName.get(normalizeKey(nombreCarrera));
    if (!idCarrera) continue;

    const semestreTexto = String(safeMap[nombreCarrera] || "").trim();
    const { semestre, anio } = parseSemestreTexto(semestreTexto);

    filas.push({
      idMateria,
      idCarrera,
      plan: inferirPlan(nombreCarrera),
      semestre,
      anio
    });
  }

  return filas;
}

function parseSemestreTexto(texto) {
  const value = String(texto || "").toLowerCase();
  const semestre = value.includes("2do") ? 2 : 1;

  const yearMatch = value.match(/([1-5])\s*(er|do|to)?\s*a/);
  const anio = yearMatch ? Number(yearMatch[1]) : 1;

  return {
    semestre,
    anio: anio >= 1 && anio <= 5 ? anio : 1
  };
}

function inferirPlan(nombreCarrera) {
  const value = String(nombreCarrera || "");
  const match = value.match(/plan\s*(\d{4})/i);
  if (match) return `Plan ${match[1]}`;
  return "Plan base";
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
