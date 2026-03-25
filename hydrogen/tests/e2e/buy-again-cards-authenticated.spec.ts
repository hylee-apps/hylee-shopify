import {test, expect, type Page} from '@playwright/test';

/**
 * Authenticated tests for the "Buy Again" tab on the real account orders page.
 * These cover manual testing items that require login + real order data.
 *
 * Credentials are passed via environment or hardcoded for local dev.
 * Tests run serially to avoid session conflicts from parallel logins.
 */

const EMAIL = process.env.TEST_EMAIL || 'derek@hy-lee.com';
const PASSWORD = process.env.TEST_PASSWORD || 'jU1cyTw1st$';
const ORDERS_URL = '/account/orders';

// ============================================================================
// Auth Helper
// ============================================================================

async function login(page: Page) {
  await page.goto('/account/login');
  await page.waitForLoadState('networkidle');

  // Check if already logged in (redirected away from login)
  if (!page.url().includes('/account/login')) {
    return;
  }

  // Fill login form
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', {name: 'Sign In', exact: true}).click();

  // Wait for redirect AWAY from login page (to /account dashboard)
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

  // If redirected to login, the session wasn't preserved — re-login
  if (page.url().includes('/account/login')) {
    await login(page);
    await page.goto(ORDERS_URL);
    await page.waitForLoadState('networkidle');
  }

  // Wait for orders content to load (h1 "My Orders")
  await expect(page.locator('h1')).toContainText('My Orders', {
    timeout: 15000,
  });
}

async function switchToBuyAgainTab(page: Page) {
  const tab = page.getByRole('button', {name: 'Buy Again'});
  await tab.click();
  await page.waitForTimeout(1000);
}

function getComputedStyle(locator: ReturnType<Page['locator']>, prop: string) {
  return locator.evaluate(
    (el, p) => window.getComputedStyle(el).getPropertyValue(p),
    prop,
  );
}

// ============================================================================
// Tests — run serially to avoid parallel login conflicts
// ============================================================================

test.describe('Authenticated — Buy Again Tab', () => {
  test.describe.configure({mode: 'serial'});
  test.use({viewport: {width: 1440, height: 900}});
  test.setTimeout(60000);

  test.beforeEach(async ({page}) => {
    await login(page);
    await navigateToOrders(page);
  });

  // ---- Tab Switching ----

  test('clicking "Buy Again" tab activates it', async ({page}) => {
    const tab = page.getByRole('button', {name: 'Buy Again'});
    await tab.click();
    await expect(tab).toBeVisible();

    // Tab should have active styling (border-bottom color)
    const borderColor = await getComputedStyle(tab, 'border-bottom-color');
    // Should NOT be transparent — some visible color
    expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('time filter dropdown does NOT appear for Buy Again tab', async ({
    page,
  }) => {
    await switchToBuyAgainTab(page);

    // The time filter is a <select> element — should not be visible on Buy Again
    const timeFilter = page.locator('select');
    await expect(timeFilter).toHaveCount(0);
  });

  test('stats cards remain visible on Buy Again tab', async ({page}) => {
    // Stats cards use labels: "Orders", "On The Way Out", "Re-Purchase"
    const statsLabel = page.getByText('Re-Purchase').first();
    await expect(statsLabel).toBeVisible();

    // Switch to Buy Again tab
    await switchToBuyAgainTab(page);

    // Stats cards should still be visible
    await expect(statsLabel).toBeVisible();
  });

  // ---- Buy Again Content ----

  test('Buy Again cards or empty state renders', async ({page}) => {
    await switchToBuyAgainTab(page);

    // Either buy again cards are shown OR empty state
    const hasContent =
      (await page
        .locator('[data-component="buy-again-card"]')
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText('No items to buy again')
        .isVisible()
        .catch(() => false));

    expect(hasContent).toBe(true);
  });

  test('Buy Again sub-header appears with correct text', async ({page}) => {
    await switchToBuyAgainTab(page);

    const hasCards = await page
      .locator('[data-component="buy-again-card"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText('No items to buy again')
      .isVisible()
      .catch(() => false);

    if (hasCards) {
      // Sub-header "Buy Again" should be visible (not the tab, the h2)
      await expect(
        page.locator('h2').filter({hasText: 'Buy Again'}),
      ).toBeVisible();
      await expect(page.getByText('Quickly reorder items you')).toBeVisible();
    } else {
      expect(hasEmpty).toBe(true);
    }
  });

  test('Buy Again cards render in 3-column grid', async ({page}) => {
    await switchToBuyAgainTab(page);

    const cards = page.locator('[data-component="buy-again-card"]');
    const cardCount = await cards.count();

    if (cardCount >= 3) {
      // Check first 3 cards are in same row (similar y positions)
      const box1 = await cards.nth(0).boundingBox();
      const box2 = await cards.nth(1).boundingBox();
      const box3 = await cards.nth(2).boundingBox();

      if (box1 && box2 && box3) {
        // All three should be at roughly the same Y (within 5px)
        expect(Math.abs(box1.y - box2.y)).toBeLessThan(5);
        expect(Math.abs(box2.y - box3.y)).toBeLessThan(5);
      }
    }
  });

  test('Add to Cart button uses secondary teal (#2699a6), not hero teal', async ({
    page,
  }) => {
    await switchToBuyAgainTab(page);

    const card = page.locator('[data-component="buy-again-card"]').first();
    const cardVisible = await card.isVisible().catch(() => false);

    if (cardVisible) {
      const addBtn = card.locator('button[type="submit"]');
      const btnVisible = await addBtn.isVisible().catch(() => false);

      if (btnVisible) {
        const bg = await getComputedStyle(addBtn, 'background-color');
        // #2699a6 = rgb(38, 153, 166)
        expect(bg).toBe('rgb(38, 153, 166)');
        // NOT #14b8a6 = rgb(20, 184, 166)
        expect(bg).not.toBe('rgb(20, 184, 166)');
      }
    } else {
      // No buy-again cards — empty state, which is fine
      await expect(page.getByText('No items to buy again')).toBeVisible();
    }
  });

  test('product title links use secondary teal color', async ({page}) => {
    await switchToBuyAgainTab(page);

    const card = page.locator('[data-component="buy-again-card"]').first();
    const cardVisible = await card.isVisible().catch(() => false);

    if (cardVisible) {
      const titleLink = card.locator('a').first();
      const linkVisible = await titleLink.isVisible().catch(() => false);

      if (linkVisible) {
        const color = await getComputedStyle(titleLink, 'color');
        // #2699a6 = rgb(38, 153, 166)
        expect(color).toBe('rgb(38, 153, 166)');
      }
    }
  });

  // ---- Tab Navigation ----

  test('switching back to "Orders" tab shows OrderCards with time filter', async ({
    page,
  }) => {
    // Go to Buy Again first
    await switchToBuyAgainTab(page);

    // Go back to Orders
    await page.getByRole('button', {name: 'Orders'}).click();
    await page.waitForTimeout(500);

    // Time filter should reappear
    const timeFilter = page.locator('select');
    await expect(timeFilter).toBeVisible();
  });

  test('switching to "On the Way Out" tab works from Buy Again', async ({
    page,
  }) => {
    await switchToBuyAgainTab(page);

    await page.getByRole('button', {name: 'On the Way Out'}).click();
    await page.waitForTimeout(500);

    // Should show outgoing content or empty state
    const hasContent =
      (await page
        .getByText('On the Way Out')
        .nth(1)
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText('No returns or exchanges')
        .isVisible()
        .catch(() => false));

    expect(hasContent).toBe(true);
  });

  // ---- Pagination ----

  test('pagination visible when buy again products exist', async ({page}) => {
    await switchToBuyAgainTab(page);

    const cards = page.locator('[data-component="buy-again-card"]');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Pagination component should exist (even if only 1 page)
      const pagination = page.locator('[data-component="order-pagination"]');
      const paginationExists =
        (await pagination.count()) > 0 ||
        (await page.getByRole('button', {name: '1'}).isVisible());
      expect(paginationExists).toBe(true);
    }
  });

  // ---- No Regressions ----

  test('Orders tab still works correctly after visiting Buy Again', async ({
    page,
  }) => {
    // Switch to Buy Again then back
    await switchToBuyAgainTab(page);
    await page.getByRole('button', {name: 'Orders'}).click();
    await page.waitForTimeout(500);

    // Check for order cards or "No orders yet"
    const hasContent =
      (await page
        .locator('select')
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText('No orders yet')
        .isVisible()
        .catch(() => false));

    expect(hasContent).toBe(true);
  });

  test('sidebar "My Orders" link is highlighted', async ({page}) => {
    await switchToBuyAgainTab(page);

    // Look for the sidebar nav link that includes "My Orders"
    const sidebarLink = page
      .locator('nav a, aside a')
      .filter({hasText: 'My Orders'})
      .first();
    const linkExists = await sidebarLink.isVisible().catch(() => false);

    if (linkExists) {
      const fontWeight = await getComputedStyle(sidebarLink, 'font-weight');
      expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(500);
    }
  });
});

// ============================================================================
// Authenticated Mobile Tests
// ============================================================================

test.describe('Authenticated — Mobile Buy Again', () => {
  test.describe.configure({mode: 'serial'});
  test.use({viewport: {width: 390, height: 844}});
  test.setTimeout(60000);

  test.beforeEach(async ({page}) => {
    await login(page);
    await navigateToOrders(page);
  });

  test('mobile: Buy Again cards stack in single column', async ({page}) => {
    await switchToBuyAgainTab(page);

    const cards = page.locator('[data-component="buy-again-card"]');
    const cardCount = await cards.count();

    if (cardCount >= 2) {
      const box1 = await cards.nth(0).boundingBox();
      const box2 = await cards.nth(1).boundingBox();

      if (box1 && box2) {
        // Cards should be stacked vertically (different Y positions)
        expect(box2.y).toBeGreaterThan(box1.y + box1.height - 5);
      }
    }
  });

  test('mobile: action buttons remain tappable', async ({page}) => {
    await switchToBuyAgainTab(page);

    const card = page.locator('[data-component="buy-again-card"]').first();
    const cardVisible = await card.isVisible().catch(() => false);

    if (cardVisible) {
      const btn = card.locator('button').first();
      const box = await btn.boundingBox();
      if (box) {
        // Min touch target: 44px
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

// ============================================================================
// Console Error Check
// ============================================================================

test.describe('Authenticated — Buy Again Console Errors', () => {
  test.use({viewport: {width: 1440, height: 900}});
  test.setTimeout(60000);

  test('no console errors on Buy Again tab', async ({page}) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await login(page);
    await navigateToOrders(page);

    await switchToBuyAgainTab(page);
    await page.waitForTimeout(2000);

    // Filter out known non-issues
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
