# Context Checkpoint Schema

This document defines every field in `docs/ACTIVE_CONTEXT.md`.

---

## Header Block

```markdown
# Active Context Checkpoint

> **Updated:** YYYY-MM-DD
> **Branch:** feature/xxx
> **Status:** in-progress | blocked | ready-for-review
```

| Field | Description |
|-------|-------------|
| `Updated` | ISO date of last update. Set this every time you edit the file. |
| `Branch` | The git branch for the active feature. Use `main` when no feature branch is active. |
| `Status` | `in-progress` — work underway. `blocked` — waiting on something external. `ready-for-review` — implementation complete, awaiting review/merge. |

---

## Active Feature

One paragraph describing what is currently being built and **why**. Include the business
reason or user story — not just the technical description. This is the single most
important field; a new session should be able to understand the goal from this alone.

---

## Completed Work

Bulleted list of files changed in the current feature, with a one-line description of
**what** changed and **why**. Include both new and modified files.

```markdown
- `path/to/file.tsx` — Created: purpose of the file
- `path/to/other.tsx` — Modified: what changed and the reason
```

Do not include minor formatting-only changes. Focus on meaningful changes.

---

## Remaining Work

Priority-ordered numbered list. Each item should be specific enough to act on immediately.

```markdown
1. **[HIGH]** Task description — target file(s), what needs to happen
2. **[MED]** Task description
3. **[LOW]** Task description
```

Priority levels:
- `[HIGH]` — Blocks other work or is on the critical path
- `[MED]` — Important but not blocking
- `[LOW]` — Nice-to-have or future cleanup

---

## Technical Decisions

Document decisions that a new session must honour, along with the reasoning. Include
what was *rejected* and why — this prevents the same alternatives from being re-explored.

```markdown
- **Decision name**: Chosen approach. Rejected: alternative X because Y.
```

---

## Critical Context

Facts that are easy to forget or look up but are frequently needed:

- Design system token names and their CSS variable equivalents
- Figma file keys and node IDs for active designs
- API limitations and constraints (e.g., "Shopify does not expose X")
- Environment-specific configuration (env vars, flags)
- URLs or IDs that recur throughout the codebase

---

## Recent Errors & Fixes

Errors encountered during this feature and how they were resolved. This prevents
the same errors from being hit again in a new session.

```markdown
- **Error**: Short description of the error message or symptom
  **Fix**: What resolved it
```

---

## Next Immediate Action

A single, specific, actionable instruction for what to do first when resuming this work.
Write it as if leaving a note for yourself after a 2-week break.

```markdown
> Start with `path/to/file.tsx` — implement X by doing Y.
```

---

## Maintenance Rules

- **Update the `Updated` date** every time you edit this file
- **Overwrite** the file each session — git history preserves old checkpoints
- **Run `pnpm context:export`** after updating to sync CoPilot instructions
- Keep the file under ~150 lines — if it grows larger, archive old completed items
- Move completed items from "Remaining Work" to "Completed Work" as you finish them
