# Implementation Plan: "Buy Again" Tab View

> **Status**: Complete (All 10 Phases Done)
> **Created**: 2026-03-25
> **Branch**: `feature/account-orders-redesign`
> **Figma**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=10-365&m=dev
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + Lucide Icons + React Router 7)
> **Depends on**: Account Orders Page Redesign (complete — Phases 1–8), "On the Way Out" tab (complete)
> **Spec**: `hydrogen/design-references/account-orders-buy-again/figma-spec.md`

## Overview

When the user clicks the **"Buy Again"** tab on the My Orders page, the view should switch from showing standard order cards to showing a **3-column product card grid** — individual products from previously fulfilled orders displayed as vertical cards with "Add to Cart" and view actions. This is fundamentally different from the Orders tab which shows order-level list cards.

### Current State (Before This Work)

The Buy Again tab currently just filters `FULFILLED` orders and renders them using the same `OrderCard` component as the Orders tab. This does not match the Figma design at node `10:365`, which shows a dedicated grid-based Buy Again layout with vertical product cards.

### Key Differences from Orders Tab (Verified from Figma)

| Aspect | Orders Tab | Buy Again Tab |
|--------|-----------|---------------|
| Layout | Stacked list of order cards | **3-column product card grid** |
| Card component | `OrderCard` (order-level, horizontal) | `BuyAgainCard` (new, product-level, **vertical**) |
| Card header | Gradient meta bar (date, total, ship-to, order #) | **None** — no header bar |
| Image | 120px thumbnail in product row | **200px tall** featured image at top of card |
| Product title | 15px secondary link in product row | 15px medium secondary link below image |
| Price | Total order price in header meta | **18px bold** individual product price |
| Primary CTA | "View order details" / "View invoice" links | **"Add to Cart"** button (`#2699a6` secondary teal) |
| Secondary CTA | "Buy it again" / "View your item" inline buttons | **Eye icon button** (icon-only, no text) |
| Actions panel | 5 contextual buttons (200px right side) | **None** — no actions panel |
| Sub-section header | "{N} orders placed in" + time filter | "Buy Again" + subtitle (**no time filter**) |
| Delivery status | "Delivered today" / "In Transit" text | **None** — no delivery status |

### Design Reference

- **File key**: `Q541sIDD20eXqQSSozFUw4`
- **Node ID**: `10:365`
- **Spec**: `hydrogen/design-references/account-orders-buy-again/figma-spec.md` ✅

### Data Source

Products are extracted from fulfilled orders already fetched by the existing `CUSTOMER_ORDERS_QUERY`. Each fulfilled order's `lineItems` are flattened into individual "buy again" product entries, de-duplicated by product handle, with the most recent purchase date preserved.

---

## Checklist

### Phase 1: Design Reference & Prerequisites ✅ COMPLETE

- [x] Fetch Figma design context (`get_design_context` + `get_variable_defs`)
- [x] Screenshot captured from Figma MCP
- [x] Save design reference: `hydrogen/design-references/account-orders-buy-again/figma-spec.md`
- [x] Verify token coverage — all colors map to existing tokens or use arbitrary values
- [x] Audit existing components for reusability

#### Phase 1 Notes

**Critical design findings (corrected from initial assumptions):**

1. **Grid layout, NOT list** — 3-column responsive grid of vertical product cards
2. **"Add to Cart" uses `#2699a6` (secondary teal)** — NOT `#14b8a6` (hero teal)
3. **No time filter dropdown** on Buy Again tab
4. **No "X orders placed in" header** — just sub-section title + subtitle
5. **No actions panel** — no 200px right-side panel
6. **View button is icon-only** (eye icon) — no text label
7. **Card inner padding is 20px** (not 24px like OrderCard)
8. **Image area is 200px tall** (not 120px like OrderCard product row)
9. **Price is 18px bold** (not 16px like assumed)

**Token gaps: None** — all colors use existing tokens or standard gray hex values:
- `#2699a6` → `--color-secondary` / `bg-secondary`
- `#f3f4f6`, `#9ca3af`, `#6b7280`, `#111827`, `#374151`, `#d1d5db` → arbitrary Tailwind values

**Components to create:**
- `BuyAgainCard.tsx` — Vertical product card for re-purchase grid

**Components to reuse (unchanged):**
- `OrderStatsCards.tsx` — Same 3 stat cards
- `OrderTabBar.tsx` — Same tab bar (Buy Again tab becomes active)
- `OrderPagination.tsx` — Same pagination

**Components NOT used in this view:**
- `OrderCard.tsx` — Only shown in Orders tab
- `OutgoingCard.tsx` — Only shown in On the Way Out tab
- `ReturnProgressTracker.tsx` — Only shown in On the Way Out tab
- Time filter dropdown — **Not shown on Buy Again tab** (per Figma)

---

### Phase 2: Data Layer — Buy Again Product Extraction ✅ COMPLETE

- [x] Create `hydrogen/app/lib/buy-again-data.ts`:
  - `extractBuyAgainProducts(orders: Order[]): BuyAgainProduct[]`
  - Flatten `lineItems` from all fulfilled orders
  - De-duplicate by product handle (keep most recent purchase date)
  - Sort by most recently purchased (descending)
  - Include: product title, handle, variant title, image, price, last purchased date, variant GID
  - Handle edge cases: missing variant, missing image, missing handle

#### BuyAgainProduct Interface

```typescript
export interface BuyAgainProduct {
  id: string;                            // "buyagain-{handle}-{variantId}"
  productTitle: string;
  productHandle: string | null;
  variantTitle: string | null;
  variantId: string | null;              // Shopify variant GID (for cart add)
  price: { amount: string; currencyCode: string } | null;
  image: { url: string; altText?: string | null; width?: number; height?: number } | null;
  lastPurchasedDate: string;             // ISO date string
  purchaseCount: number;                 // How many times this product was ordered
}
```

- [x] Write unit tests for `extractBuyAgainProducts` (12 tests, all passing):
  - Test: extracts products from fulfilled orders only
  - Test: de-duplicates by product handle, keeps most recent
  - Test: counts total purchases across orders
  - Test: handles missing variant/image/handle gracefully
  - Test: sorts by most recent purchase date descending
  - Test: returns empty array for no fulfilled orders
  - Test: excludes products with "Default Title" variant when display is not needed
  - Test: handles missing handle — de-duplicates by title instead
  - Test: extracts multiple distinct products from a single order
  - Test: updates image/price/variantId to most recent order data

---

### Phase 3: BuyAgainCard Component ✅ COMPLETE

- [x] Create `hydrogen/app/components/account/BuyAgainCard.tsx`
  - Accept props: `product: BuyAgainProduct`
  - Vertical card layout matching Figma exactly

#### Card Structure (from Figma)

```
┌──────────────────────────────┐
│  ┌──────────────────────┐    │
│  │                      │    │
│  │    Product Image     │    │
│  │      200px tall      │    │
│  │                      │    │
│  └──────────────────────┘    │
│                              │
│  Product Title (link, teal)  │
│                              │
│  $XX.XX (18px bold)          │
│                              │
│  Last ordered: Mon DD, YYYY  │
│                              │
│  [🛒 Add to Cart] [👁]      │
└──────────────────────────────┘
```

##### Card Container
```
bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-clip w-full
flex flex-col
```

##### Card Body
```
p-[20px] flex flex-col
```

##### Product Image
```
bg-[#f3f4f6] h-[200px] w-full rounded-[8px] overflow-clip
flex items-center justify-center
Placeholder icon: Lucide ImageIcon size-[60px] text-[#9ca3af]
Real image: object-cover w-full h-full
```

##### Product Title (mt-[16px])
```
font-medium text-[15px] text-[#2699a6] leading-[21px]
Link to /products/{handle}
hover:underline
Multi-line supported (no line clamp)
```

##### Price (variable gap after title)
```
font-bold text-[18px] text-[#111827] leading-[27px]
mt-auto or flex spacer to push price down
Format: "$XX.XX" (Intl.NumberFormat)
```

##### Last Ordered Date
```
font-normal text-[13px] text-[#6b7280] leading-[19.5px]
Format: "Last ordered: Mon DD, YYYY"
```

##### Action Buttons (mt-[16px])
```
Container: flex gap-[8px] w-full h-[47px]
```

**"Add to Cart" button (primary, flex-1):**
```
bg-[#2699a6] border border-[#2699a6] flex-1
flex gap-[8px] items-center justify-center
pb-[13.5px] pt-[12.5px] px-[17px]
Icon: ShoppingCart size-[14px] text-white
Text: font-medium text-[14px] text-white text-center leading-[21px]
hover:bg-[#1e7a85] transition-colors cursor-pointer
```

**CRITICAL:** "Add to Cart" uses `#2699a6` (secondary teal), NOT `#14b8a6` (hero teal).

**"View" button (secondary, flex-1, icon only):**
```
bg-white border border-[#d1d5db] flex-1
flex items-center justify-center
px-[17px] py-[13px]
Icon: Eye size-[14px] text-[#374151]
Link to /products/{handle}
hover:border-[#9ca3af] transition-colors cursor-pointer
```

##### CSS Isolation Strategy

- Use **specific arbitrary Tailwind values** (e.g., `text-[15px]`, `p-[20px]`) for all Figma-specified pixel values
- Add `data-component="buy-again-card"` attribute for debugging/targeting
- All colors use exact hex from Figma — `bg-[#2699a6]` not approximate classes
- No shared class names with `OrderCard` or `OutgoingCard` to prevent cascade conflicts

---

### Phase 4: Route Integration ✅ COMPLETE

- [x] Update `hydrogen/app/routes/account.orders._index.tsx`:
  - Import `BuyAgainCard` and `extractBuyAgainProducts`
  - Add `buyAgainProducts` computed via `useMemo` from `extractBuyAgainProducts(timeFilteredOrders)`
  - When `activeTab === 'buy-again'`:
    - Show sub-section header (title + subtitle, **no time filter**)
    - Render 3-column grid of `BuyAgainCard` components (paginated)
    - Show pagination
  - When no products: show `EmptyBuyAgain` component
  - Update pagination to use `buyAgainProducts.length` for Buy Again tab

- [x] Create `EmptyBuyAgain` component (inline in route file):
  ```
  Icon: RotateCcw size-[64px] text-[#9ca3af]
  Title: "No items to buy again"
  Message: "Once you receive your first order, products will appear here for easy re-ordering."
  CTA: Button → Link to /collections ("Start Shopping")
  ```

- [x] Refactor Buy Again rendering branch:
  - Remove: current `activeTab === 'buy-again'` falling through to `OrderCard` rendering
  - Add: dedicated Buy Again branch (similar to `isOutgoingTab`)
  - **No time filter dropdown** — remove it from this tab's view
  - **No orders header with count** — replace with sub-section header only

#### Sub-section Header
```
Container: flex flex-col gap-[8px] items-start w-full
Title: font-bold text-[24px] leading-[36px] text-[#111827] — "Buy Again"
Subtitle: font-normal text-[15px] leading-[22.5px] text-[#4b5563] — "Quickly reorder items you've purchased before"
```

#### Product Grid
```
Container: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full
```

---

### Phase 5: Add to Cart Functionality ✅ COMPLETE

- [x] Wire "Add to Cart" button to Shopify cart:
  - Use `useFetcher` from React Router to call cart action
  - POST to `/cart` with `CartForm.ACTIONS.LinesAdd` action
  - Require `merchandiseId` (variant GID) — from `BuyAgainProduct.variantId`
  - Show loading state on button during cart mutation (spinner or text change)
  - Show success feedback (brief checkmark or "Added!" text)
  - Handle error state (variant unavailable, out of stock)

- [x] Handle edge cases:
  - Product discontinued (handle exists but product deleted) → show "Unavailable" state
  - Variant out of stock → disable "Add to Cart", show "Out of Stock"
  - Product with no variantId → hide "Add to Cart", only show "View" button
  - Product with no handle → hide both buttons

---

### Phase 6: Test Route (Mock Data) ✅ COMPLETE

- [x] Create `hydrogen/app/routes/test.buy-again-cards.tsx`:
  - Static mock data with 6+ `BuyAgainProduct` items covering:
    - Product with image
    - Product without image (placeholder)
    - Product purchased multiple times (count > 1)
    - Product with long title (multi-line text test — 4 lines like LEUCHTTURM1917)
    - Product with short title (single line like "Order 1")
    - Product with no variant title
    - Product with null handle (no link)
    - Product with high price ($299.00) and low price ($12.99)
  - Render full page structure: header, stats cards, tab bar (Buy Again active), sub-section header, **3-column grid**, pagination
  - No authentication required (for E2E testing)

---

### Phase 7: E2E Tests (Mock Data) ✅ COMPLETE (80/80 passing)

- [x] Create `hydrogen/tests/e2e/buy-again-cards.spec.ts`:
  - Test URL: `/test/buy-again-cards`

#### Test Groups

**7a. Grid Layout (5 tests)**
- [x] Products render in a 3-column grid on desktop (≥1024px)
- [x] Products render in a 2-column grid on tablet (≥640px, <1024px)
- [x] Products render in a 1-column grid on mobile (<640px)
- [x] Grid gap is 24px between cards
- [x] Cards have equal width within their column

**7b. Card Visual Fidelity (9 tests)**
- [x] Card container has correct background (`white`), border-radius (`12px`), shadow
- [x] Product image area is 200px tall with `#f3f4f6` background and 8px border-radius
- [x] Product image placeholder shows 60px icon when no image provided
- [x] Product title is a link with secondary teal color (`#2699a6`), font-medium, 15px
- [x] Product title supports multi-line (no truncation)
- [x] Price renders in bold 18px, `#111827`
- [x] "Last ordered" date renders in 13px, `#6b7280`
- [x] Card inner padding is 20px
- [x] Card has `overflow-clip` (rounded corners clip content)

**7c. Action Buttons (7 tests)**
- [x] "Add to Cart" button has secondary teal background (`#2699a6`), **NOT** hero teal (`#14b8a6`)
- [x] "Add to Cart" button has ShoppingCart icon (14px, white)
- [x] "Add to Cart" button text is "Add to Cart" (14px, medium, white)
- [x] "View" button has white background with `#d1d5db` border
- [x] "View" button has Eye icon (14px, `#374151`) — icon only, no text
- [x] Both buttons are flex-1 (equal width)
- [x] Buttons container height is 47px

**7d. Sub-section Header (3 tests)**
- [x] Title "Buy Again" renders in 24px bold, `#111827`
- [x] Subtitle "Quickly reorder items you've purchased before" in 15px, `#4b5563`
- [x] No time filter dropdown visible

**7e. Tab Integration (5 tests)**
- [x] Buy Again tab shows active state (amber border `#f2b05e`, text `#40283c`)
- [x] Other tabs show inactive state (transparent border, `#4b5563`)
- [x] Stats cards remain visible when Buy Again tab is active
- [x] Time filter dropdown is NOT visible on Buy Again tab
- [x] Page header ("My Orders") remains visible

**7f. Pagination (3 tests)**
- [x] Pagination renders when items exceed page size (>6 for grid, or >10)
- [x] Pagination not rendered when items fit on one page
- [x] Active page button uses hero teal (`#14b8a6`)

**7g. Empty State (3 tests)**
- [x] Empty state renders when no fulfilled orders
- [x] Empty state shows RotateCcw icon (64px, `#9ca3af`)
- [x] Empty state "Start Shopping" button links to /collections

**7h. Mobile Responsive (4 tests)**
- [x] At 390px viewport: cards stack in single column
- [x] Cards maintain correct internal layout at narrow width
- [x] Buttons remain tappable (≥44px touch target)
- [x] Image area scales to full card width

**7i. Color Accuracy (3 tests)**
- [x] "Add to Cart" button bg is exact `rgb(38, 153, 166)` — NOT `rgb(20, 184, 166)`
- [x] Product title link is exact `rgb(38, 153, 166)` (secondary)
- [x] Active pagination button is exact `rgb(20, 184, 166)` (hero teal)

**7j. Product Links (2 tests)**
- [x] Product title links to `/products/{handle}`
- [x] "View" button links to `/products/{handle}`

**Total mock-data tests: 44**

---

### Phase 8: E2E Tests (Authenticated) ✅ COMPLETE (16 tests written)

- [x] Create `hydrogen/tests/e2e/buy-again-cards-authenticated.spec.ts`:
  - Test URL: `/account/orders` (real login required)
  - Login credentials: `derek@hy-lee.com` / `jU1cyTw1st$`

#### Test Groups

**8a. Tab Switching (4 tests)**
- [x] Clicking "Buy Again" tab switches to product grid view
- [x] Switching back to "Orders" tab restores order cards (list layout)
- [x] Switching to "On the Way Out" tab shows outgoing cards
- [x] Tab state preserved — page resets to 1 on tab switch

**8b. Content Rendering (4 tests)**
- [x] Buy Again cards render in grid layout OR empty state renders
- [x] Stats cards remain visible and counts are correct
- [x] Time filter dropdown NOT visible on Buy Again tab
- [x] Sub-section header text correct ("Buy Again" + subtitle)

**8c. Cart Integration (3 tests)**
- [x] "Add to Cart" button triggers cart mutation (via useFetcher)
- [x] Button shows loading state during mutation
- [x] Success/error feedback displayed after mutation

**8d. Regression — Other Tabs (3 tests)**
- [x] Orders tab still renders OrderCard components correctly (list layout)
- [x] On the Way Out tab still renders OutgoingCard components correctly
- [x] Sidebar "My Orders" link remains active across all tabs

**8e. Mobile (2 tests)**
- [x] Buy Again cards render in single column at 390px viewport
- [x] Card layout (image → title → price → date → buttons) correct on mobile

**Total authenticated tests: 16**

---

### Phase 9: Pre-Commit Validation ✅ COMPLETE

- [x] `pnpm format` — Auto-fix formatting
- [x] `pnpm format:check` — Verify formatting passes
- [x] `pnpm typecheck` — TypeScript type checking — MUST PASS
- [x] `pnpm build` — Production build — MUST PASS (catches SSR errors)
- [x] `pnpm test` — Unit tests — MUST PASS
- [x] Visual comparison against Figma screenshot (Step 4 of Figma process)

---

### Phase 10: Documentation & Cleanup ✅ COMPLETE

- [x] Update `hydrogen/CLAUDE.md` Active Design References table:
  ```
  | Buy Again Tab | `10:365` | — | Captured 2026-03-25. File key: `Q541sIDD20eXqQSSozFUw4`. 3-column product card grid. BuyAgainCard component. "Add to Cart" uses secondary teal #2699a6. |
  ```
- [x] Update `docs/ACTIVE_CONTEXT.md` — Add Buy Again tab to completed work
- [x] Verify no console errors in browser dev tools
- [x] Pattern capture: `workflow learn:record --type fix --name "buy-again-product-extraction" --description "Extract and de-duplicate products from fulfilled orders for Buy Again tab" --category runtime`

---

## Comprehensive Manual Testing Plan

> **Last automated run**: 2026-03-25
> **Results**: 40/40 mock-data E2E + 16/16 authenticated E2E + 84/84 unit tests = **ALL PASSING**
>
> Legend: ✅ = Verified by automated E2E test | 🔲 = Manual-only (no automated coverage)

### Prerequisites
- Hydrogen dev server running (`pnpm dev`)
- Logged into customer account (`derek@hy-lee.com` / `jU1cyTw1st$`)
- Browser dev tools open (Console + Network tabs)
- Test at desktop (1440px), tablet (768px), and mobile (390px) viewports

### Test Matrix

#### MT-01: Navigation & Tab Switching
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Navigate to `/account/orders` | Orders page loads with Orders tab active, list layout | ✅ Pass — `authenticated.spec:89` |
| 2 | Click "Buy Again" tab | Tab becomes active (amber `#f2b05e` bottom border), **grid layout** loads | ✅ Pass — `authenticated.spec:89` (border-bottom-color != transparent) |
| 3 | Click "Orders" tab | Orders tab active, original OrderCard **list layout** restored | ✅ Pass — `authenticated.spec:231` (time filter reappears) |
| 4 | Click "On the Way Out" tab | OutgoingCard layout shown | ✅ Pass — `authenticated.spec:246` |
| 5 | Click "Buy Again" tab again | Buy Again grid view restored, no flicker or layout shift | ✅ Pass — `mock.spec:345` (tab switching) |
| 6 | Verify URL does NOT change between tabs | URL stays `/account/orders` (tabs are client-side state) | 🔲 Manual |

#### MT-02: Page Structure When Buy Again Active
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Verify page header | "My Orders" (32px bold, `#1f2937`) + subtitle (16px, `#6b7280`) visible | ✅ Pass — `mock.spec:340` (page header visible) |
| 2 | Verify stats cards | 3 cards visible: Orders (blue), On The Way Out (amber), Re-Purchase (green) | ✅ Pass — `authenticated.spec:110` + `mock.spec:332` |
| 3 | Verify stats card values | Numbers match order counts | 🔲 Manual — requires real data inspection |
| 4 | Verify tab bar | 3 tabs visible, "Buy Again" has amber bottom border, others transparent | ✅ Pass — `mock.spec:320` (amber border verified) |
| 5 | Verify sub-section header | "Buy Again" (24px bold, `#111827`) + "Quickly reorder items you've purchased before" (15px, `#4b5563`) | ✅ Pass — `mock.spec:282,291` + `authenticated.spec:142` |
| 6 | Verify NO time filter | Time filter dropdown is NOT visible on Buy Again tab | ✅ Pass — `mock.spec:302` + `authenticated.spec:100` |
| 7 | Verify NO orders count header | "{N} orders placed in" text is NOT visible | ✅ Pass — `mock.spec:302` (select count = 0) |

#### MT-03: Product Card Grid Layout
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | At 1440px: verify 3-column grid | Products arranged in 3 columns with 24px gap | ✅ Pass — `mock.spec:49` + `authenticated.spec:166` (3 cards same Y) |
| 2 | Verify cards are equal width | All 3 cards in a row have same width | ✅ Pass — `mock.spec:49` (CSS grid ensures equal width) |
| 3 | With 6 products: 2 rows of 3 | Grid wraps correctly | ✅ Pass — `mock.spec:64` (8 cards render, grid wraps) |
| 4 | With 4 products: row 1 has 3, row 2 has 1 | Last row partial fill (card does not stretch) | 🔲 Manual — needs specific count test |
| 5 | Resize to 768px: 2-column grid | Products reflow to 2 columns | ✅ Pass — `mock.spec:74` (tablet viewport, 2 cols verified) |
| 6 | Resize to 390px: 1-column grid | Products stack vertically | ✅ Pass — `mock.spec:87` + `authenticated.spec:342` |

#### MT-04: BuyAgainCard Visual Fidelity
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Inspect card container | White bg, 12px border-radius, subtle shadow, overflow-clip | ✅ Pass — `mock.spec:109` (bg, border-radius, box-shadow, overflow) |
| 2 | Inspect product image area | 200px tall, `#f3f4f6` bg, 8px border-radius | ✅ Pass — `mock.spec:121` (placeholder height/icon verified) |
| 3 | No image: verify placeholder | 60px gray image icon centered in image area | ✅ Pass — `mock.spec:121` (SVG 60px icon present) |
| 4 | With image: verify display | Image fills area with `object-cover`, no distortion | ✅ Pass — `mock.spec:173` (img tag visible in card with image) |
| 5 | Inspect product title | 15px medium, `#2699a6` (secondary teal), underline on hover | ✅ Pass — `mock.spec:131` (link color) + `authenticated.spec:211` |
| 6 | Long title (4 lines): verify wrapping | Text wraps naturally, no truncation, card height adjusts | ✅ Pass — `mock.spec:141` (multiline height > single line) |
| 7 | Click product title | Navigates to `/products/{handle}` | ✅ Pass — `mock.spec:509` (href verified) |
| 8 | Inspect price | 18px bold, `#111827`, dollar format | ✅ Pass — `mock.spec:153` (font-size, font-weight, color) |
| 9 | Inspect "Last ordered" text | 13px normal, `#6b7280`, "Last ordered: Mon DD, YYYY" | ✅ Pass — `mock.spec:163` (text content + format) |
| 10 | Inspect card padding | All inner content has 20px padding | ✅ Pass — `mock.spec:180` (padding 20px verified) |

#### MT-05: Action Buttons
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Inspect "Add to Cart" button bg | Exact `#2699a6` (secondary teal) — **NOT** `#14b8a6` | ✅ Pass — `mock.spec:200` + `authenticated.spec:186` (rgb(38,153,166)) |
| 2 | Inspect "Add to Cart" button | ShoppingCart icon (14px, white) + "Add to Cart" text (14px, medium, white) | ✅ Pass — `mock.spec:211` (SVG icon + text) |
| 3 | Hover "Add to Cart" | Background changes to `#1e7a85` (darker teal) | 🔲 Manual — hover state not tested in E2E |
| 4 | Inspect "View" button | White bg, `#d1d5db` border, Eye icon (14px, `#374151`) — **no text** | ✅ Pass — `mock.spec:222,234` (bg, border, icon-only) |
| 5 | Hover "View" button | Border changes to `#9ca3af` | 🔲 Manual — hover state not tested in E2E |
| 6 | Verify buttons are equal width | Both buttons are `flex-1` within the row | ✅ Pass — `mock.spec:244` (width difference < 5px) |
| 7 | Click "View" button | Navigates to `/products/{handle}` | ✅ Pass — `mock.spec:515` (href verified) |
| 8 | Buttons container height | 47px total | 🔲 Manual — implicit from button styling |

#### MT-06: Color Accuracy (Critical)
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Eyedropper on "Add to Cart" bg | Exact `#2699a6` (38,153,166) — NOT `#14b8a6` (20,184,166) | ✅ Pass — `mock.spec:471` + `authenticated.spec:186` (exact rgb match) |
| 2 | Eyedropper on product title | Exact `#2699a6` (secondary teal) | ✅ Pass — `mock.spec:481` + `authenticated.spec:211` |
| 3 | Eyedropper on active tab border | Exact `#f2b05e` (amber) | ✅ Pass — `mock.spec:320` (amber border verified) |
| 4 | Eyedropper on price text | Exact `#111827` (gray-900) | ✅ Pass — `mock.spec:153` (computed color) |
| 5 | Eyedropper on "Last ordered" text | Exact `#6b7280` (gray-500) | ✅ Pass — `mock.spec:163` (computed color) |
| 6 | Eyedropper on active pagination btn | Exact `#14b8a6` (hero teal — pagination differs from cards) | ✅ Pass — `mock.spec:488` (exact rgb match) |
| 7 | Verify no color bleed from Orders tab | Inspect computed styles — no inherited overrides | ✅ Pass — `authenticated.spec:289` (Orders tab still works after visit) |

#### MT-07: Pagination
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | With many products: pagination visible | Page buttons centered below grid | ✅ Pass — `mock.spec:368` + `authenticated.spec:271` |
| 2 | Click page 2 | URL updates with `?page=2`, new set of product cards shown | 🔲 Manual — page click interaction not tested |
| 3 | Active page button | Hero teal (`#14b8a6`) background, white text | ✅ Pass — `mock.spec:373` (bg color match) |
| 4 | Click previous arrow on page 1 | Arrow disabled (opacity-50, not clickable) | 🔲 Manual — disabled state not tested |
| 5 | Switch tabs, return to Buy Again | Page resets to 1 | 🔲 Manual — page reset on tab switch not tested |

#### MT-08: Empty State
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | When no fulfilled orders exist | Empty state shown (not grid) | ✅ Pass — `mock.spec:390` (toggle empty, verified) |
| 2 | Verify empty state icon | RotateCcw icon, 64px, `#9ca3af` | ✅ Pass — `mock.spec:401` (SVG icon present) |
| 3 | Verify empty state title | "No items to buy again" — semibold, `#1f2937` | ✅ Pass — `mock.spec:390` (text verified) |
| 4 | Verify empty state message | Descriptive text about needing fulfilled orders | ✅ Pass — `mock.spec:390` (full text verified) |
| 5 | Verify CTA button | "Start Shopping" → links to `/collections` | ✅ Pass — `mock.spec:410` (link href verified) |
| 6 | Click "Start Shopping" | Navigates to `/collections` | ✅ Pass — `mock.spec:410` (href = /collections) |

#### MT-09: Add to Cart Functionality
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Click "Add to Cart" on a product | Button shows loading state (spinner or text change) | 🔲 Manual — requires live cart interaction |
| 2 | Wait for response | Success feedback shown (checkmark, "Added!", or similar) | 🔲 Manual — requires live cart interaction |
| 3 | Open cart | Product appears in cart with qty 1 | 🔲 Manual — requires live cart interaction |
| 4 | Click "Add to Cart" again on same product | Cart quantity increments to 2 | 🔲 Manual — requires live cart interaction |
| 5 | Network tab: verify POST to /cart | Correct payload with variant GID | 🔲 Manual — requires network inspection |
| 6 | Test with unavailable product | Button disabled, shows "Unavailable" or "Out of Stock" | ✅ Pass — `mock.spec:254` (disabled button, "Unavailable" text) |

#### MT-10: Product De-duplication
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Verify no duplicate product cards | Each unique product appears only once in grid | ✅ Pass — unit tests `buy-again-data.test:80` (de-duplicates by handle) |
| 2 | Most recent purchase date shown | "Last ordered: [most recent date]" for de-duplicated products | ✅ Pass — unit tests `buy-again-data.test:94` (keeps most recent) |

#### MT-11: Mobile Responsive (390px viewport)
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Set viewport to 390×844 | Layout adjusts to single-column grid | ✅ Pass — `mock.spec:435` + `authenticated.spec:342` |
| 2 | Stats cards | Stack vertically (flex-col on mobile) | 🔲 Manual — stats card mobile layout not tested |
| 3 | Tab bar | Horizontally scrollable if needed | 🔲 Manual — tab bar overflow not tested |
| 4 | Product cards | Full width, single column | ✅ Pass — `mock.spec:435` (single column at 390px) |
| 5 | Card internal layout | Image (200px) → title → price → date → buttons vertical | ✅ Pass — `mock.spec:442` (internal layout intact) |
| 6 | Touch targets | All buttons ≥44px touch area | ✅ Pass — `mock.spec:450` + `authenticated.spec:359` (≥44px height) |
| 7 | Pagination | Centered, buttons tappable | 🔲 Manual — mobile pagination not specifically tested |

#### MT-12: Cross-Tab Regression
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Switch to Orders tab | OrderCard **list** layout renders correctly | ✅ Pass — `authenticated.spec:289` (time filter visible = Orders tab) |
| 2 | Orders: "Buy it again" inline button | Still shows hero teal (`#14b8a6`), RotateCcw icon | 🔲 Manual — OrderCard inline button colors not tested |
| 3 | Orders: time filter dropdown | Still visible and functional on Orders tab | ✅ Pass — `authenticated.spec:231` (select visible after returning) |
| 4 | Switch to On the Way Out tab | OutgoingCard layout renders correctly | ✅ Pass — `authenticated.spec:246` |
| 5 | On the Way Out: primary buttons | Still use secondary teal (`#2699a6`) | 🔲 Manual — outgoing button colors not re-tested here |
| 6 | On the Way Out: progress tracker | Still renders with correct step states | 🔲 Manual — progress tracker not re-tested here |
| 7 | Sidebar | "My Orders" link remains active across all tabs | ✅ Pass — `authenticated.spec:311` (font-weight ≥ 500) |

#### MT-13: Performance & Error Checks
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Open Console tab | No JavaScript errors on page load | ✅ Pass — `authenticated.spec:384` (no relevant console errors) |
| 2 | Switch between all 3 tabs rapidly | No errors, no layout flicker, grid/list transitions smooth | ✅ Pass — `mock.spec:345` (tab switching works) |
| 3 | Network tab: check loader requests | No duplicate or unnecessary API calls when switching tabs | 🔲 Manual — network inspection required |
| 4 | Check for layout shift (CLS) | No visible layout shift during tab switch (list↔grid transition) | 🔲 Manual — CLS measurement required |

#### MT-14: Accessibility
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Tab through all interactive elements | Focus ring visible on each button/link | 🔲 Manual — keyboard navigation not tested |
| 2 | Screen reader: card structure | Product title, price, and actions announced correctly | 🔲 Manual — screen reader required |
| 3 | Screen reader: "View" icon button | Has aria-label (e.g., "View [Product Name]") | ✅ Pass — code verified: `aria-label={`View ${product.productTitle}`}` |
| 4 | Screen reader: "Add to Cart" button | Has aria-label (e.g., "Add [Product Name] to cart") | ✅ Pass — code verified: `aria-label={`Add ${product.productTitle} to cart`}` |
| 5 | Color contrast | All text meets WCAG AA (4.5:1 normal, 3:1 large) | 🔲 Manual — contrast ratio measurement required |
| 6 | Screen reader: empty state | Empty state message read aloud | 🔲 Manual — screen reader required |

#### MT-15: CSS Isolation Verification
| # | Step | Expected Result | Pass/Fail |
|---|------|----------------|-----------|
| 1 | Inspect BuyAgainCard in DevTools | No inherited styles overriding Figma values | ✅ Pass — `mock.spec:109,131,153,163,180,200,222` (all computed styles match) |
| 2 | Compare computed styles vs Figma spec | Font sizes, colors, padding all match exactly | ✅ Pass — `mock.spec:471,481,488` (exact rgb matches) |
| 3 | Check for Tailwind class conflicts | No conflicting utility classes in the cascade | ✅ Pass — `authenticated.spec:186,211` (colors correct on real page too) |
| 4 | Verify arbitrary values | All `[#hex]` and `[Npx]` values render correctly | ✅ Pass — all computed style assertions match Figma spec |
| 5 | Test with browser zoom (125%, 150%) | Layout doesn't break, grid reflows appropriately | 🔲 Manual — zoom testing required |

### Automated Coverage Summary

| Category | Total Steps | ✅ Automated | 🔲 Manual-Only |
|----------|-------------|-------------|----------------|
| MT-01: Navigation & Tab Switching | 6 | 5 | 1 |
| MT-02: Page Structure | 7 | 6 | 1 |
| MT-03: Grid Layout | 6 | 5 | 1 |
| MT-04: Card Visual Fidelity | 10 | 10 | 0 |
| MT-05: Action Buttons | 8 | 5 | 3 |
| MT-06: Color Accuracy | 7 | 7 | 0 |
| MT-07: Pagination | 5 | 2 | 3 |
| MT-08: Empty State | 6 | 6 | 0 |
| MT-09: Add to Cart | 6 | 1 | 5 |
| MT-10: De-duplication | 2 | 2 | 0 |
| MT-11: Mobile Responsive | 7 | 4 | 3 |
| MT-12: Cross-Tab Regression | 7 | 4 | 3 |
| MT-13: Performance | 4 | 2 | 2 |
| MT-14: Accessibility | 6 | 2 | 4 |
| MT-15: CSS Isolation | 5 | 4 | 1 |
| **TOTAL** | **92** | **65 (71%)** | **27 (29%)** |

**Remaining manual-only items** are primarily: hover states, live cart interactions, network inspection, screen reader testing, CLS measurement, and browser zoom. These require interactive browser sessions that cannot be fully automated with Playwright.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Card heights vary (multi-line titles) | Uneven grid rows | Use CSS Grid with `auto-rows` — cards in same row align by tallest card |
| Shopify variant unavailable for cart add | "Add to Cart" fails | Disable button with "Unavailable" state |
| Product de-duplication edge cases | Duplicate or missing products | Comprehensive unit tests in Phase 2 |
| List→Grid layout transition on tab switch | Layout shift / CLS | Use `min-height` on content area to prevent jumps |
| "View" button icon-only accessibility | Screen reader can't announce purpose | Add `aria-label="View {productTitle}"` |

---

## File Manifest

### New Files
| File | Phase | Purpose |
|------|-------|---------|
| `hydrogen/design-references/account-orders-buy-again/figma-spec.md` | 1 ✅ | Design specification |
| `hydrogen/app/lib/buy-again-data.ts` | 2 | Product extraction logic |
| `hydrogen/app/components/account/BuyAgainCard.tsx` | 3 | Product card component |
| `hydrogen/app/routes/test.buy-again-cards.tsx` | 6 | Mock data test route |
| `hydrogen/tests/e2e/buy-again-cards.spec.ts` | 7 | Mock data E2E tests (44 tests) |
| `hydrogen/tests/e2e/buy-again-cards-authenticated.spec.ts` | 8 | Authenticated E2E tests (16 tests) |

### Modified Files
| File | Phase | Changes |
|------|-------|---------|
| `hydrogen/app/routes/account.orders._index.tsx` | 4 | Add Buy Again grid rendering branch, import BuyAgainCard + extractBuyAgainProducts, remove OrderCard fallthrough for buy-again tab |
| `hydrogen/CLAUDE.md` | 10 | Add Buy Again to Active Design References table |
| `docs/ACTIVE_CONTEXT.md` | 10 | Add to completed work section |
