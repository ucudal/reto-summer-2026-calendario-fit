import { db } from '../../db/database.js';
import { carreras, materias }  from "../../db/drizzle/schema/base.js";
import { materiaCarrera } from "../../db/drizzle/schema/links.js";
import { asc, eq } from "drizzle-orm";

/**
 * Crear materia
 */
export function crearMateria(asignatura) {
  return db.insert(materias).values({
    tipo: asignatura.tipo,
    creditos: asignatura.creditos,
    nombre: asignatura.nombre,
    tieneContrasemestre: asignatura.tieneContrasemestre,
    requerimientosSalon: asignatura.requerimientosSalon
  }).run();
}

/**
 * Listar todos las materias
 */
export function listarMaterias() {
  return db.select({
    id: materias.id,
    tipo: materias.tipo,
    creditos: materias.creditos,
    nombre: materias.nombre,
    tieneContrasemestre: materias.tieneContrasemestre,
    requerimientosSalon: materias.requerimientosSalon
  })
  .from(materias)
  .orderBy(asc(materias.nombre))
  .all(); 
}

/**
 * Obtener materia por ID
 */
export function obtenerMateriaPorId(id) {
  return db.select({
    id: materias.id,
    tipo: materias.tipo,
    creditos: materias.creditos,
    nombre: materias.nombre,
    tieneContrasemestre: materias.tieneContrasemestre,
    requerimientosSalon: materias.requerimientosSalon
  })
  .from(materias)
  .where(eq(materias.id, id))
  .get();
}

/**
 * Actualizar materia
 */
export function actualizarMateria(id, datos) {
  return db.update(materias)
    .set({
      tipo: datos.tipo,
      creditos: datos.creditos,
      nombre: datos.nombre,
      tieneContrasemestre: datos.tieneContrasemestre,
      requerimientosSalon: datos.requerimientosSalon
    })
    .where(eq(materias.id, id))
    .run();
}

/**
 * Eliminar materia
 */
export function eliminarMateria(id) {
  return db.delete(materias)
    .where(eq(materias.id, id))
    .run();
}

/**
 * Lista combinaciones carrera-plan para una materia (por nombre).
 */
export function listarCarrerasPlanesPorMateriaNombre(nombreMateria) {
  const target = normalizeKey(nombreMateria);

  const rows = db.select({
    idCarrera: carreras.id,
    carreraNombre: carreras.nombre,
    plan: materiaCarrera.plan,
    semestre: materiaCarrera.semestre,
    anio: materiaCarrera.anio,
    materiaNombre: materias.nombre
  })
    .from(materiaCarrera)
    .innerJoin(materias, eq(materias.id, materiaCarrera.idMateria))
    .innerJoin(carreras, eq(carreras.id, materiaCarrera.idCarrera))
    .orderBy(asc(carreras.nombre), asc(materiaCarrera.plan))
    .all();

  return rows
    .filter((row) => normalizeKey(row.materiaNombre) === target)
    .map((row) => ({
      idCarrera: row.idCarrera,
      carreraNombre: row.carreraNombre,
      plan: row.plan,
      semestre: row.semestre,
      anio: row.anio
    }));
}

/**
 * Trae carreras por nombre para poder convertir "nombre" a "id".
 */
export function listarCarrerasPorNombres(nombres) {
  const cleanNames = Array.isArray(nombres)
    ? nombres.map((item) => normalizeKey(item)).filter(Boolean)
    : [];

  if (cleanNames.length === 0) return [];

  const rows = db.select({
    id: carreras.id,
    nombre: carreras.nombre
  })
    .from(carreras)
    .all();

  return rows.filter((row) => cleanNames.includes(normalizeKey(row.nombre)));
}

/**
 * Reemplaza todas las carreras/semestres de una materia.
 * Borra primero y vuelve a insertar.
 */
export function reemplazarCarrerasMateria(idMateria, nuevasFilas) {
  db.transaction((tx) => {
    tx.delete(materiaCarrera)
      .where(eq(materiaCarrera.idMateria, idMateria))
      .run();

    if (Array.isArray(nuevasFilas) && nuevasFilas.length > 0) {
      tx.insert(materiaCarrera).values(nuevasFilas).run();
    }
  });
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
