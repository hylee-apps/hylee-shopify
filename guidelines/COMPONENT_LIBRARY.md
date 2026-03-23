# Component Library — Hy-lee Hydrogen Storefront

> **Purpose**: Single source of truth for all UI components in the Hydrogen storefront (`hydrogen/app/components/`). Before creating or modifying any UI element, consult this guide.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Decision Tree](#decision-tree)
3. [Design Tokens](#design-tokens)
4. [UI Primitives (shadcn/ui)](#ui-primitives-shadcnui)
5. [Commerce Components](#commerce-components)
6. [Layout Components](#layout-components)
7. [Checkout Components](#checkout-components)
8. [Product Components](#product-components)
9. [Search Components](#search-components)
10. [Page-Specific Components (Extraction Candidates)](#page-specific-components-extraction-candidates)
11. [Figma Component Library](#figma-component-library)
12. [Component Audit Checklist](#component-audit-checklist)
13. [Icon Usage](#icon-usage)

---

## Quick Reference

### When to Use What

| Need | Component | Location |
|------|-----------|----------|
| Pill-shaped search/email input | `PillInput` | `ui/pill-input.tsx` |
| Any button | `Button` | `ui/button.tsx` |
| Content container | `Card` | `ui/card.tsx` |
| Text input field | `Input` | `ui/input.tsx` |
| Loading placeholder | `Skeleton` | `ui/skeleton.tsx` |
| Section divider | `Separator` | `ui/separator.tsx` |
| Expandable sections | `Accordion` | `ui/accordion.tsx` |
| User avatar | `Avatar` | `ui/avatar.tsx` |
| Page breadcrumbs | `Breadcrumb` | `ui/breadcrumb.tsx` |
| Scrollable container | `ScrollArea` | `ui/scroll-area.tsx` |
| Navigation dropdown | `DropdownMenu` | `ui/dropdown-menu.tsx` |
| Side panel / mobile menu | `Sheet` | `ui/sheet.tsx` |
| Toast notifications | `Sonner` | `ui/sonner.tsx` |
| Product image gallery | `ProductGallery` | `product/ProductGallery.tsx` |
| Color/size variant picker | `VariantSelector` | `product/VariantSelector.tsx` |
| Add to cart button | `AddToCart` | `commerce/AddToCart.tsx` |
| Quantity +/- control | `QuantitySelector` | `commerce/QuantitySelector.tsx` |
| Price with compare-at | `PriceDisplay` | `commerce/PriceDisplay.tsx` |
| Sentiment rating faces | `FaceRatingSummary` | `commerce/FaceRating.tsx` |
| Product card (grid) | `ProductCard` | `commerce/ProductCard.tsx` |
| Product grid layout | `ProductGrid` | `commerce/ProductGrid.tsx` |
| Collection hero banner | `CollectionHero` | `commerce/CollectionHero.tsx` |
| Filter sidebar (PLP) | `FilterSidebar` | `commerce/FilterSidebar.tsx` |
| Sort dropdown | `SortSelect` | `commerce/SortSelect.tsx` |
| Collection toolbar | `CollectionToolbar` | `commerce/CollectionToolbar.tsx` |
| Compare products bar | `CompareBar` | `commerce/CompareBar.tsx` |
| Compare toggle button | `CompareButton` | `commerce/CompareButton.tsx` |
| Compare table view | `CompareTable` | `commerce/CompareTable.tsx` |
| Checkout step indicator | `CheckoutProgress` | `checkout/CheckoutProgress.tsx` |
| Checkout order summary | `OrderSummary` | `checkout/OrderSummary.tsx` |
| Site header | `Header` | `layout/Header.tsx` |
| Site footer | `Footer` | `layout/Footer.tsx` |
| Page wrapper | `PageLayout` | `layout/PageLayout.tsx` |
| Searchanise autocomplete | `SearchAutocomplete` | `search/SearchAutocomplete.tsx` |

---

## Decision Tree

```
Need to render UI?
|
+--> Does a component exist in components/ui/?
|    +--> YES: Use it with existing variants
|    |    +--> Need different behavior?
|    |        +--> Can be achieved with props? --> Use props
|    |        +--> Cannot? --> Add variant, update tests
|    |
|    +--> NO: Check Commerce/Layout/Checkout/Product components above
|        +--> Exists? --> Use it
|        +--> Doesn't exist?
|            |
|            +--> Used on 2+ pages? --> Extract as shared component
|            +--> Used on 1 page only? --> Keep inline, mark as extraction candidate
```

---

## Design Tokens

All tokens are in `hydrogen/app/styles/app.css` via Tailwind v4 `@theme` block. **Never hardcode hex colors.**

### Color Tokens

| Figma Variable | CSS Variable | Tailwind Class | Hex |
|---------------|-------------|----------------|-----|
| `--primary` | `--color-primary` | `*-primary` | `#2ac864` (green) |
| `--secondary` | `--color-secondary` | `*-secondary` | `#2699a6` (teal) |
| `--default` | `--color-text-muted` | `*-text-muted` | `#666666` |
| `--alternate` | `--color-background` | `bg-white` | `#ffffff` |
| — | `--color-hero` | `bg-hero` | `#14b8a6` (homepage hero) |
| — | `--color-dark` | `*-dark` | `#1a1a1a` |
| — | `--color-text` | `*-text` | `#333333` |
| — | `--color-text-light` | `*-text-light` | `#999999` |
| — | `--color-border` | `border-border` | `#e5e5e5` |
| — | `--color-surface` | `bg-surface` | `#f5f5f5` |

### Utility

| Token | Tailwind | Usage |
|-------|----------|-------|
| `cn()` | `lib/utils.ts` | `clsx` + `tailwind-merge` — use everywhere for conditional classes |
| CVA | `class-variance-authority` | Define component variants (used in Button) |

---

## UI Primitives (shadcn/ui)

Located in `hydrogen/app/components/ui/`. Built on Radix UI + CVA + Tailwind.

### Installed & In Use

| Component | File | Radix Dependency | Used On |
|-----------|------|-----------------|---------|
| **Accordion** | `accordion.tsx` | `@radix-ui/react-accordion` | PDP |
| **Avatar** | `avatar.tsx` | `@radix-ui/react-avatar` | PDP (reviews) |
| **Breadcrumb** | `breadcrumb.tsx` | — (custom) | PDP |
| **Button** | `button.tsx` | `@radix-ui/react-slot` | All pages |
| **Card** | `card.tsx` | — | All pages |
| **DropdownMenu** | `dropdown-menu.tsx` | `@radix-ui/react-dropdown-menu` | Header |
| **Input** | `input.tsx` | — | Checkout (cart, payment, shipping) |
| **PillInput** | `pill-input.tsx` | — (custom) | Homepage hero, Header search, Footer newsletter |
| **ScrollArea** | `scroll-area.tsx` | `@radix-ui/react-scroll-area` | PDP (gallery thumbnails) |
| **Separator** | `separator.tsx` | `@radix-ui/react-separator` | Homepage, PDP |
| **Sheet** | `sheet.tsx` | `@radix-ui/react-dialog` | Header (mobile menu) |
| **Skeleton** | `skeleton.tsx` | — | Homepage, PDP |
| **Sonner** | `sonner.tsx` | `sonner` | Toast notifications |

### Installed but Not Yet Used on Key Pages

| Component | File | Potential Use |
|-----------|------|---------------|
| Alert | `alert.tsx` | Error/success messages |
| Badge | `badge.tsx` | Product tags, status labels |
| Checkbox | `checkbox.tsx` | Filter sidebar, forms |
| Command | `command.tsx` | Command palette / search |
| Dialog | `dialog.tsx` | Modals, confirmations |
| Form | `form.tsx` | Form validation wrapper |
| Label | `label.tsx` | Form field labels |
| NavigationMenu | `navigation-menu.tsx` | — |
| Pagination | `pagination.tsx` | PLP pagination |
| RadioGroup | `radio-group.tsx` | Payment method selection |
| Select | `select.tsx` | Dropdowns |
| Tabs | `tabs.tsx` | Tabbed content |
| Textarea | `textarea.tsx` | Delivery preferences |
| Tooltip | `tooltip.tsx` | Icon tooltips |

---

## Commerce Components

Located in `hydrogen/app/components/commerce/`.

| Component | File | Purpose | Props | Used On |
|-----------|------|---------|-------|---------|
| **AddToCart** | `AddToCart.tsx` | Cart form with loading/success/error states | `variantId`, `quantity`, `disabled` | PDP |
| **CollectionHero** | `CollectionHero.tsx` | Collection banner with image + title | `collection` | PLP |
| **CollectionToolbar** | `CollectionToolbar.tsx` | Sort/filter bar for collections | `sort`, `onSort`, `onOpenFilters` | PLP |
| **CompareBar** | `CompareBar.tsx` | Floating compare products bar | `products`, `onRemove`, `onCompare` | PLP |
| **CompareButton** | `CompareButton.tsx` | Toggle compare checkbox on product card | `productId`, `checked`, `onChange` | PLP |
| **CompareTable** | `CompareTable.tsx` | Side-by-side product comparison | `products` | Compare page |
| **FaceRatingSummary** | `FaceRating.tsx` | 3-tier sentiment rating (happy/neutral/unhappy) | `ratings` | PDP |
| **FilterSidebar** | `FilterSidebar.tsx` | Collapsible product filters | `filters`, `activeFilters`, `onChange` | PLP |
| **PriceDisplay** | `PriceDisplay.tsx` | Price with optional compare-at and discount badge | `price`, `compareAtPrice` | PDP, ProductCard |
| **ProductCard** | `ProductCard.tsx` | Product card for grids | `product`, `loading` | PLP, Homepage, PDP (recommended) |
| **ProductGrid** | `ProductGrid.tsx` | Responsive product grid layout | `products`, `columns` | PLP |
| **QuantitySelector** | `QuantitySelector.tsx` | Increment/decrement quantity | `value`, `onChange`, `min`, `max` | PDP |
| **SortSelect** | `SortSelect.tsx` | Sort-by dropdown | `value`, `onChange`, `options` | PLP |

---

## Layout Components

Located in `hydrogen/app/components/layout/`.

| Component | File | Purpose | Variants | Figma Source |
|-----------|------|---------|----------|-------------|
| **Header** | `Header.tsx` | Site header with nav, search, cart | `home` / `default` | `d52sF4D2B0bIzt3A4z3UjE` node `2766:311` |
| **Footer** | `Footer.tsx` | Site footer with newsletter, links, social | `default` / `primary` / `secondary` / `tertiary` | `X566CMLIsD8YboYdRU18IS` node `659:113` |
| **PageLayout** | `PageLayout.tsx` | Page wrapper with header + footer | — | — |

---

## Checkout Components

Located in `hydrogen/app/components/checkout/`.

| Component | File | Purpose | Props | Used On |
|-----------|------|---------|-------|---------|
| **CheckoutProgress** | `CheckoutProgress.tsx` | Multi-step progress bar with badges + dividers | `currentStep` | Cart, Payment, Shipping, Review |
| **OrderSummary** | `OrderSummary.tsx` | Sticky sidebar with subtotal, items, CTA | `cart`, `title`, `ctaText`, `ctaHref`, `showItems` | Payment, Shipping, Review |

---

## Product Components

Located in `hydrogen/app/components/product/`.

| Component | File | Purpose | Key Props | Used On |
|-----------|------|---------|-----------|---------|
| **ProductGallery** | `ProductGallery.tsx` | Image gallery with thumbnail navigation | `images`, `layout` (`vertical`/`horizontal`) | PDP |
| **VariantSelector** | `VariantSelector.tsx` | Color swatches + size buttons with availability | `options`, `selectedVariant`, `variants` | PDP |

---

## Search Components

Located in `hydrogen/app/components/search/`.

| Component | File | Purpose | Used On |
|-----------|------|---------|---------|
| **SearchAutocomplete** | `SearchAutocomplete.tsx` | Searchanise-powered autocomplete dropdown | Header (alternate) |

---

## Page-Specific Components (Extraction Candidates)

These are currently defined inline within route files. Components marked **HIGH** should be extracted into the shared library.

### HIGH Priority — Used (or should be used) on multiple pages

| Component | Current Location | Recommended Extraction | Reason |
|-----------|-----------------|----------------------|--------|
| **FormField** | `checkout.shipping.tsx` | `ui/form-field.tsx` | Reusable label+input+error pattern needed across all checkout forms |
| **PromoCodeCard** | `cart.tsx` | `commerce/PromoCodeCard.tsx` | Could be reused on checkout review |
| **CartLineRow** | `cart.tsx` | `commerce/CartLineRow.tsx` | Product line item display shared between cart + review |
| **GuestBanner** | `cart.tsx` | `commerce/GuestBanner.tsx` | Guest CTA used on cart, could be on checkout |

### MEDIUM Priority — Self-contained, worth extracting for maintainability

| Component | Current Location | Recommended Extraction | Reason |
|-----------|-----------------|----------------------|--------|
| **PaymentMethodCard** | `checkout.payment.tsx` | `checkout/PaymentMethodCard.tsx` | Complex card with radio selection + nested forms |
| **CardDetailsForm** | `checkout.payment.tsx` | `checkout/CardDetailsForm.tsx` | Credit card input group |
| **ShippingAddressCard** | `checkout.shipping.tsx` | `checkout/ShippingAddressCard.tsx` | 8-field address form |
| **ShippingMethodCard** | `checkout.shipping.tsx` | `checkout/ShippingMethodCard.tsx` | Radio-style method selector |
| **OrderItems** | `checkout.review.tsx` | `checkout/OrderItems.tsx` | Product item list with images + prices |
| **ReviewsSection** | `products.$handle.tsx` | `product/ReviewsSection.tsx` | Filterable review list with avatars + face ratings |
| **RecommendedProducts** | `products.$handle.tsx` | `product/RecommendedProducts.tsx` | 4-column product grid with Suspense loading |
| **ProductSection** | `_index.tsx` | `commerce/ProductSection.tsx` | Homepage product row (title + scrollable cards) |

### LOW Priority — Small, truly page-specific

| Component | Current Location | Keep Inline | Reason |
|-----------|-----------------|-------------|--------|
| **CartEmpty** | `cart.tsx` | Yes | Single-use empty state |
| **SuccessHero** | `checkout.confirmation.tsx` | Yes | Confirmation-only hero |
| **OrderDetailsCard** | `checkout.confirmation.tsx` | Yes | Confirmation-only details |
| **CreateAccountCTA** | `checkout.confirmation.tsx` | Yes | Confirmation-only CTA |
| **CreditCardBrandBadge** | `checkout.payment.tsx` | Yes | Tiny visual helper |
| **PaymentMethodOption** | `checkout.payment.tsx` | Yes | Simple radio option |
| **BillingAddressCard** | `checkout.payment.tsx` | Yes | Simple toggle card |
| **DeliveryPreferencesCard** | `checkout.shipping.tsx` | Yes | Single textarea card |
| **ShippingAddressSection** | `checkout.review.tsx` | Yes | Read-only display |
| **ShippingMethodSection** | `checkout.review.tsx` | Yes | Read-only display |
| **PaymentMethodSection** | `checkout.review.tsx` | Yes | Read-only display |
| **PdpPrice** | `products.$handle.tsx` | Yes | PDP-specific currency formatter |
| **SpecsContent** | `products.$handle.tsx` | Yes | JSON → definition list |
| **RecommendedProductsSkeleton** | `products.$handle.tsx` | Yes | Loading state for recommended |
| **ProductCard (homepage)** | `_index.tsx` | Yes | Static placeholder (will be replaced by real ProductCard) |

---

## Figma Component Library

| Item | Value |
|------|-------|
| **File key** | `X566CMLIsD8YboYdRU18IS` |
| **File name** | Component Library |
| **Page** | Home Components |
| **Status** | Early stage — Footer is the only component migrated |

### Components in Figma Library

| Component | Node ID | Variants | Code Equivalent |
|-----------|---------|----------|----------------|
| **Footer** | `659:113` | Default, Primary, Secondary, Tertiary | `layout/Footer.tsx` |
| Footer > Input | — | PrimarySubmit, Alternate | `ui/pill-input.tsx` |
| Footer > Logo | — | Default, Alternate | Inline in Footer |
| Footer > Button | — | Primary, Outline | `ui/button.tsx` |
| Footer > Link | — | Default, Light | Inline in Footer |

### Components NOT Yet in Figma Library (should be added)

| Component | Current Figma File | Node ID |
|-----------|-------------------|---------|
| Header | `d52sF4D2B0bIzt3A4z3UjE` | `2766:311` |
| ProductCard | Various page files | — |
| CheckoutProgress | `vzeR7m9jbWjAfD9EVlReyq` | Various |
| PillInput | Derived from Footer Input | — |
| Button | Derived from Footer Button | — |

---

## Component Audit Checklist

Before creating or modifying a component:

### Pre-Work

- [ ] Checked `components/ui/` for existing shadcn primitive
- [ ] Checked Commerce/Layout/Checkout/Product component lists above
- [ ] Verified no existing component meets the need
- [ ] If modifying: read the component file first

### New Component Requirements

- [ ] Created in appropriate directory (`ui/`, `commerce/`, `checkout/`, `product/`, `layout/`)
- [ ] Uses design tokens from `app/styles/app.css` — no hardcoded colors
- [ ] Uses `cn()` for conditional class merging
- [ ] Has TypeScript interface for props
- [ ] Added to this document (COMPONENT_LIBRARY.md)
- [ ] If extracted from inline: verified all page-specific logic removed

---

## Icon Usage

All icons via `lucide-react`. 22 distinct icons in use across Homepage, PDP, and Checkout:

| Icon | Import | Used On |
|------|--------|---------|
| ArrowLeft | `lucide-react` | Checkout (back nav) |
| ArrowRight | `lucide-react` | Checkout (forward nav) |
| Calendar | `lucide-react` | Confirmation |
| Check | `lucide-react` | AddToCart, CheckoutProgress, Review |
| CheckCircle | `lucide-react` | Confirmation |
| ChevronDown | `lucide-react` | Header (nav dropdowns) |
| ChevronLeft | `lucide-react` | ProductGallery |
| ChevronRight | `lucide-react` | ProductGallery |
| CreditCard | `lucide-react` | Payment, Review |
| Frown | `lucide-react` | FaceRating |
| ImageIcon | `lucide-react` | Cart, Review, Confirmation (fallback) |
| Info | `lucide-react` | Cart |
| Loader2 | `lucide-react` | AddToCart (loading) |
| Lock | `lucide-react` | Checkout (trust badge) |
| Meh | `lucide-react` | FaceRating |
| Menu | `lucide-react` | Header (hamburger) |
| Minus | `lucide-react` | QuantitySelector, Cart |
| Package | `lucide-react` | Confirmation |
| Plus | `lucide-react` | QuantitySelector, Homepage, Cart |
| Search | `lucide-react` | PillInput, Header |
| ShieldCheck | `lucide-react` | Checkout (trust badge) |
| ShoppingBag | `lucide-react` | Confirmation |
| ShoppingCart | `lucide-react` | Header, Cart, PDP |
| Smile | `lucide-react` | FaceRating |
| Star | `lucide-react` | PDP (ratings) |
| User | `lucide-react` | Header (account) |
| X | `lucide-react` | AddToCart (error), Cart (remove) |

---

## Utility Modules

| Module | File | Exports | Used By |
|--------|------|---------|---------|
| **cn** | `lib/utils.ts` | `cn()` (clsx + tailwind-merge) | Every component |
| **Checkout** | `lib/checkout.ts` | `formatMoney`, `validateShippingAddress`, `getCheckoutAttributes`, `buildCartAttributes`, GraphQL mutations | All checkout routes |
| **Breadcrumbs** | `lib/breadcrumbs.ts` | `buildPathFromParentMetafields`, `findDeepestNavPath` | PDP |
| **Rich Text** | `lib/rich-text.ts` | `richTextToHtml` | PDP (description, warranty, specs) |
| **Searchanise** | `lib/searchanise.ts` | Searchanise API client | SearchAutocomplete |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-15 | Complete rewrite — replaced generic template with actual Hy-lee component inventory |
| 2026-03-03 | PillInput extracted from inline patterns across Header, Homepage, Footer |
| 2026-02-23 | Footer moved to Figma Component Library (`X566CMLIsD8YboYdRU18IS`) |
| 2026-02-21 | PDP components built (ProductGallery, VariantSelector, FaceRating, Accordion) |
| 2026-02-19 | Homepage + PLP components built (ProductCard, ProductGrid, CollectionHero) |
| 2026-02-15 | shadcn/ui integration complete (Button, Card, Input, Separator, etc.) |
