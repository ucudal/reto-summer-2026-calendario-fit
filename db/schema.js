// db/schema.js
const {
  sqliteTable,
  integer,
  text,
  primaryKey,
} = require("drizzle-orm/sqlite-core");

// Materia

const materia = sqliteTable("materia", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tipo: text("tipo").notNull(),
  creditos: integer("creditos").notNull(),
  nombre: text("nombre").notNull(),
  tieneContrasemestre: integer("tiene_contrasemestre")
    .notNull()
    .default(0), // 0 = false, 1 = true
});

// Carrera

const carrera = sqliteTable("carrera", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
});

// Grupo

const grupo = sqliteTable("grupo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigo: integer("codigo").notNull(),
  cupos: integer("cupos").notNull(),
  esContrasemestre: integer("es_contrasemestre")
    .notNull()
    .default(0),

  idMateria: integer("id_materia")
    .notNull()
    .references(() => materia.id),
});

// Horario

const horario = sqliteTable(
  "horario",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dia: text("dia").notNull(),          
    modulo: integer("modulo").notNull(), // 1,2,3,4...

    idGrupo: integer("id_grupo")
      .notNull()
      .references(() => grupo.id),
  },
  (table) => ({
    uniqueHorario: primaryKey({
      columns: [table.idGrupo, table.dia, table.modulo],
    }),
  })
);

// Profesor

const profesor = sqliteTable("profesor", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  correo: text("correo").notNull(),
});

// Requerimiento Salon

const requerimientoSalon = sqliteTable("requerimiento_salon", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  caracteristicas: text("caracteristicas"),
});

// Materia <-> Requerimiento Salon

const materiaReqSalon = sqliteTable(
  "materia_req_salon",
  {
    idMateria: integer("id_materia")
      .notNull()
      .references(() => materia.id),
    idReqSalon: integer("id_req_salon")
      .notNull()
      .references(() => requerimientoSalon.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idMateria, table.idReqSalon] }),
  })
);

// Profesor <-> Grupo

const profesorGrupo = sqliteTable(
  "profesor_grupo",
  {
    idProfesor: integer("id_profesor")
      .notNull()
      .references(() => profesor.id),
    idGrupo: integer("id_grupo")
      .notNull()
      .references(() => grupo.id),

    carga: integer("carga").notNull(),
    confirmado: integer("confirmado").notNull(),
    esPrincipal: integer("es_principal").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.idProfesor, table.idGrupo] }),
  })
);

module.exports = {
  materia,
  carrera,
  grupo,
  horario,
  profesor,
  requerimientoSalon,
  materiaReqSalon,
  profesorGrupo,
};
