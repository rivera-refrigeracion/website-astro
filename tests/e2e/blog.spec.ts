import { test, expect } from './fixtures';

const borradores = [
  {
    slug: 'fallas-de-lavadora-cuando-solicitar-revision',
    service: 'lavadoras',
  },
  {
    slug: 'mantenimiento-de-lavadoras-habitos-y-senales',
    service: 'lavadoras',
  },
  {
    slug: 'cuando-programar-mantenimiento-de-aire-acondicionado',
    service: 'aire-acondicionado',
  },
  {
    slug: 'reparacion-aire-acondicionado-diagnostico-en-cali',
    service: 'aire-acondicionado',
  },
  {
    slug: 'fallas-de-calentador-cuando-solicitar-revision',
    service: 'calentadores',
  },
  {
    slug: 'antes-de-instalar-aire-acondicionado-en-cali',
    service: 'instalacion-aire-acondicionado',
  },
  {
    slug: 'instalacion-de-calentadores-que-se-revisa-antes-de-cotizar',
    service: 'calentadores',
  },
];

test.describe('Blog', () => {
  test.describe('Blog listing page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/blog/');
    });

    test('should have correct title', async ({ page }) => {
      await expect(page).toHaveTitle(/Blog.*Rivera Refrigeración/);
    });

    test('should display blog posts', async ({ page }) => {
      const articles = page.locator('article');
      await expect(articles).toHaveCount(3);
    });

    test('should display post titles', async ({ page }) => {
      const expectedTitles = [
        'Por qué el aire acondicionado deja de enfriar',
        'Nevera que no enfría: señales antes de solicitar reparación',
        '5 Errores Que Debes Evitar Al Usar Tu Lavadora',
      ];

      for (const title of expectedTitles) {
        await expect(page.getByText(title).first()).toBeVisible();
      }
    });

    test('should hide draft posts and omit their routes', async ({ page }) => {
      for (const { slug } of borradores) {
        await expect(page.locator(`a[href="/blog/${slug}/"]`)).toHaveCount(0);

        const response = await page.request.get(`/blog/${slug}/`);
        expect(response.status()).toBe(404);
      }

      const feed = await page.request.get('/rss.xml');
      const feedXml = await feed.text();

      for (const { slug, service } of borradores) {
        expect(feedXml).not.toContain(`/blog/${slug}/`);

        await page.goto(`/servicios/${service}/`);
        await expect(page.locator(`a[href="/blog/${slug}/"]`)).toHaveCount(0);
      }
    });

    test('should display categories', async ({ page }) => {
      await expect(page.getByText('Aire Acondicionado').first()).toBeVisible();
      await expect(page.getByText('Mantenimiento').first()).toBeVisible();
      await expect(page.getByText('Consejos').first()).toBeVisible();
    });

    test('should link to individual blog posts', async ({ page }) => {
      const firstPostLink = page
        .locator('article')
        .first()
        .getByRole('link')
        .first();
      await expect(firstPostLink).toHaveAttribute('href', /^\/blog\/[^/]+\/$/);
    });
  });

  test.describe('Individual blog post', () => {
    test('should display blog post content', async ({ page }) => {
      await page.goto('/blog/por-que-tu-aire-acondicionado-no-enfria-bien/');

      await expect(page).toHaveTitle(
        /Por qué el aire acondicionado deja de enfriar/
      );

      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('aire acondicionado');
    });

    test('should display author and date', async ({ page }) => {
      await page.goto('/blog/por-que-tu-aire-acondicionado-no-enfria-bien/');

      await expect(page.getByText('Por Rivera Refrigeración')).toBeVisible();
    });

    test('should have WhatsApp CTA', async ({ page }) => {
      await page.goto('/blog/por-que-tu-aire-acondicionado-no-enfria-bien/');

      const whatsappLink = page
        .getByRole('link', { name: /WhatsApp/i })
        .first();
      await expect(whatsappLink).toBeVisible();
    });
  });

  test('published proposed posts have metadata and an early service link', async ({
    page,
  }) => {
    const posts = [
      ['por-que-tu-aire-acondicionado-no-enfria-bien', 'aire-acondicionado'],
      ['como-saber-si-tu-nevera-necesita-mantenimiento', 'neveras'],
    ];

    for (const [slug, service] of posts) {
      await page.goto(`/blog/${slug}/`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(description?.length).toBeLessThan(160);
      await expect(
        page.locator(`a[href="/servicios/${service}/"]`).first()
      ).toBeVisible();
    }
  });

  test('service pages link to their proposed posts', async ({ page }) => {
    const services = [
      ['aire-acondicionado', ['por-que-tu-aire-acondicionado-no-enfria-bien']],
      ['neveras', ['como-saber-si-tu-nevera-necesita-mantenimiento']],
    ] as const;

    for (const [service, slugs] of services) {
      await page.goto(`/servicios/${service}/`);
      for (const slug of slugs) {
        await expect(
          page.locator(`a[href="/blog/${slug}/"]`).first()
        ).toBeVisible();
      }
    }
  });
});
