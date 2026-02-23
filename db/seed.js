// src/db/seed.js

import { db } from "./database.js";
import { carreras, profesores, materias, salones, horarios, requerimientosSalon, grupos } from "./drizzle/schema/base.js";

export async function seedDatabase() {
    console.log("🌱 Seeding database...");

    // Insert 5 carreras (nombres únicos)
    await db.insert(carreras).values([
        { nombre: "Ingeniería Agronomica" },
        { nombre: "Ingeniería Alimentos" },
        { nombre: "Ingeniería Ambiental" },
        { nombre: "Ingeniería Biomedica" },
        { nombre: "Ingeniería Civil" },
        { nombre: "Ingeniería Electrica, Telecom y Potencia" },
        { nombre: "Ingeniería Informatica" },
        { nombre: "Ingeniería Industrial" },
        { nombre: "Ingeniería Inteligencia Artificial" },
        { nombre: "Ingeniería Mecanica" }
    ]);

    // Insert 5 materias (nombres únicos)
    await db.insert(materias).values([
        { tipo: "Obligatoria", creditos: 6, nombre: "Programación I", tieneContrasemestre: 0 },
        { tipo: "Obligatoria", creditos: 4, nombre: "Álgebra Lineal", tieneContrasemestre: 0 },
        { tipo: "Optativa", creditos: 3, nombre: "Introducción a la IA", tieneContrasemestre: 0 },
        { tipo: "Obligatoria", creditos: 5, nombre: "Algoritmos y Estructuras de Datos", tieneContrasemestre: 1 },
        { tipo: "Obligatoria", creditos: 2, nombre: "Bases de Datos", tieneContrasemestre: 1 }
    ]);

    // Insert 5 profesores (correos únicos)
    await db.insert(profesores).values([
        { nombre: "Juan", apellido: "Pérez", correo: "juan.perez@ucu.edu.com" },
        { nombre: "Ana", apellido: "Gómez", correo: "ana.gomez@ucu.edu.com" },
        { nombre: "María", apellido: "López", correo: "maria.lopez@ucu.edu.com" },
        { nombre: "Luis", apellido: "Martínez", correo: "luis.martinez@ucu.edu.com" },
        { nombre: "Sofía", apellido: "Rodríguez", correo: "sofia.rodriguez@ucu.edu.com" }
    ]);

    // Insert 5 salones
    await db.insert(salones).values([
        { nombre: "A101", edificio: "Central", aforo: 40 },
        { nombre: "B202", edificio: "Mullin", aforo: 30 },
        { nombre: "C303", edificio: "Central", aforo: 50 },
        { nombre: "D404", edificio: "San Jose", aforo: 25 },
        { nombre: "E505", edificio: "San Ignacio", aforo: 35 }
    ]);

    // Insert 5 horarios (modulo, dia)
    await db.insert(horarios).values([
        { modulo: 1, dia: "Lunes" },
        { modulo: 2, dia: "Martes" },
        { modulo: 3, dia: "Miércoles" },
        { modulo: 4, dia: "Jueves" },
        { modulo: 5, dia: "Viernes" }
    ]);

    // Insert 5 requerimientos de salón
    await db.insert(requerimientosSalon).values([
        { caracteristicas: "Proyector" },
        { caracteristicas: "Pizarra blanca" },
        { caracteristicas: "Laboratorio de computación" },
        { caracteristicas: "Acceso para discapacitados" },
        { caracteristicas: "Conexión a red de alta velocidad" }
    ]);

    // Crear 5 grupos referenciando materias insertadas arriba.
    // Recuperamos los ids de materias para mantener integridad referencial.
    const materiasRows = await db.select().from(materias);
    const materiaIds = materiasRows.map((m) => m.id);

    // Si por alguna razón no hay materias, evitamos insertar grupos inválidos.
    if (materiaIds.length === 0) {
        console.warn("No se encontraron materias para crear grupos. Se omite la creación de grupos.");
    } else {
        const gruposToInsert = [];
        for (let i = 0; i < 5; i++) {
            const materiaId = materiaIds[i % materiaIds.length];
            gruposToInsert.push({
                codigo: `G-${100 + i}`,
                idMateria: materiaId,
                horasSemestrales: `${30 + i * 5}`, // texto (según esquema actual)
                esContrasemestre: 0,
                cupo: 30 + i * 5,
                semestre: (i % 2) + 1,
                anio: 2026
            });
        }

        await db.insert(grupos).values(gruposToInsert);
    }
}
