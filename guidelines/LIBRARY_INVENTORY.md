# Library Inventory

> **Purpose**: This document tracks all dependencies and tools used in the Hy-lee Shopify Theme project.

---

## Table of Contents

1. [Core Platform](#core-platform)
2. [Development Tools](#development-tools)
3. [Testing](#testing)
4. [Code Quality](#code-quality)
5. [Workflow Automation](#workflow-automation)

---

## Core Platform

### Shopify

| Property      | Value                           |
| ------------- | ------------------------------- |
| Platform      | Shopify                         |
| Templating    | Liquid                          |
| Documentation | https://shopify.dev/docs/themes |

**Key Shopify Features Used:**

- Liquid templating language
- Section and block architecture
- JSON templates
- Theme settings schema
- Metafields and metaobjects
- Customer accounts

---

## Development Tools

### Shopify CLI

| Property | Value                                      |
| -------- | ------------------------------------------ |
| Package  | `@shopify/cli`, `@shopify/theme`           |
| Version  | `^3.88.1`, `^3.58.2`                       |
| Purpose  | Theme development, preview, and deployment |

**Commands:**

```bash
pnpm theme:dev     # Start development server
pnpm theme:push    # Push theme to store
pnpm theme:pull    # Pull theme from store
pnpm theme-check   # Lint Liquid files
```

### dotenv-cli

| Property | Value                                      |
| -------- | ------------------------------------------ |
| Package  | `dotenv-cli`                               |
| Version  | `^11.0.0`                                  |
| Purpose  | Load environment variables for Shopify CLI |

---

## Testing

### Vitest

| Property      | Value                                 |
| ------------- | ------------------------------------- |
| Package       | `vitest`                              |
| Version       | `^1.2.0`                              |
| Purpose       | Unit testing for JavaScript utilities |
| Config        | `vitest.config.ts`                    |
| Documentation | https://vitest.dev                    |

**Commands:**

```bash
pnpm test              # Run tests once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
```

### Playwright

| Property      | Value                  |
| ------------- | ---------------------- |
| Package       | `@playwright/test`     |
| Version       | `^1.40.0`              |
| Purpose       | E2E browser testing    |
| Config        | `playwright.config.ts` |
| Documentation | https://playwright.dev |

**Commands:**

```bash
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # With Playwright UI
```

### Vitest Coverage

| Property | Value                   |
| -------- | ----------------------- |
| Package  | `@vitest/coverage-v8`   |
| Version  | `^4.0.17`               |
| Purpose  | Code coverage reporting |

---

## Code Quality

### ESLint

| Property | Value               |
| -------- | ------------------- |
| Package  | `eslint`            |
| Version  | `^9.39.2`           |
| Purpose  | JavaScript linting  |
| Config   | `eslint.config.mjs` |

**Commands:**

```bash
pnpm lint              # Run ESLint
pnpm lint:fix          # Fix auto-fixable issues
```

### Prettier

| Property | Value                                 |
| -------- | ------------------------------------- |
| Package  | `prettier`                            |
| Version  | `^3.2.0`                              |
| Purpose  | Code formatting for Liquid, CSS, JSON |

**Commands:**

```bash
pnpm format            # Format files
pnpm format:check      # Check formatting
```

### Husky

| Property | Value                |
| -------- | -------------------- |
| Package  | `husky`              |
| Version  | `^9.0.0`             |
| Purpose  | Git hooks management |

### lint-staged

| Property | Value                       |
| -------- | --------------------------- |
| Package  | `lint-staged`               |
| Version  | `^16.2.7`                   |
| Purpose  | Run linters on staged files |

### simple-git-hooks

| Property | Value                 |
| -------- | --------------------- |
| Package  | `simple-git-hooks`    |
| Version  | `^2.13.1`             |
| Purpose  | Lightweight git hooks |

---

## Workflow Automation

### workflow-agent-cli

| Property | Value                           |
| -------- | ------------------------------- |
| Package  | `workflow-agent-cli`            |
| Version  | `^2.8.1`                        |
| Purpose  | Development workflow automation |

**Commands:**

```bash
pnpm workflow:validate              # Validate branch/commit
pnpm workflow:verify                # Run all checks
pnpm workflow:generate-instructions # Generate copilot instructions
```

---

## Technology Choices

### Why These Tools?

| Tool        | Why Chosen                                       |
| ----------- | ------------------------------------------------ |
| Vitest      | Fast, Vite-native, good DX for JS testing        |
| Playwright  | Cross-browser E2E, great Shopify store testing   |
| Prettier    | Consistent formatting, Liquid support via plugin |
| ESLint      | Industry standard JS linting                     |
| Shopify CLI | Official tooling for theme development           |

### Not Used (and Why)

| Tool         | Reason Not Used                                  |
| ------------ | ------------------------------------------------ |
| React/Vue    | Shopify themes use Liquid, not JS frameworks     |
| Tailwind CSS | Using vanilla CSS with BEM for theme portability |
| TypeScript   | Limited benefit for Liquid theme development     |
| Webpack/Vite | Shopify CLI handles asset bundling               |
| Jest         | Vitest is faster and simpler                     |

---

## Adding New Dependencies

### Process

1. **Check if needed**: Can this be done with existing tools?
2. **Evaluate**: Check bundle size, maintenance, compatibility
3. **Propose**: Discuss in PR or team meeting
4. **Document**: Add to this file after approval

### Criteria for New Dependencies

- [ ] Actively maintained (commits in last 6 months)
- [ ] Good documentation
- [ ] Reasonable bundle size
- [ ] Compatible with Shopify theme development
- [ ] No security vulnerabilities

---

## Quick Reference

### All Package Scripts

```bash
# Theme Development
pnpm theme:dev         # Start dev server
pnpm theme:push        # Push to Shopify
pnpm theme:pull        # Pull from Shopify
pnpm theme-check       # Lint Liquid

# Testing
pnpm test              # Unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
pnpm test:e2e          # E2E tests
pnpm test:e2e:ui       # E2E with UI

# Code Quality
pnpm lint              # ESLint
pnpm format            # Prettier
pnpm format:check      # Check formatting
pnpm validate          # All checks

# Workflow
pnpm workflow:validate # Branch validation
pnpm workflow:verify   # Full verification
```

---

## Related Documents

- [SINGLE_SOURCE_OF_TRUTH.md](SINGLE_SOURCE_OF_TRUTH.md) - Project structure
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) - Testing patterns
- [DEPLOYMENT_STRATEGY.md](DEPLOYMENT_STRATEGY.md) - Deployment workflow
