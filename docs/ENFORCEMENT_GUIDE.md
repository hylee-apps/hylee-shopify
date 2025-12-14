# Enforcement Mechanisms for AI Development Rules

This document outlines the automated tools and processes that enforce the rules defined in Section 3 of the Shopify Theme Migration Plan.

---

## 1. Automated Code Quality Tools

### ESLint (`.eslintrc.json`)
**Enforces:**
- No console.log statements in production code (Rule 3.4)
- TypeScript type safety and strict mode (Rule 3.4)
- Unused variable detection
- Explicit return types

**Run:** `npm run lint` or `npm run lint:fix`

### Prettier (`.prettierrc.json`)
**Enforces:**
- Consistent code formatting (Rule 3.4)
- Standardized indentation, quotes, semicolons
- Line width and spacing

**Run:** `npm run format` or `npm run format:check`

### Shopify Theme Check (`.theme-check.yml`)
**Enforces:**
- Liquid syntax correctness (Rule 3.4)
- Deprecated tags and filters detection
- Performance best practices (asset sizes, lazy loading)
- Accessibility requirements (img alt text, lazy loading)

**Run:** `npm run theme-check`

### TypeScript Compiler
**Enforces:**
- Type safety across all TypeScript files (Rule 3.4)
- Strict null checks
- No implicit any types

**Run:** `npm run type-check`

---

## 2. Git Hooks (Husky)

### Pre-commit Hook (`.husky/pre-commit`)
**Runs automatically before every commit:**
- ✓ TypeScript type checking
- ✓ ESLint validation
- ✓ Prettier format checking
- ✓ Shopify Theme Check
- ✓ Design token validation (checks for hardcoded colors/spacing)
- ✓ UI change validation (ensures screenshots exist)

**Enforces:** Rules 3.3, 3.4, 3.5 (steps 8-9)

### Commit Message Hook (`.husky/commit-msg`)
**Validates commit messages follow conventional commits:**
- Must start with: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Prevents commits with invalid message format

**Enforces:** Rule 3.6 (Commit Messages)

**Setup:** Run `npm run prepare` to install hooks

---

## 3. GitHub Actions CI/CD (`.github/workflows/theme-validation.yml`)

### On Every Push/PR:
**Code Validation Job:**
- ✓ Type checking
- ✓ Linting
- ✓ Format checking
- ✓ Theme Check
- ✓ Scans for console.log statements
- ✓ Runs tests

**Accessibility Job:**
- ✓ Builds the theme
- ✓ Runs accessibility validation

**Visual Regression Job (PRs only):**
- ✓ Checks if component changes include screenshots
- ✓ Fails if screenshots are missing

**Enforces:** Rules 3.1, 3.2, 3.3, 3.4, 3.7

---

## 4. Custom Validation Scripts

### UI Change Validation (`scripts/validate-ui-changes.js`)
**Purpose:** Ensures visual changes are documented
**Checks:**
- Detects component file changes
- Verifies corresponding screenshots exist in `/docs/screenshots/`
- Requires before/after screenshots with proper naming

**Enforces:** Rule 3.3 (Visual Validation)
**Run:** `npm run validate-ui` or automatically via pre-commit hook

### Design Token Checker (`scripts/check-design-tokens.js`)
**Purpose:** Prevents hardcoded design values
**Checks:**
- Detects hardcoded hex colors (except #000, #fff)
- Flags hardcoded px spacing values (except 0px, 1px)
- Suggests using CSS variables or design tokens

**Enforces:** Rule 3.3 (Design Tokens)
**Run:** `npm run check-tokens` or automatically via pre-commit hook

---

## 5. Enforcement Summary

| Rule | Tool | When | Can Override? |
|------|------|------|---------------|
| 3.1 - Component Library | Manual + Code Review | Development | No |
| 3.1 - Documentation | Manual | Feature completion | No |
| 3.2 - Bug Fixes | Git workflow + CI | On commit/PR | No |
| 3.3 - Screenshots | `validate-ui-changes.js` | Pre-commit | No |
| 3.3 - Design Tokens | `check-design-tokens.js` | Pre-commit | Yes (with justification) |
| 3.4 - Linting | ESLint | Pre-commit + CI | No |
| 3.4 - Formatting | Prettier | Pre-commit + CI | No |
| 3.4 - Type Safety | TypeScript | Pre-commit + CI | No |
| 3.4 - Liquid Syntax | Theme Check | Pre-commit + CI | No |
| 3.5 - Component Workflow | Manual checklist | Development | No |
| 3.6 - Commit Format | `commit-msg` hook | Pre-commit | No |
| 3.7 - Testing | Manual + CI | Before merge | No |

---

## 6. How to Use

### Initial Setup
```bash
# Install dependencies
npm install

# Install Git hooks
npm run prepare

# Make hooks executable
chmod +x .husky/pre-commit .husky/commit-msg
```

### Daily Workflow
```bash
# Before committing, run checks manually (optional, hooks will run automatically)
npm run type-check
npm run lint
npm run format:check

# Make changes
git add .

# Commit (hooks run automatically)
git commit -m "feat: add new button component"

# Push (CI runs automatically)
git push
```

### Bypassing Hooks (Emergency Only)
```bash
# Skip pre-commit hook (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"
```

**Note:** CI will still catch issues, and PRs with failing checks cannot be merged.

---

## 7. Overriding Rules

Some rules can be temporarily disabled with justification:

### ESLint
```typescript
// eslint-disable-next-line no-console
console.log('Debug info for development only');
```

### Prettier
```typescript
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];
```

### Design Tokens
Add to `ALLOWED_VALUES` in `scripts/check-design-tokens.js` if a specific value is required.

**Important:** All overrides must be justified in PR descriptions.

---

## 8. Future Enhancements

- [ ] Add visual regression testing with Percy or Chromatic
- [ ] Integrate accessibility testing with axe-core
- [ ] Add performance budgets and monitoring
- [ ] Set up automated screenshot capture
- [ ] Add conventional changelog generation
- [ ] Configure semantic versioning automation

---

_Last updated: 2025-12-14_
