# Buy Again Tab — Figma Spec

> **File key**: `Q541sIDD20eXqQSSozFUw4`
> **Node ID**: `10:365`
> **Captured**: 2026-03-25
> **Figma URL**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=10-365
> **Frame Size**: 1280px main content area (excludes sidebar)

## Overview

This is the "Buy Again" tab content within the My Orders page. When the user clicks the "Buy Again" tab, the order cards are replaced with a **3-column product card grid** — individual products from fulfilled orders displayed as vertical cards with "Add to Cart" and view actions.

## Layout Structure

The page retains the same outer structure as the Orders tab:
- Page header ("My Orders" + subtitle) — **unchanged**
- Stats cards (3 cards) — **unchanged**
- Tab bar (with "Buy Again" active) — **unchanged**
- **NEW: Sub-section header** ("Buy Again" title + subtitle)
- **NEW: Product card grid** (3-column vertical product cards)
- Pagination — **unchanged**

**NOT present on Buy Again tab (differs from Orders tab):**
- ❌ No time filter dropdown
- ❌ No "X orders placed in" header
- ❌ No order-level cards (OrderCard)
- ❌ No actions panel (right-side desktop panel)

## Sub-section Header

```
Container: flex flex-col gap-[8px] items-start w-full
  Title: font-bold text-[24px] leading-[36px] text-[#111827]
    Text: "Buy Again"
  Subtitle: font-normal text-[15px] leading-[22.5px] text-[#4b5563]
    Text: "Quickly reorder items you've purchased before"
```

## Product Card Grid

```
Container: grid grid-cols-3 gap-[24px] w-full
```

Grid computed from Figma absolute positioning:
- Card 1: `left-0`, Card 2: `left-[344px]`, Card 3: `left-[688px]`
- Card width: ~320px (flex within column)
- Gap between cards: ~24px
- 2 rows of 3 visible in design = 6 products per page

### Responsive Translation
- Desktop (≥1024px): `grid-cols-3`
- Tablet (≥640px): `grid-cols-2`
- Mobile (<640px): `grid-cols-1`

## Product Card (BuyAgainCard)

### Card Container
```
bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-clip w-full
flex flex-col
```

### Card Body
```
Container: flex flex-col p-[20px] w-full
```

#### Product Image
```
bg-[#f3f4f6] h-[200px] rounded-[8px] overflow-clip w-full
flex items-center justify-center
Placeholder icon: size-[60px] text-[#9ca3af] (image placeholder icon)
Real image: object-cover w-full h-full
```

#### Product Title (16px below image)
```
font-medium text-[15px] text-[#2699a6] leading-[21px]
Clickable link to /products/{handle}
hover:underline
Multi-line supported (up to 4 lines observed in design)
```

#### Product Price (positioned below title, with variable gap due to multi-line titles)
```
font-bold text-[18px] text-[#111827] leading-[27px]
Format: "$XX.XX"
```

#### Last Ordered Date (below price)
```
font-normal text-[13px] text-[#6b7280] leading-[19.5px]
Format: "Last ordered: Mon DD, YYYY"
```

#### Action Buttons (below last ordered, bottom of card)
```
Container: flex gap-[8px] items-start justify-center w-full h-[47px]
```

**"Add to Cart" button (primary, flex-1):**
```
bg-[#2699a6] border border-[#2699a6] flex-1
flex gap-[8px] items-center justify-center
pb-[13.5px] pt-[12.5px] px-[17px]
Icon: cart/shopping icon, size-[14px] text-white
Text: font-medium text-[14px] text-white text-center leading-[21px]
hover:bg-[#1e7a85] transition-colors cursor-pointer
```

**CRITICAL:** "Add to Cart" uses `#2699a6` (secondary teal), **NOT** `#14b8a6` (hero teal).

**"View" button (secondary, flex-1, icon only):**
```
bg-white border border-[#d1d5db] flex-1
flex items-center justify-center
px-[17px] py-[13px]
Icon: eye icon, size-[14px] text-[#374151]
hover:border-[#9ca3af] transition-colors cursor-pointer
```

**NOTE:** The "View" button is **icon-only** (eye icon) — no text label in the Figma design.

## Stats Cards (unchanged)

Same as Orders tab — 3 cards:
| Card | Icon BG | Icon Color | Label |
|------|---------|------------|-------|
| Orders | `rgba(59,130,246,0.1)` | `#3b82f6` | "Orders" |
| On The Way Out | `rgba(245,158,11,0.1)` | `#f59e0b` | "On The Way Out" |
| Re-Purchase | `rgba(16,185,129,0.1)` | `#10b981` | "Re-Purchase" |

## Tab Bar (unchanged)

- "Buy Again" tab active: border-bottom `3px solid #f2b05e`, text `#40283c`
- Other tabs inactive: border-bottom `3px solid transparent`, text `#4b5563`

## Pagination (unchanged)

Same as Orders tab:
- Active page: `bg-[#14b8a6] border-[#14b8a6] text-white`
- Inactive: `bg-white border-[#e5e7eb] text-[#1f2937]`
- Disabled: `opacity-50`

## Design Tokens Summary

| Element | Color | Token | Notes |
|---------|-------|-------|-------|
| "Add to Cart" bg | `#2699a6` | `--color-secondary` | **NOT hero teal** |
| Product title | `#2699a6` | `--color-secondary` | Link color |
| Price text | `#111827` | — | Gray-900 |
| Last ordered text | `#6b7280` | — | Gray-500 |
| Card shadow | `rgba(0,0,0,0.05)` | — | Subtle shadow |
| Image placeholder bg | `#f3f4f6` | — | Gray-100 |
| Placeholder icon | `#9ca3af` | — | Gray-400 |
| View btn border | `#d1d5db` | — | Gray-300 |
| View btn icon | `#374151` | — | Gray-700 |
| Active tab border | `#f2b05e` | `--color-warning` | Amber |
| Active tab text | `#40283c` | `--color-dark` | Dark |
| Sub-header title | `#111827` | — | Gray-900 |
| Sub-header subtitle | `#4b5563` | — | Gray-600 |

## Deviations from Figma

| Item | Figma | Implementation | Reason |
|------|-------|----------------|--------|
| Icons | Font Awesome 5 | Lucide React | Project convention |
| Font | Roboto | Roboto | No change needed |
| Grid positioning | Absolute positions | CSS Grid | Responsive + semantic |
| Card height | Variable (448–470px) | Auto height | Content-driven |
| "Add to Cart" icon | FA shopping cart | Lucide `ShoppingCart` | Project convention |
| "View" icon | FA eye | Lucide `Eye` | Project convention |
| Product titles | Static placeholder text | Dynamic from Shopify | Real data |
