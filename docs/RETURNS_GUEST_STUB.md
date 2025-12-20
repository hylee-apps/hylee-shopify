# Guest Returns Stub (Coming Soon)

This repo includes a **guest returns initiation UI stub** that matches the Track Order page layout and keeps the customer on-domain.

## What was added

- Page template: `theme/templates/page.returns.liquid`
- Section: `theme/sections/guest-returns.liquid`
- Stylesheet: `theme/assets/section-guest-returns.css`

The form requires:
- Order number
- Email address
- ZIP / Postal code

On submit it shows a confirmation banner: **"Returns are coming soon."**

No integrations are connected yet (no network calls, no external redirects).

## Shopify Admin setup (required)

1. In Shopify Admin, go to **Online Store → Pages**.
2. Create or open the page you want to use for returns.
   - Recommended title: "Returns"
   - Recommended handle: `returns` (so the URL is `/pages/returns`)
3. In the page editor, find the **Theme template** selector.
4. Select the template named **`page.returns`**.
5. Save the page.

## Verify

- Visit `/pages/returns` on the storefront.
- Fill out the form and submit.
  - Missing required fields should show an error banner.
  - Valid input should show the "Returns are coming soon." confirmation banner.

## Notes

- The template uses `{% layout none %}` (same pattern as Track Order).
- When a returns provider is approved, this page/section is the intended insertion point for the provider embed or script.
