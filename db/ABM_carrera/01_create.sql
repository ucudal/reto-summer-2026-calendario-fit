PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS materia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    creditos INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    tiene_contrasemestre INTEGER NOT NULL DEFAULT 0  -- 0 = no, 1 = si
);


CREATE TABLE IF NOT EXISTS carrera (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS materia_carrera (
    id_materia INTEGER NOT NULL,
    id_carrera INTEGER NOT NULL,
    plan TEXT NOT NULL,
    semestre INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    PRIMARY KEY (id_materia, id_carrera, plan, semestre, anio),
    FOREIGN KEY (id_materia) REFERENCES materia(id),
    FOREIGN KEY (id_carrera) REFERENCES carrera(id)
);

CREATE TABLE IF NOT EXISTS grupo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo INTEGER NOT NULL,
    horas INTEGER NOT NULL,
    cupos INTEGER NOT NULL,
    id_materia INTEGER NOT NULL,
    FOREIGN KEY (id_materia) REFERENCES materia(id)
);


CREATE TABLE IF NOT EXISTS profesor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    correo TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS profesor_grupo (
    id_profesor INTEGER NOT NULL,
    id_grupo INTEGER NOT NULL,
    carga INTEGER NOT NULL,
    confirmado INTEGER NOT NULL,
    es_principal INTEGER NOT NULL,
    PRIMARY KEY (id_profesor, id_grupo),
    FOREIGN KEY (id_profesor) REFERENCES profesor(id),
    FOREIGN KEY (id_grupo) REFERENCES grupo(id)
);
