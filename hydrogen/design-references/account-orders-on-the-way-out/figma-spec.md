# On the Way Out Tab — Figma Spec

> **File key**: `Q541sIDD20eXqQSSozFUw4`
> **Node ID**: `10:1556`
> **Captured**: 2026-03-24
> **Figma URL**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=10-1556

## Overview

This is the "On the Way Out" tab content within the My Orders page. When the user clicks the "On the Way Out" tab, the order cards are replaced with **outgoing cards** — returns and exchanges in various stages of processing. Each card includes a **progress tracker** showing the return/exchange lifecycle.

## Layout Structure

The page retains the same outer structure as the Orders tab:
- Page header ("My Orders" + subtitle)
- Stats cards (3 cards, unchanged)
- Tab bar (with "On the Way Out" active)
- **NEW: Sub-section header** ("On the Way Out" title + subtitle)
- **NEW: Outgoing cards** (return/exchange cards with progress trackers)
- Pagination (unchanged)

## Sub-section Header

Positioned inside the main content area (24px padding container).

```
Container: flex flex-col gap-[8px] items-start w-full
Title: font-bold text-[24px] leading-[36px] text-[#111827]
Subtitle: font-normal text-[15px] leading-[22.5px] text-[#4b5563]
```

- Title text: "On the Way Out"
- Subtitle text: "Track your returns and items being shipped back"

## Outgoing Card

Three card variants shown in the design, each representing a different return/exchange status.

### Card Container
```
bg-white rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-clip w-full
```

### Card Header (Gradient)
```
bg-gradient-to-r from-[#f9fafb] to-white border-b border-[#e5e7eb]
flex flex-wrap justify-between px-[24px] pt-[16px] pb-[17px] w-full
```

#### Left Side — Meta Items
```
flex flex-wrap gap-[0px_24px] items-start
```

**Meta item structure:**
```
Container: flex flex-col gap-[2px]
Label: font-medium text-[12px] uppercase tracking-[0.5px] text-[#6b7280] leading-[18px]
Value: font-semibold text-[15px] text-[#111827] leading-[22.5px]
```

**Meta fields vary by card type:**

| Card Type | Field 1 | Field 2 | Field 3 |
|-----------|---------|---------|---------|
| Return | RETURN INITIATED (date) | REFUND AMOUNT ($) | ORIGINAL ORDER # (link) |
| Exchange | EXCHANGE REQUESTED (date) | EXCHANGE FOR (description) | ORIGINAL ORDER # (link) |

**Original Order # value:** `font-semibold text-[15px] text-[#2699a6] leading-[22.5px]` (secondary teal, clickable link)

#### Right Side — Status Badge + Links

**Status badge:**
```
Container: flex gap-[8px] items-center px-[12px] py-[8px] w-full
Icon: text-[13px] (Lucide icon)
Text: font-semibold text-[13px] leading-[19.5px]
```

**Status badge colors by status:**

| Status | Background | Text/Icon Color |
|--------|-----------|-----------------|
| Return Shipped | `bg-[rgba(42,200,100,0.1)]` | `text-[#2ac864]` (primary green) |
| Awaiting Pickup | `bg-[rgba(242,176,94,0.1)]` | `text-[#f2b05e]` (amber) |
| Out for Delivery | `bg-[rgba(38,153,166,0.1)]` | `text-[#2699a6]` (secondary teal) |

**Links (below status badge, 8px top margin):**
```
Container: flex gap-[16px] items-start
Link: font-normal text-[14px] text-[#2699a6] leading-[21px] hover:underline
Separator: font-normal text-[14px] text-[#d1d5db] leading-[21px]
```

**Links vary by status:**

| Status | Link 1 | Link 2 |
|--------|--------|--------|
| Return Shipped | View return details | View refund status |
| Awaiting Pickup | View return details | Cancel return |
| Out for Delivery (Exchange) | View exchange details | Track new item |

### Card Body
```
Container: flex flex-col gap-[16px] p-[24px] w-full
```

#### Return/Exchange Status Text
```
Container: flex flex-col gap-[4px]
Title: font-bold text-[20px] leading-[30px] text-[#111827]
Message: font-normal text-[14px] leading-[21px] text-[#4b5563]
```

**Status text by card type:**

| Status | Title | Message |
|--------|-------|---------|
| Return Shipped | "Return shipped on [date]" | "Your return is on its way to our warehouse. Refund will be processed within 3-5 business days after receipt." |
| Awaiting Pickup | "Scheduled for pickup on [date]" | "Your package is ready for pickup. A carrier will pick it up from your address on the scheduled date." |
| Out for Delivery (Exchange) | "Your replacement item is out for delivery" | "Expected delivery by 8 PM today. Your original item will be picked up when the replacement is delivered." |

#### Product Row
```
Container: flex gap-[24px] items-start py-[16px] border-b border-[#f3f4f6] (except last)
```

**Product image:**
```
size-[120px] bg-[#f3f4f6] rounded-[8px] overflow-clip shrink-0
flex items-center justify-center
Placeholder icon: size-[40px] text-[#9ca3af]
```

**Product info (center, flex-1):**
```
Container: flex flex-col gap-[8px]
Product name: font-medium text-[15px] text-[#2699a6] leading-[21px] hover:underline
Variant: font-normal text-[13px] text-[#4b5563] leading-[19.5px]
Return info (8px top margin): font-normal text-[13px] text-[#4b5563] leading-[19.5px]
```

**Product info text by card type:**

| Status | Variant text | Return info |
|--------|-------------|-------------|
| Return Shipped | "Color: Black \| Size: Medium" | "Reason: Not as described \| Condition: Used - Like New" |
| Awaiting Pickup | "Color: Rose Gold \| Band Size: Small/Medium" | "Reason: Changed mind \| Condition: New in box" |
| Exchange | "Exchanging: Size 9 -> Size 10 \| Color: Navy Blue" | "Exchange reason: Size too small" |

**Inline action buttons (8px top margin):**
```
Container: flex flex-wrap gap-[8px]
Button: bg-white border border-[#d1d5db] flex gap-[8px] items-center px-[17px] py-[9px]
        font-medium text-[14px] text-[#374151] leading-[21px]
        hover:border-[#9ca3af] transition-colors cursor-pointer
Icon (when present): size-[14px] text-[#374151]
```

**Inline buttons by status:**

| Status | Button 1 | Button 2 |
|--------|----------|----------|
| Return Shipped | Print return label (with icon) | Contact seller |
| Awaiting Pickup | Print return label (with icon) | Reschedule pickup |
| Exchange | View tracking | Contact support |

**Actions panel (right side, desktop only):**
```
Container: w-[200px] min-w-[200px] flex flex-col gap-[8px]
hidden lg:flex
```

**Primary action button:**
```
bg-[#2699a6] border border-[#2699a6] flex gap-[8px] items-center justify-center
px-[17px] py-[13px] text-[14px] font-medium text-white text-center leading-[21px] w-full
hover:bg-[#1e7a85] transition-colors cursor-pointer
Icon: size-[14px] text-white
```

**NOTE:** Primary buttons use `#2699a6` (secondary teal) — NOT `#14b8a6` (hero teal) used in Orders tab.

**Secondary action button:**
```
bg-white border border-[#d1d5db] flex gap-[8px] items-center justify-center
px-[17px] py-[13px] text-[14px] font-medium text-[#374151] text-center leading-[21px] w-full
hover:border-[#9ca3af] transition-colors cursor-pointer
Icon: size-[14px] text-[#374151]
```

**Actions panel buttons by status:**

| Status | Primary | Secondary |
|--------|---------|-----------|
| Return Shipped | Track return package (icon) | View refund status ($ icon) |
| Awaiting Pickup | View pickup details (icon) | Prepare package (icon) |
| Exchange | Track delivery (icon) | View exchange details (icon) |

### Progress Tracker
```
Container: bg-[#f9fafb] rounded-[8px] p-[16px] w-full
Inner: flex items-center justify-between w-full (relative)
```

**Connecting line (pseudo-element):**
```
absolute bg-[#d1d5db] h-[3px] left-0 right-0 top-[15px]
```

**Step container:**
```
flex flex-1 flex-col gap-[8px] items-center (relative, z-above line)
```

**Step icon — Completed:**
```
bg-[#2ac864] size-[32px] rounded-[16px] flex items-center justify-center
Icon: Check icon, size-[14px] text-white
```

**Step icon — Active (current):**
```
bg-[#2699a6] size-[32px] rounded-[16px] flex items-center justify-center
Shadow ring: shadow-[0px_0px_0px_4px_rgba(38,153,166,0.2)]
Icon: status-specific icon, size-[14px] text-white
```

**Step icon — Pending:**
```
bg-[#d1d5db] size-[32px] rounded-[16px] flex items-center justify-center
Icon: status-specific icon, size-[14px] text-[#6b7280]
```

**Step label — Completed/Active:**
```
font-medium text-[12px] leading-[18px] text-[#111827] text-center whitespace-nowrap
```

**Step label — Pending:**
```
font-medium text-[12px] leading-[18px] text-[#4b5563] text-center whitespace-nowrap
```

**Progress steps by card type:**

| Return Card | Step 1 | Step 2 | Step 3 | Step 4 | Step 5 |
|-------------|--------|--------|--------|--------|--------|
| Return Shipped | Return Requested (complete) | Label Generated (complete) | Package Shipped (complete) | In Transit (active) | Refund Processed (pending) |
| Awaiting Pickup | Return Requested (complete) | Label Generated (complete) | Awaiting Pickup (active) | In Transit (pending) | Refund Processed (pending) |

| Exchange Card | Step 1 | Step 2 | Step 3 | Step 4 | Step 5 |
|---------------|--------|--------|--------|--------|--------|
| Out for Delivery | Exchange Requested (complete) | Return Shipped (complete) | New Item Shipped (complete) | Out for Delivery (active) | Exchange Complete (pending) |

## Deviations from Figma

| Item | Figma | Implementation | Reason |
|------|-------|----------------|--------|
| Icons | Font Awesome 5 | Lucide React | Project convention |
| Font | Roboto | Roboto | No change needed |
| Meta label font weight | `font-medium` (500) | `font-medium` | Match Figma exactly |
| Meta value font weight | `font-semibold` (600) | `font-semibold` | Match Figma exactly |
| Original Order # | Amazon-style format | Shopify `order.name` (#1001) | Shopify uses different format |
| Primary action bg | `#2699a6` (secondary) | `bg-secondary` / `bg-[#2699a6]` | Different from Orders tab hero teal |
| Return/exchange data | Static placeholder data | Simulated from order data | Shopify doesn't have a returns API in Storefront API |
| Progress tracker icons | Font Awesome glyphs | Lucide icons (Check, Tag, Package, Truck, DollarSign, etc.) | Project convention |
| Status badge icons | Font Awesome glyphs | Lucide icons (PackageCheck, Clock, Truck) | Project convention |
