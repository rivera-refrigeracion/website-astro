import { test, expect } from './fixtures';

for (const width of [390, 1440]) {
  test(`reduced motion keeps all content visible at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const url of ['/', '/servicios/neveras/']) {
      await page.goto(url);
      await page.locator('footer').scrollIntoViewIfNeeded();
      const motion = await page.evaluate(() => ({
        animations: document.getAnimations().length,
        scroll: getComputedStyle(document.documentElement).scrollBehavior,
        hidden: [...document.querySelectorAll('[data-reveal]')].some(
          (element) => getComputedStyle(element).opacity !== '1'
        ),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      expect(motion).toEqual({
        animations: 0,
        scroll: 'auto',
        hidden: false,
        overflow: false,
      });
    }
  });
}

test('motion preference changes stop an active reveal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('.service-card').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveClass(/reveal-enter/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).not.toHaveClass(/reveal-enter/);
  await expect(card).toHaveCSS('animation-name', 'none');
});

test('mobile menu supports keyboard opening, escape and visible focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Ir al contenido' })
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const button = page.getByRole('button', { name: 'Abrir menú' });
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(
    page
      .locator('#mobile-menu')
      .getByRole('link', { name: 'Inicio', exact: true })
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});
