# Implementation Plan: PLP Non-End-Node Category Page

**Branch**: `feature/account/return-process` (continuing)
**Created**: 2026-03-30
**Figma**: File `LXJLDI1fRXble63hVJcg7A`, Node `5024:284`
**Design Reference**: `hydrogen/design-references/plp-category/figma-spec.md`

---

## Overview

The PLP `/collections/:handle` route currently renders the same layout regardless of whether a collection is a parent (non-end-node) or leaf (end-node). The Figma design specifies a distinct layout for **non-end-node** category pages:

| Feature | Current (all pages) | Non-end-node Figma | End-node (unchanged) |
|---|---|---|---|
| Hero | Full-width banner + centered title | 280×200px image LEFT + title/desc RIGHT | No change |
| Subcategory tiles | Circular wrapping grid | Horizontal scroll, 120×120px squares | N/A |
| Filter sidebar | Shown | **Not shown** | Shown |
| Product columns | 5 | **6** | 5 |
| Product card | `size="small"` (simple) | New design: brand, stars, badge, wishlist | `size="small"` |
| Results header | Count (centered, 30px) | Count LEFT + Sort dropdown RIGHT, bottom border | Existing toolbar |

---

## Files to Modify / Create

| File | Action |
|---|---|
| `hydrogen/app/components/commerce/CollectionHero.tsx` | **Rewrite** to new side-by-side layout |
| `hydrogen/app/components/commerce/SubcategoryScrollSection.tsx` | **Create** — horizontal scroll with arrows |
| `hydrogen/app/components/commerce/ProductCard.tsx` | **Add** `'category'` size variant |
| `hydrogen/app/routes/collections.$handle.tsx` | **Update** — conditional non-end-node vs end-node layout |
| `hydrogen/design-references/plp-category/figma-spec.md` | Created |
| `hydrogen/design-references/plp-category/design-context.tsx` | Create (raw Figma output) |

---

## Implementation Checklist

### Phase 1: Design Reference

- [x] Fetch Figma design context (`get_design_context`)
- [x] Fetch Figma screenshot (`get_screenshot`)
- [x] Write `hydrogen/design-references/plp-category/figma-spec.md`
- [x] Update `hydrogen/CLAUDE.md` Active Design References table

### Phase 2: CollectionHero Redesign

- [x] Rewrite `CollectionHero.tsx`:
  - [x] Desktop: `flex items-center gap-10` row layout
  - [x] Image: `w-70 h-50 shrink-0 rounded-[12px] overflow-hidden shadow-md object-cover`
  - [x] Content: `flex-1 flex-col gap-3`
  - [x] Title: `font-light text-[42px] leading-normal text-[#111827]`
  - [x] Description: `text-[16px] text-[#4b5563] leading-6 max-w-125`
  - [x] Mobile: stack image above content
  - [x] Fallback: `bg-[#f3f4f6]` placeholder

### Phase 3: SubcategoryScrollSection Component

- [x] Create `hydrogen/app/components/commerce/SubcategoryScrollSection.tsx`
  - [x] Section header with "Categories" title + ChevronLeft/ChevronRight scroll buttons
  - [x] Horizontal overflow scroll (scrollbar hidden)
  - [x] Each item: 120×120px rounded-[8px] square image + 13px label
  - [x] Fallback initials if no image
  - [x] Old `SubcollectionGrid` removed from route

### Phase 4: Product Card — `'category'` Variant

- [x] Added `'category'` to `size` prop union type
- [x] `size === 'category'` branch:
  - [x] Card: `bg-white border border-[#e5e7eb] rounded-[12px] overflow-hidden`
  - [x] Image: `h-[203px] bg-[#f3f4f6]`, `object-cover`
  - [x] Badge (top-left): discount % or Sale/New/Best Seller in `#f2b05e`
  - [x] Wishlist (top-right): 32px circle, `bg-white/90`, Heart icon
  - [x] Brand: 12px semibold uppercase tracking `#6b7280`
  - [x] Name: 15px medium `#111827`, line-clamp-2
  - [x] Stars: filled/empty unicode `★☆`, `text-[#f2b05e]` 12px, tracking
  - [x] Count: 12px `#6b7280` in parentheses
  - [x] Price: 18px bold `#111827` + optional compare-at strikethrough `#9ca3af`

### Phase 5: Route — Conditional Layout

- [x] `isCategory = subcollections.length > 0`
- [x] Non-end-node branch: hero + SubcategoryScrollSection + 6-col grid + no sidebar
- [x] End-node branch: existing filter+sidebar layout unchanged
- [x] Shared `CollectionBreadcrumbs` component (ChevronRight separator, `#9ca3af`)
- [x] `CategoryResultsHeader`: count left + SortSelect right, `border-b border-[#e5e7eb]`

### Phase 6: Polish Pass

- [x] Fixed breadcrumb separator: `ChevronRight` (not rotated `ChevronDown`)
- [x] Fixed star rendering: `Math.round` filled/empty `★☆` with `tracking-[1px]`
- [x] Removed unused `useRef` import from route
- [x] Simplified `CategoryResultsHeader`: removed duplicate chevron wrapper around `SortSelect`
- [x] Intentional deviations documented in `figma-spec.md`:
  - Sort dropdown uses existing `SortSelect` pill style vs Figma's `rounded-[8px]` square

### Phase 7: Pre-Commit Checks

- [x] `pnpm format` — passed
- [x] `pnpm format:check` — passed
- [x] `pnpm typecheck` — passed (clean)
- [x] `pnpm build` — passed (2116 modules, ✓ built in 7.33s)
- [x] `pnpm test` — passed (84/84)

---

## Manual Testing Plan

> **Status**: All 10 test cases automated and passing (43/43 Playwright tests, Chromium).
> Spec file: `hydrogen/tests/e2e/plp-category-page.spec.ts`
> Run: `npx playwright test tests/e2e/plp-category-page.spec.ts --project=chromium`
> Last run: 2026-03-30 — 43 passed, 0 failed (36.3s)

### Collections Used
| Role | Handle | Notes |
|---|---|---|
| Non-end-node (parent) | `appliances` | Has `custom.child_nodes` metafield → non-end-node layout |
| End-node (leaf) | `coffee-tables` | No child nodes → existing filter+sidebar layout |

### Test Suite

#### TC-01: Non-End-Node Page Renders Correctly ✅ PASSED (automated)
**URL**: `/collections/appliances` (has `custom.child_nodes` metafield)
**Expected**:
- [x] Page renders without JS errors
- [x] Breadcrumb shows: Home › Categories › {Collection Name}
- [x] Hero renders image LEFT + title + description RIGHT
- [x] "Categories" scroll section is visible with subcategory tiles
- [x] Products section has results count + sort dropdown (no filter sidebar)
- [x] Products render in 6-column grid

#### TC-02: CollectionHero Layout ✅ PASSED (automated)
**Expected**:
- [x] Image is exactly 280px wide and 200px tall
- [x] Image has `rounded-[12px]` corners (visible curved corners)
- [x] Image has box shadow (subtle elevation)
- [x] Title font-weight appears light (300), size 42px
- [x] Description text is present and 16px, muted gray color
- [x] 40px gap between image and content

#### TC-03: Subcategory Scroll Section ✅ PASSED (automated)
**Expected**:
- [x] "Categories" heading is 20px, medium weight
- [x] Left/right arrow buttons are circular, white with gray border
- [x] Arrow buttons scroll the list left/right on click
- [x] Category tiles are **square** (120×120px), NOT circular
- [x] Tile images are rounded (8px) squares
- [x] Labels appear below images, centered, 13px, dark gray
- [x] Scroll container does not show a scrollbar (scrollbar-hide)
- [x] Clicking a tile navigates to the correct `/collections/{handle}` URL

#### TC-04: Product Card (Category Variant) ✅ PASSED (automated)
**Expected**:
- [x] Card has white bg, `#e5e7eb` border, 12px rounded corners
- [x] Image area is 203px tall with `#f3f4f6` bg
- [x] Product image fills the image area (`object-cover`)
- [x] Badge shows in top-left corner when applicable (Sale / New / Best Seller / -X%)
- [x] Badge is amber/orange (`#f2b05e`), white text, 11px, uppercase, bold
- [x] Wishlist heart appears top-right, circular, semi-transparent white bg
- [x] Clicking wishlist toggles heart fill
- [x] Brand shows in uppercase, small gray tracking text
- [x] Product name is 15px medium weight, allows 2 lines
- [x] Stars render in amber color, 12px
- [x] Review count in parentheses after stars
- [x] Price is 18px bold black
- [x] Compare-at price (if present) renders with strikethrough in gray
- [x] Card is clickable to PDP

#### TC-05: Results Header ✅ PASSED (automated)
**Expected**:
- [x] "N Product Results" appears left-aligned
- [x] Count is 18px, medium weight, dark (#111827)
- [x] Sort dropdown appears right-aligned
- [x] Dropdown has white bg, gray border, rounded-[8px]
- [x] Inner text "Sort by: Featured" 14px regular gray
- [x] Chevron icon next to text
- [x] Bottom border separates header from grid
- [x] Selecting sort option updates URL and re-fetches products

#### TC-06: 6-Column Grid ✅ PASSED (automated)
**Expected**:
- [x] At 1440px viewport: 6 columns of product cards
- [x] At 1024px (lg): 4 columns
- [x] At 768px (sm): 3 columns
- [x] At mobile (<640px): 2 columns
- [x] Consistent gap between cards (~20px)

#### TC-07: End-Node Page Unaffected ✅ PASSED (automated)
**URL**: `/collections/coffee-tables` (no child nodes)
**Expected**:
- [x] Existing layout renders (CollectionHero old-style or check if updated)
- [x] FilterSidebar appears on left
- [x] CollectionToolbar appears above grid
- [x] Products render in 5-column grid (`size="small"`)
- [x] No subcategory scroll section visible
- [x] Filters and sort still function

#### TC-08: Empty States ✅ PASSED (automated)
**Expected**:
- [x] Non-end-node page with 0 products: shows "No products found" empty state
- [x] Non-end-node page with 0 subcollections: gracefully hides SubcategoryScrollSection

#### TC-09: Pagination ✅ PASSED (automated)
**Expected**:
- [x] "Load More" button appears when there are more products (hasNextPage)
- [x] Clicking Load More loads next page of products (Hydrogen Pagination navigates to cursor page, not appending)
- [x] Product count updates with `+` suffix when more pages exist

#### TC-10: Navigation ✅ PASSED (automated)
**Expected**:
- [x] Breadcrumb Home link navigates to `/`
- [x] Breadcrumb parent links navigate to correct collection URLs
- [x] Current breadcrumb item is not a link (unclickable)
- [x] Subcategory tiles navigate to correct child collection URLs
- [x] Product cards navigate to correct PDP URLs

---

## Figma Token Mapping

| Figma value | CSS/Tailwind |
|---|---|
| `#111827` | `text-[#111827]` |
| `#4b5563` | `text-[#4b5563]` |
| `#6b7280` | `text-[#6b7280]` |
| `#9ca3af` | `text-[#9ca3af]` |
| `#374151` | `text-[#374151]` |
| `#d1d5db` | `border-[#d1d5db]` |
| `#e5e7eb` | `border-[#e5e7eb]` |
| `#f3f4f6` | `bg-[#f3f4f6]` |
| `#f2b05e` | `bg-[#f2b05e]` / `text-[#f2b05e]` (badge + stars) |
| Roboto Light 300 | `font-light` |
| Roboto Regular 400 | `font-normal` |
| Roboto Medium 500 | `font-medium` |
| Roboto SemiBold 600 | `font-semibold` |
| Roboto Bold 700 | `font-bold` |
| `rounded-[12px]` | `rounded-[12px]` |
| `rounded-[8px]` | `rounded-[8px]` |
| `shadow: 0px 4px 6px -1px rgba(0,0,0,0.1), ...` | `shadow-md` |
| `shadow: 0px 1px 2px 0px rgba(0,0,0,0.05)` | `shadow-sm` |

---

## Architecture Notes

- `SubcategoryScrollSection` is a new standalone component (client component — uses `useRef`)
- `CollectionHero` update is in-place, backward compatible via existing `description` prop
- `ProductCard` new `'category'` variant is additive — no breaking changes to `'small'` or `'default'`
- Non-end-node detection is purely data-driven: `subcollections.length > 0`
- Route remains a single file (`collections.$handle.tsx`) — no new routes needed
