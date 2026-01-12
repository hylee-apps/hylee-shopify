# Component Inventory & Migration Plan

## Overview

This document catalogs all React components in the application and provides a migration strategy for converting them to Shopify Liquid templates and sections.

---

## Component Categories

### 1. Page-Level Components (11 total)

These are main page components that will become Shopify templates.

| Component               | Path               | Purpose                                  | Shopify Mapping                          | Priority | Status |
| ----------------------- | ------------------ | ---------------------------------------- | ---------------------------------------- | -------- | ------ |
| `Home.tsx`              | `/src/components/` | Homepage with hero, categories, products | `templates/index.json`                   | High     | ⏸️     |
| `Products.tsx`          | `/src/components/` | Product listing/collection page          | `templates/collection.json`              | High     | ⏸️     |
| `ProductDetails.tsx`    | `/src/components/` | Individual product page                  | `templates/product.json`                 | High     | ⏸️     |
| `CategoryPage.tsx`      | `/src/components/` | Category browsing page                   | `templates/collection.json` (variant)    | Medium   | ⏸️     |
| `SubCategoryPage.tsx`   | `/src/components/` | Subcategory page                         | `templates/collection.json` (variant)    | Medium   | ⏸️     |
| `Checkout.tsx`          | `/src/components/` | Checkout flow                            | Shopify Checkout (limited customization) | Low      | ⏸️     |
| `Account.tsx`           | `/src/components/` | Customer account dashboard               | `templates/customers/account.json`       | Medium   | ⏸️     |
| `SignUp.tsx`            | `/src/components/` | User registration                        | `templates/customers/register.json`      | Medium   | ⏸️     |
| `OrderConfirmation.tsx` | `/src/components/` | Order success page                       | `templates/customers/order.json`         | Medium   | ⏸️     |
| `OrderDetail.tsx`       | `/src/components/` | Individual order details                 | `templates/customers/order.json`         | Medium   | ⏸️     |
| `TrackOrder.tsx`        | `/src/components/` | Order tracking                           | Custom section/page                      | Low      | ⏸️     |

### 2. Shared Components (2 total)

Global components used across multiple pages.

| Component    | Path                      | Purpose              | Shopify Mapping          | Priority     | Status |
| ------------ | ------------------------- | -------------------- | ------------------------ | ------------ | ------ |
| `Header.tsx` | `/src/components/shared/` | Site header with nav | `sections/header.liquid` | **Critical** | ⏸️     |
| `Footer.tsx` | `/src/components/shared/` | Site footer          | `sections/footer.liquid` | **Critical** | ⏸️     |

### 3. UI Component Library (47 total)

Reusable UI components from `/src/components/ui/` - Based on shadcn/ui (Radix UI + Tailwind).

| Component             | Type               | Shopify Strategy     | Priority |
| --------------------- | ------------------ | -------------------- | -------- |
| `button.tsx`          | Interactive        | Liquid snippet + CSS | High     |
| `input.tsx`           | Form               | Liquid snippet       | High     |
| `card.tsx`            | Layout             | Liquid snippet       | High     |
| `badge.tsx`           | Display            | Liquid snippet       | Medium   |
| `alert.tsx`           | Feedback           | Liquid snippet       | Medium   |
| `dialog.tsx`          | Modal              | JS + Liquid snippet  | Medium   |
| `dropdown-menu.tsx`   | Navigation         | JS + Liquid snippet  | Medium   |
| `navigation-menu.tsx` | Navigation         | JS + Liquid snippet  | High     |
| `accordion.tsx`       | Interactive        | JS + Liquid snippet  | Medium   |
| `tabs.tsx`            | Interactive        | JS + Liquid snippet  | Medium   |
| `carousel.tsx`        | Interactive        | JS + Liquid snippet  | High     |
| `pagination.tsx`      | Navigation         | Liquid snippet       | High     |
| `breadcrumb.tsx`      | Navigation         | Liquid snippet       | Medium   |
| `table.tsx`           | Display            | Liquid snippet       | Low      |
| `form.tsx`            | Form               | Liquid snippet       | High     |
| `label.tsx`           | Form               | Liquid snippet       | High     |
| `checkbox.tsx`        | Form               | Liquid snippet       | Medium   |
| `radio-group.tsx`     | Form               | Liquid snippet       | Medium   |
| `select.tsx`          | Form               | Liquid snippet       | High     |
| `textarea.tsx`        | Form               | Liquid snippet       | Medium   |
| `switch.tsx`          | Form               | JS + Liquid snippet  | Low      |
| `slider.tsx`          | Form               | JS + Liquid snippet  | Low      |
| `progress.tsx`        | Feedback           | Liquid snippet       | Low      |
| `skeleton.tsx`        | Loading            | CSS only             | Low      |
| `avatar.tsx`          | Display            | Liquid snippet       | Low      |
| `separator.tsx`       | Layout             | CSS only             | Low      |
| `sheet.tsx`           | Modal              | JS + Liquid snippet  | Medium   |
| `drawer.tsx`          | Modal              | JS + Liquid snippet  | Medium   |
| `popover.tsx`         | Overlay            | JS + Liquid snippet  | Medium   |
| `hover-card.tsx`      | Overlay            | JS + Liquid snippet  | Low      |
| `tooltip.tsx`         | Overlay            | JS + Liquid snippet  | Medium   |
| `context-menu.tsx`    | Menu               | JS + Liquid snippet  | Low      |
| `menubar.tsx`         | Navigation         | JS + Liquid snippet  | Low      |
| `alert-dialog.tsx`    | Modal              | JS + Liquid snippet  | Medium   |
| `collapsible.tsx`     | Interactive        | JS + Liquid snippet  | Low      |
| `command.tsx`         | Search             | JS + Liquid snippet  | Low      |
| `toggle.tsx`          | Interactive        | JS + Liquid snippet  | Low      |
| `toggle-group.tsx`    | Interactive        | JS + Liquid snippet  | Low      |
| `scroll-area.tsx`     | Layout             | CSS + JS             | Low      |
| `sidebar.tsx`         | Layout             | JS + Liquid snippet  | Medium   |
| `aspect-ratio.tsx`    | Layout             | CSS only             | Medium   |
| `resizable.tsx`       | Layout             | JS + Liquid snippet  | Low      |
| `calendar.tsx`        | Date picker        | JS + Liquid snippet  | Low      |
| `input-otp.tsx`       | Form               | JS + Liquid snippet  | Low      |
| `chart.tsx`           | Visualization      | External library     | Low      |
| `sonner.tsx`          | Toast notification | JS library           | Medium   |
| `use-mobile.ts`       | Hook               | JS utility           | Medium   |
| `utils.ts`            | Utilities          | JS utility           | High     |

### 4. Figma Components (1 total)

| Component               | Path                     | Purpose             | Strategy       |
| ----------------------- | ------------------------ | ------------------- | -------------- | ------ |
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
2. ✅ Audit component dependencies and props
3. ✅ Convert Header component
4. ✅ Convert Footer component
5. ✅ Create core UI component library in Liquid
6. ✅ Customer Account page with Amazon-style Orders Tab
7. ⏸️ Convert main page templates

---

## Recent Updates

### January 12, 2026 - Header (Inner Pages) Component

- **Created:** `sections/header-inner.liquid` - Walmart-inspired header for all non-homepage templates
  - Skip-to-main-content accessibility link
  - Logo with image picker or text fallback
  - Full-width pill-shaped search bar (form submits to `/search`)
  - Account dropdown flyout with Orders, Settings, Sign Out links (for logged-in users)
  - Cart link with item count badge and total price
  - Mobile: hamburger menu toggle, search icon toggle, cart icon
  - Mobile menu drawer with configurable link_list navigation
  - Mobile account links section
  - Schema settings: logo, logo_text, search_placeholder, menu (link_list), show_account
- **Created:** `assets/section-header-inner.css` - Header inner styles (600+ lines)
  - Dark theme (`--color-dark` background, white text)
  - Sticky positioning with `--z-sticky`
  - Pill-shaped elements (`--radius-full`)
  - Account flyout with slide animation
  - Mobile search overlay with slide animation
  - Mobile menu drawer with backdrop and slide animation
  - Responsive breakpoints: mobile (< 768px), tablet (768-1023px), desktop (1024px+)
  - 44px minimum tap targets for accessibility
  - Focus-visible outlines using `--color-primary`
- **Modified:** `assets/component-scripts.js` - Added `initHeaderInner()` function
  - Mobile menu toggle with focus trap
  - Mobile search overlay toggle
  - Account dropdown with click and hover (desktop)
  - Close handlers for outside click and Escape key
  - Body overflow lock when mobile menu is open
- **Modified:** `layout/theme.liquid` - Conditional header rendering
  - Homepage uses `{% section 'header' %}`
  - All other pages use `{% section 'header-inner' %}`

### January 12, 2026 - Amazon-style Account Dashboard Refactor

- **Created:** `snippets/icon.liquid` - Centralized icon component with ~50 Feather-style SVG icons
  - Icons: menu, x, chevron-_, arrow-_, search, cart, heart, user, shield, package, map-pin, gift, mail, help-circle, plus, minus, check, clock, star, filter, calendar, phone, external-link, trash, edit, eye, log-out, lock, key, info, check-circle, etc.
  - Parameters: name, size (default 24), class, stroke_width (default 2), aria_label
- **Created:** `assets/component-icon.css` - Icon sizing utilities (.icon--xs through .icon--3xl), color modifiers, spin animation
- **Created:** `snippets/account-nav-card.liquid` - Amazon-style clickable navigation card
  - Parameters: icon, title, description, url, disabled, badge_text
  - Renders as `<a>` or `<div>` based on disabled state
- **Created:** `assets/component-account-nav-card.css` - Card styling with icon left layout, hover effects, responsive
- **Created:** `templates/customers/orders.liquid` - Template for order history page
- **Created:** `sections/customer-orders.liquid` - Full Amazon-style orders section
  - Breadcrumbs, search form, 4-tab navigation (Orders, Buy Again, Not Yet Shipped, Digital Orders)
  - Time filter, order cards with product images, status badges, "Buy it again" buttons
  - Pagination, JavaScript for tab switching/search/filtering
- **Created:** `assets/section-customer-orders.css` - Orders page styles
- **Created:** `templates/customers/settings.liquid` - Template for settings page
- **Created:** `sections/customer-settings.liquid` - Login & Security settings section
  - Personal info display, password reset link, account activity, sign out
- **Created:** `assets/section-customer-settings.css` - Settings page styles
- **Created:** `assets/section-customer-dashboard.css` - Dashboard grid styles
- **Modified:** `sections/customer-account.liquid` - Simplified to dashboard-only with card grid navigation
  - 7 cards: Orders, Login & Security, Addresses, Contact Us, Gift Cards (Coming Soon), Lists (Coming Soon), Messages (Coming Soon)
- **Modified:** `layout/theme.liquid` - Added CSS imports for icon and account-nav-card components
- **Backup:** Old `customer-account.liquid` preserved as `customer-account-old.liquid`

### January 12, 2026 - Orders Tab Enhancement

- **Modified:** `sections/customer-account.liquid` - Added Amazon-style Orders tab with:
  - Breadcrumb navigation
  - Search functionality (by order number or product name)
  - Tab navigation: Orders, Buy Again, Not Yet Shipped, Digital Orders
  - Time period filter dropdown (30 days, 3 months, 6 months, 1 year, all time)
  - Order cards with status badges, item details, and action buttons
  - Buy Again grid with deduplicated products from order history
  - Not Yet Shipped filter (orders with `fulfillment_status != 'fulfilled'`)
  - Digital Orders filter (products with `digital` tag)
- **Modified:** `assets/section-customer-account.css` - Added `.orders-tab__*` BEM styles
- **Modified:** `assets/component-scripts.js` - Added `initOrdersTab()` function with:
  - Tab switching with ARIA support
  - Keyboard navigation (arrow keys, Home, End)
  - Search with debouncing
  - Time period filtering

### January 12, 2026 - Navigation Updates

- **Modified:** `locales/en.default.json` - Changed "Track Order" to "Orders"
- **Modified:** `sections/header.liquid` - Updated settings labels for "Orders" link

### January 12, 2026 - Product Page Cleanup

- **Modified:** `templates/product.liquid` - Removed "View all item details" link
- **Modified:** `assets/template-product.css` - Removed `.pdp-section__link` styles

---

_Last updated: 2026-01-12_
