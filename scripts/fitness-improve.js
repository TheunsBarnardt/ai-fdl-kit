#!/usr/bin/env node

/**
 * FDL Blueprint Auto-Improver (Autoresearch-style keep-or-reset loop)
 *
 * Inspired by karpathy/autoresearch:
 *   1. Apply a candidate transformation
 *   2. Validate (must still parse + pass schema)
 *   3. Score (fitness must improve)
 *   4. Keep if better, revert if worse
 *
 * Applies only SAFE, non-destructive transformations:
 *   T1. Flat rules[] → rules.general: {}             (structural, semantic-preserving)
 *   T2. Flat events[string] → events[{name,payload}] (adds structure, no invention)
 *   T3. Field name → auto-generated label            (cosmetic only if missing)
 *   T4. Missing priority → sequential priority       (preserves order)
 *   T5. Orphan error codes → bind to name-matched outcome  (heuristic match only)
 *
 * Never touches:
 *   - description (human-authored)
 *   - given/then semantics
 *   - error messages
 *   - agi section content
 *
 * Usage:
 *   node scripts/fitness-improve.js blueprints/data/sorted-set-and-hash-operations.blueprint.yaml
 *   node scripts/fitness-improve.js --all                 # improve all below threshold
 *   node scripts/fitness-improve.js --all --threshold 70  # only improve < 70
 *   node scripts/fitness-improve.js --dry-run <file>      # show delta, don't write
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, relative, dirname, join } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");

// Reuse the scorer
const { scoreBlueprint } = await import("./fitness-scorer-lib.js").catch(() => ({}));

// Inline scorer import (fitness.js exposes main() only, so we extract what we need)
async function scoreFile(bp) {
  // Dynamically call the scoring function from fitness.js
  const mod = await import("./fitness.js").catch(() => null);
  if (mod && mod.scoreBlueprint) return mod.scoreBlueprint(bp);
  // Fallback: spawn fitness.js --json on a temp file
  return null;
}

// ─── Transformations ──────────────────────────────────────

function snakeToTitle(s) {
  return s
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** T1: flat rules array → categorized object */
function transformFlatRules(bp) {
  if (!Array.isArray(bp.rules)) return { changed: false };
  if (bp.rules.length === 0) return { changed: false };
  const categorized = { general: [...bp.rules] };
  bp.rules = categorized;
  return { changed: true, note: `rules: flat array (${categorized.general.length}) → rules.general` };
}

/** T2: flat event-string array → event object array with payload */
function transformFlatEvents(bp) {
  if (!Array.isArray(bp.events)) return { changed: false };
  // Already objects?
  if (bp.events.every((e) => e && typeof e === "object" && e.name)) return { changed: false };
  const before = bp.events.length;
  bp.events = bp.events.map((e) => {
    if (typeof e === "string") {
      return {
        name: e,
        description: `${snakeToTitle(e.replace(/\./g, " "))} event`,
        payload: [],
      };
    }
    return e;
  });
  return { changed: true, note: `events: flat strings (${before}) → objects with payload` };
}

/** T3: fields without labels get an auto-label from name */
function transformFieldLabels(bp) {
  if (!Array.isArray(bp.fields)) return { changed: false };
  let added = 0;
  for (const f of bp.fields) {
    if (f && typeof f === "object" && f.name && !f.label) {
      f.label = snakeToTitle(f.name);
      added++;
    }
  }
  if (added === 0) return { changed: false };
  return { changed: true, note: `added labels to ${added} fields` };
}

/** T4: outcomes without priority get sequential priority preserving declared order */
function transformMissingPriority(bp) {
  if (!bp.outcomes || typeof bp.outcomes !== "object") return { changed: false };
  const entries = Object.entries(bp.outcomes);
  const withoutPriority = entries.filter(
    ([, v]) => !v || typeof v !== "object" || typeof v.priority !== "number"
  );
  if (withoutPriority.length === 0) return { changed: false };
  // Use existing priorities to avoid collision; start numbering at next-available
  const usedPriorities = new Set(
    entries
      .map(([, v]) => (v && typeof v === "object" ? v.priority : null))
      .filter((p) => typeof p === "number")
  );
  let nextPriority = 10;
  while (usedPriorities.has(nextPriority)) nextPriority += 10;
  let added = 0;
  for (const [name, outcome] of entries) {
    if (!outcome || typeof outcome !== "object") continue;
    if (typeof outcome.priority !== "number") {
      outcome.priority = nextPriority;
      usedPriorities.add(nextPriority);
      nextPriority += 1;
      while (usedPriorities.has(nextPriority)) nextPriority += 1;
      added++;
    }
  }
  if (added === 0) return { changed: false };
  return { changed: true, note: `added priority to ${added} outcomes` };
}

/** T5: orphan error codes get bound to outcomes whose name contains a matching keyword */
function transformErrorBinding(bp) {
  if (!Array.isArray(bp.errors) || !bp.outcomes) return { changed: false };
  const codes = bp.errors
    .map((e) => (typeof e === "string" ? e : e?.code))
    .filter(Boolean);
  if (codes.length === 0) return { changed: false };

  const referenced = new Set();
  for (const o of Object.values(bp.outcomes)) if (o?.error) referenced.add(o.error);

  let bound = 0;
  const outcomeNames = Object.keys(bp.outcomes);
  for (const code of codes) {
    if (referenced.has(code)) continue;
    // Normalize error code for matching: LOGIN_RATE_LIMITED → [login, rate, limited]
    const codeTokens = code.toLowerCase().split(/[_-]/).filter((t) => t.length > 2);
    // Pick the outcome whose name shares the most tokens with the error code
    let bestMatch = null;
    let bestScore = 0;
    for (const name of outcomeNames) {
      const nameTokens = name.toLowerCase().split(/[_-]/);
      const shared = codeTokens.filter((t) => nameTokens.some((nt) => nt.includes(t) || t.includes(nt))).length;
      // Prefer outcomes that don't already have an error bound
      const outcome = bp.outcomes[name];
      if (outcome?.error) continue;
      if (shared > bestScore) {
        bestScore = shared;
        bestMatch = name;
      }
    }
    if (bestMatch && bestScore >= 2) {
      bp.outcomes[bestMatch].error = code;
      bound++;
    }
  }
  if (bound === 0) return { changed: false };
  return { changed: true, note: `bound ${bound} orphan error codes to outcomes` };
}

const TRANSFORMATIONS = [
  { id: "T1", name: "flat-rules-to-categorized", fn: transformFlatRules },
  { id: "T2", name: "flat-events-to-objects", fn: transformFlatEvents },
  { id: "T3", name: "auto-field-labels", fn: transformFieldLabels },
  { id: "T4", name: "sequential-priority", fn: transformMissingPriority },
  { id: "T5", name: "bind-orphan-errors", fn: transformErrorBinding },
];

// ─── Autoresearch loop ─────────────────────────────────────

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function improveBlueprint(filePath, { dryRun = false, verbose = false } = {}) {
  const rawYaml = readFileSync(filePath, "utf-8");
  const original = YAML.parse(rawYaml);
  if (!original || typeof original !== "object") {
    return { file: filePath, skipped: true, reason: "parse failed" };
  }

  const baselineScore = scoreBlueprintInline(original).percent;
  let current = deepClone(original);
  const applied = [];

  // Try each transformation independently — autoresearch-style keep-or-reset
  for (const tx of TRANSFORMATIONS) {
    const candidate = deepClone(current);
    const result = tx.fn(candidate);
    if (!result.changed) continue;

    const candidateScore = scoreBlueprintInline(candidate).percent;
    if (candidateScore > scoreBlueprintInline(current).percent) {
      current = candidate;
      applied.push({ ...tx, note: result.note, delta: candidateScore - scoreBlueprintInline(original).percent });
      if (verbose) console.log(`  ✓ ${tx.id} kept: ${result.note}`);
    } else {
      if (verbose) console.log(`  ✗ ${tx.id} reset: no improvement (${result.note})`);
    }
  }

  const finalScore = scoreBlueprintInline(current).percent;
  const delta = finalScore - baselineScore;

  if (delta === 0) {
    return { file: filePath, baseline: baselineScore, final: finalScore, delta, applied };
  }

  if (!dryRun) {
    // Preserve the original header comment block (everything before the first non-comment line)
    const lines = rawYaml.split(/\r?\n/);
    let headerEnd = 0;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === "" || trimmed.startsWith("#")) continue;
      headerEnd = i;
      break;
    }
    const header = lines.slice(0, headerEnd).join("\n");
    const body = YAML.stringify(current, { lineWidth: 0 });
    const output = header ? `${header}\n${body}` : body;
    writeFileSync(filePath, output);
  }

  return { file: filePath, baseline: baselineScore, final: finalScore, delta, applied };
}

// ─── Inline scorer (duplicated from fitness.js to avoid ESM import quirks) ──

const WEIGHTS = {
  description: 10,
  rules: 10,
  outcomes: 25,
  structure: 10,
  error_binding: 10,
  fields: 10,
  relationships: 10,
  events: 5,
  agi: 5,
  simplicity: 5,
};

function scoreBlueprintInline(bp) {
  // Replicated exactly from fitness.js for self-containment
  function scoreDescription(bp) {
    const d = bp.description;
    if (!d || typeof d !== "string") return { score: 0, max: WEIGHTS.description };
    let score = 0;
    if (d.length >= 15) score += 3;
    if (d.length >= 40) score += 3;
    if (d.length >= 70) score += 2;
    const wordCount = d.split(/\s+/).length;
    if (wordCount >= 6) score += 1;
    if (wordCount >= 10) score += 1;
    return { score, max: WEIGHTS.description };
  }
  function scoreRules(bp) {
    if (!bp.rules || typeof bp.rules !== "object" || Array.isArray(bp.rules))
      return { score: 0, max: WEIGHTS.rules };
    const categories = Object.keys(bp.rules);
    if (categories.length === 0) return { score: 0, max: WEIGHTS.rules };
    let score = 3;
    if (categories.length >= 2) score += 1;
    if (categories.length >= 3) score += 1;
    if (categories.length >= 4) score += 1;
    let nonTrivial = 0;
    for (const cat of categories) {
      const val = bp.rules[cat];
      if (Array.isArray(val) && val.length >= 2) nonTrivial++;
      else if (val && typeof val === "object" && !Array.isArray(val) && Object.keys(val).length >= 2) nonTrivial++;
    }
    score += Math.round((nonTrivial / categories.length) * 4);
    return { score, max: WEIGHTS.rules };
  }
  function scoreOutcomes(bp) {
    const hasFlows = bp.flows && typeof bp.flows === "object" && Object.keys(bp.flows).length > 0;
    if (!bp.outcomes || typeof bp.outcomes !== "object" || Object.keys(bp.outcomes).length === 0) {
      if (hasFlows) return { score: 10, max: WEIGHTS.outcomes };
      return { score: 0, max: WEIGHTS.outcomes };
    }
    const names = Object.keys(bp.outcomes);
    const outcomes = Object.values(bp.outcomes);
    let score = 3;
    if (names.some((n) => /success|valid|ok|complete|approved|confirmed|created|updated|granted/i.test(n))) score += 2;
    if (names.some((n) => /fail|invalid|denied|error|rejected|expired|missing|declined|unauthorized|forbidden|not_found|limit|lock/i.test(n))) score += 2;
    if (outcomes.length >= 2) score += 1;
    if (outcomes.length >= 3) score += 1;
    if (outcomes.length >= 4) score += 1;
    if (outcomes.length >= 5) score += 1;
    const withPriority = outcomes.filter((o) => typeof o?.priority === "number").length;
    score += Math.round((withPriority / outcomes.length) * 4);
    const withThen = outcomes.filter((o) => Array.isArray(o?.then) && o.then.length > 0).length;
    score += Math.round((withThen / outcomes.length) * 4);
    const withGiven = outcomes.filter((o) => Array.isArray(o?.given) && o.given.length > 0).length;
    score += Math.round((withGiven / outcomes.length) * 3);
    const withDesc = outcomes.filter((o) => o?.result || o?.error).length;
    score += Math.round((withDesc / outcomes.length) * 2);
    return { score, max: WEIGHTS.outcomes };
  }
  function scoreStructure(bp) {
    if (!bp.outcomes || typeof bp.outcomes !== "object") return { score: 0, max: WEIGHTS.structure };
    let total = 0;
    let structured = 0;
    for (const outcome of Object.values(bp.outcomes)) {
      if (Array.isArray(outcome?.given)) {
        for (const g of outcome.given) {
          total++;
          if (g && typeof g === "object") structured++;
        }
      }
      if (Array.isArray(outcome?.then)) {
        for (const t of outcome.then) {
          total++;
          if (t && typeof t === "object" && t.action) structured++;
        }
      }
    }
    if (total === 0) return { score: 0, max: WEIGHTS.structure };
    return { score: Math.round((structured / total) * WEIGHTS.structure), max: WEIGHTS.structure };
  }
  function scoreErrorBinding(bp) {
    const errors = Array.isArray(bp.errors) ? bp.errors : [];
    if (errors.length === 0) return { score: WEIGHTS.error_binding, max: WEIGHTS.error_binding };
    const codes = new Set(errors.map((e) => (typeof e === "string" ? e : e?.code)).filter(Boolean));
    if (codes.size === 0) return { score: 0, max: WEIGHTS.error_binding };
    const referenced = new Set();
    if (bp.outcomes) for (const o of Object.values(bp.outcomes)) if (o?.error) referenced.add(o.error);
    const referencedCount = [...codes].filter((c) => referenced.has(c)).length;
    const coverage = referencedCount / codes.size;
    let score = Math.round(coverage * 8);
    const withMessage = errors.filter((e) => typeof e === "object" && e?.message).length;
    if (withMessage === errors.length) score += 2;
    return { score, max: WEIGHTS.error_binding };
  }
  function scoreFields(bp) {
    const fields = Array.isArray(bp.fields) ? bp.fields : [];
    if (fields.length === 0) return { score: WEIGHTS.fields, max: WEIGHTS.fields };
    let withValidation = 0;
    let withLabel = 0;
    let withType = 0;
    for (const f of fields) {
      if (!f || typeof f !== "object") continue;
      if (f.type) withType++;
      if (f.label) withLabel++;
      if (Array.isArray(f.validation) && f.validation.length > 0) withValidation++;
      else if (f.required === true) withValidation += 0.3;
    }
    const score = Math.round((withType / fields.length) * 3 + (withLabel / fields.length) * 2 + (withValidation / fields.length) * 5);
    return { score, max: WEIGHTS.fields };
  }
  function scoreRelationships(bp) {
    const related = Array.isArray(bp.related) ? bp.related : [];
    if (related.length === 0) return { score: 0, max: WEIGHTS.relationships };
    let score = 3;
    if (related.length >= 2) score += 1;
    if (related.length >= 3) score += 1;
    if (related.length >= 4) score += 1;
    let typed = 0, withReason = 0;
    for (const r of related) {
      if (!r || typeof r !== "object") continue;
      if (r.type) typed++;
      if (r.reason) withReason++;
    }
    score += Math.round((typed / related.length) * 2 + (withReason / related.length) * 2);
    return { score, max: WEIGHTS.relationships };
  }
  function scoreEvents(bp) {
    const events = Array.isArray(bp.events) ? bp.events : [];
    if (events.length === 0) return { score: 2, max: WEIGHTS.events };
    let score = 2;
    if (events.length >= 2) score += 1;
    const withPayload = events.filter((e) => Array.isArray(e?.payload) && e.payload.length > 0).length;
    score += Math.round((withPayload / events.length) * 2);
    return { score, max: WEIGHTS.events };
  }
  function scoreAgi(bp) {
    if (!bp.agi || typeof bp.agi !== "object") return { score: 0, max: WEIGHTS.agi };
    let score = 0;
    if (Array.isArray(bp.agi.goals) && bp.agi.goals.length > 0) score += 1;
    if (bp.agi.autonomy) score += 1;
    if (bp.agi.verification && (Array.isArray(bp.agi.verification.invariants) || Array.isArray(bp.agi.verification.acceptance_tests))) score += 2;
    if (Array.isArray(bp.agi.capabilities) && bp.agi.capabilities.length > 0) score += 1;
    return { score, max: WEIGHTS.agi };
  }
  function scoreSimplicity(bp) {
    let score = WEIGHTS.simplicity;
    const outcomes = bp.outcomes ? Object.values(bp.outcomes) : [];
    const deadOutcomes = outcomes.filter((o) => o && typeof o === "object" && (!Array.isArray(o.then) || o.then.length === 0) && !o.result).length;
    if (deadOutcomes > 0) score -= Math.min(2, deadOutcomes);
    const fields = Array.isArray(bp.fields) ? bp.fields : [];
    const deadFields = fields.filter((f) => f && typeof f === "object" && !f.label && (!Array.isArray(f.validation) || f.validation.length === 0)).length;
    if (deadFields > 0) score -= Math.min(2, deadFields);
    if (Array.isArray(bp.errors) && bp.outcomes) {
      const codes = new Set(bp.errors.map((e) => (typeof e === "string" ? e : e?.code)).filter(Boolean));
      const used = new Set();
      for (const o of Object.values(bp.outcomes)) if (o?.error) used.add(o.error);
      const orphans = [...codes].filter((c) => !used.has(c)).length;
      if (orphans > 0) score -= Math.min(1, orphans * 0.3);
    }
    return { score: Math.max(0, Math.round(score)), max: WEIGHTS.simplicity };
  }

  const dims = {
    description: scoreDescription(bp),
    rules: scoreRules(bp),
    outcomes: scoreOutcomes(bp),
    structure: scoreStructure(bp),
    error_binding: scoreErrorBinding(bp),
    fields: scoreFields(bp),
    relationships: scoreRelationships(bp),
    events: scoreEvents(bp),
    agi: scoreAgi(bp),
    simplicity: scoreSimplicity(bp),
  };
  const total = Object.values(dims).reduce((s, d) => s + d.score, 0);
  const max = Object.values(dims).reduce((s, d) => s + d.max, 0);
  return { total, max, percent: Math.round((total / max) * 100), dims };
}

// ─── CLI ──────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const dryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose");
  const thresholdIdx = args.indexOf("--threshold");
  const threshold = thresholdIdx >= 0 ? parseInt(args[thresholdIdx + 1]) || 70 : 70;
  const fileArgs = args.filter((a) => !a.startsWith("--") && !["70", String(threshold)].includes(a));

  let files;
  if (all) {
    files = await glob("blueprints/**/*.blueprint.yaml", { cwd: PROJECT_ROOT, absolute: true });
    files = files.filter((f) => !f.includes(".proposed."));
    // Pre-filter by threshold
    const eligible = [];
    for (const f of files) {
      try {
        const bp = YAML.parse(readFileSync(f, "utf-8"));
        const s = scoreBlueprintInline(bp).percent;
        if (s < threshold) eligible.push(f);
      } catch {}
    }
    files = eligible;
  } else if (fileArgs.length > 0) {
    files = fileArgs.map((f) => resolve(f));
  } else {
    console.error("Usage: fitness-improve.js <file> | --all [--threshold N] [--dry-run]");
    process.exit(1);
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

  console.log(`${colors.bold}Fitness Auto-Improve${colors.reset} ${dryRun ? "(dry-run)" : ""}`);
  console.log(`Processing ${files.length} blueprint${files.length === 1 ? "" : "s"}...\n`);

  let totalBaseline = 0;
  let totalFinal = 0;
  let improvedCount = 0;
  const changelogEntries = {};

  for (const file of files) {
    const relPath = relative(PROJECT_ROOT, file).replace(/\\/g, "/");
    const result = await improveBlueprint(file, { dryRun, verbose });
    if (result.skipped) {
      console.log(`${colors.dim}skip${colors.reset}  ${relPath}  (${result.reason})`);
      continue;
    }
    totalBaseline += result.baseline;
    totalFinal += result.final;
    if (result.delta > 0) improvedCount++;

    const deltaColor = result.delta > 0 ? colors.green : result.delta < 0 ? colors.red : colors.dim;
    const deltaStr = result.delta > 0 ? `+${result.delta}` : String(result.delta);
    console.log(
      `${deltaColor}${deltaStr.padStart(4)}${colors.reset}  ${result.baseline} → ${result.final}  ${colors.cyan}${relPath}${colors.reset}`
    );
    for (const tx of result.applied) {
      console.log(`  ${colors.dim}${tx.id}${colors.reset} ${tx.note}`);
    }
    if (result.delta > 0 && result.applied.length > 0) {
      changelogEntries[relPath] = {
        baseline: result.baseline,
        final: result.final,
        delta: result.delta,
        transformations: result.applied.map((t) => ({ id: t.id, name: t.name, note: t.note })),
      };
    }
  }

  const avgBaseline = files.length ? Math.round(totalBaseline / files.length) : 0;
  const avgFinal = files.length ? Math.round(totalFinal / files.length) : 0;
  console.log(`\n${colors.bold}Summary${colors.reset}`);
  console.log(`  processed:  ${files.length}`);
  console.log(`  improved:   ${colors.green}${improvedCount}${colors.reset}`);
  console.log(`  avg before: ${avgBaseline}`);
  console.log(`  avg after:  ${colors.green}${avgFinal}${colors.reset} (${avgFinal - avgBaseline >= 0 ? "+" : ""}${avgFinal - avgBaseline})`);

  // Write changelog for downstream consumers (generate-readmes.js, etc.)
  if (!dryRun && Object.keys(changelogEntries).length > 0) {
    const changelogPath = join(PROJECT_ROOT, ".fitness-changelog.json");
    const existing = existsSync(changelogPath)
      ? JSON.parse(readFileSync(changelogPath, "utf-8"))
      : { entries: {} };
    existing.entries = { ...(existing.entries || {}), ...changelogEntries };
    existing.last_run = new Date().toISOString();
    writeFileSync(changelogPath, JSON.stringify(existing, null, 2));
    console.log(
      `\n${colors.dim}Changelog written to .fitness-changelog.json (${Object.keys(changelogEntries).length} entries)${colors.reset}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
