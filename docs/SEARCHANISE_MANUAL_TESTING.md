# Searchanise Integration — Manual Testing Guide

> **Feature branch:** `feature/search/searchanise-integration`
> **Updated:** 2026-02-23

This guide walks through every testable surface of the Searchanise integration:
the synonym pipeline script, the search results page, and the header autocomplete
dropdown. Follow the sections in order — prerequisites must be in place before
the other tests can be meaningful.

---

## Prerequisites

### 1. API key is configured

Open `hydrogen/.env` and confirm `SEARCHANISE_API_KEY` is set to the store's key
(visible in the Searchanise dashboard under **Stores → your store → API key**).

```
SEARCHANISE_API_KEY=<your-key>
```

### 2. Dev server is running

```bash
pnpm dev
# Opens at http://localhost:3000
```

### 3. Store has indexed products

The Searchanise app must have completed at least one index sync of the Shopify
catalog before search will return results. Confirm in the Searchanise dashboard
that **Products indexed** is > 0.

---

## Part 1 — Synonym Pipeline Script

### 1.1 Generate synonyms from a CSV

1. Export your Shopify products:
   **Admin → Products → Export → All products → CSV for Excel**
   Save the file to `data/products.csv` (create the `data/` folder if needed).

2. Run the generator:

   ```bash
   pnpm synonyms:generate --input data/products.csv
   ```

3. **Expected output:**
   - Console shows product count and number of synonym groups found, e.g.:
     ```
     Parsing products from: data/products.csv
       → 247 unique products found
     Generating synonym groups...
       → 18 synonym groups generated
     Synonyms written to: data/synonyms.json
     Sample groups:
       tv ↔ television
       ac ↔ air conditioner
       ...
     ```
   - `data/synonyms.json` is created with an array of `{ "terms": [...] }` objects.

4. **Check the file:**
   ```bash
   cat data/synonyms.json
   ```
   Each entry should look like:
   ```json
   [
     { "terms": ["tv", "television"] },
     { "terms": ["ac", "air conditioner"] }
   ]
   ```

### 1.2 Upload synonyms to Searchanise

1. Run the upload command:

   ```bash
   pnpm synonyms:upload --input data/synonyms.json
   ```

2. **Expected output:**
   ```
   Uploading 18 synonym groups to Searchanise...
   Upload complete: 18 groups uploaded, 0 failed.
   ```

3. **Verify in the dashboard:**
   - Go to Searchanise dashboard → **Search Settings → Synonyms**
   - Confirm the uploaded groups appear (may take a moment to propagate).

### 1.3 Error handling — missing CSV

Run with a non-existent file:

```bash
pnpm synonyms:generate --input data/nonexistent.csv
```

**Expected:** Exits with `Error: CSV file not found: data/nonexistent.csv` and
a non-zero exit code. Does not create `data/synonyms.json`.

### 1.4 Error handling — missing API key

Temporarily remove or blank out `SEARCHANISE_API_KEY` in `.env`, then:

```bash
pnpm synonyms:upload --input data/synonyms.json
```

**Expected:** Exits with `Error: SEARCHANISE_API_KEY is required for upload.` and
a non-zero exit code. No upload is attempted.

---

## Part 2 — Search Results Page (`/search`)

### 2.1 Empty state (no query)

1. Navigate to `http://localhost:3000/search`
2. **Expected:**
   - Page loads without errors (no 500 page)
   - Search form is visible with an input and a "Search" button
   - The prompt "Enter a search term to find products" is shown below the form
   - Breadcrumb shows: **Home / Search**

### 2.2 Search with results

1. Navigate to `http://localhost:3000/search?q=shoes` (or any term that exists
   in your catalog)
2. **Expected:**
   - Result count appears: e.g. `42 results for "shoes"`
   - Product cards render with image, title, and price
   - Cards link to `/products/<handle>` when clicked

### 2.3 Search with no results

1. Navigate to `http://localhost:3000/search?q=xyzgarbage123`
2. **Expected:**
   - Message: `No results for "xyzgarbage123"`
   - Empty state renders with a "Browse Collections" button
   - No JS errors in the browser console

### 2.4 Synonym matching

This verifies that uploaded synonyms work end-to-end.

1. Confirm a synonym pair was uploaded, e.g. `tv ↔ television`
2. If your catalog has products tagged/titled with "television":
   - Search for `tv` → same products appear as when searching `television`
3. If your catalog has abbreviation products:
   - Search for the abbreviation → products matching the full term appear

> **Note:** Allow a few minutes after upload for Searchanise to propagate synonyms.

### 2.5 Pagination

1. Search for a broad term that returns more than 12 results, e.g. `http://localhost:3000/search?q=a`
2. **Expected:**
   - First page shows up to 12 product cards
   - "Next" button appears below the grid
   - Clicking "Next" loads page 2 (`?q=a&pg=2`) and shows the next set
   - "Previous" button appears on page 2
   - "Page X of Y" counter is accurate

### 2.6 Graceful degradation — no API key

1. Remove `SEARCHANISE_API_KEY` from `hydrogen/.env` and restart the dev server
2. Navigate to `/search?q=shoes`
3. **Expected:**
   - Page loads (no 500)
   - Shows `0 results for "shoes"` and the empty state
   - Browser console has **no** unhandled error — only a `[search] SEARCHANISE_API_KEY is not set` warning in the server terminal

---

## Part 3 — Header Autocomplete Dropdown

The autocomplete only shows on non-homepage pages (the alternate header
layout). Use any collection or product page.

### 3.1 Dropdown appears after typing

1. Navigate to `http://localhost:3000/collections`
2. Click into the search bar in the header
3. Type a query with 2+ characters, e.g. `sho`
4. Wait ~400 ms for the debounce
5. **Expected:**
   - A dropdown panel appears below the search bar
   - **Suggestions** section lists matching query completions with a result count
   - **Products** section lists up to 5 product tiles (image + title + price)
   - A "See all results for …" footer link is present

### 3.2 Keyboard navigation

1. Type a query into the header search bar and wait for the dropdown
2. Press **↓** (arrow down)
   - First item in the list is highlighted
3. Press **↓** again
   - Second item is highlighted
4. Press **↑**
   - Cycles back up
5. Press **Enter** on a highlighted suggestion
   - Navigates to `/search?q=<suggestion>` or `/products/<handle>` depending on
     whether a suggestion or a product item was selected
6. **Expected in all cases:** No JS errors; page navigates correctly

### 3.3 Escape closes the dropdown

1. Type a query into the header search bar
2. Wait for dropdown to open
3. Press **Escape**
4. **Expected:** Dropdown closes; input loses focus; no crash

### 3.4 Outside click closes the dropdown

1. Type a query into the header search bar
2. Wait for dropdown to open
3. Click anywhere outside the search bar
4. **Expected:** Dropdown closes; input retains its typed value

### 3.5 Submitting the form navigates to the search page

1. Type `boots` into the header search bar
2. Press **Enter** (without navigating via keyboard into the list)
   — or click the magnifying glass icon button
3. **Expected:** Navigates to `/search?q=boots` and shows full search results

### 3.6 Dropdown does not appear with fewer than 2 characters

1. Type a single character, e.g. `a`
2. **Expected:** No API request is made; dropdown does not open
   (Check Network tab in DevTools — no request to `/api/predictive-search`)

### 3.7 Loading indicator during fetch

1. In DevTools → Network, throttle to "Slow 3G"
2. Type a query
3. **Expected:** The magnifying glass icon in the search bar pulses (teal/animated)
   while the request is in-flight, then returns to its normal state when results load

---

## Part 4 — Regression Checks

After verifying the new functionality, confirm that nothing else broke.

| Page | Check |
|------|-------|
| Homepage (`/`) | Loads without errors; hero search form still works |
| PDP (`/products/<handle>`) | Loads correctly; header search bar present |
| Collection (`/collections/all`) | Filters and sort work; header autocomplete functions |
| Cart (`/cart`) | Items add/remove; checkout flow unaffected |
| Account login (`/account/login`) | Form renders; no search-related errors |

---

## Quick Reference

```bash
# Start dev server
pnpm dev

# Generate synonyms from CSV
pnpm synonyms:generate --input data/products.csv

# Upload synonyms to Searchanise
pnpm synonyms:upload --input data/synonyms.json

# Run unit tests (synonym logic)
pnpm test

# Run TypeScript check
pnpm typecheck

# Run E2E tests (requires running dev server)
pnpm test:e2e --grep "Search"
```
