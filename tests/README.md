# Testing Guide

## Overview

This directory contains all tests for the Hy-lee Shopify Theme.

## Directory Structure

```
tests/
├── components/     # Vitest component/unit tests
├── e2e/            # Playwright end-to-end tests
└── README.md       # This file
```

## Test Stack

- **Unit Tests:** [Vitest](https://vitest.dev/) - Fast unit testing
- **E2E Tests:** [Playwright](https://playwright.dev/) - Browser automation

## Running Tests

```bash
# Run all unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

## Writing Tests

### Component Tests (Vitest)

Location: `tests/components/{component-name}.test.js`

```javascript
import { describe, it, expect } from 'vitest';

describe('Button Component', () => {
  it('should render with default variant', () => {
    // Test component rendering
  });

  it('should apply custom classes', () => {
    // Test class application
  });
});
```

### E2E Tests (Playwright)

Location: `tests/e2e/{feature}.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Product Page', () => {
  test('should display product details', async ({ page }) => {
    await page.goto('/products/sample-product');
    await expect(page.locator('.pdp-info__title')).toBeVisible();
  });

  test('should add to cart', async ({ page }) => {
    await page.goto('/products/sample-product');
    await page.click('.pdp-add-to-cart');
    await expect(page.locator('.cart-count')).toContainText('1');
  });
});
```

## Test Conventions

### Naming

- Component tests: `{component-name}.test.js`
- E2E tests: `{feature}.spec.ts`

### What to Test

| Type | Unit Test | E2E Test |
|------|-----------|----------|
| New component | ✅ Required | Optional |
| New page/section | Optional | ✅ Required |
| Bug fix | ✅ Regression | If user flow |
| Styling only | ❌ | ❌ |

### Component Test Coverage

Each component should test:
- Default rendering
- All variants
- Edge cases (empty, long text)
- Interactive states
- Accessibility attributes
