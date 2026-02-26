function useExcelActions({ data, selectedCareer, reloadGroupsFromDb }) {
    async function handleExportExcel() {
        try {
            if (!window.exportSchedulesToExcel) return;
            await window.exportSchedulesToExcel(data);
        } catch (error) {
            console.error("Error exportando calendario Excel:", error);
        }
    }

    async function handleExportExcelDatos() {
        try {
            if (!window.api?.exportaciones?.guardarExcel) return;
            await window.api.exportaciones.guardarExcel({
                defaultFileName: "calendario-bd.xlsx",
                sheetName: "Datos"
            });
        } catch (error) {
            console.error("Error exportando datos internos:", error);
        }
    }

    async function handleImportExcel() {
        try {
            if (!window.api?.exportaciones?.importarExcelModulos) return;
            await window.api.exportaciones.importarExcelModulos({ carreraNombre: selectedCareer });
            await reloadGroupsFromDb();
        } catch (error) {
            console.error("Error importando módulos desde Excel:", error);
        }
    }

    return {
        handleExportExcel,
        handleExportExcelDatos,
        handleImportExcel
    };
}

window.useExcelActions = useExcelActions;