# Template Migration Documentation

## Overview
This document tracks the conversion of React page components to Shopify Liquid templates and sections. Templates represent different page types in Shopify (product, collection, page, etc.).

## Completed Templates

### 1. Collection Template (Products Listing)
**Status:** ✅ Complete  
**Files:**
- `theme/templates/collection.liquid`
- `theme/assets/template-collection.css`
- `theme/snippets/collection-hero.liquid`
- `theme/snippets/product-card.liquid`

**Features:**
- Responsive product grid/list view toggle
- Advanced filtering system:
  - Price range filter
  - Category/tag filters
  - Availability filters (in stock, on sale)
  - Brand/vendor filters
- Active filters display with clear options
- Sort functionality (featured, best-selling, price, A-Z, newest)
- Mobile-responsive filter sidebar
- Pagination support (24 products per page)
- Empty state handling
- Collection hero with image support
- Product cards with:
  - Quick view button
  - Sale badges
  - Vendor display
  - Rating/reviews
  - Multiple images
  - Add to cart

**Shopify Objects Used:**
- `collection.products`
- `collection.all_tags`
- `collection.all_vendors`
- `collection.current_tags`
- `paginate`

**Usage:**
Automatically used for `/collections/*` URLs. Customizable per collection in theme editor.

---

### 2. Product Template (Product Detail Page)
**Status:** ✅ Complete  
**Files:**
- `theme/templates/product.liquid`
- `theme/assets/template-product.css`

**Features:**
- Product image gallery:
  - Main featured image
  - Thumbnail navigation (up to 5 images)
  - Image zoom on click
  - Badge display (sale, new, sold out)
- Product information:
  - Vendor name
  - Product title
  - Star rating and review count
  - Price (sale/regular/compare)
  - Description
- Variant selection:
  - Color swatches
  - Size buttons
  - Radio group layouts
  - Dynamic selected value display
- Quantity selector
- Add to cart with availability checking
- Wishlist button
- Feature highlights (shipping, returns, payment)
- Breadcrumb navigation
- Information tabs:
  - Product details
  - Shipping info
  - Customer reviews
- Related products (recommendations)

**Shopify Objects Used:**
- `product`
- `product.variants`
- `product.options_with_values`
- `product.images`
- `product.metafields`
- `recommendations.products`

**Usage:**
Automatically used for `/products/*` URLs. Single template for all products.

---

## Supporting Snippets

### collection-hero.liquid
Displays collection header with optional image background, title, and description. Responsive with overlay text support.

### product-card.liquid
Reusable product card component used in collection template and related products. Supports both grid and list view layouts.

**Features:**
- Product image with hover effect
- Sale/new/sold out badges
- Quick view button (optional)
- Vendor display (optional)
- Product title (2-line clamp)
- Price display (sale/regular/compare)
- Star rating
- Add to cart button (list view)
- Lazy loading support

---

## Template Architecture

### Collection Template Flow:
1. Hero section with collection info
2. Filters sidebar (sticky on desktop, drawer on mobile)
3. Toolbar with sort, view toggle, filter button
4. Products grid (responsive, 1-4 columns)
5. Pagination

### Product Template Flow:
1. Breadcrumbs
2. Two-column layout (gallery + info)
3. Gallery with thumbnails
4. Product form with variants
5. Information tabs
6. Related products section

---

## Responsive Breakpoints

- **Desktop:** 1024px+ (2-column product layout, visible filters)
- **Tablet:** 768px-1024px (1-column product, drawer filters)
- **Mobile:** <768px (stacked layout, 2-column grid)

---

## Shopify Features Used

### Pagination
```liquid
{% paginate collection.products by 24 %}
  <!-- products -->
{% endpaginate %}
```

### Filtering
- Tag-based filtering
- Vendor filtering
- Availability filtering (requires custom logic)

### Variant Selection
- `product.options_with_values` for option names/values
- Dynamic variant ID based on selection
- JavaScript for variant switching

### Product Recommendations
- `recommendations.products` for related items
- Limit to 4 products

---

## JavaScript Functionality

### Collection Template:
- Filter sidebar toggle (mobile)
- View mode toggle (grid/list)
- Sort dropdown change handler

### Product Template:
- Image gallery thumbnail switching
- Tab switching
- Variant selection (requires variant.js)
- Add to cart form handling

---

## CSS Architecture

All template styles use BEM methodology:
- `.collection-page` / `.product-page` - Page container
- `.collection-filters` - Filter sidebar
- `.product-gallery` - Image gallery
- `.product-info` - Product information section

Responsive design with mobile-first approach and CSS Grid for layouts.

---

### 4. Cart Template (`cart.liquid`)
**Purpose**: Full-page shopping cart with line item management

**Key Features**:
- Line item display with images, variants, properties
- Quantity adjustment with +/- buttons
- Remove item functionality
- Real-time quantity updates via AJAX
- Order summary with subtotal, discounts, total
- Cart note textarea with auto-save
- Discount code display
- Trust badges (secure checkout, free shipping)
- Empty state with CTA
- Mobile-responsive layout

**Shopify Objects Used**:
- `cart.items` - All cart line items
- `cart.item_count` - Total item count
- `cart.total_price` - Cart total
- `cart.original_total_price` - Pre-discount total
- `cart.cart_level_discount_applications` - Applied discounts
- `item.line_level_discount_allocations` - Line-level discounts
- `routes.cart_url` - Cart form action

**JavaScript Functionality**:
- `updateQuantity(line, quantity)` - AJAX cart updates via `/cart/change.js`
- Auto-save cart note with 1s debounce

**Styling**: `template-cart.css` (400+ lines)
- Two-column layout (items + summary)
- Sticky order summary
- Grid-based cart items
- Responsive: stacks to single column on mobile

**Testing**:
- [ ] Add/remove items
- [ ] Quantity updates work
- [ ] Discounts display correctly
- [ ] Cart note saves automatically
- [ ] Empty state displays
- [ ] Checkout button works
- [ ] Mobile layout responsive

---

## Testing Checklist

### Collection Template:
- [ ] Products display correctly in grid view
- [ ] Products display correctly in list view
- [ ] Filters work (tags, vendor, price)
- [ ] Active filters display and clear
- [ ] Sort changes URL and reloads
- [ ] Pagination works
- [ ] Mobile filter drawer opens/closes
- [ ] Empty state displays when no products
- [ ] Quick view button functional (requires implementation)
- [ ] Product card links to detail page

### Product Template:
- [ ] Images display and thumbnails switch main image
- [ ] Variants can be selected
- [ ] Price updates with variant selection
- [ ] Add to cart submits correct variant
- [ ] Sold out state prevents purchase
- [ ] Tabs switch content
- [ ] Breadcrumbs link correctly
- [ ] Related products display
- [ ] Responsive on all devices
- [ ] Rating/reviews display (if metafields exist)

---

## Next Steps

**Priority Pages:**
1. Home page (convert to multiple sections)
2. Cart page/drawer
3. Account page
4. Search page

**Enhancement Opportunities:**
- Add product filtering by price with AJAX
- Implement quick view modal
- Add variant image switching
- Enhanced variant selection with sold-out indicators
- Infinite scroll pagination option
- Product comparison feature
