# Confirmation Page — Figma Specification

> Captured: 2026-02-23
> Figma File: `vzeR7m9jbWjAfD9EVlReyq` (Cart and Checkout)
> Node ID: `327:1721` (section), inner frame `327:1579` (1920w light)

## Layout

- **Frame**: 1920×1743px, bg `#f9fafb`
- **Single-column centered** layout (max-width 800px)
- **No progress bar** on this page

## Success Hero Section (full-width, bg-white, centered)
- **Success icon**: 80×80 green circle (#2ac864) with white checkmark (40px)
- **Title**: "Thank You for Your Order!" (text-4xl font-bold `#111827`)
- **Subtitle**: "A confirmation email has been sent to john.doe@example.com" (text-lg `#4b5563`)
- **Order number**: "Order #HY-2024-78432" (bordered badge, rounded-lg, px-6 py-3.5)
- **Action buttons** (inline, gap-3):
  - "Track Order" (bg-[#e67e22] text-white, Package icon) — orange/amber
  - "Continue Shopping" (border border-border bg-white, ShoppingBag icon) — outlined

## Order Details Card (752px, centered)
- **Header**: "Order Details" (left) + "Placed on February 21, 2026" (right, text-sm `#6b7280`)

### Two-column info section
- **Left**: Shipping Address (uppercase label, address lines)
- **Right**: Estimated Delivery
  - Calendar icon + "February 28 - March 2" (font-semibold)
  - "Standard Shipping" (text-sm `#6b7280`)

### Items Ordered
- Each item: 80×80 image | Product name, variant(s), qty | Price
- Separated by border

### Price Breakdown (bg-[#f9fafb] rounded-lg p-5)
- Subtotal: $426.00
- Shipping: $5.99
- Tax: $34.08
- **Total**: $466.07 (border-top, text-lg font-bold)

## Create Account CTA (centered, below card, guests only)
- **Title**: "Create an Account for Faster Checkout" (text-xl font-bold)
- **Subtitle**: "Save your shipping and payment information for next time"
- **Button**: "Create Account" (bg-secondary text-white)

## Color Token Mapping
| Figma | Tailwind |
|-------|----------|
| `#2ac864` | `bg-primary` (success icon) |
| `#e67e22` | `bg-[#e67e22]` (Track Order button) |
| `#2699a6` | `bg-secondary` (Create Account button) |
| `#111827` | `text-[#111827]` (headings) |
| `#4b5563` | `text-[#4b5563]` (body text) |
| `#6b7280` | `text-[#6b7280]` (secondary text) |
