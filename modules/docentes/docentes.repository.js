import { db } from '../../db/database.js';
import { profesor } from "../../db/schema.js"; 
import { asc, eq } from "drizzle-orm";

/**
 * Crear docente
 */
export function crearDocente(docente) {
  return db.insert(profesor).values({
    nombre: docente.nombre,
    apellido: docente.apellido,
    correo: docente.correo
  }).run();
}


/**
 * Eliminar docente
 */
export function eliminarDocente(id) {
  return db.delete(profesor)
    .where(eq(profesor.id, id))
    .run();
}


/**
 * Modificar docente
 */
export function modificarDocente(id, datos) {
  return db.update(profesor)
    .set(datos)
    .where(eq(profesor.id, id))
    .run();
}


/**
 * Obtener docente por ID
 */
export function obtenerDocentePorId(id) {
  return db.select()
    .from(profesor)
    .where(eq(profesor.id, id))
    .get(); // Devuelve el primer resultado encontrado
}


/**
 * Listar todos los docentes
 */
export function listarDocentes() {
  return db.select({
    id: profesor.id,
    nombre: profesor.nombre,
    apellido: profesor.apellido,
    correo: profesor.correo
  })
  .from(profesor)
  .orderBy(asc(profesor.apellido), asc(profesor.nombre))
  .all(); // .all() es correcto para better-sqlite3
}
