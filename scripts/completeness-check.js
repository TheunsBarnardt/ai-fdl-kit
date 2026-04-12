#!/usr/bin/env node

/**
 * FDL Blueprint Completeness Checker
 *
 * Complements scripts/validate.js. Validate.js checks STRUCTURE (schema).
 * This checks SEMANTIC COMPLETENESS — catches blueprints that pass the
 * schema but still contain placeholders, empty sections, or unbound refs.
 *
 * Borrows the "no placeholders, no TBD, no cross-references" discipline
 * from the Superpowers writing-plans skill, applied to FDL blueprints.
 *
 * The terminal state of every /fdl-* skill must be a blueprint that passes
 * BOTH validate.js AND this checker.
 *
 * Usage:
 *   node scripts/completeness-check.js                                   # all blueprints
 *   node scripts/completeness-check.js blueprints/auth/login.blueprint.yaml  # one file
 *   node scripts/completeness-check.js --json                            # machine-readable output
 */

import { readFileSync } from "fs";
import { resolve, relative, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");

// ─── Placeholder patterns ─────────────────────────────────
// Things that look like spec but are actually "I didn't fill this in yet"

// Placeholder markers must look like developer marker comments, not
// legitimate prose. "todo" as a task-status enum value is fine; "TODO:" or
// a string that is literally "TODO" is not.
const PLACEHOLDER_TOKENS = [
  /\bTODO\b(?![a-z])/, // case-sensitive uppercase, not a prefix of a word
  /\bTBD\b(?![a-z])/,
  /\bFIXME\b(?![a-z])/,
  /\bXXX\b(?![a-z])/,
  /\bPLACEHOLDER\b(?![a-z])/,
  /\bLOREM\s+IPSUM\b/i,
  // Unambiguous placeholder phrases — must include a deictic like "this/here/later"
  /\b(add|write|define|specify)\s+(this|here|later)\b/i,
  /\b(description|value|content)\s+goes\s+here\b/i,
  /\bfill\s+(this\s+)?in\b/i,
  /\bto\s+be\s+(defined|determined|added|written)\b/i,
  /^\s*\.\.\.\s*$/,
  /^\s*\?+\s*$/,
];

const MIN_DESCRIPTION_LENGTH = 15;
const MIN_RULE_LENGTH = 10;

// ─── Secret patterns (POPIA compliance) ──────────────────
// Detect leaked credentials, API keys, tokens, PII in blueprint content

const SECRET_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/, label: "API key (sk-...)" },
  { pattern: /pk_(test|live)_[a-zA-Z0-9]{20,}/, label: "Stripe publishable key" },
  { pattern: /AKIA[A-Z0-9]{16}/, label: "AWS access key" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: "GitHub personal token" },
  { pattern: /gho_[a-zA-Z0-9]{36}/, label: "GitHub OAuth token" },
  { pattern: /glpat-[a-zA-Z0-9\-_]{20,}/, label: "GitLab token" },
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, label: "JWT token" },
  { pattern: /(mongodb|postgres|postgresql|mysql|redis|amqp):\/\/[^\s]+:[^\s]+@/, label: "Connection string with credentials" },
  { pattern: /BEGIN\s+(RSA|EC|OPENSSH|DSA|PGP)\s+PRIVATE\s+KEY/, label: "Private key" },
  { pattern: /xox[bpsar]-[a-zA-Z0-9\-]{10,}/, label: "Slack token" },
  { pattern: /AIza[a-zA-Z0-9_-]{35}/, label: "Google API key" },
];

// ─── Issue collector ──────────────────────────────────────

class Issues {
  constructor(file) {
    this.file = file;
    this.errors = [];
    this.warnings = [];
  }
  error(path, message, suggestion) {
    this.errors.push({ path, message, ...(suggestion ? { suggestion } : {}) });
  }
  warn(path, message, suggestion) {
    this.warnings.push({ path, message, ...(suggestion ? { suggestion } : {}) });
  }
  get hasErrors() {
    return this.errors.length > 0;
  }
  get total() {
    return this.errors.length + this.warnings.length;
  }
}

// ─── Helpers ──────────────────────────────────────────────

function containsPlaceholder(value) {
  if (typeof value !== "string") return false;
  return PLACEHOLDER_TOKENS.some((re) => re.test(value));
}

function walkStrings(obj, path, visit) {
  if (obj == null) return;
  if (typeof obj === "string") {
    visit(obj, path);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => walkStrings(item, `${path}[${i}]`, visit));
    return;
  }
  if (typeof obj === "object") {
    for (const [key, val] of Object.entries(obj)) {
      walkStrings(val, path ? `${path}.${key}` : key, visit);
    }
  }
}

// ─── Completeness checks ──────────────────────────────────

function checkDescription(bp, issues) {
  if (!bp.description) {
    issues.error("description", "missing description");
    return;
  }
  if (bp.description.length < MIN_DESCRIPTION_LENGTH) {
    issues.error(
      "description",
      `description too short (${bp.description.length} chars, minimum ${MIN_DESCRIPTION_LENGTH})`,
      `Expand to ${MIN_DESCRIPTION_LENGTH}+ chars explaining what this feature does and its primary purpose`
    );
  }
  if (containsPlaceholder(bp.description)) {
    issues.error("description", `contains placeholder token: "${bp.description}"`);
  }
  // Description must not just repeat the feature name
  if (bp.feature && bp.description.trim().toLowerCase() === bp.feature.toLowerCase()) {
    issues.error("description", "description is just the feature name — needs a real sentence",
      "Write a sentence like: 'Enable [who] to [do what] with [key detail]'"
    );
  }
}

function checkRules(bp, issues) {
  // rules is an object keyed by category (permissions, security, validation, ...)
  // Each value can be:
  //   - an array of rule strings (traditional format)
  //   - a structured object of key-value pairs (e.g., consent: { opt_in_required: true })
  if (!bp.rules || typeof bp.rules !== "object" || Array.isArray(bp.rules)) {
    issues.error("rules", "blueprint has no rules defined (must be object of categories)");
    return;
  }
  const categories = Object.keys(bp.rules);
  if (categories.length === 0) {
    issues.error("rules", "rules object is empty");
    return;
  }

  for (const category of categories) {
    const value = bp.rules[category];
    if (value == null) {
      issues.warn(`rules.${category}`, "rule category is null/empty");
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        issues.warn(`rules.${category}`, "rule category is an empty array");
        continue;
      }
      value.forEach((rule, i) => {
        const text = typeof rule === "string" ? rule : rule?.rule || rule?.description;
        if (typeof text === "string") {
          if (text.length < MIN_RULE_LENGTH) {
            issues.warn(
              `rules.${category}[${i}]`,
              `rule text too short (${text.length} chars): "${text}"`
            );
          }
          if (containsPlaceholder(text)) {
            issues.error(`rules.${category}[${i}]`, `contains placeholder: "${text}"`);
          }
        }
      });
    } else if (typeof value === "object") {
      // Structured rule object — just make sure it's non-empty and sweep for placeholders
      if (Object.keys(value).length === 0) {
        issues.warn(`rules.${category}`, "structured rule category is empty");
      }
      walkStrings(value, `rules.${category}`, (str, p) => {
        if (containsPlaceholder(str)) {
          issues.error(p, `contains placeholder: "${str}"`);
        }
      });
    }
  }
}

function checkOutcomesOrFlows(bp, issues) {
  const hasOutcomes =
    bp.outcomes && typeof bp.outcomes === "object" && Object.keys(bp.outcomes).length > 0;
  const hasFlows =
    bp.flows && typeof bp.flows === "object" && Object.keys(bp.flows).length > 0;

  if (!hasOutcomes && !hasFlows) {
    issues.error("outcomes|flows", "blueprint must define at least one outcome or flow");
    return;
  }

  if (hasOutcomes) checkOutcomes(bp, issues);
  if (hasFlows) checkFlows(bp, issues);
}

function checkOutcomes(bp, issues) {
  const errorCodes = new Set(
    (bp.errors || []).map((e) => (typeof e === "string" ? e : e?.code)).filter(Boolean)
  );

  for (const [name, outcome] of Object.entries(bp.outcomes)) {
    const path = `outcomes.${name}`;

    if (!outcome || typeof outcome !== "object") {
      issues.error(path, "outcome has no body");
      continue;
    }

    const hasGiven = Array.isArray(outcome.given) && outcome.given.length > 0;
    const hasThen = Array.isArray(outcome.then) && outcome.then.length > 0;
    const hasResult = typeof outcome.result === "string" && outcome.result.length > 0;

    if (!hasGiven && !hasThen && !hasResult) {
      issues.error(path, "outcome has no given/then/result — it is empty");
      continue;
    }

    // An outcome needs at least one of: then (side effects) or result (description)
    if (!hasThen && !hasResult) {
      issues.warn(path, "outcome has no 'then' actions or 'result' description",
        "Add then: [{action: 'emit_event', event: '...'}] or result: 'description of what happens'"
      );
    }

    // Check bound error codes exist in errors[]
    if (outcome.error) {
      if (!errorCodes.has(outcome.error)) {
        issues.error(
          `${path}.error`,
          `references error code "${outcome.error}" but it is not defined in errors[]`
        );
      }
    }

    // Placeholder content inside outcome strings
    walkStrings(outcome, path, (str, p) => {
      if (containsPlaceholder(str)) {
        issues.error(p, `contains placeholder: "${str}"`);
      }
    });
  }

  // Coverage heuristic: need at least one success-looking outcome and one failure-looking outcome
  const names = Object.keys(bp.outcomes);
  const looksSuccess = names.some((n) =>
    /success|valid|ok|complete|approved|confirmed|created|updated|granted/i.test(n)
  );
  const looksFailure = names.some((n) =>
    /fail|invalid|denied|error|rejected|expired|missing|declined|unauthorized|forbidden|not_found|limit/i.test(
      n
    )
  );
  if (!looksSuccess) {
    issues.warn("outcomes", "no outcome name suggests a success path (success/valid/approved/...)",
      "Add an outcome named e.g. 'successful', 'validated', or 'approved' with given[], then[], and result"
    );
  }
  if (!looksFailure) {
    issues.warn(
      "outcomes",
      "no outcome name suggests a failure path (invalid/denied/expired/...) — every blueprint should cover error cases",
      "Add an outcome named e.g. 'validation_failed' or 'unauthorized' with given[] condition and error: binding"
    );
  }
}

function checkFlows(bp, issues) {
  // flows is an object keyed by flow name
  for (const [name, flow] of Object.entries(bp.flows)) {
    const path = `flows.${name}`;
    if (!flow || typeof flow !== "object") {
      issues.error(path, "flow is not an object");
      continue;
    }
    if (!flow.steps || !Array.isArray(flow.steps) || flow.steps.length === 0) {
      issues.error(path, "flow has no steps");
    }
    walkStrings(flow, path, (str, p) => {
      if (containsPlaceholder(str)) {
        issues.error(p, `contains placeholder: "${str}"`);
      }
    });
  }
}

function checkErrors(bp, issues) {
  if (!bp.errors) return;
  const errors = Array.isArray(bp.errors) ? bp.errors : [];
  errors.forEach((err, i) => {
    const path = `errors[${i}]`;
    if (typeof err === "string") return; // bare code reference is fine
    if (!err.code) {
      issues.error(path, "error has no code");
    }
    if (!err.message) {
      issues.warn(`${path}.message`, "error has no user-facing message");
    } else if (containsPlaceholder(err.message)) {
      issues.error(`${path}.message`, `contains placeholder: "${err.message}"`);
    }
  });
}

function checkFields(bp, issues) {
  if (!bp.fields) return; // fields are optional for system-driven features
  const fields = Array.isArray(bp.fields) ? bp.fields : [];
  fields.forEach((field, i) => {
    const path = `fields[${i}]`;
    if (!field || typeof field !== "object") return;
    if (!field.name) issues.error(path, "field has no name");
    if (!field.type) issues.error(path, "field has no type");
    if (field.label && containsPlaceholder(field.label)) {
      issues.error(`${path}.label`, `contains placeholder: "${field.label}"`);
    }
  });
}

// Generic sweep for placeholders anywhere we didn't already check
function sweepForPlaceholders(bp, issues) {
  const seen = new Set();
  walkStrings(bp, "", (str, path) => {
    if (seen.has(path)) return;
    seen.add(path);
    // Skip fields we already inspected in detail to avoid duplicate reports
    if (/^(description|rules|outcomes|flows|errors|fields)(\b|\.|\[)/.test(path)) return;
    if (containsPlaceholder(str)) {
      issues.warn(path, `contains placeholder: "${str}"`);
    }
  });
}

function checkSecrets(bp, issues) {
  walkStrings(bp, "", (str, path) => {
    for (const { pattern, label } of SECRET_PATTERNS) {
      if (pattern.test(str)) {
        // NEVER include the actual secret value in the error message
        issues.error(path, `SECURITY: contains what looks like a ${label} — remove it immediately`);
      }
    }
  });
}

// ─── Per-blueprint check ──────────────────────────────────

function checkBlueprint(file) {
  const relPath = relative(PROJECT_ROOT, file).replace(/\\/g, "/");
  const issues = new Issues(relPath);
  let bp;
  try {
    bp = YAML.parse(readFileSync(file, "utf-8"));
  } catch (err) {
    issues.error("", `failed to parse YAML: ${err.message}`);
    return issues;
  }
  if (!bp || typeof bp !== "object") {
    issues.error("", "file is empty or not a YAML object");
    return issues;
  }

  checkDescription(bp, issues);
  checkRules(bp, issues);
  checkOutcomesOrFlows(bp, issues);
  checkErrors(bp, issues);
  checkFields(bp, issues);
  checkSecrets(bp, issues);
  sweepForPlaceholders(bp, issues);

  return issues;
}

// ─── CLI ──────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const fileArgs = args.filter((a) => !a.startsWith("--"));

  let files;
  if (fileArgs.length > 0) {
    files = fileArgs.map((f) => resolve(f));
  } else {
    files = await glob("blueprints/**/*.blueprint.yaml", {
      cwd: PROJECT_ROOT,
      absolute: true,
    });
    // Exclude .proposed.blueprint.yaml — those are pending review
    files = files.filter((f) => !f.includes(".proposed."));
  }

  const results = files.map(checkBlueprint);
  const totalErrors = results.reduce((n, r) => n + r.errors.length, 0);
  const totalWarnings = results.reduce((n, r) => n + r.warnings.length, 0);
  const filesWithErrors = results.filter((r) => r.hasErrors).length;
  const filesClean = results.filter((r) => r.total === 0).length;

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          checked: results.length,
          clean: filesClean,
          filesWithErrors,
          totalErrors,
          totalWarnings,
          results: results.map((r) => ({
            file: r.file,
            errors: r.errors,
            warnings: r.warnings,
          })),
        },
        null,
        2
      )
    );
  } else {
    const colors = {
      reset: "\x1b[0m",
      red: "\x1b[31m",
      yellow: "\x1b[33m",
      green: "\x1b[32m",
      cyan: "\x1b[36m",
      dim: "\x1b[2m",
    };

    for (const r of results) {
      if (r.total === 0) continue;
      const status = r.hasErrors ? `${colors.red}✗${colors.reset}` : `${colors.yellow}⚠${colors.reset}`;
      console.log(`\n${status} ${colors.cyan}${r.file}${colors.reset}`);
      for (const e of r.errors) {
        console.log(`  ${colors.red}error${colors.reset}   ${colors.dim}${e.path}${colors.reset}  ${e.message}`);
        if (e.suggestion) console.log(`          ${colors.green}fix: ${e.suggestion}${colors.reset}`);
      }
      for (const w of r.warnings) {
        console.log(`  ${colors.yellow}warn${colors.reset}    ${colors.dim}${w.path}${colors.reset}  ${w.message}`);
        if (w.suggestion) console.log(`          ${colors.green}fix: ${w.suggestion}${colors.reset}`);
      }
    }

    console.log("");
    console.log(`Completeness check: ${results.length} blueprints scanned`);
    console.log(`  ${colors.green}${filesClean} clean${colors.reset}`);
    if (totalWarnings) console.log(`  ${colors.yellow}${totalWarnings} warnings across ${results.length - filesClean - filesWithErrors + filesWithErrors} files${colors.reset}`);
    if (totalErrors) console.log(`  ${colors.red}${totalErrors} errors across ${filesWithErrors} files${colors.reset}`);
  }

  // Exit non-zero only on errors, not warnings
  process.exit(totalErrors > 0 ? 1 : 0);
}

// ─── Exports for testing ─────────────────────────────────

export { checkBlueprint, Issues, containsPlaceholder, SECRET_PATTERNS, PLACEHOLDER_TOKENS };

// ─── Run CLI only when invoked directly ──────────────────

import { pathToFileURL } from "url";
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
