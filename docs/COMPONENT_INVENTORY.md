# Component Inventory & Migration Plan

## Overview
This document catalogs all React components in the application and provides a migration strategy for converting them to Shopify Liquid templates and sections.

---

## Component Categories

### 1. Page-Level Components (11 total)
These are main page components that will become Shopify templates.

| Component | Path | Purpose | Shopify Mapping | Priority | Status |
|-----------|------|---------|-----------------|----------|--------|
| `Home.tsx` | `/src/components/` | Homepage with hero, categories, products | `templates/index.json` | High | ⏸️ |
| `Products.tsx` | `/src/components/` | Product listing/collection page | `templates/collection.json` | High | ⏸️ |
| `ProductDetails.tsx` | `/src/components/` | Individual product page | `templates/product.json` | High | ⏸️ |
| `CategoryPage.tsx` | `/src/components/` | Category browsing page | `templates/collection.json` (variant) | Medium | ⏸️ |
| `SubCategoryPage.tsx` | `/src/components/` | Subcategory page | `templates/collection.json` (variant) | Medium | ⏸️ |
| `Checkout.tsx` | `/src/components/` | Checkout flow | Shopify Checkout (limited customization) | Low | ⏸️ |
| `Account.tsx` | `/src/components/` | Customer account dashboard | `templates/customers/account.json` | Medium | ⏸️ |
| `SignUp.tsx` | `/src/components/` | User registration | `templates/customers/register.json` | Medium | ⏸️ |
| `OrderConfirmation.tsx` | `/src/components/` | Order success page | `templates/customers/order.json` | Medium | ⏸️ |
| `OrderDetail.tsx` | `/src/components/` | Individual order details | `templates/customers/order.json` | Medium | ⏸️ |
| `TrackOrder.tsx` | `/src/components/` | Order tracking | Custom section/page | Low | ⏸️ |

### 2. Shared Components (2 total)
Global components used across multiple pages.

| Component | Path | Purpose | Shopify Mapping | Priority | Status |
|-----------|------|---------|-----------------|----------|--------|
| `Header.tsx` | `/src/components/shared/` | Site header with nav | `sections/header.liquid` | **Critical** | ⏸️ |
| `Footer.tsx` | `/src/components/shared/` | Site footer | `sections/footer.liquid` | **Critical** | ⏸️ |

### 3. UI Component Library (47 total)
Reusable UI components from `/src/components/ui/` - Based on shadcn/ui (Radix UI + Tailwind).

| Component | Type | Shopify Strategy | Priority |
|-----------|------|------------------|----------|
| `button.tsx` | Interactive | Liquid snippet + CSS | High |
| `input.tsx` | Form | Liquid snippet | High |
| `card.tsx` | Layout | Liquid snippet | High |
| `badge.tsx` | Display | Liquid snippet | Medium |
| `alert.tsx` | Feedback | Liquid snippet | Medium |
| `dialog.tsx` | Modal | JS + Liquid snippet | Medium |
| `dropdown-menu.tsx` | Navigation | JS + Liquid snippet | Medium |
| `navigation-menu.tsx` | Navigation | JS + Liquid snippet | High |
| `accordion.tsx` | Interactive | JS + Liquid snippet | Medium |
| `tabs.tsx` | Interactive | JS + Liquid snippet | Medium |
| `carousel.tsx` | Interactive | JS + Liquid snippet | High |
| `pagination.tsx` | Navigation | Liquid snippet | High |
| `breadcrumb.tsx` | Navigation | Liquid snippet | Medium |
| `table.tsx` | Display | Liquid snippet | Low |
| `form.tsx` | Form | Liquid snippet | High |
| `label.tsx` | Form | Liquid snippet | High |
| `checkbox.tsx` | Form | Liquid snippet | Medium |
| `radio-group.tsx` | Form | Liquid snippet | Medium |
| `select.tsx` | Form | Liquid snippet | High |
| `textarea.tsx` | Form | Liquid snippet | Medium |
| `switch.tsx` | Form | JS + Liquid snippet | Low |
| `slider.tsx` | Form | JS + Liquid snippet | Low |
| `progress.tsx` | Feedback | Liquid snippet | Low |
| `skeleton.tsx` | Loading | CSS only | Low |
| `avatar.tsx` | Display | Liquid snippet | Low |
| `separator.tsx` | Layout | CSS only | Low |
| `sheet.tsx` | Modal | JS + Liquid snippet | Medium |
| `drawer.tsx` | Modal | JS + Liquid snippet | Medium |
| `popover.tsx` | Overlay | JS + Liquid snippet | Medium |
| `hover-card.tsx` | Overlay | JS + Liquid snippet | Low |
| `tooltip.tsx` | Overlay | JS + Liquid snippet | Medium |
| `context-menu.tsx` | Menu | JS + Liquid snippet | Low |
| `menubar.tsx` | Navigation | JS + Liquid snippet | Low |
| `alert-dialog.tsx` | Modal | JS + Liquid snippet | Medium |
| `collapsible.tsx` | Interactive | JS + Liquid snippet | Low |
| `command.tsx` | Search | JS + Liquid snippet | Low |
| `toggle.tsx` | Interactive | JS + Liquid snippet | Low |
| `toggle-group.tsx` | Interactive | JS + Liquid snippet | Low |
| `scroll-area.tsx` | Layout | CSS + JS | Low |
| `sidebar.tsx` | Layout | JS + Liquid snippet | Medium |
| `aspect-ratio.tsx` | Layout | CSS only | Medium |
| `resizable.tsx` | Layout | JS + Liquid snippet | Low |
| `calendar.tsx` | Date picker | JS + Liquid snippet | Low |
| `input-otp.tsx` | Form | JS + Liquid snippet | Low |
| `chart.tsx` | Visualization | External library | Low |
| `sonner.tsx` | Toast notification | JS library | Medium |
| `use-mobile.ts` | Hook | JS utility | Medium |
| `utils.ts` | Utilities | JS utility | High |

### 4. Figma Components (1 total)
| Component | Path | Purpose | Strategy |
|-----------|------|---------|----------|
| `ImageWithFallback.tsx` | `/src/components/figma/` | Image with fallback | Liquid snippet | Medium |

---

## Migration Strategy

### Phase 1: Foundation (Current)
- ✅ Shopify theme structure created
- ✅ Base layout (theme.liquid) created
- ✅ Essential config files created

### Phase 2: Shared Components (Priority: Critical)
**Order of conversion:**
1. **Header** → `sections/header.liquid` + `snippets/header-nav.liquid`
2. **Footer** → `sections/footer.liquid`

These are critical because they're used on every page.

### Phase 3: Core UI Components (Priority: High)
Convert the most commonly used UI components first:
1. Button
2. Input
3. Card
4. Form/Label
5. Navigation Menu
6. Carousel
7. Pagination
8. Select

### Phase 4: Main Templates (Priority: High)
1. **Product Template** (`ProductDetails.tsx` → `templates/product.json`)
2. **Collection Template** (`Products.tsx` → `templates/collection.json`)
3. **Homepage** (`Home.tsx` → `templates/index.json`)

### Phase 5: Secondary Templates (Priority: Medium)
1. Account pages
2. Category/Subcategory pages
3. Order pages

### Phase 6: Remaining UI Components (Priority: Low)
- Less frequently used components
- Advanced interactions
- Specialized features

---

## Component Analysis Notes

### Home.tsx (647 lines)
**Features:**
- Hero carousel with multiple slides
- Category grid
- Featured products
- Flash sale timer
- Newsletter signup
- Promotional banner
- Trending products section

**Migration Complexity:** High
- Multiple interactive sections
- State management for carousel, timer
- Will become multiple sections in Shopify

### Header.tsx & Footer.tsx
**Migration Complexity:** Medium
- Need to support navigation menu
- Search functionality
- User account links
- Cart indicator

### UI Components
**Migration Approach:**
- Extract styles to CSS
- Convert React props to Liquid variables
- Replicate interactivity with vanilla JS where needed
- Use Web Components for complex interactions

---

## Next Actions

1. ✅ Create base theme structure
2. 🔄 Audit component dependencies and props
3. ⏸️ Convert Header component
4. ⏸️ Convert Footer component
5. ⏸️ Create core UI component library in Liquid
6. ⏸️ Convert main page templates

---

_Last updated: 2025-12-14_
