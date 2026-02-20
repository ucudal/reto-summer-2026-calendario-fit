import {
    crearGrupo,
    eliminarGrupo,
    obtenerGrupoPorId,
    modificarGrupo,
    listarGrupos
} from './grupos.repository.js';

export function altaGrupo(data) {
  validarGrupo(data);

  return crearGrupo({
    codigo: data.codigo.trim(),
    idMateria: data.idMateria,
    horasSemestrales: data.horasSemestrales,
    esContrasemestre: data.esContrasemestre,
    cupo: data.cupo,
    semestre: data.semestre,
    anio: data.anio
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
    semestre: data.semestre,
    anio: data.anio
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

  if (data.semestre == null || isNaN(Number(data.semestre)) || !Number.isInteger(Number(data.semestre)) || Number(data.semestre) <= 0) {
    throw new Error("Semestre inválido");
  }

  if (data.anio == null || isNaN(Number(data.anio)) || Number(data.anio) < 1900) {
    throw new Error("Año inválido");
  }

  if (data.esContrasemestre !== undefined && typeof data.esContrasemestre !== 'boolean') {
    throw new Error("esContrasemestre debe ser booleano");
  }
}

