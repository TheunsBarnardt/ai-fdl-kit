#!/usr/bin/env node

/**
 * blueprint-lookup.js
 *
 * Deterministic blueprint lookup backed by blueprints/INDEX.md.
 *
 * Usage:
 *   node scripts/blueprint-lookup.js <feature-name>
 *
 * Behavior:
 *   - Hit   → prints JSON to stdout, exit 0
 *   - Miss  → prints "not in INDEX" message to stderr, exit 1
 *   - INDEX missing → prints clear remediation to stderr, exit 2
 *
 * JSON shape on hit:
 *   { feature, category, yaml_path, md_path, version, description }
 *
 * Used by /fdl-generate as the mandatory first step of Step 0 (Load Blueprint).
 * Prevents the skill from globbing or guessing categories — the INDEX is the
 * single source of truth.
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const ROOT = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const PROJECT_ROOT = join(ROOT, '..');
const INDEX_PATH = join(PROJECT_ROOT, 'blueprints', 'INDEX.md');

function fail(msg, code) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function main() {
  const query = process.argv[2];
  if (!query) {
    fail('Usage: node scripts/blueprint-lookup.js <feature-name>', 2);
  }

  if (!existsSync(INDEX_PATH)) {
    fail(
      `blueprints/INDEX.md not found at ${INDEX_PATH}. Run \`npm run generate:readmes\` to regenerate it.`,
      2
    );
  }

  const raw = readFileSync(INDEX_PATH, 'utf8');
  const lines = raw.split(/\r?\n/);

  // Walk the file, tracking the current `## <Category>` heading, and match
  // table rows of the form:
  //   | [**<feature>**](./<category>/<feature>.md) | <description> | <version> | [yaml](./<category>/<feature>.blueprint.yaml) |
  const rowRegex =
    /^\|\s*\[\*\*([^*]+)\*\*\]\(\.\/([^/]+)\/([^)]+)\.md\)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*\[yaml\]\(\.\/[^/]+\/[^)]+\.blueprint\.yaml\)\s*\|\s*$/;
  const headingRegex = /^##\s+(.+?)\s*$/;

  const target = query.toLowerCase().trim();
  const hits = [];
  let currentCategory = null;

  for (const line of lines) {
    const h = line.match(headingRegex);
    if (h) {
      // Heading titles are displayed as Title Case (e.g. "Auth"). The actual
      // category slug on disk is the lowercased, hyphenated form. The table
      // row itself carries the canonical slug in the link target, so we
      // ignore the heading label and read the slug from the row match.
      currentCategory = h[1].toLowerCase();
      continue;
    }

    const m = line.match(rowRegex);
    if (!m) continue;

    const [, feature, categorySlug, featureInLink, description, version] = m;

    if (feature.toLowerCase() === target) {
      hits.push({
        feature,
        category: categorySlug,
        yaml_path: `blueprints/${categorySlug}/${featureInLink}.blueprint.yaml`,
        md_path: `blueprints/${categorySlug}/${featureInLink}.md`,
        version: version.trim(),
        description: description.trim(),
      });
    }
  }

  if (hits.length === 0) {
    fail(
      `No blueprint named '${query}' in INDEX. Run \`npm run generate:readmes\` if you just added it, or check spelling.`,
      1
    );
  }

  // Exactly one hit is the happy path. If somehow there are multiple, emit
  // them as an array so the caller can disambiguate — the INDEX generator
  // enforces unique feature names, so this should not happen in practice.
  if (hits.length === 1) {
    process.stdout.write(JSON.stringify(hits[0]) + '\n');
  } else {
    process.stdout.write(JSON.stringify({ ambiguous: true, matches: hits }) + '\n');
  }
}

main();
