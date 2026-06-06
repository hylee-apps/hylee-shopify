# Implementation Plan: Shopify Admin as CMS

> **Status**: 🟡 In Progress (WS1 + WS2 global config complete)
> **Created**: 2026-05-24
> **Last Updated**: 2026-05-24
> **Branch**: `feature/hydrogen-migration`
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + React Router 7)

## Overview

Use Shopify Admin as the content management system for the Hy-lee storefront.
Non-technical team members (Shawn, Darian) can manage content directly in Shopify Admin
without code changes or deploys. Four workstreams, ordered by priority.

**Key principle**: No third-party headless CMS needed. Shopify already provides:
- `shop` fields for global store data
- **Shop metafields** for global CMS config (homepage SEO, announcement bar, etc.)
- **Pages** for static content pages (About, FAQ, Press, Partners)
- **Metaobjects** for structured repeating content (hero slides, promos, team members)
- **Blogs + Articles** for editorial content

---

## Shopify Admin Navigation Reference

These are the correct paths for metafield work — keep this as a reference.

| Task | Path |
|---|---|
| Create/edit a metafield **definition** | Settings → Metafields and metaobjects → Metafield definitions → [Choose resource, e.g. Shop] |
| Set/edit metafield **values** | Settings → General → Store Assets → Metafields |
| Create/edit metaobject **definitions** | Settings → Metafields and metaobjects → Metaobject definitions |
| Add/edit metaobject **entries** | Content → Metaobjects → [Choose type] |
| Edit static **pages** | Online store → Pages |

---

## Metafield Namespace Convention

All Shop metafield definitions use namespace **`custom`** (Shopify's default for Shop resource).

Query pattern in GraphQL:
```graphql
shop {
  fieldAlias: metafield(namespace: "custom", key: "your_key") { value }
}
```

---

## Workstream 1: Homepage SEO from Admin ✅

**Goal**: Let Shawn/Darian control the homepage `<title>` and meta description from
Shopify Admin without code changes.

**How it works**:
- Homepage title → Shop metafield `custom.homepage_title`
- Homepage meta description → Shop metafield `custom.homepage_description`
- Fallback: `shop.name` / `shop.description` if metafields are not yet set

**Files changed**:
- `hydrogen/app/routes/_index.tsx` — added `HOMEPAGE_SEO_QUERY`, wired into loader,
  updated `meta()` to consume loader data

### Admin Setup (One-time — Derek does this)

**Step 1: Create the metafield definitions**

1. Go to **Settings → Metafields and metaobjects → Metafield definitions**
2. Choose **Shop**
3. Click **Add definition** and fill in:

   **Definition 1 — Homepage title**
   - Name: `Homepage Title`
   - Namespace and key: `custom.homepage_title`
   - Type: **Single line text**
   - Click **Save**

   **Definition 2 — Homepage description**
   - Name: `Homepage Description`
   - Namespace and key: `custom.homepage_description`
   - Type: **Single line text**
   - Click **Save**

**Step 2: Enable Storefront API access for each metafield**

> ⚠️ Without this step the Hydrogen storefront cannot read the metafield values.

After saving each definition, click on it and:
1. Scroll down to **Storefront API access**
2. Toggle it **ON**
3. Click **Save**

**Step 3: Set the values**

1. Go to **Settings → General → Store Assets → Metafields**
2. Fill in:
   - **Homepage Title**: e.g. `Hy-lee | Unique Products for Compact Living`
   - **Homepage Description**: e.g. `Shop furniture, appliances, and home goods designed for tiny homes and micro apartments. Free shipping on qualifying orders.`
3. Click **Save**

**Step 4: Verify in Hydrogen**

Once values are set, they'll appear in the homepage `<title>` and
`<meta name="description">` tags automatically. No deploy needed — data is fetched
at request time.

---

## Workstream 2: Global CMS Config via Shop Metafields ✅

**Goal**: Allow Admin control of storefront-wide content without code changes.

**Implemented metafields** (all namespace `custom`):

| Name | Key | Type | Purpose |
|---|---|---|---|
| Homepage Title | `homepage_title` | Single line text | Homepage `<title>` |
| Homepage Description | `homepage_description` | Single line text | Homepage meta description |
| Announcement Bar | `announcement_bar` | Single line text | Header banner text; empty = hidden |
| Promo Tier Enabled | `promo_tier_enabled` | True or false | Show/hide promo tier bar |
| OG Image URL | `og_image_url` | Single line text | Default social share image |

**Implementation**: `hydrogen/app/lib/cms.ts` — centralized CMS schema, query, and parser.
All values are fetched in the root loader (`loadCriticalData`) with `CacheLong()` and
available to every route via `useRouteLoaderData<RootLoader>('root')`.

### Admin Setup — Announcement Bar (Quick Win for Shawn/Darian)

**Step 1: Create the definition**
1. **Settings → Metafields and metaobjects → Metafield definitions → Shop**
2. Add definition:
   - Name: `Announcement Bar`
   - Namespace and key: `custom.announcement_bar`
   - Type: **Single line text**
   - Save

**Step 2: Enable Storefront API access**
1. Click the definition → toggle **Storefront API access** ON → Save

**Step 3: Set the value**
1. **Settings → General → Store Assets → Metafields**
2. Enter text, e.g.: `Free standard shipping on orders over $75 — Shop now`
3. Save — banner appears on next page load. Clear the value to hide the bar.

### How to use `globalCms` in a route or component

```tsx
import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

const data = useRouteLoaderData<RootLoader>('root');
const {announcementBar, promoTierEnabled, ogImageUrl} = data?.globalCms ?? {};
```

---

## Workstream 3: Pages as CMS Content Pages

**Goal**: Let Shawn/Darian edit body copy and SEO for static pages directly in Admin.

**How it works**: Each static route queries a Shopify Page by handle.
Admin edits the page title, body (rich text), and SEO fields via Online store → Pages.
No deploy required for content updates.

**Routes to implement** (from PROJ-0027):

| Route | Shopify Page handle | Status |
|---|---|---|
| `/about` | `about` | Not started |
| `/faq` | — | Uses Metaobjects (already built) |
| `/press` | `press` | Not started |
| `/partners` | `partners` | Not started |
| `/policies/...` | Built-in shop policies | Already working |

**Pattern**: Already established in `hydrogen/app/routes/pages.$handle.tsx` —
queries `page(handle) { title, body, seo { title, description } }`.

**Admin setup per page**:
1. **Online store → Pages → Add page**
2. Set Handle to match route (e.g. `about`)
3. Write content in rich text editor
4. Under "Search engine listing" → fill in SEO title and description
5. Publish

**Status**: Not started — unblocks Shawn for content editing without deploys.

---

## Workstream 4: Metaobjects for Structured Content

**Goal**: Extend the existing metaobject pattern to cover all structured repeating content.

**Already implemented**:
- `hero_slide` — homepage carousel slides
- `faq_item` — FAQ accordion (question / answer / order)

**Planned additions**:

| Content | Metaobject type | Fields | Route |
|---|---|---|---|
| Team members | `team_member` | name, role, bio, photo | `/about` |
| Press mentions | `press_mention` | outlet, headline, url, date, logo | `/press` |
| Partner brands | `partner` | name, logo, url, description | `/partners` |
| Testimonials | `testimonial` | quote, author, title, rating | Homepage / PDP |

**Admin setup pattern** (same for each type):
1. **Settings → Metafields and metaobjects → Metaobject definitions → Add definition**
2. Define fields (types: single_line_text, multi_line_text, file_reference, url, number_integer)
3. Add entries via **Content → Metaobjects → [type name]**
4. Query in Hydrogen: `metaobjects(type: "type_name", first: N) { nodes { fields { key value } } }`

**Status**: Not started — implement as each page is built.

---

## Checklist

### WS1: Homepage SEO ✅

- [x] Add `HOMEPAGE_SEO_QUERY` to `_index.tsx`
- [x] Wire query into loader `Promise.all`
- [x] Update `meta()` to consume `data.seo` with `shop.name`/`shop.description` fallbacks
- [ ] **[Derek]** Create `custom.homepage_title` metafield definition in Admin
- [ ] **[Derek]** Create `custom.homepage_description` metafield definition in Admin
- [ ] **[Derek]** Enable Storefront API access for both definitions
- [ ] **[Derek/Shawn]** Set homepage title and description values in Admin
- [ ] Verify `<title>` and `<meta name="description">` reflect Admin values in browser

### WS2: Global CMS Config ✅

- [x] Create `hydrogen/app/lib/cms.ts` with typed schema, query, and parser
- [x] Add `GLOBAL_CMS_QUERY` to root `loadCriticalData` `Promise.all`
- [x] Return `globalCms` from root loader
- [x] Wire `globalCms.announcementBar` → Header `announcement` prop in `PageLayout`
- [ ] **[Derek]** Create `custom.announcement_bar` definition + enable Storefront API access
- [ ] **[Derek]** Create `custom.promo_tier_enabled` definition + enable Storefront API access
- [ ] **[Derek]** Create `custom.og_image_url` definition + enable Storefront API access
- [ ] **[Shawn/Darian]** Set announcement bar text in Admin

### WS3: Content Pages

- [ ] `/about` — create Shopify page + route
- [ ] `/press` — create Shopify page + route
- [ ] `/partners` — create Shopify page + route

### WS4: Structured Content Metaobjects

- [ ] `team_member` — for About page
- [ ] `press_mention` — for Press page
- [ ] `partner` — for Partners page
- [ ] `testimonial` — for Homepage / PDP

---

## Pre-Commit Checklist

```bash
pnpm format
pnpm format:check
pnpm typecheck
pnpm build
pnpm test
```
