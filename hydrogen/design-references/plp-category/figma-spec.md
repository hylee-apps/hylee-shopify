# Figma Spec — PLP Category Page (Non-End-Node)

**File Key**: `LXJLDI1fRXble63hVJcg7A`
**Node ID**: `5024:284`
**Captured**: 2026-03-30
**Frame**: ~1400px wide (max-w container)
**Variant**: Default (Home & Garden category)

This design applies to **non-end-node (parent/intermediate)** category pages — pages that have child subcollections. End-node (leaf) pages retain the existing filter-sidebar + 5-column grid layout.

---

## Section 1: Breadcrumb (`nav.breadcrumb`)

- Container: `max-w-[1400px] px-[24px] py-[16px]` flex row, gap-[8px], items-center
- Items: Home › Categories › **Home & Garden**
- **Inactive items**: Roboto Regular 14px, `#4b5563`, leading-[21px]
- **Current item** (last): Roboto Medium 14px, `#111827`, leading-[21px]
- **Separator** `›`: `#9ca3af`, 12px, padding top/bottom ~3px
- Implementation note: Map to existing shadcn Breadcrumb. Use `>` chevron separator (ChevronRight icon). Keep existing ghost-button hover on parent links.

---

## Section 2: Category Hero (`section.category-hero`)

- Container: `max-w-[1400px] p-[24px] gap-[40px]` flex row, items-center
- **Hero Image** (`div.hero-image`):
  - Size: **280px wide × 200px tall** (fixed)
  - `rounded-[12px]`
  - `overflow-hidden`
  - `shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)]` (Tailwind: `shadow-md`)
  - `object-cover` fills the container
  - Uses the collection's Shopify image (or fallback placeholder bg)
- **Hero Content** (`div.hero-content`):
  - Width: `w-[493px]` → responsive translation: `flex-1 min-w-0`
  - `flex-col gap-[12px]`
  - **Title h1**: Roboto Light (font-weight: 300), 42px, `#111827`, leading-[63px]
  - **Description p**: Roboto Regular (400), 16px, `#4b5563`, leading-[24px], max-w-[500px]
  - Description comes from collection's `description` field (plain text)

**Key delta from current implementation**: Current `CollectionHero` is a full-width banner with title centered over a static decorative image. This design is a side-by-side image-left + content-right layout, with a real collection image and description text.

---

## Section 3: Subcategory Scroll Section (`section.category-section`)

- Container: `max-w-[1400px] px-[24px] pb-[32px]` flex-col, gap-[20px]
- **Section Header** (flex, justify-between, items-center):
  - **Title** "Categories": Roboto Medium (500), 20px, `#111827`, leading-[30px]
  - **Scroll Controls**: two circular buttons
    - Size: `36×36px`, `rounded-[18px]` (fully round)
    - `bg-white`, `border border-[#d1d5db]`
    - Icon: left/right chevron, `#4b5563`, ~13px
    - These are prev/next JS scroll buttons (not links)
- **Scroll Container** (`div.category-scroll`):
  - `h-[178px]` (accounts for image 120px + gap 11px + label ~30px + bottom 12px)
  - `overflow-x-auto`, `overflow-y-hidden` — horizontal scroll
  - Hide scrollbar visually (`scrollbar-hide`)
  - Items laid out as horizontal flex (not absolute):
    - **Gap between items**: `gap-[20px]` (approximate, actual: 140px spacing - 120px card width = 20px)
  - Each item (`div.category-item`):
    - `flex flex-col items-center gap-[11px]`
    - **Image square**: `size-[120px]`, `rounded-[8px]`, `bg-[#f3f4f6]`, `shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`, `overflow-hidden`
    - Image: `object-cover size-full`
    - **Label**: Roboto Medium (500), 13px, `#374151`, text-center, `max-w-[120px]`
    - Leading: `leading-[16.9px]` (≈1.3)
    - Hover: cursor-pointer, item links to `/collections/{handle}`

**Key delta from current**: Current `SubcollectionGrid` uses `rounded-full` circles in a wrapping flex grid. New design uses `rounded-[8px]` squares in a horizontal scrollable row with arrow controls.

---

## Section 4: Products Section (`section.products-section`)

- Container: `max-w-[1400px] px-[24px] py-[32px]` flex-col, gap-[24px]

### 4A: Results Header (`div.results-header`)

- `w-full flex items-center justify-between`
- `border-b border-[#e5e7eb] pb-[17px]`
- **Left**: Count — Roboto Medium (500), 18px, `#111827`, leading-[27px]
  - Format: `"N Product Results"` (or `"N+ Product Results"` when paginating)
- **Right**: Sort Dropdown button:
  - `bg-white border border-[#d1d5db] rounded-[8px]`
  - Inner: `flex gap-[8px] items-center px-[17px] py-[9px]`
  - Label "Sort by: Featured": Roboto Regular, 14px, `#374151`
  - Chevron icon: 14px, `#374151`
  - Implementation: wrap existing `SortSelect` or build native select styled to match

### 4B: Product Grid (`div.product-grid`)

- **6-column grid** (no filter sidebar for non-end-node pages)
- `grid grid-cols-6 gap-[20px]` (approximate; Figma shows 229.33px pitch on 1400px = ~20px gap)
- No FilterSidebar rendered

---

## Section 4C: Product Card (PLP Category Variant)

Each card in the grid:
- `bg-white border border-[#e5e7eb] rounded-[12px] overflow-hidden flex flex-col`
- **Image Area**:
  - `h-[203px] w-full bg-[#f3f4f6]` relative container
  - `object-cover size-full`
  - **Badge** (conditional, top-left): `absolute left-[12px] top-[12px]`
    - `bg-[#f2b05e] px-[12px] py-[4px] rounded-[4px]`
    - Text: Roboto Bold (700), 11px, white, uppercase
    - Values seen: "Sale", "New", "Best Seller", "-30%"
    - Logic: "Sale" if has compareAtPrice; "New" if tagged new (< 30 days); percentage if discount > certain threshold; "Best Seller" if tagged
  - **Wishlist Button** (top-right): `absolute right-[12px] top-[12px]`
    - `size-[32px] rounded-[16px] bg-[rgba(255,255,255,0.9)]`
    - Heart icon: `#9ca3af`, ~13.3px, outline style (far fa-heart)
    - On toggle: fill heart, change to red/primary
- **Product Info** (`div.product-info`):
  - `p-[16px] flex flex-col gap-[4px]`
  - **Brand** (`div.product-brand`): Roboto SemiBold (600), 12px, `#6b7280`, `tracking-[0.5px]`, uppercase, line-height 18px
  - **Product Name** (`h3.product-name`): Roboto Medium (500), 15px, `#111827`, leading-[21px], allow 2-line wrap
  - **Rating** (`div.product-rating`): `flex gap-[4px] items-center pt-[4px]`
    - Stars: filled `★` characters or SVG, `#f2b05e`, 12px
    - Count: Roboto Regular 12px, `#6b7280`, format `"(128)"`
  - **Price** (`div.product-price`): `flex gap-[8px] items-center pt-[4px]`
    - Current price: Roboto Bold (700), 18px, `#111827`, leading-[27px]
    - Compare-at (strikethrough, if exists): Roboto Regular, 14px, `#9ca3af`, `line-through`

---

## Font Notes

- Figma uses **Roboto** (Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700)
- Current Google Fonts link in `app/root.tsx` must include Roboto weight 300 for the hero title
- Verify existing Inter/Roboto loading — prior notes indicate "Roboto→Inter font gap" for PLP
- **Resolution**: Use Inter as the project font (already loaded). Map weight classes accordingly. Roboto Light → `font-light` (300). Roboto Medium → `font-medium`. etc. The visual difference is acceptable and documented.

---

## Responsive Translation

| Figma (fixed) | Tailwind responsive |
|---|---|
| Hero image `280px × 200px` | `w-[280px] h-[200px] shrink-0` on lg+; stack on mobile |
| Hero content `w-[493px]` | `flex-1 min-w-0` |
| Hero title `42px` | `text-[42px]` lg+; `text-3xl` mobile |
| Category scroll horizontal | `overflow-x-auto` with `flex` items; hide scrollbar |
| Products 6-column grid | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6` |
| Product image `h-[203px]` | `h-[203px]` (fixed; collapse on mobile with aspect ratio) |
| Max container `1400px` | `max-w-[1400px] mx-auto` |

---

## Interactive States (Figma shows default only)

- Breadcrumb links: hover bg ghost (existing shadcn behavior)
- Subcategory scroll items: hover cursor-pointer, slight scale/opacity transition (use project defaults)
- Scroll arrows: hover bg-gray-50 transition
- Sort dropdown: open/close state (existing SortSelect handles this)
- Wishlist button: toggle fill on click (client-side state only)
- Product card: hover scale-[1.01] or shadow-md (use project defaults)

---

## Implementation Notes

- **Non-end-node detection**: `hasChildren = (collection.childCollections?.references?.nodes?.length ?? 0) > 0`
- **Conditional layout**: Route renders either `CategoryPageLayout` (non-end-node) or `EndNodePageLayout` (existing filter+sidebar) based on `hasChildren`
- **Filter sidebar**: NOT shown for non-end-node pages — the subcategory scroll serves as the navigation mechanism
- **Sort**: Still available on non-end-node pages (shows products from entire category tree)
- **`CollectionHero` component**: Will be updated in-place — the new design replaces the old full-width banner. The end-node page does not currently show a hero in the same way, so this is safe.
