const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  createExpense: (expense) => ipcRenderer.invoke("expenses:create", expense),
  listExpensesByMonth: ({ year, month }) =>
    ipcRenderer.invoke("expenses:listByMonth", { year, month }),
  listCategories: () => ipcRenderer.invoke("categories:list")
});
