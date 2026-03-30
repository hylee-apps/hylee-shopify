# Figma Spec — PLP End-Node (Leaf Collection) Page

**File Key**: `LXJLDI1fRXble63hVJcg7A`
**Node ID**: `5030:728`
**Captured**: 2026-03-30
**Frame**: ~1400px wide (max-w-[1400px] container)
**Variant**: Default (Home & Garden end-node)

This design applies to **end-node (leaf) collection pages** — pages that have NO child subcollections. These are the actual product listing pages where customers filter and browse products.

> **Key difference from non-end-node**: No CollectionHero, no SubcategoryScrollSection. Page goes directly breadcrumbs → sidebar+grid layout. Filter sidebar is a card with redesigned sections. Product grid is 4-column with taller (250px) cards.

---

## Section 1: Breadcrumbs (`nav.breadcrumb`)

- Container: `max-w-[1400px] px-[24px] py-[16px]` flex row, `gap-[8px]`, `items-center`
- Inactive items: Roboto Regular 14px, `#4b5563`, `leading-[21px]`
- Current item (last): Roboto Medium 14px, `#111827`, `leading-[21px]`
- Separator `›`: Font Awesome icon, `#9ca3af`, 12px (use `ChevronRight` from Lucide)
- **No hero section below breadcrumbs** — goes directly to listing layout

---

## Section 2: Listing Layout (`div.listing-layout`)

- Container: `max-w-[1400px] p-[24px] gap-[32px] flex items-start`
- Two columns: **sidebar** (240px fixed, `shrink-0`) + **main** (`flex-1`)

---

## Section 3: Filter Sidebar (`aside#filterSidebar`)

### Outer Card
- `bg-white border border-[#e5e7eb] rounded-[12px] w-[240px] sticky top-0 shrink-0`
- Inner padding: `pb-[33px] pt-[21px] px-[21px]`
- Gap between sections: `gap-[20px] flex flex-col`

### Sidebar Header
- Layout: `flex items-center justify-between`
- "Filters" label: Roboto SemiBold 16px, `#1f2937`, `leading-[24px]`
- Clear (×) button: `p-[4px] rounded-[8px]` container, Font Awesome ×, `#2699a6`, 13px
  - Implementation: use Lucide `X` icon, `size-[13px] text-secondary`, click → clear all filters

### Filter Sections (each separated by `border-b border-[#e5e7eb]`)

#### Filter Title (h4)
- Roboto Bold 14px, `#111827`, `tracking-[0.5px]`, uppercase, `leading-[21px]`

#### 3A: Category Filter — LINK LIST (not checkboxes!)
- Section gap: `flex flex-col gap-[12px]`
- Each item: `flex items-center justify-between py-[8px] w-full`
  - Label: Roboto Regular 14px, `#374151`, `leading-[21px]`
  - Count badge: `bg-[#f3f4f6] px-[8px] py-[2px] rounded-[10px]`, Roboto Regular 12px, `#9ca3af`, `leading-[18px]`
- Clicking an item filters products to that subcategory
- Active item: label becomes `font-medium text-[#111827]` (no bg change, just text weight)

#### 3B: Price Range Filter
- Price inputs (side by side, `gap-[12px]`):
  - Each: `bg-white border border-[#d1d5db] rounded-[8px] h-[34px] w-[80px]`
  - Placeholder text: Roboto Regular 14px, `#757575`
  - Separator: `-` Roboto Regular 16px, `#9ca3af`
- Apply button (full width): `bg-[#2699a6] rounded-[8px] px-[16px] py-[8px] w-full`
  - Text: Roboto Medium 13px, white, centered
- Price range checkboxes below Apply (Under $50, $50-$100, $100-$250, $250-$500, Over $500):
  - Each: `flex gap-[12px] items-center`
  - Checkbox: `size-[18px] rounded-[2.5px]`
    - Unchecked: `bg-white border border-[#767676]`
    - Checked: `bg-[#2699a6]` (teal — NOT primary green)
  - Label: Roboto Regular 14px, `#374151`, `leading-[21px]`

#### 3C: Brand Filter — CHECKBOXES
- Same checkbox style as 3B (teal check)
- "Show more brands" link: Roboto Medium 13px, `#2699a6`, `leading-[19.5px]`, no border, `py-[8px]`

#### 3D: Rating Filter — CHECKBOXES (star icons)
- Same checkbox style, labels show star ratings (5 Stars, 4+ Stars, 3+ Stars)

#### 3E: Availability Filter — CHECKBOXES
- Same checkbox style (In Stock, On Sale, New Arrivals)

---

## Section 4: Main Content Area (`main`)

Width: `flex-1` (≈1080px in 1400px frame with 240px sidebar + 32px gap + 24px×2 padding)

### 4A: Results Header (`div.results-header`)
- `border-b border-[#e5e7eb] pb-[17px] flex items-center justify-between w-full`

**Left side** (`flex flex-col gap-[4px]`):
- Count heading: Roboto Medium 18px, `#111827`, `leading-[27px]`
  - Format: `"{N} Product Results"`
- Subtitle: Roboto Regular 14px, `#6b7280`, `leading-[21px]`
  - Format: `"Showing {start} - {end} of {total}"` (static in Figma; use count for now)

**Right side** (`flex items-center gap-[12px]`):
- **Filters button**: `bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[9px] gap-[8px] flex items-center`
  - Filter icon (Lucide `SlidersHorizontal`): 13px, `#374151`
  - "Filters" text: Roboto Medium 13px, `#374151`
  - On mobile: opens filter Sheet drawer; on desktop: could toggle sidebar (or no-op)
- **Sort button**: wraps existing `SortSelect` or rebuilds styled to match
  - `bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[9px] gap-[8px] flex items-center`
  - "Sort by: Featured" text: Roboto Regular 14px, `#374151`
  - Chevron down icon: 14px, `#374151`

### 4B: Active Filter Chips (below results header, `top-[93px]` in Figma)
- Container: `flex flex-wrap gap-x-[8px] gap-y-[8px] items-center pt-[16px]` (between header border and grid)
- Only shown when filters are active
- Each chip: `bg-[rgba(38,153,166,0.1)] px-[12px] py-[8px] rounded-[20px] flex gap-[8px] items-center`
  - Label: Roboto Regular 13px, `#2699a6`, `leading-[19.5px]`
  - × (remove) icon: Font Awesome / Lucide `X`, 13px, `#2699a6`
  - Clicking × removes that filter from URL
- **"Clear all" button**: `px-[8px] py-[10px] rounded-[8px]` no bg, Roboto Medium 13px, `#2699a6`

### 4C: Product Grid (`div.product-grid`)
- Starts at `top-[148.5px]` (after header + chips area)
- **4 columns** at desktop (`grid-cols-4`)
- `gap-[20px]`
- Responsive: `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- No filter sidebar toggle needed (sidebar always visible on desktop)

---

## Section 5: Product Card (End-Node Variant)

Same as `size="category"` (Figma node `5006:775`) with one key difference:

| Property | Category (non-end-node) | End-Node |
|---|---|---|
| Image height | `h-[203px]` | **`h-[250px]`** |
| Grid columns | 6 | 4 |
| Card width at 1080px | ~160px | ~255px |

All other card properties are identical:
- Card: `bg-white border border-[#e5e7eb] rounded-[12px] overflow-hidden flex flex-col`
- Image area: `h-[250px] w-full bg-[#f3f4f6] relative`
  - Badge (top-left): `absolute left-[12px] top-[12px]`, `bg-[#f2b05e] px-[12px] py-[4px] rounded-[4px]`, Roboto Bold 11px, white, uppercase
  - Wishlist (top-right): `absolute right-[12px] top-[12px]`, `size-[32px] rounded-[16px] bg-white/90`
    - Heart icon: `#9ca3af`, 13px
- Product info: `p-[16px] flex flex-col gap-[4px]`
  - Brand: Roboto SemiBold 12px, `#6b7280`, `tracking-[0.5px]`, uppercase, `leading-[18px]`
  - Name: Roboto Medium 15px, `#111827`, `leading-[21px]`, 2-line clamp
  - Rating: `flex gap-[4px] items-center pt-[4px]`
    - Stars: Font Awesome / unicode `★`, `#f2b05e`, 12px
    - Count: Roboto Regular 12px, `#6b7280` `(N)`
  - Price: `flex gap-[8px] items-center pt-[4px]`
    - Current: Roboto Bold 18px, `#111827`, `leading-[27px]`
    - Compare-at: Roboto Regular 14px, `#9ca3af`, `line-through`

---

## Responsive Translation

| Figma (1400px fixed) | Tailwind responsive |
|---|---|
| Listing layout `gap-[32px]` | `gap-8` keep same |
| Sidebar `w-[240px]` | `w-[240px] shrink-0` on lg+; hide on mobile (Sheet) |
| Main `w-[1080px]` | `flex-1 min-w-0` |
| Product grid 4-col | `grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` |
| Card image `h-[250px]` | `h-[250px]` fixed |
| Max-container `1400px` | `max-w-[1400px] mx-auto` |

---

## Design Tokens Used

| Figma Value | Tailwind |
|---|---|
| `#111827` | `text-[#111827]` |
| `#1f2937` | `text-[#1f2937]` |
| `#374151` | `text-[#374151]` |
| `#4b5563` | `text-[#4b5563]` |
| `#6b7280` | `text-[#6b7280]` |
| `#9ca3af` | `text-[#9ca3af]` / `text-[#9ca3af]` |
| `#757575` | `text-[#757575]` (placeholder) |
| `#d1d5db` | `border-[#d1d5db]` |
| `#e5e7eb` | `border-[#e5e7eb]` |
| `#f3f4f6` | `bg-[#f3f4f6]` |
| `#f2b05e` | `bg-[#f2b05e]` (badge + stars) |
| `#2699a6` | `bg-[#2699a6]` / `text-[#2699a6]` = `text-secondary` |
| `rgba(38,153,166,0.1)` | `bg-secondary/10` |

---

## Interactive States (Figma shows default only)

- Filter sidebar checkboxes: checked state uses `bg-[#2699a6]` (teal). **NOT** primary green — this is `text-secondary`.
- Apply button hover: `hover:bg-secondary/90`
- Filters/Sort buttons hover: `hover:bg-[#f9fafb]`
- Active filter chip × hover: `hover:bg-secondary/20`
- Clear all hover: `hover:text-secondary/80`
- Category filter item hover: `hover:text-[#111827]` (darken label)
- Product card: existing hover behavior

---

## Implementation Notes

1. **No CollectionHero** — end-node pages skip the hero entirely. Remove `CollectionHero` from the end-node route branch.
2. **FilterSidebar card redesign** — the sidebar gets a `bg-white border border-[#e5e7eb] rounded-[12px]` card wrapper. This is a significant visual change.
3. **Category section uses links not checkboxes** — the CATEGORY filter group renders plain text links with count badges, not the existing `CheckboxFilterItem`. These are rendered from the available collection filters if the filter type maps to `LIST` with category values, OR rendered as sibling collections navigation.
4. **Teal checkboxes** — checked state uses `#2699a6` (`secondary`), not `#2ac864` (`primary`). Current FilterSidebar uses `data-[state=checked]:bg-primary`. Must be changed to `bg-secondary` for end-node.
5. **Active filter chips** — new `ActiveFilterChips` component. Shows `searchParams.getAll('filter')` as dismissible pills. Each pill's label is derived from the filter `values[].label` lookup. Requires access to `availableFilters` to map input strings to human-readable labels.
6. **Results header** — replaces the old centered 30px heading + `CollectionToolbar`. New layout: left count+subtitle + right Filters+Sort buttons.
7. **Product card `'end-node'` size** — identical to `'category'` but `h-[250px]`. Avoids modifying the non-end-node card.
8. **Pagination** — keep existing Hydrogen `Pagination` component, but style the Load More button to match. Full numbered pagination (Previous | 1 | 2 | ...) is a future enhancement; current `Pagination` component uses cursor-based load more.
9. **Sticky sidebar** — Figma shows `sticky top-0` for sidebar. Implement as `sticky top-[24px]` to keep sidebar visible while scrolling.
10. **Container width fix** — currently end-node uses `max-w-300` (1200px). Must change to `max-w-[1400px]`.

---

## CSS Override Protection

To ensure Figma styles are not overridden by existing utility classes:
- The new FilterSidebar card wrapper must NOT inherit any `FilterSidebar` styles from parent containers
- The `data-[state=checked]:bg-primary` on the existing `Checkbox` component will need to be overridden with `data-[state=checked]:bg-secondary data-[state=checked]:border-secondary` for end-node pages
- The `CollectionToolbar` component must NOT render in the end-node layout (fully replaced by `EndNodeResultsHeader`)
- Product cards use inline Tailwind with `!important`-equivalent specificity via arbitrary values — no global CSS should override `bg-[#f2b05e]` badges or `bg-[#2699a6]` Apply button
