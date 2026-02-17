# Design References

Persistent Figma design specs used as the source of truth for all UI work. Each component directory contains the Figma-generated code, measurements, and design tokens needed to build and refine the implementation.

## Directory Structure

```
design-references/
├── <component>/
│   ├── figma-spec.md        # Node IDs, dimensions, tokens, variants
│   ├── screenshot.png       # Figma screenshot (git-ignored, re-fetchable)
│   ├── design-context.tsx   # Raw Figma MCP output (immutable reference)
│   └── comparison.html      # Generated side-by-side report (git-ignored)
```

## Workflow

### Capturing a New Component Reference

1. Get the Figma node ID from the design URL (e.g. `node-id=2766-311`)
2. Use Figma MCP tools to pull the design:
   - `get_screenshot` — visual reference
   - `get_design_context` — generated code with exact measurements
   - `get_variable_defs` — design token values
3. Save outputs to `design-references/<component>/`
4. Write `figma-spec.md` with measurements, tokens, and variant info

### Comparing Implementation vs Design

1. Capture implementation screenshot:
   ```bash
   pnpm test:e2e -- tests/e2e/visual/<component>.visual.spec.ts
   ```
2. Generate comparison report:
   ```bash
   pnpm compare:<component>
   ```
3. Open `design-references/<component>/comparison.html` in browser
4. Use the overlay slider to spot discrepancies

### Refining After Changes

1. Make code changes
2. Re-run the visual test to capture updated screenshot
3. Re-run comparison to verify improvement
4. Repeat until matched

## Figma File

- **File key**: `d52sF4D2B0bIzt3A4z3UjE`
- **File name**: Hy-lee design
- **Design variables**: `--primary: #2ac864`, `--secondary: #2699a6`, `--default: #666`, `--alternate: #fff`
