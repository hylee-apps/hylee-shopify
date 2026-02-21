import {test, expect} from '@playwright/test';

/**
 * Navigation smoke tests.
 *
 * Verifies header, footer, and core navigation work.
 */
test.describe('Navigation', () => {
  test('header is visible', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  test('footer is visible', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });

  test('cart page loads', async ({page}) => {
    const response = await page.goto('/cart');
    expect(response?.status()).toBeLessThan(400);
  });

  test('collections page loads', async ({page}) => {
    const response = await page.goto('/collections');
    expect(response?.status()).toBeLessThan(400);
  });

  test('search page loads', async ({page}) => {
    const response = await page.goto('/search');
    expect(response?.status()).toBeLessThan(400);
  });

  test('policies page loads', async ({page}) => {
    const response = await page.goto('/policies');
    expect(response?.status()).toBeLessThan(400);
  });

  test('404 page for non-existent route', async ({page}) => {
    const response = await page.goto('/non-existent-page-xyz');
    expect(response?.status()).toBe(404);
  });
});
