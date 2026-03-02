import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";

const outDir = path.join(process.cwd(), "exports", "templates", "importacion");
fs.mkdirSync(outDir, { recursive: true });

const COLORS = {
  required: "FF92D050",
  optional: "FFFFFF99",
  guideHeader: "FFBDD7EE",
  white: "FFFFFFFF"
};

const COMMON_COLUMNS = [
  { key: "Carrera", required: false, note: "Nombre de carrera" },
  { key: "CX", required: false, note: "Plan/Semestre. Ej: P2026-Sem1" },
  { key: "Curso", required: false, note: "Nombre de materia" },
  { key: "Tipo", required: false, note: "A/B/D o texto" },
  { key: "Horas", required: false, note: "Carga horaria" },
  { key: "ID Clase", required: false, note: "Codigo unico del grupo" },
  { key: "Cupo", required: false, note: "Cantidad maxima" },
  { key: "Creditos", required: false, note: "Creditos de la materia" },
  { key: "Requerim. salon", required: false, note: "Requerimiento de aula" },
  { key: "Salon", required: false, note: "Ej: A101 (Central)" },
  { key: "Profesor", required: false, note: "Nombre completo (import parcial profesores)" },
  { key: "Correo", required: false, note: "Mail para Profesor" },
  { key: "Prof 1", required: false, note: "Docente principal" },
  { key: "Correo 1", required: false, note: "Mail de Prof 1" },
  { key: "Prof 2", required: false, note: "Docente secundario" },
  { key: "Correo 2", required: false, note: "Mail de Prof 2" },
  { key: "Prof 3", required: false, note: "Docente secundario" },
  { key: "Correo 3", required: false, note: "Mail de Prof 3" },
  { key: "Asis 1", required: false, note: "Asistente" },
  { key: "Correo Asis 1", required: false, note: "Mail de asistente" }
];

function buildColumns(requiredKeys) {
  const requiredSet = new Set(requiredKeys);
  return COMMON_COLUMNS.map((c) => ({ ...c, required: requiredSet.has(c.key) }));
}

function styleHeaderRow(ws, columns) {
  const row = ws.getRow(1);
  row.height = 24;
  columns.forEach((col, idx) => {
    const cell = row.getCell(idx + 1);
    cell.value = col.key;
    cell.font = { bold: true, color: { argb: "FF000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: col.required ? COLORS.required : COLORS.optional }
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
    ws.getColumn(idx + 1).width = Math.max(14, String(col.key).length + 4);
  });
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

function addDataRows(ws, columns, rows) {
  const keys = columns.map((c) => c.key);
  rows.forEach((obj) => {
    ws.addRow(keys.map((k) => (obj[k] ?? "")));
  });
}

function addGuideSheet(workbook, columns, title, importType) {
  const ws = workbook.addWorksheet("Guia");
  ws.addRow([`Template: ${title}`]);
  ws.addRow([`Tipo importacion: ${importType}`]);
  ws.addRow([]);
  ws.addRow(["Campo", "Uso", "Estado"]);

  const hdr = ws.getRow(4);
  for (let i = 1; i <= 3; i += 1) {
    const c = hdr.getCell(i);
    c.font = { bold: true };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.guideHeader } };
    c.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  }

  columns.forEach((col) => {
    const r = ws.addRow([col.key, col.note || "", col.required ? "Obligatorio" : "Opcional"]);
    const fill = col.required ? COLORS.required : COLORS.optional;
    r.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });
  });

  ws.getColumn(1).width = 24;
  ws.getColumn(2).width = 42;
  ws.getColumn(3).width = 16;
}

function addHorarioSheet(workbook) {
  const ws = workbook.addWorksheet("Sem1");
  ws.addRow(["", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]);
  ws.addRow(["08:00-09:30", "N de clase INF-101", "", "", "", ""]);
  ws.addRow(["09:30-11:00", "", "N de clase FIS-201", "", "", ""]);

  ws.getRow(1).font = { bold: true };
  ws.getRow(1).alignment = { horizontal: "center", vertical: "middle" };
  for (let c = 1; c <= 6; c += 1) {
    ws.getColumn(c).width = c === 1 ? 16 : 20;
  }
}

async function writeTemplate({ fileName, requiredKeys, title, importType, rows, includeHorarioSheet = false }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CalendarioFIT";
  workbook.created = new Date();

  const columns = buildColumns(requiredKeys);
  const ws = workbook.addWorksheet("Modulos");
  styleHeaderRow(ws, columns);
  addDataRows(ws, columns, rows);
  addGuideSheet(workbook, columns, title, importType);
  if (includeHorarioSheet) addHorarioSheet(workbook);

  await workbook.xlsx.writeFile(path.join(outDir, fileName));
}

const baseRows = [
  {
    "CX": "P2026-Sem1",
    "Carrera": "Ingenieria Informatica",
    "Curso": "Programacion 1",
    "Tipo": "B",
    "Horas": "96",
    "ID Clase": "INF-101",
    "Cupo": "40",
    "Creditos": "8",
    "Requerim. salon": "Proyector",
    "Salon": "A101 (Central)",
    "Profesor": "Ana Perez",
    "Correo": "ana.perez@ucu.edu.uy",
    "Prof 1": "Ana Perez",
    "Correo 1": "ana.perez@ucu.edu.uy",
    "Prof 2": "Luis Gomez",
    "Correo 2": "luis.gomez@ucu.edu.uy",
    "Asis 1": "Sofia Diaz",
    "Correo Asis 1": "sofia.diaz@ucu.edu.uy"
  },
  {
    "CX": "P2026-Sem2",
    "Carrera": "Ingenieria Informatica",
    "Curso": "Fisica 2",
    "Tipo": "A",
    "Horas": "120",
    "ID Clase": "FIS-201",
    "Cupo": "35",
    "Creditos": "10",
    "Requerim. salon": "Laboratorio",
    "Salon": "Lab 2 (Ciencias)",
    "Profesor": "Martin Silva",
    "Correo": "martin.silva@ucu.edu.uy",
    "Prof 1": "Martin Silva",
    "Correo 1": "martin.silva@ucu.edu.uy"
  }
];

await writeTemplate({
  fileName: "template_importacion_modulos_completo.xlsx",
  requiredKeys: ["Curso", "ID Clase"],
  title: "Importacion completa de modulos",
  importType: "IMPORTAR EXCEL (MODULOS)",
  rows: baseRows,
  includeHorarioSheet: true
});

await writeTemplate({
  fileName: "template_importacion_carreras.xlsx",
  requiredKeys: ["Carrera"],
  title: "Importacion carreras",
  importType: "IMPORTAR DATOS UNICOS > carreras",
  rows: [{ "Carrera": "Ingenieria Informatica" }, { "Carrera": "Ingenieria Industrial" }]
});

await writeTemplate({
  fileName: "template_importacion_materias.xlsx",
  requiredKeys: ["Curso"],
  title: "Importacion materias",
  importType: "IMPORTAR DATOS UNICOS > materias",
  rows: baseRows
});

await writeTemplate({
  fileName: "template_importacion_grupos.xlsx",
  requiredKeys: ["Curso", "ID Clase"],
  title: "Importacion grupos",
  importType: "IMPORTAR DATOS UNICOS > grupos",
  rows: baseRows
});

await writeTemplate({
  fileName: "template_importacion_profesores.xlsx",
  requiredKeys: ["Profesor", "Correo"],
  title: "Importacion profesores",
  importType: "IMPORTAR DATOS UNICOS > profesores",
  rows: baseRows
});

await writeTemplate({
  fileName: "template_importacion_salones.xlsx",
  requiredKeys: ["Salon"],
  title: "Importacion salones",
  importType: "IMPORTAR DATOS UNICOS > salones",
  rows: baseRows
});

await writeTemplate({
  fileName: "template_importacion_semestres.xlsx",
  requiredKeys: ["CX"],
  title: "Importacion semestres",
  importType: "IMPORTAR DATOS UNICOS > semestres",
  rows: baseRows
});

await writeTemplate({
  fileName: "template_importacion_horarios.xlsx",
  requiredKeys: ["ID Clase"],
  title: "Importacion horarios",
  importType: "IMPORTAR DATOS UNICOS > horarios",
  rows: baseRows,
  includeHorarioSheet: true
});

console.log(`Templates generadas en: ${outDir}`);
