const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  createExpense: (expense) => ipcRenderer.invoke("expenses:create", expense),
  listExpensesByMonth: ({ year, month }) =>
    ipcRenderer.invoke("expenses:listByMonth", { year, month }),
  listCategories: () => ipcRenderer.invoke("categories:list"),

  //Expose de ABM Docentes
  docentes: {
    crear: (data) => ipcRenderer.invoke('docentes:crear', data),
    actualizar: (data) => ipcRenderer.invoke('docentes:actualizar', data),
    eliminar: (id) => ipcRenderer.invoke('docentes:eliminar', id),
    obtener: (id) => ipcRenderer.invoke('docentes:obtener', id),
    listar: () => ipcRenderer.invoke('docentes:listar')
  }
});
