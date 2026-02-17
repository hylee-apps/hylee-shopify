# Header — Figma Design Spec

## Source

- **File key**: `eWh354xJwjwpuedg2yjkFl`
- **File name**: Home - Nav - Project Launch
- **Parent frame**: `4150:66` (Header — contains both variants)

## Variants

| Variant | Node ID | Dimensions | Description |
|---------|---------|-----------|-------------|
| **Main** | `4150:67` | 1440 × 79px | Homepage: white bg, no border, centered nav, Sign In / Register |
| **Alternate** | `4569:170` | 1440 × 78px | Non-homepage: white bg, green bottom border, search bar, cart badge |

---

## Main Variant (Homepage)

### Overall Frame
- **Dimensions**: 1440 × 79px
- **Background**: white → `bg-white`
- **Border**: none
- **Padding**: 122px horizontal, 10px vertical
- **Inner flex**: gap 185px, items-center, py-4px

### Children (left to right)

#### 1. Logo (Condensed, Colored)
- **Size**: 65 × 50px
- **Asset**: `/logo-condensed.png` (green "Hy" with blue halo)
- **Fit**: `object-contain`

#### 2. Navigation (MenuMain)
- **Layout**: flex row, gap-[10px]
- **All links**: h-[40px], px-[16px], py-[10px], rounded-[8px]
- **Text**: 14px Inter Medium, #666 → `text-[14px] font-medium text-text-muted`

**Links in order:**
1. "Categories ▾" (80px, dropdown with chevron)
2. "What's New" (plain link)
3. "Blog & Media" (plain link)
4. "Blog & Media" (plain link — duplicate in Figma)
5. "EN ▾" (80px, dropdown with chevron)

#### 3. Right Actions (166px wide, justify-between)

**3a. "Sign In" (plain link)**
- h-[40px], px-4, py-2.5, rounded-[8px]
- Text: 14px Inter Medium, #666

**3b. "Register" (bordered button)**
- h-[40px], px-4, py-2.5, rounded-[8px]
- **Border**: 1px solid `var(--secondary, #2699a6)` → `border border-secondary`
- **Text**: 14px Inter Medium, `var(--secondary, #2699a6)` → `text-secondary`
- **NOTE**: Uses `--secondary` (teal), NOT `--primary` (green)

---

## Alternate Variant (Non-Homepage)

### Overall Frame
- **Dimensions**: 1440 × 78px
- **Background**: white → `bg-white`
- **Border**: bottom only, 1px solid `var(--primary, #2ac864)` → `border-b border-primary`
- **Padding**: 122px horizontal, 14px vertical
- **Alignment**: `items-start`

### Inner Layout
- **Gap**: 26px between left group and right group

### Children (left to right)

#### Left Group (948px, gap-15px)

**1. Logo (Condensed, Colored)**
- Size: 65 × 50px (same as Main)

**2. Hamburger Button (Categories)**
- **Size**: 40 × 40px
- **Border**: 1px solid `var(--secondary, #2699a6)` → `border border-secondary`
- **Border radius**: 6px → `rounded-xs`
- **Background**: transparent
- **Icon**: 24 × 16px (3-line menu)
- **Padding**: 8px horizontal, 11px vertical

**3. Search Input**
- **Outer**: `border border-secondary` (1px), `rounded-[25px]`, `h-[40px]`, `flex-1`
- **Inner**: flex, `bg-white`, `px-[13px]`, `py-[10px]`, items-center, justify-between
- **Placeholder**: "Placeholder text", 14px Inter Medium, `text-black/50`
- **Search icon**: ~28px magnifier, positioned right

#### Right Group (222px, justify-between)

**4. "My Orders" (dropdown with chevron)**
- Width: 80px, h-[40px]
- Text: 14px Inter Medium, #666
- Chevron: 10 × 10px

**5. "Account" (plain link)**
- h-[40px], px-4, py-2.5
- Text: 14px Inter Medium, #666

**6. Shopping Cart (icon + badge)**
- **Container**: 54 × 40px
- **Icon**: 40 × 40px, offset left-[8px] top-[7px]
- **Badge**: 10 × 10px, white bg, rounded-[7px]
  - Position: left-[42px] top-[3px]
  - Text: 8px Inter Medium, black
  - Padding: 4px horizontal, 2px vertical

---

## Design Tokens

| Figma Variable | Hex | CSS Variable | Tailwind |
|---------------|-----|-------------|----------|
| `--primary` | `#2ac864` | `--color-primary` | `*-primary` |
| `--secondary` | `#2699a6` | `--color-secondary` | `*-secondary` |
| `--default` | `#666666` | `--color-text-muted` | `*-text-muted` |

## Typography

- **Font**: Inter Medium (500) — loaded via Google Fonts in `app/root.tsx`
- **Nav links**: 14px, #666 → `text-[14px] font-medium text-text-muted`
- **Placeholder**: 14px, rgba(0,0,0,0.5) → `text-[14px] font-medium text-black/50`
- **Cart badge**: 8px, black → `text-[8px] font-medium text-black`

## Interactive States

Figma only shows the default state. Implementation uses:
- **Hover (links)**: `hover:text-primary` (green)
- **Hover (buttons)**: `hover:bg-primary/5` (subtle green tint)
- **Focus**: `focus-visible:outline-2 focus-visible:outline-primary` (global, via app.css)

## Responsive Translation

| Figma (1440px fixed) | Implementation (responsive) | Rationale |
|---------------------|---------------------------|-----------|
| `w-[1440px]` | `max-w-[1440px] w-full` | Scales down on smaller viewports |
| `px-[122px]` | `px-4 sm:px-6 lg:px-16 xl:px-[122px]` | Progressive padding increase |
| `gap-[26px]` alt | `gap-4 lg:gap-[26px]` | Compressed on mobile |
| `w-[948px]` left group | `flex-1` | Fills available space responsively |
| `w-[222px]` right group | `w-[222px] shrink-0` | Fixed width right group |

## Implementation Notes

- The Main variant Register button uses **`--secondary` (teal #2699a6)**, NOT `--primary` (green). This changed from the previous Figma file.
- The Alternate variant uses **bottom border only** (`border-b`), NOT full border (`border-2`). This changed from the previous Figma file.
- The Alternate variant border is **1px** (not 2px), and uses `--primary` for border color.
- The Alternate hamburger and search both use **1px borders** with `--secondary` color.
- Search height is **40px** (not 50px as in previous design).
- Alternate padding is **14px vertical** (not 10px).
- Alternate gap is **26px** (not 38px).
- Cart badge is much smaller: **10×10px** with **8px** text (was 15×14px with 9px text).
- Logo uses the colored `/logo-condensed.png` (green "Hy"), NOT the white variant.
