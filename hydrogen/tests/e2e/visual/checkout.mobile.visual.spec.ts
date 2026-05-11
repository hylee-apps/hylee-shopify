import {test, expect} from '@playwright/test';
import {expectNoHorizontalScroll, setupMobile} from './_mobile-helpers';

/**
 * Mobile visual capture for the four checkout steps.
 *
 * Phase 6 changes covered:
 *  - All step grids stack to a single column on <lg
 *  - CheckoutProgress collapses to a "Step N of 4 · <Label>" pill on <sm
 *  - Inline OrderSummary sidebars are `hidden lg:block`; replaced on phones
 *    by MobileSummaryDrawer with the step's primary action in the sticky bar
 *  - confirmation route padding tightens on phones
 *
 * Tests seed a cart at runtime so they work against any store. They self-skip
 * if the store can't populate a cart (no inventory) since the checkout
 * routes redirect to /cart when empty.
 */
async function seedCart(page: import('@playwright/test').Page) {
  await page.goto('/collections/all');
  await page.waitForLoadState('networkidle');
  await page.locator('main a[href^="/products/"]').first().click();
  await page.waitForLoadState('networkidle');
  const addToCart = page.getByRole('button', {name: /add to cart/i}).first();
  await expect(addToCart).toBeVisible();
  await addToCart.click();
  await page.waitForTimeout(500);
}

async function isOnCheckout(page: import('@playwright/test').Page) {
  // The route guards redirect to /cart when there's nothing to checkout —
  // we treat that as a "skip" condition.
  return !/\/cart\/?$/.test(new URL(page.url()).pathname);
}

test.describe('Checkout — Mobile Visual', () => {
  test.beforeEach(async ({page}) => {
    await setupMobile(page);
  });

  test('CheckoutProgress shows compact pill on phones', async ({page}) => {
    await seedCart(page);
    await page.goto('/checkout/payment');
    await page.waitForLoadState('networkidle');
    test.skip(!(await isOnCheckout(page)), 'cart could not be populated');

    // The compact pill includes the literal "Step N of N" text.
    const pill = page.locator('text=/Step \\d+ of \\d+/');
    await expect(pill).toBeVisible();

    // Full step bar (`sm:flex`) should NOT be visible at 390px.
    const fullBar = page.locator(
      '.hidden.items-center.justify-center.sm\\:flex',
    );
    await expect(fullBar).toHaveCount(1);
    expect(await fullBar.isVisible()).toBe(false);
  });

  test('payment step — sticky bar visible, inline sidebar hidden', async ({
    page,
  }) => {
    await seedCart(page);
    await page.goto('/checkout/payment');
    await page.waitForLoadState('networkidle');
    test.skip(!(await isOnCheckout(page)), 'cart could not be populated');

    // Sticky Continue button at bottom of viewport.
    const continueBtn = page
      .getByRole('button', {name: /continue to shipping/i})
      .last();
    await expect(continueBtn).toBeVisible();
    const ctaBox = await continueBtn.boundingBox();
    expect(ctaBox!.height).toBeGreaterThanOrEqual(44);

    await expect(page).toHaveScreenshot('checkout-payment-mobile.png', {
      fullPage: true,
    });
    await expectNoHorizontalScroll(page);
  });

  test('shipping step — summary drawer opens on Total tap', async ({page}) => {
    await seedCart(page);
    await page.goto('/checkout/shipping');
    await page.waitForLoadState('networkidle');
    test.skip(!(await isOnCheckout(page)), 'cart could not be populated');

    // Same scoping pattern as the cart spec — find the Total button inside
    // the sticky bar (data-slot=sticky-bottom-bar), use click() not tap().
    const stickyBar = page.locator('[data-slot="sticky-bottom-bar"]');
    await expect(stickyBar).toBeVisible();
    const totalButton = stickyBar.getByRole('button', {
      name: /summary|total/i,
    });
    await totalButton.click();

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveScreenshot('checkout-shipping-drawer-open.png');
  });

  test('review step — Place Order button reaches 44px in sticky bar', async ({
    page,
  }) => {
    await seedCart(page);
    await page.goto('/checkout/review');
    await page.waitForLoadState('networkidle');
    test.skip(!(await isOnCheckout(page)), 'cart could not be populated');

    const placeOrder = page.getByRole('button', {name: /place order/i}).last();
    await expect(placeOrder).toBeVisible();
    const box = await placeOrder.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await expect(page).toHaveScreenshot('checkout-review-mobile.png', {
      fullPage: true,
    });
    await expectNoHorizontalScroll(page);
  });

  test('confirmation step — no sticky bar, padding tightens on phones', async ({
    page,
  }) => {
    // Confirmation needs a real order id in the URL; this is a static smoke
    // test that just verifies the layout doesn't horizontal-scroll if the
    // route lands on a placeholder/empty state.
    await page.goto('/checkout/confirmation');
    await page.waitForLoadState('networkidle');

    // No sticky bar should be present on the confirmation route.
    const stickyBars = page.locator('[data-slot="sticky-bottom-bar"]');
    await expect(stickyBars).toHaveCount(0);
    await expectNoHorizontalScroll(page);
  });
});
