# Improvement Suggestion

**ID**: automated-browser-testing-for-manual-plans
**Date**: 2026-03-25T09:55:00Z
**Status**: implemented
**Category**: ux
**Priority**: high
**Reporter**: claude-code

## Problem/Opportunity

Implementation plans include detailed manual testing checklists (e.g., pixel-precision CSS checks, status badge colors, responsive breakpoint behavior). These checklists are comprehensive but entirely manual — a human must open the browser, inspect elements, and verify each item by eye. This is:

1. **Time-consuming**: A typical manual testing plan has 100+ checkbox items across multiple phases
2. **Error-prone**: Fatigue leads to missed checks, especially for subtle CSS differences (e.g., `#2699a6` vs `#14b8a6`)
3. **Non-repeatable**: Manual checks don't protect against regressions — they're done once and forgotten
4. **Auth-blocked**: Many pages require authentication, making them harder to test interactively

## Proposed Solution

Standardize a **test route + Playwright automation** pattern for every implementation plan that includes a manual testing section:

### Pattern: Test Route

Create a dedicated test route (e.g., `/test/<feature-name>`) that:
- Renders the feature's components with hardcoded mock data
- Requires no authentication or backend data
- Includes test controls (toggle empty state, switch variants, etc.)
- Uses `data-testid` attributes for reliable selectors

### Pattern: Playwright Tests from Manual Plan

Convert each manual testing checklist item into a Playwright test that:
- Verifies computed CSS properties (colors, font sizes, weights, padding, border-radius)
- Checks element visibility, counts, and text content
- Tests responsive behavior at multiple viewport sizes (390px, 768px, 1440px)
- Captures screenshots for visual comparison with Figma

### Workflow Integration

Add to the implementation plan template:
1. **Phase N-1** (before final polish): Create test route + Playwright tests
2. **Manual Testing Plan header**: Include a table mapping automated vs manual-only items
3. **Run command**: Document the exact `pnpm test:e2e` invocation

## Impact Analysis

- **Who is affected**: All developers implementing UI features from Figma designs
- **Frequency**: Every feature implementation plan (2-4 per sprint)
- **Current workaround**: Manual browser inspection with DevTools — slow, unrepeatable
- **Benefit if implemented**:
  - 80%+ of manual testing items automated
  - Regression protection via CI
  - Faster iteration (run tests in seconds vs 30+ minutes manually)
  - Pixel-precision checks catch subtle color/spacing drift

## Implementation Plan

### Changes Required

- [ ] Update `guidelines/AGENT_EDITING_INSTRUCTIONS.md` — add "Automated Browser Testing" section to implementation plan template
- [ ] Add test route template pattern to guidelines
- [ ] Add Playwright test structure conventions (phase-based `test.describe` blocks)
- [ ] Document the `data-testid` convention for testable components

### Testing

- [x] Unit tests added — N/A (process improvement)
- [x] Integration tests added — Validated with `outgoing-cards.spec.ts` (75 tests, all passing)
- [x] Manual testing completed — Confirmed test route works at `/test/outgoing-cards`

### Rollback Plan

Remove test routes and Playwright spec files. No production code is affected.

## Notes

First implementation: "On the Way Out" tab — `hydrogen/tests/e2e/outgoing-cards.spec.ts` (75 tests).

Key learnings from first implementation:
- **Strict mode**: Playwright's strict mode catches duplicate text in badges vs progress tracker labels — always scope locators to the nearest container (e.g., card header)
- **CSS class selectors**: Use escaped Tailwind classes (e.g., `.bg-\\[\\#2ac864\\]`) to locate status-specific elements
- **getComputedStyle**: Reliable for verifying exact pixel values — fonts, colors, dimensions
- **Auth bypass**: Test routes eliminate the auth barrier entirely — no need for session mocking

---

_To submit this improvement to the workflow-agent community:_
```bash
workflow suggest "$(cat .workflow/improvements/2026-03-25-automated-browser-testing-for-manual-plans.md)"
```
