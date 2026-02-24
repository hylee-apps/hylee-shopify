#!/usr/bin/env tsx
/**
 * Synonym Pipeline: Product CSV → Searchanise Synonyms
 *
 * Reads a Shopify product export CSV, extracts synonym candidates from
 * title, tags, product_type, and vendor columns, then either writes them
 * to a JSON file or uploads directly to Searchanise.
 *
 * Usage:
 *   pnpm synonyms:generate --input data/products.csv [--output data/synonyms.json]
 *   pnpm synonyms:upload   --input data/synonyms.json
 *
 * Environment variables:
 *   SEARCHANISE_API_KEY — required for --upload
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

// ============================================================================
// Types
// ============================================================================

interface SynonymGroup {
  /** All terms in this group are treated as synonyms of each other */
  terms: string[];
}

interface ParsedProduct {
  title: string;
  vendor: string;
  product_type: string;
  tags: string[];
}

// ============================================================================
// Well-known abbreviation map
// Maps shorthand → canonical long form. Both directions become synonyms.
// Extend this table as you catalogue more product terminology.
// ============================================================================

const ABBREVIATION_MAP: Record<string, string> = {
  tv: 'television',
  ac: 'air conditioner',
  pc: 'personal computer',
  led: 'light emitting diode',
  lcd: 'liquid crystal display',
  oled: 'organic led',
  usb: 'universal serial bus',
  hdmi: 'high definition multimedia interface',
  wifi: 'wireless internet',
  bt: 'bluetooth',
  kb: 'keyboard',
  'w/': 'with',
  pkg: 'package',
  qty: 'quantity',
  pcs: 'pieces',
  pck: 'pack',
  sz: 'size',
  xlg: 'extra large',
  sml: 'small',
  med: 'medium',
  lrg: 'large',
  blk: 'black',
  wht: 'white',
  gry: 'gray',
  nvy: 'navy',
};

// ============================================================================
// CSV parser
// Handles Shopify export format (quoted fields, commas within values).
// ============================================================================

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

async function parseCsvFile(filePath: string): Promise<ParsedProduct[]> {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const products: ParsedProduct[] = [];
  let headers: string[] = [];
  let lineNumber = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    lineNumber++;

    if (lineNumber === 1) {
      headers = parseCsvLine(line).map((h) => h.toLowerCase().trim());
      continue;
    }

    const cols = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });

    // Only process the first row per product handle (Shopify exports multiple
    // rows per product for variants)
    if (!row['title'] || !row['handle']) continue;

    const tagsRaw = row['tags'] ?? '';
    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    products.push({
      title: (row['title'] ?? '').toLowerCase().trim(),
      vendor: (row['vendor'] ?? '').toLowerCase().trim(),
      product_type: (row['type'] ?? row['product_type'] ?? '').toLowerCase().trim(),
      tags,
    });
  }

  // Deduplicate by title (multiple variant rows share the same title)
  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.title)) return false;
    seen.add(p.title);
    return true;
  });
}

// ============================================================================
// Synonym extraction
// ============================================================================

/**
 * Normalises a term for grouping purposes:
 * - lowercase
 * - collapse extra whitespace
 * - strip leading/trailing punctuation
 */
function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts individual tokens from a product title that could be synonymous
 * with known abbreviations.
 */
function expandAbbreviations(term: string): string[] {
  const normalized = normalizeTerm(term);
  const expanded = ABBREVIATION_MAP[normalized];
  if (expanded) return [normalized, expanded];
  // Check if any abbreviation appears as a substring token
  const tokens = normalized.split(/\s+/);
  const expansions: string[] = [];
  for (const token of tokens) {
    const long = ABBREVIATION_MAP[token];
    if (long) {
      expansions.push(token, long);
    }
  }
  return expansions.length ? expansions : [];
}

/**
 * Groups products by shared product_type and vendor and emits synonyms for
 * any common shorthand tokens within each group.
 */
function generateSynonymGroups(products: ParsedProduct[]): SynonymGroup[] {
  const groups: SynonymGroup[] = [];
  const seen = new Set<string>(); // dedup by sorted terms key

  function addGroup(terms: string[]) {
    const unique = [...new Set(terms.map(normalizeTerm).filter(Boolean))];
    if (unique.length < 2) return;
    const key = unique.sort().join('|');
    if (seen.has(key)) return;
    seen.add(key);
    groups.push({terms: unique});
  }

  // 1. Abbreviation expansion — scan every title/tag for known short forms
  for (const product of products) {
    const candidates = [product.title, ...product.tags, product.product_type];
    for (const candidate of candidates) {
      const expanded = expandAbbreviations(candidate);
      if (expanded.length >= 2) addGroup(expanded);
    }
  }

  // 2. Tag-based synonyms — collect all titles that share the exact same tag
  //    and product_type; their titles become synonyms (capped at 5 per group
  //    to avoid over-broad synonyms from generic tags like "sale").
  const tagProductMap = new Map<string, string[]>();
  for (const product of products) {
    if (!product.product_type) continue;
    for (const tag of product.tags) {
      const key = `${product.product_type}::${tag}`;
      const list = tagProductMap.get(key) ?? [];
      list.push(product.title);
      tagProductMap.set(key, list);
    }
  }
  for (const titles of tagProductMap.values()) {
    if (titles.length < 2 || titles.length > 5) continue;
    addGroup(titles);
  }

  // 3. Product-type synonyms — if multiple products share a vendor + tag pair,
  //    treat their product_type values as synonymous.
  const vendorTagTypeMap = new Map<string, Set<string>>();
  for (const product of products) {
    if (!product.vendor || !product.product_type) continue;
    for (const tag of product.tags) {
      const key = `${product.vendor}::${tag}`;
      const types = vendorTagTypeMap.get(key) ?? new Set<string>();
      types.add(product.product_type);
      vendorTagTypeMap.set(key, types);
    }
  }
  for (const types of vendorTagTypeMap.values()) {
    const arr = [...types];
    if (arr.length >= 2 && arr.length <= 5) addGroup(arr);
  }

  return groups;
}

// ============================================================================
// Searchanise Synonyms API
// ============================================================================

async function uploadSynonyms(
  apiKey: string,
  groups: SynonymGroup[],
): Promise<void> {
  const url = `https://searchanise.io/api/synonyms?api_key=${encodeURIComponent(apiKey)}`;

  let uploaded = 0;
  let failed = 0;

  for (const group of groups) {
    const body = JSON.stringify({synonyms: group.terms});
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body,
    });

    if (res.ok) {
      uploaded++;
    } else {
      failed++;
      console.error(
        `  ✗ Failed to upload synonym group [${group.terms.join(', ')}]: HTTP ${res.status}`,
      );
    }
  }

  console.log(`\nUpload complete: ${uploaded} groups uploaded, ${failed} failed.`);
}

// ============================================================================
// CLI entry point
// ============================================================================

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      parsed[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
    }
  }
  return parsed;
}

async function main() {
  const args = parseArgs();
  const command = process.argv[2]; // generate | upload

  // ── synonyms:upload ──────────────────────────────────────────────────────
  if (command === '--upload' || args['upload'] === 'true') {
    const inputFile = args['input'] ?? 'data/synonyms.json';
    const apiKey = args['api-key'] ?? process.env['SEARCHANISE_API_KEY'] ?? '';

    if (!apiKey) {
      console.error('Error: SEARCHANISE_API_KEY is required for upload.');
      console.error('  Set it as an env var or pass --api-key <key>');
      process.exit(1);
    }

    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Input file not found: ${inputFile}`);
      process.exit(1);
    }

    const groups: SynonymGroup[] = JSON.parse(
      fs.readFileSync(inputFile, 'utf-8'),
    );
    console.log(`Uploading ${groups.length} synonym groups to Searchanise...`);
    await uploadSynonyms(apiKey, groups);
    return;
  }

  // ── synonyms:generate ────────────────────────────────────────────────────
  const inputFile = args['input'];
  if (!inputFile) {
    console.error('Usage: pnpm synonyms:generate --input <path/to/products.csv>');
    console.error('       pnpm synonyms:upload   --input <path/to/synonyms.json>');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: CSV file not found: ${inputFile}`);
    process.exit(1);
  }

  const outputFile = args['output'] ?? 'data/synonyms.json';

  console.log(`Parsing products from: ${inputFile}`);
  const products = await parseCsvFile(inputFile);
  console.log(`  → ${products.length} unique products found`);

  console.log('Generating synonym groups...');
  const groups = generateSynonymGroups(products);
  console.log(`  → ${groups.length} synonym groups generated`);

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  fs.writeFileSync(outputFile, JSON.stringify(groups, null, 2));
  console.log(`\nSynonyms written to: ${outputFile}`);
  console.log('\nSample groups:');
  groups.slice(0, 5).forEach((g) => console.log(' ', g.terms.join(' ↔ ')));

  if (args['upload'] === 'true') {
    const apiKey = args['api-key'] ?? process.env['SEARCHANISE_API_KEY'] ?? '';
    if (!apiKey) {
      console.error('\nSkipping upload: SEARCHANISE_API_KEY not set.');
    } else {
      console.log('\nUploading to Searchanise...');
      await uploadSynonyms(apiKey, groups);
    }
  } else {
    console.log('\nTo upload these synonyms, run:');
    console.log(`  pnpm synonyms:upload --input ${outputFile}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
