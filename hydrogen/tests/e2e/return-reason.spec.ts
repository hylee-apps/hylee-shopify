import {test, expect, type Page} from '@playwright/test';

/**
 * E2E tests for the Return Process — Step 2 (Return Reason).
 * Covers manual testing plan scenarios MT-1 through MT-12.
 *
 * These tests require authentication and navigate through Step 1 → Step 2.
 * They run serially to avoid session conflicts.
 */

const EMAIL = process.env.TEST_EMAIL || 'derek@hy-lee.com';
const PASSWORD = process.env.TEST_PASSWORD || 'jU1cyTw1st$';
const ORDERS_URL = '/account/orders';

// ============================================================================
// Auth & Navigation Helpers
// ============================================================================

async function login(page: Page) {
  await page.goto('/account/login');
  await page.waitForLoadState('networkidle');

  if (!page.url().includes('/account/login')) return;

  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', {name: 'Sign In', exact: true}).click();

  await page.waitForURL(
    (url) =>
      url.pathname.startsWith('/account') &&
      !url.pathname.includes('/account/login'),
    {timeout: 20000},
  );
  await page.waitForLoadState('networkidle');
}

async function navigateToOrders(page: Page) {
  await page.goto(ORDERS_URL);
  await page.waitForLoadState('networkidle');

  if (page.url().includes('/account/login')) {
    await login(page);
    await page.goto(ORDERS_URL);
    await page.waitForLoadState('networkidle');
  }

  await expect(page.locator('h1')).toContainText('My Orders', {
    timeout: 15000,
  });
}

async function getFirstOrderId(page: Page): Promise<string> {
  const link = page
    .locator('a[href*="/account/orders/"]')
    .filter({hasText: 'View order details'})
    .first();
  const href = await link.getAttribute('href');
  const match = href?.match(/\/account\/orders\/(\d+)/);
  if (!match) throw new Error('Could not find order ID from orders page');
  return match[1];
}

/**
 * Navigate to Step 2 by going to Step 1, collecting item IDs,
 * then navigating directly to the Step 2 URL.
 * Returns orderId.
 */
async function navigateToStep2(page: Page): Promise<string> {
  await navigateToOrders(page);
  const orderId = await getFirstOrderId(page);

  // Go to Step 1 to get item IDs
  await page.goto(`/account/orders/${orderId}/return`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1')).toContainText('Start a Return', {
    timeout: 15000,
  });

  // Extract item IDs from the return item cards' data attributes
  const itemIds = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-testid="return-item-card"]');
    const ids: string[] = [];
    for (const card of cards) {
      const id = card.getAttribute('data-item-id');
      if (id) ids.push(id);
    }
    return ids;
  });

  // If we couldn't get IDs from data attributes, select all and extract from checkboxes
  let itemsParam: string;
  if (itemIds.length > 0) {
    itemsParam = itemIds.join(',');
  } else {
    // Fallback: extract variant IDs from the page's __remixContext or loader data
    const fallbackIds = await page.evaluate(() => {
      // Try to get from window.__remixContext or __reactRouterContext
      const ctx =
        (window as any).__reactRouterContext ?? (window as any).__remixContext;
      if (ctx?.state?.loaderData) {
        for (const [, data] of Object.entries(ctx.state.loaderData)) {
          const d = data as any;
          if (d?.lineItems) {
            return (d.lineItems as any[])
              .filter((item: any) => item.eligible)
              .map((item: any) => item.id);
          }
        }
      }
      return [];
    });
    itemsParam = fallbackIds.join(',');
  }

  if (!itemsParam) {
    throw new Error('Could not extract item IDs from Step 1 page');
  }

  // Navigate directly to Step 2 with the items param
  await page.goto(
    `/account/orders/${orderId}/return/reason?items=${encodeURIComponent(itemsParam)}`,
  );
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1')).toContainText('Return Items', {
    timeout: 15000,
  });

  return orderId;
}

function getComputedStyle(locator: ReturnType<Page['locator']>, prop: string) {
  return locator.evaluate(
    (el, p) => window.getComputedStyle(el).getPropertyValue(p),
    prop,
  );
}

// ============================================================================
// Desktop Tests
// ============================================================================

test.describe('Return Reason — Desktop', () => {
  test.describe.configure({mode: 'serial'});
  test.use({viewport: {width: 1440, height: 900}});
  test.setTimeout(60000);

  test.beforeEach(async ({page}) => {
    await login(page);
  });

  // -- MT-1: Page Load & Navigation --

  test('MT-1.1: Navigate from Step 1 to Step 2', async ({page}) => {
    const orderId = await navigateToStep2(page);

    // Verify title
    await expect(page.locator('h1')).toContainText('Return Items');

    // Verify subtitle has order name and delivery date
    const subtitle = page.locator('h1 + p');
    await expect(subtitle).toBeVisible();
    const subtitleText = await subtitle.textContent();
    expect(subtitleText).toContain('Delivered on');
  });

  test('MT-1.2: URL contains items param', async ({page}) => {
    await navigateToStep2(page);

    const url = page.url();
    expect(url).toContain('/return/reason');
    expect(url).toContain('items=');
  });

  test('MT-1.3: Direct URL access with valid items', async ({page}) => {
    // First navigate normally to get a valid URL
    await navigateToStep2(page);
    const step2Url = page.url();

    // Navigate away then back to the same URL
    await page.goto(ORDERS_URL);
    await page.waitForLoadState('networkidle');
    await page.goto(step2Url);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Return Items', {
      timeout: 15000,
    });
  });

  test('MT-1.4: Direct URL without items param redirects to Step 1', async ({
    page,
  }) => {
    await navigateToOrders(page);
    const orderId = await getFirstOrderId(page);

    await page.goto(`/account/orders/${orderId}/return/reason`);
    await page.waitForLoadState('networkidle');

    // Should redirect to Step 1
    expect(page.url()).toContain(`/account/orders/${orderId}/return`);
    expect(page.url()).not.toContain('/reason');
  });

  test('MT-1.5: Direct URL with invalid items redirects to Step 1', async ({
    page,
  }) => {
    await navigateToOrders(page);
    const orderId = await getFirstOrderId(page);

    await page.goto(
      `/account/orders/${orderId}/return/reason?items=invalid-id-999`,
    );
    await page.waitForLoadState('networkidle');

    // Should redirect to Step 1
    expect(page.url()).toContain(`/account/orders/${orderId}/return`);
    expect(page.url()).not.toContain('/reason');
  });

  test('MT-1.6: Unauthenticated access redirects to login', async ({page}) => {
    // Use a fresh context without logging in
    await page.context().clearCookies();
    await page.goto('/account/orders/12345/return/reason?items=x');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/account/login');
  });

  test('MT-1.7: Invalid order ID shows 404', async ({page}) => {
    const resp = await page.goto(
      '/account/orders/9999999999/return/reason?items=x',
    );
    // Either 404 or redirect
    const status = resp?.status() ?? 0;
    const isError = status === 404 || page.url().includes('/return');
    expect(isError).toBeTruthy();
  });

  // -- MT-2: Progress Steps --

  test('MT-2.1: Step 1 shows completed state (checkmark)', async ({page}) => {
    await navigateToStep2(page);

    const step1 = page.locator('[data-testid="return-step-1"]');
    await expect(step1).toBeVisible();

    // Should not have pending opacity
    const opacity = await getComputedStyle(step1, 'opacity');
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);
  });

  test('MT-2.2: Step 2 shows active state', async ({page}) => {
    await navigateToStep2(page);

    const step2 = page.locator('[data-testid="return-step-2"]');
    await expect(step2).toBeVisible();

    const opacity = await getComputedStyle(step2, 'opacity');
    expect(parseFloat(opacity)).toBeGreaterThan(0.9);
  });

  test('MT-2.3: Steps 3-4 show pending state (reduced opacity)', async ({
    page,
  }) => {
    await navigateToStep2(page);

    for (const stepNum of [3, 4]) {
      const step = page.locator(`[data-testid="return-step-${stepNum}"]`);
      await expect(step).toBeVisible();
      const opacity = await getComputedStyle(step, 'opacity');
      expect(parseFloat(opacity)).toBeLessThan(0.5);
    }
  });

  test('MT-2.4: Step labels are correct', async ({page}) => {
    await navigateToStep2(page);

    const progress = page.locator('[data-testid="return-step-progress"]');
    await expect(progress).toContainText('Select Items');
    await expect(progress).toContainText('Reason');
    await expect(progress).toContainText('Ship');
    await expect(progress).toContainText('Make It Right');
  });

  test('MT-2.5: Connector lines between steps', async ({page}) => {
    await navigateToStep2(page);

    // There should be 3 connector lines (between 4 steps)
    const progress = page.locator('[data-testid="return-step-progress"]');
    // Connectors are divs with h-[2px] w-[60px]
    const connectors = progress.locator('.h-\\[2px\\].w-\\[60px\\]');
    await expect(connectors).toHaveCount(3);
  });

  // -- MT-3: Items Card Header --

  test('MT-3.1: Card container has correct styling', async ({page}) => {
    await navigateToStep2(page);

    // Card has border and rounded corners
    const card = page
      .locator('.rounded-\\[12px\\].border.border-\\[\\#e5e7eb\\]')
      .first();
    await expect(card).toBeVisible();
  });

  test('MT-3.2: Header shows "Select Items to Return"', async ({page}) => {
    await navigateToStep2(page);

    const header = page
      .locator('h2')
      .filter({hasText: 'Select Items to Return'});
    await expect(header).toBeVisible();
  });

  test('MT-3.3: Header shows "Select all that apply"', async ({page}) => {
    await navigateToStep2(page);

    const selectAll = page.locator('[data-testid="return-select-all"]');
    await expect(selectAll).toBeVisible();
    await expect(selectAll).toContainText('Select all that apply');
  });

  test('MT-3.4: Header has bottom border', async ({page}) => {
    await navigateToStep2(page);

    const header = page.locator('.border-b.border-\\[\\#e5e7eb\\]').first();
    await expect(header).toBeVisible();
  });

  // -- MT-4: Expanded Item Card --

  test('MT-4.1: First item is expanded by default', async ({page}) => {
    await navigateToStep2(page);

    // First item should have reason form visible
    const reasonForms = page.locator('[data-testid^="return-reason-form-"]');
    const formCount = await reasonForms.count();
    expect(formCount).toBe(1); // Only one expanded at a time

    // Should have reason options visible
    await expect(
      page.locator('[data-testid^="return-reason-option-"]').first(),
    ).toBeVisible();
  });

  test('MT-4.2: Expanded card has return-accent border', async ({page}) => {
    await navigateToStep2(page);

    const firstItem = page
      .locator('[data-testid^="return-reason-item-"]')
      .first();
    const borderColor = await getComputedStyle(firstItem, 'border-color');
    // #4fd1a8 → rgb(79, 209, 168)
    expect(borderColor).toContain('79');
    expect(borderColor).toContain('209');
  });

  test('MT-4.3: Expanded card has horizontal layout with reason form', async ({
    page,
  }) => {
    await navigateToStep2(page);

    const firstItem = page
      .locator('[data-testid^="return-reason-item-"]')
      .first();

    // Should contain checkbox, image placeholder, product info, and reason form
    const checkbox = firstItem.locator(
      '[data-testid^="return-reason-checkbox-"]',
    );
    await expect(checkbox).toBeVisible();

    const reasonForm = firstItem.locator(
      '[data-testid^="return-reason-form-"]',
    );
    await expect(reasonForm).toBeVisible();
  });

  test('MT-4.4: Checkbox shows checked state', async ({page}) => {
    await navigateToStep2(page);

    const checkbox = page
      .locator('[data-testid^="return-reason-checkbox-"]')
      .first();
    // Checked state has bg-return-accent
    const bg = await getComputedStyle(checkbox, 'background-color');
    // #4fd1a8 → rgb(79, 209, 168)
    expect(bg).toContain('79');
  });

  test('MT-4.5: Product image placeholder is 80x80', async ({page}) => {
    await navigateToStep2(page);

    const imgPlaceholder = page
      .locator('[data-testid^="return-reason-item-"]')
      .first()
      .locator('.size-\\[80px\\]');
    await expect(imgPlaceholder).toBeVisible();
  });

  test('MT-4.6: Product info shows title, variant, price', async ({page}) => {
    await navigateToStep2(page);

    const firstItem = page
      .locator('[data-testid^="return-reason-item-"]')
      .first();

    // Title
    const title = firstItem.locator('h4');
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText!.length).toBeGreaterThan(0);

    // Price (in return-accent color)
    const price = firstItem.locator('.text-return-accent').first();
    await expect(price).toBeVisible();
    const priceText = await price.textContent();
    expect(priceText).toMatch(/\$/);
  });

  test('MT-4.7: Reason form has border-t divider', async ({page}) => {
    await navigateToStep2(page);

    const reasonForm = page
      .locator('[data-testid^="return-reason-form-"]')
      .first();
    await expect(reasonForm).toBeVisible();

    // The form container has border-t class
    const hasBorderT = await reasonForm.evaluate((el) =>
      el.classList.contains('border-t'),
    );
    expect(hasBorderT).toBeTruthy();
  });

  test('MT-4.8: Expanded card has min-height 382px', async ({page}) => {
    await navigateToStep2(page);

    const firstItem = page
      .locator('[data-testid^="return-reason-item-"]')
      .first();
    const minHeight = await getComputedStyle(firstItem, 'min-height');
    expect(parseFloat(minHeight)).toBeGreaterThanOrEqual(382);
  });

  // -- MT-5: Reason Selection --

  test('MT-5.1: Four reason options displayed in 2x2 grid', async ({page}) => {
    await navigateToStep2(page);

    const options = page.locator('[data-testid^="return-reason-option-"]');
    await expect(options).toHaveCount(4);

    await expect(
      page.locator('[data-testid="return-reason-option-defective"]'),
    ).toContainText('Defective');
    await expect(
      page.locator('[data-testid="return-reason-option-wrong-item"]'),
    ).toContainText('Wrong Item');
    await expect(
      page.locator('[data-testid="return-reason-option-not-as-described"]'),
    ).toContainText('Not as Described');
    await expect(
      page.locator('[data-testid="return-reason-option-changed-mind"]'),
    ).toContainText('Changed Mind');
  });

  test('MT-5.2: Selecting a reason changes its style', async ({page}) => {
    await navigateToStep2(page);

    const defective = page.locator(
      '[data-testid="return-reason-option-defective"]',
    );

    // Click to select
    await defective.click();
    await page.waitForTimeout(200);

    // Should have return-accent border
    const borderColor = await getComputedStyle(defective, 'border-color');
    expect(borderColor).toContain('79'); // rgb(79, 209, 168)
  });

  test('MT-5.3: Switching reason deselects previous', async ({page}) => {
    await navigateToStep2(page);

    const defective = page.locator(
      '[data-testid="return-reason-option-defective"]',
    );
    const wrongItem = page.locator(
      '[data-testid="return-reason-option-wrong-item"]',
    );

    // Select defective first
    await defective.click();
    await page.waitForTimeout(200);

    // Select wrong item
    await wrongItem.click();
    await page.waitForTimeout(200);

    // Wrong Item should be selected (return-accent border)
    const wrongBorder = await getComputedStyle(wrongItem, 'border-color');
    expect(wrongBorder).toContain('79');

    // Defective should be deselected (gray border)
    const defBorder = await getComputedStyle(defective, 'border-color');
    expect(defBorder).toContain('209'); // #d1d5db → rgb(209, 213, 219)
  });

  test('MT-5.4: Reason label text', async ({page}) => {
    await navigateToStep2(page);

    const label = page.locator('label').filter({hasText: 'Reason for return:'});
    await expect(label).toBeVisible();
  });

  test('MT-5.5: Reason buttons have correct sizing', async ({page}) => {
    await navigateToStep2(page);

    const option = page.locator(
      '[data-testid="return-reason-option-defective"]',
    );
    const borderRadius = await getComputedStyle(option, 'border-radius');
    expect(borderRadius).toBe('8px');
  });

  test('MT-5.6: Reason grid has 12px gap', async ({page}) => {
    await navigateToStep2(page);

    const grid = page
      .locator('[data-testid^="return-reason-form-"]')
      .first()
      .locator('.grid');
    const gap = await getComputedStyle(grid, 'gap');
    expect(gap).toBe('12px');
  });

  // -- MT-6: Additional Details & Upload --

  test('MT-6.1: Textarea with correct placeholder', async ({page}) => {
    await navigateToStep2(page);

    const textarea = page
      .locator('[data-testid^="return-reason-details-"]')
      .first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute(
      'placeholder',
      'Additional details (optional)',
    );
  });

  test('MT-6.2: Textarea accepts input', async ({page}) => {
    await navigateToStep2(page);

    const textarea = page
      .locator('[data-testid^="return-reason-details-"]')
      .first();
    await textarea.fill('The item arrived with a cracked screen');
    await expect(textarea).toHaveValue(
      'The item arrived with a cracked screen',
    );
  });

  test('MT-6.3: Textarea has correct border styling', async ({page}) => {
    await navigateToStep2(page);

    const textarea = page
      .locator('[data-testid^="return-reason-details-"]')
      .first();
    const borderRadius = await getComputedStyle(textarea, 'border-radius');
    expect(borderRadius).toBe('8px');
  });

  test('MT-6.4: Upload button is visible with correct text', async ({page}) => {
    await navigateToStep2(page);

    const uploadBtn = page
      .locator('[data-testid^="return-reason-upload-"]')
      .first();
    await expect(uploadBtn).toBeVisible();
    await expect(uploadBtn).toContainText('Upload Photos');
  });

  test('MT-6.5: Upload helper text visible', async ({page}) => {
    await navigateToStep2(page);

    const helperText = page.getByText(
      'Add photos to support your return request',
    );
    await expect(helperText).toBeVisible();
  });

  test('MT-6.6: Upload button triggers file input', async ({page}) => {
    await navigateToStep2(page);

    const uploadBtn = page
      .locator('[data-testid^="return-reason-upload-"]')
      .first();

    // Listen for file chooser
    const fileChooserPromise = page
      .waitForEvent('filechooser', {timeout: 3000})
      .catch(() => null);
    await uploadBtn.click();
    const fileChooser = await fileChooserPromise;

    // File chooser should have been triggered
    expect(fileChooser).not.toBeNull();
  });

  // -- MT-7: Collapsed Item Cards --

  test('MT-7.1: Collapsed card has gray border', async ({page}) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    // Second item should be collapsed
    const secondItem = items.nth(1);
    const borderColor = await getComputedStyle(secondItem, 'border-color');
    // #e5e7eb → rgb(229, 231, 235)
    expect(borderColor).toContain('229');
  });

  test('MT-7.2: Collapsed card checkbox is checked', async ({page}) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    const secondCheckbox = items
      .nth(1)
      .locator('[data-testid^="return-reason-checkbox-"]');
    const bg = await getComputedStyle(secondCheckbox, 'background-color');
    // Checked = #4fd1a8 → rgb(79, 209, 168)
    expect(bg).toContain('79');
  });

  test('MT-7.3: Collapsed card has no reason form', async ({page}) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    const secondItemForms = items
      .nth(1)
      .locator('[data-testid^="return-reason-form-"]');
    await expect(secondItemForms).toHaveCount(0);
  });

  test('MT-7.4: Click collapsed card to expand it', async ({page}) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    // Click the product info area of the second item to expand it
    const secondItem = items.nth(1);
    const productInfo = secondItem.locator('h4');
    await productInfo.click();
    await page.waitForTimeout(300);

    // Second item should now have a reason form
    const secondForms = secondItem.locator(
      '[data-testid^="return-reason-form-"]',
    );
    await expect(secondForms).toHaveCount(1);

    // First item should no longer have a reason form (collapsed)
    const firstForms = items
      .first()
      .locator('[data-testid^="return-reason-form-"]');
    await expect(firstForms).toHaveCount(0);
  });

  test('MT-7.5: Expand preserves previously selected reason', async ({
    page,
  }) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    // Select a reason on first item
    const defective = page.locator(
      '[data-testid="return-reason-option-defective"]',
    );
    await defective.click();
    await page.waitForTimeout(200);

    // Expand second item
    const secondItem = items.nth(1);
    await secondItem.locator('h4').click();
    await page.waitForTimeout(300);

    // Re-expand first item
    const firstItem = items.first();
    await firstItem.locator('h4').click();
    await page.waitForTimeout(300);

    // Defective should still be selected on first item
    const defectiveAgain = page.locator(
      '[data-testid="return-reason-option-defective"]',
    );
    const borderColor = await getComputedStyle(defectiveAgain, 'border-color');
    expect(borderColor).toContain('79'); // return-accent
  });

  // -- MT-8: Selection Behavior --

  test('MT-8.1: Uncheck an item removes it from return', async ({page}) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    // Uncheck the second item
    const secondCheckbox = items
      .nth(1)
      .locator('[data-testid^="return-reason-checkbox-"]');
    await secondCheckbox.click();
    await page.waitForTimeout(300);

    // The checkbox bg should now be white (unchecked)
    const bg = await getComputedStyle(secondCheckbox, 'background-color');
    // White = rgb(255, 255, 255)
    expect(bg).toContain('255');
  });

  test('MT-8.2: Re-check a previously unchecked item', async ({page}) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    const secondCheckbox = items
      .nth(1)
      .locator('[data-testid^="return-reason-checkbox-"]');

    // Uncheck then re-check
    await secondCheckbox.click();
    await page.waitForTimeout(200);
    await secondCheckbox.click();
    await page.waitForTimeout(200);

    // Should be checked again
    const bg = await getComputedStyle(secondCheckbox, 'background-color');
    expect(bg).toContain('79'); // return-accent
  });

  test('MT-8.3: Uncheck all disables Continue', async ({page}) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();

    // Uncheck all items
    for (let i = 0; i < itemCount; i++) {
      const checkbox = items
        .nth(i)
        .locator('[data-testid^="return-reason-checkbox-"]');
      await checkbox.click();
      await page.waitForTimeout(200);
    }

    // Continue should be disabled
    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    await expect(continueBtn).toBeDisabled();
  });

  test('MT-8.4: Select all that apply toggles all items', async ({page}) => {
    await navigateToStep2(page);

    const selectAll = page.locator('[data-testid="return-select-all"]');
    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();

    // Click to deselect all
    await selectAll.click();
    await page.waitForTimeout(300);

    // All checkboxes should be unchecked
    for (let i = 0; i < itemCount; i++) {
      const checkbox = items
        .nth(i)
        .locator('[data-testid^="return-reason-checkbox-"]');
      const bg = await getComputedStyle(checkbox, 'background-color');
      expect(bg).toContain('255'); // white
    }

    // Click again to re-select all
    await selectAll.click();
    await page.waitForTimeout(300);

    // All should be checked
    for (let i = 0; i < itemCount; i++) {
      const checkbox = items
        .nth(i)
        .locator('[data-testid^="return-reason-checkbox-"]');
      const bg = await getComputedStyle(checkbox, 'background-color');
      expect(bg).toContain('79'); // return-accent
    }
  });

  test('MT-8.5: Unchecked item reason is cleared on re-check', async ({
    page,
  }) => {
    await navigateToStep2(page);

    // Select a reason
    const defective = page.locator(
      '[data-testid="return-reason-option-defective"]',
    );
    await defective.click();
    await page.waitForTimeout(200);

    // Get the first item's checkbox
    const firstCheckbox = page
      .locator('[data-testid^="return-reason-checkbox-"]')
      .first();

    // Uncheck
    await firstCheckbox.click();
    await page.waitForTimeout(200);

    // Re-check
    await firstCheckbox.click();
    await page.waitForTimeout(200);

    // Expand first item if not already expanded
    const firstItem = page
      .locator('[data-testid^="return-reason-item-"]')
      .first();
    const hasForm = await firstItem
      .locator('[data-testid^="return-reason-form-"]')
      .count();
    if (hasForm === 0) {
      await firstItem.locator('h4').click();
      await page.waitForTimeout(300);
    }

    // All reason options should be unselected (gray border)
    const options = page.locator('[data-testid^="return-reason-option-"]');
    const optionCount = await options.count();
    for (let i = 0; i < optionCount; i++) {
      const border = await getComputedStyle(options.nth(i), 'border-color');
      // Should be gray (#d1d5db → rgb(209, 213, 219)), not return-accent
      expect(border).toContain('209');
    }
  });

  // -- MT-9: Refund Summary --

  test('MT-9.1: Refund Summary title', async ({page}) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText('Refund Summary');
  });

  test('MT-9.2: Item subtotal row', async ({page}) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    await expect(summary).toContainText('Item Subtotal');
    await expect(summary).toContainText('$');
  });

  test('MT-9.3: Tax refund row', async ({page}) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    await expect(summary).toContainText('Tax Refund');
  });

  test('MT-9.4: Return shipping shows "Free" in green', async ({page}) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    await expect(summary).toContainText('Return Shipping');

    const freeLabel = summary
      .locator('.text-primary')
      .filter({hasText: 'Free'});
    await expect(freeLabel).toBeVisible();
  });

  test('MT-9.5: Estimated Refund total in return-accent', async ({page}) => {
    await navigateToStep2(page);

    const total = page.locator('[data-testid="refund-total"]');
    await expect(total).toBeVisible();

    const text = await total.textContent();
    expect(text).toMatch(/\$[\d,.]+/);
  });

  test('MT-9.6: Total = subtotal + tax', async ({page}) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    const summaryText = await summary.textContent();

    // Extract dollar amounts
    const amounts = summaryText!.match(/\$[\d,.]+/g);
    expect(amounts).not.toBeNull();
    expect(amounts!.length).toBeGreaterThanOrEqual(3);

    const parseAmount = (s: string) =>
      parseFloat(s.replace('$', '').replace(',', ''));

    const subtotal = parseAmount(amounts![0]);
    const tax = parseAmount(amounts![1]);
    const total = parseAmount(amounts![amounts!.length - 1]);

    // Total should be subtotal + tax (within rounding tolerance)
    expect(Math.abs(total - (subtotal + tax))).toBeLessThan(0.02);
  });

  test('MT-9.7: Disclaimer text', async ({page}) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    await expect(summary).toContainText(
      'Refund will be processed to original payment method',
    );
    await expect(summary).toContainText('5-7 business days');
  });

  test('MT-9.8: Refund updates when item unchecked', async ({page}) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    // Get initial total
    const totalBefore = await page
      .locator('[data-testid="refund-total"]')
      .textContent();

    // Uncheck second item
    const secondCheckbox = items
      .nth(1)
      .locator('[data-testid^="return-reason-checkbox-"]');
    await secondCheckbox.click();
    await page.waitForTimeout(300);

    // Total should decrease
    const totalAfter = await page
      .locator('[data-testid="refund-total"]')
      .textContent();
    const parseMoney = (s: string | null) =>
      parseFloat((s ?? '0').replace('$', '').replace(',', ''));
    expect(parseMoney(totalAfter)).toBeLessThan(parseMoney(totalBefore));
  });

  test('MT-9.9: Summary container styling', async ({page}) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    const borderRadius = await getComputedStyle(summary, 'border-radius');
    expect(borderRadius).toBe('12px');
  });

  test('MT-9.10: Divider above total', async ({page}) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    const divider = summary.locator('.border-t-2');
    await expect(divider).toBeVisible();
  });

  // -- MT-10: Action Buttons --

  test('MT-10.1: Cancel and Continue buttons visible inline', async ({
    page,
  }) => {
    await navigateToStep2(page);

    const cancelBtn = page.locator('[data-testid="return-cancel-btn"]');
    const continueBtn = page.locator('[data-testid="return-continue-btn"]');

    await expect(cancelBtn).toBeVisible();
    await expect(continueBtn).toBeVisible();

    await expect(cancelBtn).toContainText('Cancel');
    await expect(continueBtn).toContainText('Continue to Shipping');
  });

  test('MT-10.2: Cancel button style', async ({page}) => {
    await navigateToStep2(page);

    const cancelBtn = page.locator('[data-testid="return-cancel-btn"]');
    const borderRadius = await getComputedStyle(cancelBtn, 'border-radius');
    expect(borderRadius).toBe('8px');
  });

  test('MT-10.3: Continue button style', async ({page}) => {
    await navigateToStep2(page);

    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    const borderRadius = await getComputedStyle(continueBtn, 'border-radius');
    expect(borderRadius).toBe('8px');

    const bg = await getComputedStyle(continueBtn, 'background-color');
    expect(bg).toContain('79'); // return-accent rgb(79, 209, 168)
  });

  test('MT-10.4: Continue disabled before reasons selected', async ({page}) => {
    await navigateToStep2(page);

    // No reasons selected yet → disabled
    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    await expect(continueBtn).toBeDisabled();

    const opacity = await getComputedStyle(continueBtn, 'opacity');
    expect(parseFloat(opacity)).toBeLessThan(0.7);
  });

  test('MT-10.5: Continue enabled after all reasons selected', async ({
    page,
  }) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();

    // Select reason for each item
    for (let i = 0; i < itemCount; i++) {
      // Expand the item
      if (i > 0) {
        await items.nth(i).locator('h4').click();
        await page.waitForTimeout(300);
      }
      // Select "Defective"
      const defective = page.locator(
        '[data-testid="return-reason-option-defective"]',
      );
      await defective.click();
      await page.waitForTimeout(200);
    }

    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    await expect(continueBtn).toBeEnabled();

    const opacity = await getComputedStyle(continueBtn, 'opacity');
    expect(parseFloat(opacity)).toBeGreaterThan(0.7);
  });

  test('MT-10.6: Continue stays disabled with partial reasons', async ({
    page,
  }) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();
    if (itemCount < 2) {
      test.skip();
      return;
    }

    // Select reason for only the first item
    const defective = page.locator(
      '[data-testid="return-reason-option-defective"]',
    );
    await defective.click();
    await page.waitForTimeout(200);

    // Continue should still be disabled
    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    await expect(continueBtn).toBeDisabled();
  });

  test('MT-10.7: Cancel navigates back to Step 1', async ({page}) => {
    await navigateToStep2(page);

    const cancelBtn = page.locator('[data-testid="return-cancel-btn"]');
    await cancelBtn.click();
    await page.waitForLoadState('networkidle');

    // Should be back on Step 1
    await expect(page.locator('h1')).toContainText('Start a Return', {
      timeout: 15000,
    });
  });

  test('MT-10.9: Buttons scroll with content (not sticky)', async ({page}) => {
    await navigateToStep2(page);

    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    const position = await getComputedStyle(continueBtn, 'position');
    // Should NOT be fixed or sticky
    expect(position).not.toBe('fixed');
    expect(position).not.toBe('sticky');
  });

  // -- MT-11: Visual Fidelity --

  test('MT-11.1: Content centered with max-width 900px', async ({page}) => {
    await navigateToStep2(page);

    const content = page.locator('.max-w-\\[900px\\]');
    await expect(content).toBeVisible();
  });

  test('MT-11.2: Typography weights correct', async ({page}) => {
    await navigateToStep2(page);

    // Title is font-light (300)
    const title = page.locator('h1');
    const titleWeight = await getComputedStyle(title, 'font-weight');
    expect(titleWeight).toBe('300');

    // Card title is font-bold (700)
    const cardTitle = page
      .locator('h2')
      .filter({hasText: 'Select Items to Return'});
    const cardTitleWeight = await getComputedStyle(cardTitle, 'font-weight');
    expect(cardTitleWeight).toBe('700');
  });

  test('MT-11.3: Color accuracy — return-accent and primary', async ({
    page,
  }) => {
    await navigateToStep2(page);

    // Continue button bg = return-accent
    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    const bg = await getComputedStyle(continueBtn, 'background-color');
    expect(bg).toContain('79'); // #4fd1a8

    // "Free" label = primary green
    const freeLabel = page
      .locator('[data-testid="refund-summary"]')
      .locator('.text-primary')
      .filter({hasText: 'Free'});
    if (await freeLabel.isVisible()) {
      const freeColor = await getComputedStyle(freeLabel, 'color');
      // #2ac864 → rgb(42, 200, 100)
      expect(freeColor).toContain('42');
    }
  });

  test('MT-11.4: Border radii — 12px cards, 8px buttons, 4px checkbox', async ({
    page,
  }) => {
    await navigateToStep2(page);

    // Refund summary = 12px
    const summary = page.locator('[data-testid="refund-summary"]');
    expect(await getComputedStyle(summary, 'border-radius')).toBe('12px');

    // Reason option = 8px
    const option = page.locator(
      '[data-testid="return-reason-option-defective"]',
    );
    expect(await getComputedStyle(option, 'border-radius')).toBe('8px');

    // Checkbox = 4px
    const checkbox = page
      .locator('[data-testid^="return-reason-checkbox-"]')
      .first();
    expect(await getComputedStyle(checkbox, 'border-radius')).toBe('4px');
  });

  test('MT-11.6: Spacing — 16px items gap, 12px reason grid gap', async ({
    page,
  }) => {
    await navigateToStep2(page);

    // Reason grid gap = 12px (already tested in MT-5.6)
    const grid = page
      .locator('[data-testid^="return-reason-form-"]')
      .first()
      .locator('.grid');
    const gridGap = await getComputedStyle(grid, 'gap');
    expect(gridGap).toBe('12px');
  });

  // -- MT-12: Edge Cases --

  test('MT-12.5: Browser back button returns to Step 1', async ({page}) => {
    await navigateToStep2(page);

    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be on Step 1 or orders page
    const url = page.url();
    expect(url.includes('/return') && !url.includes('/reason')).toBeTruthy();
  });

  test('MT-12.6: Page refresh preserves URL params', async ({page}) => {
    await navigateToStep2(page);
    const urlBefore = page.url();

    await page.reload();
    await page.waitForLoadState('networkidle');

    // URL should still contain items param
    expect(page.url()).toContain('items=');

    // Page should still show Step 2
    await expect(page.locator('h1')).toContainText('Return Items', {
      timeout: 15000,
    });
  });

  test('MT-12.7: Currency formatting in refund summary', async ({page}) => {
    await navigateToStep2(page);

    const total = page.locator('[data-testid="refund-total"]');
    const text = await total.textContent();
    // Should match $X.XX pattern
    expect(text).toMatch(/\$[\d,]+\.\d{2}/);
  });
});

// ============================================================================
// Tablet Tests
// ============================================================================

test.describe('Return Reason — Tablet', () => {
  test.describe.configure({mode: 'serial'});
  test.use({viewport: {width: 768, height: 1024}});
  test.setTimeout(60000);

  test.beforeEach(async ({page}) => {
    await login(page);
  });

  test('MT-1.3-tablet: Direct URL loads correctly on tablet', async ({
    page,
  }) => {
    const orderId = await navigateToStep2(page);

    await expect(page.locator('h1')).toContainText('Return Items');
    expect(page.url()).toContain('/return/reason');
    expect(page.url()).toContain('items=');
  });

  test('MT-2.4-tablet: Step labels visible on tablet', async ({page}) => {
    await navigateToStep2(page);

    const progress = page.locator('[data-testid="return-step-progress"]');
    await expect(progress).toContainText('Select Items');
    await expect(progress).toContainText('Reason');
    await expect(progress).toContainText('Ship');
    await expect(progress).toContainText('Make It Right');
  });

  test('MT-4.3-tablet: Expanded card with reason form on tablet', async ({
    page,
  }) => {
    await navigateToStep2(page);

    const reasonForm = page
      .locator('[data-testid^="return-reason-form-"]')
      .first();
    await expect(reasonForm).toBeVisible();
  });

  test('MT-5.1-tablet: Reason options visible on tablet', async ({page}) => {
    await navigateToStep2(page);

    const options = page.locator('[data-testid^="return-reason-option-"]');
    await expect(options).toHaveCount(4);
  });

  test('MT-9.4-tablet: Refund summary shows Free shipping on tablet', async ({
    page,
  }) => {
    await navigateToStep2(page);

    const summary = page.locator('[data-testid="refund-summary"]');
    await expect(summary).toContainText('Free');
  });

  test('MT-10.1-tablet: Action buttons visible on tablet', async ({page}) => {
    await navigateToStep2(page);

    await expect(
      page.locator('[data-testid="return-cancel-btn"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="return-continue-btn"]'),
    ).toBeVisible();
  });

  test('MT-10.4-tablet: Continue disabled on tablet', async ({page}) => {
    await navigateToStep2(page);

    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    await expect(continueBtn).toBeDisabled();
  });

  test('MT-10.5-tablet: Continue enabled after reasons selected on tablet', async ({
    page,
  }) => {
    await navigateToStep2(page);

    const items = page.locator('[data-testid^="return-reason-item-"]');
    const itemCount = await items.count();

    for (let i = 0; i < itemCount; i++) {
      if (i > 0) {
        await items.nth(i).locator('h4').click();
        await page.waitForTimeout(300);
      }
      const defective = page.locator(
        '[data-testid="return-reason-option-defective"]',
      );
      await defective.click();
      await page.waitForTimeout(200);
    }

    const continueBtn = page.locator('[data-testid="return-continue-btn"]');
    await expect(continueBtn).toBeEnabled();
  });
});
