import XLSX from "xlsx";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/check_excel_import.js <ruta_excel>");
  process.exit(1);
}

const db = new Database("db/local-dev.sqlite");
const wb = XLSX.readFile(file, { cellDates: true });
const ws = wb.Sheets["Módulos"];

if (!ws) {
  console.log(JSON.stringify({ ok: false, error: "No existe hoja 'Módulos'" }, null, 2));
  process.exit(0);
}

const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: false });
const header = rows[0] || [];
const idx = (name) => header.findIndex((h) => h === name);
const iCurso = idx("Curso");
const iClase = idx("ID Clase");

const data = rows
  .slice(1)
  .filter((r) => r.some((c) => c !== null && String(c).trim() !== ""))
  .filter((r) => String(r[iCurso] || "").trim() !== "");

const cursoSet = [...new Set(data.map((r) => String(r[iCurso] || "").trim()).filter(Boolean))];
const claseSet = [...new Set(data.map((r) => String(r[iClase] || "").trim().toUpperCase()).filter(Boolean))];

const inMaterias = db.prepare("SELECT nombre FROM materias WHERE nombre = ?");
const inGrupos = db.prepare("SELECT codigo FROM grupos WHERE upper(codigo) = ?");
const byGrupoMateria = db.prepare(`
  SELECT g.codigo, m.nombre as materia
  FROM grupos g
  JOIN materias m ON m.id = g.id_materia
  WHERE upper(g.codigo) = ?
`);

let materiasFound = 0;
let gruposFound = 0;
let grupoMateriaMatch = 0;
const missingMaterias = [];
const missingGrupos = [];
const mismatchedGrupoMateria = [];

for (const c of cursoSet) {
  if (inMaterias.get(c)) materiasFound += 1;
  else missingMaterias.push(c);
}

for (const g of claseSet) {
  if (inGrupos.get(g)) {
    gruposFound += 1;
    const row = byGrupoMateria.get(g);
    const excelRow = data.find((r) => String(r[iClase] || "").trim().toUpperCase() === g);
    const excelCurso = String(excelRow?.[iCurso] || "").trim();
    if (row && row.materia === excelCurso) grupoMateriaMatch += 1;
    else mismatchedGrupoMateria.push({ idClase: g, excelCurso, dbCurso: row ? row.materia : null });
  } else {
    missingGrupos.push(g);
  }
}

const totalCounts = {
  carreras: db.prepare("SELECT COUNT(*) c FROM carreras").get().c,
  materias: db.prepare("SELECT COUNT(*) c FROM materias").get().c,
  grupos: db.prepare("SELECT COUNT(*) c FROM grupos").get().c,
  profesores: db.prepare("SELECT COUNT(*) c FROM profesores").get().c,
  materia_carrera: db.prepare("SELECT COUNT(*) c FROM materia_carrera").get().c,
  profesor_grupo: db.prepare("SELECT COUNT(*) c FROM profesor_grupo").get().c,
  horarios: db.prepare("SELECT COUNT(*) c FROM horarios").get().c,
  grupo_horario: db.prepare("SELECT COUNT(*) c FROM grupo_horario").get().c,
  //requerimientos_salon: db.prepare("SELECT COUNT(*) c FROM requerimientos_salon").get().c,
  //grupo_requerimiento_salon: db.prepare("SELECT COUNT(*) c FROM grupo_requerimiento_salon").get().c,
  salones: db.prepare("SELECT COUNT(*) c FROM salones").get().c,
  salon_grupo: db.prepare("SELECT COUNT(*) c FROM salon_grupo").get().c,
  //salon_requerimiento_salon: db.prepare("SELECT COUNT(*) c FROM salon_requerimiento_salon").get().c
};

console.log(
  JSON.stringify(
    {
      ok: true,
      file,
      sheets: wb.SheetNames.length,
      moduloRowsWithCurso: data.length,
      distinctCursosExcel: cursoSet.length,
      distinctIdClaseExcel: claseSet.length,
      check: {
        materiasFound,
        materiasMissing: missingMaterias.length,
        gruposFound,
        gruposMissing: missingGrupos.length,
        grupoMateriaMatch,
        grupoMateriaMismatch: mismatchedGrupoMateria.length
      },
      totalsInDb: totalCounts,
      preview: {
        sampleMissingMaterias: missingMaterias.slice(0, 10),
        sampleMissingGrupos: missingGrupos.slice(0, 10),
        sampleGrupoMateriaMismatch: mismatchedGrupoMateria.slice(0, 10)
      }
    },
    null,
    2
  )
);
