// db/db.js
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { app } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* const basePath = app.isPackaged
  ? app.getPath("userData")
  : __dirname; */
  const basePath = app.getPath("userData");

// Base en la carpeta del proyecto
const dbPath = path.join(basePath, "local-dev.sqlite");
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

export function closeDatabase() {
  try {
    // Fuerza volcado de WAL a archivo principal antes de cerrar.
    sqlite.pragma("wal_checkpoint(FULL)");
  } catch (error) {
    console.warn("No se pudo ejecutar wal_checkpoint(FULL):", error?.message || error);
  }

  try {
    sqlite.close();
  } catch (error) {
    console.warn("No se pudo cerrar SQLite:", error?.message || error);
  }
}