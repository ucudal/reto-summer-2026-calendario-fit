import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./database.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function runMigrations() {
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

    if (alreadyExists) {
      console.warn("Migrations skipped: schema ya existe.");
      return;
    }

    throw error;
  }
}
