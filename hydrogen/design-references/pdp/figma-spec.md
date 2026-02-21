# PDP (Product Detail Page) — Figma Spec

**Captured:** 2026-02-21
**Figma File:** `Cz8f2ycIjQZOoremTy2eBM` (Single Product - Product List Page Community)
**Node:** `1460:1444` — PDP (Updated)
**Viewport:** 1440px wide

---

## Layout Overview

Full-page layout: `flex flex-col`, white bg, `w-[1440px]`

### Sections (top → bottom)
1. **Header** (Alternate variant — handled by root layout)
2. **Breadcrumb bar** — `px-[122px]`
3. **3-Column product grid** — `px-[122px]`, `gap-[10px]`, each col `358px`
4. **Details accordion** — `px-[122px] py-[20px]`, `w-[727px]` container
5. **Reviews section** — `px-[122px] py-[20px]`
6. **Footer** (handled by root layout)

---

## Breadcrumb

- Simple inline breadcrumbs: Home / Products / {Product Name}
- Font: Inter Medium 14px, color: `var(--default, #666)`
- Separator: `/` character

---

## 3-Column Grid

### Col 1 — Image Gallery (`358px` wide)

**Layout:** `flex flex-row items-start`
- Left: vertical thumbnail strip
- Right: main product image

**Thumbnails (vertical stack):**
- Each: `62.75px × 72.208px`
- Border radius: `10.675px`
- Border: `2.287px solid #3a4980` (active) or transparent
- Gap: `10px`
- Count shown in Figma: 4 thumbnails

**Main Image:**
- Size: `345px × 397px`
- Border radius: `12.962px`
- Border: `0.762px solid #edf0f8`
- Overflow hidden

### Col 2 — Product Info (`358px` wide)

**Layout:** `flex flex-col gap-[9px]`

**Product Title:**
- Font: Inter SemiBold 21.349px
- Color: black
- `whitespace-pre-wrap`

**Star Rating:**
- Row of 3 filled circle indicators (placeholder — maps to actual rating)

**Accordion (shadcn `Accordion`):**
- 3 items: Key Item Features | Specs | Does It Fit
- First item (open): white bg, `border border-[#d9d9d9]`, `p-[16px]`, `rounded-[8px]`
- Closed items: gray bg `#f5f5f5`, same border/radius
- Title font: Inter SemiBold 16px
- Content font: Inter Regular 16px, color: `#1e1e1e`
- Chevron: 20×20px, up = open, down = closed

### Col 3 — Purchase Controls (`358px` wide)

**Layout:** `flex flex-col`

**Price (Current):**
- Currency symbol: `$`, superscript, 12px
- Amount: Inter SemiBold 24px, tracking `0.5px`, color: black

**Price (Strike-through old):**
- Same structure, 14px/8px, color: `var(--default, #666)`, `line-through`

**Separator:** `py-[15px]` padding around `h-0` divider line

**Color Swatch Label:** "Choose a Color" — Inter SemiBold 14px, `var(--default)`
**Color Swatches:** 5 × `40×40px` circles, `gap-[10px]`, `py-[10px]`

**Separator**

**Size Swatch Label:** "Choose a Size" — same style
**Size Swatches:** 4 × `40×40px` circles

**Separator**

**Quantity + Add to Cart (row, `gap-[10px]`):**
- Quantity: pill-shaped `f3f3f3` bg, `117.68px × 41.083px`, `rounded-[22.493px]`
  - `-` button (gray `#a3a3a3`), number (blue `#3a4980` 16.774px Bold), `+` button (blue)
- Add to Cart button: `bg-[var(--secondary,#2699a6)]`, `h-[40px]`, `rounded-[25px]`, `px-[20px] py-[10px]`
  - "+" icon (25×25px white lines) + "Text" label — Inter Medium 14px white

---

## Below Section — Full-Width Accordion

**Container:** `px-[122px] py-[20px]`
**Width:** `w-[727px]` (Figma) → full width in implementation

4 accordion list items using shadcn `Accordion`:
- **Details** — product description HTML
- **Specifications** — from `specifications` metafield (JSON)
- **Warranty** — from `warranty` metafield
- **Reviews** — review filter buttons + reviewer list

Each item has:
- Leading icon: star/stars (20×20px)
- Title (SemiBold 16px)
- Trailing chevron

---

## Reviews Section

**Container:** `px-[122px] py-[20px]`

**Filter Buttons (row, `gap-[5px]`):**
- 4 pill buttons: Most Popular | Most Recent | Highest Rated | Lowest Rated
- Style: `bg-[var(--secondary,#2699a6)]`, `h-[40px]`, `rounded-[25px]`, `px-[20px]`
- "Most Popular" has a `+` icon prefix

**Review List Items:**
- Avatar: `80×80px` circular
- Reviewer name: Roboto Regular 22px (SDS token — use Inter fallback)
- Review text: Roboto Regular 14px, truncated 1-line
- Divider between items

---

## Design Token Mapping

| Figma Value | CSS Token | Tailwind |
|---|---|---|
| `var(--secondary, #2699a6)` | `--color-secondary` | `bg-secondary` |
| `var(--default, #666)` | `--color-text-muted` | `text-text-muted` |
| `#d9d9d9` border | `--color-border` | `border-border` |
| `#f5f5f5` bg | `--color-surface` | `bg-surface` |
| `#1e1e1e` text | `--color-text` | `text-text` |

---

## Implementation Notes

- **3-col → responsive:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-6 lg:gap-[10px]`
- **Gallery thumbnails:** `layout="vertical"` prop added to `ProductGallery`
- **Price display:** Inline `<sup>` for currency symbol instead of custom `Text` component
- **Variant swatches:** Handled by existing `VariantSelector` component
- **Quantity:** Using existing `QuantitySelector` component (pill style matches Figma)
- **Accordion:** Using shadcn `Accordion` component for both col-2 and below sections
- **Separator:** Using shadcn `Separator` between price/swatches/qty
- **Avatar:** Using shadcn `Avatar` + `AvatarFallback` for review list
- **Roboto font:** Figma uses SDS/M3 Roboto tokens in review section — using Inter (loaded in app) as fallback per project convention (Roboto→Inter gap documented on PLP)
- **`#3a4980` blue:** Appears in Figma for quantity selector numbers and thumbnail border. NOT a Hy-lee token — using `border-secondary` for thumbnail active state instead.
