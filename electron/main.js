import path from "path";
import { fileURLToPath } from "url";
import { app, BrowserWindow } from "electron";
import { runMigrations } from "../db/runMigrations.js";
import { closeDatabase } from "../db/database.js";


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

  const filePath = path.join(__dirname, "..", "front", "index.html");
  win.maximize();
  win.loadFile(filePath).catch((error) => {
    console.error("Error cargando front/index.html:", error);
  });
}

app.whenReady().then(async () => {
  try {
    // runMigrations will determine the correct file path internally
    await runMigrations();

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

app.on("before-quit", () => {
  closeDatabase();
});
