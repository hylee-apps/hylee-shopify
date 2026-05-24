import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    include: [
      'scripts/__tests__/**/*.{test,spec}.{ts,js}',
    ],

    exclude: ['node_modules', 'tests/e2e'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['node_modules/**', 'tests/**', '*.config.*'],
    },

    // Don't fail when no test files exist yet
    passWithNoTests: true,

    // Global test timeout
    testTimeout: 10000,

    // Watch mode settings
    watch: false,

    // Reporter
    reporter: 'verbose',
  },
});
