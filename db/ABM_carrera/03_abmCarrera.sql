-- Crear
INSERT INTO carrera (nombre) VALUES (?);

-- Listar
SELECT id, nombre FROM carrera ORDER BY nombre;

-- Editar
UPDATE carrera SET nombre = ? WHERE id = ?;

-- Eliminar
DELETE FROM carrera WHERE id = ?;
