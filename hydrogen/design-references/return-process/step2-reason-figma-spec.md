# Return Process — Step 2: Return Reason — Figma Spec

> **Figma File**: `NEk59QDkRMC3a6LD0WZVQJ` (Return Process)
> **Node**: `1:321`
> **Captured**: 2026-03-26

## Overview

Step 2 of the return wizard. Title changes to "Return Items" (was "Start a Return" in Step 1). Users see their selected items with inline reason selection per item. The first item is expanded to show the reason form; others are collapsed. A Refund Summary replaces the Selection Summary from Step 1. Action bar: "Cancel" + "Continue to Shipping".

## Page Layout

- Container: full-width, `px-[24px] py-[32px]`, `gap-[8px]` between sections
- Max width: `900px` centered (consistent with Step 1)
- Background: white page

## Sections (top to bottom)

### 1. Title

- Text: "Return Items"
- Font: Roboto Light (300), 32px, line-height 48px
- Color: `#1f2937`
- Alignment: center

### 2. Subtitle

- Text: "Order #HY-2024-78432 • Delivered on Feb 28, 2026"
- Font: Roboto Regular (400), 16px, line-height 24px
- Color: `#4b5563`
- Alignment: center

### 3. Step Progress

- Reuses existing `ReturnStepProgress` at `currentStep={2}`
- Step 1 "Select Items": completed state (green `#2ac864` bg, white checkmark)
- Step 2 "Reason": active state (`#4fd1a8` bg, white icon, teal shadow ring)
- Steps 3-4: pending state (`#e5e7eb` bg, gray icon, `opacity-40`)

### 4. Items Card

- Container: `bg-white`, `border border-[#e5e7eb]`, `rounded-[12px]`, `shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`
- Card header has a **hidden top padding** (`pt-[33px]`) before the visible header

#### Card Header

- Left: "Select Items to Return" — Roboto Bold (700), 18px, line-height 27px, `#111827`
- Right: "Select all that apply" — Roboto Regular (400), 14px, line-height 21px, `#6b7280`
- Padding: `px-[24px] py-[20px]` (with 21px bottom padding)
- Bottom border: `border-b border-[#e5e7eb]`

#### Card Body

- Padding: `px-[24px] pt-[24px] pb-[40px]`
- Gap: `16px` between items

#### Item Card — Expanded (with reason form)

- Border: `2px solid #4fd1a8` (selected)
- Background: `rgba(38,153,166,0.02)` (very subtle teal tint)
- Padding: `22px`
- Border radius: `12px`
- Gap: `20px` between children
- Min height: `382px`
- Layout: horizontal flex — checkbox | image | product info | reason form (separated by border)

**Checkbox (selected state)**:
- Size: `24x24px`, rounded `4px`
- Background: `#4fd1a8`, border: `2px solid #4fd1a8`
- White check icon, 16px
- Top padding: `8px` (pushes checkbox down to align with image)

**Product Image placeholder**:
- Size: `80x80px` (NOT 100px like Step 1 — different)
- Background: `#f3f4f6`, rounded `8px`
- Gray image icon `#9ca3af`, 24px

**Product Info** (left of divider):
- Width: ~90px (wraps naturally)
- Title: Roboto Medium (500), 16px, line-height 24px, `#1f2937`
- Meta: Roboto Regular (400), 14px, line-height 21px, `#6b7280`
- Price: Roboto SemiBold (600), 16px, line-height 24px, `#4fd1a8`, top padding `4px`

**Reason Form** (right side, separated by top border):
- Separated from product info by a `border-t border-[#e5e7eb]` with `pt-[17px]`
- Fills remaining width (~504px in design)
- Gap: `12px` between children

**"Reason for return:" label**:
- Roboto Regular (400), 13px, line-height 19.5px, `#6b7280`

**Reason Options Grid**:
- 2-column grid, gap `12px`
- 2 rows, 47px row height
- Each option: `rounded-[8px]`, `px-[17px] py-[13px]`, centered text
- **Unselected**: `border border-[#d1d5db]`, text Roboto Regular (400) 14px `#1f2937`
- **Selected**: `border border-[#4fd1a8]`, `bg-[rgba(38,153,166,0.05)]`, text Roboto Medium (500) 14px `#4fd1a8`
- Options: "Defective", "Wrong Item", "Not as Described", "Changed Mind"

**Additional Details Textarea**:
- `border border-[#d1d5db]`, `rounded-[8px]`, `bg-white`
- Padding: `px-[17px] pt-[13px] pb-[31px]`
- Placeholder: "Additional details (optional)" — Roboto Regular (400), 15px, `#757575`

**Upload Photos Button**:
- `border border-[#d1d5db]`, `rounded-[8px]`, `bg-white`
- Padding: `px-[25px] py-[13px]`
- Camera icon (15px, `#374151`) + "Upload Photos" text (Roboto Medium 500, 15px, `#374151`)
- Gap: `8px` between icon and text, plus `pl-[8px]` on text
- Below: helper text "Add photos to support your return request" — Roboto Regular (400), 12px, line-height 18px, `#6b7280`
- Top padding on container: `7px`

#### Item Card — Collapsed (no reason form)

- Border: `2px solid #e5e7eb` (not selected showing reason yet, but checkbox is checked)
- No background tint
- Padding: `22px`, rounded `12px`, gap `20px`
- Same checkbox (checked with `#4fd1a8`), image placeholder (80x80), product info
- Product info takes `flex-1` (full width since no reason form)
- No reason form section

### 5. Refund Summary

- Container: `bg-[#f9fafb]`, `rounded-[12px]`, fixed height `283px`
- Padding: `24px` all sides

**Title**: "Refund Summary" — Roboto SemiBold (600), 18px, line-height 27px, `#1f2937`

**Line items** (vertical stack starting at y=67px):
- Each row: flex, justify-between
- Label: Roboto Regular (400), 15px, line-height 22.5px, `#1f2937`
- Value: same font, same color
- Exception: "Free" for Return Shipping → color `#2ac864` (primary green)
- Rows: "Item Subtotal" ($299.00), "Tax Refund" ($23.92), "Return Shipping" (Free)
- Spacing: ~11.5px between rows

**Estimated Refund total**:
- Separated by `border-t-2 border-[#e5e7eb]`, `pt-[14px]`
- Label: Roboto Bold (700), 18px, line-height 27px, `#111827`
- Value: Roboto Bold (700), 18px, line-height 27px, `#4fd1a8`

**Disclaimer text**:
- "Refund will be processed to original payment method within 5-7 business days after we receive the item."
- Roboto Regular (400), 13px, line-height 19.5px, `#6b7280`

### 6. Action Bar

- NOT sticky in this design (it's inline, `pt-[16px]`)
- Flex row, gap `12px`, centered
- **Cancel button**: `w-[297.33px]`, `bg-white`, `border border-[#d1d5db]`, `rounded-[8px]`, `px-[25px] py-[13px]`
  - Text: "Cancel" — Roboto Medium (500), 15px, `#374151`, centered
- **Continue button**: `w-[542.67px]`, `bg-[#4fd1a8]`, `rounded-[8px]`, `px-[24px] py-[13px]`
  - Text: "Continue to Shipping" — Roboto Medium (500), 15px, white, centered

## Key Differences from Step 1

1. **Title**: "Return Items" (not "Start a Return")
2. **No `ReturnSelectionSummary` bar** — replaced by Refund Summary at bottom
3. **No `ReturnPolicyNotice`** — not present in Step 2
4. **Card header**: "Select Items to Return" + "Select all that apply" (different from Step 1's "Order Items" + "Tap to select items to return")
5. **Items show reason form** when expanded — product info is narrower, reason form takes right side
6. **Product image**: 80x80px (Step 1 was 100x100px)
7. **Collapsed items still show checked checkbox** — all items from Step 1 are pre-selected
8. **Action bar is NOT sticky** — renders inline at bottom
9. **Action bar labels**: "Cancel" (not "Back to Orders") and "Continue to Shipping" (not "Continue to Reason")
10. **Cancel navigates to**: return Step 1 (back) or orders page
11. **Refund Summary**: new section with item subtotal, tax, shipping, and total

## Responsive Translation

- Fixed widths (297px / 543px for buttons) → use `flex-1` with ratio (Cancel ~35%, Continue ~65%)
- Reason form right panel → on mobile, stack vertically below product info
- 2-column reason grid → stays 2-col even on tablet; could stack to 1-col on very narrow mobile

## State Requirements

- Receive selected item IDs from Step 1 (via URL search params)
- Each selected item needs: `reason: string | null`, `details: string`, `photos: File[]`
- "Continue to Shipping" disabled until all selected items have a reason
- Items from Step 1 are pre-checked; user can uncheck to remove from return
- Expanded item = the one currently being edited (click to expand/collapse)
