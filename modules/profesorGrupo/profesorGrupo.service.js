const { db } = require('../../db/database');
const repository = require('./profesorGrupo.repository');

async function asignarProfesorAGrupo({
    idProfesor,
    idGrupo,
    carga = null,
    confirmado = false,
    esPrincipal = false
}) {

    const yaExiste = await repository.existeAsignación(idProfesor, idGrupo);
    if (yaExiste) {
        throw new Error('El profesor ya está asignado a este grupo');
    }

    const horariosGrupo = await repository.obtenerHorariosDeGrupo(idGrupo);
    const horariosProfesor = await repository.obtenerHorariosDelProfesor(idProfesor);

    const conflictos = horariosGrupo.some(hg =>
        horariosProfesor.some(hp => hp.idHorario === hg.id_horario)
    );

    if (conflictos) {
        throw new Error("Conflicto de horario detectado");
    }


    if (esPrincipal) {
        const principalExistente = await repository.obtenerPrincipalDelGrupo(idGrupo);
        if (principalExistente) {
            throw new Error("Ya existe un profesor principal asignado a este grupo");
        }
    }

    await repository.insertarAsignación({
        id_profesor: idProfesor,
        id_grupo: idGrupo,
        carga,
        confirmado,
        es_principal: esPrincipal
    });

    return { success: true };
}

async function cambiarProfesorPrincipal({ idProfesor, idGrupo }) {
    const asignaciónExistente = await repository.existeAsignación(idProfesor, idGrupo);
    if (!asignaciónExistente) {
        throw new Error('El profesor no está asignado a este grupo');
    }

    await db.transaction(async (tx) => {
        await tx
        .update(profesorGrupo)
        .set({ es_principal: false })
        .where(eq(profesorGrupo.id_grupo, idGrupo));

        await tx
        .update(profesorGrupo)
        .set({ es_principal: true })
        .where(
            and(
                eq(profesorGrupo.id_profesor, idProfesor),
                eq(profesorGrupo.id_grupo, idGrupo)
            )
        );
    });

    return { success: true };
}

module.exports = {
    asignarProfesorAGrupo,
    cambiarProfesorPrincipal
};