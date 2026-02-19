import { db } from '../../db/database.js';
import { materias }  from "../../db/drizzle/schema/base.js";
import { asc } from "drizzle-orm";

/**
 * Crear materia
 */
export function crearMateria(asignatura) {
  return db.insert(materias).values({
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
    id: materias.id,
    tipo: materias.tipo,
    creditos: materias.creditos,
    nombre: materias.nombre,
    tieneContrasemestre: materias.tieneContrasemestre
  })
  .from(materias)
  .orderBy(asc(materias.nombre))
  .all(); 
}
