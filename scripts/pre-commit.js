#!/usr/bin/env node

/**
 * FDL Pre-Commit Validation Hook
 *
 * Validates staged .blueprint.yaml files before allowing a commit.
 * Exits non-zero if any staged blueprint fails validation.
 *
 * Usage:
 *   node scripts/pre-commit.js          # check staged files
 *   node scripts/pre-commit.js --all    # check all blueprints (for CI)
 *
 * Integration:
 *   Add to .git/hooks/pre-commit or use with husky/lint-staged.
 */

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { validateFile } from "./validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

async function main() {
  const args = process.argv.slice(2);
  const checkAll = args.includes("--all");

  let files;

  if (checkAll) {
    // Validate all blueprints (CI mode)
    const { glob } = await import("glob");
    files = await glob("blueprints/**/*.blueprint.yaml", {
      cwd: PROJECT_ROOT,
      absolute: true,
    });
    files = files.filter((f) => !f.includes(".proposed."));
  } else {
    // Find staged .blueprint.yaml files
    let stagedOutput;
    try {
      stagedOutput = execSync(
        "git diff --cached --name-only --diff-filter=ACM",
        { encoding: "utf-8", cwd: PROJECT_ROOT }
      ).trim();
    } catch {
      console.log("Not in a git repository or git not available.");
      process.exit(0);
    }

    if (!stagedOutput) {
      // No staged files
      process.exit(0);
    }

    files = stagedOutput
      .split("\n")
      .filter((f) => f.endsWith(".blueprint.yaml"))
      .map((f) => resolve(PROJECT_ROOT, f));
  }

  if (files.length === 0) {
    process.exit(0);
  }

  console.log(`Validating ${files.length} blueprint(s)...`);

  let failed = 0;
  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      console.error(`  FAIL  ${result.file}`);
      for (const err of result.errors) {
        console.error(`        ${err}`);
      }
      failed++;
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} blueprint(s) failed validation. Commit blocked.`);
    process.exit(1);
  }

  console.log(`All ${files.length} blueprint(s) valid.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
