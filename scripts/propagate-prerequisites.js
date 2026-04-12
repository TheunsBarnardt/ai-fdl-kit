#!/usr/bin/env node

/**
 * FDL Outcome Prerequisites Propagator
 *
 * Auto-generates `prerequisites` for outcomes based on their `given[]`
 * conditions. Helps AI understand what state must exist before an outcome
 * is evaluated.
 *
 * Rules:
 *   source: db       → "Record loaded from database"
 *   source: session   → "Active session exists"
 *   source: system    → "System state available"
 *   source: computed  → "Computed value derived"
 *   source: request   → "HTTP request metadata available"
 *
 * Only adds prerequisites to outcomes that don't already have them.
 *
 * Usage:
 *   node scripts/propagate-prerequisites.js                     # dry-run
 *   node scripts/propagate-prerequisites.js --apply             # write to disk
 *   node scripts/propagate-prerequisites.js --file <path>       # single file
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, relative, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");

const SOURCE_PREREQUISITES = {
  db: "Record loaded from database",
  session: "Active user session exists",
  system: "System state checked",
  computed: "Computed value derived from inputs",
  request: "HTTP request metadata available",
  input: null, // input is always available, no prerequisite needed
};

/**
 * Generate prerequisites for a single outcome based on its given[] conditions.
 * @param {object} outcome - outcome object with given[]
 * @returns {string[]|null} prerequisites array or null if none needed
 */
function generatePrerequisites(outcome) {
  if (!outcome || !Array.isArray(outcome.given)) return null;

  const prereqs = new Set();

  for (const condition of outcome.given) {
    if (!condition || typeof condition !== "object") continue;

    // Handle any/all groups
    if (condition.any || condition.all) {
      const items = condition.any || condition.all;
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && typeof item === "object" && item.source) {
            const prereq = SOURCE_PREREQUISITES[item.source];
            if (prereq) {
              const detail = item.field ? ` (${item.field})` : "";
              prereqs.add(`${prereq}${detail}`);
            }
          }
        }
      }
      continue;
    }

    // Structured condition with source
    if (condition.source) {
      const prereq = SOURCE_PREREQUISITES[condition.source];
      if (prereq) {
        const detail = condition.field ? ` (${condition.field})` : "";
        prereqs.add(`${prereq}${detail}`);
      }
    }
  }

  return prereqs.size > 0 ? [...prereqs] : null;
}

/**
 * Process a single blueprint file.
 * @returns {{ file: string, changes: string[] } | null}
 */
function processBlueprint(filePath) {
  const relPath = relative(PROJECT_ROOT, filePath).replace(/\\/g, "/");
  let bp;
  try {
    bp = YAML.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
  if (!bp || !bp.outcomes) return null;

  const changes = [];

  for (const [name, outcome] of Object.entries(bp.outcomes)) {
    if (!outcome || typeof outcome !== "object") continue;
    // Skip outcomes that already have prerequisites
    if (Array.isArray(outcome.prerequisites) && outcome.prerequisites.length > 0) continue;

    const prereqs = generatePrerequisites(outcome);
    if (prereqs) {
      outcome.prerequisites = prereqs;
      changes.push(`  outcomes.${name}: added ${prereqs.length} prerequisite(s)`);
    }
  }

  return changes.length > 0 ? { file: relPath, bp, filePath, changes } : null;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const fileIdx = args.indexOf("--file");
  const singleFile = fileIdx >= 0 ? args[fileIdx + 1] : null;

  let files;
  if (singleFile) {
    files = [resolve(singleFile)];
  } else {
    files = await glob("blueprints/**/*.blueprint.yaml", {
      cwd: PROJECT_ROOT,
      absolute: true,
    });
    files = files.filter((f) => !f.includes(".proposed."));
  }

  const results = files.map(processBlueprint).filter(Boolean);

  if (results.length === 0) {
    console.log("No outcomes need prerequisites added.");
    return;
  }

  console.log(`\nPrerequisites propagation ${apply ? "(APPLYING)" : "(DRY RUN)"}`);
  console.log(`  ${results.length} blueprint(s) would be updated\n`);

  for (const { file, bp, filePath, changes } of results) {
    console.log(`  ${file}`);
    for (const change of changes) {
      console.log(`    ${change}`);
    }

    if (apply) {
      const yamlStr = YAML.stringify(bp, { lineWidth: 120 });
      writeFileSync(filePath, yamlStr);
    }
  }

  if (!apply) {
    console.log(`\nRun with --apply to write changes to disk.`);
  } else {
    console.log(`\n${results.length} file(s) updated.`);
  }
}

// ─── Exports for testing ─────────────────────────────────

export { generatePrerequisites, processBlueprint };

// ─── Run CLI only when invoked directly ──────────────────

import { pathToFileURL } from "url";
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
