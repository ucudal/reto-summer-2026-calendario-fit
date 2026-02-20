import { db } from '../../db/database.js';
import { grupos }  from "../../db/drizzle/schema/base.js";
import { asc, eq } from "drizzle-orm";

export function crearGrupo(grupo) {
  return db.insert(grupos).values({
    codigo: grupo.codigo,
    idMateria: grupo.idMateria,
    horasSemestrales: grupo.horasSemestrales,
    esContrasemestre: grupo.esContrasemestre,
    cupo: grupo.cupo,
    semestre: grupo.semestre,
    anio: grupo.anio
  }).run();
};

export function eliminarGrupo(id) {
  return db.delete(grupos)
    .where(eq(grupos.id, id))
    .run();
};

export function modificarGrupo(id, datos) {
  return db.update(grupos)
    .set(datos)
    .where(eq(grupos.id, id))
    .run();
};

export function obtenerGrupoPorId(id) {
  return db.select()
    .from(grupos)
    .where(eq(grupos.id, id))
    .get(); 
};

export function listarGrupos() {
  return db.select({
    id: grupos.id,
    codigo: grupos.codigo,
    idMateria: grupos.idMateria,
    horasSemestrales: grupos.horasSemestrales,
    esContrasemestre: grupos.esContrasemestre,
    cupo: grupos.cupo,
    semestre: grupos.semestre,
    anio: grupos.anio
  })
  .from(grupos)
  .orderBy(asc(grupos.codigo))
  .all();
};