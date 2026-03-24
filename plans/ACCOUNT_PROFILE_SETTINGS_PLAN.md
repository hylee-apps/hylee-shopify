# Implementation Plan: Account Profile / Settings Page Redesign

> **Status**: 🟡 In Progress (Phases 1–4 complete, manual testing + visual tests pending)
> **Created**: 2026-03-24
> **Last Updated**: 2026-03-24
> **Branch**: `feature/production-review-fixes` (continuing account dashboard work)
> **Figma**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=2-995
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)
> **Depends on**: Account Dashboard Redesign (Phases 1–3 complete)

## Overview

Replace the current `account.settings.tsx` "Login & Security" page with the Figma "Profile Information" design. The current page uses a custom `SettingCard` component with icon headers, an "Account Activity" section, and a sign-out button. The new design has:

- **Page title**: "Profile Information" (font-light, 28px)
- **Card 1 — Personal Information**: avatar with gradient initials, "Change Photo" button (placeholder), form with First Name, Last Name, Email (read-only), Phone Number, Date of Birth, and "Save Changes" button
- **Card 2 — Change Password**: Current Password, New Password, Confirm New Password, and "Update Password" button

The sidebar already handles sign out and account activity is on the dashboard, so those sections are removed.

### Design Reference

- **File key**: `Q541sIDD20eXqQSSozFUw4`
- **Node ID**: `2:995`
- **Spec**: `hydrogen/design-references/account-profile/figma-spec.md`
- **Raw context**: `hydrogen/design-references/account-profile/design-context.tsx`

---

## Checklist

### Phase 1: Design Reference & Prerequisites (Complete)

- [x] Fetch Figma design context, screenshot, and variable defs — MCP tools
- [x] Save design reference files — `hydrogen/design-references/account-profile/`
- [x] Verify font loading — Roboto 300 (Light) weight is loaded in `root.tsx` (`wght@300;400;500;700`)
- [x] Verify design token coverage — all colors/borders/shadows mapped in `app.css`
- [x] Check Storefront API capabilities — `customerUpdate` supports firstName, lastName, phone, password; email NOT updatable; DOB not a native field

#### Phase 1 Notes

**API Constraints to verify:**
- `customerUpdate` mutation: supports `firstName`, `lastName`, `phone`, `password` — confirm each
- `customerUpdate` does NOT support `email` changes (Shopify limitation) — email field must be read-only
- Date of Birth: NOT a standard Shopify customer field — either use customer metafield or render as disabled placeholder
- Password change: `customerUpdate` accepts `password` field but requires the current password via `customerAccessToken` re-authentication — need to verify flow

---

### Phase 2: Rewrite Settings Page UI (Complete)

- [x] Remove `SettingCard` component (no longer used in new design)
- [x] Remove "Account Activity" and "Sign Out" sections (moved to dashboard/sidebar)
- [x] Add page title: "Profile Information" — `text-[28px] font-light text-gray-800 leading-[42px]`
- [x] Build Card 1: Personal Information
  - [x] Card container: `rounded-xl border border-border bg-white shadow-sm overflow-hidden`
  - [x] Card header: "Personal Information" — `text-lg font-bold text-gray-900`, bottom border, `px-6 py-5`
  - [x] Card body: `p-6`, gap-8 between avatar section and form
  - [x] Avatar section: 100px gradient circle (secondary → brand-accent), initials 40px, "Change Photo" button (disabled), hint text
  - [x] Form: First Name + Last Name (side-by-side), Email (read-only), Phone, Date of Birth, "Save Changes" button
- [x] Build Card 2: Change Password
  - [x] Card container: same as Card 1
  - [x] Card header: "Change Password"
  - [x] Form: Current Password, New Password + Confirm (side-by-side), "Update Password" button
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 2 Figma-Exact Styling Requirements

**Form inputs (ALL inputs must match exactly):**
```
bg-white border border-gray-300 rounded-lg px-[17px] py-[13px] text-[15px] text-black
placeholder:text-gray-500
focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary
```

**Form labels (ALL labels must match exactly):**
```
text-sm font-medium text-gray-700 leading-[21px]
```

**Primary action buttons (Save Changes / Update Password):**
```
bg-secondary text-white font-medium text-[15px] px-6 py-3 rounded-lg
hover:bg-secondary/90 transition-colors
disabled:opacity-50 disabled:cursor-not-allowed
```

**Card container pattern:**
```
rounded-xl border border-border bg-white shadow-sm overflow-hidden
```

**Card header pattern:**
```
border-b border-border px-6 py-5
h2: text-lg font-bold text-gray-900
```

**These styles MUST NOT be overridden by:**
- The `SettingCard` component (being removed)
- Any default `<input>` styles from reset.css or shadcn
- Any global form styles
- Tailwind's default `text-base` (should be `text-[15px]` for inputs)

---

### Phase 3: Backend — Update Mutations & Loader (Complete)

- [x] Update `CUSTOMER_SETTINGS_QUERY` to fetch `phone` field (already present, trimmed unused fields)
- [x] Update `UPDATE_CUSTOMER_MUTATION` to return `phone` in response
- [x] Add `updateProfile` action intent — handles firstName, lastName, phone updates in single submission
- [x] Add `updatePassword` action intent — uses `loginCustomer` to verify current password, then `customerUpdate` with new password
  - Re-authenticates via `customerAccessTokenCreate` (loginCustomer helper)
  - On success: returns success message
  - On failure: returns field-level errors (incorrect password, mismatch, too short)
- [x] Handle Date of Birth: rendered as disabled placeholder with "Coming soon" note (Option B — not a native Shopify field)
- [x] Handle Email field: rendered as read-only `<input readOnly>` with gray bg + helper text
- [x] Add success/error inline feedback for both forms (green/red banners per intent)
- [x] Pre-commit checks pass: format, typecheck, build, test

---

### Phase 4: Mobile Responsiveness (Complete)

- [x] First Name + Last Name: `flex-col sm:flex-row` (stack on mobile)
- [x] New Password + Confirm: `flex-col sm:flex-row` (stack on mobile)
- [x] Avatar section: `flex-col sm:flex-row` with centered items on mobile
- [x] Card body padding: `p-4 sm:p-6` (reduced on mobile)
- [x] Page title: `text-2xl sm:text-[28px]` (slightly smaller on mobile)
- [x] Pre-commit checks pass: format, typecheck, build, test

---

### Phase 5: Polish & Testing (Partially Complete)

- [x] Add loading state for form submissions (disabled button, "Saving..." / "Updating..." text per intent)
- [x] Add form validation (password match, minimum length, required fields — server-side in action)
- [x] Add `HydrateFallback` export for loading skeleton
- [ ] Implement Playwright visual test — `hydrogen/tests/e2e/visual/account-profile.visual.spec.ts`
- [ ] Add `pnpm visual:account-profile` and `pnpm compare:account-profile` scripts
- [ ] Visual comparison pass against Figma screenshot

---

## Manual Testing Plan

### Phase 2 Manual Testing — UI Layout & Styling

**Prerequisites**: Logged in as a customer with a name, email, and at least 1 order.

#### Page Structure
- [ ] Navigate to `/account/settings` → page renders with sidebar on left ("Settings" highlighted in teal) and main content on right
- [ ] Page title shows "Profile Information" in light (300) weight, 28px, gray-800
- [ ] Two cards visible: "Personal Information" and "Change Password", separated by 24px gap
- [ ] No remnants of old design (no icon-header SettingCards, no "Account Activity" section, no "Sign Out" button in main content)

#### Card 1: Personal Information — Visual Fidelity
- [ ] Card has white background, 1px gray-200 border, 12px border-radius, subtle shadow
- [ ] Card header: "Personal Information" in bold 18px gray-900, separated from body by 1px bottom border
- [ ] Header padding: ~24px horizontal, ~20px vertical (visually matches Figma)
- [ ] Avatar: 100px circle with teal-to-green gradient (secondary → brand-accent), correct initials in 40px white text
- [ ] "Change Photo" button: white background, gray-300 border, 8px radius, camera icon + "Change Photo" text in gray-700
- [ ] Hint text below button: "JPG, GIF or PNG. Max size 2MB" in 13px gray-500
- [ ] Avatar and button are horizontally aligned with 24px gap between them

#### Card 1: Form Fields
- [ ] First Name + Last Name: side-by-side in equal widths with 16px gap
- [ ] Email Address: full width, below the name row
- [ ] Phone Number: full width, with 20px top spacing from email
- [ ] Date of Birth: full width, with 20px vertical spacing
- [ ] ALL input fields have: white bg, gray-300 border, 8px radius, 17px horizontal padding, 13px vertical padding, 15px font size
- [ ] ALL labels: medium weight, 14px, gray-700
- [ ] Input values show customer's actual data (firstName, lastName, email, phone)
- [ ] Email field is visually read-only (grayed out or with helper text)
- [ ] "Save Changes" button: teal (secondary) background, white text, 15px medium, 8px radius, 24px horizontal / 12px vertical padding
- [ ] Button is left-aligned (not full-width, not centered)

#### Card 2: Change Password — Visual Fidelity
- [ ] Same card styling as Card 1 (border, radius, shadow)
- [ ] Card header: "Change Password" in bold 18px gray-900 with bottom border
- [ ] Current Password: full width, placeholder "Enter current password" in gray-500
- [ ] New Password + Confirm New Password: side-by-side in equal widths with 16px gap
- [ ] Placeholders: "Enter new password" and "Confirm new password"
- [ ] "Update Password" button: same teal styling as "Save Changes", left-aligned
- [ ] All password inputs have same styling as personal info inputs

#### Pixel-Precision Checks
- [ ] Input border color is gray-300 (`#d1d5db`), NOT gray-200 (`#e5e7eb`) — these are different
- [ ] Card border color is gray-200 (`#e5e7eb` / `border-border`) — matches design token
- [ ] Button background is exactly `#2699a6` (secondary) — NOT primary green
- [ ] Avatar gradient goes from `#2699a6` (teal) to `#2bd9a8` (bright teal-green), 135deg angle
- [ ] Page title is font-light (300), NOT font-normal (400) or font-bold (700)
- [ ] Card title is font-bold (700), NOT font-semibold (600)
- [ ] Form spacing matches Figma: 20px gaps between field groups, 8px gap between label and input

---

### Phase 3 Manual Testing — Backend Functionality

#### Profile Update (Save Changes)
- [ ] Edit First Name → click "Save Changes" → button shows "Saving..." while submitting
- [ ] After save, page refreshes with updated name; sidebar avatar initials update to match
- [ ] Edit Last Name → save → name updates everywhere (sidebar, page)
- [ ] Edit Phone Number → save → phone updates on reload
- [ ] Leave a required field empty → appropriate error message appears
- [ ] Success message appears after successful save (inline banner or toast)

#### Password Change (Update Password)
- [ ] Enter wrong current password → error "Current password is incorrect" or similar
- [ ] Enter mismatched new passwords → client-side validation "Passwords do not match"
- [ ] Enter short new password → validation error for minimum length
- [ ] Enter correct current password + matching new passwords → success message
- [ ] After password change, session remains valid (no forced logout)

#### Read-Only / Placeholder Fields
- [ ] Email field: cannot be edited; shows helper text about contacting support
- [ ] Date of Birth: either functional (if metafield implemented) or shows as disabled with note
- [ ] "Change Photo" button: disabled state or shows "Coming soon" tooltip

---

### Phase 4 Manual Testing — Mobile Responsiveness

- [ ] **Mobile (<640px)**: First Name / Last Name stack vertically (single column)
- [ ] **Mobile (<640px)**: New Password / Confirm Password stack vertically
- [ ] **Mobile (<640px)**: Avatar section stacks (avatar on top, button below, centered)
- [ ] **Mobile (<640px)**: Card padding reduces slightly
- [ ] **Mobile (<640px)**: Page title slightly smaller
- [ ] **Tablet (640–1023px)**: Form rows stay side-by-side; sidebar hidden, hamburger menu works
- [ ] **Desktop (≥1024px)**: Full layout with 280px sidebar + main content
- [ ] Cross-browser: Chrome — all elements render correctly
- [ ] Cross-browser: Safari — gradients, inputs, date picker render correctly *(requires manual testing)*
- [ ] Cross-browser: Firefox — all elements render correctly *(requires manual testing)*

---

### Phase 5 Manual Testing — Polish

- [ ] Loading skeleton: navigate to `/account/settings` with slow network → skeleton placeholders visible
- [ ] Form validation: submit empty password form → no submission, validation errors shown
- [ ] Form validation: password mismatch → "Passwords do not match" error
- [ ] Visual comparison: Playwright screenshot at 1440px matches Figma design

---

## Architecture Notes

### Current State (to be replaced)
The existing `account.settings.tsx` has:
- `SettingCard` component with icon headers → **REMOVE** (not in Figma design)
- "Account Activity" section with member-since/orders/addresses → **REMOVE** (dashboard has this)
- "Sign Out" section → **REMOVE** (sidebar handles this)
- `CUSTOMER_SETTINGS_QUERY` fetches firstName, lastName, email, phone, createdAt, defaultAddress
- `UPDATE_CUSTOMER_MUTATION` handles firstName/lastName only
- Action has single `updateName` intent

### New State
- Two-card layout matching Figma exactly
- `updateProfile` intent: firstName, lastName, phone
- `updatePassword` intent: currentPassword, newPassword (with confirm validation)
- Email is read-only (Shopify API limitation)
- DOB: metafield or disabled placeholder (Phase 3 decision)
- No SettingCard abstraction needed — cards are simple enough to inline
- Reuse `getInitials` from `account-helpers.ts` for avatar

### API Details

**Storefront API — `customerUpdate` mutation:**
```graphql
mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
  customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
    customer { firstName lastName phone }
    customerUserErrors { field message }
  }
}
```

Supported `CustomerUpdateInput` fields: `firstName`, `lastName`, `phone`, `password`, `acceptsMarketing`
NOT supported: `email` (requires separate `customerEmailUpdate` or is not available via Storefront API)

**Password change flow:**
1. User submits current password + new password
2. Server re-authenticates via `customerAccessTokenCreate` with email + current password
3. If valid, calls `customerUpdate` with new `password`
4. If invalid, returns "incorrect current password" error

---

## Deviations from Figma

| Item | Figma | Implementation | Reason |
|------|-------|---------------|--------|
| Font | Roboto | Roboto | No change needed — Roboto loaded in root.tsx including weight 300 |
| Icons | Font Awesome | Lucide React | Project convention |
| Photo upload | Functional button | Disabled placeholder | Requires file upload infrastructure (future feature) |
| Date of Birth | Functional date input | Disabled or metafield | Not a standard Shopify customer field |
| Email | Editable input | Read-only | Shopify Storefront API does not support email changes |
| Placeholder color | `#757575` | `placeholder:text-gray-500` (`#6b7280`) | Closest Tailwind token; visually near-identical |
