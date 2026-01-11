# Architecture

**Project:** Hy-lee Shopify Theme  
**Last Updated:** January 10, 2026

---

## System Overview

Hy-lee is a Walmart-style e-commerce marketplace built as a Shopify theme. It uses Shopify's Liquid templating with a custom component library.

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Platform** | Shopify |
| **Templating** | Liquid |
| **Styling** | CSS (vanilla, BEM naming) |
| **JavaScript** | Vanilla JS (no frameworks) |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **CI/CD** | GitHub Actions |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Shopify Platform                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Layout    │  │  Templates  │  │      Sections       │  │
│  │ theme.liquid│  │ *.json      │  │      *.liquid       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┴─────────────────────┘             │
│                          │                                   │
│                  ┌───────▼───────┐                           │
│                  │   Snippets    │  ← Component Library      │
│                  │   *.liquid    │                           │
│                  └───────┬───────┘                           │
│                          │                                   │
│         ┌────────────────┼────────────────┐                  │
│         │                │                │                  │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐          │
│  │    CSS      │  │     JS      │  │   Images    │          │
│  │ component-* │  │ component-  │  │   *.svg     │          │
│  │ section-*   │  │ scripts.js  │  │   *.png     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
hylee-shopify/
├── .github/              # GitHub configs
│   ├── workflows/        # CI/CD workflows
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                 # Documentation (SSOT)
├── scripts/              # Build/utility scripts
├── tests/                # Test files
│   ├── components/       # Unit tests
│   └── e2e/              # E2E tests
├── theme/                # Shopify theme
│   ├── assets/           # CSS, JS, images
│   ├── config/           # Theme settings
│   ├── layout/           # Layouts
│   ├── locales/          # Translations
│   ├── sections/         # Sections
│   ├── snippets/         # Components (SSOT)
│   └── templates/        # Templates
├── package.json
├── playwright.config.ts
├── vitest.config.ts
└── README.md
```

### Allowed Root Files

Only these files are allowed at project root:
- `.eslintrc.json` - ESLint config
- `.gitignore` - Git ignore
- `.prettierrc.json` - Prettier config
- `.shopify-cli.yml` - Shopify CLI config
- `.shopifyignore` - Shopify ignore
- `.theme-check.yml` - Theme check config
- `package.json` - Dependencies
- `pnpm-lock.yaml` - Lock file
- `playwright.config.ts` - E2E config
- `vitest.config.ts` - Unit test config
- `README.md` - Project readme

---

## Design Decisions (ADRs)

### ADR-001: Component Library in Snippets

**Date:** January 2026  
**Status:** Accepted

#### Context
Need a consistent, reusable UI component system for Shopify theme.

#### Decision
All UI components live as Liquid snippets in `theme/snippets/`. Each component has:
- A `.liquid` file with documentation
- A corresponding `component-*.css` file
- JavaScript in `component-scripts.js` if interactive

#### Consequences
- ✅ Single source of truth for UI
- ✅ Easy to maintain and update
- ✅ Consistent across all pages
- ❌ Requires discipline to use snippets vs inline code

---

### ADR-002: Vanilla JavaScript Only

**Date:** January 2026  
**Status:** Accepted

#### Context
Need interactive behaviors without heavy framework overhead.

#### Decision
Use vanilla JavaScript only. No React, Vue, or other frameworks in the theme.

#### Consequences
- ✅ Faster page loads
- ✅ No build step for JS
- ✅ Simpler debugging
- ❌ More verbose code for complex interactions

---

### ADR-003: BEM-like CSS Naming

**Date:** January 2026  
**Status:** Accepted

#### Context
Need consistent CSS class naming convention.

#### Decision
Use BEM-like naming: `.component__element--modifier`

Examples:
- `.pdp-gallery__thumbnail--active`
- `.btn--primary`
- `.card__header`

#### Consequences
- ✅ Self-documenting class names
- ✅ Avoids specificity issues
- ✅ Easy to understand component structure

---

### ADR-004: CSS Custom Properties for Design Tokens

**Date:** January 2026  
**Status:** Accepted

#### Context
Need centralized design token management.

#### Decision
All design tokens (colors, spacing, typography) defined as CSS custom properties in `theme-variables.css`.

```css
:root {
  --color-primary: #0071dc;
  --color-text: #0f172a;
  --spacing-md: 1rem;
}
```

#### Consequences
- ✅ Single source for design values
- ✅ Easy theme customization
- ✅ Runtime theming possible
- ❌ IE11 not supported (acceptable)

---

## Adding New ADRs

When making significant architectural decisions, add a new ADR:

```markdown
### ADR-XXX: Title

**Date:** {date}  
**Status:** Proposed | Accepted | Deprecated | Superseded

#### Context
What is the issue motivating this decision?

#### Decision
What change are we making?

#### Consequences
What becomes easier or harder?
```
