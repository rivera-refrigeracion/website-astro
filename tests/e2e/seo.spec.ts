import { test, expect } from './fixtures';

test.describe('SEO', () => {
  test.describe('Homepage SEO', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should have meta description', async ({ page }) => {
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    });

    test('should have canonical URL', async ({ page }) => {
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        'href',
        /https:\/\/rivera-refrigeracion\.com/
      );
    });

    test('should have Open Graph tags', async ({ page }) => {
      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute('content', /.+/);

      const ogDescription = page.locator('meta[property="og:description"]');
      await expect(ogDescription).toHaveAttribute('content', /.+/);

      const ogType = page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute('content', 'website');

      const ogUrl = page.locator('meta[property="og:url"]');
      await expect(ogUrl).toHaveAttribute('content', /.+/);

      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveAttribute('content', /.+/);
    });

    test('should have Twitter Card tags', async ({ page }) => {
      const twitterCard = page.locator('meta[name="twitter:card"]');
      await expect(twitterCard).toHaveAttribute(
        'content',
        'summary_large_image'
      );

      const twitterTitle = page.locator('meta[name="twitter:title"]');
      await expect(twitterTitle).toHaveAttribute('content', /.+/);

      const twitterDescription = page.locator(
        'meta[name="twitter:description"]'
      );
      await expect(twitterDescription).toHaveAttribute('content', /.+/);
    });

    test('should have Spanish language tag', async ({ page }) => {
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', 'es');
    });

    test('should have structured data', async ({ page }) => {
      const structuredData = page.locator('script[type="application/ld+json"]');
      await expect(structuredData).toBeAttached();

      const content = await structuredData.textContent();
      expect(content).toContain('LocalBusiness');
      expect(content).toContain('Rivera Refrigeración');
    });
  });

  test.describe('Blog post SEO', () => {
    test('should have article meta tags', async ({ page }) => {
      await page.goto('/por-que-tu-aire-acondicionado-no-enfria-bien');

      const ogType = page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute('content', 'article');

      const articleAuthor = page.locator('meta[property="article:author"]');
      await expect(articleAuthor).toHaveAttribute('content', /.+/);

      const articlePublished = page.locator(
        'meta[property="article:published_time"]'
      );
      await expect(articlePublished).toHaveAttribute('content', /.+/);
    });
  });

  test.describe('Accessibility', () => {
    test('should have skip to content link', async ({ page }) => {
      await page.goto('/');

      const skipLink = page.getByRole('link', { name: /ir al contenido/i });
      await expect(skipLink).toBeAttached();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');

      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveCount(1);
    });
  });

  test.describe('Analytics Blocking', () => {
    test('should block GTM/GA requests in E2E tests', async ({ page }) => {
      const completedRequests: string[] = [];
      const failedRequests: string[] = [];

      // Listen for all request completions
      page.on('requestfinished', (request) => {
        const url = request.url();
        if (
          url.includes('googletagmanager.com') ||
          url.includes('google-analytics.com') ||
          url.includes('analytics.google.com')
        ) {
          completedRequests.push(url);
        }
      });

      // Listen for failed/aborted requests
      page.on('requestfailed', (request) => {
        const url = request.url();
        if (
          url.includes('googletagmanager.com') ||
          url.includes('google-analytics.com') ||
          url.includes('analytics.google.com')
        ) {
          failedRequests.push(url);
        }
      });

      await page.goto('/');

      // Wait a moment for any scripts to attempt loading
      await page.waitForTimeout(1000);

      // Log for debugging
      if (completedRequests.length > 0) {
        console.log('Completed analytics requests:', completedRequests);
      }
      if (failedRequests.length > 0) {
        console.log('Failed/aborted analytics requests:', failedRequests);
      }

      // No analytics requests should have completed successfully
      expect(completedRequests.length).toBe(0);

      // Analytics requests should have been blocked (failed/aborted)
      expect(failedRequests.length).toBeGreaterThan(0);
    });

    test('should have GTM script in HTML but not execute', async ({ page }) => {
      await page.goto('/');

      // Verify the GTM script tag exists in the HTML
      const pageContent = await page.content();
      expect(pageContent).toContain('GTM-WGKFDPTD');
      expect(pageContent).toContain('googletagmanager.com');

      // But the dataLayer should not be populated with GTM events
      // since the script is blocked from loading
      const dataLayerExists = await page.evaluate(() => {
        return typeof window !== 'undefined' && 'dataLayer' in window;
      });

      // DataLayer might exist but should be empty or minimal
      // since GTM script never loaded
      if (dataLayerExists) {
        const dataLayerLength = await page.evaluate(() => {
          return (window as any).dataLayer?.length || 0;
        });
        // If dataLayer exists, it should be empty or have minimal entries
        expect(dataLayerLength).toBeLessThanOrEqual(1);
      }
    });
  });
});
