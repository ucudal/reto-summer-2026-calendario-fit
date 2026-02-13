// docentes.renderer.js

const tablaDocentes = document.getElementById("tabla-docentes");
const btnGuardar = document.getElementById("btn-guardar-docente");
const btnAtras = document.getElementById("btn-atras");
const inputNombre = document.getElementById("docente-nombre");
const inputApellido = document.getElementById("docente-apellido");
const inputEmail = document.getElementById("docente-email");
const inputId = document.getElementById("docente-id");

// ==============================
// LISTAR
// ==============================

async function listarDocentes() {
    try {
        const response = await window.api.docentes.listar();

        if (!response.success) {
            throw new Error(response.error);
        }

        const docentes = response.data;

        tablaDocentes.innerHTML = "";

        docentes.forEach(docente => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
        <td>${docente.id}</td>
        <td>${docente.nombre}</td>
        <td>${docente.apellido}</td>
        <td>${docente.email}</td>
        <td>
          <button onclick="editarDocente(${docente.id})">
            Editar
          </button>
          <button onclick="eliminarDocente(${docente.id})">
            Eliminar
          </button>
        </td>
      `;

            tablaDocentes.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al listar docentes:", error);
    }
}

// ==============================
// GUARDAR (CREAR O EDITAR)
// ==============================

async function guardarDocente() {
    const id = inputId.value;

    const data = {
        id: id ? Number(id) : undefined,
        nombre: document.getElementById("docente-nombre").value.trim(),
        apellido: document.getElementById("docente-apellido").value.trim(),
        email: document.getElementById("docente-email").value.trim()
    };

    if (!data.nombre || !data.apellido || !data.email) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        let response;

        if (id) {
            response = await window.api.docentes.actualizar(data);
        } else {
            response = await window.api.docentes.crear(data);
        }

        if (!response.success) {
            throw new Error(response.error);
        }

        limpiarFormulario();
        listarDocentes();

    } catch (error) {
        console.error("Error al guardar docente:", error);
        alert(error.message);
    }
}


// ==============================
// EDITAR
// ==============================

window.editarDocente = async function (id) {
    try {
        const response = await window.api.docentes.obtener(id);

        if (!response.success) {
            throw new Error(response.error);
        }

        const docente = response.data;

        inputId.value = docente.id;
        document.getElementById("docente-nombre").value = docente.nombre;
        document.getElementById("docente-apellido").value = docente.apellido;
        document.getElementById("docente-email").value = docente.email;

    } catch (error) {
        console.error("Error al obtener docente:", error);
    }
}


// ==============================
// ELIMINAR
// ==============================

window.eliminarDocente = async function (id) {
    const confirmar = confirm("¿Seguro que querés eliminar este docente?");
    if (!confirmar) return;

    try {
        await window.api.docentes.eliminar(id);
        listarDocentes();
    } catch (error) {
        console.error("Error al eliminar docente:", error);
    }
}

// ==============================
// LIMPIAR FORMULARIO
// ==============================

function limpiarFormulario() {
    inputId.value = "";
    inputNombre.value = "";
    inputApellido.value = "";
    inputEmail.value = "";
}

btnGuardar.addEventListener("click", guardarDocente);
btnAtras.addEventListener("click", () => {
    window.location.href = "./../index.html";
});

// ==============================
// INICIALIZAR
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    listarDocentes();
});
