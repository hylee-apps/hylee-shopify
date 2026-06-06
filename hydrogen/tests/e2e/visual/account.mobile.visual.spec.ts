import {test, expect} from '@playwright/test';
import {expectNoHorizontalScroll, setupMobile} from './_mobile-helpers';

/**
 * Mobile visual capture for the Account section.
 *
 * Phase 7 changes covered:
 *  - AccountSidebar: desktop sidebar already `hidden lg:flex`, mobile Sheet
 *    drawer already in place; this phase bumps the menu trigger to 44px.
 *  - OrderCard header padding tightens on phones (px-4 sm:px-[24px]) and
 *    the metadata row gap drops (gap-x-4 sm:gap-x-6) so order cards stop
 *    overflowing at 390px.
 *  - ContactCard edit/delete buttons: 32px on desktop (Figma spec) but
 *    bumped to 44px on phones via `tap-target sm:size-8 sm:min-h-0 sm:min-w-0`.
 *
 * Account routes require an authenticated customer. Most assertions skip
 * if the test environment is anonymous (login redirect).
 */
function isLoginRedirect(page: import('@playwright/test').Page) {
  return /\/account\/login/.test(new URL(page.url()).pathname);
}

test.describe('Account — Mobile Visual', () => {
  test.beforeEach(async ({page}) => {
    await setupMobile(page);
  });

  test('login route renders without horizontal scroll', async ({page}) => {
    await page.goto('/account/login');
    await page.waitForLoadState('networkidle');
    await expectNoHorizontalScroll(page);
    await expect(page).toHaveScreenshot('account-login-mobile.png', {
      fullPage: true,
    });
  });

  test('account dashboard mobile menu opens', async ({page}) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    test.skip(
      isLoginRedirect(page),
      'account routes require authenticated customer',
    );

    // Sidebar Sheet trigger button.
    const menuButton = page.getByRole('button', {name: /menu/i}).first();
    await expect(menuButton).toBeVisible();

    // 44px tap target floor.
    const box = await menuButton.boundingBox();
    expect(box, 'menu button should render').not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await menuButton.tap();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveScreenshot('account-sidebar-drawer-open.png');
  });

  test('orders list — no horizontal scroll, OrderCard header fits', async ({
    page,
  }) => {
    await page.goto('/account/orders');
    await page.waitForLoadState('networkidle');
    test.skip(
      isLoginRedirect(page),
      'account routes require authenticated customer',
    );

    await expectNoHorizontalScroll(page);
    await expect(page).toHaveScreenshot('account-orders-mobile.png', {
      fullPage: true,
    });
  });

  test('addresses page renders without horizontal scroll', async ({page}) => {
    await page.goto('/account/addresses');
    await page.waitForLoadState('networkidle');
    test.skip(
      isLoginRedirect(page),
      'account routes require authenticated customer',
    );

    await expectNoHorizontalScroll(page);
    // ContactCard action buttons should be ≥44px on mobile when present.
    const editButtons = page.getByRole('button', {name: /edit/i});
    const editCount = await editButtons.count();
    if (editCount > 0) {
      const box = await editButtons.first().boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  });
});
