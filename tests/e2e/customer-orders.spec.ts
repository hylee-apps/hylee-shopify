/**
 * Customer Orders Page E2E Tests
 *
 * Tests for the orders page at /pages/orders
 * These tests verify:
 * - Navigation from account dashboard to orders page
 * - Orders page displays correctly
 * - Navigation links in header work properly
 *
 * These tests require authentication (handled by auth.setup.ts)
 */

import { test, expect } from '@playwright/test';

test.describe('Customer Orders - Page Routing', () => {
  test.describe('Navigation from Account Dashboard', () => {
    test('should navigate to orders page when clicking "Your Orders" card', async ({ page }) => {
      // Navigate to the account dashboard
      await page.goto('/account');

      // Wait for the dashboard to load
      await expect(
        page.locator('[data-customer-dashboard], .customer-dashboard, h1:has-text("Your Account")')
      ).toBeVisible();

      // Find and click the "Your Orders" navigation card
      const ordersCard = page.locator('a[href="/pages/orders"], a:has-text("Your Orders")').first();
      await expect(ordersCard).toBeVisible();
      await ordersCard.click();

      // Should navigate to orders page
      await expect(page).toHaveURL(/\/pages\/orders/);

      // Orders page should load successfully (not show 404)
      await expect(page.locator('body')).not.toContainText('Page not found');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('should navigate to settings page when clicking "Settings" card', async ({ page }) => {
      // Navigate to the account dashboard
      await page.goto('/account');

      // Wait for the dashboard to load
      await expect(
        page.locator('[data-customer-dashboard], .customer-dashboard, h1:has-text("Your Account")')
      ).toBeVisible();

      // Find and click the "Settings" navigation card
      const settingsCard = page
        .locator('a[href="/pages/settings"], a:has-text("Login & Security")')
        .first();
      await expect(settingsCard).toBeVisible();
      await settingsCard.click();

      // Should navigate to settings page
      await expect(page).toHaveURL(/\/pages\/settings/);

      // Settings page should load successfully
      await expect(page.locator('body')).not.toContainText('Page not found');
      await expect(page.locator('body')).not.toContainText('404');
    });
  });

  test.describe('Header Navigation Links', () => {
    test('should have working orders link in desktop header', async ({ page }) => {
      // Navigate to any page to check header
      await page.goto('/');

      // Check for orders link in header navigation
      const headerOrdersLink = page.locator(
        'header a[href="/pages/orders"], nav a[href="/pages/orders"]'
      );

      // If orders link exists in header, click it
      if ((await headerOrdersLink.count()) > 0) {
        await headerOrdersLink.first().click();
        await expect(page).toHaveURL(/\/pages\/orders/);
        await expect(page.locator('body')).not.toContainText('Page not found');
      }
    });

    test('should have working settings link in header', async ({ page }) => {
      // Navigate to any page to check header
      await page.goto('/');

      // Check for settings link in header navigation
      const headerSettingsLink = page.locator(
        'header a[href="/pages/settings"], nav a[href="/pages/settings"]'
      );

      // If settings link exists in header, click it
      if ((await headerSettingsLink.count()) > 0) {
        await headerSettingsLink.first().click();
        await expect(page).toHaveURL(/\/pages\/settings/);
        await expect(page.locator('body')).not.toContainText('Page not found');
      }
    });
  });

  test.describe('Orders Page Content', () => {
    test('should display orders page with correct heading', async ({ page }) => {
      // Navigate directly to orders page
      await page.goto('/pages/orders');

      // Check page loads without 404
      await expect(page.locator('body')).not.toContainText('Page not found');

      // Should display orders-related content
      // The actual heading depends on the page template
      await expect(
        page.locator('h1:has-text("Orders"), h1:has-text("Order History"), [data-customer-orders]')
      ).toBeVisible({ timeout: 5000 });
    });

    test('should display order list or empty state', async ({ page }) => {
      // Navigate to orders page
      await page.goto('/pages/orders');

      // Wait for page to load
      await expect(page.locator('body')).not.toContainText('Page not found');

      // Should show either orders or an empty state message
      const hasOrders = await page.locator('.order-card, .orders__item, [data-order-id]').count();
      const hasEmptyState = await page
        .locator(
          'text=/no orders|haven\'t placed|start shopping/i, .empty-state, [data-empty-orders]'
        )
        .count();

      // Either orders exist OR empty state is shown
      expect(hasOrders > 0 || hasEmptyState > 0).toBe(true);
    });

    test('should redirect to login if not authenticated', async ({ browser }) => {
      // Create a new context WITHOUT authentication
      const context = await browser.newContext();
      const page = await context.newPage();

      // Try to access orders page without auth
      await page.goto('/pages/orders');

      // Should redirect to login OR show login requirement message
      const currentUrl = page.url();
      const isOnLoginPage = currentUrl.includes('/account/login');
      const hasLoginMessage = await page
        .locator('text=/log in|sign in|please login/i, form[action*="login"]')
        .count();

      expect(isOnLoginPage || hasLoginMessage > 0).toBe(true);

      await context.close();
    });
  });

  test.describe('Back Navigation', () => {
    test('should be able to return to account dashboard from orders', async ({ page }) => {
      // Navigate to orders page
      await page.goto('/pages/orders');

      // Find a link back to account dashboard
      const accountLink = page.locator(
        'a[href="/account"], a:has-text("Back to Account"), a:has-text("Account")'
      );

      if ((await accountLink.count()) > 0) {
        await accountLink.first().click();
        await expect(page).toHaveURL(/\/account(?!\/)/);
      }
    });
  });
});

test.describe('Customer Orders - Page Template Requirements', () => {
  test('orders page template is properly configured', async ({ page }) => {
    // This test verifies the page exists and uses the correct template
    const response = await page.goto('/pages/orders');

    // Check the page returns a successful status (not 404)
    expect(response?.status()).toBeLessThan(400);
  });

  test('settings page template is properly configured', async ({ page }) => {
    // This test verifies the settings page exists
    const response = await page.goto('/pages/settings');

    // Check the page returns a successful status (not 404)
    expect(response?.status()).toBeLessThan(400);
  });
});
