# Testing Documentation

> **Purpose**: Comprehensive documentation of the testing strategy, test suites, and coverage plan for the Hy-lee Shopify Theme.
>
> **Last Updated**: 2026-01-25

---

## Table of Contents

1. [Overview](#overview)
2. [Test Stack](#test-stack)
3. [Directory Structure](#directory-structure)
4. [Test Suites by Scope](#test-suites-by-scope)
5. [Current Implementation Status](#current-implementation-status)
6. [Test Coverage Matrix](#test-coverage-matrix)
7. [Running Tests](#running-tests)
8. [Writing New Tests](#writing-new-tests)
9. [CI/CD Integration](#cicd-integration)

---

## Overview

The Hy-lee Shopify Theme testing strategy follows a **practical pyramid approach** optimized for Shopify theme development:

```
                    ┌─────────────────┐
                   /                   \
                  /    Visual/Manual    \     ← Theme Editor validation
                 /───────────────────────\
                /                         \
               /       E2E (Playwright)    \   ← Critical user journeys
              /─────────────────────────────\
             /                               \
            /      Component (Vitest)         \  ← JS utilities & behaviors
           /───────────────────────────────────\
          /                                     \
         /        Static Analysis (Linting)      \ ← CSS/JS/Liquid validation
        /───────────────────────────────────────────\
```

### Testing Philosophy

| Principle            | Description                                                           |
| -------------------- | --------------------------------------------------------------------- |
| **User-Centric**     | Focus on testing actual customer journeys, not implementation details |
| **Scope-Aligned**    | Test organization mirrors the project scopes for clarity              |
| **Pragmatic**        | Not everything needs automated tests—styling is visually validated    |
| **Regression-First** | Bug fixes require regression tests to prevent recurrence              |

---

## Test Stack

### Tools

| Tool            | Purpose                                         | Configuration          |
| --------------- | ----------------------------------------------- | ---------------------- |
| **Vitest**      | Unit/component testing for JavaScript utilities | `vitest.config.ts`     |
| **Playwright**  | E2E browser automation testing                  | `playwright.config.ts` |
| **ESLint**      | JavaScript/TypeScript static analysis           | `eslint.config.mjs`    |
| **Theme Check** | Shopify Liquid linting (via CLI)                | `.theme-check.yml`     |

### Versions

```json
{
  "vitest": "^1.x",
  "playwright": "^1.x"
}
```

---

## Directory Structure

```
tests/
├── README.md                        # Quick reference guide
├── components/                      # Vitest unit/component tests
│   ├── .gitkeep
│   ├── {component}.test.js          # Individual component tests
│   └── utils/                       # Test utilities
│       ├── fixtures.js              # Mock data factories
│       └── helpers.js               # Test helpers
├── e2e/                             # Playwright E2E tests
│   ├── auth.setup.ts                # Authentication setup (runs first)
│   ├── customer-orders.spec.ts      # Customer orders tests
│   ├── customer-settings.spec.ts    # Customer settings tests
│   └── {feature}.spec.ts            # Feature-specific tests
└── visual/                          # (Future) Visual regression tests
    └── screenshots/                 # Baseline screenshots
```

---

## Test Suites by Scope

Based on the project's 18 defined scopes, here is the comprehensive test coverage plan:

### 1. 🧩 Components (`components`)

**Description**: CSS and JS component development

| Test Type | Tests                          | Status     |
| --------- | ------------------------------ | ---------- |
| Unit      | Design token validation        | 🟡 Planned |
| Unit      | CSS class generation utilities | 🟡 Planned |
| Unit      | Component JS behaviors         | 🟡 Planned |

**Example Tests:**

```javascript
// tests/components/design-tokens.test.js
describe('Design Tokens', () => {
  it('should export valid CSS custom properties');
  it('should have consistent color values');
  it('should have proper spacing scale');
});
```

**Components to Test:**

- `component-accordion.css` - Expand/collapse behavior
- `component-modal.css` - Modal open/close states
- `component-tabs.css` - Tab switching
- `component-form.css` - Form validation states
- `search-input.liquid` - Search field variants

---

### 2. 📦 Sections (`sections`)

**Description**: Shopify section templates

| Test Type | Tests               | Status         |
| --------- | ------------------- | -------------- |
| E2E       | Section rendering   | 🟡 Planned     |
| E2E       | Section settings    | 🟡 Planned     |
| Visual    | Section screenshots | 🔴 Not Started |

**Sections Requiring Tests:**

- `hero-search` - Homepage hero with search
- `header` / `header-inner` - Navigation and mobile menu
- `main-collection-product-grid` - Collection product display
- `footer` - Footer links and newsletter

---

### 3. 📄 Templates (`templates`)

**Description**: Liquid template files

| Test Type | Tests                      | Status     |
| --------- | -------------------------- | ---------- |
| E2E       | Page load verification     | 🟢 Partial |
| E2E       | Template routing           | 🟢 Partial |
| E2E       | Template-specific features | 🟡 Planned |

**Templates Requiring Tests:**
| Template | E2E Test File | Status |
|----------|---------------|--------|
| `index.json` (Homepage) | `homepage.spec.ts` | 🔴 Not Started |
| `product.liquid` | `product.spec.ts` | 🔴 Not Started |
| `collection.json` | `collection.spec.ts` | 🔴 Not Started |
| `cart.liquid` | `cart.spec.ts` | 🔴 Not Started |
| `customers/account.liquid` | `customer-orders.spec.ts` | 🟢 Implemented |
| `customers/settings.liquid` | `customer-settings.spec.ts` | 🟢 Implemented |
| `search.liquid` | `search.spec.ts` | 🔴 Not Started |

---

### 4. 👤 Customer (`customer`)

**Description**: Customer account features and pages

| Test Type | Tests                | Status         |
| --------- | -------------------- | -------------- |
| E2E       | Authentication flow  | 🟢 Implemented |
| E2E       | Account dashboard    | 🟢 Implemented |
| E2E       | Orders page          | 🟢 Implemented |
| E2E       | Settings page        | 🟢 Implemented |
| E2E       | Addresses management | 🔴 Not Started |

**Current Test Files:**

- ✅ `auth.setup.ts` - Login/logout flows
- ✅ `customer-orders.spec.ts` - Order history navigation
- ✅ `customer-settings.spec.ts` - Profile settings modals

**Test Coverage Details:**

```typescript
// customer-settings.spec.ts covers:
- Page Structure (header, cards, buttons)
- Edit Name Modal (open, prefill, validation, close)
- Edit Email Modal (open, prefill, validation)
- Edit Phone Modal (open, prefill, validation)
- Password Reset Modal
- Sign Out functionality
- Accessibility (keyboard navigation, focus trapping)
```

---

### 5. 🛒 Checkout (`checkout`)

**Description**: Checkout and order processing

| Test Type | Tests             | Status         |
| --------- | ----------------- | -------------- |
| E2E       | Add to cart       | 🔴 Not Started |
| E2E       | Cart drawer       | 🔴 Not Started |
| E2E       | Checkout redirect | 🔴 Not Started |

> ⚠️ **Note**: Shopify Plus checkout tests require special handling as checkout is hosted by Shopify.

---

### 6. 🔝 Header (`header`)

**Description**: Header and navigation components

| Test Type | Tests                | Status     |
| --------- | -------------------- | ---------- |
| E2E       | Desktop navigation   | 🟡 Planned |
| E2E       | Mobile menu toggle   | 🟡 Planned |
| E2E       | Search functionality | 🟡 Planned |
| E2E       | Announcement bar     | 🟡 Planned |

**Planned Tests:**

```typescript
// tests/e2e/header.spec.ts
test.describe('Header Navigation', () => {
  test('should toggle mobile menu');
  test('should search from header');
  test('should show cart count');
  test('should show account dropdown when logged in');
});
```

---

### 7. 🔻 Footer (`footer`)

**Description**: Footer section and links

| Test Type | Tests             | Status         |
| --------- | ----------------- | -------------- |
| E2E       | Footer links      | 🔴 Not Started |
| E2E       | Newsletter signup | 🔴 Not Started |
| E2E       | Social links      | 🔴 Not Started |

---

### 8. 🏷️ Product (`product`)

**Description**: Product display and cards

| Test Type | Tests                  | Status         |
| --------- | ---------------------- | -------------- |
| E2E       | Product page load      | 🔴 Not Started |
| E2E       | Variant selection      | 🔴 Not Started |
| E2E       | Add to cart            | 🔴 Not Started |
| E2E       | Product gallery        | 🔴 Not Started |
| Unit      | Product card rendering | 🔴 Not Started |

**Planned Tests:**

```typescript
// tests/e2e/product.spec.ts
test.describe('Product Page', () => {
  test('should display product details');
  test('should switch variants and update price');
  test('should add product to cart');
  test('should show quantity selector');
  test('should display related products');
});
```

---

### 9. 🛍️ Cart (`cart`)

**Description**: Cart functionality and drawer

| Test Type | Tests                  | Status         |
| --------- | ---------------------- | -------------- |
| E2E       | Cart drawer open/close | 🔴 Not Started |
| E2E       | Update quantities      | 🔴 Not Started |
| E2E       | Remove items           | 🔴 Not Started |
| E2E       | Cart total calculation | 🔴 Not Started |
| Unit      | Cart utilities         | 🔴 Not Started |

---

### 10. 🎯 Assets (`assets`)

**Description**: CSS, JS, and static asset files

| Test Type | Tests                | Status         |
| --------- | -------------------- | -------------- |
| Unit      | JavaScript utilities | 🔴 Not Started |
| Unit      | PubSub system        | 🔴 Not Started |
| Lint      | CSS validation       | 🟢 Configured  |
| Lint      | JS validation        | 🟢 Configured  |

**JavaScript Files to Test:**

- `global.js` - Global utilities
- `pubsub.js` - Event system
- `product-card.js` - Product card interactions
- `component-scripts.js` - Component behaviors

---

### 11. 🌐 Locales (`locales`)

**Description**: Translations and locale files

| Test Type | Tests                      | Status         |
| --------- | -------------------------- | -------------- |
| Unit      | Translation key coverage   | 🔴 Not Started |
| Unit      | Missing translations check | 🔴 Not Started |

---

### 12. ✂️ Snippets (`snippets`)

**Description**: Liquid snippets and partials

| Test Type   | Tests                        | Status         |
| ----------- | ---------------------------- | -------------- |
| Unit        | Snippet parameter validation | 🔴 Not Started |
| Integration | Snippet rendering            | 🔴 Not Started |

**Key Snippets:**

- `search-input.liquid` - Reusable search component
- `product-card.liquid` - Product card display
- `icon.liquid` - SVG icon system

---

## Current Implementation Status

### Summary Dashboard

| Category         | Implemented | Planned  | Total    | Coverage |
| ---------------- | ----------- | -------- | -------- | -------- |
| **E2E Tests**    | 3 files     | 10 files | 13 files | 23%      |
| **Unit Tests**   | 0 files     | 8 files  | 8 files  | 0%       |
| **Visual Tests** | 0 files     | 5 files  | 5 files  | 0%       |

### Implemented Tests

| Test File                   | Scope    | Tests | Description                          |
| --------------------------- | -------- | ----- | ------------------------------------ |
| `auth.setup.ts`             | customer | 2     | Customer login & session persistence |
| `customer-orders.spec.ts`   | customer | 6+    | Orders page navigation & content     |
| `customer-settings.spec.ts` | customer | 20+   | Settings page modals & interactions  |

### Test Metrics (Target)

| Metric                    | Current | Target | Notes                         |
| ------------------------- | ------- | ------ | ----------------------------- |
| E2E Test Files            | 3       | 15     | Cover all major templates     |
| Unit Test Files           | 0       | 10     | Cover all JS utilities        |
| Critical Path Coverage    | ~30%    | 100%   | Login, browse, cart, checkout |
| Customer Journey Coverage | ~60%    | 100%   | Account management flows      |

---

## Test Coverage Matrix

### Critical User Journeys

| Journey                 | Steps                               | Test Coverage |
| ----------------------- | ----------------------------------- | ------------- |
| **Browse & Discover**   | Homepage → Collections → Product    | 🔴 0%         |
| **Search & Find**       | Search → Results → Product          | 🔴 0%         |
| **Purchase Flow**       | Product → Add to Cart → Checkout    | 🔴 0%         |
| **Account Creation**    | Register → Verify → Dashboard       | 🔴 0%         |
| **Account Login**       | Login → Dashboard                   | 🟢 100%       |
| **Order Management**    | Dashboard → Orders → Order Detail   | 🟢 80%        |
| **Settings Management** | Dashboard → Settings → Edit Profile | 🟢 90%        |
| **Address Management**  | Dashboard → Addresses → CRUD        | 🔴 0%         |

### Component Coverage by Section

| Section          | Components | Tested | Coverage |
| ---------------- | ---------- | ------ | -------- |
| Header           | 5          | 0      | 0%       |
| Hero Search      | 2          | 0      | 0%       |
| Product Grid     | 4          | 0      | 0%       |
| Product Page     | 8          | 0      | 0%       |
| Cart Drawer      | 3          | 0      | 0%       |
| Customer Account | 6          | 4      | 67%      |
| Footer           | 3          | 0      | 0%       |

---

## Running Tests

### Commands

```bash
# Unit Tests (Vitest)
pnpm test              # Run all unit tests once
pnpm test:watch        # Run in watch mode
pnpm test:coverage     # Generate coverage report

# E2E Tests (Playwright)
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e:ui       # Run with interactive UI
pnpm test:e2e:debug    # Run in debug mode

# Specific Tests
pnpm test:e2e -- --grep "Customer Settings"  # Run matching tests
pnpm test -- search-input.test.js            # Run specific unit test
```

### Environment Setup

```bash
# Required for authenticated tests
TEST_CUSTOMER_EMAIL=test@example.com
TEST_CUSTOMER_PASSWORD=your-password

# Shopify preview URL (for E2E tests)
SHOPIFY_PREVIEW_URL=https://your-store.myshopify.com
```

### CI Configuration

```yaml
# GitHub Actions example
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e
        env:
          TEST_CUSTOMER_EMAIL: ${{ secrets.TEST_CUSTOMER_EMAIL }}
          TEST_CUSTOMER_PASSWORD: ${{ secrets.TEST_CUSTOMER_PASSWORD }}
          SHOPIFY_PREVIEW_URL: ${{ secrets.SHOPIFY_PREVIEW_URL }}
```

---

## Writing New Tests

### Unit Test Template

```javascript
// tests/components/{name}.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      // Test
    });
  });

  describe('behavior', () => {
    it('should respond to user interaction', () => {
      // Test
    });
  });
});
```

### E2E Test Template

```typescript
// tests/e2e/{feature}.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/relevant-page');
  });

  test('should display expected content', async ({ page }) => {
    await expect(page.locator('.feature-element')).toBeVisible();
  });

  test('should handle user interaction', async ({ page }) => {
    await page.click('.action-button');
    await expect(page).toHaveURL(/expected-url/);
  });
});
```

### Naming Conventions

| Test Type | File Pattern          | Example                |
| --------- | --------------------- | ---------------------- |
| Unit      | `{component}.test.js` | `search-input.test.js` |
| E2E       | `{feature}.spec.ts`   | `product.spec.ts`      |
| Setup     | `{name}.setup.ts`     | `auth.setup.ts`        |

### What Requires Tests

| Change Type       | Unit Test     | E2E Test       |
| ----------------- | ------------- | -------------- |
| New JS component  | ✅ Required   | ⚪ Optional    |
| New page/template | ⚪ Optional   | ✅ Required    |
| New user flow     | ⚪ Optional   | ✅ Required    |
| Bug fix           | ✅ Regression | If user-facing |
| CSS-only changes  | ❌ No         | ❌ No          |
| Content updates   | ❌ No         | ❌ No          |

---

## CI/CD Integration

### Pre-Commit Checks

```bash
# Run before committing
pnpm lint          # ESLint for JS
pnpm test          # Unit tests
```

### Pull Request Checks

```bash
# Required to pass before merge
pnpm lint
pnpm test
pnpm test:e2e
```

### Deployment Gates

| Environment | Required Checks       |
| ----------- | --------------------- |
| Preview     | Lint, Unit Tests      |
| Staging     | Lint, Unit Tests, E2E |
| Production  | All above + Manual QA |

---

## Future Roadmap

### Phase 1: Foundation (Current)

- [x] E2E framework setup (Playwright)
- [x] Unit test framework setup (Vitest)
- [x] Customer account tests
- [ ] Authentication edge cases

### Phase 2: Core Journeys

- [ ] Homepage tests
- [ ] Collection/PLP tests
- [ ] Product page tests
- [ ] Cart tests

### Phase 3: Complete Coverage

- [ ] Search tests
- [ ] Checkout flow tests (limited by Shopify)
- [ ] Address management tests
- [ ] Newsletter tests

### Phase 4: Advanced

- [ ] Visual regression tests
- [ ] Performance tests (Lighthouse CI)
- [ ] Accessibility tests (axe-core)
- [ ] Mobile-specific tests

---

## Related Documents

- [tests/README.md](../tests/README.md) - Quick reference for running tests
- [guidelines/TESTING_STRATEGY.md](../guidelines/TESTING_STRATEGY.md) - Testing philosophy
- [playwright.config.ts](../playwright.config.ts) - E2E configuration
- [vitest.config.ts](../vitest.config.ts) - Unit test configuration
