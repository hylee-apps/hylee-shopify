# Implementation Plan: Liquid to Hydrogen Full Application Rewrite

> **Status**: In Progress
> **Created**: 2026-02-03
> **Last Updated**: 2026-02-10
> **Branch**: `feature/hydrogen-migration`

## Overview

Complete rewrite of the Shopify Liquid theme (~100 templates/sections, 3,200+ lines JS) to Hydrogen/Remix with Tailwind design system, server-side data fetching via Storefront API, and URL-based state management. Development split into parallel tracks for commerce core and customer accounts.

## Architecture Decisions

| Decision        | Choice                              | Rationale                                  |
| --------------- | ----------------------------------- | ------------------------------------------ |
| Routing         | File-based (Remix)                  | Team preference, Hydrogen default          |
| Design System   | Tailwind from CSS tokens            | Consistency with Hydrogen ecosystem        |
| Filtering       | Server-side (Storefront API)        | Eliminates 739 lines client-side JS        |
| Compare Feature | URL params (`?compare=id1,id2,id3`) | Server-fetched, shareable, no client state |
| Search          | Hydrogen built-in patterns          | `<SearchForm>` + predictive utilities      |

## Project Structure

```
hydrogen/
├── app/
│   ├── components/
│   │   ├── forms/        # Button, Input, Select, Checkbox, Radio, etc.
│   │   ├── display/      # Card, Badge, ProductCard, Skeleton, Alert, etc.
│   │   ├── navigation/   # Header, Footer, Breadcrumb, Tabs, Modal, etc.
│   │   └── commerce/     # AddToCart, Cart, Compare, PriceDisplay, etc.
│   ├── routes/
│   │   ├── _index.tsx    # Homepage
│   │   ├── products.$handle.tsx
│   │   ├── collections.$handle.tsx
│   │   ├── cart.tsx
│   │   ├── compare.tsx
│   │   ├── search.tsx
│   │   └── account/      # Customer account routes
│   │       ├── _layout.tsx
│   │       ├── _index.tsx
│   │       ├── login.tsx
│   │       ├── register.tsx
│   │       ├── orders.tsx
│   │       ├── orders.$id.tsx
│   │       ├── addresses.tsx
│   │       └── settings.tsx
│   ├── lib/
│   │   ├── storefront/   # GraphQL queries with metafield fragments
│   │   ├── customer/     # Customer Account API utilities
│   │   └── utils/        # Shared utilities
│   └── styles/
│       └── app.css       # Tailwind v4 theme with design tokens
├── public/
├── package.json
├── vite.config.ts
├── server.ts
└── tsconfig.json
```

## Checklist

### Phase 1: Foundation (COMPLETE)

- [x] Initialize Hydrogen app in `hydrogen/` subdirectory
- [x] Convert design tokens to Tailwind v4 `@theme` — `app/styles/app.css`
  - [x] Colors: primary #2ac864, secondary #2699a6, accent #2bd9a8, dark #40283c
  - [x] Spacing scale: 4px-80px (space-1 to space-20)
  - [x] Border radius: 12px default
  - [x] Typography: Assistant font, text-xs to text-5xl
  - [x] Shadows: sm to xl
- [x] Configure Storefront API client — `app/lib/context.ts`
- [x] Set up `app/root.tsx` with global providers
- [x] Configure CSP for GA/GTM analytics domains
- [x] Create placeholder index route with design token smoke test
- [x] Workspace config: pnpm-workspace.yaml, .gitignore, root scripts

### Phase 2: Component Library

#### Forms (`app/components/forms/`)

- [x] `Button.tsx` — from `theme/snippets/button.liquid`
- [x] `Input.tsx` — from `theme/snippets/input.liquid`
- [x] `Textarea.tsx` — from `theme/snippets/textarea.liquid`
- [x] `Select.tsx` — from `theme/snippets/select.liquid`
- [x] `Checkbox.tsx` — from `theme/snippets/checkbox.liquid`
- [x] `Radio.tsx` — from `theme/snippets/radio-group.liquid`
- [x] `Label.tsx` — from `theme/snippets/label.liquid`
- [x] `HelperText.tsx` — from `theme/snippets/helper-text.liquid`
- [x] `FormField.tsx` — from `theme/snippets/form-item.liquid`

#### Display (`app/components/display/`)

- [x] `Card.tsx` — from `theme/snippets/card.liquid`
- [x] `Badge.tsx` — from `theme/snippets/badge.liquid`
- [x] `Pill.tsx` — from `theme/snippets/pill.liquid`
- [x] `Icon.tsx` — from `theme/snippets/icon.liquid`
- [x] `Skeleton.tsx` — from `theme/snippets/skeleton.liquid`
- [x] `Alert.tsx` — from `theme/snippets/alert.liquid`

#### Navigation (`app/components/navigation/`)

- [x] `Breadcrumb.tsx` — from `theme/snippets/breadcrumb.liquid`
- [x] `Pagination.tsx` — from `theme/snippets/pagination.liquid`
- [x] `Tabs.tsx` — from `theme/snippets/tabs.liquid`
- [x] `Accordion.tsx` — from `theme/snippets/accordion.liquid`
- [x] `Modal.tsx` — from `theme/snippets/modal.liquid`

#### Commerce (`app/components/commerce/`)

- [x] `ProductCard.tsx` — from `theme/snippets/product-card.liquid` (330 lines)
- [x] `AddToCart.tsx` — add to cart button with loading states
- [x] `QuantitySelector.tsx` — increment/decrement quantity
- [x] `PriceDisplay.tsx` — price with compare-at formatting
- [x] `CompareButton.tsx` — URL param state management

### Phase 3: Layout

- [x] `Header.tsx` — from `theme/sections/header.liquid` (739 lines)
  - [x] Mega menu with dropdowns
  - [x] Mobile drawer navigation
  - [ ] Predictive search integration
  - [x] Account dropdown
- [x] `Footer.tsx` — from `theme/sections/footer.liquid`
- [x] Shared layout route with header/footer

---

## Track A: Commerce Core

### Phase 4: Product Pages

- [x] `products.$handle.tsx` — from `theme/sections/main-product.liquid` (674 lines)
  - [x] Remix loader with product query
  - [x] Metafield fragments (specs, warnings, warranty)
  - [x] `<ProductGallery>` component
  - [x] `<VariantSelector>` component
  - [x] `<AddToCartButton>` from Hydrogen
  - [x] Product specs table
  - [x] Recommendations section

### Phase 5: Collection Pages

- [x] `collections.$handle.tsx` — from `theme/sections/main-collection-product-grid.liquid` (1042 lines)
  - [x] Loader with Storefront API filter params
  - [x] Server-side faceted filtering (`?filter=<json>&sort=price-asc`)
  - [x] `<ProductGrid>` component
  - [x] `<FilterSidebar>` with server-driven facets
  - [x] Pagination via Hydrogen `<Pagination>` (cursor-based)
  - [x] `<CollectionHero>` from `collection-hero.liquid`
  - [x] `<CollectionToolbar>` with sort, view toggle, product count
  - [x] `<SortSelect>` with 6 sort options
  - [x] Filter/sort URL utilities in `lib/collection/filters.ts`
  - [x] Mobile filter drawer via Modal component
  - [x] Empty state with "Clear Filters" CTA
- [x] `collections._index.tsx` — collections list page

### Phase 6: Compare Feature

- [ ] `compare.tsx`
  - [ ] Loader parsing `?compare=id1,id2,id3`
  - [ ] Server-side product data fetching
  - [ ] Comparison table component
- [ ] Update `<CompareButton>` — `useSearchParams()` for URL state

### Phase 7: Cart

- [ ] `cart.tsx` — from `theme/templates/cart.liquid` (312 lines)
  - [ ] Hydrogen cart hooks (`useCart`, `CartForm`)
  - [ ] Line item display
  - [ ] Quantity updates
  - [ ] Discount display
  - [ ] Checkout redirect

### Phase 8: Search

- [ ] `search.tsx`
  - [ ] `<SearchForm>` from Hydrogen
  - [ ] Predictive search component
  - [ ] Instant results dropdown in header
  - [ ] Full results page with filtering

---

## Track B: Customer Accounts

### Phase 9: Authentication

- [ ] `account.login.tsx` — from `theme/sections/customer-login.liquid`
- [ ] `account.register.tsx` — from `theme/sections/customer-register.liquid`
- [ ] `account.recover.tsx` — password reset
- [ ] Session management with Remix session storage
- [ ] Customer Account API integration

### Phase 10: Account Dashboard

- [ ] `account._index.tsx` — from `theme/sections/customer-dashboard.liquid`
  - [ ] Amazon-style nav cards
  - [ ] Protected route with auth loader redirect
  - [ ] Quick stats (orders, addresses)

### Phase 11: Orders

- [ ] `account.orders.tsx` — from `theme/sections/customer-orders.liquid` (506 lines)
  - [ ] Server-side search via loader (`?search=`)
  - [ ] Status filtering (`?status=pending`)
  - [ ] Time period filtering (`?period=30days`)
  - [ ] Tabs for order status
- [ ] `account.orders.$id.tsx` — order detail page

### Phase 12: Addresses

- [ ] `account.addresses.tsx` — from `theme/sections/customer-addresses.liquid`
  - [ ] Address list display
  - [ ] CRUD with Remix actions
  - [ ] Modal forms for add/edit
  - [ ] Default address selection

### Phase 13: Settings

- [ ] `account.settings.tsx` — from `theme/sections/customer-settings.liquid`
  - [ ] Profile updates
  - [ ] Password change
  - [ ] Preferences
  - [ ] Customer Account API actions

---

## Phase 14: Homepage & Marketing

- [ ] `_index.tsx` — homepage
  - [ ] Loaders for featured collections
  - [ ] Hero sections
  - [ ] Product carousels
  - [ ] Newsletter signup
- [ ] Static pages (about, contact, policies)

### Phase 15: Testing & Deployment

- [ ] Oxygen hosting configuration
- [ ] Migrate Playwright E2E tests — `tests/e2e/`
  - [ ] Update routes for Hydrogen
  - [ ] Auth setup for customer tests
- [ ] Vitest for React component unit tests
- [ ] CI/CD pipeline with workflow validation

---

## Component Migration Reference

| Liquid Snippet        | React Component | Location                 |
| --------------------- | --------------- | ------------------------ |
| `button.liquid`       | `<Button>`      | `components/forms/`      |
| `input.liquid`        | `<Input>`       | `components/forms/`      |
| `select.liquid`       | `<Select>`      | `components/forms/`      |
| `checkbox.liquid`     | `<Checkbox>`    | `components/forms/`      |
| `radio-group.liquid`  | `<Radio>`       | `components/forms/`      |
| `textarea.liquid`     | `<Textarea>`    | `components/forms/`      |
| `label.liquid`        | `<Label>`       | `components/forms/`      |
| `helper-text.liquid`  | `<HelperText>`  | `components/forms/`      |
| `product-card.liquid` | `<ProductCard>` | `components/commerce/`   |
| `card.liquid`         | `<Card>`        | `components/display/`    |
| `badge.liquid`        | `<Badge>`       | `components/display/`    |
| `pill.liquid`         | `<Pill>`        | `components/display/`    |
| `icon.liquid`         | `<Icon>`        | `components/display/`    |
| `skeleton.liquid`     | `<Skeleton>`    | `components/display/`    |
| `alert.liquid`        | `<Alert>`       | `components/display/`    |
| `modal.liquid`        | `<Modal>`       | `components/navigation/` |
| `accordion.liquid`    | `<Accordion>`   | `components/navigation/` |
| `tabs.liquid`         | `<Tabs>`        | `components/navigation/` |
| `breadcrumb.liquid`   | `<Breadcrumb>`  | `components/navigation/` |
| `pagination.liquid`   | `<Pagination>`  | `components/navigation/` |

## Section Migration Reference

| Liquid Section                       | Hydrogen Route/Component  | Complexity |
| ------------------------------------ | ------------------------- | ---------- |
| `header.liquid` (739 lines)          | `<Header>` component      | High       |
| `main-product.liquid` (674 lines)    | `products.$handle.tsx`    | High       |
| `collection-appliances.liquid`       | `collections.$handle.tsx` | High       |
| `customer-orders.liquid` (506 lines) | `account.orders.tsx`      | High       |
| `customer-dashboard.liquid`          | `account._index.tsx`      | Medium     |
| `customer-addresses.liquid`          | `account.addresses.tsx`   | Medium     |
| `customer-settings.liquid`           | `account.settings.tsx`    | Medium     |
| `customer-login.liquid`              | `account.login.tsx`       | Medium     |
| `footer.liquid`                      | `<Footer>` component      | Low        |

## Notes

- **Parallel Development**: Track A (Commerce) and Track B (Accounts) can be developed simultaneously
- **Metafields**: Ensure Storefront API queries include metafield fragments for product specs, warnings, warranty info
- **Design Tokens**: All values from `theme/assets/theme-variables.css` preserved in Tailwind v4 `@theme` config
- **Testing**: Existing Playwright tests in `tests/e2e/` provide baseline for migration validation
