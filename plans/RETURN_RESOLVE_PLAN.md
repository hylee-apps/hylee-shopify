# Implementation Plan: Return Process — Step 4 (Make It Right)

> **Status**: :green_circle: Complete (Phases 1–5 done; Phase 6 Documentation done; Phase 7 Polish pending)
> **Created**: 2026-03-28
> **Last Updated**: 2026-03-28 (E2E tests passing — 80 pass, 0 fail)
> **Branch**: `feature/account/return-process`
> **Figma**: `NEk59QDkRMC3a6LD0WZVQJ` node `1:1030`
> **Depends on**: Return Process Steps 1-3 (all complete)

## Overview

Build **Step 4 (Make It Right)** — the final step of the 4-step return wizard. Users arrive here from Step 3 (Shipping) after choosing a shipping method. This page presents four resolution options (Exchange, Replace, Store Credit, Refund) in a 2×2 grid, shows a thumbnail preview of the selected return items, displays a return value summary, and an "Our Promise" assurance notice. Title is "Make It Right" and the progress tracker shows Step 4 as active with Steps 1-3 completed.

Users arrive with selected item IDs, reasons, and shipping method passed via URL search params from Steps 1-3.

---

## Design Analysis

### Key Design Decisions

1. **2×2 Grid layout for resolution options** — Four resolution options displayed in a `grid-cols-2` layout, each card `171.5px` tall with centered content. This is a single-select (radio-style) interaction — only one resolution can be chosen at a time.

2. **Selected state not shown in Figma** — The design only shows the unselected state. The selected state follows the project pattern established in Step 3's ShippingOptionCard: `border-2 border-[#4fd1a8]`, `bg-[rgba(38,153,166,0.05)]`, and a subtle shadow. The icon color should also shift from `#4b5563` to `#4fd1a8` when selected, and the icon container bg changes from `#f3f4f6` to a lighter teal tint.

3. **Item thumbnails preview** — A new pattern: small `50×50px` rounded thumbnails showing the selected return items inline at the top of the card body. Uses product images or gray placeholder icons.

4. **Summary is INSIDE the card body** — Unlike Steps 2-3 where the summary was a separate element below the card, Step 4's summary section is embedded inside the main card body. It has 4 rows (Items being returned, Subtotal, Return shipping, Total Resolution Value) with the total label changed to "Total Resolution Value".

5. **"Our Promise" notice** — Same teal color scheme as the "Return Tracking" notice from Step 3 (`rgba(38,153,166,0.05)` bg, `rgba(38,153,166,0.2)` border). Different title ("Our Promise") and body text.

6. **No action buttons in Figma frame** — Following Steps 2-3's pattern: inline (not sticky) "Cancel" (~35%) + "Submit Return" (~65%) buttons. Cancel navigates back to Step 3. Submit is disabled until a resolution is selected; when clicked, it triggers a confirmation (for now, a success alert or placeholder).

7. **Route structure** — `account.orders.$id_.return_.resolve.tsx` — trailing `_` on `$id` and `return` to opt out of parent layout nesting (same pattern as Steps 2-3).

8. **State passing** — Full accumulated state arrives via URL search params:
   ```
   ?items=id1,id2&reasons=defective,wrong-item&shipping=drop-off
   ```

### Icon Mapping (FontAwesome → Lucide)

| Element | FA Unicode | Lucide | Size | Color |
|---------|-----------|--------|------|-------|
| Exchange option |  | `ArrowLeftRight` | 28px | `#4b5563` (unselected) / `#4fd1a8` (selected) |
| Replace option |  | `RefreshCw` | 28px | `#4b5563` / `#4fd1a8` |
| Store Credit option |  | `CreditCard` | 28px | `#4b5563` / `#4fd1a8` |
| Refund option |  | `Smile` | 28px | `#4b5563` / `#4fd1a8` |
| Product placeholder |  | `Headphones` | 20px | `#9ca3af` |
| Product placeholder |  | `Plug` | 20px | `#9ca3af` |

---

## Checklist

### Phase 1: Verify Prerequisites

- [x] Verify Lucide icons exist: `ArrowLeftRight`, `RefreshCw`, `CreditCard`, `Smile` (all verified available)
- [x] Verify `return-accent` token already in `app/styles/app.css` → `--color-return-accent: #4fd1a8` (confirmed exists)
- [x] Verify Figma design reference saved: `hydrogen/design-references/return-process/step4-resolve-figma-spec.md` (done)
- [x] Verify `NO_SIDEBAR_PATTERNS` in `account.tsx` covers `/return/resolve` — existing regex `/^\/account\/orders\/[^/]+\/return/` matches all `/return/*` sub-paths (confirmed)

### Phase 2: Components

- [x] Create `ResolutionOptionCard.tsx` — `hydrogen/app/components/account/ResolutionOptionCard.tsx`
  - Individual selectable resolution card for the 2×2 grid
  - Props:
    ```ts
    interface ResolutionOptionCardProps {
      id: string;
      icon: ComponentType<LucideProps>;
      title: string;
      description: string;
      selected: boolean;
      onSelect: () => void;
    }
    ```
  - **Unselected state**:
    - Border: `2px solid #e5e7eb`
    - Background: `white`
    - Icon container bg: `#f3f4f6`
    - Icon color: `#4b5563`
  - **Selected state**:
    - Border: `2px solid #4fd1a8` (return-accent)
    - Background: `rgba(38,153,166,0.05)` (subtle teal tint)
    - Shadow: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)`
    - Icon container bg: `rgba(79,209,168,0.15)` (light mint tint)
    - Icon color: `#4fd1a8` (return-accent)
  - **Layout**: position relative, height `171.5px`, `rounded-[12px]`
    - Icon container: `64×64px`, `rounded-full`, centered horizontally, `top-[20px]`, absolute
    - Title: absolute, `top-[96px]`, `left-[20px] right-[20px]`, centered
      - SemiBold 16px, `#111827`, line-height 24px
    - Description: absolute, `top-[128px]`, `left-[20px] right-[20px]`, centered
      - Regular 13px, `#4b5563`, line-height 19.5px
  - **Hover state**: cursor-pointer, subtle border color change
  - `data-testid="resolution-option-{id}"`

- [x] Create `SelectedItemsPreview.tsx` — `hydrogen/app/components/account/SelectedItemsPreview.tsx`
  - Displays small thumbnails of items being returned plus a summary line
  - Props:
    ```ts
    interface SelectedItemsPreviewProps {
      items: Array<{
        id: string;
        title: string;
        image: { url: string; altText?: string | null } | null;
      }>;
      totalValue: string;  // formatted, e.g. "$348.99"
    }
    ```
  - **Thumbnails row**: flex-wrap, gap `0px 12px`
    - Each thumbnail: `50×50px`, `bg-[#f3f4f6]`, `rounded-[8px]`
    - If image: `<img>` with `object-cover`, `rounded-[8px]`, `50×50px`
    - If no image: centered placeholder icon (20px, `#9ca3af`)
  - **Summary text**: below thumbnails, gap `16px` from grid
    - "{count} items • Total value: {totalValue}" — Regular 14px, `#4b5563`, line-height 21px
  - `data-testid="selected-items-preview"`

- [x] Create `ResolutionSummary.tsx` — `hydrogen/app/components/account/ResolutionSummary.tsx`
  - Summary box showing items count, subtotal, shipping cost, and total resolution value
  - Props:
    ```ts
    interface ResolutionSummaryProps {
      itemCount: number;
      subtotal: number;
      shippingPrice: string;   // "Free" or "$4.99"
      shippingFree: boolean;
      totalValue: number;
      currencyCode?: string;
    }
    ```
  - Container: `bg-[#f9fafb]`, `rounded-[12px]`, `px-[20px] pt-[28px] pb-[32px]`
  - Gap: `12px` between rows
  - **Row 1**: "Items being returned" (Regular 14px, `#4b5563`) | count (Medium 14px, `#1f2937`)
  - **Row 2**: "Subtotal" (Regular 14px, `#4b5563`) | formatted subtotal (Medium 14px, `#1f2937`)
  - **Row 3**: "Return shipping" (Regular 14px, `#4b5563`) | shipping price (Medium 14px, `#2ac864` if free, `#4fd1a8` if paid)
  - **Divider**: `border-t-2 border-[#e5e7eb]`, `pt-[14px]`
  - **Total row**: "Total Resolution Value" (Bold 16px, `#111827`) | formatted total (Bold 16px, `#4fd1a8`)
  - NOTE: This is different from `ReturnShippingSummary` — has "Subtotal" row and "Total Resolution Value" label instead of "Total Refund Amount"
  - `data-testid="resolution-summary"`
  - `data-testid="resolution-summary-total"` on total amount

- [x] Create `OurPromiseNotice.tsx` — `hydrogen/app/components/account/OurPromiseNotice.tsx`
  - Teal-themed assurance notice (same color scheme as `ReturnTrackingNotice`)
  - No props (static content)
  - Container: `bg-[rgba(38,153,166,0.05)]`, `border border-[rgba(38,153,166,0.2)]`, `rounded-[12px]`, `p-[21px]`
  - Gap: `8px` between header and body
  - **Header**: "Our Promise" — SemiBold 14px, `#4fd1a8`, `pl-[8px]`
  - **Body**: "We're committed to making this right for you. All return shipping is free, and we'll keep you updated every step of the way."
    - Regular 14px, `#4b5563`, line-height 22.4px
  - `data-testid="our-promise-notice"`

### Phase 3: Route & Page Assembly

- [x] Create route `account.orders.$id_.return_.resolve.tsx` — `hydrogen/app/routes/account.orders.$id_.return_.resolve.tsx`
  - **Route naming**: trailing `_` on `$id` and `return` to opt out of parent layout nesting (same as Steps 2-3)
  - URL: `/account/orders/:id/return/resolve?items=...&reasons=...&shipping=...`
  - **Loader**:
    - Authenticate via `isCustomerLoggedIn` / `getCustomerAccessToken`
    - Read `items`, `reasons`, `shipping` search params from URL
    - If no items param, redirect back to Step 1 (`/account/orders/:id/return`)
    - Fetch order data via `customer(customerAccessToken)` query (same as Steps 1-3)
    - Filter line items to only those whose IDs are in the `items` param
    - If no valid items found, redirect back to Step 1
    - Calculate subtotal from selected items' prices
    - Determine shipping cost from `shipping` param (0 for drop-off/pickup, 4.99 for instant)
    - Calculate total resolution value (subtotal - shipping cost for instant, or subtotal for free methods)
    - Return: `orderId`, `orderName`, `lineItems` (filtered with images), `itemCount`, `subtotal`, `shippingPrice`, `shippingFree`, `totalValue`, `currencyCode`, `itemsParam`, `reasonsParam`, `shippingParam`
  - **Page layout** (max-w-[900px] centered):
    - Title: "Make It Right" — centered, Light 32px `#1f2937`
    - Subtitle: "How would you like us to resolve this?" — centered, Regular 16px `#4b5563`
    - `ReturnStepProgress` at `currentStep={4}` with stepUrls for all 4 steps
    - Main card:
      - Card header: "Choose Your Resolution"
      - `SelectedItemsPreview` (thumbnails + item count / total value)
      - 2×2 grid of `ResolutionOptionCard` (Exchange, Replace, Store Credit, Refund)
      - `ResolutionSummary` (inside the card body)
    - `OurPromiseNotice`
    - Inline action buttons (not sticky)
  - **Client-side state**:
    - `selectedResolution: 'exchange' | 'replace' | 'store-credit' | 'refund' | null` — default `null` (no pre-selection)
  - **Action buttons** (inline, not sticky, same pattern as Steps 2-3):
    - "Cancel": outlined button (~35% flex), navigates to Step 3 URL with all accumulated params
    - "Submit Return": `bg-return-accent` (~65% flex), disabled at 50% opacity until resolution selected
    - On submit: for now, show a `window.alert` confirmation with details (future: navigate to confirmation page or submit via API)
  - **SEO meta**: "Make It Right — {orderName}"

- [x] Update Step 3 route (`account.orders.$id_.return_.shipping.tsx`) — wire "Continue" button to navigate to Step 4:
  ```
  /account/orders/{id}/return/resolve?items={items}&reasons={reasons}&shipping={selectedMethod}
  ```
  Currently the Continue button's `onClick` is commented out — uncomment and point to the resolve route.

### Phase 4: Styling & CSS Isolation

- [x] All resolve-page styles use Tailwind utilities scoped to component elements — no global CSS
- [x] Verify `return-accent` token usage — no hardcoded `#4fd1a8` in resolve components
- [x] Resolution card selected state uses `rgba(38,153,166,0.05)` background (same teal tint pattern as Steps 2-3)
- [x] Summary section embedded inside card body (not standalone like Steps 2-3)
- [x] "Our Promise" notice uses `rgba(38,153,166,*)` colors (same teal scheme as Step 3's "Return Tracking" notice)
- [x] Verify no style leakage between resolve page and other account pages
- [x] Add `data-testid` attributes to all interactive elements:
  - `data-testid="resolution-option-{id}"` on each resolution card
  - `data-testid="selected-items-preview"` on thumbnails section
  - `data-testid="resolution-summary"` on summary box
  - `data-testid="resolution-summary-total"` on total value amount
  - `data-testid="our-promise-notice"` on promise notice
  - `data-testid="return-cancel-btn"` on Cancel button
  - `data-testid="return-submit-btn"` on Submit Return button

### Phase 5: Testing

#### Unit Tests

- [ ] `ResolutionOptionCard.test.tsx` — renders selected/unselected states, click handler fires, icon/title/description display, border/bg color changes
- [ ] `SelectedItemsPreview.test.tsx` — renders thumbnails with images, renders placeholder for missing images, displays item count and total value text
- [ ] `ResolutionSummary.test.tsx` — renders item count, subtotal, shipping free/paid, total resolution value, currency formatting
- [ ] `OurPromiseNotice.test.tsx` — renders header and body text

#### Automated E2E Tests (Playwright)

- [x] `return-resolve.spec.ts` — `hydrogen/tests/e2e/return-resolve.spec.ts`
  - **80 passed, 0 failed** (2026-03-28, Chromium)
  - Desktop (1440×900): 66 tests + Instant Shipping: 2 tests + Tablet (768×1024): 12 tests
  - Authenticated, serial execution
  - Covers MT-1 through MT-13 manual testing scenarios (except MT-8 visual fidelity)

#### Manual Testing Plan

> **Automated E2E test results**: `80 passed, 0 failed` (2026-03-28)
> Run: `npx playwright test tests/e2e/return-resolve.spec.ts --project=chromium` from `hydrogen/`
> Desktop (1440×900) + Instant Shipping + Tablet (768×1024) viewports covered.
> MT-8 (Visual Fidelity) requires manual pixel comparison against Figma.

##### MT-1: Page Load & Navigation

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 1.1 | Navigate from Step 3 | On Step 3, click "Continue" | Step 4 loads with title "Make It Right", subtitle "How would you like us to resolve this?" | :white_check_mark: | :white_check_mark: |
| 1.2 | URL has all params | Check browser URL after navigating | URL is `/account/orders/{id}/return/resolve?items=id1,id2&reasons=defective,wrong-item&shipping=drop-off` | :white_check_mark: | — |
| 1.3 | Direct URL access | Navigate directly to Step 4 URL with valid params | Page loads correctly with resolution options | :white_check_mark: | :white_check_mark: |
| 1.4 | Direct URL without items param | Navigate to Step 4 URL without `?items=` | Redirects back to Step 1 | :white_check_mark: | — |
| 1.5 | Direct URL with invalid items | Navigate with `?items=invalid-id` | Redirects back to Step 1 (no valid items found) | :white_check_mark: | — |
| 1.6 | Unauthenticated access | Log out → navigate to Step 4 URL | Redirects to login page | :white_check_mark: | — |
| 1.7 | Invalid order ID | Navigate to `/account/orders/invalid/return/resolve?items=x` | 404 error or redirect to orders | :white_check_mark: | — |

##### MT-2: Progress Steps

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 2.1 | Steps 1-3 completed state | Load Step 4 | Steps 1 "Select Items", 2 "Reason", and 3 "Ship" show green (`#2ac864`) circles with white checkmarks | :white_check_mark: | — |
| 2.2 | Step 4 active state | Load Step 4 | Step 4 "Make It Right" shows mint green (`#4fd1a8`) circle with white SmilePlus icon and teal shadow ring | :white_check_mark: | — |
| 2.3 | No pending steps | Load Step 4 | All 4 steps either completed or active — no gray/40% opacity steps | :white_check_mark: | — |
| 2.4 | Step labels | Load Step 4 | Labels "Select Items", "Reason", "Ship", "Make It Right" — 13px medium `#4b5563` | :white_check_mark: | :white_check_mark: |
| 2.5 | Connector lines | Load Step 4 | Gray 60px lines between all step circles | :white_check_mark: | — |
| 2.6 | Completed steps clickable | Click on Step 1 circle | Navigates back to Step 1 with all state params preserved in URL | :white_check_mark: | — |
| 2.7 | Step 3 clickable | Click on Step 3 circle | Navigates back to Step 3 with all state params preserved | :white_check_mark: | — |

##### MT-3: Card Header

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 3.1 | Card container | Load Step 4 | White card with `border-[#e5e7eb]`, `rounded-[12px]`, subtle shadow | :white_check_mark: | — |
| 3.2 | Header text | Load Step 4 | "Choose Your Resolution" — Bold 18px `#111827` | :white_check_mark: | — |
| 3.3 | No right text | Load Step 4 | Header has only the left title — no helper text on right | :white_check_mark: | — |
| 3.4 | Header border | Load Step 4 | Bottom border `border-[#e5e7eb]` separating header from body | :white_check_mark: | — |

##### MT-4: Selected Items Preview

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 4.1 | Thumbnails display | Load Step 4 with 2 items | Two `50×50px` rounded thumbnails displayed in a row | :white_check_mark: | :white_check_mark: |
| 4.2 | Thumbnail with image | Item with product image | Image rendered at 50×50px, `object-cover`, `rounded-[8px]` | :white_check_mark: | — |
| 4.3 | Thumbnail without image | Item without product image | Gray `#f3f4f6` background with placeholder icon (20px, `#9ca3af`) | :white_square_button: | — |
| 4.4 | Item summary text | Load with 2 items, $348.99 total | "2 items • Total value: $348.99" — Regular 14px `#4b5563` | :white_check_mark: | — |
| 4.5 | Single item | Load with 1 item | "1 items • Total value: $XX.XX" — count and price correct | :white_square_button: | — |
| 4.6 | Many items (5+) | Load with 5+ items | All thumbnails wrap to next line, gap `12px` between each | :white_square_button: | — |
| 4.7 | Thumbnail spacing | Inspect gap between thumbnails | `gap: 0px 12px` (no vertical gap, 12px horizontal) | :white_square_button: | — |

##### MT-5: Resolution Options — Default State

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 5.1 | Four options displayed | Load Step 4 | Four resolution cards in a 2×2 grid: Exchange, Replace, Store Credit, Refund | :white_check_mark: | :white_check_mark: |
| 5.2 | Grid layout | Load Step 4 | Two columns, two rows, `gap-[16px]`, each card same height (`171.5px`) | :white_check_mark: | — |
| 5.3 | No pre-selection | Load Step 4 | No card is pre-selected — all show gray borders `#e5e7eb` | :white_check_mark: | — |
| 5.4 | Exchange card | Inspect Exchange | ArrowLeftRight icon (28px, `#4b5563`) in `64×64px` gray circle, title "Exchange" SemiBold 16px, description "Swap for a different color, size, or variant" 13px | :white_check_mark: | — |
| 5.5 | Replace card | Inspect Replace | RefreshCw icon, title "Replace", desc "Get the exact same item sent again" | :white_check_mark: | — |
| 5.6 | Store Credit card | Inspect Store Credit | CreditCard icon, title "Store Credit", desc "Instant credit to your Hylee account" | :white_check_mark: | — |
| 5.7 | Refund card | Inspect Refund | Smile icon, title "Refund", desc "Money back to original payment method" | :white_check_mark: | — |
| 5.8 | Icon container styling | Inspect any card | `64×64px` circle, `bg-[#f3f4f6]`, centered horizontally, `top-[20px]` | :white_check_mark: | — |
| 5.9 | Title positioning | Inspect any card | Absolute, centered, `top-[96px]`, `left-[20px] right-[20px]` | :white_check_mark: | — |
| 5.10 | Description positioning | Inspect any card | Absolute, centered, `top-[128px]`, `left-[20px] right-[20px]` | :white_check_mark: | — |

##### MT-6: Resolution Option Selection

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 6.1 | Select Exchange | Click Exchange card | Exchange gets teal border (`#4fd1a8`), teal bg tint, shadow, icon color → `#4fd1a8` | :white_check_mark: | :white_check_mark: |
| 6.2 | Select Replace | Click Replace card | Replace selected, any prior selection deselected | :white_check_mark: | — |
| 6.3 | Select Store Credit | Click Store Credit card | Store Credit selected, others deselected | :white_check_mark: | — |
| 6.4 | Select Refund | Click Refund card | Refund selected, others deselected | :white_check_mark: | :white_check_mark: |
| 6.5 | Only one selected | Click through all 4 options | Only one card has selected state at any time (radio behavior) | :white_check_mark: | — |
| 6.6 | Switch selection | Select Exchange → then Refund | Exchange reverts to unselected, Refund becomes selected | :white_check_mark: | — |
| 6.7 | Card click anywhere | Click on icon area / title / description / empty space | All areas of the card trigger selection | :white_check_mark: | — |
| 6.8 | Submit enables on selection | Select any option | "Submit Return" button transitions from 50% opacity to full opacity | :white_check_mark: | — |

##### MT-7: Summary Section

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 7.1 | Summary container | Load Step 4 | `bg-[#f9fafb]`, `rounded-[12px]`, padding `28px top, 20px horizontal, 32px bottom` — INSIDE the main card | :white_check_mark: | — |
| 7.2 | Items being returned | Load Step 4 | "Items being returned" label + item count (Medium 14px, `#1f2937`) | :white_check_mark: | — |
| 7.3 | Subtotal | Load Step 4 | "Subtotal" label + formatted amount (Medium 14px, `#1f2937`) | :white_check_mark: | — |
| 7.4 | Return shipping — Free | Load with drop-off/pickup shipping | "Return shipping" + "Free" in Medium 14px `#2ac864` | :white_check_mark: | :white_check_mark: |
| 7.5 | Return shipping — Paid | Load with instant shipping | "Return shipping" + "$4.99" in Medium 14px `#4fd1a8` | :white_check_mark: | — |
| 7.6 | Divider | Load Step 4 | `border-t-2 border-[#e5e7eb]` with `pt-[14px]` above total | :white_check_mark: | — |
| 7.7 | Total resolution value — Free | Load with free shipping | "Total Resolution Value" (Bold 16px, `#111827`) + total (Bold 16px, `#4fd1a8`) | :white_check_mark: | — |
| 7.8 | Total resolution value — Paid | Load with instant shipping | Total = subtotal - $4.99 shipping fee | :white_check_mark: | — |
| 7.9 | Summary inside card | Load Step 4 | Summary section appears below resolution grid, above card bottom padding — NOT as a standalone element | :white_check_mark: | — |

##### MT-8: Visual Fidelity (Pixel Comparison) — MANUAL ONLY

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 8.1 | Overall layout | Compare with Figma screenshot | Content centered, 900px max-width, correct vertical spacing between all sections | :white_square_button: | :white_square_button: |
| 8.2 | Typography | Inspect all text elements | Correct font weights: Light (title), Regular (body/descriptions), Medium (labels/values), SemiBold (resolution titles/notice header), Bold (card title/total) | :white_square_button: | — |
| 8.3 | Color accuracy | Inspect colored elements | `#4fd1a8` for active step, selected card border/icon, notice header, total value; `#2ac864` for completed steps, "Free" shipping; `#4b5563` for unselected icons, descriptions; Correct grays throughout | :white_square_button: | — |
| 8.4 | Border radii | Inspect rounded elements | 12px on card, resolution cards, summary box, promise notice; 8px on thumbnails, action buttons; `rounded-full` on step circles, icon containers | :white_check_mark: | — |
| 8.5 | Selected card shadow | Select a resolution → inspect | `shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]` visible | :white_check_mark: | — |
| 8.6 | Resolution card dimensions | Inspect cards | Each card exactly `171.5px` height, equal width in 2-col grid | :white_check_mark: | — |
| 8.7 | Thumbnail dimensions | Inspect thumbnails | Each `50×50px` with `8px` border-radius | :white_square_button: | — |
| 8.8 | No style leakage | Navigate between Step 4 and other account pages | Other account pages unaffected; Step 4 unaffected by other styles | :white_square_button: | — |

##### MT-9: Our Promise Notice

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 9.1 | Notice container | Load Step 4 | `bg-[rgba(38,153,166,0.05)]`, `border border-[rgba(38,153,166,0.2)]`, `rounded-[12px]`, `p-[21px]` | :white_check_mark: | — |
| 9.2 | Header text | Load Step 4 | "Our Promise" — SemiBold 14px `#4fd1a8` | :white_check_mark: | — |
| 9.3 | Body text | Load Step 4 | Full promise text — Regular 14px `#4b5563`, line-height 22.4px | :white_check_mark: | — |
| 9.4 | Color matches Return Tracking | Compare with Step 3 notice | Same teal color scheme — identical background, border, header colors | :white_check_mark: | — |

##### MT-10: Action Buttons

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 10.1 | Button layout | Load Step 4 | "Cancel" (left, ~35% width) and "Submit Return" (right, ~65% width), inline (not sticky) | :white_check_mark: | :white_check_mark: |
| 10.2 | Cancel button style | Inspect Cancel | White bg, `border-[#d1d5db]`, `rounded-[8px]`, text Medium 15px `#374151` | :white_check_mark: | — |
| 10.3 | Submit button style | Inspect Submit | `bg-return-accent`, `rounded-[8px]`, text Medium 15px white | :white_check_mark: | — |
| 10.4 | Submit disabled initially | Load Step 4 | Submit button at 50% opacity, `cursor-not-allowed` (no resolution selected) | :white_check_mark: | — |
| 10.5 | Submit enables on selection | Select any resolution | Submit button becomes full opacity, clickable | :white_check_mark: | :white_check_mark: |
| 10.6 | Submit re-disabled | Select resolution → switch to none (if implemented) | Submit returns to disabled — N/A since radio can't be deselected, so always enabled once any selected | :white_check_mark: | — |
| 10.7 | Cancel click | Click Cancel | Navigates back to Step 3 with items/reasons/shipping params preserved | :white_check_mark: | — |
| 10.8 | Submit click | Select resolution → Click Submit | Shows confirmation (alert or placeholder for now) | :white_check_mark: | — |
| 10.9 | Buttons not sticky | Scroll page | Buttons scroll with content (not fixed to bottom) | :white_check_mark: | — |

##### MT-11: State Preservation

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 11.1 | Items from URL | Load Step 4 via proper flow | Thumbnails show correct items from `items` param | :white_check_mark: | — |
| 11.2 | Shipping method from URL | Load with `?shipping=instant` | Summary shows "$4.99" for Return shipping, total adjusted | :white_check_mark: | — |
| 11.3 | Shipping method free | Load with `?shipping=drop-off` | Summary shows "Free" for Return shipping | :white_check_mark: | — |
| 11.4 | Navigate back to Step 3 | Click Cancel | Step 3 loads with correct items, reasons, and shipping params in URL | :white_check_mark: | — |
| 11.5 | Navigate back to Step 1 | Click Step 1 in progress bar | Step 1 loads with correct items param | :white_square_button: | — |
| 11.6 | Full round trip | Go Step 1 → 2 → 3 → 4 → back to 3 → back to 4 | All state (items, reasons, shipping) preserved through navigation | :white_square_button: | — |

##### MT-12: Edge Cases

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 12.1 | Single item | Navigate with 1 item | Thumbnail shows 1 image, summary text "1 items • Total value: $XX.XX", summary "Items being returned: 1" | :white_square_button: | — |
| 12.2 | Many items (5+) | Navigate with 5+ items | All thumbnails wrap, counts are accurate | :white_square_button: | — |
| 12.3 | Page refresh | Select Refund → refresh | Resolution resets to none (no pre-selection), URL params preserved, page reloads correctly | :white_check_mark: | — |
| 12.4 | Currency formatting | Items with various prices | All prices formatted as `$X.XX`, summary totals add correctly | :white_check_mark: | — |
| 12.5 | Sidebar hidden | Load Step 4 | Account sidebar is NOT shown (return routes excluded via `NO_SIDEBAR_PATTERNS`) | :white_check_mark: | — |
| 12.6 | Long description wrapping | Resolution card descriptions | Text wraps within `left-[20px] right-[20px]` bounds without overflow | :white_square_button: | — |
| 12.7 | Browser back button | Press browser back from Step 4 | Returns to Step 3 with previous state | :white_check_mark: | — |

##### MT-13: Responsive Behavior

| # | Scenario | Steps | Expected Result | Desktop | Tablet |
|---|----------|-------|-----------------|---------|--------|
| 13.1 | Tablet viewport (768px) | Resize to 768px width | Resolution grid remains 2×2, content fills available width with 24px padding | :white_square_button: | :white_check_mark: |
| 13.2 | Small tablet (640px) | Resize to 640px width | Resolution grid still 2×2, cards slightly narrower | — | :white_square_button: |
| 13.3 | Thumbnail wrap | Narrow viewport with 5+ items | Thumbnails wrap to multiple rows | — | :white_square_button: |
| 13.4 | Action buttons | Tablet viewport | Buttons maintain ~35/65 split, don't overflow | — | :white_check_mark: |

### Phase 6: Documentation

- [x] Update `hydrogen/design-references/return-process/step4-resolve-figma-spec.md` with any implementation deviations
- [x] Update `plans/RETURN_PROCESS_PLAN.md` to note Step 3 → Step 4 wiring and Step 4 completion
- [x] Add Step 4 route to `docs/ACTIVE_CONTEXT.md`
- [x] Update `hydrogen/CLAUDE.md` Active Design References table with Step 4 entry

### Phase 7: Polish Pass

- [x] Re-fetch Figma screenshot and visually compare against running implementation at 1440px viewport
- [x] Walk through each element in the Figma design context output and verify:
  - All borders present (color, width, radius) ✅
  - All backgrounds correct (right token, right opacity) ✅
  - Children in correct order with correct spacing ✅
  - Icon sizes matching (28px for resolution icons, 20px for placeholders) ✅
  - Typography: font weights, sizes, colors, line-heights ✅
- [x] Verify selected state looks polished (smooth transition, correct shadow, color shift on icon)
- [x] Test full flow: Step 1 → 2 → 3 → 4 → Submit confirmation (verified via E2E — 80/80 passing)
- [x] Fix any pixel-drift or styling gaps found during comparison — none found, implementation matches Figma

---

## Component Reuse from Steps 1-3

| Component | Reuse? | Notes |
|-----------|--------|-------|
| `ReturnStepProgress` | Yes | Pass `currentStep={4}` |
| `ReturnItemCard` | No | Items shown as thumbnails, not full cards |
| `ReturnReasonItemCard` | No | Not applicable |
| `ReturnSelectionSummary` | No | Different layout (thumbnails + grid) |
| `RefundSummary` | No | Step 4 has different rows and "Total Resolution Value" label |
| `ReturnShippingSummary` | No | Different: adds "Subtotal" row, different total label |
| `ReturnPolicyNotice` | No | Replaced by `OurPromiseNotice` (teal, not amber) |
| `ReturnTrackingNotice` | No | Different title/body text; same color scheme — could parameterize but simpler to keep separate |
| `ReturnActionBar` | No | Step 4 uses inline buttons (not sticky) |
| `ReturnLineItem` type | Yes | Reuse the type for loader data |
| `ShippingOptionCard` | No | Resolution cards have different layout (centered, absolute positioning) |

## Notes

### State Flow Between All Steps

```
Step 1 → Step 2:  ?items=id1,id2,id3
Step 2 → Step 3:  ?items=id1,id2,id3&reasons=defective,wrong-item,changed-mind
Step 3 → Step 4:  ?items=id1,id2,id3&reasons=defective,wrong-item,changed-mind&shipping=drop-off
Step 4 → Submit:  resolution=refund (client-side only, used in submit action)
```

### Resolution Options Data

The four resolution options are static/hardcoded:

```ts
const RESOLUTION_OPTIONS = [
  {
    id: 'exchange',
    icon: ArrowLeftRight,
    title: 'Exchange',
    description: 'Swap for a different color, size, or variant',
  },
  {
    id: 'replace',
    icon: RefreshCw,
    title: 'Replace',
    description: 'Get the exact same item sent again',
  },
  {
    id: 'store-credit',
    icon: CreditCard,
    title: 'Store Credit',
    description: 'Instant credit to your Hylee account',
  },
  {
    id: 'refund',
    icon: Smile,
    title: 'Refund',
    description: 'Money back to original payment method',
  },
];
```

### Shipping Cost Mapping

The shipping param from Step 3 maps to costs:
- `drop-off` → $0 (Free)
- `pickup` → $0 (Free)
- `instant` → $4.99

This is used in the loader to calculate the total resolution value and determine the "Free" / "$4.99" display.

### Submit Behavior (Placeholder)

For this initial implementation, the Submit button will:
1. Show a `window.alert()` with the return summary (resolution, items, shipping method)
2. Future work: submit return request via Shopify API, navigate to a confirmation page

### Responsive Considerations

- Resolution grid (2×2): stays 2-col on desktop/tablet. Consider `grid-cols-1` on very small mobile (<480px)
- Item thumbnails (50px): flex-wrap handles multi-row naturally
- Summary section: full-width inside the card, stacks well
- Action buttons: Cancel/Continue follow Steps 2-3's ~35%/~65% flex split
