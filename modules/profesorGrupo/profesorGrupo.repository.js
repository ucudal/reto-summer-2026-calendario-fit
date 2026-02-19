const { db } = require("../../db/database");
const { profesorGrupo, grupoHorario } = require("../../db/drizzle/schema/links");
const { horarios } = require("../../db/drizzle/schema/base");
const { eq, and } = require("drizzle-orm");

async function existeAsignación(idProfesor, idGrupo) {
    const result = await db
    .select()
    .from(profesorGrupo)
    .where(
        and(
            eq(profesorGrupo.id_profesor, idProfesor),
            eq(profesorGrupo.id_grupo, idGrupo)
        )
    );
    return result.length > 0;
}

async function obtenerHorariosDeGrupo(idGrupo) {
    return await db
    .select({
        id_horario: grupoHorario.id_horario
    })
    .from(grupoHorario)
    .where(eq(grupoHorario.id_grupo, idGrupo));
}

async function obtenerHorariosDelProfesor(idProfesor) {
    return await db
    .select({
        idHorario: grupoHorario.id_horario
    })
    .from(profesorGrupo)
    .innerJoin(
        grupoHorario, 
        eq(grupoHorario.id_grupo, profesorGrupo.id_grupo))
    .where(eq(profesorGrupo.id_profesor, idProfesor));
}

async function limpiarPrincipal(idGrupo) {
    await db
    .update(profesorGrupo)
    .set({ es_principal: false })
    .where(eq(profesorGrupo.id_grupo, idGrupo));
}

async function insertarAsignación(data) {
    await db.insert(profesorGrupo).values(data);
}

async function obtenerPrincipalDelGrupo(idGrupo) {
    const result = await db
    .select()
    .from(profesorGrupo)
    .where(
        and(
            eq(profesorGrupo.id_grupo, idGrupo),
            eq(profesorGrupo.es_principal, true)
        )
    );
    return result[0] || null;
}

async function marcarProfesorComoPrincipal(idProfesor, idGrupo) {
    await db
    .update
    .set({ es_principal: true })
    .where(
        and(
            eq(profesorGrupo.id_profesor, idProfesor),
            eq(profesorGrupo.id_grupo, idGrupo)
        )
    );

}

module.exports = {
    existeAsignación,
    obtenerHorariosDeGrupo,
    obtenerHorariosDelProfesor,
    limpiarPrincipal,
    insertarAsignación,
    obtenerPrincipalDelGrupo,
    marcarProfesorComoPrincipal
};