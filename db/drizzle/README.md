## Archivos

- `schema/base.js`
  - Tablas principales: `grupos`, `materias`, `profesores`, `salones`, `horarios`, etc.

- `schema/links.js`
  - Tablas relacionales (m2m)

- `schema/relations.js`
  - Relaciones de Drizzle para queries relacionales.

- `schema/index.js`
  - Exporta todo junto (es el archivo recomendado para importar).

## Como modificar sin romper

  -Si cambias los archivos mencionados

```bash
npm run db:generate -- genera migraciones
npm run db:migrate -- las impacta y en caso que no exista la base las crea
npx drizzle-kit studio --Fijate que la estructura que queres correcta
```