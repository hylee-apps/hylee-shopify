# Implementation Plan: Cart Payment Page Polish (Figma Alignment)

> **Status**: ✅ Complete
> **Created**: 2026-04-02
> **Branch**: `hotfix/cart/cart-review-polish`
> **Route**: `/checkout/payment`
> **Figma**: File `vzeR7m9jbWjAfD9EVlReyq`, Node `327:1020` (div.checkout-layout)

---

## Overview

Polish the existing Cart Payment page (`app/routes/checkout.payment.tsx`) to precisely
match the Figma design captured from node `327:1020`. The page structure and functionality
are already in place — this targets specific styling discrepancies found during a
design audit comparing the current implementation against the fresh Figma spec.

No new features, no structural changes. Targeted CSS corrections only.

**Design reference**: `hydrogen/design-references/cart-payment/figma-spec.md`

---

## Files Changed

| File | Change Type |
|------|-------------|
| `hydrogen/app/routes/checkout.payment.tsx` | CSS class corrections (5 targeted fixes) |
| `hydrogen/design-references/cart-payment/figma-spec.md` | Updated with fresh 327:1020 capture |
| `hydrogen/design-references/cart-payment/design-context.tsx` | Replaced with fresh 327:1020 capture |

---

## Audit Summary — Discrepancies Found

All gaps were identified by comparing `checkout.payment.tsx` against the fresh Figma
context for node `327:1020`, cross-referenced with the design spec. The Card component
(`app/components/ui/card.tsx`) applies `rounded-xl` by default; our `@theme` maps
`--radius-xl: 1.25rem` = **20px**. Figma cards use **12px** radius. All other card
classes are passed via `className` and Tailwind-merge handles the override.

| # | Location | Current | Figma | Fix |
|---|----------|---------|-------|-----|
| 1 | All 3 `<Card>` containers | `rounded-xl` (20px — shadcn default) | `rounded-[12px]` | Add `rounded-[12px]` to each Card className |
| 2 | `PaymentMethodOption` — tile | `rounded-lg` (16px in our `@theme`) | `rounded-[8px]` | `rounded-lg` → `rounded-[8px]` |
| 3 | `CardDetailsForm` — 4 inputs | `rounded-lg` (16px) | `rounded-[8px]` | `rounded-lg` → `rounded-[8px]` on all 4 |
| 4 | `OrderSummary` — CTA button | `bg-secondary` (`#2699a6` teal) + `hover:bg-secondary/90` | `bg-[#2ac864]` = `bg-primary` (green) | `bg-secondary` → `bg-primary`, hover to match |
| 5 | `BillingAddressCard` — body | `py-6` (24px top + bottom) | `pb-[41px]` (41px bottom) | `py-6` → `pt-6 pb-[41px]` |

### Why These Gaps Exist

- **Gaps 1–3 (radius)**: Our `@theme` reassigns the Tailwind radius scale:
  `rounded-sm=8px`, `rounded-DEFAULT/rounded-md=12px`, `rounded-lg=16px`, `rounded-xl=20px`.
  Code written against a standard Tailwind scale (`rounded-lg=12px`) is systematically
  off. The fix is to use exact pixel values (`rounded-[8px]`, `rounded-[12px]`) where
  pixel-precision matters, bypassing the remapped scale.
- **Gap 4 (CTA color)**: The original spec (captured 2026-02-23 from node `327:989`)
  incorrectly recorded the CTA as `bg-secondary`. Fresh capture of `327:1020` clearly
  shows `bg-[#2ac864]` (primary green). The spec has been corrected.
- **Gap 5 (padding)**: Figma's billing card uses `pb-[41px]` to create visual breathing
  room below the checkbox. Current `py-6` only provides 24px.

---

## Implementation Phases

### Phase 1 — Card Border-Radius (3 locations)

All three `<Card>` elements need `rounded-[12px]` added to their `className`. Tailwind-merge
will override the `rounded-xl` from the base Card component.

**PaymentMethodCard:**
```tsx
// Before
<Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
// After
<Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
```

**BillingAddressCard:**
```tsx
// Before
<Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
// After
<Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
```

**OrderSummary:**
```tsx
// Before
<Card className="sticky top-4 w-[400px] shrink-0 gap-0 overflow-hidden bg-white p-0 shadow-sm">
// After
<Card className="sticky top-4 w-[400px] shrink-0 gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
```

---

### Phase 2 — PaymentMethodOption Tile Radius

`PaymentMethodOption` is a `<button>` with `rounded-lg`. Change to `rounded-[8px]`:

```tsx
// Before
'flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 p-[18px] text-left transition-colors',
// After
'flex w-full cursor-pointer items-center gap-3 rounded-[8px] border-2 p-[18px] text-left transition-colors',
```

---

### Phase 3 — CardDetailsForm Input Radius (4 inputs)

All 4 inputs in `CardDetailsForm` use `rounded-lg`. Change each to `rounded-[8px]`:

- Card Number input
- Expiration Date input
- CVC input
- Name on Card input

Pattern (same for all 4):
```
rounded-lg border border-[#d1d5db] → rounded-[8px] border border-[#d1d5db]
```

---

### Phase 4 — OrderSummary CTA Button Color

The CTA button submits the form (action advances to `/checkout/shipping`). Its background
must be primary green, not secondary teal:

```tsx
// Before
className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-secondary/90"
// After
className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-primary/90"
```

Note: also fixes the button's own radius from `rounded-lg` (16px) to `rounded-[8px]`
(Figma: `rounded-[8px]` on the CTA) while we're editing this line.

---

### Phase 5 — BillingAddressCard Body Padding

The checkbox row needs more breathing room below it:

```tsx
// Before
<div className="px-6 py-6">
// After
<div className="px-6 pt-6 pb-[41px]">
```

---

## Polish Pass (after initial implementation)

Once the 5 phases are applied, do a second review against the Figma screenshot comparing:

- [x] All card corners are visually ~12px (not more rounded than the design)
- [x] Payment option tiles are 8px radius (noticeably less rounded than card containers)
- [x] Form inputs are 8px radius (matching payment option tiles)
- [x] CTA button is green (#2ac864), not teal (#2699a6)
- [x] Billing address card has extra bottom breathing room (41px vs 24px)
- [x] Trust badges are in a column, Lock first, ShieldCheck second
- [x] Trust badge icons are primary green
- [x] "Return to Cart" link is secondary teal
- [x] Progress bar step 2 is active (green circle, green label)
- [x] Page background is `#f9fafb`
- [x] Order Summary title is "Order Summary"
- [x] Payment icon containers: 40×26px, rounded-[4px] — fixed during polish pass
- [x] Radio button: 20px circle, 12px inner dot
- [x] Selected payment option: teal border + teal-tinted bg
- [x] Sticky sidebar offset: top-0 (was top-4)
- [x] Shipping/Tax muted text: #9ca3af (was #999999)

---

## Intentional Deviations (Do NOT Change)

These differ from the Figma but are correct for our implementation:

| Deviation | Figma | Ours | Reason |
|-----------|-------|------|--------|
| CTA label | "Review Order →" | "Continue to Shipping →" | Our flow: Cart → Payment → **Shipping** → Review. Figma flow is different. |
| Back link label | "← Return to Shipping" | "← Return to Cart" | Previous step in our flow is Cart, not Shipping. |
| Shipping row value | `$5.99` (static) | "Calculated at next step" | Shipping hasn't been selected yet at the Payment step. Correct UX. |
| Tax row value | `$34.08` (static) | Dynamic or "Calculated…" | Same as above. |
| Visa/MC badges | FA brand icons (glyphs) | Text "VISA" / "MC" styled badges | Font Awesome Brands not available in project. Acceptable substitution. |

---

## Manual Testing Plan

### Environment Setup

```bash
cd hydrogen
pnpm dev   # http://localhost:3000
```

1. Add a product to cart (visit any PDP, click Add to Cart)
2. Navigate to `/cart`
3. Click "Proceed to Checkout" to reach `/checkout/payment`
4. Keep browser DevTools open for inspection

---

### Test Suite A — Page Layout & Background

| # | Test | Steps | Expected |
|---|------|-------|----------|
| A1 | Page background | Load `/checkout/payment` | Full page background is `#f9fafb` (light gray — NOT white) |
| A2 | Two-column layout | Inspect at 1440px viewport | Left column (forms) + right column (order summary) side-by-side |
| A3 | Progress bar visible | Load page | CheckoutProgress bar at top: Cart ✓ (teal) → Payment (green, active) → Shipping (gray) → Review (gray) |
| A4 | No items redirect | Visit `/checkout/payment` with empty cart | Redirected to `/cart` automatically |

---

### Test Suite B — Payment Method Card

| # | Test | Steps | Expected |
|---|------|-------|----------|
| B1 | Card border-radius | Inspect PaymentMethod card container | 12px rounded corners — visually less rounded than before (was 20px) |
| B2 | Card border color | Inspect card border | `#e5e7eb` (light gray) — matches Figma border |
| B3 | Card shadow | Inspect card shadow | Subtle `0 1px 2px rgba(0,0,0,0.05)` — same as `shadow-sm` |
| B4 | Card header "Payment Method" | Inspect title | Bold, 18px, `#111827`, with `#e5e7eb` bottom border |
| B5 | 4 payment options visible | Load page | Credit/Debit, Shop Pay, Apple Pay, Google Pay rows visible |
| B6 | Payment option tile radius | Inspect each option tile | **8px** rounded corners — visibly less rounded than the card container (12px) |
| B7 | Selected option — Credit/Debit | Default state | Credit/Debit is selected: teal border-2 (`#2699a6`), teal-tinted bg (`rgba(38,153,166,0.05)`) |
| B8 | Selected option — radio dot | Inspect radio for selected option | 20px outer circle with `border-secondary`, 12px inner dot `bg-secondary` centered |
| B9 | Unselected options | Inspect other 3 options | `border-2 border-[#e5e7eb]` gray border, white bg, gray radio (no dot) |
| B10 | Select Shop Pay | Click Shop Pay row | Shop Pay gets teal border+bg; Credit/Debit reverts to gray border; Card Details section DISAPPEARS |
| B11 | Select Apple Pay | Click Apple Pay row | Apple Pay gets teal border+bg; Card Details hidden |
| B12 | Select Google Pay | Click Google Pay row | Google Pay gets teal border+bg; Card Details hidden |
| B13 | Return to Credit/Debit | Click Credit/Debit row after switching | Teal border+bg returns; Card Details section REAPPEARS |
| B14 | Credit card icon | Inspect payment icon for Credit/Debit | Gray `#f3f4f6` bg, 40×26px container, rounded-[4px], credit card icon in `#4b5563` |
| B15 | Shop Pay icon | Inspect Shop Pay icon | Purple `#552bed` bg, white "S" text |
| B16 | Apple Pay icon | Inspect Apple Pay icon | Black bg, white Apple logo SVG |
| B17 | Google Pay icon | Inspect Google Pay icon | Blue `#4285f4` bg, white "G" text |
| B18 | Visa/MC badges | Inspect trailing badges on Credit/Debit | "VISA" and "MC" text badges visible on right side of Credit/Debit row |

---

### Test Suite C — Card Details Form (Credit/Debit selected)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| C1 | Form visibility | Credit/Debit selected | Card Details section visible below payment options, separated by `#e5e7eb` top border |
| C2 | Section title | Inspect h4 | "Card Details" — 16px semibold `#1f2937`, 24px below border |
| C3 | Input border-radius | Inspect any input | **8px** rounded corners — matches payment option tiles (was 16px before fix) |
| C4 | Input border color | Inspect any input border | `#d1d5db` gray |
| C5 | Input padding | Inspect any input | `px-[17px] py-[13px]` — renders as tall input (44px height) |
| C6 | Placeholder styling | Inspect placeholder text | `#757575` color, 15px Roboto |
| C7 | Card Number field | Inspect | Full-width, placeholder "1234 5678 9012 3456" |
| C8 | Expiry + CVC row | Inspect layout | Two equal-width columns, `gap-[16px]` between them |
| C9 | Expiry placeholder | Inspect | "MM / YY" |
| C10 | CVC placeholder | Inspect | "123" |
| C11 | Name on Card | Inspect | Full-width, placeholder "John Doe" |
| C12 | Input focus state | Click into any input | Border becomes secondary teal with ring-1 ring-secondary |
| C13 | Label typography | Inspect field labels | 14px medium `#374151`, 8px gap above input |

---

### Test Suite D — Billing Address Card

| # | Test | Steps | Expected |
|---|------|-------|----------|
| D1 | Card border-radius | Inspect Billing Address card | 12px rounded corners (same as Payment Method card) |
| D2 | Card header | Inspect | "Billing Address" bold 18px `#111827`, `#e5e7eb` bottom border |
| D3 | Checkbox visible | Inspect card body | Checkbox + "Same as shipping address" label row visible |
| D4 | Checkbox — default state | Load page | Checkbox is CHECKED (teal `#2699a6` background, white checkmark) |
| D5 | Checkbox — size | Inspect checkbox element | 18×18px, `rounded-[2.5px]` |
| D6 | Checkbox — toggle off | Click checkbox | Checkbox unchecks: white bg with gray `#767676` border |
| D7 | Checkbox — toggle on | Click unchecked checkbox | Checks again: teal fill with white checkmark |
| D8 | Label text | Inspect | "Same as shipping address" — 15px Roboto Regular `#1f2937` |
| D9 | Bottom padding | Inspect card body bottom | **41px** bottom padding (generous space below checkbox — visibly more than top) |
| D10 | Click target | Click label text | Checkbox also toggles (label wraps the entire row) |

---

### Test Suite E — Order Summary Sidebar

| # | Test | Steps | Expected |
|---|------|-------|----------|
| E1 | Card border-radius | Inspect sidebar card | 12px rounded corners |
| E2 | Sticky behavior | Scroll page down | Sidebar sticks to top of viewport |
| E3 | "Order Summary" title | Inspect | Bold 18px `#1f2937`, `#e5e7eb` bottom border |
| E4 | Subtotal row | Inspect | Label "Subtotal" + cart value, both 15px `#4b5563` |
| E5 | Shipping row | Inspect | Label "Shipping" + "Calculated at next step" (gray placeholder text) |
| E6 | Tax row | Inspect | Label "Tax" + value or "Calculated at next step" |
| E7 | Separator | Inspect above Total | `border-t-2 border-[#e5e7eb]` double-weight separator |
| E8 | Total row | Inspect | "Total" + amount — both bold 18px `#111827` |
| E9 | **CTA button color** | Inspect CTA button | Background is **`#2ac864` green** — NOT teal (`#2699a6`) |
| E10 | **CTA button radius** | Inspect CTA button | **8px** rounded corners — not 16px |
| E11 | CTA button hover | Hover CTA button | Background darkens to `rgba(42,200,100,0.9)` (green 90% opacity) |
| E12 | CTA button text | Inspect | "Continue to Shipping" with ArrowRight icon |
| E13 | CTA submits form | Click CTA | Form submits; navigates to `/checkout/shipping` |
| E14 | Return to Cart link | Inspect | "← Return to Cart", secondary teal `#2699a6`, centered, 15px medium |
| E15 | Return to Cart click | Click link | Navigates to `/cart` |
| E16 | Trust badges — order | Inspect | Lock icon + "256-bit SSL Encryption" FIRST; ShieldCheck + "PCI Compliant" SECOND |
| E17 | Trust badge icon colors | Inspect icons | Both icons are primary **green** `#2ac864` (not teal) |
| E18 | Trust badge text | Inspect | Both labels are 13px `#4b5563` |
| E19 | Trust badge layout | Inspect container | Column layout (`flex-col gap-3`), NOT a row |

---

### Test Suite F — Form Submission & State Persistence

| # | Test | Steps | Expected |
|---|------|-------|----------|
| F1 | Submit Credit/Debit | Select Credit/Debit, click CTA | Navigates to `/checkout/shipping`; no JS errors in console |
| F2 | Submit Shop Pay | Select Shop Pay, click CTA | Same navigation |
| F3 | Submit Apple Pay | Select Apple Pay, click CTA | Same navigation |
| F4 | Submit Google Pay | Select Google Pay, click CTA | Same navigation |
| F5 | Saved method on return | Submit Shop Pay, go to `/checkout/shipping`, use back button to return | Shop Pay is still selected (persisted via cart attributes) |
| F6 | Default method on first visit | First visit to payment page | Credit/Debit selected by default |

---

### Test Suite G — Regression (Pre-Existing Functionality)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| G1 | Checkout flow | Complete Payment → Shipping | Navigates to `/checkout/shipping` correctly |
| G2 | Cart attributes | Inspect network after submit | `cartAttributesUpdate` mutation fires with `checkout_payment_method` key |
| G3 | No console errors | Load page | Browser console is clean; no TypeScript/React errors |
| G4 | Correct step active | Inspect CheckoutProgress | Step 2 (Payment) shows green circle; Step 1 (Cart) shows teal with checkmark |
| G5 | Font rendering | Inspect | All text renders in Roboto (loaded via Google Fonts in root.tsx) |

---

### Test Suite H — Cross-Device / Responsive

| # | Test | Steps | Expected |
|---|------|-------|----------|
| H1 | 1440px viewport | Set DevTools to 1440px | Two-column layout visible; sidebar at 400px, forms at 720px |
| H2 | 1280px viewport | Resize to 1280px | Layout still functional (may be tighter but no overflow) |
| H3 | Mobile (375px) | Set to 375px | ⚠️ Mobile responsive layout is a known deferred item (see ACTIVE_CONTEXT.md) — no regression from current behavior |

---

## Pre-Commit Checks

```bash
pnpm format              # 1. Auto-format
pnpm format:check        # 2. Verify format passes — MUST PASS
pnpm typecheck           # 3. TypeScript — MUST PASS
pnpm build               # 4. Production build — MUST PASS
pnpm test                # 5. Unit tests — MUST PASS
```

All 5 must be green before committing.
