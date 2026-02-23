# Active Context Checkpoint

> **Updated:** 2026-02-23
> **Branch:** main
> **Status:** in-progress

## Active Feature

Hydrogen/Remix storefront migration. The Shopify Liquid `theme/` is the production
storefront. The `hydrogen/` subdirectory is a new React + Hydrogen app that will
replace it. Phase 1 (scaffold + CI) is merged. Current focus: building out the full
storefront feature set in Hydrogen — pages, checkout flow, account pages — matching
the Figma design specs.

The most recently completed milestone is a **5-step custom checkout flow**
(Cart → Payment → Shipping → Review → Shopify-hosted payment → Confirmation).

## Completed Work

### Checkout Flow (completed 2026-02-23)
- `hydrogen/app/lib/checkout.ts` — Created: GraphQL mutations (`cartBuyerIdentityUpdate`, `cartAttributesUpdate`), types (`ShippingAddress`, `ShippingMethod`, `PaymentMethodType`), cart-attribute helpers, address validator, `formatMoney`
- `hydrogen/app/components/checkout/CheckoutProgress.tsx` — Modified: step numbering, completed-step checkmark + teal background, active-step green, clickable links to completed steps
- `hydrogen/app/components/checkout/OrderSummary.tsx` — Created: shared sticky sidebar for all checkout steps; configurable title, shipping/tax display, CTA (link or submit button), trust badges
- `hydrogen/app/routes/checkout.payment.tsx` — Modified: added `action()` handler that stores payment method preference via `cartAttributesUpdate`, reads saved method in loader, CTA navigates to `/checkout/shipping`
- `hydrogen/app/routes/checkout.shipping.tsx` — Created: Step 3 — address form + shipping method selector + delivery instructions; action calls `cartBuyerIdentityUpdate` + `cartAttributesUpdate`; redirects to `/checkout/review`
- `hydrogen/app/routes/checkout.review.tsx` — Created: Step 4 — shows stored address, method, payment method, items; action does final `cartBuyerIdentityUpdate` then redirects to Shopify `checkoutUrl`
- `hydrogen/app/routes/checkout.confirmation.tsx` — Created: Step 5 — success hero, order details card (items + price breakdown), guest create-account CTA; reads `order_id`/`order_number` from URL params
- `hydrogen/app/routes/cart.tsx` — Modified: checkout CTA now links to `/checkout/payment` (our custom flow) instead of Shopify's `checkoutUrl` directly

### Context Preservation System (completed 2026-02-23)
- `docs/ACTIVE_CONTEXT.md` — Created: this file
- `docs/context-preservation/CONTEXT_SCHEMA.md` — Created: field-by-field schema reference
- `docs/context-preservation/CONTEXT_TEMPLATE.md` — Created: blank template for new features
- `scripts/export-context.sh` — Created: regenerates `.github/copilot-instructions.md`
- `scripts/copilot-instructions-base.md` — Created: static base for copilot-instructions.md
- `guidelines/CONTEXT_PRESERVATION.md` — Created: workflow documentation
- `CLAUDE.md` — Modified: added Context Checkpoint section
- `hydrogen/CLAUDE.md` — Modified: added Context Checkpoint section

### Earlier Milestones (Phase 1 + pages)
- Hydrogen scaffold, Vite config, Tailwind v4 `@theme` token mapping
- Header (shadcn DropdownMenu nav), Footer, Homepage, PDP, Collection pages
- Account pages (orders, addresses, order detail)
- Search, Compare pages
- All design references captured in `hydrogen/design-references/`

## Remaining Work

1. **[HIGH]** Shopify checkout redirect → confirmation — After Shopify's hosted checkout
   completes, configure it to redirect back to `/checkout/confirmation?order_id=...`.
   Mechanism: append `?return_to=/checkout/confirmation` to the `checkoutUrl`, OR use
   Shopify's post-purchase extension. Currently the confirmation page exists but won't
   receive real order data unless the redirect is configured.

2. **[HIGH]** Homepage collections wiring — `hydrogen/app/routes/_index.tsx` has static
   placeholder products in the "What's New" and "Summer Collection" sections. Wire them
   to real collections: `what-s-new` and `summer-collection` via `storefront.query`.

3. **[MED]** Fetch missing Figma specs for Shipping and Review pages — The Figma design
   context was referenced in the plan but `get_design_context` was never called for nodes
   `327:671` (Shipping inner) and `327:1241` (Review inner) of file `vzeR7m9jbWjAfD9EVlReyq`.
   Run the MCP tool and save specs to `hydrogen/design-references/cart-shipping/` and
   `hydrogen/design-references/cart-review/`.

4. **[MED]** Mobile responsiveness — All checkout pages use a 2-column layout
   (`max-w-[1443px]` with `flex items-start gap-8`). This needs a responsive breakpoint
   so the order summary sidebar stacks below the form on mobile.

5. **[MED]** PLP polish — `hydrogen/app/routes/collections.$handle.tsx` and related
   components (`FilterSidebar`, `CollectionToolbar`, `ProductGrid`) have outstanding
   visual polish items from earlier sessions.

6. **[LOW]** TypeScript error in `collections.all.tsx` — pre-existing `onOpenFilters`
   prop type mismatch; unrelated to checkout work, deferred.

7. **[LOW]** Search page (`hydrogen/app/routes/search.tsx`) — functional but may need
   UI polish to match Figma.

## Technical Decisions

- **Shopify payment constraint — pre-checkout UX pattern**: Shopify does not allow
  processing payments outside their hosted checkout. All alternatives were investigated:
  `checkoutCompleteWithCreditCardV2` was removed in 2025-04, `cartSubmitForCompletion`
  is undocumented, Checkout Sheet Kit is mobile-only, Stripe + Admin API `orderCreate`
  violates TOS. Decision: our pages collect and persist checkout data, then redirect
  to `cart.checkoutUrl` from the Review page. Shopify's checkout is pre-populated with
  buyer identity (email, phone, country) via `cartBuyerIdentityUpdate`.

- **Cart attributes for cross-step state**: Checkout data persists via `cartAttributesUpdate`
  using keys defined in `CHECKOUT_ATTR` (`checkout_shipping_address`, `checkout_shipping_method`,
  etc.). This is durable across browser sessions. The `getCheckoutAttributes()` helper reads
  them back. Do NOT use browser sessionStorage/localStorage — cart attributes are the source
  of truth.

- **Hydrogen checkout step order**: The flow is Cart → Payment → Shipping → Review (not the
  Figma label order). The Figma "Continue to Payment" label on the Shipping page was overridden
  to say "Continue to Review" to match the implemented flow.

- **shadcn/ui components**: Used throughout (Card, Accordion, Avatar, Separator, DropdownMenu).
  Do not re-implement these — check `hydrogen/app/components/ui/` before adding new UI.

## Critical Context

### Figma File Keys
| Design | File Key | Node ID |
|--------|----------|---------|
| Header / Footer | `d52sF4D2B0bIzt3A4z3UjE` | various |
| Homepage | `qoaTDaCkxR1VBE559Snhjd` | — |
| PDP | `Cz8f2ycIjQZOoremTy2eBM` | `1460:1444` |
| Cart & Checkout | `vzeR7m9jbWjAfD9EVlReyq` | see below |
| Cart (step 1) | `vzeR7m9jbWjAfD9EVlReyq` | `327:72` |
| Payment (step 2) | `vzeR7m9jbWjAfD9EVlReyq` | `327:1178` |
| Shipping (step 3) | `vzeR7m9jbWjAfD9EVlReyq` | `327:887` (inner: `327:671`) |
| Review (step 4) | `vzeR7m9jbWjAfD9EVlReyq` | `327:1413` (inner: `327:1241`) |
| Confirmation (step 5) | `vzeR7m9jbWjAfD9EVlReyq` | `327:1721` (inner: `327:1579`) |

### Design Tokens (key mappings)
- `--primary` = `#2ac864` (green) — active step, hero elements, primary CTA bg
- `--secondary` = `#2699a6` (teal) — links, completed checkout steps, secondary CTA bg
- `--color-hero` = `#14b8a6` — homepage hero background (different from `--secondary`)
- `--border` = `border-border` in Tailwind — use everywhere for border color

### Key File Locations
- Checkout utilities: `hydrogen/app/lib/checkout.ts`
- Shared checkout components: `hydrogen/app/components/checkout/`
- Storefront queries: `hydrogen/app/lib/fragments.ts`
- Design tokens: `hydrogen/app/styles/app.css` (`@theme` block)
- Tailwind config: `hydrogen/app/styles/app.css` (Tailwind v4, no separate config file)

### Hydrogen App Structure
- Routes: `hydrogen/app/routes/*.tsx` (React Router 7 file-based routing)
- Layouts: `hydrogen/app/root.tsx` + route `_layout.tsx` files
- Cart context: `context.cart.*` (Hydrogen built-in)
- Customer account: `context.customerAccount.*`
- Storefront queries: `context.storefront.query()` / `.mutate()`

## Recent Errors & Fixes

- **Error**: `TypeScript: property 'totalShippingAmount' does not exist on CartCost`
  **Fix**: `totalShippingAmount` was removed from the CartCost type. Replaced with hardcoded
  "Calculated at next step" text for shipping display.

- **Error**: `File has not been read yet` when trying to Write a file
  **Fix**: Always Read the file first before using Write, even if just reading 5 lines.

- **Error**: `create-hydrogen` CLI hangs — requires interactive prompts
  **Fix**: Cannot run non-interactively. Use manual scaffold from the skeleton template.

- **Error**: `.graphqlrc.ts` codegen — `preset()` is wrong API
  **Fix**: Use `preset.buildGeneratesSection()` instead.

## Next Immediate Action

> Wire Shopify's checkout redirect back to our confirmation page. In
> `hydrogen/app/routes/checkout.review.tsx`, append `?return_to=/checkout/confirmation`
> (or the appropriate param) to `cart.checkoutUrl` before redirecting. Verify by
> completing a test checkout and confirming the redirect lands on our confirmation page.
> Reference Shopify docs on post-checkout redirect configuration for Hydrogen storefronts.
