(function () {
    function useSemesterManagement(data, setData) {
        const [isCreateSemesterOpen, setIsCreateSemesterOpen] = React.useState(false);
        const [semesterModalError, setSemesterModalError] = React.useState("");
        const [semesterForm, setSemesterForm] = React.useState({
            sourceLectiveTerm: "",
            newLectiveName: ""
        });

        function openCreateSemesterModal() {
            setSemesterForm({ sourceLectiveTerm: "", newLectiveName: "" });
            setSemesterModalError("");
            setIsCreateSemesterOpen(true);
        }

        function closeCreateSemesterModal() {
            setSemesterModalError("");
            setIsCreateSemesterOpen(false);
        }

        function updateSemesterForm(field, value) {
            setSemesterForm(prev => ({ ...prev, [field]: value }));
        }

        function confirmCreateSemester() {
            const sourceTerm = String(semesterForm.sourceLectiveTerm || "").trim();
            const newName = String(semesterForm.newLectiveName || "").trim();

            if (!sourceTerm) {
                setSemesterModalError("Debe seleccionar el semestre lectivo a copiar.");
                return;
            }

            if (!newName) {
                setSemesterModalError("Debe ingresar el nombre del nuevo semestre lectivo.");
                return;
            }

            const calendarsToCopy = data.calendars.filter(
                c => c.lectiveTerm === sourceTerm
            );

            if (calendarsToCopy.length === 0) {
                setSemesterModalError("No hay calendarios para ese semestre lectivo.");
                return;
            }

            const now = Date.now();
            const copies = calendarsToCopy.map((calendar, index) => ({
                ...calendar,
                id: `${calendar.id}-copy-${now}-${index}`,
                lectiveTerm: newName,
                visible: true,
                classes: calendar.classes.map(item => ({ ...item })),
                alerts: []
            }));

            setData(prev => ({
                ...prev,
                calendars: prev.calendars
                    .map(c =>
                        c.lectiveTerm === sourceTerm ? { ...c, visible: false } : c
                    )
                    .concat(copies)
            }));

            closeCreateSemesterModal();
        }

        const [selectedLectiveTerm, setSelectedLectiveTerm] = React.useState("");

        const availableLectiveTerms = React.useMemo(() => {
            const seen = new Set();
            const unique = [];

            data.calendars.forEach(c => {
                if (!c.lectiveTerm) return;

                const { idSemestre, numeroSem, anio } = c.lectiveTerm;

                if (!seen.has(idSemestre)) {
                    seen.add(idSemestre);
                    unique.push({
                        idSemestre,
                        numeroSem,
                        anio
                    });
                }
            });

            return unique;
        }, [data.calendars]);

        const filteredCalendarsBySemester = React.useMemo(() => {
            if (!selectedLectiveTerm) return null;

            return data.calendars.filter(
                c => c.lectiveTerm?.idSemestre === selectedLectiveTerm
            );
        }, [data.calendars, selectedLectiveTerm]);

        return {
            isCreateSemesterOpen,
            semesterModalError,
            semesterForm,
            openCreateSemesterModal,
            closeCreateSemesterModal,
            updateSemesterForm,
            confirmCreateSemester,
            selectedLectiveTerm,
            setSelectedLectiveTerm,
            availableLectiveTerms
        };
    }

    window.useSemesterManagement = useSemesterManagement;
})();