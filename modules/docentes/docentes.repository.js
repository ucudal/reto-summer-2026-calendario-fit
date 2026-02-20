import { db } from '../../db/database.js';
import { profesores }  from "../../db/drizzle/schema/base.js";
import { asc, eq } from "drizzle-orm";

/**
 * Crear docente
 */
export function crearDocente(docente) {
  return db.insert(profesores).values({
    nombre: docente.nombre,
    apellido: docente.apellido,
    correo: docente.correo
  }).run();
}


/**
 * Eliminar docente
 */
export function eliminarDocente(id) {
  return db.delete(profesores)
    .where(eq(profesores.id, id))
    .run();
}


/**
 * Modificar docente
 */
export function modificarDocente(id, datos) {
  return db.update(profesores)
    .set(datos)
    .where(eq(profesores.id, id))
    .run();
}


/**
 * Obtener docente por ID
 */
export function obtenerDocentePorId(id) {
  return db.select()
    .from(profesores)
    .where(eq(profesores.id, id))
    .get(); // Devuelve el primer resultado encontrado
}


/**
 * Listar todos los docentes
 */
export function listarDocentes() {
  return db.select({
    id: profesores.id,
    nombre: profesores.nombre,
    apellido: profesores.apellido,
    correo: profesores.correo
  })
  .from(profesores)
  .orderBy(asc(profesores.apellido), asc(profesores.nombre))
  .all(); // .all() es correcto para better-sqlite3
}
