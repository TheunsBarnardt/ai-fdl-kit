#!/usr/bin/env node

/**
 * FDL Blueprint Fitness Scorer
 *
 * Inspired by karpathy/autoresearch, which reduces "is this model better?" to
 * one number (val_bpb). This scorer reduces "is this blueprint better?" to
 * one number: a fitness score from 0–100.
 *
 * Unlike validate.js (structure) and completeness-check.js (placeholders),
 * this measures the GRADIENT of quality so auto-evolution can make measurable
 * improvements — keep changes if the score goes up, revert if it goes down.
 *
 * Scoring dimensions (100 total):
 *   description    (10) — length, specificity, non-trivial
 *   rules          (10) — has structured categories, non-empty
 *   outcomes       (25) — success + failure paths, structured given/then,
 *                          priorities, result descriptions, transactions
 *   structure      (10) — ratio of structured (object) vs plain-text conditions
 *   error_binding  (10) — every error code is referenced by an outcome
 *   fields         (10) — % of fields with validation rules
 *   relationships  (10) — typed related[] entries with reasons
 *   events          (5) — declared events with payloads
 *   agi             (5) — agi section with goals/invariants/verification
 *   simplicity      (5) — penalty for bloat (unused rules, empty outcomes)
 *
 * Usage:
 *   node scripts/fitness.js                                # score all blueprints
 *   node scripts/fitness.js blueprints/auth/login.blueprint.yaml   # one file
 *   node scripts/fitness.js --bottom 20                    # list 20 worst
 *   node scripts/fitness.js --top 20                       # list 20 best
 *   node scripts/fitness.js --summary                      # overall stats
 *   node scripts/fitness.js --json                         # machine-readable
 *   node scripts/fitness.js --baseline .fitness-baseline.json   # compare to baseline
 *   node scripts/fitness.js --save-baseline .fitness-baseline.json   # save current as baseline
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, relative, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");

// ─── Scoring weights (sum to 100) ─────────────────────────

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

// ─── Individual dimension scorers ─────────────────────────

function scoreDescription(bp) {
  const d = bp.description;
  if (!d || typeof d !== "string") return { score: 0, notes: ["missing description"] };
  const notes = [];
  let score = 0;
  if (d.length >= 15) score += 3;
  else notes.push("description too short");
  if (d.length >= 40) score += 3;
  if (d.length >= 70) score += 2;
  // Specificity: mentions a noun besides the feature name
  const wordCount = d.split(/\s+/).length;
  if (wordCount >= 6) score += 1;
  if (wordCount >= 10) score += 1;
  return { score, max: WEIGHTS.description, notes };
}

function scoreRules(bp) {
  const notes = [];
  if (!bp.rules || typeof bp.rules !== "object" || Array.isArray(bp.rules)) {
    return { score: 0, max: WEIGHTS.rules, notes: ["rules missing or not an object of categories"] };
  }
  const categories = Object.keys(bp.rules);
  if (categories.length === 0) return { score: 0, max: WEIGHTS.rules, notes: ["rules object is empty"] };

  let score = 0;
  // 3 pts: at least one category
  score += 3;
  // Up to 3 pts: having multiple categories
  if (categories.length >= 2) score += 1;
  if (categories.length >= 3) score += 1;
  if (categories.length >= 4) score += 1;

  // Up to 4 pts: every category is non-trivial (structured object or >=2 rules)
  let nonTrivial = 0;
  for (const cat of categories) {
    const val = bp.rules[cat];
    if (Array.isArray(val) && val.length >= 2) nonTrivial++;
    else if (val && typeof val === "object" && !Array.isArray(val) && Object.keys(val).length >= 2) nonTrivial++;
  }
  const ratio = nonTrivial / categories.length;
  score += Math.round(ratio * 4);

  if (ratio < 0.5) notes.push(`${categories.length - nonTrivial} of ${categories.length} rule categories are thin`);
  return { score, max: WEIGHTS.rules, notes };
}

function scoreOutcomes(bp) {
  const notes = [];
  const hasFlows = bp.flows && typeof bp.flows === "object" && Object.keys(bp.flows).length > 0;
  if (!bp.outcomes || typeof bp.outcomes !== "object" || Object.keys(bp.outcomes).length === 0) {
    if (hasFlows) {
      // Workflow blueprints may rely on flows instead — give partial credit
      return { score: 10, max: WEIGHTS.outcomes, notes: ["no outcomes defined — using flows instead"] };
    }
    return { score: 0, max: WEIGHTS.outcomes, notes: ["no outcomes defined"] };
  }

  const names = Object.keys(bp.outcomes);
  const outcomes = Object.values(bp.outcomes);

  let score = 0;
  // 3 pts: at least one outcome
  score += 3;
  // 2 pts: has a success-looking outcome
  const hasSuccess = names.some((n) => /success|valid|ok|complete|approved|confirmed|created|updated|granted/i.test(n));
  if (hasSuccess) score += 2;
  else notes.push("no success outcome");
  // 2 pts: has a failure-looking outcome
  const hasFailure = names.some((n) => /fail|invalid|denied|error|rejected|expired|missing|declined|unauthorized|forbidden|not_found|limit|lock/i.test(n));
  if (hasFailure) score += 2;
  else notes.push("no failure outcome");

  // 4 pts: outcome count scaling (more is better up to a point)
  if (outcomes.length >= 2) score += 1;
  if (outcomes.length >= 3) score += 1;
  if (outcomes.length >= 4) score += 1;
  if (outcomes.length >= 5) score += 1;

  // 4 pts: outcomes with priority (ordered evaluation)
  const withPriority = outcomes.filter((o) => typeof o?.priority === "number").length;
  const priorityRatio = withPriority / outcomes.length;
  score += Math.round(priorityRatio * 4);
  if (priorityRatio < 0.5) notes.push("most outcomes lack priority ordering");

  // 4 pts: outcomes with then[] actions
  const withThen = outcomes.filter((o) => Array.isArray(o?.then) && o.then.length > 0).length;
  const thenRatio = withThen / outcomes.length;
  score += Math.round(thenRatio * 4);
  if (thenRatio < 0.4) notes.push("most outcomes have no side effects declared");

  // 3 pts: outcomes with given[] conditions
  const withGiven = outcomes.filter((o) => Array.isArray(o?.given) && o.given.length > 0).length;
  const givenRatio = withGiven / outcomes.length;
  score += Math.round(givenRatio * 3);

  // 2 pts: outcomes with result (human description) or error binding
  const withDesc = outcomes.filter((o) => o?.result || o?.error).length;
  const descRatio = withDesc / outcomes.length;
  score += Math.round(descRatio * 2);

  return { score, max: WEIGHTS.outcomes, notes };
}

function scoreStructure(bp) {
  // Ratio of structured (object) vs plain-text items in given[] and then[]
  if (!bp.outcomes || typeof bp.outcomes !== "object") {
    return { score: 0, max: WEIGHTS.structure, notes: ["no outcomes to analyze"] };
  }
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
  if (total === 0) return { score: 0, max: WEIGHTS.structure, notes: ["no given/then items to evaluate"] };
  const ratio = structured / total;
  const score = Math.round(ratio * WEIGHTS.structure);
  const notes = ratio < 0.5 ? [`only ${Math.round(ratio * 100)}% of conditions/actions are structured`] : [];
  return { score, max: WEIGHTS.structure, notes };
}

function scoreErrorBinding(bp) {
  const errors = Array.isArray(bp.errors) ? bp.errors : [];
  if (errors.length === 0) {
    // Blueprints without errors (pure data/ui) get full credit — nothing to bind
    return { score: WEIGHTS.error_binding, max: WEIGHTS.error_binding, notes: [] };
  }
  const codes = new Set(errors.map((e) => (typeof e === "string" ? e : e?.code)).filter(Boolean));
  if (codes.size === 0) return { score: 0, max: WEIGHTS.error_binding, notes: ["errors have no codes"] };

  // Find which codes are referenced by outcomes
  const referenced = new Set();
  if (bp.outcomes) {
    for (const outcome of Object.values(bp.outcomes)) {
      if (outcome?.error) referenced.add(outcome.error);
    }
  }

  // Score = fraction of errors that are referenced, plus bonus if all referenced errors exist
  const notes = [];
  const referencedCount = [...codes].filter((c) => referenced.has(c)).length;
  const coverage = referencedCount / codes.size;
  let score = Math.round(coverage * 8);

  // 2 pts: every error has a user-facing message
  const withMessage = errors.filter((e) => typeof e === "object" && e?.message).length;
  if (withMessage === errors.length) score += 2;
  else notes.push(`${errors.length - withMessage} errors missing user-facing message`);

  if (coverage < 0.5) notes.push(`only ${referencedCount} of ${codes.size} error codes bound to an outcome`);
  return { score, max: WEIGHTS.error_binding, notes };
}

function scoreFields(bp) {
  const fields = Array.isArray(bp.fields) ? bp.fields : [];
  if (fields.length === 0) {
    // System-driven features without input fields get full credit
    return { score: WEIGHTS.fields, max: WEIGHTS.fields, notes: [] };
  }
  let withValidation = 0;
  let withLabel = 0;
  let withType = 0;
  for (const f of fields) {
    if (!f || typeof f !== "object") continue;
    if (f.type) withType++;
    if (f.label) withLabel++;
    if (Array.isArray(f.validation) && f.validation.length > 0) withValidation++;
    else if (f.required === true) withValidation += 0.3; // at least marked required
  }
  const typeRatio = withType / fields.length;
  const labelRatio = withLabel / fields.length;
  const valRatio = withValidation / fields.length;

  const score = Math.round(typeRatio * 3 + labelRatio * 2 + valRatio * 5);
  const notes = [];
  if (valRatio < 0.5) notes.push(`only ${Math.round(valRatio * 100)}% of fields have validation rules`);
  return { score, max: WEIGHTS.fields, notes };
}

function scoreRelationships(bp) {
  const related = Array.isArray(bp.related) ? bp.related : [];
  if (related.length === 0) {
    return { score: 0, max: WEIGHTS.relationships, notes: ["no relationships declared"] };
  }
  let score = 0;
  // 3 pts: at least one relationship
  score += 3;
  // 3 pts: multiple relationships
  if (related.length >= 2) score += 1;
  if (related.length >= 3) score += 1;
  if (related.length >= 4) score += 1;
  // 4 pts: quality of relationships (typed + reason)
  let typed = 0;
  let withReason = 0;
  for (const r of related) {
    if (!r || typeof r !== "object") continue;
    if (r.type) typed++;
    if (r.reason) withReason++;
  }
  const typedRatio = typed / related.length;
  const reasonRatio = withReason / related.length;
  score += Math.round(typedRatio * 2 + reasonRatio * 2);

  const notes = [];
  if (typedRatio < 1) notes.push(`${related.length - typed} relationships missing type`);
  if (reasonRatio < 0.5) notes.push(`${related.length - withReason} relationships missing reason`);
  return { score, max: WEIGHTS.relationships, notes };
}

function scoreEvents(bp) {
  const events = Array.isArray(bp.events) ? bp.events : [];
  if (events.length === 0) {
    // Optional — give 2 of 5 for having none (not a hard requirement)
    return { score: 2, max: WEIGHTS.events, notes: ["no events declared"] };
  }
  let score = 2;
  if (events.length >= 2) score += 1;
  // 2 pts: events have payloads
  const withPayload = events.filter((e) => Array.isArray(e?.payload) && e.payload.length > 0).length;
  const ratio = withPayload / events.length;
  score += Math.round(ratio * 2);
  const notes = ratio < 1 ? [`${events.length - withPayload} events missing payload`] : [];
  // Bonus: payload_schema (typed payloads with source) — cap total at max
  const withSchema = events.filter((e) => Array.isArray(e?.payload_schema) && e.payload_schema.length > 0).length;
  if (withSchema > 0) {
    score = Math.min(score + 1, WEIGHTS.events);
  }
  return { score, max: WEIGHTS.events, notes };
}

function scoreAgi(bp) {
  if (!bp.agi || typeof bp.agi !== "object") {
    return { score: 0, max: WEIGHTS.agi, notes: ["no agi section"] };
  }
  let score = 0;
  const notes = [];
  if (Array.isArray(bp.agi.goals) && bp.agi.goals.length > 0) score += 1;
  else notes.push("agi.goals missing");
  if (bp.agi.autonomy) score += 1;
  if (bp.agi.verification && (Array.isArray(bp.agi.verification.invariants) || Array.isArray(bp.agi.verification.acceptance_tests))) score += 2;
  else notes.push("agi.verification missing");
  if (Array.isArray(bp.agi.capabilities) && bp.agi.capabilities.length > 0) score += 1;
  return { score, max: WEIGHTS.agi, notes };
}

function scoreSimplicity(bp) {
  // Penalty for bloat. Start at full marks, deduct for dead weight.
  let score = WEIGHTS.simplicity;
  const notes = [];

  // Penalty 1: outcomes with neither then nor result
  const outcomes = bp.outcomes ? Object.values(bp.outcomes) : [];
  const deadOutcomes = outcomes.filter(
    (o) => o && typeof o === "object" && (!Array.isArray(o.then) || o.then.length === 0) && !o.result
  ).length;
  if (deadOutcomes > 0) {
    score -= Math.min(2, deadOutcomes);
    notes.push(`${deadOutcomes} outcomes have no effect or result`);
  }

  // Penalty 2: fields without labels AND without validation (dead weight)
  const fields = Array.isArray(bp.fields) ? bp.fields : [];
  const deadFields = fields.filter(
    (f) => f && typeof f === "object" && !f.label && (!Array.isArray(f.validation) || f.validation.length === 0)
  ).length;
  if (deadFields > 0) {
    score -= Math.min(2, deadFields);
    notes.push(`${deadFields} fields have no label and no validation`);
  }

  // Penalty 3: orphaned error codes (defined but never referenced)
  if (Array.isArray(bp.errors) && bp.outcomes) {
    const codes = new Set(bp.errors.map((e) => (typeof e === "string" ? e : e?.code)).filter(Boolean));
    const used = new Set();
    for (const o of Object.values(bp.outcomes)) if (o?.error) used.add(o.error);
    const orphans = [...codes].filter((c) => !used.has(c)).length;
    if (orphans > 0) {
      score -= Math.min(1, orphans * 0.3);
      notes.push(`${orphans} error codes never referenced by an outcome`);
    }
  }

  return { score: Math.max(0, Math.round(score)), max: WEIGHTS.simplicity, notes };
}

// ─── Aggregate ────────────────────────────────────────────

function scoreBlueprint(bp) {
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
  const total = Object.values(dims).reduce((sum, d) => sum + d.score, 0);
  const max = Object.values(dims).reduce((sum, d) => sum + d.max, 0);
  return { total, max, percent: Math.round((total / max) * 100), dims };
}

// ─── CLI ──────────────────────────────────────────────────

function loadBlueprint(file) {
  try {
    return YAML.parse(readFileSync(file, "utf-8"));
  } catch (err) {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const summary = args.includes("--summary");
  const saveBaselineIdx = args.indexOf("--save-baseline");
  const baselineIdx = args.indexOf("--baseline");
  const bottomIdx = args.indexOf("--bottom");
  const topIdx = args.indexOf("--top");

  const fileArgs = args.filter((a) => !a.startsWith("--"));
  // Skip values that follow flag options
  const skipIdx = new Set();
  [saveBaselineIdx, baselineIdx, bottomIdx, topIdx].forEach((i) => {
    if (i >= 0 && i + 1 < args.length) skipIdx.add(args[i + 1]);
  });
  const realFileArgs = fileArgs.filter((a) => !skipIdx.has(a));

  let files;
  if (realFileArgs.length > 0) {
    files = realFileArgs.map((f) => resolve(f));
  } else {
    files = await glob("blueprints/**/*.blueprint.yaml", {
      cwd: PROJECT_ROOT,
      absolute: true,
    });
    files = files.filter((f) => !f.includes(".proposed."));
  }

  const results = [];
  for (const file of files) {
    const bp = loadBlueprint(file);
    const relPath = relative(PROJECT_ROOT, file).replace(/\\/g, "/");
    if (!bp) {
      results.push({ file: relPath, error: "parse failed", percent: 0, total: 0, max: 100 });
      continue;
    }
    const s = scoreBlueprint(bp);
    results.push({ file: relPath, ...s });
  }

  results.sort((a, b) => a.percent - b.percent);

  // Compare to baseline if requested
  let comparison = null;
  if (baselineIdx >= 0) {
    const baselinePath = args[baselineIdx + 1];
    if (existsSync(baselinePath)) {
      const baseline = JSON.parse(readFileSync(baselinePath, "utf-8"));
      const baselineMap = new Map(baseline.results.map((r) => [r.file, r.percent]));
      comparison = results.map((r) => ({
        file: r.file,
        current: r.percent,
        baseline: baselineMap.get(r.file) ?? null,
        delta: baselineMap.has(r.file) ? r.percent - baselineMap.get(r.file) : null,
      }));
    }
  }

  // Save baseline if requested
  if (saveBaselineIdx >= 0) {
    const path = args[saveBaselineIdx + 1];
    const baselineData = {
      timestamp: new Date().toISOString(),
      count: results.length,
      average: Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length),
      results: results.map((r) => ({ file: r.file, percent: r.percent, total: r.total })),
    };
    writeFileSync(path, JSON.stringify(baselineData, null, 2));
    console.error(`Baseline saved to ${path}`);
  }

  // Summary stats
  const total = results.length;
  const avg = total ? Math.round(results.reduce((s, r) => s + r.percent, 0) / total) : 0;
  const median = total ? results.sort((a, b) => a.percent - b.percent)[Math.floor(total / 2)].percent : 0;
  const min = total ? Math.min(...results.map((r) => r.percent)) : 0;
  const max = total ? Math.max(...results.map((r) => r.percent)) : 0;
  const buckets = {
    "0-40": results.filter((r) => r.percent < 40).length,
    "40-60": results.filter((r) => r.percent >= 40 && r.percent < 60).length,
    "60-80": results.filter((r) => r.percent >= 60 && r.percent < 80).length,
    "80-100": results.filter((r) => r.percent >= 80).length,
  };

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          count: total,
          average: avg,
          median,
          min,
          max,
          buckets,
          results,
          comparison,
        },
        null,
        2
      )
    );
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

  // Single-file detail mode
  if (realFileArgs.length === 1 && results.length === 1) {
    const r = results[0];
    console.log(`\n${colors.bold}${r.file}${colors.reset}`);
    console.log(`${colorFor(r.percent)}Fitness: ${r.percent}/100 (${r.total}/${r.max})${colors.reset}\n`);
    for (const [name, d] of Object.entries(r.dims)) {
      const pct = Math.round((d.score / d.max) * 100);
      const bar = "█".repeat(Math.round(d.score)) + "░".repeat(d.max - Math.round(d.score));
      console.log(`  ${colorFor(pct)}${name.padEnd(14)}${colors.reset}  ${bar}  ${d.score}/${d.max}`);
      for (const note of d.notes) {
        console.log(`  ${colors.dim}              └ ${note}${colors.reset}`);
      }
    }
    console.log("");
    return;
  }

  // Summary + ranking
  if (summary || (!bottomIdx && !topIdx && results.length > 20)) {
    console.log(`\n${colors.bold}FDL Blueprint Fitness${colors.reset}`);
    console.log(`  blueprints: ${total}`);
    console.log(`  ${colorFor(avg)}average:    ${avg}/100${colors.reset}`);
    console.log(`  median:     ${median}/100`);
    console.log(`  range:      ${min}–${max}`);
    console.log(`\n  distribution:`);
    console.log(`    ${colors.red}0–40  ${colors.reset} ${buckets["0-40"]}`);
    console.log(`    ${colors.cyan}40–60 ${colors.reset} ${buckets["40-60"]}`);
    console.log(`    ${colors.yellow}60–80 ${colors.reset} ${buckets["60-80"]}`);
    console.log(`    ${colors.green}80–100${colors.reset} ${buckets["80-100"]}`);
  }

  if (bottomIdx >= 0) {
    const n = parseInt(args[bottomIdx + 1]) || 20;
    console.log(`\n${colors.bold}Bottom ${n} blueprints:${colors.reset}`);
    for (const r of results.slice(0, n)) {
      console.log(`  ${colorFor(r.percent)}${String(r.percent).padStart(3)}${colors.reset}  ${r.file}`);
    }
  }

  if (topIdx >= 0) {
    const n = parseInt(args[topIdx + 1]) || 20;
    console.log(`\n${colors.bold}Top ${n} blueprints:${colors.reset}`);
    for (const r of results.slice(-n).reverse()) {
      console.log(`  ${colorFor(r.percent)}${String(r.percent).padStart(3)}${colors.reset}  ${r.file}`);
    }
  }

  if (comparison) {
    const improved = comparison.filter((c) => c.delta > 0);
    const regressed = comparison.filter((c) => c.delta < 0);
    console.log(`\n${colors.bold}Compared to baseline:${colors.reset}`);
    console.log(`  ${colors.green}${improved.length} improved${colors.reset}`);
    console.log(`  ${colors.red}${regressed.length} regressed${colors.reset}`);
    if (regressed.length > 0) {
      console.log(`\n${colors.red}Regressions:${colors.reset}`);
      for (const c of regressed) {
        console.log(`  ${c.baseline} → ${c.current} (${c.delta})  ${c.file}`);
      }
    }
    if (improved.length > 0) {
      console.log(`\n${colors.green}Improvements:${colors.reset}`);
      for (const c of improved.slice(0, 20)) {
        console.log(`  ${c.baseline} → ${c.current} (+${c.delta})  ${c.file}`);
      }
    }
  }

  console.log("");
}

// ─── Exports for testing ─────────────────────────────────

export {
  scoreBlueprint,
  scoreDescription,
  scoreRules,
  scoreOutcomes,
  scoreStructure,
  scoreErrorBinding,
  scoreFields,
  scoreRelationships,
  scoreEvents,
  scoreAgi,
  scoreSimplicity,
  WEIGHTS,
};

// ─── Run CLI only when invoked directly ──────────────────

import { pathToFileURL } from "url";
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
