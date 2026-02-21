import {test, expect} from '@playwright/test';

/**
 * Account route smoke tests.
 *
 * These tests verify account pages redirect to login when unauthenticated.
 * Full authenticated tests require Customer Account API OAuth setup.
 */
test.describe('Account (unauthenticated)', () => {
  test('account dashboard redirects to login', async ({page}) => {
    await page.goto('/account');
    // Should redirect to Customer Account API login
    await expect(page).not.toHaveURL('/account');
  });

  test('account orders redirects to login', async ({page}) => {
    await page.goto('/account/orders');
    await expect(page).not.toHaveURL('/account/orders');
  });

  test('account addresses redirects to login', async ({page}) => {
    await page.goto('/account/addresses');
    await expect(page).not.toHaveURL('/account/addresses');
  });

  test('account settings redirects to login', async ({page}) => {
    await page.goto('/account/settings');
    await expect(page).not.toHaveURL('/account/settings');
  });

  test('logout endpoint redirects', async ({page}) => {
    const response = await page.goto('/account/logout');
    // GET to logout should redirect
    expect(response?.status()).toBeLessThan(400);
  });
});
