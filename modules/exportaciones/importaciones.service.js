import XLSX from "xlsx";
import { sqlite } from "../../db/database.js";

const MODULO_BY_START = {
  "08:00": 1,
  "09:30": 2,
  "11:00": 3,
  "12:25": 4,
  "13:50": 5,
  "15:20": 6,
  "16:50": 7,
  "18:15": 8,
  "19:45": 9,
  "21:15": 10
};

const DAY_MAP = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miercoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sabado"
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

  if (lower.includes("ambiental")) return "IngenierÃ­a Ambiental";
  if (lower.includes("informat")) return "IngenierÃ­a InformÃ¡tica";
  if (lower.includes("industrial")) return "IngenierÃ­a Industrial";
  if (lower.includes("agronom")) return "IngenierÃ­a AgronÃ³mica";
  if (lower.includes("mecanic")) return "IngenierÃ­a MecÃ¡nica";
  if (lower.includes("civil")) return "IngenierÃ­a Civil";
  if (lower.includes("biomed")) return "IngenierÃ­a BiomÃ©dica";
  if (lower.includes("electr")) return "IngenierÃ­a ElÃ©ctrica, Telecom y Potencia";
  return "";
}

function parsePlanAndSemestreFromCx(cx, fallbackYear = 2026) {
  const value = normalizeText(cx);
  const semMatch = value.match(/Sem(\d+)/i);
  const planMatch = value.match(/P?(\d{4})/i);
  const semestre = semMatch ? Number(semMatch[1]) : 1;
  const planYear = planMatch ? Number(planMatch[1]) : fallbackYear;
  return {
    semestre,
    plan: `Plan ${planYear}`,
    anioPlan: planYear
  };
}

function parsePlanYear(raw, fallbackYear = 2026) {
  const value = normalizeText(raw);
  if (!value) return fallbackYear;
  const match = value.match(/(20\d{2})/);
  if (match) return Number(match[1]);
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 2000 && numeric <= 2100) return Math.trunc(numeric);
  return fallbackYear;
}

function normalizePlanLabel(raw, year) {
  const value = normalizeText(raw);
  if (!value) return `Plan ${year}`;
  if (/^\d{4}$/.test(value)) return `Plan ${value}`;
  return value;
}

function parseCarreraFromPlan(raw) {
  const value = normalizeText(raw);
  if (!value) return "";
  const withoutYear = value
    .replace(/20\d{2}/g, " ")
    .replace(/\bplan\b/gi, " ")
    .replace(/[-_/|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return withoutYear;
}

function parseSemestreNumber(raw, fallbackSemestre = 1) {
  const value = normalizeText(raw);
  if (!value) return fallbackSemestre;
  const match = value.match(/(\d{1,2})/);
  if (!match) return fallbackSemestre;
  const semestre = Number(match[1]);
  return Number.isFinite(semestre) && semestre > 0 ? semestre : fallbackSemestre;
}

function mapSemestreAcumulado(rawSemestre) {
  const total = Number(rawSemestre);
  if (!Number.isFinite(total) || total <= 0) {
    return { semestre: 1, anioCarrera: 1 };
  }

  // Formato acumulado:
  // 1 -> 1er sem 1er año, 2 -> 2do sem 1er año
  // 3 -> 1er sem 2do año, 4 -> 2do sem 2do año, etc.
  const anioCarrera = Math.max(1, Math.min(5, Math.floor((total - 1) / 2) + 1));
  const semestre = total % 2 === 0 ? 2 : 1;
  return { semestre, anioCarrera };
}

function parsePlanAndSemestre({ cx, plan, semestre, fallbackYear = 2026 }) {
  const fromCx = parsePlanAndSemestreFromCx(cx, fallbackYear);
  const planYear = parsePlanYear(plan, fromCx.anioPlan);
  const semestreNumero = parseSemestreNumber(semestre, fromCx.semestre);
  const mapped = mapSemestreAcumulado(semestreNumero);
  return {
    // Para la tabla semestres (lectivo), solo existen 1 o 2.
    semestreLectivo: mapped.semestre,
    // Para materia_carrera: semestre dentro del año y año de carrera.
    semestreCarrera: mapped.semestre,
    anioCarrera: mapped.anioCarrera,
    plan: normalizePlanLabel(plan, planYear),
    anioPlan: planYear
  };
}

function getCell(row, index) {
  return index >= 0 ? row[index] : "";
}

function resolveCarreraNombre({ rowCarrera, plan, fallbackCarrera }) {
  return normalizeText(rowCarrera) || parseCarreraFromPlan(plan) || normalizeText(fallbackCarrera);
}

function ensureGrupoCarreraTable() {
  sqlite
    .prepare(`
      CREATE TABLE IF NOT EXISTS grupo_carrera (
        id_grupo INTEGER NOT NULL,
        id_carrera INTEGER NOT NULL,
        PRIMARY KEY (id_grupo, id_carrera),
        FOREIGN KEY (id_grupo) REFERENCES grupos(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (id_carrera) REFERENCES carreras(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `)
    .run();
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
  if (parts.length === 1) return { nombre: parts[0], apellido: "" };
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
  const match = text.match(/n(?:[^a-z0-9\s])?\s*de\s*clase\s*([a-z0-9-]+)/i);
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
  const raw = normalizeText(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
  const ignoredSheets = new Set(["MÃ³dulos", "Listas", "Paleta", "Requerimientos matemÃ¡tica"]);
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

function getModuloSheet(workbook) {
  if (!workbook?.Sheets) return null;
  if (workbook.Sheets["Módulos"]) return workbook.Sheets["Módulos"];
  if (workbook.Sheets["Modulos"]) return workbook.Sheets["Modulos"];
  if (workbook.Sheets["DatosBD"]) return workbook.Sheets["DatosBD"];
  if (workbook.Sheets["Datos"]) return workbook.Sheets["Datos"];
  const key = Object.keys(workbook.Sheets).find(
    (name) =>
      normalizeText(name)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") === "modulos"
  );
  if (key) return workbook.Sheets[key];
  const firstDataSheet = workbook.SheetNames.find((name) => normalizeText(name).toLowerCase() !== "fuentes");
  return firstDataSheet ? workbook.Sheets[firstDataSheet] : null;
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(value) {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function importarModulosDesdeExcel(filePath, options = {}) {
  ensureGrupoCarreraTable();
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const moduloSheet = getModuloSheet(workbook);
  if (!moduloSheet) {
    throw new Error("No se encontro la hoja 'MÃ³dulos' en el Excel");
  }

  const rows = XLSX.utils.sheet_to_json(moduloSheet, { header: 1, defval: null, raw: false });
  const headers = rows[0] || [];
  const dataRows = rows
    .slice(1)
    .filter((row) => row.some((cell) => normalizeText(cell) !== ""))
    .filter((row) => normalizeText(row[headerIndex(headers, ["Curso", "materia_nombre", "Materia nombre"])]) !== "");

  const idx = {
    carrera: headerIndex(headers, ["Carrera", "Nombre carrera", "carrera_nombre"]),
    cx: headerIndex(headers, ["cx", "cx "]),
    plan: headerIndex(headers, ["Plan", "Plan de estudios", "Plan anio", "Plan año", "plan_nombre", "plan_anio"]),
    semestre: headerIndex(headers, ["Semestre", "Numero semestre", "Nro semestre", "plan_semestre"]),
    curso: headerIndex(headers, ["Curso", "materia_nombre", "Materia nombre"]),
    tipo: headerIndex(headers, ["Tipo", "materia_tipo"]),
    horas: headerIndex(headers, ["Horas", "Horas anuales", "grupo_horas_semestrales", "grupo_horas_anuales"]),
    idClase: headerIndex(headers, ["ID Clase", "Id Clase", "IDClase", "Codigo", "Código", "grupo_codigo"]),
    cupo: headerIndex(headers, ["Cupo", "grupo_cupo"]),
    color: headerIndex(headers, ["Color", "grupo_color"]),
    /* requerimiento: headerIndex(headers, [
      "Requerim. salÃ³n",
      "Requerim. salon",
      "Requerimiento salÃ³n",
      "Requerimiento salon",
      "Requerimientos",
      "Req salÃ³n",
      "Req salon"
    ]), */
    salon: headerIndex(headers, ["Salón", "Salon", "Salones", "Aula", "Aulas", "salones"]),
    salonNombre: headerIndex(headers, ["Nombre salon", "Nombre salon", "Nombre salon/aula"]),
    salonEdificio: headerIndex(headers, ["Edificio"]),
    salonAforo: headerIndex(headers, ["Aforo"]),
    creditos: headerIndex(headers, ["Créditos", "Creditos", "materia_creditos"]),
    prof1: headerIndex(headers, ["Prof 1", "Profesor 1"]),
    prof2: headerIndex(headers, ["Prof 2", "Profesor 2"]),
    prof3: headerIndex(headers, ["Prof 3", "Profesor 3"]),
    asis1: headerIndex(headers, ["Asis 1", "Asistente 1"]),
    correo: headerIndex(headers, ["Correo", "Email", "Mail", "docentes"]),
    correo1: headerIndex(headers, ["Correo 1", "Email 1", "Correo Prof 1", "Mail Prof 1"]),
    correo2: headerIndex(headers, ["Correo 2", "Email 2", "Correo Prof 2", "Mail Prof 2"]),
    correo3: headerIndex(headers, ["Correo 3", "Email 3", "Correo Prof 3", "Mail Prof 3"]),
    correoAsis1: headerIndex(headers, ["Correo Asis 1", "Email Asis 1", "Correo Asistente 1"])
  };

  if (idx.curso < 0 || idx.idClase < 0) {
    throw new Error("La hoja 'MÃ³dulos' no tiene columnas requeridas (Curso / ID Clase)");
  }

  const inferredCareer = inferCarreraFromFilePath(filePath);
  const carreraNombre = options.carreraNombre || inferredCareer || "IngenierÃ­a InformÃ¡tica";
  const anioLectivo = parseYearFromFileName(filePath);
  const horarioMap = buildHorarioMap(workbook);

  const getCarrera = sqlite.prepare("SELECT id FROM carreras WHERE nombre = ?");
  const insertCarrera = sqlite.prepare("INSERT INTO carreras (nombre) VALUES (?)");
  const linkGrupoCarrera = sqlite.prepare(
    "INSERT OR IGNORE INTO grupo_carrera (id_grupo, id_carrera) VALUES (?, ?)"
  );
  const getSemestre = sqlite.prepare(
    "SELECT id FROM semestres WHERE numero_semestre = ? AND anio = ?"
  );
  const insertSemestre = sqlite.prepare(
    "INSERT INTO semestres (numero_semestre, anio) VALUES (?, ?)"
  );
  const getMateria = sqlite.prepare("SELECT id FROM materias WHERE nombre = ?");
  const insertMateria = sqlite.prepare(
    "INSERT INTO materias (tipo, creditos, nombre, tiene_correlativa) VALUES (?, ?, ?, 0)"
  );
  const getGrupo = sqlite.prepare("SELECT id FROM grupos WHERE codigo = ?");
  const insertGrupo = sqlite.prepare(
    "INSERT INTO grupos (codigo, id_materia, horas_anuales, es_contrasemestre, cupo, id_semestre, color) VALUES (?, ?, ?, 0, ?, ?, ?)"
  );
  const updateGrupo = sqlite.prepare(
    "UPDATE grupos SET id_materia = ?, horas_anuales = ?, cupo = ?, id_semestre = ?, color = ? WHERE id = ?"
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
  /* const getReq = sqlite.prepare("SELECT id FROM requerimientos_salon WHERE caracteristicas = ?");
  const insertReq = sqlite.prepare("INSERT INTO requerimientos_salon (caracteristicas) VALUES (?)");
  const linkGrupoReq = sqlite.prepare(
    "INSERT OR IGNORE INTO grupo_requerimiento_salon (id_grupo, id_requerimiento_salon) VALUES (?, ?)"
  ); */
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
  /* const linkSalonReq = sqlite.prepare(
    "INSERT OR IGNORE INTO salon_requerimiento_salon (id_salon, id_requerimiento_salon) VALUES (?, ?)"
  ); */
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
      semestres: 0,
      materias: 0,
      grupos: 0,
      profesores: 0,
      //requerimientos: 0,
      horarios: 0,
      salones: 0
    },
    linked: {
      materiaCarrera: 0,
      grupoCarrera: 0,
      profesorGrupo: 0,
      grupoReq: 0,
      grupoHorario: 0,
      grupoSalon: 0,
      //salonReq: 0
    },
    skipped: {
      rowsWithoutClassId: 0,
      horariosNotFound: 0,
      docentesSinNombre: 0
    },
    warnings: []
  };

  const run = sqlite.transaction(() => {
    /* if (idx.requerimiento < 0) {
      summary.warnings.push("No se encontro columna de requerimientos de salon en la hoja Modulos.");
    } */
    if (idx.salon < 0) {
      summary.warnings.push("No se encontro columna de salon/aula en la hoja Modulos.");
    }

    const carreraCache = new Map();
    const ensureCarrera = (name) => {
      const normalized = normalizeText(name);
      if (!normalized) return null;
      if (carreraCache.has(normalized)) return carreraCache.get(normalized);
      let carrera = getCarrera.get(normalized);
      if (!carrera) {
        const result = insertCarrera.run(normalized);
        carrera = { id: Number(result.lastInsertRowid) };
        summary.inserted.carreras += 1;
      }
      carreraCache.set(normalized, carrera);
      return carrera;
    };

    const usedEmails = new Set();

    for (const row of dataRows) {
      const curso = normalizeText(getCell(row, idx.curso));
      const idClase = normalizeText(getCell(row, idx.idClase)).toUpperCase();
      const horas = parseFloatSafe(getCell(row, idx.horas), 0);
      const cupo = parseIntSafe(getCell(row, idx.cupo), 0);
      const tipo = parseTipo(getCell(row, idx.tipo));
      const creditos = parseIntSafe(getCell(row, idx.creditos), 0);
      const cx = normalizeText(getCell(row, idx.cx));
      const planRaw = normalizeText(getCell(row, idx.plan));
      const semestreRaw = normalizeText(getCell(row, idx.semestre));
      const rowCarreraRaw = normalizeText(getCell(row, idx.carrera));

      if (!idClase) {
        summary.skipped.rowsWithoutClassId += 1;
        continue;
      }

      const planData = parsePlanAndSemestre({
        cx,
        plan: planRaw,
        semestre: semestreRaw,
        fallbackYear: anioLectivo
      });
      const carreraRowName = resolveCarreraNombre({
        rowCarrera: rowCarreraRaw,
        plan: planData.plan,
        fallbackCarrera: carreraNombre
      });
      const carrera = ensureCarrera(carreraRowName || carreraNombre);
      if (!carrera) continue;
      let semestre = getSemestre.get(planData.semestreLectivo, planData.anioPlan);
      if (!semestre) {
        const semResult = insertSemestre.run(planData.semestreLectivo, planData.anioPlan);
        semestre = { id: Number(semResult.lastInsertRowid) };
        summary.inserted.semestres += 1;
      }

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
        planData.semestreCarrera,
        planData.anioCarrera
      );
      if (mcResult.changes > 0) {
        summary.linked.materiaCarrera += 1;
      } else {
        updateMateriaCarrera.run(
          planData.plan,
          planData.semestreCarrera,
          planData.anioCarrera,
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
          semestre.id,
          normalizeText(getCell(row, idx.color)) || normalizeText(options.color) || "#2563EB"
        );
        grupo = { id: Number(grupoResult.lastInsertRowid) };
        summary.inserted.grupos += 1;
      } else {
        updateGrupo.run(
          materia.id,
          String(horas),
          cupo || null,
          semestre.id,
          normalizeText(getCell(row, idx.color)) || normalizeText(options.color) || "#2563EB",
          grupo.id
        );
      }

      const linkGrupoCarreraResult = linkGrupoCarrera.run(grupo.id, carrera.id);
      if (linkGrupoCarreraResult.changes > 0) summary.linked.grupoCarrera += 1;

      const docentes = [
        {
          nombreCompleto: normalizeText(row[idx.prof1]),
          correoPreferido: normalizeText(row[idx.correo1 >= 0 ? idx.correo1 : idx.correo])
        },
        {
          nombreCompleto: normalizeText(row[idx.prof2]),
          correoPreferido: normalizeText(row[idx.correo2 >= 0 ? idx.correo2 : -1])
        },
        {
          nombreCompleto: normalizeText(row[idx.prof3]),
          correoPreferido: normalizeText(row[idx.correo3 >= 0 ? idx.correo3 : -1])
        },
        {
          nombreCompleto: normalizeText(row[idx.asis1]),
          correoPreferido: normalizeText(row[idx.correoAsis1 >= 0 ? idx.correoAsis1 : -1])
        }
      ].filter((d) => d.nombreCompleto !== "" && d.nombreCompleto.toUpperCase() !== "TBD");

      if (docentes.length === 0) {
        summary.skipped.docentesSinNombre += 1;
      }

      docentes.forEach((docenteData, docIndex) => {
        const { nombre, apellido } = splitName(docenteData.nombreCompleto);
        if (!nombre || !apellido) return;
        let profesor = getProfesorByFullName.get(`${nombre} ${apellido}`);
        if (!profesor) {
          let candidate = "";
          const preferredEmail = normalizeEmail(docenteData.correoPreferido);
          if (
            isValidEmail(preferredEmail) &&
            !usedEmails.has(preferredEmail) &&
            !getProfesorByCorreo.get(preferredEmail)
          ) {
            candidate = preferredEmail;
          } else {
            const base = slugify(`${nombre}.${apellido}`) || "docente.import";
            candidate = `${base}@import.local`;
            let suffix = 1;
            while (usedEmails.has(candidate) || getProfesorByCorreo.get(candidate)) {
              suffix += 1;
              candidate = `${base}.${suffix}@import.local`;
            }
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

      /* const reqIds = [];
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
      } */

      const directSalonNombre = normalizeText(getCell(row, idx.salonNombre));
      const directSalonEdificio = normalizeText(getCell(row, idx.salonEdificio)) || "Sin edificio";
      const directSalonAforo = parseIntSafe(getCell(row, idx.salonAforo), 0);
      const salones = directSalonNombre
        ? [{ nombre: directSalonNombre, edificio: directSalonEdificio, aforo: directSalonAforo }]
        : parseSalonCell(getCell(row, idx.salon)).map((s) => ({ ...s, aforo: 0 }));
      for (const salonData of salones) {
        let salon =
          getSalonByNombreEdificio.get(salonData.nombre, salonData.edificio) ||
          getSalonByNombre.get(salonData.nombre);
        if (!salon) {
          const salonResult = insertSalon.run(salonData.nombre, salonData.edificio, salonData.aforo || 0);
          salon = { id: Number(salonResult.lastInsertRowid) };
          summary.inserted.salones += 1;
        }

        const linkSalonResult = linkSalonGrupo.run(salon.id, grupo.id);
        if (linkSalonResult.changes > 0) summary.linked.grupoSalon += 1;

        /* for (const reqId of reqIds) {
          const salonReqResult = linkSalonReq.run(salon.id, reqId);
          if (salonReqResult.changes > 0) summary.linked.salonReq += 1;
        } */
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

export function importarDatosUnicosDesdeExcel(filePath, options = {}) {
  ensureGrupoCarreraTable();
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const moduloSheet = getModuloSheet(workbook);
  if (!moduloSheet) {
    throw new Error("No se encontro la hoja 'MÃ³dulos' en el Excel");
  }

  const entity = normalizeText(options.entity).toLowerCase();
  const validEntities = new Set([
    "carreras",
    "materias",
    "grupos",
    "profesores",
    "salones",
    "semestres",
    "horarios"
  ]);
  if (!validEntities.has(entity)) {
    throw new Error("Entidad invalida para importacion parcial");
  }

  const rows = XLSX.utils.sheet_to_json(moduloSheet, { header: 1, defval: null, raw: false });
  const headers = rows[0] || [];
  const dataRows = rows
    .slice(1)
    .filter((row) => row.some((cell) => normalizeText(cell) !== ""));

  const idx = {
    carrera: headerIndex(headers, ["Carrera", "Nombre carrera", "carrera_nombre"]),
    cx: headerIndex(headers, ["cx", "cx "]),
    plan: headerIndex(headers, ["Plan", "Plan de estudios", "Plan anio", "Plan año", "plan_nombre", "plan_anio"]),
    semestre: headerIndex(headers, ["Semestre", "Numero semestre", "Nro semestre", "plan_semestre"]),
    curso: headerIndex(headers, ["Curso", "materia_nombre", "Materia nombre"]),
    tipo: headerIndex(headers, ["Tipo", "materia_tipo"]),
    horas: headerIndex(headers, ["Horas", "Horas anuales", "grupo_horas_semestrales", "grupo_horas_anuales"]),
    idClase: headerIndex(headers, ["ID Clase", "Id Clase", "IDClase", "Codigo", "Código", "grupo_codigo"]),
    cupo: headerIndex(headers, ["Cupo", "grupo_cupo"]),
    requerimiento: headerIndex(headers, [
      "Requerim. salÃƒÂ³n",
      "Requerim. salon",
      "Requerimiento salÃƒÂ³n",
      "Requerimiento salon",
      "Requerimientos",
      "Req salÃƒÂ³n",
      "Req salon"
    ]),
    salon: headerIndex(headers, ["Salón", "Salon", "Salones", "Aula", "Aulas", "salones"]),
    salonNombre: headerIndex(headers, ["Nombre salon", "Nombre salÃƒÂ³n", "Nombre salon/aula"]),
    salonEdificio: headerIndex(headers, ["Edificio"]),
    salonAforo: headerIndex(headers, ["Aforo"]),
    dia: headerIndex(headers, ["Dia", "DÃ­a"]),
    modulo: headerIndex(headers, ["Modulo", "MÃ³dulo"]),
    color: headerIndex(headers, ["Color", "grupo_color"]),
    creditos: headerIndex(headers, ["Créditos", "Creditos", "materia_creditos"]),
    profesor: headerIndex(headers, ["Profesor", "Docente", "Nombre completo", "docentes"]),
    nombre: headerIndex(headers, ["Nombre"]),
    apellido: headerIndex(headers, ["Apellido"]),
    prof1: headerIndex(headers, ["Prof 1", "Profesor 1"]),
    prof2: headerIndex(headers, ["Prof 2", "Profesor 2"]),
    prof3: headerIndex(headers, ["Prof 3", "Profesor 3"]),
    asis1: headerIndex(headers, ["Asis 1", "Asistente 1"]),
    correo: headerIndex(headers, ["Correo", "Email", "Mail", "docentes"]),
    correo1: headerIndex(headers, ["Correo 1", "Email 1", "Correo Prof 1", "Mail Prof 1"]),
    correo2: headerIndex(headers, ["Correo 2", "Email 2", "Correo Prof 2", "Mail Prof 2"]),
    correo3: headerIndex(headers, ["Correo 3", "Email 3", "Correo Prof 3", "Mail Prof 3"]),
    correoAsis1: headerIndex(headers, ["Correo Asis 1", "Email Asis 1", "Correo Asistente 1"])
  };

  const inferredCareer = inferCarreraFromFilePath(filePath);
  const carreraNombre = options.carreraNombre || inferredCareer || "IngenierÃƒÂ­a InformÃƒÂ¡tica";
  const anioLectivo = parseYearFromFileName(filePath);
  const horarioMap = entity === "horarios" ? buildHorarioMap(workbook) : null;

  const getCarrera = sqlite.prepare("SELECT id FROM carreras WHERE nombre = ?");
  const insertCarrera = sqlite.prepare("INSERT INTO carreras (nombre) VALUES (?)");
  const linkGrupoCarrera = sqlite.prepare(
    "INSERT OR IGNORE INTO grupo_carrera (id_grupo, id_carrera) VALUES (?, ?)"
  );

  const getSemestre = sqlite.prepare(
    "SELECT id FROM semestres WHERE numero_semestre = ? AND anio = ?"
  );
  const insertSemestre = sqlite.prepare(
    "INSERT INTO semestres (numero_semestre, anio) VALUES (?, ?)"
  );

  const getMateria = sqlite.prepare("SELECT id, requerimientosSalon FROM materias WHERE nombre = ?");
  const insertMateria = sqlite.prepare(
    "INSERT INTO materias (tipo, creditos, nombre, tiene_correlativa, requerimientosSalon) VALUES (?, ?, ?, 0, ?)"
  );
  const updateMateria = sqlite.prepare(
    "UPDATE materias SET tipo = ?, creditos = ?, requerimientosSalon = ? WHERE id = ?"
  );
  const linkMateriaCarrera = sqlite.prepare(
    "INSERT OR IGNORE INTO materia_carrera (id_materia, id_carrera, plan, semestre, anio) VALUES (?, ?, ?, ?, ?)"
  );
  const updateMateriaCarrera = sqlite.prepare(
    "UPDATE materia_carrera SET plan = ?, semestre = ?, anio = ? WHERE id_materia = ? AND id_carrera = ?"
  );

  const getGrupo = sqlite.prepare("SELECT id FROM grupos WHERE codigo = ?");
  const insertGrupo = sqlite.prepare(
    "INSERT INTO grupos (codigo, id_materia, horas_anuales, es_contrasemestre, cupo, id_semestre, color) VALUES (?, ?, ?, 0, ?, ?, ?)"
  );
  const updateGrupo = sqlite.prepare(
    "UPDATE grupos SET id_materia = ?, horas_anuales = ?, cupo = ?, id_semestre = ?, color = ? WHERE id = ?"
  );

  const getProfesorByFullName = sqlite.prepare(
    "SELECT id FROM profesores WHERE trim(nombre || ' ' || apellido) = ?"
  );
  const getProfesorByCorreo = sqlite.prepare("SELECT id FROM profesores WHERE correo = ?");
  const insertProfesor = sqlite.prepare(
    "INSERT INTO profesores (nombre, apellido, correo) VALUES (?, ?, ?)"
  );

  const getSalonByNombreEdificio = sqlite.prepare(
    "SELECT id FROM salones WHERE nombre = ? AND edificio = ?"
  );
  const getSalonByNombre = sqlite.prepare("SELECT id FROM salones WHERE nombre = ?");
  const insertSalon = sqlite.prepare(
    "INSERT INTO salones (nombre, edificio, aforo) VALUES (?, ?, ?)"
  );

  const getHorario = sqlite.prepare("SELECT id FROM horarios WHERE dia = ? AND modulo = ?");
  const insertHorario = sqlite.prepare("INSERT INTO horarios (dia, modulo) VALUES (?, ?)");
  const linkGrupoHorario = sqlite.prepare(
    "INSERT OR IGNORE INTO grupo_horario (id_grupo, id_horario) VALUES (?, ?)"
  );

  const summary = {
    filePath,
    entity,
    carreraUsada: carreraNombre,
    totalRows: dataRows.length,
    inserted: {
      carreras: 0,
      semestres: 0,
      materias: 0,
      grupos: 0,
      profesores: 0,
      salones: 0,
      horarios: 0
    },
    updated: {
      materias: 0,
      grupos: 0
    },
    skipped: {
      rowsWithoutCourse: 0,
      rowsWithoutClassId: 0,
      rowsWithoutSemestre: 0
    },
    warnings: []
  };

  const run = sqlite.transaction(() => {
    if (entity === "carreras") {
      const seen = new Set();
      for (const row of dataRows) {
        const fromRow = normalizeText(row[idx.carrera >= 0 ? idx.carrera : -1]);
        const fromPlan = parseCarreraFromPlan(normalizeText(row[idx.plan >= 0 ? idx.plan : -1]));
        const fromCurso = normalizeText(row[idx.curso >= 0 ? idx.curso : -1]);
        const candidate = fromRow || fromPlan || fromCurso || carreraNombre;
        if (!candidate || seen.has(candidate.toLowerCase())) continue;
        seen.add(candidate.toLowerCase());
        if (!getCarrera.get(candidate)) {
          insertCarrera.run(candidate);
          summary.inserted.carreras += 1;
        }
      }
      return;
    }

    const usedEmails = new Set();
    const carreraCache = new Map();
    const ensureCarrera = (name) => {
      const normalized = normalizeText(name);
      if (!normalized) return null;
      if (carreraCache.has(normalized)) return carreraCache.get(normalized);
      let carrera = getCarrera.get(normalized);
      if (!carrera) {
        const result = insertCarrera.run(normalized);
        carrera = { id: Number(result.lastInsertRowid) };
        summary.inserted.carreras += 1;
      }
      carreraCache.set(normalized, carrera);
      return carrera;
    };

    for (const row of dataRows) {
      const curso = normalizeText(getCell(row, idx.curso));
      const idClase = normalizeText(getCell(row, idx.idClase)).toUpperCase();
      const horas = parseFloatSafe(getCell(row, idx.horas), 0);
      const cupo = parseIntSafe(getCell(row, idx.cupo), 0);
      const tipo = parseTipo(getCell(row, idx.tipo));
      const creditos = parseIntSafe(getCell(row, idx.creditos), 0);
      const cx = normalizeText(getCell(row, idx.cx));
      const planRaw = normalizeText(getCell(row, idx.plan));
      const semestreRaw = normalizeText(getCell(row, idx.semestre));
      const rowCarreraRaw = normalizeText(getCell(row, idx.carrera));
      const req = idx.requerimiento >= 0 ? normalizeText(getCell(row, idx.requerimiento)) : "";

      if ((entity === "materias" || entity === "grupos") && !curso) {
        summary.skipped.rowsWithoutCourse += 1;
        continue;
      }

      const hasHorarioDirecto = normalizeText(getCell(row, idx.dia)) !== "" && parseIntSafe(getCell(row, idx.modulo), 0) > 0;
      if ((entity === "grupos" || (entity === "horarios" && !hasHorarioDirecto)) && !idClase) {
        summary.skipped.rowsWithoutClassId += 1;
        continue;
      }

      let planData = null;
      if (entity === "semestres" || entity === "grupos" || entity === "materias") {
        planData = parsePlanAndSemestre({
          cx,
          plan: planRaw,
          semestre: semestreRaw,
          fallbackYear: anioLectivo
        });
        if (!planData?.semestreLectivo) {
          summary.skipped.rowsWithoutSemestre += 1;
          continue;
        }
      }

      if (entity === "semestres") {
        if (!getSemestre.get(planData.semestreLectivo, planData.anioPlan)) {
          insertSemestre.run(planData.semestreLectivo, planData.anioPlan);
          summary.inserted.semestres += 1;
        }
        continue;
      }

      if (entity === "materias") {
        const carreraRowName = resolveCarreraNombre({
          rowCarrera: rowCarreraRaw,
          plan: planData?.plan || planRaw,
          fallbackCarrera: carreraNombre
        });
        const carrera = ensureCarrera(carreraRowName || carreraNombre);
        if (!carrera) {
          summary.skipped.rowsWithoutCourse += 1;
          continue;
        }

        let materia = getMateria.get(curso);
        if (!materia) {
          const materiaResult = insertMateria.run(tipo || "Semestral", creditos || 0, curso, req || null);
          materia = { id: Number(materiaResult.lastInsertRowid) };
          summary.inserted.materias += 1;
        } else {
          updateMateria.run(
            tipo || "Semestral",
            creditos || 0,
            req || materia.requerimientosSalon || null,
            materia.id
          );
          summary.updated.materias += 1;
        }

        const mcResult = linkMateriaCarrera.run(
          materia.id,
          carrera.id,
          planData.plan,
          planData.semestreCarrera,
          planData.anioCarrera
        );
        if (mcResult.changes === 0) {
          updateMateriaCarrera.run(
            planData.plan,
            planData.semestreCarrera,
            planData.anioCarrera,
            materia.id,
            carrera.id
          );
        }
        continue;
      }

      if (entity === "grupos") {
        const carreraRowName = resolveCarreraNombre({
          rowCarrera: normalizeText(getCell(row, idx.carrera)),
          plan: planData?.plan || planRaw,
          fallbackCarrera: carreraNombre
        });
        const carrera = ensureCarrera(carreraRowName || carreraNombre);
        if (!carrera) {
          summary.skipped.rowsWithoutCourse += 1;
          continue;
        }

        let materia = getMateria.get(curso);
        if (!materia) {
          const materiaResult = insertMateria.run(tipo || "Semestral", creditos || 0, curso, req || null);
          materia = { id: Number(materiaResult.lastInsertRowid) };
          summary.inserted.materias += 1;
        }

        let semestre = getSemestre.get(planData.semestreLectivo, planData.anioPlan);
        if (!semestre) {
          const semResult = insertSemestre.run(planData.semestreLectivo, planData.anioPlan);
          semestre = { id: Number(semResult.lastInsertRowid) };
          summary.inserted.semestres += 1;
        }

        const color = normalizeText(getCell(row, idx.color)) || normalizeText(options.color) || "#2563EB";
        const grupo = getGrupo.get(idClase);
        let grupoId = null;
        if (!grupo) {
          const result = insertGrupo.run(
            idClase,
            materia.id,
            String(horas),
            cupo || null,
            semestre.id,
            color
          );
          grupoId = Number(result.lastInsertRowid);
          summary.inserted.grupos += 1;
        } else {
          grupoId = Number(grupo.id);
          updateGrupo.run(
            materia.id,
            String(horas),
            cupo || null,
            semestre.id,
            color,
            grupo.id
          );
          summary.updated.grupos += 1;
        }

        if (grupoId) {
          linkGrupoCarrera.run(grupoId, carrera.id);
        }
        continue;
      }

      if (entity === "profesores") {
        const nombreSimple = normalizeText(getCell(row, idx.nombre));
        const apellidoSimple = normalizeText(getCell(row, idx.apellido));
        const nombreCompletoSimple = `${nombreSimple} ${apellidoSimple}`.trim();
        const docentes = [
          {
            nombreCompleto: normalizeText(getCell(row, idx.profesor)) || nombreCompletoSimple,
            correoPreferido: normalizeText(getCell(row, idx.correo))
          },
          {
            nombreCompleto: normalizeText(getCell(row, idx.prof1)),
            correoPreferido: normalizeText(getCell(row, idx.correo1 >= 0 ? idx.correo1 : idx.correo))
          },
          {
            nombreCompleto: normalizeText(getCell(row, idx.prof2)),
            correoPreferido: normalizeText(getCell(row, idx.correo2 >= 0 ? idx.correo2 : -1))
          },
          {
            nombreCompleto: normalizeText(getCell(row, idx.prof3)),
            correoPreferido: normalizeText(getCell(row, idx.correo3 >= 0 ? idx.correo3 : -1))
          },
          {
            nombreCompleto: normalizeText(getCell(row, idx.asis1)),
            correoPreferido: normalizeText(getCell(row, idx.correoAsis1 >= 0 ? idx.correoAsis1 : -1))
          }
        ].filter((d) => d.nombreCompleto !== "" && d.nombreCompleto.toUpperCase() !== "TBD");

        docentes.forEach((docenteData) => {
          const { nombre, apellido } = splitName(docenteData.nombreCompleto);
          if (!nombre || !apellido) return;
          let profesor = getProfesorByFullName.get(`${nombre} ${apellido}`);
          if (!profesor) {
            let candidate = "";
            const preferredEmail = normalizeEmail(docenteData.correoPreferido);
            if (
              isValidEmail(preferredEmail) &&
              !usedEmails.has(preferredEmail) &&
              !getProfesorByCorreo.get(preferredEmail)
            ) {
              candidate = preferredEmail;
            } else {
              const base = slugify(`${nombre}.${apellido}`) || "docente.import";
              candidate = `${base}@import.local`;
              let suffix = 1;
              while (usedEmails.has(candidate) || getProfesorByCorreo.get(candidate)) {
                suffix += 1;
                candidate = `${base}.${suffix}@import.local`;
              }
            }
            usedEmails.add(candidate);
            insertProfesor.run(nombre, apellido, candidate);
            summary.inserted.profesores += 1;
          }
        });
        continue;
      }

      if (entity === "salones") {
        const directNombre = normalizeText(getCell(row, idx.salonNombre));
        const directEdificio = normalizeText(getCell(row, idx.salonEdificio)) || "Sin edificio";
        const directAforo = parseIntSafe(getCell(row, idx.salonAforo), 0);
        const salones = directNombre
          ? [{ nombre: directNombre, edificio: directEdificio, aforo: directAforo }]
          : parseSalonCell(getCell(row, idx.salon)).map((s) => ({ ...s, aforo: 0 }));
        for (const salonData of salones) {
          const salon =
            getSalonByNombreEdificio.get(salonData.nombre, salonData.edificio) ||
            getSalonByNombre.get(salonData.nombre);
          if (!salon) {
            insertSalon.run(salonData.nombre, salonData.edificio, salonData.aforo || 0);
            summary.inserted.salones += 1;
          }
        }
        continue;
      }

      if (entity === "horarios") {
        const directDia = normalizeText(getCell(row, idx.dia));
        const directModulo = parseIntSafe(getCell(row, idx.modulo), 0);
        const grupo = idClase ? getGrupo.get(idClase) : null;

        const ensureHorario = (dia, modulo) => {
          if (!dia || !modulo) return null;
          let horario = getHorario.get(dia, modulo);
          if (!horario) {
            const result = insertHorario.run(dia, modulo);
            horario = { id: Number(result.lastInsertRowid) };
            summary.inserted.horarios += 1;
          }
          return horario;
        };

        if (directDia && directModulo > 0) {
          const horario = ensureHorario(directDia, directModulo);
          if (horario?.id && grupo?.id) {
            linkGrupoHorario.run(Number(grupo.id), Number(horario.id));
          }
        } else {
          const horarios = horarioMap?.get(idClase) || new Set();
          for (const item of horarios) {
            const [dia, moduloStr] = item.split("|");
            const modulo = Number(moduloStr);
            const horario = ensureHorario(dia, modulo);
            if (horario?.id && grupo?.id) {
              linkGrupoHorario.run(Number(grupo.id), Number(horario.id));
            }
          }
        }
      }
    }
  });

  run();
  return summary;
}

