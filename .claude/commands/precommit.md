# /precommit — Mandatory Pre-Commit Check Sequence

You are executing the **mandatory pre-commit checks** from `guidelines/AGENT_EDITING_INSTRUCTIONS.md`. Zero exceptions — all checks must pass before any commit.

---

## Step 1: Detect Stack

Determine which files have been changed:

```bash
git diff --name-only HEAD
git diff --name-only --cached
git ls-files --others --exclude-standard
```

Categorize changes:
- **Theme**: any files under `theme/`
- **Hydrogen**: any files under `hydrogen/`
- **Both**: files in both directories
- **Neither**: config-only changes (still run format check)

## Step 2: Run Checks

### If theme/ files were changed:

Run in this exact order. If ANY step fails, fix and restart from step 1:

1. `pnpm format` — auto-fix formatting
2. `pnpm format:check` — verify formatting passes
3. `pnpm theme-check` — Shopify theme linter
4. `pnpm test` — unit tests
5. `pnpm validate` — full validation

### If hydrogen/ files were changed:

Run in this exact order. If ANY step fails, fix and restart from step 1:

1. `pnpm format` — auto-fix formatting
2. `pnpm format:check` — verify formatting passes
3. `pnpm typecheck` — TypeScript type checking
4. `pnpm build` — production build (catches SSR errors)
5. `pnpm test` — unit tests

### If both stacks were changed:

Run theme checks first, then hydrogen checks. All must pass.

## Step 3: Fix Errors

If any check fails:

| Error Type | Action |
|---|---|
| Format errors | Re-run `pnpm format`, then `pnpm format:check` |
| Type errors | Fix type definitions, imports, and usage |
| Lint/theme-check errors | Fix violations, apply auto-fix where possible |
| Test failures | Fix test logic or update expectations if intentional |
| Build errors | Fix compilation issues, resolve imports |

After fixing:
- **Re-run ALL checks from step 1** — never assume a fix didn't break something else
- Stage the fixes

## Step 4: Report

When all checks pass, report to the user:
- Which stack(s) were checked
- How many checks passed
- Any fixes that were applied during the process
- Confirmation: **"All pre-commit checks passed. Ready to commit."**

If checks cannot be resolved, report the remaining failures and ask the user for guidance.

## Rules

- **NEVER skip a check** — even if "it looks fine"
- **NEVER commit with failing checks** — fix first, always
- **Always re-run from step 1 after fixes** — a fix can introduce new failures
- **Build catches what typecheck misses** — always run both for hydrogen
