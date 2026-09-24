import { test, expect } from './fixtures';

// Misma forma que la URL publicada: con barra final.
const servicePath = (slug: string) => `/servicios/${slug}/`;

const services = [
  {
    slug: 'aire-acondicionado',
    title: 'Aire Acondicionado',
    metaTitle: 'Aire acondicionado en Cali',
    h1: 'Instalación y reparación de aire acondicionado en Cali',
    schemaName: 'Reparación de aire acondicionado',
    keyword: 'aire acondicionado',
    topic: 'Reparación de aire acondicionado',
    hasBrands: true,
  },
  {
    slug: 'neveras',
    title: 'Neveras y Refrigeradores',
    metaTitle: 'Reparación de neveras en Cali',
    h1: 'Reparación de neveras en Cali a domicilio',
    schemaName: 'Reparación de neveras y refrigeradores',
    keyword: 'neveras',
    topic: 'Reparación de neveras y refrigeradores',
    hasBrands: true,
  },
  {
    slug: 'lavadoras',
    title: 'Lavadoras',
    metaTitle: 'Reparación de lavadoras en Cali',
    h1: 'Reparación de lavadoras en Cali a domicilio',
    schemaName: 'Reparación de lavadoras',
    keyword: 'lavadoras',
    topic: 'Reparación de lavadoras',
    hasBrands: true,
  },
  {
    slug: 'calentadores',
    title: 'Calentadores de Agua',
    metaTitle: 'Calentadores de agua en Cali',
    h1: 'Instalación y reparación de calentadores de agua en Cali',
    schemaName: 'Instalación de calentadores',
    keyword: 'calentadores',
    topic: 'Situaciones que puede consultar',
    hasBrands: true,
  },
  {
    slug: 'instalacion-aire-acondicionado',
    title: 'Instalación de aire acondicionado en Cali',
    metaTitle: 'Instalación de aire acondicionado en Cali',
    h1: 'Instalación de aire acondicionado en Cali',
    schemaName: 'Instalación de aire acondicionado',
    keyword: 'instalación de aire acondicionado',
    topic: 'Qué se revisa durante la instalación',
    hasBrands: false,
  },
];

test.describe('Service Pages - General', () => {
  for (const service of services) {
    test.describe(`${service.title} Service Page`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(servicePath(service.slug));
      });

      test('should have correct page title', async ({ page }) => {
        await expect(page).toHaveTitle(new RegExp(service.metaTitle));
        await expect(page).toHaveTitle(/Rivera Refrigeración/);
        await expect(page).toHaveTitle(/Cali/);

        // La marca se añade una sola vez y el título entra en la SERP
        const title = await page.title();
        expect(title.match(/Rivera Refrigeración/g)).toHaveLength(1);
        expect(title.length).toBeLessThanOrEqual(72);
      });

      test('should have meta description', async ({ page }) => {
        const metaDescription = page.locator('meta[name="description"]');
        const content = await metaDescription.getAttribute('content');

        expect(content).toBeTruthy();
        expect(content!.length).toBeGreaterThan(50);
        expect(content!.length).toBeLessThan(160);
        expect(content).toContain('Cali');
      });

      test('should display hero section with title', async ({ page }) => {
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(service.h1);
      });

      test('should display hero image', async ({ page }) => {
        const heroImage = page.locator('figure').first().locator('img').first();
        await expect(heroImage).toBeVisible();

        const src = await heroImage.getAttribute('src');
        expect(src).toMatch(/\.(jpg|webp|png)$/);
      });

      test('should display short description', async ({ page }) => {
        const description = page.locator('p').first();
        await expect(description).toBeVisible();
      });

      test('should display only validated brands', async ({ page }) => {
        const brandsHeading = page.getByRole('heading', {
          name: /Marcas atendidas/i,
        });
        if (service.hasBrands) {
          await expect(brandsHeading).toBeVisible();
          await expect(page.locator('.marca-ficha').first()).toBeVisible();
        } else {
          await expect(brandsHeading).toHaveCount(0);
        }
      });

      test('should display 4-step process', async ({ page }) => {
        const processHeading = page.getByRole('heading', {
          name: /Nuestro Proceso de Trabajo/i,
        });
        await expect(processHeading).toBeVisible();

        // Should show 4 steps
        for (let i = 1; i <= 4; i++) {
          const stepNumber = page.getByText(`Paso ${i}`);
          await expect(stepNumber).toBeVisible();
        }
      });

      test('should display FAQs section', async ({ page }) => {
        const faqHeading = page.getByRole('heading', {
          name: /Preguntas Frecuentes/i,
        });
        await expect(faqHeading).toBeVisible();

        const faqItems = page.locator('details');
        const count = await faqItems.count();
        expect(count).toBeGreaterThanOrEqual(4);
        expect(count).toBeLessThanOrEqual(6);
      });

      test('should have FAQ accordion functionality', async ({ page }) => {
        const firstFaq = page.locator('details').first();
        await expect(firstFaq).toBeVisible();

        // FAQ should be closed initially
        const isOpen = await firstFaq.evaluate((el) => el.hasAttribute('open'));
        expect(isOpen).toBe(false);

        // Click to open
        const summary = firstFaq.locator('summary');
        await summary.click();

        // Should be open now
        const isOpenAfterClick = await firstFaq.evaluate((el) =>
          el.hasAttribute('open')
        );
        expect(isOpenAfterClick).toBe(true);

        // Answer should be visible
        const answer = firstFaq.locator('div').last();
        await expect(answer).toBeVisible();
      });

      test('should display CTA section with WhatsApp button', async ({
        page,
      }) => {
        const ctaHeading = page.getByRole('heading', {
          name: /¿Necesita este servicio\?/i,
        });
        await expect(ctaHeading).toBeVisible();

        // Get the CTA section specifically
        const ctaSection = page
          .locator('section')
          .filter({ hasText: '¿Necesita este servicio?' });
        const whatsappButton = ctaSection.getByRole('link', {
          name: 'Agendar visita por WhatsApp',
        });
        await expect(whatsappButton).toBeVisible();

        const href = await whatsappButton.getAttribute('href');
        expect(href).toMatch(/wa\.me|whatsapp|api\.whatsapp\.com/);
      });

      test('should have FAQ schema markup', async ({ page }) => {
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        expect(count).toBeGreaterThanOrEqual(1);

        // Check if any script contains FAQPage schema
        let hasFAQSchema = false;
        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          if (content && content.includes('FAQPage')) {
            hasFAQSchema = true;
            expect(content).toContain('Question');
            expect(content).toContain('Answer');
            break;
          }
        }
        expect(hasFAQSchema).toBe(true);
      });

      test('should have Service schema markup', async ({ page }) => {
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        expect(count).toBeGreaterThanOrEqual(1);

        // Check if any script contains Service schema
        let hasServiceSchema = false;
        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          if (content && content.includes('"@type":"Service"')) {
            hasServiceSchema = true;
            expect(content).toContain('Rivera Refrigeración');
            break;
          }
        }
        expect(hasServiceSchema).toBe(true);
      });

      test('should link service offers and breadcrumbs by @id', async ({
        page,
      }) => {
        const raw = await page
          .locator('script[type="application/ld+json"]')
          .textContent();
        const graph = JSON.parse(raw ?? '{}')['@graph'] as Array<
          Record<string, unknown>
        >;
        const serviceNode = graph.find((node) => node['@type'] === 'Service');
        const currentService = graph.find(
          (node) =>
            node['@id'] ===
            `https://rivera-refrigeracion.com${servicePath(service.slug)}#servicio`
        );
        const business = graph.find(
          (node) => node['@type'] === 'LocalBusiness'
        );
        const catalog = business?.hasOfferCatalog as {
          itemListElement: Array<{ itemOffered: { '@id': string } }>;
        };
        const serviceIds = new Set(
          graph
            .filter((node) => node['@type'] === 'Service')
            .map((node) => node['@id'])
        );
        const serviceNodes = graph.filter(
          (node) => node['@type'] === 'Service'
        );
        const businessAreas = business?.areaServed as Array<{
          name: string;
        }>;
        const breadcrumb = graph.find(
          (node) => node['@type'] === 'BreadcrumbList'
        );
        const breadcrumbItems = breadcrumb?.itemListElement as Array<{
          name: string;
        }>;

        expect(serviceNode?.provider).toEqual({
          '@id': 'https://rivera-refrigeracion.com/#negocio',
        });
        expect(currentService?.name).toBe(service.schemaName);
        expect(currentService?.serviceType).toBe(service.schemaName);
        expect(catalog.itemListElement).toHaveLength(7);
        catalog.itemListElement.forEach((offer) => {
          expect(serviceIds.has(offer.itemOffered['@id'])).toBe(true);
          expect('price' in offer).toBe(false);
        });
        expect(businessAreas).toEqual(
          expect.arrayContaining([expect.objectContaining({ name: 'Cali' })])
        );
        for (const node of serviceNodes) {
          const areas = node.areaServed as Array<{ name: string }>;
          expect(areas).toEqual(
            expect.arrayContaining([expect.objectContaining({ name: 'Cali' })])
          );
        }
        expect(breadcrumbItems.at(-1)?.name).toBe(service.h1);
      });

      test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();

        const whatsappButton = page.getByRole('link', {
          name: 'Agendar visita por WhatsApp',
        });
        await expect(whatsappButton).toBeVisible();
      });

      test('should have accessible heading hierarchy', async ({ page }) => {
        // Should have one H1
        const h1Count = await page.getByRole('heading', { level: 1 }).count();
        expect(h1Count).toBe(1);

        // Should have multiple H2s
        const h2Count = await page.getByRole('heading', { level: 2 }).count();
        expect(h2Count).toBeGreaterThanOrEqual(5);
      });
    });
  }
});

test.describe('Service Pages - Navigation from Homepage', () => {
  test('should navigate from homepage to air conditioner repair', async ({
    page,
  }) => {
    await page.goto('/');

    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeVisible();

    const serviceLink = servicesSection.getByRole('link', {
      name: 'Reparación de aire acondicionado en Cali',
    });
    await expect(serviceLink).toBeVisible();

    await serviceLink.click();
    await page.waitForURL('/servicios/aire-acondicionado/');

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('all service cards should have descriptive link text', async ({
    page,
  }) => {
    await page.goto('/');

    const servicesSection = page.locator('#services');
    const serviceLinks = servicesSection.getByRole('link', {
      name: / en Cali$/,
    });

    await expect(serviceLinks).toHaveCount(5);
    await expect(
      servicesSection.getByRole('link', {
        name: 'Instalación de aire acondicionado en Cali',
      })
    ).toHaveAttribute('href', '/servicios/instalacion-aire-acondicionado/');
  });
});

test.describe('Service Pages - SEO', () => {
  test('all service pages should have unique meta titles', async ({ page }) => {
    const titles: string[] = [];

    for (const service of services) {
      await page.goto(servicePath(service.slug));
      const title = await page.title();
      titles.push(title);
    }

    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(5);
  });

  test('all service pages should have unique meta descriptions', async ({
    page,
  }) => {
    const descriptions: string[] = [];

    for (const service of services) {
      await page.goto(servicePath(service.slug));
      const metaDescription = page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute('content');
      descriptions.push(content || '');
    }

    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(5);
  });

  test('installation and neveras pages are indexable with a self canonical', async ({
    page,
  }) => {
    for (const slug of ['instalacion-aire-acondicionado', 'neveras']) {
      const path = servicePath(slug);
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://rivera-refrigeracion.com${path}`
      );
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    }
  });

  test('all service pages should have Open Graph tags', async ({ page }) => {
    for (const service of services) {
      await page.goto(servicePath(service.slug));

      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute('content', /.+/);

      const ogDescription = page.locator('meta[property="og:description"]');
      await expect(ogDescription).toHaveAttribute('content', /.+/);

      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveAttribute('content', /.+/);
    }
  });

  test('all service pages should have Twitter Card tags', async ({ page }) => {
    for (const service of services) {
      await page.goto(servicePath(service.slug));

      const twitterCard = page.locator('meta[name="twitter:card"]');
      await expect(twitterCard).toHaveAttribute(
        'content',
        'summary_large_image'
      );

      const twitterTitle = page.locator('meta[name="twitter:title"]');
      await expect(twitterTitle).toHaveAttribute('content', /.+/);
    }
  });
});

test.describe('Service Pages - Accessibility', () => {
  test('all FAQ accordions should be keyboard accessible', async ({ page }) => {
    await page.goto(servicePath('aire-acondicionado'));

    const firstFaqSummary = page.locator('details summary').first();
    await firstFaqSummary.focus();

    // Should be able to activate with Enter key
    await page.keyboard.press('Enter');

    const firstFaq = page.locator('details').first();
    const isOpen = await firstFaq.evaluate((el) => el.hasAttribute('open'));
    expect(isOpen).toBe(true);
  });

  test('all images should have alt text', async ({ page }) => {
    for (const service of services) {
      await page.goto(servicePath(service.slug));

      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();

        // Un alt vacío sólo vale para una imagen decorativa dentro de un
        // enlace que ya tiene nombre propio (el logo del encabezado).
        if (alt === '') {
          const nombreEnlace = await img.evaluate(
            (el) => el.closest('a')?.getAttribute('aria-label') ?? ''
          );
          expect(nombreEnlace.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('WhatsApp links should have proper aria-label', async ({ page }) => {
    await page.goto(servicePath('aire-acondicionado'));

    // Check that at least one WhatsApp link exists
    const whatsappLinks = page.getByRole('link', { name: /WhatsApp/i });
    const count = await whatsappLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Service Pages - Content Quality', () => {
  test('all service pages should cover a concrete problem or installation topic', async ({
    page,
  }) => {
    for (const service of services) {
      await page.goto(servicePath(service.slug));

      const mainContent = page.locator('article');
      const textContent = await mainContent.textContent();

      expect(textContent!.length).toBeGreaterThan(500);
      await expect(mainContent).toContainText(service.topic);
      await expect(mainContent).toContainText(
        /presupuesto.{0,60}antes de empezar/i
      );
    }
  });

  test('uses service terms in the concrete sections', async ({ page }) => {
    const sections = [
      {
        slug: 'aire-acondicionado',
        headings: [
          'Reparación de aire acondicionado',
          'Instalación',
          'Mantenimiento',
        ],
      },
      {
        slug: 'neveras',
        headings: ['Reparación de neveras y refrigeradores'],
      },
      { slug: 'lavadoras', headings: ['Reparación de lavadoras'] },
      {
        slug: 'calentadores',
        headings: [
          'Instalación de calentadores en Cali',
          'Reparación de calentadores',
        ],
      },
    ];

    for (const section of sections) {
      await page.goto(servicePath(section.slug));
      for (const heading of section.headings) {
        await expect(
          page.getByRole('heading', { level: 2, name: heading, exact: true })
        ).toBeVisible();
      }
    }
  });

  test('repair and installation pages link to each other', async ({ page }) => {
    await page.goto(servicePath('aire-acondicionado'));
    await expect(
      page.locator('article').getByRole('link', {
        name: 'instalación de aire acondicionado en Cali',
        exact: true,
      })
    ).toHaveAttribute('href', servicePath('instalacion-aire-acondicionado'));

    await page.goto(servicePath('instalacion-aire-acondicionado'));
    await expect(
      page.locator('article').getByRole('link', {
        name: 'reparación de aires acondicionados en Cali',
        exact: true,
      })
    ).toHaveAttribute('href', servicePath('aire-acondicionado'));
  });

  test('sitemap lists the new installation page and the neveras page', async ({
    request,
  }) => {
    const indexResponse = await request.get('/sitemap-index.xml');
    expect(indexResponse.ok()).toBe(true);
    expect(await indexResponse.text()).toContain('/sitemap-0.xml');

    const sitemapResponse = await request.get('/sitemap-0.xml');
    expect(sitemapResponse.ok()).toBe(true);
    const sitemap = await sitemapResponse.text();
    expect(sitemap).toContain(
      'https://rivera-refrigeracion.com/servicios/instalacion-aire-acondicionado/'
    );
    expect(sitemap).toContain(
      'https://rivera-refrigeracion.com/servicios/neveras/'
    );
  });

  test('all service pages should mention the service keyword', async ({
    page,
  }) => {
    for (const service of services) {
      await page.goto(servicePath(service.slug));

      const mainContent = page.locator('article');
      await expect(mainContent).toContainText(service.keyword, {
        ignoreCase: true,
      });
    }
  });

  test('all service pages should mention Cali', async ({ page }) => {
    for (const service of services) {
      await page.goto(servicePath(service.slug));

      const mainContent = page.locator('article');
      await expect(mainContent).toContainText('Cali');
    }
  });

  test('all service pages should mention Rivera Refrigeración', async ({
    page,
  }) => {
    for (const service of services) {
      await page.goto(servicePath(service.slug));

      const mainContent = page.locator('article');
      await expect(mainContent).toContainText('Rivera Refrigeración');
    }
  });
});

test.describe('Service Pages - Performance', () => {
  test('calentadores page should use optimized WebP image', async ({
    page,
  }) => {
    await page.goto(servicePath('calentadores'));

    const heroImage = page.locator('figure').first().locator('img').first();
    const src = await heroImage.getAttribute('src');

    expect(src).toContain('.webp');
  });

  test('images should have loading="lazy" or loading="eager" attribute', async ({
    page,
  }) => {
    await page.goto(servicePath('aire-acondicionado'));

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const loading = await img.getAttribute('loading');
      // Some images may not have loading attribute (e.g., SVGs or icons)
      // but if they do, it should be lazy or eager
      if (loading) {
        expect(loading).toMatch(/lazy|eager/);
      }
    }
  });
});
