import path from "path";
import { fileURLToPath } from "url";
import { app, BrowserWindow } from "electron";
import { initializeDatabase } from "../db/init.js";
import { runMigrations } from "../db/runMigrations.js";


//import { runMigrations } from "./db/migrations.js";
import { registerAllHandlers } from "../modules/registerHandlers.js";

// recrear __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1820,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.webContents.openDevTools(); // 👈 ADD THIS

  const filePath = path.join(__dirname, "..", "front", "index.html");

  win.loadFile(filePath).catch((error) => {
    console.error("Error cargando front/index.html:", error);
  });
}

app.whenReady().then(async () => {
  try {
    await runMigrations();
    await initializeDatabase();
    registerAllHandlers();
    createWindow();
  } catch (error) {
    console.error("Error al iniciar la app:", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
