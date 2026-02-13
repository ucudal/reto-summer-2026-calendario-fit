const path = require("path");
const { app } = require("electron");
const sqlite3 = require("sqlite3").verbose();

function getDbPath() {
  return path.join(app.getPath("userData"), "calendariofit.sqlite");
}

let db;

function initDb() {
  if (db) return db;

  db = new sqlite3.Database(getDbPath(), (err) => {
    if (err) console.error("Error abriendo SQLite:", err);
  });

  db.serialize(() => {
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA foreign_keys = ON;");
  });

  return db;
}

module.exports = { initDb };
