/*
  ARCHIVO: relations.js
  ---------------------
  Relaciones de Drizzle para poder hacer queries relacionales mas claras.

  Nota para principiantes:
  - Esto NO crea columnas nuevas.
  - Solo le explica a Drizzle como se conectan las tablas.
*/

import { relations } from "drizzle-orm";
import {
  carreras,
  materias,
  profesores,
  salones,
  horarios,
  requerimientosSalon,
  grupos
} from "./base.js";
import {
  materiaCarrera,
  grupoHorario,
  profesorGrupo,
  salonGrupo,
  salonRequerimientoSalon,
  grupoRequerimientoSalon
} from "./links.js";

export const gruposRelations = relations(grupos, ({ one, many }) => ({
  materia: one(materias, {
    fields: [grupos.idMateria],
    references: [materias.id]
  }),
  horarios: many(grupoHorario),
  profesores: many(profesorGrupo),
  salones: many(salonGrupo),
  requerimientos: many(grupoRequerimientoSalon)
}));

export const materiasRelations = relations(materias, ({ many }) => ({
  grupos: many(grupos),
  carreras: many(materiaCarrera)
}));

export const carrerasRelations = relations(carreras, ({ many }) => ({
  materias: many(materiaCarrera)
}));

export const profesoresRelations = relations(profesores, ({ many }) => ({
  grupos: many(profesorGrupo)
}));

export const salonesRelations = relations(salones, ({ many }) => ({
  grupos: many(salonGrupo),
  requerimientos: many(salonRequerimientoSalon)
}));

export const horariosRelations = relations(horarios, ({ many }) => ({
  grupos: many(grupoHorario)
}));

export const requerimientosSalonRelations = relations(requerimientosSalon, ({ many }) => ({
  grupos: many(grupoRequerimientoSalon),
  salones: many(salonRequerimientoSalon)
}));

