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
  { key: "Plan", required: false, note: "Plan combinado. Ej: Ingenieria Informatica 2026" },
  { key: "Semestre", required: false, note: "Numero de semestre. Ej: 1" },
  { key: "Curso", required: false, note: "Nombre de materia" },
  { key: "Tipo", required: false, note: "A/B/D o texto" },
  { key: "Horas", required: false, note: "Carga horaria" },
  { key: "Horas anuales", required: false, note: "Alias DB de horas (grupos.horas_anuales)" },
  { key: "ID Clase", required: false, note: "Codigo unico del grupo" },
  { key: "Codigo", required: false, note: "Alias DB de ID Clase (grupos.codigo)" },
  { key: "Cupo", required: false, note: "Cantidad maxima" },
  { key: "Color", required: false, note: "Color del grupo. Ej: #2563EB" },
  { key: "Creditos", required: false, note: "Creditos de la materia" },
  { key: "Requerim. salon", required: false, note: "Requerimiento de aula" },
  { key: "Salon", required: false, note: "Ej: A101 (Central)" },
  { key: "Nombre salon", required: false, note: "Nombre del salon (tabla salones.nombre)" },
  { key: "Edificio", required: false, note: "Edificio del salon (tabla salones.edificio)" },
  { key: "Aforo", required: false, note: "Aforo del salon (tabla salones.aforo)" },
  { key: "Dia", required: false, note: "Dia del horario. Ej: Lunes" },
  { key: "Modulo", required: false, note: "Modulo del horario. Ej: 1" },
  { key: "Profesor", required: false, note: "Nombre completo (import parcial profesores)" },
  { key: "Nombre", required: false, note: "Nombre del profesor" },
  { key: "Apellido", required: false, note: "Apellido del profesor" },
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

function buildColumns(requiredKeys, includeOptional = true) {
  const requiredSet = new Set(requiredKeys);
  const base = includeOptional
    ? COMMON_COLUMNS
    : COMMON_COLUMNS.filter((column) => requiredSet.has(column.key));
  return base.map((column) => ({ ...column, required: requiredSet.has(column.key) }));
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

function addGuideSheet(workbook, columns, title, importType, profileType) {
  const ws = workbook.addWorksheet("Guia");
  ws.addRow([`Template: ${title}`]);
  ws.addRow([`Tipo importacion: ${importType}`]);
  ws.addRow([`Perfil: ${profileType}`]);
  ws.addRow([
    "Nota",
    profileType === "MINIMO"
      ? "Este template incluye solo columnas obligatorias."
      : "Este template incluye columnas obligatorias y opcionales."
  ]);
  ws.addRow(["Importante", "Las columnas opcionales solo se importan si tienen datos."]);
  ws.addRow([]);
  ws.addRow(["Campo", "Uso", "Estado"]);

  const hdr = ws.getRow(7);
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
  ws.getColumn(2).width = 56;
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

async function writeTemplate({
  fileName,
  requiredKeys,
  title,
  importType,
  rows,
  includeHorarioSheet = false,
  includeOptional = true,
  profileType = "COMPLETO"
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CalendarioFIT";
  workbook.created = new Date();

  const columns = buildColumns(requiredKeys, includeOptional);
  const ws = workbook.addWorksheet("Modulos");
  styleHeaderRow(ws, columns);
  addDataRows(ws, columns, rows);
  addGuideSheet(workbook, columns, title, importType, profileType);
  if (includeHorarioSheet) addHorarioSheet(workbook);

  await workbook.xlsx.writeFile(path.join(outDir, fileName));
}

async function writeTemplatePair(definition) {
  const {
    fileBaseName,
    requiredKeys,
    title,
    importType,
    rows,
    includeHorarioSheet = false,
    keepLegacyAsMinimal = false
  } = definition;

  await writeTemplate({
    fileName: `${fileBaseName}_minimo.xlsx`,
    requiredKeys,
    title: `${title} (Minimo)`,
    importType,
    rows,
    includeHorarioSheet,
    includeOptional: false,
    profileType: "MINIMO"
  });

  await writeTemplate({
    fileName: `${fileBaseName}_completo.xlsx`,
    requiredKeys,
    title: `${title} (Completo)`,
    importType,
    rows,
    includeHorarioSheet,
    includeOptional: true,
    profileType: "COMPLETO"
  });

  if (keepLegacyAsMinimal) {
    await writeTemplate({
      fileName: `${fileBaseName}.xlsx`,
      requiredKeys,
      title: `${title} (Legacy-Minimo)`,
      importType,
      rows,
      includeHorarioSheet,
      includeOptional: false,
      profileType: "MINIMO"
    });
  }
}

const baseRows = [
  {
    Plan: "Ingenieria Informatica 2026",
    Semestre: "1",
    Carrera: "Ingenieria Informatica",
    Curso: "Programacion 1",
    Tipo: "B",
    Horas: "96",
    "Horas anuales": "96",
    "ID Clase": "INF-101",
    Codigo: "INF-101",
    Cupo: "40",
    Color: "#2563EB",
    Creditos: "8",
    "Requerim. salon": "Proyector",
    Salon: "A101 (Central)",
    "Nombre salon": "A101",
    Edificio: "Central",
    Aforo: "40",
    Dia: "Lunes",
    Modulo: "1",
    Profesor: "Ana Perez",
    Nombre: "Ana",
    Apellido: "Perez",
    Correo: "ana.perez@ucu.edu.uy",
    "Prof 1": "Ana Perez",
    "Correo 1": "ana.perez@ucu.edu.uy",
    "Prof 2": "Luis Gomez",
    "Correo 2": "luis.gomez@ucu.edu.uy",
    "Asis 1": "Sofia Diaz",
    "Correo Asis 1": "sofia.diaz@ucu.edu.uy"
  },
  {
    Plan: "Ingenieria Informatica 2026",
    Semestre: "2",
    Carrera: "Ingenieria Informatica",
    Curso: "Fisica 2",
    Tipo: "A",
    Horas: "120",
    "Horas anuales": "120",
    "ID Clase": "FIS-201",
    Codigo: "FIS-201",
    Cupo: "35",
    Color: "#16A34A",
    Creditos: "10",
    "Requerim. salon": "Laboratorio",
    Salon: "Lab 2 (Ciencias)",
    "Nombre salon": "Lab 2",
    Edificio: "Ciencias",
    Aforo: "35",
    Dia: "Martes",
    Modulo: "2",
    Profesor: "Martin Silva",
    Nombre: "Martin",
    Apellido: "Silva",
    Correo: "martin.silva@ucu.edu.uy",
    "Prof 1": "Martin Silva",
    "Correo 1": "martin.silva@ucu.edu.uy"
  }
];

await writeTemplatePair({
  fileBaseName: "template_importacion_modulos",
  requiredKeys: ["Plan", "Semestre", "Curso", "Tipo", "Creditos", "Codigo", "Horas anuales", "Cupo"],
  title: "Importacion de modulos",
  importType: "IMPORTAR EXCEL (MODULOS)",
  rows: baseRows,
  includeHorarioSheet: true,
  keepLegacyAsMinimal: false
});

await writeTemplatePair({
  fileBaseName: "template_importacion_carreras",
  requiredKeys: ["Carrera"],
  title: "Importacion carreras",
  importType: "IMPORTAR DATOS UNICOS > carreras",
  rows: [{ Carrera: "Ingenieria Informatica" }, { Carrera: "Ingenieria Industrial" }]
});

await writeTemplatePair({
  fileBaseName: "template_importacion_materias",
  requiredKeys: ["Carrera", "Plan", "Semestre", "Curso", "Tipo", "Creditos"],
  title: "Importacion materias",
  importType: "IMPORTAR DATOS UNICOS > materias",
  rows: baseRows
});

await writeTemplatePair({
  fileBaseName: "template_importacion_grupos",
  requiredKeys: ["Plan", "Semestre", "Curso", "Codigo", "Horas anuales", "Cupo", "Color"],
  title: "Importacion grupos",
  importType: "IMPORTAR DATOS UNICOS > grupos",
  rows: baseRows
});

await writeTemplatePair({
  fileBaseName: "template_importacion_profesores",
  requiredKeys: ["Nombre", "Apellido", "Correo"],
  title: "Importacion profesores",
  importType: "IMPORTAR DATOS UNICOS > profesores",
  rows: baseRows
});

await writeTemplatePair({
  fileBaseName: "template_importacion_salones",
  requiredKeys: ["Nombre salon", "Edificio", "Aforo"],
  title: "Importacion salones",
  importType: "IMPORTAR DATOS UNICOS > salones",
  rows: baseRows
});

await writeTemplatePair({
  fileBaseName: "template_importacion_semestres",
  requiredKeys: ["Plan", "Semestre"],
  title: "Importacion semestres",
  importType: "IMPORTAR DATOS UNICOS > semestres",
  rows: baseRows
});

await writeTemplatePair({
  fileBaseName: "template_importacion_horarios",
  requiredKeys: ["Dia", "Modulo"],
  title: "Importacion horarios",
  importType: "IMPORTAR DATOS UNICOS > horarios",
  rows: baseRows,
  includeHorarioSheet: true
});

console.log(`Templates generadas en: ${outDir}`);
