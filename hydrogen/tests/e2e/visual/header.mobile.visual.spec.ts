import {test, expect} from '@playwright/test';
import {expectNoHorizontalScroll, setupMobile} from './_mobile-helpers';

/**
 * Mobile visual capture for the Header component.
 *
 * Baselines live under tests/e2e/visual/screenshots/<projectName>/ via the
 * snapshotPathTemplate set in playwright.config.ts, so chromium and
 * mobile-chrome snapshots don't collide.
 *
 * Usage:
 *   pnpm visual:mobile -- tests/e2e/visual/header.mobile.visual.spec.ts
 *   pnpm visual:mobile --update-snapshots   # regenerate baselines
 */
test.describe('Header — Mobile Visual', () => {
  test.beforeEach(async ({page}) => {
    await setupMobile(page);
  });

  test('alternate variant — closed', async ({page}) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot('header-alternate-closed.png');
    await expectNoHorizontalScroll(page);
  });

  test('home variant — closed', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot('header-home-closed.png');
    await expectNoHorizontalScroll(page);
  });

  test('mobile menu Sheet opens on hamburger tap', async ({page}) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', {name: /menu/i}).first().tap();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveScreenshot('mobile-menu-open.png');
  });

  test('mobile search Sheet opens on search tap', async ({page}) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', {name: /search/i})
      .first()
      .tap();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    // Input inside the sheet should be focusable for typing.
    await expect(sheet.locator('input').first()).toBeVisible();
    await expect(sheet).toHaveScreenshot('mobile-search-open.png');
  });

  test('hamburger button meets 44px tap target', async ({page}) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    const hamburger = page.getByRole('button', {name: /menu/i}).first();
    const box = await hamburger.boundingBox();
    expect(box, 'hamburger should render a bounding box').not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
