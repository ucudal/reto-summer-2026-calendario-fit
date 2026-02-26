(function () {
    function useCareerManagement({ careers, setCareers, setSelectedCareer }) {
        const createCareerModalFns = window.CreateCareerModalFunctions;

        const [isCreateCareerOpen, setIsCreateCareerOpen] = React.useState(false);
        const [careerModalError, setCareerModalError] = React.useState("");
        const [careerForm, setCareerForm] = React.useState({ nombre: "" });

        function openCreateCareerModal() {
            setCareerForm({ nombre: "" });
            setCareerModalError("");
            setIsCreateCareerOpen(true);
        }

        function closeCreateCareerModal() {
            setCareerModalError("");
            setIsCreateCareerOpen(false);
        }

        function updateCareerForm(field, value) {
            setCareerForm(prev => ({ ...prev, [field]: value }));
        }

        async function confirmCreateCareer() {
            await createCareerModalFns.confirmCreateCareer({
                careerForm,
                careers,
                setCareerModalError,
                setCareers,
                setSelectedCareer,
                closeCreateCareerModal
            });
        }

        return {
            isCreateCareerOpen,
            careerModalError,
            careerForm,
            openCreateCareerModal,
            closeCreateCareerModal,
            updateCareerForm,
            confirmCreateCareer
        };
    }

    window.useCareerManagement = useCareerManagement;
})();