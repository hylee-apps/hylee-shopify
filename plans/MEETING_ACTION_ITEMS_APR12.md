# Implementation Plan: Meeting Action Items — April 12, 2026

> **Status**: 🟡 In Progress
> **Created**: 2026-05-11
> **Last Updated**: 2026-05-11
> **Source**: Weekly Meeting 2026-04-12 (Shawn Jones, Derek Hawkins; Jeremiah Tillman joined briefly)
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

---

## Overview

Pre-advisory-board homepage + storefront polish session. Shawn walked through the full site
live on Derek's screen and called out header, product card, collection page, and content gaps.
This plan captures every Derek action item from the transcript, organized into logical
workstreams. Items that overlap with or were completed by the APR19 plan are noted.

---

## Cross-Reference: APR19 Plan Status

| APR12 Topic | APR19 Workstream | Status |
|-------------|-----------------|--------|
| Guest order lookup / Returns & Orders link | WS4 | ✅ Complete |
| Seasonal header nav | WS2 | ✅ Complete |
| Homepage section carousels | WS3 | ✅ Complete |
| Shopify Inbox integration | `feat/integrations/shopify-inbox` branch | 🟡 In Progress |
| Product spec display | WS7 | 🔲 Blocked |
| Promotions & Deals carousel | WS11 | 🔲 Deferred (Darian) |

Items **not** captured in APR19 are new workstreams below.

---

## Progress Summary

| # | Workstream | Priority | Status |
|---|-----------|----------|--------|
| 1 | Header Logo + Nav Typography | HIGH | 🔲 Not Started |
| 2 | Language Switcher (re-add) | HIGH | 🔲 Not Started |
| 3 | Product Card Layout Redesign | HIGH | 🔲 Not Started |
| 4 | Add-to-Wishlist Heart Button | HIGH | 🔲 Not Started |
| 5 | Dedicated Collection Pages (What's New / Seasonal / Discount) | HIGH | 🔲 Not Started |
| 6 | Strikethrough / Savings Pricing on Discount Items | HIGH | 🔲 Not Started |
| 7 | Category Image Sizing + Border Polish | MEDIUM | 🔲 Not Started |
| 8 | Promotions & Deals Dedicated Page | MEDIUM | 🔲 Not Started |
| 9 | Blog & Media Header Dropdown | MEDIUM | 🔲 Not Started |
| 10 | About Us Page | MEDIUM | 🔲 Not Started |
| 11 | FAQ Page (Shopify-admin-driven) | MEDIUM | 🔲 Not Started |
| 12 | Newsletter Signup Component | LOW | 🔲 Not Started |
| 13 | Furniture Free Shipping Badge | LOW | 🔲 Not Started |

---

## Branch Map

| Branch | Workstreams | Priority |
|--------|-------------|----------|
| `feature/header/logo-nav-typography` | WS1, WS2, WS9 | HIGH |
| `feature/components/product-card-redesign` | WS3, WS4, WS6, WS7 | HIGH |
| `feature/collections/what-s-new-seasonal-discount` | WS5 | HIGH |
| `feature/templates/promotions-deals-page` | WS8 | MEDIUM |
| `feature/templates/about-us` | WS10 | MEDIUM |
| `feature/templates/faq-page` | WS11 | MEDIUM |
| `feature/components/newsletter-signup` | WS12, WS13 | LOW |

---

## Workstream 1 — Header Logo + Nav Typography

**Branch**: `feature/header/logo-nav-typography`
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context
Shawn reviewed the header live and called out three issues:
1. The Hy-lee logo sits in the center of the nav bar — it should be **far left**, like Amazon, Walmart, or Target.
2. The nav link labels (Categories, What's New, etc.) are too small and not bold enough.
   Shawn wants them the same size as the section headers on the homepage body, and **bold**.
3. The nav must have exactly **6 top-level items** (previously 4–5):
   `Categories ▾ | What's New | Seasonal ▾ | Discounts | Promotions & Deals | Blog & Media ▾`
4. Right side of header: Language switcher | Account | Orders & Returns | Cart.

### Implementation Notes
- Logo: change flex container in `Header.tsx` from `justify-center` or `justify-between`
  to `justify-start`, keeping the logo as the first child. Match Target/Walmart pattern
  where logo anchors the far-left edge of the container (not the page edge — still inside
  the max-width container).
- Nav typography: increase `font-size` of `<nav>` link items; apply `font-semibold` or
  `font-bold`. Match the `text-lg font-semibold` size used for homepage section headers.
  Do NOT make them so large they crowd the 6-item nav — test at 1280px and 1440px.
- 6-item nav: Seasonal dropdown was added in WS2 of the APR19 plan. Confirm all 6 items
  render. "Discounts" and "Promotions & Deals" are plain links (no dropdown); "Blog & Media"
  gets a dropdown (WS9 of this plan, built in the same branch).
- Right-side items: Language | Account icon | "Orders & Returns" text link | Cart icon.
  "Orders & Returns" must be visible for both logged-in and guest users (APR19 WS4 wired
  the underlying tracking route — just needs the header entry point confirmed).
- Note from Shawn: "those offers do not apply to discounted products" — add a disclaimer
  line somewhere near the Promotions & Deals nav link or in the page itself (WS8).

### Tasks
- [ ] Move logo flex container to far-left in `Header.tsx`
- [ ] Increase nav link font size and apply `font-bold` (or `font-semibold`)
- [ ] Confirm all 6 nav items render in correct order
- [ ] Add "Orders & Returns" link to right side of header (links to `/order-tracking` for
      guests; logged-in users redirect to `/account/orders`)
- [ ] Verify right-side icon order: Language | Account | Orders & Returns | Cart
- [ ] Mobile: confirm all updates don't break mobile menu (accordion still works)

### Manual Tests
1. Desktop (1440px): logo is visually anchored at far left of the nav container
2. Nav labels are bold and noticeably larger than before; all 6 items fit without wrapping
3. "Orders & Returns" link is visible in the header right section (not inside a dropdown)
4. Guest (logged-out): "Orders & Returns" → `/order-tracking` loads correctly
5. Logged-in: "Orders & Returns" → `/account/orders` loads correctly
6. Mobile (375px): logo + hamburger menu render correctly; no layout shift
7. No horizontal overflow at any viewport width

---

## Workstream 2 — Language Switcher (Re-add)

**Branch**: `feature/header/logo-nav-typography` (same branch as WS1)
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context
Derek noted during the meeting: "Oh, actually that is something I got rid of by accident. Um,
I'll add that as a button in the top." The language switcher was removed from the header at some
point during refactoring. Shawn confirmed placement: far right, near Blog & Media.

### Implementation Notes
- Hydrogen already has i18n wiring (EN/ES/FR locale files). Check `root.tsx` for any existing
  locale context or `i18n` loader; check if a `LanguageSwitcher` component ever existed.
- If the component was deleted, re-create it as a simple shadcn `DropdownMenu` showing
  "English", "Español", "Français" — each navigates to the locale-prefixed URL or sets a
  locale cookie/session value (match whatever pattern was used before).
- Placement: render it immediately to the right of the Blog & Media nav link, before the
  Account icon — or as the first item in the right-side icon cluster.

### Tasks
- [ ] Check git log / grep for any prior `LanguageSwitcher` component or locale switcher code
- [ ] Re-create or restore `LanguageSwitcher` as a shadcn `DropdownMenu` (EN / ES / FR)
- [ ] Wire locale selection to the existing i18n mechanism in `root.tsx`
- [ ] Place in header right-side cluster, leftmost (before Account icon)
- [ ] Add i18n key `nav.language` to all three locale files

### Manual Tests
1. Language switcher renders in header right cluster (globe icon or "EN" label)
2. Click → dropdown shows "English", "Español", "Français"
3. Select "Español" → page re-renders in Spanish
4. Select "English" → page re-renders in English
5. Selection persists on navigation (not reset on page change)

---

## Workstream 3 — Product Card Layout Redesign

**Branch**: `feature/components/product-card-redesign`
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context
Shawn reviewed product cards on both the homepage and collection pages and called out several
issues. The goal is a consistent card layout across ALL surfaces (homepage sections, collection
pages, search results):

```
┌──────────────────────────────┐  ← faint green border; blue on hover
│                              │
│       [product image]        │
│                              │
│  Product Title (2 lines max) │  ← left-aligned, truncated, hover shows full
│         $XX.XX               │  ← centered
│  [Add to Cart] [♡ Wishlist]  │  ← side by side
└──────────────────────────────┘
```

Specific callouts from Shawn:
- Remove the product **description** from the card entirely (it was being pulled in automatically)
- Title: **max 2 lines**, truncated with ellipsis; tooltip on hover shows full title
- Price: **centered** on its own line beneath the title (not off to the side)
- Add to Cart + Add to Wishlist: **side by side** on a single row at the bottom
- Card border: **faint green** default; transitions to **halo teal** (`--secondary`) on hover
- "New" badge: already implemented for < 30 day products — confirm it's still present

### Implementation Notes
- Locate the shared product card component — likely `ProductCard.tsx` or `ProductItem.tsx`
  in `hydrogen/app/components/`.
- Description removal: remove any `product.description` or `product.descriptionHtml` render
  from the card. Description lives on the PDP only.
- Title truncation: use Tailwind `line-clamp-2` + `title` attribute on the element for
  native tooltip on hover.
- Price centering: change price container from `flex justify-between` or left-aligned to
  `text-center` on its own `<p>` or `<div>`.
- Action row: `flex gap-2 items-center` with both buttons `flex-1` so they share equal width.
- Border: add `border border-[var(--color-primary)] hover:border-secondary transition-colors`
  (or the Tailwind token equivalents); confirm `--color-primary` is the green and `--secondary`
  is the halo teal.
- Remove the product description from the GraphQL query fragments if it's only used in the card
  (check `fragments.ts` — if `description` is fetched only for cards, remove it to reduce
  payload; keep `descriptionHtml` in the PDP query).

### Tasks
- [ ] Audit `ProductCard.tsx` (or equivalent) — identify current layout structure
- [ ] Remove product description from card render
- [ ] Implement 2-line clamped title with `title` tooltip attribute
- [ ] Center price on its own line
- [ ] Restructure action row: Add to Cart + wishlist heart side by side
- [ ] Add card border (green default → teal on hover)
- [ ] Confirm "New" badge still renders for recent products
- [ ] Apply consistent card layout to: homepage `ProductSection`, collection `ProductGrid`,
      search results, any other surfaces that render product cards
- [ ] Remove `description` from shared product card fragment if not needed elsewhere

### Manual Tests
1. Homepage → What's New section: cards show image, title (≤2 lines), centered price,
   [Add to Cart] [♡] row — no description visible
2. Collection page: same layout as homepage cards
3. Long product title: truncates at 2 lines with ellipsis; hovering the title shows full text
4. Short title (1 line): no extra gap, looks clean
5. Card border: faint green at rest; switches to teal on hover
6. "New" badge: visible on products < 30 days old
7. Search results page: cards match the new layout
8. Mobile (375px): cards stack correctly; action row buttons don't overflow

---

## Workstream 4 — Add-to-Wishlist Heart Button (Guest Behavior)

**Branch**: `feature/components/product-card-redesign` (same branch as WS3)
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context
Shawn confirmed wishlist behavior by referencing Target's implementation:
- **Guest (logged-out)**: clicking the heart shows a "Sign in to save" prompt — does NOT
  silently fail or add to a local/session wishlist.
- **Logged-in**: clicking the heart adds the product to the user's saved/wishlist list and
  toggles the heart to filled.
The wishlist route (`/account/wishlist` or similar) should already exist from the account
dashboard build — this workstream is about the **card-level heart button behavior only**.

### Implementation Notes
- The heart button in the product card should check `isLoggedIn` (from `CustomerAccount`
  context or a loader prop).
- Guest: render the heart as a `<button>` that triggers a shadcn `Popover` or `Toast` saying
  "Sign in to save items" with a "Sign In" link → `/account/login`. Do NOT redirect the page.
- Logged-in: existing wishlist toggle behavior (or stub if not yet wired). Filled heart = saved.
- i18n keys: `productCard.saveItem`, `productCard.signInToSave`, `productCard.signIn`.

### Tasks
- [ ] Add `isLoggedIn` check to product card (via context or prop from parent loader)
- [ ] Guest: heart click shows "Sign in to save" popover/toast with Sign In link
- [ ] Logged-in: heart click adds to wishlist + toggles to filled state
- [ ] Add i18n keys to EN/ES/FR
- [ ] Confirm consistent behavior on homepage, collection, and search result cards

### Manual Tests
1. Guest: click heart → "Sign in to save" message appears (inline popover or toast)
2. Guest: "Sign In" link in the message navigates to `/account/login`
3. Guest: page does NOT redirect; user stays on the current page
4. Logged-in: click heart → fills to solid; item appears in account wishlist
5. Logged-in: click filled heart → unfills; item removed from wishlist

---

## Workstream 5 — Dedicated Collection Pages (What's New / Seasonal / Discount)

**Branch**: `feature/collections/what-s-new-seasonal-discount`
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context
Shawn confirmed three navigation links (What's New, Seasonal, Discounts) each need their own
**dedicated collection page** with **filter support** — because unlike end-node category pages
with small assortments, these cross-category collections can be large.

Shawn owns the Shopify admin setup (creating the collections, linking products). Derek owns
the Hydrogen collection page behavior (filters, sorting, correct route rendering).

Key decision from the meeting:
- **What's New**: products tagged `new` or < 30 days old; filter sidebar should appear
- **Seasonal**: a curated collection Shawn maintains in admin; filter sidebar
- **Discounts**: products where `compareAtPrice > price`; filter sidebar; crossed-out
  original price shown (covered in WS6)
- The existing `collections.$handle.tsx` route already handles generic collection pages.
  The work here is confirming filters render on these three handles AND that the "What's New"
  header link navigates to `/collections/what-s-new` with filters active.

### Implementation Notes
- Check `collections.$handle.tsx` — confirm whether filter sidebar renders conditionally.
  If it only renders for `isEndNode === false`, update the condition to also render for
  the specific handles `what-s-new`, `seasonal`, `discount` (or enable it for all
  non-end-node collections universally).
- What's New header link (already added in APR19 WS2): confirm it goes to
  `/collections/what-s-new` (not an anchor or a page route).
- Discounts handle: confirm Shopify admin has a collection named `discount` or `discounts`.
  The exact Shopify handle needs to match the URL. Coordinate with Shawn.
- "New" badge on cards in the What's New collection: already rendered by `isNew` flag
  (product `createdAt` < 30 days) — verify it still shows in this collection view.

### Shawn's Admin Tasks (not Derek's code)
- Create `what-s-new` collection in Shopify admin; add products to it OR configure it as
  an automated collection (tag = `new` OR createdAt < 30 days)
- Create `seasonal` collection; add products via admin
- Create `discount` collection; configure as automated (compareAtPrice is set AND price < compareAtPrice)
- Set `menu_priority_order` metafield on each if dropdown ordering is needed

### Tasks
- [ ] Confirm `collections.$handle.tsx` renders filter sidebar for `what-s-new`, `seasonal`,
      `discount` handles (or all non-end-node collections)
- [ ] Verify `What's New` header link navigates to `/collections/what-s-new`
- [ ] Verify `Discounts` header link navigates to `/collections/discount` (or `/collections/discounts` — match admin handle)
- [ ] Verify `Seasonal` "See All" link navigates to `/collections/seasonal`
- [ ] Confirm "New" badge renders on What's New collection page products
- [ ] Confirm breadcrumb renders correctly: Home > What's New, Home > Seasonal, Home > Discount
- [ ] Coordinate with Shawn: confirm exact Shopify handles for all three collections

### Manual Tests
1. Click "What's New" in header → `/collections/what-s-new` loads; filter sidebar visible
2. Click "Seasonal ▾" → "See All" → `/collections/seasonal` loads; filter sidebar visible
3. Click "Discounts" in header → `/collections/discount` loads; filter sidebar visible
4. Products in What's New show "New" badge where applicable
5. Breadcrumbs display correctly for all three pages
6. Sorting (Price: Low-High, etc.) works on all three pages
7. Filter selection narrows results correctly (e.g., filter by category within What's New)
8. Mobile: filter sidebar is accessible (slide-in drawer or similar)

---

## Workstream 6 — Strikethrough / Savings Pricing on Discount Items

**Branch**: `feature/components/product-card-redesign` (same branch as WS3/WS4)
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context
Shawn studied Amazon, Walmart, and Target pricing displays during the meeting and confirmed:
- When a product has a `compareAtPrice` (original price) AND a lower `price` (sale price),
  show **both**: strike through the original, highlight the sale price, and show savings.
- Rule of thumb from Shawn: small savings → show as %; large savings → show as dollar amount.
  For simplicity, start with both displayed (strikethrough + "Save $X.XX").
- This applies to: product cards (homepage, collection, search) AND the PDP.
- Already-discounted products must NOT stack with promo codes — the disclaimer
  "Offers do not apply to discounted products" should appear on the Promotions & Deals page
  (WS8) and near promo code input at checkout.

### Implementation Notes
- `compareAtPrice` is already available in the Storefront API `ProductVariant` type.
  Check `fragments.ts` — if not already fetched, add `compareAtPrice { amount currencyCode }`.
- Create a `PriceDisplay` component (or update an existing one) that accepts `price` and
  `compareAtPrice`, renders:
  ```
  <span class="line-through text-muted">$compareAtPrice</span>
  <span class="text-price font-bold">$price</span>
  <span class="text-sm text-green-600">Save $X.XX</span>   // or "XX% off" for small amounts
  ```
- Savings display logic: if savings >= $10, show dollar amount; if < $10, show percentage.
  (This matches Shawn's stated rule of thumb — confirm with him if threshold feels wrong.)
- Render on: product card price line (WS3 centered price area) AND PDP price display.

### Tasks
- [ ] Add `compareAtPrice` to product card and PDP GraphQL fragments if not already present
- [ ] Create or update `PriceDisplay` component with strikethrough + savings logic
- [ ] Apply to product card (replaces the current plain price render from WS3)
- [ ] Apply to PDP price area
- [ ] Add i18n keys: `price.save`, `price.off`, `price.original`
- [ ] Only show strikethrough when `compareAtPrice > price` (hide for non-discounted items)

### Manual Tests
1. Product card for a discounted item: original price struck through, sale price bold,
   savings amount shown (e.g., "Save $25.00" or "33% off")
2. Product card for a non-discounted item: only current price shows (no strikethrough)
3. PDP for a discounted product: same strikethrough pricing in the price area
4. PDP for a non-discounted product: only current price shown
5. Savings threshold: item saving $9.99 shows "XX% off"; item saving $10.00+ shows "Save $X.XX"
6. Currency formatting is correct (respects locale)

---

## Workstream 7 — Category Image Sizing + Border Polish

**Branch**: `feature/components/product-card-redesign` (same branch)
**Priority**: MEDIUM
**Status**: 🔲 Not Started

### Context
Shawn: "Could we make the images bigger? You see how the images is like... cutting off the
image at the bottom. We want to fully display the image." Also: "Remove the outline on the
category images." This refers to the homepage **category section squares** (the 9 category
tiles with subcategory images), not the product cards.

### Implementation Notes
- Locate the category/collection tile component (likely in `_index.tsx` or a shared
  `CollectionCard.tsx`). This is a square tile with an image + label.
- Image sizing: change from a fixed small size to `aspect-square` with `object-contain`
  (not `object-cover`) so the full image is visible without cropping. Or use `object-cover`
  with a taller aspect ratio. Test both — Shawn preferred the full image to show.
- Border removal: find the `border` or `ring` classes on the category tile container and
  remove them. Shawn said: "Yeah, we don't need that."
- Make the parent category tile larger overall (Shawn: "could you make the images bigger?").
  Increase the tile size from the current width — test at ~160–200px wide (or a grid
  percentage) so it fills the section more on desktop.

### Tasks
- [ ] Locate category tile component used in homepage category section
- [ ] Increase tile/image size so full image displays without cutoff
- [ ] Switch to `object-contain` (or adjust aspect ratio) to show full image
- [ ] Remove border/outline from category tile
- [ ] Confirm 9 tiles still fit in a single row on desktop (or 2 rows on smaller desktop)
- [ ] Mobile: tiles still usable (scroll or wrap)

### Manual Tests
1. Homepage category section: all 9 tiles display full images without cutoff
2. No gray or colored border visible around category tile images
3. Desktop (1440px): tiles are visibly larger than before; section feels substantial
4. Mobile (375px): tiles accessible (horizontal scroll or wrap to 2–3 columns)
5. Tile label (category name) still visible below or over the image

---

## Workstream 8 — Promotions & Deals Dedicated Page

**Branch**: `feature/templates/promotions-deals-page`
**Priority**: MEDIUM
**Status**: 🔲 Not Started

### Context
Shawn decided during the meeting that "Promotions & Deals" in the header should navigate to
a **dedicated page** (not a dropdown, not an anchor). The page lists all active deals in a
clean card layout, similar to how Bell Tire displayed offers. Shawn confirmed the initial
deals on this page:

| Deal | Discount | Trigger |
|------|----------|---------|
| Sign up for newsletter | 10% off | Email capture → code delivered |
| Create an account | 15% off | Post-registration automatic |
| Refer a friend | 20% off | Friend creates account |

(Note: the 8% first-order tier was added at the APR19 meeting — include it here as well.)

Page must also include the disclaimer: **"Offers do not apply to already-discounted products."**

The homepage carousel teaser (APR19 WS11, deferred) will link to this page. The page itself
can be built now with static deal cards — wire to real Shopify discount codes in a follow-up
when Darian returns.

### Implementation Notes
- Route: `hydrogen/app/routes/promotions.tsx` (or `/pages/deals` if using Shopify page CMS).
  Prefer a Hydrogen route for full control of the layout.
- Layout: single column on mobile, 2–3 columns on desktop. Each deal is a Card:
  - Bold discount % (large, primary color)
  - Deal title ("Sign Up & Save")
  - Short description of what to do to claim
  - CTA button: "Get 10% Off" → navigates to `/account/register` or triggers newsletter modal
- Disclaimer banner: top of the page or bottom of the card grid —
  "These promotions cannot be combined with sale or already-discounted items."
- Breadcrumb: Home > Promotions & Deals
- Header link "Promotions & Deals" → `/promotions`
- i18n keys: `promos.pageTitle`, `promos.disclaimer`, `promos.cta.*`

### Tasks
- [ ] Create `hydrogen/app/routes/promotions.tsx`
- [ ] Build deal card layout (icon + %, title, description, CTA)
- [ ] Add 4 deals: 8% first order, 10% newsletter, 15% account, 20% referral
- [ ] Disclaimer banner: "Not applicable to already-discounted products"
- [ ] Wire header "Promotions & Deals" link to `/promotions`
- [ ] Breadcrumb: Home > Promotions & Deals
- [ ] i18n keys in EN/ES/FR
- [ ] Add route to `sitemap.xml` static pages list

### Manual Tests
1. Header "Promotions & Deals" → `/promotions` loads correctly
2. Page shows 4 deal cards in correct order (8%, 10%, 15%, 20%)
3. Disclaimer text visible on page
4. Each deal card CTA navigates to the correct destination:
   - 8%: add to cart → checkout (automatic, no link needed — show informational)
   - 10%: newsletter modal or `/promotions` with email capture form
   - 15%: `/account/register`
   - 20%: `/account` referral section or informational for now
5. Breadcrumb: Home > Promotions & Deals
6. Mobile: cards stack vertically; readable at 375px
7. `/promotions` appears in sitemap

---

## Workstream 9 — Blog & Media Header Dropdown

**Branch**: `feature/header/logo-nav-typography` (same branch as WS1/WS2)
**Priority**: MEDIUM
**Status**: 🔲 Not Started

### Context
Shawn described Blog & Media as a **vertical dropdown** (not a full mega-menu) showing the
latest posts/links. Since social media accounts aren't set up yet, the dropdown will show
**dead links** for social platforms and link to the Shopify blog once it's live.

Shawn's planned content strategy: blog posts via Shopify, Reddit engagement, then Instagram/
YouTube/LinkedIn as Darian sets them up. The dropdown should accommodate this as channels
become active.

### Implementation Notes
- "Blog & Media" uses a shadcn `DropdownMenu` — same pattern as `SeasonalDropdown` and `NavDropdown`.
- Dropdown items for launch:
  - **Blog** → `/blogs/news` (or Shopify blog URL — confirm with Shawn)
  - **YouTube** → dead link (render grayed out with "Coming Soon" or omit for now)
  - **Instagram** → dead link (same)
  - **LinkedIn** → dead link (same)
- For launch simplicity: only render the Blog link as an active link. Show the social platform
  names grayed out (disabled `DropdownMenuItem`). Shawn confirmed dead links are OK for now.
- Mobile: collapsible accordion section in `MobileMenu`, same as Seasonal.
- i18n keys: `nav.blogAndMedia`, `nav.blog`, `nav.youtube`, `nav.instagram`, `nav.linkedin`,
  `nav.comingSoon`

### Tasks
- [ ] Create `BlogMediaDropdown` component using shadcn `DropdownMenu`
- [ ] Active link: Blog → `/blogs/news`
- [ ] Disabled/grayed items: YouTube, Instagram, LinkedIn (with "Coming Soon" label)
- [ ] Wire into desktop nav as the 6th nav item
- [ ] Wire into mobile `MobileMenu` as collapsible section
- [ ] Add i18n keys to EN/ES/FR

### Manual Tests
1. "Blog & Media" renders as the 6th nav item on desktop
2. Clicking opens a dropdown with Blog (active) + social platforms (grayed)
3. Clicking "Blog" → `/blogs/news` (or correct Shopify blog URL)
4. Grayed social links are not clickable (or show "Coming Soon" tooltip)
5. Dropdown closes on outside click / Escape
6. Mobile: Blog & Media accordion section visible in mobile menu

---

## Workstream 10 — About Us Page

**Branch**: `feature/templates/about-us`
**Priority**: MEDIUM
**Status**: 🔲 Not Started

### Context
Shawn: "If people click on the About Us [in the footer], it should have a few things in there:
Who We Are, What We Do, and Meet the Team. That's all we really need from the About Us."

This is a content page — layout must be clean and professional. Shawn will supply the actual
copy; Derek builds the layout.

### Implementation Notes
- Route: `hydrogen/app/routes/about.tsx`
- Three sections (using anchor links in an internal tab or just stacked sections):
  1. **Who We Are** — short brand story paragraph + hero image or icon
  2. **What We Do** — value prop bullets (marketplace for micro-living, tiny homes, etc.)
  3. **Meet the Team** — team member cards (name, role, photo). Placeholder content
     until Shawn provides real names/photos.
- Footer link "About Us" → `/about`
- Breadcrumb: Home > About Us
- i18n: `about.whoWeAre`, `about.whatWeDo`, `about.meetTheTeam`, etc.

### Tasks
- [ ] Create `hydrogen/app/routes/about.tsx`
- [ ] Section 1: Who We Are (brand story placeholder)
- [ ] Section 2: What We Do (bullet points placeholder)
- [ ] Section 3: Meet the Team (placeholder cards — Derek, Shawn, Darian, Jeremiah)
- [ ] Wire footer "About Us" link to `/about`
- [ ] Breadcrumb: Home > About Us
- [ ] i18n keys in EN/ES/FR
- [ ] Add to sitemap static pages

### Manual Tests
1. Footer "About Us" link → `/about` loads
2. All three sections render: Who We Are, What We Do, Meet the Team
3. Breadcrumb: Home > About Us
4. Mobile: sections stack cleanly; team cards wrap or stack
5. `/about` appears in sitemap

---

## Workstream 11 — FAQ Page (Shopify-Admin-Driven)

**Branch**: `feature/templates/faq-page`
**Priority**: MEDIUM
**Status**: 🔲 Not Started

### Context
Shawn has FAQ content ready and needs a place to enter it. Derek said: "I'll see if I can
make a section in Shopify admin for FAQs so you can just add them in there and then anything
you add in there, it'll automatically display."

The implementation should pull FAQ data from Shopify (either a Shopify Page with structured
content or a metaobject) so Shawn can manage it without a code deploy.

### Implementation Notes
- **Option A — Shopify Page (simplest)**: Create a Shopify page with handle `faq` in admin.
  Shawn writes FAQ content as rich text. Hydrogen renders it via the `pages.$handle.tsx` route
  (which already exists) — no new code needed, just tell Shawn the handle. BUT this gives no
  structured accordion layout.
- **Option B — Metaobject (recommended)**: Define a `faq_item` metaobject in Shopify admin
  (fields: `question` single-line text, `answer` multi-line text, `order` integer).
  Hydrogen fetches all `faq_item` metaobjects, sorted by `order`, and renders them as a
  shadcn `Accordion`. Shawn adds/edits FAQ items in Shopify admin → page updates automatically.
- Go with **Option B** — cleaner UX and the accordion pattern already exists in shadcn.
- Route: `hydrogen/app/routes/faq.tsx`
- Breadcrumb: Home > FAQ
- Footer link "FAQ" → `/faq`

### Tasks
- [ ] Define `faq_item` metaobject in Shopify admin (question, answer, order fields)
  — provide Shawn with setup instructions (field names, types)
- [ ] Add `FAQ_QUERY` to `faq.tsx` loader — fetch all `faq_item` metaobjects, sort by `order`
- [ ] Render as shadcn `Accordion` (one item per FAQ question)
- [ ] Wire footer "FAQ" link to `/faq`
- [ ] Breadcrumb: Home > FAQ
- [ ] i18n keys: `faq.pageTitle`, `faq.empty`
- [ ] Add to sitemap static pages

### Shawn's Admin Task
- Add FAQ items via Shopify admin → Content → Metaobjects → FAQ Item

### Manual Tests
1. Footer "FAQ" → `/faq` loads
2. Accordion renders all FAQ items Shawn has entered
3. Click question → answer expands; click again → collapses
4. Multiple items can be open simultaneously (or only one — match shadcn default)
5. Breadcrumb: Home > FAQ
6. Empty state: if no FAQ items exist, show a friendly "Check back soon" message
7. Mobile: accordion items readable and tappable at 375px

---

## Workstream 12 — Newsletter Signup Component

**Branch**: `feature/components/newsletter-signup`
**Priority**: LOW
**Status**: 🔲 Not Started

### Context
Shawn: "At the bottom [of the homepage] sign up for Hy-lee's news and updates, get 10% off."
The newsletter signup CTA should appear:
1. As a **section on the homepage** between the promotions carousel and the footer
2. The 10% discount code delivery will be handled by Klaviyo (when Darian configures it);
   for now the form captures the email and shows a success state

This is the email capture entry point for the 10% newsletter deal from the Promotions page.

### Implementation Notes
- Create a `NewsletterSignup` section component: full-width band with headline
  ("Sign Up & Save 10%"), subline ("Be the first to know about deals and new arrivals"),
  email input + "Subscribe" button, and the deal disclaimer below.
- On submit: POST email to a Hydrogen action or to Klaviyo API (stub for now — show success
  state: "You're subscribed! Your 10% off code is on its way.")
- Disclaimer below form: "10% discount applies to your first purchase. Cannot be combined
  with other offers on already-discounted products."
- Design: use primary/secondary brand colors for the band background — not generic gray.
- i18n keys: `newsletter.*`

### Tasks
- [ ] Create `NewsletterSignup` component
- [ ] Wire into `_index.tsx` homepage as a section above the footer
- [ ] Email capture form with success state (Klaviyo integration stubbed, TODO noted)
- [ ] Disclaimer text below form
- [ ] i18n keys in EN/ES/FR

### Manual Tests
1. Homepage scrolled near footer: newsletter signup band is visible
2. Enter email + click Subscribe → success message appears
3. Empty submit → validation fires ("Please enter your email")
4. Invalid email format → validation fires
5. Disclaimer text visible below form
6. Mobile: form input and button stack vertically; readable

---

## Workstream 13 — Furniture Free Shipping Badge

**Branch**: `feature/components/newsletter-signup` (or product-card-redesign if done first)
**Priority**: LOW
**Status**: 🔲 Not Started

### Context
Shawn: "I was thinking of making our entire furniture segment free shipping because technically
for us it's free shipping — our supplier bakes the shipping cost into the price." He wants to
surface this as a **marketing label** ("Free Shipping") on furniture product cards and PDPs.

### Implementation Notes
- Identify furniture products by their Shopify collection membership (`furniture` collection
  handle) OR by a product tag (`free-shipping` or `furniture`). Tags are easier — Shawn can
  apply them in admin.
- On the product card: add a small "Free Shipping" badge (secondary/teal color) below the
  price, similar to the "New" badge pattern already in use.
- On the PDP: add "Free Shipping" callout near the price/shipping area.
- Do NOT hardcode the furniture collection handle — use a `free-shipping` tag so Shawn can
  apply it to any product, including future furniture lines.
- i18n key: `product.freeShipping`

### Tasks
- [ ] Confirm with Shawn: use `free-shipping` tag on products (easiest for admin)
- [ ] Add `tags` to product card and PDP GraphQL fragments (if not already fetched)
- [ ] Product card: render "Free Shipping" badge when `tags.includes('free-shipping')`
- [ ] PDP: render "Free Shipping" text/icon near shipping info
- [ ] Add i18n key to EN/ES/FR

### Manual Tests
1. Furniture product card: "Free Shipping" badge visible below price
2. Non-furniture product card: no badge
3. PDP for furniture product: "Free Shipping" label visible near price
4. PDP for non-furniture product: no label
5. Mobile: badge doesn't cause layout overflow

---

## Shared Pre-Commit Checklist

Run before EVERY commit. No exceptions.

```bash
pnpm format              # auto-fix formatting
pnpm format:check        # verify clean
pnpm typecheck           # must pass (run manually — pre-commit hook disabled due to memory)
pnpm build               # must pass (catches SSR errors typecheck misses)
pnpm test                # unit tests must pass
```

---

## Shared Manual Regression Checklist

Run after each workstream lands to catch regressions.

- [ ] Homepage loads without auth prompt (incognito)
- [ ] Header: logo far left; 6 nav items bold and readable; language switcher present
- [ ] Categories dropdown still opens/closes correctly
- [ ] Seasonal dropdown still opens/closes correctly
- [ ] All header right-side items present: Language | Account | Orders & Returns | Cart
- [ ] Add to cart → cart drawer opens → checkout reachable
- [ ] PDP renders: images, title, price (with strikethrough if discounted), variant selector
- [ ] PDP lightbox: click image → opens; arrows navigate; Escape closes
- [ ] Collection pages: filter sidebar visible; products display; pagination works
- [ ] Product cards: consistent layout across homepage, collection, and search
- [ ] Account login/register still works (auth pages not broken by header changes)
- [ ] Mobile (375px): no horizontal overflow; nav accessible; carousels usable
- [ ] No hardcoded hex colors introduced (use CSS tokens)
- [ ] No TypeScript `any` types introduced

---

## Shawn's Action Items (not code)

- [ ] Create `what-s-new` collection in Shopify admin (automated: tag = `new` OR createdAt < 30d)
- [ ] Create `seasonal` collection in Shopify admin; add current seasonal products
- [ ] Create `discount` collection in Shopify admin (automated: compareAtPrice is set)
- [ ] Set `menu_priority_order` on seasonal child collections to control dropdown order
- [ ] Define `faq_item` metaobject schema in Shopify admin (question, answer, order)
- [ ] Enter FAQ content in Shopify admin metaobjects once schema is live
- [ ] Apply `free-shipping` tag to all furniture products in admin
- [ ] Populate About Us page copy (Who We Are, What We Do, team bios + photos)
- [ ] Confirm exact Shopify collection handles for What's New, Seasonal, Discount
- [ ] Set up Midjourney account (tech marketing email) and test video generation for hero
- [ ] Confirm Shopify blog URL handle (for Blog & Media dropdown link)
- [ ] Assign Darian: social media accounts setup (Instagram, YouTube, LinkedIn)
- [ ] Enter Terms of Use and Privacy Policy content in Shopify admin → Online Store → Policies

## Jeremiah's Action Items

- [ ] Notify Jeremiah when site is deploy-ready so he can begin analytics tagging
- [ ] Jeremiah: develop analytics schema + KPI documentation (mobile-first)
- [ ] Jeremiah: schedule paired spec debug session with Derek (WS7 of APR19 plan)
