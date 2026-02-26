import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

function getArg(name, defaultValue = "") {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return defaultValue;
  return String(process.argv[index + 1] ?? defaultValue).trim();
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function sqlText(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runSql(dbPath, sql) {
  const result = spawnSync("sqlite3", [dbPath, sql], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    const stderr = String(result.stderr || "").trim();
    throw new Error(stderr || "Error ejecutando sqlite3.");
  }

  return String(result.stdout || "");
}

function main() {
  const dbPath = resolve(process.cwd(), "db", "local-dev.sqlite");
  const lectiveYear = getArg("lectiveYear");
  const semester = getArg("semester");
  const academicYear = getArg("academicYear");
  const subject = getArg("subject");
  const codeContains = getArg("codeContains");
  const dryRun = hasFlag("dryRun");

  if (!existsSync(dbPath)) {
    console.error(`No existe la base en: ${dbPath}`);
    process.exit(1);
  }

  if (!/^\d{4}$/.test(lectiveYear)) {
    console.error("Debes pasar --lectiveYear con 4 digitos. Ej: --lectiveYear 2028");
    process.exit(1);
  }

  const where = [
    "g.codigo IS NOT NULL",
    "g.codigo NOT LIKE '%__LY____'"
  ];

  if (semester) where.push(`g.semestre = ${Number(semester)}`);
  if (academicYear) where.push(`g.anio = ${Number(academicYear)}`);
  if (subject) where.push(`LOWER(m.nombre) LIKE LOWER(${sqlText(`%${subject}%`)})`);
  if (codeContains) where.push(`LOWER(g.codigo) LIKE LOWER(${sqlText(`%${codeContains}%`)})`);

  const whereSql = where.join(" AND ");
  const selectSql = `
SELECT g.id, g.codigo, m.nombre, g.semestre, g.anio
FROM grupos g
LEFT JOIN materias m ON m.id = g.id_materia
WHERE ${whereSql}
ORDER BY g.id;
`;

  const rawRows = runSql(dbPath, `${selectSql}`);
  const rows = rawRows
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    console.log("No hay grupos para corregir con esos filtros.");
    return;
  }

  console.log(`Grupos encontrados: ${rows.length}`);
  rows.slice(0, 20).forEach((line) => console.log(`- ${line}`));
  if (rows.length > 20) console.log(`... y ${rows.length - 20} mas`);

  if (dryRun) {
    console.log("Dry run: no se aplicaron cambios.");
    return;
  }

  const updateSql = `
BEGIN;
UPDATE grupos AS g
SET codigo = TRIM(g.codigo) || '__LY${lectiveYear}'
WHERE ${whereSql};
COMMIT;
SELECT changes();
`;

  const changedRaw = runSql(dbPath, updateSql).trim();
  console.log(`Filas actualizadas: ${changedRaw || "0"}`);
  console.log("Listo.");
}

try {
  main();
} catch (error) {
  console.error(error?.message || String(error));
  process.exit(1);
}

