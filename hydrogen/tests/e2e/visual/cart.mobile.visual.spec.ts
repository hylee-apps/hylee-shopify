import {test, expect} from '@playwright/test';
import {expectNoHorizontalScroll, setupMobile} from './_mobile-helpers';

/**
 * Mobile visual capture for the Cart page.
 *
 * Phase 5 changes covered:
 *  - Layout stacks (flex-col lg:flex-row) so the sidebar drops below the
 *    main content on phones; the desktop OrderSummary is hidden via lg:flex
 *    and replaced by the MobileSummaryDrawer.
 *  - StickyBottomBar pinned at the bottom shows total + Checkout CTA;
 *    tapping the total opens a bottom Sheet with the full summary body.
 *  - Page wrapper has pb-24 lg:pb-8 so content isn't hidden behind the bar.
 *
 * Tests add a product to the cart at runtime so they work against any
 * seeded store. They self-skip if the storefront has no purchasable
 * inventory (which would make the Add-to-Cart fail).
 */
async function addFirstProductToCart(page: import('@playwright/test').Page) {
  await page.goto('/collections/all');
  await page.waitForLoadState('networkidle');
  await page.locator('main a[href^="/products/"]').first().click();
  await page.waitForLoadState('networkidle');

  const addToCart = page.getByRole('button', {name: /add to cart/i}).first();
  await expect(addToCart).toBeVisible();
  await addToCart.click();
  // Hydrogen optimistically updates the cart; give it a tick for the
  // success state to settle before navigating.
  await page.waitForTimeout(500);
}

test.describe('Cart — Mobile Visual', () => {
  test.beforeEach(async ({page}) => {
    await setupMobile(page);
  });

  test('empty cart at 390px', async ({page}) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('cart-empty-mobile.png', {
      fullPage: true,
    });
    await expectNoHorizontalScroll(page);
  });

  test('populated cart — sticky bar visible, sidebar hidden', async ({
    page,
  }) => {
    await addFirstProductToCart(page);
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Skip if the add-to-cart didn't take (e.g. no inventory in fixture store).
    const empty = page.getByText(/your cart is empty/i);
    test.skip(await empty.isVisible(), 'cart could not be populated');

    // Desktop sticky sidebar is `hidden lg:flex` — it stays in the DOM with
    // display:none, so we assert visibility (not DOM count). Both the
    // desktop sidebar h3 AND the mobile drawer's h3 say "Order Summary";
    // we want zero VISIBLE matches at 390px (drawer is closed, sidebar is
    // display:none).
    const summaryTitles = page.getByRole('heading', {name: /order summary/i});
    const titleCount = await summaryTitles.count();
    for (let i = 0; i < titleCount; i++) {
      await expect(summaryTitles.nth(i)).toBeHidden();
    }

    // Sticky bottom bar should be present with a Checkout CTA.
    const checkoutCta = page.getByRole('link', {name: /checkout/i}).last();
    await expect(checkoutCta).toBeVisible();
    const ctaBox = await checkoutCta.boundingBox();
    expect(ctaBox!.height).toBeGreaterThanOrEqual(44);

    await expect(page).toHaveScreenshot('cart-populated-mobile.png', {
      fullPage: true,
    });
    await expectNoHorizontalScroll(page);
  });

  test('summary drawer opens on Total tap', async ({page}) => {
    await addFirstProductToCart(page);
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const empty = page.getByText(/your cart is empty/i);
    test.skip(await empty.isVisible(), 'cart could not be populated');

    // The Total button is inside the sticky bottom bar (data-slot=
    // sticky-bottom-bar). Scope the locator to that bar so we don't pick
    // up the desktop sidebar's "Order Summary" heading on viewports that
    // momentarily render both.
    const stickyBar = page.locator('[data-slot="sticky-bottom-bar"]');
    await expect(stickyBar).toBeVisible();
    const totalButton = stickyBar.getByRole('button', {
      name: /summary|total/i,
    });
    // .click() instead of .tap() — Playwright's tap requires touch-event
    // synthesis that occasionally times out under reduced-motion, while
    // click triggers the same React onClick handler with looser timing.
    await totalButton.click();

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveScreenshot('cart-summary-drawer-open.png');
  });
});
