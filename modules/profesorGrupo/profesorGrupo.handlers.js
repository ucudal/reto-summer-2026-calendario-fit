import { ipcMain } from 'electron';
import * as service from './profesorGrupo.service.js';

export function registerProfesorGrupoHandlers() {

    ipcMain.handle("profesotrGrupo:asignar", async (_, data) => {
        try {
            return await service.asignarProfesorAGrupo(data);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    });

    ipcMain.handle("profesorGrupo:cambiarPrincipal", async (_, data) => {
        try {
            return await service.cambiarProfesorPrincipal(data);
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    });
}
