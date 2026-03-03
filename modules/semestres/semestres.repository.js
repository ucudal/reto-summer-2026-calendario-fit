import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/database.js";
import { semestres } from "../../db/drizzle/schema/base.js";

export function listarSemestresLectivos() {
  return db
    .select({
      id: semestres.id,
      numeroSemestre: semestres.numeroSemestre,
      anio: semestres.anio
    })
    .from(semestres)
    .orderBy(asc(semestres.anio), asc(semestres.numeroSemestre))
    .all();
}

export function obtenerSemestrePorNumeroYAnio(numeroSemestre, anio) {
  return db
    .select({
      id: semestres.id,
      numeroSemestre: semestres.numeroSemestre,
      anio: semestres.anio
    })
    .from(semestres)
    .where(
      and(
        eq(semestres.numeroSemestre, Number(numeroSemestre)),
        eq(semestres.anio, Number(anio))
      )
    )
    .get();
}

export function crearSemestreLectivo(numeroSemestre, anio) {
  return db
    .insert(semestres)
    .values({
      numeroSemestre: Number(numeroSemestre),
      anio: Number(anio)
    })
    .run();
}
