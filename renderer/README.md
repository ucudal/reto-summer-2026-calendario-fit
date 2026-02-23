# CalendarioFit – Frontend (React + Electron)

Este proyecto es una aplicación de escritorio construida con Electron + React (Vite) + SQLite (Drizzle ORM).

El frontend vive dentro de la carpeta renderer/ y se ejecuta con Vite.
Electron carga la aplicación React como renderer.

- ## Instalar dependencias del proyecto principal:


    `npm install`

- ## Instalar dependencias del frontend (React):

    ```
    cd renderer
    npm install
    cd ..
    ```

⚠️ El postinstall ejecuta electron-rebuild para compatibilidad con better-sqlite3.
No lo cancelen.

 ## Desarrollo (modo recomendado)

    Desde la raíz del proyecto:

    npm run dev

## Comunicación Frontend ↔ Backend

    NO se usa localhost.
    NO hay API HTTP.

    La comunicación es vía IPC de Electron.

    En el preload se expone:

    `window.api`

    Desde React se accede siempre vía window.api

    Ejemplo:
    ```
    window.api.docentes.listar()
    window.api.materias.crear(data)
    window.api.grupos.actualizar(data)
    window.api.horarios.eliminar(id)
    ```


### Cosas importantes a tener en cuenta

1️⃣ No romper el preload

2️⃣ No usar fetch/axios
