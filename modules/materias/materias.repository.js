import { db } from '../../db/database.js';
import { materia } from "../../db/schema.js"; 
import { asc } from "drizzle-orm";

/**
 * Crear materia
 */
export function crearMateria(asignatura) {
  return db.insert(materia).values({
    tipo: asignatura.tipo,
    creditos: asignatura.creditos,
    nombre: asignatura.nombre,
    tieneContrasemestre: asignatura.tieneContrasemestre
  }).run();
}

/**
 * Listar todos los docentes
 */
export function listarMaterias() {
  return db.select({
    id: materia.id,
    tipo: materia.tipo,
    creditos: materia.creditos,
    nombre: materia.nombre,
    tieneContrasemestre: materia.tieneContrasemestre
  })
  .from(materia)
  .orderBy(asc(profesor.nombre))
  .all(); 
}
