const addMateriaBtn = document.getElementById("addMateriaBtn");
const materiasContainer = document.getElementById("materiasContainer");
const materiaBackdrop = document.getElementById("modalMateriaBackdrop");
const materiaCreditosInput = document.getElementById("materiaCreditosInput");
const materiaForm = document.getElementById("materiaForm");
const cancelMateriaBtn = document.getElementById("cancelMateriaBtn");
const materiaNameInput = document.getElementById("materiaNameInput");
const materiaDescriptionInput = document.getElementById(
  "materiaDescriptionInput",
);

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
}

let editingId = null;

// --- Materias ---
async function loadMaterias() {
  const materias = await window.api.listMaterias();

  materiasContainer.innerHTML = "";

  if (!materias.length) {
    materiasContainer.innerHTML = "<p>No hay materias registradas.</p>";
    return;
  }

  for (const materia of materias) {
    const card = document.createElement("div");
    card.className = "materia-card";
    // 1. Los botones ahora están dentro del card.innerHTML
    card.innerHTML = `
      <h3>${escapeHtml(materia.name)}</h3>
      ${materia.description ? `<p>${escapeHtml(materia.description)}</p>` : ""}
      <div class="materia-actions">
        <button class="btn-edit" data-id="${materia.id}">Editar</button>
        <button class="btn-delete" data-id="${materia.id}">Borrar</button>
      </div>
    `;
    materiasContainer.appendChild(card);
  }

  // 2. Los eventos se asignan DESPUÉS de que los cards ya están en el DOM
  materiasContainer.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      const todas = await window.api.listMaterias();
      const materia = todas.find((m) => m.id === id);
      if (!materia) return;
      openMateriaModal(materia);
    });
  });

  materiasContainer.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      if (!confirm("¿Seguro que quieres borrar esta materia?")) return;
      await window.api.deleteMateria(id);
      await loadMaterias();
    });
  });
}

// 3. openMateriaModal recibe el parámetro materia
function openMateriaModal(materia = null) {
  editingId = materia ? materia.id : null;
  materiaNameInput.value = materia ? materia.name : "";
  materiaDescriptionInput.value = materia ? materia.description || "" : "";
  materiaCreditosInput.value = materia ? materia.creditos || "" : "";
  materiaBackdrop.classList.remove("hidden");
  materiaNameInput.focus();
}

function closeMateriaModal() {
  editingId = null;
  materiaBackdrop.classList.add("hidden");
}

addMateriaBtn.addEventListener("click", () => openMateriaModal());
cancelMateriaBtn.addEventListener("click", closeMateriaModal);
materiaBackdrop.addEventListener("click", (e) => {
  if (e.target === materiaBackdrop) closeMateriaModal();
});

materiaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = materiaNameInput.value.trim();
  const description = materiaDescriptionInput.value.trim();
  const creditos = Number(materiaCreditosInput.value);

  if (!name) {
    alert("Nombre requerido.");
    return;
  }


  if (editingId !== null) {
    await window.api.updateMateria({
      id: editingId,
      name,
      creditos,
      description,
    });
  } else {
    await window.api.createMateria({ name, creditos, description });
  }

  closeMateriaModal();
  await loadMaterias();
});

// init
loadMaterias();
