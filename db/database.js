// db/db.js
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Determina la ruta de la base de datos.
 * - En un ejecutable empaquetado: usa app.getPath('userData')
 *   (ej: C:\Users\<user>\AppData\Roaming\calendariofit\)
 *   para que la DB sea persistente y escribible.
 * - En desarrollo: usa la carpeta del proyecto (db/).
 */
function getDbPath() {
  if (process.versions.electron) {
    try {
      const req = createRequire(import.meta.url);
      const { app } = req("electron");
      if (app.isPackaged) {
        const userDataPath = app.getPath("userData");
        return path.join(userDataPath, "local-dev.sqlite");
      }
    } catch (_) {
      // No estamos en el proceso principal de Electron (ej: script CLI)
    }
  }
  return path.join(__dirname, "local-dev.sqlite");
}

const dbPath = getDbPath();
console.log("DB PATH:", dbPath);

// Añadir timeout para evitar bloqueos largos; 5000 ms es razonable
export const sqlite = new Database(dbPath, { timeout: 5000 });

// Habilitar foreign keys
sqlite.pragma("foreign_keys = ON");

// Habilitar WAL para reducir bloqueos en lecturas/escrituras simultáneas
sqlite.pragma("journal_mode = WAL");

// Registrar busy_timeout adicional por si algo lo necesita (en ms)
sqlite.pragma("busy_timeout = 5000");

export const db = drizzle(sqlite);
