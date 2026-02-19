// src/db/init.js

import { db } from "./database.js";
import { carreras } from "./drizzle/schema/base.js";
import { seedDatabase } from "./seed.js";

export async function initializeDatabase() {
  const existing = await db.select().from(carreras).limit(1);

  if (existing.length === 0) {
    console.log("Database empty. Running seed...");
    await seedDatabase();
  } else {
    console.log("Database already initialized.");
  }
}
