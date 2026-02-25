import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/database.js";
import { grupos, horarios, materias } from "../../db/drizzle/schema/base.js";
import { grupoHorario, grupoRequerimientoSalon, profesorGrupo } from "../../db/drizzle/schema/links.js";

export function crearGrupo(grupo) {
  return db
    .insert(grupos)
    .values({
      codigo: grupo.codigo,
      idMateria: grupo.idMateria,
      horasSemestrales: grupo.horasSemestrales,
      esContrasemestre: grupo.esContrasemestre,
      cupo: grupo.cupo,
      semestre: grupo.semestre,
      anio: grupo.anio
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
      horasSemestrales: grupos.horasSemestrales,
      esContrasemestre: grupos.esContrasemestre,
      cupo: grupos.cupo,
      semestre: grupos.semestre,
      anio: grupos.anio,
      dia: horarios.dia,
      modulo: horarios.modulo
    })
    .from(grupos)
    .leftJoin(materias, eq(materias.id, grupos.idMateria))
    .leftJoin(grupoHorario, eq(grupoHorario.idGrupo, grupos.id))
    .leftJoin(horarios, eq(horarios.id, grupoHorario.idHorario))
    .orderBy(asc(grupos.codigo))
    .all();

  const byId = new Map();

  for (const row of rows) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        codigo: row.codigo,
        idMateria: row.idMateria,
        nombreMateria: row.nombreMateria,
        horasSemestrales: row.horasSemestrales,
        esContrasemestre: row.esContrasemestre,
        cupo: row.cupo,
        semestre: row.semestre,
        anio: row.anio,
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

export function insertarRequerimientos(idGrupo, requerimientos) {
  return requerimientos.map((r) =>
    db
      .insert(grupoRequerimientoSalon)
      .values({
        idGrupo,
        idRequerimientoSalon: r
      })
      .run()
  );
}
