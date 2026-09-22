import { test, expect } from './fixtures';

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
      await expect(articles).toHaveCount(10);
    });

    test('should display post titles', async ({ page }) => {
      const expectedTitles = [
        'Por qué el aire acondicionado deja de enfriar',
        'Nevera que no enfría: señales antes de solicitar reparación',
        '5 Errores Que Debes Evitar Al Usar Tu Lavadora',
        'Fallas de lavadora que conviene describir antes de pedir una revisión',
        'Mantenimiento de lavadoras: hábitos de uso y señales para pedir revisión',
        'Cuándo programar una revisión de aire acondicionado',
        'Reparación de aire acondicionado en Cali: qué incluye el diagnóstico',
        'Fallas de calentador: cuándo solicitar una revisión en Cali',
        'Antes de instalar aire acondicionado en Cali: qué revisar',
        'Instalación de calentadores en Cali: qué se revisa antes de cotizar',
      ];

      for (const title of expectedTitles) {
        await expect(page.getByText(title).first()).toBeVisible();
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

  test('the nine proposed posts have metadata and an early service link', async ({
    page,
  }) => {
    const posts = [
      ['por-que-tu-aire-acondicionado-no-enfria-bien', 'aire-acondicionado'],
      ['fallas-de-lavadora-cuando-solicitar-revision', 'lavadoras'],
      ['mantenimiento-de-lavadoras-habitos-y-senales', 'lavadoras'],
      [
        'cuando-programar-mantenimiento-de-aire-acondicionado',
        'aire-acondicionado',
      ],
      ['como-saber-si-tu-nevera-necesita-mantenimiento', 'neveras'],
      [
        'reparacion-aire-acondicionado-diagnostico-en-cali',
        'aire-acondicionado',
      ],
      ['fallas-de-calentador-cuando-solicitar-revision', 'calentadores'],
      [
        'antes-de-instalar-aire-acondicionado-en-cali',
        'instalacion-aire-acondicionado',
      ],
      [
        'instalacion-de-calentadores-que-se-revisa-antes-de-cotizar',
        'calentadores',
      ],
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
      [
        'aire-acondicionado',
        [
          'por-que-tu-aire-acondicionado-no-enfria-bien',
          'cuando-programar-mantenimiento-de-aire-acondicionado',
          'reparacion-aire-acondicionado-diagnostico-en-cali',
        ],
      ],
      [
        'instalacion-aire-acondicionado',
        ['antes-de-instalar-aire-acondicionado-en-cali'],
      ],
      [
        'lavadoras',
        [
          'fallas-de-lavadora-cuando-solicitar-revision',
          'mantenimiento-de-lavadoras-habitos-y-senales',
        ],
      ],
      ['neveras', ['como-saber-si-tu-nevera-necesita-mantenimiento']],
      [
        'calentadores',
        [
          'fallas-de-calentador-cuando-solicitar-revision',
          'instalacion-de-calentadores-que-se-revisa-antes-de-cotizar',
        ],
      ],
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
