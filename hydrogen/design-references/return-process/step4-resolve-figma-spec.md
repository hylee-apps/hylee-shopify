# Return Process — Step 4: Make It Right

> **Figma File Key**: `NEk59QDkRMC3a6LD0WZVQJ`
> **Node ID**: `1:1030`
> **Frame**: Return Process — Make It Right
> **Captured**: 2026-03-28

## Overview

Final step (Step 4) of the 4-step return wizard. User arrives from Step 3 (Shipping) and chooses a resolution: Exchange, Replace, Store Credit, or Refund. Displays a preview of selected items, a summary of return value, and an "Our Promise" assurance notice.

---

## Layout

- **Page background**: Solid `#f9fafb` (inherited from account layout)
- **Content container**: `div.return-layout`
  - Max width: `900px`
  - Horizontal padding: `24px`
  - Top padding: `32px`, Bottom padding: `64px`
  - Centered within page
  - Gap between children: `8px`

---

## Sections (top to bottom)

### 1. Title — `h1`

- Text: "Make It Right"
- Font: Roboto Light (300), 32px, line-height 48px
- Color: `#1f2937` (gray-800)
- Alignment: center

### 2. Subtitle — `p`

- Text: "How would you like us to resolve this?"
- Font: Roboto Regular (400), 16px, line-height 24px
- Color: `#4b5563` (gray-600)
- Alignment: center

### 3. Progress Steps — `div.return-steps`

- Container: flex, gap 16px, centered, padding-top 24px
- **4 steps**: Select Items, Reason, Ship, Make It Right

#### Completed Steps (Steps 1-3)

- **Circle**: 48×48px, bg `#2ac864` (primary green), rounded-full
- **Icon**: White checkmark (Check icon from Lucide), 20px
- **Label**: Roboto Medium (500), 13px, line-height 19.5px, `#4b5563`

#### Active Step (Step 4: Make It Right)

- **Circle**: 48×48px, bg `#4fd1a8` (return-accent), rounded-full
- **Shadow ring**: `0 0 0 4px rgba(38,153,166,0.2)` (teal glow)
- **Icon**: SmilePlus (Lucide), 20px, white
- **Label**: Roboto Medium (500), 13px, line-height 19.5px, `#4b5563`

#### Connector Lines

- Width: `60px`, height: `2px`
- Color: `#e5e7eb`
- Positioned at 24px from top (vertically centered with circles)

### 4. Main Card — `div.card`

- Background: `white`
- Border: `1px solid #e5e7eb`
- Border radius: `12px`
- Shadow: `0 1px 2px rgba(0,0,0,0.05)`
- Overflow: clip

#### Card Header — `div.card-header`

- Padding: `20px 24px 21px 24px` (top 20px + 33px offset from card pt, bottom 21px)
- Border-bottom: `1px solid #e5e7eb`
- **Title**: "Choose Your Resolution" — Roboto Bold (700), 18px, line-height 27px, `#111827`

#### Card Body

- Padding: `24px 24px 48px 24px` (top 24px, bottom 48px)
- Gap: `16px` between children
- Contains: Selected Items Preview, Item Summary, Resolution Grid, Summary Section

##### Selected Items Preview — `div.selected-items-preview`

- Container: flex-wrap, gap `0px 12px`
- Each thumbnail: `50×50px`, `bg-[#f3f4f6]`, `rounded-[8px]`
  - Contains product image or placeholder icon (20px, `#9ca3af`)
  - If product has image: `object-cover`, `rounded-[8px]`
  - If no image: FA headphones/plug/etc placeholder → use product image or gray icon

##### Item Summary Text — `p`

- Text: "{count} items • Total value: ${amount}"
- Font: Roboto Regular (400), 14px, line-height 21px
- Color: `#4b5563`

##### Resolution Options Grid — `div.resolution-options`

- **Layout**: CSS Grid, `grid-cols-2`, gap `16px`
- 4 resolution cards in a 2×2 grid
- Each card: height `171.5px`

###### Individual Resolution Card — `Component 1`

- Background: `white`
- Border: `2px solid #e5e7eb` (unselected)
- Border radius: `12px`
- Position: relative (children absolutely positioned)

**Unselected state**:
- Border: `2px solid #e5e7eb`
- Background: `white`

**Selected state** (not shown in Figma — design based on project patterns):
- Border: `2px solid #4fd1a8` (return-accent)
- Background: `rgba(38,153,166,0.05)` (subtle teal tint)
- Shadow: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)`

**Icon container**: `64×64px`, `bg-[#f3f4f6]`, `rounded-[32px]` (full circle)
- Centered horizontally (`left-1/2 -translate-x-1/2`), `top-[20px]`
- Icon: 28px, `#4b5563` (unselected) / `#4fd1a8` (selected)

**Title**: `h3.resolution-title`
- Position: absolute, `top-[96px]`, `left-[20px]`, `right-[20px]`
- Font: Roboto SemiBold (600), 16px, line-height 24px, `#111827`
- Text-align: center

**Description**: `p.resolution-description`
- Position: absolute, `top-[128px]`, `left-[20px]`, `right-[20px]`
- Font: Roboto Regular (400), 13px, line-height 19.5px, `#4b5563`
- Text-align: center

##### The 4 Resolution Options

| Position | Title | Icon (FA Unicode) | Lucide Equivalent | Description |
|----------|-------|-------------------|-------------------|-------------|
| Row 1, Col 1 | Exchange |  (exchange-alt) | `ArrowLeftRight` | Swap for a different color, size, or variant |
| Row 1, Col 2 | Replace |  (sync-alt) | `RefreshCw` | Get the exact same item sent again |
| Row 2, Col 1 | Store Credit |  (credit-card) | `CreditCard` | Instant credit to your Hylee account |
| Row 2, Col 2 | Refund |  (smile) | `Smile` | Money back to original payment method |

##### Summary Section — `div.summary-section` (INSIDE the card body)

- Background: `#f9fafb`
- Border radius: `12px`
- Padding: `28px 20px 32px 20px` (pt-28, px-20, pb-32)
- Gap: `12px` between rows

**Row 1**: "Items being returned" (Regular 14px, `#4b5563`) → count (Medium 14px, `#1f2937`)
**Row 2**: "Subtotal" (Regular 14px, `#4b5563`) → "$348.99" (Medium 14px, `#1f2937`)
**Row 3**: "Return shipping" (Regular 14px, `#4b5563`) → "Free" (Medium 14px, `#2ac864`)
**Divider**: `border-t-2 border-[#e5e7eb]`, `pt-[14px]`
**Total**: "Total Resolution Value" (Bold 16px, `#111827`) → "$348.99" (Bold 16px, `#4fd1a8`)

### 5. Our Promise Notice

- Background: `rgba(38,153,166,0.05)`
- Border: `1px solid rgba(38,153,166,0.2)`
- Border radius: `12px`
- Padding: `21px`
- Gap: `8px` between header and body

**Header**: "Our Promise" — Roboto SemiBold (600), 14px, line-height 21px, `#4fd1a8`, `pl-[8px]`
**Body**: "We're committed to making this right for you. All return shipping is free, and we'll keep you updated every step of the way."
- Roboto Regular (400), 14px, line-height 22.4px, `#4b5563`

### 6. Action Buttons (NOT in Figma frame — inferred from Steps 2-3 pattern)

- Inline (not sticky), flex, gap `12px`, `pt-[16px]`
- **Cancel** (~35% flex): White bg, border `#d1d5db`, rounded-8px, Medium 15px `#374151`
  - Navigates back to Step 3 with all accumulated URL state
- **Submit Return** (~65% flex): `bg-return-accent`, rounded-8px, Medium 15px white
  - Disabled at 50% opacity when no resolution selected
  - Enabled when a resolution option is chosen
  - On click: shows confirmation/success (future) or navigates to confirmation page

---

## Icon Mapping (FontAwesome → Lucide)

| Element | FA Unicode | Lucide | Size | Color |
|---------|-----------|--------|------|-------|
| Exchange option |  | `ArrowLeftRight` | 28px | `#4b5563` |
| Replace option |  | `RefreshCw` | 28px | `#4b5563` |
| Store Credit option |  | `CreditCard` | 28px | `#4b5563` |
| Refund option |  | `Smile` | 28px | `#4b5563` |
| Product placeholder |  | `Headphones` | 20px | `#9ca3af` |
| Product placeholder |  | `Plug` | 20px | `#9ca3af` |

---

## Interactive States (not in Figma — derived from project patterns)

- **Resolution card hover**: subtle border color change or light background tint
- **Resolution card selected**: `border-[#4fd1a8]`, `bg-[rgba(38,153,166,0.05)]`, shadow, icon color changes to `#4fd1a8`
- **Submit button hover**: slight brightness increase (when enabled)
- **Cancel button hover**: light gray background tint `#f9fafb`

---

## Responsive Translation

- **Desktop (>=1024px)**: 900px max-width container, centered
- **Tablet (768-1023px)**: Full width with 24px horizontal padding
- **Mobile (<768px)**:
  - Resolution grid: consider stacking to 1 column on very small screens
  - Item preview thumbnails: remain at 50px, wrap naturally
  - Action buttons: full width, may stack vertically
