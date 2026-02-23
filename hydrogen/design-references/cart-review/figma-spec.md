# Review Page — Figma Specification

> Captured: 2026-02-23
> Figma File: `vzeR7m9jbWjAfD9EVlReyq` (Cart and Checkout)
> Node ID: `327:1413` (section), inner frame `327:1241` (1920w light)

## Layout

- **Frame**: 1920×1289px, bg `#f9fafb`
- **Two-column**: Left 720px + gap 32px + Right 400px sticky sidebar
- **Progress bar**: Cart ✓ | Payment ✓ | Shipping ✓ | **Review** (active)

## Left Column — 1 Card

### Review Your Order Card (720×971px)
- **Header**: "Review Your Order"
- **Intro text**: "Please review your order details before placing your order. By clicking 'Place Order', you agree to our Terms of Service and Privacy Policy."

#### Shipping Address Section (bordered box, rounded-lg, p-5)
- **Title**: "Shipping Address" + "Edit" link (right-aligned, text-secondary)
- **Content**: Name, Street + Apt, City/State/Zip, Phone
- text-[15px] `#4b5563`

#### Shipping Method Section (within same bordered box)
- **Title**: "Shipping Method"
- **Content**: "Standard Shipping (5-7 business days) - $5.99"

#### Payment Method Section (separate bordered box)
- **Title**: "Payment Method" + "Edit" link
- **Content**: Card icon + "Visa ending in 4242" + "Expires 12/25"
- (Implementation shows selected payment method type since we don't store actual card data)

#### Items in Order Section
- **Title**: "Items in Order"
- Each item: 80×80 image | Product name, variant, qty | Price (right-aligned)
- Items separated by border

## Right Column — Order Total (400px, sticky)
- **Title**: "Order Total" (not "Order Summary")
- Subtotal: $426.00
- Shipping: $5.99
- Tax: $34.08
- **Total**: $466.07 (text-lg font-bold)
- **CTA**: "Place Order ✓" (bg-secondary text-white, check icon)
- **Trust text**: Lock icon + "Secure SSL Encrypted Transaction" (centered)
- No back link

## Color Token Mapping
Same as other checkout pages — primary green, secondary teal, border gray.
