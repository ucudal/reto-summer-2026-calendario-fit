const { ipcMain } = require('electron');
const service = require('./profesorGrupo.service');

function registerProfesorGrupoHandlers() {
    
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

module.exports = {
    registerProfesorGrupoHandlers
};