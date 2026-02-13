PRAGMA foreign_keys = ON;


INSERT INTO carrera (nombre) VALUES ('Ingeniería en Sistemas');
INSERT INTO carrera (nombre) VALUES ('Licenciatura en Datos');


INSERT INTO materia (tipo, creditos, nombre, tiene_contrasemestre)
VALUES ('Obligatoria', 10, 'Programación 1', 0);

INSERT INTO materia (tipo, creditos, nombre, tiene_contrasemestre)
VALUES ('Obligatoria', 8, 'Bases de Datos', 0);

INSERT INTO materia (tipo, creditos, nombre, tiene_contrasemestre)
VALUES ('Electiva', 6, 'Matematica 01', 1);


INSERT INTO materia_carrera VALUES (1, 1, '2026', 2, 2026);
INSERT INTO materia_carrera VALUES (2, 1, '2026', 2, 2026);
INSERT INTO materia_carrera VALUES (1, 2, '2026', 2, 2026);
INSERT INTO materia_carrera VALUES (3, 2, '2026', 2, 2026);


INSERT INTO grupo (codigo, horas, cupos, id_materia)
VALUES (101, 4, 60, 1);

INSERT INTO grupo (codigo, horas, cupos, id_materia)
VALUES (102, 4, 50, 2);

INSERT INTO grupo (codigo, horas, cupos, id_materia)
VALUES (201, 3, 40, 3);


INSERT INTO profesor (nombre, apellido, correo)
VALUES ('Ana', 'Pérez', 'ana@ucu.edu');

INSERT INTO profesor (nombre, apellido, correo)
VALUES ('Juan', 'Gómez', 'juan@ucu.edu');

INSERT INTO profesor (nombre, apellido, correo)
VALUES ('María', 'Rodríguez', 'maria@ucu.edu');

INSERT INTO profesor_grupo VALUES (1, 1, 4, 1, 1);
INSERT INTO profesor_grupo VALUES (2, 2, 4, 1, 1);
INSERT INTO profesor_grupo VALUES (3, 3, 3, 1, 1);
