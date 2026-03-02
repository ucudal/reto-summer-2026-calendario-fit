import { sqlite } from "../../db/database.js";

export function listarFilasExportacionDesdeDb(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.carrera && String(filters.carrera).trim() !== "") {
    conditions.push("c.nombre = ?");
    params.push(String(filters.carrera).trim());
  }

  if (filters.plan && String(filters.plan).trim() !== "") {
    conditions.push("mc.plan = ?");
    params.push(String(filters.plan).trim());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
    SELECT
      g.id AS grupo_id,
      g.codigo AS grupo_codigo,
      g.color AS grupo_color,
      g.id_semestre AS grupo_idSemestre,
      g.cupo AS grupo_cupo,
      g.horas_anuales AS grupo_horas_semestrales,
      g.es_contrasemestre AS grupo_es_contrasemestre,
      m.id AS materia_id,
      m.nombre AS materia_nombre,
      m.tipo AS materia_tipo,
      m.creditos AS materia_creditos,
      m.tiene_correlativa AS materia_tiene_contrasemestre,
      m.requerimientosSalon AS requerimientos,
      c.id AS carrera_id,
      c.nombre AS carrera_nombre,
      mc.plan AS plan_nombre,
      mc.anio AS plan_anio,
      mc.semestre AS plan_semestre,
      GROUP_CONCAT(DISTINCT h.dia || ' M' || h.modulo) AS horarios,
      GROUP_CONCAT(DISTINCT (p.nombre || ' ' || p.apellido)) AS docentes,
      GROUP_CONCAT(DISTINCT (s.nombre || ' (' || s.edificio || ')')) AS salones
    FROM grupos g
    INNER JOIN materias m ON m.id = g.id_materia
    LEFT JOIN materia_carrera mc ON mc.id_materia = m.id
    LEFT JOIN carreras c ON c.id = mc.id_carrera
    LEFT JOIN grupo_horario gh ON gh.id_grupo = g.id
    LEFT JOIN horarios h ON h.id = gh.id_horario
    LEFT JOIN profesor_grupo pg ON pg.id_grupo = g.id
    LEFT JOIN profesores p ON p.id = pg.id_profesor
    LEFT JOIN salon_grupo sg ON sg.id_grupo = g.id
    LEFT JOIN salones s ON s.id = sg.id_salon
    ${whereClause}
    GROUP BY
      g.id, g.codigo, g.color, g.id_semestre, g.cupo, g.horas_anuales, g.es_contrasemestre,
      m.id, m.nombre, m.tipo, m.creditos, m.tiene_correlativa,
      c.id, c.nombre, mc.plan, mc.anio, mc.semestre
    ORDER BY g.codigo ASC
  `;

  return sqlite.prepare(query).all(...params);
}
