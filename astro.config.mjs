// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { visualizer } from 'rollup-plugin-visualizer';

// https://astro.build/config
export default defineConfig({
  site: 'https://rivera-refrigeracion.com',

  vite: {
    plugins: [
      tailwindcss(),
      visualizer({
        open: true,
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
