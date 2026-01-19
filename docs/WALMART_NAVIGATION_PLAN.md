# Walmart-Style Navigation Implementation Plan

**Project:** Hy-lee Shopify Theme Enhancement  
**Date:** January 18, 2026  
**Status:** Planning Phase

---

## Executive Summary

This plan outlines the complete implementation strategy for building a Walmart-style multi-level category navigation system, establishing URL query parameter-based hierarchy, integrating Material Design Lite for modern styling, and implementing fragment caching for optimal performance. The system will support L1 → L2 → L3 category hierarchies with proper breadcrumb trails while maintaining clean, SEO-friendly URLs.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Goals & Requirements](#goals--requirements)
3. [Technical Architecture](#technical-architecture)
4. [Shopify Platform Constraints](#shopify-platform-constraints)
5. [Implementation Phases](#implementation-phases)
6. [Design System Integration](#design-system-integration)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)
9. [Rollout Plan](#rollout-plan)

---

## Current State Analysis

### Existing Implementation

**Navigation System:**

- ✅ Two-level mega menu (L1 → L2) implemented in `theme/sections/header.liquid`
- ✅ Metafield-based hierarchy: `category_level` and `parent_category`
- ✅ Hover-based flyout menus with JavaScript
- ✅ Mobile-responsive design
- ✅ ARIA accessibility attributes

**URL Structure:**

- ❌ Flat collection URLs: `/collections/{handle}`
- ❌ No nested path support (Shopify limitation)
- ❌ No hierarchy encoding in URLs

**Breadcrumb System:**

- ✅ Basic breadcrumb component in `theme/snippets/breadcrumb.liquid`
- ✅ Product category ancestor support
- ❌ Does not read custom metafield hierarchy chain
- ❌ No L1 → L2 → L3 trail construction

**Design System:**

- ✅ CSS variables in `theme/assets/theme-variables.css`
- ✅ Component library in `theme/snippets/`
- ✅ BEM naming convention
- ⚠️ Current style derives from Amazon-like patterns
- ⚠️ Green/teal color palette (#2ac864, #2699a6)
- ⚠️ Assistant font family

**Metafield Structure:**

```liquid
metafields.custom.category_level = "L1" | "L2" | "L3"
metafields.custom.parent_category = "{parent-handle}"
metafields.custom.icon = "emoji-character"
```

### Gap Analysis

**Missing Features:**

1. L3 subcategory navigation in mega menu
2. Category landing pages with subcategory tiles
3. URL query parameter hierarchy encoding
4. Recursive breadcrumb trail builder
5. Fragment caching for navigation
6. Material Design styling system
7. Modular font configuration
8. Child collection caching metafield

---

## Goals & Requirements

### Primary Objectives

1. **Multi-Level Navigation**
   - Support L1 → L2 → L3 category hierarchy
   - Walmart-style mega menu with flyout panels
   - Smooth hover interactions with Material Design transitions
   - Mobile-responsive drawer navigation

2. **URL Hierarchy System**
   - Query parameter format: `/collections/{handle}?path=parent1/parent2`
   - Preserve hierarchy across navigation
   - SEO-friendly primary URLs
   - Backwards compatible with existing links

3. **Breadcrumb Enhancement**
   - Automatic L1 → L2 → L3 trail construction
   - Read from `?path=` query parameters
   - Fallback to recursive metafield traversal
   - Schema.org markup for SEO

4. **Category Landing Pages**
   - Conditional display: subcategory tiles vs. product grids
   - Material Design card-based layout
   - Product count badges
   - Visual category imagery

5. **Design System Modernization**
   - Material Design Lite integration (free)
   - Roboto font family (modular configuration)
   - New brand color palette (distinct from Amazon)
   - Elevation system (8 levels)
   - 8dp spacing grid

6. **Performance Optimization**
   - Fragment caching for navigation (Shopify Plus)
   - Metafield caching for child collections
   - Lazy loading for subcategory menus
   - Optimized collection queries

---

## Technical Architecture

### URL Structure Design

**Format:**

```
/collections/{collection-handle}?path={ancestor-path}
```

**Examples:**

```
/collections/smartphones?path=electronics/phones
/collections/food-processors?path=kitchen/food-prep
/collections/yoga-mats?path=sports/fitness/equipment
```

**Benefits:**

- Clean primary URL for SEO
- Hierarchy encoded in query string
- Easy to parse and construct
- Preserves filtering/sorting parameters

**URL Builder Pattern:**

```liquid
{%- capture hierarchy_url -%}
  {{ collection.url }}
  {%- if path_param %}?path={{ path_param }}{%- endif -%}
{%- endcapture -%}
```

### Metafield Schema

**Existing Metafields:**

```json
{
  "namespace": "custom",
  "key": "category_level",
  "type": "single_line_text_field",
  "value": "L1" | "L2" | "L3"
}
```

```json
{
  "namespace": "custom",
  "key": "parent_category",
  "type": "single_line_text_field",
  "value": "parent-collection-handle"
}
```

**New Metafields (To Be Added):**

```json
{
  "namespace": "custom",
  "key": "child_collections",
  "type": "single_line_text_field",
  "value": "child1-handle,child2-handle,child3-handle",
  "description": "Comma-separated list of child collection handles for fast lookup"
}
```

```json
{
  "namespace": "custom",
  "key": "breadcrumb_path",
  "type": "single_line_text_field",
  "value": "Electronics > Phones > Smartphones",
  "description": "Pre-computed breadcrumb trail for performance"
}
```

```json
{
  "namespace": "custom",
  "key": "hierarchy_path",
  "type": "single_line_text_field",
  "value": "electronics/phones",
  "description": "URL path parameter value for this collection"
}
```

### Navigation Tree Structure

```
L1: Electronics (handle: electronics)
├── L2: Phones (handle: phones, parent: electronics)
│   ├── L3: Smartphones (handle: smartphones, parent: phones)
│   ├── L3: Feature Phones (handle: feature-phones, parent: phones)
│   └── L3: Phone Accessories (handle: phone-accessories, parent: phones)
├── L2: Computers (handle: computers, parent: electronics)
│   ├── L3: Laptops (handle: laptops, parent: computers)
│   └── L3: Desktops (handle: desktops, parent: computers)
└── L2: TVs (handle: tvs, parent: electronics)

L1: Kitchen (handle: kitchen)
├── L2: Food Prep (handle: food-prep, parent: kitchen)
│   ├── L3: Food Processors (handle: food-processors, parent: food-prep)
│   └── L3: Blenders (handle: blenders, parent: food-prep)
└── L2: Cookware (handle: cookware, parent: kitchen)
```

### Fragment Caching Strategy

**Navigation Cache:**

```liquid
{% cache 'nav-menu-l1-l2-l3', expires_in: 3600 %}
  {%- assign l1_categories = collections | where: "metafields.custom.category_level", "L1" -%}
  {%- for l1 in l1_categories -%}
    <!-- Render L1 → L2 → L3 tree -->
  {%- endfor -%}
{% endcache %}
```

**Cache Keys:**

- Navigation: `nav-menu-l1-l2-l3`
- Category tiles: `category-tiles-{{ collection.handle }}`
- Breadcrumb: `breadcrumb-{{ collection.handle }}`

**Cache Invalidation:**

- Automatic expiration: 1 hour (3600 seconds)
- Manual invalidation on collection updates
- Clear cache on metafield changes

**Fallback for Non-Plus Stores:**

- Use `metafields.custom.child_collections` for O(1) lookups
- Pre-compute and cache in metafields
- Update via admin scripts when hierarchy changes

---

## Shopify Platform Constraints

### What Shopify Does NOT Support

1. **Nested Collection URLs**
   - ❌ Cannot create: `/collections/electronics/phones/smartphones`
   - ❌ All collections are siblings in URL structure
   - ✅ Workaround: Query parameters (`?path=electronics/phones`)

2. **Automatic Category Hierarchies**
   - ❌ No built-in parent-child collection relationships
   - ❌ Must implement via metafields
   - ✅ Workaround: Custom metafield system

3. **Fragment Caching on Standard Plans**
   - ❌ `{% cache %}` tag requires Shopify Plus
   - ✅ Workaround: Metafield-based caching for all plans

4. **Collections Within Collections**
   - ❌ Cannot nest collections structurally
   - ❌ All collections query all products globally
   - ✅ Workaround: Visual hierarchy via navigation

### What We CAN Implement

1. ✅ Visual multi-level navigation (CSS + JavaScript)
2. ✅ Query parameter-based hierarchy encoding
3. ✅ Metafield-driven parent-child relationships
4. ✅ Conditional collection templates (tiles vs. products)
5. ✅ Recursive breadcrumb trail construction
6. ✅ Material Design CSS styling
7. ✅ Performance optimization via caching strategies
8. ✅ SEO-friendly structured data (schema.org breadcrumbs)

---

## Implementation Phases

### Phase 1: Design System Foundation (Week 1)

**Objective:** Integrate Material Design Lite and establish new design tokens

**Tasks:**

1. **Material Design Lite Integration** (4 hours)
   - [ ] Add MDL CSS CDN to `theme/layout/theme.liquid`
   - [ ] Cherry-pick components: cards, buttons, grids, typography
   - [ ] Test compatibility with existing components
   - [ ] Document MDL components in use

2. **Typography System** (3 hours)
   - [ ] Add Roboto font from Google Fonts CDN
   - [ ] Create modular font variables in `theme-variables.css`
   - [ ] Define font weight scale (300, 400, 500, 700)
   - [ ] Update all heading and body font references
   - [ ] Create font swap documentation

3. **Color Palette Redesign** (4 hours)
   - [ ] Define Material Design color palette
   - [ ] Primary color selection (distinct from Amazon green)
   - [ ] Accent and error color definitions
   - [ ] Update all color variables in `theme-variables.css`
   - [ ] Create color contrast audit checklist

4. **Spacing & Elevation System** (3 hours)
   - [ ] Implement 8dp spacing grid
   - [ ] Define 8 elevation levels (0-24dp)
   - [ ] Convert existing spacing to new scale
   - [ ] Document elevation usage patterns

**Files to Create/Modify:**

- `theme/layout/theme.liquid` - Add MDL CSS link
- `theme/assets/theme-variables.css` - New design tokens
- `docs/DESIGN_SYSTEM.md` - Complete design documentation

**Deliverables:**

- Material Design Lite integrated
- Roboto font loaded with modular config
- New color palette applied
- Design system documentation complete

---

### Phase 2: URL Hierarchy System (Week 2)

**Objective:** Implement query parameter-based hierarchy encoding

**Tasks:**

1. **URL Builder Utility** (3 hours)
   - [ ] Create `snippets/hierarchy-url-builder.liquid`
   - [ ] Implement path parameter construction
   - [ ] Handle encoding special characters
   - [ ] Support multiple ancestor levels

2. **JavaScript URL Manager** (4 hours)
   - [ ] Add URL helper functions to `component-scripts.js`
   - [ ] Preserve `?path=` during sort/filter operations
   - [ ] Parse path parameters for breadcrumb
   - [ ] Handle browser back/forward navigation

3. **Link Updates Throughout Theme** (6 hours)
   - [ ] Update header navigation links
   - [ ] Update category tile links
   - [ ] Update product card collection links
   - [ ] Update breadcrumb links
   - [ ] Update footer collection links

4. **Testing & Validation** (3 hours)
   - [ ] Test path preservation across navigation
   - [ ] Validate URL encoding/decoding
   - [ ] Test with special characters in handles
   - [ ] Cross-browser compatibility testing

**Files to Create/Modify:**

- `theme/snippets/hierarchy-url-builder.liquid` - New utility
- `theme/assets/component-scripts.js` - URL helpers
- `theme/sections/header.liquid` - Updated links
- `theme/snippets/category-tile.liquid` - New component
- Various collection/navigation files - Link updates

**Deliverables:**

- URL hierarchy system functional
- Path parameters preserved across navigation
- All collection links updated
- JavaScript helpers documented

---

### Phase 3: Three-Level Navigation Menu (Week 3)

**Objective:** Extend mega menu to support L1 → L2 → L3 with fragment caching

**Tasks:**

1. **Metafield Setup** (2 hours)
   - [ ] Create `child_collections` metafield definition
   - [ ] Document metafield population process
   - [ ] Create admin script for batch updates
   - [ ] Test metafield queries

2. **L3 Navigation Implementation** (8 hours)
   - [ ] Extend header.liquid with L3 logic
   - [ ] Query L3 collections via `child_collections` metafield
   - [ ] Build third-level flyout panel HTML
   - [ ] Apply Material Design card styling
   - [ ] Implement hover interactions

3. **Fragment Caching Integration** (4 hours)
   - [ ] Wrap navigation in `{% cache %}` tags
   - [ ] Define cache keys and expiration
   - [ ] Test cache invalidation
   - [ ] Add fallback for non-Plus stores
   - [ ] Document caching strategy

4. **Mobile Navigation** (6 hours)
   - [ ] Extend mobile drawer for L3 categories
   - [ ] Implement accordion expansion for subcategories
   - [ ] Add touch-friendly interactions
   - [ ] Test on mobile devices
   - [ ] Optimize animation performance

5. **Styling & Polish** (4 hours)
   - [ ] Apply Material Design elevation
   - [ ] Smooth transitions (200ms cubic-bezier)
   - [ ] Hover states with elevation changes
   - [ ] Loading states for dynamic content
   - [ ] Accessibility enhancements (keyboard nav)

**Files to Create/Modify:**

- `theme/sections/header.liquid` - L3 navigation
- `theme/assets/section-header.css` - Updated styles
- `theme/assets/component-scripts.js` - L3 interactions
- `docs/CATEGORY_HIERARCHY_SETUP.md` - Metafield guide

**Deliverables:**

- Three-level navigation functional
- Fragment caching implemented
- Mobile drawer supports L3
- Performance optimized

---

### Phase 4: Enhanced Breadcrumb System (Week 4)

**Objective:** Build recursive breadcrumb with path parameter decoding

**Tasks:**

1. **Path Parameter Parser** (3 hours)
   - [ ] Read `?path=` from URL in breadcrumb.liquid
   - [ ] Split path into segments
   - [ ] Build breadcrumb items from segments
   - [ ] Link each segment to proper collection

2. **Recursive Metafield Traversal** (4 hours)
   - [ ] Implement fallback for direct navigation (no path param)
   - [ ] Traverse `parent_category` chain recursively
   - [ ] Build L1 → L2 → L3 trail
   - [ ] Cache result in `breadcrumb_path` metafield

3. **Breadcrumb Caching** (3 hours)
   - [ ] Check `metafields.custom.breadcrumb_path` first
   - [ ] Use cached value if available
   - [ ] Compute on-the-fly if missing
   - [ ] Fragment cache entire breadcrumb component

4. **Material Design Styling** (2 hours)
   - [ ] Apply Material typography
   - [ ] Use chevron separator (›)
   - [ ] Interactive hover states
   - [ ] Mobile-responsive sizing

5. **Schema.org Integration** (2 hours)
   - [ ] Structured data for full path
   - [ ] BreadcrumbList markup
   - [ ] Test with Google Rich Results Test
   - [ ] Validate SEO compliance

**Files to Create/Modify:**

- `theme/snippets/breadcrumb.liquid` - Enhanced logic
- `theme/assets/component-breadcrumb.css` - Material styles
- `docs/CATEGORY_HIERARCHY_SETUP.md` - Breadcrumb documentation

**Deliverables:**

- Breadcrumb reads path parameters
- Recursive fallback implemented
- Caching strategy working
- SEO optimized with schema.org

---

### Phase 5: Category Landing Pages (Week 5-6)

**Objective:** Create conditional templates showing subcategory tiles or products

**Tasks:**

1. **Category Detection Logic** (3 hours)
   - [ ] Read `metafields.custom.category_level`
   - [ ] Query child collections via `child_collections` metafield
   - [ ] Determine if collection has children
   - [ ] Route to appropriate display mode

2. **Category Tile Component** (6 hours)
   - [ ] Create `snippets/category-tile.liquid`
   - [ ] Material Design card structure
   - [ ] Image with 16:9 aspect ratio
   - [ ] Title, product count, description
   - [ ] Navigation chevron
   - [ ] Hover effects (elevation 2 → 4)

3. **Category Landing Section** (8 hours)
   - [ ] Create `sections/main-category-landing.liquid`
   - [ ] Subcategory grid layout (responsive)
   - [ ] Fragment cache subcategory queries
   - [ ] Empty state handling
   - [ ] Loading skeleton states

4. **Collection Template Variant** (4 hours)
   - [ ] Create `templates/collection.category-landing.json`
   - [ ] Configure section blocks
   - [ ] Set up schema settings
   - [ ] Document template assignment process

5. **Conditional Display Logic** (4 hours)
   - [ ] If L1 or L2 with children: show tiles
   - [ ] If L3 or childless L2: show products
   - [ ] Preserve path parameters in all links
   - [ ] Handle edge cases (empty categories)

6. **Styling & Responsiveness** (4 hours)
   - [ ] Material Design card grid
   - [ ] Responsive breakpoints (1-4 columns)
   - [ ] Touch-friendly tile sizing (min 44x44px)
   - [ ] Smooth transitions on interactions

**Files to Create:**

- `theme/templates/collection.category-landing.json`
- `theme/sections/main-category-landing.liquid`
- `theme/snippets/category-tile.liquid`
- `theme/assets/component-category-tile.css`
- `theme/assets/section-category-landing.css`

**Files to Modify:**

- `theme/layout/theme.liquid` - Add new CSS imports
- `docs/COMPONENT_INVENTORY.md` - Document new components

**Deliverables:**

- Category landing page template functional
- Category tile component styled with Material Design
- Conditional display logic working
- Responsive on all devices

---

### Phase 6: Component Library Refactor (Week 7-8)

**Objective:** Modernize all components with Material Design patterns

**Tasks:**

1. **Component Audit** (4 hours)
   - [ ] List all components in `theme/snippets/`
   - [ ] List all component styles in `theme/assets/`
   - [ ] Identify Amazon-derivative patterns
   - [ ] Prioritize components by usage frequency

2. **Button Components** (6 hours)
   - [ ] Material raised button (elevation 2)
   - [ ] Material flat button (no elevation)
   - [ ] Material outlined button (border only)
   - [ ] Ripple effect on click
   - [ ] Update all button instances

3. **Card Components** (6 hours)
   - [ ] Product cards with Material elevation
   - [ ] Category cards (already done in Phase 5)
   - [ ] Info cards throughout site
   - [ ] Consistent elevation and spacing

4. **Form Components** (8 hours)
   - [ ] Material text inputs (underline style)
   - [ ] Material select dropdowns
   - [ ] Material checkboxes/radios
   - [ ] Material text areas
   - [ ] Floating labels
   - [ ] Error states and validation

5. **Navigation Components** (4 hours)
   - [ ] Material tabs component
   - [ ] Material pagination
   - [ ] Material breadcrumb (already done in Phase 4)
   - [ ] Material badges and chips

6. **Modal & Overlay Components** (6 hours)
   - [ ] Material dialog/modal
   - [ ] Material snackbar (toast notifications)
   - [ ] Material tooltips
   - [ ] Overlay backdrop with proper z-index

7. **Layout Components** (4 hours)
   - [ ] Material grid system (12 columns)
   - [ ] Material app bar (header)
   - [ ] Material cards container
   - [ ] Spacing utilities (8dp grid)

8. **Global Style Updates** (6 hours)
   - [ ] Update base.css with Material styles
   - [ ] Remove old Amazon-style patterns
   - [ ] Apply new color palette globally
   - [ ] Update all shadow values
   - [ ] Apply 8dp spacing consistently

**Files to Modify:**

- All files in `theme/snippets/` (20+ files)
- All files in `theme/assets/component-*.css` (20+ files)
- `theme/assets/base.css`
- `theme/assets/theme-variables.css`

**Deliverables:**

- All components follow Material Design
- Consistent styling across entire theme
- No Amazon-derivative patterns remaining
- Component library documented

---

### Phase 7: Documentation & Testing (Week 9)

**Objective:** Complete documentation and comprehensive testing

**Tasks:**

1. **Design System Documentation** (6 hours)
   - [ ] Create `docs/DESIGN_SYSTEM.md`
   - [ ] Document color palette with swatches
   - [ ] Typography scale and usage
   - [ ] Elevation system examples
   - [ ] Spacing grid guidelines
   - [ ] Component patterns
   - [ ] Font swapping instructions

2. **Category Hierarchy Setup Guide** (4 hours)
   - [ ] Create `docs/CATEGORY_HIERARCHY_SETUP.md`
   - [ ] Metafield definitions and setup
   - [ ] Collection configuration workflow
   - [ ] URL path parameter format
   - [ ] Caching strategy documentation
   - [ ] Troubleshooting common issues
   - [ ] Admin scripts for bulk updates

3. **Component Library Updates** (3 hours)
   - [ ] Update `docs/COMPONENT_INVENTORY.md`
   - [ ] Document new category-tile component
   - [ ] Document Material Design patterns
   - [ ] Add usage examples for each component

4. **Developer Guidelines** (2 hours)
   - [ ] Update `docs/DEVELOPMENT_GUIDELINES.md`
   - [ ] Material Design code standards
   - [ ] Metafield naming conventions
   - [ ] Caching best practices

5. **Unit Testing** (8 hours)
   - [ ] Test URL builder utility
   - [ ] Test breadcrumb logic (with/without path params)
   - [ ] Test category detection logic
   - [ ] Test metafield queries
   - [ ] Test caching mechanisms

6. **Integration Testing** (8 hours)
   - [ ] Test full navigation flow (L1 → L2 → L3)
   - [ ] Test category landing pages
   - [ ] Test breadcrumb across all page types
   - [ ] Test with various hierarchy depths
   - [ ] Test with missing metafields (graceful degradation)

7. **E2E Testing** (8 hours)
   - [ ] Playwright tests for navigation
   - [ ] Category landing page tests
   - [ ] Breadcrumb navigation tests
   - [ ] Mobile navigation tests
   - [ ] Performance benchmarks

8. **Browser Compatibility** (4 hours)
   - [ ] Test on Chrome, Firefox, Safari, Edge
   - [ ] Test on iOS Safari, Android Chrome
   - [ ] Test on various screen sizes
   - [ ] Validate accessibility (WCAG AA)

**Files to Create:**

- `docs/DESIGN_SYSTEM.md`
- `docs/CATEGORY_HIERARCHY_SETUP.md`
- `tests/components/url-builder.test.js`
- `tests/components/breadcrumb.test.js`
- `tests/e2e/category-navigation.spec.ts`

**Files to Update:**

- `docs/COMPONENT_INVENTORY.md`
- `docs/DEVELOPMENT_GUIDELINES.md`
- `tests/README.md`

**Deliverables:**

- Complete design system documentation
- Category hierarchy setup guide
- Comprehensive test coverage
- Browser compatibility validated

---

## Design System Integration

### Material Design Lite

**CDN Integration:**

```html
<!-- In theme/layout/theme.liquid -->
<link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.min.css" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
```

**Cherry-Picked Components:**

- Cards (elevation-2, elevation-4, elevation-8)
- Buttons (raised, flat, outlined)
- Grid system (responsive 12-column)
- Typography scale
- Material Icons (optional enhancement)

**Custom Overrides:**

```css
/* Override MDL with brand colors */
.mdl-button--colored {
  background-color: var(--color-primary);
}

.mdl-card {
  border-radius: var(--radius);
}
```

### Typography System

**Font Loading:**

```html
<!-- Google Fonts CDN -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

**Modular Font Configuration:**

```css
/* theme/assets/theme-variables.css */
:root {
  /* Font Families - Change these to swap fonts globally */
  --font-primary: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Roboto Mono', ui-monospace, 'Cascadia Code', monospace;

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Typography Scale (Material Design) */
  --text-caption: 0.75rem; /* 12px */
  --text-body-2: 0.875rem; /* 14px */
  --text-body-1: 1rem; /* 16px */
  --text-subtitle-2: 0.875rem; /* 14px medium */
  --text-subtitle-1: 1rem; /* 16px medium */
  --text-h6: 1.25rem; /* 20px */
  --text-h5: 1.5rem; /* 24px */
  --text-h4: 2.125rem; /* 34px */
  --text-h3: 3rem; /* 48px */
  --text-h2: 3.75rem; /* 60px */
  --text-h1: 6rem; /* 96px */
}

body {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-regular);
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-display);
  font-weight: var(--font-weight-medium);
}
```

**Font Swapping Instructions:**

```markdown
To change fonts:

1. Update Google Fonts link in theme.liquid
2. Change only these variables in theme-variables.css:
   - --font-primary
   - --font-display
   - --font-mono
3. All components will automatically use new fonts
```

### Color Palette

**Material Design Colors:**

```css
:root {
  /* Primary Color - Teal */
  --color-primary-50: #e0f2f1;
  --color-primary-100: #b2dfdb;
  --color-primary-200: #80cbc4;
  --color-primary-300: #4db6ac;
  --color-primary-400: #26a69a;
  --color-primary-500: #009688; /* Main primary */
  --color-primary-600: #00897b;
  --color-primary-700: #00796b;
  --color-primary-800: #00695c;
  --color-primary-900: #004d40;

  /* Accent Color - Amber */
  --color-accent-100: #ffe082;
  --color-accent-200: #ffd54f;
  --color-accent-400: #ffca28; /* Main accent */
  --color-accent-700: #ffa000;
  --color-accent-a200: #ffd740;
  --color-accent-a400: #ffc400;

  /* Error/Warning/Success */
  --color-error: #f44336;
  --color-warning: #ff9800;
  --color-success: #4caf50;

  /* Neutral/Gray Scale */
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #eeeeee;
  --color-gray-300: #e0e0e0;
  --color-gray-400: #bdbdbd;
  --color-gray-500: #9e9e9e;
  --color-gray-600: #757575;
  --color-gray-700: #616161;
  --color-gray-800: #424242;
  --color-gray-900: #212121;

  /* Semantic Colors */
  --color-background: #ffffff;
  --color-surface: var(--color-gray-50);
  --color-border: var(--color-gray-300);
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-disabled: var(--color-gray-400);
}
```

**Distinct from Amazon:**

- Amazon: Green (#00A651), Orange (#FF9900)
- Our palette: Teal (#009688), Amber (#FFC400)
- Professional, modern, trust-building colors
- Strong contrast for accessibility

### Elevation System

**8 Levels (0-24dp):**

```css
:root {
  /* Material Design Elevation */
  --elevation-0: none;
  --elevation-1: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --elevation-2: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  --elevation-3: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
  --elevation-4: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  --elevation-5: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
  --elevation-6: 0 24px 48px rgba(0, 0, 0, 0.3), 0 20px 16px rgba(0, 0, 0, 0.22);
}
```

**Usage Guidelines:**

- Level 0: Flat elements (no shadow)
- Level 1: Search bars, cards at rest
- Level 2: Raised buttons, cards on hover
- Level 3: Dropdowns, menus
- Level 4: Dialogs, pickers
- Level 5: Navigation drawer
- Level 6: Modals (rare)

### Spacing System (8dp Grid)

**Base Unit: 8px**

```css
:root {
  /* 8dp Spacing Scale */
  --spacing-0: 0;
  --spacing-1: 0.5rem; /* 8px */
  --spacing-2: 1rem; /* 16px */
  --spacing-3: 1.5rem; /* 24px */
  --spacing-4: 2rem; /* 32px */
  --spacing-5: 2.5rem; /* 40px */
  --spacing-6: 3rem; /* 48px */
  --spacing-7: 3.5rem; /* 56px */
  --spacing-8: 4rem; /* 64px */
  --spacing-9: 4.5rem; /* 72px */
  --spacing-10: 5rem; /* 80px */

  /* Component-specific spacing */
  --spacing-component-padding: var(--spacing-2);
  --spacing-section-padding: var(--spacing-6);
  --spacing-grid-gap: var(--spacing-3);
}
```

---

## Performance Optimization

### Fragment Caching (Shopify Plus)

**Navigation Cache:**

```liquid
{% comment %}
  Cache entire navigation tree for 1 hour
  Invalidates automatically when collections change
{% endcomment %}
{% cache 'navigation-mega-menu', expires_in: 3600 %}
  {%- assign l1_categories = collections | where: "metafields.custom.category_level", "L1" -%}
  {%- for l1_collection in l1_categories limit: 20 -%}
    <!-- Render L1 → L2 → L3 tree -->
  {%- endfor -%}
{% endcache %}
```

**Category Tiles Cache:**

```liquid
{% cache 'category-tiles', collection.handle, expires_in: 3600 %}
  {%- assign child_handles = collection.metafields.custom.child_collections | split: ',' -%}
  {%- for handle in child_handles -%}
    {%- assign child = collections[handle] -%}
    {% render 'category-tile', collection: child %}
  {%- endfor -%}
{% endcache %}
```

**Breadcrumb Cache:**

```liquid
{% cache 'breadcrumb', collection.handle %}
  <!-- Render full breadcrumb trail -->
{% endcache %}
```

### Metafield Caching (All Plans)

**Child Collections Metafield:**

```json
{
  "namespace": "custom",
  "key": "child_collections",
  "value": "smartphones,feature-phones,phone-accessories"
}
```

**Benefits:**

- O(1) lookup instead of O(n) filtering
- No need to iterate all collections
- Works on all Shopify plans
- Instant L3 subcategory loading

**Update Strategy:**

```javascript
// Admin script to populate child_collections metafield
collections.forEach((parentCollection) => {
  const children = collections.filter(
    (c) => c.metafields.custom.parent_category === parentCollection.handle
  );

  parentCollection.metafields.custom.child_collections = children.map((c) => c.handle).join(',');
});
```

### Query Optimization

**Bad: Filter All Collections**

```liquid
{%- assign l2_categories = collections | where: "metafields.custom.category_level", "L2" -%}
{%- for l2 in l2_categories -%}
  {%- if l2.metafields.custom.parent_category == parent_handle -%}
    <!-- Display L2 -->
  {%- endif -%}
{%- endfor -%}
```

**Good: Direct Lookup via Metafield**

```liquid
{%- assign child_handles = parent.metafields.custom.child_collections | split: ',' -%}
{%- for handle in child_handles -%}
  {%- assign child = collections[handle] -%}
  <!-- Display child -->
{%- endfor -%}
```

### Lazy Loading

**Defer L3 Menu Loading:**

```javascript
// Only load L3 menu when L2 is hovered
document.querySelectorAll('[data-l2-category]').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (!el.dataset.l3Loaded) {
      loadL3Menu(el);
      el.dataset.l3Loaded = 'true';
    }
  });
});
```

### Performance Metrics

**Target Benchmarks:**

- Navigation render: < 100ms
- L3 flyout open: < 50ms
- Breadcrumb render: < 20ms
- Category landing load: < 500ms
- Cache hit rate: > 90%

---

## Testing Strategy

### Unit Tests

**URL Builder:**

```javascript
// tests/components/url-builder.test.js
describe('hierarchy-url-builder', () => {
  it('should construct URL with path parameter', () => {
    const url = buildHierarchyUrl('smartphones', 'electronics/phones');
    expect(url).toBe('/collections/smartphones?path=electronics/phones');
  });

  it('should handle empty path', () => {
    const url = buildHierarchyUrl('electronics', '');
    expect(url).toBe('/collections/electronics');
  });
});
```

**Breadcrumb Logic:**

```javascript
// tests/components/breadcrumb.test.js
describe('breadcrumb', () => {
  it('should parse path parameter', () => {
    const trail = parseBreadcrumbPath('electronics/phones/smartphones');
    expect(trail).toEqual(['electronics', 'phones', 'smartphones']);
  });

  it('should traverse parent_category chain', () => {
    const trail = buildTrailFromMetafields('smartphones');
    expect(trail).toEqual(['electronics', 'phones', 'smartphones']);
  });
});
```

### Integration Tests

**Navigation Flow:**

```javascript
// tests/integration/navigation.test.js
describe('Category Navigation', () => {
  it('should navigate through L1 → L2 → L3', () => {
    cy.visit('/');
    cy.get('[data-l1-category="electronics"]').hover();
    cy.get('[data-l2-category="phones"]').should('be.visible').hover();
    cy.get('[data-l3-category="smartphones"]').should('be.visible').click();
    cy.url().should('include', '/collections/smartphones?path=electronics/phones');
  });
});
```

### E2E Tests (Playwright)

**Category Landing Pages:**

```typescript
// tests/e2e/category-landing.spec.ts
test('L1 category shows subcategory tiles', async ({ page }) => {
  await page.goto('/collections/electronics');

  // Should show L2 subcategory tiles
  const tiles = page.locator('[data-category-tile]');
  await expect(tiles).toHaveCount(3);

  // Should NOT show product grid
  const products = page.locator('[data-product-card]');
  await expect(products).toHaveCount(0);
});

test('L3 category shows product grid', async ({ page }) => {
  await page.goto('/collections/smartphones?path=electronics/phones');

  // Should show products
  const products = page.locator('[data-product-card]');
  await expect(products).toHaveCountGreaterThan(0);

  // Should NOT show subcategory tiles
  const tiles = page.locator('[data-category-tile]');
  await expect(tiles).toHaveCount(0);
});
```

**Breadcrumb Navigation:**

```typescript
test('breadcrumb shows full hierarchy', async ({ page }) => {
  await page.goto('/collections/smartphones?path=electronics/phones');

  const breadcrumb = page.locator('[data-breadcrumb]');
  await expect(breadcrumb).toContainText('Home');
  await expect(breadcrumb).toContainText('Electronics');
  await expect(breadcrumb).toContainText('Phones');
  await expect(breadcrumb).toContainText('Smartphones');
});
```

### Accessibility Testing

**WCAG AA Compliance:**

- Color contrast ratios: 4.5:1 minimum for text
- Keyboard navigation for all interactive elements
- ARIA labels for navigation menus
- Focus indicators visible
- Screen reader friendly breadcrumbs

**Testing Tools:**

- axe DevTools
- WAVE browser extension
- Lighthouse accessibility audit
- Manual keyboard navigation testing

### Performance Testing

**Lighthouse Metrics:**

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

**Custom Benchmarks:**

```javascript
// Measure navigation render time
performance.mark('nav-start');
renderNavigation();
performance.mark('nav-end');
performance.measure('nav-render', 'nav-start', 'nav-end');
```

---

## Rollout Plan

### Pre-Launch Checklist

**Week 1-2: Staging Environment**

- [ ] Deploy to staging store
- [ ] Populate metafields for 10 test collections
- [ ] Configure L1 → L2 → L3 hierarchy
- [ ] Test all navigation flows
- [ ] Validate URL parameters
- [ ] Test breadcrumb trails

**Week 3: Internal QA**

- [ ] Complete all unit tests
- [ ] Complete all integration tests
- [ ] Complete all E2E tests
- [ ] Accessibility audit
- [ ] Performance benchmarks
- [ ] Cross-browser testing

**Week 4: User Acceptance Testing**

- [ ] Share staging link with stakeholders
- [ ] Gather feedback on navigation UX
- [ ] Test on various devices
- [ ] Validate design system consistency
- [ ] Check brand identity alignment

### Launch Strategy

**Phase 1: Soft Launch (Week 5)**

- Deploy to production store
- Enable for 10% of traffic (A/B test)
- Monitor analytics and performance
- Gather user feedback
- Fix critical issues

**Phase 2: Gradual Rollout (Week 6-7)**

- Increase to 50% of traffic
- Monitor conversion rates
- Compare old vs. new navigation
- Optimize based on data
- Address user feedback

**Phase 3: Full Launch (Week 8)**

- Enable for 100% of traffic
- Remove old navigation code
- Announce new features
- Update help documentation
- Train customer support team

### Post-Launch

**Week 9-10: Monitoring & Optimization**

- Monitor Lighthouse scores
- Track cache hit rates
- Analyze navigation paths
- Identify popular categories
- Optimize slow queries

**Week 11-12: Iteration**

- Implement user feedback
- Add additional features
- Refine design based on usage
- Optimize performance bottlenecks
- Document lessons learned

---

## Risk Mitigation

### Technical Risks

**Risk: Fragment Caching Not Available (Non-Plus Store)**

- **Mitigation:** Use metafield-based caching exclusively
- **Fallback:** Pre-compute all navigation data in metafields
- **Impact:** Slightly slower, but still performant

**Risk: Metafield Limit Exceeded**

- **Mitigation:** Use comma-separated values in single metafield
- **Alternative:** Paginate child collection queries
- **Impact:** May need to limit hierarchy depth

**Risk: URL Parameters Break Existing Links**

- **Mitigation:** Maintain backwards compatibility (path param optional)
- **Testing:** Validate all existing collection URLs still work
- **Impact:** Minimal - graceful degradation

**Risk: Performance Degradation with Many Collections**

- **Mitigation:** Implement aggressive caching strategy
- **Optimization:** Limit L1 categories to 20, L2 to 50 per L1
- **Monitoring:** Set up performance alerts

### UX Risks

**Risk: Users Confused by New Navigation**

- **Mitigation:** Clear visual hierarchy, tooltips, help text
- **Testing:** User testing before launch
- **Support:** FAQ documentation and customer support training

**Risk: Mobile Navigation Too Complex**

- **Mitigation:** Simplified accordion on mobile
- **Testing:** Extensive mobile device testing
- **Fallback:** Progressive disclosure (show L1, expand to L2/L3)

**Risk: Breadcrumb Trail Too Long**

- **Mitigation:** Truncate middle items with ellipsis on mobile
- **Responsive:** Full trail on desktop, abbreviated on mobile
- **Testing:** Test with 5+ level hierarchies

### Business Risks

**Risk: Conversion Rate Decrease**

- **Mitigation:** A/B test new navigation before full rollout
- **Monitoring:** Track conversion metrics closely
- **Rollback:** Keep old navigation code for quick revert

**Risk: SEO Impact from URL Changes**

- **Mitigation:** Primary URL stays the same (path param is optional)
- **Redirects:** 301 redirects if any URLs change
- **Schema.org:** Proper breadcrumb markup for search engines

---

## Success Metrics

### KPIs to Track

**Navigation Engagement:**

- Click-through rate on L1 → L2 transitions
- Click-through rate on L2 → L3 transitions
- Time spent in navigation menus
- Navigation depth (how deep users go)

**Performance:**

- Navigation render time (target: < 100ms)
- Cache hit rate (target: > 90%)
- Page load time (target: < 2s)
- Lighthouse score (target: > 90)

**User Experience:**

- Bounce rate on category pages
- Average pages per session
- Category page to product page conversion
- Mobile vs. desktop engagement

**Business Impact:**

- Overall conversion rate
- Average order value
- Products per order
- Category discovery rate

**SEO:**

- Organic traffic to category pages
- Search ranking for category keywords
- Click-through rate from search results
- Rich snippet appearance (breadcrumbs)

### Target Improvements

**Baseline (Current):**

- Navigation depth: 1.5 levels average
- Category discovery: 30% of users explore categories
- Mobile navigation usage: 15%

**Goals (Post-Launch):**

- Navigation depth: 2.5 levels average (+67%)
- Category discovery: 50% of users explore categories (+67%)
- Mobile navigation usage: 35% (+133%)
- Conversion rate: Maintain or improve by 5%

---

## Appendix

### Glossary

**L1, L2, L3:** Category hierarchy levels (Level 1, Level 2, Level 3)
**Metafield:** Custom data field attached to Shopify resources
**Fragment Caching:** Server-side caching of Liquid template fragments
**Material Design:** Google's design system for UI components
**Elevation:** Shadow depth in Material Design (measured in dp)
**Query Parameter:** URL parameter after `?` (e.g., `?path=electronics`)
**BEM:** Block Element Modifier CSS naming convention

### Reference Links

**Shopify Documentation:**

- [Metafields API](https://shopify.dev/api/liquid/objects/metafield)
- [Fragment Caching](https://shopify.dev/api/liquid/tags/cache)
- [Collection Object](https://shopify.dev/api/liquid/objects/collection)

**Material Design:**

- [Material Design Lite](https://getmdl.io/)
- [Material Design Guidelines](https://material.io/design)
- [Material Color System](https://material.io/design/color)
- [Material Typography](https://material.io/design/typography)

**Tools:**

- [Google Fonts](https://fonts.google.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Sample Code Snippets

**URL Builder Example:**

```liquid
{%- comment -%}
  Build URL with path parameter
  Usage: {% render 'hierarchy-url-builder', collection: child, path: 'electronics/phones' %}
{%- endcomment -%}

{%- assign base_url = collection.url -%}
{%- if path and path != '' -%}
  {%- assign url = base_url | append: '?path=' | append: path -%}
{%- else -%}
  {%- assign url = base_url -%}
{%- endif -%}

<a href="{{ url }}">{{ collection.title }}</a>
```

**Breadcrumb Path Parser:**

```liquid
{%- comment -%}
  Parse ?path= parameter from URL
{%- endcomment -%}

{%- assign path_param = '' -%}
{%- if request.path contains '?' -%}
  {%- assign query_string = request.path | split: '?' | last -%}
  {%- assign params = query_string | split: '&' -%}
  {%- for param in params -%}
    {%- if param contains 'path=' -%}
      {%- assign path_param = param | split: 'path=' | last | url_decode -%}
    {%- endif -%}
  {%- endfor -%}
{%- endif -%}

{%- if path_param != '' -%}
  {%- assign path_segments = path_param | split: '/' -%}
  <!-- Build breadcrumb from segments -->
{%- endif -%}
```

---

## Conclusion

This comprehensive plan provides a roadmap for implementing a Walmart-style multi-level navigation system with Material Design styling and modern performance optimizations. The phased approach allows for iterative development, testing, and refinement while maintaining the existing store functionality.

**Key Achievements:**
✅ Three-level category navigation (L1 → L2 → L3)  
✅ Query parameter-based URL hierarchy  
✅ Recursive breadcrumb trails  
✅ Material Design Lite integration  
✅ Modular font system (Roboto)  
✅ Fragment caching for performance  
✅ Category landing pages with conditional display  
✅ Complete component library refactor  
✅ Comprehensive documentation  
✅ Full test coverage

**Timeline:** 9 weeks for full implementation  
**Effort:** ~280 hours total development time  
**Risk Level:** Low to Medium (with proper testing and gradual rollout)

---

**Document Version:** 1.0  
**Last Updated:** January 18, 2026  
**Next Review:** After Phase 1 completion
