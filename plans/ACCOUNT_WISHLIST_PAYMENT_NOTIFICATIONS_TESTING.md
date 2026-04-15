# Manual Testing Plan: Account Wishlist, Payment Methods & Notifications

> **Status**: 🔴 Not Started
> **Created**: 2026-04-12
> **Implementation plan**: `plans/ACCOUNT_WISHLIST_PAYMENT_NOTIFICATIONS_PLAN.md`
> **Dev server**: `pnpm dev` (port 3000)

## Prerequisites

Before running any tests:

- [ ] Dev server is running (`pnpm dev`)
- [ ] You are logged in as a test customer (account with at least 1 past order and 1 saved address)
- [ ] You have a second test customer account with no orders/wishlist items (for empty-state tests)
- [ ] Admin API credentials are configured in `.env` (needed for metafield writes)
- [ ] Browser DevTools Network panel available to confirm API calls

---

## Phase 0: Sidebar Navigation

**Goal**: Confirm all three items are now active links in the sidebar.

- [ ] Navigate to `/account` while logged in
- [ ] Sidebar visible — "Wishlist" item is clickable (not grayed out, cursor is pointer not not-allowed)
- [ ] Sidebar visible — "Payment Methods" item is clickable
- [ ] Sidebar visible — "Notifications" item is clickable
- [ ] Click "Wishlist" → navigates to `/account/wishlist` (sidebar persists, "Wishlist" highlighted)
- [ ] Click "Payment Methods" → navigates to `/account/payment-methods` (sidebar persists, highlighted)
- [ ] Click "Notifications" → navigates to `/account/notifications` (sidebar persists, highlighted)
- [ ] Navigate back to `/account` → "Dashboard" is highlighted again, other items are unhighlighted
- [ ] Mobile (< 1024px): Open Account Menu sheet → all three items appear and are clickable; tapping
  one navigates and closes the sheet

---

## Phase 1: Wishlist Page

### 1a. Empty State

Use a fresh account with no wishlist items.

- [ ] Navigate to `/account/wishlist`
- [ ] Page title "Wishlist" is visible
- [ ] Card header "Saved Items" is visible
- [ ] Heart icon (large, gray) shown in the empty state
- [ ] "Your wishlist is empty" heading shown
- [ ] Supporting body text shown
- [ ] "Start Shopping" button is visible and links to `/collections/all`
- [ ] No product grid rendered

### 1b. Populated State

_Until the "Add to Wishlist from PDP" feature is built, populate the metafield manually via Shopify
Admin → Customers → [customer] → Metafields → `custom.wishlist`. Set the value to a JSON array of
product GIDs, e.g.: `["gid://shopify/Product/123456789"]`_

- [ ] Navigate to `/account/wishlist` after adding at least 1 product GID to the metafield
- [ ] Product card renders with correct product image
- [ ] Product title matches the product in Shopify Admin
- [ ] Price shows correctly (formatted, e.g. "$79.00")
- [ ] "Remove" button is visible on the card
- [ ] "Add to Cart" button is visible

### 1c. Remove Item

- [ ] Click "Remove" on a wishlist item
- [ ] Page reloads (or updates) and that item is no longer shown
- [ ] If the last item is removed, empty state is shown
- [ ] In Shopify Admin → Customers → Metafields, confirm `custom.wishlist` no longer contains the
  removed product GID

### 1d. Add to Cart from Wishlist

- [ ] Click "Add to Cart" on a wishlist item
- [ ] Cart icon in header updates with +1 count
- [ ] Item appears in the cart drawer/page
- [ ] Item is NOT removed from the wishlist after adding to cart (it stays saved)

### 1e. Out of Stock Item

_Set a product variant to out-of-stock in Shopify Admin, add its GID to the wishlist metafield._

- [ ] Navigate to `/account/wishlist`
- [ ] "Add to Cart" button is disabled (grayed out) for the out-of-stock item
- [ ] "Out of Stock" label or disabled state is visually clear

### 1f. Loading State

- [ ] Hard-refresh `/account/wishlist` on a slow connection (DevTools → Network → Slow 3G)
- [ ] Skeleton shimmer is visible before content loads
- [ ] Content loads correctly after skeleton

### 1g. Multiple Items

- [ ] Add 4+ product GIDs to the wishlist metafield
- [ ] All items render in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- [ ] Grid layout does not break with varying title lengths

---

## Phase 2: Payment Methods Page

### 2a. Page Renders

- [ ] Navigate to `/account/payment-methods`
- [ ] Page title "Payment Methods" is visible
- [ ] Card header "Saved Payment Methods" is visible
- [ ] CreditCard icon (large, gray) shown in the empty state
- [ ] "No saved payment methods" heading shown
- [ ] Explanatory body text about Shopify checkout payment options is visible
- [ ] Security notice row with lock/shield icon and "encrypted and secured by Shopify" text is shown
- [ ] "Continue Shopping" button links to `/` (homepage)

### 2b. Authenticated Guard

- [ ] Log out, then navigate directly to `/account/payment-methods`
- [ ] Redirected to `/account/login` (not shown a blank page)

### 2c. No Action Available

- [ ] There are no forms, buttons with POST actions, or interactive elements beyond "Continue Shopping"
- [ ] Page cannot be accidentally submitted

---

## Phase 3: Notifications Page

### 3a. Page Loads with Correct State

- [ ] Navigate to `/account/notifications`
- [ ] Page title "Notifications" is visible
- [ ] Card header "Email Notifications" is visible
- [ ] Four toggle rows are visible: Order Updates, Marketing Emails, Product Recommendations, Promotional Offers

### 3b. Order Updates Toggle (Required/Locked)

- [ ] "Order Updates" toggle is visually ON
- [ ] Toggle is disabled — cannot be toggled (click does nothing)
- [ ] "Required" badge is visible next to the row
- [ ] Subtext "Shipping confirmations..." is shown

### 3c. Marketing Emails Toggle (acceptsMarketing)

**Test ON → OFF:**
- [ ] Confirm current state matches `acceptsMarketing` value in Shopify Admin for the test customer
- [ ] If currently ON, click the Marketing Emails toggle to disable it
- [ ] Click "Save Preferences"
- [ ] Success banner appears: "Notification preferences saved."
- [ ] Reload page — toggle remains OFF
- [ ] In Shopify Admin → Customers → [customer], confirm `acceptsMarketing` is `false`

**Test OFF → ON:**
- [ ] Click the Marketing Emails toggle to enable it
- [ ] Click "Save Preferences"
- [ ] Success banner appears
- [ ] Reload page — toggle remains ON
- [ ] In Shopify Admin, confirm `acceptsMarketing` is `true`

### 3d. Product Recommendations & Promotional Offers Toggles (metafield)

- [ ] Both toggles start OFF for a fresh account (no metafield set yet)
- [ ] Enable "Product Recommendations", click "Save Preferences"
- [ ] Success banner appears
- [ ] Reload page — "Product Recommendations" is ON, "Promotional Offers" is still OFF
- [ ] In Shopify Admin → Customers → Metafields, confirm `custom.notification_preferences` value is
  `{"orderUpdates":true,"productRecommendations":true,"promotionalOffers":false}`
- [ ] Enable "Promotional Offers", click "Save Preferences"
- [ ] Reload — both are ON
- [ ] Disable "Product Recommendations", click "Save Preferences"
- [ ] Reload — "Product Recommendations" OFF, "Promotional Offers" ON

### 3e. Save Button State

- [ ] "Save Preferences" button shows "Saving..." label while the form submission is in flight
- [ ] Button is disabled during submission (cannot double-submit)
- [ ] Button returns to "Save Preferences" after submission completes

### 3f. Error Handling

_Simulate a server error by temporarily breaking the Admin API token in `.env`._

- [ ] Attempt to save preferences
- [ ] Error banner "Failed to save preferences. Please try again." is shown
- [ ] Page does not crash; form is still usable after error

### 3g. Authenticated Guard

- [ ] Log out, then navigate directly to `/account/notifications`
- [ ] Redirected to `/account/login`

---

## Phase 4: Dashboard "View Wishlist" Link

- [ ] Navigate to `/account` (dashboard)
- [ ] "Saved for Later" card is visible
- [ ] "View Wishlist" text in the card header is now a clickable link
- [ ] Clicking "View Wishlist" navigates to `/account/wishlist`

---

## Phase 5: Regression Tests

Confirm existing account pages still work correctly after the sidebar change.

- [ ] `/account` (Dashboard) — sidebar active state, stat cards, recent orders render correctly
- [ ] `/account/orders` — order list renders, sidebar shows "My Orders" highlighted
- [ ] `/account/orders/:id` — order detail renders, "Back to Orders" link works
- [ ] `/account/addresses` — address book renders, sidebar shows "Addresses" highlighted
- [ ] `/account/settings` — profile form and password form render, sidebar shows "Settings" highlighted
- [ ] Sign Out — click "Sign Out" in sidebar → logs out and redirects to `/account/login`
- [ ] Auth isolation — `/account/login` renders WITHOUT sidebar when logged out
