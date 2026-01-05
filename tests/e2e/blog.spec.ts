import { test, expect } from './fixtures';

test.describe('Blog', () => {
  test.describe('Blog listing page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/blog');
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
        '¿Por Qué tu Aire Acondicionado No Enfría Bien?',
        'Cómo Saber si Tu Nevera Necesita Mantenimiento',
        '5 Errores Que Debes Evitar Al Usar Tu Lavadora',
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
      await expect(firstPostLink).toHaveAttribute('href', /^\//);
    });
  });

  test.describe('Individual blog post', () => {
    test('should display blog post content', async ({ page }) => {
      await page.goto('/por-que-tu-aire-acondicionado-no-enfria-bien');

      await expect(page).toHaveTitle(
        /¿Por Qué tu Aire Acondicionado No Enfría Bien\?/
      );

      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Aire Acondicionado');
    });

    test('should display author and date', async ({ page }) => {
      await page.goto('/por-que-tu-aire-acondicionado-no-enfria-bien');

      await expect(page.getByText('Rivera Refrigeracion')).toBeVisible();
    });

    test('should have WhatsApp CTA', async ({ page }) => {
      await page.goto('/por-que-tu-aire-acondicionado-no-enfria-bien');

      const whatsappLink = page
        .getByRole('link', { name: /WhatsApp/i })
        .first();
      await expect(whatsappLink).toBeVisible();
    });
  });
});
