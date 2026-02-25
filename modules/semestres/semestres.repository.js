import { sqlite } from "../../db/database.js";

function ensureTable() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS semestres_lectivos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      es_en_blanco INTEGER NOT NULL DEFAULT 0,
      origen_nombre TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export function crearSemestreLectivoRepo(payload) {
  ensureTable();

  const stmt = sqlite.prepare(`
    INSERT INTO semestres_lectivos (nombre, es_en_blanco, origen_nombre)
    VALUES (?, ?, ?)
  `);

  return stmt.run(
    payload.nombre,
    payload.esEnBlanco ? 1 : 0,
    payload.origenNombre || null
  );
}

export function listarSemestresLectivosRepo() {
  ensureTable();

  const stmt = sqlite.prepare(`
    SELECT id, nombre, es_en_blanco AS esEnBlanco, origen_nombre AS origenNombre, created_at AS createdAt
    FROM semestres_lectivos
    ORDER BY id ASC
  `);

  return stmt.all();
}
