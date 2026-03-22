# /plan — Create Branch & Implementation Plan

You are executing **Phase 1 and Phase 2 only** of the implementation workflow. This creates the branch and plan without starting implementation.

## Input

The user will provide a task description: $ARGUMENTS

If no task description was provided, ask the user what they want to plan before proceeding.

---

## Step 1: Context Check

1. Read `docs/ACTIVE_CONTEXT.md` if it exists
2. Check `plans/` for overlapping plans — if one exists, show it and ask whether to resume or start fresh
3. Read `guidelines/AGENT_EDITING_INSTRUCTIONS.md` for the plan template

## Step 2: Branch Setup

1. Check current branch with `git branch --show-current`
2. If on `main`:
   - `git pull origin main`
   - Determine branch name: `<type>/<scope>/<short-description>` (refer to CLAUDE.md for allowed types and scopes)
   - `git checkout -b <branch-name>`
3. If on a feature branch: confirm with user whether to reuse or create new
4. **NEVER start plan work on `main`**

## Step 3: Gap Analysis

Analyze the task to determine:

1. **Scope**: Which files need to be created or modified
2. **Reuse**: Check `theme/snippets/`, `theme/sections/`, existing components — list what can be reused
3. **Tokens**: Whether new design tokens are needed in `theme-variables.css`
4. **Design**: Whether a Figma reference is needed (if UI work, ask for the URL)
5. **Dependencies**: Prerequisites that must be resolved first
6. **Stack**: Whether this touches `theme/`, `hydrogen/`, or both — determines which pre-commit checks apply

## Step 4: Create Implementation Plan

Create `plans/<FEATURE_NAME>_PLAN.md` using this structure:

```markdown
# Implementation Plan: <Feature Name>

> **Status**: 🟡 In Progress
> **Created**: <today's date>
> **Last Updated**: <today's date>
> **Branch**: `<branch-name>`

## Overview

<What is being implemented and why>

## Gap Analysis

- **Reusable components found**: <list or "none">
- **New tokens needed**: <list or "none">
- **Design reference**: <Figma URL or "N/A">
- **Pre-commit stack**: <theme | hydrogen | both>

## Checklist

### Phase 1: <Phase Name>
- [ ] Task description — `path/to/file`
- [ ] Task description — `path/to/file`

### Phase 2: <Phase Name>
- [ ] Task description — `path/to/file`

### Testing
- [ ] Unit tests added
- [ ] E2E tests added (if applicable)
- [ ] Manual testing completed

### Pre-Commit Checks
- [ ] Format passes
- [ ] Linter/theme-check passes
- [ ] Tests pass
- [ ] Build passes (hydrogen) / Validate passes (theme)

### Documentation
- [ ] Component inventory updated (if new component)
- [ ] Active context updated

## Notes

<Decisions, blockers, or context for future reference>
```

## Step 5: Present Plan to User

Show the user:
1. The branch that was created
2. A summary of the gap analysis findings
3. The full plan with all phases
4. Ask for approval before any implementation begins

**Do NOT begin implementation.** This command only plans. Use `/implement` or manual work to execute.
