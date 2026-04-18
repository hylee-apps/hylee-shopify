# Advisory Board: UI Customer Value — Developer Overview

> **Date:** 2026-04-18
> **Presenter:** Derek (Developer)
> **Topic:** How the Hy-lee storefront UI delivers customer value

## Opening Frame

Hy-lee's Hydrogen storefront isn't just a tech migration — every UI decision maps to a specific customer outcome: **reduce friction, build trust, increase conversion.** Here's how.

---

## 1. Discovery & Search — "Help customers find what they want fast"

**Predictive Search in the Hero**
- Search bar lives at the top of the homepage hero, not buried in the nav — zero clicks to start searching
- Predictive results appear inline as the customer types (no page reload)
- *Why it matters:* First-click abandonment is the #1 cause of lost sales on marketplaces; surfacing results immediately keeps the customer in flow

**Collection & Filter System**
- Filters sidebar with a "Browse By" section for structured category navigation
- Active filter chips let customers see and remove applied filters without re-navigating
- *Why it matters:* Customers on a marketplace need confidence they're seeing the right product set, not the full catalog

**L2 Subcategory Navigation**
- Subcategories rendered as visual squares (not a text list) — scannable at a glance
- Breadcrumb navigation uses chevrons for clear orientation

---

## 2. Product Detail Page — "Give customers the confidence to buy"

**Three-Column Layout**
- Gallery (vertical thumbnails) | Info (title, rating, accordion specs) | Purchase (price, variant selector, quantity, Add to Cart)
- Mirrors the mental model of in-store evaluation: look → read → decide → buy

**"Does It Fit" Feature**
- Conditionally shown for furniture and appliances only — not noise for unrelated product types
- Answers the #1 pre-purchase anxiety for large-item categories

**Specs Accordion**
- Top 6 primary specs inline; full spec list in the expandable section
- Prevents page clutter while ensuring power-buyers can access everything

**Product Reviews**
- Customers can submit and read reviews directly on the PDP
- Star ratings + written reviews = social proof without leaving the product page
- *Why it matters:* Reviews reduce return rates by setting accurate expectations

**Variant Selector**
- Customers select size/color/configuration before adding to cart — no "oops, wrong size" post-purchase

---

## 3. Checkout Flow — "Remove every possible reason to abandon"

A custom 5-step flow was built because Shopify's default checkout lacks our brand context:

| Step | What the Customer Experiences |
|------|-------------------------------|
| Cart | Order summary, promo code entry, proceed CTA |
| Payment | Choose payment method preference up front |
| Shipping | Address form + Standard shipping (simplified — no confusing tier choice) |
| Review | Full order review before committing — builds confidence |
| Shopify Payment | Trusted, PCI-compliant hosted checkout with pre-filled address |
| Confirmation | Order success, full breakdown, guest account creation CTA |

**Key value decisions:**
- Shipping simplified to Standard only — eliminates decision paralysis
- Buyer identity (email, address) pre-populated into Shopify's hosted checkout — customers don't re-enter data they already provided
- Progress indicator at every step so customers always know where they are
- Checkout state persists via cart attributes — survives browser close/reopen

---

## 4. Customer Account — "Make customers feel known"

**Account Dashboard**
- Welcome banner with the customer's name (gradient header = feels premium)
- 3 stat cards: Total Orders, Active Orders, Saved Addresses — at-a-glance relationship summary
- Recent Orders card with status badges — no hunting through a flat list
- Sidebar navigation: Dashboard, My Orders, Wishlist, Addresses, Payment Methods, Notifications, Settings

**Why it matters:** Repeat purchase rate is directly correlated to account engagement. Customers who can see their history and manage their account feel like members, not transactions.

---

## 5. Return Process — "Make returns painless enough to encourage re-purchase"

A 4-step guided return flow (vs. a contact form or email):

| Step | Customer Action |
|------|----------------|
| Select Items | Checkboxes, select all, estimated refund shown live |
| Reason | Per-item reason dropdown + optional detail — not a blanket "why are you returning?" |
| Shipping | 3 options: UPS Drop-off / UPS Pickup / Instant Return |
| Resolution | Customer chooses: Exchange, Replace, Store Credit, or Refund |

**Why this matters for the board:** Easy returns = higher lifetime value. The "Make It Right" framing on Step 4 is deliberate brand language — it positions Hy-lee as a partner, not an adversary. Customers who have a good return experience buy again at higher rates than customers who never returned anything.

---

## 6. Promotional System — "Give customers a reason to engage at every tier"

Stackable promotional tiers built into the UI:
- **10%** — First purchase
- **15%** — Account creation
- **20%** — Referral
- **25%** — Partner codes

Already-discounted products excluded automatically (protects margin). Promo discount shown as a dollar amount at checkout (not a code string) — customers understand what they're actually saving.

---

## 7. Trust & Policy Layer — "Reduce purchase anxiety"

- **Return Policy page** — fully designed, linked from footer, linked from PDP purchase zone
- **FAQ page** — live and linked from footer
- **Policies index** — single URL that links to all policy pages
- *Why it matters:* Customers hesitate at the point of purchase when they can't quickly answer "what if this doesn't work out?" Every trust signal on the path to checkout lifts conversion.

---

## 8. Internationalization (i18n) — "Ready to scale beyond English"

All UI copy is externalized to locale files — no hardcoded strings. Every page supports translation without a code change. *Why it matters for the board:* The architecture decision to build this in from day one (not retrofit it) is a competitive moat as the audience grows.

---

## Closing Point

Every feature on this list was designed around one question: **what would make a customer trust us enough to buy, and trust us enough to come back?** The return process and checkout flow are the two places most storefronts lose customers — we've built those to be the best experiences in our category, not an afterthought.

**Strongest anchors for board Q&A:** checkout conversion, returns → repeat purchase, and the promotional tier strategy — those connect most directly to revenue.
