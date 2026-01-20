# Deployment Strategy

> **Purpose**: This document defines the deployment workflow, environment management, and theme pushing procedures for the Hy-lee Shopify Theme.

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Environments](#environments)
3. [Development Workflow](#development-workflow)
4. [Theme Push Commands](#theme-push-commands)
5. [Pre-Deployment Checklist](#pre-deployment-checklist)
6. [Rollback Procedures](#rollback-procedures)

---

## Deployment Overview

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Local Dev     │────▶│   GitHub Repo    │────▶│  Shopify Store  │
│   (theme:dev)   │     │   (main branch)  │     │  (Live Theme)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
    Hot Reload            Version Control           Production
    via Shopify CLI        & Review                   Theme
```

### Key Components

| Component     | Purpose                          |
| ------------- | -------------------------------- |
| Shopify CLI   | Local development and theme push |
| GitHub        | Version control and code review  |
| Shopify Admin | Theme management and settings    |
| .env.local    | Local store credentials          |

---

## Environments

### Environment Types

| Environment | Purpose              | Theme ID               |
| ----------- | -------------------- | ---------------------- |
| Development | Local development    | Development theme      |
| Staging     | Pre-production test  | Unpublished theme      |
| Production  | Live customer-facing | Published (live) theme |

### Theme Setup

1. **Development Theme**: Auto-created by `shopify theme dev`
2. **Staging Theme**: Duplicate of production for testing
3. **Production Theme**: The published, live theme

### Environment Configuration

Create `.env.local` (never commit):

```bash
# Store connection
SHOPIFY_CLI_THEME_TOKEN=your-theme-access-token
SHOPIFY_FLAG_STORE=your-store.myshopify.com

# Optional: specific theme IDs
SHOPIFY_THEME_ID_DEV=123456789
SHOPIFY_THEME_ID_STAGING=987654321
SHOPIFY_THEME_ID_PROD=111222333

# Test credentials (for E2E tests)
TEST_CUSTOMER_EMAIL=test@example.com
TEST_CUSTOMER_PASSWORD=TestPassword123!
```

---

## Development Workflow

### Local Development

```bash
# Start development server
pnpm theme:dev

# This will:
# 1. Connect to your development store
# 2. Create/use a development theme
# 3. Enable hot reload for changes
# 4. Open preview URL in browser
```

### Development Preview

The `theme:dev` command provides:

- **Hot reload**: Changes appear instantly
- **Preview URL**: Test on any device
- **Console output**: Liquid errors and warnings

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/components/add-tooltip

# 2. Start development server
pnpm theme:dev

# 3. Make changes (hot reload updates preview)

# 4. Validate changes
pnpm theme-check
pnpm format:check

# 5. Commit and push
git add .
git commit -m "feat(components): add tooltip snippet"
git push origin feature/components/add-tooltip

# 6. Create PR for review
```

---

## Theme Push Commands

### Available Commands

```bash
# Development (hot reload)
pnpm theme:dev

# Push to connected theme
pnpm theme:push

# Pull latest from theme
pnpm theme:pull
```

### Push to Specific Theme

```bash
# Push to staging theme
shopify theme push --theme <staging-theme-id> --path theme

# Push to production (use with caution!)
shopify theme push --theme <prod-theme-id> --path theme
```

### Push Options

```bash
# Preview what would be pushed (dry run)
shopify theme push --path theme --dry-run

# Only push specific files
shopify theme push --path theme --only "sections/*.liquid"

# Ignore specific files
shopify theme push --path theme --ignore "config/settings_data.json"

# Force push (overwrite conflicts)
shopify theme push --path theme --force
```

---

## Pre-Deployment Checklist

### Before Every Push

- [ ] **Theme check passes**: `pnpm theme-check`
- [ ] **Formatting passes**: `pnpm format:check`
- [ ] **Unit tests pass**: `pnpm test`
- [ ] **No console errors** in browser preview
- [ ] **Visual check** on desktop and mobile

### Before Production Push

All of the above, plus:

- [ ] **E2E tests pass**: `pnpm test:e2e`
- [ ] **Tested on staging** theme first
- [ ] **Team review** for significant changes
- [ ] **Backup current theme** (duplicate in Shopify admin)
- [ ] **Schedule deployment** for low-traffic time (if critical)

### Deployment Steps

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Run full validation
pnpm validate

# 3. Push to staging first
shopify theme push --theme <staging-id> --path theme

# 4. Test on staging URL

# 5. Push to production
pnpm theme:push
# or specific production theme:
shopify theme push --theme <prod-id> --path theme

# 6. Verify production site
```

---

## Rollback Procedures

### When to Rollback

- Critical bug affecting customers
- Broken checkout or cart
- Major visual issues
- JavaScript errors preventing interaction

### Rollback Options

#### Option 1: Revert in Git

```bash
# Find the last working commit
git log --oneline -10

# Revert to that commit
git revert HEAD~1  # Revert last commit
# or
git revert <commit-hash>  # Revert specific commit

# Push the revert
git push origin main

# Push reverted theme
pnpm theme:push
```

#### Option 2: Restore from Theme Backup

1. Go to **Shopify Admin > Online Store > Themes**
2. Find the backup/duplicate theme
3. Click **Actions > Publish**

#### Option 3: Pull and Revert Manually

```bash
# Pull current production theme
shopify theme pull --theme <prod-id> --path theme-backup

# Compare and manually fix issues

# Push fixed theme
pnpm theme:push
```

### Post-Rollback

1. **Notify team** of the rollback
2. **Document the issue** in GitHub issue
3. **Create hotfix branch** to address the issue
4. **Test thoroughly** before re-deploying

---

## Theme Files to Protect

### Never Auto-Push

These files should be carefully reviewed before pushing:

| File                        | Reason                        |
| --------------------------- | ----------------------------- |
| `config/settings_data.json` | Contains theme customizations |
| `locales/*.json`            | May have manual translations  |
| `templates/*.json`          | Section configurations        |

### Recommended .shopifyignore

```
# Don't push local config
.env
.env.local

# Don't push development files
tests/
docs/
scripts/
*.md
*.test.js
```

---

## Continuous Deployment (Future)

### GitHub Actions Workflow

For automated deployments (optional):

```yaml
# .github/workflows/deploy.yml
name: Deploy Theme

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run validations
        run: pnpm validate

      - name: Deploy to Shopify
        env:
          SHOPIFY_CLI_THEME_TOKEN: ${{ secrets.SHOPIFY_THEME_TOKEN }}
          SHOPIFY_FLAG_STORE: ${{ secrets.SHOPIFY_STORE }}
        run: |
          shopify theme push --path theme --theme ${{ secrets.THEME_ID }}
```

---

## Quick Reference

### Daily Development

```bash
pnpm theme:dev          # Start dev server
pnpm theme-check        # Lint Liquid
pnpm format:check       # Check formatting
pnpm test               # Run unit tests
```

### Deployment

```bash
pnpm validate           # Full validation
pnpm theme:push         # Push to theme
pnpm theme:pull         # Pull from theme
```

### Emergency

```bash
# Quick rollback to previous commit
git revert HEAD
git push origin main
pnpm theme:push
```

---

## Related Documents

- [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) - Git workflow
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) - Testing requirements
- [AGENT_EDITING_INSTRUCTIONS.md](AGENT_EDITING_INSTRUCTIONS.md) - Coding standards
