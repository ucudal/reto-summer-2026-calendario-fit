import { db } from '../../db/database.js';
import { carreras } from "../../db/drizzle/schema/base.js";
import { asc, eq } from 'drizzle-orm';

export function crearCarrera(data) {
  return db.insert(carreras).values({
    nombre: data.nombre
  }).run();
}

export function modificarCarrera(id, data) {
  return db.update(carreras)
    .set(data)
    .where(eq(carreras.id, id))
    .run();
}

export function eliminarCarrera(id) {
  return db.delete(carreras)
    .where(eq(carreras.id, id))
    .run();
}

export function obtenerCarreraPorId(id) {
  return db.select()
    .from(carreras)
    .where(eq(carreras.id, id))
    .get();
}

export function listarCarreras() {
  return db.select({
    id: carreras.id,
    nombre: carreras.nombre
  })
  .from(carreras)
  .orderBy(asc(carreras.nombre))
  .all();
}
