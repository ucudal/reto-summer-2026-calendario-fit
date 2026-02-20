const tablaCarreras = document.getElementById("tabla-carreras");
const btnGuardar = document.getElementById("btn-guardar-carrera");
const btnAtras = document.getElementById("btn-atras");
const inputNombre = document.getElementById("carrera-nombre");
const inputId = document.getElementById("carrera-id");
const form = document.getElementById("carrera-form");

async function listarCarreras() {
  try {
    const response = await window.api.carreras.listar();

    if (!response.success) {
      throw new Error(response.error);
    }

    const carreras = response.data;
    tablaCarreras.innerHTML = "";

    carreras.forEach((carrera) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${carrera.id}</td>
        <td>${carrera.nombre}</td>
        <td>
          <button class="btn-editar" data-id="${carrera.id}">Editar</button>
          <button class="btn-eliminar" data-id="${carrera.id}">Eliminar</button>
        </td>
      `;

      tablaCarreras.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al listar carreras:", error);
  }
}

async function guardarCarrera(event) {
  event.preventDefault();

  const id = inputId.value;

  const data = {
    nombre: inputNombre.value.trim()
  };

  if (id) {
    data.id = Number(id);
  }

  if (!data.nombre) {
    alert("El nombre es obligatorio");
    return;
  }

  try {
    let response;

    if (id) {
      response = await window.api.carreras.actualizar(data);
    } else {
      response = await window.api.carreras.crear(data);
    }

    if (!response.success) {
      throw new Error(response.error);
    }

    form.reset();
    await listarCarreras();
  } catch (error) {
    console.error("Error al guardar carrera:", error);
    alert(error.message);
  }
}

tablaCarreras.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const idAttr = btn.dataset.id;
  const id = idAttr ? Number(idAttr) : null;

  if (btn.classList.contains("btn-eliminar")) {
    const confirmar = confirm("¿Seguro que querés eliminar esta carrera?");
    if (!confirmar) return;

    try {
      const response = await window.api.carreras.eliminar(id);
      if (!response || !response.success) {
        throw new Error((response && response.error) || "Error al eliminar");
      }

      form.reset();
      await listarCarreras();
    } catch (error) {
      console.error("Error al eliminar carrera:", error);
      alert(error.message || error);
    }

    return;
  }

  if (btn.classList.contains("btn-editar")) {
    try {
      const response = await window.api.carreras.obtener(id);
      if (!response || !response.success) {
        throw new Error((response && response.error) || "Error al obtener carrera");
      }

      const carrera = response.data;
      inputId.value = carrera.id;
      inputNombre.value = carrera.nombre;
      inputNombre.focus();
    } catch (error) {
      console.error("Error al obtener carrera:", error);
      alert(error.message || error);
    }
  }
});

btnGuardar.addEventListener("click", guardarCarrera);
btnAtras.addEventListener("click", () => {
  window.location.href = "./../index.html";
});

document.addEventListener("DOMContentLoaded", () => {
  listarCarreras();
});
