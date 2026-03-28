# Return Process — Step 1: Select Items

> **Figma File Key**: `NEk59QDkRMC3a6LD0WZVQJ`
> **Node ID**: `1:74`
> **Frame**: `1920w light`
> **Captured**: 2026-03-26

## Overview

Entry point for the return process. User selects items from a delivered order to return. This is Step 1 of a 4-step flow: **Select Items** → Reason → Ship → Make It Right.

---

## Layout

- **Page background**: Linear gradient `rgb(249,250,251)` → same = solid `#f9fafb`
- **Content container**: `div.return-layout`
  - Max width: `900px`
  - Horizontal padding: `24px`
  - Top padding: `32px`, Bottom padding: `64px`
  - Centered within page (left/right: 510px at 1920w)
  - Gap between children: `8px`

---

## Sections (top to bottom)

### 1. Title — `h1`

- Text: "Start a Return"
- Font: Roboto Light (300), 32px, line-height 48px
- Color: `#1f2937` (gray-800)
- Alignment: center

### 2. Subtitle — `p`

- Text: "Order #HY-2024-78432 • Delivered on Feb 28, 2026"
- Font: Roboto Regular (400), 16px, line-height 24px
- Color: `#4b5563` (gray-600)
- Alignment: center

### 3. Progress Steps — `div.return-steps`

- Container: flex, gap 16px, centered, padding-top 24px, padding-bottom 32px
- **4 steps**: Select Items, Reason, Ship, Make It Right

#### Active Step (Step 1: Select Items)

- **Circle**: 48×48px, bg `#4fd1a8`, rounded-full
- **Shadow ring**: `0 0 0 4px rgba(38,153,166,0.2)` (teal glow)
- **Icon**: FontAwesome (clipboard-list `` → map to Lucide `ClipboardList`), 20px, white
- **Label**: Roboto Medium (500), 13px, line-height 19.5px, `#4b5563`

#### Pending Steps (Steps 2-4)

- **Circle**: 48×48px, bg `#e5e7eb`, rounded-full
- **Opacity**: 40% on entire step group
- **Icon**: FontAwesome 20px, color `#4b5563`
  - Reason: `question-circle` `` → Lucide `HelpCircle`
  - Ship: `shipping-fast` `` → Lucide `Truck`
  - Make It Right: `smile` `` → Lucide `SmilePlus`
- **Label**: same as active

#### Connector Lines

- Width: `60px`, height: `2px`
- Color: `#e5e7eb`
- Positioned at 24px from top (vertically centered with circles)

### 4. Selection Summary Bar — `div.selection-summary`

- Background: `#f9fafb` (gray-50)
- Border radius: `12px`
- Padding: `20px 24px`
- Flex: space-between, items-center

#### Left Side — `div.selection-info`

- **Count**: "0 of 3 items selected" — Roboto Regular, 14px, `#4b5563`
- **Refund**: "Estimated refund: $0.00" — Roboto Bold (700), 18px, `#111827`
- Gap between: `4px`

#### Right Side — Select All link

- Text: "Select All" — Roboto Medium (500), 14px, `#4fd1a8`
- Clickable — toggles all items

### 5. Order Items Card — `div.card`

- Background: `white`
- Border: `1px solid #e5e7eb`
- Border radius: `12px`
- Shadow: `0 1px 2px rgba(0,0,0,0.05)`
- Overflow: clip

#### Card Header — `div.card-header`

- Padding: `20px 24px` (top 20px, bottom 21px)
- Border-bottom: `1px solid #e5e7eb`
- Flex: space-between
- **Title**: "Order Items" — Roboto Bold (700), 18px, `#111827`
- **Subtitle**: "Tap to select items to return" — Roboto Regular, 14px, `#6b7280`

#### Card Body — Order Items List

- Gap between items: `16px`
- Each item: `div.order-item`

##### Individual Order Item

- Border: `2px solid #e5e7eb`
- Border radius: `12px`
- Padding: `22px`
- Flex: row, gap `20px`, items-start

**Checkbox** (`div.order-item-checkbox`):
- Size: `24×24px`
- Border: `2px solid #d1d5db`
- Border radius: `4px`
- Top margin: `8px` (to align with product name)
- Selected state: bg `#4fd1a8`, white checkmark icon

**Product Image** (`div.item-image`):
- Size: `100×100px`
- Background: `#f3f4f6` (gray-100)
- Border radius: `8px`
- Placeholder: FontAwesome icon 40px, `#9ca3af`
- Real: product image `object-cover`

**Item Details** (`div.item-details`):
- Flex: 1, column, gap `4px`
- **Name** (`h4.item-name`): Roboto Medium (500), 16px, line-height 24px, `#1f2937`
- **Meta** (`p.item-meta`): Roboto Regular, 14px, line-height 21px, `#6b7280`
  - Format: "Color: {variant} • Qty: {quantity}" or "Length: {variant} • Qty: {quantity}"
- **Price** (`p.item-price`): Roboto SemiBold (600), 16px, line-height 24px, `#4fd1a8`
  - Top padding: `4px`

**Status Badge** (`span.item-status`):
- Background: `rgba(42,200,100,0.1)` — light green
- Border radius: `4px`
- Padding: `4px 8px`
- Text: "RETURN ELIGIBLE" — Roboto Medium, 12px, uppercase, tracking `0.5px`, `#2ac864`
- Alternate states: "FINAL SALE" (red), "RETURN WINDOW CLOSED" (gray)

### 6. Return Policy Notice — Warning Box

- Background: `rgba(242,176,94,0.1)`
- Border: `1px solid rgba(242,176,94,0.3)`
- Border radius: `12px`
- Padding: `21px`
- Gap between children: `8px`

**Header** (`h4`):
- Flex: row, gap `8px`
- Icon: FontAwesome exclamation-circle, 14px, `#f2b05e` → Lucide `AlertCircle`
- Text: "Return Policy" — Roboto SemiBold (600), 14px, `#f2b05e`

**Body** (`p`):
- Font: Roboto Regular, 14px, line-height 22.4px, `#4b5563`
- Text: "Items must be returned within 30 days of delivery in original packaging. Refunds are processed within 5-7 business days after we receive your return."

### 7. Bottom Action Bar — `div.actions-bar`

- **Position**: Sticky bottom
- Background: `white`
- Border-top: `1px solid #e5e7eb`
- Padding: `17px 24px 16px`
- Shadow above: `0 -4px 6px -1px rgba(0,0,0,0.1)`
- Flex: space-between, items-center

**Back Button** (`Component 2`):
- Background: `white`
- Border: `1px solid #d1d5db`
- Border radius: `8px`
- Padding: `13px 25px`
- Icon: FontAwesome arrow-left, 15px, `#374151` → Lucide `ArrowLeft`
- Text: "Back to Orders" — Roboto Medium, 15px, `#374151`
- Gap between icon and text: `8px` + `8px` left padding on text = `16px` effective

**Continue Button** (`Component 3`):
- Background: `#4fd1a8`
- Border radius: `8px`
- Padding: `12px 24px`
- Text: "Continue to Reason" — Roboto Medium, 15px, white, centered
- Icon: FontAwesome arrow-right, 15px, white → Lucide `ArrowRight`
- Gap: `8px` + `8px` left padding on icon
- **Disabled state**: `opacity: 50%` (when no items selected)
- **Enabled state**: `opacity: 100%` (when >= 1 item selected)

---

## Color Reference: `#4fd1a8`

This mint-green color appears throughout the return flow and is NOT an existing design token:
- `--color-primary` = `#2ac864` (bright green)
- `--color-secondary` = `#2699a6` (teal)
- `--color-brand-accent` = `#2bd9a8` (vivid teal)
- **`#4fd1a8`** = mint green — used for active step, price, CTA, Select All link, checkbox selected

**Decision needed**: Add as `--color-return-accent: #4fd1a8` token, or use arbitrary `[#4fd1a8]` values. Recommendation: add token since it's used extensively across all 4 return steps.

---

## Icon Mapping (FontAwesome → Lucide)

| Figma (FA) | Unicode | Lucide Equivalent | Usage |
|-----------|---------|-------------------|-------|
| clipboard-list |  | `ClipboardList` | Step 1: Select Items |
| question-circle |  | `HelpCircle` | Step 2: Reason |
| shipping-fast |  | `Truck` | Step 3: Ship |
| smile |  | `SmilePlus` | Step 4: Make It Right |
| arrow-left |  | `ArrowLeft` | Back button |
| arrow-right |  | `ArrowRight` | Continue button |
| exclamation-circle |  | `AlertCircle` | Return Policy warning |
| headphones |  | `Headphones` | Product placeholder |
| plug |  | `Cable` | Product placeholder |
| mobile-alt |  | `Smartphone` | Product placeholder |

---

## Interactive States (not specified in Figma — use project defaults)

- **Checkbox hover**: subtle border color change to `#4fd1a8`
- **Checkbox selected**: bg `#4fd1a8`, white checkmark, border color `#4fd1a8`
- **Order item selected**: border changes from `#e5e7eb` to `#4fd1a8` (2px)
- **Order item hover**: light background tint or subtle border highlight
- **Select All / Deselect All**: toggles text and state
- **Continue button hover**: slight brightness increase (when enabled)
- **Back button hover**: light gray background tint

---

## Responsive Translation

- **Desktop (>=1024px)**: 900px max-width container, centered
- **Tablet (768-1023px)**: Full width with 24px horizontal padding
- **Mobile (<768px)**:
  - Progress steps may need to condense (smaller circles, shorter lines)
  - Order items stack checkbox above image on very small screens
  - Action bar remains sticky at bottom, full width
  - Product images shrink to 80px
