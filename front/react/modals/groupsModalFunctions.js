/*
  Archivo: groupsModalFunctions.js
  Que guarda:
  - Funciones de logica para manejar el flujo de GroupsModal.
  - No renderiza UI.
*/

function createGroupsModalHandlers(params) {
  const {
    setIsGroupsListOpen,
    openSubjectGroupsModal,
    openCreateNewGroupModal
  } = params;

  function openGroupsListModal() {
    setIsGroupsListOpen(true);
  }

  function closeGroupsListModal() {
    setIsGroupsListOpen(false);
  }

  function handleAddNewSubjectFromList() {
    closeGroupsListModal();
    openCreateNewGroupModal();
  }

  return {
    openGroupsListModal,
    closeGroupsListModal,
    openSubjectGroupsModal,
    handleAddNewSubjectFromList
  };
}

window.GroupsModalFunctions = {
  createGroupsModalHandlers
};
