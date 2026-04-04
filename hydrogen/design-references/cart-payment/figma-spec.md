# Cart Payment Page — Figma Spec

**Captured**: 2026-04-02 (refreshed from node 327:1020)
**Figma File**: `vzeR7m9jbWjAfD9EVlReyq` (Cart and Checkout)
**Node**: `327:1020` (div.checkout-layout — main content area)
**Route**: `/checkout/payment`

> Prior capture (2026-02-23) was from outer frame `327:989`. This spec supersedes it
> with the inner layout node and corrects the CTA color (was wrong in original spec).

---

## Layout

- **Container**: `flex gap-[32px] items-start justify-center`
- Left column: `w-[720px]`, `flex-col gap-[24px] pb-[24px]`
- Right sidebar: `w-[400px]`, `sticky top-0`
- Page bg: `#f9fafb`
- Max content width: `1443px` centered, `px-6`

---

## Payment Method Card (left, card 1 — node 327:1022)

- `bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-clip`

### Card Header (node 327:1023)
- `border-b border-[#e5e7eb] px-[24px] pt-[20px] pb-[21px]`
- Title "Payment Method": Roboto Bold 18px `#111827`

### Card Body (node 327:1026)
- `flex flex-col gap-[12px] p-[24px]`
- 4 payment method rows

#### Payment Method Row (node 327:1027 = selected, 327:1040/1047/1054 = unselected)

- **Container**: `flex gap-[12px] items-center p-[18px] rounded-[8px] border-2`
- **Selected**: `bg-[rgba(38,153,166,0.05)] border-[#2699a6]`
- **Unselected**: `bg-white border-[#e5e7eb]`

**Radio button (node 327:1028)**
- `size-[20px] rounded-full border bg-white`
- Unselected: `border-[#767676]`
- Selected: `border-[#2699a6]` with inner `12px` dot `bg-[#2699a6]` at `left-[3px]`

**Payment icon container**
- `h-[26px] w-[40px] rounded-[4px]`
- Credit/Debit: `bg-[#f3f4f6]`, FA credit card glyph `text-[#4b5563] text-[12px]`
- Shop Pay: `bg-[#552bed]`, FA icon glyph `text-white text-[12px]`
- Apple Pay: `bg-black`, FA apple glyph `text-white text-[12px]`
- Google Pay: `bg-[#4285f4]`, FA google glyph `text-white text-[12px]`

**Label**: Roboto Regular 16px `#1f2937`

**Trailing brand icons (Credit/Debit only)**
- `h-[24px] flex gap-[4px]`
- Visa + Mastercard: FA brand glyphs `text-[#4b5563] text-[24px]`
- *Implementation*: styled text badges "VISA" and "MC" (FA Brands not available)

### Card Details Section (node 327:1061 — shown only for Credit/Debit)

- Separated by `border-t border-[#e5e7eb]`
- In Figma: `h-[336px]` fixed with absolute child positioning
- *Implementation*: normal document flow (equivalent visual result)

**Heading** "Card Details": Roboto SemiBold 16px `#1f2937`, positioned `top-[24px]` from border

**Form inputs (all):**
- `bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] overflow-clip`
- Placeholder: Roboto Regular 15px `#757575`

**Labels**: Roboto Medium 14px `#374151`, `gap-[8px]` below label to input

**Fields:**
1. Card Number — full width, placeholder "1234 5678 9012 3456"
2. Row (2 equal cols, `gap-[16px]`): Expiration Date (MM / YY) | CVC (123)
3. Name on Card — full width, placeholder "John Doe"

---

## Billing Address Card (left, card 2 — node 327:1091)

- `bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-clip`
- Card outer: `gap-[24px] pb-[41px] pt-px px-px`

### Card Header (node 327:1092)
- Same style as Payment Method card header
- Title: "Billing Address"

### Card Body
- Checkbox row: effective `px-[24px]` (label is `w-[670px]` inside 720px card with 1px outer padding)
- **Bottom padding**: `pb-[41px]` ← significantly more than top (breathing room below checkbox)

**Checkbox (node 327:1096)**
- `size-[18px] rounded-[2.5px]`
- Checked: `bg-[#2699a6]` (solid teal fill — no checkmark visible in Figma)
- *Implementation*: white SVG checkmark added for accessibility ✓

**Label**: Roboto Regular 15px `#1f2937`

---

## Order Summary Sidebar (right — node 327:1102)

- `bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`
- In Figma: `h-[491.5px]` fixed with absolute children
- *Implementation*: flex layout (equivalent visual result, more maintainable)
- `sticky top-0`

### Summary Header (node 327:1103)
- "Order Summary": Roboto Bold 18px `#1f2937`
- `border-b border-[#e5e7eb] pb-[17px]`, `left-[24px] right-[24px] top-[24px]`

### Summary Rows (nodes 327:1105/1110/1115)
- Each row: `flex justify-between h-[23px]`, `left-[24px] right-[24px]`
- Positions: `top-[88px]`, `top-[122.5px]`, `top-[157px]`
- Row gap is ~34.5px
- All labels + values: Roboto Regular 15px `#4b5563`

### Total Row (node 327:1120)
- `border-t-2 border-[#e5e7eb] pt-[22px]`, `top-[199.5px]`
- "Total": Roboto Bold 18px `#111827`
- Amount: same typography

### CTA Button "Review Order →" (node 327:1125)
- **⚠️ CORRECTED from prior spec**: `bg-[#2ac864]` = `bg-primary` **GREEN** (NOT secondary teal)
- `flex gap-[8px] items-center justify-center p-[16px] rounded-[8px]`
- Text: Roboto SemiBold 16px white
- *Implementation label*: "Continue to Shipping" (intentional flow deviation — see below)

### Back Link "← Return to Shipping" (node 327:1129)
- `flex gap-[8px] items-center justify-center p-[8px] rounded-[8px]`
- Icon + text: `text-[#2699a6]` = secondary teal, 15px medium
- *Implementation label*: "← Return to Cart" (intentional flow deviation)

### Trust Badges (node 327:1133)
- `border-t border-[#e5e7eb] pt-[25px]`, `flex-col gap-[12px]`
- Badge 1: FA lock glyph `text-[#2ac864]` 13px + "256-bit SSL Encryption" `text-[#4b5563]` 13px
- Badge 2: FA shield glyph `text-[#2ac864]` 13px + "PCI Compliant" same text style
- *Implementation*: lucide `Lock` + `ShieldCheck` at `size={13}` `text-primary` ✓

---

## Token Mapping

| Figma Value | Token | Tailwind Class |
|-------------|-------|----------------|
| `#2ac864` (primary green) | `--color-primary` | `bg-primary`, `text-primary` |
| `#2699a6` (secondary teal) | `--color-secondary` | `bg-secondary`, `text-secondary`, `border-secondary` |
| `#111827` | — | `text-[#111827]` |
| `#1f2937` | — | `text-[#1f2937]` |
| `#4b5563` | — | `text-[#4b5563]` |
| `#374151` | — | `text-[#374151]` |
| `#757575` | — | `text-[#757575]` (placeholder) |
| `#e5e7eb` | `--color-border` | `border-border` |
| `#f9fafb` | `--color-surface` | `bg-surface` / `bg-[#f9fafb]` |
| `rgba(38,153,166,0.05)` | — | `bg-secondary/5` |
| `rounded-[12px]` | — | `rounded-[12px]` ⚠️ our `rounded-lg` = 16px, `rounded-md` = 12px |
| `rounded-[8px]` | `--radius-sm` (0.5rem=8px) | `rounded-[8px]` |
| `rounded-[4px]` | — | `rounded-[4px]` |

> **CRITICAL**: This project's `@theme` remaps the Tailwind radius scale:
> - `rounded-sm` = 8px ✓
> - `rounded` / `rounded-md` = 12px ✓
> - `rounded-lg` = **16px** ← NOT 12px (common source of bugs)
> - `rounded-xl` = **20px** ← shadcn Card default — always override with `rounded-[12px]`

---

## Responsive Translation

- Figma frame: 1443px wide (fixed layout)
- Left col `720px` → `flex-1 min-w-0`
- Right sidebar `400px` → `w-[400px] shrink-0`
- Container: `mx-auto max-w-[1443px] px-6`
- Mobile responsiveness: deferred (see ACTIVE_CONTEXT.md)

---

## Implementation Notes (Intentional Deviations)

| Item | Figma | Implementation | Reason |
|------|-------|----------------|--------|
| CTA label | "Review Order →" | "Continue to Shipping →" | Our flow: Cart → Payment → **Shipping** → Review |
| Back link | "← Return to Shipping" | "← Return to Cart" | Previous step in our flow is Cart |
| Shipping value | `$5.99` | "Calculated at next step" | Shipping not yet selected at Payment step |
| Visa/MC icons | FA brand glyphs | Text "VISA"/"MC" badges | Font Awesome Brands not in project |
| Card Details positioning | Fixed `h-[336px]` + absolute | Normal document flow | More maintainable and accessible |
| Checkbox checkmark | Not shown (solid fill) | White SVG checkmark | Accessibility improvement |
