import { initDb } from '../../db/database.js';

let db = initDb();
/**
 * Crear docente
 */
export function crearDocente(data) {
  return db.prepare(`
    INSERT INTO docentes (nombre, apellido, email)
    VALUES (?, ?, ?)
  `).run(data.nombre, data.apellido, data.email);
}


/**
 * Eliminar docente
 */
export function eliminarDocente(id) {
  return db.prepare(`
    DELETE FROM docentes
    WHERE id = ?
  `).run(id);
}


/**
 * Modificar docente
 */
export function modificarDocente(data) {
  return db.prepare(`
    UPDATE docentes
    SET nombre = ?, apellido = ?, email = ?
    WHERE id = ?
  `).run(
    data.nombre,
    data.apellido,
    data.email,
    data.id
  );
}


/**
 * Obtener docente por ID
 */
export function obtenerDocentePorId(id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, nombre, apellido, email FROM docentes WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}


/**
 * Listar todos los docentes
 */
export function listarDocentes() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT id, nombre, apellido, email
      FROM docentes
      ORDER BY apellido ASC, nombre ASC
      `,
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}
