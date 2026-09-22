import { test, expect } from './fixtures';

// Las URLs publicadas llevan barra final (formato de directorio de Astro).
// Un enlace interno sin ella le cuesta al visitante un 301 en Netlify por clic.
// No se usa trailingSlash: 'always' porque convertiría esas URLs en 404.
test.describe('Enlaces internos', () => {
  test('todos los enlaces internos del home terminan en barra', async ({
    page,
    baseURL,
  }) => {
    await page.goto('/');

    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
    const origin = new URL(baseURL!).origin;

    const internalPaths = hrefs
      .filter((href) => !href.startsWith('#'))
      .map((href) => new URL(href, origin))
      .filter((url) => url.origin === origin)
      .map((url) => url.pathname)
      .filter((path) => !/\.[a-z0-9]+$/i.test(path));

    expect(internalPaths.length).toBeGreaterThan(0);
    const withoutSlash = internalPaths.filter((path) => !path.endsWith('/'));
    expect(withoutSlash).toEqual([]);
  });
});
