# Hydrogen CLAUDE.md

This is the Hydrogen (React/TypeScript) storefront, migrating from the Liquid theme in `theme/`.

## Commands

```bash
pnpm dev                # Start Hydrogen dev server (port 3000)
pnpm build              # Production build
pnpm typecheck          # Type-check
pnpm test               # Unit tests (Vitest)
pnpm test:e2e           # E2E tests (Playwright)
pnpm visual:header      # Capture Header screenshots
pnpm compare:header     # Generate Header comparison report
```

## Architecture

- **Framework**: Shopify Hydrogen + React Router 7
- **Styling**: Tailwind CSS v4 with `@theme` tokens in `app/styles/app.css`
- **Components**: CVA variants + `cn()` merger (`app/lib/utils.ts`)
- **Icons**: SVG icon system in `app/components/display/Icon.tsx` (60+ icons)
- **Fonts**: Loaded via Google Fonts in `app/root.tsx` — verify against Figma before UI work
- **Testing**: Vitest (unit) + Playwright (e2e + visual)

## Figma Design Reference Process

**This is a MANDATORY process.** When building, refactoring, or refining any UI component, follow these steps exactly. Do NOT skip sub-steps — each one exists because a gap was found when it was missing.

### Figma Source File
- **File key**: `d52sF4D2B0bIzt3A4z3UjE`
- **File name**: Hy-lee design
- **Design variables**: `--primary: #2ac864`, `--secondary: #2699a6`, `--default: #666`, `--alternate: #fff`

---

### Step 1: Capture Reference (do this FIRST before any UI work)

When given a Figma URL or asked to work on a component with a Figma design:

#### 1a. Extract identifiers from the URL
- URL format: `https://www.figma.com/design/:fileKey/:fileName?node-id=:nodeId`
- Convert `node-id` from dash format (`2766-311`) to colon format (`2766:311`)

#### 1b. Fetch the design using all three Figma MCP tools in parallel
```
get_screenshot(fileKey, nodeId)       → visual reference
get_design_context(fileKey, nodeId)   → generated code with exact measurements
get_variable_defs(fileKey, nodeId)    → design token values
```

#### 1c. Check for ALL variants
Look at the `data-name` attribute in the `get_design_context` output (e.g. `Property 1=Alternate`). This tells you the captured variant. Then:
- Use `get_metadata` on the **parent node** (decrement the node ID suffix, or check the page) to find sibling variants
- If multiple variants exist, capture EACH ONE with separate `get_screenshot` + `get_design_context` calls
- Document all known variants in the spec, even if only one is being built now

#### 1d. Save to `design-references/<component>/`
- `figma-spec.md` — Full spec (see 1e below)
- `design-context.tsx` — Raw Figma MCP code output, saved verbatim with a DO NOT MODIFY header and capture date
- If multiple variants: `design-context-<variant>.tsx` for each

#### 1e. Write the spec by parsing the `get_design_context` output

Extract ALL of the following. Missing any of these has caused pixel-drift in past work:

**Layout:**
- Frame dimensions (width × height)
- Padding values (top, right, bottom, left)
- Gap values between children
- Flex direction and alignment

**Borders:**
- Border width (in px)
- Border color (as token ref AND hex fallback)
- Border radius (in px) — note: check if these exist in `app/styles/app.css` `@theme` block. If not, flag as "needs new token or arbitrary value"

**Typography:**
- Font family name (e.g. "Inter Medium")
- Font weight (numeric, e.g. 500)
- Font size (in px)
- Line height
- Text color (as token ref AND hex fallback)
- **CRITICAL**: Cross-check the font family against what's loaded in `app/root.tsx`. If Figma uses a font not loaded in the app, flag this immediately as a blocking issue.

**Children:**
- Each child element's dimensions (width × height)
- Each child's positioning (static, absolute, offsets)
- Icon sizes and container sizes
- Image/logo dimensions and asset names

**Tokens:**
- All `var(--token, fallback)` references
- Map each to the corresponding Tailwind class

**Interactive states (document gaps):**
- Note which states are shown in Figma (usually just default)
- Flag hover, focus, active, disabled as "not specified in design — use project defaults or ask designer"

**Responsive behavior (document the translation):**
- Figma frame width (usually 1440px for desktop, 390px for mobile)
- Note: Figma designs are fixed-width. Document how the layout should translate to responsive Tailwind:
  - Fixed-width containers → `max-w-7xl mx-auto` with responsive padding
  - Fixed child widths (e.g. `w-[683px]`) → `flex-1` or percentage-based with `max-w` constraints
  - Fixed heights → use exact value via arbitrary Tailwind (e.g. `h-[79px]`)
  - Add a "Responsive Translation" section to the spec

---

### Step 2: Verify Prerequisites

Before writing any component code, verify these are satisfied:

#### 2a. Font loading
- Read `app/root.tsx` and check the Google Fonts `<link>` URL
- If Figma specifies a font family not in the link, add it
- If the font family differs from `@theme` definitions in `app/styles/app.css`, update the theme

#### 2b. Design token coverage
Check `app/styles/app.css` `@theme` block for each value in the spec:
- Colors: should all map to existing `--color-*` tokens
- Border radii: if Figma uses values not in `--radius-*`, either add a new token or document the arbitrary Tailwind value to use
- Shadows: check if the Figma shadow matches an existing `--shadow-*` token or needs an arbitrary value
- Spacing: check if gap/padding values need custom values

#### 2c. Asset verification
For any images/logos referenced in the design:
- Check `public/` directory for the asset
- Compare the asset visually against the Figma screenshot — a white logo vs a colored logo are NOT interchangeable
- If the wrong variant exists, flag it

#### 2d. Icon size reconciliation
Our Icon component renders SVGs at a given `size` prop. Figma specifies icons as raster images with exact dimensions. For each icon in the design:
- Note the Figma container size AND the icon's visual area (check `inset` percentages)
- Map to the closest `size` prop value for our Icon component
- If the icon doesn't exist in our Icon component, flag it

---

### Step 3: Build/Refine Against the Spec

When implementing or modifying the component:

1. **Read `design-references/<component>/figma-spec.md`** before writing any code
2. **Match measurements exactly** — use pixel values from the spec. Prefer arbitrary Tailwind values (`h-[79px]`, `gap-[38px]`) over approximate semantic ones (`h-20`, `gap-10`) when pixel-perfection matters.
3. **Map Figma tokens to Tailwind tokens**:
   - `var(--primary, #2ac864)` → `text-primary`, `bg-primary`, `border-primary`
   - `var(--secondary, #2699a6)` → `text-secondary`, `border-secondary`
   - `var(--alternate, white)` → `bg-white` or `bg-background`
   - `#666` / `var(--default)` → `text-text-muted`
4. **Map Figma typography to Tailwind**:
   - Font weight "Medium" → `font-medium` (500)
   - `14px` → `text-sm` (14px) or `text-[14px]` for exact match
   - `rgba(0,0,0,0.5)` → `text-black/50`
5. **Diff against `design-context.tsx`** to identify remaining gaps between implementation and design. Walk through the generated code element by element and check:
   - Are all borders present? (color, width, radius)
   - Are all backgrounds correct? (not just "white" vs "green" but the right token)
   - Are children in the correct order with correct spacing?
   - Are icon/image sizes matching?

---

### Step 4: Visual Comparison

After making changes, compare the implementation against the Figma design:

1. **Capture implementation screenshot**:
   ```bash
   pnpm visual:<component>
   ```
   This runs the Playwright visual test at 1440px viewport (matching Figma frame width).

2. **Re-fetch the Figma screenshot** for comparison:
   ```
   get_screenshot(fileKey, nodeId)
   ```

3. **Compare visually** — look at the Figma screenshot and the Playwright capture. Report discrepancies in this checklist order:
   - [ ] Overall layout direction and alignment
   - [ ] Container width, height, and padding
   - [ ] Background colors
   - [ ] Border colors, widths, and radii
   - [ ] Typography: font, size, weight, color
   - [ ] Icon sizes and positions
   - [ ] Spacing between elements (gaps, margins)
   - [ ] Shadows and effects
   - [ ] Assets (logos, images) — correct variant?

4. If a `screenshot.png` exists in the design reference directory, generate the HTML comparison report:
   ```bash
   pnpm compare:<component>
   ```

---

### Step 5: Iterate

Repeat Steps 3-4 until the implementation matches the design. For each iteration:
- Fix one category of discrepancy at a time (e.g. all borders, then all typography)
- Re-capture and re-compare after each fix
- Document any **intentional deviations** in `figma-spec.md` under an "Implementation Notes" section with rationale (e.g. "Search bar uses `flex-1` instead of `w-[683px]` for responsive behavior")

---

### Adding a New Component to the Workflow

1. Create directory: `design-references/<component>/`
2. Follow Steps 1-5 above
3. Add scripts to `package.json`:
   ```json
   "visual:<component>": "playwright test --config=playwright.config.ts --project=chromium tests/e2e/visual/<component>.visual.spec.ts",
   "compare:<component>": "npx tsx scripts/compare-design.ts <component>"
   ```
4. Create the Playwright visual test: `tests/e2e/visual/<component>.visual.spec.ts`
5. Update the "Active Design References" table below

## Active Design References

| Component | Figma Node | Variant | Status |
|-----------|-----------|---------|--------|
| Header | `2766:311` | Alternate | Captured — needs font fix, border fixes, cart redesign |
| Homepage | `201:155` | — | Captured 2026-02-19. Hero + 2 product sections + Promotions built. Products are static placeholders — TODO wire to Shopify collections. |
| Hero | `203:267` | — | bg-hero (#14b8a6), white logo, search → PredictiveSearch |
| Footer | `659:113` | Default/Primary/Secondary/Tertiary | Updated 2026-02-23 — 4 color variants implemented; source moved to Component Library (X566CMLIsD8YboYdRU18IS) |
| PLP | `387:249` | — | Captured 2026-02-19. Breadcrumbs, CollectionHero (image left 328px + title right 57px), 5-col ProductSmall grid, N Products heading. Roboto→Inter font gap documented. |
| PDP | `1460:1444` | — | Captured 2026-02-21. 3-col layout (gallery / info accordion / purchase controls). shadcn Accordion/Separator/Avatar integrated. Gallery vertical thumbs. Below: Details/Specs/Warranty/Reviews accordion. File key: `Cz8f2ycIjQZOoremTy2eBM`. |
| Cart Review | `327:133` | 1920w light | Captured 2026-02-22. File key: `vzeR7m9jbWjAfD9EVlReyq`. Progress bar (CheckoutProgress component), guest banner, cart items card, promo code card, sticky order summary sidebar. CheckoutProgress at `app/components/checkout/CheckoutProgress.tsx`. |
| Cart Payment | `327:1178` | 1920w light | Captured 2026-02-23. File key: `vzeR7m9jbWjAfD9EVlReyq`. Step 2 active. Payment method selector (Credit/Debit, Shop Pay, Apple Pay, Google Pay), card details form, billing address card, sticky order summary sidebar. Route: `app/routes/checkout.payment.tsx`. CheckoutProgress updated: completed steps now show checkmark (secondary teal) vs active step (primary green). |
| Cart Shipping | `327:887` | 1920w light | Captured 2026-02-23. File key: `vzeR7m9jbWjAfD9EVlReyq`. Step 3 active. Shipping address form (8 fields), shipping method selector (3 options), delivery preferences textarea. Stores data via `cartBuyerIdentityUpdate` + `cartAttributesUpdate`. Route: `app/routes/checkout.shipping.tsx`. |
| Cart Review | `327:1413` | 1920w light | Captured 2026-02-23. File key: `vzeR7m9jbWjAfD9EVlReyq`. Step 4 active. Review card (shipping address, shipping method, payment method, order items) with Edit links. "Place Order" → Shopify `checkoutUrl` with pre-filled buyer identity. Route: `app/routes/checkout.review.tsx`. |
| Cart Confirmation | `327:1721` | 1920w light | Captured 2026-02-23. File key: `vzeR7m9jbWjAfD9EVlReyq`. No progress bar. Success hero (checkmark icon, order #, Track Order + Continue Shopping), Order Details card (address, delivery estimate, items, totals), Create Account CTA for guests. Route: `app/routes/checkout.confirmation.tsx`. |
| Account Dashboard | `2:530` | — | Captured 2026-03-23. File key: `Q541sIDD20eXqQSSozFUw4`. Sidebar (280px) + main content layout. Welcome banner (gradient), 3 stat cards, recent orders, saved for later. Phase 1 complete; Phases 2–4 pending (sub-route integration, mobile, real data). Plan: `plans/ACCOUNT_DASHBOARD_REDESIGN_PLAN.md`. |
| Account Orders — Buy Again | `10:365` | — | Captured 2026-03-25. File key: `Q541sIDD20eXqQSSozFUw4`. 3-column product grid with BuyAgainCard (vertical layout). Add to Cart uses `#2699a6` (secondary teal). CartForm render-prop pattern. Data extracted from fulfilled orders via `extractBuyAgainProducts()`. Plan: `plans/ACCOUNT_ORDERS_BUY_AGAIN_PLAN.md`. |

## Design Token Mapping

| Figma Variable | CSS Variable | Tailwind Class |
|---------------|-------------|----------------|
| `--primary` (#2ac864) | `--color-primary` | `*-primary` |
| `--secondary` (#2699a6) | `--color-secondary` | `*-secondary` |
| `--default` (#666) | `--color-text-muted` | `*-text-muted` |
| `--alternate` (#fff) | `--color-background` | `bg-white` / `bg-background` |

## Known Pixel-Perfection Pitfalls

These are recurring issues discovered during audits. The process steps above are designed to catch them, but keep these in mind:

1. **Font mismatch**: Figma designs may use fonts not loaded in the app. Always verify `app/root.tsx` Google Fonts link.
2. **Wrong logo variant**: Colored logo vs white logo. Check Figma screenshot against the asset file visually.
3. **Missing borders**: Figma borders are easy to miss when they use transparent backgrounds. Check `border-*` classes against the design context.
4. **Approximate vs exact values**: `rounded-full` is NOT the same as `rounded-[27px]`. `h-20` (80px) is NOT the same as `h-[79px]`. When the spec says a specific pixel value, use the arbitrary Tailwind syntax.
5. **Icon size mismatch**: Our Icon component defaults to 24px. Figma icons have explicit container sizes that may differ. Always check the spec.
6. **Layout model translation**: Figma uses fixed widths. Responsive implementation requires documenting the translation in the spec so future work doesn't break it.

## Pattern Capture (workflow-agent)

After fixing bugs, resolving build/type errors, or completing features in Hydrogen, capture the fix:

```bash
# Automatic: verify + fix + capture
workflow verify --fix --learn

# Manual recording
workflow learn:record --type fix --name "..." --description "..." --category <category>

# Categories: lint | type-error | dependency | config | runtime | build | test

# View and sync
workflow learn:list
workflow sync --pull
workflow sync --push
```

Follow the full 6-phase workflow in `guidelines/PATTERN_ANALYSIS_WORKFLOW.md`:
DISCOVER → CATEGORIZE → EXTRACT → VALIDATE → STORE → REPORT

When you encounter workflow improvements or pain points, document them in `.workflow/improvements/YYYY-MM-DD-<id>.md` per `guidelines/SELF_IMPROVEMENT_MANDATE.md`.

## Context Checkpoint

**At session start:** Read `docs/ACTIVE_CONTEXT.md` (in the project root) to restore context from the previous session.

**At session end (or when asked to "save context" or "checkpoint"):**
1. Update `docs/ACTIVE_CONTEXT.md` using the schema in `docs/context-preservation/CONTEXT_SCHEMA.md`
2. Run `pnpm context:export` from the project root to sync the checkpoint to CoPilot

See `guidelines/CONTEXT_PRESERVATION.md` for the full workflow.
