// services/docenteService.js

export const docenteService = {
  async listar() {
    const response = await window.api.docentes.listar();

    if (!response.success) {
      throw new Error(response.error || "Error al listar docentes");
    }

    // devolvemos siempre un array
    return response.data ?? [];
  }
};
