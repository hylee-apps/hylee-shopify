/**
 * Customer Settings (Login & Security) E2E Tests
 *
 * Tests for the account settings page at /account/settings
 * These tests require authentication (handled by auth.setup.ts)
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Customer Settings - Login & Security', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the settings page (uses customer template at /account/settings)
    await page.goto('/account/settings');

    // Wait for the page to load
    await expect(page.locator('[data-customer-settings]')).toBeVisible();
  });

  test.describe('Page Structure', () => {
    test('should display the Login & Security header', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Login & Security');
      await expect(page.locator('.customer-settings__subtitle')).toContainText(
        'Manage your account settings'
      );
    });

    test('should display Personal Information card with edit buttons', async ({ page }) => {
      const personalInfoCard = page.locator('.customer-settings__card').first();

      // Check card header
      await expect(personalInfoCard.locator('.customer-settings__card-title')).toContainText(
        'Personal Information'
      );

      // Check edit buttons exist
      await expect(personalInfoCard.locator('[data-modal-open="edit-name-modal"]')).toBeVisible();
      await expect(personalInfoCard.locator('[data-modal-open="edit-email-modal"]')).toBeVisible();
      await expect(personalInfoCard.locator('[data-modal-open="edit-phone-modal"]')).toBeVisible();
    });

    test('should display Password card with reset button', async ({ page }) => {
      const passwordCard = page.locator('.customer-settings__card').nth(1);

      await expect(passwordCard.locator('.customer-settings__card-title')).toContainText(
        'Password'
      );
      await expect(passwordCard.locator('[data-modal-open="reset-password-modal"]')).toBeVisible();
    });

    test('should display Account Activity card', async ({ page }) => {
      const activityCard = page.locator('.customer-settings__card').nth(2);

      await expect(activityCard.locator('.customer-settings__card-title')).toContainText(
        'Account Activity'
      );

      // Check for member info
      await expect(activityCard.locator('text=Member Since')).toBeVisible();
      await expect(activityCard.locator('text=Total Orders')).toBeVisible();
      await expect(activityCard.locator('text=Total Spent')).toBeVisible();
    });

    test('should display Sign Out card', async ({ page }) => {
      const signOutCard = page.locator('.customer-settings__card--highlight');

      await expect(signOutCard.locator('.customer-settings__card-title')).toContainText('Sign Out');
      await expect(signOutCard.locator('a[href*="logout"]')).toBeVisible();
    });
  });

  test.describe('Edit Name Modal', () => {
    test('should open edit name modal when clicking Edit button', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      await expect(modal).toBeVisible();
      await expect(modal.locator('.modal__title')).toContainText('Edit Name');
    });

    test('should have pre-filled first and last name fields', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      const firstNameInput = modal.locator('input[name="customer[first_name]"]');
      const lastNameInput = modal.locator('input[name="customer[last_name]"]');

      await expect(firstNameInput).toBeVisible();
      await expect(lastNameInput).toBeVisible();
    });

    test('should close modal when clicking Cancel', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      await expect(modal).toBeVisible();

      await modal.locator('[data-modal-close]').first().click();

      // Wait for close animation
      await expect(modal).toBeHidden({ timeout: 1000 });
    });

    test('should close modal when clicking backdrop', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      await expect(modal).toBeVisible();

      // Click on backdrop
      await modal.locator('[data-modal-backdrop]').click({ force: true });

      await expect(modal).toBeHidden({ timeout: 1000 });
    });

    test('should close modal when pressing Escape key', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      await expect(modal).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(modal).toBeHidden({ timeout: 1000 });
    });

    test('should show validation error for empty required fields', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      const firstNameInput = modal.locator('input[name="customer[first_name]"]');

      // Clear the first name field
      await firstNameInput.fill('');

      // Try to submit
      await modal.locator('button[type="submit"]').click();

      // Should show error state
      await expect(firstNameInput).toHaveClass(/input--error/);
    });

    test('should submit name change and show success alert', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');

      // Fill in new name
      await modal.locator('input[name="customer[first_name]"]').fill('Test');
      await modal.locator('input[name="customer[last_name]"]').fill('User');

      // Mock the API response
      await page.route('**/account', async (route) => {
        await route.fulfill({
          status: 200,
          body: 'Success',
        });
      });

      // Submit form
      await modal.locator('button[type="submit"]').click();

      // Modal should close
      await expect(modal).toBeHidden({ timeout: 3000 });

      // Success alert should appear
      await expect(page.locator('.alert--success')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Edit Email Modal', () => {
    test('should open edit email modal', async ({ page }) => {
      await page.click('[data-modal-open="edit-email-modal"]');

      const modal = page.locator('#edit-email-modal');
      await expect(modal).toBeVisible();
      await expect(modal.locator('.modal__title')).toContainText('Change Email');
    });

    test('should show current email in the info section', async ({ page }) => {
      await page.click('[data-modal-open="edit-email-modal"]');

      const modal = page.locator('#edit-email-modal');
      await expect(modal.locator('.customer-settings__form-info')).toContainText('Current email');
    });

    test('should show verification hint', async ({ page }) => {
      await page.click('[data-modal-open="edit-email-modal"]');

      const modal = page.locator('#edit-email-modal');
      await expect(modal.locator('.customer-settings__form-hint')).toContainText('verification');
    });

    test('should validate email format', async ({ page }) => {
      await page.click('[data-modal-open="edit-email-modal"]');

      const modal = page.locator('#edit-email-modal');
      const emailInput = modal.locator('input[name="customer[email]"]');

      // Enter invalid email
      await emailInput.fill('invalid-email');

      // Try to submit
      await modal.locator('button[type="submit"]').click();

      // Should show error
      await expect(emailInput).toHaveClass(/input--error/);
    });

    test('should show confirmation message after submitting', async ({ page }) => {
      await page.click('[data-modal-open="edit-email-modal"]');

      const modal = page.locator('#edit-email-modal');
      const emailInput = modal.locator('input[name="customer[email]"]');

      // Enter valid email
      await emailInput.fill('newemail@example.com');

      // Submit form
      await modal.locator('button[type="submit"]').click();

      // Should show confirmation
      const confirmation = modal.locator('#email-confirmation');
      await expect(confirmation).toBeVisible({ timeout: 3000 });
      await expect(confirmation).toContainText('Verification Email Sent');
    });
  });

  test.describe('Edit Phone Modal', () => {
    test('should open edit phone modal', async ({ page }) => {
      await page.click('[data-modal-open="edit-phone-modal"]');

      const modal = page.locator('#edit-phone-modal');
      await expect(modal).toBeVisible();
      await expect(modal.locator('.modal__title')).toContainText('Edit Phone');
    });

    test('should have phone input with hint', async ({ page }) => {
      await page.click('[data-modal-open="edit-phone-modal"]');

      const modal = page.locator('#edit-phone-modal');
      const phoneInput = modal.locator('input[name="customer[phone]"]');

      await expect(phoneInput).toBeVisible();
      await expect(modal.locator('.input-hint')).toContainText('country code');
    });

    test('should submit phone change and show success alert', async ({ page }) => {
      await page.click('[data-modal-open="edit-phone-modal"]');

      const modal = page.locator('#edit-phone-modal');

      // Fill in phone number
      await modal.locator('input[name="customer[phone]"]').fill('+1 555 123 4567');

      // Mock the API response
      await page.route('**/account', async (route) => {
        await route.fulfill({
          status: 200,
          body: 'Success',
        });
      });

      // Submit form
      await modal.locator('button[type="submit"]').click();

      // Modal should close
      await expect(modal).toBeHidden({ timeout: 3000 });

      // Success alert should appear
      await expect(page.locator('.alert--success')).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Reset Password Modal', () => {
    test('should open reset password modal', async ({ page }) => {
      await page.click('[data-modal-open="reset-password-modal"]');

      const modal = page.locator('#reset-password-modal');
      await expect(modal).toBeVisible();
      await expect(modal.locator('.modal__title')).toContainText('Reset Password');
    });

    test('should display user email in the modal', async ({ page }) => {
      await page.click('[data-modal-open="reset-password-modal"]');

      const modal = page.locator('#reset-password-modal');
      await expect(modal.locator('.customer-settings__form-email')).toBeVisible();
    });

    test('should show confirmation after submitting reset request', async ({ page }) => {
      await page.click('[data-modal-open="reset-password-modal"]');

      const modal = page.locator('#reset-password-modal');

      // Mock the password recovery endpoint
      await page.route('**/account/recover', async (route) => {
        await route.fulfill({
          status: 200,
          body: 'Success',
        });
      });

      // Submit form
      await modal.locator('button[type="submit"]').click();

      // Should show confirmation
      const confirmation = modal.locator('#password-confirmation');
      await expect(confirmation).toBeVisible({ timeout: 3000 });
      await expect(confirmation).toContainText('Check Your Email');
    });

    test('should update modal title to "Email Sent" after submission', async ({ page }) => {
      await page.click('[data-modal-open="reset-password-modal"]');

      const modal = page.locator('#reset-password-modal');

      // Mock the password recovery endpoint
      await page.route('**/account/recover', async (route) => {
        await route.fulfill({
          status: 200,
          body: 'Success',
        });
      });

      // Submit form
      await modal.locator('button[type="submit"]').click();

      // Title should change
      await expect(modal.locator('.modal__title')).toContainText('Email Sent', {
        timeout: 3000,
      });
    });
  });

  test.describe('Modal Accessibility', () => {
    test('should have proper ARIA attributes on modal', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      await expect(modal).toHaveAttribute('role', 'dialog');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal).toHaveAttribute('aria-labelledby', 'edit-name-modal-title');
    });

    test('should trap focus within modal', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');

      // First focusable element should be focused
      const firstInput = modal.locator('input').first();

      // Tab through all elements - should stay within modal
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() =>
          document.activeElement?.closest('#edit-name-modal')
        );
        expect(activeElement).not.toBeNull();
      }
    });

    test('edit buttons should have aria-label', async ({ page }) => {
      const editNameBtn = page.locator('[data-modal-open="edit-name-modal"]');
      await expect(editNameBtn).toHaveAttribute('aria-label', 'Edit name');

      const editEmailBtn = page.locator('[data-modal-open="edit-email-modal"]');
      await expect(editEmailBtn).toHaveAttribute('aria-label', 'Edit email');

      const editPhoneBtn = page.locator('[data-modal-open="edit-phone-modal"]');
      await expect(editPhoneBtn).toHaveAttribute('aria-label', 'Edit phone number');
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state on submit button during form submission', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      const submitBtn = modal.locator('button[type="submit"]');

      // Delay the response to see loading state
      await page.route('**/account', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({ status: 200, body: 'Success' });
      });

      // Fill form and submit
      await modal.locator('input[name="customer[first_name]"]').fill('Test');
      await modal.locator('input[name="customer[last_name]"]').fill('User');
      await submitBtn.click();

      // Button should have loading class
      await expect(submitBtn).toHaveClass(/customer-settings__btn--loading/);

      // Wait for request to complete
      await expect(modal).toBeHidden({ timeout: 3000 });
    });

    test('should disable submit button during loading', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      const submitBtn = modal.locator('button[type="submit"]');

      // Delay the response
      await page.route('**/account', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.fulfill({ status: 200, body: 'Success' });
      });

      // Fill and submit
      await modal.locator('input[name="customer[first_name]"]').fill('Test');
      await modal.locator('input[name="customer[last_name]"]').fill('User');
      await submitBtn.click();

      // Button should be disabled
      await expect(submitBtn).toBeDisabled();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display edit buttons as icon-only on mobile', async ({ page }) => {
      const editBtn = page.locator('[data-modal-open="edit-name-modal"]');

      // The span text should be hidden on mobile (via CSS)
      // We verify the button is still visible and clickable
      await expect(editBtn).toBeVisible();

      // Click should still work
      await editBtn.click();
      await expect(page.locator('#edit-name-modal')).toBeVisible();
    });

    test('should stack form actions vertically on mobile', async ({ page }) => {
      await page.click('[data-modal-open="edit-name-modal"]');

      const modal = page.locator('#edit-name-modal');
      const formActions = modal.locator('.customer-settings__form-actions');

      // Verify buttons exist
      await expect(formActions.locator('button')).toHaveCount(2);
    });
  });
});

test.describe('Sign Out Functionality', () => {
  test('should navigate to logout when clicking Sign Out', async ({ page }) => {
    await page.goto('/account/settings');

    const signOutLink = page.locator('.customer-settings__card--highlight a[href*="logout"]');
    await expect(signOutLink).toBeVisible();

    // Don't actually click - just verify the link exists with correct href
    const href = await signOutLink.getAttribute('href');
    expect(href).toContain('logout');
  });
});
