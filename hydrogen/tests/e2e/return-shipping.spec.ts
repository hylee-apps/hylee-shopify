import {test, expect, type Page} from '@playwright/test';

/**
 * E2E tests for the Return Process — Step 3 (Return Shipping).
 * Covers manual testing plan scenarios MT-1 through MT-12.
 *
 * These tests require authentication and navigate through Steps 1-2 → Step 3.
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
 * Navigate to Step 3 by going through Step 1 to collect item IDs,
 * then navigating directly to the Step 3 URL.
 */
async function navigateToStep3(page: Page): Promise<string> {
  await navigateToOrders(page);
  const orderId = await getFirstOrderId(page);

  // Go to Step 1 to get item IDs
  await page.goto(`/account/orders/${orderId}/return`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1')).toContainText('Start a Return', {
    timeout: 15000,
  });

  // Extract item IDs from loader data
  const itemIds = await page.evaluate(() => {
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

  const itemsParam = itemIds.join(',');
  if (!itemsParam) {
    throw new Error('Could not extract item IDs from Step 1 page');
  }

  // Navigate directly to Step 3 with items param
  await page.goto(
    `/account/orders/${orderId}/return/shipping?items=${encodeURIComponent(itemsParam)}`,
  );
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1')).toContainText('Return Shipping', {
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
// Desktop Tests (1440x900)
// ============================================================================

test.describe('Return Shipping (Step 3) — Desktop', () => {
  test.use({viewport: {width: 1440, height: 900}});
  test.describe.configure({mode: 'serial'});

  let page: Page;
  let orderId: string;

  test.beforeAll(async ({browser}) => {
    page = await browser.newPage();
    orderId = await navigateToStep3(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  // === MT-1: Page Load & Navigation ===

  test('MT-1.1: page displays correct title and subtitle', async () => {
    await expect(page.locator('h1')).toHaveText('Return Shipping');
    await expect(
      page.locator('p').filter({hasText: "Choose how you'd like"}),
    ).toBeVisible();
  });

  test('MT-1.2: URL has items param', async () => {
    const url = new URL(page.url());
    expect(url.searchParams.has('items')).toBe(true);
    expect(url.pathname).toContain('/return/shipping');
  });

  test('MT-1.3: direct URL access with valid items', async () => {
    // Already verified by navigateToStep3 — page loaded correctly
    await expect(page.locator('h1')).toHaveText('Return Shipping');
  });

  test('MT-1.4: redirect when no items param', async () => {
    await page.goto(`/account/orders/${orderId}/return/shipping`);
    await page.waitForLoadState('networkidle');
    // Should redirect to Step 1
    expect(page.url()).toContain(`/account/orders/${orderId}/return`);
    expect(page.url()).not.toContain('/shipping');

    // Navigate back to Step 3 for remaining tests
    orderId = await navigateToStep3(page);
  });

  test('MT-1.5: redirect when invalid items param', async () => {
    await page.goto(
      `/account/orders/${orderId}/return/shipping?items=invalid-id-xyz`,
    );
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(`/account/orders/${orderId}/return`);
    expect(page.url()).not.toContain('/shipping');

    // Navigate back
    orderId = await navigateToStep3(page);
  });

  test('MT-1.6: unauthenticated access redirects to login', async () => {
    const newPage = await page.context().browser()!.newPage();
    await newPage.goto(`/account/orders/${orderId}/return/shipping?items=test`);
    await newPage.waitForLoadState('networkidle');
    expect(newPage.url()).toContain('/login');
    await newPage.close();
  });

  test('MT-1.7: invalid order ID returns 404', async () => {
    const resp = await page.goto(
      '/account/orders/999999999/return/shipping?items=test',
    );
    expect(resp?.status()).toBe(404);

    // Navigate back
    orderId = await navigateToStep3(page);
  });

  // === MT-2: Progress Steps ===

  test('MT-2.1: steps 1-2 show completed state', async () => {
    const step1 = page.locator('[data-testid="return-step-1"]');
    const step2 = page.locator('[data-testid="return-step-2"]');
    await expect(step1).toBeVisible();
    await expect(step2).toBeVisible();
    // Completed steps should not have opacity-40
    await expect(step1).not.toHaveClass(/opacity-40/);
    await expect(step2).not.toHaveClass(/opacity-40/);
  });

  test('MT-2.2: step 3 shows active state', async () => {
    const step3 = page.locator('[data-testid="return-step-3"]');
    await expect(step3).toBeVisible();
    await expect(step3).not.toHaveClass(/opacity-40/);
  });

  test('MT-2.3: step 4 shows pending state', async () => {
    const step4 = page.locator('[data-testid="return-step-4"]');
    await expect(step4).toBeVisible();
    await expect(step4).toHaveClass(/opacity-40/);
  });

  test('MT-2.4: step labels correct', async () => {
    const steps = page.locator('[data-testid^="return-step-"]');
    await expect(
      page.locator('[data-testid="return-step-1"]').getByText('Select Items'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="return-step-2"]').getByText('Reason'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="return-step-3"]').getByText('Ship'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="return-step-4"]').getByText('Make It Right'),
    ).toBeVisible();
  });

  // === MT-3: Card Header ===

  test('MT-3.1: card container visible with border', async () => {
    const card = page.locator(
      '.rounded-\\[12px\\].border.border-\\[\\#e5e7eb\\].bg-white',
    );
    await expect(card.first()).toBeVisible();
  });

  test('MT-3.2: header shows Shipping Method', async () => {
    await expect(page.locator('h2')).toHaveText('Shipping Method');
  });

  test('MT-3.3: no right text in header', async () => {
    const header = page.locator('h2').locator('..');
    const children = header.locator('> *');
    // Only the h2 should be present (no right-side text)
    await expect(children).toHaveCount(1);
  });

  // === MT-4: Shipping Options — Default State ===

  test('MT-4.1: three shipping options displayed', async () => {
    const options = page.locator('[data-testid^="shipping-option-"]');
    await expect(options).toHaveCount(3);
  });

  test('MT-4.2: UPS Drop-off pre-selected', async () => {
    const dropoff = page.locator('[data-testid="shipping-option-drop-off"]');
    await expect(dropoff).toBeVisible();
    // Selected option has return-accent border
    await expect(dropoff).toHaveClass(/border-return-accent/);
  });

  test('MT-4.4: Drop-off shows Free in primary green', async () => {
    const dropoff = page.locator('[data-testid="shipping-option-drop-off"]');
    const price = dropoff.locator('text=Free').first();
    await expect(price).toBeVisible();
    await expect(price).toHaveClass(/text-primary/);
  });

  test('MT-4.5: Drop-off shows description', async () => {
    await expect(
      page.getByText('Drop off your package at any UPS location'),
    ).toBeVisible();
  });

  test('MT-4.6: Drop-off features visible', async () => {
    await expect(page.getByText('Prepaid label')).toBeVisible();
    await expect(page.getByText('10,000+ locations')).toBeVisible();
    await expect(page.getByText('No packaging needed')).toBeVisible();
  });

  test('MT-4.7: Drop-off QR preview visible when selected', async () => {
    // QR preview should be visible when drop-off is selected
    const dropoff = page.locator('[data-testid="shipping-option-drop-off"]');
    const qr = dropoff.locator('svg').last(); // QrCode icon
    await expect(qr).toBeVisible();
  });

  test('MT-4.8: UPS Pickup unselected', async () => {
    const pickup = page.locator('[data-testid="shipping-option-pickup"]');
    await expect(pickup).toBeVisible();
    await expect(pickup).not.toHaveClass(/border-return-accent/);
    await expect(pickup).toHaveClass(/border-\[#e5e7eb\]/);
  });

  test('MT-4.10: Pickup shows Free', async () => {
    const pickup = page.locator('[data-testid="shipping-option-pickup"]');
    const free = pickup.getByText('Free', {exact: true});
    await expect(free).toBeVisible();
  });

  test('MT-4.11: Pickup features visible', async () => {
    await expect(page.getByText('Convenient pickup')).toBeVisible();
    await expect(page.getByText('Next business day')).toBeVisible();
    await expect(page.getByText('No trip needed')).toBeVisible();
  });

  test('MT-4.12: Instant Return unselected', async () => {
    const instant = page.locator('[data-testid="shipping-option-instant"]');
    await expect(instant).toBeVisible();
    await expect(instant).not.toHaveClass(/border-return-accent/);
  });

  test('MT-4.14: Instant shows $4.99 in return-accent', async () => {
    const instant = page.locator('[data-testid="shipping-option-instant"]');
    const price = instant.getByText('$4.99', {exact: true});
    await expect(price).toBeVisible();
    await expect(price).toHaveClass(/text-return-accent/);
  });

  test('MT-4.15: Instant features visible', async () => {
    await expect(page.getByText('Instant credit')).toBeVisible();
    await expect(page.getByText('Same-day processing')).toBeVisible();
    await expect(page.getByText('+$4.99 fee')).toBeVisible();
  });

  // === MT-5: Shipping Option Selection ===

  test('MT-5.1: select UPS Pickup', async () => {
    const pickup = page.locator('[data-testid="shipping-option-pickup"]');
    await pickup.click();

    // Pickup becomes selected
    await expect(pickup).toHaveClass(/border-return-accent/);

    // Drop-off becomes unselected
    const dropoff = page.locator('[data-testid="shipping-option-drop-off"]');
    await expect(dropoff).not.toHaveClass(/border-return-accent/);
  });

  test('MT-5.2: select Instant Return', async () => {
    const instant = page.locator('[data-testid="shipping-option-instant"]');
    await instant.click();

    await expect(instant).toHaveClass(/border-return-accent/);

    // Others unselected
    const dropoff = page.locator('[data-testid="shipping-option-drop-off"]');
    const pickup = page.locator('[data-testid="shipping-option-pickup"]');
    await expect(dropoff).not.toHaveClass(/border-return-accent/);
    await expect(pickup).not.toHaveClass(/border-return-accent/);
  });

  test('MT-5.3: re-select Drop-off', async () => {
    const dropoff = page.locator('[data-testid="shipping-option-drop-off"]');
    await dropoff.click();

    await expect(dropoff).toHaveClass(/border-return-accent/);
  });

  test('MT-5.5: only one selected at a time', async () => {
    // Click through all three
    const ids = ['drop-off', 'pickup', 'instant'];
    for (const id of ids) {
      const option = page.locator(`[data-testid="shipping-option-${id}"]`);
      await option.click();

      // Only this one should have return-accent border
      for (const otherId of ids) {
        const other = page.locator(
          `[data-testid="shipping-option-${otherId}"]`,
        );
        if (otherId === id) {
          await expect(other).toHaveClass(/border-return-accent/);
        } else {
          await expect(other).not.toHaveClass(/border-return-accent/);
        }
      }
    }

    // Reset to drop-off
    await page.locator('[data-testid="shipping-option-drop-off"]').click();
  });

  test('MT-5.6: summary updates when selecting Instant', async () => {
    const totalBefore = await page
      .locator('[data-testid="shipping-summary-total"]')
      .textContent();

    await page.locator('[data-testid="shipping-option-instant"]').click();

    const totalAfter = await page
      .locator('[data-testid="shipping-summary-total"]')
      .textContent();

    // Parse amounts — Instant should reduce total by $4.99
    const before = parseFloat(totalBefore?.replace(/[^0-9.]/g, '') ?? '0');
    const after = parseFloat(totalAfter?.replace(/[^0-9.]/g, '') ?? '0');
    expect(before - after).toBeCloseTo(4.99, 1);

    // Reset to drop-off
    await page.locator('[data-testid="shipping-option-drop-off"]').click();
  });

  test('MT-5.7: summary updates back to Free', async () => {
    // Select instant first
    await page.locator('[data-testid="shipping-option-instant"]').click();
    const totalInstant = await page
      .locator('[data-testid="shipping-summary-total"]')
      .textContent();

    // Back to drop-off
    await page.locator('[data-testid="shipping-option-drop-off"]').click();
    const totalFree = await page
      .locator('[data-testid="shipping-summary-total"]')
      .textContent();

    const instant = parseFloat(totalInstant?.replace(/[^0-9.]/g, '') ?? '0');
    const free = parseFloat(totalFree?.replace(/[^0-9.]/g, '') ?? '0');
    expect(free - instant).toBeCloseTo(4.99, 1);
  });

  // === MT-6: Return Address Section ===

  test('MT-6.1: address section has top border', async () => {
    const section = page.locator('[data-testid="return-address-section"]');
    await expect(section).toBeVisible();
    await expect(section).toHaveClass(/border-t/);
  });

  test('MT-6.2: section title shows Return Address', async () => {
    await expect(page.getByText('Return Address')).toBeVisible();
  });

  test('MT-6.4: warehouse name displayed', async () => {
    await expect(page.getByText('Hylee Returns Center')).toBeVisible();
  });

  test('MT-6.5: address lines displayed', async () => {
    await expect(page.getByText('1234 Warehouse Boulevard')).toBeVisible();
    await expect(page.getByText('Building C, Suite 100')).toBeVisible();
    await expect(page.getByText('Seattle, WA 98101')).toBeVisible();
    await expect(page.getByText('United States')).toBeVisible();
  });

  test('MT-6.6: return ID displayed', async () => {
    await expect(page.getByText('Return ID:')).toBeVisible();
    await expect(page.getByText(/RET-/)).toBeVisible();
  });

  // === MT-7: Packing Instructions ===

  test('MT-7.1: instructions section has top border', async () => {
    const section = page.locator('[data-testid="packing-instructions"]');
    await expect(section).toBeVisible();
    await expect(section).toHaveClass(/border-t/);
  });

  test('MT-7.2: section title shows Packing Instructions', async () => {
    await expect(page.getByText('Packing Instructions')).toBeVisible();
  });

  test('MT-7.3: five instruction items displayed', async () => {
    const instructions = page.locator(
      '[data-testid="packing-instructions"] li',
    );
    await expect(instructions).toHaveCount(5);
  });

  test('MT-7.6: instruction text correct', async () => {
    await expect(
      page.getByText('Pack items securely in their original packaging'),
    ).toBeVisible();
    await expect(page.getByText('Include all accessories, tags')).toBeVisible();
    await expect(
      page.getByText('Seal the box tightly with strong packing tape'),
    ).toBeVisible();
    await expect(
      page.getByText('Attach the return label to the outside'),
    ).toBeVisible();
    await expect(
      page.getByText('Remove or cover any old shipping labels'),
    ).toBeVisible();
  });

  // === MT-9: Summary Box ===

  test('MT-9.1: summary container visible', async () => {
    const summary = page.locator('[data-testid="return-shipping-summary"]');
    await expect(summary).toBeVisible();
  });

  test('MT-9.2: items being returned shows count', async () => {
    await expect(page.getByText('Items being returned')).toBeVisible();
  });

  test('MT-9.3: return shipping shows Free (with Drop-off)', async () => {
    // Ensure drop-off is selected
    await page.locator('[data-testid="shipping-option-drop-off"]').click();

    const summary = page.locator('[data-testid="return-shipping-summary"]');
    const shippingRow = summary.getByText('Free');
    await expect(shippingRow).toBeVisible();
  });

  test('MT-9.5: divider above total', async () => {
    const total = page.locator('[data-testid="shipping-summary-total"]');
    const parent = total.locator('..');
    await expect(parent).toHaveClass(/border-t-2/);
  });

  test('MT-9.6: total refund displayed', async () => {
    const total = page.locator('[data-testid="shipping-summary-total"]');
    await expect(total).toBeVisible();
    const text = await total.textContent();
    expect(text).toMatch(/\$[\d,.]+/);
  });

  // === MT-10: Return Tracking Notice ===

  test('MT-10.1: tracking notice visible', async () => {
    const notice = page.locator('[data-testid="return-tracking-notice"]');
    await expect(notice).toBeVisible();
  });

  test('MT-10.2: tracking header text', async () => {
    await expect(page.getByText('Return Tracking')).toBeVisible();
  });

  test('MT-10.3: tracking body text', async () => {
    await expect(
      page.getByText("You'll receive email updates at each step"),
    ).toBeVisible();
  });

  // === MT-11: Action Buttons ===

  test('MT-11.1: both buttons visible', async () => {
    const cancel = page.locator('[data-testid="return-cancel-btn"]');
    const cont = page.locator('[data-testid="return-continue-btn"]');
    await expect(cancel).toBeVisible();
    await expect(cont).toBeVisible();
  });

  test('MT-11.2: cancel button text', async () => {
    await expect(page.locator('[data-testid="return-cancel-btn"]')).toHaveText(
      'Cancel',
    );
  });

  test('MT-11.3: continue button text', async () => {
    await expect(
      page.locator('[data-testid="return-continue-btn"]'),
    ).toHaveText('Continue to Make It Right');
  });

  test('MT-11.4: continue always enabled', async () => {
    const cont = page.locator('[data-testid="return-continue-btn"]');
    await expect(cont).not.toHaveAttribute('disabled');
    await expect(cont).not.toHaveClass(/opacity-50/);
  });

  test('MT-11.5: cancel navigates back to Step 2', async () => {
    const cancel = page.locator('[data-testid="return-cancel-btn"]');
    const href = await cancel.getAttribute('href');
    expect(href).toContain('/return/reason');
    expect(href).toContain('items=');
  });

  test('MT-11.7: buttons not sticky', async () => {
    const cont = page.locator('[data-testid="return-continue-btn"]');
    const position = await getComputedStyle(cont, 'position');
    expect(position).not.toBe('fixed');
    expect(position).not.toBe('sticky');
  });

  // === MT-12: Edge Cases ===

  test('MT-12.5: currency formatting', async () => {
    const total = page.locator('[data-testid="shipping-summary-total"]');
    const text = await total.textContent();
    expect(text).toMatch(/^\$[\d,]+\.\d{2}$/);
  });

  test('MT-12.6: sidebar hidden on return route', async () => {
    // Account sidebar should not be visible
    const sidebar = page.locator('[data-testid="account-sidebar"]');
    await expect(sidebar).toHaveCount(0);
  });

  test('MT-12.7: page refresh preserves URL params', async () => {
    const urlBefore = page.url();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Return Shipping', {
      timeout: 15000,
    });
    expect(page.url()).toBe(urlBefore);
  });
});

// ============================================================================
// Tablet Tests (768x1024)
// ============================================================================

test.describe('Return Shipping (Step 3) — Tablet', () => {
  test.use({viewport: {width: 768, height: 1024}});
  test.describe.configure({mode: 'serial'});

  let page: Page;

  test.beforeAll(async ({browser}) => {
    page = await browser.newPage();
    await navigateToStep3(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('MT-1.3 (tablet): page loads correctly', async () => {
    await expect(page.locator('h1')).toHaveText('Return Shipping');
  });

  test('MT-2.4 (tablet): step labels visible', async () => {
    await expect(
      page.locator('[data-testid="return-step-1"]').getByText('Select Items'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="return-step-3"]').getByText('Ship'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="return-step-4"]').getByText('Make It Right'),
    ).toBeVisible();
  });

  test('MT-4.1 (tablet): three shipping options', async () => {
    const options = page.locator('[data-testid^="shipping-option-"]');
    await expect(options).toHaveCount(3);
  });

  test('MT-5.1 (tablet): option selection works', async () => {
    const pickup = page.locator('[data-testid="shipping-option-pickup"]');
    await pickup.click();
    await expect(pickup).toHaveClass(/border-return-accent/);

    // Reset
    await page.locator('[data-testid="shipping-option-drop-off"]').click();
  });

  test('MT-9.3 (tablet): summary shows Free', async () => {
    const summary = page.locator('[data-testid="return-shipping-summary"]');
    await expect(summary.getByText('Free')).toBeVisible();
  });

  test('MT-11.1 (tablet): action buttons visible', async () => {
    await expect(
      page.locator('[data-testid="return-cancel-btn"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="return-continue-btn"]'),
    ).toBeVisible();
  });
});
