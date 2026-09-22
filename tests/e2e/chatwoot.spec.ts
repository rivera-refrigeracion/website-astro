import { test, expect } from './fixtures';

type ChatwootWindow = {
  chatwootSettings?: object;
  chatwootSDK?: object;
  $chatwoot?: { isOpen?: boolean };
};

test.describe('Chatwoot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should define Chatwoot settings', async ({ page }) => {
    const chatwootSettings = await page.evaluate(
      () => (window as unknown as ChatwootWindow).chatwootSettings
    );

    expect(chatwootSettings).toBeDefined();
    expect(chatwootSettings).toHaveProperty('position', 'right');
    expect(chatwootSettings).toHaveProperty('type', 'standard');
    expect(chatwootSettings).toHaveProperty(
      'launcherTitle',
      'Habla con nosotros'
    );
  });

  test('should show the chat launcher without loading the SDK', async ({
    page,
  }) => {
    const launcher = page.getByRole('button', { name: /abrir el chat/i });
    await expect(launcher).toBeVisible();

    const sdkScripts = await page.locator('script[src*="chatwoot"]').count();
    expect(sdkScripts).toBe(0);

    const hasSDK = await page.evaluate(
      () => typeof (window as unknown as ChatwootWindow).chatwootSDK
    );
    expect(hasSDK).toBe('undefined');
  });

  test('should load the SDK from the configured base URL on click', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /abrir el chat/i }).click();

    const scriptSrc = await page
      .locator('script[src*="chatwoot"]')
      .getAttribute('src');
    expect(scriptSrc).toBe('https://chatwoot.jjuanrivvera.com/packs/js/sdk.js');

    await page.waitForFunction(
      () =>
        typeof (window as unknown as ChatwootWindow).chatwootSDK !==
        'undefined',
      undefined,
      { timeout: 10000 }
    );
  });

  test('should be present on blog pages too', async ({ page }) => {
    await page.goto('/blog/por-que-tu-aire-acondicionado-no-enfria-bien/');

    await expect(
      page.getByRole('button', { name: /abrir el chat/i })
    ).toBeVisible();
  });
});
