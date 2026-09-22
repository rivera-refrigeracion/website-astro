import WebAutoExtractor from '@marbec/web-auto-extractor';
import AdobeValidator from '@adobe/structured-data-validator';
import { cargarVocabulario } from './vocabulario.mjs';

/**
 * Validador de datos estructurados del sitio construido.
 *
 * Se apoya en dos librerías mantenidas y cubre lo que no hacen:
 * - @marbec/web-auto-extractor extrae microdata y RDFa.
 * - @adobe/structured-data-validator aplica las reglas de Google para
 *   BreadcrumbList, Organization, Offer, ImageObject, Person y demás.
 *
 * Ninguna de las dos revisa el *tipo de valor* de cada propiedad (Adobe lo deja
 * como TODO), y ese es justo el error que marcó validator.schema.org: un
 * `email` con `mailto:`. Por eso este módulo añade, contra el vocabulario
 * oficial fijado en el repo: tipos y propiedades existentes, rangos de valor,
 * formatos (email, teléfono, fechas ISO, horarios), las reglas de Google para
 * LocalBusiness, BlogPosting/Article y FAQPage que Adobe no tiene, y
 * coherencia con lo visible en la página.
 *
 * @typedef {'error' | 'advertencia'} Severidad
 * @typedef {{
 *   pagina: string,
 *   formato: string,
 *   entidad: string,
 *   propiedad: string,
 *   mensaje: string,
 *   severidad: Severidad,
 *   origen: string,
 * }} Problema
 */

const comoLista = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const esObjeto = (v) =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const PREFIJO_SCHEMA = /^(?:https?:\/\/schema\.org\/|schema:)/;
const sinPrefijo = (s) => String(s).replace(PREFIJO_SCHEMA, '');
const tiposDe = (nodo) => comoLista(nodo['@type']).map(sinPrefijo);

const clavesDeDatos = (nodo) =>
  Object.keys(nodo).filter((k) => !k.startsWith('@'));
const esReferencia = (nodo) =>
  esObjeto(nodo) &&
  typeof nodo['@id'] === 'string' &&
  clavesDeDatos(nodo).length === 0 &&
  nodo['@type'] === undefined;

const RE_URL_ABSOLUTA = /^https?:\/\/[^\s/$.?#][^\s]*$/i;
const RE_EMAIL = /^[^\s@:]+@[^\s@]+\.[^\s@]+$/;
const RE_TELEFONO = /^\+?[\d\s().-]{7,20}$/;
const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const RE_FECHA_HORA =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/;
const RE_HORA = /^\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?$/;
const DIA = '(?:Mo|Tu|We|Th|Fr|Sa|Su)';
const RE_OPENING_HOURS = new RegExp(
  `^(?:${DIA}(?:-${DIA})?(?:,${DIA}(?:-${DIA})?)*)(?: \\d{2}:\\d{2}-\\d{2}:\\d{2})?$`
);

const esFechaReal = (s) => !Number.isNaN(Date.parse(s));

// --- Extracción -----------------------------------------------------------

/** Bloques JSON-LD de la página, ya parseados, con su posición. */
function extraerJsonLd(html, problemas, base) {
  const re =
    /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  const nodos = [];
  let m;
  let indice = 0;
  while ((m = re.exec(html))) {
    indice += 1;
    let datos;
    try {
      datos = JSON.parse(m[1]);
    } catch (e) {
      problemas.push({
        ...base,
        formato: 'JSON-LD',
        entidad: `bloque ${indice}`,
        propiedad: '-',
        mensaje: `JSON inválido: ${e.message}`,
        severidad: 'error',
        origen: 'schema.org',
      });
      continue;
    }
    for (const raiz of comoLista(datos)) {
      const contexto = raiz['@context'];
      if (!/^https?:\/\/schema\.org\/?$/.test(String(contexto ?? ''))) {
        problemas.push({
          ...base,
          formato: 'JSON-LD',
          entidad: `bloque ${indice}`,
          propiedad: '@context',
          mensaje: `@context debe ser "https://schema.org" y es ${JSON.stringify(contexto)}`,
          severidad: 'error',
          origen: 'schema.org',
        });
      }
      const grafo = raiz['@graph'] ? comoLista(raiz['@graph']) : [raiz];
      for (const nodo of grafo) {
        const { '@context': _ignorado, ...resto } = nodo;
        nodos.push(resto);
      }
    }
  }
  return nodos;
}

/** Microdata y RDFa como nodos con la misma forma que JSON-LD. */
function extraerMicrodataYRdfa(html) {
  const datos = new WebAutoExtractor({
    addLocation: false,
    embedSource: [],
  }).parse(html);
  const limpiar = (v) => {
    if (Array.isArray(v)) return v.map(limpiar);
    if (!esObjeto(v)) return v;
    const salida = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === '@context' || k === '@source' || k === '@location') continue;
      salida[k] = limpiar(val);
    }
    return salida;
  };
  const aplanar = (grupos) =>
    Object.values(grupos ?? {})
      .flat()
      .map(limpiar);
  return { microdata: aplanar(datos.microdata), rdfa: aplanar(datos.rdfa) };
}

function decodificarEntidades(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16))
    );
}

const aTexto = (html) =>
  decodificarEntidades(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

/** Texto que ve el usuario: el <body> sin scripts, estilos ni SVG. */
function textoVisible(html) {
  const cuerpo = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  return aTexto(
    cuerpo.replace(
      /<(script|style|svg|template|noscript)\b[\s\S]*?<\/\1>/gi,
      ' '
    )
  );
}

// --- Validación contra el vocabulario ---------------------------------------

function crearContexto(vocab, base, indiceIds, problemas) {
  const reportar = (
    formato,
    entidad,
    propiedad,
    mensaje,
    severidad = 'error',
    origen = 'schema.org'
  ) =>
    problemas.push({
      ...base,
      formato,
      entidad,
      propiedad,
      mensaje,
      severidad,
      origen,
    });

  const admiteTexto = (rango) =>
    rango.some(
      (r) => r === 'Text' || (vocab.esSubclase(r, 'Text') && r !== 'URL')
    );

  function validarFormatoEspecifico(formato, entidad, prop, valor) {
    if (prop === 'email' && !RE_EMAIL.test(valor.replace(/^mailto:/i, ''))) {
      reportar(
        formato,
        entidad,
        prop,
        `"${valor}" no es una dirección de correo válida`
      );
    }
    if (
      (prop === 'telephone' || prop === 'faxNumber') &&
      !/^tel:/i.test(valor)
    ) {
      if (!RE_TELEFONO.test(valor)) {
        reportar(
          formato,
          entidad,
          prop,
          `"${valor}" no parece un número de teléfono`
        );
      } else if (!valor.startsWith('+')) {
        reportar(
          formato,
          entidad,
          prop,
          `"${valor}" sin prefijo internacional: usa el formato +57…`,
          'advertencia',
          'Google'
        );
      }
    }
    if (prop === 'openingHours' && !RE_OPENING_HOURS.test(valor)) {
      reportar(
        formato,
        entidad,
        prop,
        `"${valor}" no sigue el formato "Mo-Fr 08:00-18:00"`
      );
    }
    if (prop === 'priceRange' && valor.length >= 100) {
      reportar(
        formato,
        entidad,
        prop,
        'priceRange debe tener menos de 100 caracteres',
        'error',
        'Google'
      );
    }
  }

  function validarTexto(formato, entidad, prop, rango, valor) {
    if (valor.trim() === '') {
      reportar(formato, entidad, prop, 'valor vacío');
      return;
    }
    const esquema = valor.match(/^(mailto|tel):/i)?.[1]?.toLowerCase();
    if (esquema && !rango.includes('URL')) {
      // Es el error de validator.schema.org: en microdata, itemprop sobre un
      // <a> toma el href como valor, y un href mailto:/tel: es una URL que no
      // se puede convertir a Text.
      const pista =
        prop === 'email'
          ? ' Pon la dirección sola, sin "mailto:" (en microdata, itemprop en un <span> o <meta content>, no en el <a href>).'
          : prop === 'telephone'
            ? ' Pon el número solo, sin "tel:".'
            : '';
      reportar(
        formato,
        entidad,
        prop,
        `"${valor}" es una URL ${esquema}: pero "${prop}" espera ${rango.join(' o ')}; no se puede convertir al tipo correcto.${pista}`
      );
      return;
    }
    validarFormatoEspecifico(formato, entidad, prop, valor);

    if (admiteTexto(rango)) return;
    if (rango.includes('URL') && RE_URL_ABSOLUTA.test(valor)) return;
    if (rango.includes('Date') && RE_FECHA.test(valor) && esFechaReal(valor))
      return;
    if (
      rango.includes('DateTime') &&
      RE_FECHA_HORA.test(valor) &&
      esFechaReal(valor)
    )
      return;
    if (rango.includes('Time') && RE_HORA.test(valor)) return;
    if (
      rango.some((r) => r === 'Number' || vocab.esSubclase(r, 'Number')) &&
      valor.trim() !== '' &&
      Number.isFinite(Number(valor))
    )
      return;
    if (
      rango.includes('Boolean') &&
      /^(?:true|false|https?:\/\/schema\.org\/(?:True|False))$/i.test(valor)
    )
      return;
    const enumeraciones = rango.filter((r) => vocab.esEnumeracion(r));
    if (enumeraciones.some((e) => vocab.miembrosDe(e).has(sinPrefijo(valor))))
      return;

    const clases = rango.filter(
      (r) => !vocab.esTipoDeDato(r) && !vocab.esEnumeracion(r)
    );
    // Una URL absoluta donde se espera un objeto identifica la entidad (es lo
    // que Google pide en ListItem.item), así que se acepta.
    if (clases.length > 0 && RE_URL_ABSOLUTA.test(valor)) return;
    if (clases.length > 0 && enumeraciones.length === 0) {
      // schema.org acepta texto donde espera un objeto, pero Google no saca
      // nada útil de ahí.
      reportar(
        formato,
        entidad,
        prop,
        `se esperaba un objeto ${clases.join(' o ')} y llegó el texto "${valor}"`,
        'advertencia'
      );
      return;
    }
    reportar(
      formato,
      entidad,
      prop,
      `"${valor}" no es un valor válido: "${prop}" espera ${rango.join(' o ')}`
    );
  }

  function validarValor(formato, entidad, prop, rango, valor) {
    if (valor === null || valor === undefined) {
      reportar(formato, entidad, prop, 'valor nulo');
      return;
    }
    if (typeof valor === 'string') {
      validarTexto(formato, entidad, prop, rango, valor);
      return;
    }
    if (typeof valor === 'number') {
      const ok =
        admiteTexto(rango) ||
        rango.some((r) => r === 'Number' || vocab.esSubclase(r, 'Number'));
      if (!ok)
        reportar(
          formato,
          entidad,
          prop,
          `el número ${valor} no encaja: "${prop}" espera ${rango.join(' o ')}`
        );
      return;
    }
    if (typeof valor === 'boolean') {
      if (!rango.includes('Boolean'))
        reportar(
          formato,
          entidad,
          prop,
          `"${prop}" no admite booleanos; espera ${rango.join(' o ')}`
        );
      return;
    }
    if (!esObjeto(valor)) {
      reportar(
        formato,
        entidad,
        prop,
        `valor de tipo ${typeof valor} no admitido`
      );
      return;
    }

    let objetivo = valor;
    if (esReferencia(valor)) {
      objetivo = indiceIds.get(valor['@id']);
      if (!objetivo) {
        reportar(
          formato,
          entidad,
          prop,
          `referencia a "${valor['@id']}", pero ningún nodo de esta página tiene ese @id`
        );
        return;
      }
    }

    const tipos = tiposDe(objetivo);
    if (tipos.length === 0) {
      reportar(formato, entidad, prop, 'objeto sin @type');
    } else {
      const compatible = tipos.some(
        (t) =>
          t === 'Role' ||
          vocab.esSubclase(t, 'Role') ||
          rango.some((r) => vocab.esSubclase(t, r))
      );
      if (!compatible) {
        reportar(
          formato,
          entidad,
          prop,
          `"${prop}" espera ${rango.join(' o ')} y recibió ${tipos.join('/')}`
        );
      }
    }
    if (objetivo === valor) {
      validarNodo(
        formato,
        `${entidad} › ${prop}: ${tipos.join('/') || '?'}`,
        valor
      );
    }
  }

  function validarNodo(formato, entidad, nodo) {
    const tipos = tiposDe(nodo);
    if (tipos.length === 0) {
      reportar(formato, entidad, '@type', 'nodo sin @type');
    }
    const validos = [];
    for (const t of tipos) {
      const def = vocab.tipo(t);
      if (!def) {
        reportar(
          formato,
          entidad,
          '@type',
          `el tipo "${t}" no existe en schema.org ${vocab.version}`
        );
      } else {
        validos.push(t);
        if (def.reemplazo) {
          reportar(
            formato,
            entidad,
            '@type',
            `"${t}" está obsoleto; usa "${def.reemplazo}"`,
            'advertencia'
          );
        }
      }
    }
    if (
      nodo['@id'] !== undefined &&
      !RE_URL_ABSOLUTA.test(String(nodo['@id']))
    ) {
      reportar(
        formato,
        entidad,
        '@id',
        `@id "${nodo['@id']}" debe ser una URL absoluta`
      );
    }

    for (const clave of clavesDeDatos(nodo)) {
      const prop = sinPrefijo(clave);
      const def = vocab.propiedad(prop);
      if (!def) {
        reportar(
          formato,
          entidad,
          prop,
          `la propiedad "${prop}" no existe en schema.org ${vocab.version}`
        );
        continue;
      }
      if (
        validos.length > 0 &&
        !validos.some((t) => vocab.admitePropiedad(t, prop))
      ) {
        reportar(
          formato,
          entidad,
          prop,
          `"${prop}" no es una propiedad de ${validos.join('/')}`
        );
      }
      if (def.reemplazo) {
        reportar(
          formato,
          entidad,
          prop,
          `"${prop}" está obsoleta; usa "${def.reemplazo}"`,
          'advertencia'
        );
      }
      for (const valor of comoLista(nodo[clave])) {
        validarValor(formato, entidad, prop, def.rango, valor);
      }
    }
  }

  return { validarNodo, reportar };
}

// --- Reglas de Google para resultados enriquecidos ---------------------------

/**
 * Lo que Google exige o recomienda para los tipos que Adobe no cubre.
 * https://developers.google.com/search/docs/appearance/structured-data/local-business
 * https://developers.google.com/search/docs/appearance/structured-data/article
 * https://developers.google.com/search/docs/appearance/structured-data/faqpage
 * https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
function reglasGoogle({ vocab, formato, entidad, nodo, resolver, reportar }) {
  const tipos = tiposDe(nodo);
  const es = (padre) => tipos.some((t) => vocab.esSubclase(t, padre));
  const google = (prop, mensaje, severidad = 'error') =>
    reportar(formato, entidad, prop, mensaje, severidad, 'Google');
  const falta = (prop) => comoLista(nodo[prop]).length === 0;

  if (es('LocalBusiness')) {
    for (const prop of ['name', 'address']) {
      if (falta(prop)) google(prop, `LocalBusiness requiere "${prop}"`);
    }
    for (const prop of ['telephone', 'url', 'image', 'geo']) {
      if (falta(prop))
        google(prop, `LocalBusiness debería tener "${prop}"`, 'advertencia');
    }
    if (falta('openingHoursSpecification') && falta('openingHours')) {
      google(
        'openingHoursSpecification',
        'LocalBusiness debería declarar su horario',
        'advertencia'
      );
    }
    for (const dir of comoLista(nodo.address).map(resolver)) {
      if (!esObjeto(dir)) continue;
      for (const prop of ['addressLocality', 'addressCountry']) {
        if (comoLista(dir[prop]).length === 0) {
          google(
            `address.${prop}`,
            `la dirección debería tener "${prop}"`,
            'advertencia'
          );
        }
      }
      if (
        dir.addressCountry &&
        !/^[A-Z]{2}$/.test(String(dir.addressCountry))
      ) {
        google(
          'address.addressCountry',
          `usa el código ISO 3166-1 de dos letras ("CO"), no "${dir.addressCountry}"`,
          'advertencia'
        );
      }
    }
    for (const geo of comoLista(nodo.geo).map(resolver)) {
      if (!esObjeto(geo)) continue;
      for (const eje of ['latitude', 'longitude']) {
        const decimales = String(geo[eje] ?? '').split('.')[1]?.length ?? 0;
        if (geo[eje] === undefined || !Number.isFinite(Number(geo[eje]))) {
          google(`geo.${eje}`, `"${eje}" debe ser un número`);
        } else if (decimales < 5) {
          google(
            `geo.${eje}`,
            `"${eje}" debería tener al menos 5 decimales`,
            'advertencia'
          );
        }
      }
    }
    for (const horario of comoLista(nodo.openingHoursSpecification).map(
      resolver
    )) {
      if (!esObjeto(horario)) continue;
      for (const prop of ['dayOfWeek', 'opens', 'closes']) {
        if (comoLista(horario[prop]).length === 0) {
          google(
            `openingHoursSpecification.${prop}`,
            `cada horario requiere "${prop}"`
          );
        }
      }
    }
  }

  if (es('Article')) {
    for (const prop of ['headline', 'image', 'datePublished', 'author']) {
      if (falta(prop))
        google(
          prop,
          `${tipos.join('/')} debería tener "${prop}"`,
          'advertencia'
        );
    }
    if (typeof nodo.headline === 'string' && nodo.headline.length > 110) {
      google(
        'headline',
        'headline de más de 110 caracteres: Google puede cortarlo',
        'advertencia'
      );
    }
    for (const autor of comoLista(nodo.author).map(resolver)) {
      if (!esObjeto(autor)) {
        google('author', 'author debe ser un Person u Organization, no texto');
        continue;
      }
      if (!autor.name) google('author.name', 'el autor requiere "name"');
      if (!autor.url && !autor.sameAs) {
        google(
          'author.url',
          'el autor debería tener "url" para que Google lo identifique',
          'advertencia'
        );
      }
    }
    if (
      nodo.datePublished &&
      nodo.dateModified &&
      Date.parse(nodo.dateModified) < Date.parse(nodo.datePublished)
    ) {
      google('dateModified', 'dateModified es anterior a datePublished');
    }
  }

  if (es('FAQPage')) {
    const preguntas = comoLista(nodo.mainEntity).map(resolver);
    if (preguntas.length === 0)
      google(
        'mainEntity',
        'FAQPage requiere al menos una Question en "mainEntity"'
      );
    preguntas.forEach((p, i) => {
      if (!esObjeto(p) || !tiposDe(p).includes('Question')) {
        google(
          `mainEntity[${i}]`,
          'cada elemento de mainEntity debe ser una Question'
        );
        return;
      }
      if (!p.name)
        google(`mainEntity[${i}].name`, 'la pregunta requiere "name"');
      const respuesta = resolver(comoLista(p.acceptedAnswer)[0]);
      if (!esObjeto(respuesta) || !respuesta.text) {
        google(
          `mainEntity[${i}].acceptedAnswer.text`,
          'la pregunta requiere "acceptedAnswer" con "text"'
        );
      }
    });
  }

  if (es('BreadcrumbList')) {
    const elementos = comoLista(nodo.itemListElement).map(resolver);
    elementos.forEach((el, i) => {
      if (!esObjeto(el)) return;
      if (Number(el.position) !== i + 1) {
        google(
          `itemListElement[${i}].position`,
          `position debería ser ${i + 1} y es ${JSON.stringify(el.position)}`
        );
      }
      const item = resolver(el.item);
      if (!el.name && !(esObjeto(item) && item.name)) {
        google(`itemListElement[${i}].name`, 'cada ListItem requiere "name"');
      }
    });
  }
}

// --- Página completa --------------------------------------------------------

/** Recorre un nodo y sus hijos objeto, sin seguir referencias. */
function* recorrer(nodo, ruta = []) {
  if (Array.isArray(nodo)) {
    for (const n of nodo) yield* recorrer(n, ruta);
    return;
  }
  if (!esObjeto(nodo)) return;
  yield { nodo, ruta };
  for (const clave of clavesDeDatos(nodo)) {
    yield* recorrer(nodo[clave], [...ruta, clave]);
  }
}

const etiqueta = (nodo) => {
  const tipos = tiposDe(nodo).join('/') || '(sin @type)';
  return nodo['@id'] ? `${tipos} <${nodo['@id']}>` : tipos;
};

/** Mapea el formato de salida de Adobe al nuestro. */
function problemaDeAdobe(base, formato, issue) {
  const entidad =
    (issue.path ?? [])
      .map((p) => (p.property ? `${p.property}: ${p.type}` : p.type))
      .join(' › ') || '?';
  return {
    ...base,
    formato,
    entidad,
    propiedad: (issue.fieldNames ?? []).join(', ') || '-',
    mensaje: issue.issueMessage,
    severidad: issue.severity === 'ERROR' ? 'error' : 'advertencia',
    origen: 'Google (Adobe)',
  };
}

/**
 * Valida todos los datos estructurados de un HTML.
 * @param {string} html
 * @param {{ pagina: string }} opciones
 * @returns {Promise<{ problemas: Problema[], entidades: object[] }>}
 */
export async function validarHtml(html, { pagina }) {
  const vocab = cargarVocabulario();
  const base = { pagina };
  /** @type {Problema[]} */
  const problemas = [];

  const fuentes = {
    'JSON-LD': extraerJsonLd(html, problemas, base),
    ...(() => {
      const { microdata, rdfa } = extraerMicrodataYRdfa(html);
      return { microdata, RDFa: rdfa };
    })(),
  };

  // Índice de nodos con @id de todas las fuentes, para resolver referencias
  // y detectar un mismo @id definido dos veces con datos distintos.
  const indiceIds = new Map();
  for (const [formato, nodos] of Object.entries(fuentes)) {
    for (const { nodo } of recorrer(nodos)) {
      const id = nodo['@id'];
      if (typeof id !== 'string' || esReferencia(nodo)) continue;
      const previo = indiceIds.get(id);
      if (previo && JSON.stringify(previo) !== JSON.stringify(nodo)) {
        problemas.push({
          ...base,
          formato,
          entidad: etiqueta(nodo),
          propiedad: '@id',
          mensaje: `el @id "${id}" está definido dos veces con datos distintos; define el nodo una vez y referencia el resto con {"@id": …}`,
          severidad: 'error',
          origen: 'coherencia',
        });
      }
      indiceIds.set(id, nodo);
    }
  }
  const resolver = (v) =>
    esReferencia(v) ? (indiceIds.get(v['@id']) ?? v) : v;

  const { validarNodo, reportar } = crearContexto(
    vocab,
    base,
    indiceIds,
    problemas
  );
  const adobe = new AdobeValidator();

  for (const [formato, nodos] of Object.entries(fuentes)) {
    for (const nodo of nodos) {
      validarNodo(formato, etiqueta(nodo), nodo);
    }
    for (const { nodo, ruta } of recorrer(nodos)) {
      const entidad = ruta.length
        ? `${ruta.join(' › ')}: ${etiqueta(nodo)}`
        : etiqueta(nodo);
      reglasGoogle({ vocab, formato, entidad, nodo, resolver, reportar });
    }
    const porTipo = {};
    for (const nodo of nodos) {
      const tipo = tiposDe(nodo)[0] ?? 'Thing';
      (porTipo[tipo] ??= []).push(nodo);
    }
    const clave = { 'JSON-LD': 'jsonld', microdata: 'microdata', RDFa: 'rdfa' }[
      formato
    ];
    const issues = await adobe.validate({
      jsonld: {},
      microdata: {},
      rdfa: {},
      [clave]: porTipo,
    });
    problemas.push(...issues.map((i) => problemaDeAdobe(base, formato, i)));
  }

  // Una sola entidad por negocio y por página: dos LocalBusiness (o dos
  // WebPage) sin el mismo @id son, para Google, dos cosas distintas que se
  // contradicen.
  const definiciones = (padre) => {
    const vistas = new Map();
    for (const [formato, nodos] of Object.entries(fuentes)) {
      for (const { nodo, ruta } of recorrer(nodos)) {
        if (
          esReferencia(nodo) ||
          !tiposDe(nodo).some((t) => vocab.esSubclase(t, padre))
        )
          continue;
        const clave =
          nodo['@id'] ?? `${formato}:${ruta.join('.')}:${vistas.size}`;
        if (!vistas.has(clave))
          vistas.set(
            clave,
            `${formato}${ruta.length ? ` (${ruta.join(' › ')})` : ''}`
          );
      }
    }
    return [...vistas.values()];
  };
  for (const padre of ['LocalBusiness', 'WebPage']) {
    const donde = definiciones(padre);
    if (donde.length > 1) {
      problemas.push({
        ...base,
        formato: [...new Set(donde.map((d) => d.split(' ')[0]))].join(' + '),
        entidad: padre,
        propiedad: '-',
        mensaje: `${donde.length} entidades ${padre} distintas en la página: ${donde.join('; ')}. Deja una sola con @id y enlaza las demás con {"@id": …}`,
        severidad: 'error',
        origen: 'coherencia',
      });
    }
  }

  // Coherencia con lo que ve el usuario.
  const canonical = html
    .match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]
    .match(/href=["']([^"']+)["']/i)?.[1];
  const visible = textoVisible(html);
  const visibleSinSeparadores = visible.replace(/(?<=\d)[\s().-]+(?=\d)/g, '');
  const h1 = aTexto(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
  const coherencia = (formato, entidad, propiedad, mensaje) =>
    problemas.push({
      ...base,
      formato,
      entidad,
      propiedad,
      mensaje,
      severidad: 'error',
      origen: 'coherencia',
    });

  for (const [formato, nodos] of Object.entries(fuentes)) {
    for (const { nodo } of recorrer(nodos)) {
      if (esReferencia(nodo)) continue;
      const tipos = tiposDe(nodo);
      const es = (padre) => tipos.some((t) => vocab.esSubclase(t, padre));
      const ent = etiqueta(nodo);
      if (es('WebPage') && canonical && nodo.url && nodo.url !== canonical) {
        coherencia(
          formato,
          ent,
          'url',
          `url "${nodo.url}" no coincide con el canonical "${canonical}"`
        );
      }
      if (es('BreadcrumbList') && canonical) {
        const ultimo = resolver(comoLista(nodo.itemListElement).at(-1));
        const url = esObjeto(ultimo)
          ? esObjeto(ultimo.item)
            ? ultimo.item['@id']
            : ultimo.item
          : undefined;
        if (url && url !== canonical) {
          coherencia(
            formato,
            ent,
            'itemListElement',
            `la última miga apunta a "${url}" y la página es "${canonical}"`
          );
        }
      }
      if (es('Organization')) {
        for (const tel of comoLista(nodo.telephone).map(String)) {
          const digitos = tel.replace(/\D/g, '');
          if (
            digitos &&
            !visibleSinSeparadores.includes(digitos) &&
            !visibleSinSeparadores.includes(digitos.replace(/^57/, ''))
          ) {
            coherencia(
              formato,
              ent,
              'telephone',
              `el teléfono ${tel} no aparece en la página`
            );
          }
        }
        for (const email of comoLista(nodo.email).map(String)) {
          const limpio = email.replace(/^mailto:/i, '');
          if (!visible.includes(limpio))
            coherencia(
              formato,
              ent,
              'email',
              `el correo ${limpio} no aparece en la página`
            );
        }
      }
      if (
        es('Article') &&
        typeof nodo.headline === 'string' &&
        h1 &&
        nodo.headline.trim() !== h1
      ) {
        coherencia(
          formato,
          ent,
          'headline',
          `headline "${nodo.headline}" no coincide con el <h1> "${h1}"`
        );
      }
      if (
        tipos.includes('Question') &&
        typeof nodo.name === 'string' &&
        !visible.includes(nodo.name.trim())
      ) {
        coherencia(
          formato,
          ent,
          'name',
          `la pregunta "${nodo.name}" no aparece en la página`
        );
      }
    }
  }

  const entidades = Object.entries(fuentes).flatMap(([formato, nodos]) =>
    nodos.map((nodo) => ({
      formato,
      tipo: tiposDe(nodo).join('/'),
      id: nodo['@id'],
      propiedades: clavesDeDatos(nodo),
    }))
  );
  return { problemas, entidades };
}

/** Una línea legible por problema: página › formato › entidad › propiedad. */
export function formatearProblema(p) {
  return `  [${p.severidad}] ${p.formato} › ${p.entidad} › ${p.propiedad}: ${p.mensaje} (${p.origen})`;
}
