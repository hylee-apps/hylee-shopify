# Shipping Page — Figma Specification

> Captured: 2026-04-04 (updated from 2026-02-23)
> Figma File: `vzeR7m9jbWjAfD9EVlReyq` (Cart and Checkout)
> Node ID: `327:701` (div.checkout-layout — inner layout node)
> Previous node: `327:887` (outer section frame)

## Layout

- **Frame inner layout**: Two-column flex with `gap-[32px]`
- **Left column**: `w-[720px]`, `pb-[24px]`, `gap-[24px]` between cards
- **Right column**: `w-[400px]` sticky sidebar
- **Page background**: `#f9fafb`
- **Progress bar**: Cart ✓ | Payment ✓ | **Shipping** (active) | Review

## Left Column — Cards

### 1. Shipping Address Card (node 327:703)

**Card container**: `rounded-[12px] border border-[#e5e7eb] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white overflow-clip`

**Card header** (node 327:704): `pt-[20px] pb-[21px] px-[24px] border-b border-[#e5e7eb]`
- Title: "Shipping Address" — Roboto Bold 18px `#111827`
- "Use Saved Address Profile ▼" button (right-aligned) — **implementation deviation**: we use a separate `ShippingCategorySelector` card instead

**Card body** (node 327:707): `p-[24px]`

**Form groups**:

| Group | Fields | Layout | Gap |
|-------|--------|--------|-----|
| First/Last Name | firstName + lastName | `flex gap-[16px]` | 16px between |
| Address | address1 + address2 (shared group) | `flex flex-col gap-[8px]` | 8px between inputs; one "Address" label above both |
| City/ZIP | city + zip | `flex gap-[16px] pt-[20px]` | 16px between |
| State/Phone | state + phone | `flex gap-[16px]` | 16px between |
| Email | email | full-width | — |

**Between-row gaps**: 20px (`gap-5`) between top-level form rows (except address1↔address2 which is 8px within their shared group)

**All inputs**: `h-[44px] rounded-[8px] border border-[#d1d5db] bg-white px-[17px] py-[13px]`
- Placeholder: Roboto Regular 15px `#757575`
- Label: Roboto Medium 14px `#374151`
- Focus: `border-secondary ring-1 ring-secondary`

---

### 2. Shipping Method Card (node 327:768)

**Card container**: same card styling as above — `rounded-[12px]`

**Card header**: `pt-[20px] pb-[21px] px-[24px] border-b border-[#e5e7eb]`
- Title: "Shipping Method" — Roboto Bold 18px `#111827`

**Card body**: `pt-[24px] pb-[36px] px-[24px] gap-[12px]` (flex-col)

**Shipping options** (3 in Figma — **we show Standard only** per Mar 15 production decision):

| Option | State | Styling |
|--------|-------|---------|
| Standard Shipping (selected) | Active | `border-2 border-[#2699a6] bg-[rgba(38,153,166,0.05)] rounded-[8px] p-[18px]` |
| Expedited Shipping | Inactive | `border-2 border-[#e5e7eb] rounded-[8px] p-[18px]` |
| Next Day Delivery | Inactive | `border-2 border-[#e5e7eb] rounded-[8px] p-[18px]` |

**Option layout**: `flex items-center justify-between`
- Shipping name: Roboto Medium 15px `#1f2937`
- Description: Roboto Regular 13px `#6b7280`
- Price: Roboto SemiBold 16px `#111827`

---

### 3. Delivery Preferences Card (node 327:797)

**Card container**: same card styling — `rounded-[12px]`

**Card header**: `pt-[20px] pb-[21px] px-[24px] border-b border-[#e5e7eb]`
- Title: "Delivery Preferences" — Roboto Bold 18px `#111827`

**Card body**: `px-[24px] py-[24px]`

**Textarea** (node 327:804):
- `w-full rounded-[8px] border border-[#d1d5db] bg-white px-[17px] pt-[13px] pb-[49px]`
- Placeholder: Roboto Regular 15px `#757575`
- Label: "Delivery Instructions (Optional)" — Roboto Medium 14px `#374151`

---

## Right Column — Order Summary (node 327:810)

**Container**: `w-[400px] rounded-[12px] border border-[#e5e7eb] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] bg-white sticky top-[24px]`

**Header**: `px-[24px] pb-[17px] pt-[24px] border-b border-[#e5e7eb]`
- Title: "Order Summary" — Roboto Bold 18px `#1f2937`

**Product item** (node 327:813): 
- Thumbnail: `60×60px rounded-[8px] bg-[#f3f4f6]`
- Name: Roboto Medium 14px `#111827`
- Qty: Roboto Regular 12px `#6b7280`
- Price: Roboto SemiBold 14px `#111827`

**Summary rows** (node 327:825–839):
- Subtotal, Shipping, Tax — Roboto Regular 15px `#4b5563`
- Total separator: `border-t-2 border-[#e5e7eb]` with `pt-[22px]`
- Total label + amount: Roboto Bold 18px `#111827`

**CTA button** (node 327:845):
- `bg-[#2ac864]` (= `bg-primary`) — NOT teal
- `rounded-[8px] p-[16px]`
- Label: "Continue to Payment" in Figma — **deviation: we say "Continue to Review"**
- Roboto SemiBold 16px white

**Back link** (node 327:849):
- "Return to Cart" in Figma — **deviation: we say "Return to Payment"**
- Roboto Medium 15px `#2699a6` (secondary teal)

---

## Color Token Mapping

| Figma | CSS Token | Tailwind Class |
|-------|-----------|----------------|
| `#2ac864` | `--color-primary` | `*-primary` |
| `#2699a6` | `--color-secondary` | `*-secondary` |
| `rgba(38,153,166,0.05)` | — | `bg-secondary/5` |
| `#e5e7eb` | `--color-border` | `border-border` |
| `#f9fafb` | — | `bg-[#f9fafb]` |
| `#111827` | — | `text-[#111827]` |
| `#1f2937` | — | `text-[#1f2937]` |
| `#374151` | — | `text-[#374151]` |
| `#4b5563` | — | `text-[#4b5563]` |
| `#6b7280` | — | `text-[#6b7280]` |
| `#d1d5db` | — | `border-[#d1d5db]` |
| `#757575` | — | `placeholder:text-[#757575]` |
| `#f3f4f6` | — | `bg-[#f3f4f6]` |

## Radius Reference (our @theme remap)

| Tailwind class | Our @theme value | Figma usage |
|----------------|-----------------|-------------|
| `rounded-[8px]` | 8px (arbitrary) | Form inputs, shipping tiles, CTA button, thumbnails |
| `rounded-[12px]` | 12px (arbitrary) | Card containers |
| `rounded-xl` | 20px | shadcn Card default — always override for this design |
| `rounded-lg` | 16px | Do NOT use — wrong for both inputs and cards |

## Intentional Deviations

| Element | Figma | Implementation | Reason |
|---------|-------|----------------|--------|
| Saved address UX | "Use Saved Address Profile" dropdown inside Shipping Address card header | Separate `ShippingCategorySelector` card (first in left column) | Already-built UX pattern |
| Shipping options | 3 (Standard, Expedited, Next Day) | 1 (Standard only, non-interactive display) | Mar 15 production decision |
| CTA label | "Continue to Payment" | "Continue to Review" | Our flow: Payment → Shipping → Review |
| Back link label | "Return to Cart" | "Return to Payment" | Previous step is Payment in our flow |
| Trust badges | Not shown | ssl-pci badges shown | UX enhancement |
