import {defineConfig, devices} from '@playwright/test';

/**
 * Playwright configuration for Hydrogen E2E tests.
 *
 * This config targets the Hydrogen dev server (MiniOxygen).
 * Run: `pnpm --filter hydrogen test:e2e`
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', {outputFolder: 'playwright-report'}], ['list']],

  use: {
    // Hydrogen dev server runs on port 3000 by default
    baseURL: process.env.HYDROGEN_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
    },

    // Mobile
    {
      name: 'mobile-chrome',
      use: {...devices['Pixel 5']},
    },
    {
      name: 'mobile-safari',
      use: {...devices['iPhone 12']},
    },
  ],

  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  outputDir: 'test-results/',

  // Start Hydrogen dev server automatically
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
