import { initDb } from "./database.js";
import { docentesMigration } from "../modules/docentes/docentes.migrations.js";
// más adelante:
// import { alumnosMigration } from "../modules/alumnos/alumnos.migrations.js";

export function runMigrations() {
  const db = initDb();

  db.serialize(() => {
    docentesMigration(db);
    // alumnosMigration(db);
  });
}
