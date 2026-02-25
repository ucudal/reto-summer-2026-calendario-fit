const Database = require("better-sqlite3");

const db = new Database("db/local-dev.sqlite");
const carreras = [
  "Ingeniería Agronómica",
  "Ingeniería Alimentos",
  "Ingeniería Ambiental",
  "Ingeniería Biomédica",
  "Ingeniería Civil",
  "Ingeniería Eléctrica, Telecom y Potencia",
  "Ingeniería Informática",
  "Ingeniería Industrial",
  "Ingeniería Inteligencia Artificial",
  "Ingeniería Mecánica"
];

const insert = db.prepare("INSERT OR IGNORE INTO carreras (nombre) VALUES (?)");
let added = 0;
for (const carrera of carreras) {
  const result = insert.run(carrera);
  if (result.changes > 0) added += 1;
}

const rows = db.prepare("SELECT id, nombre FROM carreras ORDER BY nombre").all();
console.log("added", added);
console.log("total", rows.length);
for (const row of rows) {
  console.log(`${row.id} - ${row.nombre}`);
}
