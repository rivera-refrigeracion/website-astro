import { test, expect } from './fixtures';

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Footer Structure', () => {
    test('should display footer on all pages', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should have 4 main sections', async ({ page }) => {
      const footer = page.locator('footer');
      const sections = footer.locator('h3');
      await expect(sections).toHaveCount(4);
    });

    test('should have Company Info section', async ({ page }) => {
      const heading = page.getByRole('heading', {
        name: 'Rivera Refrigeración',
        level: 3,
      });
      await expect(heading).toBeVisible();
    });

    test('should have Services section', async ({ page }) => {
      const heading = page.getByRole('heading', {
        name: 'Servicios',
        level: 3,
      });
      await expect(heading).toBeVisible();
    });

    test('should have Contact section', async ({ page }) => {
      const heading = page.getByRole('heading', { name: 'Contacto', level: 3 });
      await expect(heading).toBeVisible();
    });

    test('should have Operating Hours section', async ({ page }) => {
      const heading = page.getByRole('heading', { name: 'Horario', level: 3 });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('NAP Information', () => {
    test('should display business name', async ({ page }) => {
      const businessName = page.getByRole('heading', {
        name: 'Rivera Refrigeración',
      });
      await expect(businessName).toBeVisible();
    });

    test('should display complete address', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toContainText('Cali');
      await expect(footer).toContainText('Valle del Cauca');
    });

    test('should display phone number with formatting', async ({ page }) => {
      const phoneLink = page.locator('a[href="tel:+573173095159"]');
      await expect(phoneLink).toBeVisible();
      await expect(phoneLink).toContainText('+57 317 309 5159');
    });

    test('should display WhatsApp number with formatting', async ({ page }) => {
      const whatsappLink = page.getByRole('link', {
        name: /\+57 301 696 3313/,
      });
      await expect(whatsappLink).toBeVisible();
      await expect(whatsappLink).toHaveAttribute(
        'href',
        'https://wa.me/573016963313'
      );
    });

    test('should display email address', async ({ page }) => {
      const emailLink = page.getByRole('link', {
        name: /ruben@rivera-refrigeracion\.com/,
      });
      await expect(emailLink).toBeVisible();
      await expect(emailLink).toHaveAttribute(
        'href',
        'mailto:ruben@rivera-refrigeracion.com'
      );
    });

    test('should display operating hours', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toContainText('Lunes - Viernes');
      await expect(footer).toContainText('8:00 AM - 6:00 PM');
    });
  });

  test.describe('Schema.org Markup', () => {
    test('should have LocalBusiness schema on footer', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toHaveAttribute('itemscope');
      await expect(footer).toHaveAttribute(
        'itemtype',
        'https://schema.org/LocalBusiness'
      );
    });

    test('should have business name with itemprop', async ({ page }) => {
      const businessName = page.locator('[itemprop="name"]');
      await expect(businessName).toBeVisible();
      await expect(businessName).toContainText('Rivera Refrigeración');
    });

    test('should have PostalAddress schema', async ({ page }) => {
      const address = page.locator(
        '[itemtype="https://schema.org/PostalAddress"]'
      );
      await expect(address).toHaveAttribute('itemscope');
    });

    test('should have addressLocality in schema', async ({ page }) => {
      const locality = page.locator('[itemprop="addressLocality"]');
      await expect(locality).toContainText('Cali');
    });

    test('should have addressRegion in schema', async ({ page }) => {
      const region = page.locator('[itemprop="addressRegion"]');
      await expect(region).toContainText('Valle del Cauca');
    });

    test('should have telephone with itemprop', async ({ page }) => {
      const phone = page.locator('[itemprop="telephone"]');
      await expect(phone).toBeVisible();
    });

    test('should have email with itemprop', async ({ page }) => {
      const email = page.locator('[itemprop="email"]');
      await expect(email).toBeVisible();
    });

    test('should have openingHours meta tag', async ({ page }) => {
      const openingHours = page.locator('meta[itemprop="openingHours"]');
      await expect(openingHours).toHaveAttribute(
        'content',
        'Mo-Fr 08:00-18:00'
      );
    });

    test('should have website URL meta tag', async ({ page }) => {
      const url = page.locator('meta[itemprop="url"]');
      await expect(url).toHaveAttribute(
        'content',
        'https://rivera-refrigeracion.com'
      );
    });
  });

  test.describe('Service Links', () => {
    test('should link to all 4 service pages', async ({ page }) => {
      const serviceLinks = page.locator('footer nav a');
      await expect(serviceLinks).toHaveCount(4);
    });

    test('should link to air conditioning service', async ({ page }) => {
      const link = page
        .locator('footer')
        .getByRole('link', { name: 'Aire Acondicionado' });
      await expect(link).toHaveAttribute(
        'href',
        '/servicios/aire-acondicionado'
      );
    });

    test('should link to refrigerator service', async ({ page }) => {
      const link = page
        .locator('footer')
        .getByRole('link', { name: 'Neveras' });
      await expect(link).toHaveAttribute('href', '/servicios/neveras');
    });

    test('should link to washing machine service', async ({ page }) => {
      const link = page
        .locator('footer')
        .getByRole('link', { name: 'Lavadoras' });
      await expect(link).toHaveAttribute('href', '/servicios/lavadoras');
    });

    test('should link to water heater service', async ({ page }) => {
      const link = page
        .locator('footer')
        .getByRole('link', { name: 'Calentadores' });
      await expect(link).toHaveAttribute('href', '/servicios/calentadores');
    });
  });

  test.describe('Social Media', () => {
    test('should display social media section', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toContainText('Síguenos:');
    });

    test('should have Facebook link', async ({ page }) => {
      const facebookLink = page
        .locator('footer')
        .locator('a[aria-label="Facebook"]');
      await expect(facebookLink).toBeVisible();
      await expect(facebookLink).toHaveAttribute(
        'href',
        'https://www.facebook.com/profile.php?id=61564032905797'
      );
      await expect(facebookLink).toHaveAttribute('target', '_blank');
    });

    test('should have Instagram link', async ({ page }) => {
      const instagramLink = page
        .locator('footer')
        .locator('a[aria-label="Instagram"]');
      await expect(instagramLink).toBeVisible();
      await expect(instagramLink).toHaveAttribute(
        'href',
        'https://instagram.com/rivera.refrigeracion'
      );
      await expect(instagramLink).toHaveAttribute('target', '_blank');
    });

    test('should have WhatsApp link in social section', async ({ page }) => {
      const whatsappLink = page
        .locator('footer div:has-text("Síguenos:")')
        .getByRole('link', { name: 'WhatsApp', exact: true });
      await expect(whatsappLink).toBeVisible();
      await expect(whatsappLink).toHaveAttribute(
        'href',
        'https://api.whatsapp.com/send?phone=573016963313'
      );
    });

    test('all social links should open in new tab', async ({ page }) => {
      const socialLinks = page.locator('footer .border-t a[aria-label]');
      const count = await socialLinks.count();

      for (let i = 0; i < count; i++) {
        const link = socialLinks.nth(i);
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });
  });

  test.describe('Copyright', () => {
    test('should display copyright notice', async ({ page }) => {
      const footer = page.locator('footer');
      const currentYear = new Date().getFullYear();
      await expect(footer).toContainText(`Copyright © ${currentYear}`);
      await expect(footer).toContainText('Rivera Refrigeración');
    });

    test('copyright should include all rights reserved', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toContainText('Todos los derechos reservados');
    });
  });

  test.describe('Responsive Design', () => {
    test('should be visible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('all sections should be visible on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const footer = page.locator('footer');
      const companyHeading = footer.getByRole('heading', {
        name: 'Rivera Refrigeración',
      });
      const servicesHeading = footer.getByRole('heading', {
        name: 'Servicios',
        exact: true,
      });
      const contactHeading = footer.getByRole('heading', { name: 'Contacto' });
      const hoursHeading = footer.getByRole('heading', { name: 'Horario' });

      await expect(companyHeading).toBeVisible();
      await expect(servicesHeading).toBeVisible();
      await expect(contactHeading).toBeVisible();
      await expect(hoursHeading).toBeVisible();
    });

    test('should display on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper nav landmark for services', async ({ page }) => {
      const nav = page.locator('footer nav[aria-label="Enlaces a servicios"]');
      await expect(nav).toBeVisible();
    });

    test('all links should have accessible names', async ({ page }) => {
      const links = page.locator('footer a');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        const ariaLabel = await link.getAttribute('aria-label');
        const textContent = await link.textContent();

        // Each link should have either aria-label or text content
        expect(ariaLabel || textContent?.trim()).toBeTruthy();
      }
    });

    test('social media icons should have title attributes', async ({
      page,
    }) => {
      const socialLinks = page.locator('footer .border-t a[aria-label]');
      const count = await socialLinks.count();

      for (let i = 0; i < count; i++) {
        const link = socialLinks.nth(i);
        const title = await link.getAttribute('title');
        expect(title).toBeTruthy();
      }
    });
  });
});
