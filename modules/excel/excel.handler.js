import { ipcMain, dialog } from "electron";
import fs from "fs";

export function registerExcelHandlers() {
    ipcMain.handle("excel:guardarArchivo", async (event, buffer) => {
        try {
            const { canceled, filePath } = await dialog.showSaveDialog({
                title: "Guardar Excel",
                defaultPath: "horarios.xlsx",
                filters: [{ name: "Excel", extensions: ["xlsx"] }]
            });

            if (canceled || !filePath) {
                return { success: false };
            }

            await fs.promises.writeFile(filePath, Buffer.from(buffer));

            return { success: true };
        } catch (error) {
            console.error("Error guardando Excel:", error);
            return { success: false, error: error.message };
        }
    });
}