// src/db/init.js

import { db } from "./database.js";
import { carreras } from "./drizzle/schema/base.js";
import { seedDatabase } from "./seed.js";

export async function initializeDatabase() {
  const existing = await db.select().from(carreras).limit(1);
  const shouldAutoSeed = process.env.DB_AUTO_SEED === "1";

  if (existing.length === 0) {
    if (shouldAutoSeed) {
      console.log("Database empty. Running seed...");
      await seedDatabase();
    } else {
      console.log("Database empty. Auto-seed disabled.");
    }
  } else {
    console.log("Database already initialized.");
  }
}
