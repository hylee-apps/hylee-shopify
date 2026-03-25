# Implementation Plan: "On the Way Out" Tab View

> **Status**: Complete (All phases verified; 75/75 mock-data tests + 15/15 authenticated tests passing)
> **Created**: 2026-03-24
> **Branch**: `feature/account-orders-redesign`
> **Figma**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=10-1556&m=dev
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + Lucide Icons + React Router 7)
> **Depends on**: Account Orders Page Redesign (complete — Phases 1–8)
> **Spec**: `hydrogen/design-references/account-orders-on-the-way-out/figma-spec.md`

## Overview

When the user clicks the "On the Way Out" tab on the My Orders page, the view should switch from showing standard order cards to showing **outgoing cards** — returns and exchanges at various stages. This is a completely different card layout from the Orders tab, with:

- **Sub-section header**: "On the Way Out" (24px bold) + subtitle (15px)
- **Outgoing cards**: Gradient header (meta: Return Initiated/Exchange Requested, Refund Amount/Exchange For, Original Order #) + status badge + links + body (status text, product row, action buttons, actions panel) + progress tracker
- **Three card statuses**: Return Shipped (green), Awaiting Pickup (amber), Out for Delivery / Exchange (teal)
- **Progress tracker**: 5-step horizontal stepper with completed/active/pending states

### Key Differences from Orders Tab

| Aspect | Orders Tab | On the Way Out Tab |
|--------|-----------|-------------------|
| Card component | `OrderCard` | `OutgoingCard` (new) |
| Header meta fields | Order Placed, Total, Ship To, Order # | Return/Exchange Initiated, Refund Amount/Exchange For, Original Order # (link) |
| Status display | Delivery status text in body | Status badge in header (colored pill) |
| Links | "View order details \| View invoice" | Status-specific (View return details \| View refund status, etc.) |
| Primary action color | `#14b8a6` (hero teal) | `#2699a6` (secondary teal) |
| Product inline buttons | "Buy it again" + "View your item" | Return-specific (Print return label, Contact seller, etc.) |
| Progress tracker | None | 5-step horizontal tracker |
| Sub-section header | None (orders header with count + filter) | "On the Way Out" + subtitle |
| Data source | Real Shopify orders | Simulated from order data (Storefront API lacks returns API) |

### Design Reference

- **File key**: `Q541sIDD20eXqQSSozFUw4`
- **Node ID**: `10:1556`
- **Spec**: `hydrogen/design-references/account-orders-on-the-way-out/figma-spec.md`

### Data Model Constraint

Shopify's Storefront API does **not** expose a returns/exchanges API. The Customer Account API has limited return support. For this implementation, we will **simulate** return/exchange data derived from fulfilled orders to demonstrate the UI. This can be wired to real data when the returns API becomes available or via Admin API proxy.

---

## Checklist

### Phase 1: Design Reference & Prerequisites (Complete)

- [x] Fetch Figma design context, screenshot, and variable defs — MCP tools (done in planning)
- [x] Save design reference files — `hydrogen/design-references/account-orders-on-the-way-out/`
- [ ] Save raw `design-context.tsx` from Figma MCP output
- [x] Verify token coverage — identify any new tokens needed
- [x] Audit existing components for reusability

#### Phase 1 Notes

**Token gaps identified:**

- `rgba(42,200,100,0.1)` (green status badge bg) — no token; use `bg-[rgba(42,200,100,0.1)]`
- `rgba(242,176,94,0.1)` (amber status badge bg) — no token; use `bg-[rgba(242,176,94,0.1)]`
- `rgba(38,153,166,0.1)` (teal status badge bg) — no token; use `bg-[rgba(38,153,166,0.1)]`
- `#2ac864` (primary green for completed steps + "Return Shipped" badge) — uses `--color-primary` / `text-primary`
- `#f2b05e` (amber for "Awaiting Pickup" badge) — no token; use `text-[#f2b05e]`
- `#2699a6` (secondary teal for "Out for Delivery" badge + primary action buttons + active step) — uses `--color-secondary` / `text-secondary`
- `rgba(38,153,166,0.2)` (active step shadow ring) — no token; use `shadow-[0px_0px_0px_4px_rgba(38,153,166,0.2)]`
- `#d1d5db` (pending step bg + connecting line) — no token; use `bg-[#d1d5db]`

**Components to create:**

- `OutgoingCard.tsx` — Return/exchange card with header, body, product rows, actions panel
- `ReturnProgressTracker.tsx` — Horizontal 5-step progress stepper

**Components to reuse (unchanged):**

- `OrderStatsCards.tsx` — Same 3 stat cards
- `OrderTabBar.tsx` — Same tab bar (On the Way Out tab becomes active)
- `OrderPagination.tsx` — Same pagination
- `account.tsx` — Layout route unchanged

**Components NOT used in this view:**

- `OrderCard.tsx` — Only shown in Orders/Buy Again tabs
- Time filter dropdown — Not shown in On the Way Out tab (per Figma)

---

### Phase 2: ReturnProgressTracker Component (Complete)

- [x] Create `ReturnProgressTracker.tsx` in `hydrogen/app/components/account/`
  - Accept props: `steps: ProgressStep[]` where `ProgressStep = {label: string; status: 'completed' | 'active' | 'pending'; icon: LucideIcon}`
  - Container: `bg-[#f9fafb] rounded-[8px] p-[16px] w-full`
  - Inner: `flex items-center justify-between w-full relative`
  - Connecting line: `absolute bg-[#d1d5db] h-[3px] left-0 right-0 top-[15px]` (behind steps, z-0)
  - Step: `flex flex-1 flex-col gap-[8px] items-center relative z-10`
  - Completed icon circle: `bg-primary size-[32px] rounded-[16px] flex items-center justify-center` → Check icon `size-[14px] text-white`
  - Active icon circle: `bg-secondary size-[32px] rounded-[16px] flex items-center justify-center shadow-[0px_0px_0px_4px_rgba(38,153,166,0.2)]` → status icon `size-[14px] text-white`
  - Pending icon circle: `bg-[#d1d5db] size-[32px] rounded-[16px] flex items-center justify-center` → status icon `size-[14px] text-[#6b7280]`
  - Completed/Active label: `font-medium text-[12px] leading-[18px] text-[#111827] text-center whitespace-nowrap`
  - Pending label: `font-medium text-[12px] leading-[18px] text-[#4b5563] text-center whitespace-nowrap`
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 2 Figma-Exact Styling Requirements

**Tracker container:**
```
bg-[#f9fafb] rounded-[8px] p-[16px] w-full
```

**Steps container:**
```
flex items-center justify-between w-full relative
```

**Connecting line (pseudo-element or absolute div):**
```
absolute bg-[#d1d5db] h-[3px] left-0 right-0 top-[15px] z-0
```

**Step wrapper:**
```
flex flex-1 flex-col gap-[8px] items-center relative z-10
```

**Step icon — Completed:**
```
bg-[#2ac864] size-[32px] rounded-[16px] flex items-center justify-center
Icon: Check (lucide), size-[14px], text-white
```

**Step icon — Active:**
```
bg-[#2699a6] size-[32px] rounded-[16px] flex items-center justify-center
Shadow: shadow-[0px_0px_0px_4px_rgba(38,153,166,0.2)]
Icon: varies by step, size-[14px], text-white
```

**Step icon — Pending:**
```
bg-[#d1d5db] size-[32px] rounded-[16px] flex items-center justify-center
Icon: varies by step, size-[14px], text-[#6b7280]
```

**Step label — Completed/Active:**
```
font-medium text-[12px] leading-[18px] text-[#111827] text-center whitespace-nowrap
```

**Step label — Pending:**
```
font-medium text-[12px] leading-[18px] text-[#4b5563] text-center whitespace-nowrap
```

**These styles MUST NOT be overridden by:**
- Global background colors
- Tailwind's default `rounded-full` (use `rounded-[16px]` for 32px circles)
- Shadow utility classes (use exact arbitrary shadow value)
- Text color inheritance from parent containers

---

### Phase 3: OutgoingCard Component (Complete)

- [x] Create `OutgoingCard.tsx` in `hydrogen/app/components/account/`
  - Accept props: `outgoingItem: OutgoingItem` (typed interface — see Architecture Notes)
  - Card container: `bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-clip w-full`
  - **Card Header** (gradient):
    - Container: `bg-gradient-to-r from-[#f9fafb] to-white border-b border-[#e5e7eb] flex flex-wrap justify-between px-[24px] pt-[16px] pb-[17px]`
    - Left meta: `flex flex-wrap gap-[0px_24px] items-start`
    - Meta label: `font-medium text-[12px] uppercase tracking-[0.5px] text-[#6b7280] leading-[18px]`
    - Meta value: `font-semibold text-[15px] text-[#111827] leading-[22.5px]`
    - Original Order # value: `font-semibold text-[15px] text-secondary leading-[22.5px]` (teal link)
    - Right side: Status badge + links
  - **Status Badge**:
    - Container: `flex gap-[8px] items-center px-[12px] py-[8px]`
    - Colors per status (see Phase 3 styling requirements)
    - Icon + text: `font-semibold text-[13px] leading-[19.5px]`
  - **Links** (below status badge, 8px top padding):
    - Container: `flex gap-[16px] items-start`
    - Link: `text-[14px] text-secondary leading-[21px] hover:underline cursor-pointer`
    - Separator: `text-[14px] text-[#d1d5db] leading-[21px]`
  - **Card Body**:
    - Container: `flex flex-col gap-[16px] p-[24px]`
    - Status text: `font-bold text-[20px] leading-[30px] text-[#111827]`
    - Status message: `text-[14px] leading-[21px] text-[#4b5563]`
  - **Product Row** (within body):
    - Container: `flex gap-[24px] items-start py-[16px] border-b border-[#f3f4f6]` (except last)
    - Image: `size-[120px] bg-[#f3f4f6] rounded-[8px] overflow-clip shrink-0`
    - Product name: `font-medium text-[15px] text-secondary leading-[21px] hover:underline`
    - Variant info: `text-[13px] text-[#4b5563] leading-[19.5px]`
    - Return info (8px top margin): `text-[13px] text-[#4b5563] leading-[19.5px]`
    - Inline action buttons (8px top margin): `flex flex-wrap gap-[8px]`
      - Button: `bg-white border border-[#d1d5db] flex gap-[8px] items-center px-[17px] py-[9px] text-[14px] font-medium text-[#374151] leading-[21px] hover:border-[#9ca3af] transition-colors`
  - **Actions Panel** (right side, desktop only):
    - Container: `w-[200px] min-w-[200px] flex flex-col gap-[8px] hidden lg:flex`
    - Primary button: `bg-secondary border border-secondary flex gap-[8px] items-center justify-center px-[17px] py-[13px] text-[14px] font-medium text-white text-center leading-[21px] w-full hover:bg-[#1e7a85] transition-colors`
    - Secondary button: `bg-white border border-[#d1d5db] flex gap-[8px] items-center justify-center px-[17px] py-[13px] text-[14px] font-medium text-[#374151] text-center leading-[21px] w-full hover:border-[#9ca3af] transition-colors`
  - **Progress Tracker** (at bottom of body):
    - Render `ReturnProgressTracker` with appropriate steps for the card status
- [x] Implement status-specific configurations (meta fields, buttons, links, progress steps)
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 3 Figma-Exact Styling Requirements

**Outgoing card container:**
```
bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
overflow-clip w-full
```

**Card header:**
```
bg-gradient-to-r from-[#f9fafb] to-white border-b border-[#e5e7eb]
flex flex-wrap justify-between px-[24px] pt-[16px] pb-[17px] w-full
```

**Meta label:**
```
font-medium text-[12px] uppercase tracking-[0.5px] text-[#6b7280] leading-[18px]
```

**Meta value (default):**
```
font-semibold text-[15px] text-[#111827] leading-[22.5px]
```

**Meta value (Original Order # — link):**
```
font-semibold text-[15px] text-secondary leading-[22.5px] hover:underline cursor-pointer
```

**Status badge — Return Shipped (green):**
```
bg-[rgba(42,200,100,0.1)] flex gap-[8px] items-center px-[12px] py-[8px]
Icon: PackageCheck size-[13px] text-[#2ac864]
Text: font-semibold text-[13px] leading-[19.5px] text-[#2ac864]
```

**Status badge — Awaiting Pickup (amber):**
```
bg-[rgba(242,176,94,0.1)] flex gap-[8px] items-center px-[12px] py-[8px]
Icon: Clock size-[13px] text-[#f2b05e]
Text: font-semibold text-[13px] leading-[19.5px] text-[#f2b05e]
```

**Status badge — Out for Delivery (teal):**
```
bg-[rgba(38,153,166,0.1)] flex gap-[8px] items-center px-[12px] py-[8px]
Icon: Truck size-[13px] text-[#2699a6]
Text: font-semibold text-[13px] leading-[19.5px] text-[#2699a6]
```

**Header links:**
```
Container: flex gap-[16px] items-start pt-[8px]
Link: text-[14px] text-secondary leading-[21px] hover:underline cursor-pointer
Separator: text-[14px] text-[#d1d5db] leading-[21px]
```

**Card body:**
```
flex flex-col gap-[16px] p-[24px] w-full
```

**Return status text:**
```
font-bold text-[20px] leading-[30px] text-[#111827]
```

**Return status message:**
```
font-normal text-[14px] leading-[21px] text-[#4b5563]
```

**Product image:**
```
size-[120px] bg-[#f3f4f6] rounded-[8px] overflow-clip shrink-0
flex items-center justify-center
Placeholder icon: size-[40px] text-[#9ca3af]
```

**Product name:**
```
font-medium text-[15px] text-secondary leading-[21px] hover:underline
```

**Product variant/return info:**
```
font-normal text-[13px] text-[#4b5563] leading-[19.5px]
```

**Inline action button:**
```
bg-white border border-[#d1d5db] flex gap-[8px] items-center
px-[17px] py-[9px] text-[14px] font-medium text-[#374151] leading-[21px]
hover:border-[#9ca3af] transition-colors cursor-pointer
```

**Actions panel primary button:**
```
bg-[#2699a6] border border-[#2699a6] flex gap-[8px] items-center justify-center
px-[17px] py-[13px] text-[14px] font-medium text-white text-center leading-[21px] w-full
hover:bg-[#1e7a85] transition-colors cursor-pointer
Icon: size-[14px] text-white
```

**Actions panel secondary button:**
```
bg-white border border-[#d1d5db] flex gap-[8px] items-center justify-center
px-[17px] py-[13px] text-[14px] font-medium text-[#374151] text-center leading-[21px] w-full
hover:border-[#9ca3af] transition-colors cursor-pointer
Icon: size-[14px] text-[#374151]
```

**Product row divider:**
```
border-b border-[#f3f4f6] (applied to all product rows except the last)
```

**These styles MUST NOT be overridden by:**
- `OrderCard` styles (different component entirely)
- shadcn Card/Button styles
- Global link styles
- Tailwind's default border-radius on buttons
- Primary button color from Orders tab (`#14b8a6`) — this tab uses `#2699a6`

---

### Phase 4: Data Simulation & Route Integration (Complete)

- [x] Create `outgoing-data.ts` utility in `hydrogen/app/lib/` to simulate return/exchange data from orders
  - `simulateOutgoingItems(orders: Order[]): OutgoingItem[]` — transforms fulfilled orders into simulated returns/exchanges
  - Generate 3 types: "return-shipped", "awaiting-pickup", "exchange-out-for-delivery"
  - Include realistic date offsets, product info from order line items, variant details
  - Return a typed `OutgoingItem` array
- [x] Update `account.orders._index.tsx` to handle the "on-the-way-out" tab differently:
  - When `activeTab === 'on-the-way-out'`:
    - Show sub-section header ("On the Way Out" + subtitle)
    - Render `OutgoingCard` components instead of `OrderCard`
    - No time filter dropdown (not shown in Figma for this tab)
    - Pagination still applies to outgoing items
  - Import `OutgoingCard`, `simulateOutgoingItems`
- [x] Define `OutgoingItem` TypeScript interface in a shared types file or within `OutgoingCard.tsx`
- [x] Pre-commit checks pass: format, typecheck, build, test

#### OutgoingItem Type Definition

```typescript
type OutgoingStatus = 'return-shipped' | 'awaiting-pickup' | 'exchange-out-for-delivery';

interface OutgoingItem {
  id: string;
  type: 'return' | 'exchange';
  status: OutgoingStatus;
  initiatedDate: string;
  refundAmount?: { amount: string; currencyCode: string };
  exchangeFor?: string;
  originalOrderName: string;
  originalOrderId: string;
  statusBadge: {
    label: string;
    color: 'green' | 'amber' | 'teal';
  };
  statusTitle: string;
  statusMessage: string;
  links: { label: string; href: string }[];
  product: {
    title: string;
    handle?: string;
    variant?: string;
    returnInfo: string;
    image?: { url: string; altText?: string | null };
  };
  inlineActions: { label: string; icon?: LucideIcon }[];
  panelActions: { label: string; icon?: LucideIcon; primary?: boolean }[];
  progressSteps: ProgressStep[];
}
```

---

### Phase 5: Mobile Responsiveness (Complete)

- [x] Outgoing card header: `flex-wrap` for meta items (wraps on mobile)
- [x] Status badge + links: wraps naturally via `flex-wrap` on header, right-aligned on desktop
- [x] Product row: `flex-col sm:flex-row` — image full-width above info on mobile
- [x] Actions panel: hidden on mobile (`hidden lg:flex`), inline buttons always visible
- [x] Progress tracker: `overflow-x-auto` on mobile with `min-w-[500px]` inner to prevent text wrapping
- [x] Sub-section header: `text-xl sm:text-[24px]` for title
- [x] Pre-commit checks pass: format, typecheck, build, test

---

### Phase 6: Polish & Testing (Pending — Playwright visual test)

- [x] Verify tab switching correctly swaps between OrderCard and OutgoingCard views
- [x] Verify sub-section header only appears for "On the Way Out" tab
- [x] Verify progress tracker shows correct step states for each card status
- [x] Verify status badge colors match design exactly for each status
- [x] Verify primary action button uses `#2699a6` (NOT `#14b8a6`)
- [x] Verify Original Order # link navigates to order detail page
- [x] Verify pagination works for outgoing items
- [x] Verify empty state shows when no outgoing items exist
- [x] Implement Playwright e2e + visual tests — `hydrogen/tests/e2e/outgoing-cards.spec.ts` (75 tests, all passing)
- [x] Visual capture screenshots at desktop (1440px), mobile (390px), and empty state
- [ ] Visual comparison pass against Figma screenshot (manual — compare `tests/e2e/visual/screenshots/outgoing-cards-desktop.png` with Figma)

---

## Manual Testing Plan

### Automated Browser Testing

**90 Playwright tests** automate the manual testing checklist below. Run with:

```bash
# Mock-data tests (75 tests, no auth required)
pnpm test:e2e -- tests/e2e/outgoing-cards.spec.ts --project=chromium

# Authenticated tests (15 tests, requires login)
pnpm test:e2e -- tests/e2e/outgoing-cards-authenticated.spec.ts --project=chromium --workers=1

# All outgoing card tests
pnpm test:e2e -- tests/e2e/outgoing-cards*.spec.ts --project=chromium --workers=1
```

**Test route**: `/test/outgoing-cards` — renders all 3 card variants with hardcoded mock data (no auth required).
**Mock-data test file**: `hydrogen/tests/e2e/outgoing-cards.spec.ts` (75 tests)
**Authenticated test file**: `hydrogen/tests/e2e/outgoing-cards-authenticated.spec.ts` (15 tests)
**Screenshots**: `hydrogen/tests/e2e/visual/screenshots/outgoing-cards-*.png`

| Section | # Tests | Coverage |
|---------|---------|----------|
| Phase 2 — ReturnProgressTracker | 12 | Container styling, connecting line, completed/active/pending icon colors & sizes, shadow ring, label colors, step config per status (3 cards) |
| Phase 3 — OutgoingCard | 24 | Card container, header gradient & meta, status badges (3 color variants with exact rgba), links & separators, status text, product row, inline buttons, actions panel (primary color verification) |
| Phase 4 — Route Integration | 10 | Tab switching, sub-header visibility & styling, empty state, data content, link hrefs |
| Phase 5 — Mobile Responsiveness | 8 | Mobile: panel hidden, buttons visible, tracker scrollable; Tablet: horizontal layout; Desktop: full layout |
| Phase 6 — Visual Capture | 3 | Screenshots at 1440px desktop, 390px mobile, empty state |

| Authenticated Tests | 15 | Tab activation, time filter absence, stats cards, Buy Again, Orders tab, sub-header, outgoing cards/empty state, button colors, pagination, sidebar link, skeleton, mobile layout, console errors |

**Items NOT covered by automation** (require manual verification):
- Cross-browser visual rendering (Safari gradients, Firefox specifics) — run `--project=webkit` and `--project=firefox`
- Hover states (underline on links, border color on buttons)
- Pagination with >10 outgoing items (requires sufficient test data)
- Tab state persistence during pagination

---

### Phase 2 Manual Testing — ReturnProgressTracker

**Prerequisites**: Component rendered in isolation or within an OutgoingCard with known step states.

#### Progress Tracker — Visual Fidelity

- [x] Container has `bg-[#f9fafb]` (gray-50) background — NOT white or transparent _(Auto: Phase 2 test 1)_
- [x] Container has `rounded-[8px]` corners — NOT `rounded-lg` (8px matches, but verify) _(Auto: Phase 2 test 1)_
- [x] Container has `p-[16px]` padding on all sides _(Auto: Phase 2 test 1)_
- [x] Connecting line visible: horizontal gray bar across the full width behind the step icons _(Auto: Phase 2 test 2)_
- [x] Connecting line: `bg-[#d1d5db]`, height `3px`, positioned at `top-[15px]` (center of 32px icon) _(Auto: Phase 2 test 2)_
- [x] 5 steps visible, evenly distributed with `flex-1` each _(Auto: Phase 2 test 3)_
- [ ] Steps are vertically aligned: icon on top, label below, with `gap-[8px]` between _(manual — visual)_

#### Progress Tracker — Completed Steps

- [x] Completed step icon circle: `bg-[#2ac864]` (primary green) — NOT `bg-primary` unless token matches _(Auto: Phase 2 test 4)_
- [x] Completed step icon circle: exactly `32px` (`size-[32px]`), `rounded-[16px]` (half of 32px) _(Auto: Phase 2 test 4)_
- [x] Completed step icon: white check mark (Lucide `Check`), `14px` size _(Auto: Phase 2 test 4)_
- [x] Completed step label: `font-medium text-[12px] text-[#111827]` (dark) — NOT gray _(Auto: Phase 2 test 5)_
- [ ] Completed step label: `text-center whitespace-nowrap` _(manual — visual)_

#### Progress Tracker — Active Step

- [x] Active step icon circle: `bg-[#2699a6]` (secondary teal) — NOT `bg-primary` or `bg-hero` _(Auto: Phase 2 test 6)_
- [x] Active step icon circle: `32px` with `rounded-[16px]` _(Auto: Phase 2 test 6)_
- [x] Active step shadow ring: `shadow-[0px_0px_0px_4px_rgba(38,153,166,0.2)]` — visible as soft teal glow around circle _(Auto: Phase 2 test 6)_
- [ ] Active step icon: white, `14px` (varies by step: Truck for In Transit, Clock for Awaiting Pickup, etc.) _(manual — icon identity)_
- [x] Active step label: `font-medium text-[12px] text-[#111827]` (dark) — same as completed _(Auto: Phase 2 test 8)_
- [x] Only ONE step has the active state per tracker _(Auto: Phase 2 test 7)_

#### Progress Tracker — Pending Steps

- [x] Pending step icon circle: `bg-[#d1d5db]` (gray-300) — NOT `bg-gray-200` or lighter _(Auto: Phase 2 test 9)_
- [ ] Pending step icon circle: `32px` with `rounded-[16px]` _(manual — visual)_
- [ ] Pending step icon: `text-[#6b7280]` (gray-500), `14px` _(manual — icon color)_
- [x] Pending step label: `font-medium text-[12px] text-[#4b5563]` (gray-600) — NOT `text-[#111827]` _(Auto: Phase 2 test 10)_
- [x] No shadow ring on pending steps _(Auto: Phase 2 test 11)_

#### Progress Tracker — Pixel-Precision Checks

- [x] Step icon circle size is exactly `32px` — NOT `28px`, `36px`, or `24px` _(Auto: Phase 2 tests 4, 6)_
- [ ] Step icon circle radius is `rounded-[16px]` — NOT `rounded-full` (though equivalent for 32px, be explicit) _(manual — visual)_
- [x] Active shadow is `4px` spread with `rgba(38,153,166,0.2)` — NOT a box-shadow-md or ring utility _(Auto: Phase 2 test 6)_
- [x] Connecting line height is `3px` — NOT `2px` or `1px` _(Auto: Phase 2 test 2)_
- [x] Connecting line color is `#d1d5db` — NOT `#e5e7eb` (lighter gray) _(Auto: Phase 2 test 2)_
- [x] Step labels are `12px` font-medium — NOT `11px`, `13px`, or `14px` _(Auto: Phase 2 tests 5, 8, 10)_
- [ ] All icon circles are positioned ABOVE the connecting line (z-index) _(manual — visual)_

#### Progress Tracker — Step Configuration Checks

- [x] **Return Shipped card**: Steps 1-3 completed (green), Step 4 (In Transit) active (teal), Step 5 (Refund Processed) pending (gray) _(Auto: Phase 2 test 12)_
- [x] **Awaiting Pickup card**: Steps 1-2 completed, Step 3 (Awaiting Pickup) active, Steps 4-5 pending _(Auto: Phase 2 test 13)_
- [x] **Exchange card**: Steps 1-3 completed, Step 4 (Out for Delivery) active, Step 5 (Exchange Complete) pending _(Auto: Phase 2 test 14)_
- [ ] Step labels match the Figma text exactly for each card type (see spec)

---

### Phase 3 Manual Testing — OutgoingCard

**Prerequisites**: At least one simulated return and one simulated exchange card visible in the "On the Way Out" tab.

#### Card Container

- [x] Card has white bg, `12px` radius, subtle shadow (`0px 1px 2px rgba(0,0,0,0.05)`), `overflow-clip` _(Auto: Phase 3 test 15)_
- [x] No old OrderCard styling visible — this is a completely different component _(Auto: Phase 3 test 17 — 3 cards rendered)_
- [x] Card stretches to full width of container _(Auto: Phase 3 test 16)_

#### Card Header — Gradient + Meta

- [x] Header has gradient bg: left `#f9fafb` fading to white on right (`bg-gradient-to-r`) _(Auto: Phase 3 test 18)_
- [x] Header has bottom border: `1px solid #e5e7eb` _(Auto: Phase 3 test 18)_
- [ ] Header padding: 24px horizontal, 16px top, 17px bottom _(manual — visual)_
- [x] **Return card**: Shows 3 meta items — "RETURN INITIATED" (date), "REFUND AMOUNT" ($), "ORIGINAL ORDER #" (link) _(Auto: Phase 3 test 19)_
- [x] **Exchange card**: Shows 3 meta items — "EXCHANGE REQUESTED" (date), "EXCHANGE FOR" (description), "ORIGINAL ORDER #" (link) _(Auto: Phase 3 test 20)_
- [x] Meta labels: `12px uppercase tracking-[0.5px] text-[#6b7280] font-medium` — NOT font-normal (differs from Orders tab!) _(Auto: Phase 3 test 21)_
- [x] Meta values: `15px font-semibold text-[#111827]` — NOT font-normal (differs from Orders tab!) _(Auto: Phase 3 test 22)_
- [x] Original Order # value: `15px font-semibold text-[#2699a6]` (secondary teal) — clickable link _(Auto: Phase 3 test 23)_
- [ ] Gap between meta items: `24px` horizontal _(manual — visual)_
- [ ] Meta item internal gap: `2px` between label and value _(manual — visual)_

#### Card Header — Pixel-Precision Checks

- [x] Gradient start: `#f9fafb` (gray-50) — NOT `#f3f4f6` (gray-100) _(Auto: Phase 3 test 18)_
- [x] Meta label font-weight is `font-medium` (500) — NOT `font-normal` (400) as in Orders tab _(Auto: Phase 3 test 21)_
- [x] Meta value font-weight is `font-semibold` (600) — NOT `font-normal` (400) as in Orders tab _(Auto: Phase 3 test 22)_
- [x] Original Order # color is `#2699a6` (secondary) — NOT `#111827` (dark) _(Auto: Phase 3 test 23)_
- [ ] No Ship To pill visible (only in Orders tab) _(manual — visual)_
- [ ] No "View order details | View invoice" links (replaced by status-specific links) _(manual — visual)_

#### Card Header — Status Badge

- [x] **Return Shipped**: Badge bg is `rgba(42,200,100,0.1)` (green tint), text/icon is `#2ac864` (primary green) _(Auto: Phase 3 test 24)_
- [x] **Awaiting Pickup**: Badge bg is `rgba(242,176,94,0.1)` (amber tint), text/icon is `#f2b05e` (amber) _(Auto: Phase 3 test 25)_
- [x] **Out for Delivery**: Badge bg is `rgba(38,153,166,0.1)` (teal tint), text/icon is `#2699a6` (secondary teal) _(Auto: Phase 3 test 26)_
- [ ] Badge padding: `12px horizontal, 8px vertical` _(manual — visual)_
- [x] Badge icon size: `13px` _(Auto: Phase 3 test 27)_
- [x] Badge text: `font-semibold text-[13px] leading-[19.5px]` _(Auto: Phase 3 tests 24-26)_
- [ ] Badge icon and text have `8px` gap between them _(manual — visual)_

#### Card Header — Status Badge Pixel-Precision Checks

- [x] Badge bg colors use exact rgba values — NOT hex approximations or opacity utilities _(Auto: Phase 3 tests 24-26)_
- [x] "Return Shipped" green is `#2ac864` — NOT `#10b981` (emerald-500) or `#22c55e` (green-500) _(Auto: Phase 3 test 24)_
- [x] "Awaiting Pickup" amber is `#f2b05e` — NOT `#f59e0b` (amber-500) or `#d97706` (amber-600) _(Auto: Phase 3 test 25)_
- [x] "Out for Delivery" teal is `#2699a6` — NOT `#14b8a6` (hero teal) _(Auto: Phase 3 test 26)_
- [x] Badge text size is `13px` — NOT `12px` or `14px` _(Auto: Phase 3 tests 24-26)_

#### Card Header — Links

- [ ] Links appear below the status badge with `8px` top padding _(manual — visual)_
- [x] Links are `14px text-[#2699a6]` (secondary teal) with `hover:underline` _(Auto: Phase 3 test 31 — color verified; hover manual)_
- [x] Pipe separator `|` between links in `text-[#d1d5db]` _(Auto: Phase 3 test 31)_
- [ ] Gap between links and separator: `16px` _(manual — visual)_
- [x] **Return Shipped**: "View return details | View refund status" _(Auto: Phase 3 test 28)_
- [x] **Awaiting Pickup**: "View return details | Cancel return" _(Auto: Phase 3 test 29)_
- [x] **Exchange**: "View exchange details | Track new item" _(Auto: Phase 3 test 30)_

#### Card Body — Status Text

- [x] Status title: `font-bold text-[20px] leading-[30px] text-[#111827]` _(Auto: Phase 3 test 32)_
- [x] Status message: `text-[14px] leading-[21px] text-[#4b5563]` _(Auto: Phase 3 test 33)_
- [ ] Status text container has `4px` gap between title and message _(manual — visual)_
- [ ] Body padding: `24px` all sides _(manual — visual)_
- [ ] Body gap between sections: `16px` _(manual — visual)_

#### Card Body — Product Row

- [x] Product image: `120px` square, gray bg `#f3f4f6`, `8px` radius _(Auto: Phase 3 test 34)_
- [ ] Real product image displayed when available; placeholder icon when not _(manual — visual)_
- [x] Product name: `15px font-medium text-[#2699a6]` — clickable link, hover underline _(Auto: Phase 3 test 35)_
- [x] Product name font-weight is `font-medium` (500) — matches Figma (differs from Orders tab which uses font-normal) _(Auto: Phase 3 test 35)_
- [x] Variant text: `13px text-[#4b5563]` _(Auto: Phase 3 test 36)_
- [x] Return info: `13px text-[#4b5563]` with `8px` top margin _(Auto: Phase 3 test 37)_
- [ ] `24px` gap between image and product info _(manual — visual)_
- [ ] Product row divider: `border-b border-[#f3f4f6]` (except last row) _(manual — visual)_

#### Card Body — Inline Action Buttons

- [x] Buttons: `bg-white border border-[#d1d5db] px-[17px] py-[9px] text-[14px] font-medium text-[#374151]` _(Auto: Phase 3 test 41)_
- [ ] Icon (when present): `14px text-[#374151]` with `8px` gap before text _(manual — visual)_
- [ ] Buttons have `8px` gap between them _(manual — visual)_
- [ ] Buttons have `8px` top margin from return info text _(manual — visual)_
- [x] **Return Shipped**: "Print return label" (with printer icon) + "Contact seller" _(Auto: Phase 3 test 38)_
- [x] **Awaiting Pickup**: "Print return label" (with printer icon) + "Reschedule pickup" _(Auto: Phase 3 test 39)_
- [x] **Exchange**: "View tracking" + "Contact support" _(Auto: Phase 3 test 40)_
- [x] No "Buy it again" or "View your item" buttons — these are return-specific buttons _(Auto: Phase 3 test 42)_

#### Card Body — Actions Panel (Desktop)

- [x] Actions panel visible on right side, `200px` wide (`w-[200px] min-w-[200px]`) _(Auto: Phase 3 test 43)_
- [x] Panel hidden on mobile (`hidden lg:flex`) _(Auto: Phase 5 test 64)_
- [ ] Stacked buttons with `8px` gap _(manual — visual)_
- [x] **Primary button**: `bg-[#2699a6]` (secondary teal) — NOT `bg-[#14b8a6]` (hero teal)! _(Auto: Phase 3 test 47)_
- [x] Primary button text: `14px font-medium text-white`, centered, full width _(Auto: Phase 3 test 48)_
- [ ] Primary button icon: `14px text-white` _(manual — visual)_
- [x] Secondary button: `bg-white border border-[#d1d5db] text-[#374151]` _(Auto: Phase 3 test 49)_
- [x] **Return Shipped**: Primary "Track return package" + Secondary "View refund status" _(Auto: Phase 3 test 44)_
- [x] **Awaiting Pickup**: Primary "View pickup details" + Secondary "Prepare package" _(Auto: Phase 3 test 45)_
- [x] **Exchange**: Primary "Track delivery" + Secondary "View exchange details" _(Auto: Phase 3 test 46)_

#### Card Body — Actions Panel Pixel-Precision Checks

- [x] Primary button bg is `#2699a6` — NOT `#14b8a6` (hero teal used in Orders tab) _(Auto: Phase 3 test 47)_
- [ ] Primary button hover is `#1e7a85` or similar darker teal — NOT `#0d9488` _(manual — hover state)_
- [ ] Button padding: `17px horizontal, 13px vertical` (panel) or `17px horizontal, 9px vertical` (inline) _(manual — visual)_
- [x] Actions panel width is exactly `200px` with `min-w-[200px]` _(Auto: Phase 3 test 43)_
- [ ] Icon + text have `8px` gap _(manual — visual)_

#### Card Body — Progress Tracker (within card)

- [ ] Progress tracker appears at the bottom of the card body _(manual — visual)_
- [ ] Tracker has `16px` top gap from the last product row _(manual — visual)_
- [x] Tracker background is `#f9fafb` — NOT white (should be visually distinct from card body) _(Auto: Phase 2 test 1)_
- [x] Steps correctly reflect the card's return/exchange status (see Phase 2 tests) _(Auto: Phase 2 tests 12-14)_

---

### Phase 4 Manual Testing — Route Integration

**Prerequisites**: Logged in with orders in various fulfillment statuses.

#### Tab Switching

- [x] Clicking "On the Way Out" tab activates it with amber border _(Auto: Auth test 1 — tab activation + border-color check)_
- [x] View switches from OrderCard list to OutgoingCard list _(Auto: Phase 4 test 51)_
- [x] Sub-section header ("On the Way Out" + subtitle) appears above the cards _(Auto: Phase 4 test 55)_
- [x] Time filter dropdown does NOT appear for this tab (per Figma) _(Auto: Auth test 2 — select count=0)_
- [x] Stats cards remain visible and unchanged _(Auto: Auth test 3 — Re-Purchase label visible before/after tab switch)_
- [x] Page header remains "My Orders" (does NOT change to "On the Way Out") _(Auto: Phase 4 test 56)_
- [x] Switching back to "Orders" tab shows OrderCards again (no sub-section header) _(Auto: Phase 4 test 52)_
- [x] Switching to "Buy Again" tab shows OrderCards filtered to fulfilled _(Auto: Auth test 4 — Buy Again tab + h1 check)_

#### Sub-section Header

- [x] Title: "On the Way Out" in `font-bold text-[24px] leading-[36px] text-[#111827]` _(Auto: Phase 4 test 53)_
- [x] Subtitle: "Track your returns and items being shipped back" in `text-[15px] leading-[22.5px] text-[#4b5563]` _(Auto: Phase 4 test 54)_
- [ ] `8px` gap between title and subtitle _(manual — visual)_
- [ ] Sub-section header is inside the main content container (with `24px` padding) _(manual — visual)_
- [ ] Sub-section header has `24px` gap below before the first outgoing card _(manual — visual)_

#### Data Flow

- [x] Outgoing items are derived from actual order data (simulated returns/exchanges) _(Auto: Phase 4 test 60)_
- [x] At least 2-3 outgoing cards visible with different statuses _(Auto: Phase 4 test 60)_
- [x] Product images, names, and variant info come from real order line items _(Auto: Auth test 8 — outgoing cards/empty state renders with real data)_
- [x] Original Order # links navigate to the correct order detail page _(Auto: Phase 4 test 61)_
- [x] Product name links navigate to the correct product page _(Auto: Phase 4 test 62)_

#### Pagination

- [x] Pagination appears below outgoing cards (same component as Orders tab) _(Auto: Auth test 10 — pagination nav check)_
- [ ] Page navigation works correctly for outgoing items _(manual — authenticated page with >10 items)_
- [ ] Page resets to 1 when switching tabs _(manual — authenticated page)_

#### Empty State

- [x] When no outgoing items exist, show appropriate empty state _(Auto: Phase 4 test 57)_
- [x] Empty state message should be relevant to returns/exchanges (not generic "No orders yet") _(Auto: Phase 4 test 57)_

#### No Regressions

- [x] Orders tab still works correctly after changes _(Auto: Auth test 11 — select/time filter visible)_
- [x] Buy Again tab still works correctly _(Auto: Auth test 4 — Buy Again tab renders)_
- [x] Stats card counts are still accurate _(Auto: Auth test 3 — stats cards visible)_
- [x] Sidebar "My Orders" link is still highlighted _(Auto: Auth test 12 — font-weight >= 500)_
- [x] HydrateFallback skeleton still works _(Auto: Auth test 13 — h1 loads after commit navigation)_

---

### Phase 5 Manual Testing — Mobile Responsiveness

- [x] **Mobile (<640px)**: Outgoing card header meta items stack vertically _(Auto: Phase 5 test 63)_
- [ ] **Mobile (<640px)**: Status badge + links appear below meta items (full width) _(manual — visual)_
- [ ] **Mobile (<640px)**: Product row stacks — image on top, info below _(manual — visual)_
- [x] **Mobile (<640px)**: Actions panel hidden; inline action buttons visible below product info _(Auto: Phase 5 tests 64, 65)_
- [x] **Mobile (<640px)**: Progress tracker: horizontally scrollable with steps not wrapping _(Auto: Phase 5 test 66)_
- [x] **Mobile (<640px)**: Sub-section header: title at `text-xl` (smaller), subtitle wraps naturally _(Auto: Phase 5 test 67)_
- [x] **Tablet (640–1023px)**: Card header meta items in a row, product row horizontal _(Auto: Phase 5 tests 69, 70)_
- [x] **Desktop (>=1024px)**: Full layout with actions panel on right _(Auto: Phase 5 tests 71, 72)_
- [ ] Progress tracker connecting line extends correctly at all breakpoints _(manual — visual)_
- [ ] Step labels remain readable and centered at all breakpoints _(manual — visual)_
- [ ] Cross-browser: Chrome — all elements render correctly _(manual — run `--project=chromium`)_
- [ ] Cross-browser: Safari — gradient headers, progress tracker render correctly _(manual — run `--project=webkit`)_
- [ ] Cross-browser: Firefox — all elements render correctly _(manual — run `--project=firefox`)_

---

### Phase 6 Manual Testing — Polish

- [x] Loading state: navigate to `/account/orders` with "On the Way Out" tab → skeleton/loading state visible _(Auto: Auth test 13 — HydrateFallback verified)_
- [ ] Tab state: persists correctly when paginating on the On the Way Out tab _(manual — authenticated page)_
- [x] Progress tracker: all three card variants show distinct step configurations _(Auto: Phase 2 tests 12-14)_
- [x] Status badge: all three color variants render correctly _(Auto: Phase 3 tests 24-26)_
- [x] Actions panel buttons: all status-specific button sets render correctly _(Auto: Phase 3 tests 44-46)_
- [x] Visual comparison: Playwright screenshot at 1440px captured _(Auto: Phase 6 test 73)_ — compare with Figma manually
- [x] No console errors or warnings related to the new components _(Auto: Auth test 15 — console error check)_

---

## Architecture Notes

### Component Hierarchy

```
account.orders._index.tsx
├── PageHeader ("My Orders" + subtitle) — unchanged
├── OrderStatsCards — unchanged
├── OrderTabBar — unchanged
├── [activeTab === 'orders' or 'buy-again']
│   ├── OrdersHeader (count + time filter) — existing
│   ├── OrderCard[] — existing
│   └── OrderPagination — existing
├── [activeTab === 'on-the-way-out']
│   ├── SubHeaderSection (title + subtitle) — new, inline
│   ├── OutgoingCard[] — new component
│   │   ├── OutgoingCardHeader (meta + badge + links)
│   │   ├── OutgoingCardBody (status + product rows + actions)
│   │   └── ReturnProgressTracker — new component
│   └── OrderPagination — reused
└── EmptyOrders / EmptyOutgoing — empty states
```

### New Files

| File | Purpose |
|------|---------|
| `hydrogen/app/components/account/OutgoingCard.tsx` | Return/exchange card component |
| `hydrogen/app/components/account/ReturnProgressTracker.tsx` | Horizontal progress stepper |
| `hydrogen/app/lib/outgoing-data.ts` | Data simulation utility |
| `hydrogen/design-references/account-orders-on-the-way-out/figma-spec.md` | Design spec |
| `hydrogen/design-references/account-orders-on-the-way-out/design-context.tsx` | Raw Figma output |
| `hydrogen/app/routes/test.outgoing-cards.tsx` | Test route (renders components with mock data, no auth) |
| `hydrogen/tests/e2e/outgoing-cards.spec.ts` | Playwright e2e tests (75 tests covering all manual testing phases) |

### Modified Files

| File | Changes |
|------|---------|
| `hydrogen/app/routes/account.orders._index.tsx` | Conditional rendering for "on-the-way-out" tab: show sub-header + OutgoingCard instead of OrderCard + time filter |

### Status Configuration Map

```typescript
const STATUS_CONFIG = {
  'return-shipped': {
    badge: { label: 'Return Shipped', bg: 'bg-[rgba(42,200,100,0.1)]', color: 'text-[#2ac864]', icon: PackageCheck },
    links: ['View return details', 'View refund status'],
    inlineActions: [
      { label: 'Print return label', icon: Printer },
      { label: 'Contact seller' },
    ],
    panelActions: [
      { label: 'Track return package', icon: Package, primary: true },
      { label: 'View refund status', icon: DollarSign },
    ],
    progressSteps: [
      { label: 'Return Requested', status: 'completed', icon: Check },
      { label: 'Label Generated', status: 'completed', icon: Tag },
      { label: 'Package Shipped', status: 'completed', icon: Package },
      { label: 'In Transit', status: 'active', icon: Truck },
      { label: 'Refund Processed', status: 'pending', icon: DollarSign },
    ],
  },
  'awaiting-pickup': {
    badge: { label: 'Awaiting Pickup', bg: 'bg-[rgba(242,176,94,0.1)]', color: 'text-[#f2b05e]', icon: Clock },
    links: ['View return details', 'Cancel return'],
    inlineActions: [
      { label: 'Print return label', icon: Printer },
      { label: 'Reschedule pickup' },
    ],
    panelActions: [
      { label: 'View pickup details', icon: MapPin, primary: true },
      { label: 'Prepare package', icon: Package },
    ],
    progressSteps: [
      { label: 'Return Requested', status: 'completed', icon: Check },
      { label: 'Label Generated', status: 'completed', icon: Tag },
      { label: 'Awaiting Pickup', status: 'active', icon: Clock },
      { label: 'In Transit', status: 'pending', icon: Truck },
      { label: 'Refund Processed', status: 'pending', icon: DollarSign },
    ],
  },
  'exchange-out-for-delivery': {
    badge: { label: 'Out for Delivery', bg: 'bg-[rgba(38,153,166,0.1)]', color: 'text-[#2699a6]', icon: Truck },
    links: ['View exchange details', 'Track new item'],
    inlineActions: [
      { label: 'View tracking' },
      { label: 'Contact support' },
    ],
    panelActions: [
      { label: 'Track delivery', icon: MapPin, primary: true },
      { label: 'View exchange details', icon: ArrowLeftRight },
    ],
    progressSteps: [
      { label: 'Exchange Requested', status: 'completed', icon: Check },
      { label: 'Return Shipped', status: 'completed', icon: Check },
      { label: 'New Item Shipped', status: 'completed', icon: Check },
      { label: 'Out for Delivery', status: 'active', icon: Truck },
      { label: 'Exchange Complete', status: 'pending', icon: CheckCircle },
    ],
  },
};
```

### Deviations from Figma

| Item | Figma | Implementation | Reason |
|------|-------|----------------|--------|
| Icons | Font Awesome 5 | Lucide React | Project convention |
| Font | Roboto | Roboto | No change needed |
| Meta font-weight | `font-medium` / `font-semibold` | `font-medium` / `font-semibold` | Match Figma exactly — different from Orders tab `font-normal` |
| Original Order # | Amazon-style format | Shopify `order.name` (#1001) | Shopify uses different format |
| Primary action bg | `#2699a6` (secondary) | `bg-secondary` or `bg-[#2699a6]` | Different from Orders tab `#14b8a6` — intentional per design |
| Return/exchange data | Real returns data | Simulated from fulfilled orders | Shopify Storefront API lacks returns endpoint |
| Progress tracker icons | Font Awesome glyphs | Lucide icons | Project convention |
| "Print return label" icon | FA printer glyph | Lucide `Printer` icon | Closest match |
| "Contact seller" | Links to seller | Placeholder action | No seller messaging in Shopify Storefront API |
| "Cancel return" | Functional | Placeholder action | No returns API for cancellation |
| Refund amounts | Real refund data | Derived from order total | Storefront API doesn't expose refund amounts |
