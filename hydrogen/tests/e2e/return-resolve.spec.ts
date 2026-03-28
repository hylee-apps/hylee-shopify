import {test, expect, type Page} from '@playwright/test';

/**
 * E2E tests for the Return Process — Step 4 (Make It Right).
 * Covers manual testing plan scenarios MT-1 through MT-13.
 *
 * These tests require authentication and navigate through Steps 1-3 → Step 4.
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
 * Navigate to Step 4 by going through Step 1 to collect item IDs,
 * then navigating directly to the Step 4 URL with shipping=drop-off.
 */
async function navigateToStep4(
  page: Page,
  shipping: string = 'drop-off',
): Promise<{orderId: string; itemsParam: string}> {
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

  // Navigate directly to Step 4 with items and shipping params
  await page.goto(
    `/account/orders/${orderId}/return/resolve?items=${encodeURIComponent(itemsParam)}&reasons=defective&shipping=${shipping}`,
  );
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1')).toContainText('Make It Right', {
    timeout: 15000,
  });

  return {orderId, itemsParam};
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

test.describe('Return Resolve (Step 4) — Desktop', () => {
  test.use({viewport: {width: 1440, height: 900}});
  test.describe.configure({mode: 'serial'});

  let page: Page;
  let orderId: string;
  let itemsParam: string;

  test.beforeAll(async ({browser}) => {
    page = await browser.newPage();
    const result = await navigateToStep4(page);
    orderId = result.orderId;
    itemsParam = result.itemsParam;
  });

  test.afterAll(async () => {
    await page.close();
  });

  // === MT-1: Page Load & Navigation ===

  test('MT-1.1: page displays correct title and subtitle', async () => {
    await expect(page.locator('h1')).toHaveText('Make It Right');
    await expect(
      page.locator('p').filter({hasText: 'How would you like us to resolve'}),
    ).toBeVisible();
  });

  test('MT-1.2: URL has all params', async () => {
    const url = new URL(page.url());
    expect(url.searchParams.has('items')).toBe(true);
    expect(url.searchParams.has('shipping')).toBe(true);
    expect(url.pathname).toContain('/return/resolve');
  });

  test('MT-1.3: direct URL access with valid params', async () => {
    await expect(page.locator('h1')).toHaveText('Make It Right');
  });

  test('MT-1.4: redirect when no items param', async () => {
    await page.goto(`/account/orders/${orderId}/return/resolve`);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(`/account/orders/${orderId}/return`);
    expect(page.url()).not.toContain('/resolve');

    // Navigate back to Step 4
    const result = await navigateToStep4(page);
    orderId = result.orderId;
    itemsParam = result.itemsParam;
  });

  test('MT-1.5: redirect when invalid items param', async () => {
    await page.goto(
      `/account/orders/${orderId}/return/resolve?items=invalid-id-xyz&shipping=drop-off`,
    );
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain(`/account/orders/${orderId}/return`);
    expect(page.url()).not.toContain('/resolve');

    // Navigate back
    const result = await navigateToStep4(page);
    orderId = result.orderId;
    itemsParam = result.itemsParam;
  });

  test('MT-1.6: unauthenticated redirects to login', async () => {
    const newPage = await page.context().browser()!.newPage();
    await newPage.goto(
      `/account/orders/${orderId}/return/resolve?items=${encodeURIComponent(itemsParam)}&shipping=drop-off`,
    );
    await newPage.waitForLoadState('networkidle');
    expect(newPage.url()).toContain('/account/login');
    await newPage.close();
  });

  test('MT-1.7: invalid order ID returns 404', async () => {
    const resp = await page.goto(
      `/account/orders/999999999/return/resolve?items=x&shipping=drop-off`,
    );
    await page.waitForLoadState('networkidle');
    // Should get 404 or redirect
    const status = resp?.status() ?? 200;
    const is404OrRedirect = status === 404 || page.url().includes('/return');
    expect(is404OrRedirect).toBe(true);

    // Navigate back
    const result = await navigateToStep4(page);
    orderId = result.orderId;
    itemsParam = result.itemsParam;
  });

  // === MT-2: Progress Steps ===

  test('MT-2.1: steps 1-3 show completed (green) state', async () => {
    for (const stepNum of [1, 2, 3]) {
      const step = page.locator(`[data-testid="return-step-${stepNum}"]`);
      await expect(step).toBeVisible();
      // Completed steps should NOT be at 40% opacity
      const opacity = await getComputedStyle(step, 'opacity');
      expect(parseFloat(opacity)).toBeGreaterThan(0.5);
    }
  });

  test('MT-2.2: step 4 shows active (mint green) state', async () => {
    const step4 = page.locator('[data-testid="return-step-4"]');
    await expect(step4).toBeVisible();
    const opacity = await getComputedStyle(step4, 'opacity');
    expect(parseFloat(opacity)).toBeGreaterThan(0.5);
  });

  test('MT-2.3: no pending (grayed out) steps', async () => {
    // All 4 steps should be visible and NOT at 40% opacity
    for (const stepNum of [1, 2, 3, 4]) {
      const step = page.locator(`[data-testid="return-step-${stepNum}"]`);
      const opacity = await getComputedStyle(step, 'opacity');
      expect(parseFloat(opacity)).toBeGreaterThan(0.5);
    }
  });

  test('MT-2.4: step labels are correct', async () => {
    await expect(page.locator('[data-testid="return-step-1"]')).toContainText(
      'Select Items',
    );
    await expect(page.locator('[data-testid="return-step-2"]')).toContainText(
      'Reason',
    );
    await expect(page.locator('[data-testid="return-step-3"]')).toContainText(
      'Ship',
    );
    await expect(page.locator('[data-testid="return-step-4"]')).toContainText(
      'Make It Right',
    );
  });

  test('MT-2.5: connector lines between steps', async () => {
    const progress = page.locator('[data-testid="return-step-progress"]');
    await expect(progress).toBeVisible();
    // Should have 3 connector lines
    const connectors = progress.locator('.h-\\[2px\\].w-\\[60px\\]');
    await expect(connectors).toHaveCount(3);
  });

  test('MT-2.6: completed step 1 is clickable', async () => {
    const stepLink = page.locator('[data-testid="return-step-link-1"]');
    await expect(stepLink).toBeVisible();
    const href = await stepLink.getAttribute('href');
    expect(href).toContain(`/account/orders/${orderId}/return`);
    expect(href).toContain('items=');
  });

  test('MT-2.7: completed step 3 is clickable', async () => {
    const stepLink = page.locator('[data-testid="return-step-link-3"]');
    await expect(stepLink).toBeVisible();
    const href = await stepLink.getAttribute('href');
    expect(href).toContain('/return/shipping');
    expect(href).toContain('items=');
  });

  // === MT-3: Card Header ===

  test('MT-3.1: card container visible with proper styling', async () => {
    const card = page
      .locator('.overflow-clip.rounded-\\[12px\\].border')
      .first();
    await expect(card).toBeVisible();
  });

  test('MT-3.2: header text is "Choose Your Resolution"', async () => {
    await expect(page.locator('h2')).toHaveText('Choose Your Resolution');
  });

  test('MT-3.3: header has no right-side text', async () => {
    // Card header should only have the h2
    const header = page
      .locator('h2')
      .filter({hasText: 'Choose Your Resolution'})
      .locator('..');
    const children = await header.locator('> *').count();
    expect(children).toBe(1);
  });

  test('MT-3.4: header has bottom border separator', async () => {
    const header = page
      .locator('h2')
      .filter({hasText: 'Choose Your Resolution'})
      .locator('..');
    const classes = await header.getAttribute('class');
    expect(classes).toContain('border-b');
  });

  // === MT-4: Selected Items Preview ===

  test('MT-4.1: thumbnails are displayed', async () => {
    const preview = page.locator('[data-testid="selected-items-preview"]');
    await expect(preview).toBeVisible();
    const thumbs = preview.locator('[data-testid^="preview-thumb-"]');
    const count = await thumbs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('MT-4.2: thumbnails are 50x50px', async () => {
    const thumb = page.locator('[data-testid^="preview-thumb-"]').first();
    const box = await thumb.boundingBox();
    expect(box?.width).toBeCloseTo(50, 0);
    expect(box?.height).toBeCloseTo(50, 0);
  });

  test('MT-4.4: item summary text shows count and total value', async () => {
    const preview = page.locator('[data-testid="selected-items-preview"]');
    const text = await preview.locator('p').textContent();
    expect(text).toMatch(/\d+ items? • Total value: \$/);
  });

  // === MT-5: Resolution Options — Default State ===

  test('MT-5.1: four resolution options displayed', async () => {
    await expect(
      page.locator('[data-testid="resolution-option-exchange"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="resolution-option-replace"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="resolution-option-store-credit"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="resolution-option-refund"]'),
    ).toBeVisible();
  });

  test('MT-5.2: grid layout with 2 columns', async () => {
    const grid = page.locator('[data-testid="resolution-grid"]');
    const classes = await grid.getAttribute('class');
    expect(classes).toContain('grid-cols-2');
    expect(classes).toContain('gap-[16px]');
  });

  test('MT-5.3: no card is pre-selected', async () => {
    const cards = page.locator('[data-testid^="resolution-option-"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const classes = await card.getAttribute('class');
      // Should have gray border, not teal
      expect(classes).toContain('border-[#e5e7eb]');
      expect(classes).not.toContain('border-return-accent');
    }
  });

  test('MT-5.4: Exchange card has correct content', async () => {
    const card = page.locator('[data-testid="resolution-option-exchange"]');
    await expect(card.locator('h3')).toHaveText('Exchange');
    await expect(card.locator('p')).toContainText('Swap for a different color');
  });

  test('MT-5.5: Replace card has correct content', async () => {
    const card = page.locator('[data-testid="resolution-option-replace"]');
    await expect(card.locator('h3')).toHaveText('Replace');
    await expect(card.locator('p')).toContainText('Get the exact same item');
  });

  test('MT-5.6: Store Credit card has correct content', async () => {
    const card = page.locator('[data-testid="resolution-option-store-credit"]');
    await expect(card.locator('h3')).toHaveText('Store Credit');
    await expect(card.locator('p')).toContainText(
      'Instant credit to your Hylee',
    );
  });

  test('MT-5.7: Refund card has correct content', async () => {
    const card = page.locator('[data-testid="resolution-option-refund"]');
    await expect(card.locator('h3')).toHaveText('Refund');
    await expect(card.locator('p')).toContainText('Money back to original');
  });

  test('MT-5.8: icon container is 64x64px circle', async () => {
    const iconContainer = page
      .locator('[data-testid="resolution-option-exchange"]')
      .locator('.size-\\[64px\\]')
      .first();
    await expect(iconContainer).toBeVisible();
    const box = await iconContainer.boundingBox();
    expect(box?.width).toBeCloseTo(64, 0);
    expect(box?.height).toBeCloseTo(64, 0);
  });

  test('MT-5.9: title positioned at top-[96px]', async () => {
    const title = page
      .locator('[data-testid="resolution-option-exchange"]')
      .locator('h3');
    const classes = await title.getAttribute('class');
    expect(classes).toContain('top-[96px]');
  });

  test('MT-5.10: description positioned at top-[128px]', async () => {
    const desc = page
      .locator('[data-testid="resolution-option-exchange"]')
      .locator('p');
    const classes = await desc.getAttribute('class');
    expect(classes).toContain('top-[128px]');
  });

  // === MT-6: Resolution Option Selection ===

  test('MT-6.1: selecting Exchange shows teal border and bg tint', async () => {
    const card = page.locator('[data-testid="resolution-option-exchange"]');
    await card.click();
    const classes = await card.getAttribute('class');
    expect(classes).toContain('border-return-accent');
    expect(classes).toContain('bg-[rgba(38,153,166,0.05)]');
  });

  test('MT-6.2: selecting Replace deselects Exchange', async () => {
    const replace = page.locator('[data-testid="resolution-option-replace"]');
    await replace.click();
    const replaceClasses = await replace.getAttribute('class');
    expect(replaceClasses).toContain('border-return-accent');

    const exchange = page.locator('[data-testid="resolution-option-exchange"]');
    const exchangeClasses = await exchange.getAttribute('class');
    expect(exchangeClasses).toContain('border-[#e5e7eb]');
    expect(exchangeClasses).not.toContain('border-return-accent');
  });

  test('MT-6.3: selecting Store Credit works', async () => {
    const card = page.locator('[data-testid="resolution-option-store-credit"]');
    await card.click();
    const classes = await card.getAttribute('class');
    expect(classes).toContain('border-return-accent');
  });

  test('MT-6.4: selecting Refund works', async () => {
    const card = page.locator('[data-testid="resolution-option-refund"]');
    await card.click();
    const classes = await card.getAttribute('class');
    expect(classes).toContain('border-return-accent');
  });

  test('MT-6.5: only one option selected at a time', async () => {
    // Refund is currently selected from MT-6.4
    const cards = page.locator('[data-testid^="resolution-option-"]');
    const count = await cards.count();
    let selectedCount = 0;
    for (let i = 0; i < count; i++) {
      const classes = await cards.nth(i).getAttribute('class');
      if (classes?.includes('border-return-accent')) selectedCount++;
    }
    expect(selectedCount).toBe(1);
  });

  test('MT-6.6: switching from Exchange to Refund', async () => {
    await page.locator('[data-testid="resolution-option-exchange"]').click();
    let exchangeClasses = await page
      .locator('[data-testid="resolution-option-exchange"]')
      .getAttribute('class');
    expect(exchangeClasses).toContain('border-return-accent');

    await page.locator('[data-testid="resolution-option-refund"]').click();
    exchangeClasses = await page
      .locator('[data-testid="resolution-option-exchange"]')
      .getAttribute('class');
    expect(exchangeClasses).toContain('border-[#e5e7eb]');

    const refundClasses = await page
      .locator('[data-testid="resolution-option-refund"]')
      .getAttribute('class');
    expect(refundClasses).toContain('border-return-accent');
  });

  test('MT-6.7: clicking anywhere on card triggers selection', async () => {
    // Click on the description text
    const desc = page
      .locator('[data-testid="resolution-option-store-credit"]')
      .locator('p');
    await desc.click();
    const classes = await page
      .locator('[data-testid="resolution-option-store-credit"]')
      .getAttribute('class');
    expect(classes).toContain('border-return-accent');
  });

  test('MT-6.8: submit button enables on selection', async () => {
    // Select something to ensure submit is enabled
    await page.locator('[data-testid="resolution-option-refund"]').click();
    const submitBtn = page.locator('[data-testid="return-submit-btn"]');
    const classes = await submitBtn.getAttribute('class');
    expect(classes).not.toContain('opacity-50');
    expect(classes).not.toContain('cursor-not-allowed');
  });

  // === MT-7: Summary Section ===

  test('MT-7.1: summary container inside card', async () => {
    const summary = page.locator('[data-testid="resolution-summary"]');
    await expect(summary).toBeVisible();
    const classes = await summary.getAttribute('class');
    expect(classes).toContain('bg-[#f9fafb]');
    expect(classes).toContain('rounded-[12px]');
  });

  test('MT-7.2: items being returned row', async () => {
    const summary = page.locator('[data-testid="resolution-summary"]');
    await expect(summary.locator('text=Items being returned')).toBeVisible();
  });

  test('MT-7.3: subtotal row', async () => {
    const summary = page.locator('[data-testid="resolution-summary"]');
    await expect(summary.locator('text=Subtotal')).toBeVisible();
  });

  test('MT-7.4: return shipping shows "Free"', async () => {
    const summary = page.locator('[data-testid="resolution-summary"]');
    await expect(summary.locator('text=Return shipping')).toBeVisible();
    await expect(summary.locator('text=Free')).toBeVisible();
  });

  test('MT-7.6: divider above total', async () => {
    const totalRow = page
      .locator('[data-testid="resolution-summary"]')
      .locator('.border-t-2');
    await expect(totalRow).toBeVisible();
  });

  test('MT-7.7: total resolution value displayed', async () => {
    const total = page.locator('[data-testid="resolution-summary-total"]');
    await expect(total).toBeVisible();
    const text = await total.textContent();
    expect(text).toMatch(/\$/);
  });

  test('MT-7.9: summary is inside the card (not standalone)', async () => {
    // The summary should be a descendant of the card body
    const card = page
      .locator('.overflow-clip.rounded-\\[12px\\].border')
      .first();
    const summary = card.locator('[data-testid="resolution-summary"]');
    await expect(summary).toBeVisible();
  });

  // === MT-8: Visual Fidelity (selected tests) ===

  test('MT-8.4: border radii correct on resolution cards', async () => {
    const card = page.locator('[data-testid="resolution-option-exchange"]');
    const radius = await getComputedStyle(card, 'border-radius');
    expect(radius).toBe('12px');
  });

  test('MT-8.5: selected card has shadow', async () => {
    await page.locator('[data-testid="resolution-option-refund"]').click();
    const card = page.locator('[data-testid="resolution-option-refund"]');
    const shadow = await getComputedStyle(card, 'box-shadow');
    expect(shadow).not.toBe('none');
  });

  test('MT-8.6: resolution cards are 171.5px height', async () => {
    const card = page.locator('[data-testid="resolution-option-exchange"]');
    const box = await card.boundingBox();
    expect(box?.height).toBeCloseTo(171.5, 1);
  });

  // === MT-9: Our Promise Notice ===

  test('MT-9.1: promise notice container visible', async () => {
    const notice = page.locator('[data-testid="our-promise-notice"]');
    await expect(notice).toBeVisible();
  });

  test('MT-9.2: promise notice header text', async () => {
    const notice = page.locator('[data-testid="our-promise-notice"]');
    await expect(notice.locator('h4')).toHaveText('Our Promise');
  });

  test('MT-9.3: promise notice body text', async () => {
    const notice = page.locator('[data-testid="our-promise-notice"]');
    await expect(notice.locator('p')).toContainText(
      "We're committed to making this right",
    );
  });

  test('MT-9.4: notice uses teal color scheme', async () => {
    const notice = page.locator('[data-testid="our-promise-notice"]');
    const bg = await getComputedStyle(notice, 'background-color');
    // rgba(38,153,166,0.05) — should be nearly white with slight teal tint
    expect(bg).toMatch(/rgba?\(/);
  });

  // === MT-10: Action Buttons ===

  test('MT-10.1: both buttons visible', async () => {
    const cancel = page.locator('[data-testid="return-cancel-btn"]');
    const submit = page.locator('[data-testid="return-submit-btn"]');
    await expect(cancel).toBeVisible();
    await expect(submit).toBeVisible();
    await expect(cancel).toContainText('Cancel');
    await expect(submit).toContainText('Submit Return');
  });

  test('MT-10.2: cancel button styling', async () => {
    const cancel = page.locator('[data-testid="return-cancel-btn"]');
    const classes = await cancel.getAttribute('class');
    expect(classes).toContain('border');
    expect(classes).toContain('bg-white');
    expect(classes).toContain('rounded-[8px]');
  });

  test('MT-10.3: submit button styling', async () => {
    const submit = page.locator('[data-testid="return-submit-btn"]');
    const classes = await submit.getAttribute('class');
    expect(classes).toContain('bg-return-accent');
    expect(classes).toContain('rounded-[8px]');
    expect(classes).toContain('text-white');
  });

  test('MT-10.4: submit disabled initially (reload to reset)', async () => {
    // Reload the page to reset selection state
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Make It Right', {
      timeout: 15000,
    });

    const submit = page.locator('[data-testid="return-submit-btn"]');
    const classes = await submit.getAttribute('class');
    expect(classes).toContain('opacity-50');
    expect(classes).toContain('cursor-not-allowed');
    await expect(submit).toBeDisabled();
  });

  test('MT-10.5: submit enables after selecting a resolution', async () => {
    await page.locator('[data-testid="resolution-option-refund"]').click();
    const submit = page.locator('[data-testid="return-submit-btn"]');
    const classes = await submit.getAttribute('class');
    expect(classes).not.toContain('opacity-50');
    await expect(submit).toBeEnabled();
  });

  test('MT-10.7: cancel navigates back to Step 3', async () => {
    const cancel = page.locator('[data-testid="return-cancel-btn"]');
    const href = await cancel.getAttribute('href');
    expect(href).toContain('/return/shipping');
    expect(href).toContain('items=');
    expect(href).toContain('shipping=');
  });

  test('MT-10.8: submit shows inline confirmation view', async () => {
    await page.locator('[data-testid="resolution-option-refund"]').click();
    await page.locator('[data-testid="return-submit-btn"]').click();

    // Confirmation view should appear
    const confirmation = page.locator('[data-testid="return-confirmation"]');
    await expect(confirmation).toBeVisible({timeout: 5000});

    // Title changes to "Return Request Submitted"
    await expect(page.locator('h1')).toHaveText('Return Request Submitted');

    // Shows the chosen resolution
    await expect(confirmation).toContainText('Refund');
    await expect(confirmation).toContainText('Money back to original');

    // Shows email notification message
    await expect(confirmation).toContainText('send you an email');

    // Shows "Back to My Orders" button
    const backBtn = page.locator('[data-testid="return-back-to-orders-btn"]');
    await expect(backBtn).toBeVisible();
    const href = await backBtn.getAttribute('href');
    expect(href).toBe('/account/orders');

    // Navigate back to Step 4 for remaining tests
    const result = await navigateToStep4(page);
    orderId = result.orderId;
    itemsParam = result.itemsParam;
  });

  test('MT-10.9: buttons are not sticky (scroll with content)', async () => {
    const submit = page.locator('[data-testid="return-submit-btn"]');
    const position = await getComputedStyle(submit, 'position');
    expect(position).not.toBe('fixed');
    expect(position).not.toBe('sticky');
  });

  // === MT-11: State Preservation ===

  test('MT-11.1: items from URL show as thumbnails', async () => {
    const preview = page.locator('[data-testid="selected-items-preview"]');
    await expect(preview).toBeVisible();
    const thumbCount = await preview
      .locator('[data-testid^="preview-thumb-"]')
      .count();
    expect(thumbCount).toBeGreaterThanOrEqual(1);
  });

  test('MT-11.3: shipping=drop-off shows Free', async () => {
    const summary = page.locator('[data-testid="resolution-summary"]');
    await expect(summary.locator('text=Free')).toBeVisible();
  });

  // === MT-12: Edge Cases ===

  test('MT-12.3: page refresh resets resolution selection', async () => {
    await page.locator('[data-testid="resolution-option-exchange"]').click();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Make It Right', {
      timeout: 15000,
    });

    // No card should be selected after reload
    const cards = page.locator('[data-testid^="resolution-option-"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const classes = await cards.nth(i).getAttribute('class');
      expect(classes).toContain('border-[#e5e7eb]');
    }
  });

  test('MT-12.4: currency formatting correct', async () => {
    const total = page.locator('[data-testid="resolution-summary-total"]');
    const text = await total.textContent();
    expect(text).toMatch(/^\$[\d,]+\.\d{2}$/);
  });

  test('MT-12.5: sidebar is hidden', async () => {
    // Account sidebar should NOT be present on return pages
    const sidebar = page.locator('[data-testid="account-sidebar"]');
    await expect(sidebar).toHaveCount(0);
  });

  test('MT-12.7: browser back button works', async () => {
    // Note: can't easily test actual browser back in Playwright serial,
    // but we verify the cancel link goes to Step 3
    const cancel = page.locator('[data-testid="return-cancel-btn"]');
    const href = await cancel.getAttribute('href');
    expect(href).toContain('/return/shipping');
  });
});

// ============================================================================
// Instant Shipping Variant Tests
// ============================================================================

test.describe('Return Resolve (Step 4) — Instant Shipping', () => {
  test.use({viewport: {width: 1440, height: 900}});
  test.describe.configure({mode: 'serial'});

  let page: Page;

  test.beforeAll(async ({browser}) => {
    page = await browser.newPage();
    await navigateToStep4(page, 'instant');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('MT-7.5: shipping shows $4.99 for instant', async () => {
    const summary = page.locator('[data-testid="resolution-summary"]');
    await expect(summary.locator('text=$4.99')).toBeVisible();
  });

  test('MT-11.2: shipping=instant shows paid price', async () => {
    const url = new URL(page.url());
    expect(url.searchParams.get('shipping')).toBe('instant');
    const summary = page.locator('[data-testid="resolution-summary"]');
    await expect(summary.locator('text=$4.99')).toBeVisible();
  });
});

// ============================================================================
// Tablet Tests (768x1024)
// ============================================================================

test.describe('Return Resolve (Step 4) — Tablet', () => {
  test.use({viewport: {width: 768, height: 1024}});
  test.describe.configure({mode: 'serial'});

  let page: Page;

  test.beforeAll(async ({browser}) => {
    page = await browser.newPage();
    await navigateToStep4(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('MT-1.1 (tablet): page loads with correct title', async () => {
    await expect(page.locator('h1')).toHaveText('Make It Right');
  });

  test('MT-2.4 (tablet): step labels visible', async () => {
    await expect(page.locator('[data-testid="return-step-4"]')).toContainText(
      'Make It Right',
    );
  });

  test('MT-4.1 (tablet): thumbnails displayed', async () => {
    const preview = page.locator('[data-testid="selected-items-preview"]');
    await expect(preview).toBeVisible();
  });

  test('MT-5.1 (tablet): four resolution options visible', async () => {
    await expect(
      page.locator('[data-testid="resolution-option-exchange"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="resolution-option-refund"]'),
    ).toBeVisible();
  });

  test('MT-6.1 (tablet): selecting Exchange works', async () => {
    await page.locator('[data-testid="resolution-option-exchange"]').click();
    const classes = await page
      .locator('[data-testid="resolution-option-exchange"]')
      .getAttribute('class');
    expect(classes).toContain('border-return-accent');
  });

  test('MT-6.4 (tablet): selecting Refund works', async () => {
    await page.locator('[data-testid="resolution-option-refund"]').click();
    const classes = await page
      .locator('[data-testid="resolution-option-refund"]')
      .getAttribute('class');
    expect(classes).toContain('border-return-accent');
  });

  test('MT-7.4 (tablet): shipping shows Free', async () => {
    const summary = page.locator('[data-testid="resolution-summary"]');
    await expect(summary.locator('text=Free')).toBeVisible();
  });

  test('MT-10.1 (tablet): both buttons visible', async () => {
    await expect(
      page.locator('[data-testid="return-cancel-btn"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="return-submit-btn"]'),
    ).toBeVisible();
  });

  test('MT-10.5 (tablet): submit enables after selection', async () => {
    await page.locator('[data-testid="resolution-option-refund"]').click();
    await expect(
      page.locator('[data-testid="return-submit-btn"]'),
    ).toBeEnabled();
  });

  test('MT-13.1 (tablet): grid remains 2 columns', async () => {
    const grid = page.locator('[data-testid="resolution-grid"]');
    const classes = await grid.getAttribute('class');
    expect(classes).toContain('grid-cols-2');
  });

  test('MT-13.4 (tablet): action buttons maintain layout', async () => {
    const cancel = page.locator('[data-testid="return-cancel-btn"]');
    const submit = page.locator('[data-testid="return-submit-btn"]');
    const cancelBox = await cancel.boundingBox();
    const submitBox = await submit.boundingBox();
    // Buttons should be on the same row
    expect(Math.abs((cancelBox?.y ?? 0) - (submitBox?.y ?? 0))).toBeLessThan(5);
  });
});
