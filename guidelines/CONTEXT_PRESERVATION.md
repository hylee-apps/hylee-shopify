# Context Preservation Workflow

## Why This Exists

AI coding assistants (Claude Code, GitHub CoPilot) start every session with no memory
of previous work. When a feature spans multiple sessions — which is common for anything
non-trivial — critical context is rebuilt from scratch each time:

- Which files were changed and why
- What decisions were made (and what alternatives were rejected)
- What constraints apply (API limitations, design token names, etc.)
- What remains to do and in what order
- What errors were encountered and fixed

This workflow solves that by maintaining a single structured document,
`docs/ACTIVE_CONTEXT.md`, that both tools read at session start.

---

## The System

### Files

| File | Role |
|------|------|
| `docs/ACTIVE_CONTEXT.md` | **Live checkpoint** — updated at the end of each significant work block |
| `docs/context-preservation/CONTEXT_SCHEMA.md` | Field-by-field documentation of what goes in each section |
| `docs/context-preservation/CONTEXT_TEMPLATE.md` | Blank template to copy when starting a new feature |
| `scripts/export-context.sh` | Regenerates `.github/copilot-instructions.md` with the checkpoint appended |
| `scripts/copilot-instructions-base.md` | Static base content for copilot-instructions.md (do not edit directly) |

### Flow

```
Session end
    │
    ▼
Update docs/ACTIVE_CONTEXT.md
    │
    ▼
pnpm context:export
    │
    ▼
.github/copilot-instructions.md updated
    │         │
    ▼         ▼
  Claude    CoPilot
  reads     reads it
  MEMORY.md automatically
  + manually
```

---

## When to Update the Checkpoint

Update `docs/ACTIVE_CONTEXT.md` when:

1. **You finish a significant block of work** — completing a feature, fixing a major bug,
   or reaching a natural stopping point
2. **You are about to stop for the day** (or the session is getting long)
3. **You hit a blocker** — document the blocker in "Remaining Work" with `[BLOCKED]` status
4. **Explicitly asked** — user says "save context", "checkpoint", or "update context"

You do NOT need to update it after every small edit. One update per meaningful work unit
is the right cadence.

---

## How to Update (for Claude Code)

When it's time to checkpoint:

1. **Read the current `docs/ACTIVE_CONTEXT.md`** to see what's already there
2. **Update each section**:
   - Move completed "Remaining Work" items to "Completed Work"
   - Add newly changed files to "Completed Work"
   - Revise "Remaining Work" with current priorities
   - Add new technical decisions if any were made
   - Add any new errors + fixes
   - Update "Next Immediate Action" to reflect the exact next step
   - Update the `Updated` date at the top
3. **Run `pnpm context:export`** to regenerate `.github/copilot-instructions.md`

---

## Updating the Base CoPilot Instructions

The static content in `.github/copilot-instructions.md` is managed by `workflow-agent-cli`.
When that tool regenerates the file, the context checkpoint section is lost.

To restore it:
```bash
# Re-seed the base from the freshly-generated file (without the checkpoint section)
cp .github/copilot-instructions.md scripts/copilot-instructions-base.md
# Then re-export to append the checkpoint
pnpm context:export
```

You can tell if the base needs updating if `.github/copilot-instructions.md` ends with
the workflow-agent-cli footer rather than the "Next Immediate Action" section.

---

## Starting a New Feature

When beginning a new feature or major work block:

1. Copy `docs/context-preservation/CONTEXT_TEMPLATE.md` to `docs/ACTIVE_CONTEXT.md`
   (overwriting the previous checkpoint — git history preserves it if needed)
2. Fill in the feature name, branch, and initial "Remaining Work" list
3. Run `pnpm context:export`

---

## Starting a Session

When Claude Code starts a new session:

1. **CLAUDE.md instructs reading `docs/ACTIVE_CONTEXT.md`** — this happens automatically
   from the CLAUDE.md instruction
2. The "Next Immediate Action" section tells you exactly where to pick up
3. The "Technical Decisions" section tells you what not to re-litigate

For CoPilot in VSCode:
- The checkpoint is automatically included in every chat via `.github/copilot-instructions.md`
- No `#file:` reference needed

---

## Philosophy

- **Overwrite, don't append** — the file represents *current* state, not history
- **Git is the history** — git blame and log preserve all previous checkpoint states
- **Be concrete** — "Next Immediate Action" should be specific enough to execute without
  further thought. "Continue working on checkout" is bad. "In `checkout.review.tsx`, add
  `?return_to=...` param to `checkoutUrl` before redirect" is good.
- **Capture constraints** — technical decisions that were hard to discover should be
  documented so they don't have to be discovered again
