import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Vocabulario oficial de schema.org fijado en el repo. Se versiona el archivo
 * en lugar de descargarlo para que el CI no dependa de la red y para que un
 * cambio del vocabulario sea un commit visible. Para actualizarlo, baja
 * https://schema.org/version/<n>/schemaorg-current-https.jsonld a
 * scripts/schema-org/ y cambia VERSION.
 */
export const VERSION = '30.1';
const ARCHIVO = fileURLToPath(
  new URL(
    `../schema-org/schemaorg-current-https-${VERSION}.jsonld`,
    import.meta.url
  )
);

const TIPOS_DE_DATO = new Set([
  'Text',
  'URL',
  'Number',
  'Integer',
  'Float',
  'Boolean',
  'Date',
  'DateTime',
  'Time',
  'CssSelectorType',
  'XPathType',
  'PronounceableText',
]);

const comoLista = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const nombreCorto = (id) => id.replace(/^schema:/, '');

let cache;

/**
 * Índice del vocabulario: clases con sus padres, propiedades con dominio y
 * rango, y miembros de las enumeraciones.
 */
export function cargarVocabulario(ruta = ARCHIVO) {
  if (cache && ruta === ARCHIVO) return cache;

  const grafo = JSON.parse(readFileSync(ruta, 'utf8'))['@graph'];
  const clases = new Map();
  const propiedades = new Map();
  const miembros = new Map();

  for (const nodo of grafo) {
    const tipos = comoLista(nodo['@type']);
    const id = nombreCorto(nodo['@id']);
    if (tipos.includes('rdfs:Class')) {
      clases.set(id, {
        padres: comoLista(nodo['rdfs:subClassOf'])
          .map((p) => p['@id'])
          .filter((p) => p.startsWith('schema:'))
          .map(nombreCorto),
        reemplazo: nodo['schema:supersededBy']
          ? nombreCorto(nodo['schema:supersededBy']['@id'])
          : undefined,
      });
    } else if (tipos.includes('rdf:Property')) {
      propiedades.set(id, {
        dominio: comoLista(nodo['schema:domainIncludes']).map((d) =>
          nombreCorto(d['@id'])
        ),
        rango: comoLista(nodo['schema:rangeIncludes']).map((r) =>
          nombreCorto(r['@id'])
        ),
        reemplazo: nodo['schema:supersededBy']
          ? nombreCorto(nodo['schema:supersededBy']['@id'])
          : undefined,
      });
    } else {
      // Un nodo cuyo @type es una clase de schema.org es un miembro de
      // enumeración (schema:Monday es de tipo schema:DayOfWeek).
      for (const t of tipos.filter((t) => t.startsWith('schema:'))) {
        const clase = nombreCorto(t);
        if (!miembros.has(clase)) miembros.set(clase, new Set());
        miembros.get(clase).add(id);
      }
    }
  }

  const ancestrosCache = new Map();
  const ancestros = (clase) => {
    if (ancestrosCache.has(clase)) return ancestrosCache.get(clase);
    const resultado = new Set([clase]);
    for (const padre of clases.get(clase)?.padres ?? []) {
      for (const a of ancestros(padre)) resultado.add(a);
    }
    ancestrosCache.set(clase, resultado);
    return resultado;
  };

  const vocab = {
    version: VERSION,
    existeTipo: (t) => clases.has(t),
    tipo: (t) => clases.get(t),
    propiedad: (p) => propiedades.get(p),
    esSubclase: (t, padre) => clases.has(t) && ancestros(t).has(padre),
    esTipoDeDato: (t) =>
      TIPOS_DE_DATO.has(t) ||
      [...(ancestros(t) ?? [])].some((a) => TIPOS_DE_DATO.has(a)),
    esEnumeracion: (t) => clases.has(t) && ancestros(t).has('Enumeration'),
    miembrosDe: (t) => {
      const resultado = new Set();
      for (const [clase, ids] of miembros) {
        if (clases.has(clase) && ancestros(clase).has(t)) {
          for (const id of ids) resultado.add(id);
        }
      }
      return resultado;
    },
    /** ¿Admite `tipo` la propiedad, directamente o heredada? */
    admitePropiedad: (tipo, prop) => {
      const def = propiedades.get(prop);
      if (!def || !clases.has(tipo)) return false;
      const linaje = ancestros(tipo);
      return def.dominio.some((d) => linaje.has(d));
    },
  };

  if (ruta === ARCHIVO) cache = vocab;
  return vocab;
}
