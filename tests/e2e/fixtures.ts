import { test as base, expect, type Page } from '@playwright/test';

/**
 * Custom Playwright test fixture that automatically blocks analytics requests
 * to prevent E2E tests from sending fake data to production Google Analytics
 * and Google Tag Manager.
 *
 * This fixture extends the base Playwright test and intercepts network requests
 * to analytics domains, aborting them before they can send data.
 *
 * Usage in test files:
 *   import { test, expect } from './fixtures';
 *
 * Blocked domains:
 * - www.googletagmanager.com (GTM script and iframe)
 * - www.google-analytics.com (GA tracking)
 * - analytics.google.com (additional GA endpoints)
 * - region1.google-analytics.com (regional GA endpoints)
 * - google-analytics.com (GA fallback)
 * - googletagmanager.com (GTM fallback)
 *
 * Related: GitHub Issue #28
 */

type TestFixtures = {
  page: Page;
};

const test = base.extend<TestFixtures>({
  page: async ({ page }, use) => {
    // Block all analytics-related requests before tests run
    // Use a more flexible matching approach that checks the URL string
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('googletagmanager.com') ||
        url.includes('google-analytics.com') ||
        url.includes('analytics.google.com')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Use the page in the test
    await use(page);

    // Cleanup happens automatically after test completes
  },
});

export { test, expect };
