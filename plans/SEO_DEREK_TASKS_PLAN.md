# Implementation Plan: SEO — Derek's Assigned Tasks

> **Status**: 🟡 In Progress
> **Created**: 2026-05-27
> **Last Updated**: 2026-05-27 (session 1 complete through Branch 3 code tasks + partial Branch 5)
> **Source**: HYLEE SEO ShopifyChecklist

---

## Overview

Implements and audits all SEO checklist items assigned to Derek Hawkins across the Hydrogen storefront. Tasks are split into five feature branches, ordered by impact/difficulty priority. Each branch has a code phase (files to create or edit) and a manual testing phase (browser/tool verification steps).

**Priority key** (from checklist formula):
- P1 = High impact + Easy → ship first
- P2 = High impact + Medium
- P3 = High impact + Difficult
- P4 = Medium impact + Easy
- P5 = Medium impact + Medium
- P6 = Medium impact + Difficult
- P7 = Low impact + Easy
- P8 = Low impact + Medium

**Task type key**:
- 🔧 = Code change required
- 🔍 = Audit/investigation (may or may not produce a code change)
- 📋 = Manual action (Shopify admin, external tool, Oxygen dashboard)

---

## Branch 1 — `feat/infra/seo-robots-sitemap`

**PR title**: `feat(infra): add dynamic sitemap.xml and robots.txt routes`
**Priority**: P1/P4 — highest-impact technical SEO foundations; prerequisite for all other SEO work

### Context

Hydrogen/Remix needs explicit routes for `sitemap.xml` and `robots.txt`. These are not generated automatically by Shopify Oxygen for custom storefronts. The sitemap must dynamically reflect live products, collections, pages, and blog articles. This branch also bundles AI crawler whitelisting (P1) and the sitemap self-reference inside robots.txt (P7) since they all live in the same two files.

### Phase 1 — sitemap.xml route

- [ ] Create `hydrogen/app/routes/[sitemap.xml].tsx` — loader returns XML response with `Content-Type: application/xml` 🔧
  - Query Storefront API for products, collections, pages (use existing `cms.ts` patterns)
  - Include `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>` per entry
  - Exclude: tagged/filtered collection URLs, variant pages, paginated pages (noindex candidates)
- [ ] Add sitemap loader GraphQL queries to `hydrogen/app/graphql/` or inline fragment 🔧
- [ ] Validate no 404/500 returned at `/sitemap.xml` in dev 🔍

### Phase 2 — robots.txt route

- [ ] Create `hydrogen/app/routes/[robots.txt].tsx` — loader returns plain text response with `Content-Type: text/plain` 🔧
  - `User-agent: *` → `Allow: /`
  - Whitelisted AI crawlers: `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `Bytespider`, `CCBot` (review list before shipping)
  - `Disallow:` for `/cart`, `/checkout`, `/account`, `/orders`, search/filter query strings (e.g. `/*?*`)
  - `Sitemap: https://hylee.com/sitemap.xml` at bottom
- [ ] Confirm robots meta on filtered collection, variant, and paginated routes is `noindex` (separate from this file) 🔍

### Phase 3 — sitemap validation

- [ ] Manually fetch `/sitemap.xml` in browser — confirm valid XML, no broken `<loc>` entries 📋
- [ ] Paste XML into [Google Rich Results Test](https://search.google.com/test/rich-results) to verify parseable 📋
- [ ] Cross-check: no `/collections/all?sort=...`, no `/products/[handle]?variant=...` URLs appear 📋
- [ ] Run `pnpm typecheck && pnpm build` 🔧

### Manual Testing Checklist

- [ ] `GET /sitemap.xml` returns 200, `Content-Type: application/xml`
- [ ] `GET /robots.txt` returns 200, `Content-Type: text/plain`
- [ ] robots.txt includes `Sitemap:` line pointing to correct domain
- [ ] All `<loc>` URLs in sitemap are HTTPS (not HTTP), no `myshopify.com` URLs
- [ ] AI crawlers are whitelisted in robots.txt (verify with `curl`)
- [ ] No disallowed pages appear in sitemap (cart, checkout, account)
- [ ] Sitemap loads in Google Search Console sitemap submission UI without parse error (Jeremiah handoff)

---

## Branch 2 — `feat/infra/seo-redirects-404`

**PR title**: `feat(infra): implement canonical HTTPS, redirect audit fixes, and 404 page optimization`
**Priority**: P1 (HTTPS canonical, 404 redirects) + P4 (redirect chain/loop cleanup) + P8 (404 page UX)

### Context

Hydrogen renders meta via Remix's `meta()` export. HTTPS canonicals must be set on every route. Redirecting 404s for frequently-visited old URLs can be done in the Shopify admin URL redirects tool. Redirect chains (A→B→C) and 302→301 fixes are primarily a Shopify admin task. Broken link cleanup is an audit-first task.

### Phase 1 — HTTPS canonical tags 🔧

- [ ] Audit `hydrogen/app/lib/seo-meta.ts` (or create it) — ensure `canonical` in every page's `<head>` is HTTPS
- [ ] Confirm Remix `meta()` exports on all route files include `<link rel="canonical" href="https://...">` — check:
  - `hydrogen/app/routes/_index.tsx`
  - `hydrogen/app/routes/products.$handle.tsx`
  - `hydrogen/app/routes/collections.$handle.tsx`
  - `hydrogen/app/routes/pages.$handle.tsx`
  - `hydrogen/app/routes/blogs.$blogHandle.$articleHandle.tsx`
- [ ] If a shared `getSeoMeta()` helper exists in `lib/`, update it; otherwise update routes individually 🔧

### Phase 2 — 404 page optimization 🔧

- [ ] Locate Remix catch/error boundary for 404s (`hydrogen/app/routes/$.tsx` or root `ErrorBoundary`)
- [ ] Ensure 404 page includes:
  - Clear "Page not found" H1
  - Search bar (reuse `PredictiveSearch`)
  - Links to homepage, collections, and popular categories
  - Correct HTTP 404 status code returned (not 200)
- [ ] Add `noindex` robots meta to 404 response

### Phase 3 — Redirect audit (Shopify Admin) 📋

These are manual actions in Shopify Admin → Online Store → Navigation → URL Redirects:

- [ ] **HTTP to HTTPS redirection** — confirm Shopify/Oxygen auto-redirects HTTP→HTTPS (test with `curl -I http://hylee.com`). If not, add redirect rule 📋
- [ ] **Redirecting frequently visited 404 pages** — pull top 404 URLs from GSC (Jeremiah provides) or Oxygen logs, create 301 redirects to most relevant collection/product pages 📋
- [ ] **Broken redirects** — test each existing redirect in Shopify admin, remove any that lead to 404 📋
- [ ] **Links to internal redirects** — find internal links pointing at redirect URLs (Screaming Frog after go-live); update `<Link>` components to final destination URLs 🔍
- [ ] **Redirect chains & loops** — test all existing redirects with Screaming Frog; collapse A→B→C into A→C 📋
- [ ] **Review 302 → 301** — audit Shopify admin redirects; change permanent moves from 302 to 301 📋
- [ ] **External 3xx redirects** — audit outbound links in footer, header, blog posts for 3xx (post-launch Screaming Frog) 🔍
- [ ] **Broken internal links** — post-launch Screaming Frog crawl; file separate PRs to fix broken `<Link href>` values 🔍
- [ ] **Broken external links** — post-launch Screaming Frog; update or remove dead outbound links 🔍

### Manual Testing Checklist

- [ ] `curl -I http://hylee.com` returns 301 → `https://hylee.com`
- [ ] All canonical tags on key pages begin with `https://`
- [ ] Visiting a known-dead old URL (e.g. `/products/old-sku`) returns 301 (not 302) to correct destination
- [ ] 404 page returns HTTP status 404 (check with DevTools Network tab)
- [ ] 404 page shows search bar and navigation links, not a blank/bare error
- [ ] No redirect chain longer than 1 hop from Shopify Admin redirect list
- [ ] No circular redirect detected (A→B→A)

---

## Branch 3 — `feat/infra/seo-h1-breadcrumbs`

**PR title**: `feat(infra): fix H1 tag violations and add breadcrumb navigation`
**Priority**: P4 (H1 fixes) + P8 (breadcrumbs)

### Context

Each page should have exactly one `<h1>`. Routes should be audited systematically. Breadcrumb navigation applies to collection and product pages and should include structured data (`BreadcrumbList` JSON-LD schema). The PROJ-0027 plan already has structured data (`lib/structured-data.ts`) as a workstream — coordinate so they land in the same file.

### Phase 1 — H1 audit 🔍

Audit each route for missing or duplicate H1 tags:

- [ ] `_index.tsx` (homepage) — confirm single H1 exists (hero headline)
- [ ] `products.$handle.tsx` (PDP) — confirm product title is H1, not H2
- [ ] `collections.$handle.tsx` (PLP) — confirm collection title is H1
- [ ] `pages.$handle.tsx` — confirm page title is H1
- [ ] `blogs.$blogHandle.$articleHandle.tsx` — confirm article title is H1
- [ ] `about.tsx`, `faq.tsx`, `press.tsx`, `partners.tsx` — confirm single H1
- [ ] Header/Footer components — confirm no heading tags used for nav elements (common violation)

### Phase 2 — H1 fixes 🔧

- [ ] Promote/demote heading levels where violations found in Phase 1 audit
- [ ] Ensure component-level headings (e.g., section headers in `ProductCard`) use `<h2>`–`<h6>`, never `<h1>`
- [ ] Re-audit with browser DevTools after fixes: `document.querySelectorAll('h1')` should return exactly 1 node per page

### Phase 3 — Breadcrumb navigation 🔧

- [ ] Create `hydrogen/app/components/ui/Breadcrumbs.tsx` — accepts `items: { label: string; href?: string }[]`
  - Use design tokens (no hardcoded styles)
  - Render `aria-label="breadcrumb"` + `<ol>` with chevron separators
  - Final item has no link (current page)
- [ ] Wire Breadcrumbs into `collections.$handle.tsx` → `[Category] > [Collection]`
- [ ] Wire Breadcrumbs into `products.$handle.tsx` → `[Category] > [Collection] > [Product]`
- [ ] Add `BreadcrumbList` JSON-LD structured data in the same routes (or via `lib/structured-data.ts` if that file exists)
- [ ] Add `data-testid="breadcrumbs"` for E2E testability

### Manual Testing Checklist

- [ ] On every key page: open DevTools console, run `document.querySelectorAll('h1').length` — must equal `1`
- [ ] No heading tags in header nav or footer nav (inspect via DevTools Elements)
- [ ] Breadcrumbs render on PLP (`/collections/[handle]`) with correct label and link
- [ ] Breadcrumbs render on PDP (`/products/[handle]`) with correct 3-level path
- [ ] Breadcrumb links navigate correctly when clicked
- [ ] On mobile: breadcrumbs are readable and don't overflow viewport
- [ ] Validate breadcrumb JSON-LD at [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## Branch 4 — `feat/infra/seo-performance`

**PR title**: `feat(infra): JS/CSS performance — lazy loading, unused module removal, console error cleanup`
**Priority**: P3 (broken JS), P5 (lazy load, unused JS, CSS size), P6 (console errors, CSS issues)

### Context

This is primarily a bundle analysis + code quality branch. Use `pnpm build` output and `vite-bundle-visualizer` (or Chrome DevTools Coverage tab) to identify unused JS. Lazy loading focuses on images (Hydrogen's `<Image>` component supports lazy natively) and below-the-fold route components (`React.lazy`/dynamic imports).

### Phase 1 — Audit: Chrome console errors 🔍

- [ ] Run `pnpm dev`, open DevTools Console on key pages (home, PLP, PDP, cart)
- [ ] Document every error and warning: source file, line, error text
- [ ] Triage: fix immediately (red errors) vs. monitor (yellow warnings from third-party)
- [ ] Fix all first-party console errors before PR 🔧

### Phase 2 — Broken JavaScript 🔧

- [ ] Check for any `undefined is not a function`, `Cannot read property of undefined` errors surfaced in Phase 1 audit
- [ ] Check `hydrogen/app/routes/` meta() functions — these were previously a source of errors (see commit e8e60bc)
- [ ] Verify no JS module import paths are broken after recent route/component renames

### Phase 3 — Lazy load implementation 🔧

- [ ] Audit all `<img>` tags and Hydrogen `<Image>` components — confirm `loading="lazy"` on below-the-fold images
  - Homepage: ProductCard grid images, promotions section images
  - PLP: all ProductCard images except the first row (above the fold = eager)
  - PDP: thumbnail gallery images (non-primary)
- [ ] Identify any large components loaded eagerly that could be `React.lazy()` + `<Suspense>`:
  - Review modal/drawer components (CartDrawer, MiniCart, etc.)
  - Review non-critical homepage sections
- [ ] Apply dynamic imports where justified (do not over-split — only where chunk is >30KB and not needed on initial load)

### Phase 4 — Unused JavaScript + CSS file sizes 🔍🔧

- [ ] Run `pnpm build` and review Vite chunk output for unexpectedly large chunks (>100KB gzipped is a flag)
- [ ] Open Chrome DevTools → Coverage tab on homepage, PLP, PDP — identify unused JS %
- [ ] Remove any dead imports or unused utility files surfaced by coverage audit
- [ ] For CSS: check that Tailwind v4 purge is working — `pnpm build` CSS output should be minimal
- [ ] Check for any non-Tailwind CSS files being bundled unnecessarily

### Phase 5 — JavaScript redirection 🔍

- [ ] Search codebase for `window.location.href =`, `window.location.replace(`, `router.push(` used for page redirects that could be server-side `redirect()` calls instead
- [ ] Convert JS-only redirects to Remix `redirect()` server responses where applicable (better for SEO, crawlers can follow)

### Phase 6 — Broken CSS code 🔍

- [ ] Review Chrome DevTools Styles panel on key pages for any CSS parse errors (red ⚠ icons)
- [ ] Run `pnpm build` — Vite will surface invalid CSS that PostCSS/Tailwind cannot parse
- [ ] Fix any invalid CSS rules in `hydrogen/app/styles/app.css` or component-level styles

### Manual Testing Checklist

- [ ] Chrome DevTools Console shows zero first-party errors on: home, PLP, PDP, cart, account
- [ ] Lighthouse Performance score ≥ 70 on mobile for homepage (run from DevTools)
- [ ] All ProductCard images below the fold have `loading="lazy"` (inspect via Elements)
- [ ] Above-the-fold hero/featured images do NOT have `loading="lazy"` (they should be eager)
- [ ] `pnpm build` completes with no CSS parse errors
- [ ] Chrome DevTools Coverage tab: unused JS on homepage < 60% (baseline; improve iteratively)
- [ ] No `window.location` hard redirects on critical paths (checkout, login) — verify with Network tab

---

## Branch 5 — `feat/infra/seo-cleanup-audit`

**PR title**: `feat(infra): broken image cleanup, mixed content fixes, orphan page audit`
**Priority**: P7 — lower impact but important for crawl health

### Context

Most tasks in this branch are audit-first. Run after branches 1–4 are merged so the sitemap and robots.txt are live. Many require Screaming Frog (post-launch) or direct Shopify admin work.

### Phase 1 — 5xx errors check 📋

- [ ] Check Oxygen deployment logs in Shopify Partners dashboard for any 500/503 errors
- [ ] Test all dynamic routes with intentionally bad handles (e.g. `/products/does-not-exist`) — should return 404, not 500
- [ ] Check `root.tsx` `ErrorBoundary` handles server errors gracefully

### Phase 2 — Broken images + image redirects 🔍📋

- [ ] Audit components for hardcoded image URLs (grep for `src="http` in `hydrogen/app/`)
- [ ] All `<Image>` src should reference Shopify CDN URLs — no external image URLs that could break
- [ ] Image redirects: if Shopify media files were deleted/moved, check for 404 image src values in Shopify admin → Content → Files
- [ ] Clean-up of broken images: Screaming Frog post-launch; fix `alt` tags and remove dead `<img src>` values found

### Phase 3 — Mixed content issues 🔍🔧

- [ ] Open Chrome DevTools → Security tab on HTTPS homepage — flag any mixed content warnings
- [ ] Common culprits: hardcoded `http://` in CMS metafields, third-party embed scripts loaded over HTTP
- [ ] Fix any hardcoded `http://` URLs in `hydrogen/app/` source (grep: `href="http://`, `src="http://`)
- [ ] Coordinate with Jeremiah for any third-party script mixed content

### Phase 4 — Orphan pages identification 🔍📋

- [ ] An orphan page has no inbound internal links; identified via Screaming Frog or GSC post-launch
- [ ] Pre-launch audit: check that every page reachable by a crawler is linked from at least one nav, sitemap, or contextual link
- [ ] Candidate orphan pages to check manually:
  - `/press`, `/partners`, `/about`, `/faq`, `/promotions`
  - Any Shopify `pages` created in admin but not linked in nav
- [ ] Fix: add footer links or nav links for any confirmed orphan pages 🔧

### Manual Testing Checklist

- [ ] Navigate to `/products/fake-slug` — should render 404 page (not 500/blank)
- [ ] Chrome DevTools Security tab on homepage: green lock, no mixed content warnings
- [ ] All images on homepage, PLP, PDP load without broken icon (no 404 images)
- [ ] Grep check: `grep -r "src=\"http://" hydrogen/app/` returns zero results
- [ ] Every new page route (`/press`, `/partners`, `/faq`, `/about`) is linked in either header nav, footer, or sitemap
- [ ] Oxygen dashboard shows no 5xx errors in last 24h (post-deploy check)

---

## Pre-Commit Checklist (all branches)

Before committing on any branch above:

```bash
pnpm format          # 1. Auto-fix formatting
pnpm format:check    # 2. Verify formatting
pnpm typecheck       # 3. TypeScript — MUST PASS
pnpm build           # 4. Production build — MUST PASS
pnpm test            # 5. Unit tests — MUST PASS
```

---

## Execution Order

| Order | Branch | Why first |
|-------|--------|-----------|
| 1 | `feat/infra/seo-robots-sitemap` | Prerequisite — GSC needs sitemap before other checks |
| 2 | `feat/infra/seo-redirects-404` | HTTPS canonicals + 404 handling = foundational crawl hygiene |
| 3 | `feat/infra/seo-h1-breadcrumbs` | On-page structure; needed before content SEO audits |
| 4 | `feat/infra/seo-performance` | Performance; highest difficulty, needs time |
| 5 | `feat/infra/seo-cleanup-audit` | Depends on Screaming Frog post-launch; lowest urgency |

---

## Coordination Notes

- **Jeremiah**: handoff sitemap URL after Branch 1 merges → he submits to GSC
- **Jeremiah**: share top-404 URL list from GSC (or Oxygen logs) for Branch 2 redirect work
- **Jeremiah**: mixed content for third-party scripts (Branch 5, Phase 3)
- **Shawn**: orphan page audit decisions (Branch 5, Phase 4) — which pages need nav links
- **Screaming Frog**: most broken link + redirect audits are post-launch; use shared company email for free version

---

## Notes

- Robots.txt AI crawler whitelist should be reviewed before shipping — list evolves quickly (mid-2025 additions: `PerplexityBot`, `Bytespider`)
- HTTPS redirection on Oxygen is automatic, but canonical tags in `<head>` must still be explicitly HTTPS — do not rely on the redirect alone
- Breadcrumb JSON-LD should be added in the same PR as the Breadcrumbs component so structured data and UI ship together
- JS lazy loading: Hydrogen's `<Image>` is already lazy by default — audit is to catch raw `<img>` tags that may have been added directly
- Do not add Screaming Frog or Lighthouse as dev dependencies — they are run externally as one-time audits
