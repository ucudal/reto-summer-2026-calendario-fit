import { db } from '../../db/database.js';
import { semestre }  from "../../db/drizzle/schema/base.js";
import { asc } from "drizzle-orm";

export function listarSemestres() {
  return db.select({
    id: semestre.id,
    numeroSem: semestre.numeroSem,
    anio: semestre.anio
  })
  .from(semestre)
  .orderBy(asc(semestre.anio), asc(semestre.numeroSem))
  .all();
}