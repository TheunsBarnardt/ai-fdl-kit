#!/usr/bin/env node

/**
 * FDL Project Coverage Scorer
 *
 * Measures how well a generated project implements a blueprint. Same spirit
 * as scripts/fitness.js — one number (0-100) for "how complete is this?" —
 * but applied to GENERATED CODE instead of the blueprint itself.
 *
 * For each requirement in the blueprint, check if the generated source code
 * shows evidence that the requirement was honored (field names present, error
 * codes emitted, events fired, rules enforced, etc.).
 *
 * This is a HEURISTIC scorer. False positives and false negatives are expected.
 * The goal is a gradient signal that /fdl-generate can optimize against, not
 * a proof of correctness. Use with tests, not instead of them.
 *
 * Scoring dimensions (100 total):
 *   fields       (20) — every blueprint field name appears in source
 *   outcomes     (20) — every outcome has a reachable code path
 *   errors       (15) — every error code appears in source
 *   events       (10) — every event is emitted somewhere
 *   rules        (15) — security/behavior rules reflected as keywords
 *   validation    (8) — validation rules (minLength, regex, required) in code
 *   relationships (5) — related features linked/imported
 *   audit_trail   (4) — generated files carry `FDL:` audit comment
 *   tests         (3) — test files exist touching the feature
 *
 * Usage:
 *   node scripts/project-score.js <blueprint> <project-dir>
 *   node scripts/project-score.js blueprints/auth/login.blueprint.yaml ./my-next-app
 *   node scripts/project-score.js <blueprint> <project-dir> --json
 *   node scripts/project-score.js <blueprint> <project-dir> --verbose
 *   node scripts/project-score.js <blueprint> <project-dir> --gaps
 *     # Prints an actionable "missing" list — exactly what /fdl-generate
 *     # needs to patch to raise the score.
 */

import { readFileSync } from "fs";
import { resolve, relative } from "path";
import { glob } from "glob";
import YAML from "yaml";

// ─── Source file discovery ────────────────────────────────

// Extensions the scorer treats as source code worth scanning.
const SOURCE_EXT = [
  "ts", "tsx", "js", "jsx", "mjs", "cjs",        // JS/TS
  "py", "pyi",                                     // Python
  "rs",                                            // Rust
  "go",                                            // Go
  "java", "kt", "kts",                             // JVM
  "cs", "fs", "vb",                                // .NET
  "rb",                                            // Ruby
  "php",                                           // PHP
  "swift",                                         // Swift
  "dart",                                          // Dart/Flutter
  "vue", "svelte", "astro",                        // Frontend frameworks
  "sql", "prisma",                                 // Schema files
];

const TEST_GLOBS = [
  "**/*.{test,spec}.{ts,tsx,js,jsx,mjs}",
  "**/tests/**/*.{py,rs,go,java,cs,ts,js}",
  "**/test_*.py",
  "**/*_test.{go,rs}",
  "**/__tests__/**/*.{ts,tsx,js,jsx}",
];

const IGNORE = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/target/**",
  "**/.next/**",
  "**/coverage/**",
  "**/vendor/**",
  "**/.venv/**",
  "**/venv/**",
  "**/*.min.js",
];

async function collectSource(projectDir) {
  const pattern = `**/*.{${SOURCE_EXT.join(",")}}`;
  const files = await glob(pattern, {
    cwd: projectDir,
    ignore: IGNORE,
    absolute: true,
    nodir: true,
  });
  const sourceByFile = {};
  let combined = "";
  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8");
      sourceByFile[file] = content;
      combined += content + "\n";
    } catch {}
  }
  return { files, sourceByFile, combined };
}

async function collectTests(projectDir) {
  const all = [];
  for (const pattern of TEST_GLOBS) {
    const matches = await glob(pattern, { cwd: projectDir, ignore: IGNORE, absolute: true, nodir: true });
    all.push(...matches);
  }
  return [...new Set(all)];
}

// ─── Presence helpers ──────────────────────────────────────

function escRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Literal substring presence — fastest. */
function contains(haystack, needle) {
  if (!needle || !haystack) return false;
  return haystack.includes(needle);
}

/** Case-insensitive word boundary match — for field names, error codes. */
function containsIdent(haystack, ident) {
  if (!ident || !haystack) return false;
  const re = new RegExp(`\\b${escRegex(ident)}\\b`, "i");
  return re.test(haystack);
}

/**
 * Match a name across snake_case / camelCase / PascalCase / kebab-case.
 * Blueprint uses snake_case for fields; generated code often converts.
 */
function matchesAnyCase(haystack, name) {
  if (!name) return false;
  const snake = name;
  const camel = name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
  const kebab = name.replace(/_/g, "-");
  const variants = [snake, camel, pascal, kebab];
  return variants.some((v) => containsIdent(haystack, v));
}

// ─── Dimension scorers ────────────────────────────────────

function scoreFields(bp, source) {
  const fields = Array.isArray(bp.fields) ? bp.fields : [];
  if (fields.length === 0) return { score: 20, max: 20, detail: { found: 0, total: 0 }, missing: [] };
  let found = 0;
  const missing = [];
  for (const f of fields) {
    if (!f || !f.name) continue;
    if (matchesAnyCase(source.combined, f.name)) found++;
    else missing.push(f.name);
  }
  const ratio = found / fields.length;
  return {
    score: Math.round(ratio * 20),
    max: 20,
    detail: { found, total: fields.length },
    missing,
  };
}

function scoreOutcomes(bp, source) {
  if (!bp.outcomes || typeof bp.outcomes !== "object") {
    // Try flows for workflow-style blueprints
    if (bp.flows) {
      const flows = Object.values(bp.flows);
      return { score: 10, max: 20, detail: { flows: flows.length }, missing: [] };
    }
    return { score: 0, max: 20, detail: {}, missing: [] };
  }
  const entries = Object.entries(bp.outcomes);
  let covered = 0;
  const missing = [];
  for (const [name, outcome] of entries) {
    if (!outcome || typeof outcome !== "object") continue;
    const evidence = [];
    // Evidence 1: error code referenced (failure outcomes)
    if (outcome.error && contains(source.combined, outcome.error)) evidence.push("error_code");
    // Evidence 2: then[] actions — event names, set_field targets
    if (Array.isArray(outcome.then)) {
      for (const action of outcome.then) {
        if (!action || typeof action !== "object") continue;
        if (action.event && contains(source.combined, action.event)) evidence.push(`event:${action.event}`);
        if (action.target && matchesAnyCase(source.combined, action.target)) evidence.push(`target:${action.target}`);
      }
    }
    // Evidence 3: given[] field references
    if (Array.isArray(outcome.given)) {
      for (const cond of outcome.given) {
        if (cond && typeof cond === "object" && cond.field && matchesAnyCase(source.combined, cond.field))
          evidence.push(`field:${cond.field}`);
      }
    }
    // Evidence 4: outcome name as identifier (e.g., `successful_login` → `successfulLogin`)
    if (matchesAnyCase(source.combined, name)) evidence.push("name_match");

    if (evidence.length > 0) covered++;
    else missing.push(name);
  }
  const ratio = entries.length > 0 ? covered / entries.length : 0;
  return {
    score: Math.round(ratio * 20),
    max: 20,
    detail: { covered, total: entries.length },
    missing,
  };
}

function scoreErrors(bp, source) {
  const errors = Array.isArray(bp.errors) ? bp.errors : [];
  if (errors.length === 0) return { score: 15, max: 15, detail: { found: 0, total: 0 }, missing: [] };
  let found = 0;
  const missing = [];
  for (const err of errors) {
    const code = typeof err === "string" ? err : err?.code;
    if (!code) continue;
    if (contains(source.combined, code)) found++;
    else missing.push(code);
  }
  const ratio = found / errors.length;
  return { score: Math.round(ratio * 15), max: 15, detail: { found, total: errors.length }, missing };
}

function scoreEvents(bp, source) {
  const events = Array.isArray(bp.events) ? bp.events : [];
  if (events.length === 0) return { score: 10, max: 10, detail: { found: 0, total: 0 }, missing: [] };
  let found = 0;
  const missing = [];
  for (const ev of events) {
    const name = typeof ev === "string" ? ev : ev?.name;
    if (!name) continue;
    // Dotted event names usually appear verbatim in emit calls
    if (contains(source.combined, name)) found++;
    else missing.push(name);
  }
  const ratio = found / events.length;
  return { score: Math.round(ratio * 10), max: 10, detail: { found, total: events.length }, missing };
}

// Security/behavior rule keywords mapped to likely source-code evidence.
const RULE_KEYWORDS = {
  bcrypt: ["bcrypt", "hashSync", "compareSync", "Bcrypt", "BCrypt"],
  argon2: ["argon2", "Argon2"],
  scrypt: ["scrypt", "Scrypt"],
  constant_time: ["timingSafeEqual", "constant_time", "hmac.compare_digest", "subtle.timingSafeEqual", "bcrypt.compare"],
  rate_limit: ["rate_limit", "rateLimit", "rate-limit", "RateLimiter", "throttle", "Throttle", "express-rate-limit"],
  rate_limiter: ["rate_limit", "rateLimit", "RateLimiter", "throttle"],
  lockout: ["lockout", "locked_until", "lockedUntil", "lock_account"],
  jwt: ["jwt", "JWT", "jsonwebtoken", "jose"],
  session: ["session", "Session"],
  csrf: ["csrf", "CSRF", "xsrf"],
  cors: ["cors", "CORS"],
  https: ["https", "secure: true", "ssl"],
  same_site: ["sameSite", "same_site", "SameSite"],
  http_only: ["httpOnly", "http_only", "HttpOnly"],
  owasp: [], // meta — skip
  encryption: ["encrypt", "crypto.subtle", "AES", "RSA"],
  audit: ["audit", "Audit", "auditLog"],
  logging: ["log", "logger", "Logger", "logging"],
  validation: ["validate", "Validator", "zod", "yup", "joi", "ajv"],
  sanitize: ["sanitize", "DOMPurify", "escape", "htmlspecialchars"],
};

function scoreRules(bp, source) {
  if (!bp.rules || typeof bp.rules !== "object" || Array.isArray(bp.rules)) {
    return { score: 7, max: 15, detail: { checked: 0 }, missing: [] };
  }
  // Walk the rules object and collect all keys + string values that might
  // map to security keywords. Credit for every keyword whose evidence is found.
  const signals = new Set();
  const walk = (node) => {
    if (node == null) return;
    if (typeof node === "string") {
      const lower = node.toLowerCase();
      for (const key of Object.keys(RULE_KEYWORDS)) {
        if (lower.includes(key)) signals.add(key);
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node)) {
        const lowerK = k.toLowerCase();
        for (const key of Object.keys(RULE_KEYWORDS)) {
          if (lowerK.includes(key)) signals.add(key);
        }
        walk(v);
      }
    }
  };
  walk(bp.rules);

  if (signals.size === 0) {
    // No recognizable security signals — give partial credit (benign ruleset)
    return { score: 10, max: 15, detail: { checked: 0, matched: 0 }, missing: [] };
  }

  let matched = 0;
  const missing = [];
  for (const sig of signals) {
    const kw = RULE_KEYWORDS[sig];
    if (!kw || kw.length === 0) continue;
    if (kw.some((k) => contains(source.combined, k))) matched++;
    else missing.push(sig);
  }
  const base = signals.size === 0 ? 0 : matched / signals.size;
  return {
    score: Math.round(base * 15),
    max: 15,
    detail: { checked: signals.size, matched },
    missing,
  };
}

function scoreValidation(bp, source) {
  const fields = Array.isArray(bp.fields) ? bp.fields : [];
  if (fields.length === 0) return { score: 8, max: 8, detail: { checked: 0 }, missing: [] };

  // Look for validation keywords/patterns in source
  const validationPresent =
    contains(source.combined, ".min(") ||
    contains(source.combined, "minLength") ||
    contains(source.combined, "maxLength") ||
    contains(source.combined, "required") ||
    contains(source.combined, "z.string()") ||
    contains(source.combined, "yup.") ||
    contains(source.combined, "Joi.") ||
    contains(source.combined, "validate");

  if (!validationPresent) return { score: 0, max: 8, detail: { checked: 0 }, missing: ["no validation library detected"] };

  // Check each field that has validation rules in the blueprint
  let checked = 0;
  let matched = 0;
  const missing = [];
  for (const f of fields) {
    if (!f || !Array.isArray(f.validation) || f.validation.length === 0) continue;
    checked++;
    // Evidence: field name + a validation keyword within short distance
    const nameFound = matchesAnyCase(source.combined, f.name);
    if (nameFound) matched++;
    else missing.push(f.name);
  }
  if (checked === 0) return { score: 4, max: 8, detail: { checked: 0 }, missing: [] };
  return { score: Math.round((matched / checked) * 8), max: 8, detail: { checked, matched }, missing };
}

function scoreRelationships(bp, source) {
  const related = Array.isArray(bp.related) ? bp.related : [];
  if (related.length === 0) return { score: 5, max: 5, detail: { found: 0, total: 0 }, missing: [] };
  let found = 0;
  const missing = [];
  for (const r of related) {
    if (!r || typeof r !== "object") continue;
    const name = r.feature;
    if (!name) continue;
    if (matchesAnyCase(source.combined, name)) found++;
    else missing.push(name);
  }
  const ratio = related.length > 0 ? found / related.length : 1;
  return { score: Math.round(ratio * 5), max: 5, detail: { found, total: related.length }, missing };
}

function scoreAuditTrail(bp, source) {
  const files = Object.keys(source.sourceByFile);
  if (files.length === 0) return { score: 0, max: 4, detail: { tagged: 0, total: 0 }, missing: [] };
  let tagged = 0;
  // A file is "tagged" if it contains the FDL audit comment referencing the feature
  const featureRe = new RegExp(`FDL:\\s*feature=${escRegex(bp.feature)}`, "i");
  for (const [file, content] of Object.entries(source.sourceByFile)) {
    if (featureRe.test(content)) tagged++;
  }
  // Rather than demanding every file be tagged (too strict), credit the ratio
  // of files that MENTION the feature name (by FDL audit or otherwise).
  if (tagged === 0) {
    // Fall back to plain presence
    const fallback = Object.values(source.sourceByFile).filter((c) => containsIdent(c, bp.feature)).length;
    if (fallback === 0) return { score: 0, max: 4, detail: { tagged: 0, total: files.length }, missing: [] };
    return { score: 2, max: 4, detail: { tagged: 0, mentions: fallback, total: files.length }, missing: [] };
  }
  const ratio = Math.min(1, tagged / 1); // credit in full if at least one file tagged
  return { score: Math.round(ratio * 4), max: 4, detail: { tagged, total: files.length }, missing: [] };
}

async function scoreTests(bp, projectDir) {
  const tests = await collectTests(projectDir);
  if (tests.length === 0) return { score: 0, max: 3, detail: { total: 0 }, missing: [] };
  let relevant = 0;
  for (const t of tests) {
    try {
      const c = readFileSync(t, "utf-8");
      if (containsIdent(c, bp.feature) || matchesAnyCase(c, bp.feature)) relevant++;
    } catch {}
  }
  if (relevant === 0) return { score: 1, max: 3, detail: { total: tests.length, relevant: 0 }, missing: [] };
  return { score: 3, max: 3, detail: { total: tests.length, relevant }, missing: [] };
}

// ─── Aggregator ───────────────────────────────────────────

async function scoreProject(bp, projectDir) {
  const source = await collectSource(projectDir);
  const dims = {
    fields: scoreFields(bp, source),
    outcomes: scoreOutcomes(bp, source),
    errors: scoreErrors(bp, source),
    events: scoreEvents(bp, source),
    rules: scoreRules(bp, source),
    validation: scoreValidation(bp, source),
    relationships: scoreRelationships(bp, source),
    audit_trail: scoreAuditTrail(bp, source),
    tests: await scoreTests(bp, projectDir),
  };
  const total = Object.values(dims).reduce((s, d) => s + d.score, 0);
  const max = Object.values(dims).reduce((s, d) => s + d.max, 0);
  return {
    feature: bp.feature,
    project: projectDir,
    files_scanned: source.files.length,
    total,
    max,
    percent: Math.round((total / max) * 100),
    dims,
  };
}

// ─── Gap extractor (what /fdl-generate should patch) ──────

function extractGaps(result) {
  const gaps = [];
  for (const [dim, data] of Object.entries(result.dims)) {
    if (data.missing && data.missing.length > 0) {
      gaps.push({ dimension: dim, items: data.missing, score: `${data.score}/${data.max}` });
    }
  }
  return gaps;
}

// ─── CLI ──────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const verbose = args.includes("--verbose");
  const gaps = args.includes("--gaps");
  const positional = args.filter((a) => !a.startsWith("--"));

  if (positional.length < 2) {
    console.error("Usage: project-score.js <blueprint.yaml> <project-dir> [--json] [--gaps] [--verbose]");
    process.exit(2);
  }

  const [blueprintPath, projectDir] = positional.map((p) => resolve(p));
  let bp;
  try {
    bp = YAML.parse(readFileSync(blueprintPath, "utf-8"));
  } catch (err) {
    console.error(`Failed to parse blueprint: ${err.message}`);
    process.exit(2);
  }
  if (!bp || !bp.feature) {
    console.error(`Blueprint has no feature name`);
    process.exit(2);
  }

  const result = await scoreProject(bp, projectDir);
  const gapList = extractGaps(result);

  if (jsonOutput) {
    console.log(JSON.stringify({ ...result, gaps: gapList }, null, 2));
    return;
  }

  const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    dim: "\x1b[2m",
    bold: "\x1b[1m",
  };
  const colorFor = (p) => {
    if (p >= 80) return colors.green;
    if (p >= 60) return colors.yellow;
    if (p >= 40) return colors.cyan;
    return colors.red;
  };

  console.log(`\n${colors.bold}Project Coverage for ${colors.cyan}${bp.feature}${colors.reset}`);
  console.log(`  blueprint: ${relative(process.cwd(), blueprintPath).replace(/\\/g, "/")}`);
  console.log(`  project:   ${relative(process.cwd(), projectDir).replace(/\\/g, "/")}`);
  console.log(`  scanned:   ${result.files_scanned} source file${result.files_scanned === 1 ? "" : "s"}`);
  console.log(
    `  ${colorFor(result.percent)}${colors.bold}coverage:  ${result.percent}/100 (${result.total}/${result.max})${colors.reset}\n`
  );

  const labels = {
    fields: "Fields",
    outcomes: "Outcomes",
    errors: "Error codes",
    events: "Events",
    rules: "Security rules",
    validation: "Field validation",
    relationships: "Relationships",
    audit_trail: "Audit trail",
    tests: "Tests",
  };

  for (const [name, d] of Object.entries(result.dims)) {
    const pct = d.max > 0 ? Math.round((d.score / d.max) * 100) : 0;
    const bar = "█".repeat(Math.round(d.score)) + "░".repeat(d.max - Math.round(d.score));
    console.log(`  ${colorFor(pct)}${labels[name].padEnd(18)}${colors.reset} ${bar}  ${d.score}/${d.max}`);
    if (verbose && d.detail) {
      const detail = Object.entries(d.detail).map(([k, v]) => `${k}=${v}`).join(" ");
      if (detail) console.log(`  ${colors.dim}                    ${detail}${colors.reset}`);
    }
  }

  if (gaps) {
    console.log(`\n${colors.bold}Gaps (items /fdl-generate should add to reach higher coverage):${colors.reset}`);
    if (gapList.length === 0) {
      console.log(`  ${colors.green}(none — full coverage)${colors.reset}`);
    } else {
      for (const g of gapList) {
        console.log(`  ${colors.red}${labels[g.dimension] || g.dimension}${colors.reset} ${colors.dim}${g.score}${colors.reset}`);
        for (const item of g.items.slice(0, 10)) {
          console.log(`    - ${item}`);
        }
        if (g.items.length > 10) console.log(`    ${colors.dim}...and ${g.items.length - 10} more${colors.reset}`);
      }
    }
  }

  console.log("");

  // Exit code so CI / skills can branch on it
  process.exit(result.percent >= 70 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
