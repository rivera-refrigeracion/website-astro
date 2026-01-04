import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const SERVICES_DIR = join(process.cwd(), 'src/content/services');

function getServiceFiles() {
  return readdirSync(SERVICES_DIR).filter((file) => file.endsWith('.md'));
}

function parseServiceFile(filename: string) {
  const filePath = join(SERVICES_DIR, filename);
  const fileContent = readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  return { slug: filename.replace('.md', ''), data, content };
}

function getAllServices() {
  return getServiceFiles().map(parseServiceFile);
}

describe('Services Collection', () => {
  it('should have 4 service files', () => {
    const serviceFiles = getServiceFiles();
    expect(serviceFiles).toHaveLength(4);
  });

  it('should have correct service file names', () => {
    const serviceFiles = getServiceFiles()
      .map((f) => f.replace('.md', ''))
      .sort();

    expect(serviceFiles).toEqual([
      'aire-acondicionado',
      'calentadores',
      'lavadoras',
      'neveras',
    ]);
  });

  describe('Service: Aire Acondicionado', () => {
    const service = parseServiceFile('aire-acondicionado.md');

    it('should have correct data structure', () => {
      expect(service.data.title).toBe('Aire Acondicionado');
      expect(service.data.icon).toBe('air-conditioner');
    });

    it('should have SEO metadata', () => {
      expect(service.data.metaTitle).toContain('Aire Acondicionado');
      expect(service.data.metaTitle).toContain('Cali');
      expect(service.data.metaDescription.length).toBeGreaterThan(50);
      expect(service.data.keywords.length).toBeGreaterThanOrEqual(3);
    });

    it('should have hero image', () => {
      expect(service.data.heroImage.url).toMatch(/\.(jpg|webp|png)$/);
      expect(service.data.heroImage.alt.length).toBeGreaterThan(0);
    });

    it('should have brands list', () => {
      expect(service.data.brands.length).toBeGreaterThanOrEqual(5);
      service.data.brands.forEach((brand: { name: string }) => {
        expect(brand.name).toBeDefined();
      });
    });

    it('should have 4-step process', () => {
      expect(service.data.process).toHaveLength(4);
      service.data.process.forEach(
        (
          step: { step: number; title: string; description: string },
          index: number
        ) => {
          expect(step.step).toBe(index + 1);
          expect(step.title.length).toBeGreaterThan(0);
          expect(step.description.length).toBeGreaterThan(0);
        }
      );
    });

    it('should have 8-10 FAQs', () => {
      expect(service.data.faqs.length).toBeGreaterThanOrEqual(8);
      expect(service.data.faqs.length).toBeLessThanOrEqual(10);
      service.data.faqs.forEach((faq: { question: string; answer: string }) => {
        expect(faq.question.length).toBeGreaterThan(10);
        expect(faq.answer.length).toBeGreaterThan(20);
      });
    });

    it('should have pricing information', () => {
      expect(service.data.pricing.inspection).toBeDefined();
      expect(service.data.pricing.inspection).toContain('$');
    });
  });

  describe('Service: Neveras', () => {
    const service = parseServiceFile('neveras.md');

    it('should have correct data structure', () => {
      expect(service.data.title).toBe('Neveras y Refrigeradores');
      expect(service.data.icon).toBe('refrigerator');
    });

    it('should have SEO optimized for neveras keyword', () => {
      const hasNeverasKeyword = service.data.keywords.some((k: string) =>
        k.includes('neveras')
      );
      expect(hasNeverasKeyword).toBe(true);
    });

    it('should have 8-10 FAQs', () => {
      expect(service.data.faqs.length).toBeGreaterThanOrEqual(8);
      expect(service.data.faqs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Service: Lavadoras', () => {
    const service = parseServiceFile('lavadoras.md');

    it('should have correct data structure', () => {
      expect(service.data.title).toBe('Lavadoras');
      expect(service.data.icon).toBe('washing-machine');
    });

    it('should have SEO optimized for lavadoras keyword', () => {
      const hasLavadorasKeyword = service.data.keywords.some((k: string) =>
        k.includes('lavadoras')
      );
      expect(hasLavadorasKeyword).toBe(true);
    });

    it('should have 8-10 FAQs', () => {
      expect(service.data.faqs.length).toBeGreaterThanOrEqual(8);
      expect(service.data.faqs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Service: Calentadores', () => {
    const service = parseServiceFile('calentadores.md');

    it('should have correct data structure', () => {
      expect(service.data.title).toBe('Calentadores de Agua');
      expect(service.data.icon).toBe('water-heater');
    });

    it('should use optimized WebP image', () => {
      expect(service.data.heroImage.url).toContain('.webp');
    });

    it('should have SEO optimized for calentadores keyword', () => {
      const hasCalentadoresKeyword = service.data.keywords.some((k: string) =>
        k.includes('calentadores')
      );
      expect(hasCalentadoresKeyword).toBe(true);
    });

    it('should have 8-10 FAQs', () => {
      expect(service.data.faqs.length).toBeGreaterThanOrEqual(8);
      expect(service.data.faqs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('All Services - Common Requirements', () => {
    const services = getAllServices();

    it('all services should have unique titles', () => {
      const titles = services.map((s) => s.data.title);
      const uniqueTitles = new Set(titles);

      expect(uniqueTitles.size).toBe(services.length);
    });

    it('all services should have unique meta titles', () => {
      const metaTitles = services.map((s) => s.data.metaTitle);
      const uniqueMetaTitles = new Set(metaTitles);

      expect(uniqueMetaTitles.size).toBe(services.length);
    });

    it('all services should have unique meta descriptions', () => {
      const metaDescriptions = services.map((s) => s.data.metaDescription);
      const uniqueMetaDescriptions = new Set(metaDescriptions);

      expect(uniqueMetaDescriptions.size).toBe(services.length);
    });

    it('all services should mention Cali in meta title or description', () => {
      services.forEach((service) => {
        const mentionsCali =
          service.data.metaTitle.includes('Cali') ||
          service.data.metaDescription.includes('Cali');
        expect(mentionsCali).toBe(true);
      });
    });

    it('all services should have at least 3 keywords', () => {
      services.forEach((service) => {
        expect(service.data.keywords.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('all services should have 4-step process', () => {
      services.forEach((service) => {
        expect(service.data.process).toHaveLength(4);
      });
    });

    it('all services should have pricing with inspection cost', () => {
      services.forEach((service) => {
        expect(service.data.pricing.inspection).toBeDefined();
        expect(service.data.pricing.inspection.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Content Quality', () => {
    const services = getAllServices();

    it('all services should have markdown content', () => {
      services.forEach((service) => {
        expect(service.content.length).toBeGreaterThan(100);
      });
    });

    it('all meta descriptions should be under 160 characters', () => {
      services.forEach((service) => {
        expect(service.data.metaDescription.length).toBeLessThanOrEqual(160);
      });
    });

    it('all FAQs should have questions ending with question mark', () => {
      services.forEach((service) => {
        service.data.faqs.forEach((faq: { question: string }) => {
          expect(faq.question).toMatch(/\?$/);
        });
      });
    });
  });
});
