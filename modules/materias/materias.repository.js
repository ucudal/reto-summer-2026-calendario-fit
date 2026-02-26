import { db } from '../../db/database.js';
import { materias }  from "../../db/drizzle/schema/base.js";
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
      requerimientosSalon: materias.requerimientosSalon
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