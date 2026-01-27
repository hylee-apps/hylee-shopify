# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Shopify theme project** using Liquid templating for Hy-lee (a Walmart-style e-commerce marketplace). This is NOT a React/TypeScript project.

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

## Key Rules

1. **No React/TypeScript** - This is a Liquid theme project
2. **No inline styles** - Use CSS files with design tokens
3. **No hardcoded colors/spacing** - Use CSS custom properties
4. **Check snippets first** - Reuse existing components
5. **Update documentation** - When completing work:
   - New component: Update `docs/COMPONENT_INVENTORY.md`
   - Completed task: Update `docs/IMPLEMENTATION_PLAN.md`
   - Architecture decision: Update `docs/ARCHITECTURE.md`

## Pre-Commit Checklist

Before committing, run:

```bash
pnpm format         # Format code
pnpm theme-check    # Lint Shopify theme
pnpm test           # Run tests
pnpm validate       # Full validation
```

## Workflow Agent

This project uses `workflow-agent-cli` for standardized workflows. Configuration is in `workflow.config.json`.

```bash
pnpm workflow       # Run workflow agent
pnpm verify         # Verify changes
pnpm verify:fix     # Auto-fix issues
```
