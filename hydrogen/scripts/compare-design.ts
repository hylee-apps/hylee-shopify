/**
 * Design Comparison Tool
 *
 * Generates an HTML report for side-by-side comparison between a Figma
 * design reference screenshot and a Playwright implementation capture.
 *
 * Usage:
 *   npx tsx scripts/compare-design.ts <component>
 *
 * Example:
 *   npx tsx scripts/compare-design.ts header
 *
 * Expects:
 *   - design-references/<component>/screenshot.png  (Figma reference)
 *   - tests/e2e/visual/screenshots/<component>-*.png (Playwright captures)
 *
 * Outputs:
 *   - design-references/<component>/comparison.html
 */

import fs from 'node:fs';
import path from 'node:path';

const component = process.argv[2];

if (!component) {
  console.error('Usage: npx tsx scripts/compare-design.ts <component>');
  console.error('Example: npx tsx scripts/compare-design.ts header');
  process.exit(1);
}

const ROOT = path.resolve(import.meta.dirname, '..');
const REFS_DIR = path.join(ROOT, 'design-references', component);
const SCREENSHOTS_DIR = path.join(ROOT, 'tests', 'e2e', 'visual', 'screenshots');

const refScreenshot = path.join(REFS_DIR, 'screenshot.png');
const hasRef = fs.existsSync(refScreenshot);

// Find all Playwright captures for this component
const captureFiles = fs.existsSync(SCREENSHOTS_DIR)
  ? fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.startsWith(component) && f.endsWith('.png'))
  : [];

if (!hasRef && captureFiles.length === 0) {
  console.error(`No reference or captures found for "${component}".`);
  console.error(`  Reference: ${refScreenshot}`);
  console.error(`  Captures dir: ${SCREENSHOTS_DIR}`);
  process.exit(1);
}

function toDataUri(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const refDataUri = hasRef ? toDataUri(refScreenshot) : '';
const captures = captureFiles.map((f) => ({
  name: f.replace('.png', '').replace(`${component}-`, ''),
  dataUri: toDataUri(path.join(SCREENSHOTS_DIR, f)),
}));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Design Comparison — ${component}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 24px; }
  h1 { font-size: 20px; margin-bottom: 16px; color: #fff; }
  h2 { font-size: 16px; margin-bottom: 12px; color: #a0a0ff; }
  .section { margin-bottom: 32px; background: #16213e; border-radius: 12px; padding: 20px; }
  .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .compare-grid img { width: 100%; border: 1px solid #333; border-radius: 8px; background: #fff; }
  .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 8px; }

  /* Overlay mode */
  .overlay-container { position: relative; }
  .overlay-container img { width: 100%; display: block; border-radius: 8px; }
  .overlay-container .overlay-img {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    object-fit: contain; border-radius: 8px;
    mix-blend-mode: difference;
  }
  .controls { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
  .controls label { font-size: 13px; color: #ccc; }
  input[type="range"] { width: 200px; }
  select { background: #0f3460; color: #e0e0e0; border: 1px solid #444; border-radius: 6px; padding: 4px 8px; font-size: 13px; }
  .mode-btn { background: #0f3460; color: #e0e0e0; border: 1px solid #444; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 13px; }
  .mode-btn.active { background: #2ac864; color: #000; border-color: #2ac864; }
  .help { font-size: 12px; color: #666; margin-top: 8px; }

  /* Figma spec link */
  .meta { display: flex; gap: 16px; font-size: 13px; color: #888; margin-bottom: 16px; }
  .meta a { color: #5e9eff; text-decoration: none; }
  .meta a:hover { text-decoration: underline; }
</style>
</head>
<body>
<h1>Design Comparison — ${component}</h1>
<div class="meta">
  <a href="${REFS_DIR}/figma-spec.md">View Figma Spec</a>
  <span>Generated: ${new Date().toISOString().split('T')[0]}</span>
</div>

${
  hasRef && captures.length > 0
    ? `
<div class="section">
  <h2>Overlay Comparison</h2>
  <div class="controls">
    <label>Capture:
      <select id="capture-select">
        ${captures.map((c, i) => `<option value="${i}">${c.name}</option>`).join('')}
      </select>
    </label>
    <label>Opacity: <input type="range" id="opacity" min="0" max="100" value="50" /></label>
    <button class="mode-btn active" data-mode="blend" onclick="setMode('blend')">Difference</button>
    <button class="mode-btn" data-mode="opacity" onclick="setMode('opacity')">Opacity</button>
    <button class="mode-btn" data-mode="side" onclick="setMode('side')">Side-by-Side</button>
  </div>

  <div id="overlay-view" class="overlay-container">
    <img id="base-img" src="${refDataUri}" alt="Figma reference" />
    <img id="overlay-img" class="overlay-img" src="${captures[0].dataUri}" alt="Implementation" />
  </div>

  <div id="side-view" class="compare-grid" style="display:none;">
    <div>
      <div class="label">Figma Reference</div>
      <img src="${refDataUri}" alt="Figma reference" />
    </div>
    <div>
      <div class="label">Implementation</div>
      <img id="side-capture" src="${captures[0].dataUri}" alt="Implementation" />
    </div>
  </div>

  <p class="help">Difference mode: identical pixels appear black. Discrepancies glow in color.</p>
</div>
`
    : ''
}

${
  hasRef
    ? `
<div class="section">
  <h2>Figma Reference</h2>
  <img src="${refDataUri}" alt="Figma reference" style="width:100%; border-radius:8px; background:#fff;" />
</div>
`
    : '<div class="section"><h2>Figma Reference</h2><p>No screenshot.png found in design-references/${component}/. Save the Figma screenshot there to enable overlay comparison.</p></div>'
}

${captures
  .map(
    (c) => `
<div class="section">
  <h2>Capture: ${c.name}</h2>
  <img src="${c.dataUri}" alt="${c.name}" style="width:100%; border-radius:8px; background:#fff;" />
</div>
`,
  )
  .join('')}

<script>
const captures = ${JSON.stringify(captures.map((c) => c.dataUri))};
const captureNames = ${JSON.stringify(captures.map((c) => c.name))};

const overlayImg = document.getElementById('overlay-img');
const baseImg = document.getElementById('base-img');
const sideCapture = document.getElementById('side-capture');
const overlayView = document.getElementById('overlay-view');
const sideView = document.getElementById('side-view');
const opacitySlider = document.getElementById('opacity');
const captureSelect = document.getElementById('capture-select');

let currentMode = 'blend';

function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));

  if (mode === 'side') {
    if (overlayView) overlayView.style.display = 'none';
    if (sideView) sideView.style.display = 'grid';
  } else {
    if (overlayView) overlayView.style.display = 'block';
    if (sideView) sideView.style.display = 'none';
    if (overlayImg) {
      overlayImg.style.mixBlendMode = mode === 'blend' ? 'difference' : 'normal';
      overlayImg.style.opacity = mode === 'opacity' ? (opacitySlider ? opacitySlider.value / 100 : 0.5) : '1';
    }
  }
}

if (opacitySlider) {
  opacitySlider.addEventListener('input', () => {
    if (overlayImg && currentMode === 'opacity') {
      overlayImg.style.opacity = String(opacitySlider.value / 100);
    }
  });
}

if (captureSelect) {
  captureSelect.addEventListener('change', () => {
    const idx = parseInt(captureSelect.value);
    if (overlayImg) overlayImg.src = captures[idx];
    if (sideCapture) sideCapture.src = captures[idx];
  });
}
</script>
</body>
</html>`;

const outputPath = path.join(REFS_DIR, 'comparison.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log(`Comparison report generated:`);
console.log(`  ${outputPath}`);
console.log('');
console.log(`Figma reference: ${hasRef ? 'Found' : 'MISSING (save screenshot.png to enable overlay)'}`);
console.log(`Captures found: ${captures.length}`);
captures.forEach((c) => console.log(`  - ${c.name}`));
console.log('');
console.log(`Open in browser: file://${outputPath}`);
