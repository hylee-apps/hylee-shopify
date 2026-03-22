# /implement — Full Implementation Workflow

You are executing the **full implementation workflow** defined in `guidelines/AGENT_EDITING_INSTRUCTIONS.md`. This takes a task from description to merge-ready PR. Follow every step below exactly.

## Input

The user will provide a task description: $ARGUMENTS

If no task description was provided, ask the user what they want to implement before proceeding.

---

## Phase 0: Context Restoration

1. Read `docs/ACTIVE_CONTEXT.md` if it exists — restore any relevant prior context
2. Read `guidelines/AGENT_EDITING_INSTRUCTIONS.md` to confirm you have the full workflow loaded
3. Check `plans/` for any existing plan that overlaps with this task — if one exists, ask the user whether to resume it or start fresh

## Phase 1: Branch Setup

1. Check current branch with `git branch --show-current`
2. If on `main`:
   - `git pull origin main`
   - Determine the correct branch name using format `<type>/<scope>/<short-description>` (refer to CLAUDE.md for allowed types and scopes)
   - `git checkout -b <branch-name>`
3. If already on a feature branch:
   - Confirm with the user whether to continue on this branch or create a new one
4. **NEVER begin implementation work on `main`**

## Phase 2: Gap Analysis & Planning

1. Analyze the task to identify:
   - Which files need to be created or modified
   - Which existing snippets/components can be reused (check `theme/snippets/` and `theme/sections/` first)
   - Whether design tokens from `theme/assets/theme-variables.css` are needed
   - Whether this task requires a Figma reference (if UI work, ask the user for the Figma URL)
   - Dependencies or prerequisites that must be resolved first
2. Determine if an implementation plan is needed (>3 files, new feature, multi-session, or multi-step)
3. If plan is needed, create `plans/<FEATURE_NAME>_PLAN.md` using the required template from AGENT_EDITING_INSTRUCTIONS.md:
   - Set status to 🟡 In Progress
   - Break work into phased checklist with file paths
   - Include Testing and Documentation phases
4. If plan is NOT needed (simple bugfix, single-file change), skip plan creation but still follow the remaining phases

## Phase 3: Implementation

1. Work through each phase/task in the plan (or the single task if no plan)
2. **After completing each task:**
   - Mark the checkbox `- [x]` in the plan
   - Update the "Last Updated" date
3. Follow all coding standards from AGENT_EDITING_INSTRUCTIONS.md:
   - BEM naming for CSS, design tokens for all values
   - Check snippets before creating new components
   - No inline styles, no hardcoded colors/spacing
4. Add `data-testid` attributes to testable elements
5. If you encounter a blocker:
   - Document it in the plan's Notes section
   - Update status to 🔴 Blocked
   - Ask the user how to proceed

## Phase 4: Pre-Commit Checks (MANDATORY — Zero Exceptions)

Determine which stack was modified and run the appropriate checks:

### If `theme/` files were changed:
```bash
pnpm format
pnpm format:check
pnpm theme-check
pnpm test
pnpm validate
```

### If `hydrogen/` files were changed:
```bash
pnpm format
pnpm format:check
pnpm typecheck
pnpm build
pnpm test
```

### Rules:
- If ANY check fails → fix the errors, then **re-run ALL checks from step 1**
- Do NOT commit until every check passes
- Do NOT skip checks even if "it looks fine"
- Document any fixes made during this phase

## Phase 5: Commit & Push

1. Stage changes: prefer `git add <specific-files>` over `git add .`
2. Commit with conventional format: `<type>(<scope>): <description>`
3. Push to feature branch: `git push -u origin <branch-name>`

## Phase 6: Pull Request

1. Create PR using `gh pr create` with:
   - Short title (under 70 chars)
   - Body with Summary, Changes, Test Plan sections
2. Return the PR URL to the user

## Phase 7: Cleanup

1. Update the implementation plan status to 🟢 Complete (if plan was created)
2. Capture the pattern if this was a meaningful fix: `workflow verify --fix --learn` (if workflow-agent is available)
3. Update `docs/ACTIVE_CONTEXT.md` with current state

---

## Gap Detection

Throughout this workflow, if you discover any of the following gaps, **fill them immediately**:

- **Missing design tokens**: If a color/spacing/font value is needed but not in `theme-variables.css`, flag it and ask the user whether to add a new token
- **Missing snippets**: If a reusable UI pattern is being duplicated instead of extracted, create the snippet first
- **Missing tests**: If the change type requires tests per AGENT_EDITING_INSTRUCTIONS.md but none exist, write them
- **Missing documentation**: If a new component was created, update `docs/COMPONENT_INVENTORY.md`
- **Missing plan**: If work grew beyond 3 files but no plan was created, create one retroactively
- **Stale context**: If `docs/ACTIVE_CONTEXT.md` is outdated, update it
- **Missing directory structure**: If `plans/` or `plans/completed/` don't exist, create them
