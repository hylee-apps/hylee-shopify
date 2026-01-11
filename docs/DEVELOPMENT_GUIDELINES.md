# Development Guidelines

**Project:** Hy-lee Shopify Theme  
**Version:** 1.0.0  
**Last Updated:** January 10, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Single Source of Truth](#single-source-of-truth)
3. [Component Library](#component-library)
4. [Branching Strategy](#branching-strategy)
5. [Development Workflow](#development-workflow)
6. [Testing Requirements](#testing-requirements)
7. [Documentation Standards](#documentation-standards)
8. [Agent/AI Development Rules](#agentai-development-rules)
9. [Code Style & Conventions](#code-style--conventions)

---

## Overview

These guidelines establish consistent development practices for the Hy-lee Shopify Theme project. They are **project-specific** and apply regardless of which machine, workspace, or AI agent is being used.

### Core Principles

1. **Component-First Development** - All UI derives from the component library
2. **Single Source of Truth** - One authoritative location for each piece of functionality
3. **Documentation-Driven** - All architectural decisions are documented
4. **Test Coverage** - Components and features require appropriate test coverage
5. **Branch Isolation** - All work happens in feature branches

---

## Single Source of Truth

### Directory Structure

```
hylee-shopify/
├── docs/                          # 📚 All documentation (.md files)
│   ├── DEVELOPMENT_GUIDELINES.md  # This file - development rules
│   ├── COMPONENT_INVENTORY.md     # Component catalog and status
│   ├── IMPLEMENTATION_PLAN.md     # Feature roadmap and progress
│   ├── ARCHITECTURE.md            # System architecture decisions
│   ├── meeting_notes/             # Meeting transcripts/notes
│   └── screenshots/               # Visual references
│
├── theme/                         # 🎨 Shopify Theme (THE source of truth for UI)
│   ├── assets/                    # CSS, JS, images
│   │   ├── component-*.css        # Component styles (SSOT for styling)
│   │   ├── section-*.css          # Section-specific styles
│   │   ├── template-*.css         # Template-specific styles
│   │   ├── theme-variables.css    # Design tokens (SSOT for colors, spacing)
│   │   └── component-scripts.js   # Component JavaScript behaviors
│   │
│   ├── snippets/                  # 🧩 COMPONENT LIBRARY (SSOT for UI)
│   │   ├── button.liquid
│   │   ├── badge.liquid
│   │   └── ...
│   │
│   ├── sections/                  # Page sections
│   ├── templates/                 # Page templates
│   ├── layout/                    # Theme layouts
│   ├── config/                    # Theme settings
│   └── locales/                   # Translations
│
├── tests/                         # 🧪 Test files
│   ├── components/                # Component unit tests
│   └── e2e/                       # Playwright end-to-end tests
│
└── scripts/                       # 🔧 Build/utility scripts
```

### Source of Truth Matrix

| Concern | Location | File Pattern |
|---------|----------|--------------|
| **UI Components** | `theme/snippets/` | `*.liquid` |
| **Component Styles** | `theme/assets/` | `component-*.css` |
| **Design Tokens** | `theme/assets/` | `theme-variables.css` |
| **Component JS** | `theme/assets/` | `component-scripts.js` |
| **Page Sections** | `theme/sections/` | `*.liquid` |
| **Documentation** | `docs/` | `*.md` |
| **Tests** | `tests/` | `*.test.js`, `*.spec.ts` |

---

## Component Library

### Philosophy

> **The component library (`theme/snippets/`) is the ONLY source for UI elements.**

Every UI element MUST be:
1. Defined as a reusable snippet in `theme/snippets/`
2. Styled with a corresponding `component-*.css` file
3. Documented with usage examples in the snippet's comment block

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

### Component Template

```liquid
{% comment %}
  Component Name
  
  Brief description of what this component does.
  
  Usage:
  {% render 'component-name',
    param1: 'value',
    param2: true
  %}
  
  Parameters:
  - param1: string (required) - Description
  - param2: boolean (default: false) - Description
  - class: string - Additional CSS classes
  - id: string - Element ID
{% endcomment %}

{%- liquid
  assign param1_value = param1 | default: ''
  assign param2_value = param2 | default: false
  assign extra_class = class | default: ''
-%}

<div class="component-name {{ extra_class }}">
  {{ param1_value }}
</div>
```

---

## Branching Strategy

### Branch Naming Convention

```
{type}({scope}): {short-description}
```

**Types:**

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, dependencies |
| `docs` | Documentation only |
| `style` | Formatting (no logic changes) |
| `test` | Adding/updating tests |
| `refactor` | Code restructuring |

**Scopes:** `theme`, `components`, `sections`, `templates`, `docs`, `tests`, `config`

### Examples

```bash
feat(components): add-tooltip-component
feat(sections): create-mega-menu-dropdown
fix(components): button-hover-state-on-mobile
chore(theme): update-shopify-cli-version
docs(components): add-accordion-usage-examples
```

### Before Starting Work

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b "feat(components): add-tooltip-component"

# 3. Make changes, commit, push
git commit -m "feat(components): add tooltip component"
git push origin "feat(components): add-tooltip-component"
```

---

## Development Workflow

### Starting a New Feature

```
1. CREATE BRANCH
   └── git checkout -b "feat(scope): description"

2. IDENTIFY COMPONENTS
   └── List all UI components needed

3. CHECK COMPONENT LIBRARY
   └── Exists? → Use it | Missing? → Create it first

4. IMPLEMENT FEATURE
   └── Use only components from snippets/

5. WRITE TESTS
   └── Component tests + E2E tests

6. UPDATE DOCUMENTATION
   └── IMPLEMENTATION_PLAN.md, COMPONENT_INVENTORY.md

7. CREATE PULL REQUEST
```

### Code Review Checklist

- [ ] Uses existing components from `theme/snippets/`
- [ ] New components follow the template
- [ ] CSS added to `theme.liquid` if new
- [ ] Documentation updated
- [ ] Tests included
- [ ] No hardcoded values (use `theme-variables.css`)
- [ ] Responsive design implemented
- [ ] Accessibility attributes included

---

## Testing Requirements

### Test Structure

```
tests/
├── components/          # Component unit tests
│   ├── button.test.js
│   └── accordion.test.js
└── e2e/                 # Playwright E2E tests
    ├── homepage.spec.ts
    └── product-page.spec.ts
```

### When to Write Tests

| Change Type | Unit Test | E2E Test |
|-------------|-----------|----------|
| New component | ✅ Required | Optional |
| New section/page | Optional | ✅ Required |
| Bug fix | ✅ Regression | If user flow affected |

---

## Documentation Standards

### Required Documents

| Document | Purpose |
|----------|---------|
| `DEVELOPMENT_GUIDELINES.md` | Development rules (this file) |
| `COMPONENT_INVENTORY.md` | Component catalog |
| `IMPLEMENTATION_PLAN.md` | Feature roadmap |
| `ARCHITECTURE.md` | System design decisions |

### Agent Auto-Updates

Agents should automatically update:
- `COMPONENT_INVENTORY.md` when adding components
- `IMPLEMENTATION_PLAN.md` when completing tasks
- `ARCHITECTURE.md` for significant decisions

---

## Agent/AI Development Rules

### When Working with AI/Agents

These rules ensure consistent behavior regardless of agent:

1. **Read Context First**
   - `DEVELOPMENT_GUIDELINES.md`
   - `IMPLEMENTATION_PLAN.md`
   - `COMPONENT_INVENTORY.md`

2. **Component-First**
   - Check `theme/snippets/` before creating UI
   - Create missing components BEFORE using them

3. **Branch Always**
   - Create branch before ANY changes
   - Follow naming convention

4. **Document As You Go**
   - New component → Update `COMPONENT_INVENTORY.md`
   - Completed task → Update `IMPLEMENTATION_PLAN.md`
   - Architecture change → Update `ARCHITECTURE.md`

### Agent Prompt Template

```
I'm working on the Hy-lee Shopify Theme project.

Before making changes:
1. Read docs/DEVELOPMENT_GUIDELINES.md
2. Check docs/COMPONENT_INVENTORY.md for existing components
3. Create a feature branch: {type}({scope}): {description}
4. Use ONLY components from theme/snippets/
5. Create missing components first
6. Update documentation as you go
```

---

## Code Style & Conventions

### CSS Naming

```css
/* BEM-like: .component__element--modifier */
.pdp-gallery__thumbnail--active { }
```

### File Naming

```
Components:    {name}.liquid           → button.liquid
Component CSS: component-{name}.css    → component-button.css
Section CSS:   section-{name}.css      → section-header.css
Template CSS:  template-{name}.css     → template-product.css
```

---

## Quick Reference

### Commands

```bash
pnpm theme:dev          # Start dev server
pnpm theme-check        # Run linter
pnpm format             # Format code
pnpm theme:push         # Deploy to Shopify
pnpm test               # Run unit tests
pnpm test:e2e           # Run E2E tests
pnpm validate           # Run all validations
pnpm validate:structure # Check directory structure
```

### New Component Checklist

- [ ] `theme/snippets/{name}.liquid`
- [ ] `theme/assets/component-{name}.css`
- [ ] Add CSS to `theme/layout/theme.liquid`
- [ ] Add JS to `component-scripts.js` (if interactive)
- [ ] Update `docs/COMPONENT_INVENTORY.md`
- [ ] Create tests

---

*This document is the authoritative source for development practices.*
