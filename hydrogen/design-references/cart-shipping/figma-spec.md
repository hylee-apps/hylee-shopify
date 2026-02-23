# Shipping Page — Figma Specification

> Captured: 2026-02-23
> Figma File: `vzeR7m9jbWjAfD9EVlReyq` (Cart and Checkout)
> Node ID: `327:887` (section), inner frame `327:671` (1442w light)

## Layout

- **Frame**: 1442×1619px, bg `#f9fafb`
- **Two-column**: Left 720px + gap 32px + Right 400px sticky sidebar
- **Progress bar**: Cart ✓ | Payment ✓ | **Shipping** (active) | Review

## Left Column — 3 Cards

### 1. Shipping Address Card (720×619px)
- **Header**: "Shipping Address" + "Use Saved Address Profile ▼" dropdown
- **Form Fields** (all h-[44px], border `#d1d5db`, rounded-[8px], px-[17px]):
  - First Name / Last Name (side-by-side, 327px each, gap 16px)
  - Address (full-width 670px)
  - Apt, suite, unit (optional) (full-width)
  - City / ZIP Code (side-by-side)
  - State / Phone (side-by-side)
  - Email (full-width)
- **Labels**: text-sm font-medium `#374151`
- **Placeholders**: text-[15px] `#757575`

### 2. Shipping Method Card (720×403px)
- **Header**: "Shipping Method"
- **3 selectable options** (670×83px each, gap 12px):
  - Standard Shipping — 5-7 business days — $5.99 (selected: border-2 border-secondary bg-secondary/5)
  - Expedited Shipping — 2-3 business days — $12.99
  - Next Day Delivery — Next business day — $24.99
- **Option layout**: shipping info (left) + price (right), p-[18px]
- **Method name**: text-base font-semibold `#111827`
- **Description**: text-sm `#6b7280`
- **Price**: text-base font-semibold `#111827`

### 3. Delivery Preferences Card (720×234px)
- **Header**: "Delivery Preferences"
- **Textarea**: "Delivery Instructions (Optional)"
  - Placeholder: "Leave at front door, call upon arrival, etc."
  - 670×80px, same input styling

## Right Column — Order Summary (400px, sticky)
- Product item thumbnail (60×60)
- Subtotal, Shipping ($5.99), Tax ($34.08)
- Total: $466.07
- CTA: "Continue to Review →" (bg-secondary text-white)
- Secondary: "← Return to Payment"
- No trust badges on this step

## Color Token Mapping
| Figma | Tailwind |
|-------|----------|
| `#2ac864` | `*-primary` |
| `#2699a6` | `*-secondary` |
| `#e5e7eb` | `border-border` |
| `#f9fafb` | `bg-[#f9fafb]` |
| `#111827` | `text-[#111827]` |
| `#d1d5db` | `border-[#d1d5db]` |
| `#757575` | `placeholder:text-[#757575]` |
