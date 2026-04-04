# Implementation Plan: Cart Page Polish (Figma Alignment)

> **Status**: 🟡 In Progress
> **Created**: 2026-04-02
> **Last Updated**: 2026-04-02
> **Branch**: `hotfix/cart/cart-review-polish`

## Overview

Polish the existing Cart page (`app/routes/cart.tsx`) to precisely match the Figma design for node `327:162` (file `vzeR7m9jbWjAfD9EVlReyq`). The page structure and functionality are already in place — this work targets specific styling discrepancies identified during a design audit comparing the current implementation against the Figma spec saved in `design-references/cart-review/figma-spec.md`.

No new features, no new components, no structural changes. Targeted CSS corrections only.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `hydrogen/app/routes/cart.tsx` | CSS class corrections (7 targeted fixes) |

---

## Audit Summary — Discrepancies Found

The following were identified by comparing `cart.tsx` against `figma-spec.md`:

| # | Location | Current | Figma | Fix |
|---|----------|---------|-------|-----|
| 1 | `GuestBanner` — icon | `Info` | `UserCircle` | Swap icon import + usage |
| 2 | `GuestBanner` — border/bg | `border-accent bg-accent/10` (`#e8fdf4`) | `border-brand-accent bg-brand-accent/10` (`#2bd9a8`) | Update color tokens |
| 3 | `GuestBanner` — icon color | `text-accent` | `text-brand-accent` | Update token |
| 4 | `GuestBanner` — container radius | `rounded-lg` (12px) | `rounded-[8px]` → `rounded-sm` (8px) | Change radius class |
| 5 | Cart card body — top padding | `px-6` only (missing top) | `p-[24px]` all sides | Add `pt-6` |
| 6 | `CartLineRow` — image radius | `rounded-lg` (12px) | `rounded-[8px]` → `rounded-sm` (8px) | Change radius class |
| 7 | `PromoCodeCard` — Input sizing | `rounded-lg`, no explicit py | `rounded-sm`, `px-[17px] py-[13px]` | Add exact padding + fix radius |
| 8 | `PromoCodeCard` — Apply button | `rounded-lg`, `px-5` (20px) | `rounded-sm`, `px-[21px] py-[13px]` | Fix radius + exact padding |
| 9 | `OrderSummary` — sticky offset | `sticky top-4` | `sticky top-0` | Remove top offset |
| 10 | `OrderSummary` — muted text color | `text-text-light` (`#999999`) | `text-[#9ca3af]` | Fix hex |
| 11 | `OrderSummary` — CTA color | `bg-secondary` (`#2699a6`) | `bg-brand-accent` (`#2bd9a8`) | Swap token |
| 12 | `OrderSummary` — CTA hover | `hover:bg-secondary/90` | `hover:bg-brand-accent/90` | Swap token |
| 13 | `OrderSummary` — CTA radius | `rounded-lg` (12px) | `rounded-[8px]` → `rounded-sm` (8px) | Change radius class |
| 14 | Trust badges — order | ShieldCheck first, Lock second | Lock first, ShieldCheck second | Swap JSX order |

---

## Implementation Phases

### Phase 1 — GuestBanner (items 1–4)
- Swap `Info` → `UserCircle` in lucide import list
- Remove `Info` from imports (only used in GuestBanner)
- Update container: `rounded-lg border-accent bg-accent/10` → `rounded-sm border-brand-accent bg-brand-accent/10`
- Update icon: `text-accent` → `text-brand-accent`

### Phase 2 — Cart Card Body (item 5)
- Body wrapper: `className="px-6"` → `className="px-6 pt-6"`

### Phase 3 — CartLineRow Image (item 6)
- Product image container: `rounded-lg` → `rounded-sm`

### Phase 4 — PromoCodeCard (items 7–8)
- Input: add `px-[17px] py-[13px]`, change `rounded-lg` → `rounded-sm`; shadcn `Input` default padding is overridden via className
- Apply button: add `py-[13px]`, change `px-5` → `px-[21px]`, change `rounded-lg` → `rounded-sm`

### Phase 5 — OrderSummary (items 9–14)
- Card: `sticky top-4` → `sticky top-0`
- Shipping/Tax values: `text-text-light` → `text-[#9ca3af]`
- CTA link: `bg-secondary hover:bg-secondary/90 rounded-lg` → `bg-brand-accent hover:bg-brand-accent/90 rounded-sm`
- Trust badges: swap ShieldCheck + Lock JSX blocks (Lock first)

---

## Intentional Deviations (Preserved)

Per `figma-spec.md` — do NOT change these:

1. **Quantity stepper** — Figma shows static "Qty: 1"; implementation keeps interactive stepper (−/+/✕). Better UX.
2. **Applied promo code chips** — Figma doesn't show this UI. Kept for UX feedback.
3. **Guest banner always visible** — Figma is static; current impl matches that state (auth check deferred).

---

## Manual Testing Plan

### Environment Setup
- Run `pnpm dev` in `hydrogen/`
- Open `http://localhost:3000/cart`
- Test with at least 1 item in cart (add from any PDP first)
- Test with cart empty to verify `CartEmpty` is unaffected

---

### Test Suite A — GuestBanner

| # | Test | Steps | Expected |
|---|------|-------|----------|
| A1 | Icon renders correctly | Load `/cart` with items | `UserCircle` icon visible (person silhouette with circle outline, NOT the ℹ️ info icon) |
| A2 | Banner background color | Inspect banner container | Background is semi-transparent teal `rgba(43,217,168,0.1)` — NOT the near-white `#e8fdf4` |
| A3 | Banner border color | Inspect banner container | Border is solid `#2bd9a8` teal — matches brand-accent |
| A4 | Icon color | Inspect `UserCircle` svg | Color is `#2bd9a8` — same teal as border |
| A5 | Banner corner radius | Inspect container | Visually 8px rounded corners (less rounded than 12px card corners) |
| A6 | "Sign in" link color | Check link text | Teal `#2699a6` secondary color, medium weight |
| A7 | Banner text readable | Visually inspect | Dark gray text `#374151` readable against teal background |

---

### Test Suite B — Cart Card

| # | Test | Steps | Expected |
|---|------|-------|----------|
| B1 | Card body top spacing | Add item, load cart | 24px gap between card header border and first item row |
| B2 | Multiple items | Add 2+ items | Items separated by `#f3f4f6` horizontal divider; last item has no divider |
| B3 | Item image corner radius | Inspect product image | 8px radius (same as banner, less rounded than 12px) |
| B4 | Image vs. card radius | Compare image corners to card corners | Image corners (8px) are visually less rounded than the card container (12px) |
| B5 | Product link hover | Hover product name | Color shifts to primary green |
| B6 | Continue Shopping | Click "Continue Shopping" | Navigates to `/collections` |

---

### Test Suite C — Promo Code Card

| # | Test | Steps | Expected |
|---|------|-------|----------|
| C1 | Input vertical padding | Inspect input element | 13px top + bottom padding (taller than default input) |
| C2 | Input horizontal padding | Inspect input element | 17px left + right padding |
| C3 | Input corner radius | Inspect input | 8px rounded corners (matches image + banner radius) |
| C4 | Apply button padding | Inspect Apply button | 21px left + right, 13px top + bottom — same height as input |
| C5 | Apply button radius | Inspect Apply button | 8px rounded corners |
| C6 | Input + button alignment | Visual check | Input and button are the same height and vertically aligned |
| C7 | Apply promo code | Enter a valid code, click Apply | Code applied, green chip appears above input |
| C8 | Remove promo code | Click X on applied chip | Code removed, chip disappears |

---

### Test Suite D — Order Summary Sidebar

| # | Test | Steps | Expected |
|---|------|-------|----------|
| D1 | Sticky behavior — top offset | Scroll page down | Sidebar sticks at top of viewport (0px from top), NOT with a 16px gap |
| D2 | Shipping text color | Inspect "Calculated at next step" for Shipping | Color is `#9ca3af` (gray-400) — NOT `#999999` |
| D3 | Tax text color | Inspect "Calculated at next step" for Tax | Same `#9ca3af` color |
| D4 | CTA button background | Inspect "Proceed to Checkout" button | Background is `#2bd9a8` (brand-accent teal) — NOT the darker `#2699a6` (secondary) |
| D5 | CTA button hover | Hover "Proceed to Checkout" | Background darkens to `rgba(43,217,168,0.9)` |
| D6 | CTA button radius | Inspect CTA button | 8px radius (less rounded than sidebar card 12px) |
| D7 | Trust badge — icon order | Inspect trust badge row | Lock icon + "Secure Checkout" is FIRST; ShieldCheck + "SSL Encrypted" is SECOND |
| D8 | Trust badge colors | Inspect both badge icons | Both icons are `#2ac864` (primary green) |
| D9 | Subtotal calculation | Add 2 items with known prices | Subtotal correctly sums line items |
| D10 | Promo discount row | Apply a valid promo code | "Promo Discount" row appears in green with correct subtracted amount |
| D11 | CTA navigates | Click "Proceed to Checkout" | Navigates to `/checkout/payment` |

---

### Test Suite E — Empty Cart State

| # | Test | Steps | Expected |
|---|------|-------|----------|
| E1 | Empty cart renders | Remove all items or visit `/cart` with empty cart | Shows shopping cart icon + "Your cart is empty" message |
| E2 | Guest banner hidden | Empty cart state | Guest banner does NOT render (only shown when items exist) |
| E3 | Start Shopping | Click "Start Shopping" | Navigates to `/collections` |

---

### Test Suite F — Regression

| # | Test | Steps | Expected |
|---|------|-------|----------|
| F1 | Quantity decrease | Click minus (−) on item | Quantity decreases by 1; price updates |
| F2 | Quantity at 1 | Item at qty 1, click minus | Button disabled; quantity stays at 1 |
| F3 | Quantity increase | Click plus (+) | Quantity increases; price updates |
| F4 | Remove item | Click X on item | Item removed from cart; if last item, shows empty state |
| F5 | CheckoutProgress | Inspect progress bar | "Cart" step is active; no other steps checked |
| F6 | Page background | Inspect page | Background is `#f9fafb` (light gray) |

---

## Pre-Commit Checks

```bash
pnpm format              # 1. Auto-format
pnpm format:check        # 2. Verify format passes
pnpm typecheck           # 3. TypeScript — MUST PASS
pnpm build               # 4. Production build — MUST PASS
pnpm test                # 5. Unit tests — MUST PASS
```
