/*
  Hook: useExcelActions
  Plan fijo: 2026
*/

function useExcelActions(params) {
    const { data, selectedCareer } = params;

    const getFallbackSelectedCareer = React.useCallback(function () {
        if (selectedCareer) return selectedCareer;

        const careers = data?.careers || [];
        if (careers.length > 0) {
            const first = careers[0];
            if (typeof first === "string") return first;
            if (typeof first === "object") return first.name || first.id || "";
        }

        return "";
    }, [data, selectedCareer]);

    const getCurrentLectiveTerm = React.useCallback(function () {
        const calendars = data?.calendars || [];
        const visible = calendars.find(c => c?.visible);

        return (
            visible?.lectiveTerm ||
            calendars?.[0]?.lectiveTerm ||
            ""
        );
    }, [data]);

    const handleExportExcel = React.useCallback(async function () {
        try {
            if (!window.exportSchedulesToExcel) {
                console.error("No existe window.exportSchedulesToExcel");
                return;
            }

            const career = getFallbackSelectedCareer();
            if (!career) {
                throw new Error("Payload inválido: falta selectedCareer");
            }

            const currentLectiveTerm = getCurrentLectiveTerm();

            await window.exportSchedulesToExcel({
                calendars: data?.calendars || [],
                selectedCareer: career,
                currentLectiveTerm,
                selectedPlan: "2026" // 👈 fijo
            });

        } catch (error) {
            console.error("Error exportando calendario Excel:", error);
        }
    }, [data, getFallbackSelectedCareer, getCurrentLectiveTerm]);

    return {
        handleExportExcel
    };
}

window.useExcelActions = useExcelActions;