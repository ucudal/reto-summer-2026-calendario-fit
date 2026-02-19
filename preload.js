const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  //Expose de ABM Docentes
  docentes: {
    crear: (data) => ipcRenderer.invoke('docentes:crear', data),
    actualizar: (data) => ipcRenderer.invoke('docentes:actualizar', data),
    eliminar: (id) => ipcRenderer.invoke('docentes:eliminar', id),
    obtener: (id) => ipcRenderer.invoke('docentes:obtener', id),
    listar: () => ipcRenderer.invoke('docentes:listar')
  },

  //Expose Materias
  materias: {
    crear: (data) => ipcRenderer.invoke('materias:crear', data),
    listar: () => ipcRenderer.invoke('materias:listar')
  }
});
