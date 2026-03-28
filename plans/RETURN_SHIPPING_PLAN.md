# Implementation Plan: Return Process — Step 3 (Return Shipping)

> **Status**: 🟢 Complete (Phases 1–5 done; Phase 6 Documentation done)
> **Created**: 2026-03-28
> **Branch**: `feature/account/return-process`
> **Figma**: `NEk59QDkRMC3a6LD0WZVQJ` node `1:656`
> **Depends on**: Return Process Step 1 (complete), Step 2 (complete)

## Overview

Build **Step 3 (Return Shipping)** of the 4-step return wizard. Users arrive here from Step 2 after selecting return reasons. This page presents three shipping method options (UPS Drop-off, UPS Pickup, Instant Return), displays the return address and packing instructions, shows a summary of items/cost, and a return tracking info notice. Title changes to "Return Shipping" and the progress tracker shows Step 3 as active with Steps 1-2 completed.

Users arrive with selected item IDs and reasons passed via URL search params from Steps 1-2.

---

## Design Analysis

### Key Design Decisions

1. **Radio selection (not checkboxes)** — Only one shipping method can be selected at a time. The first option (UPS Drop-off) is pre-selected by default, with a selected state that includes a teal border, subtle teal background tint, and drop shadow.

2. **QR code preview** — A 120×120px QR code placeholder appears only on the selected Drop-off option (right side of the card). This is a static placeholder for now — future work would generate a real QR code.

3. **Three shipping options with distinct pricing** — UPS Drop-off (Free), UPS Pickup (Free), and Instant Return ($4.99). The Instant Return price uses `#4fd1a8` (return-accent) instead of `#2ac864` (primary green) to signal it's a paid option.

4. **Radio button styling** — Custom radio: 24×24px with `rounded-[12px]` (pill-circle), selected = `bg-return-accent` with `10×10px` white inner dot, unselected = transparent with `border-2 border-[#d1d5db]`.

5. **Card contains three sub-sections** — Unlike Steps 1-2 which had a single-purpose card, the shipping card has three visually distinct sections separated by `border-t border-[#e5e7eb]`:
   - Shipping options (top)
   - Return address (middle)
   - Packing instructions (bottom)

6. **Return Address section** — Static warehouse address displayed in a `#f9fafb` background card with a return ID. This is hardcoded for now (no API integration).

7. **Packing Instructions** — Ordered list with mint green numbered circles (28×28px, `bg-[#4fd1a8]`, `rounded-full`). Each circle contains a white number. Five instruction items.

8. **Summary box** — Simplified from Step 2's Refund Summary. Shows "Items being returned" count, "Return shipping" (Free/price), and "Total Refund Amount". No tax breakdown.

9. **Return Tracking notice** — Teal-tinted info box (same color family as Return Policy notice from Step 1 but teal instead of amber): `rgba(38,153,166,0.05)` bg, `rgba(38,153,166,0.2)` border.

10. **No action buttons in Figma frame** — The frame ends at the Return Tracking notice. Action buttons follow the Step 2 pattern: inline (not sticky), "Cancel" (~35%) + "Continue to Make It Right" (~65%).

11. **Route structure** — `account.orders.$id_.return_.shipping.tsx` — trailing `_` on both `$id` and `return` to opt out of parent layout nesting (same pattern as Step 2).

12. **State passing** — Items + reasons arrive via URL search params from Step 2: `?items=id1,id2&reasons=defective,wrong-item`. The shipping method selection is local state.

### Icon Mapping (FontAwesome → Lucide)

| Element | FA Unicode | Lucide | Size | Color |
|---------|-----------|--------|------|-------|
| UPS Drop-off option |  | `Package` | 16px | `#4fd1a8` |
| UPS Pickup option |  | `Truck` | 16px | `#4fd1a8` |
| Instant Return option |  | `Zap` | 16px | `#4fd1a8` |
| Feature check marks |  | `CheckCircle2` | 13px | `#2ac864` |
| Return Address title |  | `MapPin` | 16px | `#111827` |
| Packing Instructions title |  | `ClipboardList` | 16px | `#111827` |
| QR code placeholder |  | `QrCode` | 80px | `#d1d5db` |
| Return ID prefix |  | `Tag` | 14px | `#4fd1a8` |

---

## Checklist

### Phase 1: Verify Prerequisites

- [x] Verify Lucide icons exist: `Package`, `Truck`, `Zap`, `CheckCircle2`, `MapPin`, `ClipboardList`, `QrCode`, `Tag`
- [x] Verify `return-accent` token already in `app/styles/app.css` → `--color-return-accent: #4fd1a8` (exists from Step 1)
- [x] Verify Figma design reference saved: `hydrogen/design-references/return-process/step3-shipping-figma-spec.md`

### Phase 2: Components

- [x] Create `ShippingOptionCard.tsx` — `hydrogen/app/components/account/ShippingOptionCard.tsx`
  - Individual selectable shipping method option
  - Props:
    ```ts
    interface ShippingOptionCardProps {
      id: string;
      icon: ComponentType<LucideProps>;
      title: string;
      price: string;        // "Free" or "$4.99"
      priceFree: boolean;    // true = #2ac864 (primary), false = #4fd1a8 (return-accent)
      description: string;
      features: string[];
      selected: boolean;
      onSelect: () => void;
      showQrPreview?: boolean;  // only for Drop-off when selected
    }
    ```
  - **Selected state**:
    - Border: `2px solid #4fd1a8`
    - Background: `rgba(38,153,166,0.05)`
    - Shadow: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)`
    - Radio: `bg-return-accent border-return-accent`, inner `10×10px white rounded-[5px]` dot
  - **Unselected state**:
    - Border: `2px solid #e5e7eb`
    - Background: `white`
    - No shadow
    - Radio: `border-2 border-[#d1d5db]`, empty
  - **Layout**: flex row, gap `16px`, padding `22px`, `rounded-[12px]`
    - Radio (24×24px) | Content (flex-1) | QR preview (optional, 120×120px + 16px left margin)
  - **Content area**:
    - Header: flex justify-between — icon + title (left) | price (right)
      - Title icon: 16px, `#4fd1a8`, gap `8px` from title text
      - Title: SemiBold 16px, `#111827`
      - Price: Bold 16px, `#2ac864` if free, `#4fd1a8` if paid
    - Description: Regular 14px, `#4b5563`, line-height 21px, gap `8px` below header
    - Features: flex-wrap, gap `16px` horizontal, `pt-[4px]`, each feature:
      - CheckCircle2 icon: 13px, `#2ac864`
      - Text: Regular 13px, `#4b5563`, gap `8px`
  - **QR preview** (only when `showQrPreview` is true):
    - Container: `120×120px`, `bg-white`, `border-2 border-[#e5e7eb]`, `rounded-[8px]`
    - QrCode icon: 80px, `#d1d5db` (placeholder)
  - `data-testid="shipping-option-{id}"`
  - `data-testid="shipping-radio-{id}"` on radio button

- [x] Create `ReturnAddressCard.tsx` — `hydrogen/app/components/account/ReturnAddressCard.tsx`
  - Displays the static return warehouse address
  - Props:
    ```ts
    interface ReturnAddressCardProps {
      returnId: string;  // e.g. "RET-2024-78432"
    }
    ```
  - **Section title**: MapPin icon (16px, `#111827`) + "Return Address" — SemiBold 16px, `#111827`
  - **Address card**: `bg-[#f9fafb]`, `rounded-[8px]`, `px-[16px] pt-[15px] pb-[16px]`
    - Name: "Hylee Returns Center" — Bold 14px, `#374151`, line-height 25.2px
    - Lines: Regular 14px, `#374151`, line-height 25.2px
      - "1234 Warehouse Boulevard"
      - "Building C, Suite 100"
      - "Seattle, WA 98101"
      - "United States"
    - Gap `12px` between address and return ID
    - Return ID: Tag icon (14px, `#4fd1a8`) + "Return ID: " Regular + **returnId** Bold — 14px, `#374151`, gap `8px`
  - Separated by: `border-t border-[#e5e7eb]`, `pt-[25px]`, gap `12px` between title and card
  - `data-testid="return-address-section"`

- [x] Create `PackingInstructions.tsx` — `hydrogen/app/components/account/PackingInstructions.tsx`
  - Ordered list of packing instructions with numbered mint green circles
  - No props (static content) or optional `instructions: string[]` prop
  - **Section title**: ClipboardList icon (16px, `#111827`) + "Packing Instructions" — SemiBold 16px, `#111827`
  - **Ordered list**: gap `12px` between items
    - Each item: `pl-[32px]`, position relative
    - Number circle: `28×28px`, `bg-return-accent`, `rounded-full`, absolute `left-0 top-0`
    - White number centered in circle (font: Bold 14px white)
    - Text: Regular 14px, `#374151`, line-height 22.4px
  - Default instructions:
    1. "Pack items securely in their original packaging when possible"
    2. "Include all accessories, tags, and original materials"
    3. "Seal the box tightly with strong packing tape"
    4. "Attach the return label to the outside of the package (or show QR code)"
    5. "Remove or cover any old shipping labels"
  - Separated by: `border-t border-[#e5e7eb]`, `pt-[25px]`, gap `12px` between title and list
  - `data-testid="packing-instructions"`

- [x] Create `ReturnShippingSummary.tsx` — `hydrogen/app/components/account/ReturnShippingSummary.tsx`
  - Summary box showing items count, shipping cost, and total refund
  - Props:
    ```ts
    interface ReturnShippingSummaryProps {
      itemCount: number;
      shippingPrice: string;   // "Free" or "$4.99"
      shippingFree: boolean;
      totalRefund: number;
      currencyCode?: string;
    }
    ```
  - Container: `bg-[#f9fafb]`, `rounded-[12px]`, `px-[20px] pt-[20px] pb-[32px]`
  - Gap: `12px` between rows
  - **Row 1**: "Items being returned" (Regular 14px, `#4b5563`) | count (Medium 14px, `#1f2937`)
  - **Row 2**: "Return shipping" (Regular 14px, `#4b5563`) | shipping price (Medium 14px, `#2ac864` if free, `#4fd1a8` if paid)
  - **Divider**: `border-t-2 border-[#e5e7eb]`, `pt-[14px]`
  - **Total row**: "Total Refund Amount" (Bold 16px, `#111827`) | formatted total (Bold 16px, `#4fd1a8`)
  - `data-testid="return-shipping-summary"`
  - `data-testid="shipping-summary-total"` on total amount

- [x] Create `ReturnTrackingNotice.tsx` — `hydrogen/app/components/account/ReturnTrackingNotice.tsx`
  - Teal-themed info notice about return tracking
  - No props (static content)
  - Container: `bg-[rgba(38,153,166,0.05)]`, `border border-[rgba(38,153,166,0.2)]`, `rounded-[12px]`, `p-[21px]`
  - Gap: `8px` between header and body
  - **Header**: "Return Tracking" — SemiBold 14px, `#4fd1a8`, `pl-[8px]`
  - **Body**: "You'll receive email updates at each step: when your return is shipped, received, and when your resolution is processed."
    - Regular 14px, `#4b5563`, line-height 22.4px
  - `data-testid="return-tracking-notice"`

### Phase 3: Route & Page Assembly

- [x] Create route `account.orders.$id_.return_.shipping.tsx` — `hydrogen/app/routes/account.orders.$id_.return_.shipping.tsx`
  - **Route naming**: trailing `_` on `$id` and `return` to opt out of parent layout nesting (same as Step 2)
  - URL: `/account/orders/:id/return/shipping?items=...&reasons=...`
  - **Loader**:
    - Authenticate via `isCustomerLoggedIn` / `getCustomerAccessToken`
    - Read `items` and `reasons` search params from URL
    - If no items param, redirect back to Step 1 (`/account/orders/:id/return`)
    - Fetch order data via `customer(customerAccessToken)` query (same as Steps 1-2)
    - Filter line items to only those whose IDs are in the `items` param
    - If no valid items found, redirect back to Step 1
    - Generate return ID from order name (e.g., "RET-" + orderName suffix)
    - Calculate total refund from selected items' prices + tax (8% simulated)
    - Return: `orderId`, `orderName`, `deliveredDate`, `lineItems` (filtered), `returnId`, `totalRefund`
  - **Page layout** (max-w-[900px] centered):
    - Title: "Return Shipping" — centered, Light 32px `#1f2937`
    - Subtitle: "Choose how you'd like to send your items back" — centered, Regular 16px `#4b5563`
    - `ReturnStepProgress` at `currentStep={3}`
    - Shipping Method card:
      - Card header: "Shipping Method"
      - 3x `ShippingOptionCard` (UPS Drop-off selected by default)
      - `ReturnAddressCard` (with generated return ID)
      - `PackingInstructions`
    - `ReturnShippingSummary` (item count, shipping cost, total refund)
    - `ReturnTrackingNotice`
    - Inline action buttons (not sticky)
  - **Client-side state**:
    - `selectedMethod: 'drop-off' | 'pickup' | 'instant'` — default `'drop-off'`
    - `shippingCost: number` — `0` for drop-off/pickup, `4.99` for instant
    - `totalRefund: number` — computed from items' prices + tax - shipping cost (if applicable)
  - **Action buttons** (inline, not sticky, same pattern as Step 2):
    - "Cancel": outlined button (~35% flex), navigates to `/account/orders/{id}/return/reason?items=...` (Step 2)
    - "Continue to Make It Right": `bg-return-accent` (~65% flex), navigates to Step 4 (future)
    - Continue is always enabled (a shipping method is always pre-selected)
  - **SEO meta**: "Return Shipping — {orderName}"

- [x] Update Step 2 route (`account.orders.$id_.return_.reason.tsx`) — wire "Continue to Shipping" button to navigate to Step 3 via `window.location.href`:
  ```
  /account/orders/{id}/return/shipping?items={selectedIds}&reasons={selectedReasons}
  ```

- [x] Verify `NO_SIDEBAR_PATTERNS` in `account.tsx` already covers `/return/shipping` — the existing regex `/^\/account\/orders\/[^/]+\/return/` matches all `/return/*` sub-paths

### Phase 4: Styling & CSS Isolation

- [x] All return-shipping styles use Tailwind utilities scoped to component elements — no global CSS
- [x] Verify `return-accent` token usage — no hardcoded `#4fd1a8` in return components
- [x] Shipping option selected state uses `rgba(38,153,166,0.05)` background (subtle teal tint)
- [x] Price colors: "Free" = `#2ac864` (primary), "$4.99" = `#4fd1a8` (return-accent)
- [x] Return Tracking notice uses `rgba(38,153,166,*)` colors (NOT amber like Step 1's Return Policy)
- [x] Verify no style leakage between return pages and other account pages
- [x] Add `data-testid` attributes to all interactive elements:
  - `data-testid="shipping-option-{id}"` on each option card
  - `data-testid="shipping-radio-{id}"` on each radio button
  - `data-testid="return-address-section"` on address section
  - `data-testid="packing-instructions"` on instructions section
  - `data-testid="return-shipping-summary"` on summary box
  - `data-testid="shipping-summary-total"` on total refund amount
  - `data-testid="return-tracking-notice"` on tracking notice
  - `data-testid="return-cancel-btn"` on Cancel button
  - `data-testid="return-continue-btn"` on Continue button

### Phase 5: Testing

#### Unit Tests

- [x] `ShippingOptionCard.test.tsx` — renders selected/unselected states, radio button toggle, QR preview visibility, feature list, price color variants
- [x] `ReturnAddressCard.test.tsx` — renders address lines, return ID with prop value
- [x] `PackingInstructions.test.tsx` — renders all 5 instruction items with numbered circles
- [x] `ReturnShippingSummary.test.tsx` — renders item count, shipping free/paid, total refund calculation, currency formatting
- [x] `ReturnTrackingNotice.test.tsx` — renders header and body text

#### Automated E2E Tests (Playwright)

- [x] `return-shipping.spec.ts` — `hydrogen/tests/e2e/return-shipping.spec.ts`
  - **64 passed, 0 failed** (2026-03-28, Chromium)
  - Desktop (1440×900): 58 tests + Tablet (768×1024): 6 tests
  - Authenticated, serial execution
  - Covers MT-1 through MT-12 manual testing scenarios (except MT-8 visual fidelity)

#### Manual Testing Plan

> **Automated E2E test results**: `64 passed, 0 failed` (2026-03-28)
> Run: `npx playwright test tests/e2e/return-shipping.spec.ts --project=chromium` from `hydrogen/`
> Desktop (1440×900) + Tablet (768×1024) viewports covered.
> MT-8 (Visual Fidelity) requires manual pixel comparison against Figma.

##### MT-1: Page Load & Navigation

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 1.1 | Navigate from Step 2 | On Step 2, fill all reasons → click "Continue to Shipping" | Step 3 loads with title "Return Shipping", subtitle "Choose how you'd like to send your items back" | ✅ | ✅ |
| 1.2 | URL has items + reasons params | Check browser URL after navigating | URL is `/account/orders/{id}/return/shipping?items=id1,id2&reasons=defective,wrong-item` | ✅ | — |
| 1.3 | Direct URL access | Navigate directly to Step 3 URL with valid items param | Page loads correctly with shipping options | ✅ | ✅ |
| 1.4 | Direct URL without items param | Navigate to Step 3 URL without `?items=` | Redirects back to Step 1 | ✅ | — |
| 1.5 | Direct URL with invalid items | Navigate with `?items=invalid-id` | Redirects back to Step 1 (no valid items found) | ✅ | — |
| 1.6 | Unauthenticated access | Log out → navigate to Step 3 URL | Redirects to login page | ✅ | — |
| 1.7 | Invalid order ID | Navigate to `/account/orders/invalid/return/shipping?items=x` | 404 error or redirect to orders | ✅ | — |

##### MT-2: Progress Steps

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 2.1 | Steps 1-2 completed state | Load Step 3 | Steps 1 "Select Items" and 2 "Reason" show green (`#2ac864`) circles with white checkmarks | ✅ | — |
| 2.2 | Step 3 active state | Load Step 3 | Step 3 "Ship" shows mint green (`#4fd1a8`) circle with white Truck icon and teal shadow ring | ✅ | — |
| 2.3 | Step 4 pending | Load Step 3 | Step 4 "Make It Right" shows gray circle at 40% opacity | ✅ | — |
| 2.4 | Step labels | Load Step 3 | Labels "Select Items", "Reason", "Ship", "Make It Right" — 13px medium `#4b5563` | ✅ | ✅ |
| 2.5 | Connector lines | Load Step 3 | Gray 60px lines between all step circles | ☐ | ☐ |

##### MT-3: Card Header

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 3.1 | Card container | Load Step 3 | White card with `border-[#e5e7eb]`, `rounded-[12px]`, subtle shadow | ✅ | — |
| 3.2 | Header text | Load Step 3 | "Shipping Method" — Bold 18px `#111827` | ✅ | — |
| 3.3 | No right text | Load Step 3 | Header has only the left title — no "Select all" or helper text on right | ✅ | — |
| 3.4 | Header border | Load Step 3 | Bottom border `border-[#e5e7eb]` separating header from body | ☐ | ☐ |

##### MT-4: Shipping Options — Default State

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 4.1 | Three options displayed | Load Step 3 | Three shipping option cards visible: UPS Drop-off, UPS Pickup, Instant Return | ✅ | ✅ |
| 4.2 | Drop-off pre-selected | Load Step 3 | UPS Drop-off has teal border (`#4fd1a8`), teal bg tint, shadow, filled radio with white dot | ✅ | — |
| 4.3 | Drop-off icon | Load Step 3 | Package icon (16px, `#4fd1a8`) before "UPS Drop-off" title | ☐ | ☐ |
| 4.4 | Drop-off price | Load Step 3 | "Free" in Bold 16px `#2ac864` (primary green) | ✅ | — |
| 4.5 | Drop-off description | Load Step 3 | "Drop off your package at any UPS location or UPS Store. Print your label at home or show QR code at the store." in Regular 14px `#4b5563` | ✅ | — |
| 4.6 | Drop-off features | Load Step 3 | 3 features with green check-circle icons: "Prepaid label", "10,000+ locations", "No packaging needed" | ✅ | — |
| 4.7 | Drop-off QR preview | Load Step 3 | 120×120px white bordered box with QR code placeholder icon (80px, `#d1d5db`) on right side | ✅ | — |
| 4.8 | Pickup unselected | Load Step 3 | UPS Pickup has gray border (`#e5e7eb`), white bg, empty radio circle with `#d1d5db` border | ✅ | — |
| 4.9 | Pickup icon | Load Step 3 | Truck icon (16px, `#4fd1a8`) before "UPS Pickup" title | ☐ | ☐ |
| 4.10 | Pickup price | Load Step 3 | "Free" in Bold 16px `#2ac864` | ✅ | — |
| 4.11 | Pickup features | Load Step 3 | 3 features: "Convenient pickup", "Next business day", "No trip needed" | ✅ | — |
| 4.12 | Instant unselected | Load Step 3 | Instant Return has gray border, white bg, empty radio | ✅ | — |
| 4.13 | Instant icon | Load Step 3 | Zap/bolt icon (16px, `#4fd1a8`) before "Instant Return" title | ☐ | ☐ |
| 4.14 | Instant price | Load Step 3 | "$4.99" in Bold 16px `#4fd1a8` (return-accent, NOT primary green) | ✅ | — |
| 4.15 | Instant features | Load Step 3 | 3 features: "Instant credit", "Same-day processing", "+$4.99 fee" | ✅ | — |
| 4.16 | Gap between options | Load Step 3 | 16px gap between each shipping option card | ☐ | ☐ |

##### MT-5: Shipping Option Selection

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 5.1 | Select UPS Pickup | Click UPS Pickup card | Pickup becomes selected (teal border, bg tint, filled radio), Drop-off becomes unselected (gray border, empty radio), QR preview hidden | ✅ | ✅ |
| 5.2 | Select Instant Return | Click Instant Return card | Instant becomes selected, others unselected | ✅ | — |
| 5.3 | Re-select Drop-off | Click UPS Drop-off after selecting another | Drop-off re-selected, QR preview reappears, others unselected | ✅ | — |
| 5.4 | Radio button click | Click directly on radio circle | Same behavior as clicking the full card | ☐ | ☐ |
| 5.5 | Only one selected | Click through all 3 options | Only one option has selected state at any time | ✅ | — |
| 5.6 | Summary updates on Instant | Select Instant Return | Summary "Return shipping" changes from "Free" to "$4.99", total refund decreases by $4.99 | ✅ | — |
| 5.7 | Summary updates back to Free | Select Instant Return → then select Drop-off | Summary "Return shipping" changes back to "Free", total refund increases by $4.99 | ✅ | — |
| 5.8 | QR only on Drop-off | Select each option in sequence | QR preview visible only when Drop-off is selected | ☐ | ☐ |

##### MT-6: Return Address Section

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 6.1 | Section border | Load Step 3 | Top border `border-[#e5e7eb]` separating from shipping options | ✅ | — |
| 6.2 | Section title | Load Step 3 | MapPin icon + "Return Address" — SemiBold 16px `#111827` | ✅ | — |
| 6.3 | Address card background | Load Step 3 | Gray background `#f9fafb`, `rounded-[8px]` | ☐ | ☐ |
| 6.4 | Warehouse name | Load Step 3 | "Hylee Returns Center" — Bold 14px `#374151` | ✅ | — |
| 6.5 | Address lines | Load Step 3 | 4 address lines in Regular 14px `#374151`, line-height 25.2px | ✅ | — |
| 6.6 | Return ID | Load Step 3 | Tag icon (14px, `#4fd1a8`) + "Return ID: " Regular + return ID value Bold — 14px `#374151` | ✅ | — |
| 6.7 | Return ID format | Load Step 3 | Return ID follows format "RET-YYYY-NNNNN" derived from order name | ☐ | ☐ |

##### MT-7: Packing Instructions Section

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 7.1 | Section border | Load Step 3 | Top border `border-[#e5e7eb]` separating from Return Address | ✅ | — |
| 7.2 | Section title | Load Step 3 | ClipboardList icon + "Packing Instructions" — SemiBold 16px `#111827` | ✅ | — |
| 7.3 | 5 instruction items | Load Step 3 | Five instruction items displayed with correct text | ✅ | — |
| 7.4 | Numbered circles | Load Step 3 | Each item has a `28×28px` mint green (`#4fd1a8`) circle with white number (1-5) | ☐ | ☐ |
| 7.5 | Circle styling | Inspect circles | `rounded-full`, positioned absolutely at `left-0 top-0` within `pl-[32px]` container | ☐ | ☐ |
| 7.6 | Instruction text | Load Step 3 | Each instruction in Regular 14px `#374151`, line-height 22.4px | ✅ | — |
| 7.7 | Gap between items | Load Step 3 | 12px gap between each instruction item | ☐ | ☐ |

##### MT-8: Visual Fidelity (Pixel Comparison) — MANUAL ONLY

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 8.1 | Overall layout | Compare with Figma screenshot | Content centered, 900px max-width, correct vertical spacing between all sections | ☐ | ☐ |
| 8.2 | Typography | Inspect all text elements | Correct font weights: Light (title), Regular (body/descriptions), Medium (features/labels), SemiBold (section titles/option titles), Bold (card title/prices/address name/total) | ☐ | ☐ |
| 8.3 | Color accuracy | Inspect colored elements | `#4fd1a8` for active step, option icons, return-accent price, radio selected, instruction circles, return ID icon, tracking header, total amount; `#2ac864` for completed steps, "Free" price, feature checkmarks; Correct grays throughout | ☐ | ☐ |
| 8.4 | Border radii | Inspect rounded elements | 12px on card, option cards, summary box, tracking notice; 8px on address card, action buttons, QR preview; `rounded-full` on radio buttons, step circles, instruction circles | ☐ | ☐ |
| 8.5 | Selected option shadow | Inspect selected shipping option | `shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]` visible | ☐ | ☐ |
| 8.6 | QR preview dimensions | Inspect QR preview | 120×120px with 2px `#e5e7eb` border, 16px left margin from content | ☐ | ☐ |
| 8.7 | No style leakage | Navigate between Step 3 and other account pages | Other account pages unaffected; Step 3 unaffected by other styles | ☐ | ☐ |

##### MT-9: Summary Box

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 9.1 | Summary container | Load Step 3 | `bg-[#f9fafb]`, `rounded-[12px]`, padding `20px` top/horizontal, `32px` bottom | ✅ | — |
| 9.2 | Items being returned | Load Step 3 | "Items being returned" label (Regular 14px, `#4b5563`) + item count (Medium 14px, `#1f2937`) | ✅ | — |
| 9.3 | Return shipping — Free | Load with Drop-off selected | "Return shipping" + "Free" in Medium 14px `#2ac864` | ✅ | ✅ |
| 9.4 | Return shipping — Paid | Select Instant Return | "Return shipping" + "$4.99" in Medium 14px `#4fd1a8` | ☐ | ☐ |
| 9.5 | Divider | Load Step 3 | `border-t-2 border-[#e5e7eb]` with `pt-[14px]` above total | ✅ | — |
| 9.6 | Total refund — Free shipping | Load with Drop-off | "Total Refund Amount" (Bold 16px, `#111827`) + total (Bold 16px, `#4fd1a8`) — equals items + tax | ✅ | — |
| 9.7 | Total refund — Paid shipping | Select Instant Return | Total decreases by $4.99 (shipping fee deducted from refund) | ✅ | — |
| 9.8 | Item count accuracy | Load with different item counts | Count matches number of items passed from Step 2 | ☐ | ☐ |

##### MT-10: Return Tracking Notice

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 10.1 | Notice container | Load Step 3 | `bg-[rgba(38,153,166,0.05)]`, `border border-[rgba(38,153,166,0.2)]`, `rounded-[12px]`, `p-[21px]` | ✅ | — |
| 10.2 | Header text | Load Step 3 | "Return Tracking" — SemiBold 14px `#4fd1a8` | ✅ | — |
| 10.3 | Body text | Load Step 3 | Full tracking info text — Regular 14px `#4b5563`, line-height 22.4px | ✅ | — |
| 10.4 | Color distinction from Step 1 | Compare with Return Policy notice | Teal colors (not amber) — different from Step 1's `#f2b05e` notice | ☐ | ☐ |

##### MT-11: Action Buttons

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 11.1 | Button layout | Load Step 3 | "Cancel" (left, ~35% width) and "Continue to Make It Right" (right, ~65% width), inline (not sticky) | ✅ | ✅ |
| 11.2 | Cancel button style | Inspect Cancel | White bg, `border-[#d1d5db]`, `rounded-[8px]`, text Medium 15px `#374151` | ✅ | — |
| 11.3 | Continue button style | Inspect Continue | `bg-return-accent`, `rounded-[8px]`, text Medium 15px white | ✅ | — |
| 11.4 | Continue always enabled | Load Step 3 | Continue button is NOT disabled (shipping method is always pre-selected) | ✅ | — |
| 11.5 | Cancel click | Click Cancel | Navigates back to Step 2 with items/reasons params preserved | ✅ | — |
| 11.6 | Continue click | Click Continue | Navigates to Step 4 (placeholder or alert for now) | ☐ | ☐ |
| 11.7 | Buttons not sticky | Scroll page | Buttons scroll with content (not fixed to bottom) | ✅ | — |

##### MT-12: Edge Cases

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 12.1 | Single item | Navigate with 1 item | Summary shows "Items being returned: 1", total reflects single item price | ☐ | ☐ |
| 12.2 | Many items (5+) | Navigate with 5+ items | Summary shows correct count, total = sum of all items | ☐ | ☐ |
| 12.3 | Browser back button | Press browser back from Step 3 | Returns to Step 2 with previous state | ☐ | ☐ |
| 12.4 | Page refresh | Select Instant Return → refresh | Resets to Drop-off (default), URL params preserved, page reloads correctly | ✅ | — |
| 12.5 | Currency formatting | Items with various prices | All prices formatted as `$X.XX`, summary totals add correctly | ✅ | — |
| 12.6 | Sidebar hidden | Load Step 3 | Account sidebar is NOT shown (return routes excluded via `NO_SIDEBAR_PATTERNS`) | ✅ | — |
| 12.7 | Long text wrapping | Shipping description that wraps to 3+ lines | Card layout handles multi-line description without overflow or misalignment | ☐ | ☐ |

### Phase 6: Documentation

- [x] Update `hydrogen/design-references/return-process/step3-shipping-figma-spec.md` with any implementation deviations
- [x] Update `plans/RETURN_PROCESS_PLAN.md` to note Step 2 → Step 3 wiring
- [x] Add Step 3 route to `docs/ACTIVE_CONTEXT.md`
- [x] Update `hydrogen/CLAUDE.md` Active Design References table with Step 3 entry

---

## Component Reuse from Steps 1-2

| Component | Reuse? | Notes |
|-----------|--------|-------|
| `ReturnStepProgress` | Yes | Pass `currentStep={3}` |
| `ReturnItemCard` | No | Items are not displayed individually in Step 3 |
| `ReturnReasonItemCard` | No | Not applicable to Step 3 |
| `ReturnSelectionSummary` | No | Replaced by `ReturnShippingSummary` |
| `RefundSummary` | No | Step 3 has a different summary format (item count + shipping, no tax breakdown) |
| `ReturnPolicyNotice` | No | Replaced by `ReturnTrackingNotice` (teal, not amber) |
| `ReturnActionBar` | No | Step 3 uses inline buttons (not sticky), same pattern as Step 2 |
| `ReturnLineItem` type | Yes | Reuse the type for loader data |

## Notes

### State Flow Between Steps

```
Step 1 → Step 2:  ?items=id1,id2,id3
Step 2 → Step 3:  ?items=id1,id2,id3&reasons=defective,wrong-item
Step 3 → Step 4:  ?items=id1,id2,id3&reasons=defective,wrong-item&shipping=drop-off
```

### Shipping Options Data

The three shipping options are static/hardcoded for this implementation:

```ts
const SHIPPING_OPTIONS = [
  {
    id: 'drop-off',
    icon: Package,
    title: 'UPS Drop-off',
    price: 'Free',
    priceFree: true,
    priceAmount: 0,
    description: 'Drop off your package at any UPS location or UPS Store. Print your label at home or show QR code at the store.',
    features: ['Prepaid label', '10,000+ locations', 'No packaging needed'],
    showQrPreview: true,
  },
  {
    id: 'pickup',
    icon: Truck,
    title: 'UPS Pickup',
    price: 'Free',
    priceFree: true,
    priceAmount: 0,
    description: 'Schedule a free pickup from your home or office. UPS will come to your door and collect your package.',
    features: ['Convenient pickup', 'Next business day', 'No trip needed'],
  },
  {
    id: 'instant',
    icon: Zap,
    title: 'Instant Return',
    price: '$4.99',
    priceFree: false,
    priceAmount: 4.99,
    description: 'Get instant store credit upon drop-off scan, before we receive your return. Perfect for quick reorders.',
    features: ['Instant credit', 'Same-day processing', '+$4.99 fee'],
  },
];
```

### Return ID Generation

The return ID is generated from the order name:
- Order `#HY-2024-78432` → Return ID `RET-2024-78432`
- This is simulated — real implementation would use Shopify's return API to generate a proper return ID.

### Return Address

The warehouse address is hardcoded:
- Hylee Returns Center
- 1234 Warehouse Boulevard
- Building C, Suite 100
- Seattle, WA 98101
- United States

In production this would come from a Shopify configuration or metafield.

### QR Code

The QR code preview is a placeholder (QrCode Lucide icon in gray). Future implementation would generate a real QR code using a library like `qrcode.react` containing the return ID or shipping label URL.

### Responsive Considerations

- QR preview (120px): stays inline on desktop/tablet, consider hiding on mobile (<640px) or moving below
- Shipping option cards: full-width, stack well naturally
- Feature tags: `flex-wrap` handles narrower viewports
- Action buttons: Cancel/Continue follow Step 2's ~35%/~65% flex split
- Numbered instruction circles: stay positioned correctly at all widths

### Future Steps (Out of Scope)

Step 4 ("Make It Right") will be implemented as follow-up work:
- Choose resolution: refund to original payment, store credit, or exchange
- Final confirmation of the return
- Submit return request
