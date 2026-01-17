import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '**/*.config.{js,ts}',
        '**/types.ts',
        '**/*.d.ts',
        'dist/',
        'public/',
        'e2e/',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '__mocks__/',
      ],
      // Measurement-only mode - no thresholds enforced
      // Uncomment below to enforce coverage thresholds in CI:
      // thresholds: {
      //   lines: 80,
      //   functions: 80,
      //   branches: 75,
      //   statements: 80,
      // },
    },
  },
});
