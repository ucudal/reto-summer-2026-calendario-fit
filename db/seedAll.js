import { reseedDatabase } from "./seed.js";

async function main() {
  await reseedDatabase();
}

main().catch((error) => {
  console.error("Error al ejecutar seed completo:", error);
  process.exit(1);
});
