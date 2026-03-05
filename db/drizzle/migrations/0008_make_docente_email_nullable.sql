-- Hace opcional el correo de docentes (profesores.correo nullable).
-- Preserva IDs y datos existentes, manteniendo índice único en correo.

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS __new_profesores (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  correo TEXT
);

INSERT INTO __new_profesores (id, nombre, apellido, correo)
SELECT
  id,
  nombre,
  apellido,
  CASE
    WHEN trim(COALESCE(correo, '')) = '' THEN NULL
    ELSE correo
  END AS correo
FROM profesores;

DROP TABLE profesores;
ALTER TABLE __new_profesores RENAME TO profesores;

CREATE UNIQUE INDEX IF NOT EXISTS profesores_correo_unico_idx ON profesores (correo);

PRAGMA foreign_keys = ON;
