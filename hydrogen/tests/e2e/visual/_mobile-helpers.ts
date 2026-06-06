import {expect, type Page} from '@playwright/test';

export const MOBILE_VIEWPORT = {width: 390, height: 844} as const;

/**
 * Prepare a page for mobile visual capture: set the iPhone-12-equivalent
 * viewport, neutralize animations/transitions, and pin `prefers-reduced-motion`
 * so snapshots are deterministic across runs.
 */
export async function setupMobile(page: Page) {
  await page.setViewportSize({...MOBILE_VIEWPORT});
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
}

/**
 * Assert the document does not introduce horizontal scroll at the current
 * viewport. Common failure modes (fixed pixel widths, overflowing absolute
 * positioning) all manifest as `scrollWidth > clientWidth` on the documentElement.
 */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(
    overflow,
    `expected no horizontal scroll at viewport, got ${overflow}px overflow`,
  ).toBeLessThanOrEqual(0);
}
