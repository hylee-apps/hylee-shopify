# Improvement Suggestion

**ID**: slash-command-workflow-triggers
**Date**: 2026-03-22T00:00:00Z
**Status**: implemented
**Category**: ux
**Priority**: high
**Reporter**: @hawkinside_out

## Problem/Opportunity

The `AGENT_EDITING_INSTRUCTIONS.md` workflow defines a comprehensive 7-phase process (branch → plan → implement → checks → commit → push → PR) but there is no way to **trigger** this workflow as a single command. AI agents must be manually instructed to follow the process, which leads to:

1. **Inconsistent execution** — agents skip phases (especially gap analysis and pre-commit checks)
2. **No entry points** — there's no "start here" command; agents begin mid-workflow
3. **No resume capability** — multi-session work has no way to restore context and pick up where it left off
4. **Gap blindness** — the workflow doesn't proactively detect missing tokens, snippets, tests, or documentation

This is a fundamental UX gap: the workflow exists but has no trigger mechanism for agentic coding tools.

## Proposed Solution

Create **Claude Code custom slash commands** (`.claude/commands/*.md`) that map to workflow phases:

| Command | Phases Covered | Purpose |
|---|---|---|
| `/implement <task>` | All 7 phases | Full lifecycle from task description to PR |
| `/plan <task>` | Phases 0-2 | Branch setup + gap analysis + plan creation |
| `/precommit` | Phase 4 | Mandatory pre-commit check sequence |
| `/finish` | Phases 4-7 | Checks + commit + push + PR + cleanup |
| `/resume [plan]` | Context restore + continue | Resume work from a previous session |

Each command:
- Reads `AGENT_EDITING_INSTRUCTIONS.md` as its source of truth
- Auto-detects the changed stack (theme vs hydrogen) for appropriate checks
- Includes a **gap detection** step that fills missing tokens, snippets, tests, and documentation
- Follows the mandatory pre-commit sequence with zero exceptions

### Key Innovation: Gap Detection

The `/implement` command includes a "Gap Detection" section that runs throughout the workflow, automatically catching:
- Missing design tokens (flags for user approval)
- Duplicated UI patterns that should be extracted to snippets
- Missing tests for change types that require them
- Missing documentation for new components
- Stale context in `docs/ACTIVE_CONTEXT.md`
- Plans that grew beyond initial scope

This converts the workflow from passive documentation into an **active, self-correcting process**.

## Impact Analysis

- **Who is affected**: All AI agents (Claude Code, Copilot) and developers using agentic workflows
- **Frequency**: Every implementation task — this is the core development loop
- **Current workaround**: Manually instructing the agent "follow AGENT_EDITING_INSTRUCTIONS.md" each session, which is error-prone and verbose
- **Benefit if implemented**: One command triggers the entire workflow with built-in gap detection, ensuring consistent quality and zero skipped phases

## Implementation Plan

### Changes Required

- [x] Create `.claude/commands/implement.md` — full lifecycle command
- [x] Create `.claude/commands/plan.md` — planning-only command
- [x] Create `.claude/commands/precommit.md` — pre-commit checks command
- [x] Create `.claude/commands/finish.md` — completion command
- [x] Create `.claude/commands/resume.md` — context restore + continue command
- [x] Create `plans/` and `plans/completed/` directories
- [x] Update `CLAUDE.md` — document slash commands in Commands section

### Testing

- [x] Manual testing: invoke each command and verify it follows the workflow
- [ ] Verify `/precommit` correctly detects theme vs hydrogen stack
- [ ] Verify `/resume` finds and presents existing plans
- [ ] Verify `/implement` creates proper branch names per CLAUDE.md conventions

### Rollback Plan

Delete `.claude/commands/*.md` and revert the CLAUDE.md section. The underlying workflow in `AGENT_EDITING_INSTRUCTIONS.md` is unchanged.

## Platform Suggestion for workflow-agent-cli

This pattern of **slash-command-triggered workflows** could be a first-class feature in `workflow-agent-cli`:

### Proposed Feature: `workflow commands`

```bash
# Generate slash commands from workflow config
workflow commands generate --target claude-code
workflow commands generate --target copilot
workflow commands generate --target cursor

# Sync commands when workflow config changes
workflow commands sync
```

**How it would work:**

1. `workflow.config.json` gains a `commands` section defining workflow phases:
   ```json
   {
     "commands": {
       "implement": {
         "phases": ["branch", "plan", "gap-analysis", "implement", "precommit", "commit", "pr"],
         "precommit": {
           "stacks": {
             "theme": ["format", "format:check", "theme-check", "test", "validate"],
             "hydrogen": ["format", "format:check", "typecheck", "build", "test"]
           }
         }
       },
       "plan": { "phases": ["branch", "plan", "gap-analysis"] },
       "precommit": { "phases": ["precommit"] },
       "finish": { "phases": ["precommit", "commit", "pr", "cleanup"] },
       "resume": { "phases": ["context-restore", "gap-check", "continue"] }
     }
   }
   ```

2. `workflow commands generate` reads this config and outputs IDE-specific command files (`.claude/commands/`, `.github/copilot-instructions.md`, `.cursor/rules/`, etc.)

3. The generated commands reference the workflow config as source of truth, so updating `workflow.config.json` automatically updates all IDE integrations

4. Gap detection rules are configurable per project:
   ```json
   {
     "gapDetection": {
       "missingTokens": true,
       "duplicatePatterns": true,
       "missingTests": { "threshold": "change-type" },
       "staleContext": { "maxAgeDays": 7 }
     }
   }
   ```

This would make workflow-agent the **single source of truth** for agentic coding workflows across all IDE integrations, rather than requiring manual creation of IDE-specific command files.

## Notes

- The slash commands were implemented for Claude Code specifically (`.claude/commands/`)
- The same pattern could be adapted for other agentic coding tools
- The gap detection concept is novel — most workflow tools are passive checklists, not active gap-fillers
- This suggestion is based on real usage: the Hy-lee Shopify project's `AGENT_EDITING_INSTRUCTIONS.md` defines a thorough workflow that agents consistently failed to follow without explicit triggering

---

_To submit this improvement to the workflow-agent community:_
```bash
workflow suggest "$(cat .workflow/improvements/2026-03-22-slash-command-workflow-triggers.md)"
```
