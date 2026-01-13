# Hy-lee.com Website Development - Implementation Plan

**Date:** December 15, 2025  
**Based on:** Weekly Meeting Notes - December 14, 2025  
**Last Updated:** December 15, 2025

---

## Executive Summary

This implementation plan addresses feedback from the December 14th meeting, focusing on homepage improvements, navigation structure, product pages, and checkout flow enhancements. Tasks are organized by priority and dependencies.

---

## Phase 1: Homepage & Hero Section (Priority: HIGH)

### ✅ 1.1 Hero Search Section

**Status:** COMPLETED  
**Description:** Replace carousel with prominent search bar

- [x] Remove "Shop Now" / "Explore Collection" buttons
- [x] Make search bar prominent in hero section
- [x] Keep search functionality front and center

**Completed:** December 14, 2025

---

### ✅ 1.2 Newsletter with Promotional Slideshow

**Status:** COMPLETED  
**Description:** Enhance newsletter sign-up with promotional carousel

- [x] Add promotional slideshow above newsletter input
- [x] Include promotions like "Get 10% off your first order"
- [x] Add carousel controls (prev/next/play-pause)
- [x] Make promotions claimable with user control
- [x] Reference: Walmart, Target promotional patterns

**Completed:** December 14, 2025

---

### ✅ 1.3 Homepage Component Updates

**Status:** COMPLETED  
**Description:** Update homepage sections based on feedback

- [x] Keep "Featured Categories" section
- [x] Replace "Best Sellers" with "New Arrivals" (no sales data yet)
- [x] Remove "Why Choose Hylee?" from homepage
- [x] Update section order: Hero Search → Featured Categories → New Arrivals → Why Choose Hylee → Newsletter

**Completed:** December 14, 2025

**Notes:**

- Best Sellers, Flash Deals, and Recommended sections now have visibility toggles for future use
- "Why Choose Hylee?" kept on homepage per current implementation

---

### 🔵 1.4 Featured Categories Enhancement

**Status:** NOT STARTED  
**Priority:** HIGH  
**Description:** Add seasonal categories to featured categories section

**Tasks:**

- [ ] Add schema settings for seasonal category toggles
- [ ] Create seasonal category blocks (e.g., Holiday Gifts, Summer Deals, Back to School)
- [ ] Make seasonal categories configurable in theme editor

**Dependencies:** None

**Estimated Effort:** 2-3 hours

---

### 🔵 1.5 Hero Section Text Optimization

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Description:** Refine text above search bar

**Tasks:**

- [ ] Review current text: "Welcome to Our Marketplace" / "Discover unique products from trusted vendors worldwide"
- [ ] Await decision from Shawn on updated copy
- [ ] Update hero-search.liquid with final text

**Dependencies:** Shawn's content decision

**Estimated Effort:** 30 minutes

**Blocked By:** Content approval

---

## Phase 2: Navigation & Category Structure (Priority: HIGH)

### ✅ 2.1 Categories Mega Menu

**Status:** COMPLETED  
**Priority:** HIGH  
**Description:** Implement dropdown menu for L1 categories

**Tasks:**

- [x] Add mega menu dropdown for "Categories" nav link
- [x] Display L1 categories (Electronics, Home and Garden, etc.)
- [x] Style mega menu with multi-column layout (4-col → 3-col → 2-col → 1-col responsive)
- [x] Add hover states and visual hierarchy (sky blue gradient hover effects)
- [x] Ensure mobile responsiveness

**Dependencies:** None

**Estimated Effort:** 4-6 hours

**Reference:** Amazon, Target mega menu patterns

**Completed:** Modified `header.liquid` with mega menu grid layout, updated `section-header.css` with multi-column responsive styles, integrated with Shopify collections filtered by L1 meta field

---

### 🟡 2.2 Category Page Restructure (L2/L3 Levels)

**Status:** IN PROGRESS  
**Priority:** HIGH  
**Description:** Redesign category pages with visual drill-down

**Tasks:**

- [ ] Review Amazon and Target category page structures
- [ ] Implement breadcrumb navigation for L1 → L2 → L3
- [ ] Add visual category tiles for L2 subcategories
- [ ] Show faceted search only at product end nodes
- [ ] Use three-column layout for category pages
- [ ] Display category images for L2+ levels

**Dependencies:**

- Breadcrumb visualization (Task 3.1)
- Taxonomy data from meta fields

**Estimated Effort:** 8-10 hours

**Reference:**

- Amazon: https://www.amazon.com/electronics
- Target: https://www.target.com/c/electronics

---

### 🔵 2.3 Breadcrumb Visualization

**Status:** NOT STARTED  
**Priority:** HIGH  
**Description:** Display product taxonomy breadcrumbs

**Tasks:**

- [ ] Read breadcrumb data from Shopify meta fields/objects
- [ ] Create breadcrumb component
- [ ] Display breadcrumb trail: L1 > L2 > L3 > Product
- [ ] Make breadcrumb links functional
- [ ] Only build for categories with existing products (shortcut)

**Dependencies:** None (meta fields already populated)

**Estimated Effort:** 3-4 hours

**Data Location:** Shopify → Products → Meta fields → Meta objects

---

## Phase 3: Product Pages (Priority: HIGH)

### 🟡 3.1 Product Detail Page Redesign

**Status:** IN PROGRESS  
**Priority:** HIGH  
**Description:** Implement three-column layout matching Walmart

**Tasks:**

- [ ] Adopt Walmart's three-column product detail layout
- [ ] Keep key information visible during scrolling
- [ ] Move specs from main view to tabs/sections below
- [ ] Add sections: Long Description, Warranty, Warnings
- [ ] Maintain product image gallery in column 1
- [ ] Keep add-to-cart/buy-now in column 2
- [ ] Use column 3 for highlights and key details

**Dependencies:** None

**Estimated Effort:** 6-8 hours

**Reference:** Walmart product pages

---

### 🔴 3.2 Similar Items Feature

**Status:** BLOCKED  
**Priority:** LOW  
**Description:** Add "Similar Items" recommendations

**Tasks:**

- [ ] Define product attributes for similarity matching
- [ ] Implement recommendation algorithm
- [ ] Design similar items carousel/grid
- [ ] Add to product detail page

**Dependencies:**

- Sales/view data collection
- Product attribute analysis

**Blocked By:** Insufficient data (requires sales/behavioral data)

**Estimated Effort:** 8-12 hours (when unblocked)

**Notes:** Postponed - requires data-driven approach

---

### 🟡 3.3 Product Listing Page Updates

**Status:** IN PROGRESS  
**Priority:** MEDIUM  
**Description:** Enhance product listing functionality

**Tasks:**

- [x] Three-column product grid layout
- [x] Hide/show filter sidebar
- [ ] Optimize quick view on hover
- [ ] Add sort by: Most Views, Sales (when data available)
- [ ] Default to showing all products initially

**Dependencies:** None

**Estimated Effort:** 2-3 hours (remaining work)

---

## Phase 4: Checkout & Order Management (Priority: MEDIUM)

### 🔵 4.1 Checkout Flow Updates

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Description:** Update checkout address and shipping display

**Tasks:**

- [ ] Change address type options to: Home, Family, Friend, Office, Other
- [ ] Remove upfront shipping method details (drop-ship model)
- [ ] Show estimated delivery time at final review stage
- [ ] Update confirmation text: "Delivery time will be emailed"
- [ ] Ensure guest checkout requires email input

**Dependencies:** None

**Estimated Effort:** 3-4 hours

---

### ✅ 4.2 Order Tracking Enhancement

**Status:** COMPLETE  
**Priority:** MEDIUM  
**Description:** Add order tracking access points

**Completed Tasks:**

- [x] Add "Orders and Returns" button to top-right header
- [x] Ensure tracking works for both logged-in and guest users
- [x] Link button to order tracking page
- [x] Maintain consistent tracking experience
- [x] Refactored status badges to use badge.liquid snippet
- [x] Refactored buttons to use button.liquid snippet
- [x] Added skeleton loading placeholder
- [x] Implemented Buy Again and Reorder All functionality
- [x] Created toast notification system
- [x] Added sessionStorage filter persistence
- [x] Enhanced accessibility compliance (skip links, ARIA, focus management)
- [x] Improved mobile responsiveness (touch targets, scroll indicators)
- [x] Centralized JavaScript in component-scripts.js

**Dependencies:** None

**Estimated Effort:** 2 hours (Actual: ~4 hours)

---

### 🔵 4.3 Order Confirmation Emails

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Description:** Set up transactional email system

**Tasks:**

- [ ] Configure order confirmation emails
- [ ] Add password reset emails
- [ ] Include tracking number when received from wholesaler
- [ ] Include estimated delivery time in emails
- [ ] Design email templates

**Dependencies:** Email service integration

**Estimated Effort:** 4-6 hours

---

## Phase 5: Account Management (Priority: MEDIUM)

### 🔵 5.1 Sign-Up / Sign-In Pages

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Description:** Create user authentication pages

**Tasks:**

- [ ] Design sign-up page
- [ ] Design sign-in page
- [ ] Add form validation
- [ ] Integrate with Shopify customer accounts
- [ ] Add password reset flow

**Dependencies:** None

**Estimated Effort:** 4-5 hours

---

### 🔵 5.2 Account Management Dashboard

**Status:** NOT STARTED  
**Priority:** MEDIUM  
**Description:** Create customer account pages

**Tasks:**

- [ ] Build account overview page
- [ ] Add order history view
- [ ] Create order details page with tracking
- [ ] Add address book management
- [ ] Add profile/settings page

**Dependencies:** Order tracking system

**Estimated Effort:** 8-10 hours

---

### ✅ 5.3 Orders Page Enhancement

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Description:** Amazon-style orders page with tabs, search, and filtering

**Completed Tasks:**

- [x] Refactor orders section to use badge.liquid and button.liquid snippets
- [x] Add skeleton loading states for order cards
- [x] Add skip links for accessibility
- [x] Implement Buy Again functionality via Shopify Ajax API
- [x] Add Reorder All functionality for order detail page
- [x] Create toast notification system
- [x] Add tab scroll indicators for mobile
- [x] Add sessionStorage filter persistence
- [x] Add Orders & Returns link to header for guests

**Completed:** January 13, 2026

---

### ✅ 5.4 Addresses Page Refactor (Amazon-style)

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Description:** Complete rewrite of addresses page with Amazon-inspired card grid layout

**Completed Tasks:**

- [x] Create address-card.liquid reusable snippet with data attributes
- [x] Add address-card type to skeleton.liquid for loading states
- [x] Create section-customer-addresses.css with responsive grid (3/2/1 columns)
- [x] Refactor customer-addresses.liquid to modal-based add/edit forms
- [x] Pre-render country/province data in hidden JSON for fast cascading
- [x] Implement client-side form validation (required fields, phone regex)
- [x] Add illustrated empty state with "Add your first address" CTA
- [x] Add delete confirmation modal
- [x] Add URL param-based success alerts
- [x] Update COMPONENT_INVENTORY.md with new components

**Files Created/Modified:**

| File | Type | Description |
|------|------|-------------|
| `snippets/address-card.liquid` | Created | Reusable address card component |
| `assets/section-customer-addresses.css` | Created | Page styles (~400 lines) |
| `snippets/skeleton.liquid` | Modified | Added `address-card` type |
| `sections/customer-addresses.liquid` | Refactored | Complete rewrite (~300 lines) |
| `assets/component-scripts.js` | Modified | Added `initAddresses()` (~350 lines) |

**Completed:** January 2026

---

## Phase 6: Footer & Supporting Pages (Priority: LOW)

### 🔵 6.1 Footer Content

**Status:** NOT STARTED  
**Priority:** LOW  
**Description:** Complete footer with legal links

**Tasks:**

- [ ] Add Privacy Policy link
- [ ] Add Terms of Use link
- [ ] Add Refunds and Returns link
- [ ] Remove sitemap from footer
- [ ] Add contact information
- [ ] Add social media links (if applicable)

**Dependencies:** Legal document creation (separate track)

**Estimated Effort:** 2 hours

---

### 🔴 6.2 Accessibility Features

**Status:** BLOCKED  
**Priority:** LOW  
**Description:** Implement accessibility enhancements

**Tasks:**

- [ ] Add ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Add screen reader support
- [ ] Test with accessibility tools
- [ ] Add skip navigation links

**Dependencies:** Scale/growth milestone

**Blocked By:** Future concern per meeting notes

**Estimated Effort:** 12-16 hours (when prioritized)

---

## Phase 7: Legal & Compliance (Priority: HIGH - Parallel Track)

### 🔵 7.1 Privacy Policy Development

**Status:** NOT STARTED  
**Priority:** HIGH  
**Description:** Work with Chief Legal Officer on privacy policy

**Meeting Scheduled:** Week of December 16-20, 2025

**Tasks:**

- [ ] Document data capture requirements
  - [ ] Customer information for drop-shipping
  - [ ] Marketing data
  - [ ] Analytics data
- [ ] Jeremiah: Prepare analytical focus thoughts
- [ ] Meet with legal advisor (Shawn's sister - Charlotte Hornets/NBA attorney)
- [ ] Review and approve privacy policy language
- [ ] Publish to website

**Dependencies:** Data requirements documentation

**Estimated Effort:** Legal meeting + 2-3 hours implementation

---

### 🔵 7.2 Terms and Conditions

**Status:** NOT STARTED  
**Priority:** HIGH  
**Description:** Create terms of use

**Tasks:**

- [ ] Work with legal advisor on T&C
- [ ] Review platform-specific requirements
- [ ] Approve final language
- [ ] Publish to website

**Dependencies:** Legal meeting

**Estimated Effort:** Legal meeting + 2 hours implementation

---

### 🔵 7.3 Refunds and Returns Policy

**Status:** NOT STARTED  
**Priority:** HIGH  
**Description:** Define refund/return policy

**Tasks:**

- [ ] Work with legal advisor on policy
- [ ] Define drop-ship return process
- [ ] Set timeframes (e.g., 30-day returns)
- [ ] Approve final language
- [ ] Publish to website

**Dependencies:** Legal meeting

**Estimated Effort:** Legal meeting + 2 hours implementation

**Note:** Fix typo in legal buckets document: "refunds and refunds" → "refunds and returns"

---

## Data & Analytics (Parallel Track)

### 🔵 8.1 Analytics Planning

**Status:** NOT STARTED  
**Priority:** HIGH  
**Description:** Define data collection strategy

**Tasks:**

- [ ] Jeremiah: Document analytical focus areas
- [ ] Define key metrics to track:
  - [ ] Search behavior and keywords
  - [ ] Product views
  - [ ] Conversion funnel
  - [ ] Cart abandonment
  - [ ] Category performance
- [ ] Prepare data leverage strategy for legal meeting
- [ ] Implement tracking once legal approval obtained

**Dependencies:** Legal privacy policy approval

**Estimated Effort:** 4-6 hours planning + implementation

---

## Progress Summary

### Completed (✅)

- Hero Search Section
- Newsletter with Promotional Carousel
- Homepage Component Updates (partial)
- Sky Blue Theme Implementation

### In Progress (🟡)

- Category Page Restructure
- Product Detail Page Redesign
- Product Listing Page Updates

### Not Started (🔵)

- Featured Categories Enhancement
- Categories Mega Menu
- Breadcrumb Visualization
- Checkout Flow Updates
- Order Tracking Enhancement
- Account Management Pages
- Footer Content
- Legal Documents

### Blocked (🔴)

- Similar Items Feature (needs data)
- Accessibility Features (future milestone)

---

## Immediate Next Steps (Week of Dec 15-21, 2025)

1. **HIGH PRIORITY:**
   - [ ] Categories Mega Menu (Task 2.1)
   - [ ] Breadcrumb Visualization (Task 2.3)
   - [ ] Category Page Restructure (Task 2.2)
   - [ ] Product Detail Page Redesign (Task 3.1)

2. **LEGAL TRACK:**
   - [ ] Prepare data documentation for legal meeting
   - [ ] Jeremiah: Analytical focus document
   - [ ] Attend legal advisor meeting

3. **MEDIUM PRIORITY:**
   - [ ] Featured Categories Enhancement (Task 1.4)
   - [x] Order Tracking Button (Task 4.2) ✅ COMPLETE
   - [ ] Sign-Up/Sign-In Pages (Task 5.1)

---

## Notes & Decisions

### Meeting Decisions:

- **Search First:** Search functionality must be prominent and capture user behavior
- **Data-Driven:** Features requiring sales/behavioral data (Best Sellers, Similar Items, Recommendations) postponed until sufficient data collected
- **Walmart Model:** Product detail pages should match Walmart's three-column layout
- **Simplified Navigation:** Category pages need visual drill-down with breadcrumbs
- **Drop-Ship Model:** Shipping display adapted for drop-ship fulfillment (no upfront carrier details)

### Design References:

- **Categories:** Amazon, Target
- **Product Pages:** Walmart
- **Promotions:** Walmart, Target

### Technical Notes:

- Shopify meta fields/objects contain breadcrumb taxonomy data
- Build breadcrumbs only for categories with existing products (shortcut)
- Guest checkout must require email for order tracking
- Payment processing via third-party (security/cost)

---

## Version History

- **v1.0** - December 15, 2025 - Initial implementation plan created
