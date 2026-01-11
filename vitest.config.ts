import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test file patterns
    include: ['tests/components/**/*.{test,spec}.{js,ts}'],
    
    // Exclude patterns
    exclude: ['node_modules', 'theme', 'tests/e2e'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'tests/**',
        'theme/**',
        '*.config.*',
      ],
    },
    
    // Global test timeout
    testTimeout: 10000,
    
    // Watch mode settings
    watch: false,
    
    // Reporter
    reporter: 'verbose',
  },
});
