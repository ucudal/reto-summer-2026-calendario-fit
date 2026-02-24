import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runMigrations() {
  const dbPath = path.join(__dirname, "local-dev.sqlite");
  const client = createClient({ url: `file:${dbPath}` });
  const db = drizzle(client);

  try {
    await migrate(db, {
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
  } finally {
    await client.close();
  }
}
