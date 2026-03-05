import { ipcMain, dialog } from "electron";

export function registrarMensajesHandlers() {
    ipcMain.handle('mensajes:mostrar', async (event, { mensaje, tipo = "warning" }) => {
        const win = event.sender.getOwnerBrowserWindow();

        await dialog.showMessageBox(win, {
            type: tipo,
            message: mensaje,
            buttons: ["Aceptar"],
            defaultId: 0,
            cancelId: 0,
            noLink: true
        });
    });

    ipcMain.handle('mensajes:confirmar', async (event, { mensaje }) => {
        const win = event.sender.getOwnerBrowserWindow();

        const result = await dialog.showMessageBox(win, {
            type: "question",
            message: mensaje,
            buttons: ["Aceptar", "Cancelar"],
            defaultId: 0,
            cancelId: 1,
            noLink: true
        });
        
        return result.response === 0; // Retorna true si se hizo clic en "Aceptar"
    });
}