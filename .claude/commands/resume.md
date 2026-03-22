# /resume — Restore Context & Continue Existing Plan

You are resuming work on an existing implementation plan. This restores context from the previous session and picks up where work left off.

## Input

Optional plan name or branch name: $ARGUMENTS

---

## Step 1: Restore Context

1. Read `docs/ACTIVE_CONTEXT.md` if it exists — summarize the last known state
2. Check current branch: `git branch --show-current`
3. Run `git status` to see any uncommitted work in progress

## Step 2: Find the Plan

1. List all active plans: `ls plans/*.md`
2. If $ARGUMENTS was provided, find the matching plan by name or branch
3. If no argument, and only one plan exists, use it
4. If multiple plans exist and no argument, list them and ask the user which to resume

## Step 3: Assess Progress

Read the implementation plan and report:

1. **Plan name and branch**
2. **Overall status** (🟡 In Progress / 🔴 Blocked)
3. **Completed tasks** — list items marked `[x]`
4. **Remaining tasks** — list items still `[ ]`
5. **Any blockers** documented in the Notes section
6. **Gap check**:
   - Are there uncommitted changes that should be committed first?
   - Are there completed tasks that weren't checked off?
   - Has the branch fallen behind `main`? (`git log main..HEAD --oneline` and `git log HEAD..main --oneline`)
   - Are there new files that should be in the plan but aren't?

## Step 4: Fill Gaps

Before resuming work, fix any gaps found:

- **Uncommitted work**: Ask if it should be committed or stashed
- **Unchecked items**: If work appears done but unchecked, verify and mark complete
- **Behind main**: Suggest rebasing or merging main if divergence is significant
- **Missing plan items**: If the scope has grown, add new items to the plan

## Step 5: Resume

1. Update the plan's "Last Updated" date
2. Identify the **next uncompleted task** in the plan
3. Present a summary to the user:
   - "Resuming **<Plan Name>** on branch `<branch>`"
   - "Progress: X of Y tasks complete"
   - "Next up: <next task description>"
4. Ask the user if they want to proceed with the next task, or adjust priorities

**Then begin working on the next task**, following all implementation standards from `guidelines/AGENT_EDITING_INSTRUCTIONS.md`.
