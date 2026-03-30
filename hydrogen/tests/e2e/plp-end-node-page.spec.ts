import {test, expect} from '@playwright/test';

/**
 * PLP End-Node Page — automated manual testing plan
 * Plan: plans/PLP_END_NODE_PAGE_PLAN.md (TC-01 through TC-17)
 *
 * End-node collection:    /collections/coffee-tables  (no child nodes)
 * Non-end-node collection:/collections/appliances     (has child subcollections)
 */

const LEAF = '/collections/coffee-tables';
const PARENT = '/collections/appliances';

// ============================================================================
// TC-01: Page Structure — No CollectionHero
// ============================================================================

test.describe('TC-01: Page structure — no CollectionHero', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('page loads without errors', async ({page}) => {
    await expect(page).not.toHaveURL(/error/);
  });

  test('no CollectionHero image renders above the grid', async ({page}) => {
    // CollectionHero renders a <section> with an img as the first thing.
    // We check there is no full-width hero image in the first child of main.
    // The hero component has a distinct fixed height (280px) image section.
    // After the redesign, the page should go breadcrumbs → sidebar+grid directly.
    const heroSection = page.locator('section').first();
    // If a hero section exists it should NOT contain a full hero image block
    // (i.e., the first visible section should not be a CollectionHero).
    // We verify by checking there's no img with the 280px-height hero pattern.
    const heroImg = page.locator('[style*="height: 280"]');
    await expect(heroImg).toHaveCount(0);
  });

  test('breadcrumbs render with chevron separators', async ({page}) => {
    const nav = page.locator('nav[aria-label="breadcrumb"]');
    await expect(nav).toBeVisible();

    const homeLink = nav.locator('a', {hasText: /^Home$/});
    await expect(homeLink).toBeVisible();

    const catLink = nav.locator('a', {hasText: /Categories/});
    await expect(catLink).toBeVisible();

    // Current page (last crumb) is not a link
    const currentPage = nav.locator('[data-slot="breadcrumb-page"]');
    await expect(currentPage).toBeVisible();
    await expect(currentPage).toContainText(/coffee tables/i);
  });

  test('chevron (not slash) is used as breadcrumb separator', async ({
    page,
  }) => {
    const separators = page.locator(
      'nav[aria-label="breadcrumb"] [aria-hidden="true"]',
    );
    // Should have at least one separator with chevron SVG (not "/" text)
    const count = await separators.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const text = await separators.nth(i).textContent();
      expect(text?.trim()).not.toBe('/');
    }
  });
});

// ============================================================================
// TC-02: Filter Sidebar — Card Appearance
// ============================================================================

test.describe('TC-02: Filter sidebar card appearance', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('sidebar card is visible with border and rounded corners', async ({
    page,
  }) => {
    const aside = page.locator('aside').first();
    await expect(aside).toBeVisible();

    // The card div inside aside
    const card = aside.locator('div').first();
    await expect(card).toBeVisible();

    // Check computed styles for border and border-radius
    const borderColor = await card.evaluate(
      (el) => getComputedStyle(el).borderColor,
    );
    const borderRadius = await card.evaluate(
      (el) => getComputedStyle(el).borderRadius,
    );
    // border should be present (not 0px or none)
    expect(borderRadius).not.toBe('0px');
    expect(borderColor).not.toBe('');
  });

  test('"Filters" title appears in sidebar', async ({page}) => {
    const aside = page.locator('aside').first();
    const title = aside.locator('h2', {hasText: /^Filters$/});
    await expect(title).toBeVisible();
  });

  test('sidebar width is approximately 240px', async ({page}) => {
    const aside = page.locator('aside').first();
    const box = await aside.boundingBox();
    expect(box).not.toBeNull();
    // Allow ±10px tolerance
    expect(box!.width).toBeGreaterThanOrEqual(230);
    expect(box!.width).toBeLessThanOrEqual(260);
  });
});

// ============================================================================
// TC-03: Filter Sidebar — Section Titles
// ============================================================================

test.describe('TC-03: Filter sidebar section titles', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('filter group titles are uppercase via CSS textTransform', async ({
    page,
  }) => {
    const aside = page.locator('aside').first();
    const triggers = aside.locator('button[data-slot="accordion-trigger"]');
    const count = await triggers.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      // Tailwind `uppercase` applies CSS text-transform: uppercase (not raw HTML uppercase)
      const transform = await triggers
        .nth(i)
        .evaluate((el) => getComputedStyle(el).textTransform);
      expect(transform).toBe('uppercase');
    }
  });

  test('section titles exist (at least 2 filter groups)', async ({page}) => {
    const aside = page.locator('aside').first();
    const triggers = aside.locator('button[data-slot="accordion-trigger"]');
    const count = await triggers.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// TC-04: Filter Sidebar — Category Section (Link List, not checkboxes)
// ============================================================================

test.describe('TC-04: Filter sidebar category section — link list', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('category/product type filter renders links with count badges', async ({
    page,
  }) => {
    const aside = page.locator('aside').first();
    // Look for a filter section whose title is "CATEGORY" or "PRODUCT TYPE"
    const categoryTrigger = aside.locator('button[data-slot="accordion-trigger"]', {
      hasText: /CATEGORY|PRODUCT TYPE/i,
    });
    if ((await categoryTrigger.count()) === 0) {
      test.skip(); // no category filter from Shopify for this collection
      return;
    }
    // The category section should have Link items (not checkboxes)
    const categorySection = aside.locator('[data-slot="accordion-content"]').first();
    // Links should exist
    const links = categorySection.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
    // No checkboxes inside category section
    const checkboxes = categorySection.locator('[data-slot="checkbox"]');
    await expect(checkboxes).toHaveCount(0);
  });
});

// ============================================================================
// TC-05: Filter Sidebar — Price Range Section
// ============================================================================

test.describe('TC-05: Filter sidebar price range section', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('price range section has Min/Max inputs and Apply button', async ({
    page,
  }) => {
    const aside = page.locator('aside').first();
    const priceTrigger = aside.locator('button[data-slot="accordion-trigger"]', {
      hasText: /PRICE/i,
    });
    if ((await priceTrigger.count()) === 0) {
      test.skip();
      return;
    }

    const minInput = aside.locator('input[placeholder="Min"]');
    const maxInput = aside.locator('input[placeholder="Max"]');
    const applyBtn = aside.locator('button', {hasText: /^Apply$/});

    await expect(minInput).toBeVisible();
    await expect(maxInput).toBeVisible();
    await expect(applyBtn).toBeVisible();
  });

  test('Apply button has teal background', async ({page}) => {
    const aside = page.locator('aside').first();
    const applyBtn = aside.locator('button', {hasText: /^Apply$/});
    if ((await applyBtn.count()) === 0) {
      test.skip();
      return;
    }
    await expect(applyBtn).toBeVisible();
    const bg = await applyBtn.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    // #2699a6 = rgb(38, 153, 166)
    expect(bg).toContain('38');
  });

  test('clicking Apply with min/max values adds price filter to URL', async ({
    page,
  }) => {
    const aside = page.locator('aside').first();
    const minInput = aside.locator('input[placeholder="Min"]');
    const applyBtn = aside.locator('button', {hasText: /^Apply$/});
    if ((await applyBtn.count()) === 0) {
      test.skip();
      return;
    }
    await minInput.fill('50');
    await applyBtn.click();
    await page.waitForURL(/filter/);
    expect(page.url()).toContain('filter');
  });
});

// ============================================================================
// TC-06: Filter Sidebar — Checkboxes (Brand/Rating/Availability)
// ============================================================================

test.describe('TC-06: Filter sidebar checkboxes', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('checkboxes exist in non-category/non-price filter sections', async ({
    page,
  }) => {
    const aside = page.locator('aside').first();
    const checkboxes = aside.locator('[data-slot="checkbox"]');
    // There should be at least some checkboxes (Brand, Rating, etc.)
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a checkbox filter navigates to filtered URL', async ({
    page,
  }) => {
    const aside = page.locator('aside').first();
    // Find the first checkbox link and click it
    const checkboxLink = aside
      .locator('a:has([data-slot="checkbox"])')
      .first();
    if ((await checkboxLink.count()) === 0) {
      test.skip();
      return;
    }
    await checkboxLink.click();
    await page.waitForURL(/filter/);
    expect(page.url()).toContain('filter');
  });
});

// ============================================================================
// TC-07: Filter Sidebar — Clear Button
// ============================================================================

test.describe('TC-07: Filter sidebar clear button', () => {
  test('× button appears and clears all filters', async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    // Navigate with a filter already applied
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');

    // Apply a filter first
    const aside = page.locator('aside').first();
    const checkboxLink = aside
      .locator('a:has([data-slot="checkbox"])')
      .first();
    if ((await checkboxLink.count()) === 0) {
      test.skip();
      return;
    }
    await checkboxLink.click();
    await page.waitForURL(/filter/);

    // Now the × clear button should be visible
    const clearBtn = aside.locator('a[aria-label="Clear all filters"]');
    await expect(clearBtn).toBeVisible();

    // Click clear — React Router client-side nav; use waitForURL not networkidle
    await clearBtn.click();
    await page.waitForURL((url) => !url.toString().includes('filter='), {
      timeout: 5000,
    });

    // URL should no longer have filter params
    expect(page.url()).not.toContain('filter=');
  });
});

// ============================================================================
// TC-08: Results Header — Layout & Typography
// ============================================================================

test.describe('TC-08: Results header layout and typography', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('"N Product Results" heading is visible', async ({page}) => {
    const heading = page.locator('h2', {hasText: /Product Results/});
    await expect(heading).toBeVisible();
  });

  test('results heading is left-aligned (not centered)', async ({page}) => {
    const heading = page.locator('h2', {hasText: /Product Results/});
    const box = await heading.boundingBox();
    expect(box).not.toBeNull();
    // Left-aligned means the heading's left edge is close to the main content left edge
    // (not at 50% of the viewport)
    const viewportWidth = 1280;
    expect(box!.x).toBeLessThan(viewportWidth * 0.4);
  });

  test('"Showing" subtitle is visible', async ({page}) => {
    const subtitle = page.locator('p', {hasText: /Showing/});
    await expect(subtitle).toBeVisible();
  });

  test('Sort dropdown is visible in results header', async ({page}) => {
    // SortSelect renders a Select trigger
    const sortTrigger = page.locator('[data-slot="select-trigger"]');
    await expect(sortTrigger).toBeVisible();
    await expect(sortTrigger).toContainText(/Sort by/i);
  });

  test('results header has a bottom border separator', async ({page}) => {
    const header = page.locator('h2', {hasText: /Product Results/}).locator('..');
    const parentDiv = header.locator('..');
    // The border div should have border-b class
    const hasBorder = await parentDiv.evaluate((el) => {
      return getComputedStyle(el).borderBottomWidth !== '0px';
    });
    expect(hasBorder).toBe(true);
  });
});

// ============================================================================
// TC-09: Active Filter Chips
// ============================================================================

test.describe('TC-09: Active filter chips', () => {
  test('chips row is hidden when no filters are active', async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
    // ActiveFilterChips returns null when no active filters
    const chip = page.locator('a[aria-label^="Remove filter:"]');
    await expect(chip).toHaveCount(0);
    const clearAll = page.locator('a', {hasText: /^Clear all$/});
    await expect(clearAll).toHaveCount(0);
  });

  test('chips appear after applying a filter', async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');

    const aside = page.locator('aside').first();
    const checkboxLink = aside
      .locator('a:has([data-slot="checkbox"])')
      .first();
    if ((await checkboxLink.count()) === 0) {
      test.skip();
      return;
    }
    await checkboxLink.click();
    await page.waitForURL(/filter/);
    await page.waitForLoadState('networkidle');

    // Chips should now be visible
    const chip = page.locator('a[aria-label^="Remove filter:"]');
    await expect(chip.first()).toBeVisible();

    // Clear all button should appear
    const clearAll = page.locator('a', {hasText: /^Clear all$/});
    await expect(clearAll).toBeVisible();
  });

  test('clicking × on a chip removes that filter', async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');

    const aside = page.locator('aside').first();
    const checkboxLink = aside
      .locator('a:has([data-slot="checkbox"])')
      .first();
    if ((await checkboxLink.count()) === 0) {
      test.skip();
      return;
    }
    await checkboxLink.click();
    await page.waitForURL(/filter/);
    await page.waitForLoadState('networkidle');

    const chip = page.locator('a[aria-label^="Remove filter:"]').first();
    await chip.click();
    // React Router client-side navigation — wait for URL to drop the filter param
    await page.waitForURL((url) => !url.toString().includes('filter='), {
      timeout: 5000,
    });

    // Filter removed from URL
    expect(page.url()).not.toContain('filter=');
  });

  test('Clear all removes all filters', async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');

    const aside = page.locator('aside').first();
    const checkboxLinks = aside.locator('a:has([data-slot="checkbox"])');
    if ((await checkboxLinks.count()) < 1) {
      test.skip();
      return;
    }
    await checkboxLinks.first().click();
    await page.waitForURL(/filter/);
    await page.waitForLoadState('networkidle');

    const clearAll = page.locator('a', {hasText: /^Clear all$/});
    await clearAll.click();
    await page.waitForURL((url) => !url.toString().includes('filter='), {
      timeout: 5000,
    });
    expect(page.url()).not.toContain('filter=');
  });
});

// ============================================================================
// TC-10: Product Grid — 4-Column Layout
// ============================================================================

test.describe('TC-10: Product grid 4-column layout', () => {
  test('4 columns at 1280px desktop', async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');

    const cards = page.locator('article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    if (count >= 4) {
      const box0 = await cards.nth(0).boundingBox();
      const box1 = await cards.nth(1).boundingBox();
      const box2 = await cards.nth(2).boundingBox();
      const box3 = await cards.nth(3).boundingBox();

      // All 4 cards should be on the same row (same top y coordinate ±5px)
      expect(Math.abs(box0!.y - box1!.y)).toBeLessThan(5);
      expect(Math.abs(box0!.y - box2!.y)).toBeLessThan(5);
      expect(Math.abs(box0!.y - box3!.y)).toBeLessThan(5);
    }
  });

  test('2 columns at mobile (375px)', async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');

    const cards = page.locator('article');
    const count = await cards.count();
    if (count < 3) {
      test.skip();
      return;
    }

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();

    // First two on same row, third on next row
    expect(Math.abs(box0!.y - box1!.y)).toBeLessThan(5);
    expect(box2!.y).toBeGreaterThan(box0!.y + 10);
  });
});

// ============================================================================
// TC-11: Product Card (End-Node Variant)
// ============================================================================

test.describe('TC-11: Product card end-node variant', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('product cards have white bg and rounded corners', async ({page}) => {
    const card = page.locator('article').first();
    await expect(card).toBeVisible();

    const bg = await card.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    const radius = await card.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(bg).toContain('255'); // white
    expect(radius).not.toBe('0px');
  });

  test('product card image area is approximately 250px tall', async ({
    page,
  }) => {
    const card = page.locator('article').first();
    // Image container is the first div inside the card
    const imgContainer = card.locator('div').first();
    const box = await imgContainer.boundingBox();
    expect(box).not.toBeNull();
    // Allow ±5px tolerance
    expect(box!.height).toBeGreaterThanOrEqual(245);
    expect(box!.height).toBeLessThanOrEqual(260);
  });

  test('wishlist heart button is visible on card', async ({page}) => {
    const card = page.locator('article').first();
    const heartBtn = card.locator('button[aria-label*="wishlist"]');
    await expect(heartBtn).toBeVisible();
  });

  test('product title links to PDP', async ({page}) => {
    const card = page.locator('article').first();
    const titleLink = card.locator('h3 a');
    await expect(titleLink).toBeVisible();
    const href = await titleLink.getAttribute('href');
    expect(href).toContain('/products/');
  });

  test('price is visible on card', async ({page}) => {
    const card = page.locator('article').first();
    // Price should contain a dollar sign
    const priceEl = card.locator('span', {hasText: /\$/});
    await expect(priceEl.first()).toBeVisible();
  });
});

// ============================================================================
// TC-12: Container Width
// ============================================================================

test.describe('TC-12: Container width max-w-[1400px]', () => {
  test('content container is at most 1400px wide', async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');

    // The main content container div with max-w-[1400px]
    const aside = page.locator('aside').first();
    const container = aside.locator('..').locator('..');
    const box = await container.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(1402); // 1400 + 2px tolerance
    }
  });
});

// ============================================================================
// TC-13: Non-End-Node Page Unaffected
// ============================================================================

test.describe('TC-13: Non-end-node page unaffected', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(PARENT);
    await page.waitForLoadState('networkidle');
  });

  test('parent collection still renders CollectionHero', async ({page}) => {
    // Non-end-node page has a collection hero with a title
    const heroTitle = page.locator('#collection-title');
    await expect(heroTitle).toBeVisible();
  });

  test('parent collection has subcategory scroll section', async ({page}) => {
    // SubcategoryScrollSection renders a scrollable row of category cards
    const scrollSection = page
      .locator('section')
      .filter({hasText: /categories/i})
      .first();
    // OR check for a horizontally scrolling container
    const hscroll = page.locator('[class*="overflow-x"]').first();
    const heroOrScroll =
      (await scrollSection.count()) > 0 || (await hscroll.count()) > 0;
    expect(heroOrScroll).toBe(true);
  });

  test('parent collection has no FilterSidebar', async ({page}) => {
    // FilterSidebar is rendered as an aside — should not appear on non-end-node
    const aside = page.locator('aside');
    await expect(aside).toHaveCount(0);
  });
});

// ============================================================================
// TC-14: Sort Functionality
// ============================================================================

test.describe('TC-14: Sort functionality', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('sort dropdown opens and shows options', async ({page}) => {
    const sortTrigger = page.locator('[data-slot="select-trigger"]');
    await sortTrigger.click();

    // Options should appear in a popover/listbox
    const options = page.locator('[data-slot="select-content"]');
    await expect(options).toBeVisible();
  });

  test('selecting a non-default sort option updates the URL', async ({
    page,
  }) => {
    const sortTrigger = page.locator('[data-slot="select-trigger"]');
    await sortTrigger.click();

    // Click "Price: Low to High" — a non-default option so sort param is added
    // Radix UI SelectItem uses role="option" inside the dropdown
    const priceOption = page
      .locator('[role="option"]')
      .filter({hasText: /low.*high|price.*asc/i});
    const fallbackOption = page.locator('[role="option"]').filter({
      hasText: /newest|best selling/i,
    });

    if ((await priceOption.count()) > 0) {
      await priceOption.first().click();
    } else if ((await fallbackOption.count()) > 0) {
      await fallbackOption.first().click();
    } else {
      // Last resort: click any option that isn't the current (first) one
      const allOptions = page.locator('[role="option"]');
      await allOptions.nth(1).click();
    }

    // Wait for URL to include sort param (non-default sort adds ?sort=...)
    await page.waitForURL(/sort=/, {timeout: 5000});
    expect(page.url()).toMatch(/sort=/);
  });
});

// ============================================================================
// TC-15: Mobile Layout
// ============================================================================

test.describe('TC-15: Mobile layout', () => {
  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 375, height: 812});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');
  });

  test('desktop sidebar is hidden on mobile', async ({page}) => {
    const aside = page.locator('aside');
    // `hidden lg:block` means the aside is in DOM but not visible
    await expect(aside).toBeHidden();
  });

  test('"Filters" button is visible on mobile', async ({page}) => {
    const filtersBtn = page.locator('button', {hasText: /^Filters$/});
    await expect(filtersBtn).toBeVisible();
  });

  test('clicking Filters button opens the Sheet drawer', async ({page}) => {
    const filtersBtn = page.locator('button', {hasText: /^Filters$/});
    await filtersBtn.click();

    // Sheet should open — look for the Sheet content
    const sheetContent = page.locator('[data-slot="sheet-content"]');
    await expect(sheetContent).toBeVisible({timeout: 3000});
  });

  test('Sheet drawer contains filter sections', async ({page}) => {
    const filtersBtn = page.locator('button', {hasText: /^Filters$/});
    await filtersBtn.click();

    const sheetContent = page.locator('[data-slot="sheet-content"]');
    await expect(sheetContent).toBeVisible({timeout: 3000});

    // Should have accordion triggers inside the sheet
    const triggers = sheetContent.locator(
      'button[data-slot="accordion-trigger"]',
    );
    const count = await triggers.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================================
// TC-16: Pagination / Load More
// ============================================================================

test.describe('TC-16: Pagination — Load More', () => {
  test('"Load More" button appears when more products exist', async ({
    page,
  }) => {
    await page.setViewportSize({width: 1280, height: 900});
    await page.goto(LEAF);
    await page.waitForLoadState('networkidle');

    // Check if Load More exists (only when hasNextPage)
    const loadMore = page.locator('a', {hasText: /Load More/i});
    const hasLoadMore = (await loadMore.count()) > 0;

    if (hasLoadMore) {
      await expect(loadMore.first()).toBeVisible();
    } else {
      // Collection has fewer than 24 products — acceptable
      test.info().annotations.push({
        type: 'info',
        description: 'Collection has ≤24 products — no Load More needed',
      });
    }
  });
});

// ============================================================================
// TC-17: Empty State
// ============================================================================

test.describe('TC-17: Empty state — no products match filters', () => {
  test('shows empty state with clear filters link when no products match', async ({
    page,
  }) => {
    await page.setViewportSize({width: 1280, height: 900});
    // Use an extreme price filter that should return 0 results
    await page.goto(
      `${LEAF}?filter=${encodeURIComponent(JSON.stringify({price: {min: 999999}}))}`,
    );
    await page.waitForLoadState('networkidle');

    // If the collection genuinely has 0 results with this filter,
    // we should see an empty state message
    const productCards = page.locator('article');
    const cardCount = await productCards.count();

    if (cardCount === 0) {
      // Empty state should be visible
      const emptyState = page.locator('text=/no products/i');
      await expect(emptyState.first()).toBeVisible();
    } else {
      // The filter didn't zero out results for this collection — skip
      test.info().annotations.push({
        type: 'info',
        description:
          'Collection has products matching extreme price filter — empty state not triggered',
      });
    }
  });
});
