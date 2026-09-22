#!/usr/bin/env node
/**
 * Valida los datos estructurados (JSON-LD, microdata y RDFa) de todas las
 * páginas del build. Corre después de `pnpm build`:
 *
 *   pnpm test:schema            # valida dist/
 *   pnpm test:schema --inventario  # además lista las entidades por página
 *
 * Sale con código 1 si hay cualquier error o advertencia: el objetivo es que
 * validator.schema.org y la prueba de resultados enriquecidos de Google den
 * cero, no "casi cero".
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { formatearProblema, validarHtml } from './schema/validador.mjs';
import { VERSION } from './schema/vocabulario.mjs';

const args = process.argv.slice(2);
const inventario = args.includes('--inventario');
const directorio = args.find((a) => !a.startsWith('--')) ?? 'dist';

function* htmlDe(dir) {
  for (const nombre of readdirSync(dir).sort()) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) yield* htmlDe(ruta);
    else if (nombre.endsWith('.html')) yield ruta;
  }
}

let paginas;
try {
  paginas = [...htmlDe(directorio)];
} catch {
  console.error(`No existe ${directorio}/. Corre "pnpm build" antes.`);
  process.exit(2);
}
if (paginas.length === 0) {
  console.error(`No hay HTML en ${directorio}/. Corre "pnpm build" antes.`);
  process.exit(2);
}

const inicio = performance.now();
let total = 0;
const conProblemas = new Set();

for (const ruta of paginas) {
  const pagina = relative('.', ruta);
  const { problemas, entidades } = await validarHtml(
    readFileSync(ruta, 'utf8'),
    { pagina }
  );
  if (inventario) {
    console.log(`\n${pagina}`);
    for (const e of entidades) {
      console.log(
        `  ${e.formato} ${e.tipo}${e.id ? ` <${e.id}>` : ''}: ${e.propiedades.join(', ')}`
      );
    }
  }
  if (problemas.length > 0) {
    conProblemas.add(pagina);
    total += problemas.length;
    console.log(`\n✗ ${pagina}`);
    for (const p of problemas) console.log(formatearProblema(p));
  }
}

const ms = Math.round(performance.now() - inicio);
if (total > 0) {
  console.log(
    `\n✗ ${total} problema(s) de datos estructurados en ${conProblemas.size} de ${paginas.length} páginas (schema.org ${VERSION}, ${ms} ms).`
  );
  process.exit(1);
}
console.log(
  `✓ Datos estructurados válidos en ${paginas.length} páginas (schema.org ${VERSION}, ${ms} ms).`
);
