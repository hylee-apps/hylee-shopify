# Branching Strategy

> **Purpose**: This document defines the Git branching strategy, naming conventions, PR requirements, and merge policies for the Hy-lee Shopify Theme.

---

## Table of Contents

1. [Branch Types](#branch-types)
2. [Branch Naming Conventions](#branch-naming-conventions)
3. [PR Title Format](#pr-title-format)
4. [Allowed Scopes](#allowed-scopes)
5. [Merge Requirements](#merge-requirements)
6. [Workflow](#workflow)

---

## Branch Types

| Branch Type  | Purpose                            | Base Branch | Merges To       |
| ------------ | ---------------------------------- | ----------- | --------------- |
| `main`       | Production-ready code              | -           | -               |
| `feature/*`  | New features                       | `main`      | `main`          |
| `bugfix/*`   | Non-urgent bug fixes               | `main`      | `main`          |
| `hotfix/*`   | Urgent production fixes            | `main`      | `main` (direct) |
| `chore/*`    | Maintenance tasks (deps, config)   | `main`      | `main`          |
| `refactor/*` | Code refactoring (no new features) | `main`      | `main`          |
| `docs/*`     | Documentation only                 | `main`      | `main`          |
| `test/*`     | Test additions/improvements        | `main`      | `main`          |

---

## Branch Naming Conventions

### Format

```
<type>/<scope>/<short-description>
```

### Rules

1. **Type**: Must be one of `feature`, `bugfix`, `hotfix`, `chore`, `refactor`, `docs`, `test`
2. **Scope**: Must be from the [allowed scopes list](#allowed-scopes)
3. **Description**: Lowercase, hyphen-separated, 2-5 words

### Examples

```bash
# Good branch names
feature/components/add-tooltip-snippet
feature/sections/create-mega-menu
feature/customer/add-order-history
bugfix/product/fix-image-loading
bugfix/cart/quantity-update-bug
hotfix/navigation/broken-mobile-menu
chore/config/update-theme-settings
refactor/components/simplify-button-variants
docs/components/add-accordion-usage
test/customer/add-orders-e2e

# Bad branch names
feature/add-new-feature          # Missing scope
FEATURE/components/add-tooltip   # Uppercase type
feature/product/AddImageZoom     # CamelCase description
fix/button-bug                   # Wrong type (use bugfix), missing scope
```

---

## PR Title Format

PR titles MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) format.

### Format

```
<type>(<scope>): <description>
```

### Rules

1. **Type**: One of: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `style`
2. **Scope**: Must be from the [allowed scopes list](#allowed-scopes)
3. **Description**: Lowercase, imperative mood, no period at end

### Type Mapping (Branch → PR Title)

| Branch Type  | PR Title Type |
| ------------ | ------------- |
| `feature/*`  | `feat`        |
| `bugfix/*`   | `fix`         |
| `hotfix/*`   | `fix`         |
| `chore/*`    | `chore`       |
| `refactor/*` | `refactor`    |
| `docs/*`     | `docs`        |
| `test/*`     | `test`        |

### Examples

```
# Good PR titles
feat(components): add tooltip snippet
feat(customer): implement order history page
fix(product): resolve image loading on mobile
fix(cart): correct quantity update behavior
refactor(navigation): simplify mega menu logic
chore(config): update theme settings schema
docs(components): add button usage examples
test(customer): add orders page e2e tests

# Bad PR titles
Added tooltip component                     # Missing type and scope
feat: add tooltip                           # Missing scope
feat(components): Add Tooltip Component     # Capitalized description
feat(components): add tooltip.              # Period at end
feature(components): add tooltip            # Wrong type (use feat)
```

---

## Allowed Scopes

These are the only valid scopes for branch names and PR titles:

| Scope        | Description                                     |
| ------------ | ----------------------------------------------- |
| `theme`      | Theme-wide changes, layout, configuration       |
| `components` | UI component library in `theme/snippets/`       |
| `sections`   | Page sections in `theme/sections/`              |
| `templates`  | Page templates in `theme/templates/`            |
| `customer`   | Customer account, orders, settings, returns     |
| `product`    | Product pages, PDP, product cards               |
| `collection` | Collection pages, product grid, filtering       |
| `cart`       | Cart functionality and checkout                 |
| `navigation` | Header, footer, menus, breadcrumbs              |
| `styles`     | CSS, design tokens, theme-variables.css         |
| `scripts`    | JavaScript, component-scripts.js, interactivity |
| `config`     | Theme settings, settings_data.json, locales     |
| `docs`       | Documentation, guidelines, planning             |
| `tests`      | Unit tests (Vitest) and E2E tests (Playwright)  |
| `ci`         | GitHub Actions, workflows, automation           |

### Adding New Scopes

If you need a new scope:

1. Propose in a PR or discussion
2. Add to `workflow.config.json`
3. Update this document
4. Regenerate copilot instructions: `pnpm workflow:generate-instructions`

---

## Merge Requirements

### Required for All PRs

- [ ] **PR title follows conventional commits format**
- [ ] **Theme check passes**: `pnpm theme-check`
- [ ] **Formatting passes**: `pnpm format:check`
- [ ] **Unit tests pass**: `pnpm test` (if applicable)
- [ ] **No broken Liquid syntax**

### Additional Requirements by Change Type

| Change Type  | Additional Requirements                       |
| ------------ | --------------------------------------------- |
| `components` | Component documented in snippet comment block |
| `sections`   | Section schema documented                     |
| `customer`   | E2E test for critical paths                   |
| `product`    | Visual testing on staging store               |
| `styles`     | Design tokens used (no hardcoded values)      |
| `scripts`    | No breaking changes to existing behaviors     |

### Review Requirements

| Change Size       | Review Requirement             |
| ----------------- | ------------------------------ |
| Small (1-50 loc)  | Self-review + automated checks |
| Medium (51-200)   | One reviewer                   |
| Large (201+)      | Two reviewers                  |
| Critical (config) | Team lead approval             |

---

## Workflow

### Feature Branch Workflow

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b "feature/components/add-tooltip-snippet"

# 3. Make changes
# ... edit files ...

# 4. Validate changes
pnpm theme-check
pnpm format:check
pnpm test

# 5. Commit with conventional message
git add .
git commit -m "feat(components): add tooltip snippet"

# 6. Push and create PR
git push origin "feature/components/add-tooltip-snippet"
```

### Hotfix Workflow

For urgent production issues:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b "hotfix/navigation/broken-mobile-menu"

# 2. Make minimal fix
# ... fix the issue ...

# 3. Validate
pnpm theme-check

# 4. Commit and push
git add .
git commit -m "fix(navigation): resolve broken mobile menu"
git push origin "hotfix/navigation/broken-mobile-menu"

# 5. Create PR with urgent label
# Request expedited review

# 6. After merge, push to production
pnpm theme:push
```

---

## Theme Deployment

### Development

```bash
# Start local development server
pnpm theme:dev
```

### Staging

Push to a development theme for testing:

```bash
# Push to staging theme
pnpm theme:push --theme <staging-theme-id>
```

### Production

After PR is merged to `main`:

```bash
# Pull latest main
git checkout main
git pull origin main

# Push to production theme
pnpm theme:push
```

---

## Quick Reference

### Branch Creation

```bash
git checkout -b <type>/<scope>/<description>
```

### PR Title

```
<type>(<scope>): <description>
```

### Scopes

`theme` | `components` | `sections` | `templates` | `customer` | `product` | `collection` | `cart` | `navigation` | `styles` | `scripts` | `config` | `docs` | `tests` | `ci`

### Types

| Type       | Use For                       |
| ---------- | ----------------------------- |
| `feat`     | New features                  |
| `fix`      | Bug fixes                     |
| `refactor` | Code refactoring              |
| `chore`    | Maintenance                   |
| `docs`     | Documentation                 |
| `test`     | Tests                         |
| `perf`     | Performance                   |
| `style`    | Formatting (no logic changes) |

---

## Related Documents

- [AGENT_EDITING_INSTRUCTIONS.md](AGENT_EDITING_INSTRUCTIONS.md) - Editing rules
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) - Testing requirements
- [SINGLE_SOURCE_OF_TRUTH.md](SINGLE_SOURCE_OF_TRUTH.md) - File locations
