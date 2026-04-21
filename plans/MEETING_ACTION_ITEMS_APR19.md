# Implementation Plan: Meeting Action Items — April 19, 2026

> **Status**: 🟡 In Progress
> **Created**: 2026-04-19
> **Last Updated**: 2026-04-21
> **Source**: Weekly Meeting 2026-04-19 (Shawn Jones, Derek Hawkins, Jeremiah Tillman)
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

---

## Overview

Post-advisory-board session weekly review. Site is ~80–85% complete. This plan captures
all of Derek's action items from the meeting, organized into logical branches. Items are
prioritized by go-live impact — access/auth fix is immediate, then nav/homepage, then
product fixes, then SEO/polish.

> **Note**: The Shopify mandatory-login gate was diagnosed and deployed during the meeting
> itself (liquid env variables still being read after Hydrogen migration). Confirmed fixed.

---

## Progress Summary

| # | Workstream | Status |
|---|-----------|--------|
| 1 | Auth Gate Fix | ✅ Complete |
| 2 | Seasonal Header Nav | ✅ Complete |
| 3 | Homepage Section Carousels | ✅ Complete (partial — see notes) |
| 4 | Guest Checkout & Order Tracking | 🔲 Not started |
| 5 | Product & Category Display Fixes | 🟡 Partial (Bug 4 done; Bugs 1–3 pending) |
| 6 | PDP Image Zoom & Carousel | ✅ Complete |
| 7 | Product Specs Display | 🔲 Blocked (awaiting Jeremiah session) |
| 8 | Footer Color & Layout | ✅ Complete (color done; form alignment N/A — no off-center form found) |
| 9 | Contact Us Page | ✅ Complete |
| 10 | SEO Code Tasks | 🔲 Not started (post-launch) |

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

> All completed workstreams were implemented on `feature/customer/migrate-to-customer-account-api`
> and committed in `d7c84df` on 2026-04-21.

---

## Workstream 1 — Auth Gate Fix (CONFIRM + NOTIFY)

**Branch**: `bugfix/customer/shopify-auth-gate`
**Priority**: CRITICAL
**Status**: ✅ Complete

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
**Status**: ✅ Complete

### Context
Shawn wants "Seasonal" as a **top-level** header item (not inside Categories). It should have
its own dropdown like the Categories dropdown — showing seasonal subcategories (Christmas,
Summer, etc.) with a "See All" link to the `seasonal` collection page. Maximum **5 items** shown,
prioritized via a back-end field (same mechanic as the existing category priority metafield).

### Target header order
```
Categories ▾  |  What's New  |  Seasonal ▾  |  Discounts  |  Promotions & Deals  |  Blog & Media
```

### Implementation Notes
- `SEASONAL_NAV_QUERY` added to `root.tsx` `loadCriticalData` — queries the `seasonal` collection's
  `child_nodes` metafield (same pattern as `HEADER_COLLECTIONS_QUERY`), sorted by `menu_priority_order`,
  capped at 5 items, cached with `CacheLong`.
- `seasonalItems` prop flows: `root.tsx` → `PageLayout.tsx` → `Header.tsx`
- `SeasonalDropdown` component uses shadcn `DropdownMenu` — same pattern as `NavDropdown`.
  Items are dynamic from Shopify; "See All" footer link → `/collections/seasonal`.
- Mobile: collapsible section in `MobileMenu` between What's New and Discounts, same accordion
  pattern as the Categories section.
- i18n keys `nav.seasonal` added to EN/ES/FR locales.

### Tasks
- [x] Add `SEASONAL_NAV_QUERY` to `root.tsx` — fetches child collections of `seasonal` via metafield
- [x] Process and sort seasonal items (priority metafield → alpha fallback, max 5)
- [x] Pass `seasonalItems` through `PageLayout` to `Header`
- [x] Create `SeasonalDropdown` component in `Header.tsx`
- [x] Wire into desktop nav between What's New and Discounts (only renders if items exist)
- [x] Wire into mobile `MobileMenu` as collapsible section
- [x] Add i18n keys (`nav.seasonal`) to EN/ES/FR

### Remaining / Shawn's action
- [ ] **Shawn**: Set up the `seasonal` collection in Shopify admin with child collections linked
  via the `custom.child_nodes` metafield (same structure as other nav collections)
- [ ] **Shawn**: Set `custom.menu_priority_order` on each seasonal child collection to control
  the display order in the dropdown

### Manual Tests
1. Seasonal appears in header between What's New and Discounts (desktop)
2. Clicking Seasonal opens a dropdown
3. Dropdown shows ≤5 seasonal collection items
4. "See All" link goes to `/collections/seasonal`
5. Dropdown closes on outside click / Escape
6. Mobile: Seasonal visible in mobile nav menu as collapsible section

---

## Workstream 3 — Homepage Section Carousels

**Branch**: `feature/homepage/section-carousels`
**Priority**: HIGH
**Status**: ✅ Complete (Phases 1 & 2 done; Phases 3–4 partial — see notes)

### Context
Shawn's feedback on the homepage body sections (What's New, Discounts, Promotions & Deals):
- Each section should show **1 row of 6 items** rotating as a carousel (not a long static grid)
- "See All" at the end of each section links to the corresponding collection page
- Remove the fake template promo text "Grab up to 15% off on select items"
- What's New must link to the `what-s-new` backend collection (currently may be static)
- Discounts section needs category-level discount priority (discount whole categories, not individual items)

### Implementation Notes
- `ProductSection` in `_index.tsx` was converted from a static grid to a drag-to-scroll horizontal
  carousel. Cards are `shrink-0` with responsive widths: 2-up on mobile, 3-up on sm, 6-up on lg.
  Prev/Next arrow buttons scroll by 2 card-widths; drag-to-scroll (mouse) also works.
- Shows up to 12 products (6 visible on desktop, remaining accessible via scroll/arrows).
- Fake promo headline ("Grab Upto 50% Off On Selected Products") removed from `collections.all.tsx`.
  The locale key `collectionsAll.promoHeadline` remains in the JSON files but is no longer rendered.
- Category-level discount priority (Phase 3 detail) and full Promotions & Deals wire-up (Phase 4)
  are deferred until Darian returns.

### Tasks
- [x] Remove fake promo text from `hydrogen/app/routes/collections.all.tsx`
- [x] Convert `ProductSection` from static grid to drag-to-scroll horizontal carousel with prev/next arrows
- [x] Cap display at 12 products (6 visible on desktop at once)
- [ ] **Deferred**: Category-level discount priority (requires Darian's promo tier data)
- [ ] **Deferred**: Full Promotions & Deals carousel wired to real promo metaobjects (structure exists)

### Manual Tests
1. Homepage loads — fake promo text gone from `/collections/all` hero
2. What's New shows real products from Shopify in a carousel row
3. Carousel arrows scroll to reveal more items
4. Drag-to-scroll works (mouse only; touch uses native scroll)
5. "See All" in each section navigates to the correct collection

---

## Workstream 4 — Guest Checkout & Order Tracking

**Branch**: `feature/customer/guest-checkout-tracking`
**Priority**: HIGH
**Status**: 🔲 Not started

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
**Status**: 🟡 Partial — Bug 4 (end-node header) done; Bugs 1–3 still pending

### Context
Shawn identified three bugs during the meeting:
1. **Missing breadcrumb category**: "Bed and Accessories" not appearing under Furniture in breadcrumb
2. **Missing product**: Latex Mattress not showing under its category listing
3. **Truncated count**: Shows "24+" instead of the real total count
4. **End-node layout**: Category photo + category name should appear at the TOP of end-node pages
   (currently missing; Shawn wants it even on end-node, matching the non-end-node layout)

### Implementation Notes
- **Bug 4 (done)**: `CollectionHero` is now rendered at the top of the end-node layout in
  `collections.$handle.tsx`, before the listing layout. End-node pages show the hero image +
  collection name but still omit `SubcategoryScrollSection` (correct per Shawn's spec).
- **Bug 3 (blocked)**: `ProductConnection.totalCount` is NOT available in the Shopify Storefront API
  for collection queries — attempted and confirmed via codegen error. The "24+" behavior is
  intentional pagination with `hasNextPage ? '+' : ''` suffix using `nodes.length`. To show the
  true total, a separate `COLLECTION_COUNT_QUERY` would need to fetch `products(first: 250)`
  count-only — or Shawn can raise the per-page limit (currently 24) to capture all products
  in a single page.

### Tasks
- [x] **Bug 4**: Add `CollectionHero` to end-node layout (`collections.$handle.tsx`)
- [ ] **Bug 1**: Reproduce breadcrumb gap for Furniture > Bed and Accessories
  - Check `buildPathFromParentMetafields` in `~/lib/breadcrumbs`
  - May need Shawn to verify the `custom.parent_collection` metafield is set on "Bed and Accessories"
- [ ] **Bug 2**: Verify Latex Mattress in Shopify admin (active + assigned to collection)
  - If present in admin but missing in app, check `availableForSale` filter in `COLLECTION_QUERY`
- [ ] **Bug 3**: Decide approach with Shawn — either raise page size limit or accept `+` indicator

### Manual Tests
1. ~~Furniture > Bed and Accessories breadcrumb shows all three levels~~ (pending)
2. ~~Latex Mattress appears in its category page~~ (pending)
3. ~~Product count shows full number~~ (pending — API limitation noted above)
4. End-node collection page shows category hero image + name at top ✅
5. End-node page does NOT show the horizontal subcategory scroll strip ✅

### Pre-Commit Checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 6 — PDP Image Zoom & Carousel

**Branch**: `feature/product/image-zoom-carousel`
**Priority**: MEDIUM
**Status**: ✅ Complete

### Context
Shawn: "We need to find a way where the imaging can be like pushed out like if somebody selected
it, it comes forward… people can carousel it." Current PDP has a vertical thumbnail gallery
(from the Mar 23 build). Need to add:
- Click on main image → opens a full-screen/lightbox overlay
- Lightbox has prev/next arrows to carousel through all product images
- Current thumbnails remain; clicking a thumbnail also opens the lightbox to that image

### Implementation Notes
- shadcn `Dialog` lightbox added to `ProductGallery.tsx` — no new library.
- Main image wrapped in a `<button>` with `cursor-zoom-in`; thumbnail click navigates to that
  index AND opens the lightbox.
- Lightbox: black/95 background, full-size `Image`, prev/next arrows (hidden if single image),
  dot indicators at bottom, X close button top-right.
- Keyboard: window `keydown` listener for ← / → while lightbox is open (ArrowLeft/ArrowRight).
  Escape is handled natively by shadcn `Dialog`.
- Works in both `vertical` (PDP) and `horizontal` gallery layouts.
- i18n keys (`zoomImage`, `lightboxTitle`, `closeLightbox`, `previousImage`, `nextImage`) added
  to EN/ES/FR.

### Tasks
- [x] Audit `ProductGallery.tsx` — confirmed vertical layout, no existing lightbox
- [x] Add `lightboxOpen` state and `useEffect` keyboard handler
- [x] Build `lightbox` JSX using shadcn `Dialog` with prev/next/close/dots
- [x] Wrap main image in `<button>` to open lightbox (both vertical and horizontal layouts)
- [x] Thumbnail click: navigate to index + open lightbox
- [x] Add i18n keys to all three locales
- [ ] **Optional follow-up**: Add touch swipe gestures for mobile (v1 arrows are sufficient)

### Manual Tests
1. PDP → click main product image → lightbox opens at full size
2. Lightbox: click Next arrow → navigates to next image
3. Lightbox: click Previous arrow → navigates to previous image
4. Lightbox: press Escape → closes
5. Lightbox: click thumbnail in gallery → lightbox opens at that image
6. Mobile: lightbox opens and arrows work

---

## Workstream 7 — Product Specs Display (with Jeremiah)

**Branch**: `feature/product/specs-display`
**Priority**: MEDIUM
**Status**: 🔲 Blocked — awaiting Jeremiah debug session

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
**Status**: ✅ Complete (color done; form alignment N/A)

### Context
Two minor visual bugs:
1. **Footer green**: The footer primary variant was using `bg-primary` (#2ac864 — the bright green).
   Derek clarified during implementation that the correct color is `#55962D` — the darker green
   matching the "H" in the logo.
2. **Off-center form**: One page's form layout appears slightly off-center. No off-center form was
   found during implementation — the Contact Us page (WS9) was built centered from the start.
   Flag for Shawn to identify the specific page if still observed.

### Implementation Notes
- `BG_CLASSES.primary` in `Footer.tsx` changed from `'bg-primary'` to `'bg-[#55962D]'`.
- Color is `#55962D`, NOT the site `--color-primary` (`#2ac864`) — intentionally different.

### Tasks
- [x] Change `Footer.tsx` primary variant bg from `bg-primary` to `bg-[#55962D]`
- [ ] **Shawn to confirm**: if any other page's form appears off-center, identify the specific URL

### Manual Tests
1. Footer primary variant bg is `#55962D` (dark green matching logo "H") ✅
2. Footer text and links are unaffected ✅
3. ~~Identified form page: form is horizontally centered~~ (no off-center form identified)

---

## Workstream 9 — Contact Us Page

**Branch**: `feature/templates/contact-us`
**Priority**: MEDIUM
**Status**: ✅ Complete

### Context
Shawn confirmed "Contact Us" is on Derek's docket. This is a new page with a contact form.

### Implementation Notes
- Route: `hydrogen/app/routes/contact.tsx`
- Two-column layout (lg): form card (flex-1) + contact info sidebar (280px).
- Form fields: Name, Email, Subject, Message — all required with native HTML5 validation.
- Submit: POSTs to Shopify's built-in contact form endpoint (`/contact#contact_form`).
- States: idle → submitting → success (green checkmark + "Send another" button) / error (alert icon + retry).
- Contact info sidebar: email (`support@hy-lee.com`) + support hours (Mon–Fri 9am–5pm EST).
- i18n: all strings in EN/ES/FR locales under `contactPage.*` namespace.
- Breadcrumb: Home > Contact Us.

### Tasks
- [x] Create `hydrogen/app/routes/contact.tsx`
- [x] Form fields: Name, Email, Subject, Message, Submit
- [x] POST to Shopify contact form endpoint as v1
- [x] Success and error states
- [x] Contact info sidebar (email + hours)
- [x] i18n keys in EN/ES/FR
- [x] Breadcrumb navigation
- [ ] **Follow-up**: Add "Contact Us" link to footer nav (confirm which footer link group with Shawn)
- [ ] **Follow-up**: Confirm email delivery with Darian (Klaviyo vs Shopify native notifications)

### Manual Tests
1. `/contact` route renders the form and info sidebar
2. Form renders with all four fields
3. Submit with empty fields → browser required-field validation fires
4. Submit with invalid email → browser email validation fires
5. Submit with valid data → success state shown
6. "Send another message" resets and returns to form
7. Page is mobile-responsive (form stacks above info sidebar on mobile)

---

## Workstream 10 — SEO Code Tasks

**Branch**: `chore/assets/seo-code-review`
**Priority**: LOW (post-launch per Apr 11 meeting decisions)
**Status**: 🔲 Not started

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
- [x] Homepage loads without auth prompt (incognito)
- [ ] Header nav renders all items; dropdowns open/close correctly
- [ ] Add to cart → cart drawer opens → checkout flow reachable
- [ ] PDP renders: images, title, price, variant selector, add-to-cart
- [ ] PDP lightbox: click image → opens; arrows navigate; Escape closes
- [ ] Collection page: products display, filters work, pagination works
- [ ] End-node collection: hero image + title visible at top
- [ ] Account login/register still works (auth pages not broken by header changes)
- [ ] Mobile (375px): no horizontal overflow, nav accessible, carousels usable
- [ ] No TypeScript `any` types introduced
- [ ] No hardcoded hex colors (use CSS tokens)

---

## Notes

- **Shawn's tasks** (not Derek's): Create project tickets in Project Hub for each item above;
  create homepage page entry in Shopify admin with SEO fields; populate meta titles/descriptions
  for all pages; clean up product data (item numbers, supplier titles); set up Seasonal collection
  in Shopify admin with child collections linked via `custom.child_nodes` metafield; define
  promotional tiers/codes with Darian; confirm the specific page with the off-center form (WS8).
- **Jeremiah's task**: Schedule spec debug session with Derek this week; develop analytics schema
  and KPI documentation (mobile-first); run schema by team for review.
- **Specs issue**: Jeremiah believes it may be a Shopify API change, not a code bug. Do not
  implement a full custom-field workaround before the paired debug session — may be a simple
  namespace/key fix.
- **Promotions section**: Do not build the full promotion redemption flow until Darian is back.
  The carousel structure is sufficient for v1; wire to real promo data in a follow-up.
- **Product count "24+"**: `ProductConnection.totalCount` is not available in the Shopify
  Storefront API — confirmed via codegen validation error. The `+` indicator is the correct
  behavior for paginated results. Resolve by raising the page size limit or accepting the
  indicator; discuss with Shawn.
- **Contact Us email delivery**: Currently POSTing to Shopify's native contact form endpoint.
  Confirm with Darian whether to route through Klaviyo instead once she's back.
