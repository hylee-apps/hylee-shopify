# Mobile Rollout Manual Testing Plan

**Branch:** `release/mobile-rollout` (covers Phases 0–7)
**Audience:** QA + reviewers signing off before merge to `main`
**Reference docs:** [TESTING_STRATEGY.md](../guidelines/TESTING_STRATEGY.md), [ACCESSIBILITY_STANDARDS.md](../guidelines/ACCESSIBILITY_STANDARDS.md)

This plan defines the manual passes required before `release/mobile-rollout` can merge. It complements the automated specs under `hydrogen/tests/e2e/visual/*.mobile.visual.spec.ts` — those lock pixel parity at 390px, this plan covers everything an automated test cannot: real device behavior, screen readers, network throttling, and the cross-browser/OS matrix.

---

## 0. Pre-Flight (Once, Before Testing Begins)

Run from a clean worktree on `release/mobile-rollout`:

```bash
git checkout release/mobile-rollout
git pull
pnpm install
pnpm dev    # wraps `cd hydrogen && pnpm dev`, serves on :3000
```

In a second terminal, generate the mobile visual baselines. Both halves of the repo expose this as a wrapper script — Playwright auto-starts/reuses the dev server via `playwright.config.ts:webServer`, so you can run it from either location:

```bash
# From the repo root (Recommended):
pnpm visual:mobile --update-snapshots

# Or from inside the hydrogen workspace:
cd hydrogen && pnpm visual:mobile --update-snapshots
```

> **If you see `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "visual:mobile" not found`**, you're on an older copy of the root `package.json` — pull `release/mobile-rollout` (or `main` after merge) and re-run. The wrapper script `"visual:mobile": "cd hydrogen && pnpm visual:mobile"` was added alongside this testing plan.

Reviewer must visually inspect every generated screenshot under `hydrogen/tests/e2e/visual/screenshots/mobile-chrome/` and approve before the baselines are committed. Once approved, commit the screenshots so subsequent runs catch regressions.

### Test matrix

| Surface | Browser | Viewport | Required |
|---|---|---|---|
| iPhone (real device) | Safari | native (iPhone 12+) | **Yes** |
| Android (real device) | Chrome | native (Pixel 5+ or modern Samsung) | **Yes** |
| DevTools emulation | Chrome | iPhone 12 (390×844) | Yes |
| DevTools emulation | Chrome | Pixel 5 (393×851) | Yes |
| DevTools emulation | Chrome | iPad Mini (768×1024) | Yes — verify desktop layout kicks in at lg (1024) |
| Desktop (regression) | Chrome | 1440×900 | Yes — confirm no desktop regressions |

### Cross-cutting checks (apply to **every** phase)

- [ ] **No horizontal scroll** at any viewport ≤ 1024px. Quickly confirm by dragging the page left in DevTools — nothing should reveal off-screen content.
- [ ] **All interactive elements ≥ 44×44px** at the mobile viewport (Apple HIG / WCAG 2.5.5). Spot-check by opening DevTools → Elements → hover the box model.
- [ ] **Tap-driven, not hover-driven**: any element that requires `:hover` to reveal content also works on tap.
- [ ] **No iOS zoom on focus**: tap any input on a real iPhone — the page must NOT zoom in. (Caused by inputs with `font-size < 16px`. Our `Input` component sets `text-base` on mobile.)
- [ ] **iOS safe area**: sticky bottom bars sit above the home-indicator strip, not underneath it. Verify on a real iPhone X+ (any phone with a notch/home bar).
- [ ] **Reduced motion**: with iOS Settings → Accessibility → Motion → Reduce Motion ON, animations should be instant or disabled. Same for Android Developer Options → animation scale 0.
- [ ] **Pre-commit gauntlet still green** on the branch: `pnpm format:check && pnpm test && pnpm build`. (Full `pnpm typecheck` is a known pre-existing OOM; CI handles it.)

---

## Phase 0 — Foundations

**What shipped:** `StickyBottomBar`, `MobileDrawer` primitives; `headingText()` CVA; `.tap-target`/`.pb-safe`/`.pt-safe` utilities; `<640px` typography media query; Playwright `snapshotPathTemplate`; `pnpm visual:mobile`.

**Files:** [hydrogen/app/styles/app.css](../hydrogen/app/styles/app.css), [hydrogen/app/components/ui/sticky-bottom-bar.tsx](../hydrogen/app/components/ui/sticky-bottom-bar.tsx), [hydrogen/app/components/ui/mobile-drawer.tsx](../hydrogen/app/components/ui/mobile-drawer.tsx), [hydrogen/app/lib/responsive-text.ts](../hydrogen/app/lib/responsive-text.ts)

These primitives are tested transitively via Phases 1–7. No standalone manual cases.

- [ ] `pnpm visual:header` (the existing 1440px desktop spec) still passes — Phase 0's CSS changes didn't shift desktop pixels.

---

## Phase 1 — Header & Navigation

**What shipped:** `MobileSearchSheet` (top-anchored Sheet wraps `SearchAutocomplete`); language selector pill row inside the existing mobile drawer; `tap-target` on hamburger + mobile right-cluster (search/account/cart) on both header variants.

**Files:** [hydrogen/app/components/layout/Header.tsx](../hydrogen/app/components/layout/Header.tsx)

### 1.1 Mobile search Sheet (both header variants)

| Step | Expected |
|---|---|
| 1. Open `/` (home variant) on mobile | Header shows logo, hamburger left, search/account/cart icons right — no inline search bar |
| 2. Tap the search icon | Top Sheet slides down with full-width SearchAutocomplete and a close X |
| 3. Type "summer" | Autocomplete suggestions render; tapping a suggestion navigates to results |
| 4. Tap outside the Sheet (or close X) | Sheet closes; URL unchanged |
| 5. Repeat steps 2–4 on `/collections/all` (alternate variant) | Same behavior |

- [ ] All visited tap targets are ≥ 44×44 (use DevTools box model)
- [ ] On a real iPhone: tapping the input does NOT trigger zoom

### 1.2 Mobile drawer (hamburger)

| Step | Expected |
|---|---|
| 1. Tap hamburger | Left Sheet slides in with categories accordion, nav links, account section, language pills |
| 2. Tap "Categories" row | Accordion expands, lists categories from Shopify |
| 3. Tap a category link | Drawer closes, navigates to that collection |
| 4. Reopen drawer, tap **EN** / **ES** / **FR** language pills | Page reloads in selected language; pill of the active language is highlighted in `text-secondary` |

- [ ] All drawer rows are ≥ 44px tall
- [ ] Drawer doesn't push horizontal scroll on the body underneath

### 1.3 Account/cart icons

| Step | Expected |
|---|---|
| 1. Tap account icon as logged-out | Navigates to `/account/login` |
| 2. Log in, return to home, tap account icon | Navigates to `/account` dashboard |
| 3. Add a product to cart, return to home | Cart icon shows badge with count |
| 4. Tap cart icon | Navigates to `/cart` |

- [ ] Cart badge sits inside the wider tap-target (top-1 right-1, not flush corner)

### 1.4 Desktop regression

- [ ] At 1440px: search bar inline in alternate header (no Sheet trigger), language dropdown opens on click in right cluster, no visual diff vs. baseline.

---

## Phase 2 — Homepage

**What shipped:** Section h2s use `headingText({size: 'h1'})`; promo carousel slides reflow vertical on mobile + numerals scale (56→64→80px); both carousels gain `snap-x snap-mandatory`; container vertical rhythm scales.

**Files:** [hydrogen/app/routes/_index.tsx](../hydrogen/app/routes/_index.tsx)

### 2.1 Hero

| Step | Expected |
|---|---|
| 1. Open `/` on mobile | Hero carousel cycles slides; logo + search field stack centered |
| 2. Tap the search field | Behaves like the header search Sheet (Phase 1) |
| 3. Wait one full cycle | Background image/video crossfades smoothly between slides |

- [ ] No horizontal scroll
- [ ] Search field is full-width with safe horizontal padding (~16px)

### 2.2 Product carousels (What's New / Seasonal / Discounts)

| Step | Expected |
|---|---|
| 1. Locate "What's New" row | Two cards visible per row (50%-8px each) |
| 2. Swipe horizontally | Cards snap to the start of each card (snap-x snap-mandatory) — no drift |
| 3. Tap a card | Navigates to the product |
| 4. Repeat for Seasonal and Discounts | Same behavior |
| 5. At 1024px+ (lg) | Snap behavior clears — cards become a static 6-col grid |

### 2.3 Promotions carousel

| Step | Expected |
|---|---|
| 1. Scroll to "Promotions & Deals" | Each slide is ~88% viewport-wide on mobile (was ~50% before — unreadable) |
| 2. Verify slide content | Heading numerals fit inside the slide (e.g. "30" reads at 56px); subhead and description stack vertically below the numerals |
| 3. Tap the CTA inside a slide | Full-width on mobile; navigates to the promo target |
| 4. Swipe between slides | Each slide snaps into place |

- [ ] CTA button is ≥ 44px tall
- [ ] No text clipping inside any slide

### 2.4 Section heading scale

- [ ] At 390px: section h2 is ~24px ("What's New", "Promotions & Deals")
- [ ] At 768px: ~28px
- [ ] At 1440px: ~32px (matches Figma)

---

## Phase 3 — PLP (Product List Page)

**What shipped:** Both grid variants tighten `gap-5` → `gap-3 sm:gap-4 lg:gap-5`; Filters/Sort buttons get mobile-only `min-h-[44px]`; SubcategoryScrollSection gains `snap-x snap-mandatory`. The mobile filter Sheet was already in place (left-anchored shadcn Sheet inside `FilterSidebar`).

**Files:** [hydrogen/app/routes/collections.$handle.tsx](../hydrogen/app/routes/collections.$handle.tsx), [hydrogen/app/components/commerce/SubcategoryScrollSection.tsx](../hydrogen/app/components/commerce/SubcategoryScrollSection.tsx)

### 3.1 End-node PLP (`/collections/all`)

| Step | Expected |
|---|---|
| 1. Open `/collections/all` on mobile | 2-col product grid with tight 12px gaps; sidebar **not** visible |
| 2. Tap **Filters** | Left Sheet slides in with the full filter sidebar |
| 3. Apply a filter (e.g., a color tag) | Sheet closes / filter applies; chip appears in `ActiveFilterChips` row |
| 4. Tap **Sort** | Sort menu opens; selecting "Newest" updates URL + grid |
| 5. Apply 3+ filters, scroll the chip row | Chips wrap onto multiple lines (flex-wrap) |
| 6. Tap "Clear all" | All filters/sort reset |

- [ ] Filters and Sort buttons are both ≥ 44px tall on mobile, ~37px on desktop (Figma spec)
- [ ] Two product cards fit side-by-side at 390px without overlap

### 3.2 Category PLP (e.g., `/collections/furniture`)

| Step | Expected |
|---|---|
| 1. Open a parent category | Hero, then SubcategoryScrollSection, then 2-col product grid |
| 2. Swipe the subcategory row | Tiles snap to the start of each tile |
| 3. Tap a subcategory tile | Navigates to that subcollection |

### 3.3 Pagination

| Step | Expected |
|---|---|
| 1. Scroll to "Load More" | Button is full-width-ish, easy to tap |
| 2. Tap | Next page of products loads inline |

### 3.4 Desktop regression

- [ ] At 1440px: 240px sidebar visible on the left; 4 or 6 column grid (depending on PLP type); no Filters/Sort mobile buttons visible

---

## Phase 4 — PDP (Product Detail Page)

**What shipped:** 3-col grid reorders to gallery → purchase → info on mobile via `order-*`; `ProductGallery` flips to horizontal swipe thumbs on `<md` with `aspect-square` main image; `StickyMobileCTA` appears once the in-page CTA scrolls out of view; `QuantitySelector` md size 40 → 44px.

**Files:** [hydrogen/app/routes/products.$handle.tsx](../hydrogen/app/routes/products.$handle.tsx), [hydrogen/app/components/product/ProductGallery.tsx](../hydrogen/app/components/product/ProductGallery.tsx), [hydrogen/app/components/product/StickyMobileCTA.tsx](../hydrogen/app/components/product/StickyMobileCTA.tsx), [hydrogen/app/components/commerce/QuantitySelector.tsx](../hydrogen/app/components/commerce/QuantitySelector.tsx)

### 4.1 Above-the-fold layout

| Step | Expected |
|---|---|
| 1. Open any product page on mobile | Gallery on top, then Purchase panel (price + variant + qty + AddToCart), then Info accordion (Key Features / Specs / Does It Fit) |
| 2. Verify mobile only | At 768px+ (md): gallery left, info middle, purchase right (desktop spec restored) |

- [ ] Purchase panel sits **above** the info accordion on mobile (use scroll position to confirm)

### 4.2 Gallery swipe

| Step | Expected |
|---|---|
| 1. Locate the gallery on mobile | Main image is square (`aspect-square`), thumbnails strip horizontal **below** it |
| 2. Swipe the thumbnail strip | Thumbs snap into place |
| 3. Tap a thumb | Main image swaps |
| 4. Tap the main image | Lightbox opens; zoom + arrows work |
| 5. At 768px+ | Vertical thumb strip on the left, main image fixed at 480px tall (Figma spec) |

### 4.3 Quantity selector

| Step | Expected |
|---|---|
| 1. Locate the qty +/- buttons in the purchase panel | Buttons are 44×44 on mobile (use DevTools box model) |
| 2. Increment to 5 | Each tap is responsive; quantity field reflects state |
| 3. Manually type "12" into the field | Field accepts the value |

### 4.4 Sticky mobile CTA

| Step | Expected |
|---|---|
| 1. On the PDP at the top of the page | NO sticky bar visible (in-page CTA is in view) |
| 2. Scroll past the gallery and purchase panel | Sticky bottom bar appears: shows product title + price on the left, full-width Add-to-Cart button on the right |
| 3. Tap the sticky Add-to-Cart | Same effect as the in-page button — adds to cart |
| 4. Scroll back up | Sticky bar disappears once the in-page CTA re-enters the viewport |

- [ ] Sticky bar sits above iOS home-indicator strip (test on iPhone X+)
- [ ] Page wrapper has bottom padding so the bar doesn't cover the footer/recommendations

### 4.5 Variant change updates

- [ ] Selecting a different variant updates the price in **both** the in-page panel and the sticky bar

---

## Phase 5 — Cart

**What shipped:** Layout stacks (`flex-col lg:flex-row`); inline OrderSummary `hidden lg:flex`; new `MobileSummaryDrawer` triggered by sticky bar with Total + Checkout CTA; line-item card padding tightens on mobile.

**Files:** [hydrogen/app/routes/cart.tsx](../hydrogen/app/routes/cart.tsx), [hydrogen/app/components/commerce/MobileSummaryDrawer.tsx](../hydrogen/app/components/commerce/MobileSummaryDrawer.tsx)

### 5.1 Empty state

| Step | Expected |
|---|---|
| 1. Visit `/cart` with empty cart | "Your cart is empty" CTA renders cleanly; no horizontal scroll |
| 2. Tap "Continue Shopping" | Navigates to `/collections` |

### 5.2 Populated cart

| Step | Expected |
|---|---|
| 1. Add at least 2 different products from PDP | Cart icon shows correct count |
| 2. Visit `/cart` | Single-column layout: items card on top, promo code card below; **no** sidebar visible |
| 3. Sticky bottom bar visible | Shows "TOTAL $X" on the left (tap = open drawer), "Checkout →" on the right |
| 4. Tap the Total button | Bottom Sheet opens with the full order summary (subtotal, shipping, tax, total, trust badges) |
| 5. Drag the sheet handle down | Sheet dismisses |
| 6. Tap Checkout in the sticky bar | Navigates to `/checkout/payment` |

- [ ] Both sticky-bar buttons ≥ 44px tall
- [ ] Page bottom padding clears the sticky bar (no content hidden underneath)

### 5.3 Line item interactions

| Step | Expected |
|---|---|
| 1. Tap +/− on a cart line | Quantity updates optimistically; total reflects |
| 2. Tap the X (remove) | Line is removed |
| 3. Tap the product image | Navigates to the PDP |

⚠️ **Known limitation flagged for design review:** the line-item +/− buttons are 16×16 px (Figma spec). They're functional but small for touch. Test if your team accepts this or wants the bump.

### 5.4 Desktop regression

- [ ] At 1440px: sticky desktop sidebar (400px wide) visible on the right; sticky bottom bar **not** visible
- [ ] No layout jank when crossing the 1024px breakpoint

---

## Phase 6 — Checkout (Shipping / Payment / Review / Confirmation)

**What shipped:** All grids stack on mobile; `OrderSummary` gains `mode: 'inline' | 'drawer'`; `MobileSummaryDrawer` mounted on shipping/payment/review with the step's submit button in the sticky bar; `CheckoutProgress` collapses to a "Step N of 4 · Label" pill on `<sm`; confirmation route padding tightens.

**Files:** [hydrogen/app/routes/checkout.shipping.tsx](../hydrogen/app/routes/checkout.shipping.tsx), [hydrogen/app/routes/checkout.payment.tsx](../hydrogen/app/routes/checkout.payment.tsx), [hydrogen/app/routes/checkout.review.tsx](../hydrogen/app/routes/checkout.review.tsx), [hydrogen/app/routes/checkout.confirmation.tsx](../hydrogen/app/routes/checkout.confirmation.tsx), [hydrogen/app/components/checkout/OrderSummary.tsx](../hydrogen/app/components/checkout/OrderSummary.tsx), [hydrogen/app/components/checkout/CheckoutProgress.tsx](../hydrogen/app/components/checkout/CheckoutProgress.tsx)

### 6.1 Progress bar

| Step | Expected |
|---|---|
| 1. Reach `/checkout/payment` | Top of page shows compact pill: "Step 2 of 4 · Payment" (primary tint) |
| 2. At 640px (sm)+ | Full 4-step bar with badges + dividers (matches Figma) |
| 3. On the pill | Tapping does nothing (it's just a label) |

### 6.2 Payment step (`/checkout/payment`)

| Step | Expected |
|---|---|
| 1. Open `/checkout/payment` on mobile | Single column: Payment method selector → Billing Address → no inline summary |
| 2. Tap a payment method radio | Selection updates |
| 3. Bottom: sticky bar shows Total + "Continue to Shipping →" | Both buttons ≥ 44px |
| 4. Tap the sticky Continue button | Submits the form, navigates to `/checkout/shipping` |
| 5. Tap the sticky Total button | Drawer opens with the order summary body (no separate Continue inside the drawer) |

### 6.3 Shipping step (`/checkout/shipping`)

| Step | Expected |
|---|---|
| 1. Open `/checkout/shipping` on mobile | Address form, shipping method, delivery preferences stacked single-column |
| 2. Tap each input field | iOS does NOT zoom on focus (inputs are `text-base` on mobile) |
| 3. Tap the saved-address chip | Auto-fills the address form |
| 4. Sticky bar shows Total + "Continue to Review" | Both ≥ 44px |
| 5. Submit form | Navigates to `/checkout/review` |
| 6. Open virtual keyboard (tap an input on iOS) | Sticky bar lifts above the keyboard automatically (iOS native behavior) |

### 6.4 Review step (`/checkout/review`)

| Step | Expected |
|---|---|
| 1. Open `/checkout/review` on mobile | Single column: Review card (shipping, payment, items, edit links), then payment notice |
| 2. Sticky bar shows Total + "Place Order" with a checkmark icon | ≥ 44px |
| 3. Tap edit link on shipping address | Navigates back to `/checkout/shipping` with values pre-filled |
| 4. Return to `/checkout/review`, tap Place Order | Routes to Shopify checkout (off-site) with buyer identity pre-filled |

### 6.5 Confirmation step (`/checkout/confirmation`)

| Step | Expected |
|---|---|
| 1. After a successful test order, land on `/checkout/confirmation` | Success hero, order details, no progress bar, **no sticky bar** |
| 2. As a guest checkout | "Create account" CTA below order details |
| 3. Tap "Track Order" / "Continue Shopping" | Both navigate correctly |

### 6.6 Desktop regression

- [ ] At 1440px on every checkout step: original `1fr 400px` two-col layout intact, sticky right-rail summary visible, sticky bottom bar **not** visible

---

## Phase 7 — Account & Secondary Surfaces

**What shipped:** `AccountSidebar` mobile menu trigger gets `tap-target`; `ContactCard` edit/delete buttons bumped to 44×44 on phones (32px on desktop); `OrderCard` header padding + metadata gap tighten on mobile.

**Files:** [hydrogen/app/components/account/AccountSidebar.tsx](../hydrogen/app/components/account/AccountSidebar.tsx), [hydrogen/app/components/account/ContactCard.tsx](../hydrogen/app/components/account/ContactCard.tsx), [hydrogen/app/components/account/OrderCard.tsx](../hydrogen/app/components/account/OrderCard.tsx)

### 7.1 Login + signup

| Step | Expected |
|---|---|
| 1. Logged out, visit `/account` | Redirects to `/account/login` |
| 2. Login form on mobile | Fields stack full-width, no zoom on focus |
| 3. Submit valid credentials | Lands on `/account` dashboard |
| 4. Tap Register link | Navigates to `/account/register`; same mobile-friendly form |

### 7.2 Dashboard

| Step | Expected |
|---|---|
| 1. Authenticated, visit `/account` | Single-column layout: Account menu button at top, then welcome banner / stat cards / recent orders |
| 2. Tap **Account** menu button | Left Sheet slides in with full nav (Dashboard, Orders, Wishlist, Addresses, Payment Methods, Notifications, Settings, Sign Out) |
| 3. Tap a nav item | Navigates; Sheet closes |

- [ ] Menu button ≥ 44px tall
- [ ] Active nav item highlighted in `text-secondary` background

### 7.3 Orders list (`/account/orders`)

| Step | Expected |
|---|---|
| 1. Visit with at least 2 orders in history | Each OrderCard fits viewport — no horizontal scroll even with long recipient names |
| 2. Card header metadata wraps onto multiple lines if needed (gap-y-3) | No clipping |
| 3. Tap "View Order Details" | Navigates to `/account/orders/<id>` |
| 4. On the detail page | Buy Again grid renders 1 col on mobile (or 2 col if container allows) |

### 7.4 Addresses (`/account/addresses`)

| Step | Expected |
|---|---|
| 1. Visit with at least 1 saved contact | ContactCard renders with edit/delete buttons in the header |
| 2. Buttons sized | 44×44 on mobile, 32×32 on desktop (Figma spec preserved at sm+) |
| 3. Tap edit | ContactFormDialog opens; form fields are mobile-friendly |
| 4. Tap delete | Confirmation; address removed |

### 7.5 Returns flow

| Step | Expected |
|---|---|
| 1. Open an eligible order, tap "Start Return" | Multi-step return flow renders single-column on mobile |
| 2. Each step (Reason → Shipping → Resolve) | No horizontal scroll, action bar at bottom remains visible |

---

## 8. Performance & Network

Run **Lighthouse mobile** against the deployed preview (or `pnpm preview`):

```bash
cd hydrogen && pnpm preview &
npx lighthouse http://localhost:3000 \
  --form-factor=mobile --preset=mobile \
  --output=html --output-path=./reports/lh-home.html

# Repeat for: /collections/all, /products/<handle>, /cart, /checkout/shipping
```

Targets (per the original plan):

- [ ] **LCP** < 2.5s on simulated 4G
- [ ] **CLS** < 0.1
- [ ] **INP** < 200ms
- [ ] No render-blocking resources flagged
- [ ] Tap target accessibility audit ≥ 90

Capture the `lh-*.html` reports and attach to the release PR description.

---

## 9. Accessibility (per [ACCESSIBILITY_STANDARDS.md](../guidelines/ACCESSIBILITY_STANDARDS.md))

### 9.1 Keyboard-only

Walk the conversion path using only the keyboard (Tab / Shift-Tab / Enter / Space / Arrow keys):

- [ ] Header: hamburger, search, account, cart all reachable
- [ ] Mobile drawer: Tab cycles through nav items, Esc closes
- [ ] PDP: variant selector, qty +/-, Add-to-Cart all reachable
- [ ] Cart: line +/-, X (remove), Checkout reachable
- [ ] Checkout: every form field reachable in logical order; sticky bar Continue button reachable
- [ ] Account drawer: nav items + Sign Out reachable

### 9.2 Screen reader

iOS VoiceOver (Settings → Accessibility → VoiceOver) on a real device:

- [ ] Sticky-bar Add-to-Cart announces as "Add to Cart, button"
- [ ] Sticky-bar Checkout total announces as "$X.XX, Order Summary, button" (opens drawer)
- [ ] MobileDrawer dismiss is announced
- [ ] Drawer trigger button announces with its label (no orphan icons)
- [ ] CheckoutProgress pill announces "Step 2 of 4, Payment" on the payment step

### 9.3 Reduced motion

- [ ] iOS Settings → Accessibility → Motion → Reduce Motion ON: Sheets snap into place without slide animation; carousel auto-advance halts (verify hero carousel)
- [ ] No purely-motion-based affordances (e.g. nothing relies solely on a spin to indicate loading)

### 9.4 Zoom & contrast

- [ ] Browser zoom 200%: layouts reflow without overlap on the conversion path
- [ ] Color-contrast spot check (Chrome DevTools → Lighthouse → Accessibility) on PDP price, sticky-bar CTAs, and form labels

---

## 10. Real-Device Smoke Test

The single most important pass. Reserve ~45 minutes per device.

### Devices required

- [ ] **iPhone** (iOS 17+, Safari) — preferably with a notch (iPhone X+) to confirm safe-area handling
- [ ] **Android** (Android 13+, Chrome) — preferably a Pixel or recent Samsung

### Walk for each device

1. **Browse**: Home → tap a category in the hamburger drawer → land on PLP → swipe subcategory tiles
2. **Filter**: Open Filters drawer → apply 2 filters → confirm chips appear → clear all
3. **PDP**: Tap a product → swipe gallery → change variant → adjust qty → scroll until sticky bar appears → tap sticky Add-to-Cart
4. **Cart**: Tap header cart icon → adjust line qty → tap sticky Total to open drawer → close drawer → tap Checkout
5. **Checkout**: Fill payment → fill shipping (verify no iOS zoom on focus) → review → place order
6. **Confirmation**: Verify order receipt page renders cleanly
7. **Account**: Open `/account` → drawer → orders → addresses

### Capture per device

- [ ] One screenshot of each surface (drawer open / sticky bar visible)
- [ ] Any visual or interaction bug — file in the release PR

---

## 11. Sign-Off Matrix

The release PR cannot merge until all rows below are checked by the named owner.

| Area | Owner | Status |
|---|---|---|
| Phase 0 — Foundations (cross-cutting) | Engineering | ☐ |
| Phase 1 — Header & nav | Engineering | ☐ |
| Phase 2 — Homepage | Engineering | ☐ |
| Phase 3 — PLP | Engineering | ☐ |
| Phase 4 — PDP | Engineering | ☐ |
| Phase 5 — Cart | Engineering | ☐ |
| Phase 6 — Checkout (4 routes) | Engineering | ☐ |
| Phase 7 — Account | Engineering | ☐ |
| Performance (Lighthouse) | Engineering | ☐ |
| Accessibility | Design / a11y | ☐ |
| Real iPhone smoke test | QA | ☐ |
| Real Android smoke test | QA | ☐ |
| Visual baselines reviewer-approved | Design | ☐ |
| Desktop regression at 1440px | QA | ☐ |

---

## 12. Known Follow-Ups (Out of Scope for This Release)

These are documented in commit messages but intentionally not addressed in `release/mobile-rollout`:

1. **CartLineRow per-line +/− buttons are 16×16 px** (Figma intent). Below the WCAG tap-target floor on touch — needs a design call before bumping.
2. **`pnpm typecheck` OOMs on the full codebase** (>12 GB heap). Mitigated locally via the IDE tsserver cap (Phase 0 commit `e47b0e1`); CI runs typecheck on a fresh runner. A proper structural fix (project references / narrower `include`) is a separate workstream.
3. **No mobile Figma reference exists.** Reviewer-approved visual baselines (committed under `tests/e2e/visual/screenshots/mobile-chrome/`) become the de-facto design source of truth for mobile.
4. **A sticky horizontal-scroll tab strip in Account** showing the current section was in the original plan but skipped — the existing labeled menu button + drawer is already discoverable. Revisit if user testing shows otherwise.

---

## 13. Reporting Bugs

File issues against the release PR with this template:

```markdown
**Phase:** [0-7]
**Surface:** [route or component]
**Device + browser:** [e.g. iPhone 12, Safari iOS 17.4]
**Viewport:** [emulated / native]
**Steps to reproduce:**
1. ...
2. ...
**Expected:** ...
**Actual:** ...
**Screenshot/video:** [attach]
```

For visual diffs only, link the failing Playwright snapshot under `tests/e2e/visual/screenshots/mobile-chrome/...` so reviewers can see the diff inline.
