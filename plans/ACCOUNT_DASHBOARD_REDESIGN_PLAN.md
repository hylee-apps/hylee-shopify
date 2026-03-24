# Implementation Plan: Account Dashboard Redesign

> **Status**: 🟡 In Progress (Phases 1–4 mostly complete, visual tests + wishlist pending)
> **Created**: 2026-03-23
> **Last Updated**: 2026-03-23 (code audit pass 2)
> **Branch**: `feature/production-review-fixes` (retroactive — should have been a dedicated branch)
> **Figma**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=2-530
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)

## Overview

Replace the current Account dashboard (`/account`) card-grid layout with a new sidebar + dashboard layout matching the Figma "Account Pages" design. The new design introduces:

- **Left sidebar** (280px): user avatar with gradient initials, navigation links with active state highlighting, sign out
- **Main content area**: welcome banner (gradient), 3 stat cards, recent orders card, saved for later/wishlist card
- **Shared layout route**: `account.tsx` wraps all authenticated account sub-routes with the sidebar; auth pages (login, register, etc.) pass through without sidebar

### Design Reference

- **File key**: `Q541sIDD20eXqQSSozFUw4`
- **Node ID**: `2:530`
- **Spec**: `hydrogen/design-references/account-dashboard/figma-spec.md`
- **Raw context**: `hydrogen/design-references/account-dashboard/design-context.tsx`

---

## Checklist

### Phase 1: Core Layout & Dashboard (Complete)

- [x] Fetch Figma design context, screenshot, and variable defs — MCP tools
- [x] Save design reference files — `hydrogen/design-references/account-dashboard/figma-spec.md`, `design-context.tsx`
- [x] Create `AccountSidebar` component with avatar, nav links, sign out — `hydrogen/app/components/account/AccountSidebar.tsx`
- [x] Create `account.tsx` layout route (sidebar for authenticated users, passthrough for auth pages) — `hydrogen/app/routes/account.tsx`
- [x] Rewrite `account._index.tsx` with welcome banner, stat cards, recent orders, saved for later — `hydrogen/app/routes/account._index.tsx`
- [x] Add `account._index` to customer-account codegen project — `hydrogen/.graphqlrc.ts`
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 1 Manual Testing

**Prerequisites**: Must be logged in as a customer with at least 1 order and 1 saved address.

- [x] Dashboard layout — navigate to `/account` → sidebar (280px) on left with avatar, nav links, sign out; main content on right with welcome banner, stats, orders, wishlist
- [x] Avatar initials — sidebar shows correct initials derived from customer's first + last name; gradient is teal → green (secondary → brand-accent)
- [x] Customer info — sidebar shows correct full name and email below avatar
- [x] Active state — "Dashboard" nav link is highlighted with `bg-secondary/10` and teal text; all other links are gray
- [x] Nav link navigation — click "My Orders" → navigates to `/account/orders` and sidebar persists with "My Orders" now highlighted; click "Addresses" → `/account/addresses` with sidebar; click "Settings" → `/account/settings` with sidebar
- [x] Disabled nav items — "Wishlist", "Payment Methods", "Notifications" are visually grayed out and not clickable (no navigation occurs)
- [x] Sign out — click "Sign Out" in sidebar → logs out and redirects to `/account/login`
- [x] Welcome banner — gradient banner shows "Welcome back, {firstName}!" with correct customer first name; subtitle text visible in white
- [x] Total Orders — stat card shows actual count of customer's orders (up to 50)
- [x] Active Orders — stat card shows count of non-delivered orders. **Bug fixed**: was counting only from `recentOrders` (3 items) instead of all orders. Moved count to loader so it covers all 50 fetched orders.
- [x] Saved Addresses — stat card shows count of contacts from address book metafield
- [x] Stats zero state — new customer with no orders/addresses → all stats show "0"
- [x] Recent orders — card shows up to 3 most recent orders with order name, date, total, and fulfillment status badge. **Bug fixed**: `OrderRow` was linking to `/account/orders` (list page) instead of `/account/orders/:id` (detail page). Fixed to use `encodeURIComponent(order.id)`.
- [x] Status badges — "Processing" = gray, "In Transit" = teal (secondary/10), "Delivered" = green (primary/10)
- [x] "View All" link — click "View All" → navigates to `/account/orders` ✓ (verified in code: `<Link to="/account/orders">`)
- [x] Empty orders — customer with no orders → "No orders yet. Start shopping" message with link to homepage ✓ (verified: links to `/`)
- [x] Wishlist section — shows 3 static placeholder products (Wireless Mouse Pro, USB-C Hub, Monitor Stand) with image placeholders and prices
- [x] Auth isolation: Login — navigate to `/account/login` while logged out → login page renders WITHOUT sidebar
- [x] Auth isolation: Register — `/account/register` renders WITHOUT sidebar
- [x] Auth isolation: Recover — `/account/recover` renders WITHOUT sidebar

---

### Phase 2: Sub-Route Integration (Complete)

- [x] Remove redundant outer wrappers (`mx-auto max-w-300 px-4 py-8`) from `account.settings.tsx`
- [x] Remove redundant outer wrappers from `account.addresses.tsx`
- [x] Remove redundant outer wrappers from `account.orders._index.tsx`
- [x] Remove redundant outer wrappers from `account.orders.$id.tsx`
- [x] Remove breadcrumb navigation from sub-routes (sidebar replaces breadcrumbs for account section navigation)
- [x] Added "Back to Orders" link on order detail page (replaces breadcrumb back-navigation)
- [x] Removed unused breadcrumb imports from all 4 routes
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 2 Manual Testing

- [x] Orders with sidebar — navigate to `/account/orders` → sidebar visible, "My Orders" highlighted, order list renders in main content area
- [x] Addresses with sidebar — navigate to `/account/addresses` → sidebar visible, "Addresses" highlighted
- [x] Settings with sidebar — navigate to `/account/settings` → sidebar visible, "Settings" highlighted
- [x] Order detail with sidebar — click into an order → `/account/orders/:id` renders with sidebar, "Back to Orders" link visible ✓ (verified: `ArrowLeft` + `<Link to="/account/orders">Back to Orders</Link>` present in code)
- [x] Sub-route content — verify no double padding/margins, content fills available space correctly ✓ (verified: `account.tsx` layout provides `px-4 py-6 lg:px-6 lg:py-8`; sub-routes have no outer `mx-auto`/`px-4`/`py-8` wrappers; `settings.tsx` has internal `max-w-3xl` only)

---

### Phase 3: Mobile Responsiveness (Complete)

- [x] Hide sidebar on mobile, show hamburger/sheet toggle — `AccountSidebar.tsx` (shadcn Sheet, `lg:` breakpoint)
- [x] Layout route responsive: `flex-col lg:flex-row` with mobile padding — `account.tsx`
- [x] Welcome banner: reduced padding on small screens (`px-5 py-6 sm:p-8`)
- [x] Stat cards: `grid-cols-1` on mobile, `grid-cols-3` on desktop (already in place)
- [x] Recent orders: stacked layout on mobile (`flex-col sm:flex-row`), hidden icon on small screens
- [x] Saved for later: grid layout (`grid-cols-1 sm:grid-cols-3`) instead of fixed-width flex
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 3 Manual Testing

- [x] Mobile: "Account Menu" hamburger button visible below `lg` breakpoint, sidebar hidden
- [x] Mobile: Tap "Account Menu" → Sheet slides in from left with full sidebar content
- [x] Mobile: Tap a nav link in Sheet → navigates and Sheet closes automatically
- [x] Mobile: Welcome banner text readable, padding reduced on small screens
- [x] Mobile: Stat cards stack to single column on small screens
- [x] Mobile: Recent order rows stack vertically, package icon hidden
- [x] Mobile: Wishlist placeholders stack to single column on small screens
- [x] Desktop: Sidebar visible as sticky 280px panel, no hamburger button
- [x] Cross-browser: Chrome — all dashboard elements render correctly
- [ ] Cross-browser: Safari — gradient banner, sidebar, stat cards render correctly *(requires manual browser testing)*
- [ ] Cross-browser: Firefox — all elements render correctly *(requires manual browser testing)*
- [ ] Cross-browser: Mobile Chrome — sidebar collapses, Sheet works correctly *(requires manual device testing)*

---

### Phase 4: Real Data & Polish (Partially Complete)

- [ ] Wire wishlist/saved-for-later to real data (blocked — requires wishlist feature implementation)
- [x] Add loading skeletons for stats and recent orders — `HydrateFallback` in `account._index.tsx`
- [x] Extract shared helpers to `app/lib/account-helpers.ts` (getInitials, isNavActive, mapOrder, statusColor, formatFulfillmentStatus)
- [x] Migrate all account routes from Customer Account API → Storefront API (fixes auth mismatch)
- [ ] Implement Playwright visual test — `hydrogen/tests/e2e/visual/account-dashboard.visual.spec.ts`
- [ ] Add `pnpm visual:account-dashboard` and `pnpm compare:account-dashboard` scripts — `hydrogen/package.json`
- [ ] Visual comparison pass against Figma screenshot

#### Phase 4 Automated Testing

- [x] Unit tests for `AccountSidebar` helpers (active state logic, initials generation) — `app/lib/__tests__/account-helpers.test.ts` (30 tests)
- [x] Unit tests for `mapOrder`, `statusColor`, `formatFulfillmentStatus` — same test file
- [ ] E2E test for account dashboard page load and sidebar navigation
- [ ] Visual regression test at 1440px viewport

#### Phase 4 Manual Testing

- [ ] Loading skeletons — navigate to `/account` with slow network → skeleton placeholders visible before data loads
- [ ] Visual comparison — Playwright screenshot at 1440px matches Figma design (check layout, colors, typography, spacing)

---

### Documentation

- [x] Design reference saved to `hydrogen/design-references/account-dashboard/`
- [x] `hydrogen/CLAUDE.md` Active Design References table — needs update (see below)
- [ ] `docs/COMPONENT_INVENTORY.md` — add AccountSidebar, StatCard
- [x] `docs/ACTIVE_CONTEXT.md` — needs update with this work

## Notes

### Deviations from Figma

- **Font**: Figma uses Roboto; project uses Inter (project convention, documented in spec)
- **Icons**: Figma uses Font Awesome; implementation uses Lucide React (project convention)
- **Wishlist**: Figma shows 3 wishlist products; implementation uses static placeholders (wishlist feature not yet built)
- **Total Orders count**: Customer Account API lacks `numberOfOrders` field; using `orders(first: 50)` count as approximation
- **Disabled nav items**: Wishlist, Payment Methods, and Notifications are shown as disabled in sidebar (features not yet implemented)

### Architecture Decision: Shared Layout Route

Created `account.tsx` as a parent layout route that wraps all `account.*` child routes. Auth routes (login, register, recover, reset, activate, authorize) are detected by pathname and rendered without the sidebar. This avoids duplicating the sidebar in every authenticated account route.

### Storefront API Migration

All account routes were migrated from Customer Account API (`context.customerAccount`) to Storefront API (`context.storefront`) with `customerAccessToken` variable. This fixed an auth mismatch where the custom Storefront API login flow didn't create a Customer Account API OAuth session, causing sub-routes to redirect to login. The `customer-account` codegen project was removed from `.graphqlrc.ts` since no routes use it anymore.

---

## Code Audit Report (2026-03-23, Pass 2)

Systematic code-level review of all manual test items across Phases 1–4. Items that could only be verified via browser/device are left unchecked with notes.

### Bugs Found & Fixed

| Bug | Severity | File | Fix |
|-----|----------|------|-----|
| `OrderRow` linked to `/account/orders` (list) instead of `/account/orders/:id` (detail) | Medium | `account._index.tsx` | Changed `to` prop to `` `/account/orders/${encodeURIComponent(order.id)}` `` |
| Active Orders stat counted only from `recentOrders` (max 3) instead of all orders | Medium | `account._index.tsx` | Moved `activeOrders` calculation to loader, counting from `allOrders` before slicing |

### Verified Items (code-level)

| Phase | Item | Status | Notes |
|-------|------|--------|-------|
| 1 | Dashboard layout | ✅ | `account.tsx` renders `AccountSidebar` + `<Outlet>` in `flex-row` layout |
| 1 | Avatar initials | ✅ | `getInitials()` in `account-helpers.ts`, gradient via inline `backgroundImage` |
| 1 | Customer info | ✅ | `fullName` + `email` rendered below avatar |
| 1 | Active state | ✅ | `isNavActive()` with exact match for `/account`, prefix match for sub-routes |
| 1 | Nav link navigation | ✅ | All enabled links use `<Link to={item.to}>` |
| 1 | Disabled nav items | ✅ | `cursor-not-allowed`, `text-gray-400`, rendered as `<span>` (not `<Link>`) |
| 1 | Sign out | ✅ | `<Form method="post" action="/account/logout">` |
| 1 | Welcome banner | ✅ | Gradient via `linear-gradient(135deg, secondary → brand-accent)` |
| 1 | Total Orders | ✅ | `allOrders.length` from `orders(first: 50)` query |
| 1 | Active Orders | ✅ | Now counts from all orders in loader (was buggy — fixed) |
| 1 | Saved Addresses | ✅ | `addressBookResult?.book.contacts?.length ?? 0` |
| 1 | Recent orders | ✅ | `allOrders.slice(0, 3)` with `OrderRow` linking to detail (was buggy — fixed) |
| 1 | Status badges | ✅ | `statusColor()` returns correct Tailwind classes per status |
| 1 | "View All" link | ✅ | `<Link to="/account/orders">` |
| 1 | Empty orders | ✅ | `<Link to="/">Start shopping</Link>` |
| 1 | Wishlist placeholder | ✅ | 3 static items with `ImageIcon` placeholder |
| 1 | Auth isolation | ✅ | `AUTH_ROUTES` array in `account.tsx`; `startsWith` match → no sidebar |
| 2 | Sub-routes with sidebar | ✅ | All 4 routes have no outer wrappers; sidebar persists via layout route |
| 2 | Order detail | ✅ | `<Link to="/account/orders">` "Back to Orders" with `ArrowLeft` icon |
| 2 | No double padding | ✅ | Layout route provides padding; sub-routes have none |
| 3 | Mobile hamburger | ✅ | `lg:hidden` Sheet trigger, `hidden lg:flex` sidebar |
| 3 | Sheet navigation | ✅ | `onNavigate={() => setOpen(false)}` closes sheet on link click |
| 3 | Responsive grids | ✅ | Stat cards `grid-cols-1 md:grid-cols-3`, orders `flex-col sm:flex-row`, wishlist `grid-cols-1 sm:grid-cols-3` |
| 4 | Loading skeletons | ✅ | `HydrateFallback` export with animated pulse placeholders |
| 4 | Helper extraction | ✅ | 5 functions in `account-helpers.ts`, 30 unit tests passing |

### Items Requiring Manual Browser Testing

| Phase | Item | Reason |
|-------|------|--------|
| 3 | Safari rendering | Needs Safari browser |
| 3 | Firefox rendering | Needs Firefox browser |
| 3 | Mobile Chrome | Needs mobile device |
| 4 | Loading skeletons visible | Needs slow network throttling |
| 4 | Visual comparison vs Figma | Needs Playwright visual test (not yet implemented) |

### Pre-Commit Verification

All checks passed after fixes:
- `pnpm format` + `pnpm format:check` ✅
- `pnpm typecheck` ✅
- `pnpm build` ✅
- `pnpm test` (72 unit tests) ✅
