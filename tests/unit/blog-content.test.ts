import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';

const BLOG_DIR = join(process.cwd(), 'src/content/blog');
const posts = readdirSync(BLOG_DIR)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const source = readFileSync(join(BLOG_DIR, file), 'utf8');
    const { content, data } = matter(source);

    return {
      slug: file.replace(/\.md$/, ''),
      content,
      data,
    };
  });

const slugsPropuesta = [
  'por-que-tu-aire-acondicionado-no-enfria-bien',
  'fallas-de-lavadora-cuando-solicitar-revision',
  'mantenimiento-de-lavadoras-habitos-y-senales',
  'cuando-programar-mantenimiento-de-aire-acondicionado',
  'como-saber-si-tu-nevera-necesita-mantenimiento',
  'reparacion-aire-acondicionado-diagnostico-en-cali',
  'fallas-de-calentador-cuando-solicitar-revision',
  'antes-de-instalar-aire-acondicionado-en-cali',
  'instalacion-de-calentadores-que-se-revisa-antes-de-cotizar',
];

describe('contenido del blog', () => {
  it('usa títulos únicos y descripciones menores de 160 caracteres', () => {
    const titulos = posts.map((post) => post.data.title);

    expect(new Set(titulos).size).toBe(titulos.length);
    for (const post of posts) {
      expect(post.data.description.length).toBeLessThan(160);
    }
  });

  it.each(slugsPropuesta)(
    '%s tiene extensión, FAQ, WhatsApp y enlace temprano al servicio',
    (slug) => {
      const post = posts.find((entry) => entry.slug === slug);

      expect(post).toBeDefined();
      if (!post) return;

      const palabras = post.content
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .match(/[A-Za-zÀ-ÿ0-9]+/g)?.length;
      const primerParrafo = post.content.trim().split(/\n\s*\n/)[0];
      const rutaServicio = `/servicios/${post.data.relatedService}/`;

      expect(palabras).toBeGreaterThanOrEqual(700);
      expect(palabras).toBeLessThanOrEqual(1100);
      expect(post.data.description.length).toBeLessThan(160);
      expect(primerParrafo).toContain(rutaServicio);
      expect(post.content).toContain('## Preguntas frecuentes');
      expect(post.content).toContain('wa.me/573016963313');
    }
  );

  it.each(slugsPropuesta)('%s respeta las reglas editoriales', (slug) => {
    const post = posts.find((entry) => entry.slug === slug);

    expect(post).toBeDefined();
    if (!post) return;

    const texto = post.content.toLowerCase();
    expect(texto).not.toMatch(
      /descubra|su aliado|soluciones integrales|garant[ií]a|!/i
    );
    expect(texto).not.toMatch(/\b(?:yo|nosotros|nuestro|nuestra)\b/);
    expect(post.content).not.toMatch(
      /\b(?:LG|Samsung|Whirlpool|Haceb|Challenger)\b/
    );
  });
});
