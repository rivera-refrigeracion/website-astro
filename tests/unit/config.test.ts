import { describe, it, expect } from 'vitest';
import {
  SITE,
  CONTACT,
  SOCIAL,
  NAVIGATION,
  SERVICES,
  WHY_US,
  TESTIMONIALS,
} from '../../src/lib/config';

describe('Site Configuration', () => {
  describe('SITE', () => {
    it('should have correct site name', () => {
      expect(SITE.name).toBe('Rivera Refrigeración');
    });

    it('should have a valid URL', () => {
      expect(SITE.url).toMatch(/^https?:\/\//);
    });

    it('should have Spanish locale', () => {
      expect(SITE.locale).toBe('es_CO');
      expect(SITE.language).toBe('es');
    });

    it('should have a description', () => {
      expect(SITE.description.length).toBeGreaterThan(0);
    });
  });

  describe('CONTACT', () => {
    it('should have valid phone number format', () => {
      expect(CONTACT.phone).toMatch(/^\+\d+$/);
    });

    it('should have valid WhatsApp number', () => {
      expect(CONTACT.whatsapp).toMatch(/^\d+$/);
    });

    it('should have valid WhatsApp link', () => {
      expect(CONTACT.whatsappLink).toMatch(/whatsapp\.com|wa\.me/);
    });

    it('should have appointment link', () => {
      expect(CONTACT.appointmentLink).toMatch(/^https?:\/\//);
    });

    it('should have location in Cali, Colombia', () => {
      expect(CONTACT.location).toContain('Cali');
      expect(CONTACT.location).toContain('Colombia');
    });

    it('should have valid email address', () => {
      expect(CONTACT.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should have email at rivera-refrigeracion.com domain', () => {
      expect(CONTACT.email).toContain('rivera-refrigeracion.com');
    });
  });

  describe('SOCIAL', () => {
    it('should have WhatsApp link', () => {
      expect(SOCIAL.whatsapp).toMatch(/whatsapp\.com|wa\.me/);
    });

    it('should have Facebook link', () => {
      expect(SOCIAL.facebook).toMatch(/facebook\.com/);
    });

    it('should have Instagram link', () => {
      expect(SOCIAL.instagram).toMatch(/instagram\.com/);
    });

    it('all social links should be valid URLs', () => {
      expect(SOCIAL.whatsapp).toMatch(/^https?:\/\//);
      expect(SOCIAL.facebook).toMatch(/^https?:\/\//);
      expect(SOCIAL.instagram).toMatch(/^https?:\/\//);
    });
  });

  describe('NAVIGATION', () => {
    it('should have at least 5 navigation items', () => {
      expect(NAVIGATION.length).toBeGreaterThanOrEqual(5);
    });

    it('should include Home link', () => {
      const homeLink = NAVIGATION.find((item) => item.name === 'Inicio');
      expect(homeLink).toBeDefined();
      expect(homeLink?.href).toBe('/');
    });

    it('should include Blog link', () => {
      const blogLink = NAVIGATION.find((item) => item.name === 'Blog');
      expect(blogLink).toBeDefined();
      expect(blogLink?.href).toBe('/blog');
    });

    it('all items should have name and href', () => {
      NAVIGATION.forEach((item) => {
        expect(item.name).toBeDefined();
        expect(item.href).toBeDefined();
      });
    });
  });

  describe('SERVICES', () => {
    it('should have 4 services', () => {
      expect(SERVICES.length).toBe(4);
    });

    it('should include air conditioning service', () => {
      const acService = SERVICES.find(
        (service) => service.id === 'aire-acondicionado'
      );
      expect(acService).toBeDefined();
      expect(acService?.title).toBe('Aire Acondicionado');
    });

    it('should include refrigerator service', () => {
      const fridgeService = SERVICES.find(
        (service) => service.id === 'neveras'
      );
      expect(fridgeService).toBeDefined();
      expect(fridgeService?.title).toBe('Neveras');
    });

    it('should include washing machine service', () => {
      const washerService = SERVICES.find(
        (service) => service.id === 'lavadoras'
      );
      expect(washerService).toBeDefined();
      expect(washerService?.title).toBe('Lavadoras');
    });

    it('all services should have id, title, description and icon', () => {
      SERVICES.forEach((service) => {
        expect(service.id).toBeDefined();
        expect(service.title).toBeDefined();
        expect(service.description).toBeDefined();
        expect(service.icon).toBeDefined();
      });
    });
  });

  describe('WHY_US', () => {
    it('should have 3 reasons', () => {
      expect(WHY_US.length).toBe(3);
    });

    it('all reasons should have title, description and icon', () => {
      WHY_US.forEach((reason) => {
        expect(reason.title).toBeDefined();
        expect(reason.description).toBeDefined();
        expect(reason.icon).toBeDefined();
      });
    });
  });

  describe('TESTIMONIALS', () => {
    it('should have at least 1 testimonial', () => {
      expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(1);
    });

    it('all testimonials should have text and author', () => {
      TESTIMONIALS.forEach((testimonial) => {
        expect(testimonial.text).toBeDefined();
        expect(testimonial.author).toBeDefined();
      });
    });
  });
});
