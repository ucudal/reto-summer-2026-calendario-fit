/*
  ARCHIVO: relations.js
  ---------------------
  Relaciones de Drizzle para poder hacer queries relacionales mas claras.

  Nota para principiantes:
  - Esto NO crea columnas nuevas.
  - Solo le explica a Drizzle como se conectan las tablas.
*/

const { relations } = require("drizzle-orm");
const {
  carreras,
  materias,
  profesores,
  salones,
  horarios,
  requerimientosSalon,
  grupos
} = require("./base");
const {
  materiaCarrera,
  grupoHorario,
  profesorGrupo,
  salonGrupo,
  salonRequerimientoSalon,
  grupoRequerimientoSalon
} = require("./links");

const gruposRelations = relations(grupos, ({ one, many }) => ({
  materia: one(materias, {
    fields: [grupos.idMateria],
    references: [materias.id]
  }),
  horarios: many(grupoHorario),
  profesores: many(profesorGrupo),
  salones: many(salonGrupo),
  requerimientos: many(grupoRequerimientoSalon)
}));

const materiasRelations = relations(materias, ({ many }) => ({
  grupos: many(grupos),
  carreras: many(materiaCarrera)
}));

const carrerasRelations = relations(carreras, ({ many }) => ({
  materias: many(materiaCarrera)
}));

const profesoresRelations = relations(profesores, ({ many }) => ({
  grupos: many(profesorGrupo)
}));

const salonesRelations = relations(salones, ({ many }) => ({
  grupos: many(salonGrupo),
  requerimientos: many(salonRequerimientoSalon)
}));

const horariosRelations = relations(horarios, ({ many }) => ({
  grupos: many(grupoHorario)
}));

const requerimientosSalonRelations = relations(requerimientosSalon, ({ many }) => ({
  grupos: many(grupoRequerimientoSalon),
  salones: many(salonRequerimientoSalon)
}));

module.exports = {
  gruposRelations,
  materiasRelations,
  carrerasRelations,
  profesoresRelations,
  salonesRelations,
  horariosRelations,
  requerimientosSalonRelations
};
