-- Migracion custom para alinear tabla grupos con el schema actual.
-- Antes:
--   hora
--   es_contracorriente
-- Ahora:
--   horas_anuales
--   es_contrasemestre

ALTER TABLE grupos RENAME COLUMN hora TO horas_anuales;
--> statement-breakpoint
ALTER TABLE grupos RENAME COLUMN es_contracorriente TO es_contrasemestre;
