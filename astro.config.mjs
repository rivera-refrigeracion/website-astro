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

  build: {
    inlineStylesheets: 'auto',
  },

  compressHTML: true,
});
