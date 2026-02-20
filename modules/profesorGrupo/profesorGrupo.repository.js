import { db } from "../../db/database.js";
import { profesorGrupo, grupoHorario } from "../../db/drizzle/schema/links.js";
import { horarios } from "../../db/drizzle/schema/base.js";
import { eq, and } from "drizzle-orm";

export async function existeAsignación(idProfesor, idGrupo) {
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

export async function obtenerHorariosDeGrupo(idGrupo) {
    return await db
        .select({
            id_horario: grupoHorario.id_horario
        })
        .from(grupoHorario)
        .where(eq(grupoHorario.id_grupo, idGrupo));
}

export async function obtenerHorariosDelProfesor(idProfesor) {
    return await db
        .select({
            idHorario: grupoHorario.id_horario
        })
        .from(profesorGrupo)
        .innerJoin(
            grupoHorario,
            eq(grupoHorario.id_grupo, profesorGrupo.id_grupo)
        )
        .where(eq(profesorGrupo.id_profesor, idProfesor));
}

export async function limpiarPrincipal(idGrupo) {
    await db
        .update(profesorGrupo)
        .set({ es_principal: false })
        .where(eq(profesorGrupo.id_grupo, idGrupo));
}

export async function insertarAsignación(data) {
    await db.insert(profesorGrupo).values(data);
}

export async function obtenerPrincipalDelGrupo(idGrupo) {
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

export async function marcarProfesorComoPrincipal(idProfesor, idGrupo) {
    await db
        .update(profesorGrupo)
        .set({ es_principal: true })
        .where(
            and(
                eq(profesorGrupo.id_profesor, idProfesor),
                eq(profesorGrupo.id_grupo, idGrupo)
            )
        );
}
