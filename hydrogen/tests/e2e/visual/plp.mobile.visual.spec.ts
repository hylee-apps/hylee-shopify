import {test, expect} from '@playwright/test';
import {expectNoHorizontalScroll, setupMobile} from './_mobile-helpers';

/**
 * Mobile visual capture for the Product List Page (PLP).
 *
 * Covers both layouts driven by collections.$handle.tsx:
 *  - End-node (leaf collection): card sidebar (hidden on <lg), filter Sheet,
 *    2-col product grid with tightened gap-3 on phones.
 *  - Category (has subcollections): SubcategoryScrollSection + 2-col grid.
 *
 * The Filters button (lg:hidden) opens the existing FilterSidebar Sheet
 * (which already implements the mobile-drawer pattern via shadcn Sheet).
 */
test.describe('PLP — Mobile Visual', () => {
  test.beforeEach(async ({page}) => {
    await setupMobile(page);
  });

  test('end-node collection — closed', async ({page}) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('plp-end-node-mobile.png', {
      fullPage: true,
    });
    await expectNoHorizontalScroll(page);
  });

  test('end-node collection — Filters Sheet opens on tap', async ({page}) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    const filtersButton = page.getByRole('button', {name: /filters/i});
    await expect(filtersButton).toBeVisible();

    const box = await filtersButton.boundingBox();
    expect(box, 'filters button should render').not.toBeNull();
    // Mobile-only floor — desktop matches Figma at ~37px.
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await filtersButton.tap();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveScreenshot('plp-filter-sheet-open.png');
  });

  test('product grid uses 2 columns on mobile with tightened gap', async ({
    page,
  }) => {
    await page.goto('/collections/all');
    await page.waitForLoadState('networkidle');

    // Each ProductCard renders as an `<article>` (one per card). The previous
    // selector `main a[href^="/products/"]` matched two links per card (image
    // overlay + title hover link), so nth(0) and nth(1) were both inside the
    // SAME card, giving a false 186px y-diff.
    const cards = page.locator('main article');
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    test.skip(count < 2, 'collection has fewer than 2 products');

    const firstBox = await cards.nth(0).boundingBox();
    const secondBox = await cards.nth(1).boundingBox();
    expect(firstBox && secondBox).toBeTruthy();
    // Two cards on the same row → second card's y is ~equal to first card's y.
    expect(Math.abs(firstBox!.y - secondBox!.y)).toBeLessThan(8);
  });
});
