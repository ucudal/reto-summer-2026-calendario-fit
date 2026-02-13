// db/db.js
const path = require("path");
const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");

// Base en la carpeta del proyecto
const dbPath = path.join(__dirname, "..", "calendario.db");
console.log("DB PATH:", dbPath);

const sqlite = new Database(dbPath);

// Habilitar foreign keys
sqlite.pragma("foreign_keys = ON");

/* =========================
   CREACIÓN DE TABLAS
========================= */
sqlite.exec(`
CREATE TABLE IF NOT EXISTS materia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  creditos INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  tiene_contrasemestre INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS carrera (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profesor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  correo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS requerimiento_salon (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  caracteristicas TEXT
);

CREATE TABLE IF NOT EXISTS grupo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo INTEGER NOT NULL,
  cupos INTEGER NOT NULL,
  es_contrasemestre INTEGER NOT NULL DEFAULT 0,
  id_materia INTEGER NOT NULL,
  FOREIGN KEY (id_materia) REFERENCES materia(id)
);

CREATE TABLE IF NOT EXISTS horario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dia TEXT NOT NULL,
  modulo INTEGER NOT NULL,
  id_grupo INTEGER NOT NULL,
  FOREIGN KEY (id_grupo) REFERENCES grupo(id),
  UNIQUE (id_grupo, dia, modulo)
);

CREATE TABLE IF NOT EXISTS materia_req_salon (
  id_materia INTEGER NOT NULL,
  id_req_salon INTEGER NOT NULL,
  PRIMARY KEY (id_materia, id_req_salon),
  FOREIGN KEY (id_materia) REFERENCES materia(id),
  FOREIGN KEY (id_req_salon) REFERENCES requerimiento_salon(id)
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
`);

const db = drizzle(sqlite);

module.exports = { db };
