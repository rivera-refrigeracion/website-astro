import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const SERVICES_DIR = join(process.cwd(), 'src/content/services');
const BLOG_DIR = join(process.cwd(), 'src/content/blog');

function parseServiceFile(filename: string) {
  const filePath = join(SERVICES_DIR, filename);
  const { data, content } = matter(readFileSync(filePath, 'utf-8'));
  return { slug: filename.replace('.md', ''), data, content };
}

function getAllServices() {
  return readdirSync(SERVICES_DIR)
    .filter((file) => file.endsWith('.md'))
    .map(parseServiceFile);
}

describe('Service pages', () => {
  const services = getAllServices();
  const servicesWithBrands = services.filter(
    ({ slug }) => slug !== 'instalacion-aire-acondicionado'
  );

  it.each(services)('$slug has a unique title', (service) => {
    expect(
      services.filter(({ data }) => data.title === service.data.title)
    ).toHaveLength(1);
  });

  it.each([
    [
      'aire-acondicionado',
      'Aire Acondicionado',
      'Instalación y reparación de aire acondicionado en Cali',
      'Aire acondicionado en Cali',
    ],
    [
      'calentadores',
      'Calentadores de Agua',
      'Instalación y reparación de calentadores de agua en Cali',
      'Calentadores de agua en Cali',
    ],
    [
      'lavadoras',
      'Lavadoras',
      'Reparación de lavadoras en Cali a domicilio',
      'Reparación de lavadoras en Cali',
    ],
    [
      'neveras',
      'Neveras y Refrigeradores',
      'Reparación de neveras en Cali a domicilio',
      'Reparación de neveras en Cali',
    ],
  ])(
    'restores the reviewed title fields for %s',
    (slug, title, h1, metaTitle) => {
      const service = services.find((entry) => entry.slug === slug);
      expect(service?.data.title).toBe(title);
      expect(service?.data.h1).toBe(h1);
      expect(service?.data.metaTitle).toBe(metaTitle);
    }
  );

  it.each(services)('$slug has a unique meta title', (service) => {
    expect(
      services.filter(({ data }) => data.metaTitle === service.data.metaTitle)
    ).toHaveLength(1);
  });

  it.each(services)('$slug has a unique short meta description', (service) => {
    expect(service.data.metaDescription.length).toBeLessThan(160);
    expect(service.data.metaDescription).not.toMatch(/todas las marcas/i);
    expect(
      services.filter(
        ({ data }) => data.metaDescription === service.data.metaDescription
      )
    ).toHaveLength(1);
  });

  it.each(services)('$slug mentions Cali in its SEO metadata', (service) => {
    expect(
      service.data.metaTitle.includes('Cali') ||
        service.data.metaDescription.includes('Cali')
    ).toBe(true);
  });

  it.each(services)('$slug has at least three SEO keywords', (service) => {
    expect(service.data.keywords.length).toBeGreaterThanOrEqual(3);
  });

  it.each(services)('$slug has a published main image', (service) => {
    const imageUrl = service.data.heroImage.url;
    const imagePath = join(
      process.cwd(),
      'src/assets',
      imageUrl.replace(/^\//, '')
    );

    expect(imageUrl).toMatch(/^\/images\/.+\.(jpg|webp|png)$/);
    expect(existsSync(imagePath)).toBe(true);
    expect(service.data.heroImage.alt.trim().length).toBeGreaterThan(0);

    if (['calentadores', 'lavadoras', 'neveras'].includes(service.slug)) {
      expect(imageUrl).toMatch(/\.webp$/);
    }
  });

  it.each(services)('$slug has a complete four-step process', (service) => {
    expect(service.data.process).toHaveLength(4);
    service.data.process.forEach(
      (
        step: { step: number; title: string; description: string },
        index: number
      ) => {
        expect(step.step).toBe(index + 1);
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.description.trim().length).toBeGreaterThan(0);
      }
    );
  });

  it.each(services)('$slug has non-empty Markdown content', (service) => {
    expect(service.content.trim().length).toBeGreaterThan(0);
  });

  it.each(services)('$slug has between four and six FAQs', (service) => {
    expect(service.data.faqs.length).toBeGreaterThanOrEqual(4);
    expect(service.data.faqs.length).toBeLessThanOrEqual(6);
    service.data.faqs.forEach((faq: { question: string; answer: string }) => {
      expect(faq.question.trim().length).toBeGreaterThan(10);
      expect(faq.answer.trim().length).toBeGreaterThan(20);
    });
  });

  it.each(servicesWithBrands)(
    '$slug has a populated brands list',
    (service) => {
      expect(service.data.brands.length).toBeGreaterThanOrEqual(5);
      service.data.brands.forEach((brand: { name: string }) => {
        expect(brand.name.trim().length).toBeGreaterThan(0);
      });
    }
  );

  it('contains the four existing pages and the separate air installation page', () => {
    expect(services.map((service) => service.slug).sort()).toEqual([
      'aire-acondicionado',
      'calentadores',
      'instalacion-aire-acondicionado',
      'lavadoras',
      'neveras',
    ]);
  });

  it('gives every service a local title, four visit steps and 4 to 6 FAQs', () => {
    services.forEach(({ data }) => {
      expect(data.metaTitle).toContain('Cali');
      expect(data.h1).toContain('Cali');
      expect(data.metaDescription.length).toBeLessThanOrEqual(160);
      expect(data.process).toHaveLength(4);
      expect(data.faqs.length).toBeGreaterThanOrEqual(4);
      expect(data.faqs.length).toBeLessThanOrEqual(6);
      expect(
        data.faqs.every((faq: { question: string }) => /\?$/.test(faq.question))
      ).toBe(true);
    });
  });

  it('describes diagnosis, prior budget, repair and final test on the four existing pages', () => {
    const existingPages = services.filter(
      ({ slug }) => slug !== 'instalacion-aire-acondicionado'
    );

    existingPages.forEach(({ data, content }) => {
      const process = data.process
        .map(
          (step: { title: string; description: string }) =>
            `${step.title} ${step.description}`
        )
        .join(' ')
        .toLowerCase();
      expect(process).toContain('diagnóstico');
      expect(process).toContain('presupuesto antes de empezar');
      expect(process).toContain('reparación');
      expect(process).toContain('prueba final');
      expect(content).toMatch(
        /problemas frecuentes|fallas frecuentes|situaciones que puede consultar/i
      );
      expect(content).toContain('Cali');
    });
  });

  it('covers installation scope, preparation, equipment types, timing and cross-links', () => {
    const install = parseServiceFile('instalacion-aire-acondicionado.md');
    const repair = parseServiceFile('aire-acondicionado.md');
    const allInstallText = `${install.content} ${JSON.stringify(install.data.faqs)}`;

    expect(install.data.h1).toBe('Instalación de aire acondicionado en Cali');
    expect(allInstallText).toMatch(/presupuesto\s+antes de\s+empezar/i);
    expect(allInstallText).toMatch(/antes de la visita|tener listo/i);
    expect(allInstallText).toMatch(/split, de ventana y cassette/i);
    expect(allInstallText).toMatch(/varias horas/i);
    expect(install.content).toContain('/servicios/aire-acondicionado/');
    expect(repair.content).toContain(
      '/servicios/instalacion-aire-acondicionado/'
    );
  });

  it('keeps the heater page general while gas service details await confirmation', () => {
    const heater = parseServiceFile('calentadores.md');
    const allText = `${heater.content} ${JSON.stringify(heater.data)}`;

    expect(heater.data.h1).toBe(
      'Instalación y reparación de calentadores de agua en Cali'
    );
    expect(allText).not.toMatch(
      /termocupla|quemador|fuga de gas|gas natural|propano/i
    );
    expect(allText).not.toMatch(
      /certific|repuestos originales|garantizamos|garantía|su aliado/i
    );
  });

  it('uses catalog image descriptions instead of claiming a technician is working', () => {
    services.forEach(({ data }) => {
      expect(data.heroImage.alt).not.toMatch(
        /técnico reparando|instalación profesional/i
      );
      expect(data.heroImage.alt.length).toBeGreaterThan(10);
    });
  });

  it('links every blog article contextually to its related service', () => {
    const expectedLinks: Record<string, string> = {
      'por-que-tu-aire-acondicionado-no-enfria-bien.md':
        '/servicios/aire-acondicionado/',
      '5-errores-comunes-al-usar-lavadoras-y-como-evitarlos.md':
        '/servicios/lavadoras/',
      'como-saber-si-tu-nevera-necesita-mantenimiento.md':
        '/servicios/neveras/',
    };

    Object.entries(expectedLinks).forEach(([filename, href]) => {
      const article = readFileSync(join(BLOG_DIR, filename), 'utf-8');
      expect(article).toContain(`](${href})`);
    });
  });
});
