/*
  Archivo: subjectGroupsModalFunctions.js
  Que guarda:
  - Funciones de logica para manejar el flujo de SubjectGroupsModal.
  - No renderiza UI.
*/

function createSubjectGroupsModalHandlers(params) {
  const {
    setIsGroupsListOpen,
    setIsSubjectGroupsModalOpen,
    setSelectedSubject
  } = params;

  function openSubjectGroupsModal(subjectName) {
    setSelectedSubject(subjectName);
    setIsSubjectGroupsModalOpen(true);
    setIsGroupsListOpen(false);
  }

  function closeSubjectGroupsModal() {
    setIsSubjectGroupsModalOpen(false);
    setSelectedSubject(null);
  }

  function backToGroupsList() {
    closeSubjectGroupsModal();
    setIsGroupsListOpen(true);
  }

  return {
    openSubjectGroupsModal,
    closeSubjectGroupsModal,
    backToGroupsList
  };
}

window.SubjectGroupsModalFunctions = {
  createSubjectGroupsModalHandlers
};
