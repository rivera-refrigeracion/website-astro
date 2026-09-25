// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://astro.build/config
export default defineConfig({
  site: 'https://rivera-refrigeracion.com',

  markdown: {
    processor: unified(),
  },

  vite: {
    plugins: [
      tailwindcss(),
      visualizer({
        open: false,
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  },

  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-CO',
        },
      },
    }),
  ],

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // Las imágenes del Markdown de los artículos salían a su tamaño original
  // (1024 px) sin srcset. Con layout 'constrained' Astro genera los anchos
  // intermedios; los componentes que ya fijan widths/densities no cambian.
  image: {
    layout: 'constrained',
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },

  // Todo el CSS va en línea: son unos 6 KiB comprimidos y como hoja externa
  // era la única petición que bloqueaba el primer pintado.
  build: {
    inlineStylesheets: 'always',
  },

  compressHTML: true,
});
