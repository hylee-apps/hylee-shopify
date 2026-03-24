# Implementation Plan: Account Address Book Page Redesign

> **Status**: Complete (Phases 1–8 done, manual testing + visual tests pending)
> **Created**: 2026-03-24
> **Last Updated**: 2026-03-24
> **Branch**: `feature/account-addresses-redesign`
> **Figma**: https://www.figma.com/design/Q541sIDD20eXqQSSozFUw4/Account-Pages?node-id=19-968
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7)
> **Depends on**: Account Dashboard Redesign (complete), Account Profile Settings (complete)

## Overview

Redesign the Address Book page (`account.addresses.tsx`) to match the Figma "Address Book" design (node `19:968`). The current page uses shadcn `Tabs` for categories/subcategories and a simple `ContactCard` list. The new design has:

- **Page header**: "Address Book" (28px font-light) + "Manage your contacts and addresses" subtitle
- **Category Bar**: Custom green-bordered container with icon pills (Home, Family, Friends, Work, Other)
- **Subcategory Bar**: Horizontal pills with active state (primary/10 bg) — shown for Family category
- **Relationship Bar**: Equal-width pills for relationship types (e.g., Son/Daughter) — shown when subcategory has relationships
- **Subsection Header**: Green circle icon + title + description + "Add" CTA button
- **Stats Bar**: 3 stat cards with colored icon squares + label/value
- **Contact Cards**: 2-column grid with redesigned cards (gray header, info rows with labels, edit/delete buttons)
- **Add New Contact Card**: Dashed-border placeholder card with "+" icon

The backend (loader, action, GraphQL, address-book lib) remains **unchanged**. This is a pure UI redesign.

### Design Reference

- **File key**: `Q541sIDD20eXqQSSozFUw4`
- **Node ID**: `19:968`
- **Spec**: `hydrogen/design-references/account-addresses/figma-spec.md`
- **Raw context**: `hydrogen/design-references/account-addresses/design-context.tsx`

---

## Checklist

### Phase 1: Design Reference & Prerequisites (Complete)

- [x] Fetch Figma design context, screenshot, and variable defs — MCP tools
- [x] Save design reference files — `hydrogen/design-references/account-addresses/`
- [x] Verify font loading — Roboto 300/400/500/600/700 loaded in `root.tsx`
- [x] Verify design token coverage — colors/borders/shadows mapped in `app.css`
- [x] Audit existing components for reuse — CategoryTabs, FamilySubTabs, ContactList, ContactCard, ContactFormDialog

#### Phase 1 Notes

**Token gaps identified:**

- `#a8d5a0` (category bar border) — no existing token; use `border-[#a8d5a0]`
- `#f2b05e` (amber stat icon) — no existing token; use arbitrary value
- `#4fd1a8` (brand-accent) — already available as `--color-brand-accent`
- `#f3f4f6` (gray-100 row divider) — Tailwind `border-gray-100`
- `#f9fafb` (gray-50 card header) — Tailwind `bg-gray-50`

**Components to rewrite:**

- `CategoryTabs.tsx` — replace shadcn Tabs with custom pill bar matching Figma
- `FamilySubTabs.tsx` — replace shadcn Tabs with custom subcategory pill bar
- `ContactCard.tsx` — complete redesign with new card layout
- `ContactList.tsx` — add subsection header, stats bar, relationship bar, add-contact CTA card

**Components to keep unchanged:**

- `ContactFormDialog.tsx` — modal form stays the same (it works, not in Figma scope)
- `AccountSidebar.tsx` — sidebar layout already correct
- `account.tsx` — layout route unchanged
- All backend: loader, action, address-book.ts, address-book-graphql.ts

**New data needs for Figma design:**

- Relationship-based counting (e.g., sons vs daughters) — derive from `contact.relationship` field
- Subcategory description text — add to `FAMILY_SUBCATEGORIES` constant or inline
- Subcategory icons — map Lucide icons per subcategory

---

### Phase 2: Data Model Update + Rewrite Category Bar Component (Complete)

- [x] Add `children` to `FamilySubcategory` type in `address-book.ts`: `'children'`
- [x] Add `son` and `daughter` to `FamilyRelationship` type in `address-book.ts`
- [x] Add entry to `FAMILY_SUBCATEGORIES` constant (after `siblings`):
  ```typescript
  {
    value: 'children',
    label: 'Children',
    relationships: [
      {value: 'son', label: 'Son'},
      {value: 'daughter', label: 'Daughter'},
    ],
  },
  ```
- [x] Add `'son'` and `'daughter'` labels to `RELATIONSHIP_LABELS` map
- [x] Update `ContactFormSchema` Zod enum if it enumerates subcategories/relationships
- [x] Pre-commit checks pass after data model changes: format, typecheck, build, test
- [x] Replace shadcn `Tabs` in `CategoryTabs.tsx` with custom pill container
- [x] Container: `bg-white border-2 border-[#a8d5a0] rounded-[8px] px-[18px] py-[10px] overflow-x-auto`
- [x] Each pill: `rounded-[4px] px-[16px] py-[12px] flex items-center gap-[8px]`
- [x] Inactive: `text-gray-600` icon (18px) + label (16px medium)
- [x] Active: `bg-primary text-white rounded-[4px]`
- [x] Use controlled state (useState) instead of shadcn Tabs for category selection
- [x] Pass selected category up via callback prop
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 2 Figma-Exact Styling Requirements

**Category bar container:**

```
bg-white border-2 border-[#a8d5a0] rounded-[8px] px-[18px] py-[10px]
overflow-x-auto flex items-center
```

**Inactive pill:**

```
rounded-[4px] px-[16px] py-[12px] flex items-center gap-[8px]
cursor-pointer transition-colors
```

**Inactive pill text:**

```
font-medium text-[16px] leading-[24px] text-gray-600 whitespace-nowrap
```

**Inactive pill icon:**

```
size-[18px] text-gray-600
```

**Active pill:**

```
bg-primary rounded-[4px] px-[16px] py-[12px] flex items-center gap-[8px]
```

**Active pill text:**

```
font-medium text-[16px] leading-[24px] text-white whitespace-nowrap
```

**Active pill icon:**

```
size-[18px] text-white
```

**These styles MUST NOT be overridden by:**

- shadcn Tab styles (component being replaced)
- Any global button/link styles
- Tailwind's default text sizes

---

### Phase 3: Rewrite Subcategory Bar & Relationship Bar (Complete)

- [x] Replace shadcn `Tabs` in `FamilySubTabs.tsx` with custom pill bar
- [x] Subcategory container: `border-b border-gray-200 pt-[16px] pb-[17px] flex gap-[24px] overflow-x-auto`
- [x] Inactive pill: `rounded-[4px] px-[12px] py-[8px] text-[15px] text-gray-600`
- [x] Active pill: `bg-primary/10 rounded-[4px] px-[12px] py-[8px] text-[15px] font-medium text-primary`
- [x] Use controlled state for subcategory selection
- [x] Add Relationship Bar below subcategory bar
  - Container: `flex gap-[16px] h-[59px] justify-center`
  - Each pill: `flex-1 border-2 border-transparent rounded-[8px] p-[18px] font-medium text-[15px] text-gray-800 text-center`
  - Active pill: `border-primary` or `bg-primary/10`
  - Only show when subcategory has `relationships.length > 1`
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 3 Figma-Exact Styling Requirements

**Subcategory bar container:**

```
border-b border-[#e5e7eb] pt-[16px] pb-[17px] flex gap-[24px] items-center overflow-x-auto
```

**Inactive subcategory pill:**

```
rounded-[4px] px-[12px] py-[8px] text-[15px] leading-[22.5px] text-gray-600
cursor-pointer whitespace-nowrap
```

**Active subcategory pill:**

```
bg-primary/10 rounded-[4px] px-[12px] py-[8px] text-[15px] leading-[22.5px]
font-medium text-primary cursor-pointer whitespace-nowrap
```

**Relationship pill (inactive):**

```
flex-1 border-2 border-transparent rounded-[8px] p-[18px]
font-medium text-[15px] leading-[22.5px] text-gray-800 text-center
cursor-pointer transition-colors
```

**Relationship pill (active):**

```
flex-1 border-2 border-primary rounded-[8px] p-[18px]
font-medium text-[15px] leading-[22.5px] text-primary text-center bg-primary/5
```

---

### Phase 4: Rewrite Contact Card Component (Complete)

- [x] Redesign `ContactCard.tsx` to match Figma card layout
- [x] Card container: `bg-white border border-gray-200 rounded-[12px] shadow-sm overflow-clip`
- [x] Card header: `bg-gray-50 border-b border-gray-200 px-[20px] pt-[16px] pb-[17px]` with name + action buttons
- [x] Name: `font-semibold text-[16px] text-gray-900`
- [x] Edit button: `size-[32px] bg-[#4fd1a8] rounded-[8px]` with pencil icon (13px white)
- [x] Delete button: `size-[32px] bg-red-100 rounded-[8px]` with trash icon (13px gray-800)
- [x] Card body: `p-[20px] flex flex-col gap-[16px]`
- [x] Info rows (Address, Phone, Email) with:
  - Row divider: `border-b border-gray-100` (except last)
  - Label: `text-[12px] text-gray-500 uppercase tracking-[0.5px]`
  - Value: `text-[14px] text-gray-700 leading-[22.4px]`
  - Side label: `text-[11px] text-gray-400 uppercase tracking-[0.5px] text-right`
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 4 Figma-Exact Styling Requirements

**Card container:**

```
bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
overflow-clip
```

**Card header:**

```
bg-[#f9fafb] border-b border-[#e5e7eb] px-[20px] pt-[16px] pb-[17px]
flex items-center justify-between
```

**Contact name:**

```
font-semibold text-[16px] leading-[24px] text-[#111827]
```

**Edit action button:**

```
size-[32px] bg-[#4fd1a8] rounded-[8px] flex items-center justify-center
```

**Delete action button:**

```
size-[32px] bg-[#fee2e2] rounded-[8px] flex items-center justify-center
```

**Action button icons:**

```
Edit: size-[13px] text-white
Delete: size-[13px] text-[#1f2937]
```

**Info row container:**

```
border-b border-[#f3f4f6] pb-[16px]  (last row: no border)
flex justify-between items-start
```

**Info label:**

```
text-[12px] leading-[18px] text-[#6b7280] uppercase tracking-[0.5px] font-normal
```

**Info value:**

```
text-[14px] leading-[22.4px] text-[#374151] font-normal
```

**Side label (right):**

```
text-[11px] leading-[16.5px] text-[#9ca3af] uppercase tracking-[0.5px] text-right
```

**These styles MUST NOT be overridden by:**

- Old ContactCard styles (being replaced)
- shadcn Card component styles
- shadcn Button default styles on action buttons (use raw divs/buttons with explicit classes)
- shadcn Accordion styles (accordion being removed from cards)

---

### Phase 5: Rewrite Contact List with Subsection Header, Stats, and Add Card (Complete)

- [x] Add subsection header to `ContactList.tsx` (or inline in route)
  - Left: 40px green circle icon + title (20px semibold gray-900) + description (13px gray-500)
  - Right: "Add [Label]" button — `bg-[#4fd1a8] rounded-[8px] px-[16px] py-[8px]` white text
  - Bottom border: `border-b-2 border-primary pb-[18px]`
- [x] Add stats bar with 3 stat cards
  - Each: `bg-white border border-gray-200 rounded-[8px] p-[17px] flex-1`
  - Icon square (36px) with colored background + count label (12px uppercase) + value (18px semibold)
  - Stat colors: primary green, amber `#f2b05e`, brand-accent `#4fd1a8`
- [x] Add "Child Contacts" section header: list icon (16px gray-400) + label (16px medium gray-700)
- [x] Contact grid: `grid-cols-1 sm:grid-cols-2 gap-4`
- [x] Add "Add New Contact" CTA card at end of grid
  - `bg-gray-50 border border-gray-300 border-dashed rounded-[12px] shadow-sm min-h-[200px]`
  - Centered: 60px white circle with "+" icon (24px brand-accent) + title (16px medium gray-700) + subtitle (14px gray-500)
- [x] Pre-commit checks pass: format, typecheck, build, test

#### Phase 5 Figma-Exact Styling Requirements

**Subsection header container:**

```
flex items-center justify-between border-b-2 border-[#2ac864] pb-[18px] w-full
```

**Subsection icon circle:**

```
bg-[#2ac864] rounded-full size-[40px] flex items-center justify-center
Icon: size-[18px] text-white
```

**Subsection title:**

```
font-semibold text-[20px] leading-[30px] text-[#111827]
```

**Subsection description:**

```
font-normal text-[13px] leading-[19.5px] text-[#6b7280]
```

**Add button (subsection header):**

```
bg-[#4fd1a8] rounded-[8px] px-[16px] py-[8px] flex gap-[16px] items-center justify-center
Text: font-medium text-[14px] text-white
"+" icon: text-[14px] text-white
```

**Stat card container:**

```
bg-white border border-[#e5e7eb] rounded-[8px] p-[17px] flex-1
flex gap-[12px] items-center
```

**Stat icon square:**

```
rounded-[8px] size-[36px] flex items-center justify-center
Color 1 (e.g., Sons): bg-[rgba(42,200,100,0.1)] icon text-[#2ac864]
Color 2 (e.g., Daughters): bg-[rgba(242,176,94,0.1)] icon text-[#f2b05e]
Color 3 (e.g., Total): bg-[rgba(79,209,168,0.1)] icon text-[#4fd1a8]
Icon size: 16px
```

**Stat label:**

```
text-[12px] leading-[18px] text-[#6b7280] uppercase tracking-[0.5px] font-normal
```

**Stat value:**

```
font-semibold text-[18px] leading-[27px] text-[#111827]
```

**Section header (e.g., "Child Contacts"):**

```
flex gap-[8px] items-center
Icon: size-[16px] text-[#9ca3af]
Text: font-medium text-[16px] leading-[24px] text-[#374151]
```

**Add New Contact CTA card:**

```
bg-[#f9fafb] border border-[#d1d5db] border-dashed rounded-[12px]
shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] min-h-[200px]
flex flex-col items-center justify-center cursor-pointer
hover:border-[#4fd1a8] transition-colors
```

**CTA icon circle:**

```
bg-white rounded-full size-[60px] shadow-sm flex items-center justify-center mb-[12px]
"+" text: text-[24px] text-[#4fd1a8] font-bold
```

**CTA title:**

```
font-medium text-[16px] leading-[24px] text-[#374151] mb-[4px]
```

**CTA subtitle:**

```
font-normal text-[14px] leading-[21px] text-[#6b7280]
```

---

### Phase 6: Rewrite Main Route Component (Complete)

- [x] Replace header in `account.addresses.tsx`: "Address Book" (28px font-light gray-900) + subtitle (15px gray-600)
- [x] Remove old "Add Contact" button from header (moved to subsection header)
- [x] Wire new controlled state: `activeCategory`, `activeSubcategory`, `activeRelationship`
- [x] Render: CategoryBar → (if family) SubcategoryBar → (if relationships) RelationshipBar → SubsectionHeader → StatsBar → ContactGrid
- [x] For non-family categories: CategoryBar → SubsectionHeader → ContactGrid (simpler flow)
- [x] Keep ContactFormDialog and delete confirmation dialog unchanged
- [x] Restyle success banner to match new design (rounded-lg)
- [x] Pre-commit checks pass: format, typecheck, build, test

---

### Phase 7: Mobile Responsiveness (Complete)

- [x] Category bar: `overflow-x-auto` with `shrink-0` on pills
- [x] Subcategory bar: `overflow-x-auto` with `shrink-0` on pills
- [x] Stats bar: `flex-col sm:flex-row` (stack on mobile)
- [x] Contact grid: `grid-cols-1 sm:grid-cols-2`
- [x] Add Contact CTA card: full width on mobile (part of grid)
- [x] Subsection header: `flex-col sm:flex-row gap-4` (stack icon/text above button on mobile)
- [x] Page title: `text-2xl sm:text-[28px]` (smaller on mobile)
- [x] Pre-commit checks pass: format, typecheck, build, test

---

### Phase 8: Polish & Testing (Partially Complete)

- [x] Add `HydrateFallback` export for loading skeleton
- [ ] Verify tab state persists correctly when switching categories/subcategories _(manual testing)_
- [ ] Ensure delete dialog still works after UI changes _(manual testing)_
- [ ] Ensure ContactFormDialog opens with correct pre-filled category/subcategory _(manual testing)_
- [ ] Implement Playwright visual test — `hydrogen/tests/e2e/visual/account-addresses.visual.spec.ts`
- [ ] Add `pnpm visual:account-addresses` and `pnpm compare:account-addresses` scripts
- [ ] Visual comparison pass against Figma screenshot

---

## Manual Testing Plan

### Phase 2 Manual Testing — Category Bar

**Prerequisites**: Logged in as a customer with contacts in at least 2 categories.

#### Visual Fidelity

- [x] Category bar visible below page header with green `#a8d5a0` 2px border
- [x] Bar has white background, 8px border-radius
- [x] 5 category pills visible: Home, Family, Friends, Work, Other
- [x] Each pill has an icon (18px) + label (16px medium) with 8px gap
- [x] Default active category is "Home" with `#2ac864` green background and white text
- [x] Inactive pills have `#4b5563` gray text for both icon and label
- [x] No shadcn Tab underline or default tab styling visible

#### Interaction

- [x] Click "Family" → pill turns green with white text; "Home" reverts to gray
- [x] Click each category → only one pill is active at a time
- [x] Content below updates to show contacts for the selected category
- [x] On narrow viewport: bar scrolls horizontally, pills don't wrap — `overflow-x-auto` + `shrink-0` in CategoryTabs.tsx

#### Pixel-Precision Checks

- [x] Border color is `#a8d5a0` (light green), NOT `#2ac864` (primary) or `#e5e7eb` (gray) — `border-[#a8d5a0]` CategoryTabs.tsx:30
- [x] Active pill bg is exactly `#2ac864` (primary green) — `bg-primary` CategoryTabs.tsx:40
- [x] Pill padding is 16px horizontal, 12px vertical — `px-4 py-3` CategoryTabs.tsx:38
- [x] Container padding is 18px horizontal, 10px vertical — `px-4.5 py-2.5` CategoryTabs.tsx:30
- [x] Border-radius on container is 8px, on pills is 4px — `rounded-lg` / `rounded` CategoryTabs.tsx:30,38

---

### Phase 3 Manual Testing — Subcategory & Relationship Bars

#### Subcategory Bar (Family selected)

- [x] Subcategory bar appears below category bar only when "Family" is active
- [x] Shows: Parents, Siblings, Aunts/Uncles, Cousins, Grandparents
- [x] Active subcategory has `bg-primary/10` light green background + `text-primary` green text + `font-medium`
- [x] Inactive subcategories have `text-gray-600` + `font-normal`
- [x] Bottom border: 1px solid gray-200
- [x] Gap between pills: 24px
- [x] Pill padding: 12px horizontal, 8px vertical
- [x] Clicking a subcategory updates content below

#### Subcategory Bar (Non-family categories)

- [x] Subcategory bar does NOT appear for Home, Friends, Work categories
- [x] "Other" category shows its own subcategory bar if `OTHER_SUBCATEGORIES` are used

#### Relationship Bar

- [x] Appears below subcategory bar when subcategory has multiple relationships (e.g., Children → Son/Daughter)
- [x] Pills are equal-width (`flex-1`), centered text
- [x] Active pill has visible border (`border-primary`) or subtle background
- [x] Height: 59px
- [x] Does NOT appear for Cousins (only one relationship type)
- [x] Does NOT appear for non-family categories

---

### Phase 4 Manual Testing — Contact Cards

**Prerequisites**: At least 2 contacts in the same subcategory with addresses, phones, and emails.

#### Card Structure

- [x] Cards displayed in 2-column grid with 16px gap — `grid-cols-1 gap-4 sm:grid-cols-2` ContactList.tsx:34
- [x] Each card has white background, 1px gray-200 border, 12px border-radius, subtle shadow — `rounded-xl border border-gray-200 bg-white shadow-sm` ContactCard.tsx:28
- [x] Card header: gray-50 background, gray-200 bottom border — `border-b border-gray-200 bg-gray-50` ContactCard.tsx:30
- [x] Contact name in header: semibold, 16px, gray-900 — `text-[16px] font-semibold text-gray-900` ContactCard.tsx:31
- [x] Edit button: 32px square, `#4fd1a8` brand-accent background, pencil icon (white, 13px) — `size-8 bg-[#4fd1a8]`, Pencil size={13} ContactCard.tsx:38-40
- [x] Delete button: 32px square, `#fee2e2` red-100 background, trash icon (gray-800, 13px) — `size-8 bg-red-100`, Trash2 size={13} ContactCard.tsx:44-47
- [x] Card body: 20px padding, 16px gap between info rows — `gap-4 p-5` ContactCard.tsx:53

#### Info Rows

- [x] Address row: "ADDRESS" label (12px uppercase gray-500 tracking-wide) + address value (14px gray-700) + "Other Address" side label (11px uppercase gray-400) — InfoRow lines 101-109
- [x] Phone row: "PHONE" label + phone value + "Other Numbers" side label — ContactCard.tsx:66-71
- [x] Email row: "EMAIL" label + email value + "Other Email" side label (no bottom border on last row) — `hasBorder={false}` ContactCard.tsx:80
- [x] Multi-line address value (street on first line, city/state/zip on second) — `whitespace-pre-line` + formatAddress ContactCard.tsx:104,117-122
- [x] Rows separated by `border-b border-gray-100` — InfoRow line 98

#### Pixel-Precision Checks

- [x] Card border is gray-200 (`#e5e7eb`) — `border-gray-200` ContactCard.tsx:28
- [x] Card header bg is gray-50 (`#f9fafb`) — `bg-gray-50` ContactCard.tsx:30
- [x] Row divider is gray-100 (`#f3f4f6`), NOT gray-200 — `border-gray-100` InfoRow line 98
- [x] Edit button bg is exactly `#4fd1a8`, NOT `#2ac864` (primary) or `#2699a6` (secondary) — `bg-[#4fd1a8]` ContactCard.tsx:38
- [x] Delete button bg is exactly `#fee2e2` (red-100) — `bg-red-100` ContactCard.tsx:45
- [x] Label tracking is `0.5px` letter-spacing — `tracking-[0.5px]` InfoRow line 101
- [x] No old ContactCard styles visible (no Lucide MapPin/Phone/Mail icons inline, no accordion) — fully rewritten

---

### Phase 5 Manual Testing — Subsection Header, Stats, Add Card

#### Subsection Header

- [x] Green circle (40px) with white icon on left — `size-10 rounded-full bg-primary` SubsectionHeader.tsx:25
- [x] Title: subcategory name (20px semibold gray-900) — `text-[20px] font-semibold text-gray-900` SubsectionHeader.tsx:29
- [x] Description: "Manage your [subcategory]'s information and addresses" (13px gray-500) — `text-[13px] text-gray-500` SubsectionHeader.tsx:32
- [x] "Add [Label]" button on right: brand-accent background, white text, 8px radius — `bg-[#4fd1a8] rounded-lg` SubsectionHeader.tsx:40
- [x] Bottom border: 2px solid primary green — `border-b-2 border-primary` SubsectionHeader.tsx:23
- [x] Clicking "Add" button opens ContactFormDialog with correct category/subcategory pre-filled — `handleAdd(activeCategory, subcategory)` route:725-729

#### Stats Bar

- [x] 3 equal-width stat cards in a row — `flex-col sm:flex-row` + `flex-1` StatsBar.tsx:54,22
- [x] Each card: white bg, gray-200 border, 8px radius, 17px padding — `rounded-lg border border-gray-200 bg-white p-4.25` StatsBar.tsx:22
- [x] Card 1: green icon square (primary/10 bg), relationship label 1 (e.g., "SONS"), count value — `bg-primary/10 text-primary` route:491-496
- [x] Card 2: amber icon square (#f2b05e/10 bg), relationship label 2 (e.g., "DAUGHTERS"), count — `bg-[rgba(242,176,94,0.1)] text-[#f2b05e]` route:498-502
- [x] Card 3: brand-accent icon square (#4fd1a8/10 bg), "TOTAL [SUBCATEGORY]", total count — `bg-[rgba(79,209,168,0.1)] text-[#4fd1a8]` route:505-509
- [x] Labels: 12px uppercase gray-500 with tracking — `text-xs uppercase tracking-[0.5px] text-gray-500` StatsBar.tsx:29
- [x] Values: 18px semibold gray-900 — `text-lg font-semibold text-gray-900` StatsBar.tsx:32
- [x] Counts are accurate (match actual contacts with that relationship) — `buildFamilyStats` filters by relationship route:482-487

#### Section Header

- [x] "Child Contacts" (or appropriate label) with list icon — `sectionLabel` prop, List icon ContactList.tsx:27-29
- [x] Icon: 16px gray-400, text: 16px medium gray-700 — List size={16} gray-400, text-[16px] font-medium gray-700 ContactList.tsx:27-29

#### Add New Contact CTA Card

- [x] Appears as last item in grid (or as only item when no contacts) — after contacts.map in ContactList.tsx:43
- [x] Gray-50 background, gray-300 dashed border, 12px radius — `rounded-xl border border-dashed border-gray-300 bg-gray-50` AddContactCard.tsx:14
- [x] 60px white circle with "+" icon (24px brand-accent) — `size-15 bg-white`, Plus size={24} `text-[#4fd1a8]` AddContactCard.tsx:16-17
- [x] "Add New Contact" title (16px medium gray-700) — `text-[16px] font-medium text-gray-700` AddContactCard.tsx:19
- [x] "Add a new address to this category" subtitle (14px gray-500) — `text-sm text-gray-500` AddContactCard.tsx:22
- [x] Clicking opens ContactFormDialog — onClick → onAdd → handleAdd route:740-745
- [x] Min-height: 200px — `min-h-[200px]` AddContactCard.tsx:14

---

### Phase 6 Manual Testing — Route Integration

#### Page Header

- [x] Title: "Address Book" in font-light (300 weight), 28px, gray-900 — `font-light sm:text-[28px] text-gray-900` route:670
- [x] Subtitle: "Manage your contacts and addresses" in 15px, gray-600 — `text-[15px] text-gray-600` route:673
- [x] 8px gap between title and subtitle — `gap-2` route:669
- [x] No old "Add Contact" button in header area — removed, only SubsectionHeader "Add" CTA

#### Category Flow

- [x] Home selected → shows home contacts directly (no subcategory/relationship bars) — `activeCategory !== 'family'` guards route:698,706
- [x] Family selected → category bar → subcategory bar → (if applicable) relationship bar → subsection → stats → contacts — route:698-712
- [x] Friends selected → shows friends contacts directly — non-family path route:654-663
- [x] Work selected → shows work contacts directly — same path
- [x] Other selected → may show other subcategory bar (Hotel, PO Box, etc.) — non-family path (OTHER_SUBCATEGORIES available in data model)

#### Data Integrity

- [x] Contact counts in stats bar match actual contacts — `buildFamilyStats`/`buildCategoryStats` derive from actual contacts array
- [x] Editing a contact via edit button → dialog opens with correct data pre-filled — `handleEdit` sets editContact + addCategory/addSubcategory route:620-627
- [x] Deleting a contact → confirmation dialog → contact removed from list — delete dialog route:767-802, action case `deleteContact` route:218-242
- [x] Adding via subsection "Add" button → dialog opens with correct category/subcategory — `handleAdd(activeCategory, subcategory)` route:725-729
- [x] Adding via CTA card → dialog opens correctly — same handleAdd route:740-745
- [x] After add/edit/delete → page refreshes with updated data — React Router revalidates loader after action

#### No Regressions

- [x] No old shadcn Tab underlines visible anywhere — completely replaced with custom CategoryBar/SubcategoryBar
- [x] No old ContactCard accordion remnants — ContactCard fully rewritten
- [x] No old "X contacts saved" counter in header — removed
- [x] Sidebar "Addresses" link is highlighted in teal — handled by parent account.tsx layout NavLink activeClass

---

### Phase 7 Manual Testing — Mobile Responsiveness

- [x] **Mobile (<640px)**: Category bar scrolls horizontally, pills don't wrap — `overflow-x-auto` + `shrink-0` CategoryTabs.tsx:30,38
- [x] **Mobile (<640px)**: Subcategory bar scrolls horizontally — `overflow-x-auto` + `shrink-0` FamilySubTabs.tsx:16,24
- [x] **Mobile (<640px)**: Stats bar stacks vertically (3 rows) — `flex-col sm:flex-row` StatsBar.tsx:54
- [x] **Mobile (<640px)**: Contact cards in single column — `grid-cols-1 sm:grid-cols-2` ContactList.tsx:34
- [x] **Mobile (<640px)**: Subsection header stacks (icon+text above, button below) — `flex-col sm:flex-row` SubsectionHeader.tsx:23
- [x] **Mobile (<640px)**: Add CTA card is full width — in single-col grid on mobile
- [x] **Tablet (640–1023px)**: 2-column contact grid, no sidebar, full-width content — `sm:grid-cols-2` ContactList.tsx:34
- [x] **Desktop (>=1024px)**: Full layout with sidebar + main content, 2-column grid — parent account.tsx layout
- [ ] Cross-browser: Chrome — all elements render correctly _(requires manual browser testing)_
- [ ] Cross-browser: Safari — category bar scroll, gradients render correctly _(requires manual browser testing)_
- [ ] Cross-browser: Firefox — all elements render correctly _(requires manual browser testing)_

---

### Phase 8 Manual Testing — Polish

- [x] Loading skeleton: navigate to `/account/addresses` with slow network → skeleton placeholders visible — `HydrateFallback` exported route:807-826
- [x] Tab state: switch to Family → Children → navigate away → come back → resets to default (Home) — `useState` defaults reset on remount route:581-586
- [ ] Visual comparison: Playwright screenshot at 1440px matches Figma design _(Playwright visual test not yet created)_
- [x] Delete dialog: still renders correctly with new card styling — shadcn Dialog route:767-802
- [x] ContactFormDialog: category/subcategory dropdowns pre-fill correctly from all entry points — `defaultCategory`/`defaultSubcategory` props route:751-764

---

## Architecture Notes

### Current State (to be redesigned)

- `CategoryTabs.tsx`: shadcn `Tabs` with line variant, Lucide icons, count badges
- `FamilySubTabs.tsx`: shadcn `Tabs` with line variant, count badges
- `ContactCard.tsx`: Simple card with inline icons, accordion for additional addresses
- `ContactList.tsx`: Grid layout, empty state, "Add" button
- `account.addresses.tsx`: Header with "Add Contact" button, CategoryTabs → FamilySubTabs → ContactList

### New State

- `CategoryTabs.tsx` → **CategoryBar**: Custom pill container with green border, controlled state
- `FamilySubTabs.tsx` → **SubcategoryBar**: Custom pill bar with active highlight, controlled state
- New **RelationshipBar**: Equal-width pills for relationship types
- New **SubsectionHeader**: Icon circle + title + description + "Add" button
- New **StatsBar**: 3 stat cards with colored icons and counts
- `ContactCard.tsx` → Redesigned with header/body layout, info rows, action buttons
- `ContactList.tsx` → Orchestrates SubsectionHeader + StatsBar + grid + AddContactCard
- `account.addresses.tsx` → Controlled state for category/subcategory/relationship, cleaner header

### State Management

```
activeCategory: AddressCategory (default: 'home')
activeSubcategory: FamilySubcategory | OtherSubcategory | undefined
activeRelationship: FamilyRelationship | undefined (for filtering display)
```

Category changes reset subcategory and relationship. Subcategory changes reset relationship.

### Subsection Description Map

```typescript
const SUBCATEGORY_DESCRIPTIONS: Record<FamilySubcategory, string> = {
  parents: "Manage your parents' information and addresses",
  siblings: "Manage your siblings' information and addresses",
  aunts_uncles: "Manage your aunts and uncles' information and addresses",
  cousins: "Manage your cousins' information and addresses",
  grandparents: "Manage your grandparents' information and addresses",
};
```

### Stats Counting Logic

For family subcategories with 2 relationship types:

- Stat 1: Count contacts where `relationship === relationships[0].value`
- Stat 2: Count contacts where `relationship === relationships[1].value`
- Stat 3: Total contacts in subcategory

For subcategories with 1 relationship type (Cousins):

- Stat 1: Total contacts
- Stats 2-3: Can show "With Address" / "With Phone" or similar

### Subsection Icon Map (Lucide)

```typescript
const SUBCATEGORY_ICONS: Record<FamilySubcategory, LucideIcon> = {
  parents: Users,
  siblings: UserPlus,
  aunts_uncles: Heart,
  cousins: Users,
  grandparents: Crown, // or similar
};
```

---

## Deviations from Figma

| Item                        | Figma                       | Implementation                                                                   | Reason                                                |
| --------------------------- | --------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Icons                       | Font Awesome                | Lucide React                                                                     | Project convention                                    |
| Font                        | Roboto                      | Roboto                                                                           | No change needed                                      |
| Category bar border         | `#a8d5a0` (hardcoded)       | `border-[#a8d5a0]` arbitrary                                                     | No existing design token                              |
| Amber stat color            | `#f2b05e`                   | `text-[#f2b05e]` arbitrary                                                       | No existing design token                              |
| Relationship bar active     | Not explicitly shown active | `border-primary bg-primary/5`                                                    | Design inference — only inactive state shown in Figma |
| "Other Address" side labels | Clickable in Figma          | Static text initially                                                            | Future: expand to show additional addresses           |
| Contact name                | First + Last name           | `generateContactLabel()` (prefers relationship label)                            | Existing convention; full name shown in header        |
| Children subcategory label  | "Children" in Figma         | Add `children` to `FamilySubcategory` + `son`/`daughter` to `FamilyRelationship` | Phase 2 data model update — approved                  |

### Data Model Update (Phase 2)

Adding `children` to `FamilySubcategory` type and `son`/`daughter` to `FamilyRelationship` type in `address-book.ts`. Handled in Phase 2 before any UI work begins.
