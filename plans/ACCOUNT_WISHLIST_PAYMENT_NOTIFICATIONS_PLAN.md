# Implementation Plan: Account Wishlist, Payment Methods & Notifications Routes

> **Status**: 🔴 Not Started
> **Created**: 2026-04-12
> **Branch**: `feature/account/wishlist-payment-notifications` (create before starting)
> **Figma**: No designs available — use existing account UI patterns as style reference
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)
> **Depends on**: Account Dashboard Redesign (complete), Account Profile Settings (complete)

## Overview

Three sidebar nav items in `AccountSidebar` are currently disabled (`disabled: true`, `to: '#'`):
- **Wishlist** → `/account/wishlist`
- **Payment Methods** → `/account/payment-methods`
- **Notifications** → `/account/notifications`

This plan builds out the route, loader, action, and UI for each. No Figma designs exist — all UI must
follow the established account page patterns (card + card header + card body, teal secondary color,
`rounded-xl border border-border bg-white shadow-sm`, etc.) already used in `account.settings.tsx`
and `account._index.tsx`.

### Data Constraints (read before building)

| Feature | Shopify API Capability |
|---|---|
| Wishlist | No native Storefront API field. Store as `custom.wishlist` customer metafield (JSON array of product GIDs). Read via Storefront API; write via Admin API (`setCustomerMetafields`). |
| Payment Methods | Storefront API does **not** expose saved payment methods. Page will be a polished informational/empty-state UI explaining users manage payment at checkout. |
| Notifications | `acceptsMarketing` on the customer object (Storefront API, `customerUpdate` mutation). Additional preferences (product recommendations, promotions) stored as `custom.notification_preferences` metafield (JSON object). |

### Style Reference — Shared Constants

Copy these from `account.settings.tsx` for consistency:

```typescript
const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 bg-white px-[17px] py-[13px] text-[15px] text-black placeholder:text-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary';

const LABEL_CLASS = 'block text-sm font-medium text-gray-700 leading-[21px]';

const BUTTON_CLASS =
  'rounded-lg bg-secondary px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50';
```

Card container pattern:
```tsx
<div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
  <div className="border-b border-border px-6 py-5">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
  </div>
  <div className="p-4 sm:p-6">{/* body */}</div>
</div>
```

---

## Checklist

### Phase 0: Branch & Sidebar Wire-Up

- [ ] Create branch: `feature/account/wishlist-payment-notifications`
- [ ] Update `hydrogen/app/components/account/AccountSidebar.tsx` — NAV_ITEMS:
  - Wishlist: change `to: '#'`, `disabled: true` → `to: '/account/wishlist'`, remove `disabled`
  - Payment Methods: change `to: '#'`, `disabled: true` → `to: '/account/payment-methods'`, remove `disabled`
  - Notifications: change `to: '#'`, `disabled: true` → `to: '/account/notifications'`, remove `disabled`
- [ ] Update `hydrogen/app/routes/account._index.tsx` — Saved for Later section:
  - Change the "View Wishlist" `<span>` to a `<Link to="/account/wishlist">` so it navigates
  - The placeholder items can remain (real data comes from the wishlist route itself)
- [ ] Run pre-commit checks to confirm baseline passes before any new routes:
  ```bash
  pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
  ```

---

### Phase 1: Wishlist Route

**File**: `hydrogen/app/routes/account.wishlist.tsx`

#### 1a. GraphQL — Storefront API

```graphql
# Read wishlist metafield + product details in one query
query WishlistProducts($customerAccessToken: String!, $ids: [ID!]!) {
  customer(customerAccessToken: $customerAccessToken) {
    wishlist: metafield(namespace: "custom", key: "wishlist") {
      value
    }
  }
  nodes(ids: $ids) {
    ... on Product {
      id
      title
      handle
      featuredImage { url altText }
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 1) {
        nodes { id availableForSale }
      }
    }
  }
}
```

#### 1b. Loader

1. Auth guard → redirect to `/account/login` if not logged in
2. Fetch customer metafield `custom.wishlist` via Storefront API
3. Parse JSON array of product GIDs (default to `[]` on missing/invalid)
4. If array is non-empty, fetch product details via `nodes(ids: $ids)` query
5. Return `{ wishlistItems: ProductSummary[] }`

```typescript
// ProductSummary shape
interface WishlistItem {
  id: string;           // product GID
  title: string;
  handle: string;
  image: { url: string; altText: string | null } | null;
  price: string;        // formatted, e.g. "$79.00"
  variantId: string;    // first variant GID for Add to Cart
  availableForSale: boolean;
}
```

#### 1c. Action

Single intent: `removeFromWishlist`

1. Read current wishlist metafield value (Storefront API)
2. Filter out the product GID from the array
3. Write updated array back via `setCustomerMetafields` (Admin API)
4. Return `{ success: true }`

```typescript
// Form fields
// intent: "removeFromWishlist"
// productId: string (GID)
```

> **Note**: Adding to wishlist is handled from the product card (`products.$handle.tsx`) — a separate
> task. This route only handles viewing and removing.

#### 1d. UI

```
Page title: "Wishlist"  (text-[28px] font-light text-gray-800)

Card: "Saved Items"
  Empty state (no items):
    Heart icon (size 48, text-gray-300)
    Heading: "Your wishlist is empty"
    Body: "Save items you love by clicking the heart icon on any product."
    CTA button: "Start Shopping" → links to /collections/all

  Populated state (N items):
    3-column grid (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3, gap-4)
    WishlistItemCard per item:
      - Product image (aspect-square, rounded-lg, object-cover)
      - Product title (text-sm font-medium text-gray-800, line-clamp-2)
      - Price (text-sm font-semibold text-secondary)
      - "Remove" button (text-xs text-red-500 hover:text-red-700, Form POST removeFromWishlist)
      - "Add to Cart" button (secondary teal, full-width, disabled if !availableForSale)
        → uses CartForm (same pattern as BuyAgainCard.tsx)
```

#### 1e. i18n Keys to Add (`en/common.json` under `account.wishlist`)

```json
"wishlist": {
  "pageTitle": "Wishlist",
  "cardTitle": "Saved Items",
  "emptyHeading": "Your wishlist is empty",
  "emptyBody": "Save items you love by clicking the heart icon on any product.",
  "startShopping": "Start Shopping",
  "remove": "Remove",
  "addToCart": "Add to Cart",
  "outOfStock": "Out of Stock",
  "itemCount": "{{count}} item",
  "itemCount_plural": "{{count}} items"
}
```

#### 1f. HydrateFallback (loading skeleton)

- Page title skeleton: `h-[42px] w-48 animate-pulse rounded bg-gray-200`
- Card skeleton: header bar + 3-column grid of product card skeletons

#### 1g. Pre-commit checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

### Phase 2: Payment Methods Route

**File**: `hydrogen/app/routes/account.payment-methods.tsx`

#### 2a. No API calls needed

The Shopify Storefront API does not expose saved payment methods. This route has:
- No loader data beyond auth check
- No action

#### 2b. Loader

```typescript
export async function loader({ context }: Route.LoaderArgs) {
  if (!isCustomerLoggedIn(context.session)) {
    return redirect('/account/login');
  }
  return {};
}
```

#### 2c. UI

```
Page title: "Payment Methods"  (text-[28px] font-light text-gray-800)

Card: "Saved Payment Methods"
  Empty state (always shown — no API support):
    CreditCard icon (size 48, text-gray-300)
    Heading: "No saved payment methods"
    Body paragraph:
      "Payment methods are stored securely by Shopify during checkout.
       You can use Shop Pay, Apple Pay, Google Pay, or a credit/debit
       card — your preferred method is remembered for future orders."
    Security notice row:
      ShieldCheck icon (size 16, text-secondary) + "Your payment info is encrypted and secured by Shopify"
    CTA: "Continue Shopping" → links to /
```

#### 2d. i18n Keys to Add (`en/common.json` under `account.paymentMethods`)

```json
"paymentMethods": {
  "pageTitle": "Payment Methods",
  "cardTitle": "Saved Payment Methods",
  "emptyHeading": "No saved payment methods",
  "emptyBody": "Payment methods are stored securely by Shopify during checkout. You can use Shop Pay, Apple Pay, Google Pay, or a credit/debit card — your preferred method is remembered for future orders.",
  "securityNotice": "Your payment info is encrypted and secured by Shopify",
  "continueShopping": "Continue Shopping"
}
```

#### 2e. Pre-commit checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

### Phase 3: Notifications Route

**File**: `hydrogen/app/routes/account.notifications.tsx`

#### 3a. GraphQL — Storefront API

```graphql
query CustomerNotificationPrefs($customerAccessToken: String!) {
  customer(customerAccessToken: $customerAccessToken) {
    acceptsMarketing
    notificationPrefs: metafield(namespace: "custom", key: "notification_preferences") {
      value
    }
  }
}

mutation UpdateMarketingConsent(
  $customerAccessToken: String!
  $customer: CustomerUpdateInput!
) {
  customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
    customer { acceptsMarketing }
    customerUserErrors { field message }
  }
}
```

#### 3b. Notification Preferences Metafield Shape

```typescript
interface NotificationPreferences {
  orderUpdates: true;          // always true, read-only — order emails are mandatory
  productRecommendations: boolean;
  promotionalOffers: boolean;
}
// Default: { orderUpdates: true, productRecommendations: false, promotionalOffers: false }
```

Stored as `custom.notification_preferences` — JSON string, written via `setCustomerMetafields` (Admin API).

#### 3c. Loader

1. Auth guard → redirect to `/account/login` if not logged in
2. Fetch `acceptsMarketing` + `notification_preferences` metafield via Storefront API
3. Parse metafield JSON (default to `{ productRecommendations: false, promotionalOffers: false }`)
4. Return `{ acceptsMarketing: boolean, prefs: NotificationPreferences }`

#### 3d. Action

Two intents:

**`updateMarketing`** — toggles `acceptsMarketing`:
1. Read `acceptsMarketing` boolean from form data
2. Call `customerUpdate` mutation with `{ acceptsMarketing: value }`
3. Return `{ success: true, intent: 'updateMarketing' }` or `{ errors, intent }`

**`updatePreferences`** — saves metafield prefs:
1. Read `productRecommendations` and `promotionalOffers` booleans from form data
2. Build updated prefs object
3. Fetch customer GID (needed for Admin API) via `CUSTOMER_SETTINGS_QUERY` pattern
4. Write via `setCustomerMetafields(env, customerId, [{ namespace: 'custom', key: 'notification_preferences', value: JSON.stringify(prefs), type: 'json' }])`
5. Return `{ success: true, intent: 'updatePreferences' }` or `{ errors, intent }`

#### 3e. UI

```
Page title: "Notifications"  (text-[28px] font-light text-gray-800)

Card 1: "Email Notifications"
  Description: "Manage which emails you receive from Hy-lee."
  Toggle rows (border-b between each):
    Row 1 — Order Updates
      Label: "Order Updates"
      Subtext: "Shipping confirmations, delivery updates, and order status changes"
      Toggle: ON, disabled (order emails are mandatory)
      Badge: "Required"  (bg-gray-100 text-gray-600 text-xs rounded px-2 py-0.5)

    Row 2 — Marketing Emails
      Label: "Marketing Emails"
      Subtext: "Sales, promotions, and new arrivals"
      Toggle: controlled by `acceptsMarketing`
      → Submits `updateMarketing` intent inline on change (optimistic)

    Row 3 — Product Recommendations
      Label: "Product Recommendations"
      Subtext: "Personalized suggestions based on your browsing and purchase history"
      Toggle: controlled by `prefs.productRecommendations`

    Row 4 — Promotional Offers
      Label: "Promotional Offers"
      Subtext: "Exclusive discount codes and special member offers"
      Toggle: controlled by `prefs.promotionalOffers`

  "Save Preferences" button (secondary teal) — submits `updatePreferences` intent
  Success/error feedback banner above button (same pattern as settings.tsx)
```

Toggle component: use HTML `<input type="checkbox">` styled as a toggle pill
(`appearance-none w-11 h-6 bg-gray-200 rounded-full checked:bg-secondary transition-colors cursor-pointer
relative after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white
after:shadow after:transition-transform checked:after:translate-x-5`)

OR use shadcn `Switch` component if it is already in the project.

> Check `hydrogen/app/components/ui/` for a `switch.tsx` — if present use it. If not, use the raw
> CSS toggle above to avoid adding a new dependency.

#### 3f. i18n Keys to Add (`en/common.json` under `account.notifications`)

```json
"notifications": {
  "pageTitle": "Notifications",
  "emailCard": {
    "title": "Email Notifications",
    "description": "Manage which emails you receive from Hy-lee.",
    "orderUpdates": {
      "label": "Order Updates",
      "subtext": "Shipping confirmations, delivery updates, and order status changes",
      "requiredBadge": "Required"
    },
    "marketingEmails": {
      "label": "Marketing Emails",
      "subtext": "Sales, promotions, and new arrivals"
    },
    "productRecommendations": {
      "label": "Product Recommendations",
      "subtext": "Personalized suggestions based on your browsing and purchase history"
    },
    "promotionalOffers": {
      "label": "Promotional Offers",
      "subtext": "Exclusive discount codes and special member offers"
    },
    "savePreferences": "Save Preferences",
    "saving": "Saving...",
    "successMessage": "Notification preferences saved.",
    "errorMessage": "Failed to save preferences. Please try again."
  }
}
```

#### 3g. Pre-commit checks
```bash
pnpm format && pnpm format:check && pnpm typecheck && pnpm build && pnpm test
```

---

### Phase 4: Dashboard Wishlist Section Wire-Up

Now that `/account/wishlist` is a real route, update the dashboard to link into it properly:

- [ ] `account._index.tsx` — "Saved for Later" card:
  - Change "View Wishlist" from `<span>` to `<Link to="/account/wishlist">`
  - Keep the 3 placeholder `WishlistPlaceholder` items as-is (they are visual placeholders, not data)
  - Add `t('account.dashboard.viewWishlist')` i18n key if not already present (it is — confirmed at line 202)

---

### Phase 5: Final Pre-Commit Checks

Run all checks across all changed files before committing:

```bash
pnpm format              # 1. Auto-format
pnpm format:check        # 2. Verify formatting
pnpm typecheck           # 3. TypeScript — MUST PASS
pnpm build               # 4. Production build — MUST PASS
pnpm test                # 5. Unit tests — MUST PASS
```

Fix any errors before committing. Do not commit known failures.

---

## Files Changed

| File | Change |
|---|---|
| `hydrogen/app/components/account/AccountSidebar.tsx` | Enable 3 nav items, update routes |
| `hydrogen/app/routes/account._index.tsx` | Wire "View Wishlist" to real link |
| `hydrogen/app/routes/account.wishlist.tsx` | **New** — full route |
| `hydrogen/app/routes/account.payment-methods.tsx` | **New** — full route |
| `hydrogen/app/routes/account.notifications.tsx` | **New** — full route |
| `hydrogen/app/locales/en/common.json` | Add `account.wishlist`, `account.paymentMethods`, `account.notifications` keys |
| `hydrogen/app/locales/es/common.json` | Mirror new keys (copy English as placeholder) |
| `hydrogen/app/locales/fr/common.json` | Mirror new keys (copy English as placeholder) |

## Out of Scope

- Adding to wishlist from the PDP/PLP (`products.$handle.tsx`, `ProductCard`) — tracked separately
- Real saved payment methods (requires third-party or future Shopify API support)
- Push/SMS notifications — `acceptsMarketing` covers email only; push requires a separate integration
- Automated E2E visual tests for the new pages (no Figma baseline to compare against)
