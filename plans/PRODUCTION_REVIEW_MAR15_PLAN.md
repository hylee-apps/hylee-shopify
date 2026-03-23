# Implementation Plan: March 15 Production Review Fixes

> **Status**: 🟢 Code Complete (pending manual testing)
> **Created**: 2026-03-23
> **Last Updated**: 2026-03-23
> **Branch**: `feature/production-review-fixes`
> **Source**: Weekly Meeting 2026-03-15 (Shawn Jones, Derek Hawkins, Jeremiah Tillman)
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

## Overview

Production review during the March 15 weekly meeting surfaced seven code-level fixes across the PDP, checkout, footer, and homepage. Shawn drove the decisions; Jeremiah observed. Several items discussed were **already completed** in the codebase — this plan covers only the remaining work and documents what was already done.

### Already Completed (no work needed)

| Item                                          | Evidence                                                         |
| --------------------------------------------- | ---------------------------------------------------------------- |
| Remove product title from breadcrumb          | `products.$handle.tsx:417` — comment confirms removal            |
| Hide blank specification fields               | `products.$handle.tsx:729-731` — filtered by `!!mf.value`        |
| Menu priority order (1,2,3 scoring)           | `custom.menu_priority_order` metafield + `app/lib/navigation.ts` |
| Max horizontal menu links                     | `app/config/navigation.ts` — `maxVisible: 7`                     |
| Horizontal menu hover fix (no page push-down) | Already fixed per meeting notes                                  |

---

## Checklist

### Phase 1: Checkout & Footer Fixes (High Priority)

- [x] Remove `expedited` and `next-day` from `SHIPPING_METHODS`, narrow `ShippingMethodId` type to `'standard'` — `hydrogen/app/lib/checkout.ts`
- [x] Remove dead `ShippingMethodCard` component and `selectedMethod` state — `hydrogen/app/routes/checkout.shipping.tsx`
- [x] Clean up commented-out ShippingMethodCard usage in page JSX — `hydrogen/app/routes/checkout.shipping.tsx`
- [x] Remove unused imports (`ShippingMethodId`, `formatMoney`) — `hydrogen/app/routes/checkout.shipping.tsx`
- [x] Set shipping method to `standard` via hidden input (no selector) — `hydrogen/app/routes/checkout.shipping.tsx`
- [x] Footer nav links: `text-[14px] font-medium` → `text-[15px] font-semibold` — `hydrogen/app/components/layout/Footer.tsx`
- [x] Add `CUSTOMER_ADDRESSES_QUERY` and `readCustomerAddresses()` helper for native Shopify addresses — `hydrogen/app/lib/address-book-graphql.ts`
- [x] Fetch native Shopify addresses in checkout shipping loader for logged-in users — `hydrogen/app/routes/checkout.shipping.tsx`
- [x] Rewrite `ShippingCategorySelector` to merge address book contacts with native Shopify addresses in dropdown — `hydrogen/app/components/checkout/ShippingCategorySelector.tsx`
- [x] Auto-fill shipping form when selecting a saved address (both address book and native Shopify) — `hydrogen/app/components/checkout/ShippingCategorySelector.tsx`

### Phase 2: PDP Improvements (Medium Priority)

- [x] Define `DOES_IT_FIT_COLLECTIONS` set (`furniture`, `appliances`, `home-appliances`) — uses collection handles instead of `productType` (field was empty in Shopify Admin) — `hydrogen/app/routes/products.$handle.tsx`
- [x] Conditionally render "Does It Fit" accordion only when product belongs to a matching collection — `hydrogen/app/routes/products.$handle.tsx`
- [x] Define `PRIMARY_SPEC_KEYS` ordered list (dimensions, weight, material, color, capacity, power_source) — `hydrogen/app/routes/products.$handle.tsx`
- [x] Add `primaryOnly` prop to `SpecsContent` — shows top 6 specs prioritized by `PRIMARY_SPEC_KEYS`, then fills remaining slots from other specs — `hydrogen/app/routes/products.$handle.tsx`
- [x] Inline "Specs" accordion passes `primaryOnly` to `SpecsContent`; below-fold "Specifications" accordion shows all specs — `hydrogen/app/routes/products.$handle.tsx`

### Phase 3: Cart & Promo Code (Medium Priority)

- [x] Add `discountCodes` prop to cart page's inline `OrderSummary` — `hydrogen/app/routes/cart.tsx`
- [x] Calculate promo discount amount (subtotal - total when discount applied) — `hydrogen/app/routes/cart.tsx`
- [x] Add "Promo Discount" row in order summary (green text, negative amount) — `hydrogen/app/routes/cart.tsx`
- [x] Pass `discountCodes` from cart to `OrderSummary` at call site — `hydrogen/app/routes/cart.tsx`

### Phase 4: Homepage Data Wiring (Medium Priority)

- [x] Add `HOMEPAGE_COLLECTION_QUERY` GraphQL query (fetches products from a collection by handle with images, price, variants) — `hydrogen/app/routes/_index.tsx`
- [x] Add `loader` that fetches `what-s-new` and `summer-collection` in parallel with graceful error handling — `hydrogen/app/routes/_index.tsx`
- [x] Rewrite `ProductSection` to accept real product data and `collectionHandle` prop — `hydrogen/app/routes/_index.tsx`
- [x] Replace static `ProductCard` placeholders with real `ProductCard` from `~/components/commerce/ProductCard` — `hydrogen/app/routes/_index.tsx`
- [x] Add "New" badge (green) for products created within 30 days via `customBadge` prop — `hydrogen/app/routes/_index.tsx`
- [x] Auto-hide sections when collection is empty or missing — `hydrogen/app/routes/_index.tsx`
- [x] Clean up unused imports (`Card`, `Skeleton`, `Plus`, `Image` from hydrogen) — `hydrogen/app/routes/_index.tsx`

### Pre-Commit Checks

- [x] `pnpm format` — passes
- [x] `pnpm format:check` — passes
- [x] `pnpm typecheck` — passes
- [x] `pnpm build` — passes
- [x] `pnpm test` — 51 tests pass (9 root + 42 hydrogen)

### Testing

- [x] Manual test: Shipping — visit `/checkout/shipping` → no method selector visible, standard shipping auto-applied, review page shows "Standard Shipping (5-7 business days)"
- [x] Manual test: Footer — visual check that About, Terms of Service, Privacy Policy links are noticeably more readable (bigger + bolder)
- [x] Manual test: Does It Fit — navigate to a furniture product → "Does It Fit" accordion visible; navigate to a cookware product → accordion hidden
- [x] Manual test: Does It Fit — confirm exact `productType` values in Shopify Admin match the `DOES_IT_FIT_PRODUCT_TYPES` set (may need adjustment if Shopify uses different casing or labels)
- [x] Manual test: Top 6 Specs — PDP info column accordion shows max 6 specs in priority order; click "View full specifications" scrolls to full list below with all specs
- [ ] Manual test: Promo Code — apply discount code in cart → order summary shows "Promo Discount -$X.XX" in green (not the code string); code pills still visible in PromoCodeCard input area
- [ ] Manual test: What's New — homepage shows real products from `what-s-new` collection; products created within 30 days show green "New" badge
- [ ] Manual test: What's New (empty) — if `what-s-new` collection doesn't exist or has no products, section is hidden (no empty state or broken UI)
- [ ] Manual test: Seasonal Collection — homepage shows products from `summer-collection` (or whatever collection exists); section title uses the collection's title from Shopify
- [ ] Manual test: Homepage responsiveness — product card row scrolls horizontally on smaller screens
- [ ] Manual test: Saved Addresses — log in with a customer that has saved shipping addresses → click a category button → dropdown appears with saved address names; selecting one auto-fills the shipping form
- [ ] Manual test: Saved Addresses (guest) — visit `/checkout/shipping` as guest → category buttons shown but no dropdown (no saved addresses); form works normally
- [ ] Cross-browser test: Chrome, Safari, Firefox, Edge — all changes render correctly

### Documentation

- [ ] Update `docs/ACTIVE_CONTEXT.md` with completed work
- [ ] Update `docs/COMPONENT_INVENTORY.md` if new components were added (none in this PR — reused existing `ProductCard`)

---

## Blocked Items (Human Action Required)

| Blocker                                                                      | Who         | When                                            | Status |
| ---------------------------------------------------------------------------- | ----------- | ----------------------------------------------- | ------ |
| ~~Confirm exact `productType` values for furniture/appliances in Shopify Admin~~ | ~~Shawn~~       | ~~Before "Does It Fit" manual test~~                | ✅ Resolved — switched to collection handles     |
| Provide category-specific primary spec ordering                              | Shawn       | Future enhancement                              | ⬜     |
| Create test promo code in Shopify Admin (`TESTPROMO10` for 10% off)          | Shawn/Admin | Before promo discount manual test               | ⬜     |
| Rank categories and provide priority scores for menu ordering                | Shawn       | This week                                       | ⬜     |
| Remove highlights/SEO keywords from product detail data                      | Shawn       | Shopify Admin data cleanup                      | ⬜     |
| Provide notes on what each Shopify metafield means per category              | Shawn       | Needed for future category-specific top 6 specs | ⬜     |

### How to Complete Each Blocked Item

#### ~~1. Confirm `productType` Values for "Does It Fit"~~ ✅ RESOLVED

> Switched from `productType` (empty in Shopify Admin) to collection handles. "Does It Fit" now shows when a product belongs to the `furniture`, `appliances`, or `home-appliances` collection. To add more collections, update `DOES_IT_FIT_COLLECTIONS` in `products.$handle.tsx`.

#### 2. Create Test Promo Code

> **Who**: Shawn or anyone with Shopify Admin access
> **When**: Before testing promo discount display

1. Log in to Shopify Admin
2. Navigate to **Discounts** → **Create discount**
3. Select **Discount code**
4. Enter code: `TESTPROMO10`
5. Set type: **Percentage** → **10%**
6. Applies to: **All products**
7. No minimum purchase requirements
8. No usage limits (or set to a high number for testing)
9. Set start date to now, no end date
10. Click **Save discount**

#### 3. Rank Categories for Menu Priority

> **Who**: Shawn
> **When**: This week per meeting discussion

1. Review the collections in Shopify Admin → **Products → Collections**
2. For each collection that should appear in the header menu, assign a priority number (1 = highest priority, appears first)
3. In Shopify Admin, edit each collection → scroll to **Metafields** → set `Menu Priority Order` to the number
4. Notify Derek when complete — the header will automatically reorder based on these values

---

## Deferred Items (Not in This PR)

| Item                                                 | Owner          | Notes                                                   |
| ---------------------------------------------------- | -------------- | ------------------------------------------------------- |
| Blog/media section content                           | Shawn + Darien | Consult Darien on what to display                       |
| Image-variation linking on PDP                       | Deferred       | "Go live" stage per Shawn                               |
| Deals & promotions page design                       | Shawn + Derek  | Future — once volume of deals warrants a dedicated page |
| Promo code storage for logged-in users               | Shawn + Derek  | Future feature — auto-apply stored codes at checkout    |
| "New product" label across all category pages        | Shawn          | Depends on defining what "new" means per category       |
| Next review: product tracking, returns, signup pages | Shawn          | Next meeting cycle                                      |

---

## Files Summary

| Action     | File                                                            |
| ---------- | --------------------------------------------------------------- |
| **MODIFY** | `hydrogen/app/lib/checkout.ts`                                  |
| **MODIFY** | `hydrogen/app/routes/checkout.shipping.tsx`                     |
| **MODIFY** | `hydrogen/app/components/layout/Footer.tsx`                     |
| **MODIFY** | `hydrogen/app/routes/products.$handle.tsx`                      |
| **MODIFY** | `hydrogen/app/routes/cart.tsx`                                  |
| **MODIFY** | `hydrogen/app/routes/_index.tsx`                                |
| **MODIFY** | `hydrogen/app/lib/address-book-graphql.ts`                      |
| **MODIFY** | `hydrogen/app/components/checkout/ShippingCategorySelector.tsx` |

---

## Notes

- **Shipping simplification**: Shawn requested removing all shipping options except standard. The `ShippingMethodCard` component was already commented out — this change removes the dead code entirely and locks shipping to standard.
- **"Does It Fit" values**: Switched from `productType` (empty in Shopify Admin) to collection handles via `DOES_IT_FIT_COLLECTIONS`. Currently matches `furniture`, `appliances`, `home-appliances`. Products must be directly assigned to a matching collection (subcollection-only assignment won't trigger it unless the subcollection handle itself is in the set).
- **Primary specs ordering**: Current implementation uses a static `PRIMARY_SPEC_KEYS` list. Shawn will provide category-specific ordering later (e.g., cookware might prioritize material/capacity, while electronics prioritize voltage/wattage). This can be enhanced with a `productType → keys[]` map in a future PR.
- **Promo discount calculation**: The discount amount is calculated as `subtotal - total` when discount codes are applied. This is an approximation — Shopify's actual discount allocation may differ when taxes/shipping are included. The display is for UX purposes; Shopify handles the real math at checkout.
- **Homepage collections**: If the `what-s-new` or `summer-collection` handles don't exist in Shopify Admin yet, those sections will gracefully hide. No broken UI.
- **"New" badge threshold**: Set to 30 days from `product.createdAt`. This is arbitrary — Shawn may want to adjust or use a metafield flag instead.
