# PLP (Collections/Product Listing Page) — Figma Design Spec

## Source

- **File key**: `d52sF4D2B0bIzt3A4z3UjE`
- **File name**: PLP-Collections
- **Node ID**: `387:249`
- **Captured**: 2026-02-19

---

## Overall Frame

- **Symbol**: `Collections/Product Listing Page`
- **Dimensions**: 1440 × 2163.865px
- **Background**: white

---

## Header (Alternate variant)

- **Node**: Alternate header (vs Main/homepage header)
- **Height**: ~79px → `py-[14px]` on inner container
- **Border**: `border-b border-primary` (green bottom border)
- **Left group** (`flex-1 gap-[15px]`):
  - Logo: condensed colored "Hy", 65×50px
  - Hamburger button: `size-[40px] border border-secondary rounded-[6px]` (radius-xs)
  - Search bar: `flex-1 border border-secondary rounded-[25px] h-[40px] px-[13px]`
- **Right group** (`w-[222px] justify-between`):
  - My Orders: NavDropdown with chevron
  - Account: plain link (14px Medium #666)
  - Cart: Icon size 40, teal (`text-secondary`), container `w-[54px] h-[40px]`
- **Cart badge** (Figma): `absolute left-[34px] top-0`, `min-w-[10px] h-[10px]`, `bg-white text-black rounded-[7px] text-[8px] px-[2px]`

### Implementation Notes

- Homepage header uses `py-[10px]` (Main variant); non-homepage uses `py-[14px]` (Alternate variant).
- Conditional padding: `${isHomePage ? 'py-[10px]' : 'py-[14px]'}` on inner container div.

---

## Breadcrumbs

- **3 items**: Home / Collections / [Collection Title]
- **Font**: 14px Inter Medium, `text-text-muted` (#666)
- **Separators**: "/" literal text
- **Current page**: `text-black aria-current="page"`
- **Container**: `px-[122px] py-[10px]`

---

## Collection Hero (node 2766:608)

- **Total height**: 260px
- **Layout**: image LEFT + title RIGHT (Figma uses absolute positioning in a 1440px frame)

### Image

- **Position**: `left-0 top-0` (absolute in Figma)
- **Dimensions**: 328 × 260px
- **Fit**: `object-cover`

### Title

- **Position**: `left-[521px] top-[98px]` (absolute in Figma)
- **Gap from image right edge**: 521 - 328 = 193px → responsive `pl-[193px]` on right column
- **Font**: Roboto Regular 57px (M3 Display Large) → implemented as Inter Regular (app doesn't load Roboto)
- **Color**: `#1d1b20` (M3 on-surface, near-black)
- **Line height**: 64px → `leading-[64px]`
- **Tracking**: -0.25px → `tracking-[-0.25px]`
- **Weight**: font-normal (Regular = 400)

### Font Gap Note

Figma specifies Roboto Regular for the collection title (M3 Display Large). The Hydrogen app loads Inter via Google Fonts (`app/root.tsx`). This is an intentional deviation — Inter at 57px font-normal is visually close. If exact Roboto rendering is needed, add `Roboto:wght@400` to the Google Fonts link in `app/root.tsx` and update `@theme` accordingly.

### Responsive Translation

- Desktop (`lg+`): Figma exact layout — `flex h-[260px]`, image `w-[328px] shrink-0`, title area `pl-[193px]`
- Mobile: stacked — image `h-[200px] w-full`, title below `px-4 py-6 text-3xl`

---

## Products Section

- **Container**: `max-w-[1440px] mx-auto px-[122px] py-[20px]`

### Results Heading

- **Text**: `{n} Products` (current page count)
- **Font**: 30px SemiBold, `text-black`
- **Layout**: `flex items-center justify-center pb-[20px]`

### Product Grid (Figma: 5 col × 4 rows)

- **Columns**: 5 (desktop), responsive 3→5
- **Gap**: `gap-[10px]`
- **Card**: `Card=ProductSmall`

### Card=ProductSmall

- **Container**: `flex-col gap-[10px] p-[10px]`
- **Image**: 173 × 191px, `bg-surface` placeholder, `bg-[#d9d9d9]` in Figma
- **Add button**: `bg-secondary rounded-[25px] h-[40px] px-[20px] w-full`
  - Contents: plus icon 25px + "Add" label 14px Medium white, `gap-[10px]`
  - Uses `CartForm.ACTIONS.LinesAdd` for real cart functionality
- **Price**: superscript format — `$` at 12px top-left, amount at 24px; `font-semibold tracking-[0.5px]`
- **Title**: 14px Inter Medium, `text-black`, `line-clamp-2`

---

## Filters / Sort Toolbar

- **Status**: Kept as-is per user decision. Not shown in Figma but retained for functionality.
- Components: `CollectionToolbar` + `FilterSidebar` (unchanged)

---

## Footer

- Identical to updated Footer from Homepage work (2026-02-19).
- See `design-references/footer/figma-spec.md`.

---

## Design Tokens Used

| Figma Value     | CSS Variable         | Tailwind Class      |
|-----------------|----------------------|---------------------|
| `--secondary`   | `--color-secondary`  | `*-secondary`       |
| `#666`          | `--color-text-muted` | `text-text-muted`   |
| `#1d1b20`       | — (no token)         | `text-[#1d1b20]`    |
| `#d9d9d9`       | `--color-surface`    | `bg-surface`        |
| border-primary  | `--color-primary`    | `border-primary`    |

---

## Interactive States

- Cart badge: hover not specified — no hover state needed (it's a badge)
- Add button: `disabled:opacity-50` for sold-out products
- Breadcrumb links: `hover:text-primary transition-colors`
- Header links: `hover:text-primary transition-colors`

---

## Implementation Notes

1. **Cart badge position**: Figma shows badge at `left-[34px] top-0` relative to the `w-[54px] h-[40px]` cart link container. This places the badge at the top-right of the 40px cart icon.
2. **Roboto font gap**: Collection title uses Inter instead of Roboto — documented above.
3. **Filter sidebar**: No filter sidebar in Figma but kept for product functionality.
4. **Product count**: Shows page count (`products.nodes.length`), not total collection count (total not available in current GraphQL query without an extra aggregation field).
