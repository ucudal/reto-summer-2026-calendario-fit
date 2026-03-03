import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { db } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigrations() {
  try {
    migrate(db, {
      migrationsFolder: path.join(__dirname, "./drizzle/migrations")
    });

    console.log("Migrations applied");
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
  }
}
