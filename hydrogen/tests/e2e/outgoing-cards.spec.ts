import {test, expect, type Page, type Locator} from '@playwright/test';

/**
 * Automated tests for the "On the Way Out" tab — OutgoingCard + ReturnProgressTracker.
 *
 * Uses the test route at /test/outgoing-cards which renders components
 * with mock data (no auth required).
 *
 * Covers the full manual testing plan from:
 *   plans/ACCOUNT_ORDERS_ON_THE_WAY_OUT_PLAN.md
 */

const TEST_URL = '/test/outgoing-cards';

// ============================================================================
// Helpers
// ============================================================================

/** Get all outgoing card root elements */
function getCards(page: Page) {
  return page.locator('[data-testid="outgoing-cards"] > div');
}

/** Get a specific card by index (0-based) */
function getCard(page: Page, index: number) {
  return getCards(page).nth(index);
}

/** Parse a CSS color to rgb/rgba for comparison */
async function getComputedStyle(
  locator: Locator,
  property: string,
): Promise<string> {
  return locator.evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property,
  );
}

/** Parse computed dimensions */
async function getBoundingBox(locator: Locator) {
  return locator.boundingBox();
}

// ============================================================================
// Phase 2: ReturnProgressTracker Tests
// ============================================================================

test.describe('Phase 2 — ReturnProgressTracker', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Visual Fidelity', () => {
    test('tracker container has correct background, radius, and padding', async ({
      page,
    }) => {
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      await expect(tracker).toBeVisible();

      const bg = await getComputedStyle(tracker, 'background-color');
      // #f9fafb = rgb(249, 250, 251)
      expect(bg).toBe('rgb(249, 250, 251)');

      const borderRadius = await getComputedStyle(tracker, 'border-radius');
      expect(borderRadius).toBe('8px');

      const padding = await getComputedStyle(tracker, 'padding');
      expect(padding).toBe('16px');
    });

    test('connecting line is visible with correct styling', async ({page}) => {
      // The connecting line is the absolute div inside the tracker
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const line = tracker.locator('.bg-\\[\\#d1d5db\\].h-\\[3px\\]');
      await expect(line).toBeVisible();

      const bg = await getComputedStyle(line, 'background-color');
      // #d1d5db = rgb(209, 213, 219)
      expect(bg).toBe('rgb(209, 213, 219)');

      const height = await getComputedStyle(line, 'height');
      expect(height).toBe('3px');
    });

    test('5 steps are visible in each tracker', async ({page}) => {
      // Check each of the 3 cards has 5 steps
      for (let cardIdx = 0; cardIdx < 3; cardIdx++) {
        const tracker = getCard(page, cardIdx).locator(
          '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
        );
        const steps = tracker.locator('.flex-1.flex-col');
        await expect(steps).toHaveCount(5);
      }
    });
  });

  test.describe('Completed Steps', () => {
    test('completed step icons are green circles with white checkmarks', async ({
      page,
    }) => {
      // Card 0 (return-shipped) has steps 1-3 completed
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const completedIcons = tracker.locator('.bg-\\[\\#2ac864\\]');

      // return-shipped has 3 completed steps
      await expect(completedIcons).toHaveCount(3);

      // Check first completed icon dimensions
      const firstIcon = completedIcons.first();
      const box = await getBoundingBox(firstIcon);
      expect(box!.width).toBeCloseTo(32, 0);
      expect(box!.height).toBeCloseTo(32, 0);

      // Should contain a check SVG (white)
      const svg = firstIcon.locator('svg');
      await expect(svg).toBeVisible();
    });

    test('completed step labels are dark text', async ({page}) => {
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const steps = tracker.locator('.flex-1.flex-col');

      // First step label (completed)
      const label = steps.nth(0).locator('span');
      await expect(label).toHaveText('Return Requested');

      const color = await getComputedStyle(label, 'color');
      // #111827 = rgb(17, 24, 39)
      expect(color).toBe('rgb(17, 24, 39)');

      const fontSize = await getComputedStyle(label, 'font-size');
      expect(fontSize).toBe('12px');
    });
  });

  test.describe('Active Steps', () => {
    test('active step icon is teal with shadow ring', async ({page}) => {
      // Card 0 (return-shipped): step 4 is active (In Transit)
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const activeIcon = tracker.locator('.bg-\\[\\#2699a6\\]');
      await expect(activeIcon).toHaveCount(1);

      const box = await getBoundingBox(activeIcon);
      expect(box!.width).toBeCloseTo(32, 0);
      expect(box!.height).toBeCloseTo(32, 0);

      // Check shadow
      const shadow = await getComputedStyle(activeIcon, 'box-shadow');
      expect(shadow).toContain('rgba(38, 153, 166');
    });

    test('only one step has active state per tracker', async ({page}) => {
      for (let cardIdx = 0; cardIdx < 3; cardIdx++) {
        const tracker = getCard(page, cardIdx).locator(
          '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
        );
        const activeIcons = tracker.locator('.bg-\\[\\#2699a6\\]');
        await expect(activeIcons).toHaveCount(1);
      }
    });

    test('active step label is dark text (same as completed)', async ({
      page,
    }) => {
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const steps = tracker.locator('.flex-1.flex-col');

      // Step 4 (index 3) is active for return-shipped
      const label = steps.nth(3).locator('span');
      await expect(label).toHaveText('In Transit');

      const color = await getComputedStyle(label, 'color');
      expect(color).toBe('rgb(17, 24, 39)');
    });
  });

  test.describe('Pending Steps', () => {
    test('pending step icons are gray circles', async ({page}) => {
      // Card 0 (return-shipped): step 5 is pending
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const pendingIcons = tracker.locator(
        'div.bg-\\[\\#d1d5db\\].size-\\[32px\\]',
      );

      // return-shipped has 1 pending step
      await expect(pendingIcons).toHaveCount(1);
    });

    test('pending step labels are gray-600 text', async ({page}) => {
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const steps = tracker.locator('.flex-1.flex-col');

      // Step 5 (index 4) is pending for return-shipped
      const label = steps.nth(4).locator('span');
      await expect(label).toHaveText('Refund Processed');

      const color = await getComputedStyle(label, 'color');
      // #4b5563 = rgb(75, 85, 99)
      expect(color).toBe('rgb(75, 85, 99)');
    });

    test('no shadow ring on pending steps', async ({page}) => {
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const pendingIcon = tracker.locator(
        'div.bg-\\[\\#d1d5db\\].size-\\[32px\\]',
      );
      const shadow = await getComputedStyle(pendingIcon.first(), 'box-shadow');
      expect(shadow).toBe('none');
    });
  });

  test.describe('Step Configuration per Card Status', () => {
    test('return-shipped: steps 1-3 completed, step 4 active, step 5 pending', async ({
      page,
    }) => {
      const tracker = getCard(page, 0).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const steps = tracker.locator('.flex-1.flex-col');

      // Labels
      await expect(steps.nth(0).locator('span')).toHaveText('Return Requested');
      await expect(steps.nth(1).locator('span')).toHaveText('Label Generated');
      await expect(steps.nth(2).locator('span')).toHaveText('Package Shipped');
      await expect(steps.nth(3).locator('span')).toHaveText('In Transit');
      await expect(steps.nth(4).locator('span')).toHaveText('Refund Processed');

      // Green icons count (completed)
      const green = tracker.locator('.bg-\\[\\#2ac864\\]');
      await expect(green).toHaveCount(3);

      // Teal icon count (active)
      const teal = tracker.locator('.bg-\\[\\#2699a6\\]');
      await expect(teal).toHaveCount(1);

      // Gray icon count (pending)
      const gray = tracker.locator('div.bg-\\[\\#d1d5db\\].size-\\[32px\\]');
      await expect(gray).toHaveCount(1);
    });

    test('awaiting-pickup: steps 1-2 completed, step 3 active, steps 4-5 pending', async ({
      page,
    }) => {
      const tracker = getCard(page, 1).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const steps = tracker.locator('.flex-1.flex-col');

      await expect(steps.nth(0).locator('span')).toHaveText('Return Requested');
      await expect(steps.nth(1).locator('span')).toHaveText('Label Generated');
      await expect(steps.nth(2).locator('span')).toHaveText('Awaiting Pickup');
      await expect(steps.nth(3).locator('span')).toHaveText('In Transit');
      await expect(steps.nth(4).locator('span')).toHaveText('Refund Processed');

      const green = tracker.locator('.bg-\\[\\#2ac864\\]');
      await expect(green).toHaveCount(2);

      const teal = tracker.locator('.bg-\\[\\#2699a6\\]');
      await expect(teal).toHaveCount(1);

      const gray = tracker.locator('div.bg-\\[\\#d1d5db\\].size-\\[32px\\]');
      await expect(gray).toHaveCount(2);
    });

    test('exchange: steps 1-3 completed, step 4 active, step 5 pending', async ({
      page,
    }) => {
      const tracker = getCard(page, 2).locator(
        '.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]',
      );
      const steps = tracker.locator('.flex-1.flex-col');

      await expect(steps.nth(0).locator('span')).toHaveText(
        'Exchange Requested',
      );
      await expect(steps.nth(1).locator('span')).toHaveText('Return Shipped');
      await expect(steps.nth(2).locator('span')).toHaveText('New Item Shipped');
      await expect(steps.nth(3).locator('span')).toHaveText('Out for Delivery');
      await expect(steps.nth(4).locator('span')).toHaveText(
        'Exchange Complete',
      );

      const green = tracker.locator('.bg-\\[\\#2ac864\\]');
      await expect(green).toHaveCount(3);

      const teal = tracker.locator('.bg-\\[\\#2699a6\\]');
      await expect(teal).toHaveCount(1);

      const gray = tracker.locator('div.bg-\\[\\#d1d5db\\].size-\\[32px\\]');
      await expect(gray).toHaveCount(1);
    });
  });
});

// ============================================================================
// Phase 3: OutgoingCard Tests
// ============================================================================

test.describe('Phase 3 — OutgoingCard', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Card Container', () => {
    test('card has white bg, 12px radius, shadow, overflow-clip', async ({
      page,
    }) => {
      const card = getCard(page, 0);
      await expect(card).toBeVisible();

      const bg = await getComputedStyle(card, 'background-color');
      expect(bg).toBe('rgb(255, 255, 255)');

      const borderRadius = await getComputedStyle(card, 'border-radius');
      expect(borderRadius).toBe('12px');

      const shadow = await getComputedStyle(card, 'box-shadow');
      expect(shadow).toContain('rgba(0, 0, 0');

      const overflow = await getComputedStyle(card, 'overflow');
      expect(overflow).toBe('clip');
    });

    test('card stretches to full width', async ({page}) => {
      const card = getCard(page, 0);
      const container = page.locator('[data-testid="outgoing-cards"]');

      const cardBox = await getBoundingBox(card);
      const containerBox = await getBoundingBox(container);
      expect(cardBox!.width).toBeCloseTo(containerBox!.width, 0);
    });

    test('3 cards are rendered (one per status)', async ({page}) => {
      const cards = getCards(page);
      await expect(cards).toHaveCount(3);
    });
  });

  test.describe('Card Header — Gradient & Meta', () => {
    test('header has gradient background and bottom border', async ({page}) => {
      const card = getCard(page, 0);
      // Header is the first child div with border-b
      const header = card.locator('> div').first();

      const bg = await getComputedStyle(header, 'background-image');
      expect(bg).toContain('gradient');

      const borderBottom = await getComputedStyle(
        header,
        'border-bottom-color',
      );
      // #e5e7eb = rgb(229, 231, 235)
      expect(borderBottom).toBe('rgb(229, 231, 235)');
    });

    test('return card shows: Return Initiated, Refund Amount, Original Order #', async ({
      page,
    }) => {
      const card = getCard(page, 0);
      const header = card.locator('> div').first();

      await expect(header.getByText('Return Initiated')).toBeVisible();
      await expect(header.getByText('$79.99')).toBeVisible();
      await expect(header.getByText('Original Order #')).toBeVisible();
      await expect(header.getByText('#1042')).toBeVisible();
    });

    test('exchange card shows: Exchange Requested, Exchange For, Original Order #', async ({
      page,
    }) => {
      const card = getCard(page, 2);
      const header = card.locator('> div').first();

      await expect(header.getByText('Exchange Requested')).toBeVisible();
      await expect(header.getByText('Large Size')).toBeVisible();
      await expect(header.getByText('Original Order #')).toBeVisible();
      await expect(header.getByText('#1035')).toBeVisible();
    });

    test('meta labels are 12px uppercase font-medium gray', async ({page}) => {
      const card = getCard(page, 0);
      const label = card.getByText('Return Initiated');

      const fontSize = await getComputedStyle(label, 'font-size');
      expect(fontSize).toBe('12px');

      const fontWeight = await getComputedStyle(label, 'font-weight');
      expect(fontWeight).toBe('500'); // font-medium

      const textTransform = await getComputedStyle(label, 'text-transform');
      expect(textTransform).toBe('uppercase');

      const color = await getComputedStyle(label, 'color');
      // #6b7280 = rgb(107, 114, 128)
      expect(color).toBe('rgb(107, 114, 128)');
    });

    test('meta values are 15px font-semibold dark', async ({page}) => {
      const card = getCard(page, 0);
      const value = card.getByText('$79.99');

      const fontSize = await getComputedStyle(value, 'font-size');
      expect(fontSize).toBe('15px');

      const fontWeight = await getComputedStyle(value, 'font-weight');
      expect(fontWeight).toBe('600'); // font-semibold

      const color = await getComputedStyle(value, 'color');
      // #111827 = rgb(17, 24, 39)
      expect(color).toBe('rgb(17, 24, 39)');
    });

    test('Original Order # value is teal link', async ({page}) => {
      const card = getCard(page, 0);
      const orderLink = card.getByRole('link', {name: '#1042'});
      await expect(orderLink).toBeVisible();

      const color = await getComputedStyle(orderLink, 'color');
      // #2699a6 = rgb(38, 153, 166)
      expect(color).toBe('rgb(38, 153, 166)');

      const fontWeight = await getComputedStyle(orderLink, 'font-weight');
      expect(fontWeight).toBe('600');
    });
  });

  test.describe('Card Header — Status Badges', () => {
    test('return-shipped badge: green bg, green text, PackageCheck icon', async ({
      page,
    }) => {
      const header = getCard(page, 0).locator('> div').first();
      const badge = header.locator('.font-semibold.text-\\[13px\\]').first();
      await expect(badge).toHaveText('Return Shipped');

      const color = await getComputedStyle(badge, 'color');
      // #2ac864 = rgb(42, 200, 100)
      expect(color).toBe('rgb(42, 200, 100)');

      const fontSize = await getComputedStyle(badge, 'font-size');
      expect(fontSize).toBe('13px');

      const fontWeight = await getComputedStyle(badge, 'font-weight');
      expect(fontWeight).toBe('600');

      // Check parent badge container bg
      const badgeContainer = badge.locator('..');
      const bg = await getComputedStyle(badgeContainer, 'background-color');
      // rgba(42,200,100,0.1) = approximately rgb(245,252,247) after compositing, but raw value should contain rgba
      expect(bg).toContain('42, 200, 100');
    });

    test('awaiting-pickup badge: amber bg, amber text, Clock icon', async ({
      page,
    }) => {
      const header = getCard(page, 1).locator('> div').first();
      const badge = header.locator('.font-semibold.text-\\[13px\\]').first();
      await expect(badge).toHaveText('Awaiting Pickup');

      const color = await getComputedStyle(badge, 'color');
      // #f2b05e = rgb(242, 176, 94)
      expect(color).toBe('rgb(242, 176, 94)');

      const badgeContainer = badge.locator('..');
      const bg = await getComputedStyle(badgeContainer, 'background-color');
      expect(bg).toContain('242, 176, 94');
    });

    test('exchange badge: teal bg, teal text, Truck icon', async ({page}) => {
      const header = getCard(page, 2).locator('> div').first();
      const badge = header.locator('.font-semibold.text-\\[13px\\]').first();
      await expect(badge).toHaveText('Out for Delivery');

      const color = await getComputedStyle(badge, 'color');
      // #2699a6 = rgb(38, 153, 166)
      expect(color).toBe('rgb(38, 153, 166)');

      const badgeContainer = badge.locator('..');
      const bg = await getComputedStyle(badgeContainer, 'background-color');
      expect(bg).toContain('38, 153, 166');
    });

    test('badge icon is 13px', async ({page}) => {
      const header = getCard(page, 0).locator('> div').first();
      // The badge container has the 13px text + SVG icon
      const badgeContainer = header
        .locator('.font-semibold.text-\\[13px\\]')
        .first()
        .locator('..');
      const icon = badgeContainer.locator('svg');
      await expect(icon).toBeVisible();

      const box = await getBoundingBox(icon);
      expect(box!.width).toBeCloseTo(13, 0);
      expect(box!.height).toBeCloseTo(13, 0);
    });
  });

  test.describe('Card Header — Links', () => {
    test('return-shipped: "View return details | View refund status"', async ({
      page,
    }) => {
      // Scope to header to avoid collision with panel action buttons
      const header = getCard(page, 0).locator('> div').first();
      await expect(
        header.getByRole('button', {name: 'View return details'}),
      ).toBeVisible();
      await expect(
        header.getByRole('button', {name: 'View refund status'}),
      ).toBeVisible();
    });

    test('awaiting-pickup: "View return details | Cancel return"', async ({
      page,
    }) => {
      const header = getCard(page, 1).locator('> div').first();
      await expect(
        header.getByRole('button', {name: 'View return details'}),
      ).toBeVisible();
      await expect(
        header.getByRole('button', {name: 'Cancel return'}),
      ).toBeVisible();
    });

    test('exchange: "View exchange details | Track new item"', async ({
      page,
    }) => {
      const header = getCard(page, 2).locator('> div').first();
      await expect(
        header.getByRole('button', {name: 'View exchange details'}),
      ).toBeVisible();
      await expect(
        header.getByRole('button', {name: 'Track new item'}),
      ).toBeVisible();
    });

    test('links are 14px teal with pipe separator', async ({page}) => {
      const header = getCard(page, 0).locator('> div').first();
      const link = header.getByRole('button', {name: 'View return details'});

      const fontSize = await getComputedStyle(link, 'font-size');
      expect(fontSize).toBe('14px');

      const color = await getComputedStyle(link, 'color');
      expect(color).toBe('rgb(38, 153, 166)');

      // Pipe separator — the span with text-[#d1d5db] class
      const pipe = header.locator('.text-\\[\\#d1d5db\\]').first();
      await expect(pipe).toBeVisible();
      const pipeColor = await getComputedStyle(pipe, 'color');
      // #d1d5db = rgb(209, 213, 219)
      expect(pipeColor).toBe('rgb(209, 213, 219)');
    });
  });

  test.describe('Card Body — Status Text', () => {
    test('status title is 20px bold dark', async ({page}) => {
      const card = getCard(page, 0);
      const title = card.getByText('Return shipped on March 21');

      const fontSize = await getComputedStyle(title, 'font-size');
      expect(fontSize).toBe('20px');

      const fontWeight = await getComputedStyle(title, 'font-weight');
      expect(fontWeight).toBe('700');

      const color = await getComputedStyle(title, 'color');
      expect(color).toBe('rgb(17, 24, 39)');
    });

    test('status message is 14px normal gray', async ({page}) => {
      const card = getCard(page, 0);
      const msg = card.getByText('Your return is on its way');

      const fontSize = await getComputedStyle(msg, 'font-size');
      expect(fontSize).toBe('14px');

      const color = await getComputedStyle(msg, 'color');
      // #4b5563 = rgb(75, 85, 99)
      expect(color).toBe('rgb(75, 85, 99)');
    });
  });

  test.describe('Card Body — Product Row', () => {
    test('product image is 120px square with 8px radius', async ({page}) => {
      const card = getCard(page, 0);
      const img = card.locator('img').first();
      await expect(img).toBeVisible();

      // Check computed size via CSS classes
      const box = await getBoundingBox(img);
      expect(box!.width).toBeCloseTo(120, 0);
      expect(box!.height).toBeCloseTo(120, 0);
    });

    test('product name is 15px font-medium teal link', async ({page}) => {
      const card = getCard(page, 0);
      const productLink = card.getByRole('link', {
        name: 'Classic Cotton T-Shirt',
      });
      await expect(productLink).toBeVisible();

      const fontSize = await getComputedStyle(productLink, 'font-size');
      expect(fontSize).toBe('15px');

      const fontWeight = await getComputedStyle(productLink, 'font-weight');
      expect(fontWeight).toBe('500');

      const color = await getComputedStyle(productLink, 'color');
      expect(color).toBe('rgb(38, 153, 166)');
    });

    test('variant text is 13px gray', async ({page}) => {
      const card = getCard(page, 0);
      const variant = card.getByText('Medium / Navy Blue');
      await expect(variant).toBeVisible();

      const fontSize = await getComputedStyle(variant, 'font-size');
      expect(fontSize).toBe('13px');

      const color = await getComputedStyle(variant, 'color');
      expect(color).toBe('rgb(75, 85, 99)');
    });

    test('return info text is 13px gray', async ({page}) => {
      const card = getCard(page, 0);
      const info = card.getByText('Reason: Not as described');
      await expect(info).toBeVisible();

      const fontSize = await getComputedStyle(info, 'font-size');
      expect(fontSize).toBe('13px');

      const color = await getComputedStyle(info, 'color');
      expect(color).toBe('rgb(75, 85, 99)');
    });
  });

  test.describe('Card Body — Inline Action Buttons', () => {
    test('return-shipped: "Print return label" + "Contact seller"', async ({
      page,
    }) => {
      const card = getCard(page, 0);
      await expect(
        card.getByRole('button', {name: 'Print return label'}),
      ).toBeVisible();
      await expect(
        card.getByRole('button', {name: 'Contact seller'}),
      ).toBeVisible();
    });

    test('awaiting-pickup: "Print return label" + "Reschedule pickup"', async ({
      page,
    }) => {
      const card = getCard(page, 1);
      await expect(
        card.getByRole('button', {name: 'Print return label'}),
      ).toBeVisible();
      await expect(
        card.getByRole('button', {name: 'Reschedule pickup'}),
      ).toBeVisible();
    });

    test('exchange: "View tracking" + "Contact support"', async ({page}) => {
      const card = getCard(page, 2);
      await expect(
        card.getByRole('button', {name: 'View tracking'}),
      ).toBeVisible();
      await expect(
        card.getByRole('button', {name: 'Contact support'}),
      ).toBeVisible();
    });

    test('inline buttons have correct styling', async ({page}) => {
      const card = getCard(page, 0);
      const btn = card.getByRole('button', {name: 'Print return label'});

      const bg = await getComputedStyle(btn, 'background-color');
      expect(bg).toBe('rgb(255, 255, 255)');

      const borderColor = await getComputedStyle(btn, 'border-color');
      // #d1d5db = rgb(209, 213, 219)
      expect(borderColor).toBe('rgb(209, 213, 219)');

      const fontSize = await getComputedStyle(btn, 'font-size');
      expect(fontSize).toBe('14px');

      const fontWeight = await getComputedStyle(btn, 'font-weight');
      expect(fontWeight).toBe('500');

      const color = await getComputedStyle(btn, 'color');
      // #374151 = rgb(55, 65, 81)
      expect(color).toBe('rgb(55, 65, 81)');
    });

    test('no "Buy it again" or "View your item" buttons present', async ({
      page,
    }) => {
      for (let i = 0; i < 3; i++) {
        const card = getCard(page, i);
        await expect(
          card.getByRole('button', {name: 'Buy it again'}),
        ).toHaveCount(0);
        await expect(
          card.getByRole('button', {name: 'View your item'}),
        ).toHaveCount(0);
      }
    });
  });

  test.describe('Card Body — Actions Panel (Desktop)', () => {
    test('actions panel visible on desktop (lg+)', async ({page}) => {
      const card = getCard(page, 0);
      // Panel is the hidden lg:flex div with w-[200px]
      const panel = card.locator('.w-\\[200px\\]');
      await expect(panel).toBeVisible();

      const box = await getBoundingBox(panel);
      expect(box!.width).toBeCloseTo(200, 0);
    });

    test('return-shipped: "Track return package" (primary) + "View refund status" (secondary)', async ({
      page,
    }) => {
      const card = getCard(page, 0);
      const panel = card.locator('.w-\\[200px\\]');

      const primaryBtn = panel.getByRole('button', {
        name: 'Track return package',
      });
      await expect(primaryBtn).toBeVisible();

      const secondaryBtn = panel.getByRole('button', {
        name: 'View refund status',
      });
      await expect(secondaryBtn).toBeVisible();
    });

    test('awaiting-pickup: "View pickup details" (primary) + "Prepare package" (secondary)', async ({
      page,
    }) => {
      const card = getCard(page, 1);
      const panel = card.locator('.w-\\[200px\\]');

      await expect(
        panel.getByRole('button', {name: 'View pickup details'}),
      ).toBeVisible();
      await expect(
        panel.getByRole('button', {name: 'Prepare package'}),
      ).toBeVisible();
    });

    test('exchange: "Track delivery" (primary) + "View exchange details" (secondary)', async ({
      page,
    }) => {
      const card = getCard(page, 2);
      const panel = card.locator('.w-\\[200px\\]');

      await expect(
        panel.getByRole('button', {name: 'Track delivery'}),
      ).toBeVisible();
      await expect(
        panel.getByRole('button', {name: 'View exchange details'}),
      ).toBeVisible();
    });

    test('primary button uses #2699a6 (secondary teal), NOT #14b8a6', async ({
      page,
    }) => {
      const card = getCard(page, 0);
      const panel = card.locator('.w-\\[200px\\]');
      const primaryBtn = panel.getByRole('button', {
        name: 'Track return package',
      });

      const bg = await getComputedStyle(primaryBtn, 'background-color');
      // #2699a6 = rgb(38, 153, 166)
      expect(bg).toBe('rgb(38, 153, 166)');

      // NOT #14b8a6 = rgb(20, 184, 166)
      expect(bg).not.toBe('rgb(20, 184, 166)');
    });

    test('primary button has white text, 14px font-medium', async ({page}) => {
      const card = getCard(page, 0);
      const panel = card.locator('.w-\\[200px\\]');
      const primaryBtn = panel.getByRole('button', {
        name: 'Track return package',
      });

      const color = await getComputedStyle(primaryBtn, 'color');
      expect(color).toBe('rgb(255, 255, 255)');

      const fontSize = await getComputedStyle(primaryBtn, 'font-size');
      expect(fontSize).toBe('14px');

      const fontWeight = await getComputedStyle(primaryBtn, 'font-weight');
      expect(fontWeight).toBe('500');
    });

    test('secondary button has white bg, gray border, dark text', async ({
      page,
    }) => {
      const card = getCard(page, 0);
      const panel = card.locator('.w-\\[200px\\]');
      const btn = panel.getByRole('button', {name: 'View refund status'});

      const bg = await getComputedStyle(btn, 'background-color');
      expect(bg).toBe('rgb(255, 255, 255)');

      const borderColor = await getComputedStyle(btn, 'border-color');
      expect(borderColor).toBe('rgb(209, 213, 219)');

      const color = await getComputedStyle(btn, 'color');
      expect(color).toBe('rgb(55, 65, 81)');
    });
  });
});

// ============================================================================
// Phase 4: Route Integration Tests
// ============================================================================

test.describe('Phase 4 — Route Integration', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test.beforeEach(async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Tab Switching', () => {
    test('"On the Way Out" tab is active by default on test page', async ({
      page,
    }) => {
      await expect(
        page.locator('[data-testid="outgoing-content"]'),
      ).toBeVisible();
    });

    test('switching to "Orders" tab hides outgoing cards', async ({page}) => {
      // Click the Orders tab
      await page.getByRole('button', {name: 'Orders'}).click();

      await expect(
        page.locator('[data-testid="outgoing-content"]'),
      ).not.toBeVisible();
      await expect(
        page.locator('[data-testid="other-tab-content"]'),
      ).toBeVisible();
    });

    test('switching back to "On the Way Out" shows outgoing cards again', async ({
      page,
    }) => {
      await page.getByRole('button', {name: 'Orders'}).click();
      await expect(
        page.locator('[data-testid="other-tab-content"]'),
      ).toBeVisible();

      await page.getByRole('button', {name: 'On the Way Out'}).click();
      await expect(
        page.locator('[data-testid="outgoing-content"]'),
      ).toBeVisible();
    });
  });

  test.describe('Sub-section Header', () => {
    test('title is "On the Way Out" with correct styling', async ({page}) => {
      const title = page.locator('[data-testid="sub-header"] h2');
      await expect(title).toHaveText('On the Way Out');

      const fontWeight = await getComputedStyle(title, 'font-weight');
      expect(fontWeight).toBe('700');

      const color = await getComputedStyle(title, 'color');
      expect(color).toBe('rgb(17, 24, 39)');
    });

    test('subtitle text is correct', async ({page}) => {
      const subtitle = page.locator('[data-testid="sub-header"] p');
      await expect(subtitle).toHaveText(
        'Track your returns and items being shipped back',
      );

      const fontSize = await getComputedStyle(subtitle, 'font-size');
      expect(fontSize).toBe('15px');

      const color = await getComputedStyle(subtitle, 'color');
      expect(color).toBe('rgb(75, 85, 99)');
    });

    test('sub-header only visible on "On the Way Out" tab', async ({page}) => {
      await expect(page.locator('[data-testid="sub-header"]')).toBeVisible();

      await page.getByRole('button', {name: 'Orders'}).click();
      await expect(
        page.locator('[data-testid="sub-header"]'),
      ).not.toBeVisible();
    });

    test('page header remains "My Orders"', async ({page}) => {
      await expect(page.locator('h1')).toHaveText('My Orders');
    });
  });

  test.describe('Empty State', () => {
    test('empty state shows when no outgoing items', async ({page}) => {
      // Toggle empty state
      await page.locator('[data-testid="toggle-empty"]').click();

      await expect(
        page.locator('[data-testid="empty-outgoing"]'),
      ).toBeVisible();
      await expect(page.getByText('No returns or exchanges')).toBeVisible();
      await expect(
        page.getByText(
          "You don't have any active returns or exchanges at this time.",
        ),
      ).toBeVisible();
    });

    test('empty state has "Continue Shopping" button', async ({page}) => {
      await page.locator('[data-testid="toggle-empty"]').click();

      const btn = page.getByRole('link', {name: 'Continue Shopping'});
      await expect(btn).toBeVisible();
    });

    test('toggling back shows cards again', async ({page}) => {
      await page.locator('[data-testid="toggle-empty"]').click();
      await expect(
        page.locator('[data-testid="empty-outgoing"]'),
      ).toBeVisible();

      // Toggle back
      await page.locator('[data-testid="toggle-empty"]').click();
      await expect(
        page.locator('[data-testid="outgoing-content"]'),
      ).toBeVisible();
    });
  });

  test.describe('Data Content', () => {
    test('all 3 card statuses are rendered', async ({page}) => {
      const cards = getCards(page);
      await expect(cards).toHaveCount(3);

      // Check each status badge text (scoped to card headers to avoid tracker label collisions)
      const header0 = getCard(page, 0).locator('> div').first();
      const header1 = getCard(page, 1).locator('> div').first();
      const header2 = getCard(page, 2).locator('> div').first();
      await expect(
        header0.locator('.font-semibold.text-\\[13px\\]').first(),
      ).toHaveText('Return Shipped');
      await expect(
        header1.locator('.font-semibold.text-\\[13px\\]').first(),
      ).toHaveText('Awaiting Pickup');
      await expect(
        header2.locator('.font-semibold.text-\\[13px\\]').first(),
      ).toHaveText('Out for Delivery');
    });

    test('Original Order # links have correct href format', async ({page}) => {
      const link1 = page.getByRole('link', {name: '#1042'});
      await expect(link1).toHaveAttribute('href', '/account/orders/123456');
    });

    test('product name links have correct href format', async ({page}) => {
      const link = page.getByRole('link', {name: 'Classic Cotton T-Shirt'});
      await expect(link).toHaveAttribute(
        'href',
        '/products/classic-cotton-t-shirt',
      );
    });
  });
});

// ============================================================================
// Phase 5: Mobile Responsiveness Tests
// ============================================================================

test.describe('Phase 5 — Mobile Responsiveness', () => {
  test.describe('Mobile (<640px)', () => {
    test.use({viewport: {width: 390, height: 844}});

    test.beforeEach(async ({page}) => {
      await page.goto(TEST_URL);
      await page.waitForLoadState('networkidle');
    });

    test('card header meta items stack vertically', async ({page}) => {
      // Ensure meta items wrap (flex-wrap means they'll stack on narrow widths)
      const card = getCard(page, 0);
      const header = card.locator('> div').first();
      await expect(header).toBeVisible();

      // The header should still be functional
      await expect(card.getByText('Return Initiated')).toBeVisible();
      await expect(card.getByText('$79.99')).toBeVisible();
    });

    test('actions panel is hidden on mobile', async ({page}) => {
      const card = getCard(page, 0);
      const panel = card.locator('.w-\\[200px\\]');
      await expect(panel).not.toBeVisible();
    });

    test('inline action buttons are visible on mobile', async ({page}) => {
      const card = getCard(page, 0);
      await expect(
        card.getByRole('button', {name: 'Print return label'}),
      ).toBeVisible();
      await expect(
        card.getByRole('button', {name: 'Contact seller'}),
      ).toBeVisible();
    });

    test('progress tracker is horizontally scrollable', async ({page}) => {
      const card = getCard(page, 0);
      const tracker = card.locator('.rounded-\\[8px\\].bg-\\[\\#f9fafb\\]');
      await expect(tracker).toBeVisible();

      const overflow = await getComputedStyle(tracker, 'overflow-x');
      expect(overflow).toBe('auto');

      // Inner container has min-width
      const inner = tracker.locator('.min-w-\\[500px\\]');
      await expect(inner).toBeAttached();
    });

    test('sub-section header title uses text-xl on mobile', async ({page}) => {
      const title = page.locator('[data-testid="sub-header"] h2');
      await expect(title).toBeVisible();
      // On mobile (<640px sm breakpoint), text-xl applies (20px)
      const fontSize = await getComputedStyle(title, 'font-size');
      expect(fontSize).toBe('20px');
    });

    test('empty state renders correctly on mobile', async ({page}) => {
      await page.locator('[data-testid="toggle-empty"]').click();
      await expect(page.getByText('No returns or exchanges')).toBeVisible();
    });
  });

  test.describe('Tablet (768px)', () => {
    test.use({viewport: {width: 768, height: 1024}});

    test.beforeEach(async ({page}) => {
      await page.goto(TEST_URL);
      await page.waitForLoadState('networkidle');
    });

    test('card header meta items in a row', async ({page}) => {
      const card = getCard(page, 0);
      await expect(card.getByText('Return Initiated')).toBeVisible();
      await expect(card.getByText('$79.99')).toBeVisible();
      await expect(card.getByText('#1042')).toBeVisible();
    });

    test('product row is horizontal at sm+ breakpoint', async ({page}) => {
      const card = getCard(page, 0);
      const img = card.locator('img').first();
      const productLink = card.getByRole('link', {
        name: 'Classic Cotton T-Shirt',
      });

      const imgBox = await getBoundingBox(img);
      const linkBox = await getBoundingBox(productLink);

      // Image and text should be side by side (image top ≈ link top)
      expect(Math.abs(imgBox!.y - linkBox!.y)).toBeLessThan(20);
    });
  });

  test.describe('Desktop (1440px)', () => {
    test.use({viewport: {width: 1440, height: 900}});

    test.beforeEach(async ({page}) => {
      await page.goto(TEST_URL);
      await page.waitForLoadState('networkidle');
    });

    test('full layout with actions panel visible', async ({page}) => {
      const card = getCard(page, 0);
      const panel = card.locator('.w-\\[200px\\]');
      await expect(panel).toBeVisible();

      const box = await getBoundingBox(panel);
      expect(box!.width).toBeCloseTo(200, 0);
    });

    test('product image and info are horizontal', async ({page}) => {
      const card = getCard(page, 0);
      const img = card.locator('img').first();
      const productLink = card.getByRole('link', {
        name: 'Classic Cotton T-Shirt',
      });

      const imgBox = await getBoundingBox(img);
      const linkBox = await getBoundingBox(productLink);

      // Side by side: link should be to the right of image
      expect(linkBox!.x).toBeGreaterThan(imgBox!.x + imgBox!.width - 10);
    });
  });
});

// ============================================================================
// Phase 6: Visual Capture (Screenshots)
// ============================================================================

test.describe('Phase 6 — Visual Capture', () => {
  test.use({viewport: {width: 1440, height: 900}});

  test('capture full page screenshot at 1440px', async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/e2e/visual/screenshots/outgoing-cards-desktop.png',
      fullPage: true,
    });
  });

  test('capture mobile screenshot at 390px', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/e2e/visual/screenshots/outgoing-cards-mobile.png',
      fullPage: true,
    });
  });

  test('capture empty state screenshot', async ({page}) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="toggle-empty"]').click();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'tests/e2e/visual/screenshots/outgoing-cards-empty.png',
      fullPage: true,
    });
  });
});
