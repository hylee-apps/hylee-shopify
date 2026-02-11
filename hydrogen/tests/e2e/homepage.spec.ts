import {test, expect} from '@playwright/test';

/**
 * Hydrogen homepage smoke tests.
 *
 * Verifies the homepage loads and renders key sections.
 */
test.describe('Homepage', () => {
  test('loads successfully', async ({page}) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
  });

  test('displays hero search section', async ({page}) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {name: /welcome to our marketplace/i}),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/search for products/i)).toBeVisible();
  });

  test('displays featured categories', async ({page}) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {name: /shop by category/i}),
    ).toBeVisible();
  });

  test('displays featured products', async ({page}) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {name: /featured products/i}),
    ).toBeVisible();
  });

  test('displays new arrivals', async ({page}) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {name: /new arrivals/i}),
    ).toBeVisible();
  });

  test('displays why choose us section', async ({page}) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {name: /why shop with us/i}),
    ).toBeVisible();
  });

  test('displays newsletter section', async ({page}) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {name: /stay in the loop/i}),
    ).toBeVisible();
  });

  test('hero search navigates to search page', async ({page}) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder(/search for products/i);
    await searchInput.fill('shoes');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=shoes/);
  });
});
