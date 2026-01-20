# Single Source of Truth

> **Purpose**: This document defines the canonical locations for all files, components, and architectural patterns in the Hy-lee Shopify Theme. When making changes, always reference the correct source files to maintain consistency.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Library](#component-library)
3. [Styling System](#styling-system)
4. [Page Architecture](#page-architecture)
5. [Configuration](#configuration)
6. [Testing Infrastructure](#testing-infrastructure)
7. [Documentation](#documentation)

---

## Project Structure

```
hylee-shopify/
├── .github/              # GitHub configs, workflows, PR templates
├── docs/                 # 📚 All documentation (SSOT for docs)
├── guidelines/           # Development rules and patterns
├── scripts/              # Build/utility scripts
├── tests/                # Test files
│   ├── components/       # Vitest unit tests
│   └── e2e/              # Playwright E2E tests
└── theme/                # 🎨 Shopify Theme (SSOT for all UI)
    ├── assets/           # CSS, JS, images
    ├── config/           # Theme settings
    ├── layout/           # Theme layouts
    ├── locales/          # Translations
    ├── sections/         # Page sections
    ├── snippets/         # Component library
    └── templates/        # Page templates
```

---

## Component Library

> **The component library (`theme/snippets/`) is the SINGLE SOURCE OF TRUTH for all UI elements.**

### Snippet Files (Components)

| File                      | Purpose                               | CSS File                         |
| ------------------------- | ------------------------------------- | -------------------------------- |
| `accordion.liquid`        | Expandable/collapsible content        | `component-accordion.css`        |
| `account-nav-card.liquid` | Customer account navigation           | `component-account-nav-card.css` |
| `address-card.liquid`     | Display/edit customer addresses       | -                                |
| `alert.liquid`            | Alert messages (info, warning, error) | `component-alert.css`            |
| `badge.liquid`            | Status badges, labels                 | `component-badge.css`            |
| `breadcrumb.liquid`       | Navigation breadcrumbs                | `component-breadcrumb.css`       |
| `button.liquid`           | All button variants                   | `component-button.css`           |
| `card.liquid`             | Content card containers               | `component-card.css`             |
| `checkbox.liquid`         | Checkbox form input                   | `component-checkbox.css`         |
| `form-item.liquid`        | Form field wrapper                    | `component-form.css`             |
| `helper-text.liquid`      | Form helper/error text                | `component-helper-text.css`      |
| `icon.liquid`             | SVG icon system                       | `component-icon.css`             |
| `input.liquid`            | Text input fields                     | `component-input.css`            |
| `label.liquid`            | Form labels                           | `component-label.css`            |
| `link.liquid`             | Styled links                          | `component-link.css`             |
| `modal.liquid`            | Modal dialogs                         | `component-modal.css`            |
| `pagination.liquid`       | Page navigation                       | `component-pagination.css`       |
| `pill.liquid`             | Tag/filter pills                      | `component-pill.css`             |
| `product-card.liquid`     | Product listing cards                 | `component-product-card.css`     |
| `product-card-b2b.liquid` | B2B product cards                     | `component-product-card.css`     |
| `radio-group.liquid`      | Radio button groups                   | `component-radio-group.css`      |
| `select.liquid`           | Dropdown selects                      | `component-select.css`           |
| `selection-card.liquid`   | Selectable cards                      | -                                |
| `skeleton.liquid`         | Loading skeletons                     | `component-skeleton.css`         |
| `tabs.liquid`             | Tab navigation                        | -                                |
| `textarea.liquid`         | Multi-line text input                 | -                                |

### Usage Pattern

```liquid
{% comment %} ✅ CORRECT - Use component from snippets {% endcomment %}
{% render 'button',
  text: 'Add to Cart',
  variant: 'primary',
  size: 'lg'
%}

{% comment %} ❌ WRONG - Never inline component HTML {% endcomment %}
<button class="btn btn--primary btn--lg">Add to Cart</button>
```

---

## Styling System

### Design Tokens

| File                               | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `theme/assets/base.css`            | CSS reset and base styles              |
| `theme/assets/theme-variables.css` | Design tokens (colors, spacing, fonts) |

### Component Styles

All component styles follow the pattern: `component-{name}.css`

| Style File                   | Component                          |
| ---------------------------- | ---------------------------------- |
| `component-button.css`       | Button variants and states         |
| `component-card.css`         | Card layouts                       |
| `component-form.css`         | Form layouts and validation states |
| `component-input.css`        | Input field styles                 |
| `component-product-card.css` | Product card layout                |
| ... (see `theme/assets/`)    | All `component-*.css` files        |

### Naming Convention (BEM)

```css
/* Block */
.button {
}

/* Block + Modifier */
.button--primary {
}
.button--lg {
}

/* Block + Element */
.button__icon {
}
.button__text {
}

/* Block + Element + Modifier */
.button__icon--left {
}
```

---

## Page Architecture

### Layout → Template → Section → Snippet

```
┌─────────────────────────────────────────────────────────────┐
│  layout/theme.liquid                                         │
│  ├── {% section 'header' %}                                 │
│  ├── {{ content_for_layout }}  ← Templates inject here      │
│  └── {% section 'footer' %}                                 │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  templates/product.json  (or *.liquid)                       │
│  └── References sections to render                          │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  sections/main-product.liquid                               │
│  └── {% render 'button', text: 'Add to Cart' %}            │
│  └── {% render 'product-card', product: related %}         │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  snippets/button.liquid, snippets/product-card.liquid       │
│  └── Pure UI components with parameters                     │
└─────────────────────────────────────────────────────────────┘
```

### Templates

| Template                    | Purpose                             |
| --------------------------- | ----------------------------------- |
| `templates/index.json`      | Homepage                            |
| `templates/product.liquid`  | Product detail page (PDP)           |
| `templates/collection.json` | Collection/category listing         |
| `templates/cart.liquid`     | Shopping cart                       |
| `templates/page.*.liquid`   | Custom pages (track-order, returns) |
| `templates/customers/`      | Customer account pages              |

### Key Sections

| Section                           | Purpose                    |
| --------------------------------- | -------------------------- |
| `sections/header.liquid`          | Site header and navigation |
| `sections/footer.liquid`          | Site footer                |
| `sections/hero.liquid`            | Hero banners               |
| `sections/main-product.liquid`    | Product detail section     |
| `sections/main-collection.liquid` | Collection product grid    |
| `sections/customer-*.liquid`      | Customer account sections  |

---

## Configuration

### Theme Settings

| File                                | Purpose                          |
| ----------------------------------- | -------------------------------- |
| `theme/config/settings_schema.json` | Theme settings schema definition |
| `theme/config/settings_data.json`   | Current theme settings values    |

### Locales

| File                            | Purpose                        |
| ------------------------------- | ------------------------------ |
| `theme/locales/en.default.json` | English translations (default) |
| `theme/locales/*.json`          | Other language translations    |

### Shopify CLI

| File               | Purpose                             |
| ------------------ | ----------------------------------- |
| `.env.local`       | Local environment (store, password) |
| `.shopifyignore`   | Files to exclude from theme push    |
| `.theme-check.yml` | Theme linting configuration         |

---

## Testing Infrastructure

### Unit Testing (Vitest)

| File/Directory      | Purpose               |
| ------------------- | --------------------- |
| `vitest.config.ts`  | Vitest configuration  |
| `tests/components/` | Component unit tests  |
| `tests/README.md`   | Testing documentation |

### E2E Testing (Playwright)

| File/Directory                 | Purpose                       |
| ------------------------------ | ----------------------------- |
| `playwright.config.ts`         | Playwright configuration      |
| `tests/e2e/`                   | E2E test specs                |
| `tests/e2e/auth.setup.ts`      | Customer authentication setup |
| `tests/e2e/customer-*.spec.ts` | Customer journey tests        |

### Running Tests

```bash
# Unit tests
pnpm test                # Run once
pnpm test:watch          # Watch mode
pnpm test:coverage       # With coverage

# E2E tests
pnpm test:e2e            # Run all E2E
pnpm test:e2e:ui         # With UI
```

---

## Documentation

### Documentation Files

| File                             | Purpose                           |
| -------------------------------- | --------------------------------- |
| `docs/ARCHITECTURE.md`           | System architecture overview      |
| `docs/DEVELOPMENT_GUIDELINES.md` | Development rules and conventions |
| `docs/COMPONENT_INVENTORY.md`    | Component catalog and migration   |
| `docs/IMPLEMENTATION_PLAN.md`    | Feature roadmap and progress      |
| `docs/meeting_notes/`            | Meeting transcripts               |
| `docs/screenshots/`              | Visual references                 |

### Guidelines

| File                                       | Purpose                  |
| ------------------------------------------ | ------------------------ |
| `guidelines/AGENT_EDITING_INSTRUCTIONS.md` | AI agent editing rules   |
| `guidelines/BRANCHING_STRATEGY.md`         | Git branching rules      |
| `guidelines/COMPONENT_LIBRARY.md`          | Component usage patterns |
| `guidelines/SINGLE_SOURCE_OF_TRUTH.md`     | This file                |
| `guidelines/TESTING_STRATEGY.md`           | Testing requirements     |

---

## Quick Reference: File Locations

| Need This?           | Look Here                           |
| -------------------- | ----------------------------------- |
| UI Component         | `theme/snippets/{component}.liquid` |
| Component CSS        | `theme/assets/component-{name}.css` |
| Design tokens        | `theme/assets/theme-variables.css`  |
| Page section         | `theme/sections/{section}.liquid`   |
| Page template        | `theme/templates/{template}.liquid` |
| Theme settings       | `theme/config/settings_*.json`      |
| Translations         | `theme/locales/*.json`              |
| JavaScript behaviors | `theme/assets/component-scripts.js` |
| Documentation        | `docs/*.md`                         |
| Unit tests           | `tests/components/*.test.js`        |
| E2E tests            | `tests/e2e/*.spec.ts`               |

---

## Related Documents

- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
- [DEVELOPMENT_GUIDELINES.md](../docs/DEVELOPMENT_GUIDELINES.md) - Development rules
- [COMPONENT_INVENTORY.md](../docs/COMPONENT_INVENTORY.md) - Component catalog
- [AGENT_EDITING_INSTRUCTIONS.md](AGENT_EDITING_INSTRUCTIONS.md) - AI agent rules
