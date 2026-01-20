# Agent Editing Instructions

> **Purpose**: This document defines the rules and patterns that AI agents (GitHub Copilot, Claude, etc.) must follow when making edits to this Shopify theme codebase.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Component-First Development](#component-first-development)
3. [Required File Checklists](#required-file-checklists)
4. [Liquid Coding Standards](#liquid-coding-standards)
5. [CSS Standards](#css-standards)
6. [JavaScript Standards](#javascript-standards)
7. [Pre-Commit Checklist](#pre-commit-checklist)
8. [Common Patterns](#common-patterns)

---

## Project Overview

**Hy-lee** is a Walmart-style e-commerce marketplace built as a **Shopify Liquid theme**.

### Technology Stack

| Layer      | Technology                      |
| ---------- | ------------------------------- |
| Platform   | Shopify                         |
| Templating | Liquid                          |
| Styling    | CSS (vanilla, BEM naming)       |
| JavaScript | Vanilla JS (no frameworks)      |
| Testing    | Vitest (unit), Playwright (E2E) |

### Key Directories

| Directory          | Purpose                             |
| ------------------ | ----------------------------------- |
| `theme/snippets/`  | **Component library** (SSOT for UI) |
| `theme/sections/`  | Page sections                       |
| `theme/templates/` | Page templates                      |
| `theme/assets/`    | CSS, JS, images                     |
| `theme/config/`    | Theme settings                      |
| `theme/locales/`   | Translations                        |
| `docs/`            | Documentation                       |
| `tests/`           | Unit and E2E tests                  |

---

## Component-First Development

### The Golden Rule

> **All UI elements MUST come from `theme/snippets/`.** Never inline component HTML in sections or templates.

### Before Building a Feature

```
┌─────────────────────────────────────────────────────────────┐
│  1. IDENTIFY - What UI components does this need?           │
├─────────────────────────────────────────────────────────────┤
│  2. CHECK - Do these components exist in snippets/?         │
├─────────────────────────────────────────────────────────────┤
│  3a. EXISTS → Use the existing component                    │
│  3b. MISSING → Create component FIRST, then use it          │
├─────────────────────────────────────────────────────────────┤
│  4. NEVER inline UI code that should be a component         │
└─────────────────────────────────────────────────────────────┘
```

### Component Usage

```liquid
{% comment %} ✅ CORRECT - Use render with component {% endcomment %}
{% render 'button',
  text: 'Add to Cart',
  variant: 'primary',
  size: 'lg',
  type: 'submit'
%}

{% render 'alert',
  type: 'success',
  message: 'Item added to cart',
  dismissible: true
%}

{% comment %} ❌ WRONG - Never inline component HTML {% endcomment %}
<button class="btn btn--primary btn--lg" type="submit">Add to Cart</button>

<div class="alert alert--success">
  <span>Item added to cart</span>
  <button class="alert__close">×</button>
</div>
```

---

## Required File Checklists

### Adding a New Component

| File                                | Action Required                      |
| ----------------------------------- | ------------------------------------ |
| `theme/snippets/{name}.liquid`      | Create component with parameter docs |
| `theme/assets/component-{name}.css` | Create component styles              |
| `theme/assets/component-scripts.js` | Add JS behavior (if interactive)     |
| `docs/COMPONENT_INVENTORY.md`       | Document the new component           |

### Modifying a Component

| File                                | Action Required              |
| ----------------------------------- | ---------------------------- |
| `theme/snippets/{name}.liquid`      | Update component             |
| `theme/assets/component-{name}.css` | Update styles if needed      |
| Usage locations                     | Verify all usages still work |

### Adding a New Section

| File                              | Action Required                   |
| --------------------------------- | --------------------------------- |
| `theme/sections/{name}.liquid`    | Create section with schema        |
| `theme/assets/section-{name}.css` | Create section styles (if needed) |
| Template file                     | Add section to template           |

### Adding a Customer Page

| File                                      | Action Required                 |
| ----------------------------------------- | ------------------------------- |
| `theme/templates/customers/{name}.liquid` | Create customer template        |
| `theme/sections/customer-{name}.liquid`   | Create main section             |
| `tests/e2e/customer-{name}.spec.ts`       | Add E2E test for critical paths |

### Modifying Styles

| File                               | Action Required               |
| ---------------------------------- | ----------------------------- |
| `theme/assets/theme-variables.css` | Use/add design tokens         |
| `theme/assets/component-*.css`     | Never hardcode colors/spacing |

---

## Liquid Coding Standards

### Component Template

Every snippet MUST have a documentation comment block:

```liquid
{% comment %}
  Button Component

  A versatile button component with multiple variants and sizes.

  Usage:
  {% render 'button',
    text: 'Click me',
    variant: 'primary',
    size: 'md',
    type: 'button',
    href: '/path',
    disabled: false,
    class: 'extra-class'
  %}

  Parameters:
  - text: string (required) - Button text content
  - variant: 'primary' | 'secondary' | 'ghost' | 'link' (default: 'primary')
  - size: 'sm' | 'md' | 'lg' (default: 'md')
  - type: 'button' | 'submit' | 'reset' (default: 'button')
  - href: string - If provided, renders as <a> instead of <button>
  - disabled: boolean (default: false)
  - class: string - Additional CSS classes
  - icon: string - Icon name to render
  - icon_position: 'left' | 'right' (default: 'left')
{% endcomment %}

{%- liquid
  assign variant_value = variant | default: 'primary'
  assign size_value = size | default: 'md'
  assign type_value = type | default: 'button'
  assign is_disabled = disabled | default: false
  assign extra_class = class | default: ''
  assign icon_pos = icon_position | default: 'left'
-%}

{%- capture button_classes -%}
  button button--{{ variant_value }} button--{{ size_value }}
  {%- if is_disabled %} button--disabled{% endif -%}
  {%- if extra_class != blank %} {{ extra_class }}{% endif -%}
{%- endcapture -%}

{% if href %}
  <a href="{{ href }}" class="{{ button_classes | strip }}">
    {%- if icon and icon_pos == 'left' %}{% render 'icon', name: icon %}{% endif -%}
    {{ text }}
    {%- if icon and icon_pos == 'right' %}{% render 'icon', name: icon %}{% endif -%}
  </a>
{% else %}
  <button type="{{ type_value }}" class="{{ button_classes | strip }}" {% if is_disabled %}disabled{% endif %}>
    {%- if icon and icon_pos == 'left' %}{% render 'icon', name: icon %}{% endif -%}
    {{ text }}
    {%- if icon and icon_pos == 'right' %}{% render 'icon', name: icon %}{% endif -%}
  </button>
{% endif %}
```

### Liquid Best Practices

```liquid
{% comment %} ✅ Use liquid tag for logic blocks {% endcomment %}
{%- liquid
  assign is_active = false
  if product.available
    assign is_active = true
  endif
-%}

{% comment %} ✅ Use hyphenated tags to control whitespace {% endcomment %}
{%- if condition -%}
  content
{%- endif -%}

{% comment %} ✅ Use capture for complex class strings {% endcomment %}
{%- capture classes -%}
  base-class
  {%- if modifier %} base-class--{{ modifier }}{% endif -%}
{%- endcapture -%}
<div class="{{ classes | strip }}">

{% comment %} ❌ Don't use inline logic for complex conditions {% endcomment %}
{% if product.available and product.price > 0 and customer and customer.tags contains 'wholesale' %}

{% comment %} ✅ Break complex conditions into variables {% endcomment %}
{%- liquid
  assign is_available = product.available
  assign has_price = product.price > 0
  assign is_wholesale = customer.tags contains 'wholesale'
  assign show_wholesale_price = is_available and has_price and is_wholesale
-%}
{% if show_wholesale_price %}
```

### Section Schema Pattern

```liquid
{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "section-name",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Default heading"
    },
    {
      "type": "select",
      "id": "layout",
      "label": "Layout",
      "options": [
        { "value": "grid", "label": "Grid" },
        { "value": "carousel", "label": "Carousel" }
      ],
      "default": "grid"
    }
  ],
  "blocks": [
    {
      "type": "item",
      "name": "Item",
      "settings": [
        {
          "type": "text",
          "id": "title",
          "label": "Title"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Section Name"
    }
  ]
}
{% endschema %}
```

---

## CSS Standards

### BEM Naming Convention

```css
/* Block */
.button {
}
.product-card {
}

/* Element (double underscore) */
.button__icon {
}
.button__text {
}
.product-card__image {
}
.product-card__title {
}

/* Modifier (double hyphen) */
.button--primary {
}
.button--lg {
}
.product-card--featured {
}
.product-card--sold-out {
}

/* Element + Modifier */
.button__icon--left {
}
.product-card__price--sale {
}
```

### Design Tokens

Always use CSS custom properties from `theme-variables.css`:

```css
/* ✅ CORRECT - Use design tokens */
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
}

/* ❌ WRONG - Hardcoded values */
.button {
  background-color: #0066cc;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
}
```

### Component CSS File Structure

```css
/* component-button.css */

/* ==========================================================================
   Button Component
   ========================================================================== */

/* Base styles
   ========================================================================== */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-base);
}

/* Variants
   ========================================================================== */
.button--primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.button--secondary {
  background-color: var(--color-secondary);
  color: var(--color-text);
}

/* Sizes
   ========================================================================== */
.button--sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.button--lg {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}

/* States
   ========================================================================== */
.button:hover {
  opacity: 0.9;
}

.button:disabled,
.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## JavaScript Standards

### Component Script Pattern

All component JavaScript goes in `component-scripts.js`:

```javascript
/* ==========================================================================
   Component Scripts
   ========================================================================== */

/**
 * Accordion Component
 * Handles expand/collapse behavior
 */
class Accordion {
  constructor(element) {
    this.element = element;
    this.triggers = element.querySelectorAll('[data-accordion-trigger]');
    this.init();
  }

  init() {
    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', this.handleClick.bind(this));
    });
  }

  handleClick(event) {
    const trigger = event.currentTarget;
    const content = trigger.nextElementSibling;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    trigger.setAttribute('aria-expanded', !isExpanded);
    content.hidden = isExpanded;
  }
}

/**
 * Modal Component
 * Handles open/close with focus trap
 */
class Modal {
  constructor(element) {
    this.element = element;
    this.triggers = document.querySelectorAll(`[data-modal-trigger="${element.id}"]`);
    this.closeButtons = element.querySelectorAll('[data-modal-close]');
    this.init();
  }

  init() {
    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => this.open());
    });

    this.closeButtons.forEach((button) => {
      button.addEventListener('click', () => this.close());
    });

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });
  }

  open() {
    this.element.classList.add('modal--open');
    document.body.classList.add('modal-open');
  }

  close() {
    this.element.classList.remove('modal--open');
    document.body.classList.remove('modal-open');
  }
}

/* ==========================================================================
   Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Accordions
  document.querySelectorAll('[data-accordion]').forEach((el) => new Accordion(el));

  // Initialize Modals
  document.querySelectorAll('[data-modal]').forEach((el) => new Modal(el));
});
```

### Data Attributes for JS Hooks

```liquid
{% comment %} Use data attributes for JS hooks, not classes {% endcomment %}

{% comment %} ✅ CORRECT {% endcomment %}
<div data-accordion>
  <button data-accordion-trigger aria-expanded="false">Toggle</button>
  <div data-accordion-content hidden>Content</div>
</div>

{% comment %} ❌ WRONG - Don't use classes for JS hooks {% endcomment %}
<div class="js-accordion">
  <button class="js-accordion-trigger">Toggle</button>
  <div class="js-accordion-content">Content</div>
</div>
```

---

## Pre-Commit Checklist

Before EVERY commit, verify:

### Mandatory Checks

```bash
# 1. Theme check (Liquid linting)
pnpm theme-check

# 2. Format check
pnpm format:check

# 3. Run tests (if applicable)
pnpm test
```

### Manual Verification

- [ ] **Component-first**: UI elements use snippets, not inline HTML
- [ ] **Design tokens**: No hardcoded colors, spacing, or sizes
- [ ] **BEM naming**: CSS classes follow BEM convention
- [ ] **Documentation**: New components have parameter docs
- [ ] **Accessibility**: Interactive elements have proper ARIA attributes
- [ ] **Responsive**: Changes work on mobile and desktop

### Commit Message Format

```bash
# Format
git commit -m "<type>(<scope>): <description>"

# Examples
git commit -m "feat(components): add tooltip snippet"
git commit -m "fix(customer): resolve order history loading"
git commit -m "refactor(sections): simplify hero section logic"
```

---

## Common Patterns

### Conditional Rendering

```liquid
{%- liquid
  assign show_element = false

  if condition_a and condition_b
    assign show_element = true
  endif
-%}

{% if show_element %}
  {% render 'component', param: value %}
{% endif %}
```

### Looping with Index

```liquid
{% for item in collection limit: 4 %}
  {% render 'product-card',
    product: item,
    index: forloop.index,
    is_first: forloop.first,
    is_last: forloop.last
  %}
{% endfor %}
```

### Default Values

```liquid
{%- liquid
  assign heading = section.settings.heading | default: 'Default Heading'
  assign columns = section.settings.columns | default: 3 | plus: 0
  assign show_badge = section.settings.show_badge | default: true
-%}
```

### Translation Strings

```liquid
{% comment %} Use translation keys for user-facing text {% endcomment %}
<h2>{{ 'sections.featured_products.heading' | t }}</h2>
<button>{{ 'general.add_to_cart' | t }}</button>
```

### Product Availability Check

```liquid
{%- liquid
  assign is_available = false

  if product.available
    if product.selected_or_first_available_variant.available
      assign is_available = true
    endif
  endif
-%}

{% if is_available %}
  {% render 'button', text: 'Add to Cart', variant: 'primary' %}
{% else %}
  {% render 'button', text: 'Sold Out', variant: 'secondary', disabled: true %}
{% endif %}
```

---

## Related Documents

- [SINGLE_SOURCE_OF_TRUTH.md](SINGLE_SOURCE_OF_TRUTH.md) - File locations
- [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) - Git workflow
- [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) - Component usage
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) - Testing requirements
- [docs/DEVELOPMENT_GUIDELINES.md](../docs/DEVELOPMENT_GUIDELINES.md) - Full dev guide
