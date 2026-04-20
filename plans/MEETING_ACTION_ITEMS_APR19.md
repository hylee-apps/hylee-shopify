# Implementation Plan: Meeting Action Items — April 19, 2026

> **Status**: 🟡 In Progress
> **Created**: 2026-04-19
> **Source**: Weekly Meeting 2026-04-19 (Shawn Jones, Derek Hawkins, Jeremiah Tillman)
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

---

## Overview

Post-advisory-board session weekly review. Site is ~80–85% complete. This plan captures
all of Derek's action items from the meeting, organized into logical branches. Items are
prioritized by go-live impact — access/auth fix is immediate, then nav/homepage, then
product fixes, then SEO/polish.

> **Note**: The Shopify mandatory-login gate was diagnosed and deployed during the meeting
> itself (liquid env variables still being read after Hydrogen migration). Confirm that fix
> landed and notify Shawn before any other work begins.

---

## Branch Map

| Branch | Scope | Priority |
|--------|-------|----------|
| `bugfix/customer/shopify-auth-gate` | Fix mandatory login (already deployed) | CRITICAL |
| `feature/header/seasonal-nav-dropdown` | Seasonal as top-level header nav | HIGH |
| `feature/homepage/section-carousels` | Carousels + promo text removal + collection sync | HIGH |
| `feature/customer/guest-checkout-tracking` | Guest checkout & order tracking finalization | HIGH |
| `bugfix/product/category-display-fixes` | Category/product visibility + count + end-node layout | HIGH |
| `feature/product/image-zoom-carousel` | PDP image enlarge + carousel | MEDIUM |
| `feature/product/specs-display` | Spec fields debug (schedule with Jeremiah) | MEDIUM |
| `bugfix/footer/color-layout-corrections` | Footer color + form alignment | MEDIUM |
| `feature/templates/contact-us` | Contact Us page | MEDIUM |
| `chore/assets/seo-code-review` | SEO checklist code tasks + tag audit | LOW |

---

## Workstream 1 — Auth Gate Fix (CONFIRM + NOTIFY)

**Branch**: `bugfix/customer/shopify-auth-gate`
**Priority**: CRITICAL
**Status**: Deployed during meeting — needs confirmation

### Context
During the meeting Derek identified the root cause: Liquid env variables (`password_page_enabled`
or B2B gating logic) were still being evaluated by the Hydrogen app. Derek deployed a fix live.
Shawn must be notified once confirmed working on an incognito/logged-out browser.

### Tasks
- [x] Verify fix in incognito/private browser — site loads without Shopify login prompt
- [x] Test on mobile (Shawn's specific test case)
- [x] Notify Shawn: "Website is now publicly accessible"

### Manual Test
1. Open incognito window → `https://[store-domain]`
2. Confirm homepage loads without redirect to login
3. Confirm add-to-cart and browse work without account

---

## Workstream 2 — Seasonal Header Nav

**Branch**: `feature/header/seasonal-nav-dropdown`
**Priority**: HIGH

### Context
Shawn wants "Seasonal" as a **top-level** header item (not inside Categories). It should have
its own dropdown like the Categories dropdown — showing seasonal subcategories (Christmas,
Summer, etc.) with a "See All" link to the `seasonal` collection page. Maximum **5 items** shown,
prioritized via a back-end field (same mechanic as the existing category priority metafield).

### Target header order
```
Categories ▾  |  What's New  |  Seasonal ▾  |  Discounts  |  Promotions & Deals  |  Blog & Media
```

### Tasks

#### Phase 1: Navigation Config
- [ ] Add `seasonal` to top-level nav items in `hydrogen/app/config/navigation.ts`
- [ ] Position it between `What's New` and `Discounts` (or after `What's New` per Shawn's order)
- [ ] Define `SeasonalNavConfig` interface with `maxItems: 5` and `seeAllHandle: 'seasonal'`

#### Phase 2: Dropdown Component
- [ ] Audit `hydrogen/app/components/layout/Header.tsx` — confirm existing CategoryDropdown pattern
- [ ] Create (or reuse) `SeasonalDropdown` component with same dropdown mechanics as `CategoryDropdown`
- [ ] Fetch seasonal subcollections: query collections where `collection.metafield(namespace: "custom", key: "seasonal") == true` OR use a `seasonal` collection menu in Shopify admin
- [ ] Cap display to 5 items; render prioritized by `custom.menu_priority_order` metafield
- [ ] Add "See All Seasonal →" link at bottom → `/collections/seasonal`
- [ ] Wire to `Header.tsx` desktop nav

#### Phase 3: Prioritization Admin Hook
- [ ] Confirm `custom.menu_priority_order` metafield can be set on collections in Shopify admin
- [ ] Document for Shawn: how to set priority order on seasonal collections (same as main categories)

### Manual Tests
1. Seasonal appears in header between What's New and Discounts (desktop)
2. Clicking Seasonal opens a dropdown
3. Dropdown shows ≤5 seasonal collection items
4. "See All" link goes to `/collections/seasonal`
5. Dropdown closes on outside click / Escape
6. Mobile: Seasonal visible in mobile nav menu

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 3 — Homepage Section Carousels

**Branch**: `feature/homepage/section-carousels`
**Priority**: HIGH

### Context
Shawn's feedback on the homepage body sections (What's New, Discounts, Promotions & Deals):
- Each section should show **1 row of 6 items** rotating as a carousel (not a long static grid)
- "See All" at the end of each section links to the corresponding collection page
- Remove the fake template promo text "Grab up to 15% off on select items"
- What's New must link to the `what-s-new` backend collection (currently may be static)
- Discounts section needs category-level discount priority (discount whole categories, not individual items)

### Tasks

#### Phase 1: Remove Fake Promo Text
- [ ] Find and delete "Grab up to 15% off on select items" placeholder in `hydrogen/app/routes/_index.tsx`
  or wherever it's rendered in the Promotions section

#### Phase 2: What's New Carousel
- [ ] Confirm `what-s-new` collection handle in Shopify admin (may be `what-s-new`)
- [ ] In `_index.tsx` loader, ensure What's New queries `collections/what-s-new` products (already
  partially wired per ACTIVE_CONTEXT — verify it's pulling real data not static placeholders)
- [ ] Replace current What's New grid with a `<HomepageSectionCarousel>` component:
  - 1 visible row, 6 items shown at a time
  - Auto-rotates OR has prev/next arrows
  - "See All" link → `/collections/what-s-new`
- [ ] Add `data-testid="whats-new-carousel"` for E2E targeting

#### Phase 3: Discounts Carousel
- [ ] Query discounted/sale products: use `sortKey: PRICE` with a `filters` for `price: { max: ... }`
  OR query a dedicated `discounts` collection if Shawn creates one in Shopify admin
- [ ] Support category-level discount priority: read `custom.menu_priority_order` on collections
  to determine which category's discounted products surface first
- [ ] Render using same `<HomepageSectionCarousel>` component
- [ ] "See All" link → `/collections/discounts` (confirm handle with Shawn)

#### Phase 4: Promotions & Deals Carousel
- [ ] This section surfaces the promo deal codes (8%, 10%, 15%, 20%, 25% tiers from Mar 29 plan)
- [ ] For v1: render deal cards showing each promotional tier (not individual products)
- [ ] People can "Claim" or see details; "See All" → promotions page
- [ ] Wire to real promo data once Darian is back (placeholder structure is acceptable for now)

#### Phase 5: Shared Carousel Component
- [ ] Create `hydrogen/app/components/home/HomepageSectionCarousel.tsx`:
  ```tsx
  interface HomepageSectionCarouselProps {
    title: string;
    products: ProductCardProps[];
    seeAllHref: string;
    seeAllLabel?: string;
  }
  ```
- [ ] 1-row layout with horizontal scroll or arrow navigation
- [ ] Shows 6 items at a time (desktop), 2–3 on mobile
- [ ] Tailwind v4 tokens only, no hardcoded colors

### Manual Tests
1. Homepage loads — fake promo text gone
2. What's New shows real products from Shopify in a carousel row
3. Carousel arrows or scroll works to see more items
4. "See All" in What's New goes to `/collections/what-s-new`
5. Discounts carousel shows discounted products
6. Promotions & Deals section shows deal tier cards (or skeleton if not yet wired)
7. All three sections: "See All" links navigate correctly

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 4 — Guest Checkout & Order Tracking

**Branch**: `feature/customer/guest-checkout-tracking`
**Priority**: HIGH
**Status**: Already in progress — Derek said "done by end of day" on Apr 19

### Context
Customers must be able to:
1. Complete checkout without creating an account (guest checkout)
2. Track their order without an account (order lookup by email + order number)

### Tasks
- [ ] Confirm guest checkout flow works end-to-end without Customer Account login requirement
- [ ] Add order tracking page: `hydrogen/app/routes/order-tracking.tsx`
  - Form: email address + order number
  - Queries Storefront API: `order(id: ...)` or uses Shopify order status page URL
- [ ] Add "Track Your Order" link to footer and/or account section for non-logged-in users
- [ ] Test: complete a checkout as guest → receive order confirmation → track order without account

### Manual Tests
1. Add item to cart → Checkout → complete purchase without creating account
2. Confirmation page shows order number
3. Navigate to order tracking → enter email + order number → see order status
4. Order tracking accessible from footer without logging in

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 5 — Product & Category Display Fixes

**Branch**: `bugfix/product/category-display-fixes`
**Priority**: HIGH

### Context
Shawn identified three bugs during the meeting:
1. **Missing breadcrumb category**: "Bed and Accessories" not appearing under Furniture in breadcrumb
2. **Missing product**: Latex Mattress not showing under its category listing
3. **Truncated count**: Shows "24+" instead of the real total count
4. **End-node layout**: Category photo + category name should appear at the TOP of end-node pages
   (currently missing; Shawn wants it even on end-node, matching the non-end-node layout)

### Tasks

#### Bug 1: Missing Breadcrumb / Category Visibility
- [ ] Navigate to Furniture → Bed and Accessories in dev — reproduce the breadcrumb gap
- [ ] Check `CollectionHero` or `BreadcrumbNav` component in `hydrogen/app/routes/collections.$handle.tsx`
- [ ] Confirm the collection hierarchy data is being queried — may need to add parent collection
  metafield (`custom.parent_collection`) to the breadcrumb query
- [ ] Fix breadcrumb to reflect full hierarchy: Home > Furniture > Bed and Accessories

#### Bug 2: Missing Product (Latex Mattress)
- [ ] Go to Shopify admin → verify Latex Mattress is assigned to its collection and is `active`
- [ ] If it IS in Shopify but not showing in the Hydrogen app, check the collection query filter
  (may have an `available: true` filter accidentally excluding it)
- [ ] Fix query or flag for Shawn to check product status in admin

#### Bug 3: Product Count Display
- [ ] Find the component rendering "24+" — likely in `CollectionToolbar` or similar header
- [ ] Replace the capped display with the actual `collection.products.totalCount` from the
  Storefront API (confirm field is present in the current collection query)
- [ ] If the query doesn't return `totalCount`, add it to the fragment in `hydrogen/app/lib/fragments.ts`

#### Bug 4: End-Node Category Header
- [ ] In `hydrogen/app/routes/collections.$handle.tsx`, check the conditional that hides the
  hero image/name for end-node collections (previously `CollectionHero` was removed for end-nodes
  per the Apr 11 plan)
- [ ] Restore the category photo + name header on end-node pages
- [ ] Keep the breadcrumb; just ADD the photo + name above it (Shawn: "continue the layout right
  down to the last end node, only missing is not to show [the subcategory scroll section]")
- [ ] Ensure end-node pages: show photo + name ✅, show breadcrumb ✅, NO subcategory scroll section ✅

### Manual Tests
1. Furniture > Bed and Accessories breadcrumb shows all three levels
2. Latex Mattress appears in its category page
3. Product count shows full number (e.g., "47 products" not "24+")
4. End-node collection page shows category hero image + name at top
5. End-node page does NOT show the horizontal subcategory scroll strip

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 6 — PDP Image Zoom & Carousel

**Branch**: `feature/product/image-zoom-carousel`
**Priority**: MEDIUM

### Context
Shawn: "We need to find a way where the imaging can be like pushed out like if somebody selected
it, it comes forward… people can carousel it." Current PDP has a vertical thumbnail gallery
(from the Mar 23 build). Need to add:
- Click on main image → opens a full-screen/lightbox overlay
- Lightbox has prev/next arrows to carousel through all product images
- Current thumbnails remain; clicking a thumbnail also opens the lightbox to that image

### Tasks
- [ ] Audit `hydrogen/app/components/product/ProductGallery.tsx` for current thumbnail + main image layout
- [ ] Check `hydrogen/app/components/ui/` for any existing Dialog/Modal/Lightbox component (shadcn Dialog)
- [ ] Implement lightbox using shadcn `Dialog`:
  - Click main image or thumbnail → `Dialog` opens with full-size image
  - Prev/Next arrows navigate through `product.images` array
  - Keyboard: Escape closes, ← / → navigate
  - Close button (X) in top-right
- [ ] Add `data-testid="product-image-lightbox"` and `data-testid="lightbox-next"` etc.
- [ ] Mobile: same behavior, swipe gestures optional (v1 arrows are fine)

### Manual Tests
1. PDP → click main product image → lightbox opens at full size
2. Lightbox: click Next arrow → navigates to next image
3. Lightbox: click Previous arrow → navigates to previous image
4. Lightbox: press Escape → closes
5. Lightbox: click thumbnail in gallery → lightbox opens at that image
6. Mobile: lightbox opens and arrows work

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 7 — Product Specs Display (with Jeremiah)

**Branch**: `feature/product/specs-display`
**Priority**: MEDIUM
**Dependency**: Requires coordination session with Jeremiah Tillman

### Context
Category meta fields (specs like dimensions, weight, material) are not rendering on the PDP.
Derek is pulling some product data (colors, media) but NOT the category-level meta fields.
Jeremiah suspects a Shopify API change. The team needs to debug together.

Three possible approaches discussed:
1. **Custom metafields** (product-level): Create a `specs` metafield (JSON or multi-line text) per
   product. Tedious but guaranteed to work.
2. **Category meta fields via Storefront API**: Re-examine the API response for `metafields`
   on products; check if namespace/key changed.
3. **Shopify-provided fields**: Many fields (title, description, vendor, variants) come through
   automatically — confirm what IS available vs what's NOT.

### Tasks
- [ ] **Schedule** paired session with Jeremiah (this week)
- [ ] Before session: run a raw GraphQL query in Shopify's storefront GraphiQL explorer to inspect
  what's actually returned under `product.metafields(identifiers: [...])` for a product that
  has specs filled in Shopify admin
- [ ] Compare the query response against what the current Hydrogen route is requesting
- [ ] **Option A** (API fix): Update the metafield identifiers in `hydrogen/app/lib/fragments.ts`
  to match actual namespace/keys being used in Shopify admin
- [ ] **Option B** (custom field): If Shopify API limitation confirmed, create a product metafield
  definition (namespace: `specs`, key: `attributes`) as a JSON object. Update PDP query to fetch it.
  Update the PDP `SpecsAccordion` to render the JSON array.
- [ ] Only show spec rows where value is NOT blank (Shawn: "if it's blank we don't need to show it")
- [ ] Add `data-testid="specs-accordion"` for E2E testing

### Manual Tests
1. Open any PDP that has specs in Shopify admin
2. "Specifications" accordion section shows real spec data (not empty)
3. Blank spec fields are hidden
4. Multiple spec rows render correctly

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 8 — Footer Color & Layout Alignment

**Branch**: `bugfix/footer/color-layout-corrections`
**Priority**: MEDIUM

### Context
Two minor visual bugs:
1. **Footer green**: The footer uses `#899a44` (per Derek's inspection during meeting); the site
   primary green is `#2ac864`. Shawn wants them aligned — the footer button/accents should use
   the same green shade as other site elements.
2. **Off-center form**: One page's form layout appears slightly off-center. Shawn identified it
   but didn't specify which page (likely the Contact Us or Supplier page). Check and correct.

### Tasks

#### Footer Color Fix
- [ ] In `hydrogen/app/components/layout/Footer.tsx`, find references to hardcoded hex `#899a44`
  or whichever Tailwind class is resolving to that color
- [ ] Replace with `text-primary` / `bg-primary` / `border-primary` (maps to `#2ac864`)
- [ ] Verify in browser — footer buttons/highlights now match the header/body green

#### Form Alignment Fix
- [ ] Identify the page with the off-center form:
  - Check `hydrogen/app/routes/suppliers.tsx` or any page with a standalone form
  - Check Contact Us page if it exists
- [ ] Likely fix: add `mx-auto` or `max-w-*` centering to the form wrapper
- [ ] Verify form is visually centered at 1440px and at 375px (mobile)

### Manual Tests
1. Footer green elements match the rest of the site (compare against header CTA color)
2. Identified form page: form is horizontally centered
3. No other colors changed inadvertently (check footer text, links)

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 9 — Contact Us Page

**Branch**: `feature/templates/contact-us`
**Priority**: MEDIUM

### Context
Shawn confirmed "Contact Us" is on Derek's docket. This is a new page with a contact form.

### Tasks
- [ ] Create route: `hydrogen/app/routes/contact.tsx`
- [ ] Form fields: Name, Email, Subject, Message, Submit
- [ ] Action: POST to Shopify's built-in contact form endpoint OR send to a Klaviyo/email service
  (confirm with Shawn/Darian which email platform to use; use a simple `mailto:` or Shopify
  contact endpoint as v1 fallback)
- [ ] Add to footer navigation under "Customer Support" or equivalent link group
- [ ] Style with existing Tailwind tokens + shadcn Input/Textarea/Button
- [ ] Add `data-testid` attributes to form inputs
- [ ] Success state: "Your message has been sent. We'll respond within 24 hours."
- [ ] Basic client-side validation: required fields, email format

### Manual Tests
1. Footer "Contact Us" link navigates to `/contact`
2. Form renders with all fields
3. Submit with empty fields → required field errors shown
4. Submit with invalid email → email error shown
5. Submit with valid data → success message shown
6. Page is mobile-responsive

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 10 — SEO Code Tasks

**Branch**: `chore/assets/seo-code-review`
**Priority**: LOW (post-launch per Apr 11 meeting decisions)

### Context
Shawn is handling SEO admin tasks (meta titles, descriptions, tags) in Shopify admin himself.
Derek owns any tasks on the SEO platform checklist that require code changes to the site
structure (heading hierarchy, canonical URLs, structured data, etc.).

From the meeting Shawn also asked Derek to review existing SEO tags in the site and report back.

### Tasks

#### Code-Side SEO
- [ ] Open the Screaming Frog / SEO checklist and identify items tagged "requires code changes"
- [ ] For each code item: create a sub-task here before implementing
- [ ] Common code SEO items to check:
  - H1 present and unique on every page type (collection, product, homepage)
  - `<title>` and `<meta name="description">` mapped from Shopify page data (not hardcoded)
  - Canonical `<link>` tags on paginated collection pages
  - `robots.txt` and `sitemap.xml` served correctly by Hydrogen
  - Open Graph / Twitter Card meta tags on product and collection pages

#### Meta Data Mapping (from meeting)
- [ ] In `hydrogen/app/routes/_index.tsx` loader: map Shopify homepage page's SEO fields
  (metatitle, metadescription) to the `<meta>` tags in the route's `<head>`
- [ ] Shawn will create the homepage page entry in Shopify admin with SEO fields filled in
- [ ] In each route that renders a Shopify page/collection/product, confirm the Storefront API
  query returns `seo { title description }` and it's being applied to the `<head>`

#### Tag Audit
- [ ] Review existing product/collection tags in the Shopify admin (Shawn can pull the list)
- [ ] Report back to Shawn: list of current tags and any that are redundant or malformed
- [ ] This is informational — no code change expected

### Pre-Commit Checks (if code changes made)
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Shared Testing Checklist (all workstreams)

### Pre-commit (run before EVERY commit, zero exceptions)
```bash
pnpm format              # auto-fix formatting
pnpm format:check        # verify clean
pnpm typecheck           # must pass
pnpm build               # must pass (catches SSR errors typecheck misses)
pnpm test                # unit tests must pass
```

### Manual Regression Tests (run after each workstream lands)
- [ ] Homepage loads without auth prompt (incognito)
- [ ] Header nav renders all items; dropdowns open/close correctly
- [ ] Add to cart → cart drawer opens → checkout flow reachable
- [ ] PDP renders: images, title, price, variant selector, add-to-cart
- [ ] Collection page: products display, filters work, pagination works
- [ ] Account login/register still works (auth pages not broken by header changes)
- [ ] Mobile (375px): no horizontal overflow, nav accessible, carousels usable
- [ ] No TypeScript `any` types introduced
- [ ] No hardcoded hex colors (use CSS tokens)

---

## Notes

- **Shawn's tasks** (not Derek's): Create project tickets in Project Hub for each item above;
  create homepage page entry in Shopify admin with SEO fields; populate meta titles/descriptions
  for all pages; clean up product data (item numbers, supplier titles); set up Seasonal collection
  in Shopify admin; define promotional tiers/codes with Darian.
- **Jeremiah's task**: Schedule spec debug session with Derek this week; develop analytics schema
  and KPI documentation (mobile-first); run schema by team for review.
- **Specs issue**: Jeremiah believes it may be a Shopify API change, not a code bug. Do not
  implement a full custom-field workaround before the paired debug session — may be a simple
  namespace/key fix.
- **Promotions section**: Do not build the full promotion redemption flow until Darian is back.
  The carousel structure is sufficient for v1; wire to real promo data in a follow-up.
- **Image carousel (WS6)**: Use shadcn `Dialog` — do not add a new lightbox library.
- **Footer color (WS8)**: If `#899a44` is coming from a design token that was intentionally
  different, confirm with Shawn before overriding. It may be the "olive" accent vs the primary green.
