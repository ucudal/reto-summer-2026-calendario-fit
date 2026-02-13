const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { runMigrations } = require("./db/migrations");
const { initDb } = require("./db/database");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  runMigrations();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Helpers promisificados
function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function allAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// --- IPC: Categorías ---
ipcMain.handle("categories:list", async () => {
  const db = initDb();
  const rows = await allAsync(db, `SELECT name FROM categories ORDER BY name ASC`);
  return rows.map(r => r.name);
});

// --- IPC: Crear gasto ---
ipcMain.handle("expenses:create", async (event, payload) => {
  const db = initDb();
  const now = new Date().toISOString();

  // Validaciones mínimas (extra safety)
  const amount = Number(payload.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Monto inválido");
  if (!payload.category) throw new Error("Categoría requerida");
  if (!payload.date) throw new Error("Fecha requerida");

  const result = await runAsync(
    db,
    `
    INSERT INTO expenses (amount, category, date, description, created_at)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      amount,
      payload.category,
      payload.date,
      payload.description || null,
      now
    ]
  );

  return { id: result.lastID };
});

// --- IPC: Listar por mes + total ---
ipcMain.handle("expenses:listByMonth", async (event, { year, month }) => {
  const db = initDb();

  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endExclusive = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const rows = await allAsync(
    db,
    `
    SELECT id, amount, category, date, description
    FROM expenses
    WHERE date >= ? AND date < ?
    ORDER BY date DESC, id DESC
    `,
    [start, endExclusive]
  );

  const totalRow = await getAsync(
    db,
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM expenses
    WHERE date >= ? AND date < ?
    `,
    [start, endExclusive]
  );

  return { rows, total: totalRow?.total ?? 0 };
});

// --- IPC: Crear materia ---
ipcMain.handle("materias:create", async (event, payload) => {
  const db = initDb();
  const now = new Date().toISOString();

  if (!payload.name || !payload.name.trim()) {
    throw new Error("Nombre de materia requerido");
  }

  const result = await runAsync(
    db,
    `
    INSERT INTO materias (name, description, created_at)
    VALUES (?, ?, ?)
    `,
    [
      payload.name.trim(),
      payload.description?.trim() || null,
      now
    ]
  );

  return { id: result.lastID };
});

// --- IPC: Listar materias ---
ipcMain.handle("materias:list", async () => {
  const db = initDb();
  const rows = await allAsync(
    db,
    `
    SELECT id, name, description, created_at
    FROM materias
    ORDER BY created_at DESC
    `
  );

  return rows;
});
