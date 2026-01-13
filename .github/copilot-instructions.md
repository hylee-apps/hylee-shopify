# GitHub Copilot Instructions for Hy-lee Shopify Theme

## Project Context

This is a Shopify theme project using Liquid templating. It is NOT a React/TypeScript project.

## Core Principles

1. **Component-First Development** - All UI derives from the component library in `theme/snippets/`
2. **Single Source of Truth** - One authoritative location for each piece of functionality
3. **Documentation-Driven** - All architectural decisions are documented
4. **Test Coverage** - Components and features require appropriate test coverage
5. **Branch Isolation** - All work happens in feature branches

## Before Making Changes

1. Read `docs/DEVELOPMENT_GUIDELINES.md` for full development rules
2. Check `docs/COMPONENT_INVENTORY.md` for existing components
3. Check `docs/IMPLEMENTATION_PLAN.md` for current task status

## Directory Structure (Source of Truth)

| Concern              | Location          | File Pattern             |
| -------------------- | ----------------- | ------------------------ |
| **UI Components**    | `theme/snippets/` | `*.liquid`               |
| **Component Styles** | `theme/assets/`   | `component-*.css`        |
| **Design Tokens**    | `theme/assets/`   | `theme-variables.css`    |
| **Component JS**     | `theme/assets/`   | `component-scripts.js`   |
| **Page Sections**    | `theme/sections/` | `*.liquid`               |
| **Documentation**    | `docs/`           | `*.md`                   |
| **Tests**            | `tests/`          | `*.test.js`, `*.spec.ts` |

## Component Library Rules

1. **Always check `theme/snippets/` first** before creating UI elements
2. **Use existing components** - Don't duplicate functionality
3. **Create missing components first** - If a component doesn't exist, create it as a reusable snippet before using it
4. **Follow the component template** (see `docs/DEVELOPMENT_GUIDELINES.md`)

## When Creating a New Component

1. Create `theme/snippets/{name}.liquid`
2. Create `theme/assets/component-{name}.css`
3. Add CSS import to `theme/layout/theme.liquid`
4. Add JS to `component-scripts.js` (if interactive)
5. Update `docs/COMPONENT_INVENTORY.md`
6. Create tests in `tests/components/`

## Code Style

### CSS Naming (BEM)

```css
.component-name {
}
.component-name__element {
}
.component-name--modifier {
}
```

### File Naming

- Components: `{name}.liquid`
- Component CSS: `component-{name}.css`
- Section CSS: `section-{name}.css`
- Template CSS: `template-{name}.css`

### Design Tokens

Always use CSS custom properties from `theme-variables.css`:

```css
/* ✅ Good */
color: var(--color-primary);
padding: var(--spacing-md);

/* ❌ Bad */
color: #4a90a4;
padding: 16px;
```

## Branching Convention

Format: `{type}({scope}): {description}`

Types:

- `feat` - New feature
- `fix` - Bug fix
- `chore` - Maintenance
- `docs` - Documentation
- `style` - Formatting
- `test` - Tests
- `refactor` - Restructuring

## Documentation Updates

When completing work, update:

- `docs/COMPONENT_INVENTORY.md` - When adding components
- `docs/IMPLEMENTATION_PLAN.md` - When completing tasks
- `docs/ARCHITECTURE.md` - For significant architectural decisions

## Commands

```bash
pnpm theme:dev          # Start dev server
pnpm theme-check        # Run Shopify linter
pnpm format             # Format code
pnpm theme:push         # Deploy to Shopify
pnpm test               # Run unit tests
pnpm test:e2e           # Run E2E tests
pnpm validate:structure # Check directory structure
```

## MANDATORY: Accessibility & Responsive Design

**Every UI change MUST include:**

### Accessibility (A11y)

- Semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- ARIA attributes where needed (`aria-label`, `aria-expanded`, `aria-hidden`)
- Keyboard navigation support (focus states, tab order)
- Color contrast ratios (WCAG AA minimum: 4.5:1 for text)
- Screen reader friendly content (alt text, visually hidden labels)
- Focus-visible outlines for interactive elements

### Color Contrast Requirements (MANDATORY)

**All text and UI elements MUST be visible on their backgrounds:**

| Element Type                               | Minimum Contrast | Example Colors on White   |
| ------------------------------------------ | ---------------- | ------------------------- |
| Body text                                  | 4.5:1            | `#374151`, `#4b5563`      |
| Large text (18px+)                         | 3:1              | `#6b7280`                 |
| UI components (icons, borders, separators) | 3:1              | `#6b7280`, `#9ca3af`      |
| Placeholder text                           | 4.5:1            | `#6b7280`                 |
| Disabled elements                          | No requirement   | `#d1d5db` (grayed out OK) |

**Never use these colors for text/separators on white:**

- ❌ `#e5e7eb` (too light - 1.6:1 ratio)
- ❌ `#d1d5db` (too light - 2.1:1 ratio)
- ❌ `#cbd5e1` (too light - 1.9:1 ratio)
- ❌ `--color-border` for text elements

**Always use these safer alternatives:**

- ✅ `#6b7280` (gray-500, 5.0:1 ratio)
- ✅ `#9ca3af` (gray-400, 3.0:1 ratio - icons/separators only)
- ✅ `--color-text-muted` for secondary text

### Mobile-First Responsive Design

- Mobile breakpoint: `max-width: 767px`
- Tablet breakpoint: `768px - 1023px`
- Desktop breakpoint: `min-width: 1024px`
- Use `rem` units for scalable sizing
- Touch-friendly tap targets (minimum 44x44px)
- Responsive CSS variables where applicable (e.g., `--height-mobile`, `--height-desktop`)

### Example Pattern

```css
.component {
  --component-height: 3rem;
  --component-height-mobile: 2.5rem;
  min-height: var(--component-height);
}

@media (max-width: 767px) {
  .component {
    min-height: var(--component-height-mobile);
  }
}
```

## What NOT to Do

1. ❌ Don't create React/TypeScript components - this is a Liquid theme
2. ❌ Don't hardcode colors, spacing, or other design values
3. ❌ Don't create inline styles when a component CSS file should be used
4. ❌ Don't duplicate existing components from `theme/snippets/`
5. ❌ Don't skip documentation updates
6. ❌ Don't create UI without mobile/desktop responsive styles
7. ❌ Don't omit accessibility attributes (aria-\*, alt, labels)
8. ❌ Don't use `px` for font sizes - use `rem`
