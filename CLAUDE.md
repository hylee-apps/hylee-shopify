# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hy-lee** is a Shopify Hydrogen/Remix storefront (React + TypeScript + Tailwind v4). All storefront code lives in `hydrogen/`.

## Commands

```bash
# Development
pnpm dev                # Start Hydrogen dev server (http://localhost:3000)
pnpm build              # Production build
pnpm preview            # Preview production build

# Linting & Formatting
pnpm format             # Format TypeScript, CSS, JSON files
pnpm format:check       # Check formatting
pnpm lint               # ESLint

# Type Checking
pnpm typecheck          # TypeScript type checking (runs inside hydrogen/)

# Testing
pnpm test               # Run unit tests (Vitest)
pnpm test:watch         # Watch mode
pnpm test:e2e           # Run E2E tests (Playwright, requires dev server)
pnpm test:e2e:ui        # E2E with UI
```

## Architecture

### Directory Structure

```
hydrogen/
├── app/
│   ├── components/     # React components
│   │   ├── commerce/   # Product, cart, collection components
│   │   ├── layout/     # Header, Footer, navigation
│   │   ├── product/    # PDP-specific components
│   │   └── ui/         # Generic UI primitives (shadcn-based)
│   ├── routes/         # Remix routes (file-based routing)
│   ├── styles/         # app.css (Tailwind v4 @theme tokens)
│   ├── lib/            # Utilities, GraphQL fragments, API helpers
│   ├── locales/        # i18n JSON files (en, es, fr)
│   └── graphql/        # GraphQL operation files (.graphql)
├── public/             # Static assets
└── design-references/  # Figma spec captures per component
```

### Component-First Development

**Before creating any UI element:**

1. Check `hydrogen/app/components/` for existing components
2. Check `hydrogen/app/components/ui/` for shadcn primitives
3. If it exists, USE IT
4. If not, CREATE IT FIRST as a reusable component

### Design Tokens

ALWAYS use Tailwind tokens from `hydrogen/app/styles/app.css` `@theme` block:

```tsx
// Correct — uses design tokens
<div className="bg-primary text-white p-4 rounded-lg">

// Wrong — never hardcode
<div style={{ backgroundColor: '#2ac864', padding: '16px' }}>
```

### CSS Approach

- Tailwind v4 utility classes in JSX
- `@apply` sparingly in component CSS when needed
- No inline styles
- No hardcoded hex colors or pixel values outside `app.css`

## Branching & Commits

### Branch Format

```
<type>/<scope>/<short-description>
```

**Types:** `feature`, `bugfix`, `hotfix`, `chore`, `refactor`, `docs`, `test`

**Scopes:** `hydrogen`, `components`, `routes`, `styles`, `customer`, `checkout`, `header`, `footer`, `product`, `cart`, `infra`, `testing`, `configuration`, `documentation`, `locales`

### Commit Format

```
<type>(<scope>): <description>
```

**Examples:**

- `feat(components): add hero banner section`
- `fix(cart): resolve quantity update issue`
- `chore(styles): update design token mapping`

## Guidelines Reference

Comprehensive guidelines are in `/guidelines/`:

- `AGENT_EDITING_INSTRUCTIONS.md` - Editing rules, pre-commit checklist, implementation plans
- `BRANCHING_STRATEGY.md` - Git workflow, PR requirements, allowed scopes
- `TESTING_STRATEGY.md` - Testing patterns, Vitest/Playwright usage
- `COMPONENT_LIBRARY.md` - UI components, design tokens, feature flags
- `SINGLE_SOURCE_OF_TRUTH.md` - Canonical file locations
- `LIBRARY_INVENTORY.md` - Approved dependencies
- `DEPLOYMENT_STRATEGY.md` - Deployment workflow (Oxygen)
- `PATTERN_ANALYSIS_WORKFLOW.md` - Pattern capture for workflow improvements
- `SELF_IMPROVEMENT_MANDATE.md` - Continuous improvement tracking
- `ACCESSIBILITY_STANDARDS.md` - WCAG 2.1 Level AA compliance rules

## Key Rules

1. **React + TypeScript only** — all UI is Hydrogen/Remix components
2. **No inline styles** — use Tailwind utility classes
3. **No hardcoded colors/spacing** — use design tokens from `app.css`
4. **Check components first** — reuse before creating
5. **Update documentation** — when completing work:
   - New component: Update `docs/COMPONENT_INVENTORY.md`
   - Completed task: Update `docs/IMPLEMENTATION_PLAN.md`
   - Architecture decision: Update `docs/ARCHITECTURE.md`

## Pre-Commit Checklist (MANDATORY)

**ALL checks below MUST pass before committing. Do NOT commit if any check fails.**

```bash
pnpm format              # 1. Format code (auto-fix)
pnpm format:check        # 2. Verify formatting passes
pnpm typecheck           # 3. TypeScript type checking — MUST PASS
pnpm build               # 4. Production build — MUST PASS (catches SSR errors)
pnpm test                # 5. Run unit tests — MUST PASS
```

### Rules

- **Never skip checks** — even if "it looks fine", run them all
- **Fix errors before committing** — do not commit known failures
- **Re-run after fixes** — always verify the fix actually works
- **Build catches what typecheck misses** — always run both
- **Do not push known-broken code** — if CI will fail, fix it locally first

## Workflow Agent & Agentic Coding

This project uses `workflow-agent-cli` for standardized agentic workflows. Configuration is in `workflow.config.json`.

### Core Commands

```bash
pnpm workflow       # Run workflow agent
```

### Pattern Capture (MANDATORY after meaningful fixes)

After fixing bugs, resolving build issues, or completing features, capture the fix as a reusable pattern:

```bash
# Automatic: verify + fix + capture in one step
workflow verify --fix --learn

# Manual: record a specific pattern
workflow learn:record --type fix --name "..." --description "..." --category <lint|type-error|dependency|config|runtime|build|test>

# View captured patterns
workflow learn:list

# Sync with community registry
workflow sync --pull     # Pull latest patterns
workflow sync --push     # Share your patterns
```

### Pattern Analysis Workflow

Follow the 6-phase cycle from `guidelines/PATTERN_ANALYSIS_WORKFLOW.md`:

1. **DISCOVER** — Review recent changes, identify fixes worth capturing
2. **CATEGORIZE** — Classify as fix/blueprint, assign category and tags
3. **EXTRACT** — Build structured pattern with trigger + solution
4. **VALIDATE** — Check quality, uniqueness, anonymization
5. **STORE** — Use CLI or API to persist pattern
6. **REPORT** — Summarize what was captured

### Self-Improvement Tracking

When you discover workflow issues, pain points, or improvements:

1. Create `.workflow/improvements/YYYY-MM-DD-<id>.md` using the template in `guidelines/SELF_IMPROVEMENT_MANDATE.md`
2. Categorize: `validation` | `scopes` | `documentation` | `performance` | `security` | `ux`
3. Submit to community: `workflow suggest "<description>"`

## Context Checkpoint

**At session start:** Read `docs/ACTIVE_CONTEXT.md` to restore context from the previous session.

**At session end (or when asked to "save context" or "checkpoint"):**
1. Update `docs/ACTIVE_CONTEXT.md` using the schema in `docs/context-preservation/CONTEXT_SCHEMA.md`
2. Run `pnpm context:export` to sync the updated checkpoint to CoPilot

See `guidelines/CONTEXT_PRESERVATION.md` for the full workflow.
