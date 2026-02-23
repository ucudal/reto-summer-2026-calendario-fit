// ==============================
// ELEMENTOS DOM
// ==============================

const btnAtras = document.getElementById("btn-atras");
const addMateriaBtn = document.getElementById("addMateriaBtn");

const materiasContainer = document.getElementById("materiasContainer");

const materiaBackdrop = document.getElementById("modalMateriaBackdrop");
const materiaForm = document.getElementById("materiaForm");
const cancelMateriaBtn = document.getElementById("cancelMateriaBtn");

const modalTitle = document.getElementById("modalTitle");
const materiaIdInput = document.getElementById("materiaIdInput");
const materiaNameInput = document.getElementById("materiaNameInput");
const materiaTipoInput = document.getElementById("materiaTipoInput");
const materiaCreditosInput = document.getElementById("materiaCreditosInput");
const materiaTCInput = document.getElementById("materiaTCInput");

// ==============================
// UTIL
// ==============================

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#039;"
  }[m]));
}

// ==============================
// LISTAR
// ==============================

async function loadMaterias() {
  const response = await window.api.materias.listar();

  if (!response.success) {
    await window.api.mensajes.mostrar(response.error);
    return;
  }

  const materias = response.data;
  materiasContainer.innerHTML = "";

  if (!materias.length) {
    materiasContainer.innerHTML = "<p>No hay materias registradas.</p>";
    return;
  }

  for (const materia of materias) {

    const card = document.createElement("div");
    card.className = "materia-card";

    card.innerHTML = `
      <h3>${escapeHtml(materia.nombre)}</h3>
      <p><strong>Tipo:</strong> ${escapeHtml(materia.tipo)}</p>
      <p><strong>Créditos:</strong> ${materia.creditos}</p>
      <p><strong>Contrasemestre:</strong> ${materia.tieneContrasemestre ? "Sí" : "No"}</p>
      <div class="card-actions">
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      </div>
    `;

    // EDITAR
    card.querySelector(".edit-btn").addEventListener("click", () => {
      openEditModal(materia);
    });

    // ELIMINAR
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      const confirmar = await window.api.mensajes.confirmar("¿Eliminar esta materia?");
      if (!confirmar) return;

      const result = await window.api.materias.eliminar(materia.id);

      if (!result.success) {
        await window.api.mensajes.mostrar(result.error);
        return;
      }

      await loadMaterias();
    });

    materiasContainer.appendChild(card);
  }
}

// ==============================
// MODAL
// ==============================

function openCreateModal() {
  modalTitle.textContent = "Nueva materia";
  materiaIdInput.value = "";
  materiaForm.reset();
  materiaBackdrop.classList.remove("hidden");
  materiaNameInput.focus();
}

function openEditModal(materia) {
  modalTitle.textContent = "Editar materia";
  materiaIdInput.value = materia.id;
  materiaNameInput.value = materia.nombre;
  materiaTipoInput.value = materia.tipo;
  materiaCreditosInput.value = materia.creditos;
  materiaTCInput.checked = Boolean(materia.tieneContrasemestre);

  materiaBackdrop.classList.remove("hidden");
}

function closeMateriaModal() {
  materiaBackdrop.classList.add("hidden");
}

// ==============================
// EVENTOS
// ==============================

addMateriaBtn.addEventListener("click", openCreateModal);

cancelMateriaBtn.addEventListener("click", closeMateriaModal);

materiaBackdrop.addEventListener("click", (e) => {
  if (e.target === materiaBackdrop) closeMateriaModal();
});

materiaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = materiaIdInput.value;

  const data = {
    nombre: materiaNameInput.value.trim(),
    tipo: materiaTipoInput.value.trim(),
    creditos: Number(materiaCreditosInput.value),
    tieneContrasemestre: materiaTCInput.checked
  };

  let result;

  if (id) {
    result = await window.api.materias.actualizar({
      id: Number(id),
      datos: data
    });
  } else {
    result = await window.api.materias.crear(data);
  }

  if (!result.success) {
    await window.api.mensajes.mostrar(result.error);
    return;
  }

  closeMateriaModal();
  await loadMaterias();
});

btnAtras.addEventListener("click", () => {
  window.location.href = "./../index.html";
});

// ==============================
// INIT
// ==============================

document.addEventListener("DOMContentLoaded", loadMaterias);