import { ipcMain } from "electron";
import { listarSemestresService } from "./semestres.service.js";

export function registerSemestresHandlers() {
    // Listar semestres
    ipcMain.handle('semestres:listar', async () => {
        try {
            const semestres = await listarSemestresService();
            return { success: true, data: semestres };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}