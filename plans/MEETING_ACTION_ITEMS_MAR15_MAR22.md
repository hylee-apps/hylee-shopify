# Implementation Plan: Meeting Action Items (Mar 15 + Mar 22, 2026)

> **Status**: :yellow_circle: Planning
> **Created**: 2026-03-28
> **Source**: Weekly Meetings 2026-03-15 and 2026-03-22 (Shawn Jones, Derek Hawkins, Jeremiah Tillman)
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

## Overview

This plan consolidates all outstanding action items from the March 15 and March 22 weekly meetings. Items already completed are documented for reference; remaining work is organized into prioritized workstreams.

---

## Completed Items (No Work Needed)

These items were discussed in the meetings and have already been implemented:

| # | Item | Meeting | Evidence |
|---|------|---------|----------|
| 1 | Remove product title from PDP breadcrumb | Mar 15 | `products.$handle.tsx:440` — comment confirms removal |
| 2 | Hide blank specification fields on PDP | Mar 15 | `products.$handle.tsx:729-731` — filtered by `!!mf.value` |
| 3 | Menu priority order (1,2,3 scoring via metafield) | Mar 15 | `custom.menu_priority_order` metafield + `app/lib/navigation.ts` + `prioritizeCategories()` in `root.tsx` |
| 4 | Max horizontal menu links (7) | Mar 15 | `app/config/navigation.ts` — `maxVisible: 7` |
| 5 | Horizontal category display (not vertical) | Mar 15 | `Header.tsx` — `CategoryBar` component, full-width horizontal bar |
| 6 | Sub-menu hover fix (no page push-down) | Mar 15 | Fixed per meeting notes; CategoryBar uses absolute/overlay positioning |
| 7 | Simplify shipping to Standard only | Mar 15 | `checkout.ts` — removed `expedited` and `next-day`; only `standard` remains |
| 8 | Footer font size bigger + bold | Mar 15 | `Footer.tsx` — `text-[15px] font-semibold` (was `text-[14px] font-medium`) |
| 9 | "Does It Fit" conditional on furniture/appliances | Mar 15 | `products.$handle.tsx` — `DOES_IT_FIT_COLLECTIONS` set guards rendering |
| 10 | Top 6 primary specs in inline accordion | Mar 15 | `products.$handle.tsx` — `PRIMARY_SPEC_KEYS` + `primaryOnly` prop on `SpecsContent` |
| 11 | Promo discount display ("Promo Discount" not code string) | Mar 15 | `cart.tsx` — "Promo Discount" row with green text, negative amount |
| 12 | Homepage wired to real collection data | Mar 15 | `_index.tsx` — `what-s-new` + `summer-collection` queries |
| 13 | "New" badge on homepage products (< 30 days old) | Mar 15 | `_index.tsx:178` — `customBadge={isNew ? 'New' : undefined}` |
| 14 | Promo code input field in cart | Mar 15 | `cart.tsx` — `PromoCodeCard` component with apply/remove |
| 15 | Address book logic (categories + subcategories) | Mar 22 | `lib/address-book.ts` — JSON structure with categories (home/family/friends/work/other) |
| 16 | Children subcategory added to address book | Mar 22 | Added to address book category structure |
| 17 | Shipping category selector with address auto-fill | Mar 22 | `ShippingCategorySelector.tsx` — category pills + contact dropdown + form auto-fill |
| 18 | Decision: Use new Customer Storefront API (not legacy) | Mar 22 | Implemented; auth redirects to Shopify's hosted authentication |
| 19 | Welcome survey for new accounts (< 7 days) | Mar 22 | `account.welcome.tsx` — full survey with redirect from `account._index.tsx` |
| 20 | Category section pulling from custom collections (not general) | Mar 15 | `root.tsx` — `HEADER_COLLECTIONS_QUERY` fetches real collections |
| 21 | Reviews section on PDP | Mar 15 | `products.$handle.tsx` — `ReviewsSection` with sample data, filter pills, face ratings |
| 22 | Shawn prioritized 5 header menu categories | Mar 22 | Applied via `custom.menu_priority_order` metafield in Shopify Admin |

---

## Remaining Work

### Workstream 1: "New Product" Badge on Collection Pages
**Priority**: High | **Effort**: Small | **Meeting**: Mar 15
**Status**: Homepage has this; collection/category pages do NOT

> *"a 'new product' label could populate on items in various categories"* — Shawn Jones (Mar 15)

The homepage already calculates `isNew` based on `createdAt < 30 days` and passes `customBadge="New"` to `ProductCard`. Collection pages need the same treatment.

#### Checklist

- [ ] **Update collection GraphQL query** — `hydrogen/app/routes/collections.$handle.tsx`
  - Add `createdAt` field to the `products` query (currently not fetched)
  - Field: `createdAt` on `Product` type

- [ ] **Add "New" badge logic to collection product grid** — `hydrogen/app/routes/collections.$handle.tsx`
  - Calculate `isNew = (Date.now() - new Date(product.createdAt)) < 30 * 24 * 60 * 60 * 1000`
  - Pass `customBadge="New"` and `customBadgeColor="bg-primary"` to `ProductCard` when `isNew` is true
  - Same logic pattern as `_index.tsx:175-179`

- [ ] **Verify ProductCard `customBadge` prop** — `hydrogen/app/components/commerce/ProductCard.tsx`
  - Already supports `customBadge` and `customBadgeColor` props (lines 88-90) — no changes needed

- [ ] **Test**: New product in collection shows green "New" badge; older products do not

---

### Workstream 2: Deals & Promotions Page
**Priority**: Medium | **Effort**: Medium | **Meeting**: Mar 15

> *"promotions could be listed as cards going down the page, possibly two per row"* — Derek Hawkins (Mar 15)
> *"they will likely need to create another page once the volume of deals and promotions increases"* — Shawn Jones (Mar 15)

Create a dedicated `/deals` route that displays active promotions and deals as a card grid.

#### Design Decisions Needed (from Shawn)

- [ ] **Figma design for deals page** — No design exists yet. Need mockup or guidance on:
  - Card layout (confirmed: 2 cards per row)
  - What data each card shows (title, description, discount %, expiry date, product image?)
  - Where deal data comes from (Shopify automatic discounts? Manual collection? Metafields?)
  - Should deals link to specific products, collections, or apply a discount code?

#### Checklist (once design is provided)

- [ ] **Create route** — `hydrogen/app/routes/deals.tsx`
  - Loader fetches deal/promotion data (source TBD)
  - Page: title + subtitle + 2-column card grid
  - Each card: promotion image, title, description, CTA button
  - Responsive: 2-col on desktop, 1-col on mobile

- [ ] **Add "Deals" to header navigation** — `hydrogen/app/components/layout/Header.tsx`
  - Add link alongside "What's New" and "Blog & Media"

- [ ] **Deal claim safeguards** (see Workstream 3)

---

### Workstream 3: Deal Claim Safeguards
**Priority**: Medium | **Effort**: Medium-Large | **Meeting**: Mar 15

> *"customers should only be able to claim a deal once, unless it is a referral reward, which is a repetitive discount offered only through the customer account portal"* — Shawn Jones (Mar 15)

#### Design Decisions Needed (from Shawn)

- [ ] **Define deal types and rules**:
  - Standard deal: one-time claim per customer
  - Referral reward: repeatable, only accessible via customer account portal
  - How are deals tracked? (Shopify discount code usage? Custom metafield on customer?)
  - What happens when a customer tries to re-use a deal? (error message, hidden button, etc.)

#### Checklist (once rules are defined)

- [ ] **Track deal usage per customer** — likely via customer metafield (JSON array of claimed deal IDs)
- [ ] **Server-side validation** — check metafield before applying discount code
- [ ] **Client-side UX** — disable/hide "Claim" button if already used; show "Already claimed" state
- [ ] **Referral reward exception** — always allow if deal type is `referral`
- [ ] **Account portal integration** — referral rewards visible in customer account dashboard

---

### Workstream 4: Auto-Apply Stored Promo Codes for Logged-in Users
**Priority**: Low (deferred) | **Effort**: Medium | **Meeting**: Mar 15

> *"implementing a feature where logged-in users could automatically access and leverage their stored promo codes instead of typing them in"* — Shawn Jones (Mar 15)
> *"this may be a later implementation"* — Meeting notes

#### Design Decisions Needed (from Shawn)

- [ ] **How are promo codes stored per customer?** (Shopify customer metafield? Separate system?)
- [ ] **UX flow**: Auto-apply on cart load? Show dropdown of available codes? Both?
- [ ] **Should codes show in account dashboard?** (e.g., "My Promo Codes" section)

#### Checklist (once design is provided)

- [ ] **Store promo codes on customer** — customer metafield `custom.promo_codes` (JSON array)
- [ ] **Fetch codes in cart loader** — for authenticated users, read metafield
- [ ] **Display available codes** — UI in `PromoCodeCard` showing saved codes as clickable pills
- [ ] **Auto-apply logic** — optionally auto-apply best available code on cart load
- [ ] **Account dashboard section** — "My Promo Codes" card showing active/expired codes

---

### Workstream 5: Shipping Subcategory Selection Refinement
**Priority**: Medium | **Effort**: Small | **Meeting**: Mar 22

> *"They fill in the information and then below the information we can ask another question... is this your aunt, uncle, blah blah blah?"* — Shawn Jones (Mar 22)

Current `ShippingCategorySelector` workflow: Select category → Select contact → Auto-fill form.
Shawn's preferred workflow: Select category → Fill in form → Then select subcategory (aunt, uncle, etc.) **below** the form.

#### Checklist

- [ ] **Review current ShippingCategorySelector flow** — `hydrogen/app/components/checkout/ShippingCategorySelector.tsx`
  - Current: Category pills at top → Contact dropdown → Auto-fill
  - Shawn wants: Category pills at top → User fills form → Subcategory dropdown below form

- [ ] **Add subcategory selector below shipping form** — `hydrogen/app/routes/checkout.shipping.tsx`
  - Only visible when "Family" category is selected (highest subcategory count)
  - Dropdown options: Mom, Dad, Sister, Brother, Aunt, Uncle, Cousin, Grandparent, Child, Other
  - Save selected subcategory with the address for future reference

- [ ] **Update address book save logic** — when saving a new address during checkout, include the subcategory
  - `lib/address-book.ts` — ensure subcategory field is persisted

- [ ] **Test**: Select "Family" → fill address → select "Aunt" subcategory → address saved with subcategory

---

### Workstream 6: Blog & Media Section
**Priority**: Low (blocked) | **Effort**: Medium | **Meeting**: Mar 15

> *"for blog and media sections, shawn jones suggested consulting with Darien on what to display, likely titles of posts or series"* — Meeting notes (Mar 15)

#### Blocked On

- [ ] **Darien's input** — What content to display (blog post titles, series, media links?)
- [ ] **Content source** — Shopify blog? External CMS? Manual entries?

#### Checklist (once unblocked)

- [ ] **Create route** — `hydrogen/app/routes/blog.tsx` or `hydrogen/app/routes/blog._index.tsx`
- [ ] **Blog listing page** — card grid with post title, excerpt, date, featured image
- [ ] **Blog detail page** — `hydrogen/app/routes/blog.$handle.tsx`
- [ ] **Wire "Blog & Media" header link** — currently in header but may link to placeholder

---

### Workstream 7: Klaviyo Integration (Marketing Automation)
**Priority**: Low | **Effort**: Medium | **Meeting**: Mar 22

> *"Klaviyo... a marketing automation tool for AI email marketing and SMS to help recover abandoned carts. They noted that Klaviyo has a free version."* — Jeremiah Tillman (Mar 22)

#### Blocked On

- [ ] **Ask Darien** — about Klaviyo vs. alternatives (Shawn to coordinate)
- [ ] **Decision on tool** — Klaviyo free tier vs. other options

#### Checklist (once tool is selected)

- [ ] **Install Klaviyo Shopify app** — via Shopify Admin (no code)
- [ ] **Configure abandoned cart flow** — email + SMS automation
- [ ] **Add Klaviyo tracking snippet** — `hydrogen/app/root.tsx` (script tag for event tracking)
- [ ] **Track key events** — page views, add to cart, checkout started, purchase completed
- [ ] **Test abandoned cart recovery** — add item, leave, verify email/SMS received

---

### Workstream 8: Product Manuals/Installation Docs on PDP
**Priority**: Low | **Effort**: Small | **Meeting**: Mar 22

> *"the product information for the larger appliances, such as washing machines, included installation and user manuals, which should be incorporated into their own product information"* — Meeting notes (Mar 22)

#### Design Decisions Needed

- [ ] **Where do manuals live?** (Shopify file uploads? Metafield with URL? Product description?)
- [ ] **Which product types get manuals?** (appliances, furniture, electronics?)
- [ ] **PDP placement** — inside existing "Details" accordion? New "Manuals" accordion item?

#### Checklist (once decided)

- [ ] **Add metafield** — `custom.product_manuals` (JSON array of `{title, url}` objects) in Shopify Admin
- [ ] **Query metafield** — add to PDP product query in `products.$handle.tsx`
- [ ] **Render download links** — in accordion section, show PDF/document links with download icons
- [ ] **Conditional display** — only show if product has manuals attached

---

## Administrative / Non-Coding Tasks

These items require action from team members outside of code:

| # | Task | Owner | Meeting | Status |
|---|------|-------|---------|--------|
| 1 | Push Hydrogen work to main repo for Jeremiah access | Derek | Mar 22 | :white_square_button: Pending |
| 2 | Change "design" to "development" in project sheets | Shawn | Mar 22 | :white_square_button: Pending |
| 3 | Set up Google Admin Console for support emails (10-step instructions Derek shared) | Shawn | Mar 22 | :white_square_button: Pending |
| 4 | Ask Darien about Klaviyo / marketing automation recommendation | Shawn | Mar 22 | :white_square_button: Pending |
| 5 | Clean up SEO keywords/highlights in product data (Shopify Admin) | Shawn | Mar 15 | :white_square_button: Pending |
| 6 | Provide notes on what each Shopify category metafield means (for spec ordering) | Shawn | Mar 15 | :white_square_button: Pending |
| 7 | Create test promo code `TESTPROMO10` in Shopify Admin | Shawn | Mar 15 | :white_square_button: Pending |
| 8 | Jeremiah get up to speed on Hydrogen codebase | Jeremiah | Mar 22 | :white_square_button: In Progress |
| 9 | Provide backup internet solution (hotspot) for Derek | Shawn/Jeremiah | Mar 22 | :white_square_button: Pending |
| 10 | Confirm completion of checkout page + review final homepage/product pages | Shawn | Mar 22 | :white_square_button: Next meeting |

---

## Priority Execution Order

Based on meeting urgency signals and dependencies:

| Order | Workstream | Blocked? | Est. Effort |
|-------|-----------|----------|-------------|
| 1 | WS1: "New Product" Badge on Collections | No | 1-2 hours |
| 2 | WS5: Shipping Subcategory Refinement | No | 2-3 hours |
| 3 | WS2: Deals & Promotions Page | Yes (needs Figma design) | 4-6 hours |
| 4 | WS3: Deal Claim Safeguards | Yes (needs rules from Shawn) | 6-8 hours |
| 5 | WS8: Product Manuals on PDP | Yes (needs metafield decision) | 2-3 hours |
| 6 | WS6: Blog & Media Section | Yes (needs Darien's input) | 6-8 hours |
| 7 | WS4: Auto-Apply Stored Promo Codes | Yes (deferred, needs design) | 4-6 hours |
| 8 | WS7: Klaviyo Integration | Yes (needs tool decision) | 3-4 hours |

**Recommended next step**: Start with WS1 (unblocked, small effort, high visibility) and WS5 (unblocked, addresses Shawn's specific UX feedback).

---

## Meeting Accuracy Notes

The Gemini-generated meeting notes are largely accurate. Minor corrections:

1. **Mar 15**: Notes say "removing the product title from the breadcrumb navigation" — this was already done before the meeting; Shawn confirmed the existing behavior, not requesting a new change.
2. **Mar 15**: "Derek Hawkins fixed the menu functionality" — this was already fixed, not done during the meeting.
3. **Mar 22**: Notes say "the logic for the address book functionality... is complete and pending UI integration" — the UI was subsequently integrated in the `ShippingCategorySelector` component before this plan was written.
4. **Mar 22**: The welcome survey was described as blocked by the new API redirect — it has since been implemented at `account.welcome.tsx` with redirect logic in `account._index.tsx`.
5. **Mar 22**: "image-variation linking" was explicitly deferred to "go live" stage by Shawn in the Mar 15 meeting — not a current action item.
