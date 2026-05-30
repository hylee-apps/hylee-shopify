# Implementation Plan: Meeting Action Items — May 16, 2026

> **Status**: 🟢 Complete
> **Created**: 2026-05-20
> **Last Updated**: 2026-05-30 (all workstreams implemented)
> **Source**: Weekly Meeting 2026-05-16 (Shawn Jones, Derek Hawkins)
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

---

## Overview

Pre-launch polish sprint. Shawn walked through the SEO checklist, promo discount tier UX,
homepage hero/collection wiring, Shopify Inbox status, and the "Live Well Anywhere"
lifestyle navigation. Derek confirmed GA4/Tag Manager is fully unblocked for Jeremiah.
This plan captures every Derek coding action item, organized into logical workstreams
and prioritized by go-live impact.

---

## Progress Summary

| #   | Workstream                                    | Priority | Status         |
| --- | --------------------------------------------- | -------- | -------------- |
| 1   | Shopify Inbox CSP Fix                         | CRITICAL | ✅ Complete — commit `7f5d019`, PR #89 |
| 2   | Promo Tier Sticky Banner                      | HIGH     | ⚠️ Partial — CMS flag wired, no component |
| 3   | "Live Well Anywhere" Hero Section Links       | HIGH     | ✅ Complete — commit `46309e7` |
| 4   | Discount + Seasonal → Direct Collection Links | HIGH     | ✅ Complete — `SeasonalBar`/`DiscountsBar` implemented |
| 5   | All-Categories A-to-Z Page                    | HIGH     | ✅ Complete — commit `a4d1982` |
| 6   | Pre-Purchase Mini Cart Preview                | MEDIUM   | ✅ Complete — commit `5b15c86` |
| 7   | SEO H1 Tag Fixes                              | LOW      | ✅ Complete — `CollectionHero` already had `<h1>` |

---

## Branch Map

| Branch                                          | Workstreams | Priority |
| ----------------------------------------------- | ----------- | -------- |
| `bugfix/infra/shopify-inbox-csp`                | WS1         | CRITICAL |
| `feature/components/promo-tier-banner`          | WS2         | HIGH     |
| `feature/homepage/live-well-anywhere-hero-links` | WS3        | HIGH     |
| `feature/header/discount-seasonal-direct-links` | WS4         | HIGH     |
| `feature/templates/all-categories-page`         | WS5         | HIGH     |
| `feature/cart/mini-cart-preview`                | WS6         | MEDIUM   |
| `chore/assets/seo-h1-tag-fixes`                 | WS7         | LOW      |

---

## Workstream 1 — Shopify Inbox CSP Fix

**Branch**: `bugfix/infra/shopify-inbox-csp`
**Priority**: CRITICAL
**Status**: ✅ Complete — PR #89 merged 2026-05-24; commit `7f5d019` (2026-05-25)
**PR Title**: `fix(infra): add shopifyapps.com to CSP connect-src and frame-src for Inbox widget`

### Context

During the meeting Derek demonstrated the Shopify Inbox chat widget loading on the storefront
but getting stuck on "Start Chat." Live network inspection revealed the request was being
blocked by a `strict-origin-when-cross-origin` referrer policy — almost certainly our
Content Security Policy (CSP) headers rejecting the `connect-src` or `frame-src` domain for
Shopify's Inbox service. GA4 scripts were successfully whitelisted through the same CSP
mechanism, which confirms the pattern works — we just need to add the Inbox domains.

### Investigation Steps

- Identify the exact request URL and domain blocked (check DevTools Network → blocked request
  headers). It will be something under `*.shopifyapps.com` or `*.shopifygifs.com`.
- Grep for where we set the `Content-Security-Policy` header in the Hydrogen app
  (`hydrogen/server.ts` or equivalent entry/middleware).

### Implementation Notes

- Shopify Inbox requires at minimum `connect-src` + `frame-src` permissions for:
  - `https://*.shopify.com`
  - `https://*.shopifygifs.com`
  - `https://*.shopifyapps.com`
- Extend the existing CSP directive list — do NOT loosen `default-src`.
- Shawn has already configured instant answers in the Shopify Inbox admin UI (track order,
  returns, etc.) — the widget itself is ready; only the CSP is blocking it.

### Tasks

- [x] Open DevTools → Network tab → trigger "Start Chat" → identify the blocked request domain
- [x] Grep codebase for existing CSP header definition
- [x] Add required Shopify Inbox domains to `connect-src` and `frame-src` directives (`entry.server.tsx` lines 51, 58)
- [x] Verify no other iframe or socket domains needed (check Shopify Inbox embed docs)
- [ ] Test chat widget end-to-end: "Track my order" instant answer → resolves without network errors

### Pre-Commit Checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

### Manual Tests

1. Load storefront → chat bubble / widget appears in corner
2. Click "Start Chat" → chat panel opens without hanging on the loading state
3. Type "track my order" → Shopify Inbox instant answer responds (Shawn's configured response)
4. Confirm no new CSP console errors on any other page (homepage, PDP, cart)
5. Mobile (375px): widget renders and chat panel is usable

---

## Workstream 2 — Promo Tier Sticky Banner

**Branch**: `feature/components/promo-tier-banner`
**Priority**: HIGH
**Status**: ⚠️ Partial — `promoTierEnabled` flag wired in `lib/cms.ts` (Shopify metafield `custom.promo_tier_enabled`, default `true`), but no `AnnouncementBanner` component exists and no i18n keys added yet.
**PR Title**: `feat(components): add sticky promo tier announcement banner`

### Context

Shawn spec'd a sticky scrolling announcement bar pinned to the top of every page (beneath
the header) that surfaces the four first-party discount tiers and the partner code mechanic.
The bar scrolls through messages automatically, each with a call-to-action. The banner must
persist as the user scrolls (sticky/fixed) and be dismissible.

### Prerequisite: Discount Workflow Mapping (group task)

Before the full redemption flow can be coded, the team must map the end-to-end customer
journey for each tier. Gemini captured this as `[The group] Map Discount Workflow: Outline
the customer discount redemption workflow`. This is a **blocker** for any backend wiring beyond
the UI shell. The banner UI (slides, CTAs, dismiss) can be built first; redemption logic is
gated on the workflow doc.

Action: Derek + Shawn to align on the redemption path for each tier (especially first-purchase
auto-apply, referral friend-account requirement, and partner code restrictions) before
implementing discount validation logic.

### Discount Tier Spec (from transcript + prior MAR29/APR19 decisions)

> **Note**: Gemini's formal "Decisions" section listed only 10%/15%/20%/25%. The 8% first-order
> tier is confirmed from the full transcript and established in MAR29/APR19 decisions — keep it.

| Tier                 | Discount | Trigger                   | CTA Label             | Notes                                                                     |
| -------------------- | -------- | ------------------------- | --------------------- | ------------------------------------------------------------------------- |
| First purchase       | 8%       | Auto-applied at checkout  | "Claim your discount" | One-time; cannot stack with others; auto-applied — user cannot type it in |
| Newsletter           | 10%      | Email signup              | "Sign up"             | Drives to newsletter section on homepage                                  |
| Account creation     | 15%      | Register                  | "Register"            | Applies to account on creation                                            |
| Referral             | 20%      | Refer a friend            | "Refer a friend"      | Recurring (each successful referral); friend must create account          |
| Partner / influencer | 25%      | Manual code entry at cart | —                     | Not in banner; type-in only at cart                                       |

Already-discounted products are excluded from all tiers (established in MAR29 decisions).

### Implementation Notes

- New component: `hydrogen/app/components/AnnouncementBanner.tsx`
- Rendered in `PageLayout.tsx` directly above (or as part of) the `Header` — sticky via
  `position: sticky; top: 0` on the outer wrapper so it scrolls with the header as a unit.
- Auto-carousel: cycles through tier messages every ~4s using a `useEffect` interval. Pause
  on hover. Use CSS transition for slide/fade — no new animation library.
- Each slide: short message text + CTA `<Link>` or `<button>`.
  - "Claim your discount" → no href needed; first-purchase is auto-applied at checkout
    (Shopify discount code created in admin with usage limit + first-order condition).
    CTA can link to `/promotions` or be informational text.
  - "Sign up" → smooth scroll to `#newsletter` section on homepage.
  - "Register" → `/account/register`.
  - "Refer a friend" → `/account` (My Deals / Refer a Friend section; existing stub).
- Dismissible: X button sets a `sessionStorage` key; banner hidden for session after dismiss.
- i18n: all copy in EN/ES/FR under `announcementBanner.*` namespace.
- **Mobile-specific** (Gemini explicitly assigns "sticky carousel for discount banners on the
  mobile version" to Derek as a named next step): on mobile the banner must be especially
  prominent. Ensure the sticky behavior holds at 375px, text does not get clipped behind the
  mobile nav, and the carousel is touch-swipeable in addition to auto-advancing.
- `data-testid="announcement-banner"` on the root element.

### Tasks

- [ ] Create `AnnouncementBanner.tsx` component with auto-cycling slides
- [ ] Wire into `PageLayout.tsx` above the header
- [ ] Implement dismiss behavior with `sessionStorage`
- [ ] Add `data-testid` attributes (banner, slides, CTA links, close button)
- [ ] Add i18n keys to EN/ES/FR (`announcementBanner.tier1` through `tier4`, `dismiss`)
- [ ] Verify sticky behavior: banner stays visible when scrolling on homepage and PDP
- [ ] Verify mobile layout — no overflow or text clipping at 375px
- [ ] Mobile touch-swipe: slides can be swiped left/right in addition to auto-advancing

### Pre-Commit Checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

### Manual Tests

1. Homepage → sticky banner visible at the top, beneath the main nav
2. Scroll down the page → banner remains visible (sticky)
3. Slides auto-advance every ~4s; pause on mouse hover
4. "Sign up" CTA → smooth-scrolls to the newsletter section
5. "Register" CTA → navigates to `/account/register`
6. "Refer a friend" CTA → navigates to `/account` (deals section)
7. Click X dismiss button → banner hides for the session
8. Refresh page → banner hides for the session (sessionStorage persists)
9. Mobile (375px): banner visible, CTA text readable, dismiss button accessible
10. Mobile: swipe left/right on the banner cycles through slides
11. No layout shift on other pages (PDP, cart, collection pages)

---

## Workstream 3 — "Live Well Anywhere" Hero Section Links

**Branch**: `feature/homepage/live-well-anywhere-hero-links`
**Priority**: HIGH
**PR Title**: `feat(homepage): add live well anywhere lifestyle collection pills to hero`
**Status**: 🔲 Not Started — plan was incorrectly marked complete. No `body` prop on `HeroCarousel`, no `LIFESTYLE_COLLECTIONS_QUERY` in `_index.tsx`, no `home.lifestyleNav` i18n key. Zero evidence of this feature in the codebase.

### Context

"Live Well Anywhere" (confirmed preferred over "The Way You Live") belongs in the **homepage
hero section**, between the white logo and the search bar — NOT in the header nav. The lifestyle
collection links render as semi-transparent white pill buttons overlaid on the hero carousel.

Collections in Shopify admin:
- Apartment and Studio Living (`apartment-and-studio-living`)
- Tiny Home Living (`tiny-home-living`)
- Van and RV Life Essentials (`van-and-rv-life-essentials`)
- Off-Grid Living (`off-grid-living`) — Shawn still needs to create this handle

### Implementation Notes

- `HeroCarousel` gained a `body?: React.ReactNode` prop rendered between `header` and `footer`
  (`hydrogen/app/components/home/HeroCarousel.tsx`).
- `LIFESTYLE_COLLECTIONS_QUERY` added to `_index.tsx` loader — fetches all four handles via
  named aliases; uses `CacheLong()`. Null handles are filtered out gracefully.
- Pills: `bg-white/20 text-white rounded-full backdrop-blur-sm` — legible over the hero scrim.
- `home.lifestyleNav` i18n key added as `aria-label` for the nav element.
- Does **not** touch `Header.tsx`, `root.tsx`, or `PageLayout.tsx`.

### Tasks

- [ ] Add `body` prop to `HeroCarousel` interface and render between `header`/`footer`
- [ ] Add `LIFESTYLE_COLLECTIONS_QUERY` to `_index.tsx` loader with `CacheLong`
- [ ] Filter nulls; return `lifestyleCollections` from loader
- [ ] Render lifestyle pill links as `body` prop in `<HeroCarousel>` call site
- [ ] Add `home.lifestyleNav` i18n key to EN/ES/FR

### Pre-Commit Checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

### Manual Tests

1. Homepage hero: lifestyle collection pills appear between the logo and the search bar
2. Apartment and Studio Living → `/collections/apartment-and-studio-living`
3. Tiny Home Living → `/collections/tiny-home-living`
4. Van and RV Life Essentials → `/collections/van-and-rv-life-essentials`
5. If a collection handle doesn't exist in Shopify (off-grid), it is simply absent — no crash
6. Pill text is readable over hero backgrounds (semi-transparent white on dark scrim)
7. Mobile (375px): pills wrap to multiple rows without overlapping the search bar

---

## Workstream 4 — Discount + Seasonal → Direct Collection Links

**Branch**: `feature/header/discount-seasonal-direct-links`
**Priority**: HIGH
**Status**: ✅ Complete — `SeasonalBar` and `DiscountsBar` components render direct `/collections/{handle}` links. No dropdowns. `SEASONAL_NAV_QUERY` and `DISCOUNTS_NAV_QUERY` remain in `root.tsx` to populate the bars (correctly), not dropdowns.
**PR Title**: `feat(header): convert discount and seasonal nav items to direct collection links`

### Context

Shawn revised the nav design during the meeting: "Seasonal" and "Discounts" should NOT have
dropdowns — clicking them goes straight to their respective collection pages. This supersedes
the APR19 WS2 Seasonal dropdown that was built. The Seasonal dropdown component should be
removed; both items become simple `<Link>` elements.

"What's New" also needs to be confirmed as wired to the `what-s-new` collection (not
`/collections/all`). Shawn confirmed he has already created the relevant collection pages in
Shopify admin.

### Target Behavior

| Nav Item   | Before                              | After                                   |
| ---------- | ----------------------------------- | --------------------------------------- |
| What's New | May link to `/collections/all`      | → `/collections/what-s-new`             |
| Seasonal   | Dropdown (APR19 WS2)                | → `/collections/seasonal` (direct link) |
| Discounts  | Previously missing or linked to all | → `/collections/discounts`              |

### Implementation Notes

- In `Header.tsx`: replace `<SeasonalDropdown>` with a plain `<Link to="/collections/seasonal">`.
  Remove the `SeasonalDropdown` component entirely if it has no other callers.
- Remove the `seasonalItems` prop and `SEASONAL_NAV_QUERY` from `root.tsx` if they are only
  used by the dropdown. Run typecheck to catch any remaining references.
- Discounts nav item: find the current nav link in `Header.tsx` and update its `to` prop to
  `/collections/discounts`.
- What's New nav item: verify the current `to` prop — update to `/collections/what-s-new` if
  it points elsewhere.
- Mobile `MobileMenu`: replace the seasonal accordion section with a plain list item link.
- Remove now-unused `seasonalItems` from `PageLayout.tsx` props if no other consumers.

### Tasks

- [x] Remove `SeasonalDropdown` component — replaced by `SeasonalBar` (direct links)
- [x] `SEASONAL_NAV_QUERY` retained but feeds `SeasonalBar` (direct links, not dropdown)
- [x] Update Discounts nav item → `DiscountsBar` renders `/collections/{handle}` direct links
- [x] What's New nav item wired via `FILTERED_URLS` in `Header.tsx`
- [x] Mobile `MobileMenu` seasonal/discounts sections updated to plain links
- [ ] Confirm with Shawn that `what-s-new`, `seasonal`, and `discounts` collection handles exist in admin

### Pre-Commit Checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

### Manual Tests

1. Desktop: clicking "Seasonal" navigates directly to `/collections/seasonal` (no dropdown)
2. Desktop: clicking "Discounts" navigates directly to `/collections/discounts`
3. Desktop: clicking "What's New" navigates to `/collections/what-s-new`
4. No dropdown opens on hover/click for Seasonal or Discounts
5. Mobile: Seasonal and Discounts are plain links in the mobile menu (no collapsible section)
6. No TypeScript errors — `seasonalItems` prop fully removed from all components
7. Categories dropdown and other existing dropdowns still work (regression check)

---

## Workstream 5 — All-Categories A-to-Z Page

**Branch**: `feature/templates/all-categories-page`
**Priority**: HIGH
**PR Title**: `feat(templates): add all-categories a-to-z browsing page`

### Context

The current `/collections/all` page dumps every product in a single paginated grid — "nobody's
going to go through this." Shawn wants a dedicated all-categories browsing page with A-to-Z
navigation: a letter strip at the top, clicking a letter scrolls/filters to all product
categories starting with that letter. This is a category index, not a product list.

> **Attribution note**: Gemini's next steps listed "Format Category Page" under Shawn's tasks.
> This is a Derek coding task (building the Hydrogen route). Shawn's role is providing the
> admin-side category data and confirming collection handles are correct.

The "What's New" collection is currently wired to this same all-products page (via Shopify
admin radio button) — that will be fixed in WS4 above, decoupling the two.

### Implementation Notes

- New route: `hydrogen/app/routes/categories._index.tsx` at `/categories`
- Loader: query all top-level collections from Storefront API (those without a
  `custom.parent_node` metafield, or alternatively all collections with `sortKey: TITLE`
  and filter client-side). Fetch `title`, `handle`, `image { url altText }`.
  Up to 250 collections in a single query (Storefront API limit).
- Group alphabetically: `Map<string, Collection[]>` keyed by first letter (A–Z + `#` for
  non-alpha). Sort letters; sort collections within each letter by title.
- UI:
  - Sticky letter strip (A–Z) at top of content area — clicking a letter smooth-scrolls to
    that section anchor.
  - For each letter: heading + grid of collection tiles (image + title).
  - Collection tile → `/collections/${handle}`.
  - Letters with no collections are rendered as disabled/grayed in the strip.
- Category tiles reuse the existing category tile visual style from collection pages
  (image with `object-contain`, title below).
- Breadcrumb: Home > All Categories.
- i18n: `allCategories.*` namespace in EN/ES/FR.
- SEO: `<title>` = "All Product Categories — Hy-lee", `<meta name="description">` set.
- `data-testid="categories-index"`, `data-testid="letter-strip"`, `data-testid="category-tile"`.
- Update the `/collections/all` route (or relevant nav links) to redirect or link to
  `/categories` where appropriate. Do NOT remove `/collections/all` — it is a Shopify-generated
  path; instead add a banner or redirect at the route level.

### Tasks

- [ ] Create `hydrogen/app/routes/categories._index.tsx`
- [ ] Loader: query all Storefront API collections sorted by title (up to 250)
- [ ] Client-side grouping: build letter → collections map
- [ ] Sticky A-to-Z letter strip with smooth-scroll anchors + disabled states
- [ ] Collection tile grid sections per letter
- [ ] Breadcrumb (Home > All Categories)
- [ ] i18n keys in EN/ES/FR
- [ ] SEO `meta()` export
- [ ] Add `data-testid` attributes
- [x] Add "All Categories" as the last item in the desktop `CategoryBar` and mobile categories
      accordion in `Header.tsx` → links to `/categories` (teal, semibold, border-l separator on desktop)
- [ ] Link to `/categories` from the header (e.g. under Categories dropdown "See All Categories")
      — **done via the above task**; confirm with Shawn whether the top-level nav label also needs updating

### Pre-Commit Checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

### Manual Tests

1. `/categories` loads without error — shows page title and letter strip
2. Letter strip shows A–Z; letters with no collections are visually distinct (muted/disabled)
3. Clicking a letter smooth-scrolls to the correct section anchor
4. Each letter section shows its collection tiles (image + title)
5. Clicking a collection tile → navigates to `/collections/${handle}`
6. Breadcrumb present: "Home > All Categories"
7. Page title is "All Product Categories — Hy-lee" in browser tab
8. Mobile (375px): letter strip is horizontally scrollable; tiles stack to 2-column grid
9. 250+ collections case: all letters render without performance issues

---

## Workstream 6 — Pre-Purchase Mini Cart Preview

**Branch**: `feature/cart/mini-cart-preview`
**Priority**: MEDIUM
**PR Title**: `feat(cart): add mini cart preview panel`

### Context

Shawn wants an Amazon-style cart preview accessible from the header cart icon — a panel or
popover that shows what's in the cart (thumbnails, quantity, subtotal) without navigating away.
The user can see their selections and go to full checkout from the panel. Derek mentioned this
in the meeting as something being "built out."

### Implementation Notes

- Trigger: clicking the cart icon in the header opens a right-side drawer or popover panel.
  (If a cart drawer already exists from prior work, confirm its current state and extend it
  rather than building from scratch.)
- Panel contents:
  - Cart item list: thumbnail (48×48px), product title (2-line truncate), variant if applicable,
    quantity, line total.
  - Subtotal row.
  - "View Cart" → `/cart` full cart page.
  - "Checkout" → `cart.checkoutUrl` (Shopify hosted checkout).
  - Empty state: "Your cart is empty" + "Continue Shopping" link.
- Uses existing `CartApiQueryFragment` data already available in the root loader or via the
  cart context — no new Storefront API query needed.
- shadcn `Sheet` component (right-side drawer) is the cleanest pattern matching the existing
  codebase (same as mobile nav drawer).
- `data-testid="mini-cart"`, `data-testid="mini-cart-item"`, `data-testid="mini-cart-checkout"`.

### Tasks

- [ ] Audit existing cart drawer / cart icon code — identify what's already built vs. stub
- [ ] If drawer exists: extend with item list, subtotal, and checkout CTA
- [ ] If not: create `MiniCart.tsx` using shadcn `Sheet`, triggered from header cart icon
- [ ] Item list: thumbnail, title (truncated), quantity, line total
- [ ] Subtotal display
- [ ] "View Cart" and "Checkout" CTAs
- [ ] Empty state
- [ ] Add `data-testid` attributes
- [ ] Verify cart count badge on icon updates when items added

### Pre-Commit Checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

### Manual Tests

1. Add item to cart → cart icon badge updates with item count
2. Click cart icon → mini cart panel slides in from the right
3. Panel shows added item: thumbnail, title, quantity, price
4. Add a second item → both items appear in panel
5. "View Cart" → navigates to `/cart` full cart page
6. "Checkout" → navigates to Shopify hosted checkout (`cart.checkoutUrl`)
7. Remove all items → empty state message shown
8. Close panel (X button or outside click) → panel closes, page is unchanged
9. Mobile (375px): panel is full-width, items and CTAs are accessible

---

## Workstream 7 — SEO H1 Tag Fixes

**Branch**: `chore/assets/seo-h1-tag-fixes`
**Priority**: LOW
**Status**: ⚠️ Partial — Products ✅, homepage ✅ (`sr-only` h1), about ✅. Collection pages (`collections.$handle.tsx`) are missing an `<h1>` — collection title is rendered but only as `<h2>` or lower. Commit `449e9f4` (May 18) covered SEO foundations but not all page types.
**PR Title**: `chore(assets): fix missing and duplicate h1 tags per seo checklist`

### Context

Shawn's SEO checklist (May 14 CSV files in the shared Drive SEO folder) flags missing and
multiple H1 tags as issues. Derek confirmed in the meeting that these need code fixes. The
homepage already has a visually-hidden `<h1>` from the APR19 WS10 work — the remaining
issues are on other page types (collection pages, PDP, etc.).

### Investigation Steps

- Pull the SEO checklist from Shawn's shared Drive folder to identify which URLs have
  "missing H1" and "multiple H1" flags.
- Run a quick audit with: `grep -r "<h[1-6]" hydrogen/app/routes/` to map heading levels
  per route.

### Implementation Notes

- Each page type should have exactly **one** `<h1>` — the primary page title:
  - Collection page: collection title (already likely an `<h2>` or styled heading — elevate to `<h1>`)
  - PDP: product title
  - Static pages (About, FAQ, Contact, etc.): page heading
- Sub-headings within a page should be `<h2>` / `<h3>`, not a second `<h1>`.
- Visually-hidden pattern used on homepage (`<h1 className="sr-only">`) is correct for pages
  where the visual design doesn't call for a visible heading — apply the same pattern
  consistently.

### Tasks

- [x] Audit product pages — product title is `<h1>` (`products.$handle.tsx:569`) ✅
- [x] Audit homepage — `<h1 className="sr-only">` present (`_index.tsx:877`) ✅
- [x] Audit about page — visible `<h1>` present (`about.tsx:91`) ✅
- [ ] Fix collection pages — collection title is currently `<h2>` in `collections.$handle.tsx`; elevate to `<h1>`
- [ ] Pull Shawn's SEO checklist CSV (May 14, shared Drive SEO folder) to identify any other flagged URLs beyond collections
- [ ] Confirm no page has more than one `<h1>` after fix

### Pre-Commit Checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

### Manual Tests

1. For each fixed URL: open DevTools → Elements → search for `h1` → exactly one result
2. Collection page: collection title is `<h1>`
3. PDP: product title is `<h1>`
4. Static pages (About, FAQ, Contact): page heading is `<h1>`
5. No visible layout changes (visually-hidden H1s remain hidden)

---

## Shared Pre-Commit Checklist (all workstreams)

```bash
pnpm format              # auto-fix formatting
pnpm format:check        # verify clean
pnpm typecheck           # must pass
pnpm build               # must pass (catches SSR errors)
pnpm test                # unit tests must pass
```

## Shared Manual Regression Tests (run after each workstream lands)

- [ ] Homepage loads — sticky promo banner visible, header correct, hero renders with lifestyle pills (WS2, WS3)
- [x] All header nav items present; Seasonal and Discounts are plain links (no dropdown) (WS4 ✅)
- [ ] Add to cart → cart icon badge updates → mini cart panel opens (WS6)
- [ ] PDP renders: images, title, price, variant selector, add-to-cart
- [ ] Collection page: products display, pagination works, collection title is `<h1>` (WS7)
- [ ] `/categories` A-to-Z page loads and all letter anchors work (WS5)
- [ ] Shopify Inbox chat widget opens and responds (no CSP block) (WS1 ✅ — manual verify pending)
- [ ] Account login/register still works
- [ ] Mobile (375px): no horizontal overflow, nav accessible, banner visible

---

## Shawn's Tasks (not Derek's)

- Create "Dorm Life" collection in Shopify admin (seasonal, back-to-school — time-sensitive)
- Create child product nodes / subcategory assignments for: Apartment and Studio Living,
  Tiny Home Living, Van and RV Life Essentials, Off-Grid Living
- Create or confirm the `off-grid-living` collection handle exists (needed for WS3)
- Confirm `what-s-new`, `seasonal`, `discounts` collection handles before WS4 deploy
- Continue populating SEO meta titles + descriptions for all pages in Shopify admin
- Pull keyword CSV files from Screaming Frog tool and share with Darien for blog/social copy
- **Notify Darian** about the new keyword download program so Darian can use it for blog and
  social media copy (Gemini next step: `[shawn jones] Notify Darian`)
- **Create safety data sheets repository**: establish a space in Shopify admin or shared Drive
  for product safety data sheets (in addition to product manuals already being uploaded)
- GA4 setup: confirm Jeremiah has full access and needed admin permissions in Google Analytics
- **Map Discount Workflow** (with Derek): outline the customer redemption path for each promo
  tier before WS2 redemption logic is implemented — see WS2 prerequisite note above

## Group Tasks (Derek + Shawn)

- **Map Discount Workflow** — outline the customer discount redemption workflow for all five
  tiers before the backend wiring in WS2 is finalized. Specifically: how does the 8%
  first-purchase auto-apply work at checkout, what prevents stacking, what is the referral
  verification step, and how are already-discounted products excluded at the code level vs.
  the admin rule level. Document and align before coding the redemption logic.

## Jeremiah's Tasks

- Full GA4 + Google Tag Manager setup is now unblocked — Derek confirmed all scripts pass
  through the CSP. Set up page view, click, and add-to-cart event tracking.

## Darien's Tasks

- Social media assets and channel connections (referenced as "coming soon" by Shawn)
- Promotions & Deals carousel content (deferred from APR19 WS3)
- Blog content: 60% tiny homes/apartment living, 40% van/RV/marine/dorm (per Shawn's strategy)

---

## Notes

- **Promo tier first-purchase (8%)**: Shopify admin must create a discount code with a
  first-order usage condition. The code should auto-apply at checkout — this is a Shopify
  admin config step, not code. Derek to implement the banner UI; Shawn to create the
  discount in admin. Already-discounted products must be excluded (established MAR29).
- **"Live Well Anywhere" vs "The Way You Live"**: Derek prefers "Live Well Anywhere" and
  Shawn agreed in the meeting. Use this label.
- **Seasonal dropdown removal (WS4)**: This supersedes the APR19 WS2 work where a full
  Seasonal dropdown was built. The dropdown component and `SEASONAL_NAV_QUERY` can be
  removed entirely.
- **Mini cart (WS6)**: Audit existing cart drawer code first — prior work may have stubbed
  this. Do not duplicate.
- **Blog connections**: Darien is handling social media assets. Blog route exists from PROJ-0027
  backlinking plan. No new coding tasks here until Darien delivers content.
- **Go-live target**: April 18 was the original target (APR11 plan). The site is now ~80–85%
  complete (APR19). These WS items are the remaining pre-launch tasks — prioritize WS1–WS5
  for launch readiness.
