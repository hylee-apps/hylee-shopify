/**
 * Authentication Setup for E2E Tests
 *
 * This setup file logs into a test customer account and saves
 * the session state to .auth/customer.json for reuse across tests.
 *
 * Environment variables required:
 * - TEST_CUSTOMER_EMAIL: Test customer email address
 * - TEST_CUSTOMER_PASSWORD: Test customer password
 *
 * Usage:
 * 1. Create a test customer account in your Shopify store
 * 2. Set the environment variables
 * 3. Run tests - auth will be handled automatically
 */

import { test as setup, expect } from '@playwright/test';

const STORAGE_STATE = '.auth/customer.json';

setup('authenticate as customer', async ({ page }) => {
  // Get credentials from environment variables
  const email = process.env.TEST_CUSTOMER_EMAIL;
  const password = process.env.TEST_CUSTOMER_PASSWORD;

  if (!email || !password) {
    console.warn(
      '⚠️  TEST_CUSTOMER_EMAIL and TEST_CUSTOMER_PASSWORD environment variables are required.'
    );
    console.warn('   Skipping authentication setup. Tests requiring auth will fail.');
    console.warn('   Set these variables in your .env file or CI configuration.');

    // Create empty auth file to prevent test failures
    await page.context().storageState({ path: STORAGE_STATE });
    return;
  }

  // Navigate to login page
  await page.goto('/account/login');

  // Wait for login form to be visible
  await expect(page.locator('form[action*="/account/login"]')).toBeVisible();

  // Fill in credentials
  await page.fill('input[name="customer[email]"]', email);
  await page.fill('input[name="customer[password]"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for successful login - should redirect to /account
  await expect(page).toHaveURL(/\/account(?!\/login)/);

  // Verify we're logged in by checking for account-specific content
  await expect(
    page.locator('[data-customer-dashboard], .customer-dashboard, h1:has-text("Your Account")')
  ).toBeVisible({ timeout: 10000 });

  // Save storage state for reuse
  await page.context().storageState({ path: STORAGE_STATE });

  console.log('✅ Authentication successful - session saved to', STORAGE_STATE);
});

setup('verify auth file exists', async ({ page }) => {
  // This is a sanity check to ensure the auth file was created
  // It runs after the authentication setup
  const fs = await import('fs');
  const path = await import('path');

  const authPath = path.resolve(STORAGE_STATE);

  if (!fs.existsSync(authPath)) {
    console.error('❌ Auth file not created:', authPath);
    throw new Error('Authentication setup failed - no storage state file');
  }

  const stats = fs.statSync(authPath);
  if (stats.size < 10) {
    console.warn('⚠️  Auth file is nearly empty - authentication may have failed');
  } else {
    console.log('✅ Auth file verified:', authPath, `(${stats.size} bytes)`);
  }
});
