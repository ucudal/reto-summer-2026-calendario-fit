import path from "path";
import { app } from "electron";
import sqlite3 from "sqlite3";

const { verbose } = sqlite3;
const SQLite3 = verbose();

function getDbPath() {
  return path.join(app.getPath("userData"), "calendariofit.sqlite");
}

let db;

function initDb() {
  if (db) return db;

  db = new SQLite3.Database(getDbPath(), (err) => {
    if (err) console.error("Error abriendo SQLite:", err);
  });

  db.serialize(() => {
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA foreign_keys = ON;");
  });

  return db;
}

export { initDb };
