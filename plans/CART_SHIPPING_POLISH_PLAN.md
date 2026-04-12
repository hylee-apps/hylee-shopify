# Implementation Plan: Cart Shipping Page Polish (Figma Alignment)

> **Status**: ✅ Complete
> **Created**: 2026-04-04
> **Branch**: `hotfix/cart/cart-shipping-polish`
> **Route**: `/checkout/shipping`
> **Figma**: File `vzeR7m9jbWjAfD9EVlReyq`, Node `327:701` (div.checkout-layout)

---

## Overview

Polish the existing Cart Shipping page (`app/routes/checkout.shipping.tsx`) to precisely
match the Figma design captured from node `327:701`. This is a sister polish pass to the
already-completed `CART_PAYMENT_POLISH_PLAN.md`. Discrepancies were identified by comparing
the fresh Figma context against the current implementation end-to-end.

The page is functionally complete. This targets specific styling gaps, one structural
grouping fix, and one missing UI element (Shipping Method card).

**Design reference**: `hydrogen/design-references/cart-shipping/figma-spec.md`

---

## Files Changed

| File | Change Type |
|------|-------------|
| `hydrogen/app/routes/checkout.shipping.tsx` | Structure + CSS fixes (Phases 1–5) |
| `hydrogen/app/components/checkout/OrderSummary.tsx` | CTA color, radius fixes (Phase 6) |
| `hydrogen/design-references/cart-shipping/figma-spec.md` | Updated with fresh 327:701 capture |

---

## Audit Summary — Discrepancies Found

All gaps identified by comparing the current implementation against a fresh Figma context
capture of node `327:701`, cross-referenced with the existing spec.

### Root cause of radius gaps
Our `@theme` in `app.css` remaps the Tailwind radius scale:
`rounded-sm=8px`, `rounded-DEFAULT=12px`, `rounded-lg=16px`, `rounded-xl=20px`.
The shadcn `Card` component defaults to `rounded-xl` (20px). All form inputs use
`rounded-lg` (16px). Figma uses 12px cards and 8px inputs throughout — both mismatched.
Fix: use explicit pixel values (`rounded-[12px]`, `rounded-[8px]`) to bypass the remapped scale.

| # | Location | Current | Figma | Fix |
|---|----------|---------|-------|-----|
| 1 | All Card containers (3 cards on left + OrderSummary) | `rounded-xl` (20px — shadcn default) | `rounded-[12px]` | Add `rounded-[12px]` to each `<Card className>` |
| 2 | Card header padding (all 3 cards) | `py-5` (20px top + bottom) | `pt-[20px] pb-[21px]` | `py-5` → `pt-5 pb-[21px]` |
| 3 | All form inputs (7 inputs) | `rounded-lg` (16px) | `rounded-[8px]` | `rounded-lg` → `rounded-[8px]` everywhere in the form |
| 4 | Address2 (apt/suite) — grouping | Separate `gap-5` sibling (20px gap from Address1) | Same `div.form-group` as Address1 with `gap-[8px]` between them | Wrap Address1 + Address2 under a single group with one shared "Address" label |
| 5 | **Shipping Method card** | **Missing — not rendered** | Card showing Standard Shipping as selected tile | Add `ShippingMethodCard` component between ShippingAddressCard and DeliveryPreferencesCard |
| 6 | OrderSummary CTA — background | `bg-secondary` (teal `#2699a6`) | `bg-[#2ac864]` = `bg-primary` (green) | `bg-secondary` → `bg-primary`, hover to match |
| 7 | OrderSummary CTA — border-radius | `rounded-lg` (16px) | `rounded-[8px]` | `rounded-lg` → `rounded-[8px]` |
| 8 | OrderSummary back link — border-radius | `rounded-lg` (16px) | Not explicitly shown, consistent with 8px system | `rounded-lg` → `rounded-[8px]` |
| 9 | ProductItemRow thumbnail — border-radius | `rounded-lg` (16px) | `rounded-[8px]` | `rounded-lg` → `rounded-[8px]` |
| 10 | Delivery Preferences textarea — padding | `py-[13px]` (symmetric) | `pt-[13px] pb-[49px]` (deep bottom breathing room) | `py-[13px]` → `pt-[13px] pb-[49px]` |
| 11 | OrderSummary Card — border-radius | `rounded-xl` (20px — shadcn default) | `rounded-[12px]` | Add `rounded-[12px]` to OrderSummary's Card |

---

## Implementation Phases

### Phase 1 — Card Border-Radius (3 left-column cards)

All three left-column `<Card>` elements need `rounded-[12px]` added to override the
shadcn `rounded-xl` default.

**ShippingCategorySelector.tsx** (`ShippingCategorySelector` component):
```tsx
// Before
<Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
// After
<Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
```

**ShippingAddressCard** (inside checkout.shipping.tsx):
```tsx
// Before
<Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
// After
<Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
```

**DeliveryPreferencesCard** (inside checkout.shipping.tsx):
```tsx
// Before
<Card className="gap-0 overflow-hidden bg-white p-0 shadow-sm">
// After
<Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
```

---

### Phase 2 — Card Header Padding (all 3 cards)

Fix the 1px asymmetry in card header padding to match Figma's `pt-[20px] pb-[21px]`.

Applies to `border-b` header divs in:
- `ShippingCategorySelector.tsx`
- `ShippingAddressCard`
- `DeliveryPreferencesCard`

```tsx
// Before
<div className="border-b border-border px-6 py-5">
// After
<div className="border-b border-border px-6 pt-5 pb-[21px]">
```

---

### Phase 3 — Form Input Border-Radius (7 inputs)

Every `<input>` and the `<textarea>` in the form uses `rounded-lg` (16px). Change all
to `rounded-[8px]`:

Affects:
- `FormField` component — change `rounded-lg` in its className
- Address2 standalone `<input>` — change `rounded-lg`
- `DeliveryPreferencesCard` `<textarea>` — change `rounded-lg`

Pattern for all:
```
rounded-lg border ... → rounded-[8px] border ...
```

---

### Phase 4 — Address Form Grouping (Address1 + Address2)

Currently Address1 and Address2 are separate `gap-5` siblings (20px gap between them).
Figma groups them under one "Address" label with `gap-[8px]` between the two inputs.

Replace the current two separate elements:
```tsx
// Before
<FormField
  label="Address"
  name="address1"
  ...
/>
<div>
  <input
    type="text"
    name="address2"
    placeholder="Apt, suite, unit (optional)"
    className="h-[44px] w-full rounded-lg border border-[#d1d5db] ..."
  />
</div>
```

With a unified group:
```tsx
// After
<div className="flex flex-col gap-2">
  <label htmlFor="address1" className="text-sm font-medium text-[#374151]">
    Address
  </label>
  <input
    id="address1"
    type="text"
    name="address1"
    placeholder="123 Main Street"
    defaultValue={defaultValues?.address1 ?? ''}
    className={cn(
      'h-[44px] w-full rounded-[8px] border bg-white px-[17px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary',
      errors?.address1 ? 'border-red-400' : 'border-[#d1d5db]',
    )}
  />
  {errors?.address1 && (
    <span className="text-xs text-red-500">{errors.address1}</span>
  )}
  <input
    type="text"
    name="address2"
    placeholder="Apt, suite, unit (optional)"
    defaultValue={defaultValues?.address2 ?? ''}
    className="h-[44px] w-full rounded-[8px] border border-[#d1d5db] bg-white px-[17px] text-[15px] placeholder:text-[#757575] focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
  />
</div>
```

This reduces the gap between Address1 and Address2 from 20px → 8px (matching Figma),
while preserving 20px between the Address group and the next row (City/ZIP).

---

### Phase 5 — Add ShippingMethodCard

The Shipping Method card is entirely absent from the current implementation. The
Figma shows it prominently between the Shipping Address card and the Delivery
Preferences card.

Per the Mar 15 production review decision: Standard Shipping only — Express and
Next Day options have been removed. The card is shown as informational (pre-selected,
non-interactive) to give users visibility into their shipping method.

Add a new `ShippingMethodCard` component inside `checkout.shipping.tsx`:

```tsx
function ShippingMethodCard() {
  return (
    <Card className="gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
      <div className="border-b border-border px-6 pt-5 pb-[21px]">
        <h2 className="text-lg font-bold text-[#111827]">Shipping Method</h2>
      </div>
      <div className="flex flex-col gap-3 px-[24px] pt-[24px] pb-[36px]">
        <div className="flex items-center justify-between rounded-[8px] border-2 border-secondary bg-secondary/5 p-[18px]">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-medium text-[#1f2937]">
              Standard Shipping
            </span>
            <span className="text-[13px] text-[#6b7280]">5-7 business days</span>
          </div>
          <span className="text-base font-semibold text-[#111827]">$5.99</span>
        </div>
      </div>
    </Card>
  );
}
```

Insert `<ShippingMethodCard />` in the main page between `<ShippingAddressCard>` and
`<DeliveryPreferencesCard>`:

```tsx
<ShippingAddressCard ... />
<ShippingMethodCard />
<DeliveryPreferencesCard ... />
```

---

### Phase 6 — OrderSummary.tsx Fixes (CTA + Radii)

The shared `OrderSummary` component has four styling issues that affect all checkout
pages using it. Fixing here fixes them everywhere.

**6a. CTA button — bg-secondary → bg-primary + radius:**
```tsx
// Before
className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-secondary/90"
// After
className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-primary/90"
```
Same change applied to BOTH the `<button>` and `<Link>` variants inside the `{cta.isSubmit ? ... : ...}` block.

**6b. Back link — rounded-lg → rounded-[8px]:**
```tsx
// Before
className="flex w-full items-center justify-center gap-2 rounded-lg p-2 text-[15px] ..."
// After
className="flex w-full items-center justify-center gap-2 rounded-[8px] p-2 text-[15px] ..."
```

**6c. ProductItemRow thumbnail — rounded-lg → rounded-[8px]:**
```tsx
// Before
<div className="relative size-[60px] shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
// After
<div className="relative size-[60px] shrink-0 overflow-hidden rounded-[8px] bg-[#f3f4f6]">
```

**6d. OrderSummary Card — add rounded-[12px]:**
```tsx
// Before
<Card className="sticky top-4 w-[400px] shrink-0 gap-0 overflow-hidden bg-white p-0 shadow-sm">
// After
<Card className="sticky top-4 w-[400px] shrink-0 gap-0 overflow-hidden rounded-[12px] bg-white p-0 shadow-sm">
```

---

### Phase 7 — Delivery Preferences Textarea Padding

```tsx
// Before
className="w-full resize-none rounded-lg border border-[#d1d5db] bg-white px-[17px] py-[13px] ..."
// After
className="w-full resize-none rounded-[8px] border border-[#d1d5db] bg-white px-[17px] pt-[13px] pb-[49px] ..."
```

---

## Polish Pass (after initial implementation)

Once all phases are applied, do a second visual review against the Figma screenshot:

- [ ] All four card corners are visually ~12px (not aggressively rounded)
- [ ] Form inputs are 8px radius (noticeably less rounded than card containers)
- [ ] Address1 and Address2 are visually grouped — 8px gap between them, same "Address" label
- [ ] Shipping Method card is visible between Shipping Address and Delivery Preferences
- [ ] Shipping Method tile shows Standard Shipping: teal border + teal-tinted bg, $5.99, "5-7 business days"
- [ ] Delivery Preferences textarea has noticeably more bottom breathing room (49px)
- [ ] OrderSummary CTA is **green** (#2ac864), not teal (#2699a6)
- [ ] OrderSummary CTA has 8px rounded corners (less rounded than before)
- [ ] OrderSummary product thumbnail has 8px rounded corners
- [ ] Page background is `#f9fafb` ✓ (already correct)
- [ ] CheckoutProgress shows step 3 (Shipping) as active ✓ (already correct)
- [ ] "Return to Payment" back link is secondary teal ✓ (already correct)

---

## Intentional Deviations (Do NOT Change)

| Deviation | Figma | Ours | Reason |
|-----------|-------|------|--------|
| Saved address UX | "Use Saved Address Profile" dropdown in Shipping Address card header | Separate `ShippingCategorySelector` card above address form | Already-built UX pattern — separate card with category tabs (Home/Family/Friends/Work/Other) |
| Shipping options count | 3 options (Standard, Expedited, Next Day) | 1 option (Standard only) | Mar 15 production review decision |
| CTA label | "Continue to Payment" | "Continue to Review" | Our checkout flow: Cart → Payment → **Shipping** → Review (Figma's flow is different) |
| Back link label | "Return to Cart" | "Return to Payment" | Previous step in our flow is Payment, not Cart |
| Trust badges | Not visible in Figma for this step | Shown (ssl-pci) | UX enhancement — acceptable |
| Shipping cost display | Static `$5.99` | `$${SHIPPING_METHODS[0].price.toFixed(2)}` | Dynamic from SHIPPING_METHODS constant |

---

## Manual Testing Plan

### Environment Setup

```bash
cd hydrogen
pnpm dev   # http://localhost:3000
```

1. Add a product to cart (visit any PDP → Add to Cart)
2. Navigate to `/cart`
3. Click "Proceed to Checkout" → `/checkout/payment`
4. Click "Continue to Shipping" → `/checkout/shipping`
5. Keep DevTools open for inspection

---

### Test Suite A — Page Layout & Background

| # | Test | Steps | Expected |
|---|------|-------|----------|
| A1 | Page background | Load `/checkout/shipping` | Full page background is `#f9fafb` (light gray — NOT white) |
| A2 | Two-column layout | Inspect at 1440px viewport | Left column (forms, full flex-1) + right column (400px Order Summary) side-by-side |
| A3 | Progress bar | Load page | Cart ✓ (teal check) → Payment ✓ (teal check) → **Shipping** (green, active) → Review (gray) |
| A4 | Left column card count | Count cards | 4 cards: ShippingCategorySelector + ShippingAddressCard + **ShippingMethodCard** + DeliveryPreferencesCard |
| A5 | Empty cart redirect | Visit `/checkout/shipping` with empty cart | Redirected to `/cart` automatically |

---

### Test Suite B — Card Styling (All Cards)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| B1 | Card border-radius | Inspect any card container | **12px** rounded corners — less aggressive than before (was 20px) |
| B2 | Card border | Inspect card border | `#e5e7eb` (light gray), 1px solid |
| B3 | Card shadow | Inspect | `0 1px 2px rgba(0,0,0,0.05)` — subtle `shadow-sm` |
| B4 | Card header padding | Inspect any card header div | `pt-[20px] pb-[21px] px-[24px]` — 1px more on bottom than top |
| B5 | Card header border | Inspect card header bottom | `border-b border-[#e5e7eb]` separating header from body |
| B6 | Header title typography | Inspect card titles | Roboto Bold, 18px, `#111827` |
| B7 | OrderSummary card radius | Inspect sidebar card | **12px** rounded corners (same as left column cards) |

---

### Test Suite C — Shipping Category Selector Card

| # | Test | Steps | Expected |
|---|------|-------|----------|
| C1 | Card visible | Load page | "Who is this shipment for?" card is first in left column |
| C2 | Card radius | Inspect | 12px rounded corners |
| C3 | Category buttons | Inspect | Home, Family, Friends, Work, Other buttons visible |
| C4 | Active button style | Click "Home" | Teal border-2 (`#2699a6`), teal-tinted bg, teal text |
| C5 | Inactive button style | Other buttons | Gray `border-border` outline, gray text |

---

### Test Suite D — Shipping Address Card

| # | Test | Steps | Expected |
|---|------|-------|----------|
| D1 | Card radius | Inspect Shipping Address card | 12px rounded corners |
| D2 | Card title | Inspect | "Shipping Address" — Roboto Bold 18px `#111827` |
| D3 | Address field grouping | Inspect form | "Address" label appears ONCE above BOTH Address line 1 and Address line 2 inputs |
| D4 | Gap between Address1 and Address2 | Inspect spacing | **8px** gap between the two address inputs — noticeably tighter than other field groups (which are 20px) |
| D5 | Input border-radius | Inspect any input | **8px** rounded corners (visibly less rounded than card corners) |
| D6 | Input border color | Inspect | `#d1d5db` gray border |
| D7 | Input padding | Inspect | `px-[17px] py-[13px]`, height renders ~44px |
| D8 | Placeholder color | Inspect | `#757575` medium gray |
| D9 | Placeholder font | Inspect | Roboto Regular 15px |
| D10 | Label typography | Inspect field labels | Roboto Medium 14px `#374151` |
| D11 | Label-to-input gap | Inspect | 8px (`gap-2`) between label and input |
| D12 | First Name / Last Name | Inspect row | Two equal-width fields side-by-side with 16px gap |
| D13 | City / ZIP Code | Inspect row | Two equal-width fields side-by-side with 16px gap |
| D14 | State / Phone | Inspect row | Two equal-width fields side-by-side with 16px gap |
| D15 | Email | Inspect | Full-width field below State/Phone |
| D16 | Input focus state | Click into any input | Border becomes secondary teal with ring-1 ring-secondary |
| D17 | Error state | Submit with empty required fields | Error inputs show `border-red-400`, red error text below |
| D18 | Inter-row gap | Inspect gap between rows | 20px gap (`gap-5`) between field rows (except address1↔address2 which is 8px) |

---

### Test Suite E — Shipping Method Card (new)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| E1 | Card visible | Load page | "Shipping Method" card appears between Shipping Address and Delivery Preferences |
| E2 | Card radius | Inspect | 12px rounded corners |
| E3 | Card title | Inspect | "Shipping Method" — Roboto Bold 18px `#111827` |
| E4 | Single option shown | Inspect | Only **Standard Shipping** option — NO Expedited, NO Next Day |
| E5 | Option selected state | Inspect the tile | `border-2 border-secondary` (teal) + `bg-secondary/5` (teal-tinted bg) |
| E6 | Option radius | Inspect tile | **8px** rounded corners |
| E7 | Option padding | Inspect tile | `p-[18px]` (18px all sides) |
| E8 | Shipping name | Inspect | "Standard Shipping" — Roboto Medium 15px `#1f2937` |
| E9 | Shipping description | Inspect | "5-7 business days" — Roboto Regular 13px `#6b7280` |
| E10 | Shipping price | Inspect | "$5.99" — Roboto SemiBold 16px `#111827`, right-aligned |
| E11 | Card body padding | Inspect | `px-[24px] pt-[24px] pb-[36px]` — extra bottom breathing room |
| E12 | Non-interactive | Attempt to click tile | No interaction — it's display-only (no onClick, just styled div) |

---

### Test Suite F — Delivery Preferences Card

| # | Test | Steps | Expected |
|---|------|-------|----------|
| F1 | Card radius | Inspect | 12px rounded corners |
| F2 | Card title | Inspect | "Delivery Preferences" — Roboto Bold 18px `#111827` |
| F3 | Textarea radius | Inspect | **8px** rounded corners |
| F4 | Textarea top padding | Inspect | `pt-[13px]` (13px top) |
| F5 | Textarea bottom padding | Inspect | `pb-[49px]` — substantially more breathing room below text (was 13px, now 49px) |
| F6 | Textarea border | Inspect | `#d1d5db` border |
| F7 | Textarea placeholder | Inspect | "Leave at front door, call upon arrival, etc." in `#757575` |
| F8 | Textarea focus | Click into textarea | Border becomes secondary teal with ring-1 ring-secondary |
| F9 | Textarea resize | Inspect | `resize-none` — user cannot resize |
| F10 | Label | Inspect | "Delivery Instructions (Optional)" — Roboto Medium 14px `#374151` |

---

### Test Suite G — Order Summary Sidebar

| # | Test | Steps | Expected |
|---|------|-------|----------|
| G1 | Card radius | Inspect sidebar card | **12px** rounded corners (matching left column cards) |
| G2 | Sticky behavior | Scroll down | Sidebar sticks to top of viewport |
| G3 | "Order Summary" title | Inspect | Roboto Bold 18px `#1f2937`, with `#e5e7eb` bottom border |
| G4 | Product item visible | Inspect | Product thumbnail (60×60, `rounded-[8px]`, gray bg) + name + qty + price |
| G5 | **Thumbnail radius** | Inspect product image container | **8px** rounded corners (not 16px) |
| G6 | Subtotal row | Inspect | "Subtotal (N items)" + calculated amount, both 15px `#4b5563` |
| G7 | Shipping row | Inspect | "Shipping" + "$5.99" |
| G8 | Tax row | Inspect | "Tax" + amount |
| G9 | Separator | Inspect above Total | `border-t-2 border-[#e5e7eb]` double-weight separator |
| G10 | Total row | Inspect | "Total" + amount — both Roboto Bold 18px `#111827` |
| G11 | **CTA button color** | Inspect CTA | Background is **`#2ac864` green** — NOT teal (`#2699a6`) |
| G12 | **CTA button radius** | Inspect CTA | **8px** rounded corners (not 16px) |
| G13 | CTA button hover | Hover CTA | Darkens to green 90% — NOT teal |
| G14 | CTA label | Inspect | "Continue to Review" with ArrowRight icon |
| G15 | CTA form submit | Click CTA | Form submits and navigates to `/checkout/review` |
| G16 | Return to Payment link | Inspect | "← Return to Payment" in secondary teal `#2699a6`, centered |
| G17 | Return to Payment click | Click link | Navigates to `/checkout/payment` |
| G18 | Trust badges | Inspect | Lock + "256-bit SSL Encryption" then ShieldCheck + "PCI Compliant", column layout |
| G19 | Trust badge icons | Inspect | Both icons are **primary green** `#2ac864` |

---

### Test Suite H — Form Submission & State Persistence

| # | Test | Steps | Expected |
|---|------|-------|----------|
| H1 | Valid submit | Fill all required fields, click CTA | Navigates to `/checkout/review`; no JS errors |
| H2 | Persisted address | Navigate to `/checkout/review` then back | Previously entered address restored in form fields |
| H3 | Missing required fields | Click CTA with empty form | Validation errors displayed under each required field |
| H4 | Partial fill | Fill only some fields | Only unfilled required fields show errors |
| H5 | Cart attributes saved | Submit and check network | `cartAttributesUpdate` mutation fires with shipping address, method, and cost |
| H6 | Delivery instructions saved | Enter instructions, submit | Value persisted in cart note and attributes |
| H7 | Shipping method saved | Submit | Cart attribute `checkout_shipping_method = "standard"` |

---

### Test Suite I — Regression (Pre-Existing Functionality)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| I1 | Checkout flow | Payment → Shipping → Review | Navigation chain works end-to-end |
| I2 | Address category selector | Select "Home" category | Category buttons work; dropdowns appear for logged-in users |
| I3 | Auto-fill from saved address | Logged-in user selects saved address | Form fields auto-populated from address book |
| I4 | Console clean | Load page | No TypeScript/React errors in browser console |
| I5 | Payment page unaffected | Navigate to `/checkout/payment` | Payment page CTA is still green (its own inline button) |

---

### Test Suite J — Cross-Device / Responsive

| # | Test | Steps | Expected |
|---|------|-------|----------|
| J1 | 1440px viewport | Set DevTools to 1440px | Two-column layout; sidebar at 400px; forms fluid |
| J2 | 1280px viewport | Resize to 1280px | Layout remains functional, no overflow |
| J3 | Mobile (375px) | Set to 375px | ⚠️ Mobile responsive layout is a deferred item — no regression from current behavior |

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
