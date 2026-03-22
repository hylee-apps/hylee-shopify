# /finish — Complete Work: Checks + Commit + Push + PR

You are executing the **completion phase** of the implementation workflow. This runs pre-commit checks, commits, pushes, and creates a PR.

## Input

Optional commit message or PR context: $ARGUMENTS

---

## Step 1: Verify State

1. Check current branch: `git branch --show-current`
   - If on `main`, **STOP** — refuse to commit directly to main. Ask user to create a branch first.
2. Check for uncommitted changes: `git status`
   - If no changes, inform the user there's nothing to commit
3. Check `plans/` for an active plan on this branch — if found, verify all checklist items are complete
   - If incomplete items remain, list them and ask whether to proceed or finish the remaining work first

## Step 2: Pre-Commit Checks (MANDATORY)

Execute the full `/precommit` workflow:

### Detect stack from changed files:
```bash
git diff --name-only HEAD
git diff --name-only --cached
git ls-files --others --exclude-standard
```

### Theme (if theme/ files changed):
1. `pnpm format`
2. `pnpm format:check`
3. `pnpm theme-check`
4. `pnpm test`
5. `pnpm validate`

### Hydrogen (if hydrogen/ files changed):
1. `pnpm format`
2. `pnpm format:check`
3. `pnpm typecheck`
4. `pnpm build`
5. `pnpm test`

**If ANY check fails**: fix, re-run ALL from step 1. Do NOT proceed until all pass.

## Step 3: Commit

1. Stage files: prefer `git add <specific-files>` over `git add .`
   - Do NOT stage `.env`, credentials, or secrets
2. Compose commit message using conventional format: `<type>(<scope>): <description>`
   - Check recent `git log --oneline -5` to match the repo's commit style
   - If the user provided a message in $ARGUMENTS, use it (still ensure conventional format)
3. Commit the changes

## Step 4: Push

1. Push to the feature branch: `git push -u origin <branch-name>`
2. If push fails (e.g., upstream conflict), inform the user and suggest resolution

## Step 5: Pull Request

1. Check if a PR already exists for this branch: `gh pr view --json url 2>/dev/null`
2. If no PR exists, create one:
   ```
   gh pr create --title "<short title>" --body "<body>"
   ```
   - Title: under 70 chars, conventional format
   - Body: Summary (bullet points), Test Plan (checklist), and the `Generated with Claude Code` footer
3. If a PR already exists, inform the user and provide the URL

## Step 6: Post-Completion

1. If an implementation plan exists for this branch:
   - Update status to 🟢 Complete
   - Update "Last Updated" date
2. Attempt pattern capture: `workflow verify --fix --learn` (skip if workflow-agent not available)
3. Update `docs/ACTIVE_CONTEXT.md` with completion state
4. Return the PR URL to the user
