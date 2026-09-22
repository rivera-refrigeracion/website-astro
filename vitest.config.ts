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
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '.astro/', 'tests/'],
    },
  },
});
