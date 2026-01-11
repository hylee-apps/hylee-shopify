## Pull Request

### Type
<!-- Mark with [x] -->
- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] chore: Maintenance/dependencies
- [ ] docs: Documentation
- [ ] style: Formatting (no logic changes)
- [ ] test: Adding/updating tests
- [ ] refactor: Code restructuring

### Description
<!-- Brief description of changes -->


### Related Issues
<!-- Link to issue(s) this PR addresses -->
Closes #

---

### Checklist

#### Before requesting review:

- [ ] **Branch follows naming convention:** `{type}({scope}): {description}`
- [ ] **Self-reviewed** my code for obvious issues

#### Component Library:
- [ ] Used **existing components** from `theme/snippets/`
- [ ] New components follow the **component template** (see DEVELOPMENT_GUIDELINES.md)
- [ ] New component CSS added to `theme/layout/theme.liquid`
- [ ] No inline styles that should be in component CSS

#### Design Tokens:
- [ ] Uses **CSS custom properties** from `theme-variables.css` (no hardcoded colors/spacing)
- [ ] Follows **BEM naming** convention for CSS classes

#### Documentation:
- [ ] Updated `docs/COMPONENT_INVENTORY.md` (if new component)
- [ ] Updated `docs/IMPLEMENTATION_PLAN.md` (if completing a task)
- [ ] Updated `docs/ARCHITECTURE.md` (if architectural decision)

#### Testing:
- [ ] Added/updated **component tests** (`tests/components/`)
- [ ] Added/updated **E2E tests** (`tests/e2e/`) if user flow affected
- [ ] All tests pass: `pnpm test && pnpm test:e2e`

#### Quality:
- [ ] Linting passes: `pnpm theme-check`
- [ ] Structure valid: `pnpm validate:structure`
- [ ] Responsive design verified
- [ ] Accessibility attributes included (aria-*, role, etc.)

---

### Screenshots
<!-- If visual changes, add before/after screenshots -->

| Before | After |
|--------|-------|
|        |       |

---

### Notes for Reviewers
<!-- Any additional context or areas to focus on -->

