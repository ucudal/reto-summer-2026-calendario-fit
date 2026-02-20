-- Cantidad de docentes por carrera
SELECT
  c.id,
  c.nombre AS carrera,
  COUNT(DISTINCT p.id) AS cantidad_docentes
FROM carrera c
LEFT JOIN materia_carrera mc ON mc.id_carrera = c.id
LEFT JOIN grupo g ON g.id_materia = mc.id_materia
LEFT JOIN profesor_grupo pg ON pg.id_grupo = g.id
LEFT JOIN profesor p ON p.id = pg.id_profesor
GROUP BY c.id, c.nombre
ORDER BY c.nombre;

-- Listado de docentes de una carrera
SELECT DISTINCT
  p.nombre,
  p.apellido,
  p.correo
FROM profesor p
JOIN profesor_grupo pg ON pg.id_profesor = p.id
JOIN grupo g ON g.id = pg.id_grupo
JOIN materia_carrera mc ON mc.id_materia = g.id_materia
WHERE mc.id_carrera = ?
ORDER BY p.apellido, p.nombre;
