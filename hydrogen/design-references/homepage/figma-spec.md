# Homepage — Figma Design Spec

## Source

- **File key**: `qoaTDaCkxR1VBE559Snhjd`
- **File name**: Home Page
- **Root node**: `201:155` (Homepage frame, 1440×2554.865px)
- **Captured**: 2026-02-19

---

## Page Structure

| Node | Name | Dimensions | Y offset |
|------|------|-----------|---------|
| 201:256 | Header | 1440×79px | 0 |
| 203:267 | Section, Hero | 1440×422px | 79 |
| 218:476 | Container (products + promotions) | 1440×1778px | 501 |
| 220:426 | Footer | 1440×275.865px | 2279 |

---

## Header (201:256)

Variant: **Main** (homepage-specific header)

- **Dimensions**: 1440×79px
- **Background**: white
- **Padding**: `px-[122px] py-[10px]` (outer); `px-[122px] py-[4px]` (inner)
- **Inner layout**: `flex gap-[185px] items-center justify-center`

### Logo
- Variant: `Logo=CondensedDefault` (colored "Hy")
- Size: 65×50px
- Asset: `/logo-condensed.png`

### Navigation (center)
- 5 items: `Categories ▼`, `What's New`, `Blog & Media`, `[placeholder]`, `EN ▼`
- Each: `h-[40px] px-[16px] py-[10px] rounded-[8px]`
- Text: 14px Inter Medium `#666` → `text-text-muted`
- Dropdown items have `gap-[2px]` with 10px chevron icon

### Right actions (166px wide, justify-between)
- Sign In: plain link, same styles as nav
- Register: `border border-secondary rounded-[8px] h-[40px] px-[16px]`
  - Text: 14px Inter Medium `text-secondary`

---

## Hero (203:267)

- **Dimensions**: 1440×422px
- **Background**: `#14b8a6` → `bg-hero` (new token)
- **Shadow**: `0px 4px 4px 0px rgba(0,0,0,0.25)`
- **Outer padding**: `px-[157px] py-[59px]`
- **Inner container**: `flex-col gap-[17px] items-center justify-center overflow-clip px-[221px] py-[17px]`

### Logo
- Variant: `Logo=Alternate` (full white "Hylee")
- Size: 183×101.821px
- Asset: `/logo-white.png`
- Fit: `object-cover`

### Search Bar (Input=Search)
- Width: 683px fixed → `max-w-[683px] w-full` (responsive)
- Height: 40px
- Background: white
- Border: `1px solid var(--secondary, #2699a6)` → `border-secondary`
- Radius: 25px → `rounded-[25px]`
- Padding: `px-[13px] py-[10px]`
- Placeholder: "Placeholder text", 14px Inter Medium `rgba(0,0,0,0.5)`
- Icon: magnifying glass (search) 27.853×28.826px, right-aligned
- **Implementation**: clicking opens `PredictiveSearch` overlay

---

## Product Sections (218:337 and 218:384)

Both sections share identical structure. Content differs per section:
- Section 1: "What's New" → `/collections/what-s-new`
- Section 2: "Summer/Winter/Fall Collection" → `/collections/summer-collection`

### Section Header (`Section, Product`)
- Height: 100px
- Padding: `px-[122px]`
- Heading: 30px Inter SemiBold, `text-black`, left-aligned
- Heading container: `h-[36px] w-full`

### Sub-heading (`Heading, Section`)
- Height: 46px (pb-[10px] wrapper)
- Centered: `justify-center`
- Text: 30px Inter SemiBold `text-black`, `w-[242px]`
- Visual: underlined (`underline decoration-2`)

### Cards container
- `flex gap-[10px] items-center justify-center w-full`

### Product Card (`Card=ProductMedium`)
- Container: `flex-col gap-[10px] p-[10px]`, 313×451px total
- Image: 293×316px, grey placeholder (`bg-surface rounded-sm`)
- Add button: `bg-secondary rounded-[25px] h-[40px] px-[20px]`
  - Contains: plus icon (25×25px) + "Add" text (14px Medium white)
- Price: absolute-positioned, `$` at 12px + amount at 24px, SemiBold, tracking-[0.5px]
- Title: 14px Inter Medium `text-black`

### See All link
- `border-b border-text-muted h-[40px] px-4 text-[14px] font-medium text-text-muted`
- Positioned as 4th flex item after the 3 cards

**Card layout math** (validates `justify-center`):
- 3 cards × 313px + 2 gaps × 10px = 959px
- See All (63px) + 1 gap (10px) = 73px
- Total: 1032px → left offset for centering: (1440 - 1032) / 2 = 204px ✓

---

## Promotions & Discounts (218:430)

### Section Header
- Same structure as product sections: h-[100px] px-[122px]
- Label: "Promotions & Discounts" (no sub-heading)

### Card layout frame
- Padding: `px-[122px] py-[30px]`
- Inner frame: `relative h-[314px] w-[861px]`
- Positioned with absolute children

### Horizontal Cards (×2) — node 218:532 and 218:478
- Size: 360×80px each
- Position: `top-[60px] left-0` and `top-[176px] left-0`
- Border radius: 12px
- Background: white, border: neutral border (`border-border`)
- Left content: Avatar (40×40) + Title (16px Medium) + Subhead (14px Regular)
- Right: 80×80px image thumbnail area (`border-l bg-surface`)
- **M3 → Hy-lee token replacements**:
  - Avatar bg: `#EADDFF` → `bg-secondary/10`
  - Avatar text: `#4F378A` → `text-secondary`
  - Border: `#CAC4D0` → `border-border`

### Vertical separator — node 218:479
- Position: `left-[414px] top-[31px]`
- Size: `w-px h-[250px]`
- Color: `bg-border`

### Stacked Card — node 218:480
- Size: 393×314px
- Position: `left-[468px] top-0`
- Border radius: 12px
- Shadow: `0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)` (M3 Elevation-1)
- Background: white
- **Header** (72px): `pl-[16px] pr-[4px] py-[12px]`
  - Avatar (40×40) + title (16px Medium) + subhead (14px Regular) + 3-dot icon btn (48×48)
- **Media** (168px): `bg-surface` placeholder
- **Actions** (72px): right-aligned `bg-secondary rounded-[100px] px-[16px] py-[10px]` Primary button
- **M3 → Hy-lee token replacements**:
  - Avatar bg: `#EADDFF` → `bg-secondary/10`
  - Avatar text: `#4F378A` → `text-secondary`
  - Button: `#6750A4` → `bg-secondary`
  - Card bg: `#F7F2FA` → `bg-white`
  - Media bg: `#ECE6F0` → `bg-surface`

---

## Footer (220:426)

Updated from previous spec (`eWh354xJwjwpuedg2yjkFl/1796:105`) — now from Home Page file.

### Dimensions
- 1440×275.865px
- Padding: `px-[122px] py-[59px]`

### Layout
- `flex gap-[78px] items-center` (was `gap-16`)

### Left column (240px)
- Logo: `Logo=Default` (full colored Hylee), 183×101.865px → `/logo-full.png`
- "Follow us on social media": 14px Inter Medium, text-black
- Social icons: **4 icons, 24×24px each, gap-[10px], bare SVG (no container box)**
  - Order: X, Instagram, YouTube, LinkedIn ← updated from previous (was X, Instagram, Facebook, TikTok)

### Center/right area (560px)
- `flex-col gap-[13px] items-center justify-center`
- **Heading**: "Sign up for Hylee news & updates!" (lowercase 'up'), 20px Inter Regular, text-black, line-height 1.2
- **Newsletter input**: `min-w-[275px] h-[40px] border-secondary rounded-[25px]`; placeholder "Enter your email"
- **Submit button**: `bg-secondary rounded-[25px] h-[40px] px-[26px]`; text "Submit"
- **Nav links**: same 5 links, `h-[40px] px-[16px] py-[10px] rounded-[8px] text-[14px] font-medium text-text-muted`

---

## Design Tokens

| Figma Variable | Hex | CSS Token | Tailwind |
|---|---|---|---|
| `--primary` | `#2ac864` | `--color-primary` | `*-primary` |
| `--secondary` | `#2699a6` | `--color-secondary` | `*-secondary` |
| `--hero` | `#14b8a6` | `--color-hero` | `bg-hero` |
| `--default` | `#666` | `--color-text-muted` | `text-text-muted` |
| `--alternate` | `#fff` | `--color-background` | `bg-white` |

## Implementation Notes

1. **Hero bg-hero** vs. `--secondary`: `#14b8a6` is a distinct teal. New token `--color-hero` added to `app.css @theme`. Use `bg-hero` in Tailwind.
2. **Responsive translation**: Figma is fixed 1440px. Hero search shrinks to `max-w-[683px] w-full`. Product cards overflow-x-auto on small screens. Promotions section uses `overflow-x-auto` container.
3. **Promotions Material Design cards**: Replaced M3 purple theme with Hy-lee secondary teal. Card structure preserved exactly.
4. **Search in hero**: Connected to `PredictiveSearch` component (same as non-homepage header). State managed locally in homepage component.
5. **Product sections**: Static placeholders. TODO: wire to Shopify collections via loader query on handles `what-s-new` and `summer-collection`.
