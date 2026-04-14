#!/usr/bin/env node

/**
 * post-gen-scan.js
 *
 * Static fake/placeholder scanner for /fdl-generate output. This is Gate 1
 * of the post-gen pipeline (the others are compile-gate.js and the
 * /fdl-pr-review skill). Enforces the contract pinned by the
 * `code-quality-baseline` and `security-baseline` capability blueprints,
 * plus per-feature endpoint pinning derived from `api.http.path`.
 *
 * Usage:
 *   node scripts/post-gen-scan.js --code <dir-or-file> --blueprint <path-to-json> [--blueprint ...] [--json]
 *
 * Exit codes:
 *   0 — clean
 *   1 — findings at severity `warn` (no critical)
 *   2 — at least one finding at severity `critical`
 *   3 — usage / IO error
 *
 * Report shape (--json):
 *   { findings: [{ file, line, rule, severity, message, evidence }], summary: { critical, warn, info } }
 *
 * Why this exists: the 2026-04-12 fake-endpoint incident shipped because
 * no static gate cross-checked emitted endpoint literals against the
 * blueprint's pinned api.http.path. This scanner makes that mismatch
 * a hard fail, alongside TODO/mock/sample/secret leakage.
 */

import { readFileSync, statSync, readdirSync } from 'fs';
import { extname, join, relative, resolve, sep } from 'path';

// ─── Constants ────────────────────────────────────────────────────────────

// File extensions the scanner reads. Anything else is skipped (lockfiles,
// images, JSON fixtures, etc. — the false-positive cost outweighs the value).
const SCANNABLE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py',
  '.go',
  '.dart',
  '.cs',
  '.java', '.kt',
  '.rb',
  '.php',
  '.rs',
  '.swift',
  '.vue', '.svelte',
]);

// Path patterns that mark a file as test code. Test files are allowed to
// contain `mock`, `stub`, `fake`, etc. Aligned with code-quality-baseline.
const TEST_PATH_PATTERN = /(^|[\\/])(__tests__|tests?|spec|specs|fixtures|__mocks__|e2e)([\\/]|$)|\.(test|spec)\.[a-z]+$/i;

// Directories the walker never descends into.
const SKIP_DIR_PATTERN = /^(node_modules|\.git|dist|build|out|target|\.next|\.nuxt|coverage|vendor|__pycache__)$/;

// Secret patterns. MUST stay in sync with SECRET_PATTERNS in scripts/validate.js.
const SECRET_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/, label: 'OpenAI/Stripe API key' },
  { pattern: /pk_(test|live)_[a-zA-Z0-9]{20,}/, label: 'Stripe publishable key' },
  { pattern: /AKIA[A-Z0-9]{16}/, label: 'AWS access key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, label: 'GitHub personal access token' },
  { pattern: /gho_[a-zA-Z0-9]{36}/, label: 'GitHub OAuth token' },
  { pattern: /glpat-[a-zA-Z0-9\-_]{20,}/, label: 'GitLab personal access token' },
  { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, label: 'JWT token' },
  { pattern: /(mongodb|postgres|postgresql|mysql|redis|amqp):\/\/[^\s'"`]+:[^\s'"`]+@/, label: 'Connection string with credentials' },
  { pattern: /BEGIN\s+(RSA|EC|OPENSSH|DSA|PGP)\s+PRIVATE\s+KEY/, label: 'Private key' },
  { pattern: /xox[bpsar]-[a-zA-Z0-9\-]{10,}/, label: 'Slack token' },
  { pattern: /AIza[a-zA-Z0-9_-]{35}/, label: 'Google API key' },
];

// Placeholder markers — banned outside test paths by code-quality-baseline.
const PLACEHOLDER_MARKER_PATTERN = /\b(TODO|FIXME|XXX|HACK|TEMP)\b/;

// Placeholder identifiers — `mockUser`, `stub_response`, `FAKE_KEY`, etc.
// We only flag camelCase / snake_case / SCREAMING usages so the noun "fake"
// inside a comment ("not a real fake") doesn't trip the gate.
const PLACEHOLDER_IDENT_PATTERN = /\b(mock|stub|fake|dummy|sample)([A-Z_][A-Za-z0-9_]*)\b/;

// Hardcoded sample data. Each entry is `{ pattern, label }`. These are the
// values that masquerade as configuration and ship to prod.
const SAMPLE_DATA_PATTERNS = [
  { pattern: /\blocalhost\b/, label: 'localhost literal' },
  { pattern: /\b127\.0\.0\.1\b/, label: '127.0.0.1 literal' },
  { pattern: /\bexample\.com\b/, label: 'example.com literal' },
  { pattern: /\btest@test\.com\b/i, label: 'test@test.com literal' },
  { pattern: /\bfoo@bar\.com\b/i, label: 'foo@bar.com literal' },
  { pattern: /Lorem ipsum/i, label: 'Lorem ipsum literal' },
  { pattern: /sk-test-/, label: 'sk-test- placeholder key' },
];

// Endpoint-like string literals: a leading slash followed by at least one
// path segment of safe chars. We extract these and compare against the set
// declared by the consuming blueprint(s)'s api.http.path entries.
//
// Tuned to avoid common false positives:
//   - regex literals are excluded by requiring quoted context at extraction time
//   - paths shorter than two segments (e.g. "/x") are ignored
//   - paths that start with one of the IGNORE_PATH_PREFIXES below are ignored
const ENDPOINT_LITERAL_PATTERN = /['"`](\/[a-z0-9][a-z0-9/_-]*\/[a-z0-9/_-]+)['"`]/gi;
const IGNORE_PATH_PREFIXES = [
  '/components/',  // shadcn-style imports
  '/lib/',
  '/utils/',
  '/src/',
  '/node_modules/',
  '/static/',
  '/public/',
  '/assets/',
  '/images/',
  '/img/',
  '/fonts/',
  '/dist/',
  '/build/',
  '/__tests__/',
  '/tests/',
];

// ─── CLI parsing ──────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { code: null, blueprints: [], json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--code') args.code = argv[++i];
    else if (a === '--blueprint') args.blueprints.push(argv[++i]);
    else if (a === '--json') args.json = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function usage() {
  return [
    'Usage: node scripts/post-gen-scan.js --code <dir-or-file> --blueprint <path-to-json> [--blueprint ...] [--json]',
    '',
    'Exit codes: 0 clean, 1 warn-only, 2 critical, 3 usage error',
  ].join('\n');
}

// ─── Filesystem walking ───────────────────────────────────────────────────

function walk(rootPath) {
  const out = [];
  const stack = [rootPath];
  while (stack.length > 0) {
    const cur = stack.pop();
    let st;
    try { st = statSync(cur); } catch { continue; }
    if (st.isFile()) {
      out.push(cur);
      continue;
    }
    if (!st.isDirectory()) continue;
    for (const entry of readdirSync(cur)) {
      if (SKIP_DIR_PATTERN.test(entry)) continue;
      stack.push(join(cur, entry));
    }
  }
  return out;
}

function isScannable(filePath) {
  return SCANNABLE_EXTENSIONS.has(extname(filePath).toLowerCase());
}

function isTestPath(filePath) {
  return TEST_PATH_PATTERN.test(filePath);
}

// ─── Blueprint loading ────────────────────────────────────────────────────

function loadBlueprints(paths) {
  const declared = { paths: new Set(), antiPatterns: [], features: [] };
  for (const p of paths) {
    const raw = readFileSync(p, 'utf-8');
    const bp = JSON.parse(raw);
    declared.features.push(bp.feature || p);
    const httpPath = bp?.api?.http?.path;
    if (typeof httpPath === 'string') declared.paths.add(httpPath);
    if (Array.isArray(bp?.anti_patterns)) {
      for (const ap of bp.anti_patterns) declared.antiPatterns.push(ap);
    }
  }
  return declared;
}

// ─── Per-file scans ───────────────────────────────────────────────────────

function scanFile(filePath, sourceText, declared) {
  const findings = [];
  const isTest = isTestPath(filePath);
  const lines = sourceText.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    // 1. Placeholder markers (TODO / FIXME / etc.) — banned everywhere
    //    including tests. Test files can fail too — incomplete tests are
    //    incomplete code.
    const markerMatch = line.match(PLACEHOLDER_MARKER_PATTERN);
    if (markerMatch) {
      findings.push({
        file: filePath,
        line: lineNo,
        rule: 'no-placeholder-marker',
        severity: 'critical',
        message: `placeholder marker '${markerMatch[1]}' — generated code must be complete`,
        evidence: line.trim(),
        capability: 'code-quality-baseline',
      });
    }

    // 2. Placeholder identifiers (mockUser, stubResponse, FAKE_KEY) —
    //    only flag outside test paths.
    if (!isTest) {
      const identMatch = line.match(PLACEHOLDER_IDENT_PATTERN);
      if (identMatch) {
        findings.push({
          file: filePath,
          line: lineNo,
          rule: 'no-placeholder-identifier',
          severity: 'critical',
          message: `placeholder identifier starting with '${identMatch[1]}' — outside a test path this leaks into prod`,
          evidence: line.trim(),
          capability: 'code-quality-baseline',
        });
      }
    }

    // 3. Sample data literals — only flag outside test paths.
    if (!isTest) {
      for (const { pattern, label } of SAMPLE_DATA_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({
            file: filePath,
            line: lineNo,
            rule: 'no-sample-data',
            severity: 'critical',
            message: `hardcoded sample data: ${label}`,
            evidence: line.trim(),
            capability: 'code-quality-baseline',
          });
        }
      }
    }

    // 4. Secret patterns — banned everywhere, no test exception. The
    //    validator already enforces this for blueprints; we replay it for
    //    generated code.
    for (const { pattern, label } of SECRET_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          file: filePath,
          line: lineNo,
          rule: 'no-secret-leak',
          severity: 'critical',
          message: `looks like a ${label} — remove and rotate immediately`,
          evidence: '<redacted>',
          capability: 'security-baseline',
        });
      }
    }

    // 5. Endpoint literal cross-check. Only runs when the consuming
    //    blueprint(s) declared at least one api.http.path. Outside test
    //    paths only — fixtures often contain canonical example URLs.
    if (!isTest && declared.paths.size > 0) {
      let m;
      // Reset regex state for each line (it's stateful with /g).
      ENDPOINT_LITERAL_PATTERN.lastIndex = 0;
      while ((m = ENDPOINT_LITERAL_PATTERN.exec(line)) !== null) {
        const path = m[1];
        if (IGNORE_PATH_PREFIXES.some((pre) => path.startsWith(pre))) continue;
        if (declared.paths.has(path)) continue;
        findings.push({
          file: filePath,
          line: lineNo,
          rule: 'undeclared-endpoint',
          severity: 'critical',
          message: `endpoint literal '${path}' is not declared in any consuming blueprint's api.http.path (declared: ${[...declared.paths].join(', ') || '∅'})`,
          evidence: line.trim(),
          capability: 'code-quality-baseline',
        });
      }
    }
  }

  return findings;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────

export function scan({ code, blueprints }) {
  const codeRoot = resolve(code);
  const declared = loadBlueprints(blueprints);
  const files = walk(codeRoot).filter(isScannable);

  const findings = [];
  for (const f of files) {
    let text;
    try { text = readFileSync(f, 'utf-8'); }
    catch { continue; }
    const rel = relative(process.cwd(), f);
    findings.push(...scanFile(rel, text, declared));
  }

  const summary = { critical: 0, warn: 0, info: 0 };
  for (const f of findings) summary[f.severity] = (summary[f.severity] || 0) + 1;

  return { findings, summary, declared: { paths: [...declared.paths], features: declared.features } };
}

function severityToExit(summary) {
  if (summary.critical > 0) return 2;
  if (summary.warn > 0) return 1;
  return 0;
}

function formatHuman(report) {
  const { findings, summary, declared } = report;
  const lines = [];
  lines.push(`post-gen-scan — ${declared.features.length} blueprint(s), ${declared.paths.length} declared endpoint(s)`);
  lines.push('');
  if (findings.length === 0) {
    lines.push('✓ clean — 0 findings');
    return lines.join('\n');
  }
  for (const f of findings) {
    lines.push(`${f.severity.toUpperCase().padEnd(8)} ${f.file}:${f.line}  [${f.rule}]  ${f.message}`);
    if (f.evidence && f.severity !== 'critical' || f.rule !== 'no-secret-leak') {
      lines.push(`    > ${f.evidence}`);
    }
  }
  lines.push('');
  lines.push(`summary: ${summary.critical} critical, ${summary.warn} warn, ${summary.info} info`);
  return lines.join('\n');
}

// ─── CLI entry ────────────────────────────────────────────────────────────

function main() {
  let args;
  try { args = parseArgs(process.argv); }
  catch (e) { process.stderr.write(`${e.message}\n${usage()}\n`); process.exit(3); }

  if (args.help || !args.code || args.blueprints.length === 0) {
    process.stdout.write(`${usage()}\n`);
    process.exit(args.help ? 0 : 3);
  }

  let report;
  try { report = scan(args); }
  catch (e) { process.stderr.write(`scan failed: ${e.message}\n`); process.exit(3); }

  if (args.json) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  else process.stdout.write(formatHuman(report) + '\n');

  process.exit(severityToExit(report.summary));
}

const isMain = import.meta.url === `file://${process.argv[1]}` ||
               import.meta.url.endsWith(process.argv[1]);
if (isMain) main();
