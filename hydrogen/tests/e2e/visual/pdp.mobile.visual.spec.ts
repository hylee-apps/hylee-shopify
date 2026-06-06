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

    // No screenshot — `gotoFirstProduct` picks whatever's first on
    // /collections/all, which varies with Shopify inventory order. The
    // gallery, price, and product title all shift between runs. Layout
    // is locked via the structural assertions below + manual visual
    // review in docs/MOBILE_ROLLOUT_TESTING_PLAN.md §4.1.
    const gallery = page.getByRole('region').first();
    await expect(gallery).toBeVisible();

    const addToCart = page.getByRole('button', {name: /add to cart/i}).first();
    await expect(addToCart).toBeVisible();
    const ctaBox = await addToCart.boundingBox();
    const viewportH = page.viewportSize()?.height ?? 844;
    // Verify the in-page Add-to-Cart sits ABOVE the fold on mobile —
    // that's the entire point of the Phase 4 child reorder.
    expect(ctaBox!.y).toBeLessThan(viewportH);

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

  test('sticky mobile CTA is mounted with observer wired up', async ({
    page,
  }) => {
    await gotoFirstProduct(page);

    // The StickyMobileCTA component always renders SOMETHING — either the
    // bar itself (when the in-page CTA is out of view) or an aria-hidden
    // sentinel div (when in view). Asserting the sentinel exists at page
    // load validates: (1) the component is mounted, (2) the inPageCtaRef
    // is wired through props, (3) the IntersectionObserver-driven
    // visibility logic starts in the correct hidden state.
    //
    // The actual scroll-driven visibility toggle is verified manually +
    // on real devices (see docs/MOBILE_ROLLOUT_TESTING_PLAN.md §10).
    // Playwright + IntersectionObserver behavior is flaky enough across
    // Chromium emulation viewports that we can't lock it in here without
    // false negatives on short PDPs.
    const sentinel = page.getByTestId('sticky-mobile-cta-sentinel');
    await expect(sentinel).toHaveCount(1);

    // And the visible bar should NOT be in the DOM at page load (the
    // in-page CTA is above the fold).
    const stickyBar = page.getByTestId('sticky-mobile-cta');
    await expect(stickyBar).toHaveCount(0);
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
