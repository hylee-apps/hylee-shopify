# SEO Gap Analysis — May 28, 2026

> **For**: Weekly Standup
> **Author**: Derek Hawkins
> **Source**: HYLEE SEO ShopifyChecklist + PR #86 (`feat/infra/seo-implementation`)

---

## TL;DR

PR #86 closed the most critical technical SEO gaps before go-live. The remaining open items are split between post-launch audits (require the live site + Screaming Frog), Shopify Admin manual tasks (require GSC data Jeremiah is setting up), and content tasks owned by Shawn and Darian.

---

## Before / After — Derek's Assigned Tasks

### ON-Page SEO

| Task | Priority | Before | After |
|------|----------|--------|-------|
| Missing H1 tags | Medium | ❌ Not implemented | ✅ Fixed — all routes audited, single H1 confirmed on each page |
| Multiple H1 tags on one page | Medium | ❌ Not implemented | ✅ Fixed — `CollectionHero` refactored from dual desktop/mobile H1s to one responsive element |

---

### Technical SEO — Shipped in PR #86

| Task | Priority | Before | After |
|------|----------|--------|-------|
| Sitemap working and setup properly | High | ❌ Not implemented | ✅ Done — dynamic `/sitemap.xml` route queries Storefront API for products, collections, pages |
| Invalid pages in the sitemap | Medium | ❌ Not implemented | ✅ Done — cart, checkout, account, filtered URLs excluded from sitemap |
| Robots.txt review | Medium | ❌ Not implemented | ✅ Done — explicit `/robots.txt` route: private paths disallowed, wildcard query strings blocked |
| Sitemap reference in robots.txt | Low | ❌ Not implemented | ✅ Done — `Sitemap:` line added to robots.txt |
| Whitelisting AI Chatbots in robots.txt | High | ❌ Not implemented | ✅ Done — GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider, CCBot all explicitly allowed |
| HTTP to HTTPS redirection | High | ❌ Not implemented | ✅ Done — all public routes now emit HTTPS canonical tags; Oxygen handles the redirect itself |
| Canonical tag implementation | High | ❌ Not implemented | ✅ Done — homepage, contact, policies, products, collections, pages, faq, about all have canonical |
| Breadcrumb navigation implementation | Low | ❌ Not implemented | ✅ Done — `PageBreadcrumbs` component + `BreadcrumbList` JSON-LD structured data on PLP + PDP |
| Lazy load implementation | Medium | ❌ Not implemented | ✅ Done — `loading="lazy"` on all below-the-fold product images; above-fold images stay eager |
| Set "filters" from collection pages as no-index | High | ❌ Not implemented | ✅ Done — `Disallow: /*?*` in robots.txt blocks all query-string URLs from crawlers |
| Set "paginated pages" as no-index | High | ❌ Not implemented | ✅ Done — same `Disallow: /*?*` rule covers pagination params |
| Set "product variants" as no-index | High | ❌ Not implemented | ✅ Done — product canonical strips variant params; only base product URL is canonical |
| 404 page optimization | Low | ❌ Not implemented | ✅ Done — 404 has H1, search bar, nav links back to key pages, and `noindex` meta |

---

### Technical SEO — Still Open

| Task | Priority | Status | Blocker / Owner |
|------|----------|--------|-----------------|
| Redirecting frequently visited 404 pages | High | 🟡 Partial — 404 page improved; Shopify Admin 301s not yet set | Needs GSC top-404 URL report from **Jeremiah** |
| Chrome Console errors check | Medium | 🔴 Not started | Needs live site — audit with DevTools after deploy |
| 5xx errors check | Low | 🔴 Not started | Needs Oxygen deployment logs — check after go-live |
| Broken external links | Low | 🔴 Not started | Screaming Frog post-launch crawl |
| Clean-up of broken images | Low | 🔴 Not started | Screaming Frog post-launch crawl |
| Image redirects | Low | 🔴 Not started | Shopify Admin → Content → Files audit post-launch |
| Broken internal links | Low | 🔴 Not started | Screaming Frog post-launch crawl |
| Links to internal redirects | Medium | 🔴 Not started | Screaming Frog post-launch crawl |
| External 3xx redirects | Low | 🔴 Not started | Screaming Frog post-launch crawl |
| Identifying + resolving redirect chains/loops | Medium | 🔴 Not started | Shopify Admin review post-launch |
| Review 302 → 301 upgrades | Low | 🔴 Not started | Shopify Admin review post-launch |
| Broken redirects | Medium | 🔴 Not started | Shopify Admin review post-launch |
| Mixed content issues | Low | 🔴 Not started | Chrome Security tab check post-launch — **Derek + Jeremiah** |
| Orphan pages identification + fixing | Low | 🔴 Not started | GSC + Screaming Frog post-launch — **Shawn + Derek** |
| Unoptimized CSS file sizes | Medium | 🔴 Not started | Lighthouse / bundle analysis post-launch |
| Broken CSS code | Medium | 🔴 Not started | Browser testing post-launch |
| JavaScript optimization | High | 🔴 Not started | Lighthouse post-launch — most involved task |
| JavaScript redirection | Medium | 🔴 Not started | Code audit (no JS redirects found on critical paths so far) |
| Broken JavaScript | High | 🔴 Not started | Console audit post-launch |
| Unused JavaScript files removal | Medium | 🔴 Not started | DevTools Coverage tab post-launch |

---

### OFF-Page SEO — Derek Tasks

| Task | Priority | Status | Blocker |
|------|----------|--------|---------|
| Redirecting frequently visited 404 pages (301s) | High | 🟡 Waiting | GSC data from Jeremiah |

---

## Open Items — Other Team Members

These are on the same checklist but not Derek's to implement. Listed here so we can track them together.

| Task | Owner | Status |
|------|-------|--------|
| Google Analytics installed | Jeremiah | ❌ Not implemented |
| Search Console setup | Jeremiah | ❌ Not implemented |
| Duplicate GA code check | Jeremiah | ❌ Not implemented |
| Is Google Analytics Installed? | Jeremiah | ❌ Not implemented |
| Blog page created and optimized | Darian | ❌ Not implemented |
| Blog page linked in footer | Darian | ❌ Not implemented |
| Social Media Links in footer | Darian | ❌ Not implemented (links exist; accounts may not be active) |
| Keywords in H2 tags | — | 🟡 In progress |
| All images have optimized alt tags | Shawn | ❌ Not implemented |
| Missing meta descriptions | Shawn + Derek | 🟡 In progress |

---

## Overall Progress

| Category | Derek Tasks Total | Completed | Remaining |
|----------|------------------|-----------|-----------|
| ON-Page SEO | 2 | 2 | 0 |
| Technical SEO (code) | 13 | 13 | 0 |
| Technical SEO (post-launch audits) | 20 | 0 | 20 |
| OFF-Page SEO | 1 | 0 | 1 (waiting on GSC) |
| UX | 1 | 1 | 0 |
| **Total** | **37** | **16 (43%)** | **21 (57%)** |

> **Note**: The 21 remaining items are almost entirely post-launch audits — they require the live site, Screaming Frog, or Search Console data. None of them are blockers for go-live. The 16 completed items are the ones that matter before launch.

---

## Go-Live Readiness — SEO

| Area | Ready? | Notes |
|------|--------|-------|
| Crawlable sitemap | ✅ Yes | Submittable to GSC as soon as Jeremiah sets it up |
| Robots.txt | ✅ Yes | AI crawlers whitelisted, private pages blocked |
| Canonical tags | ✅ Yes | All public routes covered |
| noindex on private pages | ✅ Yes | Cart, checkout, search, account, filtered URLs all blocked |
| H1 structure | ✅ Yes | One H1 per page across all routes |
| Structured data (breadcrumbs) | ✅ Yes | JSON-LD on PLP + PDP |
| HTTPS enforcement | ✅ Yes | Canonical tags + Oxygen redirect |
| GA4 / Search Console | ❌ No | Jeremiah's task — blocks post-launch monitoring |
| Blog content | ❌ No | Darian's task — not a launch blocker |

---

## Action Items for This Week

| Item | Owner | Due |
|------|-------|-----|
| Merge PR #86 | Derek | This sprint |
| Set up Google Search Console + verify domain | Jeremiah | Before go-live |
| Install GA4 + confirm Tag Manager firing | Jeremiah | Before go-live |
| Pull top-404 URLs from Oxygen logs / old analytics | Jeremiah | Post-launch week 1 |
| Submit sitemap to GSC once live | Jeremiah | Day 1 post-launch |
| Create Shopify Admin 301 redirects for top-404s | Derek | Post-launch week 1 (needs Jeremiah's data) |
| Confirm social account URLs for footer icons | Darian | Before go-live |
| Meta description audit for key pages | Shawn + Derek | This sprint |
