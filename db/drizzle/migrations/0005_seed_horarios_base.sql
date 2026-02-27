-- Catalogo base de horarios (idempotente)
-- Objetivo: que en una DB nueva crear grupos funcione sin depender de seed.

CREATE UNIQUE INDEX IF NOT EXISTS horarios_dia_modulo_unique
ON horarios (dia, modulo);

INSERT OR IGNORE INTO horarios (modulo, dia) VALUES
  (1, 'Lunes'), (2, 'Lunes'), (3, 'Lunes'), (4, 'Lunes'), (5, 'Lunes'), (6, 'Lunes'), (7, 'Lunes'), (8, 'Lunes'),
  (1, 'Martes'), (2, 'Martes'), (3, 'Martes'), (4, 'Martes'), (5, 'Martes'), (6, 'Martes'), (7, 'Martes'), (8, 'Martes'),
  (1, 'Miercoles'), (2, 'Miercoles'), (3, 'Miercoles'), (4, 'Miercoles'), (5, 'Miercoles'), (6, 'Miercoles'), (7, 'Miercoles'), (8, 'Miercoles'),
  (1, 'Jueves'), (2, 'Jueves'), (3, 'Jueves'), (4, 'Jueves'), (5, 'Jueves'), (6, 'Jueves'), (7, 'Jueves'), (8, 'Jueves'),
  (1, 'Viernes'), (2, 'Viernes'), (3, 'Viernes'), (4, 'Viernes'), (5, 'Viernes'), (6, 'Viernes'), (7, 'Viernes'), (8, 'Viernes'),
  (1, 'Sabado'), (2, 'Sabado'), (3, 'Sabado'), (4, 'Sabado'), (5, 'Sabado'), (6, 'Sabado'), (7, 'Sabado'), (8, 'Sabado');
