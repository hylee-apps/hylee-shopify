# Implementation Plan: Go-Live Polish — April 18 Deadline

> **Status**: In Progress — WS1 & WS2 complete, WS3 pending
> **Created**: 2026-04-12
> **Source**: Weekly Meeting 2026-04-11 (Shawn Jones, Derek Hawkins, Darian Banks)
> **Deadline**: April 18, 2026
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

---

## Overview

Six remaining items stand between current state and go-live. Four are header/homepage nav changes
(quick), one is a new FAQ page (quick), and one is the account promotional deal section (medium).
All must land before April 18.

---

## Workstream 1: Homepage Header Nav — Seasonal, Discounts, Promotions & Deals

**Priority**: CRITICAL | **Effort**: Small
**Branch**: `hotfix/homepage/nav-pre-launch`

### Current state (Header.tsx — homepage variant nav, line 346–368)
```
Categories ▾  |  What's New  |  Blog & Media
```

### Target state
```
Categories ▾  |  What's New  |  Discounts  |  Promotions & Deals  |  Blog & Media
```
Plus "Seasonal" must appear **inside** the Categories dropdown (CategoryBar).

---

### Task 1A — Add Seasonal to Category Bar

**File**: `hydrogen/app/config/navigation.ts`

The `CategoryBar` is fed by Shopify collections that have the `custom.menu_priority_order`
metafield. If the `seasonal` collection in Shopify has this metafield, it already appears.

**Implementation approach**: Add a `pinnedHandles` array to `categoryNavConfig` — a list of
collection handles that are always appended to the categories array even if they lack the metafield.
This avoids a Shopify admin change and works immediately.

**Changes**:

1. Update `CategoryNavConfig` interface and `categoryNavConfig` in `navigation.ts`:
```ts
export interface CategoryNavConfig {
  excluded: string[];
  maxVisible: number;
  /** Handles always appended to nav (no metafield needed) */
  pinned: Array<{handle: string; title: string}>;
}

export const categoryNavConfig: CategoryNavConfig = {
  excluded: [],
  maxVisible: 8,  // bump from 7 to accommodate seasonal
  pinned: [
    {handle: 'seasonal', title: 'Seasonal'},
  ],
};
```

2. Update `prioritizeCategories()` in `root.tsx` (or wherever it lives) to append pinned handles
   that aren't already in the list:
```ts
const existing = new Set(categories.map((c) => c.handle));
for (const p of config.pinned) {
  if (!existing.has(p.handle)) {
    categories.push({id: p.handle, title: p.title, handle: p.handle, priority: 999});
  }
}
```

---

### Task 1B — Add Discounts & Promotions & Deals nav links

**File**: `hydrogen/app/components/layout/Header.tsx`

In the homepage header nav block (currently lines 346–369), add two new `<Link>` elements between
`What's New` and `Blog & Media`:

```tsx
<Link to="/collections/discounts" className={NAV_TRIGGER_CLASS}>
  Discounts
</Link>

<Link to="/pages/promotions" className={NAV_TRIGGER_CLASS}>
  Promotions &amp; Deals
</Link>
```

Also add both to **MobileMenu** in `hydrogen/app/components/layout/Header.tsx` (currently
lines 201–215, after the What's New link):

```tsx
<Link
  to="/collections/discounts"
  className="block px-4 py-3 text-text font-medium border-b border-border hover:text-primary"
  onClick={onClose}
>
  Discounts
</Link>
<Link
  to="/pages/promotions"
  className="block px-4 py-3 text-text font-medium border-b border-border hover:text-primary"
  onClick={onClose}
>
  Promotions &amp; Deals
</Link>
```

---

### Task 1C — Add Discounts body section to homepage

**File**: `hydrogen/app/routes/_index.tsx`

Add a new GraphQL query for discounted products (products that have a `compareAtPrice`):

```graphql
query DiscountedProducts($first: Int!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
  products(first: $first, query: "compare_at_price:>0", sortKey: PRICE, reverse: false) {
    nodes {
      id title handle vendor availableForSale tags createdAt
      images(first: 2) { nodes { id url altText width height } }
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      variants(first: 1) {
        nodes {
          id availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
  }
}
```

Add to the parallel `Promise.all` in the loader. Return as `discounted`.

In the page component, add a `<ProductSection>` between the Seasonal section and Promotions & Deals:

```tsx
{discounted.length > 0 && (
  <ProductSection
    categoryLabel="Discounts"
    seeAllUrl="/collections/discounts"
    collectionHandle="discounts"
    products={discounted as CollectionProduct[]}
  />
)}
```

**Note**: If Shopify doesn't return results for `compare_at_price:>0`, Shawn may need to ensure
products have compare-at prices set. The section simply won't render if the array is empty.

---

### Pre-commit checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 2: FAQ Page + Footer Link

**Priority**: HIGH | **Effort**: Small
**Branch**: `hotfix/homepage/nav-pre-launch` (same branch as Workstream 1)

### Current state
Footer `DEFAULT_LINKS` (Footer.tsx line 35–41) has: About | Terms | Privacy | Help | Become a Supplier.
No FAQ page exists. Shawn has FAQ content ready to paste into Shopify Pages.

### Target state
- New route: `/pages/faq` (handled by the existing `pages.$handle.tsx` catch-all)
- Footer link added: `{title: 'FAQ', url: '/pages/faq'}`

**The route already exists** — `hydrogen/app/routes/pages.$handle.tsx` handles any Shopify Page
by its handle. Shawn just needs to create a "faq" page in Shopify Admin > Online Store > Pages
with handle `faq`. No new route file needed.

### Changes

**File**: `hydrogen/app/components/layout/Footer.tsx`

Add FAQ to `DEFAULT_LINKS`:
```ts
const DEFAULT_LINKS = [
  {title: 'About', url: '/pages/about'},
  {title: 'FAQ', url: '/pages/faq'},           // ← ADD THIS
  {title: 'Terms of Use', url: '/policies/terms-of-service'},
  {title: 'Privacy Policy', url: '/policies/privacy-policy'},
  {title: 'Help', url: '/pages/help'},
  {title: 'Become a Supplier', url: '/pages/become-a-supplier'},
];
```

**Action for Shawn**: Create a Shopify Page titled "FAQ" with handle `faq` in Shopify Admin and
paste the FAQ content there. The route will render it automatically.

---

## Workstream 3: Account — My Deals Section

**Priority**: HIGH | **Effort**: Medium
**Branch**: `hotfix/customer/account-deals`

### Current state
`hydrogen/app/routes/account._index.tsx` has: Welcome Banner → Stats Row → Recent Orders →
Saved for Later. No deals/promotions section exists yet.

### Target state
Add a "My Deals" card below Stats Row (above Recent Orders) that shows the customer's active
promotional deals with expiry dates.

### Data approach
Promotional deals are stored as Shopify customer metafields (per the Mar 29 meeting plan).
The Mar 29 plan defined the promotional tiers:
- 10% first-purchase
- 15% account creation
- 20% referral
- 25% partner codes

Deals are stored in the `custom.active_deals` customer metafield as JSON, per the
`ACCOUNT_DASHBOARD_REDESIGN_PLAN.md` and `MEETING_ACTION_ITEMS_MAR29.md` plans.

### Changes

**File**: `hydrogen/app/routes/account._index.tsx`

1. Add metafield to `DASHBOARD_ORDERS_QUERY` (or a separate query):
```graphql
query DashboardOrders($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    # existing orders query...
    metafield(namespace: "custom", key: "active_deals") {
      value
    }
  }
}
```

2. Parse the metafield in the loader:
```ts
type DealEntry = {
  code: string;
  description: string;
  discountPercent: number;
  expiresAt: string | null;  // ISO date string or null
};

// In loader:
const dealsRaw = data.customer?.metafield?.value;
const activeDeals: DealEntry[] = dealsRaw ? JSON.parse(dealsRaw) : [];
```

3. Return `activeDeals` from the loader.

4. Add `MyDealsCard` component inline in the file:
```tsx
function MyDealsCard({deals}: {deals: DealEntry[]}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <h2 className="text-lg font-bold text-gray-900">My Deals</h2>
        <Link
          to="/pages/promotions"
          className="text-[15px] font-medium text-secondary hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="p-6">
        {deals.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-muted">
            No active deals.{' '}
            <Link to="/pages/promotions" className="text-secondary hover:underline">
              See promotions
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {deals.map((deal) => (
              <DealRow key={deal.code} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DealRow({deal}: {deal: DealEntry}) {
  const expires = deal.expiresAt ? new Date(deal.expiresAt) : null;
  const daysLeft = expires
    ? Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysLeft !== null && daysLeft <= 7;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold text-dark">
          {deal.discountPercent}% off — {deal.description}
        </span>
        <span className="font-mono text-[12px] text-text-muted">{deal.code}</span>
      </div>
      {daysLeft !== null && (
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${
            isExpiringSoon
              ? 'bg-red-50 text-red-600'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
        </span>
      )}
    </div>
  );
}
```

5. Insert `<MyDealsCard deals={activeDeals} />` between the Stats Row and Recent Orders in the
   `AccountDashboard` return.

6. Update `HydrateFallback` with a skeleton for the deals card:
```tsx
<div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
  <div className="flex items-center justify-between border-b border-border px-6 py-5">
    <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
  </div>
  <div className="flex flex-col gap-3 p-6">
    {[1, 2].map((i) => (
      <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
    ))}
  </div>
</div>
```

### Note on metafield setup
If the `custom.active_deals` metafield doesn't exist on the customer yet (likely the case for
test accounts), the section renders the empty state ("No active deals"). This is the correct
fallback — no error state needed. Shawn will populate deals via Shopify admin or a future
discount flow when the promo system is fully wired.

### Pre-commit checks

```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

## Workstream 4: Spec Attribution (Product Pages)

**Priority**: MEDIUM | **Effort**: Unknown — investigate first
**Branch**: `hotfix/product/spec-attribution`

This is still under investigation. Before planning, read the current PDP route to understand what
"spec attribution problem" means (likely metafield specs not mapping to the right product type
attributes on some products).

**First step**: Read `hydrogen/app/routes/products.$handle.tsx` and check how specs/metafields
are currently rendered. Then confirm with Shawn what specific products are showing wrong specs.

---

## Manual Testing Checklist (per workstream)

### Workstream 1 & 2 — Header Nav + FAQ

Run `pnpm dev` from the `hydrogen/` directory, then verify:

**Header nav (desktop, 1280px+)**
- [ ] Categories dropdown opens and shows all categories INCLUDING "Seasonal"
- [ ] "What's New" link navigates to `/collections/new-arrivals`
- [ ] "Discounts" link navigates to `/collections/discounts`
- [ ] "Promotions & Deals" link navigates to `/pages/promotions`
- [ ] "Blog & Media" link still present and navigates to `/blogs/news`
- [ ] CategoryBar closes when clicking elsewhere on the page

**Header nav (mobile, < 1024px)**
- [ ] Hamburger opens Sheet
- [ ] Categories section expands to show category list including "Seasonal"
- [ ] "What's New" link present
- [ ] "Discounts" link present
- [ ] "Promotions & Deals" link present
- [ ] Sheet closes after clicking any link

**Homepage body — Discounts section**
- [ ] "Discounts" ProductSection renders above "Promotions & Deals" if discounted products exist
- [ ] "See all" link goes to `/collections/discounts`
- [ ] If no discounted products, section is hidden (no empty state shown)

**Footer**
- [ ] "FAQ" link appears in footer between "About" and "Terms of Use"
- [ ] Clicking "FAQ" navigates to `/pages/faq`
- [ ] If Shopify Page `faq` doesn't exist yet, shows 404 (expected until Shawn creates the page)

---

### Workstream 3 — Account My Deals

Sign in to a test account, then verify at `/account`:

- [ ] "My Deals" card renders between Stats Row and Recent Orders
- [ ] With no metafield set: empty state shows "No active deals. See promotions" link
- [ ] With test metafield data: deal rows render with code, description, discount %, and expiry badge
- [ ] Deals expiring in ≤ 7 days show red "Xd left" badge
- [ ] Deals with null expiry show no badge
- [ ] "View All" link navigates to `/pages/promotions`
- [ ] Loading skeleton (HydrateFallback) renders correctly during SSR hydration

---

## Delivery Order (prioritized for April 18)

| # | Task | Branch | Est. Time |
|---|------|--------|-----------|
| 1 | Seasonal in CategoryBar (nav config) | `hotfix/homepage/nav-pre-launch` | 20 min |
| 2 | Discounts + Promotions & Deals nav links (header + mobile) | same | 20 min |
| 3 | Discounts body section (homepage) | same | 30 min |
| 4 | FAQ footer link | same | 5 min |
| 5 | Pre-commit checks + PR | — | 15 min |
| 6 | Account My Deals section | `hotfix/customer/account-deals` | 1–2 hr |
| 7 | Spec attribution (investigate first) | `hotfix/product/spec-attribution` | TBD |
