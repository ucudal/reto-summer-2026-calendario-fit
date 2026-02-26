import { db } from "./database.js";
import {
  carreras,
  profesores,
  materias,
  salones,
  horarios,
  requerimientosSalon,
  grupos
} from "./drizzle/schema/base.js";
import {
  materiaCarrera,
  grupoHorario,
  profesorGrupo,
  salonGrupo,
  salonRequerimientoSalon,
  grupoRequerimientoSalon
} from "./drizzle/schema/links.js";

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const MODULOS = [1, 2, 3, 4, 5, 6, 7, 8];

const CARRERAS = [
  "Ingenieria Informatica",
  "Ingenieria en Sistemas",
  "Ingenieria Industrial",
  "Ingenieria Electrica",
  "Ingenieria Mecanica",
  "Ingenieria Civil",
  "Ingenieria Quimica",
  "Ingenieria en Alimentos",
  "Ingenieria Biomedica",
  "Ingenieria en Datos"
];

const MATERIAS = [
  { nombre: "Programacion 1", tipo: "Obligatoria", creditos: 8, tieneContrasemestre: false },
  { nombre: "Programacion 2", tipo: "Obligatoria", creditos: 8, tieneContrasemestre: false },
  { nombre: "Estructuras de Datos", tipo: "Obligatoria", creditos: 8, tieneContrasemestre: false },
  { nombre: "Base de Datos", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: true },
  { nombre: "Sistemas Operativos", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: false },
  { nombre: "Arquitectura", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: false },
  { nombre: "Algebra", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: false },
  { nombre: "Calculo 1", tipo: "Obligatoria", creditos: 8, tieneContrasemestre: false },
  { nombre: "Calculo 2", tipo: "Obligatoria", creditos: 8, tieneContrasemestre: true },
  { nombre: "Fisica 1", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: false },
  { nombre: "Fisica 2", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: true },
  { nombre: "Probabilidad", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: false },
  { nombre: "Estadistica", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: false },
  { nombre: "Redes", tipo: "Obligatoria", creditos: 6, tieneContrasemestre: false },
  { nombre: "Ingenieria de Software", tipo: "Obligatoria", creditos: 8, tieneContrasemestre: false },
  { nombre: "Inteligencia Artificial", tipo: "Optativa", creditos: 6, tieneContrasemestre: false },
  { nombre: "Machine Learning", tipo: "Optativa", creditos: 6, tieneContrasemestre: false },
  { nombre: "Gestion de Proyectos", tipo: "Obligatoria", creditos: 4, tieneContrasemestre: false }
];

const PROFESORES = [
  ["Angel", "Mamberto"],
  ["Javier", "Yannone"],
  ["Maria", "Gonzalez"],
  ["Carlos", "Rodriguez"],
  ["Ana", "Martinez"],
  ["Pedro", "Sanchez"],
  ["Laura", "Fernandez"],
  ["Diego", "Lopez"],
  ["Camila", "Perez"],
  ["Martin", "Torres"],
  ["Lucia", "Suarez"],
  ["Nicolas", "Acosta"],
  ["Sofia", "Nuñez"],
  ["Pablo", "Cabrera"],
  ["Valentina", "Sosa"],
  ["Gonzalo", "Rey"],
  ["Micaela", "Silvera"],
  ["Bruno", "Techera"],
  ["Julieta", "Olivera"],
  ["Federico", "Vazquez"],
  ["Paula", "Silva"],
  ["Rodrigo", "Ferrer"],
  ["Agustina", "Correa"],
  ["Sebastian", "Mendez"]
];

const SALONES = [
  ["A101", "Central", 40],
  ["A102", "Central", 35],
  ["A201", "Central", 70],
  ["A202", "Central", 80],
  ["B101", "Mullin", 45],
  ["B102", "Mullin", 30],
  ["B201", "Mullin", 60],
  ["C101", "San Jose", 28],
  ["C102", "San Jose", 40],
  ["Lab 1", "Laboratorio", 26],
  ["Lab 2", "Laboratorio", 24],
  ["Lab 3", "Laboratorio", 22],
  ["Auditorio 1", "Central", 180],
  ["Auditorio 2", "Mullin", 140],
  ["D301", "Anexo", 55]
];

const REQUERIMIENTOS = [
  "Proyector",
  "Pizarron",
  "PC docente",
  "Audio",
  "Aire acondicionado",
  "Laboratorio",
  "Mesas moviles",
  "Accesibilidad",
  "Red cableada",
  "Wifi reforzado"
];

function toSlug(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

async function clearAllTables() {
  // Primero tablas puente (por foreign keys), luego principales.
  await db.delete(grupoRequerimientoSalon).run();
  await db.delete(salonRequerimientoSalon).run();
  await db.delete(salonGrupo).run();
  await db.delete(profesorGrupo).run();
  await db.delete(grupoHorario).run();
  await db.delete(materiaCarrera).run();

  await db.delete(grupos).run();
  await db.delete(horarios).run();
  await db.delete(requerimientosSalon).run();
  await db.delete(salones).run();
  await db.delete(profesores).run();
  await db.delete(materias).run();
  await db.delete(carreras).run();
}

async function insertBaseTables() {
  await db.insert(carreras).values(CARRERAS.map((nombre) => ({ nombre }))).run();

  await db.insert(materias).values(MATERIAS).run();

  await db.insert(profesores).values(
    PROFESORES.map(([nombre, apellido]) => ({
      nombre,
      apellido,
      correo: `${toSlug(nombre)}.${toSlug(apellido)}@ucu.edu.uy`
    }))
  ).run();

  await db.insert(salones).values(
    SALONES.map(([nombre, edificio, aforo]) => ({ nombre, edificio, aforo }))
  ).run();

  const horariosRows = [];
  for (const dia of DIAS) {
    for (const modulo of MODULOS) {
      horariosRows.push({ dia, modulo });
    }
  }
  await db.insert(horarios).values(horariosRows).run();

  await db.insert(requerimientosSalon).values(
    REQUERIMIENTOS.map((caracteristicas) => ({ caracteristicas }))
  ).run();
}

async function insertLinksAndGroups() {
  const carrerasRows = await db.select().from(carreras).all();
  const materiasRows = await db.select().from(materias).all();
  const profesoresRows = await db.select().from(profesores).all();
  const salonesRows = await db.select().from(salones).all();
  const horariosRows = await db.select().from(horarios).all();
  const reqRows = await db.select().from(requerimientosSalon).all();

  // materia_carrera (cada materia en 3 carreras distintas)
  const materiaCarreraRows = [];
  materiasRows.forEach((m, i) => {
    const carreraIndexes = [i % carrerasRows.length, (i + 2) % carrerasRows.length, (i + 5) % carrerasRows.length];
    carreraIndexes.forEach((idx, turn) => {
      materiaCarreraRows.push({
        idMateria: m.id,
        idCarrera: carrerasRows[idx].id,
        plan: turn % 2 === 0 ? "2021" : "2026",
        semestre: (i % 2) + 1,
        anio: (i % 3) + 1
      });
    });
  });

  // evitar duplicados por PK compuesta (idMateria,idCarrera)
  const uniqueMateriaCarrera = [];
  const seenMC = new Set();
  for (const row of materiaCarreraRows) {
    const key = `${row.idMateria}-${row.idCarrera}`;
    if (seenMC.has(key)) continue;
    seenMC.add(key);
    uniqueMateriaCarrera.push(row);
  }
  await db.insert(materiaCarrera).values(uniqueMateriaCarrera).run();

  // grupos (3 por materia => 54 grupos aprox)
  const gruposRows = [];
  materiasRows.forEach((m, i) => {
    for (let g = 1; g <= 3; g += 1) {
      gruposRows.push({
        codigo: `${toSlug(m.nombre).slice(0, 5).toUpperCase()}-${g}${i + 1}`,
        idMateria: m.id,
        horasSemestrales: String(64 + ((i + g) % 4) * 16),
        esContrasemestre: Boolean(m.tieneContrasemestre && g === 3),
        cupo: 20 + ((i + g) % 7) * 5,
        semestre: (i % 2) + 1,
        anio: (i % 3) + 1
      });
    }
  });
  await db.insert(grupos).values(gruposRows).run();

  const gruposRowsInserted = await db.select().from(grupos).all();

  // grupo_horario (1 o 2 horarios por grupo)
  const grupoHorarioRows = [];
  gruposRowsInserted.forEach((grupo, i) => {
    const slot1 = horariosRows[i % horariosRows.length];
    const slot2 = horariosRows[(i * 3 + 7) % horariosRows.length];

    grupoHorarioRows.push({ idGrupo: grupo.id, idHorario: slot1.id });
    if (i % 3 !== 0 && slot1.id !== slot2.id) {
      grupoHorarioRows.push({ idGrupo: grupo.id, idHorario: slot2.id });
    }
  });
  await db.insert(grupoHorario).values(grupoHorarioRows).run();

  // profesor_grupo (1 principal + 0/1 apoyo)
  const profesorGrupoRows = [];
  gruposRowsInserted.forEach((grupo, i) => {
    const p1 = profesoresRows[i % profesoresRows.length];
    const p2 = profesoresRows[(i + 9) % profesoresRows.length];

    profesorGrupoRows.push({
      idProfesor: p1.id,
      idGrupo: grupo.id,
      carga: "Titular",
      confirmado: true,
      esPrincipal: true
    });

    if (i % 2 === 0 && p1.id !== p2.id) {
      profesorGrupoRows.push({
        idProfesor: p2.id,
        idGrupo: grupo.id,
        carga: "Ayudante",
        confirmado: i % 4 !== 0,
        esPrincipal: false
      });
    }
  });
  await db.insert(profesorGrupo).values(profesorGrupoRows).run();

  // salon_grupo (siempre 1, y a veces 2)
  const salonGrupoRows = [];
  gruposRowsInserted.forEach((grupo, i) => {
    const s1 = salonesRows[i % salonesRows.length];
    const s2 = salonesRows[(i + 4) % salonesRows.length];

    salonGrupoRows.push({ idSalon: s1.id, idGrupo: grupo.id });
    if (i % 5 === 0 && s1.id !== s2.id) {
      salonGrupoRows.push({ idSalon: s2.id, idGrupo: grupo.id });
    }
  });
  await db.insert(salonGrupo).values(salonGrupoRows).run();

  // salon_requerimiento_salon (2 requerimientos por salon)
  const salonReqRows = [];
  salonesRows.forEach((salon, i) => {
    const r1 = reqRows[i % reqRows.length];
    const r2 = reqRows[(i + 3) % reqRows.length];
    salonReqRows.push({ idSalon: salon.id, idRequerimientoSalon: r1.id });
    if (r1.id !== r2.id) {
      salonReqRows.push({ idSalon: salon.id, idRequerimientoSalon: r2.id });
    }
  });
  await db.insert(salonRequerimientoSalon).values(salonReqRows).run();

  // grupo_requerimiento_salon (1 o 2 requerimientos por grupo)
  const grupoReqRows = [];
  gruposRowsInserted.forEach((grupo, i) => {
    const r1 = reqRows[(i + 1) % reqRows.length];
    const r2 = reqRows[(i + 5) % reqRows.length];
    grupoReqRows.push({ idGrupo: grupo.id, idRequerimientoSalon: r1.id });
    if (i % 3 === 0 && r1.id !== r2.id) {
      grupoReqRows.push({ idGrupo: grupo.id, idRequerimientoSalon: r2.id });
    }
  });
  await db.insert(grupoRequerimientoSalon).values(grupoReqRows).run();
}

export async function seedDatabase() {
  console.log("Seeding base de datos (modo completo)...");
  await clearAllTables();
  await insertBaseTables();
  await insertLinksAndGroups();
  console.log("Seed completo finalizado.");
}

export async function reseedDatabase() {
  await seedDatabase();
}
