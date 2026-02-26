(function () {
    function useCareerManagement({ careers, setCareers, setSelectedCareer }) {
        const createCareerModalFns = window.CreateCareerModalFunctions;

        const [isCareersListOpen, setIsCareersListOpen] = React.useState(false);
        const [isCreateCareerOpen, setIsCreateCareerOpen] = React.useState(false);
        const [careerModalError, setCareerModalError] = React.useState("");
        const [careerForm, setCareerForm] = React.useState({ nombre: "" });
        const [careerEditMode, setCareerEditMode] = React.useState(null);
        const [careerOpenedFromList, setCareerOpenedFromList] = React.useState(false);

        function openCareersListModal() {
            setIsCareersListOpen(true);
        }

        function closeCareersListModal() {
            setIsCareersListOpen(false);
        }

        function openCreateCareerModal() {
            setCareerForm({ nombre: "" });
            setCareerModalError("");
            setCareerEditMode(null);
            setCareerOpenedFromList(false);
            setIsCreateCareerOpen(true);
        }

        function openCreateCareerFromList() {
            setCareerForm({ nombre: "" });
            setCareerModalError("");
            setCareerEditMode(null);
            setCareerOpenedFromList(true);
            setIsCareersListOpen(false);
            setIsCreateCareerOpen(true);
        }

        function closeCreateCareerModal() {
            setCareerModalError("");
            setIsCreateCareerOpen(false);
            setCareerEditMode(null);
            setCareerOpenedFromList(false);
        }

        function backToCareersListFromModal() {
            closeCreateCareerModal();
            setIsCareersListOpen(true);
        }

        function selectCareerToManage(careerName) {
            setCareerForm({ nombre: careerName });
            setCareerModalError("");
            setCareerEditMode(careerName);
            setCareerOpenedFromList(true);
            setIsCareersListOpen(false);
            setIsCreateCareerOpen(true);
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
            isCareersListOpen,
            isCreateCareerOpen,
            careerModalError,
            careerForm,
            careerEditMode,
            careerOpenedFromList,
            openCareersListModal,
            closeCareersListModal,
            openCreateCareerModal,
            openCreateCareerFromList,
            closeCreateCareerModal,
            backToCareersListFromModal,
            selectCareerToManage,
            updateCareerForm,
            confirmCreateCareer
        };
    }

    window.useCareerManagement = useCareerManagement;
})();