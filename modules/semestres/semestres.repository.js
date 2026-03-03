import { and, asc, eq } from "drizzle-orm";
import { db, sqlite } from "../../db/database.js";
import { grupos, horarios, semestres } from "../../db/drizzle/schema/base.js";
import { grupoHorario } from "../../db/drizzle/schema/links.js";

export function listarSemestresLectivos() {
  return db
    .select({
      id: semestres.id,
      numeroSemestre: semestres.numeroSemestre,
      anio: semestres.anio
    })
    .from(semestres)
    .orderBy(asc(semestres.anio), asc(semestres.numeroSemestre))
    .all();
}

export function obtenerSemestrePorNumeroYAnio(numeroSemestre, anio) {
  return db
    .select({
      id: semestres.id,
      numeroSemestre: semestres.numeroSemestre,
      anio: semestres.anio
    })
    .from(semestres)
    .where(
      and(
        eq(semestres.numeroSemestre, Number(numeroSemestre)),
        eq(semestres.anio, Number(anio))
      )
    )
    .get();
}

export function crearSemestreLectivo(numeroSemestre, anio) {
  return db
    .insert(semestres)
    .values({
      numeroSemestre: Number(numeroSemestre),
      anio: Number(anio)
    })
    .run();
}

/**
 * Genera un código único alfanumérico para un grupo.
 * Formato: GRP-XXXXXXXXXXXX (12 caracteres hex aleatorios)
 * @deprecated Ya no se usa — el código se copia directamente del grupo origen.
 */
// export function generarCodigoUnico() { ... }

/**
 * Obtiene todos los grupos de un semestre con sus horarios y carreras asociadas.
 */
export function obtenerGruposPorSemestre(idSemestre) {
  // Grupos base
  const gruposBase = db
    .select()
    .from(grupos)
    .where(eq(grupos.idSemestre, idSemestre))
    .all();

  if (gruposBase.length === 0) return [];

  // Horarios de cada grupo
  const stmtHorarios = sqlite.prepare(`
    SELECT h.dia, h.modulo
    FROM grupo_horario gh
    INNER JOIN horarios h ON h.id = gh.id_horario
    WHERE gh.id_grupo = ?
  `);

  // Carreras de cada grupo (via grupo_carrera)
  const stmtCarreras = sqlite.prepare(`
    SELECT id_carrera FROM grupo_carrera WHERE id_grupo = ?
  `);

  return gruposBase.map((g) => {
    const horariosRows = stmtHorarios.all(g.id);
    let carreraIds = [];
    try { carreraIds = stmtCarreras.all(g.id).map((c) => c.id_carrera); } catch (_) {}
    return {
      ...g,
      horarios: horariosRows.map((h) => ({ dia: h.dia, modulo: h.modulo })),
      carreraIds
    };
  });
}

/**
 * Replica un arreglo de grupos en un nuevo semestre.
 * Copia el código existente de cada grupo y replica horarios + carreras.
 */
export function replicarGruposEnSemestre(gruposOrigen, idSemestreNuevo) {
  const errors = [];
  let created = 0;

  // Preparar insert de grupo_carrera (puede no existir la tabla si nunca se usó)
  let insertCarrera;
  try {
    sqlite.prepare(`
      CREATE TABLE IF NOT EXISTS grupo_carrera (
        id_grupo INTEGER NOT NULL,
        id_carrera INTEGER NOT NULL,
        PRIMARY KEY (id_grupo, id_carrera),
        FOREIGN KEY (id_grupo) REFERENCES grupos(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_carrera) REFERENCES carreras(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `).run();
    insertCarrera = sqlite.prepare(
      "INSERT OR IGNORE INTO grupo_carrera (id_grupo, id_carrera) VALUES (?, ?)"
    );
  } catch (_) {}

  for (const grupoOrigen of gruposOrigen) {
    try {
      // Crear el grupo nuevo con el mismo código del origen
      const result = db
        .insert(grupos)
        .values({
          codigo: grupoOrigen.codigo,
          idMateria: grupoOrigen.idMateria,
          horasSemestrales: grupoOrigen.horasSemestrales,
          esContrasemestre: grupoOrigen.esContrasemestre,
          cupo: grupoOrigen.cupo,
          color: grupoOrigen.color,
          idSemestre: idSemestreNuevo
        })
        .run();

      const nuevoGrupoId = Number(result?.lastInsertRowid || 0);
      if (nuevoGrupoId <= 0) {
        errors.push(`No se pudo crear copia del grupo ${grupoOrigen.id}`);
        continue;
      }

      // Copiar horarios
      for (const h of grupoOrigen.horarios || []) {
        let horarioRow = db
          .select({ id: horarios.id })
          .from(horarios)
          .where(and(eq(horarios.modulo, h.modulo), eq(horarios.dia, h.dia)))
          .get();

        if (!horarioRow) {
          const createH = db
            .insert(horarios)
            .values({ modulo: Number(h.modulo), dia: String(h.dia) })
            .run();
          const hId = Number(createH?.lastInsertRowid || 0);
          if (hId > 0) horarioRow = { id: hId };
        }

        if (horarioRow?.id) {
          db.insert(grupoHorario)
            .values({ idGrupo: nuevoGrupoId, idHorario: horarioRow.id })
            .run();
        }
      }

      // Copiar carreras
      if (insertCarrera) {
        for (const idCarrera of grupoOrigen.carreraIds || []) {
          insertCarrera.run(nuevoGrupoId, idCarrera);
        }
      }

      created++;
    } catch (err) {
      errors.push(`Error replicando grupo ${grupoOrigen.id}: ${err.message}`);
    }
  }

  return { created, errors };
}
