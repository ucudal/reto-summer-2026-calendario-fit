// db/db.js
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base en la carpeta del proyecto
const dbPath = path.join(__dirname, "", "local-dev.sqlite");
console.log("DB PATH:", dbPath);

const sqlite = new Database(dbPath);

// Habilitar foreign keys
sqlite.pragma("foreign_keys = ON");

// Habilitar WAL para reducir bloqueos en lecturas/escrituras simultáneas
sqlite.pragma("journal_mode = WAL");


export const db = drizzle(sqlite);
