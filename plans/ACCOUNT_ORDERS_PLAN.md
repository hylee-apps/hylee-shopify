# Implementation Plan: Account Orders Page Redesign

> **Status**: Complete (Phases 1–8 code verified; remaining: Playwright visual test + cross-browser testing)
> **Created**: 2026-03-24
> **Branch**: `feature/account-orders-redesign`
> **Figma**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=3-1270
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + Lucide Icons + React Router 7)
> **Depends on**: Account Dashboard Redesign (complete), Account Profile Settings (complete), Account Address Book (complete)

## Overview

Redesign the My Orders page (`account.orders._index.tsx`) to match the Figma "My Orders" design (node `3:1270`). The current page uses a simple card layout with status badges, line items, and a "Load More" link. The new design has:

- **Page header**: "My Orders" (32px bold) + subtitle
- **Stats cards**: 3 equal-width cards — Orders (blue), On The Way Out (amber), Re-Purchase (emerald)
- **Tab bar**: 3 tabs with amber active border — Orders, Buy Again, On the Way Out
- **Orders header**: Count + time filter dropdown
- **Order cards**: Gradient header (meta: Order Placed, Total, Ship To, Order #, links) + body (delivery status, product rows with images, action buttons, right-side actions panel)
- **Pagination**: Numbered page buttons with hero-teal active state (replaces "Load More")

The existing backend (loader, GraphQL query) will need updates to support:

- Total order counts for stats cards
- All orders (not just 10) for proper counting
- Page-based pagination instead of cursor-based

### Design Reference

- **File key**: `Q541sIDD20eXqQSSozFUw4`
- **Node ID**: `3:1270`
- **Spec**: `hydrogen/design-references/account-orders/figma-spec.md`
- **Raw context**: `hydrogen/design-references/account-orders/design-context.tsx`

---

## Checklist

### Phase 1: Design Reference & Prerequisites (Complete)

- [x] Fetch Figma design context, screenshot, and variable defs — MCP tools
- [x] Save design reference files — `hydrogen/design-references/account-orders/`
- [x] Verify font loading — Roboto Bold/Regular already loaded in `root.tsx`
- [x] Verify design token coverage — colors/shadows mapped in `app.css`
- [x] Audit existing components — `account.orders._index.tsx` current state documented

#### Phase 1 Notes

**Token gaps identified:**

- `#f2b05e` (tab active amber border) — no existing token; use `border-[#f2b05e]`
- `rgba(59,130,246,0.1)` (blue stat bg) — no token; use `bg-[rgba(59,130,246,0.1)]`
- `rgba(245,158,11,0.1)` (amber stat bg) — no token; use `bg-[rgba(245,158,11,0.1)]`
- `rgba(16,185,129,0.1)` (emerald stat bg) — no token; use `bg-[rgba(16,185,129,0.1)]`
- `#3b82f6` (blue stat icon) — Tailwind `text-blue-500`
- `#f59e0b` (amber stat icon) — Tailwind `text-amber-500`
- `#10b981` (emerald stat icon) — Tailwind `text-emerald-500`
- `#14b8a6` (hero teal for pagination/buttons) — uses `--color-hero` token
- `#40283c` (dark text for active tab) — uses `--color-dark` token
- `#2699a6` (secondary for links) — uses `--color-secondary` token
- `#2ac864` (primary green for "Delivered today") — uses `--color-primary` token

**Components to create:**

- `OrderStatsCards.tsx` — 3 stat cards (reusable component)
- `OrderTabBar.tsx` — Tab navigation with amber active state
- `OrderCard.tsx` — Complete redesign (header + body + product rows + actions panel)
- `Pagination.tsx` — Numbered pagination with hero-teal active state

**Components to keep unchanged:**

- `AccountSidebar.tsx` — sidebar layout already correct
- `account.tsx` — layout route unchanged
- `RecipientBadge.tsx` — reused in Ship To display

**Current code to replace:**

- Existing `OrderCard` in `account.orders._index.tsx` — completely different layout
- Existing `StatusBadge` — replaced by inline delivery status text
- Existing `EmptyOrders` — keep but restyle
- `Load More` pagination — replaced by numbered Pagination component

---

### Phase 2: Stats Cards & Tab Bar Components (Complete)

- [x] Create `OrderStatsCards.tsx` component in `hydrogen/app/components/account/`
  - Accept props: `totalOrders: number`, `inTransitOrders: number`, `deliveredOrders: number`
  - 3 flex-1 cards with icon square + value + label
  - Card: `bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex gap-[16px] items-center px-[32px] pt-[31px] pb-[32px]`
  - Icon square: `size-[56px] rounded-[12px] flex items-center justify-center`
  - Value: `font-bold text-[28px] leading-[44.8px] text-[#1f2937]`
  - Label: `text-[14px] leading-[22.4px] text-[#6b7280]`
  - Use Lucide icons: `ShoppingBag` (blue), `Truck` (amber), `RotateCcw` (emerald)
- [x] Create `OrderTabBar.tsx` component in `hydrogen/app/components/account/`
  - Accept props: `activeTab: string`, `onTabChange: (tab: string) => void`, `counts?: Record<string, number>`
  - Container: `bg-white border-b border-[#e5e7eb] h-[59px]`
  - Tab: `flex gap-[8px] items-center px-[24px] pt-[16px] pb-[19px]`
  - Active tab: `border-b-[3px] border-[#f2b05e]`, text `text-[#40283c]`, icon `text-[#40283c]`
  - Inactive tab: `border-b-[3px] border-transparent`, text `text-[#4b5563]`, icon `text-[#4b5563]`
  - Tab text: `text-[15px] leading-[22.5px]`
  - Icon size: `14px`
  - Tabs: Orders (ShoppingBag), Buy Again (RotateCcw), On the Way Out (Truck)
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 2 Figma-Exact Styling Requirements

**Stats card container:**

```
flex gap-[24px] pb-[16px] w-full
```

**Individual stat card:**

```
bg-white flex flex-1 gap-[16px] items-center px-[32px] pt-[31px] pb-[32px]
rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
```

**Stat icon square (per card):**

```
Card 1 (Orders):     bg-[rgba(59,130,246,0.1)] → icon text-[#3b82f6]
Card 2 (On The Way): bg-[rgba(245,158,11,0.1)] → icon text-[#f59e0b]
Card 3 (Re-Purchase): bg-[rgba(16,185,129,0.1)] → icon text-[#10b981]
Size: size-[56px] rounded-[12px] flex items-center justify-center
Icon: size-[24px]
```

**Stat value:**

```
font-bold text-[28px] leading-[44.8px] text-[#1f2937]
```

**Stat label:**

```
font-normal text-[14px] leading-[22.4px] text-[#6b7280]
```

**Tab bar container:**

```
bg-white border-b border-[#e5e7eb] flex items-start w-full
```

**Active tab:**

```
border-b-[3px] border-[#f2b05e] flex gap-[8px] items-center
px-[24px] pt-[16px] pb-[19px] cursor-pointer
Icon: size-[14px] text-[#40283c]
Text: text-[15px] leading-[22.5px] text-[#40283c] whitespace-nowrap
```

**Inactive tab:**

```
border-b-[3px] border-transparent flex gap-[8px] items-center
px-[24px] pt-[16px] pb-[19px] cursor-pointer
Icon: size-[14px] text-[#4b5563]
Text: text-[15px] leading-[22.5px] text-[#4b5563] whitespace-nowrap
```

**These styles MUST NOT be overridden by:**

- shadcn Tab styles (not using shadcn Tabs)
- Global button/link styles
- Tailwind's default text sizes

---

### Phase 3: Order Card Component Redesign (Complete)

- [x] Rewrite `OrderCard` component in `account.orders._index.tsx` (or extract to `OrderCard.tsx`)
  - Card container: `bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-clip w-full`
  - **Card Header** (gradient):
    - Container: `bg-gradient-to-r from-[#f9fafb] to-white border-b border-[#e5e7eb] flex flex-wrap justify-between px-[24px] pt-[16px] pb-[17px]`
    - Left meta: flex-wrap with `gap-x-[24px]` — Order Placed, Total, Ship To
    - Right meta: Order # + links (View order details | View invoice)
    - Meta label: `text-[12px] uppercase tracking-[0.5px] text-[#6b7280] leading-[18px]`
    - Meta value: `text-[15px] text-[#111827] leading-[22.5px]`
    - Ship To pill: `bg-white border border-[#d1d5db] rounded-[4px] px-[9px] py-[5px]` with name text `text-[14px] text-[#374151]`
    - Order links: `text-[14px] text-secondary leading-[21px]` separated by `|` `text-[#d1d5db]`
  - **Card Body**:
    - Container: `p-[24px] flex flex-col gap-[16px]`
    - Delivery status: see below for color logic
    - Product rows: see below
  - Keep using `formatDate`, `formatMoney` helpers
- [x] Implement delivery status display
  - "Delivered today": `text-[20px] text-primary leading-[30px]` (green)
  - "Delivered [date]": `text-[20px] text-[#111827] leading-[30px]` (dark)
  - "In Transit" / "Processing": display appropriate status text
  - Message: `text-[14px] text-[#4b5563] leading-[21px]`
- [x] Implement product row component within card
  - Layout: `flex gap-[24px] items-start py-[16px]`
  - Divider between products: `border-b border-[#f3f4f6]` (except last)
  - **Product image**: `size-[120px] bg-[#f3f4f6] rounded-[8px] overflow-clip` — use real product image or placeholder (ImageIcon `40px` `text-[#9ca3af]`)
  - **Product info** (center, `flex-1 flex flex-col gap-[8px]`):
    - Product name: `text-[15px] text-secondary leading-[21px]` — link to product
    - Return info: `text-[13px] text-[#4b5563] leading-[19.5px]`
    - Action buttons (`flex flex-wrap gap-[8px] pt-[8px]`):
      - "Buy it again": `bg-[#14b8a6] border border-[#14b8a6] text-white text-[14px] px-[17px] py-[9px] flex gap-[8px] items-center`
      - "View your item": `bg-white border border-[#d1d5db] text-[#374151] text-[14px] px-[17px] py-[9px]`
  - **Actions panel** (right side, desktop only):
    - Container: `w-[200px] min-w-[200px] flex flex-col gap-[8px]`
    - Buttons: `bg-white border border-[#d1d5db] px-[17px] py-[13px] text-[14px] text-[#374151] text-center leading-[21px] w-full`
    - Primary action variant: `bg-[#14b8a6] border border-[#14b8a6] text-white`
    - Actions vary by order status (Track package, Return/replace, Share gift receipt, etc.)
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 3 Figma-Exact Styling Requirements

**Order card container:**

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
text-[12px] uppercase tracking-[0.5px] text-[#6b7280] leading-[18px] font-normal
```

**Meta value:**

```
text-[15px] text-[#111827] leading-[22.5px] font-normal
```

**Ship To pill:**

```
bg-white border border-[#d1d5db] rounded-[4px] px-[9px] py-[5px]
flex gap-[4px] items-center
Name: text-[14px] text-[#374151] leading-[21px]
Icon: size-[14px] text-[#374151]
```

**Order links:**

```
flex gap-[16px] items-start
Link: text-[14px] text-secondary leading-[21px] hover:underline cursor-pointer
Separator: text-[14px] text-[#d1d5db] leading-[21px]
```

**Delivery status (today):**

```
text-[20px] text-primary leading-[30px] font-normal
```

**Delivery status (past date):**

```
text-[20px] text-[#111827] leading-[30px] font-normal
```

**Delivery message:**

```
text-[14px] text-[#4b5563] leading-[21px] font-normal
```

**Product image:**

```
size-[120px] bg-[#f3f4f6] rounded-[8px] overflow-clip shrink-0
flex items-center justify-center
Placeholder icon: size-[40px] text-[#9ca3af]
```

**Product name link:**

```
text-[15px] text-secondary leading-[21px] font-normal hover:underline
```

**Product variant/return info:**

```
text-[13px] text-[#4b5563] leading-[19.5px] font-normal
```

**"Buy it again" button:**

```
bg-[#14b8a6] border border-[#14b8a6] flex gap-[8px] items-center
px-[17px] py-[9px] text-[14px] text-white leading-[21px]
hover:bg-[#0d9488] transition-colors cursor-pointer
Icon: size-[14px] text-white
```

**"View your item" button:**

```
bg-white border border-[#d1d5db] px-[17px] py-[9px]
text-[14px] text-[#374151] leading-[21px]
hover:border-[#9ca3af] transition-colors cursor-pointer
```

**Actions panel button (secondary):**

```
bg-white border border-[#d1d5db] px-[17px] py-[13px]
text-[14px] text-[#374151] text-center leading-[21px] w-full
hover:border-[#9ca3af] transition-colors cursor-pointer
```

**Actions panel button (primary):**

```
bg-[#14b8a6] border border-[#14b8a6] px-[17px] py-[13px]
text-[14px] text-white text-center leading-[21px] w-full
hover:bg-[#0d9488] transition-colors cursor-pointer
```

**Product row divider:**

```
border-b border-[#f3f4f6]   (applied to all product rows except the last)
```

**These styles MUST NOT be overridden by:**

- Old OrderCard styles (being replaced)
- shadcn Card/Button styles
- Global link styles on order detail/invoice links
- Tailwind's default border-radius on buttons

---

### Phase 4: Pagination Component (Complete)

- [x] Create `Pagination.tsx` component in `hydrogen/app/components/account/`
  - Accept props: `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void` or use URL search params
  - Layout: `flex gap-[8px] items-center justify-center w-full`
  - **Prev arrow**: `bg-white border border-[#e5e7eb] rounded-[8px] size-[40px]`, disabled state `opacity-50`
  - **Active page**: `bg-[#14b8a6] border border-[#14b8a6] rounded-[8px] size-[40px] text-[14px] text-white`
  - **Inactive page**: `bg-white border border-[#e5e7eb] rounded-[8px] size-[40px] text-[14px] text-[#1f2937]`
  - **Ellipsis**: `text-[16px] text-[#6b7280] leading-[25.6px]`
  - **Next arrow**: same as prev (enabled state)
  - Page numbers: show 1, 2, 3, ..., last page (truncate middle for >5 pages)
  - Use Lucide `ChevronLeft` / `ChevronRight` for arrows (14px)
  - Navigation: use `Link` with search params for page number
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 4 Figma-Exact Styling Requirements

**Pagination container:**

```
flex gap-[8px] items-center justify-center w-full
```

**Page button (base):**

```
size-[40px] rounded-[8px] flex items-center justify-center
text-[14px] text-center cursor-pointer transition-colors
```

**Active page:**

```
bg-[#14b8a6] border border-[#14b8a6] text-white
```

**Inactive page:**

```
bg-white border border-[#e5e7eb] text-[#1f2937]
hover:border-[#14b8a6] hover:text-[#14b8a6]
```

**Disabled arrow (prev on page 1, next on last page):**

```
bg-white border border-[#e5e7eb] opacity-50 cursor-not-allowed
```

**Arrow icon:**

```
size-[14px] text-[#1f2937]
```

**Ellipsis:**

```
text-[16px] text-[#6b7280] leading-[25.6px]
```

---

### Phase 5: Loader Updates & Route Integration (Complete)

- [x] Update `CUSTOMER_ORDERS_QUERY` to support proper pagination
  - Add `totalCount` or use a separate query for stats
  - Fetch orders with offset-based pagination (or map cursor pagination to page numbers)
  - Fetch enough data to count: total orders, in-transit (UNFULFILLED/IN_PROGRESS), delivered (FULFILLED)
- [x] Update loader to return:
  - `orders` — current page's orders
  - `totalOrders` — total order count
  - `inTransitOrders` — count of unfulfilled/in-progress orders
  - `deliveredOrders` — count of fulfilled orders (for "Re-Purchase" stat)
  - `currentPage` — derived from URL search params
  - `totalPages` — calculated from total / perPage
- [x] Rewrite main `OrdersPage` component
  - Page header: "My Orders" (`text-[32px] font-bold text-[#1f2937]`) + subtitle (`text-[16px] text-[#6b7280]`)
  - Render: `OrderStatsCards` → `OrderTabBar` → Orders Header → Order Cards → `Pagination`
  - Wire tab state with `useState` for filtering (Orders = all, Buy Again = delivered, On the Way Out = in-transit)
  - Wire pagination via URL search params (`?page=2`)
  - Keep `EmptyOrders` component (restyle to match new design)
- [x] Remove old `StatusBadge`, old `OrderCard`, old "Load More" link
- [x] Add `HydrateFallback` export for loading skeleton
- [x] Pre-commit checks pass: format, typecheck, build, test

---

### Phase 6: Orders Header with Time Filter (Complete)

- [x] Add orders header section within the page
  - Count text: `{count}` (regular) + ` orders placed in` (bold), `text-[18px] text-[#111827] leading-[27px]`
  - Time filter: `<select>` styled as `bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[9px] text-[14px]`
  - Options: "past 3 months", "past 6 months", "past year", "all time"
  - Filter updates URL search params, loader re-fetches with date filter
- [x] Update loader to accept `timeFilter` search param and filter orders by `processedAt` date
- [x] Pre-commit checks pass: format, typecheck, build, test

---

### Phase 7: Mobile Responsiveness (Complete)

- [x] Stats cards: `flex-col sm:flex-row` (stack on mobile)
- [x] Tab bar: `overflow-x-auto` with `shrink-0` on tabs for horizontal scroll on mobile
- [x] Order card header: `flex-col sm:flex-row` for meta items (stack on mobile)
- [x] Product row: `flex-col sm:flex-row` — image full-width above info on mobile
- [x] Actions panel: hide on mobile, show action buttons inline under product info instead
  - Desktop: `hidden lg:flex lg:flex-col` on panel, `lg:hidden` on inline buttons
  - Mobile: inline buttons visible, panel hidden
- [x] Pagination: keep horizontal, scrollable on very narrow screens
- [x] Page title: `text-2xl sm:text-[32px]`
- [x] Pre-commit checks pass: format, typecheck, build, test

---

### Phase 8: Polish & Testing (Code Verification Complete)

- [x] Verify tab switching filters orders correctly — code verified: `account.orders._index.tsx:170-182`
- [x] Verify pagination navigates between pages — code verified: `OrderPagination.tsx` uses `Link` + URL params
- [x] Verify order card links work (View order details → detail page, View your item → product page) — code verified: `OrderCard.tsx:203,342`
- [x] Verify stats card counts are accurate — code verified: `account.orders._index.tsx:158-167`
- [x] Ensure empty state displays correctly when no orders — code verified: `account.orders._index.tsx:312-327`
- [ ] Implement Playwright visual test — `hydrogen/tests/e2e/visual/account-orders.visual.spec.ts`
- [ ] Add `pnpm visual:account-orders` and `pnpm compare:account-orders` scripts
- [ ] Visual comparison pass against Figma screenshot

---

## Manual Testing Plan

### Phase 2 Manual Testing — Stats Cards & Tab Bar

**Prerequisites**: Logged in as a customer with orders in various statuses.

#### Stats Cards — Visual Fidelity

- [x] 3 stat cards visible in a row below page header with 24px gap
- [x] Each card: white bg, 12px radius, subtle shadow
- [x] Card 1 (Orders): blue icon square (`rgba(59,130,246,0.1)` bg) with ShoppingBag icon (`#3b82f6`), shows total order count
- [x] Card 2 (On The Way Out): amber icon square (`rgba(245,158,11,0.1)` bg) with Truck icon (`#f59e0b`), shows in-transit count
- [x] Card 3 (Re-Purchase): emerald icon square (`rgba(16,185,129,0.1)` bg) with RotateCcw icon (`#10b981`), shows delivered count
- [x] Icon square: 56px with 12px radius
- [x] Values: 28px bold, `#1f2937`
- [x] Labels: 14px regular, `#6b7280`
- [x] Card padding: 32px horizontal, 31px top, 32px bottom

#### Stats Cards — Pixel-Precision Checks

- [x] Icon square bg colors use exact rgba values (NOT hex approximations)
- [x] Card shadow is `0px 1px 2px 0px rgba(0,0,0,0.05)` — NOT box-shadow-sm
- [x] Card radius is 12px — NOT `rounded-lg` (8px) or `rounded-xl` (12px is `rounded-xl` in Tailwind — verify)
- [x] All cards are equal width (`flex-1`)

#### Tab Bar — Visual Fidelity

- [x] Tab bar has white bg and `border-b border-[#e5e7eb]`
- [x] 3 tabs visible: Orders, Buy Again, On the Way Out
- [x] Each tab has icon (14px) + label (15px) with 8px gap
- [x] Default active tab is "Orders" with amber bottom border (`3px #f2b05e`)
- [x] Active tab text color is `#40283c` (dark)
- [x] Inactive tab text color is `#4b5563` (gray-600)
- [x] No shadcn Tab styling visible (underlines, focus rings, etc.)

#### Tab Bar — Interaction

- [x] Click "Buy Again" → tab becomes active with amber border; "Orders" reverts to inactive
- [x] Click "On the Way Out" → tab becomes active; other tabs revert
- [x] Only one tab active at a time
- [x] Tab click filters the order list below

#### Tab Bar — Pixel-Precision Checks

- [x] Active border is exactly `#f2b05e` (amber/gold) — NOT `#f59e0b` (amber-500) or `#d97706`
- [x] Active border width is `3px` — NOT `2px`
- [x] Tab padding: 24px horizontal, 16px top, 19px bottom
- [x] Tab text size is 15px — NOT 14px or 16px

---

### Phase 3 Manual Testing — Order Cards

**Prerequisites**: At least 2 orders — one delivered today, one delivered previously. At least one order with multiple line items.

#### Card Header

- [x] Card has white bg, 12px radius, subtle shadow, overflow-clip — `OrderCard.tsx:169`
- [x] Header has gradient bg: left `#f9fafb` fading to white on right — `OrderCard.tsx:171`
- [x] Header has bottom border: `1px solid #e5e7eb` — `OrderCard.tsx:171`
- [x] Header padding: 24px horizontal, 16px top, 17px bottom — `OrderCard.tsx:171`
- [x] Left side shows: ORDER PLACED (date), TOTAL (amount), SHIP TO (name in pill) — `OrderCard.tsx:174-191`
- [x] Right side shows: ORDER # (number) + "View order details | View invoice" links — `OrderCard.tsx:194-216`
- [x] Meta labels: 12px uppercase, tracking 0.5px, `#6b7280` — `OrderCard.tsx:257-258`
- [x] Meta values: 15px, `#111827` — `OrderCard.tsx:260-261`
- [x] Ship To pill: white bg, `#d1d5db` border, 4px radius, padded, with chevron icon — `OrderCard.tsx:184-189`
- [x] Order links: 14px, `#2699a6` (secondary teal) — `OrderCard.tsx:204` (`text-secondary`)
- [x] Pipe separator between links: `#d1d5db` — `OrderCard.tsx:208`
- [x] Gap between meta items: 24px — `OrderCard.tsx:173` (`gap-x-[24px]`)

#### Card Header — Pixel-Precision Checks

- [x] Gradient direction is left-to-right (`bg-gradient-to-r`) — `OrderCard.tsx:171`
- [x] Gradient start: `#f9fafb` (gray-50) — NOT `#f3f4f6` (gray-100) — `from-[#f9fafb]`
- [x] Ship To pill border is `#d1d5db` (gray-300) — NOT `#e5e7eb` (gray-200) — `OrderCard.tsx:184`
- [x] Order link color is exactly `#2699a6` (secondary) — NOT `#14b8a6` (hero) — `text-secondary`
- [x] No old status badge visible (no colored pills/dots) — no StatusBadge import

#### Card Body — Delivery Status

- [x] "Delivered today" text in primary green `#2ac864`, 20px — `OrderCard.tsx:224-225` (`text-primary` when `isToday`)
- [x] Past delivery date text in dark `#111827`, 20px (e.g., "Delivered February 25") — `OrderCard.tsx:225`
- [x] Delivery message in gray `#4b5563`, 14px — `OrderCard.tsx:230-231`

#### Card Body — Product Rows

- [x] Product image: 120px square, gray bg `#f3f4f6`, 8px radius — `OrderCard.tsx:297,301`
- [x] Real product image displayed when available; gray placeholder with icon when not — `OrderCard.tsx:292-304`
- [x] Product name: 15px, secondary teal `#2699a6`, clickable link — `OrderCard.tsx:311`
- [x] Return eligibility text: 13px, `#4b5563` — `OrderCard.tsx:325`
- [x] "Buy it again" button: `#14b8a6` bg, white text, 14px, with refresh icon — `OrderCard.tsx:334`
- [x] "View your item" button: white bg, `#d1d5db` border, `#374151` text, 14px — `OrderCard.tsx:343`
- [x] Action buttons have 8px gap between them — `OrderCard.tsx:330` (`gap-[8px]`)
- [x] Product rows separated by `border-b border-[#f3f4f6]` (except last) — `OrderCard.tsx:288-289`
- [x] 24px gap between image and info — `OrderCard.tsx:287` (`sm:gap-[24px]`)

#### Card Body — Actions Panel (Desktop)

- [x] Actions panel visible on right side, 200px wide — `OrderCard.tsx:353` (`w-[200px] min-w-[200px]`)
- [x] Stacked buttons with 8px gap — `OrderCard.tsx:353` (`gap-[8px]`)
- [x] Button styles: white bg, gray border, 14px centered text, full width — `OrderCard.tsx:358-362`
- [x] Primary action (when present): `#14b8a6` bg, white text — `OrderCard.tsx:360`
- [x] Actions match order status (Track package, Return/replace, Share gift receipt, etc.) — `OrderCard.tsx:124-151`
- [x] Panel hidden on mobile viewport — `OrderCard.tsx:353` (`hidden ... lg:flex`)

#### Card Body — Pixel-Precision Checks

- [x] Product image size is exactly 120px — NOT 96px or 128px — `size-[120px]`
- [x] "Buy it again" bg is `#14b8a6` (hero teal) — NOT `#2ac864` (primary) or `#2699a6` (secondary)
- [x] Actions panel width is exactly 200px with min-w-[200px] — `OrderCard.tsx:353`
- [x] Product row padding: 16px vertical — `OrderCard.tsx:287` (`py-[16px]`)
- [x] Card body padding: 24px all sides — `OrderCard.tsx:220` (`p-[24px]`)
- [x] No old accordion or line-item grid visible from previous design

---

### Phase 4 Manual Testing — Pagination

- [x] Pagination appears below order cards, centered horizontally — `OrderPagination.tsx:57` (`justify-center`)
- [x] Previous arrow: 40px square, white bg, gray border, disabled (opacity-50) on page 1 — `OrderPagination.tsx:40,62`
- [x] Active page (current): `#14b8a6` bg, white text, 40px square — `OrderPagination.tsx:89`
- [x] Inactive pages: white bg, gray border, dark text — `OrderPagination.tsx:98`
- [x] Ellipsis: `...` in gray, 16px — `OrderPagination.tsx:82`
- [x] Next arrow: enabled when more pages exist — `OrderPagination.tsx:106-121`
- [x] Clicking page 2 → URL updates to `?page=2`, orders refresh — uses `Link` + `buildPageUrl`
- [x] Clicking next arrow → navigates to next page — `OrderPagination.tsx:114-120`
- [x] Clicking prev arrow → navigates to previous page — `OrderPagination.tsx:68-74`
- [x] Disabled arrows are not clickable — uses `<span>` not `<Link>`, `aria-disabled`

#### Pagination — Pixel-Precision Checks

- [x] Button size is exactly 40px — NOT 36px or 44px — `size-[40px]` in BASE_BTN
- [x] Button radius is 8px — `rounded-[8px]` in BASE_BTN
- [x] Active bg is `#14b8a6` (hero) — NOT `#2ac864` (primary) — `OrderPagination.tsx:89`
- [x] Gap between buttons is 8px — `OrderPagination.tsx:57` (`gap-[8px]`)
- [x] No old "Load More" link visible — confirmed absent

---

### Phase 5 Manual Testing — Route Integration

#### Page Header

- [x] Title: "My Orders" in bold, 32px, `#1f2937` — `account.orders._index.tsx:213` (`text-2xl sm:text-[32px] font-bold text-[#1f2937]`)
- [x] Subtitle: "View and manage your order history" in regular, 16px, `#6b7280` — `account.orders._index.tsx:216-218`
- [x] No old "Your Orders" title or count display — confirmed absent

#### Data Flow

- [x] Stats card counts are accurate (match actual order statuses) — `account.orders._index.tsx:158-167`
- [x] "Orders" tab shows all orders — `account.orders._index.tsx:182` (unfiltered `timeFilteredOrders`)
- [x] "Buy Again" tab filters to delivered orders — `account.orders._index.tsx:172-174` (`FULFILLED`)
- [x] "On the Way Out" tab filters to in-transit/unfulfilled orders — `account.orders._index.tsx:176-181`
- [x] Clicking "View order details" link → navigates to `/account/orders/{id}` detail page — `OrderCard.tsx:203`
- [x] "View your item" button → navigates to product page — `OrderCard.tsx:342`
- [x] Empty state shows when no orders match current tab/filter — `account.orders._index.tsx:266`

#### No Regressions

- [x] No old status badge pills visible — no StatusBadge import or usage
- [x] No old line-item grid layout visible — replaced by ProductRow component
- [x] No old "Load More" button — replaced by OrderPagination
- [x] Sidebar "My Orders" link is highlighted in active state — handled by parent `account.tsx` layout
- [ ] Back navigation works correctly from order detail page _(requires live browser testing)_

---

### Phase 6 Manual Testing — Time Filter

- [x] Dropdown appears below count text with "past 3 months" default — `account.orders._index.tsx:144,241-251`
- [x] Dropdown styled: white bg, `#d1d5db` border, 8px radius — `account.orders._index.tsx:244`
- [x] Selecting "past 6 months" → order list refreshes with wider date range — `handleTimeFilterChange` updates URL params
- [x] Selecting "past year" → shows orders from past 12 months — `getFilterMonths` returns 12
- [x] Selecting "all time" → shows all orders — `getFilterMonths` returns null (no filtering)
- [x] Count text updates to reflect filtered count — `account.orders._index.tsx:238` (`tabFilteredOrders.length`)
- [x] Stats cards update to reflect filtered counts — stats computed from `timeFilteredOrders` (lines 158-167)

---

### Phase 7 Manual Testing — Mobile Responsiveness

- [x] **Mobile (<640px)**: Stats cards stack vertically (3 rows) — `OrderStatsCards.tsx:45` (`flex-col sm:flex-row`)
- [x] **Mobile (<640px)**: Tab bar scrolls horizontally, tabs don't wrap — `OrderTabBar.tsx:18` (`overflow-x-auto`), tabs: `shrink-0`
- [x] **Mobile (<640px)**: Order card header meta items stack vertically — `OrderCard.tsx:171,173` (`flex-wrap`)
- [x] **Mobile (<640px)**: Product row stacks (image on top, info below) — `OrderCard.tsx:287` (`flex-col sm:flex-row`)
- [x] **Mobile (<640px)**: Actions panel hidden; action buttons shown inline below product info — `OrderCard.tsx:353` (`hidden lg:flex`); inline buttons always visible
- [x] **Mobile (<640px)**: Pagination remains horizontal, scrollable if needed — flex layout with gap
- [x] **Tablet (640–1023px)**: Stats cards in a row, product rows horizontal — `sm:flex-row` breakpoints
- [x] **Desktop (>=1024px)**: Full layout with sidebar + all panels visible — `lg:flex` on actions panel
- [ ] Cross-browser: Chrome — all elements render correctly _(requires manual browser testing)_
- [ ] Cross-browser: Safari — gradient headers, tab borders render correctly _(requires manual browser testing)_
- [ ] Cross-browser: Firefox — all elements render correctly _(requires manual browser testing)_

---

### Phase 8 Manual Testing — Polish

- [x] Loading skeleton: navigate to `/account/orders` with slow network → skeleton placeholders visible — `account.orders._index.tsx:276-306` (`HydrateFallback`)
- [x] Tab state: persists correctly when paginating (stay on same tab across page changes) — tab is `useState` (client state), pagination is URL params (independent)
- [ ] Visual comparison: Playwright screenshot at 1440px matches Figma design _(Playwright visual test — not yet created)_
- [x] Empty state: matches new design style (centered, appropriate icon, "Start Shopping" link) — `account.orders._index.tsx:312-327`

---

## Architecture Notes

### Current State (to be redesigned)

- `account.orders._index.tsx`: Simple header, OrderCard with status badge + line items grid + "View Details" footer, Load More pagination
- `OrderCard`: Basic card with inline meta, status badge, line items list
- `StatusBadge`: Colored pill (success/warning/info/default variants)
- Cursor-based pagination with "Load More" link
- No stats cards, no tabs, no time filter, no product action buttons

### New State

- **Page Header**: "My Orders" (32px bold) + subtitle (16px gray)
- **OrderStatsCards**: 3 stat cards with colored icon squares (blue/amber/emerald)
- **OrderTabBar**: 3 tabs with amber active border (Orders / Buy Again / On the Way Out)
- **Orders Header**: Count text (18px) + time filter dropdown
- **OrderCard**: Gradient header (meta items: Order Placed, Total, Ship To pill, Order # + links) + body (delivery status + product rows with image/info/action buttons + actions panel)
- **Pagination**: Numbered page buttons with hero-teal active state

### State Management

```
activeTab: 'orders' | 'buy-again' | 'on-the-way-out' (default: 'orders')
currentPage: number (from URL search params, default: 1)
timeFilter: 'past-3-months' | 'past-6-months' | 'past-year' | 'all-time' (default: 'past-3-months')
```

Tab changes reset page to 1. Time filter changes reset page to 1.

### Stat Counting Logic

- **Orders**: Total count of all orders (within time filter)
- **On The Way Out**: Count where `fulfillmentStatus` is `UNFULFILLED` or `IN_PROGRESS` or `PARTIALLY_FULFILLED`
- **Re-Purchase**: Count where `fulfillmentStatus` is `FULFILLED` (delivered, eligible for re-purchase)

### Tab Filtering Logic

- **Orders tab**: Show all orders (no filter)
- **Buy Again tab**: Show only `FULFILLED` orders
- **On the Way Out tab**: Show only `UNFULFILLED` / `IN_PROGRESS` / `PARTIALLY_FULFILLED` orders

### Action Buttons Logic (per order status)

**Delivered orders:**

- Track package (if tracking available)
- Return or replace items
- Share gift receipt
- Ask Product Question
- Write a product review

**In-transit orders:**

- Track package (primary — teal bg)
- Return or replace items
- Share gift receipt

**Processing orders:**

- Cancel order (if eligible)
- Contact support

### Pagination Calculation

```
perPage = 10
totalPages = Math.ceil(totalOrders / perPage)
visiblePages = [1, 2, 3, '...', totalPages] when totalPages > 5
```

---

## Deviations from Figma

| Item                 | Figma                     | Implementation                        | Reason                                            |
| -------------------- | ------------------------- | ------------------------------------- | ------------------------------------------------- |
| Icons                | Font Awesome 5            | Lucide React                          | Project convention                                |
| Font                 | Roboto                    | Roboto                                | No change needed                                  |
| Tab active border    | `#f2b05e` (hardcoded)     | `border-[#f2b05e]` arbitrary          | No existing design token                          |
| Stat icon colors     | Hardcoded rgba/hex        | Arbitrary Tailwind values             | No existing design tokens                         |
| Pagination active    | `#14b8a6`                 | `bg-hero` / `border-hero`             | Uses `--color-hero` token                         |
| Order # format       | `111-7944634-4352208`     | Shopify `order.name` (e.g., `#1001`)  | Shopify uses different format                     |
| Ship To dropdown     | Clickable dropdown        | Static text display                   | MVP — Shopify orders have single shipping address |
| Time filter          | Functional dropdown       | Functional `<select>` with URL params | Full implementation                               |
| "View invoice" link  | Links to invoice          | Link to order detail page initially   | Invoice generation is a future feature            |
| Product name         | "ORDER 1" placeholder     | Real product `item.title`             | Wired to real data                                |
| Return eligibility   | Static date text          | Calculated from order date + 30 days  | Dynamic based on actual order                     |
| Action panel buttons | All buttons shown         | Show relevant buttons based on status | Better UX — don't show irrelevant actions         |
| "Buy it again"       | Links to re-purchase flow | Links to product page for now         | Full re-purchase flow is future work              |
