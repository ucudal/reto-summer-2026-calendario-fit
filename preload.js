const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Expose de ABM Docentes
  docentes: {
    crear: (data) => ipcRenderer.invoke("docentes:crear", data),
    actualizar: (data) => ipcRenderer.invoke("docentes:actualizar", data),
    eliminar: (id) => ipcRenderer.invoke("docentes:eliminar", id),
    obtener: (id) => ipcRenderer.invoke("docentes:obtener", id),
    listar: () => ipcRenderer.invoke("docentes:listar")
  },

  // Expose Materias
  materias: {
    crear: (data) => ipcRenderer.invoke("materias:crear", data),
    actualizar: (data) => ipcRenderer.invoke("materias:actualizar", data),
    eliminar: (id) => ipcRenderer.invoke("materias:eliminar", id),
    listar: () => ipcRenderer.invoke("materias:listar")
  },

  //Expose Mostrar Mensajes
  mensajes: {
    mostrar: (mensaje, tipo = "warning") => ipcRenderer.invoke('mensajes:mostrar', { mensaje, tipo }),
    confirmar: (mensaje) => ipcRenderer.invoke('mensajes:confirmar', { mensaje }),
  },

  // Expose de ABM Carreras
  carreras: {
    crear: (data) => ipcRenderer.invoke("carreras:crear", data),
    actualizar: (data) => ipcRenderer.invoke("carreras:actualizar", data),
    eliminar: (id) => ipcRenderer.invoke("carreras:eliminar", id),
    obtener: (id) => ipcRenderer.invoke("carreras:obtener", id),
    listar: () => ipcRenderer.invoke("carreras:listar")
  }
  
});
