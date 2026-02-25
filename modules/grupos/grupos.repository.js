import { db, sqlite } from '../../db/database.js';
import { grupos }  from "../../db/drizzle/schema/base.js";
import { eq } from "drizzle-orm";

export function crearGrupo(grupo) {
  return db.insert(grupos).values({
    codigo: grupo.codigo,
    idMateria: grupo.idMateria,
    horasSemestrales: grupo.horasSemestrales,
    esContrasemestre: grupo.esContrasemestre,
    cupo: grupo.cupo,
    semestre: grupo.semestre,
    anio: grupo.anio
  }).run();
};

export function eliminarGrupo(id) {
  return db.delete(grupos)
    .where(eq(grupos.id, id))
    .run();
};

export function modificarGrupo(id, datos) {
  return db.update(grupos)
    .set(datos)
    .where(eq(grupos.id, id))
    .run();
};

export function obtenerGrupoPorId(id) {
  return db.select()
    .from(grupos)
    .where(eq(grupos.id, id))
    .get(); 
};

export function listarGrupos() {
  const query = `
    SELECT
      g.id AS id,
      g.codigo AS codigo,
      g.id_materia AS idMateria,
      m.nombre AS nombreMateria,
      g.horas_anuales AS horasSemestrales,
      g.es_contrasemestre AS esContrasemestre,
      g.cupo AS cupo,
      g.semestre AS semestre,
      g.anio AS anio,
      COALESCE(GROUP_CONCAT(DISTINCT (h.dia || '|' || h.modulo)), '') AS horariosRaw
    FROM grupos g
    LEFT JOIN materias m ON m.id = g.id_materia
    LEFT JOIN grupo_horario gh ON gh.id_grupo = g.id
    LEFT JOIN horarios h ON h.id = gh.id_horario
    GROUP BY
      g.id, g.codigo, g.id_materia, m.nombre,
      g.horas_anuales, g.es_contrasemestre, g.cupo, g.semestre, g.anio
    ORDER BY g.codigo ASC
  `;

  const rows = sqlite.prepare(query).all();
  return rows.map((row) => ({
    ...row,
    horarios: String(row.horariosRaw || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [dia, modulo] = item.split("|");
        return { dia, modulo: Number(modulo) };
      })
  }));
};

export function asignarProfesor(data) {
  return db.insert(profesorGrupo).values({
    idProfesor: data.idProfesor,
    idGrupo: data.idGrupo,
    carga: data.carga,
    confirmado: 1,
    esPrincipal: data.esPrincipal
  }).run();
};

export function insertarHorarios(idGrupo, horarios) {
  return horarios.map(h =>
    db.insert(horario).values({
      idGrupo,
      dia: h.dia,
      modulo: h.modulo
    }).run()
  );
};

export function insertarRequerimientos(idMateria, requerimientos) {
  return requerimientos.map(r =>
    db.insert(materiaReqSalon).values({
      idMateria,
      idReqSalon: r
    }).run()
  );
};
