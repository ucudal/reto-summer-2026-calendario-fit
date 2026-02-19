import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./database.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function runMigrations() {
  migrate(db, {
    migrationsFolder: path.join(__dirname, "./drizzle/migrations"),
  });

  console.log("✅ Migrations applied");
}
