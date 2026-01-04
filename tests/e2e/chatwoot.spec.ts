import { test, expect } from '@playwright/test';

test.describe('Chatwoot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load Chatwoot SDK script', async ({ page }) => {
    // Check that the Chatwoot settings are defined
    const chatwootSettings = await page.evaluate(() => {
      return (window as unknown as { chatwootSettings: object })
        .chatwootSettings;
    });

    expect(chatwootSettings).toBeDefined();
    expect(chatwootSettings).toHaveProperty('position', 'right');
    expect(chatwootSettings).toHaveProperty('type', 'standard');
    expect(chatwootSettings).toHaveProperty(
      'launcherTitle',
      'Habla con nosotros'
    );
  });

  test('should initialize Chatwoot SDK', async ({ page }) => {
    // Wait for Chatwoot SDK to be available (script loaded)
    await page.waitForFunction(
      () => {
        return (
          typeof (window as unknown as { chatwootSDK?: object }).chatwootSDK !==
          'undefined'
        );
      },
      { timeout: 10000 }
    );

    const hasSDK = await page.evaluate(() => {
      return (
        typeof (window as unknown as { chatwootSDK?: object }).chatwootSDK !==
        'undefined'
      );
    });

    expect(hasSDK).toBe(true);
  });

  test('should have correct base URL configured', async ({ page }) => {
    // Verify the script source points to the correct Chatwoot instance
    const scriptSrc = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts
        .map((s) => s.getAttribute('src'))
        .find((src) => src?.includes('chatwoot'));
    });

    expect(scriptSrc).toContain('chatwoot.jjuanrivvera.com');
  });

  test('should be present on blog pages too', async ({ page }) => {
    await page.goto('/por-que-tu-aire-acondicionado-no-enfria-bien');

    const chatwootSettings = await page.evaluate(() => {
      return (window as unknown as { chatwootSettings: object })
        .chatwootSettings;
    });

    expect(chatwootSettings).toBeDefined();
  });

  test('should not hide bubble on desktop', async ({ page }) => {
    // Default Playwright viewport is 1280x720 (desktop)
    const chatwootSettings = await page.evaluate(() => {
      return (
        window as unknown as {
          chatwootSettings: { hideMessageBubble?: boolean };
        }
      ).chatwootSettings;
    });

    expect(chatwootSettings.hideMessageBubble).toBe(false);
  });
});

test.describe('Chatwoot Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should hide bubble on mobile initially', async ({ page }) => {
    await page.goto('/');

    const chatwootSettings = await page.evaluate(() => {
      return (
        window as unknown as {
          chatwootSettings: { hideMessageBubble?: boolean };
        }
      ).chatwootSettings;
    });

    expect(chatwootSettings.hideMessageBubble).toBe(true);
  });
});
