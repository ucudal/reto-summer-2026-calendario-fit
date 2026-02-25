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
    listar: () => ipcRenderer.invoke("materias:listar"),
    listarCarrerasPlanes: (nombreMateria) =>
      ipcRenderer.invoke("materias:listarCarrerasPlanes", nombreMateria)
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
  },

  // Expose de ABM Grupos
  grupos: {
    crear: (data) => ipcRenderer.invoke("grupos:crear", data),
    actualizar: (data) => ipcRenderer.invoke("grupos:actualizar", data),
    eliminar: (id) => ipcRenderer.invoke("grupos:eliminar", id),
    obtener: (id) => ipcRenderer.invoke("grupos:obtener", id),
    listar: () => ipcRenderer.invoke("grupos:listar"),
    asignarProfesor: (data) => ipcRenderer.invoke("grupos:asignarProfesor", data),
    agregarHorarios: (idGrupo, horarios) => ipcRenderer.invoke("grupos:agregarHorarios", { idGrupo, horarios }),
    agregarRequerimientos: (idGrupo, requerimientos) => ipcRenderer.invoke("grupos:agregarRequerimientos", { idGrupo, requerimientos })
  },

  semestres: {
    crear: (payload) => ipcRenderer.invoke("semestres:crear", payload),
    listar: () => ipcRenderer.invoke("semestres:listar")
  },

  excel: {
    guardarArchivo: (buffer) =>
        ipcRenderer.invoke("excel:guardarArchivo", buffer)},
  // Expose Exportaciones
  exportaciones: {
    guardarExcel: (payload) => ipcRenderer.invoke("exportaciones:guardarExcel", payload),
    importarExcelModulos: (payload) => ipcRenderer.invoke("exportaciones:importarExcelModulos", payload)
  }
});
