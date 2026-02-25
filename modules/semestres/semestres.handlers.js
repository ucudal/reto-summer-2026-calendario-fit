import { ipcMain } from "electron";
import { crearSemestreLectivo, listarSemestresLectivos } from "./semestres.service.js";

export function registerSemestresHandlers() {
  ipcMain.handle("semestres:crear", async (_event, data) => {
    try {
      const result = crearSemestreLectivo(data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("semestres:listar", async () => {
    try {
      const rows = listarSemestresLectivos();
      return { success: true, data: rows };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
