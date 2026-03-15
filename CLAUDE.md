# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **dual-stack Shopify project** for Hy-lee (a Walmart-style e-commerce marketplace):

- `theme/` — Shopify Liquid theme (CSS + Liquid templating)
- `hydrogen/` — Hydrogen/Remix storefront (React + TypeScript + Tailwind v4)

## Commands

```bash
# Development
pnpm theme:dev          # Start dev server (syncs with Shopify store)
pnpm theme:push         # Deploy to Shopify
pnpm theme:pull         # Pull theme from Shopify

# Linting & Formatting
pnpm theme-check        # Run Shopify theme linter
pnpm format             # Format Liquid, CSS, JSON files
pnpm format:check       # Check formatting
pnpm check-tokens       # Validate design token usage

# Testing
pnpm test               # Run unit tests (Vitest)
pnpm test:watch         # Watch mode
pnpm test:e2e           # Run E2E tests (Playwright)
pnpm test:e2e:ui        # E2E with UI

# Validation
pnpm validate           # Run all checks (theme-check + structure + tests)
pnpm validate:structure # Check directory structure
pnpm verify             # Run workflow-agent verification
```

## Architecture

### Directory Structure

```
theme/
├── layout/       # Theme layouts (theme.liquid)
├── templates/    # JSON templates referencing sections
│   └── customers/  # Customer account templates
├── sections/     # Reusable sections with schemas
├── snippets/     # Liquid partials ({% render 'name' %})
├── assets/       # CSS, JS, images
├── config/       # Theme settings (settings_schema.json)
└── locales/      # Translation files
```

### Component-First Development

**Before creating any UI element:**

1. Check `theme/snippets/` for existing components
2. If it exists, USE IT
3. If not, CREATE IT FIRST as a reusable snippet

### File Naming

- Components: `{name}.liquid` in `theme/snippets/`
- Component CSS: `component-{name}.css` in `theme/assets/`
- Section CSS: `section-{name}.css`
- Template CSS: `template-{name}.css`

### Design Tokens

ALWAYS use CSS custom properties from `theme-variables.css`:

```css
/* Correct */
color: var(--color-primary);
padding: var(--spacing-md);
font-size: var(--font-size-base);

/* Wrong - never hardcode */
color: #4a90a4;
padding: 16px;
```

### CSS Naming (BEM)

```css
.component-name {
}
.component-name__element {
}
.component-name--modifier {
}
```

## Branching & Commits

### Branch Format

```
<type>/<scope>/<short-description>
```

**Types:** `feature`, `bugfix`, `hotfix`, `chore`, `refactor`, `docs`, `test`

**Scopes:** `theme`, `components`, `sections`, `templates`, `assets`, `customer`, `checkout`, `header`, `footer`, `product`, `cart`, `testing`, `configuration`, `documentation`, `locales`, `snippets`

### Commit Format

```
<type>(<scope>): <description>
```

**Examples:**

- `feat(sections): add hero banner section`
- `fix(cart): resolve quantity update issue`
- `chore(assets): optimize image loading`

## Guidelines Reference

Comprehensive guidelines are in `/guidelines/`:

- `AGENT_EDITING_INSTRUCTIONS.md` - Editing rules, pre-commit checklist, implementation plans
- `BRANCHING_STRATEGY.md` - Git workflow, PR requirements, allowed scopes
- `TESTING_STRATEGY.md` - Testing patterns, Vitest/Playwright usage
- `COMPONENT_LIBRARY.md` - UI components, design tokens, feature flags
- `SINGLE_SOURCE_OF_TRUTH.md` - Canonical file locations
- `LIBRARY_INVENTORY.md` - Approved dependencies
- `DEPLOYMENT_STRATEGY.md` - Deployment workflow
- `PATTERN_ANALYSIS_WORKFLOW.md` - Pattern capture for workflow improvements
- `SELF_IMPROVEMENT_MANDATE.md` - Continuous improvement tracking
- `SCOPE_CREATION_WORKFLOW.md` - Creating custom workflow scopes
- `PROJECT_TEMPLATE_README.md` - Using guidelines as templates
- `BLUEPRINT_CREATION_GUIDE.md` - Creating reusable project blueprints
- `ACCESSIBILITY_STANDARDS.md` - WCAG 2.1 Level AA compliance rules

## Key Rules

1. **No React/TypeScript** - This is a Liquid theme project
2. **No inline styles** - Use CSS files with design tokens
3. **No hardcoded colors/spacing** - Use CSS custom properties
4. **Check snippets first** - Reuse existing components
5. **Update documentation** - When completing work:
   - New component: Update `docs/COMPONENT_INVENTORY.md`
   - Completed task: Update `docs/IMPLEMENTATION_PLAN.md`
   - Architecture decision: Update `docs/ARCHITECTURE.md`

## Pre-Commit Checklist (MANDATORY)

**ALL checks below MUST pass before committing. Do NOT commit if any check fails. Fix errors first, re-run, and only commit once everything is green.**

### Hydrogen (when hydrogen/ files are changed)

```bash
pnpm format              # 1. Format code (auto-fix)
pnpm format:check        # 2. Verify formatting passes
pnpm typecheck           # 3. TypeScript type checking — MUST PASS
pnpm build               # 4. Production build — MUST PASS (catches SSR errors)
pnpm test                # 5. Run unit tests — MUST PASS
```

### Theme (when theme/ files are changed)

```bash
pnpm format              # 1. Format code (auto-fix)
pnpm format:check        # 2. Verify formatting passes
pnpm theme-check         # 3. Shopify theme linter — MUST PASS
pnpm test                # 4. Run unit tests — MUST PASS
pnpm validate            # 5. Full validation — MUST PASS
```

### Rules

- **Never skip checks** — even if "it looks fine", run them all
- **Fix errors before committing** — do not commit known failures
- **Re-run after fixes** — always verify the fix actually works
- **Build catches what typecheck misses** — always run both for Hydrogen changes
- **Do not push known-broken code** — if CI will fail, fix it locally first

## Workflow Agent & Agentic Coding

This project uses `workflow-agent-cli` for standardized agentic workflows. Configuration is in `workflow.config.json`.

### Core Commands

```bash
pnpm workflow       # Run workflow agent
pnpm verify         # Verify changes
pnpm verify:fix     # Auto-fix issues
```

### Pattern Capture (MANDATORY after meaningful fixes)

After fixing bugs, resolving build issues, or completing features, capture the fix as a reusable pattern:

```bash
# Automatic: verify + fix + capture in one step
workflow verify --fix --learn

# Manual: record a specific pattern
workflow learn:record --type fix --name "..." --description "..." --category <lint|type-error|dependency|config|runtime|build|test>

# Record a project blueprint (for project scaffolding patterns)
workflow learn:record --type blueprint --name "..." --description "..." --framework <framework>

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
