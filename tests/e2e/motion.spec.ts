import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

const RUTAS = ['/', '/servicios/aire-acondicionado/'];

const animacionDe = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el: Element) => getComputedStyle(el).animationName);

test.describe('Movimiento reducido', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  for (const ruta of RUTAS) {
    test(`${ruta}: nada decorativo se anima`, async ({ page }) => {
      await page.goto(ruta);

      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.getAnimations().filter((a) => a.playState === 'running')
                .length
          )
        )
        .toBe(0);

      expect(await animacionDe(page, '.entrada')).toBe('none');
      expect(await animacionDe(page, '.girar, .girar-inverso')).toBe('none');
      expect(
        await page.evaluate(
          () => getComputedStyle(document.documentElement).scrollBehavior
        )
      ).toBe('auto');
    });

    test(`${ruta}: el contenido se ve sin hacer scroll`, async ({ page }) => {
      await page.goto(ruta);

      const opacidades = await page
        .locator('[data-reveal]')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));

      expect(opacidades.length).toBeGreaterThan(0);
      expect(opacidades.every((o) => o === '1')).toBe(true);
    });
  }
});

test.describe('Movimiento completo', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });

  test('las secciones aparecen al llegar a ellas', async ({ page }) => {
    await page.goto('/');

    const razon = page.locator('.razon').first();
    await expect(razon).toHaveCSS('opacity', '0');

    await razon.scrollIntoViewIfNeeded();
    await expect(razon).toHaveClass(/is-visible/);
    await expect(razon).toHaveCSS('opacity', '1');
  });

  test('la decoración gira en la portada', async ({ page }) => {
    await page.goto('/');
    expect(await animacionDe(page, '.girar')).toBe('girar');
  });
});
