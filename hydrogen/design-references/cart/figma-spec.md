# Cart Review Page — Figma Spec

**Captured**: 2026-02-22
**Figma File**: `vzeR7m9jbWjAfD9EVlReyq` (Cart and Checkout)
**Node**: `327:133` — "1920w light"

---

## Layout

- Full 1920px frame, light gray page bg (`#f9fafb` = Tailwind `bg-[#f9fafb]`)
- **Progress Bar**: white strip with `border-b border-[#e5e7eb]`, `py-6`, horizontally centered content
- **Content container**: `left-[384px] right-[384px]` = 1920 - 768 = **1152px wide**, `top: 262px` (~`py-8` from progress bar)
- **Two-column flex**: `gap-[32px]`
  - Left (main): `flex-1 max-w-[720px]`, `gap-[24px]` between cards
  - Right (sidebar): `w-[400px] shrink-0 sticky top-0`

**Responsive Translation**:
- Container: `max-w-[1152px] mx-auto px-6 py-8`
- Sidebar: `w-[400px] shrink-0` on lg+; stack below main on mobile
- Main: `flex-1 min-w-0`

---

## Checkout Progress Bar

- Renders below main site header
- White bg, `border-b border-border`, `py-6`
- 4 steps: Cart | Payment | Shipping | Review
- Step badge: `size-[28px] rounded-full` (= `rounded-[14px]`)
  - Active: `bg-primary (#2ac864)`, white number
  - Inactive: `bg-[#e5e7eb]`, `text-[#4b5563]` number
- Step label: `text-[14px] font-medium`
  - Active: `text-secondary (#2699a6)`
  - Inactive: `text-[#9ca3af]`
- Divider: `h-[2px] w-[40px] bg-[#e5e7eb]`, inside `w-[56px]` margin container (`px-[8px]`)

---

## Guest Banner

- `border border-[#2bd9a8] bg-[rgba(43,217,168,0.1)]` → `border-accent bg-accent/10`
- `rounded-[8px] p-[17px]`
- `gap-[12px] flex items-center`
- Icon: Font Awesome user-circle, `text-[#2bd9a8] text-[20px]` → use `Info` from lucide, 20px
- Text: Roboto Regular 14px, `text-[#374151]`
  - Inline "Sign in" link: Roboto Medium, `text-[#2699a6]` = `text-secondary`

---

## Shopping Cart Card

- `bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`
  - Tailwind: `bg-white border border-border rounded-xl shadow-sm`
- `overflow-clip`

### Card Header
- `border-b border-[#e5e7eb]`
- Padding: `pb-[21px] pt-[20px] px-[24px]`
- Title: "Shopping Cart (N items)" — Roboto Bold 18px `text-[#111827]`
- Right: "Continue Shopping" link — Roboto Medium 15px `text-[#2699a6]`, padding `p-[8px]`, `rounded-[8px]`

### Cart Items List
- Padding: `p-[24px]`, `gap-[16px]` between items
- Each item: `border-b border-[#f3f4f6]`, `pb-[17px]`, last item no border

### Cart Line Row

```
[image 80×80] [product-details: flex-1] [price]
```

- Image: `size-[80px] rounded-[8px] bg-[#f3f4f6]`, object-cover
- Product name: Roboto Medium 15px, `text-[#111827]`, leading-[22.5px]
- Variant attrs: Roboto Regular 13px, `text-[#6b7280]` = `text-text-muted`, leading-[19.5px]
- Qty text: same as variant attrs (13px gray)
- Price: Roboto SemiBold 16px, `text-[#111827]`, leading-[24px], right-aligned

**Note**: Figma shows static "Qty: 1" text. Implementation adds compact +/- qty controls and remove (X) button for interactivity. These are **intentional deviations** from static Figma mock.

---

## Promo Code Card

- Same card style as Shopping Cart Card
- Header: "Promo Code" — Roboto Bold 18px `text-[#111827]`
- Content: `py-[~40px from gap]`
- Input group: `gap-[8px] w-[670px]`
  - Input: `border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px]` — placeholder Roboto Regular 15px `text-[#757575]`
  - Apply button: `border border-[#d1d5db] rounded-[8px] px-[21px] py-[13px]` — Roboto Medium 15px `text-[#374151]`

---

## Order Summary Sidebar

- `bg-white border border-[#e5e7eb] rounded-[12px] shadow-sm w-[400px] sticky`
- Height in design: `h-[414px]` (use `shrink-0`, not fixed height)

### Title Section
- `border-b border-[#e5e7eb]`, `left/right: 24px, top: 24px, pb-[17px]`
- "Order Summary" — Roboto Bold 18px `text-[#1f2937]`

### Summary Rows (absolutely positioned in Figma → convert to normal flow)
- Row gap: ~34.5px between rows (top: 88, 122.5, 157 → 34.5px gap)
- Label: Roboto Regular 15px `text-[#4b5563]`
- Value: Roboto Regular 15px — subtotal in `text-[#4b5563]`, shipping/tax in `text-[#9ca3af]`

### Total Section
- `border-t-2 border-[#e5e7eb]`, `pt-[22px]`
- "Estimated Total" — Roboto Bold 18px `text-[#111827]`
- Total amount — Roboto Bold 18px `text-[#111827]`

### CTA Button
- `bg-[#2699a6]` = `bg-secondary`, `rounded-[8px]`, `p-[16px]` full width
- Text: Roboto SemiBold 16px white
- Icon: arrow-right (Font Awesome), 16px white

### Trust Badges
- `border-t border-[#e5e7eb]`, `pt-[25px]`, `gap-[24px]`
- Shield icon + "Secure Checkout": `text-primary text-[13px]`
- Lock icon + "SSL Encrypted": `text-primary text-[13px]`
- Label text: Roboto Regular 13px `text-[#4b5563]`

---

## Token Map

| Figma Value | Token | Tailwind |
|------------|-------|----------|
| `#2ac864` | `--color-primary` | `*-primary` |
| `#2699a6` | `--color-secondary` | `*-secondary` |
| `#2bd9a8` | `--color-accent` | `*-accent` |
| `rgba(43,217,168,0.1)` | accent/10 | `bg-accent/10` |
| `#e5e7eb` | `--color-border` | `border-border` |
| `#f3f4f6` | surface-ish | `bg-[#f3f4f6]` |
| `#f9fafb` | page bg | `bg-[#f9fafb]` |
| `#111827` | near-black | `text-[#111827]` |
| `#1f2937` | near-black | `text-[#1f2937]` |
| `#374151` | dark gray | `text-[#374151]` |
| `#4b5563` | medium gray | `text-[#4b5563]` |
| `#6b7280` | `--color-text-muted` (close) | `text-text-muted` |
| `#9ca3af` | `--color-text-light` (close) | `text-text-light` |
| `#d1d5db` | input border | `border-[#d1d5db]` |
| `#757575` | placeholder | `placeholder:text-[#757575]` |

## Font Notes

- Design uses **Roboto** (Bold, Medium, Regular, SemiBold variants)
- Project uses **Inter** as `--font-body` / `--font-heading`
- **Intentional deviation**: Inter used in place of Roboto (project standard)
