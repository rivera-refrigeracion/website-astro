import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Los alias de tsconfig.json: sin esto vitest no resuelve los imports de
  // src/ que siguen la convención del proyecto (@/lib/...).
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      all: true,
      // Vitest mide módulos JS/TS; las plantillas Astro se validan en E2E.
      include: ['src/**/*.js', 'src/**/*.ts'],
      reporter: ['text', 'json', 'html'],
      // Astro compila las rutas API; Vitest no instrumenta su sintaxis de entrada.
      exclude: ['node_modules/', 'dist/', '.astro/', 'tests/', 'src/pages/'],
      thresholds: {
        statements: 40,
        branches: 40,
        functions: 40,
        lines: 40,
      },
    },
  },
});
