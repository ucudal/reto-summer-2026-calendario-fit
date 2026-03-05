import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { app } from "electron";

// recrear __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Ejecuta las migraciones sobre el mismo archivo que usa la aplicación.
 * Antes se pasaba un path desde el main, pero había inconsistencias entre
 * el fichero en el proyecto y el de "userData" (utilizado por
 * db/database.js).
 *
 * Ahora siempre calculamos la ruta a partir de app.getPath("userData"),
 * igual que en la configuración de conexión, y opcionalmente se puede
 * sobrescribir pasando un parámetro.
 */
export async function runMigrations(dbPath) {
  // si no se dio ruta usaremos la misma basePath que database.js
  if (!dbPath) {
    const basePath = app.getPath("userData");
    dbPath = path.join(basePath, "local-dev.sqlite");
  }

  const client = createClient({ url: `file:${dbPath}` });
  const db = drizzle(client);

  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "./drizzle/migrations")
    });

    console.log("Migrations applied (", dbPath, ")");
  } catch (error) {
    const message = String(error?.message || "");
    const causeMessage = String(error?.cause?.message || "");
    const alreadyExists =
      message.includes("already exists") || causeMessage.includes("already exists");
    const duplicateColumn =
      message.includes("duplicate column name") || causeMessage.includes("duplicate column name");

    if (alreadyExists || duplicateColumn) {
      console.warn("Migrations skipped: esquema/columnas ya existentes.");
      return;
    }

    throw error;
  } finally {
    await client.close();
  }
}