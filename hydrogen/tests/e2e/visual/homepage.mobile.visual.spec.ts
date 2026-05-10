import {test, expect} from '@playwright/test';
import {expectNoHorizontalScroll, setupMobile} from './_mobile-helpers';

/**
 * Mobile visual capture for the Homepage.
 *
 * Goals (Phase 2):
 *  - Section headings scale via headingText() instead of hardcoded text-[32px]
 *  - Product carousels snap (snap-x snap-mandatory) on touch
 *  - Promo carousel slides reflow vertically on phones (was 50% width with
 *    text-[80px] heading — unreadable at 390px before this phase)
 *  - No horizontal page scroll
 */
test.describe('Homepage — Mobile Visual', () => {
  test.beforeEach(async ({page}) => {
    await setupMobile(page);
  });

  test('full page snapshot', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage-mobile-full.png', {
      fullPage: true,
    });
    await expectNoHorizontalScroll(page);
  });

  test('hero region renders without overflow', async ({page}) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hero = page.locator('[aria-roledescription="carousel"]').first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot('homepage-hero.png');
    await expectNoHorizontalScroll(page);
  });

  test('promo carousel slide is wider than viewport-half on mobile', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Promo slides only render if metaobjects exist; skip silently otherwise
    // so the spec doesn't fail on a fresh store.
    const promoSlides = page.locator('[class*="min-w-[88%]"]');
    const count = await promoSlides.count();
    test.skip(count === 0, 'no promotion metaobjects in this store');

    const first = promoSlides.first();
    const box = await first.boundingBox();
    expect(box, 'promo slide should have a bounding box').not.toBeNull();
    // Slide should be at least 80% of the 390px viewport so its
    // text-[56px] heading is actually readable.
    expect(box!.width).toBeGreaterThan(312);
  });
});
