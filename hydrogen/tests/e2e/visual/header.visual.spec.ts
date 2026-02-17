import {test, expect} from '@playwright/test';
import path from 'node:path';

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

/**
 * Visual comparison tests for the Header component.
 *
 * Captures screenshots at the same viewport width (1440px) as the Figma
 * design frame, enabling side-by-side comparison with the design reference.
 *
 * Usage:
 *   pnpm test:e2e -- tests/e2e/visual/header.visual.spec.ts --project=chromium
 *
 * Screenshots saved to: tests/e2e/visual/screenshots/
 * Compare with: pnpm compare:header
 */
test.describe('Header — Visual Capture', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test('alternate variant (non-homepage)', async ({page}) => {
    // Navigate to any non-homepage route to get the alternate header
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    await header.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'header-alternate.png'),
    });
  });

  test('homepage variant', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    await header.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'header-homepage.png'),
    });
  });

  test('mobile alternate variant', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    await header.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'header-alternate-mobile.png'),
    });
  });
});
