# Testing Strategy

> **Purpose**: This document defines the testing strategy, patterns, and requirements for the Hy-lee Shopify Theme.

---

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Unit Testing with Vitest](#unit-testing-with-vitest)
3. [E2E Testing with Playwright](#e2e-testing-with-playwright)
4. [Theme Check (Liquid Linting)](#theme-check-liquid-linting)
5. [When Tests Are Required](#when-tests-are-required)
6. [Test Data Patterns](#test-data-patterns)

---

## Testing Overview

### Testing Pyramid

```
          /\
         /  \
        / E2E \        ← Few, critical customer journeys
       /--------\
      /          \
     / Integration \   ← Component interactions (future)
    /--------------\
   /                \
  /    Unit Tests    \ ← JavaScript utilities, helpers
 /--------------------\
        |
  Theme Check / Linting  ← Liquid syntax validation
```

### Testing Tools

| Tool        | Purpose                     | Config File            |
| ----------- | --------------------------- | ---------------------- |
| Vitest      | Unit tests for JS utilities | `vitest.config.ts`     |
| Playwright  | E2E browser tests           | `playwright.config.ts` |
| Theme Check | Shopify Liquid linting      | `.theme-check.yml`     |
| Prettier    | Code formatting             | `.prettierrc`          |

### Running Tests

```bash
# Unit tests
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# E2E tests
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e:ui       # With Playwright UI

# Theme linting
pnpm theme-check       # Shopify theme check

# Formatting
pnpm format:check      # Check formatting
pnpm format            # Fix formatting

# All validation
pnpm validate          # theme-check + structure + tests
```

---

## Unit Testing with Vitest

### Configuration

Located in `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/components/**/*.test.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
```

### What to Unit Test

| Test Target          | Location                     | Example                        |
| -------------------- | ---------------------------- | ------------------------------ |
| JavaScript utilities | `tests/components/*.test.js` | Date formatters, validators    |
| Helper functions     | `tests/components/*.test.js` | Price formatters, string utils |
| Component JS classes | `tests/components/*.test.js` | Accordion, Modal behaviors     |

### Unit Test Structure

```javascript
// tests/components/utils.test.js

import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate } from '../../theme/assets/utils.js';

describe('formatPrice', () => {
  it('should format price with currency symbol', () => {
    expect(formatPrice(1999, 'USD')).toBe('$19.99');
  });

  it('should handle zero price', () => {
    expect(formatPrice(0, 'USD')).toBe('$0.00');
  });

  it('should handle large prices', () => {
    expect(formatPrice(99999, 'USD')).toBe('$999.99');
  });
});

describe('formatDate', () => {
  it('should format date in readable format', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('January 15, 2025');
  });
});
```

### Testing Component JavaScript

```javascript
// tests/components/accordion.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Accordion', () => {
  let container;

  beforeEach(() => {
    const dom = new JSDOM(`
      <div data-accordion>
        <button data-accordion-trigger aria-expanded="false">Section 1</button>
        <div data-accordion-content hidden>Content 1</div>
        <button data-accordion-trigger aria-expanded="false">Section 2</button>
        <div data-accordion-content hidden>Content 2</div>
      </div>
    `);
    container = dom.window.document.body;
  });

  it('should expand content when trigger is clicked', () => {
    const trigger = container.querySelector('[data-accordion-trigger]');
    const content = container.querySelector('[data-accordion-content]');

    trigger.click();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content.hidden).toBe(false);
  });
});
```

---

## E2E Testing with Playwright

### Configuration

Located in `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.SHOPIFY_STORE_URL || 'https://your-store.myshopify.com',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

### Authentication Setup

Located in `tests/e2e/auth.setup.ts`:

```typescript
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/customer.json';

setup('authenticate as customer', async ({ page }) => {
  // Navigate to login page
  await page.goto('/account/login');

  // Fill login form
  await page.fill('[data-testid="email-input"]', process.env.TEST_CUSTOMER_EMAIL!);
  await page.fill('[data-testid="password-input"]', process.env.TEST_CUSTOMER_PASSWORD!);

  // Submit
  await page.click('[data-testid="login-button"]');

  // Wait for successful login
  await page.waitForURL('/account');

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
```

### E2E Test Structure

```typescript
// tests/e2e/customer-orders.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Customer Orders', () => {
  test.use({ storageState: 'playwright/.auth/customer.json' });

  test('should display order history', async ({ page }) => {
    await page.goto('/account');

    // Navigate to orders
    await page.click('[data-testid="orders-link"]');

    // Verify orders page
    await expect(page).toHaveURL('/account/orders');
    await expect(page.locator('h1')).toContainText('Order History');
  });

  test('should view order details', async ({ page }) => {
    await page.goto('/account/orders');

    // Click first order
    await page.click('[data-testid="order-row"]:first-child');

    // Verify order detail page
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/account/orders');

    // Select filter
    await page.selectOption('[data-testid="status-filter"]', 'fulfilled');

    // Verify filtered results
    const orders = page.locator('[data-testid="order-row"]');
    for (const order of await orders.all()) {
      await expect(order.locator('[data-testid="order-status"]')).toContainText('Fulfilled');
    }
  });
});
```

### Critical E2E Test Paths

These customer journeys MUST have E2E tests:

1. **Customer Authentication**
   - Login with valid credentials
   - Login with invalid credentials (error state)
   - Logout

2. **Customer Account**
   - View account dashboard
   - View order history
   - View order details
   - Update account settings

3. **Product Browsing**
   - View collection page
   - Filter products
   - View product detail page

4. **Cart & Checkout**
   - Add product to cart
   - Update cart quantity
   - Remove from cart
   - Proceed to checkout

---

## Theme Check (Liquid Linting)

### Configuration

Located in `.theme-check.yml`:

```yaml
# Ignore certain checks
TemplateLength:
  enabled: true
  max_length: 500

# Customize severity
UnknownFilter:
  enabled: true
  severity: error

# Ignore specific files
ignore:
  - 'assets/*.min.js'
  - 'assets/*.min.css'
```

### Running Theme Check

```bash
# Run theme check
pnpm theme-check

# With auto-fix (where possible)
pnpm theme-check --fix
```

### Common Theme Check Errors

| Error               | Fix                                         |
| ------------------- | ------------------------------------------- |
| `MissingTemplate`   | Create the missing template file            |
| `UnknownFilter`     | Use valid Liquid filter or custom filter    |
| `DeprecatedTag`     | Replace with modern equivalent              |
| `LiquidTag`         | Use `{%- liquid %}` for multiple statements |
| `ImgWidthAndHeight` | Add width and height to img tags            |

---

## When Tests Are Required

### Required Tests

| Change Type            | Unit Test | E2E Test          | Theme Check |
| ---------------------- | --------- | ----------------- | ----------- |
| New JavaScript utility | ✅ Yes    | ❌ No             | N/A         |
| New component JS       | ✅ Yes    | ⚠️ If interactive | N/A         |
| New customer page      | ❌ No     | ✅ Yes            | ✅ Yes      |
| Customer flow change   | ❌ No     | ✅ Yes            | ✅ Yes      |
| New Liquid component   | ❌ No     | ❌ No             | ✅ Yes      |
| CSS changes            | ❌ No     | ❌ No             | N/A         |
| Bug fix                | ⚠️ If JS  | ⚠️ If critical    | ✅ Yes      |

### Test Data Attributes

Add `data-testid` attributes to elements for E2E testing:

```liquid
{% comment %} ✅ Add test IDs to interactive elements {% endcomment %}
<button data-testid="add-to-cart-button">Add to Cart</button>
<input data-testid="email-input" type="email" />
<div data-testid="order-row">...</div>

{% comment %} Pattern for dynamic IDs {% endcomment %}
<div data-testid="order-{{ order.id }}">...</div>
<div data-testid="product-card-{{ product.handle }}">...</div>
```

---

## Test Data Patterns

### Test Customer Credentials

Store in `.env.local` (never commit):

```bash
TEST_CUSTOMER_EMAIL=test@example.com
TEST_CUSTOMER_PASSWORD=TestPassword123!
SHOPIFY_STORE_URL=https://your-store.myshopify.com
```

### Mock Data Fixtures

Create test fixtures in `tests/fixtures/`:

```javascript
// tests/fixtures/orders.js
export const mockOrders = [
  {
    id: 'order_001',
    order_number: '#1001',
    created_at: '2025-01-15T10:30:00Z',
    financial_status: 'paid',
    fulfillment_status: 'fulfilled',
    total_price: '149.99',
    line_items: [
      { title: 'Product A', quantity: 2, price: '49.99' },
      { title: 'Product B', quantity: 1, price: '50.01' },
    ],
  },
  // ... more mock orders
];
```

---

## Pre-Merge Test Checklist

Before creating a PR, ensure:

### All Changes

- [ ] `pnpm theme-check` passes
- [ ] `pnpm format:check` passes
- [ ] No console errors in browser

### JavaScript Changes

- [ ] Unit tests added for new utilities
- [ ] Existing tests still pass: `pnpm test`
- [ ] No TypeScript/ESLint errors

### Customer Page Changes

- [ ] E2E test added for new flows
- [ ] Existing E2E tests pass: `pnpm test:e2e`
- [ ] `data-testid` attributes added for testing

### Visual Changes

- [ ] Tested on desktop and mobile
- [ ] Tested in Chrome, Firefox, Safari
- [ ] No accessibility violations

---

## Related Documents

- [AGENT_EDITING_INSTRUCTIONS.md](AGENT_EDITING_INSTRUCTIONS.md) - Coding standards
- [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) - PR requirements
- [tests/README.md](../tests/README.md) - Test setup details
