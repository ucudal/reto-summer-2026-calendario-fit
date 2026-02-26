import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/database.js";
import { carreras, grupos, horarios, materias, profesores } from "../../db/drizzle/schema/base.js";
import { grupoHorario, materiaCarrera, profesorGrupo } from "../../db/drizzle/schema/links.js";

export function crearGrupo(grupo) {
  return db
    .insert(grupos)
    .values({
      codigo: grupo.codigo,
      idMateria: grupo.idMateria,
      horasSemestrales: grupo.horasSemestrales,
      esContrasemestre: grupo.esContrasemestre,
      cupo: grupo.cupo,
      idSemestre: grupo.idSemestre,
      color: grupo.color
    })
    .run();
}

export function eliminarGrupo(id) {
  return db.delete(grupos).where(eq(grupos.id, id)).run();
}

export function modificarGrupo(id, datos) {
  return db.update(grupos).set(datos).where(eq(grupos.id, id)).run();
}

export function obtenerGrupoPorId(id) {
  return db.select().from(grupos).where(eq(grupos.id, id)).get();
}

export function listarGrupos() {
  // Trae grupos + materia + horario(s) para que el front pueda dibujar calendario.
  const rows = db
    .select({
      id: grupos.id,
      codigo: grupos.codigo,
      idMateria: grupos.idMateria,
      nombreMateria: materias.nombre,
      creditosMateria: materias.creditos,
      horasSemestrales: grupos.horasSemestrales,
      esContrasemestre: grupos.esContrasemestre,
      cupo: grupos.cupo,
      idSemestre: grupos.idSemestre,
      grupo: grupos.anio,
      dia: horarios.dia,
      modulo: horarios.modulo
    })
    .from(grupos)
    .leftJoin(materias, eq(materias.id, grupos.idMateria))
    .leftJoin(grupoHorario, eq(grupoHorario.idGrupo, grupos.id))
    .leftJoin(horarios, eq(horarios.id, grupoHorario.idHorario))
    .orderBy(asc(grupos.codigo))
    .all();

  const careerRows = db
    .select({
      idGrupo: grupos.id,
      carreraNombre: carreras.nombre
    })
    .from(grupos)
    .leftJoin(materiaCarrera, eq(materiaCarrera.idMateria, grupos.idMateria))
    .leftJoin(carreras, eq(carreras.id, materiaCarrera.idCarrera))
    .all();

  const careersByGroup = new Map();
  for (const row of careerRows) {
    const groupId = row.idGrupo;
    if (!careersByGroup.has(groupId)) careersByGroup.set(groupId, new Set());
    if (row.carreraNombre) careersByGroup.get(groupId).add(row.carreraNombre);
  }

  const teacherRows = db
    .select({
      idGrupo: profesorGrupo.idGrupo,
      nombre: profesores.nombre,
      apellido: profesores.apellido
    })
    .from(profesorGrupo)
    .leftJoin(profesores, eq(profesores.id, profesorGrupo.idProfesor))
    .all();

  const teachersByGroup = new Map();
  for (const row of teacherRows) {
    const groupId = row.idGrupo;
    if (!teachersByGroup.has(groupId)) teachersByGroup.set(groupId, new Set());
    const fullName = `${String(row.nombre || "").trim()} ${String(row.apellido || "").trim()}`.trim();
    if (fullName) teachersByGroup.get(groupId).add(fullName);
  }

  const byId = new Map();

  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        codigo: row.codigo,
        idMateria: row.idMateria,
        nombreMateria: row.nombreMateria,
        creditosMateria: row.creditosMateria,
        horasSemestrales: row.horasSemestrales,
        esContrasemestre: row.esContrasemestre,
        cupo: row.cupo,
        idSemestre: row.idSemestre,
        anio: row.anio,
        carreras: Array.from(careersByGroup.get(row.id) || []),
        docentes: Array.from(teachersByGroup.get(row.id) || []),
        horarios: []
      });
    }

    if (row.dia && row.modulo != null) {
      byId.get(row.id).horarios.push({
        dia: row.dia,
        modulo: row.modulo
      });
    }
  }

  return Array.from(byId.values());
}

export function asignarProfesor(data) {
  return db
    .insert(profesorGrupo)
    .values({
      idProfesor: data.idProfesor,
      idGrupo: data.idGrupo,
      carga: data.carga ?? "titular",
      confirmado: true,
      esPrincipal: data.esPrincipal
    })
    .run();
}

export function insertarHorarios(idGrupo, horariosPayload) {
  const inserted = [];

  for (const h of horariosPayload) {
    const horarioRow = db
      .select({ id: horarios.id })
      .from(horarios)
      .where(and(eq(horarios.modulo, h.modulo), eq(horarios.dia, h.dia)))
      .get();

    if (!horarioRow) continue;

    inserted.push(
      db
        .insert(grupoHorario)
        .values({
          idGrupo,
          idHorario: horarioRow.id
        })
        .run()
    );
  }

  return inserted;
}

