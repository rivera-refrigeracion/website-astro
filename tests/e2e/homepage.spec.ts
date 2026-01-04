import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Rivera Refrigeración/);
  });

  test('should display header with logo and navigation', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const logo = header.getByRole('img', { name: /Rivera Refrigeración/i });
    await expect(logo).toBeVisible();

    // On mobile, nav items are hidden until menu is opened
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      const navItems = ['Inicio', 'Servicios', 'Sobre nosotros', 'Blog'];
      for (const item of navItems) {
        await expect(header.getByRole('link', { name: item })).toBeVisible();
      }
    }
  });

  test('should display hero section with CTA', async ({ page }) => {
    const heroHeading = page.getByRole('heading', { level: 1 });
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Soluciones Confiables');

    const ctaButton = page
      .getByRole('link', { name: 'Agenda tu cita' })
      .first();
    await expect(ctaButton).toBeVisible();
  });

  test('should display services section', async ({ page }) => {
    const servicesSection = page.locator('#services');
    await expect(servicesSection).toBeVisible();

    const servicesHeading = servicesSection.getByRole('heading', {
      name: 'Nuestros servicios',
    });
    await expect(servicesHeading).toBeVisible();

    const services = ['Aire Acondicionado', 'Neveras', 'Lavadoras'];
    for (const service of services) {
      await expect(
        servicesSection.getByRole('heading', { name: service })
      ).toBeVisible();
    }
  });

  test('should display about section', async ({ page }) => {
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeVisible();

    const aboutHeading = aboutSection.getByRole('heading', {
      name: 'Sobre nosotros',
    });
    await expect(aboutHeading).toBeVisible();

    await expect(aboutSection).toContainText('Rivera Refrigeración');
    await expect(aboutSection).toContainText('Rubén Darío Rivera');
  });

  test('should display testimonials section', async ({ page }) => {
    const testimonialsSection = page.locator('#reviews');
    await expect(testimonialsSection).toBeVisible();

    await expect(testimonialsSection).toContainText('Santiago Martínez');
  });

  test('should display why us section', async ({ page }) => {
    const whyUsSection = page.locator('#whyus');
    await expect(whyUsSection).toBeVisible();

    const whyUsHeading = whyUsSection.getByRole('heading', {
      name: 'Por qué Elegirnos',
    });
    await expect(whyUsHeading).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    await expect(footer).toContainText('Rivera Refrigeración');
  });

  test('should have WhatsApp link in header', async ({ page }) => {
    // On mobile, the WhatsApp link might be in the mobile menu
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      // On mobile, check the WhatsApp floating button instead
      const floatingWhatsApp = page.locator('.whatsapp-btn').first();
      await expect(floatingWhatsApp).toBeVisible();
      await expect(floatingWhatsApp).toHaveAttribute(
        'href',
        /wa\.me|whatsapp/i
      );
    } else {
      const whatsappLink = page
        .locator('header')
        .getByRole('link', { name: /WhatsApp/i });
      await expect(whatsappLink).toBeVisible();
      await expect(whatsappLink).toHaveAttribute('href', /wa\.me|whatsapp/i);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const mobileMenuButton = page.locator('#mobile-menu-button');
    await expect(mobileMenuButton).toBeVisible();
  });
});
