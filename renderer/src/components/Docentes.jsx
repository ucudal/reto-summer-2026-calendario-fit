import { useEffect, useState } from "react";
import { docenteService } from "../services/docenteService";

export default function Docentes({ onBack }) {
  const [docentes, setDocentes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");

  useEffect(() => {
    cargarDocentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mostrar errores en un popup (IPC) o fallback a alert(), y luego limpiar el estado de error
  useEffect(() => {
    if (!error) return;

    (async () => {
      try {
        if (window && window.api && window.api.mensajes && typeof window.api.mensajes.mostrar === 'function') {
          // mensajes.mostrar espera (mensaje, tipo)
          await window.api.mensajes.mostrar(error, 'error');
        } else {
          // Fallback simple
          alert(error);
        }
      } catch (e) {
        // No bloquear si falla el IPC
        console.error('Error mostrando popup de error:', e);
        try { alert(error); } catch (_) {}
      } finally {
        // Limpiar para que la UI no quede en estado de error permanente
        setError(null);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  async function cargarDocentes() {
    setLoading(true);
    setError(null);
    try {
      // Usar el servicio local que encapsula la llamada a window.api y normaliza la respuesta
      const data = await docenteService.listar();
      setDocentes(Array.isArray(data) ? data : data || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setId(null);
    setNombre("");
    setApellido("");
    setCorreo("");
    // Si hubiera un <form> real y se usara form.reset(), se podría usar también.
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim(),
    };

    try {
      if (!payload.nombre || !payload.apellido || !payload.correo) {
        throw new Error("Todos los campos son obligatorios");
      }

      let res;
      if (id) {
        // Asegurarse de no mandar undefined: incluir id sólo si existe
        payload.id = Number(id);
        res = await window.api.docentes.actualizar(payload);
      } else {
        res = await window.api.docentes.crear(payload);
      }

      // Si la API devuelve estructura { success, ... } manejarlo, si devuelve entidad manejarlo también
      if (res && res.success === false) {
        throw new Error(res.error || "Error en la operación");
      }

      resetForm();
      await cargarDocentes();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleEditar(docenteId) {
    try {
      if (!window.api || !window.api.docentes || typeof window.api.docentes.obtener !== "function") {
        throw new Error("API de docentes no disponible (obtener)");
      }
      const res = await window.api.docentes.obtener(Number(docenteId));
      if (res && res.success === false) throw new Error(res.error || "Error obteniendo docente");
      const d = res && res.data ? res.data : res;
      if (!d) throw new Error("Docente no encontrado");

      setId(d.id ?? null);
      setNombre(d.nombre ?? "");
      setApellido(d.apellido ?? "");
      setCorreo(d.correo ?? "");
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  async function handleEliminar(docenteId) {
    if (!confirm("¿Seguro que querés eliminar este docente?")) return;
    setSaving(true);
    setError(null);
    try {
      if (!window.api || !window.api.docentes || typeof window.api.docentes.eliminar !== "function") {
        throw new Error("API de docentes no disponible (eliminar)");
      }
      const res = await window.api.docentes.eliminar(Number(docenteId));
      if (res && res.success === false) throw new Error(res.error || "Error al eliminar");
      resetForm(); // limpiar formulario tras eliminación exitosa
      await cargarDocentes();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Cargando docentes...</p>;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { if (typeof onBack === 'function') onBack(); }}>
          ← Volver
        </button>
      </div>

      <h2>Docentes</h2>

      <form onSubmit={handleSubmit}>
        <input type="hidden" value={id ?? ""} readOnly />

        <div>
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label>Apellido</label>
          <input
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label>Correo</label>
          <input
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <button type="submit" disabled={saving}>
            {id ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            style={{ marginLeft: 8 }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {docentes.length === 0 ? (
        <p>No hay docentes registrados.</p>
      ) : (
        <ul>
          {docentes.map((docente) => (
            <li key={docente.id} style={{ marginBottom: 8 }}>
              <strong>{docente.nombre} {docente.apellido}</strong> — {docente.correo}
              <div style={{ marginTop: 4 }}>
                <button onClick={() => handleEditar(docente.id)} disabled={saving}>
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(docente.id)}
                  disabled={saving}
                  style={{ marginLeft: 8 }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}