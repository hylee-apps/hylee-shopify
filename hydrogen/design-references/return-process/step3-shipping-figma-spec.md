# Return Process — Step 3: Return Shipping — Figma Spec

> **Figma File**: `NEk59QDkRMC3a6LD0WZVQJ` (Return Process)
> **Node**: `1:656`
> **Frame**: 800 x 1793px
> **Captured**: 2026-03-28

## Overview

Step 3 of the return wizard. Title changes to "Return Shipping" (was "Return Items" in Step 2). Users choose a shipping method (UPS Drop-off, UPS Pickup, or Instant Return), view the return address and packing instructions, see a summary of items/cost, and a return tracking info notice. The progress tracker shows Step 3 (Ship) as active with Steps 1-2 completed.

## Page Layout

- Container: `px-[24px]`, `pt-[32px]`, content width = frame width minus 48px padding
- Max width: `900px` centered (consistent with Steps 1-2)
- Gap between top-level sections: `8px` (title/subtitle/steps) then card + summary + notice are position-based
- Background: white page

---

## Sections (top to bottom)

### 1. Title

- Text: "Return Shipping"
- Font: Roboto Light (300), 32px, line-height 48px
- Color: `#1f2937`
- Alignment: center

### 2. Subtitle

- Text: "Choose how you'd like to send your items back"
- Font: Roboto Regular (400), 16px, line-height 24px
- Color: `#4b5563`
- Alignment: center

### 3. Step Progress

- Reuses existing `ReturnStepProgress` at `currentStep={3}`
- Steps 1-2 "Select Items" and "Reason": completed state (green `#2ac864` bg, white checkmark)
- Step 3 "Ship": active state (`#4fd1a8` bg, white Truck icon, teal shadow ring `0 0 0 4px rgba(38,153,166,0.2)`)
- Step 4 "Make It Right": pending state (`#e5e7eb` bg, gray icon, `opacity-40`)

### 4. Shipping Method Card — `div.card`

- Container: `bg-white`, `border border-[#e5e7eb]`, `rounded-[12px]`, `shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`
- `overflow-clip`
- Hidden top padding: `pt-[33px]` before header (same as Step 2)
- Bottom padding on body: `pb-[17px]` on outer card

#### Card Header — `div.card-header`

- Left: "Shipping Method" — Roboto Bold (700), 18px, line-height 27px, `#111827`
- No right text (unlike Steps 1-2)
- Padding: `px-[24px] pt-[20px] pb-[21px]`
- Bottom border: `border-b border-[#e5e7eb]`

#### Card Body — `div.card-body`

- Padding: `px-[24px] pt-[24px] pb-[36px]`
- Gap: `24px` between major sections (shipping options → return address → packing instructions)

---

### 4a. Shipping Options — `div.shipping-options`

- Gap: `16px` between option cards
- 3 options total

#### Shipping Option — Selected (UPS Drop-off)

- Border: `2px solid #4fd1a8`
- Background: `rgba(38,153,166,0.05)` (subtle teal tint)
- Shadow: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)`
- Padding: `22px`, rounded `12px`, gap `16px`
- Layout: flex row — radio | content | QR code preview

**Radio Button (selected)**:
- Size: `24x24px`
- Background: `#4fd1a8`
- Border: `2px solid #4fd1a8`
- Border radius: `12px` (rounded-full for 24px)
- Inner dot: `10x10px`, white, `rounded-[5px]`

**Content Area** (flex-1):
- **Header**: flex justify-between
  - Left: icon (16px, `#4fd1a8`) + title — SemiBold 16px, `#111827`, gap `8px`
  - Right: price — Bold 16px, `#2ac864` ("Free")
- **Description**: Regular 14px, `#4b5563`, line-height 21px, gap `8px` below header
- **Features**: flex-wrap, horizontal gap `16px`, pt-`4px`, each feature:
  - Check-circle icon: 13px, `#2ac864`
  - Text: Regular 13px, `#4b5563`, line-height 19.5px, gap `8px` between icon and text
  - Features: "Prepaid label", "10,000+ locations", "No packaging needed"

**QR Code Preview** (right side, only for selected Drop-off option):
- Container: `120x120px`, `bg-white`, `border-2 border-[#e5e7eb]`, `rounded-[8px]`
- Left margin: `16px` (from content area)
- QR placeholder icon: 80px, `#d1d5db`

#### Shipping Option — Unselected (UPS Pickup, Instant Return)

- Border: `2px solid #e5e7eb`
- Background: `white`
- No shadow
- Padding: `22px`, rounded `12px`, gap `16px`

**Radio Button (unselected)**:
- Size: `24x24px`
- Background: transparent
- Border: `2px solid #d1d5db`
- Border radius: `12px`

**UPS Pickup**:
- Icon: truck, 16px, `#4fd1a8`
- Title: "UPS Pickup" — SemiBold 16px, `#111827`
- Price: "Free" — Bold 16px, `#2ac864`
- Description: "Schedule a free pickup from your home or office. UPS will come to your door and collect your package."
- Features: "Convenient pickup", "Next business day", "No trip needed"

**Instant Return**:
- Icon: bolt, 16px, `#4fd1a8`
- Title: "Instant Return" — SemiBold 16px, `#111827`
- Price: "$4.99" — Bold 16px, `#4fd1a8` (return-accent, NOT primary green)
- Description: "Get instant store credit upon drop-off scan, before we receive your return. Perfect for quick reorders."
- Features: "Instant credit", "Same-day processing", "+$4.99 fee"

---

### 4b. Return Address Section — `div.address-section`

- Separated by: `border-t border-[#e5e7eb]`, `pt-[25px]`
- Gap: `12px` between title and address card

**Section Title**:
- Icon: map-marker (FA ``) 16px, `#111827` → Lucide `MapPin`
- Text: "Return Address" — SemiBold 16px, `#111827`
- Layout: inline-flex, icon + text

**Address Card** — `div.return-address`:
- Background: `#f9fafb`
- Border radius: `8px`
- Padding: `16px` horizontal, `~15px` top, `16px` bottom
- Gap: `12px` between address block and return ID

**Address Block**:
- Name: "Hylee Returns Center" — Bold 14px, `#374151`, line-height 25.2px
- Lines: Regular 14px, `#374151`, line-height 25.2px
  - "1234 Warehouse Boulevard"
  - "Building C, Suite 100"
  - "Seattle, WA 98101"
  - "United States"

**Return ID**:
- Icon: barcode/tag (FA ``) 14px, `#4fd1a8` → Lucide `Tag`
- Text: "Return ID: " — Regular 14px, `#374151` + "RET-2024-78432" — Bold 14px, `#374151`
- Layout: flex items-center, gap `8px`

---

### 4c. Packing Instructions Section — `div.instructions-section`

- Separated by: `border-t border-[#e5e7eb]`, `pt-[25px]`
- Gap: `12px` between title and list

**Section Title**:
- Icon: clipboard-list (FA ``) 16px, `#111827` → Lucide `ClipboardList`
- Text: "Packing Instructions" — SemiBold 16px, `#111827`

**Ordered List** — `ol.instructions-list`:
- Gap: `12px` between items
- Each item (`li`):
  - `pl-[32px]`, position relative
  - Number circle: `28x28px`, `bg-[#4fd1a8]`, `rounded-full` (14px), absolute `left-0 top-0`
  - White number inside circle (centered)
  - Text: Regular 14px, `#374151`, line-height 22.4px

**Instructions**:
1. "Pack items securely in their original packaging when possible"
2. "Include all accessories, tags, and original materials"
3. "Seal the box tightly with strong packing tape"
4. "Attach the return label to the outside of the package (or show QR code)"
5. "Remove or cover any old shipping labels"

---

### 5. Summary Box — `div.summary-box`

- Background: `#f9fafb`
- Border radius: `12px`
- Padding: `20px` horizontal, `20px` top, `32px` bottom
- Gap: `12px` between rows

**Row 1**: "Items being returned" (Regular 14px, `#4b5563`) | count (Medium 14px, `#1f2937`)
**Row 2**: "Return shipping" (Regular 14px, `#4b5563`) | "Free" (Medium 14px, `#2ac864`)
**Divider**: `border-t-2 border-[#e5e7eb]`, `pt-[14px]`
**Total Row**: "Total Refund Amount" (Bold 16px, `#111827`) | "$348.99" (Bold 16px, `#4fd1a8`)

---

### 6. Return Tracking Notice

- Background: `rgba(38,153,166,0.05)`
- Border: `1px solid rgba(38,153,166,0.2)`
- Border radius: `12px`
- Padding: `21px`
- Gap: `8px` between header and body

**Header**:
- Text: "Return Tracking" — SemiBold 14px, `#4fd1a8`
- Left padding: `8px`

**Body**:
- Text: "You'll receive email updates at each step: when your return is shipped, received, and when your resolution is processed."
- Font: Regular 14px, `#4b5563`, line-height 22.4px

---

### 7. Action Buttons (NOT in Figma frame — follow Step 2 pattern)

- Position: inline (not sticky), like Step 2
- Flex row, gap `12px`, `pt-[16px]`
- **Back/Cancel button**: ~35% flex, white bg, border `#d1d5db`, rounded `8px`, px `25px` py `13px`
  - Text: "Back" or "Cancel" — Medium 15px, `#374151`
- **Continue button**: ~65% flex, bg `#4fd1a8`, rounded `8px`, px `24px` py `13px`
  - Text: "Continue to Make It Right" — Medium 15px, white
  - Disabled state: `opacity-50` (always enabled since default shipping method is pre-selected)

---

## Icon Mapping (FontAwesome → Lucide)

| Figma (FA) | Unicode | Lucide Equivalent | Usage |
|-----------|---------|-------------------|-------|
| box |  | `Package` | UPS Drop-off shipping option icon |
| truck |  | `Truck` | UPS Pickup shipping option icon |
| bolt |  | `Zap` | Instant Return shipping option icon |
| check-circle |  | `CheckCircle2` | Feature check marks (green) |
| map-marker-alt |  | `MapPin` | Return Address section title |
| clipboard-list |  | `ClipboardList` | Packing Instructions section title |
| qrcode |  | `QrCode` | QR code placeholder |
| barcode |  | `Tag` | Return ID prefix |

---

## Key Differences from Step 2

1. **Title**: "Return Shipping" (not "Return Items")
2. **Subtitle**: "Choose how you'd like to send your items back" (new copy)
3. **No item cards** — items are not displayed individually
4. **Shipping Method card** replaces the items card — 3 selectable shipping options
5. **Radio buttons** instead of checkboxes — only one option can be selected
6. **QR code preview** — only visible on the selected Drop-off option
7. **Return Address section** — new section with warehouse address
8. **Packing Instructions** — new numbered list with mint green circles
9. **Summary box** — simplified from Step 2's Refund Summary (no tax breakdown, just item count + shipping + total)
10. **Return Tracking notice** — replaces Step 1's Return Policy notice (teal instead of amber)
11. **Card header** — "Shipping Method" only, no right-side text/link

## Responsive Translation

- Fixed QR code preview (120px) → keep fixed, hide on very small screens or move below
- Shipping option cards stack well naturally (they're full-width)
- Address and instructions sections are full-width — translate well
- Action buttons: follow Step 2 pattern (~35%/~65% flex split)
