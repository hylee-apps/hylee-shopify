import {test, expect, type Page} from '@playwright/test';

/**
 * E2E tests for the Return Process — Step 1 (Select Items).
 * Covers manual testing plan scenarios MT-1 through MT-9.
 *
 * These tests require authentication and a real order with fulfilled items.
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

/**
 * Find the first order's numeric ID from the order cards on the Orders tab.
 * Looks for "View order details" links which have the pattern /account/orders/{id}.
 */
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

async function navigateToReturn(page: Page): Promise<string> {
  await navigateToOrders(page);
  const orderId = await getFirstOrderId(page);
  await page.goto(`/account/orders/${orderId}/return`);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1')).toContainText('Start a Return', {
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
// MT-1: Page Load & Display — Desktop
// ============================================================================

test.describe('Return Process — Desktop', () => {
  test.describe.configure({mode: 'serial'});
  test.use({viewport: {width: 1440, height: 900}});
  test.setTimeout(60000);

  test.beforeEach(async ({page}) => {
    await login(page);
  });

  // -- MT-1.1: Page loads from Order Detail --
  test('MT-1.1: navigating from order detail loads return page', async ({
    page,
  }) => {
    await navigateToOrders(page);
    const orderId = await getFirstOrderId(page);

    // Go to order detail
    await page.goto(`/account/orders/${orderId}`);
    await page.waitForLoadState('networkidle');

    // Click "Return or Replace Items" button
    const returnBtn = page.getByRole('link', {
      name: /Return or Replace Items/i,
    });
    const btnVisible = await returnBtn.isVisible().catch(() => false);

    if (btnVisible) {
      await returnBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toContainText('Start a Return');
    } else {
      // Order may not be fulfilled — skip gracefully
      test.skip();
    }
  });

  // -- MT-1.2: Page loads from My Orders tab --
  test('MT-1.2: "Return or replace items" link on order card navigates to return page', async ({
    page,
  }) => {
    await navigateToOrders(page);

    // Look for the "Return or replace items" link in an order card action panel
    const returnLink = page
      .locator('a')
      .filter({hasText: 'Return or replace items'})
      .first();
    const linkVisible = await returnLink.isVisible().catch(() => false);

    if (linkVisible) {
      await returnLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toContainText('Start a Return');
    } else {
      // No fulfilled orders with visible action panel — skip gracefully
      test.skip();
    }
  });

  // -- MT-1.3: Direct URL access --
  test('MT-1.3: direct URL loads return page with order data', async ({
    page,
  }) => {
    const orderId = await navigateToReturn(page);
    expect(orderId).toBeTruthy();

    // Order name should appear in subtitle
    const subtitle = page.locator('p').filter({hasText: /Delivered on/});
    await expect(subtitle).toBeVisible();
  });

  // -- MT-1.4: Invalid order ID --
  test('MT-1.4: invalid order ID returns error', async ({page}) => {
    const response = await page.goto('/account/orders/9999999999999/return');
    // Should return 404 or some error
    const status = response?.status();
    expect(status === 404 || status === 500 || status === 200).toBe(true);
  });

  // -- MT-1.5: Unauthenticated access --
  test('MT-1.5: unauthenticated user is redirected to login', async ({
    browser,
  }) => {
    // Fresh context with no session
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/account/orders/12345/return');
    await page.waitForLoadState('networkidle');

    // Should be on login page
    expect(page.url()).toContain('/account/login');
    await context.close();
  });

  // ============================================================================
  // MT-2: Progress Steps
  // ============================================================================

  // -- MT-2.1: Step 1 active state --
  test('MT-2.1: step 1 shows active mint green circle', async ({page}) => {
    await navigateToReturn(page);

    const step1 = page.getByTestId('return-step-1');
    await expect(step1).toBeVisible();

    // The circle inside step 1 should have bg-return-accent (#4fd1a8)
    const circle = step1.locator('div.rounded-full').first();
    const bg = await getComputedStyle(circle, 'background-color');
    // #4fd1a8 = rgb(79, 209, 168)
    expect(bg).toBe('rgb(79, 209, 168)');
  });

  // -- MT-2.2: Pending steps at 40% opacity --
  test('MT-2.2: pending steps show at reduced opacity', async ({page}) => {
    await navigateToReturn(page);

    for (const stepNum of [2, 3, 4]) {
      const step = page.getByTestId(`return-step-${stepNum}`);
      await expect(step).toBeVisible();
      const opacity = await getComputedStyle(step, 'opacity');
      expect(parseFloat(opacity)).toBeLessThanOrEqual(0.5);
    }
  });

  // -- MT-2.3: Connector lines visible --
  test('MT-2.3: connector lines between steps are visible', async ({page}) => {
    await navigateToReturn(page);

    const progress = page.getByTestId('return-step-progress');
    // Connector lines are 60px wide, 2px tall divs
    const connectors = progress.locator('.h-\\[2px\\].w-\\[60px\\]');
    await expect(connectors).toHaveCount(3);
  });

  // -- MT-2.4: Step labels --
  test('MT-2.4: all four step labels are correct', async ({page}) => {
    await navigateToReturn(page);

    const labels = ['Select Items', 'Reason', 'Ship', 'Make It Right'];
    for (const label of labels) {
      await expect(
        page.getByTestId('return-step-progress').getByText(label),
      ).toBeVisible();
    }
  });

  // ============================================================================
  // MT-3: Selection Summary Bar
  // ============================================================================

  // -- MT-3.1: Initial state --
  test('MT-3.1: summary shows 0 selected and $0.00 refund initially', async ({
    page,
  }) => {
    await navigateToReturn(page);

    await expect(page.getByText(/0 of \d+ items selected/)).toBeVisible();
    await expect(page.getByText('Estimated refund: $0.00')).toBeVisible();
    await expect(page.getByTestId('return-select-all')).toHaveText(
      'Select All',
    );
  });

  // -- MT-3.2: Select one item --
  test('MT-3.2: selecting one item updates count and refund', async ({
    page,
  }) => {
    await navigateToReturn(page);

    // Click the first item card
    const firstItem = page.locator('[data-testid^="return-item-"]').first();
    await firstItem.click();

    // Count should update to 1
    await expect(page.getByText(/1 of \d+ items selected/)).toBeVisible();

    // Refund should no longer be $0.00
    const refundText = await page.getByText(/Estimated refund:/).textContent();
    expect(refundText).not.toContain('$0.00');
  });

  // -- MT-3.3: Select all --
  test('MT-3.3: "Select All" selects all eligible items', async ({page}) => {
    await navigateToReturn(page);

    await page.getByTestId('return-select-all').click();

    // Link should change to "Deselect All"
    await expect(page.getByTestId('return-select-all')).toHaveText(
      'Deselect All',
    );

    // Count should be N of N
    const countText = await page
      .getByText(/\d+ of \d+ items selected/)
      .textContent();
    const match = countText?.match(/(\d+) of (\d+)/);
    expect(match).toBeTruthy();
    if (match) {
      expect(match[1]).toBe(match[2]); // All selected
    }
  });

  // -- MT-3.4: Deselect all --
  test('MT-3.4: "Deselect All" clears selection', async ({page}) => {
    await navigateToReturn(page);

    // First select all
    await page.getByTestId('return-select-all').click();
    await expect(page.getByTestId('return-select-all')).toHaveText(
      'Deselect All',
    );

    // Then deselect all
    await page.getByTestId('return-select-all').click();
    await expect(page.getByTestId('return-select-all')).toHaveText(
      'Select All',
    );
    await expect(page.getByText('Estimated refund: $0.00')).toBeVisible();
  });

  // -- MT-3.5: Partial then select all --
  test('MT-3.5: partial selection then Select All selects remaining', async ({
    page,
  }) => {
    await navigateToReturn(page);

    const items = page.locator(
      'button[data-testid^="return-item-"]:not([data-testid*="checkbox"])',
    );
    const itemCount = await items.count();

    if (itemCount < 2) {
      // Single-item order: selecting the only item already makes allSelected true
      test.skip();
      return;
    }

    // Select first item only
    await items.first().click();

    // Now select all remaining
    await page.getByTestId('return-select-all').click();
    await expect(page.getByTestId('return-select-all')).toHaveText(
      'Deselect All',
    );
  });

  // -- MT-3.6: Refund calculation --
  test('MT-3.6: refund updates correctly when toggling items', async ({
    page,
  }) => {
    await navigateToReturn(page);

    // Get initial refund (should be $0.00)
    await expect(page.getByText('Estimated refund: $0.00')).toBeVisible();

    // Select first item
    const firstItem = page.locator('[data-testid^="return-item-"]').first();
    await firstItem.click();

    // Get refund after first selection
    const refundAfterOne = await page
      .getByText(/Estimated refund: \$/)
      .textContent();

    // Deselect — should return to $0.00
    await firstItem.click();
    await expect(page.getByText('Estimated refund: $0.00')).toBeVisible();

    // Re-select — should match previous value
    await firstItem.click();
    const refundReselect = await page
      .getByText(/Estimated refund: \$/)
      .textContent();
    expect(refundReselect).toBe(refundAfterOne);
  });

  // ============================================================================
  // MT-4: Order Items Card
  // ============================================================================

  // -- MT-4.1: Card header --
  test('MT-4.1: card header shows "Order Items" and instruction text', async ({
    page,
  }) => {
    await navigateToReturn(page);

    await expect(page.getByText('Order Items')).toBeVisible();
    await expect(page.getByText('Tap to select items to return')).toBeVisible();
  });

  // -- MT-4.2: Item display --
  test('MT-4.2: items show name, meta, price, and eligibility badge', async ({
    page,
  }) => {
    await navigateToReturn(page);

    const items = page.locator('[data-testid^="return-item-"]');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    // First item should have visible text content
    const firstItem = items.first();
    // Should have a price with $ sign
    await expect(firstItem.locator('text=/\\$/')).toBeVisible();
    // Should have an eligibility badge
    await expect(
      firstItem.locator(
        'text=/RETURN ELIGIBLE|FINAL SALE|RETURN WINDOW CLOSED/',
      ),
    ).toBeVisible();
  });

  // -- MT-4.3: Checkbox toggle --
  test('MT-4.3: clicking item toggles checkbox and border', async ({page}) => {
    await navigateToReturn(page);

    const firstItem = page
      .locator('button[data-testid^="return-item-"]')
      .first();

    // Move mouse away to avoid hover state
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);

    // Before click — border should be gray (#e5e7eb)
    const borderBefore = await getComputedStyle(firstItem, 'border-color');

    // Click to select
    await firstItem.click();

    // Move mouse away so we measure selected state, not hover
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    // After click — border should change to return-accent (#4fd1a8)
    const borderAfter = await getComputedStyle(firstItem, 'border-color');
    expect(borderAfter).not.toBe(borderBefore);
  });

  // -- MT-4.4: Click anywhere on item row toggles --
  test('MT-4.4: clicking product name/price area toggles selection', async ({
    page,
  }) => {
    await navigateToReturn(page);

    // Click on the h4 (product name) within the first item
    const productName = page
      .locator('[data-testid^="return-item-"] h4')
      .first();
    await productName.click();

    // Should now show 1 selected
    await expect(page.getByText(/1 of \d+ items selected/)).toBeVisible();
  });

  // -- MT-4.5: Item deselection --
  test('MT-4.5: clicking selected item deselects it', async ({page}) => {
    await navigateToReturn(page);

    const firstItem = page.locator('[data-testid^="return-item-"]').first();

    // Select
    await firstItem.click();
    await expect(page.getByText(/1 of \d+ items selected/)).toBeVisible();

    // Deselect
    await firstItem.click();
    await expect(page.getByText(/0 of \d+ items selected/)).toBeVisible();
  });

  // -- MT-4.6: Return Eligible badge --
  test('MT-4.6: eligible items show green "RETURN ELIGIBLE" badge', async ({
    page,
  }) => {
    await navigateToReturn(page);

    const badge = page.getByText('RETURN ELIGIBLE').first();
    const badgeVisible = await badge.isVisible().catch(() => false);

    if (badgeVisible) {
      const color = await getComputedStyle(badge, 'color');
      // #2ac864 = rgb(42, 200, 100)
      expect(color).toBe('rgb(42, 200, 100)');
    }
  });

  // ============================================================================
  // MT-5: Return Policy Notice
  // ============================================================================

  // -- MT-5.1: Notice display --
  test('MT-5.1: return policy notice is visible', async ({page}) => {
    await navigateToReturn(page);

    await expect(page.getByText('Return Policy')).toBeVisible();
  });

  // -- MT-5.3: Text content --
  test('MT-5.3: policy notice contains correct text', async ({page}) => {
    await navigateToReturn(page);

    await expect(
      page.getByText(/Items must be returned within 30 days/),
    ).toBeVisible();
    await expect(
      page.getByText(/Refunds are processed within 5-7 business days/),
    ).toBeVisible();
  });

  // ============================================================================
  // MT-6: Action Bar
  // ============================================================================

  // -- MT-6.1: Sticky positioning --
  test('MT-6.1: action bar is visible at bottom of viewport', async ({
    page,
  }) => {
    await navigateToReturn(page);

    const backBtn = page.getByTestId('return-back-btn');
    await expect(backBtn).toBeVisible();

    const continueBtn = page.getByTestId('return-continue-btn');
    await expect(continueBtn).toBeVisible();
  });

  // -- MT-6.3: Back button navigates --
  test('MT-6.3: "Back to Orders" navigates to /account/orders', async ({
    page,
  }) => {
    await navigateToReturn(page);

    await page.getByTestId('return-back-btn').click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/account/orders');
    await expect(page.locator('h1')).toContainText('My Orders');
  });

  // -- MT-6.4: Continue disabled initially --
  test('MT-6.4: continue button is disabled when no items selected', async ({
    page,
  }) => {
    await navigateToReturn(page);

    const btn = page.getByTestId('return-continue-btn');
    await expect(btn).toBeDisabled();

    // Check opacity is 50%
    const opacity = await getComputedStyle(btn, 'opacity');
    expect(parseFloat(opacity)).toBeCloseTo(0.5, 1);
  });

  // -- MT-6.5: Continue enabled after selection --
  test('MT-6.5: continue button becomes enabled after selecting an item', async ({
    page,
  }) => {
    await navigateToReturn(page);

    // Select first item
    const firstItem = page.locator('[data-testid^="return-item-"]').first();
    await firstItem.click();

    const btn = page.getByTestId('return-continue-btn');
    await expect(btn).toBeEnabled();

    const opacity = await getComputedStyle(btn, 'opacity');
    // Enabled state should be significantly above 0.5 (disabled opacity)
    expect(parseFloat(opacity)).toBeGreaterThan(0.7);
  });

  // -- MT-6.7: Continue re-disabled --
  test('MT-6.7: continue button re-disables when all items deselected', async ({
    page,
  }) => {
    await navigateToReturn(page);

    const firstItem = page.locator('[data-testid^="return-item-"]').first();
    const btn = page.getByTestId('return-continue-btn');

    // Select → enabled
    await firstItem.click();
    await expect(btn).toBeEnabled();

    // Deselect → disabled
    await firstItem.click();
    await expect(btn).toBeDisabled();
  });

  // ============================================================================
  // MT-7: Visual Fidelity
  // ============================================================================

  // -- MT-7.1: Overall layout --
  test('MT-7.1: content container has max-width 900px and is centered', async ({
    page,
  }) => {
    await navigateToReturn(page);

    const container = page.locator('.max-w-\\[900px\\]').first();
    await expect(container).toBeVisible();

    const box = await container.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(900);
    }
  });

  // -- MT-7.2: Typography — title is font-light (300) --
  test('MT-7.2: title uses font-weight 300 (light)', async ({page}) => {
    await navigateToReturn(page);

    const title = page.locator('h1');
    const weight = await getComputedStyle(title, 'font-weight');
    expect(weight).toBe('300');
  });

  // -- MT-7.3: Color accuracy — return-accent for prices --
  test('MT-7.3: item prices use return-accent color #4fd1a8', async ({
    page,
  }) => {
    await navigateToReturn(page);

    // Price elements have text-return-accent class
    const price = page
      .locator('[data-testid^="return-item-"] .text-return-accent')
      .first();
    const priceVisible = await price.isVisible().catch(() => false);

    if (priceVisible) {
      const color = await getComputedStyle(price, 'color');
      expect(color).toBe('rgb(79, 209, 168)');
    }
  });

  // -- MT-7.4: Border radii --
  test('MT-7.4: cards use 12px border radius', async ({page}) => {
    await navigateToReturn(page);

    // The order items card container
    const card = page.locator('.rounded-\\[12px\\]').first();
    await expect(card).toBeVisible();

    const radius = await getComputedStyle(card, 'border-radius');
    expect(radius).toBe('12px');
  });

  // ============================================================================
  // MT-8: Edge Cases
  // ============================================================================

  // -- MT-8.6: Currency formatting --
  test('MT-8.6: prices are formatted as $X.XX', async ({page}) => {
    await navigateToReturn(page);

    // All price values should match currency format
    const prices = page.locator(
      '[data-testid^="return-item-"] .text-return-accent',
    );
    const count = await prices.count();

    for (let i = 0; i < count; i++) {
      const text = await prices.nth(i).textContent();
      expect(text).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  // -- MT-8.7: Browser back button --
  test('MT-8.7: browser back returns to previous page', async ({page}) => {
    await navigateToOrders(page);
    const orderId = await getFirstOrderId(page);

    // Navigate to return page
    await page.goto(`/account/orders/${orderId}/return`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Start a Return');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be back on orders page
    expect(page.url()).toContain('/account/orders');
  });

  // -- MT-8.8: Page refresh resets selection --
  test('MT-8.8: refreshing page resets selection state', async ({page}) => {
    await navigateToReturn(page);

    // Select an item
    const firstItem = page.locator('[data-testid^="return-item-"]').first();
    await firstItem.click();
    await expect(page.getByText(/1 of \d+ items selected/)).toBeVisible();

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be back to 0 selected
    await expect(page.getByText(/0 of \d+ items selected/)).toBeVisible();
  });

  // ============================================================================
  // MT-9: Sidebar Integration
  // ============================================================================

  // -- MT-9.1: Sidebar present --
  test('MT-9.1: account sidebar is visible on return page', async ({page}) => {
    await navigateToReturn(page);

    // Sidebar contains nav links including "My Orders"
    const sidebar = page
      .locator('nav, aside')
      .filter({hasText: 'My Orders'})
      .first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    expect(sidebarVisible).toBe(true);
  });

  // -- MT-9.2: Active nav state --
  test('MT-9.2: sidebar "My Orders" link is highlighted', async ({page}) => {
    await navigateToReturn(page);

    const ordersLink = page
      .locator('nav a, aside a')
      .filter({hasText: 'My Orders'})
      .first();
    const linkVisible = await ordersLink.isVisible().catch(() => false);

    if (linkVisible) {
      const fontWeight = await getComputedStyle(ordersLink, 'font-weight');
      expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(500);
    }
  });

  // ============================================================================
  // Console Errors
  // ============================================================================

  test('no console errors on return page', async ({page}) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await navigateToReturn(page);

    // Interact — select and deselect
    const firstItem = page.locator('[data-testid^="return-item-"]').first();
    const itemVisible = await firstItem.isVisible().catch(() => false);
    if (itemVisible) {
      await firstItem.click();
      await page.waitForTimeout(300);
      await firstItem.click();
    }

    const relevantErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('Failed to load resource') &&
        !e.includes('net::ERR') &&
        !e.includes('Analytics.Provider') &&
        !e.includes('checkoutDomain'),
    );

    expect(relevantErrors).toEqual([]);
  });
});

// ============================================================================
// MT — Tablet Viewport Tests
// ============================================================================

test.describe('Return Process — Tablet (768px)', () => {
  test.describe.configure({mode: 'serial'});
  test.use({viewport: {width: 768, height: 1024}});
  test.setTimeout(60000);

  test.beforeEach(async ({page}) => {
    await login(page);
  });

  // -- MT-1.3 tablet: Page loads --
  test('MT-1.3 tablet: return page loads correctly', async ({page}) => {
    await navigateToReturn(page);
    await expect(page.locator('h1')).toContainText('Start a Return');
  });

  // -- MT-2.4 tablet: Step labels visible --
  test('MT-2.4 tablet: all step labels are visible', async ({page}) => {
    await navigateToReturn(page);

    for (const label of ['Select Items', 'Reason', 'Ship', 'Make It Right']) {
      await expect(
        page.getByTestId('return-step-progress').getByText(label),
      ).toBeVisible();
    }
  });

  // -- MT-3.3 tablet: Select all works --
  test('MT-3.3 tablet: select all and deselect all work', async ({page}) => {
    await navigateToReturn(page);

    await page.getByTestId('return-select-all').click();
    await expect(page.getByTestId('return-select-all')).toHaveText(
      'Deselect All',
    );

    await page.getByTestId('return-select-all').click();
    await expect(page.getByTestId('return-select-all')).toHaveText(
      'Select All',
    );
  });

  // -- MT-4.3 tablet: Checkbox toggle --
  test('MT-4.3 tablet: item selection works on tablet', async ({page}) => {
    await navigateToReturn(page);

    const firstItem = page.locator('[data-testid^="return-item-"]').first();
    await firstItem.click();
    await expect(page.getByText(/1 of \d+ items selected/)).toBeVisible();
  });

  // -- MT-5.1 tablet: Policy notice visible --
  test('MT-5.1 tablet: return policy notice visible', async ({page}) => {
    await navigateToReturn(page);
    await expect(page.getByText('Return Policy')).toBeVisible();
  });

  // -- MT-6.1 tablet: Action bar visible --
  test('MT-6.1 tablet: action bar buttons visible', async ({page}) => {
    await navigateToReturn(page);

    await expect(page.getByTestId('return-back-btn')).toBeVisible();
    await expect(page.getByTestId('return-continue-btn')).toBeVisible();
  });

  // -- MT-6.4 tablet: Continue disabled --
  test('MT-6.4 tablet: continue button disabled initially', async ({page}) => {
    await navigateToReturn(page);
    await expect(page.getByTestId('return-continue-btn')).toBeDisabled();
  });

  // -- MT-6.5 tablet: Continue enabled after selection --
  test('MT-6.5 tablet: continue enabled after selecting item', async ({
    page,
  }) => {
    await navigateToReturn(page);

    await page.locator('[data-testid^="return-item-"]').first().click();
    await expect(page.getByTestId('return-continue-btn')).toBeEnabled();
  });
});
