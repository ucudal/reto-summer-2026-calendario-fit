-- Garantiza 48 horarios base (6 dias x 8 modulos) sin depender de seed
WITH dias(dia) AS (
  VALUES
    ('Lunes'),
    ('Martes'),
    ('Miercoles'),
    ('Jueves'),
    ('Viernes'),
    ('Sabado')
),
modulos(modulo) AS (
  VALUES (1),(2),(3),(4),(5),(6),(7),(8)
)
INSERT OR IGNORE INTO horarios (modulo, dia)
SELECT m.modulo, d.dia
FROM dias d
CROSS JOIN modulos m;
