import {
    crearGrupo,
    eliminarGrupo,
    obtenerGrupoPorId,
    modificarGrupo,
    listarGrupos,
    asignarProfesor,
    insertarHorarios
} from './grupos.repository.js';

const DIAS_VALIDOS = ["lunes", "martes", "miercoles", "miércoles", "jueves", "viernes", "sabado", "sábado"];
const MODULOS_VALIDOS = { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true };

export function altaGrupo(data) {
  validarGrupo(data);

  return crearGrupo({
    codigo: data.codigo.trim(),
    idMateria: data.idMateria,
    horasSemestrales: data.horasSemestrales,
    esContrasemestre: data.esContrasemestre,
    cupo: data.cupo,
    color: data.color,
    idSemestre: data.idSemestre
  });
};

export function actualizarGrupo(data) {
  if (!data.id) {
    throw new Error("ID requerido para modificar grupo");
  }

  const existente = obtenerGrupoPorId(data.id);
  if (!existente) {
    throw new Error("Grupo no encontrado");
  }

  validarGrupo(data);

  return modificarGrupo(data.id, {
    codigo: data.codigo.trim(),
    idMateria: data.idMateria,
    horasSemestrales: data.horasSemestrales,
    esContrasemestre: data.esContrasemestre,
    cupo: data.cupo,
    color: data.color,
    idSemestre: data.idSemestre
  });
};

export function bajaGrupo(id) {
  if (!id) {
    throw new Error("ID requerido para eliminar grupo");
  }
  const existente = obtenerGrupoPorId(id);
  if (!existente) {
    throw new Error("Grupo no encontrado");
  }
  return eliminarGrupo(id);
};

export async function obtenerGrupo(id) {
  if (!id) {
    throw new Error("ID requerido para obtener grupo");
  }
  const grupo = await obtenerGrupoPorId(id);
    if (!grupo) {
        throw new Error("Grupo no encontrado");
    }
    return grupo;
};

export async function listarGruposService() {
  return await listarGrupos();
};

export async function asignarProfesorGrupo(data) {

  if (!data.idGrupo || !data.idProfesor) {
    throw new Error("Grupo y profesor requeridos");
  }

  return await asignarProfesor({
    idProfesor: data.idProfesor,
    idGrupo: data.idGrupo,
    carga: data.carga || 10,
    esPrincipal: data.esPrincipal ?? 1
  });
}

export async function agregarHorarioGrupo(idGrupo, horarios) {

  if (!idGrupo) {
    throw new Error("ID de grupo requerido");
  }

  if (!Array.isArray(horarios) || horarios.length === 0) {
    throw new Error("Debe enviar horarios");
  }

  for (const h of horarios) {

    if (!DIAS_VALIDOS.includes(h.dia.toLowerCase())) {
      throw new Error(`Día inválido: ${h.dia}`);
    }

    if (!MODULOS_VALIDOS[h.modulo]) {
      throw new Error(`Módulo inválido: ${h.modulo}`);
    }
  }

  return await insertarHorarios(idGrupo, horarios);
}

/* export async function agregarRequerimientosGrupo(idGrupo, requerimientos) {

  if (!idGrupo) {
    throw new Error("ID de grupo requerido");
  }

  if (!Array.isArray(requerimientos) || requerimientos.length === 0) {
    throw new Error("Debe enviar requerimientos");
  }

  return await insertarRequerimientos(idGrupo, requerimientos);
} */

function validarGrupo(data) {
  if (!data) {
    throw new Error("Datos de grupo requeridos");
  }

  if (!data.codigo || data.codigo.trim() === "") {
    throw new Error("El código es obligatorio");
  }

  if (!data.idMateria) {
    throw new Error("La materia es obligatoria");
  }

  if (data.horasSemestrales == null || isNaN(Number(data.horasSemestrales)) || Number(data.horasSemestrales) < 0) {
    throw new Error("Horas semestrales inválidas");
  }

  if (data.cupo == null || isNaN(Number(data.cupo)) || Number(data.cupo) <= 0) {
    throw new Error("Cupo inválido");
  }

  if (!data.idSemestre ) {
    throw new Error("El semestre es obligatorio");
  }

  if (data.anio == null || isNaN(Number(data.anio)) || Number(data.anio) <= 0) {
    throw new Error("Año inválido");
  }

  if (data.esContrasemestre !== undefined && typeof data.esContrasemestre !== 'boolean') {
    throw new Error("esContrasemestre debe ser booleano");
  }
}
