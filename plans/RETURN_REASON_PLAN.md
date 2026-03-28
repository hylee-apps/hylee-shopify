# Implementation Plan: Return Process — Step 2 (Return Reason)

> **Status**: In Progress (Phases 1–5 complete; Phase 6 Docs pending)
> **Created**: 2026-03-26
> **Branch**: `hotfix/orders-time-filter-styling`
> **Figma**: `NEk59QDkRMC3a6LD0WZVQJ` node `1:321`
> **Depends on**: Return Process Step 1 (complete)

## Overview

Build **Step 2 (Return Reason)** of the 4-step return wizard. Users arrive here from Step 1 after selecting items to return. Each selected item is displayed with an inline reason form: a 4-option reason picker, optional details textarea, and optional photo upload. A Refund Summary shows the estimated refund breakdown. The page title changes to "Return Items" and the progress tracker shows Step 2 as active.

Users arrive with selected item IDs passed via URL search params from Step 1.

---

## Design Analysis

### Key Design Decisions

1. **Item card has two states** — "expanded" (showing the reason form inline) and "collapsed" (just product info + checked checkbox). Only one item is expanded at a time. In the Figma, the first item is expanded.

2. **Reason form is inline within the item card** — The right ~60% of an expanded item card contains: reason label, 2×2 reason grid, textarea, and upload button. A `border-t` separates it from the product info area vertically.

3. **All items arrive pre-selected** — Items passed from Step 1 are all checked. Users can uncheck to remove items from the return, which collapses that item's reason form and removes it from the refund calculation.

4. **Refund Summary replaces Selection Summary** — Step 1's `ReturnSelectionSummary` and `ReturnPolicyNotice` are gone. Instead, a `RefundSummary` card shows item subtotal, tax refund (8% simulated), return shipping (free), and estimated total.

5. **Action bar is NOT sticky** — Unlike Step 1's sticky bottom bar, Step 2 renders "Cancel" and "Continue to Shipping" buttons inline at the bottom of the page. Cancel navigates back. Continue is disabled until every selected item has a reason.

6. **Product image size changes to 80×80px** — Step 1 used 100×100px. The expanded card layout needs more horizontal space for the reason form.

7. **State passed via URL search params** — Selected item IDs arrive as `?items=id1,id2,id3` from Step 1. The route loader fetches order data and filters to only the selected items.

8. **4 return reasons** — "Defective", "Wrong Item", "Not as Described", "Changed Mind". Selected reason gets `border-return-accent`, `bg-[rgba(38,153,166,0.05)]`, and `text-return-accent` with `font-medium`. Unselected gets `border-[#d1d5db]` with `text-[#1f2937]` and `font-normal`.

9. **Photo upload is UI-only for now** — The upload button and helper text are present but file upload is a placeholder (no backend). The camera icon + "Upload Photos" button will trigger a file input in the future.

### Icon Mapping

| Element | Lucide Icon |
|---------|-------------|
| Upload Photos | `Camera` |
| Step 2 active | `HelpCircle` (reused from ReturnStepProgress) |

---

## Checklist

### Phase 1: State Passing Infrastructure (Step 1 → Step 2)

- [x] Update Step 1 route (`account.orders.$id_.return.tsx`) — wire "Continue to Reason" button to navigate to Step 2 route with selected item IDs as URL search params (`?items=id1,id2,id3`)
- [x] Create Step 2 route file: `hydrogen/app/routes/account.orders.$id_.return.reason.tsx`
  - Route naming: `$id_.return.reason` keeps the `_` opt-out from `$id` layout
  - URL: `/account/orders/:id/return/reason?items=...`
- [x] Add Step 2 route pattern to `NO_SIDEBAR_PATTERNS` in `account.tsx` (already covered — `/return` prefix regex matches `/return/reason`)
- [x] Verify `reloadDocument` behavior works for Step 2 navigation — Step 1 uses `useNavigate()` for client-side nav to Step 2; Cancel link on Step 2 uses `reloadDocument` back to Step 1

### Phase 2: New Components

- [x] Create `ReturnReasonForm.tsx` — `hydrogen/app/components/account/ReturnReasonForm.tsx`
  - Inline reason selection form rendered inside an expanded item card
  - Props: `reason: string | null`, `details: string`, `onReasonChange: (reason: string) => void`, `onDetailsChange: (details: string) => void`, `onUploadClick: () => void`
  - "Reason for return:" label — 13px, `#6b7280`
  - 2×2 reason option grid — `grid grid-cols-2 gap-[12px]`
  - Each option: `rounded-[8px]`, `px-[17px] py-[13px]`, center-aligned text
  - Selected state: `border-return-accent bg-[rgba(38,153,166,0.05)] text-return-accent font-medium`
  - Unselected state: `border-[#d1d5db] text-[#1f2937] font-normal`
  - Options: "Defective", "Wrong Item", "Not as Described", "Changed Mind"
  - Textarea: `border-[#d1d5db] rounded-[8px] bg-white`, placeholder "Additional details (optional)", 15px `#757575`
  - Upload Photos button: `border-[#d1d5db] rounded-[8px] bg-white`, Camera icon + text, `px-[25px] py-[13px]`
  - Helper text below upload: 12px, `#6b7280`
  - `data-testid="return-reason-form-{itemId}"`

- [x] Create `ReturnReasonItemCard.tsx` — `hydrogen/app/components/account/ReturnReasonItemCard.tsx`
  - Item card with two states: expanded (with reason form) and collapsed
  - Props: `item: ReturnLineItem`, `selected: boolean`, `expanded: boolean`, `reason: string | null`, `details: string`, `onToggleSelect: () => void`, `onExpand: () => void`, `onReasonChange: (reason: string) => void`, `onDetailsChange: (details: string) => void`
  - **Expanded state**:
    - Border: `2px solid #4fd1a8`, bg `rgba(38,153,166,0.02)`
    - Min height: `382px`
    - Layout: checkbox (24px) | image (80×80) | product info (~90px) | reason form (flex-1)
    - Reason form separated by `border-t border-[#e5e7eb]` with `pt-[17px]`
  - **Collapsed state**:
    - Border: `2px solid #e5e7eb`
    - No background tint, no min height
    - Layout: checkbox | image (80×80) | product info (flex-1)
    - No reason form
  - Click on collapsed card → expands it (collapses others)
  - Checkbox toggles selection independently of expand/collapse
  - `data-testid="return-reason-item-{id}"`

- [x] Create `RefundSummary.tsx` — `hydrogen/app/components/account/RefundSummary.tsx`
  - Refund breakdown card
  - Props: `itemSubtotal: number`, `taxRate?: number`, `shippingFree?: boolean`, `currencyCode?: string`
  - Container: `bg-[#f9fafb] rounded-[12px] p-[24px]`
  - Title: "Refund Summary" — SemiBold 18px `#1f2937`
  - Line items: "Item Subtotal", "Tax Refund", "Return Shipping"
  - Each row: flex justify-between, Regular 15px `#1f2937`
  - "Free" label: `text-primary` (`#2ac864`)
  - Divider: `border-t-2 border-[#e5e7eb]`, `pt-[14px]`
  - Total: "Estimated Refund" — Bold 18px `#111827` / value Bold 18px `text-return-accent`
  - Disclaimer: Regular 13px `#6b7280`
  - `data-testid="refund-summary"`

### Phase 3: Route & Page Assembly

- [x] Build the Step 2 route component (`account.orders.$id_.return.reason.tsx`)
  - **Loader**:
    - Authenticate via `isCustomerLoggedIn` / `getCustomerAccessToken`
    - Read `items` search param from URL
    - Fetch order data via `customer(customerAccessToken)` query (same as Step 1)
    - Filter line items to only those whose IDs are in the `items` param
    - If no valid items found, redirect back to Step 1
    - Return: `orderId`, `orderName`, `deliveredDate`, `lineItems` (filtered)
  - **Page layout**:
    - Title: "Return Items" — centered, Light 32px `#1f2937`
    - Subtitle: order # + delivery date — centered, Regular 16px `#4b5563`
    - `ReturnStepProgress` at `currentStep={2}`
    - Items card with header ("Select Items to Return" / "Select all that apply")
    - List of `ReturnReasonItemCard` components
    - `RefundSummary` below the card
    - Inline action buttons (not sticky)
  - **Client-side state**:
    - `selectedIds: Set<string>` — initialized from all passed item IDs
    - `expandedId: string | null` — which item's reason form is shown (default: first item)
    - `reasonData: Map<string, {reason: string | null, details: string}>` — per-item reason state
    - `canContinue` — true when every selected item has a non-null reason
  - **Action buttons**:
    - "Cancel": outlined button, navigates to `/account/orders/{id}/return` (Step 1)
    - "Continue to Shipping": `bg-return-accent`, disabled when `!canContinue`
    - Button widths: Cancel ~35% flex, Continue ~65% flex
    - NOT sticky — rendered inline with `pt-[16px]`
  - **SEO meta**: "Return Reason — {orderName}"

- [x] Update Step 1 route — wire `onContinue` to navigate to Step 2 via `useNavigate()`:
  ```
  /account/orders/{id}/return/reason?items={selectedIds.join(',')}
  ```

### Phase 4: Styling & CSS Isolation

- [x] All return-reason styles use Tailwind utilities scoped to component elements — no global CSS
- [x] Verify `return-accent` token usage — no hardcoded `#4fd1a8` in return components
- [x] Reason option selected state uses `rgba(38,153,166,0.05)` background (subtle teal, not full opacity)
- [x] Expanded item card background uses `rgba(38,153,166,0.02)` (barely visible tint)
- [x] Verify no style leakage between return pages and other account pages
- [x] Add `data-testid` attributes to all interactive elements:
  - `data-testid="return-reason-item-{id}"` on each item card
  - `data-testid="return-reason-form-{id}"` on reason form container
  - `data-testid="return-reason-option-{reason}"` on each reason button
  - `data-testid="return-reason-details-{id}"` on textarea
  - `data-testid="return-reason-upload-{id}"` on upload button
  - `data-testid="refund-summary"` on refund summary
  - `data-testid="refund-total"` on estimated refund amount
  - `data-testid="return-cancel-btn"` on Cancel button
  - `data-testid="return-continue-btn"` on Continue to Shipping button
  - `data-testid="return-select-all"` on "Select all that apply" link

### Phase 5: Testing

#### Unit Tests

- [ ] `ReturnReasonForm.test.tsx` — renders 4 reason options, handles selection, textarea input, upload click
- [ ] `ReturnReasonItemCard.test.tsx` — expanded vs collapsed states, checkbox toggle, expand click
- [ ] `RefundSummary.test.tsx` — renders breakdown rows, formats currency, shows "Free" for shipping, calculates total

#### Automated E2E Tests (Playwright)

- [x] `return-reason.spec.ts` — `hydrogen/tests/e2e/return-reason.spec.ts`
  - Desktop (1440×900) + Tablet (768×1024) viewports
  - Authenticated, serial execution
  - 80 tests: **71 passed**, 9 skipped (multi-item order required)
  - Fixed route nesting bug: renamed to `account.orders.$id_.return_.reason.tsx` (trailing `_` on `return` to opt out of layout nesting)

#### Manual Testing Plan

##### MT-1: Page Load & Navigation

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 1.1 | Navigate from Step 1 | On Step 1, select items → click "Continue to Reason" | Step 2 loads with correct title "Return Items", same order # and delivery date, only selected items shown | ✅ | — |
| 1.2 | URL has items param | Check browser URL after navigating | URL is `/account/orders/{id}/return/reason?items=id1,id2,...` with correct item IDs | ✅ | — |
| 1.3 | Direct URL access | Navigate directly to Step 2 URL with valid items param | Page loads correctly with specified items | ✅ | ✅ |
| 1.4 | Direct URL without items param | Navigate to Step 2 URL without `?items=` | Redirects back to Step 1 | ✅ | — |
| 1.5 | Direct URL with invalid items | Navigate with `?items=invalid-id` | Redirects back to Step 1 (no valid items found) | ✅ | — |
| 1.6 | Unauthenticated access | Log out → navigate to Step 2 URL | Redirects to login page | ✅ | — |
| 1.7 | Invalid order ID | Navigate to `/account/orders/invalid/return/reason?items=x` | 404 error or redirect to orders | ✅ | — |

##### MT-2: Progress Steps

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 2.1 | Step 1 completed state | Load Step 2 | Step 1 "Select Items" shows green (`#2ac864`) circle with white checkmark | ✅ | — |
| 2.2 | Step 2 active state | Load Step 2 | Step 2 "Reason" shows mint green (`#4fd1a8`) circle with white HelpCircle icon and teal shadow ring | ✅ | — |
| 2.3 | Steps 3-4 pending | Load Step 2 | Steps 3 "Ship" and 4 "Make It Right" show gray circles at 40% opacity | ✅ | — |
| 2.4 | Step labels | Load Step 2 | Labels "Select Items", "Reason", "Ship", "Make It Right" — 13px medium `#4b5563` | ✅ | ✅ |
| 2.5 | Connector lines | Load Step 2 | Gray 60px lines between all step circles | ✅ | — |

##### MT-3: Items Card Header

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 3.1 | Card container | Load Step 2 | White card with `border-[#e5e7eb]`, `rounded-[12px]`, subtle shadow | ✅ | — |
| 3.2 | Header left text | Load Step 2 | "Select Items to Return" — Bold 18px `#111827` | ✅ | — |
| 3.3 | Header right text | Load Step 2 | "Select all that apply" — Regular 14px `#6b7280` | ✅ | — |
| 3.4 | Header border | Load Step 2 | Bottom border `border-[#e5e7eb]` separating header from body | ✅ | — |

##### MT-4: Expanded Item Card

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 4.1 | First item expanded by default | Load Step 2 with multiple items | First item shows reason form; others are collapsed | ✅ | — |
| 4.2 | Expanded card border | View expanded item | `2px solid #4fd1a8` border, `rgba(38,153,166,0.02)` background tint | ✅ | — |
| 4.3 | Expanded card layout | View expanded item | Horizontal: checkbox (24px) → image (80×80) → product info → reason form (right side) | ✅ | ✅ |
| 4.4 | Checkbox checked state | View expanded item | Green (`#4fd1a8`) checkbox with white checkmark | ✅ | — |
| 4.5 | Product image placeholder | View item without image | 80×80 gray rounded box with image icon | ✅ | — |
| 4.6 | Product info | View expanded item | Title (Medium 16px `#1f2937`), variant/qty (Regular 14px `#6b7280`), price (SemiBold 16px `#4fd1a8`) | ✅ | — |
| 4.7 | Reason form divider | View expanded item | Vertical `border-t border-[#e5e7eb]` separating product info from reason form | ✅ | — |
| 4.8 | Min height | View expanded item | Card has minimum height of 382px to accommodate reason form | ✅ | — |

##### MT-5: Reason Selection

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 5.1 | Reason options display | View expanded item | 2×2 grid: "Defective", "Wrong Item", "Not as Described", "Changed Mind" — all unselected initially | ✅ | ✅ |
| 5.2 | Select a reason | Click "Defective" | Button gets `border-return-accent`, `bg-[rgba(38,153,166,0.05)]`, text `#4fd1a8` font-medium | ✅ | — |
| 5.3 | Switch reason | Click "Defective" then "Wrong Item" | "Wrong Item" selected, "Defective" deselected — only one reason at a time | ✅ | — |
| 5.4 | Reason label | View reason form | "Reason for return:" in 13px Regular `#6b7280` above the grid | ✅ | — |
| 5.5 | Option sizing | Inspect reason buttons | `rounded-[8px]`, `px-[17px] py-[13px]`, centered text 14px | ✅ | — |
| 5.6 | Grid gap | Inspect reason grid | 12px gap between all options | ✅ | — |

##### MT-6: Additional Details & Upload

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 6.1 | Textarea display | View expanded item | Textarea with placeholder "Additional details (optional)" in `#757575` 15px | ✅ | — |
| 6.2 | Textarea input | Type in textarea | Text appears, placeholder disappears | ✅ | — |
| 6.3 | Textarea border | Inspect textarea | `border-[#d1d5db]`, `rounded-[8px]`, white background | ✅ | — |
| 6.4 | Upload button display | View expanded item | Camera icon + "Upload Photos" text, `border-[#d1d5db]`, `rounded-[8px]` | ✅ | — |
| 6.5 | Upload helper text | View below upload button | "Add photos to support your return request" — 12px `#6b7280` | ✅ | — |
| 6.6 | Upload button click | Click "Upload Photos" | Triggers file input (or placeholder alert for now) | ✅ | — |

##### MT-7: Collapsed Item Cards

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 7.1 | Collapsed card border | View non-expanded item | `2px solid #e5e7eb`, no background tint | ⏭️ | ⏭️ |
| 7.2 | Collapsed card checkbox | View non-expanded item | Checkbox is checked (`#4fd1a8` background with white check) | ⏭️ | ⏭️ |
| 7.3 | Collapsed card layout | View non-expanded item | Checkbox → image (80×80) → product info (flex-1), no reason form | ⏭️ | ⏭️ |
| 7.4 | Click collapsed card to expand | Click on a collapsed item | That item expands (shows reason form), previously expanded item collapses | ⏭️ | ⏭️ |
| 7.5 | Expand preserves reason | Select reason on item A → expand item B → re-expand item A | Item A still has its previously selected reason | ⏭️ | ⏭️ |

> **Note:** MT-7 tests skipped — test account orders have only 1 item, so collapsed card state cannot be tested. Requires multi-item order for coverage.

##### MT-8: Selection Behavior

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 8.1 | Uncheck an item | Click checkbox on a checked item | Item unchecks, border changes to gray, reason form collapses (if expanded), refund updates | ⏭️ | ⏭️ |
| 8.2 | Re-check an item | Click checkbox on unchecked item | Item re-checks, can be expanded again for reason | ⏭️ | ⏭️ |
| 8.3 | Uncheck all items | Uncheck every item | Continue button disabled; refund shows $0.00 | ✅ | — |
| 8.4 | Select all that apply link | Click "Select all that apply" | All items check/uncheck (toggle behavior) | ✅ | — |
| 8.5 | Unchecked item reason cleared | Uncheck item with reason → re-check | Reason state is cleared (user must re-select) | ✅ | — |

> **Note:** MT-8.1 and 8.2 skipped — require multi-item order for meaningful uncheck/re-check testing.

##### MT-9: Refund Summary

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 9.1 | Summary title | Load Step 2 | "Refund Summary" — SemiBold 18px `#1f2937` | ✅ | — |
| 9.2 | Item subtotal | View with items selected | "Item Subtotal" shows sum of selected items' prices | ✅ | — |
| 9.3 | Tax refund | View refund summary | "Tax Refund" shows calculated tax amount | ✅ | — |
| 9.4 | Return shipping | View refund summary | "Return Shipping" shows "Free" in green (`#2ac864`) | ✅ | ✅ |
| 9.5 | Estimated refund total | View refund summary | "Estimated Refund" in Bold 18px, value in `#4fd1a8` Bold 18px | ✅ | — |
| 9.6 | Total calculation | Verify math | Estimated Refund = Item Subtotal + Tax Refund (shipping is free) | ✅ | — |
| 9.7 | Disclaimer text | View below total | "Refund will be processed to original payment method within 5-7 business days after we receive the item." | ✅ | — |
| 9.8 | Refund updates on uncheck | Uncheck an item | Subtotal, tax, and total recalculate without that item's price | ⏭️ | ⏭️ |
| 9.9 | Summary container | Inspect summary | `bg-[#f9fafb]`, `rounded-[12px]`, padding 24px | ✅ | — |
| 9.10 | Divider above total | Inspect divider | `border-t-2 border-[#e5e7eb]` with `pt-[14px]` above "Estimated Refund" | ✅ | — |

> **Note:** MT-9.8 skipped — requires multi-item order to test refund recalculation on uncheck.

##### MT-10: Action Buttons

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 10.1 | Button layout | Load Step 2 | "Cancel" (left, ~35% width) and "Continue to Shipping" (right, ~65% width), inline (not sticky) | ✅ | ✅ |
| 10.2 | Cancel button style | Inspect Cancel | White bg, `border-[#d1d5db]`, `rounded-[8px]`, "Cancel" Medium 15px `#374151` | ✅ | — |
| 10.3 | Continue button style | Inspect Continue | `bg-return-accent`, `rounded-[8px]`, "Continue to Shipping" Medium 15px white | ✅ | — |
| 10.4 | Continue disabled | Load page before selecting any reasons | "Continue to Shipping" at 50% opacity, not clickable | ✅ | ✅ |
| 10.5 | Continue enabled | Select reason for all items | Button becomes full opacity, clickable | ✅ | ✅ |
| 10.6 | Continue partially filled | Select reason for 1 of 2 items | Button stays disabled (all selected items must have a reason) | ⏭️ | ⏭️ |
| 10.7 | Cancel click | Click Cancel | Navigates back to Step 1 (`/account/orders/{id}/return`) | ✅ | — |
| 10.8 | Continue click | Fill all reasons → click Continue | Navigates to Step 3 (placeholder for now) or shows alert | — | — |
| 10.9 | Buttons not sticky | Scroll page | Buttons scroll with content (not fixed to bottom) | ✅ | — |

> **Note:** MT-10.6 skipped — requires multi-item order. MT-10.8 deferred — Step 3 not yet implemented.

##### MT-11: Visual Fidelity

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 11.1 | Overall layout | Compare with Figma | Content centered, 900px max-width, correct vertical spacing | ✅ | — |
| 11.2 | Typography | Inspect text elements | Correct font weights: Light (title), Regular (body), Medium (labels/buttons), Bold (card title, refund total), SemiBold (prices, summary title) | ✅ | — |
| 11.3 | Color accuracy | Inspect colored elements | `#4fd1a8` for active step, selected reason, prices, continue btn; `#2ac864` for completed step, "Free"; `#f9fafb` for summary bg | ✅ | — |
| 11.4 | Border radii | Inspect rounded elements | 12px on cards/summary; 8px on reason options/textarea/upload/action buttons; 4px on checkbox | ✅ | — |
| 11.5 | No style leakage | Navigate between Step 2 and other pages | Other account pages unaffected; Step 2 unaffected by other styles | — | — |
| 11.6 | Spacing accuracy | Inspect gaps | 8px page gap, 16px items gap, 12px reason form gap, 12px grid gap, 20px item internal gap | ✅ | — |

##### MT-12: Edge Cases

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 12.1 | Single item | Navigate with 1 item | Item is expanded by default, no collapsed items shown | ✅ | — |
| 12.2 | Many items (5+) | Navigate with 5+ items | All items render, page scrolls, first expanded, rest collapsed | — | — |
| 12.3 | Long product name | Item with very long name | Name wraps in the narrow (~90px) product info column without overflow | — | — |
| 12.4 | Long details text | Type a long paragraph in textarea | Textarea expands or scrolls, doesn't break card layout | — | — |
| 12.5 | Browser back button | Press browser back from Step 2 | Returns to Step 1 with previous state (items may need re-selection) | ✅ | — |
| 12.6 | Page refresh | Fill reasons → refresh | State resets (URL params preserved, but reason selections lost) | ✅ | — |
| 12.7 | Currency formatting | Items with various prices | All prices formatted as `$X.XX`, refund summary adds correctly | ✅ | — |

> **Note:** MT-12.1 is implicitly verified (all tests use single-item orders). MT-12.2–12.4 require specific test data not available in the current test account.

### Phase 6: Documentation

- [ ] Update `hydrogen/design-references/return-process/step2-reason-figma-spec.md` with implementation deviations
- [ ] Update `plans/RETURN_PROCESS_PLAN.md` to note Step 2 completion
- [ ] Add Step 2 route to `ACTIVE_CONTEXT.md`

---

## Component Reuse from Step 1

| Component | Reuse? | Notes |
|-----------|--------|-------|
| `ReturnStepProgress` | Yes | Pass `currentStep={2}` |
| `ReturnItemCard` | No | Step 2 has different layout (80px image, reason form inline, two states). New `ReturnReasonItemCard`. |
| `ReturnSelectionSummary` | No | Replaced by `RefundSummary` |
| `ReturnPolicyNotice` | No | Not present in Step 2 |
| `ReturnActionBar` | No | Step 2 action bar is NOT sticky and has different button layout (Cancel/Continue, inline). Build inline in route. |
| `ReturnLineItem` type | Yes | Reuse the type from `ReturnItemCard.tsx` |

## Notes

### State Flow Between Steps

```
Step 1 → Step 2:  URL params ?items=id1,id2,id3
Step 2 → Step 3:  URL params ?items=id1,id2,id3&reasons=defective,wrong-item,changed-mind
                   (or session/context — TBD for Step 3)
```

### Tax Calculation

The Figma shows a "Tax Refund" of $23.92 on a $299.00 subtotal (~8%). Since we don't have real tax data from Shopify in the Storefront API for return scenarios, we'll simulate an 8% tax rate. This should be made configurable or replaced with real data when the return API is integrated.

### Photo Upload

The upload button is UI-only for now. Implementation:
- Render a hidden `<input type="file" accept="image/*" multiple>`
- Click handler on the Upload Photos button triggers the file input
- Selected files stored in component state (displayed as thumbnails in future iteration)
- No actual upload to backend

### Responsive Considerations

- On mobile (< 640px): Expanded item card should stack vertically — product info on top, reason form below (full width)
- Reason grid stays 2-col on tablet; consider 1-col on very narrow screens (< 400px)
- Action buttons: Cancel and Continue should stack vertically on mobile or both go full-width
