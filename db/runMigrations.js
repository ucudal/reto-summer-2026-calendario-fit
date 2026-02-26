import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import { db } from "./database.js";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Determina la carpeta de migraciones.
 * - Empaquetado: process.resourcesPath/migrations (copiado via extraResources)
 * - Desarrollo: db/drizzle/migrations (carpeta del proyecto)
 */
function getMigrationsPath() {
  if (process.versions.electron) {
    try {
      const req = createRequire(import.meta.url);
      const { app } = req("electron");
      if (app.isPackaged) {
        return path.join(process.resourcesPath, "migrations");
      }
    } catch (_) {}
  }
  return path.join(__dirname, "./drizzle/migrations");
}

export async function runMigrations() {
  const migrationsFolder = getMigrationsPath();
  console.log("MIGRATIONS PATH:", migrationsFolder);

  try {
    // migrate() de better-sqlite3 es síncrono
    migrate(db, { migrationsFolder });
    console.log("Migrations applied");
  } catch (error) {
    const message = String(error?.message || "");
    const causeMessage = String(error?.cause?.message || "");
    const alreadyExists =
      message.includes("already exists") || causeMessage.includes("already exists");

    if (alreadyExists) {
      console.warn("Migrations skipped: schema ya existe.");
      return;
    }

    throw error;
  }
}
