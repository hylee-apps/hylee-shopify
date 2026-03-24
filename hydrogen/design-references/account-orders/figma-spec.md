# My Orders Page — Figma Spec

> **Figma File**: `Q541sIDD20eXqQSSozFUw4`
> **Node ID**: `3:1270` (Main Content frame)
> **Captured**: 2026-03-24
> **Frame Size**: 1280 x 2282px (main content area, excludes sidebar)

## Page Structure

1. **Page Header** — title + subtitle
2. **Stats Cards** — 3 equal-width stat cards in a row
3. **Tab Bar** — 3 tabs (Orders, Buy Again, On the Way Out)
4. **Orders Header** — count + time filter dropdown
5. **Order Cards** — stacked cards with header + body (per-product rows)
6. **Pagination** — numbered page buttons

---

## 1. Page Header

| Property | Value |
|----------|-------|
| Container padding | `px-[24px] py-[47px]` (top of main content) |
| Gap between title and subtitle | `~8px` |

### Title
- Text: "My Orders"
- Font: Roboto Bold, `32px`, line-height `51.2px`
- Color: `#1f2937` (gray-800)

### Subtitle
- Text: "View and manage your order history"
- Font: Roboto Regular, `16px`, line-height `25.6px`
- Color: `#6b7280` (gray-500)

---

## 2. Stats Cards

| Property | Value |
|----------|-------|
| Container | `flex gap-[24px]`, full width |
| Container padding-bottom | `16px` |
| Card layout | `flex-1` (equal width), `flex gap-[16px] items-center` |
| Card padding | `px-[32px] pt-[31px] pb-[32px]` |
| Card bg | `white` |
| Card radius | `12px` |
| Card shadow | `0px 1px 2px 0px rgba(0,0,0,0.05)` |

### Icon Square
- Size: `56px x 56px`
- Radius: `12px`
- Icon size: `24px`

### Card Variants

| Card | Icon BG | Icon Color | Value | Label |
|------|---------|------------|-------|-------|
| Orders | `rgba(59,130,246,0.1)` | `#3b82f6` (blue-500) | dynamic | "Orders" |
| On The Way Out | `rgba(245,158,11,0.1)` | `#f59e0b` (amber-500) | dynamic | "On The Way Out" |
| Re-Purchase | `rgba(16,185,129,0.1)` | `#10b981` (emerald-500) | dynamic | "Re-Purchase" |

### Stat Value
- Font: Roboto Bold, `28px`, line-height `44.8px`
- Color: `#1f2937`

### Stat Label
- Font: Roboto Regular, `14px`, line-height `22.4px`
- Color: `#6b7280`

---

## 3. Tab Bar

| Property | Value |
|----------|-------|
| Container | `bg-white border-b border-[#e5e7eb]`, height `59px` |
| Tab gap | `4px` |
| Tab padding | `px-[24px] pt-[16px] pb-[19px]` |
| Tab icon | `14px` |
| Tab icon-label gap | `8px` |

### Active Tab
- Border-bottom: `3px solid #f2b05e` (amber/gold)
- Text: `15px`, `#40283c` (dark — uses `--color-dark` token)
- Icon: `14px`, `#40283c`

### Inactive Tab
- Border-bottom: `3px solid transparent`
- Text: `15px`, `#4b5563` (gray-600)
- Icon: `14px`, `#4b5563`

### Tab Items
1. **Orders** (shopping bag icon) — default active
2. **Buy Again** (refresh icon)
3. **On the Way Out** (truck icon)

---

## 4. Orders Header

| Property | Value |
|----------|-------|
| Container padding | `p-[24px]`, `max-w-[1400px]` |

### Count Text
- Format: `{count}` (regular) + ` orders placed in` (bold)
- Font: `18px`, line-height `27px`
- Color: `#111827`

### Time Filter Dropdown
- Container: `bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[9px]`
- Text: `14px` regular, `black`, line-height `16px`
- Default value: "past 3 months"

---

## 5. Order Card

### Card Container
- Background: `white`
- Radius: `12px`
- Shadow: `0px 1px 2px 0px rgba(0,0,0,0.05)`
- Overflow: `clip`
- Gap between cards: `24px`

### Card Header
| Property | Value |
|----------|-------|
| Background | `bg-gradient-to-r from-[#f9fafb] to-white` |
| Border-bottom | `1px solid #e5e7eb` |
| Padding | `px-[24px] pt-[16px] pb-[17px]` |
| Layout | `flex flex-wrap justify-between` |

#### Meta Labels (ORDER PLACED, TOTAL, SHIP TO, ORDER #)
- Font: `12px` uppercase, tracking `0.5px`, line-height `18px`
- Color: `#6b7280`

#### Meta Values
- Font: `15px` regular, line-height `22.5px`
- Color: `#111827`

#### Ship To Pill
- Container: `bg-white border border-[#d1d5db] rounded-[4px] px-[9px] py-[5px]`
- Name text: `14px`, `#374151`, line-height `21px`
- Chevron icon: `14px`, `#374151`

#### Order Links (right side)
- "View order details" | "View invoice"
- Font: `14px` regular, line-height `21px`
- Color: `#2699a6` (secondary)
- Separator `|`: `14px`, `#d1d5db`
- Gap between items: `16px`

### Card Body
| Property | Value |
|----------|-------|
| Padding | `p-[24px]` |
| Gap | `16px` |

#### Delivery Status
- **Today delivery**: `20px`, `#2ac864` (primary green), line-height `30px` — text "Delivered today"
- **Past delivery**: `20px`, `#111827`, line-height `30px` — text "Delivered February 25"
- **Message**: `14px`, `#4b5563`, line-height `21px`

#### Product Row
| Property | Value |
|----------|-------|
| Layout | `flex gap-[24px]` |
| Row padding | `py-[16px]` |
| Divider between products | `border-b border-[#f3f4f6]` (except last) |

##### Product Image
- Size: `120px x 120px`
- Background: `#f3f4f6`
- Radius: `8px`
- Placeholder icon: `40px`, `#9ca3af`

##### Product Info (center, flex-1)
- **Product name**: `15px`, `#2699a6` (secondary), line-height `21px` — clickable link
- **Variant/return info**: `13px`, `#4b5563`, line-height `19.5px`
- **Action buttons** (below info, `pt-[8px]`):
  - "Buy it again": `bg-[#14b8a6] border border-[#14b8a6]`, white text, `14px`, `px-[17px] py-[9px]`, with icon + `gap-[8px]`
  - "View your item": `bg-white border border-[#d1d5db]`, `#374151` text, `14px`, `px-[17px] py-[9px]`

##### Actions Panel (right side, 200px)
- Width: `200px`, `min-w-[200px]`
- Layout: `flex flex-col gap-[8px]`
- **Primary action** (first button in some cards): `bg-[#14b8a6] border border-[#14b8a6]`, white text, centered
- **Secondary actions**: `bg-white border border-[#d1d5db]`, `#374151` text, centered
- Button padding: `px-[17px] py-[13px]`
- Button text: `14px`, line-height `21px`

##### Action Button Options (vary per order status)
- Track package
- Return or replace items
- Share gift receipt
- Ask Product Question
- Write a product review
- Get product support
- Leave seller feedback

---

## 6. Pagination

| Property | Value |
|----------|-------|
| Layout | `flex gap-[8px] items-center justify-center` |
| Full width | yes |

### Page Button
- Size: `40px x 40px`
- Radius: `8px`
- Text: `14px`, centered

### Active Page
- Background: `#14b8a6` (hero teal)
- Border: `1px solid #14b8a6`
- Text: `white`

### Inactive Page
- Background: `white`
- Border: `1px solid #e5e7eb`
- Text: `#1f2937`

### Disabled (prev on page 1)
- Same as inactive + `opacity-50`

### Ellipsis
- Text: `16px`, `#6b7280`, line-height `25.6px`

### Arrows
- Icon: `14px`, `#1f2937`

---

## Deviations from Figma

| Item | Figma | Implementation | Reason |
|------|-------|----------------|--------|
| Icons | Font Awesome 5 | Lucide React | Project convention |
| Font | Roboto | Roboto | No change needed |
| Tab active color | `#f2b05e` (amber) | `border-[#f2b05e]` arbitrary | No existing token |
| Stat icon colors | Hardcoded hex | Arbitrary Tailwind values | No existing tokens |
| Pagination active | `#14b8a6` | Uses `--color-hero` token | Exact match |
| Order # format | `111-7944634-4352208` | Shopify `order.name` (e.g., `#1001`) | Shopify format |
| "Buy Again" tab | Links to filtered view | Tab state filter on same page | Simpler UX for MVP |
| Ship To dropdown | Shows chevron | Static text (no dropdown) | MVP — no multi-address per order |
| Time filter | Functional dropdown | Static display for MVP | Future: add date range filtering |
