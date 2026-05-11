import {test, expect} from '@playwright/test';
import {expectNoHorizontalScroll, setupMobile} from './_mobile-helpers';

/**
 * Mobile visual capture for the Product Detail Page (PDP).
 *
 * Phase 4 changes covered:
 *  - 3-col grid reorders to gallery → purchase → info on mobile via order-*
 *  - ProductGallery vertical layout flips to horizontal-thumbs-below on <md
 *    with aspect-square main image (no fixed 480px on phones)
 *  - StickyMobileCTA appears once the in-page Add-to-Cart scrolls out of view
 *  - QuantitySelector md size bumped to 44×44 (Apple HIG)
 *
 * Tests pick the first product link off the homepage at runtime so the spec
 * works against any seeded store.
 */
async function gotoFirstProduct(page: import('@playwright/test').Page) {
  await page.goto('/collections/all');
  await page.waitForLoadState('networkidle');
  const firstProduct = page.locator('main a[href^="/products/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();
  await page.waitForLoadState('networkidle');
}

test.describe('PDP — Mobile Visual', () => {
  test.beforeEach(async ({page}) => {
    await setupMobile(page);
  });

  test('top of page: gallery + purchase visible above the fold', async ({
    page,
  }) => {
    await gotoFirstProduct(page);

    const gallery = page.getByRole('region').first();
    await expect(gallery).toBeVisible();
    await expect(page).toHaveScreenshot('pdp-mobile-top.png', {
      fullPage: false,
    });
    await expectNoHorizontalScroll(page);
  });

  test('purchase panel renders before info accordion on mobile', async ({
    page,
  }) => {
    await gotoFirstProduct(page);

    const addToCart = page.getByRole('button', {name: /add to cart/i}).first();
    const detailsHeading = page.locator('h2', {hasText: /key item features/i});

    await expect(addToCart).toBeVisible();
    const ctaBox = await addToCart.boundingBox();
    expect(ctaBox).not.toBeNull();

    if (await detailsHeading.count()) {
      const accordionBox = await detailsHeading.first().boundingBox();
      expect(accordionBox).not.toBeNull();
      // On mobile (<md), the purchase panel (order-2) sits above the
      // accordion column (order-3). Y of CTA should be smaller.
      expect(ctaBox!.y).toBeLessThan(accordionBox!.y);
    }
  });

  test('sticky mobile CTA appears after scrolling past in-page CTA', async ({
    page,
  }) => {
    await gotoFirstProduct(page);

    // Initially the sticky bar should be hidden (in-page CTA is in view).
    const stickyBar = page.getByTestId('sticky-mobile-cta');
    await expect(stickyBar).toHaveCount(0);

    // Scroll all the way to the bottom — the in-page Add-to-Cart row sits
    // in the purchase panel near the top of the page, so any meaningful
    // scroll past it should fire the IntersectionObserver. Using
    // scrollHeight instead of a fixed pixel value handles short PDPs.
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for the bar to mount rather than relying on a fixed sleep —
    // IntersectionObserver fires async, and Chromium emulation timing
    // varies. The default expect timeout (5000ms) is plenty.
    await expect(stickyBar).toBeVisible();
    await expect(stickyBar).toHaveScreenshot('pdp-sticky-cta.png');
  });

  test('quantity selector buttons meet 44px tap target', async ({page}) => {
    await gotoFirstProduct(page);

    const decrement = page.getByRole('button', {name: /decrease/i}).first();
    const increment = page.getByRole('button', {name: /increase/i}).first();
    await expect(decrement).toBeVisible();

    const dec = await decrement.boundingBox();
    const inc = await increment.boundingBox();
    expect(dec!.height).toBeGreaterThanOrEqual(44);
    expect(dec!.width).toBeGreaterThanOrEqual(44);
    expect(inc!.height).toBeGreaterThanOrEqual(44);
    expect(inc!.width).toBeGreaterThanOrEqual(44);
  });
});
