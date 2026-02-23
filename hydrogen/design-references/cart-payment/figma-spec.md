# Cart Payment Page — Figma Spec

**Captured**: 2026-02-23
**Figma File**: `vzeR7m9jbWjAfD9EVlReyq` (Cart and Checkout)
**Node**: `327:1178` (section), inner frame `327:989` (1920w light)
**Route**: `/checkout/payment`

---

## Layout

- Page bg: `#f9fafb` (`bg-surface` / `bg-[#f9fafb]`)
- Max content width: 1443px centered
- Two-column: left `720px` | gap `32px` | right `400px`
- Column alignment: `items-start`
- Left column gap between cards: `24px`
- Right sidebar: `sticky top-0`

---

## Progress Bar (CheckoutProgress)

- Full-width bar, `bg-white`, `border-b border-border`, `py-6`
- Steps centered horizontally with gap `8px` between step + divider
- Step 1 (Cart): **completed** — `bg-secondary (#2699a6)` circle, checkmark icon inside, label `text-secondary`
- Step 2 (Payment): **active** — `bg-primary (#2ac864)` circle, number "2", label `text-primary`
- Step 3 (Review): **inactive** — `bg-border (#e5e7eb)` circle, number "3" in `text-[#4b5563]`, label `text-[#9ca3af]`
- Step 4 (Review): **inactive** — same as step 3
- Dividers: `40px` wide, `2px` tall; green (`bg-primary`) if `idx <= currentStepIndex`, else `bg-border`
- Step circle size: `28×28px`, `rounded-full`

---

## Payment Method Card (left, card 1)

- `bg-white`, `border border-border`, `rounded-[12px]`, `shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`
- Width: `720px` (full left column)

### Card Header
- `border-b border-border`, `px-6 py-5`
- Title: "Payment Method", `text-lg font-bold text-[#111827]`

### Card Body (`px-6 py-6`)
- 4 payment method rows, gap `12px`
- Each row height: `62px`, `rounded-[8px]`, `p-[18px]`, `border-2`

#### Payment Method Row
- **Selected** state: `bg-[rgba(38,153,166,0.05)] border-2 border-secondary`
- **Unselected** state: `border-2 border-border`
- Layout: `flex items-center gap-3` (radio | icon | label | brand-icons)

**Radio button:**
- `size-[20px]`, `rounded-full`, `border border-border` (unselected)
- Selected: `border border-secondary` with inner `12px` dot `bg-secondary`

**Payment icons (40×26px, rounded-[4px]):**
- Credit/Debit Card: `bg-[#f3f4f6]`, credit-card icon in `text-[#4b5563]`
- Shop Pay: `bg-[#552bed]`, white icon
- Apple Pay: `bg-black`, white icon
- Google Pay: `bg-[#4285f4]`, white icon

**Label:** `text-base text-[#1f2937]` (Roboto Regular → Inter)

**Brand icons** (Credit/Debit only, right side): Visa + Mastercard, `text-[#4b5563] text-[24px]`

### Card Details Section (shown when Credit/Debit selected)
- Separated by `border-t border-border` at top, `h-[336px]` container
- Heading "Card Details": `text-base font-semibold text-[#1f2937]`, positioned `top-[24px]`

**Form inputs:**
- Label: `text-sm font-medium text-[#374151]`, gap `8px` between label+input
- Input: `bg-white border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px]` → `h-[44px]`
- Placeholder: `text-[15px] text-[#757575]`

**Fields:**
1. Card Number (full width), placeholder "1234 5678 9012 3456"
2. Row (2 equal cols, gap `16px`): Expiration Date (MM / YY) | CVC (123)
3. Name on Card (full width), placeholder "John Doe"

---

## Billing Address Card (left, card 2)

- Same card style as above (`bg-white border border-border rounded-[12px] shadow-sm`)
- Header: "Billing Address", `font-bold`
- Body: Checkbox `size-[18px] rounded-[2.5px]` + "Same as shipping address" label `text-[15px]`
- When checked: `bg-secondary` checkbox fill

---

## Order Summary Sidebar (right, 400px)

- `bg-white border border-border rounded-[12px] shadow-sm sticky top-0`
- Height: `~491px`

### Summary Header
- "Order Summary" `text-lg font-bold text-[#1f2937]`, `pb-[17px] border-b border-border`, `px-6 pt-6`

### Summary Rows (`px-6 pt-[22px]` gap between rows `~34.5px`)
- Subtotal: `$426.00`
- Shipping: `$5.99`
- Tax: `$34.08`
- Each row: `flex justify-between`, `text-[15px] text-[#4b5563]`

### Total Row
- Separated by `border-t-2 border-border`, `pt-[22px]`
- "Total" + "$466.07", both `text-lg font-bold text-[#111827]`

### CTA Buttons
- **Review Order →**: `bg-secondary text-white font-semibold text-base rounded-[8px] p-[16px]` full width
- **← Return to Shipping**: `text-secondary font-medium text-[15px]` centered, `p-[8px]`

### Trust Badges (`border-t border-border pt-[25px]`, gap `12px`)
- 🔒 "256-bit SSL Encryption" — lock icon `text-primary text-[13px]` + label `text-[13px] text-[#4b5563]`
- 🛡️ "PCI Compliant" — shield icon `text-primary text-[13px]` + label

---

## Token Mapping

| Figma Value | CSS Token | Tailwind |
|-------------|-----------|---------|
| `#2ac864` (primary green) | `--color-primary` | `*-primary` |
| `#2699a6` (secondary teal) | `--color-secondary` | `*-secondary` |
| `#111827` | — | `text-[#111827]` |
| `#1f2937` | — | `text-[#1f2937]` |
| `#4b5563` | — | `text-[#4b5563]` |
| `#374151` | — | `text-[#374151]` |
| `#e5e7eb` | `--color-border` | `border-border` |
| `#f9fafb` | `--color-surface` | `bg-surface` |
| `rgba(38,153,166,0.05)` | — | `bg-secondary/5` |

## Responsive Translation

- Figma frame: 1443px wide
- Left column `720px` → `flex-1 min-w-0`
- Right sidebar `400px` → `w-[400px] shrink-0`
- Container: `mx-auto max-w-[1443px] px-6`

## Implementation Notes

- Payment form does not process payments directly — submits to Shopify checkout URL
- Card Details section conditionally shown via React state (client-side)
- Font: Figma uses Roboto → project uses Inter (acceptable substitution)
- Payment brand icons (Visa, Mastercard, etc.) implemented as styled letter badges since Font Awesome Brands not available
