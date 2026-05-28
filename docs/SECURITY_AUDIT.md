# Security Audit — Hardcoded Sensitive Data

**Date:** 2026-05-28  
**Scope:** `hydrogen/` — all TypeScript, route, and config files  
**Purpose:** Identify hardcoded credentials, IDs, and PII ahead of Shopify Admin metafield migration

---

## Summary

| Severity | Count | Status |
|---|---|---|
| Critical | 10 | Rotate tokens; verify `.env` is gitignored |
| High | 2 | Move to environment variables |
| Medium | 3 | Move to Shopify Admin metafields |
| Low | 1 | Optional cleanup |

---

## Critical — Credentials in `.env`

The `.env` file contains live production credentials. Verify this file is listed in `.gitignore` and has **never been committed**.

```bash
# Check git history for accidental .env commits
git log --all --full-history -- hydrogen/.env
```

If any commit is returned, **rotate all tokens immediately** and purge the file from git history.

| Variable | Value (redacted) | Action Required |
|---|---|---|
| `SESSION_SECRET` | `4318aa1e…` | Rotate if ever committed |
| `PUBLIC_STOREFRONT_API_TOKEN` | `1bf1cf4b…` | Rotate if ever committed |
| `PRIVATE_STOREFRONT_API_TOKEN` | `shpat_20ea…` | Rotate if ever committed |
| `ADMIN_APP_CLIENT_ID` | `b8dad3ae…` | Rotate if ever committed |
| `ADMIN_APP_CLIENT_SECRET` | `shpss_cf75…` | Rotate if ever committed |
| `DEEPL_API_KEY` | `227dfd1a-88bb…` | Rotate if ever committed |
| `SEARCHANISE_API_KEY` | `4S9s6L8t4D` | Rotate if ever committed |
| `PUBLIC_STORE_DOMAIN` | `z1ea4m-md.myshopify.com` | Low risk; keep in env |
| `PUBLIC_STOREFRONT_ID` | `1000096439` | Low risk; keep in env |
| `PUBLIC_CHECKOUT_DOMAIN` | `hy-lee.com` | Low risk; keep in env |

These values belong in Oxygen environment variables (for production) and `.env` (for local dev only). They should **never** move to Shopify Admin metafields — they are infrastructure secrets.

---

## Medium — Move to Shopify Admin Metafields

These are store-configuration values that may need to change without a code deploy. They are good candidates for Shopify Admin metafields under **Settings > Custom data > Shop**.

### 1. Google Tag Manager Container ID

- **File:** [hydrogen/app/root.tsx](../hydrogen/app/root.tsx) — GTM scripts in `Layout`
- **Status:** ✅ Implemented — reads from `custom.google_tag_manager_id`; GTM is skipped entirely when metafield is unset.
- **Metafield:**

  ```
  Namespace: custom
  Key:       google_tag_manager_id
  Type:      Single line text
  Value:     GTM-T925VVHC
  ```

### 2. OG / Structured Data Image URL

- **File:** [hydrogen/app/routes/_index.tsx](../hydrogen/app/routes/_index.tsx) — `meta()` function
- **Status:** ✅ Implemented — reads from `custom.og_image_url` (already existed in CMS schema); `media` is omitted when unset.
- **Metafield:**

  ```
  Namespace: custom
  Key:       og_image_url
  Type:      Single line text
  Value:     https://hy-lee.com/logo-full.png
  ```

### 3. Shopify Inbox Widget Script URL (fallback)

- **File:** [hydrogen/app/lib/admin-api.ts](../hydrogen/app/lib/admin-api.ts) — `getInboxScriptUrl()`
- **Status:** ✅ Implemented — `getInboxScriptUrl` now accepts a `cmsOverride` parameter. `root.tsx` passes `globalCms.shopifyInboxWidgetScriptUrl` as the fallback; widget is skipped when both the Admin API and metafield return nothing.
- **Metafield:**

  ```
  Namespace: custom
  Key:       shopify_inbox_widget_script_url
  Type:      URL
  Value:     (paste current CDN URL from Admin → Apps → Inbox)
  ```

---

## High — Test Credentials with Hardcoded Fallbacks

Six E2E test files use a real email address and password as default fallback values. These are committed to source control.

**Affected files:**
- `hydrogen/tests/e2e/outgoing-cards-authenticated.spec.ts`
- `hydrogen/tests/e2e/buy-again-cards-authenticated.spec.ts`
- `hydrogen/tests/e2e/return-process.spec.ts`
- `hydrogen/tests/e2e/return-resolve.spec.ts`
- `hydrogen/tests/e2e/return-shipping.spec.ts`
- `hydrogen/tests/e2e/return-reason.spec.ts`

**Current pattern (dangerous):**
```typescript
const EMAIL = process.env.TEST_EMAIL || 'derek@hy-lee.com';
const PASSWORD = process.env.TEST_PASSWORD || 'jU1cyTw1st$';
```

**Required fix:**
```typescript
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
if (!EMAIL || !PASSWORD) throw new Error('TEST_EMAIL and TEST_PASSWORD env vars are required for authenticated E2E tests');
```

Add `TEST_EMAIL` and `TEST_PASSWORD` to `.env` (gitignored) and to the CI secrets store.

---

## Shopify Admin Metafields To Create

Create these in **Settings > Custom data > Shop**, then enable **Storefront API access** on each definition.

| Namespace | Key | Type | Value | Status |
|---|---|---|---|---|
| `custom` | `google_tag_manager_id` | Single line text | `GTM-T925VVHC` | ⬜ Create + set value |
| `custom` | `og_image_url` | Single line text | `https://hy-lee.com/logo-full.png` | ⬜ Create + set value |
| `custom` | `shopify_inbox_widget_script_url` | URL | _(paste from Admin → Apps → Inbox)_ | ⬜ Create + set value |

---

## Next Steps

1. **Verify `.env` is gitignored** — run the git history check above
2. **Create Shopify Admin metafields** — use the checklist table above; enable Storefront API access on each
3. **Set metafield values** in Admin → Settings → General → Store Assets → Metafields
4. **Fix E2E test credential fallbacks** — remove hardcoded email/password defaults in the 6 spec files
