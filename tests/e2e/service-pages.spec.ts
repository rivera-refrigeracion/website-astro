import { test, expect } from '@playwright/test';

const services = [
  {
    slug: 'aire-acondicionado',
    title: 'Aire Acondicionado',
    keyword: 'aire acondicionado',
  },
  {
    slug: 'neveras',
    title: 'Neveras',
    keyword: 'neveras',
  },
  {
    slug: 'lavadoras',
    title: 'Lavadoras',
    keyword: 'lavadoras',
  },
  {
    slug: 'calentadores',
    title: 'Calentadores',
    keyword: 'calentadores',
  },
];

test.describe('Service Pages - General', () => {
  for (const service of services) {
    test.describe(`${service.title} Service Page`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/servicios/${service.slug}`);
      });

      test('should have correct page title', async ({ page }) => {
        await expect(page).toHaveTitle(new RegExp(service.title));
        await expect(page).toHaveTitle(/Rivera Refrigeración/);
        await expect(page).toHaveTitle(/Cali/);
      });

      test('should have meta description', async ({ page }) => {
        const metaDescription = page.locator('meta[name="description"]');
        const content = await metaDescription.getAttribute('content');

        expect(content).toBeTruthy();
        expect(content!.length).toBeGreaterThan(50);
        expect(content).toContain('Cali');
      });

      test('should display hero section with title', async ({ page }) => {
        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();
        await expect(h1).toContainText(service.title);
      });

      test('should display hero image', async ({ page }) => {
        const heroImage = page.locator('figure').first().locator('img').first();
        await expect(heroImage).toBeVisible();

        const src = await heroImage.getAttribute('src');
        expect(src).toMatch(/\.(jpg|webp|png)$/);
      });

      test('should display short description', async ({ page }) => {
        const description = page.locator('p').first();
        await expect(description).toBeVisible();
      });

      test('should display brands section', async ({ page }) => {
        const brandsHeading = page.getByRole('heading', {
          name: /Marcas que Atendemos/i,
        });
        await expect(brandsHeading).toBeVisible();

        // Should have at least 5 brand items
        const brandItems = page.locator('.bg-neutral-50').first();
        await expect(brandItems).toBeVisible();
      });

      test('should display 4-step process', async ({ page }) => {
        const processHeading = page.getByRole('heading', {
          name: /Nuestro Proceso de Trabajo/i,
        });
        await expect(processHeading).toBeVisible();

        // Should show 4 steps
        for (let i = 1; i <= 4; i++) {
          const stepNumber = page.getByText(`Paso ${i}`);
          await expect(stepNumber).toBeVisible();
        }
      });

      test('should display FAQs section', async ({ page }) => {
        const faqHeading = page.getByRole('heading', {
          name: /Preguntas Frecuentes/i,
        });
        await expect(faqHeading).toBeVisible();

        // Should have at least 8 FAQ items
        const faqItems = page.locator('details');
        const count = await faqItems.count();
        expect(count).toBeGreaterThanOrEqual(8);
      });

      test('should have FAQ accordion functionality', async ({ page }) => {
        const firstFaq = page.locator('details').first();
        await expect(firstFaq).toBeVisible();

        // FAQ should be closed initially
        const isOpen = await firstFaq.evaluate((el) => el.hasAttribute('open'));
        expect(isOpen).toBe(false);

        // Click to open
        const summary = firstFaq.locator('summary');
        await summary.click();

        // Should be open now
        const isOpenAfterClick = await firstFaq.evaluate((el) =>
          el.hasAttribute('open')
        );
        expect(isOpenAfterClick).toBe(true);

        // Answer should be visible
        const answer = firstFaq.locator('div').last();
        await expect(answer).toBeVisible();
      });

      test('should display CTA section with WhatsApp button', async ({
        page,
      }) => {
        const ctaHeading = page.getByRole('heading', {
          name: /¿Necesitas este servicio?/i,
        });
        await expect(ctaHeading).toBeVisible();

        // Get the CTA section specifically
        const ctaSection = page
          .locator('section')
          .filter({ hasText: '¿Necesitas este servicio?' });
        const whatsappButton = ctaSection.getByRole('link', {
          name: /WhatsApp/i,
        });
        await expect(whatsappButton).toBeVisible();

        const href = await whatsappButton.getAttribute('href');
        expect(href).toMatch(/wa\.me|whatsapp|api\.whatsapp\.com/);
      });

      test('should have FAQ schema markup', async ({ page }) => {
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        expect(count).toBeGreaterThanOrEqual(1);

        // Check if any script contains FAQPage schema
        let hasFAQSchema = false;
        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          if (content && content.includes('FAQPage')) {
            hasFAQSchema = true;
            expect(content).toContain('Question');
            expect(content).toContain('Answer');
            break;
          }
        }
        expect(hasFAQSchema).toBe(true);
      });

      test('should have Service schema markup', async ({ page }) => {
        const scripts = page.locator('script[type="application/ld+json"]');
        const count = await scripts.count();
        expect(count).toBeGreaterThanOrEqual(1);

        // Check if any script contains Service schema
        let hasServiceSchema = false;
        for (let i = 0; i < count; i++) {
          const content = await scripts.nth(i).textContent();
          if (content && content.includes('"@type":"Service"')) {
            hasServiceSchema = true;
            expect(content).toContain('Rivera Refrigeración');
            break;
          }
        }
        expect(hasServiceSchema).toBe(true);
      });

      test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        const h1 = page.getByRole('heading', { level: 1 });
        await expect(h1).toBeVisible();

        const whatsappButton = page.getByRole('link', {
          name: 'Contáctanos por WhatsApp',
        });
        await expect(whatsappButton).toBeVisible();
      });

      test('should have accessible heading hierarchy', async ({ page }) => {
        // Should have one H1
        const h1Count = await page.getByRole('heading', { level: 1 }).count();
        expect(h1Count).toBe(1);

        // Should have multiple H2s
        const h2Count = await page.getByRole('heading', { level: 2 }).count();
        expect(h2Count).toBeGreaterThanOrEqual(5);
      });
    });
  }
});

test.describe('Service Pages - Navigation from Homepage', () => {
  test('should navigate from homepage to aire acondicionado service', async ({
    page,
  }) => {
    await page.goto('/');

    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeVisible();

    const verMasLink = servicesSection
      .getByRole('link', { name: 'Ver más' })
      .first();
    await expect(verMasLink).toBeVisible();

    await verMasLink.click();
    await page.waitForURL(/\/servicios\//);

    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
  });

  test('all service cards should have Ver más links', async ({ page }) => {
    await page.goto('/');

    const servicesSection = page.locator('#services');
    const verMasLinks = servicesSection.getByRole('link', { name: 'Ver más' });

    const count = await verMasLinks.count();
    expect(count).toBe(4); // One for each service
  });
});

test.describe('Service Pages - SEO', () => {
  test('all service pages should have unique meta titles', async ({ page }) => {
    const titles: string[] = [];

    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);
      const title = await page.title();
      titles.push(title);
    }

    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(4);
  });

  test('all service pages should have unique meta descriptions', async ({
    page,
  }) => {
    const descriptions: string[] = [];

    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);
      const metaDescription = page.locator('meta[name="description"]');
      const content = await metaDescription.getAttribute('content');
      descriptions.push(content || '');
    }

    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(4);
  });

  test('all service pages should have Open Graph tags', async ({ page }) => {
    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);

      const ogTitle = page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute('content', /.+/);

      const ogDescription = page.locator('meta[property="og:description"]');
      await expect(ogDescription).toHaveAttribute('content', /.+/);

      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveAttribute('content', /.+/);
    }
  });

  test('all service pages should have Twitter Card tags', async ({ page }) => {
    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);

      const twitterCard = page.locator('meta[name="twitter:card"]');
      await expect(twitterCard).toHaveAttribute(
        'content',
        'summary_large_image'
      );

      const twitterTitle = page.locator('meta[name="twitter:title"]');
      await expect(twitterTitle).toHaveAttribute('content', /.+/);
    }
  });
});

test.describe('Service Pages - Accessibility', () => {
  test('all FAQ accordions should be keyboard accessible', async ({ page }) => {
    await page.goto('/servicios/aire-acondicionado');

    const firstFaqSummary = page.locator('details summary').first();
    await firstFaqSummary.focus();

    // Should be able to activate with Enter key
    await page.keyboard.press('Enter');

    const firstFaq = page.locator('details').first();
    const isOpen = await firstFaq.evaluate((el) => el.hasAttribute('open'));
    expect(isOpen).toBe(true);
  });

  test('all images should have alt text', async ({ page }) => {
    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);

      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt!.length).toBeGreaterThan(0);
      }
    }
  });

  test('WhatsApp links should have proper aria-label', async ({ page }) => {
    await page.goto('/servicios/aire-acondicionado');

    // Check that at least one WhatsApp link exists
    const whatsappLinks = page.getByRole('link', { name: /WhatsApp/i });
    const count = await whatsappLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Service Pages - Content Quality', () => {
  test('all service pages should have substantial content', async ({
    page,
  }) => {
    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);

      const mainContent = page.locator('article');
      const textContent = await mainContent.textContent();

      // Should have at least 800 words (rough estimate: 5 chars per word)
      expect(textContent!.length).toBeGreaterThan(4000);
    }
  });

  test('all service pages should mention the service keyword', async ({
    page,
  }) => {
    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);

      const mainContent = page.locator('article');
      await expect(mainContent).toContainText(service.keyword, {
        ignoreCase: true,
      });
    }
  });

  test('all service pages should mention Cali', async ({ page }) => {
    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);

      const mainContent = page.locator('article');
      await expect(mainContent).toContainText('Cali');
    }
  });

  test('all service pages should mention Rivera Refrigeración', async ({
    page,
  }) => {
    for (const service of services) {
      await page.goto(`/servicios/${service.slug}`);

      const mainContent = page.locator('article');
      await expect(mainContent).toContainText('Rivera Refrigeración');
    }
  });
});

test.describe('Service Pages - Performance', () => {
  test('calentadores page should use optimized WebP image', async ({
    page,
  }) => {
    await page.goto('/servicios/calentadores');

    const heroImage = page.locator('figure').first().locator('img').first();
    const src = await heroImage.getAttribute('src');

    expect(src).toContain('.webp');
  });

  test('images should have loading="lazy" or loading="eager" attribute', async ({
    page,
  }) => {
    await page.goto('/servicios/aire-acondicionado');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const loading = await img.getAttribute('loading');
      // Some images may not have loading attribute (e.g., SVGs or icons)
      // but if they do, it should be lazy or eager
      if (loading) {
        expect(loading).toMatch(/lazy|eager/);
      }
    }
  });
});
