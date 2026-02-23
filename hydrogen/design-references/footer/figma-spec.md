# Footer — Figma Design Spec

## Source

- **File key**: `X566CMLIsD8YboYdRU18IS`
- **File name**: Component Library
- **Node ID**: `659:113` (shows all 4 variants stacked)
- **Captured**: 2026-02-23

## Variants

| Variant   | Background         | Logo             | Input border   | Placeholder color | Button style                |
|-----------|--------------------|------------------|----------------|-------------------|-----------------------------|
| Default   | white              | `logo-full.png`  | `border-primary` (green) | `text-text-muted` (#666) | Filled teal (`bg-secondary text-white`) |
| Primary   | `#2ac864` (green)  | `logo-white.png` | `border-white` | `text-white`      | White outline (`bg-transparent border-white text-white`) |
| Secondary | `#2699a6` (teal)   | `logo-white.png` | `border-white` | `text-white`      | White outline (`bg-transparent border-white text-white`) |
| Tertiary  | `#2bd9a8` (mint)   | `logo-white.png` | `border-white` | `text-white`      | White outline (`bg-transparent border-white text-white`) |

## Overall Frame

- **Dimensions**: 1440 × ~220px
- **Padding**: px-[122px] py-[59px]
- **Layout**: flex row, gap-[78px] between left col and center/right area

---

## Layout

### Left Column (240px wide, gap-[5px] between items)

- **Logo**: 183 × 101.821px, `object-cover`
  - Default: `logo-full.png` (colored Hylee)
  - Primary/Secondary/Tertiary: `logo-white.png` (white Hylee)
- **"Follow us on social media"**: 14px Inter Medium, `text-black` — ALL variants
- **Social icons**: X, Instagram, YouTube, LinkedIn
  - Size: 24×24px (`size-6`), gap-[10px]
  - Color: `text-black` — ALL variants (including colored backgrounds)

### Center/Right Area (w-[560px], flex-col, gap-[13px], items-center)

**Newsletter heading** (all variants):
- Text: "Sign up for Hylee news & updates!"
- 20px Inter Regular (400), `text-black`, `leading-[1.2]`, centered

**Input row** (gap-[5px] between input and button):

_Default variant (Figma: `Input=PrimarySubmit`):_
- Input: `min-w-[275px]` (→ `min-w-68.75`), `h-10`, `rounded-[25px]`, `bg-transparent`
  - Border: `border-primary` (green)
  - Placeholder + typed text: `text-text-muted` (#666)
- Button: **filled teal** — `bg-secondary h-10 rounded-[25px] px-6.5 text-white text-[14px] font-medium`

_Primary/Secondary/Tertiary variants (Figma: `Input=Alternate`):_
- Input: same dimensions/radius as above
  - Border: `border-white`
  - Placeholder + typed text: `text-white`
- Button: **white outline** — `bg-transparent border border-white text-white h-10 rounded-[25px] px-6.5 text-[14px] font-medium`

**Nav links** (p-[10px] wrapper, flex-wrap, justify-center) — ALL variants:
- Each link: `h-10 px-4 py-2.5 rounded-xl`
- Text: 14px Inter Medium, `text-text-muted` (#666) — same across all variants
- Links: About, Terms of Use, Privacy Policy, Help, Become a Supplier

---

## Design Tokens

| Token           | Value      | Tailwind class    |
|-----------------|------------|-------------------|
| `--primary`     | `#2ac864`  | `bg-primary`      |
| `--secondary`   | `#2699a6`  | `bg-secondary`    |
| `--tertiary`    | `#2bd9a8`  | `bg-brand-accent` |
| `--alternate`   | `#fff`     | `bg-white`        |
| `--default`     | `#666`     | `text-text-muted` |

## Typography

- **Heading**: 20px Inter Regular (400) → `text-[20px] font-normal`
- **Body/links**: 14px Inter Medium (500) → `text-[14px] font-medium`
- **Placeholder (default)**: #666 → `text-text-muted`
- **Placeholder (colored)**: white → `text-white`

## Implementation Notes

- Social icons use `text-black` on ALL variants — Figma uses raster black images for icons; SVGs should match
- Nav link text is `text-text-muted` (#666) across all variants per Figma — including on colored backgrounds
- Responsive: fixed 1440px Figma frame → `max-w-[1440px] mx-auto` + responsive padding breakpoints
- `variant = 'primary'` is the app default (matches hero bg usage)
