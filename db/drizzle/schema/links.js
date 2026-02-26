/*
  ARCHIVO: links.js
  -----------------
  Este archivo tiene tablas "puente" (muchos-a-muchos).

  Regla mental simple:
  - Si una tabla tiene dos IDs y una primary key compuesta,
    probablemente sea una tabla puente.
*/

import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";
import {
  carreras,
  materias,
  profesores,
  salones,
  horarios,
  grupos
} from "./base.js";

// ------------------------------
// Tabla puente: materia_carrera
// ------------------------------
// Campos del pizarron:
// - id_materia
// - id_carrera
// - plan
// - semestre
// - anio
export const materiaCarrera = sqliteTable(
  "materia_carrera",
  {
    idMateria: integer("id_materia").notNull().references(() => materias.id, {
      onDelete: "cascade", //@todo que hacemos con esto?? Se elimina la materia se lleva a todos los grupos
      onUpdate: "cascade"
    }),
    idCarrera: integer("id_carrera").notNull().references(() => carreras.id, {
      onDelete: "cascade", //@todo lo mismo con esto?? Elimina la carrera porque algo paso pero elimina todos las materias
      onUpdate: "cascade"
    }),
    plan: text("plan").notNull(),
    semestre: integer("semestre").notNull(),
    anio: integer("anio").notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idMateria, table.idCarrera] })
  })
);

// // ------------------------------
// // Tabla puente: materia_salon
// // ------------------------------
// // Campos del pizarron:
// // - id_materia
// // - id_salon
// // - plan
// // - semestre
// // - anio
// const grupoSalon = sqliteTable(
//   "grupo_salon",
//   {
//     idMateria: integer("id_materia").notNull().references(() => materias.id, {
//       onDelete: "cascade",
//       onUpdate: "cascade"
//     }),
//     idSalon: integer("id_salon").notNull().references(() => salones.id, {
//       onDelete: "cascade",
//       onUpdate: "cascade"
//     }),
//     plan: text("plan").notNull(),
//     semestre: integer("semestre").notNull(),
//     anio: integer("anio").notNull()
//   },
//   (table) => ({
//     pk: primaryKey({ columns: [table.idMateria, table.idSalon] })
//   })
// );

// ------------------------------
// Tabla puente: grupo_horario
// ------------------------------
export const grupoHorario = sqliteTable(
  "grupo_horario",
  {
    idGrupo: integer("id_grupo").notNull().references(() => grupos.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
    idHorario: integer("id_horario").notNull().references(() => horarios.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idGrupo, table.idHorario] })
  })
);

// ------------------------------
// Tabla puente: profesor_grupo
// ------------------------------
// Campos extra del pizarron:
// - cargo
// - confirmado
// - es_principal
export const profesorGrupo = sqliteTable(
  "profesor_grupo",
  {
    idProfesor: integer("id_profesor").notNull().references(() => profesores.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
    idGrupo: integer("id_grupo").notNull().references(() => grupos.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
    carga: text("carga"),
    confirmado: integer("confirmado", { mode: "boolean" }).notNull().default(false),
    esPrincipal: integer("es_principal", { mode: "boolean" }).notNull().default(false)
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idProfesor, table.idGrupo] })
  })
);

// ------------------------------
// Tabla puente: salon_grupo
// ------------------------------
export const salonGrupo = sqliteTable(
  "salon_grupo",
  {
    idSalon: integer("id_salon").notNull().references(() => salones.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
    idGrupo: integer("id_grupo").notNull().references(() => grupos.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idSalon, table.idGrupo] })
  })
);

// ------------------------------
// Tabla puente: salon_requerimiento_salon
// ------------------------------
/* export const salonRequerimientoSalon = sqliteTable(
  "salon_requerimiento_salon",
  {
    idSalon: integer("id_salon").notNull().references(() => salones.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
    idRequerimientoSalon: integer("id_requerimiento_salon").notNull().references(
      () => requerimientosSalon.id,
      {
        onDelete: "cascade",
        onUpdate: "cascade"
      }
    )
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idSalon, table.idRequerimientoSalon] })
  })
); */

// ------------------------------
// Tabla puente: grupo_requerimiento_salon
// ------------------------------
/* export const grupoRequerimientoSalon = sqliteTable(
  "grupo_requerimiento_salon",
  {
    idGrupo: integer("id_grupo").notNull().references(() => grupos.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
    idRequerimientoSalon: integer("id_requerimiento_salon").notNull().references(
      () => requerimientosSalon.id,
      {
        onDelete: "cascade",
        onUpdate: "cascade"
      }
    )
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idGrupo, table.idRequerimientoSalon] })
  })
); */