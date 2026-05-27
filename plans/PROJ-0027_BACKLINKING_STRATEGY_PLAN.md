# Implementation Plan: PROJ-0027 — Backlinking Strategy

> **Status**: 🔲 Not Started
> **Created**: 2026-05-13
> **Epic**: PROJ-0027
> **Stack**: Hydrogen (React + TypeScript + Tailwind v4 + shadcn/ui + React Router 7) + Shopify Liquid theme
> **SEO Contact**: Derek (coding tasks) · Shawn/Darian (non-coding tasks)
> **Timeline**: Start immediately post-launch — search engines take 3–6 months to crawl; ship all WS1–WS4 before go-live to maximize Q4 indexing

---

## Overview

Backlinking strategy for Hy-lee's dual-stack Shopify + Hydrogen storefront. Backlinks only
deliver ranking value when the destination pages are technically sound and clearly understood
by search engines. This plan is structured in dependency order:

1. **WS1 — Technical SEO Infrastructure**: canonical URLs, sitemap, robots.txt, hreflang.
   Without this, earned backlinks may land on duplicate or unindexed pages.
2. **WS2 — Structured Data / JSON-LD**: schema markup converts crawled pages into rich results
   that attract more clicks and editorial links.
3. **WS3 — Open Graph & Social Meta**: enables social sharing previews; social shares are the
   most common source of natural first-party backlinks.
4. **WS4 — Linkable Asset Pages**: Press/Media and Partner pages are the highest-value backlink
   targets for e-commerce — PR sites, supplier pages, and directories link to these.
5. **WS5 — Blog & Content Infrastructure**: long-form content earns the most organic backlinks
   over time; the Shopify blog needs a Hydrogen rendering layer.
6. **WS6 — Internal Link Architecture**: passes link equity from earned backlinks deeper into
   the site — related products, category cross-links, and schema breadcrumbs.
7. **WS7 — Backlink Monitoring & Search Console Setup**: verifies the strategy is working and
   catches indexing issues before they compound.

**Division of labor** (established Apr 11 meeting):
- Derek: all coding tasks listed under each workstream
- Shawn/Darian: admin tasks (Shopify content, Google Search Console property setup, directory
  submissions, partner outreach) — noted but not tracked here

---

## Progress Summary

| # | Workstream | Priority | Branch | Status |
|---|-----------|----------|--------|--------|
| 1 | Technical SEO Infrastructure | HIGH | `chore/seo/technical-foundation` | 🔲 Not Started |
| 2 | Structured Data / JSON-LD | HIGH | `chore/seo/structured-data` | 🔲 Not Started |
| 3 | Open Graph & Social Meta Tags | HIGH | `chore/seo/open-graph-meta` | 🔲 Not Started |
| 4 | Linkable Asset Pages (Press + Partners) | MEDIUM | `feature/templates/press-partners` | 🔲 Not Started |
| 5 | Blog & Content Infrastructure | MEDIUM | `feature/templates/blog-infrastructure` | 🔲 Not Started |
| 6 | Internal Link Architecture | MEDIUM | `chore/seo/internal-links` | 🔲 Not Started |
| 7 | Backlink Monitoring & Search Console Setup | LOW | `chore/seo/monitoring-setup` | 🔲 Not Started |

---

## Branch Map

| Branch | Workstreams |
|--------|-------------|
| `chore/seo/technical-foundation` | WS1 |
| `chore/seo/structured-data` | WS2 |
| `chore/seo/open-graph-meta` | WS3 |
| `feature/templates/press-partners` | WS4 |
| `feature/templates/blog-infrastructure` | WS5 |
| `chore/seo/internal-links` | WS6 |
| `chore/seo/monitoring-setup` | WS7 |

---

## Workstream 1 — Technical SEO Infrastructure

**Branch**: `chore/seo/technical-foundation`
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context

Backlinks only drive ranking value when they land on properly configured pages. Three failure
modes to prevent:

1. **Duplicate content**: Shopify Liquid and Hydrogen can both serve the same product URL.
   Without canonical tags, Google may split link equity between them.
2. **Unindexed pages**: If the sitemap is missing routes or robots.txt blocks Hydrogen, earned
   backlinks land on pages that aren't in Google's index.
3. **i18n signal loss**: The site has EN/ES/FR locales. Without hreflang, international
   backlinks don't reinforce the correct locale URL.

The APR19 plan completed a basic SEO code review (`chore/assets/seo-code-review`). This
workstream goes further — dynamic sitemap generation, canonical URL enforcement, and hreflang.

### Implementation Notes

**Canonical URLs in Hydrogen**
- Every Hydrogen route must render a `<link rel="canonical">` pointing to its canonical URL.
  Use a shared `SEOHead` component (create if it doesn't exist) that accepts `canonicalUrl`
  as a prop and renders it via React Router's `<Meta>` in the loader's `meta` export.
- Pattern: in each route's `meta` function, return `[{ tagName: 'link', rel: 'canonical', href: canonicalUrl }]`.
- The canonical URL should always be the Hydrogen URL (e.g., `https://hylee.com/products/slug`),
  never the Shopify `myshopify.com` URL. If the Liquid theme is still live during transition,
  add canonical tags there pointing to the Hydrogen equivalents.
- Query params to suppress from canonical: `?variant=`, `?ref=`, `?utm_*`. Strip these when
  constructing the canonical URL in the loader.

**Dynamic Sitemap**
- Hydrogen's default scaffold generates a static `/sitemap.xml`. Replace with a dynamic
  sitemap that includes:
  - All product URLs (`/products/$handle`) — paginated via Storefront API
  - All collection URLs (`/collections/$handle`) — all active collections
  - All article URLs (`/blogs/news/$articleHandle`) — all published articles
  - Static pages: `/`, `/about`, `/faq`, `/promotions`, `/press`, `/partners`, `/contact`
  - Exclude: `/account/*`, `/checkout/*`, `/order-tracking`
- Route: `hydrogen/app/routes/sitemap[.xml].tsx` — respond with XML in `loader`, set
  `Content-Type: application/xml`.
- Paginate product/collection fetches — Storefront API max is 250 per query; use `hasNextPage`
  + `endCursor` to walk all pages and accumulate URLs.
- `lastmod` for products: use `updatedAt` from the Storefront API field.
- Priority values: homepage `1.0`, collection pages `0.8`, product pages `0.7`,
  static pages `0.6`, blog articles `0.5`.

**robots.txt**
- Route: `hydrogen/app/routes/robots[.txt].tsx`
- Disallow: `/account/`, `/checkout/`, `/cart`, `/search` (allow Google to crawl search results
  separately if needed, but start with disallowed to prevent thin-content indexing)
- Allow: all product, collection, blog, and static page routes
- Include `Sitemap: https://[domain]/sitemap.xml` directive at the bottom

**Hreflang (i18n)**
- For each page rendered in EN/ES/FR, emit three `<link rel="alternate" hreflang="...">` tags
  in the `<head>` — one per locale, plus `hreflang="x-default"` pointing to the EN URL.
- Check how locale URLs are structured: if it's `/es/products/slug` or a query param
  `?locale=es` — the hreflang href must match exactly.
- Add this to the shared `SEOHead` component: accept a `locales` array of `{ lang, url }` and
  emit the tags automatically.

**301 Redirects (Liquid → Hydrogen)**
- If any Liquid theme URLs were previously indexed and now serve from Hydrogen with a different
  path structure, add `redirect` entries in `hydrogen/app/routes/` or in Shopify's URL Redirects
  admin so existing backlinks don't 404.
- Audit: check `theme/templates/` and compare URL patterns against Hydrogen routes to find any
  path differences (e.g., `/pages/faq` → `/faq`).

### Tasks

- [ ] Create or update shared `SEOHead` component with canonical URL prop
- [ ] Add `<link rel="canonical">` to all route `meta` exports:
  `_index`, `products.$handle`, `collections.$handle`, `blogs.news.$article`, `/about`, `/faq`, `/promotions`, `/press`, `/partners`
- [ ] Strip tracking/variant query params when constructing canonical URLs in loaders
- [ ] Create `hydrogen/app/routes/sitemap[.xml].tsx` — dynamic sitemap with all product, collection, article, and static page URLs
- [ ] Paginate sitemap generation to handle large product catalogs
- [ ] Create `hydrogen/app/routes/robots[.txt].tsx` — disallow account/checkout/cart
- [ ] Add `Sitemap:` directive to robots.txt
- [ ] Add hreflang tags (EN/ES/FR + x-default) to `SEOHead` component
- [ ] Audit Liquid vs Hydrogen URL paths for structural differences
- [ ] Add 301 redirects for any Liquid → Hydrogen path changes in Shopify admin or route-level redirects
- [ ] Verify canonical and hreflang tags don't conflict with any existing `<Meta>` tags from the scaffold

### Shawn's Admin Tasks

- [ ] In Shopify admin → Online Store → Preferences: confirm the primary domain is set to the
  Hydrogen-served domain (not `myshopify.com`)
- [ ] Verify Shopify password protection is OFF on the storefront domain

### Manual Tests

1. View source on the homepage: `<link rel="canonical" href="https://[domain]/">` is present and correct
2. View source on a product page: canonical points to `/products/[handle]` with no query params appended
3. Navigate to `/sitemap.xml`: responds with valid XML; spot-check 5–10 URLs are correct
4. Navigate to `/robots.txt`: `Disallow: /account/` and `Disallow: /checkout/` present; `Sitemap:` directive at the bottom
5. View source on an EN page: three hreflang `<link>` tags present (en, es, fr, x-default)
6. Test a Liquid-era URL that changed: old path redirects (301) to the new Hydrogen path, not 404
7. Run `curl -I https://[domain]/sitemap.xml` — returns `200 OK` with `Content-Type: application/xml`
8. Sitemap: all static pages listed (/, /about, /faq, /promotions, /press, /partners)
9. Sitemap: no account or checkout URLs present
10. Open a product URL with `?utm_source=test` appended: canonical in `<head>` strips the param

---

## Workstream 2 — Structured Data / JSON-LD

**Branch**: `chore/seo/structured-data`
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context

JSON-LD structured data tells Google exactly what each page represents — enabling rich results
(product ratings, breadcrumbs, FAQ accordions in search results) that increase click-through
rate. Higher CTR means more traffic and more organic social shares, which are the most common
source of editorial backlinks for e-commerce sites.

Schema types needed:

| Schema Type | Page | Benefit |
|---|---|---|
| `Organization` | Homepage | Brand knowledge panel, site verification |
| `WebSite` with `SearchAction` | Homepage | Sitelinks Search Box in Google results |
| `Product` + `Offer` | PDP | Product rich results (price, availability, ratings in SERP) |
| `BreadcrumbList` | All page types | Breadcrumb display in SERP |
| `FAQPage` | `/faq` | FAQ rich results — answers displayed directly in Google |
| `ItemList` | Collection pages | Carousel of products in SERP |
| `Article` | Blog articles | Article rich results (author, date, thumbnail) |

### Implementation Notes

**Shared utility**
- Create `hydrogen/app/lib/structured-data.ts` — a set of typed builder functions that return
  JSON-LD objects. Each builder function takes strongly-typed props and returns a plain object.
- Render via a `<script type="application/ld+json">` tag in each route's `<Links>` or directly
  in the route component. In React Router 7 this is done with a `<script>` element inside the
  component; render it server-side only (no `useEffect`).

**Organization schema (homepage)**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Hy-lee",
  "url": "https://[domain]",
  "logo": "https://[domain]/[logo-path]",
  "sameAs": [
    "https://instagram.com/hylee",
    "https://youtube.com/@hylee",
    "https://linkedin.com/company/hylee"
  ],
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer service" }
}
```
- `sameAs` array establishes that Hy-lee's social profiles are the same entity — this is how
  Google builds a brand knowledge panel. Update social URLs once Darian sets up the accounts.

**WebSite + SearchAction (homepage)**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://[domain]",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://[domain]/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```
- This enables the Sitelinks Search Box in Google results — users can search the site directly
  from the SERP without clicking through first.

**Product schema (PDP)**
- Build a `buildProductSchema(product, selectedVariant)` function in `structured-data.ts`
- Include: `name`, `description`, `image` (all gallery images as array), `sku`, `brand`,
  `offers` (price, currency, availability based on `availableForSale`),
  `aggregateRating` (when reviews are wired up — leave out until then to avoid empty ratings).
- `availability`: map `availableForSale === true` → `"https://schema.org/InStock"`, else
  `"https://schema.org/OutOfStock"`.
- Call in `products.$handle.tsx` loader/component.

**BreadcrumbList (all content pages)**
- Create a `buildBreadcrumbSchema(items: { name, url }[])` builder.
- Wire into: PDP, collection pages, `/about`, `/faq`, `/promotions`, `/press`, `/partners`,
  `/blogs/news/$article`.
- The breadcrumb must match the visible breadcrumb component (same labels and URLs) or Google
  will reject the schema.

**FAQPage schema (`/faq`)**
- When the FAQ loader fetches metaobject items, also build a `FAQPage` schema:
  ```json
  { "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "...", "acceptedAnswer": { "@type": "Answer", "text": "..." } }] }
  ```
- FAQ rich results appear directly in Google search — entire questions and answers displayed
  in the SERP. High backlink value because sites cite FAQ pages as authoritative sources.

**ItemList schema (collection pages)**
- On `collections.$handle.tsx`, build an `ItemList` from the first page of products:
  each item is a `ListItem` with `position` (1-based index) and `url` linking to the PDP.
- Limit to first 10 items (Google recommends <= 10 for carousel rich results).

**Article schema (blog articles)**
- Build `buildArticleSchema(article)` — include `headline`, `image`, `author`,
  `datePublished`, `dateModified`, `publisher` (Organization reference).

### Tasks

- [ ] Create `hydrogen/app/lib/structured-data.ts` with builder functions for all schema types
- [ ] Add `Organization` + `WebSite` JSON-LD to homepage (`_index.tsx`)
- [ ] Add `Product` + `BreadcrumbList` JSON-LD to PDP (`products.$handle.tsx`)
- [ ] Add `BreadcrumbList` JSON-LD to collection pages (`collections.$handle.tsx`)
- [ ] Add `ItemList` JSON-LD to collection pages (first 10 products)
- [ ] Add `FAQPage` JSON-LD to `/faq` route (built from metaobject data)
- [ ] Add `BreadcrumbList` JSON-LD to `/about`, `/promotions`, `/press`, `/partners` static pages
- [ ] Add `Article` + `BreadcrumbList` JSON-LD to blog article route
- [ ] Ensure all JSON-LD renders as `<script type="application/ld+json">` server-side (not via `useEffect`)
- [ ] Update `Organization.sameAs` array with real social URLs once Darian provides them

### Manual Tests

1. Homepage: view source → `<script type="application/ld+json">` block with `Organization` type present
2. Homepage: JSON-LD includes correct `name: "Hy-lee"` and `url` matching the live domain
3. PDP: view source → `Product` schema with correct `name`, `price`, and `availability`
4. PDP: `availability` is `InStock` for an in-stock product and `OutOfStock` for one marked unavailable
5. Collection page: `BreadcrumbList` schema matches the visible breadcrumb on the page
6. `/faq`: `FAQPage` schema present with at least one Q&A from metaobject data
7. `/faq`: each `acceptedAnswer.text` matches the visible FAQ answer text exactly
8. Blog article: `Article` schema with correct `headline` and `datePublished`
9. Run all JSON-LD blocks through [Google's Rich Results Test](https://search.google.com/test/rich-results) — no errors
10. Validate with [Schema.org Validator](https://validator.schema.org/) — no critical errors
11. No duplicate `Organization` or `WebSite` blocks on any single page

---

## Workstream 3 — Open Graph & Social Meta Tags

**Branch**: `chore/seo/open-graph-meta`
**Priority**: HIGH
**Status**: 🔲 Not Started

### Context

When a product, article, or page gets shared on social media (Instagram Stories link, LinkedIn
post, Reddit thread), the platform renders a preview card using Open Graph meta tags. A clean
preview with product image, title, and price dramatically increases click-through rate on that
link — which is a primary mechanism for natural link acquisition.

Without correct OG tags: shared URLs show blank or incorrect previews → fewer clicks → fewer
people discovering the content to link to it.

Twitter/X Cards use a parallel meta system (`twitter:*`) with similar impact on X and iMessage
link previews.

### Implementation Notes

**Base OG tags (all pages)**
```html
<meta property="og:site_name" content="Hy-lee" />
<meta property="og:type" content="website" />  <!-- overridden per page type -->
<meta property="og:url" content="[canonical URL]" />
<meta property="og:title" content="[page-specific title]" />
<meta property="og:description" content="[page-specific description]" />
<meta property="og:image" content="[page-specific image URL]" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="es_MX" />
<meta property="og:locale:alternate" content="fr_FR" />
```

**Per page type overrides**

| Page | `og:type` | `og:title` | `og:description` | `og:image` |
|---|---|---|---|---|
| Homepage | `website` | "Hy-lee — Space-Smart Living" | Brand tagline | Homepage hero image |
| PDP | `product` | `[product.title] — Hy-lee` | `product.description` truncated to 150 chars | First product image |
| Collection | `website` | `[collection.title] — Hy-lee` | `collection.description` | Collection image |
| Blog Article | `article` | `[article.title]` | Article excerpt | Article image |
| Static pages | `website` | `[Page Name] — Hy-lee` | Page-specific description | Brand logo/banner |

**Twitter Card**
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@hylee" />  <!-- update when handle is set up -->
<meta name="twitter:title" content="[same as og:title]" />
<meta name="twitter:description" content="[same as og:description]" />
<meta name="twitter:image" content="[same as og:image]" />
```

**Product-specific OG tags (for Facebook/Instagram shopping)**
```html
<meta property="product:price:amount" content="[price]" />
<meta property="product:price:currency" content="USD" />
<meta property="product:availability" content="in stock" />
```

**Implementation approach**
- React Router 7 routes export a `meta` function. Centralize OG tag generation in
  `hydrogen/app/lib/seo-meta.ts` — a set of helper functions that return the correct
  `MetaFunction` return values.
- Create `buildProductMeta(product, canonicalUrl)`, `buildCollectionMeta(...)`,
  `buildArticleMeta(...)`, `buildStaticPageMeta(title, description, canonicalUrl)`.
- Each route's `meta` export calls the appropriate helper.
- OG image: use the product's `featuredImage.url` (already in Storefront API responses).
  Append Shopify image transform params to ensure 1200×630 crop: `?width=1200&height=630&crop=center`.
- Fallback: if no page-specific image exists, use a branded OG default image stored in
  `theme/assets/` and referenced via its CDN URL.
- `og:description` character limit: 160 chars. Truncate `product.description` (strip HTML first).
- For blog articles, use `article:author` and `article:published_time` OG tags in addition to base.

### Tasks

- [ ] Create `hydrogen/app/lib/seo-meta.ts` with `buildProductMeta`, `buildCollectionMeta`,
  `buildArticleMeta`, `buildStaticPageMeta` helpers
- [ ] Add base OG + Twitter Card meta to all routes via `meta` export:
  `_index`, `products.$handle`, `collections.$handle`, `blogs.news.$article`,
  `/about`, `/faq`, `/promotions`, `/press`, `/partners`, `/contact`
- [ ] Add `og:type: "product"` and `product:price:*` tags to PDP
- [ ] Add `article:author` and `article:published_time` tags to blog article route
- [ ] Create a branded fallback OG image (1200×630px) and upload to Shopify CDN or `theme/assets/`
- [ ] Apply Shopify image transform params to product images for correct OG dimensions
- [ ] Add `og:locale` and `og:locale:alternate` tags to all routes
- [ ] Strip HTML from descriptions before using as `og:description` content

### Manual Tests

1. PDP: view source → `og:title` = "[product name] — Hy-lee"
2. PDP: `og:image` URL returns a 1200×630px image when opened directly
3. PDP: `og:type` = "product"; `product:price:amount` matches displayed price
4. Collection: `og:title` = "[collection name] — Hy-lee"
5. Homepage: `og:type` = "website"; fallback OG image URL resolves to branded image
6. Blog article: `og:type` = "article"; `article:published_time` is a valid ISO 8601 date
7. Test all page types in [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — preview renders correctly with image, title, description
8. Test PDP in [Twitter Card Validator](https://cards-dev.twitter.com/validator) — `summary_large_image` renders
9. Test a product URL in iMessage (paste into iPhone Messages) — preview card shows product image + title
10. No `og:image` tag points to a `localhost` or `myshopify.com` URL on the live domain

---

## Workstream 4 — Linkable Asset Pages (Press & Partners)

**Branch**: `feature/templates/press-partners`
**Priority**: MEDIUM
**Status**: 🔲 Not Started

### Context

The highest-quality backlinks for a new e-commerce brand come from:
1. **Press / media coverage** — blogs, product review sites, and news outlets that link to a
   dedicated press page for logos, press kit, and contact info
2. **Partner / supplier pages** — suppliers often list their retail partners; having a
   `/partners` page gives them a page to link to, and it doubles as affiliate program info

Without these pages, backlink outreach has no canonical destination — outreach emails say
"here's our site" rather than "here's our press kit" or "here's our partner program."
A press page is also the target URL used in HARO (Help a Reporter Out) responses, which can
generate high-DA editorial backlinks.

### Implementation Notes

**Press / Media Page (`/press`)**

Route: `hydrogen/app/routes/press.tsx`

Sections:
1. **Header**: "Hy-lee in the Press" — brand tagline, brief company description (2 sentences)
2. **Press Kit Download**: CTA to download a ZIP with brand logos (PNG/SVG, light/dark),
   brand color codes, and approved product imagery. Host the ZIP on Shopify CDN.
   Button: "Download Press Kit" → direct link to the ZIP.
3. **Brand Assets (inline)**: Display the logo variants inline so journalists can grab them
   without downloading — white background + dark background previews of both logo variants.
4. **Coverage Gallery** (placeholder): "Featured In" logo row — initially empty or with
   placeholder "Be the first to cover Hy-lee." Update when coverage lands.
5. **Press Contact**: media contact email (use shared company email), response time note
   ("We respond to press inquiries within 24 hours")
6. **Story Angles**: 3–4 bullet points describing what Hy-lee's story is (micro-living focus,
   tiny home market, space-smart curation) — gives journalists instant story hooks

Wire footer "Press" link to `/press`.
Add `/press` to sitemap.
Breadcrumb: Home > Press

**Partner Program Page (`/partners`)**

Route: `hydrogen/app/routes/partners.tsx`

Sections:
1. **Header**: "Partner With Hy-lee" — referral program headline + hero tagline
2. **Referral Program** (links to the 20% referral deal from Promotions page):
   Explain how the refer-a-friend discount works; CTA → `/account` referral section
3. **Supplier / Brand Partners**: "We're always looking for brands that share our space-smart
   philosophy." Contact form or email CTA for supplier inquiries.
4. **Affiliate Program** (stub for now): "Affiliate program coming soon — join our waitlist."
   Email capture form that saves to a Shopify customer tag or a simple mailto.
5. **Why Partner With Us**: bullet points (growing audience in the micro-living market, curated
   catalog, marketing support). This is the content that suppliers and directories will link to.

Wire footer "Partner With Us" (or equivalent) link to `/partners`.
Add `/partners` to sitemap.
Breadcrumb: Home > Partners

**Footer links**
- Confirm that "Press" and "Partners" (or "Careers" as a secondary option if the footer has
  that slot) are in the footer. Check current footer sections and add to the appropriate column
  (likely the "Company" or "About" column).

**Press Kit ZIP**
- Shawn's task: prepare the ZIP with logo files and brand guidelines.
- Derek's task: upload ZIP to Shopify CDN (Files section in admin) and hard-code the CDN URL
  into the press page download button.

### Tasks

- [ ] Create `hydrogen/app/routes/press.tsx` with all five sections (header, press kit, brand assets, contact, story angles)
- [ ] Create `hydrogen/app/routes/partners.tsx` with all five sections (header, referral, supplier, affiliate stub, why partner)
- [ ] Add "Press" link to footer (Company/About column)
- [ ] Add "Partners" link to footer
- [ ] Wire footer links to `/press` and `/partners`
- [ ] Add OG meta and BreadcrumbList schema to both pages (using WS2/WS3 helpers)
- [ ] Add `/press` and `/partners` to `sitemap.xml` static pages list
- [ ] i18n keys: `press.*`, `partners.*` in EN/ES/FR
- [ ] Press kit ZIP upload: coordinate with Shawn; add download button once CDN URL is available
- [ ] Coverage Gallery: render an empty/placeholder state with a comment marking it for update

### Shawn's Tasks

- [ ] Prepare press kit ZIP: logo PNG (light/dark), logo SVG, approved product images, color swatch PDF
- [ ] Write "Who We Are" and "Story Angles" copy for press page
- [ ] Decide on media contact email address
- [ ] Decide whether affiliate program is announced now or kept in "coming soon" state
- [ ] Review partner page copy before launch

### Manual Tests

1. Footer → "Press" link navigates to `/press`
2. `/press` loads all five sections without error (no blank sections)
3. "Download Press Kit" button links to a file that downloads (test when ZIP is uploaded)
4. Brand logo images render correctly in both light/dark preview blocks
5. Press contact email is a mailto link and opens email client
6. Footer → "Partners" navigates to `/partners`
7. `/partners` loads all five sections
8. Referral CTA links to `/account` (or `/promotions` until account referral section is wired)
9. Breadcrumbs: Home > Press and Home > Partners render correctly on each page
10. Both pages appear in `/sitemap.xml`
11. OG meta: `og:title` for `/press` = "Press — Hy-lee"; for `/partners` = "Partner With Hy-lee"
12. Mobile (375px): both pages readable; press kit button tappable; no layout overflow

---

## Workstream 5 — Blog & Content Infrastructure

**Branch**: `feature/templates/blog-infrastructure`
**Priority**: MEDIUM
**Status**: 🔲 Not Started

### Context

Long-form content (blog posts, buying guides, how-tos) earns more backlinks over time than any
other e-commerce content type. Shopify's blog system already exists; this workstream builds the
Hydrogen rendering layer so blog content is served by the Hydrogen storefront (for consistent
design and SEO) rather than falling back to the Liquid theme.

The Blog & Media dropdown (APR12 WS9) navigates to `/blogs/news` — this workstream provides
the actual page behind that link.

Hy-lee's planned content strategy (from Apr 11 meeting):
- Lifestyle content for the tiny home / micro-apartment audience
- No technical DIY content
- Articles will be written by Shawn initially; Darian manages distribution
- Platform: Shopify blog (already configured)

### Implementation Notes

**Blog Index (`/blogs/news`)**
Route: `hydrogen/app/routes/blogs.news.tsx` or `hydrogen/app/routes/blogs.$blogHandle.tsx`
- Fetch blog articles via `STOREFRONT_QUERY`: `blog(handle: "news") { articles(first: 12) { ... } }`
- Article fields needed: `handle`, `title`, `excerpt`, `image`, `author { name }`, `publishedAt`
- Layout: masonry or 3-column card grid on desktop, 1-column on mobile
- Each card: article image (16:9 aspect ratio), article title, author, date, excerpt (2 lines)
- Pagination: "Load More" button or infinite scroll — use Storefront API cursor pagination
- SEO: `<title>` = "Blog & Media — Hy-lee"; canonical to `/blogs/news`

**Article Page (`/blogs/news/$articleHandle`)**
Route: `hydrogen/app/routes/blogs.news.$articleHandle.tsx` (may already exist in scaffold — verify)
- Fetch via `blog(handle: "news") { articleByHandle(handle: "$handle") { ... } }`
- Fields: `title`, `contentHtml`, `image`, `author { name bio avatar }`, `publishedAt`, `tags`
- Layout: full-width hero image, constrained article body (max-width ~680px), author byline
- Article body: render `contentHtml` via `dangerouslySetInnerHTML` — strip Shopify wrapper
  if needed. Apply Tailwind typography prose classes for readable long-form text.
- Related articles: query 3 articles with matching `tags`, render at bottom of article
- Article schema: `buildArticleSchema()` from WS2
- OG meta: `buildArticleMeta()` from WS3

**Internal links from articles to products**
- When Shawn writes articles mentioning specific products, he can add Shopify metafield links
  or simply use the product handle. Hydrogen should render a `ProductMentionCard` (small inline
  card: image, title, price, CTA) when a product handle appears in a structured format in the
  article (e.g., a specific metafield or a custom block type if using Shopify's rich text editor).
- For launch: this can be as simple as Shawn manually including the product URL as a link in the
  article body. The card rendering can be a Phase 2 enhancement.

**Breadcrumb**
- Blog index: Home > Blog & Media
- Article: Home > Blog & Media > [Article Title]

**Sitemap entries**
- Blog index: `/blogs/news`
- Articles: all `/blogs/news/$handle` URLs — add to dynamic sitemap generation in WS1

### Tasks

- [ ] Verify whether `blogs.news.tsx` (blog index) exists in scaffold; create if not
- [ ] Verify whether `blogs.news.$articleHandle.tsx` (article page) exists; create if not
- [ ] Blog index: fetch and render article cards (image, title, author, date, excerpt)
- [ ] Blog index: implement pagination with "Load More" or cursor-based scroll
- [ ] Article page: render `contentHtml` with prose typography styles
- [ ] Article page: author byline with name and published date
- [ ] Article page: 3 related articles by matching tags at the bottom
- [ ] Apply Article JSON-LD (WS2) and OG Article meta (WS3) to article route
- [ ] Apply BreadcrumbList JSON-LD to both blog index and article pages
- [ ] Add blog index and article URLs to dynamic sitemap (WS1)
- [ ] Confirm "Blog" link in Blog & Media dropdown (APR12 WS9) navigates to `/blogs/news`
- [ ] i18n keys: `blog.title`, `blog.by`, `blog.readMore`, `blog.relatedArticles`

### Shawn's Tasks

- [ ] Publish at least 1 draft article in Shopify admin → Blog Posts before testing
- [ ] Write content for 2–3 launch articles (target: tiny home lifestyle, micro-apartment
  living, space-smart shopping guide)
- [ ] Decide on blog author name(s) and add author bio in Shopify admin

### Manual Tests

1. `/blogs/news` loads; at least one article card renders (requires Shawn to have published a post)
2. Article card: image (16:9), title, author name, date, and excerpt all visible
3. Click article card → navigates to `/blogs/news/[handle]`
4. Article page: hero image, full article content rendered (no raw HTML visible), author byline
5. "Load More" loads additional articles without full page reload
6. Article page: 3 related articles section renders at the bottom
7. Breadcrumbs: Home > Blog & Media on index; Home > Blog & Media > [Title] on article
8. Blog article: Article schema in `<head>` (view source)
9. Blog article: `og:type` = "article" in meta tags
10. `/sitemap.xml` includes `/blogs/news` and at least one article URL
11. Mobile (375px): article cards stack 1-column; article body text is readable without overflow
12. "Blog" link in header Blog & Media dropdown → `/blogs/news`

---

## Workstream 6 — Internal Link Architecture

**Branch**: `chore/seo/internal-links`
**Priority**: MEDIUM
**Status**: 🔲 Not Started

### Context

When an external backlink lands on the homepage or a collection page, Google uses internal links
to distribute that "link equity" to deeper pages (PDPs, blog articles). Without a good internal
link structure, the SEO benefit of earned backlinks stays on the landing page rather than flowing
to the product pages that actually need ranking.

The three most impactful internal linking improvements for Hy-lee:
1. **Related products on PDP**: links between PDPs, spreading authority across the product catalog
2. **Category cross-links on PDP and collection pages**: links back to parent categories
3. **Breadcrumb consistency**: visible breadcrumbs that match the BreadcrumbList schema (already
   partially implemented — verify alignment)

### Implementation Notes

**Related Products on PDP**
- Below the product accordion, render a "You Might Also Like" section showing 4 related products.
- "Related" = products in the same collection OR products with overlapping tags.
- Query: `collection(handle: $collectionHandle) { products(first: 5) { ... } }` — exclude the
  current product by handle. Or use `productRecommendations(productId: $id)` from the Storefront
  API — this is Shopify's built-in recommendation engine and is the simplest approach.
- Render using the updated `ProductCard` component (APR12 WS3 layout).
- Add an `ItemList` JSON-LD block for the related products (optional but helpful).

**"Complete the Look" or "Frequently Bought Together" (stub)**
- For furniture/home goods, Shawn may want a "Complete Your Space" cross-sell section in the
  future. Build a placeholder slot using `productRecommendations` for now; it can be replaced
  with a curated metafield in a follow-up sprint.

**Breadcrumb consistency audit**
- Verify that the visible breadcrumb component (`BreadcrumbList` or however it's rendered)
  matches the JSON-LD `BreadcrumbList` schema on every page type where both exist.
- Common failure: schema uses a URL like `/collections/furniture` but the visible breadcrumb
  renders "Home > Furniture" linking to `/collections/all`. These must match exactly.
- Pages to audit: PDP, collection, blog article, `/about`, `/faq`, `/press`, `/partners`.

**"More in [Category]" links on collection pages**
- If a collection has subcategories (end-node navigation), render a small inline row of
  subcategory chips at the top of the collection page — links like "All Furniture | Sofas |
  Chairs | Tables". These are internal links that help both users and crawlers understand the
  category hierarchy.
- Use existing `child_nodes` metafield data that's already fetched for the category nav.

**Footer link audit**
- Confirm all footer links resolve to existing, non-404 routes. Include:
  `/about`, `/faq`, `/press`, `/partners`, `/contact`, `/promotions`, `/blogs/news`
- Any footer link pointing to a 404 should be fixed or removed.

### Tasks

- [ ] Add `productRecommendations` query to PDP loader (`products.$handle.tsx`)
- [ ] Render "You Might Also Like" section below accordion on PDP (4 cards, ProductCard component)
- [ ] Breadcrumb consistency audit: compare visible breadcrumb vs JSON-LD schema on all content pages
- [ ] Fix any breadcrumb URL mismatches found in audit
- [ ] Add subcategory chip links to collection pages (using `child_nodes` metafield)
- [ ] Audit all footer links: verify each one resolves to a live route (no 404s)
- [ ] Fix or remove any footer links that 404

### Manual Tests

1. PDP: "You Might Also Like" section renders 4 products below the accordion
2. Related products are from the same collection/category as the current product
3. Related product cards use the updated ProductCard layout (APR12 WS3)
4. Breadcrumb on PDP: visible label and URL match the JSON-LD BreadcrumbList exactly
5. Breadcrumb on collection page: visible label and URL match JSON-LD
6. Subcategory chips render on a collection page with child collections; clicking navigates to correct sub-collection
7. Footer: every link resolves without 404 (test all links in incognito)
8. Mobile: related products section scrolls horizontally or stacks; no overflow

---

## Workstream 7 — Backlink Monitoring & Search Console Setup

**Branch**: `chore/seo/monitoring-setup`
**Priority**: LOW
**Status**: 🔲 Not Started

### Context

The Apr 11 meeting established Screaming Frog (free version) as the primary post-launch audit
tool. Google Search Console is the canonical source for:
- Confirming Google has indexed pages
- Identifying crawl errors from broken backlinks
- Submitting the sitemap
- Monitoring which pages have earned backlinks over time (via Performance > Search type filter)

This workstream is mostly Shawn's admin work — Derek's tasks are the technical verification
files that prove domain ownership to Google, Bing, and others.

### Implementation Notes

**Google Search Console verification**
Google offers several verification methods. For Hydrogen:
- **HTML file method**: Google provides a file like `google[token].html` to serve at the root.
  Create a Hydrogen route `hydrogen/app/routes/google-site-verification[.html].tsx` that returns
  the file content (text/html, no layout). This is the cleanest method — no DNS changes needed.
- Alternative: DNS TXT record (Shawn handles in Shopify domain settings or DNS provider).

**Bing Webmaster Tools**
- Same pattern: `hydrogen/app/routes/BingSiteAuth[.xml].tsx` serving the Bing verification XML.
- Or use Google Search Console import (Bing can import GSC verified properties automatically).

**Sitemap submission**
- After WS1 sitemap is live, Shawn submits the URL (`https://[domain]/sitemap.xml`) in
  Google Search Console → Sitemaps. Also add the `Sitemap:` directive to robots.txt (done in WS1).

**Screaming Frog post-launch checklist**
Create a checklist document at `docs/SEO_AUDIT_CHECKLIST.md` for Shawn/Darian to run after go-live:
- Input domain URL, crawl full site
- Check: 0 pages with missing `<title>` tags
- Check: 0 pages with duplicate titles
- Check: 0 pages with missing meta descriptions
- Check: 0 canonical tags pointing to wrong URL
- Check: 0 broken internal links (4xx responses)
- Check: all product pages have `og:image`
- Export report; review monthly

**Google Analytics 4 backlink traffic attribution**
- Confirm UTM parameters are preserved when users arrive from a backlink
- In GA4, the "Referral" traffic channel captures organic backlink clicks
- No code changes needed — just confirm GA4 is installed (check if GA4 snippet exists in
  `root.tsx` or as a Shopify script tag). If not installed, this is a Shawn/Darian task.

### Tasks

- [ ] Create `hydrogen/app/routes/google-site-verification[.html].tsx` to serve GSC verification file
  (leave a placeholder — Shawn will provide the actual token from GSC)
- [ ] Create `docs/SEO_AUDIT_CHECKLIST.md` with post-launch Screaming Frog checklist
- [ ] Verify GA4 is installed: check `root.tsx` for GA4 script or Shopify script tags
- [ ] Document the sitemap submission URL for Shawn in `SEO_AUDIT_CHECKLIST.md`

### Shawn's Tasks

- [ ] Create Google Search Console property for the live domain
- [ ] Download verification HTML file from GSC; give token to Derek for WS7 route
- [ ] Submit sitemap URL in GSC after go-live
- [ ] Register on Bing Webmaster Tools (can import from GSC)
- [ ] Confirm GA4 property ID and verify data is flowing post-launch
- [ ] Set up monthly Screaming Frog audit cadence (calendar invite)
- [ ] Submit site to relevant directories: Houzz (home décor), Apartment Therapy supplier list,
  micro-living/tiny home community directories

### Manual Tests

1. `GET /[gsc-verification-file].html` → returns `200 OK` with the correct content (once token is provided)
2. `GET /sitemap.xml` → valid XML, accessible to crawlers (no auth required)
3. `GET /robots.txt` → no disallow rules that would block the GSC verification file path
4. GSC: after Shawn submits verification, property shows as "Verified" (Shawn's test)
5. GSC: sitemap submission shows 0 errors after Shawn submits (Shawn's test)
6. GA4: confirm referral traffic is visible in Real Time report when clicking a shared link from an external site

---

## Shared Pre-Commit Checklist

Run before EVERY commit on SEO workstreams:

```bash
pnpm format              # auto-fix formatting
pnpm format:check        # verify clean
pnpm typecheck           # must pass
pnpm build               # must pass (catches SSR errors — critical for sitemap/robots routes)
pnpm test                # unit tests must pass
```

---

## Shared Manual Regression Checklist

After each workstream lands:

- [ ] Homepage `<title>` and meta description still render correctly
- [ ] No new 404 routes introduced (test all nav and footer links)
- [ ] `sitemap.xml` still returns 200 with valid XML
- [ ] `robots.txt` still accessible
- [ ] Product pages: canonical, OG, and JSON-LD tags all present (spot-check 3 products)
- [ ] Collection pages: BreadcrumbList schema present and matches visible breadcrumb
- [ ] Mobile (375px): no new layout regressions on pages modified in this workstream
- [ ] No hardcoded `localhost` or `myshopify.com` URLs in meta tags (check view source on live domain)

---

## Shawn / Darian Non-Code Action Items (Backlink Outreach)

These are tracked for visibility — not Derek's tasks:

- [ ] Identify 10–20 tiny home / micro-living blogs for guest post outreach (Darian)
- [ ] Submit Hy-lee to Google My Business / Google Maps (if applicable) (Shawn)
- [ ] HARO (Help a Reporter Out): sign up and respond to home/lifestyle queries with Hy-lee quotes (Shawn/Darian)
- [ ] Supplier outreach: ask suppliers to link to `hylee.com` from their "Where to Buy" pages (Shawn)
- [ ] Reddit engagement: participate in r/tinyhouses, r/minimalism, r/malelivingspace — share content genuinely (Darian)
- [ ] Pinterest: create boards for each product category (Hy-lee's target audience is highly active on Pinterest) (Darian)
- [ ] List Hy-lee on Houzz, Apartment Therapy vendor directory, TinyHouseDirectory (Darian)
- [ ] Partner with 2–3 tiny home YouTube creators for review coverage linking to product pages (Shawn)
