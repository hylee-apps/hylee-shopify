#!/usr/bin/env bash
# export-context.sh
# Regenerates .github/copilot-instructions.md by appending the current
# ACTIVE_CONTEXT.md to the static base content.
#
# Usage:
#   pnpm context:export
#   bash scripts/export-context.sh
#
# To update the static base (e.g. after workflow-agent-cli regenerates
# copilot-instructions.md), run:
#   cp .github/copilot-instructions.md scripts/copilot-instructions-base.md
#   # Then edit the base to remove any previously appended context section
# --------------------------------------------------------------------------

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE="$ROOT/scripts/copilot-instructions-base.md"
CONTEXT="$ROOT/docs/ACTIVE_CONTEXT.md"
OUT="$ROOT/.github/copilot-instructions.md"

if [[ ! -f "$BASE" ]]; then
  echo "ERROR: Base file not found: $BASE" >&2
  exit 1
fi

if [[ ! -f "$CONTEXT" ]]; then
  echo "ERROR: Context file not found: $CONTEXT" >&2
  exit 1
fi

# Write base + separator + context
{
  cat "$BASE"
  printf '\n\n---\n\n<!-- CONTEXT-CHECKPOINT: auto-appended by export-context.sh -->\n\n'
  cat "$CONTEXT"
} > "$OUT"

echo "✓ Exported context checkpoint to $OUT"
