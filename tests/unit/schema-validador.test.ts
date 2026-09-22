// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { CONTACT, SITE } from '@/lib/config';
import {
  NEGOCIO_ID,
  OFERTAS_CATALOGO,
  articulo,
  grafo,
  idOferta,
  migas,
  negocio,
  pagina,
  preguntas,
  ref,
  servicio,
  sitio,
  zonaAtendida,
} from '@/lib/schema';
import { validarHtml } from '../../scripts/schema/validador.mjs';

const URL_PAGINA = `${SITE.url}/servicios/neveras/`;

/** HTML mínimo con el pie visible: teléfono, correo y un <h1>. */
function html({
  head = '',
  body = '',
  h1 = 'Neveras',
}: { head?: string; body?: string; h1?: string } = {}) {
  return `<!doctype html><html lang="es"><head>
<link rel="canonical" href="${URL_PAGINA}">
${head}</head><body><h1>${h1}</h1>${body}
<footer><a href="tel:${CONTACT.phone}">+57 317 309 5159</a>
<a href="mailto:${CONTACT.email}">${CONTACT.email}</a></footer></body></html>`;
}

const jsonLd = (datos: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(datos)}</script>`;

async function problemas(contenido: string) {
  const { problemas } = await validarHtml(contenido, {
    pagina: 'dist/prueba.html',
  });
  return problemas;
}

describe('validador de datos estructurados', () => {
  it('rechaza el email con mailto: del microdata original del pie', async () => {
    // Es el marcado que tenía Footer.astro: itemprop en el <a href="mailto:">.
    const pie = `<div itemscope itemtype="https://schema.org/LocalBusiness">
      <h3 itemprop="name">${SITE.name}</h3>
      <a href="mailto:${CONTACT.email}" itemprop="email">${CONTACT.email}</a>
    </div>`;
    const resultado = await problemas(html({ body: pie }));
    const email = resultado.find((p) => p.propiedad === 'email');

    expect(email).toMatchObject({
      pagina: 'dist/prueba.html',
      formato: 'microdata',
      entidad: 'LocalBusiness',
      severidad: 'error',
    });
    expect(email?.mensaje).toContain(`mailto:${CONTACT.email}`);
    expect(email?.mensaje).toContain('espera Text');
  });

  it('acepta el email como texto plano en <meta itemprop>', async () => {
    const pie = `<div itemscope itemtype="https://schema.org/LocalBusiness">
      <meta itemprop="email" content="${CONTACT.email}">
    </div>`;
    const resultado = await problemas(html({ body: pie }));
    expect(resultado.filter((p) => p.propiedad === 'email')).toEqual([]);
  });

  it('rechaza tel: en telephone', async () => {
    const resultado = await problemas(
      html({
        head: jsonLd({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE.name,
          telephone: `tel:${CONTACT.phone}`,
        }),
      })
    );
    expect(resultado.map((p) => p.propiedad)).toContain('telephone');
  });

  it('rechaza tipos y propiedades que no existen en schema.org', async () => {
    const resultado = await problemas(
      html({
        head: jsonLd({
          '@context': 'https://schema.org',
          '@type': 'Organisation',
          name: 'x',
        }),
      }) +
        jsonLd({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'x',
          telefono: '+57',
        })
    );
    expect(resultado.map((p) => p.mensaje).join('\n')).toMatch(
      /"Organisation" no existe[\s\S]*"telefono" no existe/
    );
  });

  it('rechaza fechas que no son ISO 8601', async () => {
    const resultado = await problemas(
      html({
        head: jsonLd({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: 'Neveras',
          datePublished: '5 de septiembre de 2024',
        }),
      })
    );
    expect(
      resultado.find((p) => p.propiedad === 'datePublished')?.mensaje
    ).toContain('no es un valor válido');
  });

  it('rechaza URLs relativas donde se espera URL', async () => {
    const resultado = await problemas(
      html({
        head: jsonLd({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'x',
          url: '/servicios/',
        }),
      })
    );
    expect(resultado.map((p) => p.propiedad)).toContain('url');
  });

  it('rechaza una referencia @id sin nodo en la página', async () => {
    const resultado = await problemas(
      html({
        head: jsonLd({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Neveras',
          provider: ref(NEGOCIO_ID),
        }),
      })
    );
    expect(resultado.find((p) => p.propiedad === 'provider')?.mensaje).toMatch(
      /ningún nodo de esta página/
    );
  });

  it('rechaza dos LocalBusiness distintos en la misma página', async () => {
    const negocioSuelto = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: SITE.name,
    };
    const resultado = await problemas(
      html({ head: jsonLd(negocioSuelto) + jsonLd(negocioSuelto) })
    );
    expect(
      resultado.find(
        (p) => p.entidad === 'LocalBusiness' && p.propiedad === '-'
      )?.mensaje
    ).toContain('2 entidades LocalBusiness');
  });

  it('exige lo que Google pide a FAQPage y BreadcrumbList', async () => {
    const resultado = await problemas(
      html({
        head: jsonLd({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'FAQPage',
              mainEntity: [{ '@type': 'Question', name: 'Neveras' }],
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Inicio',
                  item: `${SITE.url}/`,
                },
                { '@type': 'ListItem', position: 3, item: URL_PAGINA },
              ],
            },
          ],
        }),
      })
    );
    const propiedades = resultado.map((p) => p.propiedad);
    expect(propiedades).toContain('mainEntity[0].acceptedAnswer.text');
    expect(propiedades).toContain('itemListElement[0].position');
    expect(propiedades).toContain('itemListElement[1].name');
  });

  it('exige que el titular del artículo coincida con el <h1>', async () => {
    const resultado = await problemas(
      html({
        h1: 'Otro título',
        head: jsonLd({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: 'Neveras',
        }),
      })
    );
    expect(resultado.map((p) => p.propiedad)).toContain('headline');
  });

  it('da por bueno el @graph que genera src/lib/schema.ts', async () => {
    const zonas = ['Toda la ciudad de Cali', 'Valle del Lili', 'Jamundí'];
    const nodos = grafo([
      negocio(
        [{ slug: 'neveras', title: 'Neveras', serviceAreas: zonas }],
        `${SITE.url}/_astro/logo.png`
      ),
      sitio(),
      pagina({
        url: URL_PAGINA,
        tipo: 'FAQPage',
        nombre: 'Neveras',
        descripcion: 'Reparación de neveras',
        imagen: `${SITE.url}/images/og-neveras.jpg`,
        conMigas: true,
        extra: {
          mainEntity: preguntas([
            { question: '¿Reparan neveras?', answer: 'Sí.' },
          ]),
        },
      }),
      migas(URL_PAGINA, [
        { name: 'Inicio', path: '/' },
        { name: 'Neveras', path: '/servicios/neveras/' },
      ]),
      servicio({
        id: idOferta(
          OFERTAS_CATALOGO.find((oferta) => oferta.slug === 'neveras')!
        ),
        url: URL_PAGINA,
        nombre: 'Reparación de neveras y refrigeradores',
        tipo: 'Reparación de neveras y refrigeradores',
        descripcion: 'Reparación de neveras',
        imagen: `${SITE.url}/images/services/neveras.webp`,
        zonas,
      }),
      ...OFERTAS_CATALOGO.filter(
        (oferta) => oferta.slug !== 'neveras' || oferta.fragmento !== 'servicio'
      ).map((oferta) =>
        servicio({
          id: idOferta(oferta),
          url: `${SITE.url}/servicios/${oferta.slug}/`,
          nombre: oferta.nombre,
          tipo: oferta.tipo,
          descripcion: oferta.descripcion,
          zonas: ['Todo Cali'],
        })
      ),
      articulo({
        url: URL_PAGINA,
        titulo: 'Neveras',
        descripcion: 'x',
        imagen: `${SITE.url}/images/og-neveras.jpg`,
        publicado: '2024-09-05',
        autor: SITE.name,
      }),
    ]);
    const resultado = await problemas(
      html({ head: jsonLd(nodos), body: '<p>¿Reparan neveras?</p>' })
    );
    expect(resultado).toEqual([]);
  });
});

describe('zonas de cobertura', () => {
  it('declara los municipios vecinos como ciudades, no como barrios de Cali', () => {
    expect(zonaAtendida('Yumbo')).toMatchObject({
      '@type': 'City',
      name: 'Yumbo',
    });
    expect(zonaAtendida('Valle del Lili')).toMatchObject({
      '@type': 'Place',
      containedInPlace: { '@type': 'City', name: 'Cali' },
    });
    expect(zonaAtendida('Todo Cali')).toMatchObject({
      '@type': 'City',
      name: 'Cali',
    });
  });
});
