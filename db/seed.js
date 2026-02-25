import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createClient } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "local-dev.sqlite");

export async function seedDatabase() {
  const client = createClient({ url: `file:${dbPath}` });

  try {
    const carrerasData = [
      "Ingenier\u00eda Agron\u00f3mica",
      "Ingenier\u00eda Alimentos",
      "Ingenier\u00eda Ambiental",
      "Ingenier\u00eda Biom\u00e9dica",
      "Ingenier\u00eda Civil",
      "Ingenier\u00eda El\u00e9ctrica, Telecom y Potencia",
      "Ingenier\u00eda Inform\u00e1tica",
      "Ingenier\u00eda Industrial",
      "Ingenier\u00eda Inteligencia Artificial",
      "Ingenier\u00eda Mec\u00e1nica"
    ];

    for (const nombre of carrerasData) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO carreras (nombre) VALUES (?)",
        args: [nombre]
      });
    }

    const materiasData = [
      ["Obligatoria", 6, "Programaci\u00f3n I", 0],
      ["Obligatoria", 4, "\u00c1lgebra Lineal", 0],
      ["Optativa", 3, "Introducci\u00f3n a la IA", 0],
      ["Obligatoria", 5, "Algoritmos y Estructuras de Datos", 1],
      ["Obligatoria", 2, "Bases de Datos", 1]
    ];

    for (const [tipo, creditos, nombre, tieneCorrelativa] of materiasData) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO materias (tipo, creditos, nombre, tiene_correlativa) VALUES (?, ?, ?, ?)",
        args: [tipo, creditos, nombre, tieneCorrelativa]
      });
    }

    const profesoresData = [
      ["Juan", "P\u00e9rez", "juan.perez@ucu.edu.com"],
      ["Ana", "G\u00f3mez", "ana.gomez@ucu.edu.com"],
      ["Mar\u00eda", "L\u00f3pez", "maria.lopez@ucu.edu.com"],
      ["Luis", "Mart\u00ednez", "luis.martinez@ucu.edu.com"],
      ["Sof\u00eda", "Rodr\u00edguez", "sofia.rodriguez@ucu.edu.com"]
    ];

    for (const [nombre, apellido, correo] of profesoresData) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO profesores (nombre, apellido, correo) VALUES (?, ?, ?)",
        args: [nombre, apellido, correo]
      });
    }

    const salonesData = [
      ["A101", "Central", 40],
      ["B202", "Mullin", 30],
      ["C303", "Central", 50],
      ["D404", "San Jose", 25],
      ["E505", "San Ignacio", 35]
    ];

    for (const [nombre, edificio, aforo] of salonesData) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO salones (nombre, edificio, aforo) VALUES (?, ?, ?)",
        args: [nombre, edificio, aforo]
      });
    }

    const horariosData = [
      [1, "Lunes"],
      [2, "Martes"],
      [3, "Mi\u00e9rcoles"],
      [4, "Jueves"],
      [5, "Viernes"]
    ];

    for (const [modulo, dia] of horariosData) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO horarios (modulo, dia) VALUES (?, ?)",
        args: [modulo, dia]
      });
    }

    const reqData = [
      "Proyector",
      "Pizarra blanca",
      "Laboratorio de computaci\u00f3n",
      "Acceso para discapacitados",
      "Conexi\u00f3n a red de alta velocidad"
    ];

    for (const caracteristicas of reqData) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO requerimientos_salon (caracteristicas) VALUES (?)",
        args: [caracteristicas]
      });
    }

    const materiasRows = await client.execute("SELECT id FROM materias ORDER BY id");
    if (!materiasRows.rows.length) {
      console.warn("No se encontraron materias para crear grupos. Se omite la creacion de grupos.");
      return;
    }

    for (let i = 0; i < 5; i++) {
      const materiaId = Number(materiasRows.rows[i % materiasRows.rows.length].id);
      await client.execute({
        sql: `
          INSERT OR IGNORE INTO grupos
          (codigo, id_materia, horas_anuales, es_contrasemestre, cupo, semestre, anio)
          VALUES (?, ?, ?, 0, ?, ?, ?)
        `,
        args: [`G-${100 + i}`, materiaId, `${30 + i * 5}`, 30 + i * 5, (i % 2) + 1, 2026]
      });
    }
  } finally {
    await client.close();
  }
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  seedDatabase()
    .then(() => console.log("Seed completado."))
    .catch((error) => {
      console.error("Error ejecutando seed:", error);
      process.exit(1);
    });
}
