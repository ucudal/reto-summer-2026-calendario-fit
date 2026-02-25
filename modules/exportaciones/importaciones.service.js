import XLSX from "xlsx";
import { sqlite } from "../../db/database.js";

const MODULO_BY_START = {
  "08:00": 1,
  "09:30": 2,
  "11:00": 3,
  "12:25": 4,
  "16:50": 5,
  "18:15": 6,
  "19:45": 7,
  "21:15": 8
};

const DAY_MAP = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miercoles",
  miércoles: "Miercoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sabado",
  sábado: "Sabado"
};

function normalizeText(value) {
  return String(value || "").trim();
}

function parseIntSafe(value, fallback = 0) {
  const cleaned = normalizeText(value).replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function parseFloatSafe(value, fallback = 0) {
  const cleaned = normalizeText(value).replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

function parseYearFromFileName(filePath) {
  const m = String(filePath).match(/(20\d{2})/);
  return m ? Number(m[1]) : new Date().getFullYear();
}

function inferCarreraFromFilePath(filePath) {
  const lower = normalizeText(filePath)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (lower.includes("ambiental")) return "Ingeniería Ambiental";
  if (lower.includes("informat")) return "Ingeniería Informática";
  if (lower.includes("industrial")) return "Ingeniería Industrial";
  if (lower.includes("agronom")) return "Ingeniería Agronómica";
  if (lower.includes("mecanic")) return "Ingeniería Mecánica";
  if (lower.includes("civil")) return "Ingeniería Civil";
  if (lower.includes("biomed")) return "Ingeniería Biomédica";
  if (lower.includes("electr")) return "Ingeniería Eléctrica, Telecom y Potencia";
  return "";
}

function parsePlanAndSemestreFromCx(cx) {
  const value = normalizeText(cx);
  const semMatch = value.match(/Sem(\d+)/i);
  const planMatch = value.match(/P(\d{4})/i);
  const semestre = semMatch ? Number(semMatch[1]) : 1;
  const planYear = planMatch ? Number(planMatch[1]) : 2026;
  return {
    semestre,
    plan: `Plan ${planYear}`,
    anioPlan: planYear
  };
}

function parseTipo(raw) {
  const value = normalizeText(raw).toUpperCase();
  if (value === "A") return "Anual";
  if (value === "B") return "Semestral";
  if (value === "D") return "Electiva";
  return value || "Semestral";
}

function splitName(fullName) {
  const clean = normalizeText(fullName);
  if (!clean) return { nombre: "", apellido: "" };
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return { nombre: parts[0], apellido: "." };
  return {
    nombre: parts.slice(0, -1).join(" "),
    apellido: parts.slice(-1).join(" ")
  };
}

function slugify(input) {
  return normalizeText(input)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");
}

function extractClassId(cellValue) {
  const text = normalizeText(cellValue);
  if (!text) return "";
  const match = text.match(/n[°º]\s*de\s*clase\s*([a-z0-9-]+)/i);
  return match ? match[1].toUpperCase() : "";
}

function extractStartTime(timeCell) {
  const text = normalizeText(timeCell).replace(/\s+/g, " ");
  const match = text.match(/(\d{1,2}:\d{2})/);
  if (!match) return "";
  const [hh, mm] = match[1].split(":");
  return `${hh.padStart(2, "0")}:${mm}`;
}

function detectDay(text) {
  const raw = normalizeText(text).toLowerCase();
  if (!raw) return "";
  for (const key of Object.keys(DAY_MAP)) {
    if (raw.includes(key)) return DAY_MAP[key];
  }
  return "";
}

function findDayForCell(rows, rowIndex, colIndex) {
  for (let r = rowIndex; r >= 0; r -= 1) {
    const row = rows[r] || [];
    for (let c = colIndex; c >= 0; c -= 1) {
      const day = detectDay(row[c]);
      if (day) return day;
    }
  }
  return "";
}

function findStartForCell(rows, rowIndex) {
  for (let r = rowIndex; r >= 0; r -= 1) {
    const row = rows[r] || [];
    const start = extractStartTime(row[0]);
    if (start) return start;
  }
  return "";
}

function buildHorarioMap(workbook) {
  const map = new Map();
  const ignoredSheets = new Set(["Módulos", "Listas", "Paleta", "Requerimientos matemática"]);
  for (const sheetName of workbook.SheetNames) {
    if (ignoredSheets.has(sheetName)) continue;
    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false });
    for (let r = 0; r < rows.length; r += 1) {
      const row = rows[r] || [];
      for (let c = 0; c < row.length; c += 1) {
        const classId = extractClassId(row[c]);
        if (!classId) continue;
        const day = findDayForCell(rows, r, c);
        const start = findStartForCell(rows, r);
        const modulo = MODULO_BY_START[start] || null;
        if (!day || !modulo) continue;
        if (!map.has(classId)) map.set(classId, new Set());
        map.get(classId).add(`${day}|${modulo}`);
      }
    }
  }
  return map;
}

function headerIndex(headers, headerName) {
  const normalizeHeader = (value) =>
    normalizeText(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const normalizedHeaders = headers.map((h) => normalizeHeader(h));
  const candidates = []
    .concat(headerName || [])
    .flat()
    .map((h) => normalizeHeader(h))
    .filter(Boolean);

  for (const candidate of candidates) {
    const exact = normalizedHeaders.findIndex((h) => h === candidate);
    if (exact >= 0) return exact;
  }

  for (let i = 0; i < normalizedHeaders.length; i += 1) {
    const current = normalizedHeaders[i];
    if (!current) continue;
    for (const candidate of candidates) {
      if (current.includes(candidate) || candidate.includes(current)) {
        return i;
      }
    }
  }

  return -1;
}

function splitCellValues(value) {
  const text = normalizeText(value);
  if (!text) return [];
  return [...new Set(
    text
      .split(/[|;,/\n]+/)
      .map((v) => normalizeText(v))
      .filter((v) => v && !["-", "tbd", "n/a", "na"].includes(v.toLowerCase()))
  )];
}

function parseSalonCell(value) {
  const tokens = splitCellValues(value);
  return tokens
    .map((token) => {
      const m = token.match(/^(.+?)\s*\((.+)\)$/);
      if (m) {
        return { nombre: normalizeText(m[1]), edificio: normalizeText(m[2]) || "Sin edificio" };
      }
      return { nombre: token, edificio: "Sin edificio" };
    })
    .filter((s) => s.nombre);
}

export function importarModulosDesdeExcel(filePath, options = {}) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const moduloSheet = workbook.Sheets["Módulos"];
  if (!moduloSheet) {
    throw new Error("No se encontro la hoja 'Módulos' en el Excel");
  }

  const rows = XLSX.utils.sheet_to_json(moduloSheet, { header: 1, defval: null, raw: false });
  const headers = rows[0] || [];
  const dataRows = rows
    .slice(1)
    .filter((row) => row.some((cell) => normalizeText(cell) !== ""))
    .filter((row) => normalizeText(row[headerIndex(headers, "Curso")]) !== "");

  const idx = {
    cx: headerIndex(headers, ["cx", "cx "]),
    curso: headerIndex(headers, ["Curso"]),
    tipo: headerIndex(headers, ["Tipo"]),
    horas: headerIndex(headers, ["Horas"]),
    idClase: headerIndex(headers, ["ID Clase", "Id Clase", "IDClase"]),
    cupo: headerIndex(headers, ["Cupo"]),
    requerimiento: headerIndex(headers, [
      "Requerim. salón",
      "Requerim. salon",
      "Requerimiento salón",
      "Requerimiento salon",
      "Requerimientos",
      "Req salón",
      "Req salon"
    ]),
    salon: headerIndex(headers, ["Salón", "Salon", "Salones", "Aula", "Aulas"]),
    creditos: headerIndex(headers, ["Créditos", "Creditos"]),
    prof1: headerIndex(headers, ["Prof 1", "Profesor 1"]),
    prof2: headerIndex(headers, ["Prof 2", "Profesor 2"]),
    prof3: headerIndex(headers, ["Prof 3", "Profesor 3"]),
    asis1: headerIndex(headers, ["Asis 1", "Asistente 1"])
  };

  if (idx.curso < 0 || idx.idClase < 0) {
    throw new Error("La hoja 'Módulos' no tiene columnas requeridas (Curso / ID Clase)");
  }

  const inferredCareer = inferCarreraFromFilePath(filePath);
  const carreraNombre = options.carreraNombre || inferredCareer || "Ingeniería Informática";
  const anioLectivo = parseYearFromFileName(filePath);
  const horarioMap = buildHorarioMap(workbook);

  const getCarrera = sqlite.prepare("SELECT id FROM carreras WHERE nombre = ?");
  const insertCarrera = sqlite.prepare("INSERT INTO carreras (nombre) VALUES (?)");
  const getMateria = sqlite.prepare("SELECT id FROM materias WHERE nombre = ?");
  const insertMateria = sqlite.prepare(
    "INSERT INTO materias (tipo, creditos, nombre, tiene_correlativa) VALUES (?, ?, ?, 0)"
  );
  const getGrupo = sqlite.prepare("SELECT id FROM grupos WHERE codigo = ?");
  const insertGrupo = sqlite.prepare(
    "INSERT INTO grupos (codigo, id_materia, horas_anuales, es_contrasemestre, cupo, semestre, anio) VALUES (?, ?, ?, 0, ?, ?, ?)"
  );
  const updateGrupo = sqlite.prepare(
    "UPDATE grupos SET id_materia = ?, horas_anuales = ?, cupo = ?, semestre = ?, anio = ? WHERE id = ?"
  );
  const linkMateriaCarrera = sqlite.prepare(
    "INSERT OR IGNORE INTO materia_carrera (id_materia, id_carrera, plan, semestre, anio) VALUES (?, ?, ?, ?, ?)"
  );
  const updateMateriaCarrera = sqlite.prepare(
    "UPDATE materia_carrera SET plan = ?, semestre = ?, anio = ? WHERE id_materia = ? AND id_carrera = ?"
  );
  const getProfesorByFullName = sqlite.prepare(
    "SELECT id FROM profesores WHERE trim(nombre || ' ' || apellido) = ?"
  );
  const getProfesorByCorreo = sqlite.prepare("SELECT id FROM profesores WHERE correo = ?");
  const insertProfesor = sqlite.prepare(
    "INSERT INTO profesores (nombre, apellido, correo) VALUES (?, ?, ?)"
  );
  const linkProfesorGrupo = sqlite.prepare(
    "INSERT OR IGNORE INTO profesor_grupo (id_profesor, id_grupo, carga, confirmado, es_principal) VALUES (?, ?, ?, 1, ?)"
  );
  const getReq = sqlite.prepare("SELECT id FROM requerimientos_salon WHERE caracteristicas = ?");
  const insertReq = sqlite.prepare("INSERT INTO requerimientos_salon (caracteristicas) VALUES (?)");
  const linkGrupoReq = sqlite.prepare(
    "INSERT OR IGNORE INTO grupo_requerimiento_salon (id_grupo, id_requerimiento_salon) VALUES (?, ?)"
  );
  const getSalonByNombreEdificio = sqlite.prepare(
    "SELECT id FROM salones WHERE nombre = ? AND edificio = ?"
  );
  const getSalonByNombre = sqlite.prepare("SELECT id FROM salones WHERE nombre = ?");
  const insertSalon = sqlite.prepare(
    "INSERT INTO salones (nombre, edificio, aforo) VALUES (?, ?, ?)"
  );
  const linkSalonGrupo = sqlite.prepare(
    "INSERT OR IGNORE INTO salon_grupo (id_salon, id_grupo) VALUES (?, ?)"
  );
  const linkSalonReq = sqlite.prepare(
    "INSERT OR IGNORE INTO salon_requerimiento_salon (id_salon, id_requerimiento_salon) VALUES (?, ?)"
  );
  const getHorario = sqlite.prepare("SELECT id FROM horarios WHERE dia = ? AND modulo = ?");
  const insertHorario = sqlite.prepare("INSERT INTO horarios (dia, modulo) VALUES (?, ?)");
  const linkGrupoHorario = sqlite.prepare(
    "INSERT OR IGNORE INTO grupo_horario (id_grupo, id_horario) VALUES (?, ?)"
  );

  const summary = {
    filePath,
    carreraUsada: carreraNombre,
    totalRows: dataRows.length,
    inserted: {
      carreras: 0,
      materias: 0,
      grupos: 0,
      profesores: 0,
      requerimientos: 0,
      horarios: 0,
      salones: 0
    },
    linked: {
      materiaCarrera: 0,
      profesorGrupo: 0,
      grupoReq: 0,
      grupoHorario: 0,
      grupoSalon: 0,
      salonReq: 0
    },
    skipped: {
      rowsWithoutClassId: 0,
      horariosNotFound: 0,
      docentesSinNombre: 0
    },
    warnings: []
  };

  const run = sqlite.transaction(() => {
    if (idx.requerimiento < 0) {
      summary.warnings.push("No se encontro columna de requerimientos de salon en la hoja Modulos.");
    }
    if (idx.salon < 0) {
      summary.warnings.push("No se encontro columna de salon/aula en la hoja Modulos.");
    }

    let carrera = getCarrera.get(carreraNombre);
    if (!carrera) {
      const result = insertCarrera.run(carreraNombre);
      carrera = { id: Number(result.lastInsertRowid) };
      summary.inserted.carreras += 1;
    }

    const usedEmails = new Set();

    for (const row of dataRows) {
      const curso = normalizeText(row[idx.curso]);
      const idClase = normalizeText(row[idx.idClase]).toUpperCase();
      const horas = parseFloatSafe(row[idx.horas], 0);
      const cupo = parseIntSafe(row[idx.cupo], 0);
      const tipo = parseTipo(row[idx.tipo]);
      const creditos = parseIntSafe(row[idx.creditos], 0);
      const cx = normalizeText(row[idx.cx]);

      if (!idClase) {
        summary.skipped.rowsWithoutClassId += 1;
        continue;
      }

      const planData = parsePlanAndSemestreFromCx(cx);

      let materia = getMateria.get(curso);
      if (!materia) {
        const materiaResult = insertMateria.run(tipo || "Semestral", creditos || 0, curso);
        materia = { id: Number(materiaResult.lastInsertRowid) };
        summary.inserted.materias += 1;
      }

      const mcResult = linkMateriaCarrera.run(
        materia.id,
        carrera.id,
        planData.plan,
        planData.semestre,
        planData.anioPlan
      );
      if (mcResult.changes > 0) {
        summary.linked.materiaCarrera += 1;
      } else {
        updateMateriaCarrera.run(
          planData.plan,
          planData.semestre,
          planData.anioPlan,
          materia.id,
          carrera.id
        );
      }

      let grupo = getGrupo.get(idClase);
      if (!grupo) {
        const grupoResult = insertGrupo.run(
          idClase,
          materia.id,
          String(horas),
          cupo || null,
          planData.semestre,
          anioLectivo
        );
        grupo = { id: Number(grupoResult.lastInsertRowid) };
        summary.inserted.grupos += 1;
      } else {
        updateGrupo.run(
          materia.id,
          String(horas),
          cupo || null,
          planData.semestre,
          anioLectivo,
          grupo.id
        );
      }

      const docentes = [row[idx.prof1], row[idx.prof2], row[idx.prof3], row[idx.asis1]]
        .map((v) => normalizeText(v))
        .filter((v) => v !== "" && v.toUpperCase() !== "TBD");

      if (docentes.length === 0) {
        summary.skipped.docentesSinNombre += 1;
      }

      docentes.forEach((docenteRaw, docIndex) => {
        const { nombre, apellido } = splitName(docenteRaw);
        if (!nombre || !apellido) return;
        let profesor = getProfesorByFullName.get(`${nombre} ${apellido}`);
        if (!profesor) {
          const base = slugify(`${nombre}.${apellido}`) || "docente.import";
          let candidate = `${base}@import.local`;
          let suffix = 1;
          while (usedEmails.has(candidate) || getProfesorByCorreo.get(candidate)) {
            suffix += 1;
            candidate = `${base}.${suffix}@import.local`;
          }
          usedEmails.add(candidate);
          const profResult = insertProfesor.run(nombre, apellido, candidate);
          profesor = { id: Number(profResult.lastInsertRowid) };
          summary.inserted.profesores += 1;
        }

        const linkResult = linkProfesorGrupo.run(
          profesor.id,
          grupo.id,
          docIndex === 0 ? "principal" : "asistente",
          docIndex === 0 ? 1 : 0
        );
        if (linkResult.changes > 0) summary.linked.profesorGrupo += 1;
      });

      const reqIds = [];
      const reqTexts = splitCellValues(row[idx.requerimiento]);
      for (const reqText of reqTexts) {
        let req = getReq.get(reqText);
        if (!req) {
          const reqResult = insertReq.run(reqText);
          req = { id: Number(reqResult.lastInsertRowid) };
          summary.inserted.requerimientos += 1;
        }
        const linkReqResult = linkGrupoReq.run(grupo.id, req.id);
        if (linkReqResult.changes > 0) summary.linked.grupoReq += 1;
        reqIds.push(req.id);
      }

      const salones = parseSalonCell(row[idx.salon]);
      for (const salonData of salones) {
        let salon =
          getSalonByNombreEdificio.get(salonData.nombre, salonData.edificio) ||
          getSalonByNombre.get(salonData.nombre);
        if (!salon) {
          const salonResult = insertSalon.run(salonData.nombre, salonData.edificio, 0);
          salon = { id: Number(salonResult.lastInsertRowid) };
          summary.inserted.salones += 1;
        }

        const linkSalonResult = linkSalonGrupo.run(salon.id, grupo.id);
        if (linkSalonResult.changes > 0) summary.linked.grupoSalon += 1;

        for (const reqId of reqIds) {
          const salonReqResult = linkSalonReq.run(salon.id, reqId);
          if (salonReqResult.changes > 0) summary.linked.salonReq += 1;
        }
      }

      const horarios = horarioMap.get(idClase) || new Set();
      if (horarios.size === 0) {
        summary.skipped.horariosNotFound += 1;
      }

      for (const item of horarios) {
        const [dia, moduloStr] = item.split("|");
        const modulo = Number(moduloStr);
        let horario = getHorario.get(dia, modulo);
        if (!horario) {
          const horarioResult = insertHorario.run(dia, modulo);
          horario = { id: Number(horarioResult.lastInsertRowid) };
          summary.inserted.horarios += 1;
        }
        const linkHorarioResult = linkGrupoHorario.run(grupo.id, horario.id);
        if (linkHorarioResult.changes > 0) summary.linked.grupoHorario += 1;
      }
    }
  });

  run();
  return summary;
}
