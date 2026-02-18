/*
  ARCHIVO: base.js
  ----------------
  Este archivo tiene las tablas "principales" del sistema.

  Idea para principiantes:
  - Cada tabla representa una entidad real (Materia, Profesor, Salon, etc).
  - Las relaciones complejas (muchos-a-muchos) NO van aca, van en links.js.
*/

import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// ------------------------------
// Tabla: carreras
// ------------------------------
export const carreras = sqliteTable(
    "carreras",
    {
        id: integer("id").primaryKey({autoIncrement: true}),
        nombre: text("nombre").notNull()
    },
    (table) => ({
        nombreUnicoIdx: uniqueIndex("carreras_nombre_unico_idx").on(table.nombre)
    })
);

// ------------------------------
// Tabla: materias
// ------------------------------
// Campos del pizarron:
// - id
// - tipo
// - creditos
// - nombre
// - tiene contrasemestre ???
export const materias = sqliteTable(
    "materias",
    {
        id: integer("id").primaryKey({autoIncrement: true}),
        tipo: text("tipo").notNull(),
        creditos: integer("creditos").notNull(),
        nombre: text("nombre").notNull(),
        tieneContrasemestre: integer("tiene_correlativa", {mode: "boolean"}).notNull().default(false) //@todo esto quedaba al final?
    },
    (table) => ({
        nombreUnicoIdx: uniqueIndex("materias_nombre_unico_idx").on(table.nombre)
    })
);

// ------------------------------
// Tabla: profesores
// ------------------------------
// Campos del pizarron:
// - id
// - nom
// - ape
// - correo
// - disponibilidad
export const profesores = sqliteTable(
    "profesores",
    {
        id: integer("id").primaryKey({autoIncrement: true}),
        nombre: text("nombre").notNull(),
        apellido: text("apellido").notNull(),
        correo: text("correo").notNull(),
        // disponibilidad: text("disponibilidad") //puede aportar algo en el futuro
    },
    (table) => ({
        correoUnicoIdx: uniqueIndex("profesores_correo_unico_idx").on(table.correo)
    })
);

// ------------------------------
// Tabla: salones
// ------------------------------
// - id
// - nom
// - edificio
// - aforo
export const salones = sqliteTable("salones", {
    id: integer("id").primaryKey({autoIncrement: true}),
    nombre: text("nombre").notNull(),
    edificio: text("edificio").notNull(),
    aforo: integer("aforo").notNull()
});

// ------------------------------
// Tabla: horarios
// ------------------------------
// - id
// - hora_desde
// - hora_hasta
// - dia
// - modulo
export const horarios = sqliteTable("horarios", {
    id: integer("id").primaryKey({autoIncrement: true}),
    modulo: integer("modulo").notNull(), //@todo y esto?
    dia: text("dia").notNull(),

});

// ------------------------------
// Tabla: requerimientos_salon //@todo me parece raro
// ------------------------------
// - id
// - caracteristicas
export const requerimientosSalon = sqliteTable("requerimientos_salon", {
    id: integer("id").primaryKey({autoIncrement: true}),
    caracteristicas: text("caracteristicas").notNull()
});

// ------------------------------
// Tabla: grupos
// ------------------------------
// - id
// - codigo
// - id_materia
// - es contrasemestre
//@todo de aca saque modulo, entiendo que no tiene sentido
export const grupos = sqliteTable(
    "grupos",
    {
        id: integer("id").primaryKey({autoIncrement: true}),
        codigo: text("codigo").notNull(),
        idMateria: integer("id_materia").notNull().references(() => materias.id, {
            onDelete: "restrict", //@todo restrict esta bien?
            onUpdate: "cascade"
        }),
        horasSemestrales: text("horas_anuales"), //@todo es text o integer o bool?
        esContrasemestre: integer("es_contrasemestre", {mode: "boolean"}).notNull().default(false), //aporta para decir que se esta dictando contrasemestre
        cupo: integer("cupo")
    },
    (table) => ({
        codigoUnicoIdx: uniqueIndex("grupos_codigo_unico_idx").on(table.codigo)
    })
);

