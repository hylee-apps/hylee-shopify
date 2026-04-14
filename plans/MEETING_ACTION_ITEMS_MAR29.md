# Implementation Plan: Meeting Action Items (Mar 29, 2026)

> **Status**: :green_circle: Partially Complete
> **Created**: 2026-03-29
> **Source**: Weekly Meeting 2026-03-29 (Shawn Jones, Derek Hawkins, Jeremiah Tillman)
> **Branch**: `feature/account/return-process` (current) → new branches per workstream
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

## Overview

Final product review before go-live. This plan consolidates all action items from the March 29 meeting into prioritized workstreams. The session covered: homepage completion, discount/promotion logic, referral system, account page updates, category page layout, auth page polish, customer support contact, and Shopify specs display issues.

**Key decisions made:**
- Promotional structure finalized: 10% first-purchase / 15% account creation / 20% referral (stackable) / 25% strategic partnership (code-gated)
- Already-discounted products are ineligible for promotional codes
- Account notification center = carousel slider (not pop-ups)
- L2 subcategory icons must be squares, not circles
- Referral captures: friend's name (mandatory) + email or phone (at least one required)
- Homepage sections: image carousel + What's New + Seasonal + Discounted
- Blog/media section is deferred to post-go-live

---

## Workstream 1: Homepage Completion
**Priority**: CRITICAL | **Effort**: Large | **Owner**: Derek Hawkins
**Status**: :green_circle: Complete

### 1A — Image Carousel (Hero / Above the Fold)

> *"the homepage must feature an image carousel"* — Shawn Jones

- [x] `HeroCarousel` component at `hydrogen/app/components/home/HeroCarousel.tsx`
  - Auto-advancing (4500ms interval); no user controls (no arrows, no dots)
  - Respects `prefers-reduced-motion` — cancels timer if enabled
  - `header` slot (logo) + `footer` slot (search form) rendered over cycling slide backgrounds
- [x] The carousel IS the hero — single merged section replacing the old static hero + separate carousel
  - White Hylee logo (`/logo-white.png`, 183×101.821px) always visible at top
  - "Search Our Products" pill input always visible below the logo
  - Slide background (color or image) cycles; no headline/subheadline/CTA text shown
- [x] 3 slides wired to static array in `_index.tsx`: slide 1 = `/hero-bg.jpg` (teal), slide 2 = secondary blue, slide 3 = primary green

### 1B — Discounted Products Section

> *"a discount product list"* — Shawn Jones

- [x] `DISCOUNTED_PRODUCTS_QUERY` in `_index.tsx`: fetches products with `compare_at_price:>0`, `sortKey: BEST_SELLING`
- [x] Renders as a `ProductSection` row between Seasonal and Promotions & Deals
- [x] Shows up to 5 cards (fills desktop row); evenly distributed with `flex-1 min-w-40`
- [x] Note: these are products with a literal price markdown — distinct from promo code discounts (10/15/20/25%). Promo code exclusion enforced at checkout (Workstream 2E).

### 1C — Rename "Promotions" Section

- [x] Bottom section renamed to **"Promotions & Deals"** in `_index.tsx`

### 1D — New Products Cadence (< 1 Month)

> *"new products are going to be released every month"* — Shawn Jones

- [x] Pivoted away from `what-s-new` collection (does not exist in Shopify Admin)
- [x] `WHATS_NEW_QUERY` queries products directly with `created_at:>YYYY-MM-DD` (30-day window computed dynamically in loader), sorted by `CREATED_AT` descending
- [x] Shows up to 5 cards; "See all" → `/collections/all?sort_by=created-descending`
- [x] No Shopify Admin collection required

### 1E — Product Card Consistency (Homepage + Collections)

- [x] All product cards on homepage show 5 per row, evenly spaced (`flex-1 min-w-40`)
- [x] Add-to-cart button color unified to `bg-primary` (green) across homepage and collections pages — small card was previously `bg-secondary` (teal)
- [x] Price rendered on its own line below the title (default card variant)
- [x] Cards stretch to equal height within each row (`h-full flex-col`); actions pinned to bottom (`mt-auto`)

---

## Workstream 2: Promotional Discount System
**Priority**: CRITICAL | **Effort**: Large | **Owner**: Derek Hawkins

Four promotion tiers were finalized. Logic must be implemented end-to-end: from account creation / referral events → discount claim → cart application → checkout.

### Promotion Tier Summary

| Tier | Discount | Trigger | Stackable | Notes |
|------|----------|---------|-----------|-------|
| First Purchase | 10% off | Any first order (guest or member) | No | Applies to full-price items only |
| Account Creation | 15% off | Creates an account | Not combined with other promos | Applies on return visits after first purchase — NOT on the same order as the 10% |
| Referral | 20% off entire order | Referred friend creates an account | Yes — one per referral event | Stackable: each accepted referral adds one 20% coupon to queue |
| Strategic Partnership | 25% off | Partner provides a validated code | No | Managed via partner-specific discount codes in Shopify |

**Exclusion rule**: If a product is already price-discounted (`compareAtPrice > price`), promo codes cannot be applied to that item. Full-price products in the same cart remain eligible.

**One promo per order**: Only one promotional code can be applied per order. If a customer has multiple 20% referral coupons in their queue, they use one per order. The 10% (first purchase) and 15% (account) are also not combined — they apply at different stages of the customer lifecycle.

### 2A — First Purchase (10% Off)

- [ ] Create Shopify automatic discount: `FIRST_PURCHASE_10` — applies 10% to first order only
  - Shopify supports "First-time customer" discount condition natively — use this
  - Apply to all products where `compareAtPrice == price` (full price only)
- [ ] In the cart UI (`hydrogen/app/routes/cart.tsx`), show a notice to first-time guests/members: *"10% off your first order — applied automatically at checkout"*
- [ ] Verify discount is stripped from already-discounted items at checkout

### 2B — Account Creation (15% Off)

- [ ] On successful account creation (`account.register.tsx` success path):
  - Issue a Shopify discount code scoped to that customer account (via Admin API `discountCodeCreate`)
  - OR tag the customer with `promo:account-created` and apply a customer-tag-based discount
  - Store as a claimable deal in the customer's deal queue (see Workstream 4A)
- [ ] Label in account deals section: *"15% Off — Account Member Discount"*
- [ ] **NOT combined with 10%**: Shawn explicitly said "you can get the 10% on your first purchase and then when you come back, you can get 15%." These are sequential, not simultaneous. First order = 10%. Return visits with account = 15%. One promo per order.

### 2C — Referral (20% Off, Stackable)

> *"every time they refer a friend and that friend creates an account, they get 20% off their next order — they can stack these up"* — Shawn Jones

- [ ] See **Workstream 3** for the full referral flow
- [ ] Each accepted referral triggers: +1 × 20%-off coupon added to referrer's deal queue
- [ ] Applied to the entire order (not per item)
- [ ] Each coupon is single-use; multiple referrals = multiple coupons in queue
- [ ] Products already price-discounted are excluded from the order total reduction

### 2D — Strategic Partnership (25% Off)

> *"25% off for strategic partnerships — validated through specific codes"* — Shawn Jones

- [ ] Create partner-specific Shopify discount codes in Admin (e.g., `TINYBUILDER25`, `MICROAPT25`)
  - Each code: 25% off, usage limit per partner, tracked to the partnership
- [ ] No automated flow needed initially — Shawn manages codes manually per partner
- [ ] Document in internal notes which codes map to which partners
- [ ] Note: partners can combine 25% with first-purchase 10% on their first order (confirm with Shawn)

### 2E — Checkout Enforcement

- [ ] In `checkout.review.tsx` (or via Shopify Scripts/Functions): validate that promo codes are not applied to items where `compareAtPrice > price`
- [ ] Display a clear error/notice if a promo code is blocked due to an already-discounted item

---

## Workstream 3: Refer a Friend Feature
**Priority**: HIGH | **Effort**: Large | **Owner**: Derek Hawkins + Jeremiah Tillman (research)

> *"the ability to refer a friend needs to be added to the customer account page, similar to the Uber app. Friend's name is mandatory; must provide either a phone number or an email, or both."* — Shawn Jones

### 3A — Research Phase (Jeremiah Tillman)

- [ ] Research standard "refer a friend" UI/UX patterns on major retail sites
- [ ] Identify: modal flow, unique referral link generation, share options, status tracking
- [ ] Share findings with Derek before implementation

### 3B — Referral Entry Form

- [ ] Create `hydrogen/app/routes/account.referral.tsx` (or a modal within `account._index.tsx`)
- [ ] Form fields:
  - Friend's full name — **required** (Shawn: "the friend's name is mandatory")
  - Friend's phone number — primary capture method (Shawn: "people usually use their phone number")
  - Friend's email — secondary, required if phone not provided
  - Client-side validation: name always required; at least one of phone or email must be filled
- [ ] On submit: store referral in a Shopify customer metafield (`custom.referrals`) as a JSON array:
  ```json
  [{ "name": "Jane Doe", "email": "jane@example.com", "phone": null, "status": "pending", "sentAt": "2026-03-29T..." }]
  ```
- [ ] Send referral invitation to the friend's email/phone (stub for now; implement with email campaign tool later)

### 3C — Referral Tracking & Trigger

- [ ] On new account creation (`account.register.tsx`), check the entry survey for "Who referred you?"
  - Match the name provided against pending referrals
  - If matched: update referral `status` to `"accepted"` and trigger 20% coupon for the referrer
- [ ] Entry survey must be updated (Workstream 6B) to include the referrer name field
- [ ] Referrer gets an alert notification via the account notification carousel (Workstream 4B) when their referral is accepted

### 3D — Referral Status Display

- [ ] In the account dashboard (or a `Referrals` tab in the sidebar), show:
  - Pending referrals (name, sent date, status badge)
  - Accepted referrals (name, date accepted, discount earned)
  - Total 20% coupons available in queue
- [ ] Add "Refer a Friend" button/link to `AccountSidebar.tsx`

---

## Workstream 4: Account Page Updates
**Priority**: HIGH | **Effort**: Medium | **Owner**: Derek Hawkins

### 4A — Promotions & Deals Visibility Section

> *"did we add the section where the customer can track how many promotion/discount deals they've claimed but haven't used yet?"* — Shawn Jones

- [x] Add a **"My Deals"** card to `hydrogen/app/routes/account._index.tsx` (dashboard)
  - Show count of unused deals (badge/pill): e.g., *"You have 3 deals available"*
  - List each deal: type, discount %, expiry (if applicable), "Apply at checkout" CTA
  - Empty state: *"No deals yet — refer a friend or make your first purchase to earn rewards"*
- [ ] Data source: customer metafields (`custom.deal_queue`) — array of claimable codes
  - Each entry: `{ type: "referral" | "account" | "first-purchase", code: "XXX", usedAt: null }`

### 4B — Account Notification Carousel

> *"a carousel slider for account notifications — prevents user fatigue from multiple pop-ups while remaining prominent when the customer logs in"* — Derek Hawkins (approved by team)

- [x] Create `AccountNotificationCarousel` component in `hydrogen/app/components/account/`
  - Carousel displays one notification at a time with dot indicators + prev/next arrows
  - Notification types: new deal unlocked, referral accepted, order shipped, order delivered
  - Swipe/arrow navigation; auto-advances every 5 seconds (pauseable)
  - Each notification: icon, title, body, optional CTA button, dismiss (×) button
  - Dismissed notifications are stored in localStorage (session-level dismissal)
- [x] Place carousel at the top of the account dashboard, between welcome banner and stat cards
- [x] Initially populated with mock notification data; wire to real events post-go-live

### 4C — Dashboard Navigation (Back to Homepage)

> *"clicking on the profile name could be a middle ground — take users back to the dashboard home"* — Shawn Jones

- [x] In `AccountSidebar.tsx`, make the profile name (display name text above the avatar) a clickable link to `/account` (the dashboard `_index` route)
- [x] Add a subtle underline-on-hover or a small home icon next to the name to hint it's clickable
- [x] Do NOT add an explicit "Dashboard" icon — use the name as the navigation anchor as discussed

---

## Workstream 5: Category & PLP Pages
**Priority**: CRITICAL | **Effort**: Medium | **Owner**: Derek Hawkins
**Due**: Today (meeting confirmed Derek would complete by end of day)

### 5A — L2 Subcategory Icons: Circles → Squares

> *"the L2 subcategories, which Derek implemented as circles, are supposed to be squares"* — Shawn Jones

- [x] Find the subcategory icon/pill component used on the category landing page
  - Located in `hydrogen/app/routes/collections.$handle.tsx` — `SubcollectionGrid` component
- [x] Change icon containers from `rounded-full` to `rounded-lg` (or `rounded-md`) — squares with slight rounding per design
- [x] Ensure images don't look cropped/small — use `object-cover` with appropriate aspect ratio (`aspect-square`)

### 5B — Non-End-Node Category Page (Subcategory Landing)

> *"we need to see the subcategory layout"* — Shawn Jones

A "non-end node" page is a category that has sub-categories (not products directly). It shows a grid of L2 subcategory tiles.

- [ ] Verify route: `hydrogen/app/routes/collections.$handle.tsx` handles both end-node and non-end-node cases
  - If `collection.metafields` includes child categories → render subcategory grid (non-end node)
  - If no child categories → render product grid (end node)
- [ ] Non-end-node layout: square tiles with category image + name label below
  - Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
  - Tile image: `aspect-square`, `object-cover`, `rounded-lg`

### 5C — End-Node Product Page

> *"the final end-node pages"* — Shawn Jones

- [ ] Verify end-node route renders product grid correctly with filters + sort
- [ ] Confirm `FilterSidebar` and `ProductGrid` load properly for real collections
- [ ] Ensure the `ProductCard` "New" badge appears for products < 30 days old (from Workstream 1D)

### 5D — Breadcrumbs: Chevrons Instead of Slashes

> *"use carrots instead of slashes for the breadcrumbs"* — Shawn Jones

- [x] Find the `Breadcrumb` component (likely `hydrogen/app/components/ui/Breadcrumb.tsx` or inline in route files)
- [x] Replace `/` separator with `>` or the Lucide `ChevronRight` icon (`w-4 h-4 text-muted-foreground`)
- [x] Apply consistently across: collection pages, PDP, account sub-pages

---

## Workstream 6: Auth Pages Polish
**Priority**: HIGH | **Effort**: Small | **Owner**: Derek Hawkins

### 6A — Company Logo on Sign-Up / Create Account Pages

> *"the logo needs to be implemented on the sign-up pages"* — Shawn Jones

- [x] Find `hydrogen/app/routes/account.register.tsx` and `account.login.tsx`
- [x] Add `<img src="/logo.png" />` (or the appropriate asset path — check `hydrogen/public/`) above the form headline
- [ ] Use `logo-white.png` if the auth page has a dark/colored background; `logo-condensed.png` for light
- [ ] Size: match the Figma auth page spec (`AUTH_PAGES_FIGMA_PLAN.md`)

### 6B — "How Did You Hear About Us" Survey Updates

> *"Pinterest, Reddit, and LinkedIn are essential social platforms for the target audience"* — Shawn Jones
> *"change the social platform label to 'Search' with examples like Google, Bing, and Firefox"* — Shawn Jones

- [x] Find the welcome/entry survey in `hydrogen/app/routes/account.welcome.tsx`
- [x] Add **Pinterest**, **Reddit**, and **LinkedIn** as options (LinkedIn was already present; Pinterest + Reddit added)
- [x] Rename the "Search Engine" or equivalent option to **"Search (Google, Bing, Firefox)"**
- [x] Referral source option: ensure there is a "Referred by a friend" option with a text field for the referrer's name
  - Added `referrerName` (required) + `referrerPhone` fields; name saved to `surveyResponse.referrerName`

---

## Workstream 7: Customer Support Contact Form
**Priority**: MEDIUM | **Effort**: Small | **Owner**: Derek Hawkins

> *"I don't want people to see the Gmail address. I want them to click 'Contact Customer Support' and get a form where they can type a subject and body and send."* — Shawn Jones

- [x] Find where customer support contact currently appears (footer? help page?)
- [x] Create `hydrogen/app/routes/support.contact.tsx`
  - Form: Name, Email (pre-filled if logged in), Subject (dropdown: Order Issue / Return / Product Question / Other), Message body (textarea)
  - Submit: `mailto:` action pointing to `hylee.support@gmail.com` (hidden from the DOM) — OR use a server `action()` to send via a transactional email service
  - Success state: *"Thanks! We'll get back to you within 24 hours."*
- [x] Add "Contact Customer Support" link in:
  - Footer (replace any raw email display)
  - Account sidebar (below Sign Out, or in Settings)
- [ ] Never render the raw Gmail address in the HTML source

---

## Workstream 8: Shopify Product Specs Display
**Priority**: MEDIUM | **Effort**: Unknown (blocked on Shopify Support) | **Owner**: Derek Hawkins

> *"the system is confusing — mixing 'capacity' from category metafields with 'height' and 'weight' from product metafields"* — Derek Hawkins
> *"contact Shopify support; if it fails, create a custom field set"* — Shawn Jones

- [ ] Draft a clear support ticket describing the issue:
  - Category metafields (e.g., `capacity`) not aggregating consistently with product-level metafields (`height`, `weight`)
  - Ask: how to ensure all specs display uniformly on PDP regardless of metafield source
- [ ] Contact Shopify support via chat (current plan: Growth plan = 24/7 chat, non-technical)
  - If chat cannot resolve → escalate via Jeremiah's contact (Workstream 8B)
- [ ] **Fallback**: Create a custom `product.specs` metafield (type: `json`) that stores all specs as a single structured object — populate manually or via bulk import
  - PDP reads from this single field instead of mixing category + product metafields

### 8B — Dev Support Phone Number

> *"Jeremiah will reach out to get the developer support phone number"* — Shawn Jones

- [ ] Jeremiah Tillman: find and share the Shopify developer/technical support contact
- [ ] Derek: use to escalate specs issue if chat support is insufficient

---

## Workstream 9: Address Validation Error Fix
**Priority**: MEDIUM | **Effort**: Small | **Owner**: Derek Hawkins

> *"there's no strict address validation — there's an unexpected error during address entry"* — Derek Hawkins / Shawn Jones

- [ ] Reproduce the error: go to Account → Addresses → add/edit address → trigger validation
- [ ] Check the `action()` in `hydrogen/app/routes/account.addresses.tsx` for unhandled exceptions
  - Common causes: missing required fields sent to Customer Account API, GraphQL error not caught, Shopify address validation rejecting a field value
- [ ] Add try/catch around the mutation; surface a user-friendly error message
- [ ] Test: valid address saves successfully; invalid address shows inline error (not a 500 page)

---

## Workstream 10: Payment Methods & Wishlist Pages
**Priority**: MEDIUM | **Effort**: Medium | **Owner**: Derek Hawkins

> *"finalize the Figma design for Payment Method and Wish List UI elements — ensure these designs fit the current UI structure"* — Shawn Jones

### 10A — Finalize Figma Designs

- [ ] Review Account Pages Figma file (`Q541sIDD20eXqQSSozFUw4`) for Payment Methods and Wishlist nodes
- [ ] If designs are missing/incomplete, create them in Figma to match existing account page style
- [ ] Capture design context: save to `hydrogen/design-references/account-payment/` and `account-wishlist/`

### 10B — Payment Methods Page

- [ ] Create `hydrogen/app/routes/account.payment-methods.tsx`
  - List saved payment methods (cards) — Customer Account API supports this via `paymentInstruments`
  - Add/remove card UI (Shopify handles tokenization via hosted form)
  - "Add Payment Method" → redirect to Shopify's hosted payment capture flow

### 10C — Wishlist Page

- [ ] Create `hydrogen/app/routes/account.wishlist.tsx`
  - Read from `custom.wishlist` customer metafield (array of product IDs)
  - Display saved products as `ProductCard` grid
  - Remove from wishlist button on each card
- [ ] Wire "Save for Later" on cart to add to wishlist metafield

---

## Workstream 11: Fix Order Link Error
**Priority**: MEDIUM | **Effort**: Small | **Owner**: Derek Hawkins

> *"fix the error page displayed when users click the order link"* — Shawn Jones

- [ ] Reproduce: go to Orders list, click on an order → error page appears
- [ ] Check `hydrogen/app/routes/account.orders.$id.tsx`:
  - Is the `$id` param format matching what Shopify returns? (Shopify order IDs are long strings like `gid://shopify/Order/1234567890`)
  - URL-encode the GID if needed; check how the link is constructed in the orders list
- [ ] Fix the route loader to handle the order ID correctly
- [ ] Test: clicking an order from the list navigates to the correct order detail page

---

## Workstream 12: Customer Support Messages Review
**Priority**: LOW | **Effort**: Small | **Owner**: Derek Hawkins

> *"review the customer support messages shared in the drive folder — determine necessity and notify Shawn"* — Shawn Jones

- [ ] Access the shared Drive folder with customer support message templates
- [ ] Review each message: is it necessary for go-live? Does it align with the current flow?
- [ ] Report back to Shawn: which messages to implement, which to defer
- [ ] If implementing: add auto-response messaging to the contact form (Workstream 7) or email campaign flow

---

## Post-Go-Live Items (Deferred)

These were discussed but explicitly deferred until after launch or until more content is available:

| Item | Notes |
|------|-------|
| Blog & Media section | Vertical layout, dialogue box overlay, "View More" → new page. Defer until content exists. |
| "Buy Again" tab in orders | Currently shows unfiltered list of all past items. Decision: leave as-is for now. "Don't let perfection be the enemy of progress." — Shawn Jones |
| Auto-messaging for orders | Trigger-based notifications (shipped, delivered). Test during go-live phase. |
| Fulfillment process testing | Order a product → verify supplier receives and fulfills. Go-live phase. |
| SEO checklist | Team has access; begin working through items post-launch. |
| Product documentation/manuals field | Add as a second-iteration metafield for supplier manuals. |
| Dedicated branded support email | Create once business generates revenue. Replace Gmail. |
| Analytics section | Jeremiah Tillman's responsibility for advisory board meeting. |
| Shopify checkout page customization | Custom checkout workflow complexities — addressed at go-live stage. |

---

## Advisory Board Prep (Separate Track)

> *"all participants confirmed receiving the advisory board meeting email"* — Shawn Jones

- [ ] **Jeremiah Tillman**: prepare analytics section for advisory board presentation
- [ ] **Derek Hawkins**: cover platform development (Hydrogen storefront) aspects
- [ ] SEO checklist items to be started in parallel

---

## Priority Order for Next Week's Review Session

Shawn's stated focus for next week's review:

1. **Homepage** — final version, carousel + all 3 product lists + correct section labels
2. **Product Detail Pages** — in-node + non-in-node (category/subcategory) fully built
3. **Sign-Up Pages** — logo implemented, survey options updated
4. **Customer Account Pages** — deals visibility section + notification carousel + referral feature

---

---

## Shopify Admin Instructions

These are step-by-step instructions for every task in this plan that requires configuration in the Shopify Admin dashboard. Instructions reflect the current Admin UI as of 2026.

---

### Admin Task A: Rename the "What's New" Collection Handle (`what-s-new` → `new`)

**Where:** Products > Collections > [What's New collection]

1. In Shopify Admin, go to **Products** → **Collections** in the left sidebar.
2. Click **What's New** (the collection currently at `/collections/what-s-new`).
3. Scroll to the bottom of the collection edit page to the **"Search engine listing"** section.
4. Click the **pencil / Edit** icon to expand it.
5. In the **"URL handle"** field, clear `what-s-new` and type `new`.
6. A prompt will appear asking if you want to create a redirect from the old URL — **leave this checked**. Shopify will automatically create a 301 redirect from `/collections/what-s-new` → `/collections/new`, preserving any existing links.
7. Click **Save**.

> **Note:** The handle field is only visible inside the "Search engine listing" section — it is not shown on the main collection form. Always accept the redirect prompt to avoid broken links.

---

### Admin Task B: Create the "New Arrivals" Automated Collection (handle: `new`)

> Only needed if the collection does not already exist. If it was just renamed above, skip this task.

**Where:** Products > Collections > Create collection

Shopify's native automated collection conditions do not support "created within last N days." The correct approach is a **product tag + Shopify Flow** combination.

#### Step 1 — Create the collection

1. Go to **Products** → **Collections** → **Create collection**.
2. Set **Title**: `New Arrivals`.
3. Under **Collection type**, select **Automated**.
4. Under **Conditions**, set:
   - **Product tag** → **is equal to** → `new-arrival`
   - Match: **All conditions**
5. Scroll to **"Search engine listing"** → click Edit → set URL handle to `new`.
6. Click **Save**.

#### Step 2 — Install Shopify Flow (free, built by Shopify)

1. Go to **Apps** in the left sidebar → **App store**.
2. Search for **"Shopify Flow"** and install it (it's free and built by Shopify).

#### Step 3 — Create a Flow to auto-tag new products

1. Open the **Flow** app.
2. Click **Create workflow**.
3. Set **Trigger**: **Product created**.
4. Add an **Action**: **Add product tags** → enter `new-arrival`.
5. Click **Save** and turn the workflow **On**.

#### Step 4 — Create a Flow to remove the tag after 30 days

1. In Flow, click **Create workflow**.
2. Set **Trigger**: **Product created**.
3. Add a **Wait** step: **30 days**.
4. Add an **Action**: **Remove product tags** → enter `new-arrival`.
5. Click **Save** and turn the workflow **On**.

> Any product created from now on will automatically appear in `/collections/new` for 30 days, then drop off.

---

### Admin Task C: Create the Automatic 10% First-Purchase Discount

> **Applies to:** Workstream 2A — 10% off any customer's first order, auto-applied at checkout.

**Where:** Discounts > Create discount > Amount off orders

> **Requires Shopify August 2025+ update** — Customer eligibility for automatic discounts (targeting "Customers who haven't purchased") was added natively in August 2025 and is available on all plans.

1. In Shopify Admin, go to **Discounts** in the left sidebar.
2. Click **Create discount**.
3. Select **"Amount off orders"**.
4. Under **Method**, select **"Automatic discount"**.
5. Set **Title**: `Welcome 10% – First Order` (this is internal only, not shown to customers).
6. Under **Discount value**: select **Percentage** → enter `10`.
7. Under **"Applies to"**: select **All orders**.
8. Under **"Minimum purchase requirements"**: set a minimum if desired, or leave as **"No minimum requirements"**.
9. Under **"Customer eligibility"**: select **"Specific customer segments"**.
10. Click **Browse segments** → select **"Customers who haven't purchased"** (Shopify's built-in segment for first-time buyers with 0 prior orders).
11. Under **"Maximum discount uses"**: check **"Limit to one use per customer"**.
12. Under **"Combinations"**: uncheck all — this discount should not stack with others.
13. Under **"Active dates"**: set today's date as the start; leave end date blank (no expiration).
14. Click **Save**.

> **Excluding already-discounted products:** Shopify's native automatic discounts do not have a direct "exclude products with a compare-at price" toggle. To handle this, scope this discount to a specific collection that only contains full-price products (i.e., never add sale items to that collection). Alternatively, this exclusion can be enforced at the Hydrogen checkout layer via Shopify Functions — see Workstream 2E in the dev plan.

---

### Admin Task D: Create a Customer Segment for Account-Created Tag

> **Pre-step** required before creating the 15% account-creation discount (Task E below).

**Where:** Customers > Segments > Create segment

1. Go to **Customers** in the left sidebar.
2. Click the **Segments** tab at the top of the Customers page.
3. Click **Create segment**.
4. In the filter editor, type or paste the following condition:
   ```
   customer_tags CONTAINS 'promo:account-created'
   ```
5. Name the segment: `Tagged: Account Created`.
6. Click **Save**.

> This segment automatically stays up to date — any customer tagged with `promo:account-created` will appear in it.

---

### Admin Task E: Create the 15% Account-Creation Discount Code

> **Applies to:** Workstream 2B — 15% off for customers who created an account. Applied manually or via the dev flow when a customer registers.

**Where:** Discounts > Create discount > Amount off orders

1. Go to **Discounts** → **Create discount**.
2. Select **"Amount off orders"**.
3. Under **Method**, select **"Discount code"**.
4. In the **Discount code** field, enter `WELCOME15` (or click **Generate** for a random code).
5. Under **Discount value**: select **Percentage** → enter `15`.
6. Under **"Applies to"**: select **All orders**.
7. Under **"Customer eligibility"**: select **"Specific customer segments"**.
8. Click **Browse segments** → select **"Tagged: Account Created"** (the segment created in Task D).
9. Under **"Maximum discount uses"**: check **"Limit to one use per customer"**.
10. Under **"Combinations"**: uncheck all — one promo per order.
11. Under **"Active dates"**: set today as start; leave end date blank.
12. Click **Save**.

> **How it works at checkout:** Only customers tagged `promo:account-created` will be able to successfully apply this code. Anyone else who enters the code will see an error. The dev-side registration flow (Workstream 2B) is responsible for adding the tag to the customer's account after they register.

---

### Admin Task F: Tag a Customer Manually

> Used when testing, or if the automated tagging flow (via registration) is not yet wired up.

**Where:** Customers > [customer name]

1. Go to **Customers** in the left sidebar.
2. Search for the customer by name or email using the search bar at the top.
3. Click the customer's name to open their profile.
4. In the right-hand panel, find the **"Tags"** field (below the customer's overview card).
5. Click the Tags field and type the tag (e.g., `promo:account-created`). Multiple tags are separated by commas.
6. Press **Enter** or click **Add [tag]** when it appears as a suggestion.
7. Click **Save** (top right of the page).

**To tag multiple customers at once (bulk):**
1. Go to **Customers**.
2. Use the checkboxes on the left to select multiple customers.
3. In the toolbar that appears at the top, click **Actions** → **Add tags**.
4. Enter the tag and confirm.

---

### Admin Task G: Create Partner Discount Codes (25% Off)

> **Applies to:** Workstream 2D — One code per strategic partner (tiny home builders, micro-apartment communities, campground operators, etc.). Managed by Shawn.

**Where:** Discounts > Create discount > Amount off orders

Repeat this process for each partner code (e.g., `TINYBUILDER25`, `MICROAPT25`, `CAMPLIFE25`):

1. Go to **Discounts** → **Create discount**.
2. Select **"Amount off orders"**.
3. Under **Method**, select **"Discount code"**.
4. In the **Discount code** field, enter the partner code exactly as agreed (e.g., `TINYBUILDER25`). Codes are case-insensitive at checkout but display as entered.
5. Under **Discount value**: select **Percentage** → enter `25`.
6. Under **"Applies to"**: select **All orders**.
7. Under **"Minimum purchase requirements"**: set a minimum order value if desired (e.g., $50), or leave as "No minimum requirements."
8. Under **"Customer eligibility"**: leave as **All customers** (partner shares the code privately; no Shopify-side customer restriction needed).
9. Under **"Maximum discount uses"**:
   - Check **"Limit the total number of times this discount can be used"** → set a total limit per partner arrangement (e.g., `500`).
   - Optionally check **"Limit to one use per customer"** if each end customer should only use it once.
10. Under **"Combinations"**: uncheck all — one promo per order.
11. Under **"Active dates"**: set start date; leave end date blank.
12. Click **Save**.

> **Tracking:** Keep an internal record (spreadsheet or Notion doc) mapping each code to its partner. You can view usage count at any time by opening the discount in Admin — it shows total uses, revenue generated, and first/last used date.

---

### Admin Task H: Create the 20% Referral Discount Code Template

> **Applies to:** Workstream 2C/3C — Each time a referred friend creates an account, the referrer earns a 20% off coupon. These are generated per referral event by the dev flow, but a base discount needs to exist in Admin to generate codes against.

**Where:** Discounts > Create discount > Amount off orders

1. Go to **Discounts** → **Create discount**.
2. Select **"Amount off orders"**.
3. Under **Method**, select **"Discount code"**.
4. Set **Discount code**: `REFERRAL20-[TEMPLATE]` — this is just a base; the dev flow will generate unique codes like `REFERRAL20-ABC123` per referral event using the Shopify Admin API (`discountCodeCreate` mutation).
5. Under **Discount value**: select **Percentage** → enter `20`.
6. Under **"Applies to"**: select **All orders**.
7. Under **"Customer eligibility"**: leave as **All customers** (codes are unique per person, so no additional restriction needed).
8. Under **"Maximum discount uses"**: check **"Limit to one use per customer"** — each generated code is single-use.
9. Under **"Combinations"**: uncheck all.
10. Under **"Active dates"**: set start date; leave end date blank.
11. Click **Save**.

> **Note:** The dev implementation (Workstream 3C) will call the Shopify Admin API to generate a unique child code under this discount node each time a referral is accepted. The template code above is not shared with customers — only the auto-generated unique codes are.

---

### Admin Task I: Verify the `support.contact` Email (Gmail Setup)

> **Applies to:** Workstream 7 — The contact form sends to `hylee.support.team@gmail.com`. This address must be verified in Shopify Admin so order notification emails route correctly.

**Where:** Settings > Notifications

1. Go to **Settings** (bottom left of Shopify Admin) → **Notifications**.
2. Under **"Sender email"**, verify that the reply-to address is set correctly.
3. To test: send a test order notification and confirm it arrives at the Gmail inbox.

> The Gmail address is never rendered in the Hydrogen storefront HTML. It is only referenced server-side in the `support.contact.tsx` action handler.

---

### Quick-Reference: Admin Navigation Paths

| Task | Path in Shopify Admin |
|------|-----------------------|
| Rename collection handle | Products → Collections → [collection] → Search engine listing → Edit → URL handle |
| Create automated collection | Products → Collections → Create collection → Automated |
| Install Shopify Flow | Apps → App store → "Shopify Flow" |
| Create automatic discount | Discounts → Create discount → Amount off orders → Automatic discount |
| Create discount code | Discounts → Create discount → Amount off orders → Discount code |
| Create customer segment | Customers → Segments → Create segment |
| Tag a customer | Customers → [customer] → Tags field |
| Bulk tag customers | Customers → select rows → Actions → Add tags |
| View discount usage | Discounts → [discount name] → Usage count |
| Add URL redirect manually | Online Store → Navigation → URL Redirects |

---

## Completion Checklist (Sign-Off Criteria)

- [x] Homepage: carousel + What's New + Seasonal + Discounted + "Promotions & Deals" rename
- [ ] Category pages: L2 squares, non-end-node grid, end-node product grid, chevron breadcrumbs
- [x] Auth pages: logo on register/login, Pinterest + Reddit + "Search" label in survey
- [ ] Account: My Deals section, notification carousel, "Refer a Friend" form + flow
- [ ] Promo logic: all 4 tiers documented in Shopify Admin; exclusion rule enforced at checkout
- [x] Customer support: contact form live, Gmail address hidden
- [ ] Order link: clicking an order no longer shows an error page
- [ ] Address error: resolved with user-friendly error handling
