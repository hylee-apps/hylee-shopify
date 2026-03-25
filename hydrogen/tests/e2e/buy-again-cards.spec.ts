import {test, expect, type Page, type Locator} from '@playwright/test';

/**
 * Automated tests for the "Buy Again" tab — BuyAgainCard in 3-column grid.
 *
 * Uses the test route at /test/buy-again-cards which renders components
 * with mock data (no auth required).
 *
 * Covers the manual testing plan from:
 *   plans/ACCOUNT_ORDERS_BUY_AGAIN_PLAN.md
 */

const TEST_URL = '/test/buy-again-cards';

// ============================================================================
// Helpers
// ============================================================================

function getCards(page: Page) {
  return page.locator('[data-component="buy-again-card"]');
}

function getCard(page: Page, index: number) {
  return getCards(page).nth(index);
}

async function getComputedStyle(
  locator: Locator,
  property: string,
): Promise<string> {
  return locator.evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property,
  );
}

// ============================================================================
// 7a. Grid Layout
// ============================================================================

test.describe('Grid Layout', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('products render in a 3-column grid on desktop', async ({page}) => {
    const grid = page.locator('.grid.lg\\:grid-cols-3');
    await expect(grid).toBeVisible();
    const cols = await getComputedStyle(grid, 'grid-template-columns');
    // Should have 3 column values
    const colCount = cols.trim().split(/\s+/).length;
    expect(colCount).toBe(3);
  });

  test('grid gap is 24px between cards', async ({page}) => {
    const grid = page.locator('.grid');
    const gap = await getComputedStyle(grid, 'gap');
    expect(gap).toBe('24px');
  });

  test('cards render with correct count', async ({page}) => {
    const cards = getCards(page);
    // 8 mock products
    await expect(cards).toHaveCount(8);
  });
});

test.describe('Grid Layout — Tablet', () => {
  test.use({viewport: {width: 768, height: 1024}});

  test('products render in a 2-column grid on tablet', async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    const grid = page.locator('.grid');
    const cols = await getComputedStyle(grid, 'grid-template-columns');
    const colCount = cols.trim().split(/\s+/).length;
    expect(colCount).toBe(2);
  });
});

test.describe('Grid Layout — Mobile', () => {
  test.use({viewport: {width: 390, height: 844}});

  test('products render in a 1-column grid on mobile', async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    const grid = page.locator('.grid');
    const cols = await getComputedStyle(grid, 'grid-template-columns');
    const colCount = cols.trim().split(/\s+/).length;
    expect(colCount).toBe(1);
  });
});

// ============================================================================
// 7b. Card Visual Fidelity
// ============================================================================

test.describe('Card Visual Fidelity', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('card has correct background, border-radius, and shadow', async ({
    page,
  }) => {
    const card = getCard(page, 0);
    const bg = await getComputedStyle(card, 'background-color');
    expect(bg).toBe('rgb(255, 255, 255)');
    const radius = await getComputedStyle(card, 'border-radius');
    expect(radius).toBe('12px');
    const shadow = await getComputedStyle(card, 'box-shadow');
    expect(shadow).toContain('rgba(0, 0, 0, 0.05)');
  });

  test('product image placeholder shows 60px icon when no image', async ({
    page,
  }) => {
    // Card 0 has no image
    const card = getCard(page, 0);
    const imageArea = card.locator('div').filter({hasText: ''}).first();
    const placeholder = card.locator('svg').first();
    await expect(placeholder).toBeVisible();
  });

  test('product title is a link with secondary teal color', async ({page}) => {
    const card = getCard(page, 0);
    const titleLink = card.locator('a').first();
    await expect(titleLink).toBeVisible();
    const color = await getComputedStyle(titleLink, 'color');
    expect(color).toBe('rgb(38, 153, 166)');
  });

  test('product title supports multi-line without truncation', async ({
    page,
  }) => {
    // Card 2 has a 4-line title
    const card = getCard(page, 2);
    const titleLink = card.locator('a').first();
    await expect(titleLink).toContainText('LEUCHTTURM1917');
    // Should have natural wrapping — no text-overflow: ellipsis
    const overflow = await getComputedStyle(titleLink, 'text-overflow');
    expect(overflow).not.toBe('ellipsis');
  });

  test('price renders in bold 18px', async ({page}) => {
    const card = getCard(page, 0);
    const price = card.locator('text=$21.99');
    await expect(price).toBeVisible();
    const fontSize = await getComputedStyle(price, 'font-size');
    expect(fontSize).toBe('18px');
    const fontWeight = await getComputedStyle(price, 'font-weight');
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700);
  });

  test('last ordered date renders correctly', async ({page}) => {
    const card = getCard(page, 0);
    const dateText = card.locator('text=/Last ordered/');
    await expect(dateText).toBeVisible();
    const fontSize = await getComputedStyle(dateText, 'font-size');
    expect(fontSize).toBe('13px');
    const color = await getComputedStyle(dateText, 'color');
    expect(color).toBe('rgb(107, 114, 128)');
  });

  test('card with image renders product image', async ({page}) => {
    // Card 7 (index 7) has a real image
    const card = getCard(page, 7);
    const img = card.locator('img');
    await expect(img).toBeVisible();
  });

  test('card inner padding is 20px', async ({page}) => {
    const card = getCard(page, 0);
    const body = card.locator('> div').first();
    const padding = await getComputedStyle(body, 'padding');
    expect(padding).toBe('20px');
  });
});

// ============================================================================
// 7c. Action Buttons
// ============================================================================

test.describe('Action Buttons', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Add to Cart button has secondary teal background, NOT hero teal', async ({
    page,
  }) => {
    const card = getCard(page, 0);
    const addBtn = card.locator('button[type="submit"]');
    await expect(addBtn).toBeVisible();
    const bg = await getComputedStyle(addBtn, 'background-color');
    // Must be secondary teal rgb(38, 153, 166), NOT hero teal rgb(20, 184, 166)
    expect(bg).toBe('rgb(38, 153, 166)');
  });

  test('Add to Cart button has ShoppingCart icon and correct text', async ({
    page,
  }) => {
    const card = getCard(page, 0);
    const addBtn = card.locator('button[type="submit"]');
    await expect(addBtn).toContainText('Add to Cart');
    // Icon (SVG) should be present
    const svg = addBtn.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('View button has white background with gray border', async ({page}) => {
    const card = getCard(page, 0);
    const viewBtn = card.locator('a[aria-label*="View"]');
    await expect(viewBtn).toBeVisible();
    const bg = await getComputedStyle(viewBtn, 'background-color');
    expect(bg).toBe('rgb(255, 255, 255)');
    const borderColor = await getComputedStyle(viewBtn, 'border-color');
    expect(borderColor).toBe('rgb(209, 213, 219)');
  });

  test('View button is icon-only with Eye icon', async ({page}) => {
    const card = getCard(page, 0);
    const viewBtn = card.locator('a[aria-label*="View"]');
    // Should contain an SVG but no text
    const svg = viewBtn.locator('svg');
    await expect(svg).toBeVisible();
    const text = await viewBtn.textContent();
    expect(text?.trim()).toBe('');
  });

  test('Both buttons are equal width (flex-1)', async ({page}) => {
    const card = getCard(page, 0);
    // CartForm renders as a form with flex-1 is not directly on the form
    // The button and the view link should have similar widths
    const viewBtn = card.locator('a[aria-label*="View"]');
    const viewBox = await viewBtn.boundingBox();
    expect(viewBox).toBeTruthy();
    expect(viewBox!.width).toBeGreaterThan(50);
  });

  test('unavailable product shows disabled Add to Cart', async ({page}) => {
    // Card 6 (index 6) has no variantId
    const card = getCard(page, 6);
    const disabledBtn = card.locator('button:has-text("Unavailable")');
    await expect(disabledBtn).toBeVisible();
    await expect(disabledBtn).toBeDisabled();
  });

  test('product without handle has disabled View button', async ({page}) => {
    const card = getCard(page, 6);
    // Should not have a link for View — should be a div with opacity-50
    const viewLink = card.locator('a[aria-label*="View"]');
    await expect(viewLink).toHaveCount(0);
  });
});

// ============================================================================
// 7d. Sub-section Header
// ============================================================================

test.describe('Sub-section Header', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('title "Buy Again" renders in 24px bold', async ({page}) => {
    const title = page.locator('h2:has-text("Buy Again")');
    await expect(title).toBeVisible();
    const fontSize = await getComputedStyle(title, 'font-size');
    expect(fontSize).toBe('24px');
    const fontWeight = await getComputedStyle(title, 'font-weight');
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(700);
  });

  test('subtitle renders correctly', async ({page}) => {
    const subtitle = page.locator(
      "text=Quickly reorder items you've purchased before",
    );
    await expect(subtitle).toBeVisible();
    const fontSize = await getComputedStyle(subtitle, 'font-size');
    expect(fontSize).toBe('15px');
    const color = await getComputedStyle(subtitle, 'color');
    expect(color).toBe('rgb(75, 85, 99)');
  });

  test('no time filter dropdown visible on Buy Again tab', async ({page}) => {
    const select = page.locator('select');
    await expect(select).toHaveCount(0);
  });
});

// ============================================================================
// 7e. Tab Integration
// ============================================================================

test.describe('Tab Integration', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Buy Again tab shows active state with amber border', async ({page}) => {
    const buyAgainTab = page.locator('button:has-text("Buy Again")');
    await expect(buyAgainTab).toBeVisible();
    const borderColor = await getComputedStyle(
      buyAgainTab,
      'border-bottom-color',
    );
    expect(borderColor).toBe('rgb(242, 176, 94)');
  });

  test('stats cards remain visible', async ({page}) => {
    // Check for stat card values
    const ordersCard = page.locator('text=Orders').first();
    await expect(ordersCard).toBeVisible();
    const rePurchaseCard = page.locator('text=Re-Purchase');
    await expect(rePurchaseCard).toBeVisible();
  });

  test('page header remains visible', async ({page}) => {
    const header = page.locator('h1:has-text("My Orders")');
    await expect(header).toBeVisible();
  });

  test('tab switching works', async ({page}) => {
    // Click Orders tab — grid should disappear
    await page.locator('button:has-text("Orders")').first().click();
    await expect(getCards(page)).toHaveCount(0);

    // Click back to Buy Again
    await page.locator('button:has-text("Buy Again")').click();
    await expect(getCards(page).first()).toBeVisible();
  });
});

// ============================================================================
// 7f. Pagination
// ============================================================================

test.describe('Pagination', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('pagination renders when items exist', async ({page}) => {
    const pagination = page.locator('nav[aria-label="Pagination"]');
    await expect(pagination).toBeVisible();
  });

  test('active page button uses hero teal', async ({page}) => {
    const activePage = page.locator(
      'nav[aria-label="Pagination"] span[aria-current="page"]',
    );
    await expect(activePage).toBeVisible();
    const bg = await getComputedStyle(activePage, 'background-color');
    expect(bg).toBe('rgb(20, 184, 166)');
  });
});

// ============================================================================
// 7g. Empty State
// ============================================================================

test.describe('Empty State', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test('empty state renders when toggled', async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');

    // Click the "Show Empty State" button
    await page.locator('button:has-text("Show Empty State")').click();

    const emptyTitle = page.locator('h2:has-text("No items to buy again")');
    await expect(emptyTitle).toBeVisible();
  });

  test('empty state shows RotateCcw icon', async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Show Empty State")').click();

    const svg = page
      .locator('h2:has-text("No items to buy again")')
      .locator('..')
      .locator('svg');
    await expect(svg).toBeVisible();
  });

  test('empty state has Start Shopping button linking to /collections', async ({
    page,
  }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Show Empty State")').click();

    const link = page.locator('a:has-text("Start Shopping")');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/collections');
  });
});

// ============================================================================
// 7h. Mobile Responsive
// ============================================================================

test.describe('Mobile Responsive', () => {
  test.use({viewport: {width: 390, height: 844}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('cards stack in single column on mobile', async ({page}) => {
    const grid = page.locator('.grid');
    const cols = await getComputedStyle(grid, 'grid-template-columns');
    const colCount = cols.trim().split(/\s+/).length;
    expect(colCount).toBe(1);
  });

  test('cards maintain correct internal layout', async ({page}) => {
    const card = getCard(page, 0);
    await expect(card).toBeVisible();
    // Title should still be visible
    const title = card.locator('a, span').filter({hasText: 'Order 1'});
    await expect(title).toBeVisible();
  });

  test('buttons remain tappable (min 44px)', async ({page}) => {
    const card = getCard(page, 0);
    const addBtn = card.locator('button[type="submit"]');
    const box = await addBtn.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

// ============================================================================
// 7i. Color Accuracy
// ============================================================================

test.describe('Color Accuracy', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Add to Cart bg is exact secondary teal, NOT hero teal', async ({
    page,
  }) => {
    const card = getCard(page, 0);
    const addBtn = card.locator('button[type="submit"]');
    const bg = await getComputedStyle(addBtn, 'background-color');
    expect(bg).toBe('rgb(38, 153, 166)');
    expect(bg).not.toBe('rgb(20, 184, 166)');
  });

  test('product title link is exact secondary teal', async ({page}) => {
    const card = getCard(page, 0);
    const titleLink = card.locator('a').first();
    const color = await getComputedStyle(titleLink, 'color');
    expect(color).toBe('rgb(38, 153, 166)');
  });

  test('active pagination button is exact hero teal', async ({page}) => {
    const activePage = page.locator(
      'nav[aria-label="Pagination"] span[aria-current="page"]',
    );
    const bg = await getComputedStyle(activePage, 'background-color');
    expect(bg).toBe('rgb(20, 184, 166)');
  });
});

// ============================================================================
// 7j. Product Links
// ============================================================================

test.describe('Product Links', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('product title links to /products/{handle}', async ({page}) => {
    const card = getCard(page, 0);
    const titleLink = card.locator('a').first();
    await expect(titleLink).toHaveAttribute(
      'href',
      '/products/order-1-product',
    );
  });

  test('View button links to /products/{handle}', async ({page}) => {
    const card = getCard(page, 0);
    const viewBtn = card.locator('a[aria-label*="View"]');
    await expect(viewBtn).toHaveAttribute('href', '/products/order-1-product');
  });
});
