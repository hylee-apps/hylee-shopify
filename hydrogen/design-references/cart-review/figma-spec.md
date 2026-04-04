# Cart Page — Figma Specification

> Captured: 2026-04-02 (polish pass)
> Figma File: `vzeR7m9jbWjAfD9EVlReyq` (Cart and Checkout)
> Node ID: `327:162` (div.checkout-layout — full cart page content)
> Prior spec: node `327:1413` (checkout Step 4 Review) — preserved below

---

## Node 327:162 — Shopping Cart Page (Step 1)

### Overall Layout
- `flex gap-[32px] items-start justify-center`
- Left column: `w-[720px]`, flex-col, gap-[24px], pb-[24px]
- Right column (sidebar): `w-[400px]`, sticky

---

### Guest Banner (`div.guest-banner`)
- **Container**: `flex gap-[12px] items-center p-[17px] rounded-[8px]`
- **Background**: `rgba(43,217,168,0.1)` → `bg-brand-accent/10`
- **Border**: `1px solid #2bd9a8` → `border border-brand-accent`
- **Icon**: Font Awesome user-circle (`\uF2BD`), 20px, color `#2bd9a8` → use lucide `UserCircle`, `size-5`, `text-brand-accent`
- **Text**: Roboto Regular 14px `#374151`
  - "Sign in" span: Roboto Medium `#2699a6` → `text-secondary font-medium`

> ⚠️ Current implementation uses `Info` icon + `accent` token (resolves to `#e8fdf4` — wrong color). Must change to `UserCircle` + `brand-accent`.

---

### Shopping Cart Card (`div.card` — node 327:169)
- **Container**: `bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-clip`
  - In our system: `rounded-lg` = 12px ✓, `shadow-sm` ✓, `border-border` ✓

#### Card Header
- **Layout**: `flex items-center justify-between px-[24px] pt-[20px] pb-[21px]`
  - Current `py-5` = 20px top + 20px bottom (bottom should be 21px — minor)
- **Title**: "Shopping Cart (N items)" — Roboto Bold 18px `#111827` → `text-lg font-bold text-[#111827]` ✓
- **"Continue Shopping" button**: Roboto Medium 15px `#2699a6` → `text-[15px] font-medium text-secondary`
  - Container: `p-[8px] rounded-[8px]` → `p-2 rounded-sm`

#### Card Body
- **Container**: `flex flex-col gap-[16px] p-[24px]` → `flex flex-col gap-4 px-6 py-6`
  - ⚠️ Current has `px-6` only — missing `pt-6` (24px top padding)

#### Product Item Row
- **Container**: `flex gap-[16px] items-start pb-[17px] border-b border-[#f3f4f6]` (last item: no border-b, no pb)
- **Image**: `size-[80px] rounded-[8px] bg-[#f3f4f6]` → `size-20 rounded-sm bg-[#f3f4f6]`
  - Current `rounded-lg` = 12px, Figma = 8px → change to `rounded-sm`
- **Product name**: Roboto Medium 15px `#111827` → `text-[15px] font-medium text-[#111827]` ✓
- **Variant attrs**: Roboto Regular 13px `#6b7280` → `text-[13px] text-[#6b7280]` ✓
- **Qty**: Roboto Regular 13px `#6b7280` → same as variant ✓
- **Price**: Roboto SemiBold 16px `#111827` → `text-[16px] font-semibold text-[#111827]`
  - Current `text-base font-semibold` = 16px ✓

> ℹ️ Figma shows static "Qty: 1" text. Implementation keeps the quantity stepper (intentional deviation — better UX). Gap-based spacing replaces per-item py-4 approach.

---

### Promo Code Card (`div.card` — node 327:218)
- **Container**: `bg-white border border-[#e5e7eb] rounded-[12px] shadow pb-[25px]`
  - `gap-[40px]` between header and content area (currently using inner padding)
- **Card Header**: same as Shopping Cart card header style

#### Input Row (`div.promo-input-group`)
- **Width**: `w-[670px]` → `w-full` (fills card minus padding)
- **Container**: `flex gap-[8px] items-start` → `flex gap-2` ✓
- **Input** (`input.form-input`):
  - `flex-1 border border-[#d1d5db] rounded-[8px] px-[17px] py-[13px] overflow-clip`
  - Placeholder: Roboto Regular 15px `#757575` → `text-[15px] placeholder:text-[#757575]`
  - Current: uses shadcn `Input` with different sizing — needs `px-[17px] py-[13px] rounded-sm text-[15px]`
- **Apply Button** (`Component 1`):
  - `bg-white border border-[#d1d5db] rounded-[8px] px-[21px] py-[13px]`
  - Text: Roboto Medium 15px `#374151` → `text-[15px] font-medium text-[#374151]`
  - Current: `px-5` (20px) → should be `px-[21px]`, `rounded-sm` not `rounded-lg`

---

### Order Summary Sidebar (`div.order-summary` — node 327:306)
- **Container**: `w-[400px] bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`
- **Position**: `sticky top-0` → ⚠️ current uses `sticky top-4`

#### Summary Header
- "Order Summary" — Roboto Bold 18px `#1f2937` → `text-lg font-bold text-[#1f2937]` ✓
- Border-b `#e5e7eb`, `px-[24px] pt-[24px] pb-[17px]`

#### Summary Rows
- Subtotal label + value: Roboto Regular 15px `#4b5563` ✓
- Shipping value: "Calculated at next step" — `#9ca3af` → `text-[#9ca3af]`
  - ⚠️ Current `text-text-light` = `#999999` — wrong hex, should be `#9ca3af`
- Tax value: same as Shipping ✓ same issue
- Separator: `border-t-2 border-[#e5e7eb]` ✓

#### Estimated Total
- "Estimated Total": Roboto Bold 18px `#111827` → `text-lg font-bold text-[#111827]` ✓

#### CTA Button (`Component 2`)
- **Background**: `#2bd9a8` → `bg-brand-accent` ✓ (token exists)
- ⚠️ Current uses `bg-secondary` (`#2699a6`) — wrong! Figma is `#2bd9a8`
- **Layout**: `flex gap-[8px] items-center justify-center p-[16px] rounded-[8px]`
- **Text**: Roboto SemiBold 16px white → `text-base font-semibold text-white` ✓
- **Icon**: Arrow-right → lucide `ArrowRight size={16}` ✓
- **Hover**: `hover:bg-brand-accent/90`

#### Trust Badges
- **Container**: `flex gap-[24px] items-center justify-center border-t border-[#e5e7eb] pt-[25px]`
- Badge 1: Lock icon (FA `\uF023`) `text-[#2ac864]` 13px + "Secure Checkout" `#4b5563` 13px
  - Map to: lucide `Lock size={13}` `text-primary`, span `text-[13px] text-[#4b5563]`
- Badge 2: Shield icon (FA `\uF3ED`) `text-[#2ac864]` 13px + "SSL Encrypted" `#4b5563` 13px
  - Map to: lucide `ShieldCheck size={13}` `text-primary`, span `text-[13px] text-[#4b5563]`
- ⚠️ Current has `gap-6` (24px ✓) but badge order is reversed (ShieldCheck first, Lock second)

---

## Token Mapping for This Page

| Figma Value | Token / Class |
|-------------|---------------|
| `#2bd9a8` (banner + CTA) | `brand-accent` → `bg-brand-accent`, `border-brand-accent`, `text-brand-accent` |
| `rgba(43,217,168,0.1)` | `bg-brand-accent/10` |
| `#2699a6` | `text-secondary` / `bg-secondary` |
| `#2ac864` | `text-primary` |
| `#111827` | `text-[#111827]` (no token) |
| `#1f2937` | `text-[#1f2937]` (no token) |
| `#4b5563` | `text-[#4b5563]` (no token) |
| `#6b7280` | `text-[#6b7280]` / `text-text-muted` |
| `#9ca3af` | `text-[#9ca3af]` (distinct from `text-text-light` = #999) |
| `#374151` | `text-[#374151]` |
| `#757575` | `text-[#757575]` (placeholder) |
| `rounded-[8px]` | `rounded-sm` (our @theme: --radius-sm = 8px) |
| `rounded-[12px]` | `rounded-lg` (our @theme: --radius-lg = 12px) |

---

## Implementation Notes (Intentional Deviations)

1. **Quantity stepper kept** — Figma shows static "Qty: 1" text, but the interactive stepper (−/+/✕) provides necessary cart management. Kept intentionally.
2. **Applied promo codes display** — Figma doesn't show the applied-codes chip UI. Kept as it's needed for UX feedback.
3. **Guest check** — Figma always shows the guest banner. Implementation should only show it when user is not logged in (future: add auth check; current: always visible matches Figma static state).

---

## Prior Spec — Node 327:1413 (Checkout Step 4: Review)

> Captured: 2026-02-23
> Node ID: `327:1413` (section), inner frame `327:1241` (1920w light)

### Layout

- **Frame**: 1920×1289px, bg `#f9fafb`
- **Two-column**: Left 720px + gap 32px + Right 400px sticky sidebar
- **Progress bar**: Cart ✓ | Payment ✓ | Shipping ✓ | **Review** (active)

### Left Column — 1 Card

#### Review Your Order Card (720×971px)
- **Header**: "Review Your Order"
- **Intro text**: "Please review your order details before placing your order. By clicking 'Place Order', you agree to our Terms of Service and Privacy Policy."

#### Shipping Address Section (bordered box, rounded-lg, p-5)
- **Title**: "Shipping Address" + "Edit" link (right-aligned, text-secondary)
- **Content**: Name, Street + Apt, City/State/Zip, Phone
- text-[15px] `#4b5563`

#### Payment Method Section (separate bordered box)
- **Title**: "Payment Method" + "Edit" link
- **Content**: Card icon + payment method label

#### Items in Order Section
- **Title**: "Items in Order"
- Each item: 80×80 image | Product name, variant, qty | Price (right-aligned)
- Items separated by border

### Right Column — Order Total (400px, sticky)
- **Title**: "Order Total" (not "Order Summary")
- **CTA**: "Place Order ✓" (bg-secondary text-white, check icon)
- **Trust text**: Lock icon + "Secure SSL Encrypted Transaction" (centered)
- No back link
