import { db } from '../../db/database.js';
import { carrera } from '../../db/schema.js';
import { asc, eq } from 'drizzle-orm';

export function crearCarrera(data) {
  return db.insert(carrera).values({
    nombre: data.nombre
  }).run();
}

export function modificarCarrera(id, data) {
  return db.update(carrera)
    .set(data)
    .where(eq(carrera.id, id))
    .run();
}

export function eliminarCarrera(id) {
  return db.delete(carrera)
    .where(eq(carrera.id, id))
    .run();
}

export function obtenerCarreraPorId(id) {
  return db.select()
    .from(carrera)
    .where(eq(carrera.id, id))
    .get();
}

export function listarCarreras() {
  return db.select({
    id: carrera.id,
    nombre: carrera.nombre
  })
  .from(carrera)
  .orderBy(asc(carrera.nombre))
  .all();
}
