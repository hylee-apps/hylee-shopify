# Categories Page Metafield Setup
## `custom.is_displayed_on_all_product_categories_page`

**Scope:** Shopify Admin only — no code changes required.

This task controls which collections appear on the `/categories` A-to-Z browsing page. A collection only appears when the metafield is explicitly set to `true`. Unset or `false` means it is hidden.

---

## Step 1 — Verify the Metafield Definition

1. Admin → **Settings** → **Custom data** → **Metafield definitions**
2. Select resource type: **Collections**
3. Locate `is_displayed_on_all_product_categories_page` under namespace `custom`
4. Confirm:
   - **Type:** `True or false`
   - **Namespace:** `custom`
   - **Key:** `is_displayed_on_all_product_categories_page`

### ⚠️ Enable Storefront API Access (Required)

Without this, Hydrogen cannot read the metafield value regardless of what is set.

1. Click into the metafield definition
2. Scroll to **Storefront API access**
3. Toggle **ON**
4. Save

---

## Step 2 — Set Values via Bulk Editor (Recommended)

1. Admin → **Products** → **Collections**
2. Select all collections using the checkbox in the column header
3. Click **Edit** (top right) to open the bulk editor spreadsheet
4. Click **Add fields** → search for `is_displayed_on_all_product_categories_page` → add column
5. For each collection that should appear on `/categories`, click the cell and toggle to **`true`**
6. Leave all others blank or set to **`false`**
7. Shopify auto-saves as you go
8. Repeat for each pagination page (Shopify shows ~50 collections per page)

> **Tip:** Sort collections A–Z before starting so the order matches the `/categories` page layout.

---

## Step 3 — Collection Checklist

Use this table to track which collections have been reviewed. Fill in the **Decision** column before starting, then check off **Done** as you go in the bulk editor.

> **To get the full collection list:** Admin → Products → Collections → export to CSV, or work directly from the bulk editor view.

| # | Collection Name | Handle | Display on /categories? | Done |
|---|----------------|--------|------------------------|------|
| 1 | _(fill from Admin)_ | | ☐ Yes / ☐ No | ☐ |
| 2 | | | ☐ Yes / ☐ No | ☐ |
| 3 | | | ☐ Yes / ☐ No | ☐ |
| 4 | | | ☐ Yes / ☐ No | ☐ |
| 5 | | | ☐ Yes / ☐ No | ☐ |
| 6 | | | ☐ Yes / ☐ No | ☐ |
| 7 | | | ☐ Yes / ☐ No | ☐ |
| 8 | | | ☐ Yes / ☐ No | ☐ |
| 9 | | | ☐ Yes / ☐ No | ☐ |
| 10 | | | ☐ Yes / ☐ No | ☐ |
| 11 | | | ☐ Yes / ☐ No | ☐ |
| 12 | | | ☐ Yes / ☐ No | ☐ |
| 13 | | | ☐ Yes / ☐ No | ☐ |
| 14 | | | ☐ Yes / ☐ No | ☐ |
| 15 | | | ☐ Yes / ☐ No | ☐ |
| 16 | | | ☐ Yes / ☐ No | ☐ |
| 17 | | | ☐ Yes / ☐ No | ☐ |
| 18 | | | ☐ Yes / ☐ No | ☐ |
| 19 | | | ☐ Yes / ☐ No | ☐ |
| 20 | | | ☐ Yes / ☐ No | ☐ |
| 21 | | | ☐ Yes / ☐ No | ☐ |
| 22 | | | ☐ Yes / ☐ No | ☐ |
| 23 | | | ☐ Yes / ☐ No | ☐ |
| 24 | | | ☐ Yes / ☐ No | ☐ |
| 25 | | | ☐ Yes / ☐ No | ☐ |
| 26 | | | ☐ Yes / ☐ No | ☐ |
| 27 | | | ☐ Yes / ☐ No | ☐ |
| 28 | | | ☐ Yes / ☐ No | ☐ |
| 29 | | | ☐ Yes / ☐ No | ☐ |
| 30 | | | ☐ Yes / ☐ No | ☐ |
| 31 | | | ☐ Yes / ☐ No | ☐ |
| 32 | | | ☐ Yes / ☐ No | ☐ |
| 33 | | | ☐ Yes / ☐ No | ☐ |
| 34 | | | ☐ Yes / ☐ No | ☐ |
| 35 | | | ☐ Yes / ☐ No | ☐ |
| 36 | | | ☐ Yes / ☐ No | ☐ |
| 37 | | | ☐ Yes / ☐ No | ☐ |
| 38 | | | ☐ Yes / ☐ No | ☐ |
| 39 | | | ☐ Yes / ☐ No | ☐ |
| 40 | | | ☐ Yes / ☐ No | ☐ |
| 41 | | | ☐ Yes / ☐ No | ☐ |
| 42 | | | ☐ Yes / ☐ No | ☐ |
| 43 | | | ☐ Yes / ☐ No | ☐ |
| 44 | | | ☐ Yes / ☐ No | ☐ |
| 45 | | | ☐ Yes / ☐ No | ☐ |
| 46 | | | ☐ Yes / ☐ No | ☐ |
| 47 | | | ☐ Yes / ☐ No | ☐ |
| 48 | | | ☐ Yes / ☐ No | ☐ |
| 49 | | | ☐ Yes / ☐ No | ☐ |
| 50 | | | ☐ Yes / ☐ No | ☐ |

_Add rows as needed. The storefront query supports up to 250 collections._

---

## Step 4 — Verify in the Storefront

After setting values, wait ~1–2 minutes for the cache to clear, then verify on the live site.

| Test | Expected result |
|------|----------------|
| Collection set to `true` | Appears in the A-Z listing on `/categories` |
| Collection set to `false` | Does **not** appear |
| Collection with no value set | Does **not** appear |
| Letter with all collections hidden | Letter is grayed out in the strip; no section renders |

**Quick Storefront API check** (Shopify GraphiQL App → Storefront API):

```graphql
{
  collections(first: 10, sortKey: TITLE) {
    nodes {
      title
      isDisplayed: metafield(
        namespace: "custom"
        key: "is_displayed_on_all_product_categories_page"
      ) {
        value
      }
    }
  }
}
```

Collections you set to `true` should return `"value": "true"`. All others return `null`.

---

## Ongoing Maintenance

- Any **new collection** created in the future defaults to **hidden** (metafield unset). It must be explicitly enabled before it appears on `/categories`.
- Changes take effect within ~1 minute in production (no deploy needed).
- The metafield can be updated at any time via the bulk editor or individual collection pages.
