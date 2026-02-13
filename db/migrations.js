const { initDb } = require("./database");

function runMigrations() {
  const db = initDb();

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
      );
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_expenses_date
      ON expenses(date);
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS materias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
      );
    `);

    const defaultCategories = [
      "Comida",
      "Transporte",
      "Vivienda",
      "Servicios",
      "Salud",
      "Educación",
      "Ocio",
      "Suscripciones",
      "Ropa",
      "Otros"
    ];

    for (const cat of defaultCategories) {
      db.run(`INSERT OR IGNORE INTO categories (name) VALUES (?)`, [cat]);
    }
  });
}

module.exports = { runMigrations };
