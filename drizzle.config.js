/*
  Config simple para drizzle-kit.

  Este archivo sirve para generar migraciones SQL desde el schema de Drizzle.
  La ruta de DB usa un archivo local de desarrollo (no el userData de Electron)
  para que sea mas facil correr comandos desde terminal.
*/

const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
  schema: "./db/drizzle/schema/index.js",
  out: "./db/drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    // Con @libsql/client conviene usar prefijo file:
    // para indicar claramente que es una DB SQLite local.
    url: "file:./db/local-dev.sqlite"
  },
  verbose: true,
  strict: true
});
