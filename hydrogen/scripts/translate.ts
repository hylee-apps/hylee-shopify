#!/usr/bin/env tsx
/**
 * translate.ts — Auto-translate missing i18n keys via the DeepL API.
 *
 * Usage (from the hydrogen/ directory):
 *   DEEPL_API_KEY=your_key pnpm translate
 *
 * Behavior:
 *   - Reads app/locales/en/common.json as the single source of truth.
 *   - For each target locale (es, fr), finds keys that are present in EN but
 *     absent from the target file, and fills them in via DeepL.
 *   - Existing translations are NEVER overwritten — only gaps are filled.
 *     Manually reviewed strings are safe.
 *   - i18next interpolation placeholders ({{foo}}) are protected from
 *     translation using DeepL's XML tag-ignore feature.
 *   - nav.categoryTitles is skipped — it is owned by
 *     config/dynamic-translations.ts and built programmatically.
 *
 * Getting a DeepL key:
 *   Free tier (500 000 chars/month): https://www.deepl.com/pro#developer
 *   Free keys end with the :fx suffix; the script detects this automatically
 *   and uses api-free.deepl.com instead of api.deepl.com.
 */

import {readFileSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load .env automatically so the script works with `pnpm translate` without
// needing to prefix the command with DEEPL_API_KEY=... each time.
// process.loadEnvFile is available in Node 20.6+ and does not overwrite
// variables that are already set in the environment.
try {
  (process as any).loadEnvFile(join(ROOT, '.env'));
} catch {
  // No .env file — rely on the environment variable being set externally.
}

// ─── Config ──────────────────────────────────────────────────────────────────

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_API_KEY) {
  console.error('Error: DEEPL_API_KEY is not set.');
  console.error('Get a free key at https://www.deepl.com/pro#developer');
  console.error('Then run: DEEPL_API_KEY=your_key pnpm translate');
  process.exit(1);
}

// Free-tier keys end with :fx — they use a different host
const DEEPL_BASE = DEEPL_API_KEY.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2'
  : 'https://api.deepl.com/v2';

const TARGETS: {locale: string; deeplLang: string}[] = [
  {locale: 'es', deeplLang: 'ES'},
  {locale: 'fr', deeplLang: 'FR'},
];

// These key prefixes are managed outside of the JSON files — skip them.
const SKIP_PREFIXES = ['nav.categoryTitles'];

// DeepL allows up to 50 texts per request on the free tier.
const BATCH_SIZE = 50;

// ─── Types ───────────────────────────────────────────────────────────────────

type JsonObject = {[key: string]: JsonValue};
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

// ─── JSON helpers ─────────────────────────────────────────────────────────────

/** Flatten a nested JSON object to dot-notation path → value pairs. */
function flatten(obj: JsonObject, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out.set(path, value);
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      for (const [k, v] of flatten(value as JsonObject, path)) {
        out.set(k, v);
      }
    }
  }
  return out;
}

/**
 * Set a dot-notation path in a nested object, creating intermediate objects
 * as needed. Existing sibling keys at every level are preserved.
 */
function setPath(obj: JsonObject, path: string, value: string): void {
  const parts = path.split('.');
  let current: JsonObject = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as JsonObject;
  }
  current[parts[parts.length - 1]] = value;
}

// ─── Placeholder protection ───────────────────────────────────────────────────

/**
 * Wrap {{interpolation}} markers in XML tags so DeepL treats them as opaque
 * content and does not attempt to translate or reorder them.
 */
function maskPlaceholders(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, '<x>{{$1}}</x>');
}

/** Reverse maskPlaceholders after DeepL returns the translated string. */
function unmaskPlaceholders(text: string): string {
  return text.replace(/<x>\{\{([^}]+)\}\}<\/x>/g, '{{$1}}');
}

// ─── DeepL API ────────────────────────────────────────────────────────────────

async function translateBatch(
  texts: string[],
  targetLang: string,
): Promise<string[]> {
  const body = new URLSearchParams();
  body.append('source_lang', 'EN');
  body.append('target_lang', targetLang);
  body.append('tag_handling', 'xml');
  body.append('ignore_tags', 'x');

  for (const text of texts) {
    body.append('text', maskPlaceholders(text));
  }

  const res = await fetch(`${DEEPL_BASE}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepL ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as {translations: {text: string}[]};
  return data.translations.map((t) => unmaskPlaceholders(t.text));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const enPath = join(ROOT, 'app/locales/en/common.json');
  const enJson = JSON.parse(readFileSync(enPath, 'utf-8')) as JsonObject;
  const enFlat = flatten(enJson);

  for (const {locale, deeplLang} of TARGETS) {
    const targetPath = join(ROOT, `app/locales/${locale}/common.json`);
    let targetJson: JsonObject = {};
    try {
      targetJson = JSON.parse(readFileSync(targetPath, 'utf-8')) as JsonObject;
    } catch {
      console.log(`[${locale}] No existing file — will create from scratch.`);
    }
    const targetFlat = flatten(targetJson);

    // Collect EN keys that are missing from the target locale
    const missing: {path: string; text: string}[] = [];
    for (const [path, text] of enFlat) {
      if (SKIP_PREFIXES.some((p) => path === p || path.startsWith(`${p}.`)))
        continue;
      if (!targetFlat.has(path) && text.trim()) {
        missing.push({path, text});
      }
    }

    if (missing.length === 0) {
      console.log(`[${locale}] Already up to date — nothing to translate.`);
      continue;
    }

    console.log(
      `[${locale}] Translating ${missing.length} missing string(s) via DeepL...`,
    );

    // Translate in batches and write results into the target JSON
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const batch = missing.slice(i, i + BATCH_SIZE);
      const translated = await translateBatch(
        batch.map((m) => m.text),
        deeplLang,
      );
      for (let j = 0; j < batch.length; j++) {
        setPath(targetJson, batch[j].path, translated[j]);
      }
      const done = Math.min(i + BATCH_SIZE, missing.length);
      console.log(`  ${done}/${missing.length}`);
    }

    writeFileSync(
      targetPath,
      `${JSON.stringify(targetJson, null, 2)}\n`,
      'utf-8',
    );
    console.log(`[${locale}] Written → app/locales/${locale}/common.json\n`);
  }

  console.log('Done.');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
