import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';

const pages = [
  { name: 'portada', path: '/' },
  {
    name: 'servicio de aire acondicionado',
    path: '/servicios/aire-acondicionado/',
  },
  {
    name: 'instalación de aire acondicionado',
    path: '/servicios/instalacion-aire-acondicionado/',
  },
  { name: 'blog', path: '/blog/' },
  { name: '404', path: '/pagina-inexistente-para-auditoria/' },
];

for (const { name, path } of pages) {
  test(`${name} no tiene violaciones de accesibilidad serias o críticas`, async ({
    page,
  }) => {
    await page.goto(path);

    const { violations } = await new AxeBuilder({ page }).analyze();
    const seriousViolations = violations
      .filter(({ impact }) => impact === 'critical' || impact === 'serious')
      .map(({ id, impact, nodes }) => ({
        id,
        impact,
        nodes: nodes.map(({ target, failureSummary }) => ({
          target,
          failureSummary,
        })),
      }));

    expect(seriousViolations).toEqual([]);
  });
}
