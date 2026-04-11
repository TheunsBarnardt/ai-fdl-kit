#!/usr/bin/env node

/**
 * FDL Fitness Recommender
 *
 * Surfaces, for each blueprint currently below the fitness threshold,
 * a ranked list of upstream OSS repos we could re-extract from to lift
 * that blueprint's score. Publishes the list in README.md between
 * `<!-- BEGIN:recommended-repos -->` / `<!-- END:recommended-repos -->`.
 *
 * Includes a score-delta verification loop (autoresearch-style):
 * every run compares the current score against the last recorded
 * score in `.fitness-recommend-state.json`. If a previously-suggested
 * repo lifted the score past the hysteresis ceiling, the card is
 * dropped and the repo is marked `proven`. If the repo was tried but
 * the score didn't move, the repo is marked `no_improvement` and
 * rotated out of the rank-0 slot next run.
 *
 * Usage:
 *   node scripts/fitness-recommend.js                         # console summary
 *   node scripts/fitness-recommend.js --update-readme         # rewrite README marker block
 *   node scripts/fitness-recommend.js --json                  # machine-readable
 *   node scripts/fitness-recommend.js --threshold 70 --hysteresis 75
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, relative, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");
const CANDIDATES_PATH = resolve(PROJECT_ROOT, "data/extraction-candidates.yaml");
const STATE_PATH = resolve(PROJECT_ROOT, ".fitness-recommend-state.json");
const README_PATH = resolve(PROJECT_ROOT, "README.md");
const BEGIN_MARKER = "<!-- BEGIN:recommended-repos -->";
const END_MARKER = "<!-- END:recommended-repos -->";

// ─── Scoring (replicated from scripts/fitness.js, kept in sync manually) ──

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

function scoreBlueprint(bp) {
  const scoreDescription = (bp) => {
    const d = bp.description;
    if (!d || typeof d !== "string") return { score: 0, max: WEIGHTS.description, notes: [] };
    const notes = [];
    let score = 0;
    if (d.length >= 15) score += 3; else notes.push("too short");
    if (d.length >= 40) score += 3;
    if (d.length >= 70) score += 2;
    const wc = d.split(/\s+/).length;
    if (wc >= 6) score += 1;
    if (wc >= 10) score += 1;
    return { score, max: WEIGHTS.description, notes };
  };
  const scoreRules = (bp) => {
    const notes = [];
    if (!bp.rules || typeof bp.rules !== "object" || Array.isArray(bp.rules))
      return { score: 0, max: WEIGHTS.rules, notes: ["rules missing or flat"] };
    const cats = Object.keys(bp.rules);
    if (cats.length === 0) return { score: 0, max: WEIGHTS.rules, notes: ["empty rules"] };
    let score = 3;
    if (cats.length >= 2) score += 1;
    if (cats.length >= 3) score += 1;
    if (cats.length >= 4) score += 1;
    let nt = 0;
    for (const c of cats) {
      const v = bp.rules[c];
      if (Array.isArray(v) && v.length >= 2) nt++;
      else if (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length >= 2) nt++;
    }
    score += Math.round((nt / cats.length) * 4);
    if (nt / cats.length < 0.5) notes.push("thin rule categories");
    return { score, max: WEIGHTS.rules, notes };
  };
  const scoreOutcomes = (bp) => {
    const notes = [];
    const hasFlows = bp.flows && typeof bp.flows === "object" && Object.keys(bp.flows).length > 0;
    if (!bp.outcomes || typeof bp.outcomes !== "object" || Object.keys(bp.outcomes).length === 0) {
      if (hasFlows) return { score: 10, max: WEIGHTS.outcomes, notes: ["no outcomes — uses flows"] };
      return { score: 0, max: WEIGHTS.outcomes, notes: ["no outcomes"] };
    }
    const names = Object.keys(bp.outcomes);
    const out = Object.values(bp.outcomes);
    let score = 3;
    const hasSuccess = names.some((n) => /success|valid|ok|complete|approved|confirmed|created|updated|granted/i.test(n));
    if (hasSuccess) score += 2; else notes.push("no success outcome");
    const hasFailure = names.some((n) => /fail|invalid|denied|error|rejected|expired|missing|declined|unauthorized|forbidden|not_found|limit|lock/i.test(n));
    if (hasFailure) score += 2; else notes.push("no failure outcome");
    if (out.length >= 2) score += 1;
    if (out.length >= 3) score += 1;
    if (out.length >= 4) score += 1;
    if (out.length >= 5) score += 1;
    const wp = out.filter((o) => typeof o?.priority === "number").length;
    score += Math.round((wp / out.length) * 4);
    const wt = out.filter((o) => Array.isArray(o?.then) && o.then.length > 0).length;
    score += Math.round((wt / out.length) * 4);
    const wg = out.filter((o) => Array.isArray(o?.given) && o.given.length > 0).length;
    score += Math.round((wg / out.length) * 3);
    const wd = out.filter((o) => o?.result || o?.error).length;
    score += Math.round((wd / out.length) * 2);
    return { score, max: WEIGHTS.outcomes, notes };
  };
  const scoreStructure = (bp) => {
    if (!bp.outcomes || typeof bp.outcomes !== "object") return { score: 0, max: WEIGHTS.structure, notes: [] };
    let total = 0, structured = 0;
    for (const o of Object.values(bp.outcomes)) {
      if (Array.isArray(o?.given)) for (const g of o.given) { total++; if (g && typeof g === "object") structured++; }
      if (Array.isArray(o?.then)) for (const t of o.then) { total++; if (t && typeof t === "object" && t.action) structured++; }
    }
    if (total === 0) return { score: 0, max: WEIGHTS.structure, notes: [] };
    return { score: Math.round((structured / total) * WEIGHTS.structure), max: WEIGHTS.structure, notes: [] };
  };
  const scoreErrorBinding = (bp) => {
    const errs = Array.isArray(bp.errors) ? bp.errors : [];
    if (errs.length === 0) return { score: WEIGHTS.error_binding, max: WEIGHTS.error_binding, notes: [] };
    const codes = new Set(errs.map((e) => (typeof e === "string" ? e : e?.code)).filter(Boolean));
    if (codes.size === 0) return { score: 0, max: WEIGHTS.error_binding, notes: ["no codes"] };
    const ref = new Set();
    if (bp.outcomes) for (const o of Object.values(bp.outcomes)) if (o?.error) ref.add(o.error);
    const refCount = [...codes].filter((c) => ref.has(c)).length;
    let score = Math.round((refCount / codes.size) * 8);
    const wm = errs.filter((e) => typeof e === "object" && e?.message).length;
    if (wm === errs.length) score += 2;
    const notes = [];
    if (refCount / codes.size < 0.5) notes.push(`${codes.size - refCount} of ${codes.size} codes unbound`);
    return { score, max: WEIGHTS.error_binding, notes };
  };
  const scoreFields = (bp) => {
    const fs_ = Array.isArray(bp.fields) ? bp.fields : [];
    if (fs_.length === 0) return { score: WEIGHTS.fields, max: WEIGHTS.fields, notes: [] };
    let wv = 0, wl = 0, wt = 0;
    for (const f of fs_) {
      if (!f || typeof f !== "object") continue;
      if (f.type) wt++;
      if (f.label) wl++;
      if (Array.isArray(f.validation) && f.validation.length > 0) wv++;
      else if (f.required === true) wv += 0.3;
    }
    return { score: Math.round((wt / fs_.length) * 3 + (wl / fs_.length) * 2 + (wv / fs_.length) * 5), max: WEIGHTS.fields, notes: [] };
  };
  const scoreRelationships = (bp) => {
    const rel = Array.isArray(bp.related) ? bp.related : [];
    if (rel.length === 0) return { score: 0, max: WEIGHTS.relationships, notes: ["no relationships"] };
    let score = 3;
    if (rel.length >= 2) score += 1;
    if (rel.length >= 3) score += 1;
    if (rel.length >= 4) score += 1;
    let typed = 0, wr = 0;
    for (const r of rel) { if (!r || typeof r !== "object") continue; if (r.type) typed++; if (r.reason) wr++; }
    score += Math.round((typed / rel.length) * 2 + (wr / rel.length) * 2);
    return { score, max: WEIGHTS.relationships, notes: [] };
  };
  const scoreEvents = (bp) => {
    const evs = Array.isArray(bp.events) ? bp.events : [];
    if (evs.length === 0) return { score: 2, max: WEIGHTS.events, notes: [] };
    let score = 2;
    if (evs.length >= 2) score += 1;
    const wp = evs.filter((e) => Array.isArray(e?.payload) && e.payload.length > 0).length;
    score += Math.round((wp / evs.length) * 2);
    return { score, max: WEIGHTS.events, notes: [] };
  };
  const scoreAgi = (bp) => {
    if (!bp.agi || typeof bp.agi !== "object") return { score: 0, max: WEIGHTS.agi, notes: [] };
    let score = 0;
    if (Array.isArray(bp.agi.goals) && bp.agi.goals.length > 0) score += 1;
    if (bp.agi.autonomy) score += 1;
    if (bp.agi.verification && (Array.isArray(bp.agi.verification.invariants) || Array.isArray(bp.agi.verification.acceptance_tests))) score += 2;
    if (Array.isArray(bp.agi.capabilities) && bp.agi.capabilities.length > 0) score += 1;
    return { score, max: WEIGHTS.agi, notes: [] };
  };
  const scoreSimplicity = (bp) => {
    let score = WEIGHTS.simplicity;
    const out = bp.outcomes ? Object.values(bp.outcomes) : [];
    const dead = out.filter((o) => o && typeof o === "object" && (!Array.isArray(o.then) || o.then.length === 0) && !o.result).length;
    if (dead > 0) score -= Math.min(2, dead);
    const fs_ = Array.isArray(bp.fields) ? bp.fields : [];
    const df = fs_.filter((f) => f && typeof f === "object" && !f.label && (!Array.isArray(f.validation) || f.validation.length === 0)).length;
    if (df > 0) score -= Math.min(2, df);
    if (Array.isArray(bp.errors) && bp.outcomes) {
      const codes = new Set(bp.errors.map((e) => (typeof e === "string" ? e : e?.code)).filter(Boolean));
      const used = new Set();
      for (const o of Object.values(bp.outcomes)) if (o?.error) used.add(o.error);
      const orphans = [...codes].filter((c) => !used.has(c)).length;
      if (orphans > 0) score -= Math.min(1, orphans * 0.3);
    }
    return { score: Math.max(0, Math.round(score)), max: WEIGHTS.simplicity, notes: [] };
  };

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

// ─── Helpers ──────────────────────────────────────────────

function findWeakestDimension(dims) {
  // Rank dimensions by ratio (score/max), ascending. Returns the lowest.
  const ranked = Object.entries(dims)
    .map(([name, d]) => ({ name, ratio: d.max > 0 ? d.score / d.max : 1, score: d.score, max: d.max, notes: d.notes || [] }))
    .sort((a, b) => a.ratio - b.ratio);
  return ranked[0];
}

function lookupCandidates(candidates, feature, category, weakDim) {
  // Build a merged pool: feature override first (highest priority), then
  // category+dimension, then category.any. Deduplicate by repo URL while
  // preserving first-seen order. This guarantees that rotation-out of a
  // dead-end repo has somewhere to rotate TO, even when a feature override
  // has only one entry.
  const seen = new Set();
  const entries = [];
  const push = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const e of arr) {
      if (!e || !e.repo || seen.has(e.repo)) continue;
      seen.add(e.repo);
      entries.push(e);
    }
  };

  const sources = [];
  if (candidates.features?.[feature]) {
    push(candidates.features[feature]);
    sources.push("feature");
  }
  const cat = candidates.categories?.[category];
  if (cat) {
    if (cat[weakDim]) {
      push(cat[weakDim]);
      sources.push(`${category}.${weakDim}`);
    }
    if (cat.any) {
      push(cat.any);
      sources.push(`${category}.any`);
    }
  }
  return { source: sources.join("+") || null, entries };
}

function repoShortName(url) {
  // https://github.com/org/repo → org/repo
  const m = url.match(/github\.com\/([^\/]+\/[^\/\?#]+)/i);
  if (m) return m[1].replace(/\.git$/, "");
  return url;
}

function extractCommandFor(feature, category, repoUrl) {
  return `/fdl-extract-code ${repoUrl} ${feature} ${category}`;
}

// ─── Main pipeline ────────────────────────────────────────

async function loadBlueprints() {
  const files = await glob("blueprints/**/*.blueprint.yaml", { cwd: PROJECT_ROOT, absolute: true });
  // Sort alphabetically for deterministic output between runs. glob() does not
  // guarantee a stable order across invocations on all filesystems.
  files.sort((a, b) => a.localeCompare(b));
  const results = [];
  for (const file of files.filter((f) => !f.includes(".proposed."))) {
    try {
      const bp = YAML.parse(readFileSync(file, "utf-8"));
      if (!bp || !bp.feature) continue;
      const relPath = relative(PROJECT_ROOT, file).replace(/\\/g, "/");
      const s = scoreBlueprint(bp);
      results.push({
        file: relPath,
        feature: bp.feature,
        category: bp.category || relPath.split("/")[1],
        percent: s.percent,
        dims: s.dims,
      });
    } catch {}
  }
  return results;
}

function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { entries: {}, last_run: null };
  }
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf-8"));
  } catch {
    return { entries: {}, last_run: null };
  }
}

function loadCandidates() {
  if (!existsSync(CANDIDATES_PATH)) {
    console.error(`Missing ${CANDIDATES_PATH} — no candidates loaded.`);
    return { categories: {}, features: {} };
  }
  return YAML.parse(readFileSync(CANDIDATES_PATH, "utf-8")) || { categories: {}, features: {} };
}

function runVerification(scored, state, threshold, hysteresis) {
  // For every feature with a previous entry, compute what happened.
  // A verdict only fires when the score actually CHANGED (delta != 0).
  // A zero delta is ambiguous — it could mean "extraction didn't help" OR
  // "no extraction happened since last run". We can't tell the two apart
  // without tracking file mtimes, so we stay silent and wait for a real
  // score change. This makes re-running the recommender safe (idempotent)
  // and makes the occasional "extraction landed and changed nothing" case
  // something the user notices manually.
  const verdicts = {}; // feature → {status, delta, prev_score, prev_repo}
  for (const bp of scored) {
    const key = `${bp.category}/${bp.feature}`;
    const prev = state.entries[key];
    if (!prev || typeof prev.last_score !== "number") continue;
    const delta = bp.percent - prev.last_score;
    if (delta === 0) continue;
    const triedRepo = prev.pending_attempt || prev.proven_by;

    if (bp.percent >= hysteresis && delta > 0) {
      verdicts[key] = {
        status: "proven",
        delta,
        prev_score: prev.last_score,
        prev_repo: triedRepo,
      };
    } else if (delta > 0 && bp.percent < hysteresis) {
      verdicts[key] = {
        status: "partial",
        delta,
        prev_score: prev.last_score,
        prev_repo: triedRepo,
      };
    } else if (triedRepo && delta < 0) {
      // Score regressed — the tried repo is marked dead-end and rotated out
      verdicts[key] = {
        status: "no_improvement",
        delta,
        prev_score: prev.last_score,
        prev_repo: triedRepo,
      };
    }
  }
  return verdicts;
}

function rankCandidateBucket(entries, deadEndRepos) {
  // Put dead-end repos at the back. Return a stable reordering.
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const alive = [];
  const dead = [];
  for (const e of entries) {
    if (deadEndRepos.has(e.repo)) dead.push(e);
    else alive.push(e);
  }
  return [...alive, ...dead];
}

function buildRecommendations(scored, candidates, state, verdicts, threshold, hysteresis) {
  // Only include blueprints that are either below threshold or were above
  // threshold last run but dropped below (hysteresis). Track dead-end repos
  // per-feature for rotation.
  const bottom = [];
  for (const bp of scored) {
    const key = `${bp.category}/${bp.feature}`;
    const verdict = verdicts[key];
    const prev = state.entries[key];

    // Proven wins disappear
    if (verdict?.status === "proven") continue;

    // Hysteresis: include if score < threshold, OR (was tracked before AND score < hysteresis)
    const wasTracked = prev && typeof prev.last_score === "number";
    const include = bp.percent < threshold || (wasTracked && bp.percent < hysteresis);
    if (!include) continue;

    // Skip features above hysteresis that weren't tracked (not a problem)
    if (bp.percent >= hysteresis) continue;

    const weak = findWeakestDimension(bp.dims);
    const lookup = lookupCandidates(candidates, bp.feature, bp.category, weak.name);

    // Track dead-end repos for this feature. Include historical dead_ends
    // from state AND any repo that JUST regressed in this run's verdict —
    // otherwise the first run after a regression would still show the
    // tried repo at rank 0 (rotation would only happen on the next run).
    const deadEnds = new Set(prev?.dead_ends || []);
    if (verdict?.status === "no_improvement" && verdict.prev_repo) {
      deadEnds.add(verdict.prev_repo);
    }
    const rankedEntries = rankCandidateBucket(lookup.entries, deadEnds);

    bottom.push({
      feature: bp.feature,
      category: bp.category,
      file: bp.file,
      percent: bp.percent,
      weakest: {
        name: weak.name,
        score: weak.score,
        max: weak.max,
        notes: weak.notes,
      },
      candidates: rankedEntries,
      candidate_source: lookup.source,
      verdict,
    });
  }
  // Sort: lowest percent first
  bottom.sort((a, b) => a.percent - b.percent);
  return bottom;
}

function updateState(scored, recommendations, verdicts, state) {
  const newState = { entries: { ...state.entries }, last_run: new Date().toISOString() };

  // Apply verdicts: update status for features whose verdict we computed
  for (const [key, v] of Object.entries(verdicts)) {
    const existing = newState.entries[key] || {};
    const scoredBp = scored.find((s) => `${s.category}/${s.feature}` === key);
    const currentScore = scoredBp?.percent;

    if (v.status === "proven") {
      newState.entries[key] = {
        ...existing,
        status: "proven",
        last_score: currentScore,
        proven_by: v.prev_repo,
        pending_attempt: null,
        dead_ends: existing.dead_ends || [],
      };
    } else if (v.status === "partial") {
      newState.entries[key] = {
        ...existing,
        status: "partial",
        last_score: currentScore,
        partial_by: v.prev_repo,
        pending_attempt: null,
        dead_ends: existing.dead_ends || [],
      };
    } else if (v.status === "no_improvement") {
      const deadEnds = new Set(existing.dead_ends || []);
      if (v.prev_repo) deadEnds.add(v.prev_repo);
      newState.entries[key] = {
        ...existing,
        status: "no_improvement",
        last_score: currentScore,
        pending_attempt: null,
        dead_ends: [...deadEnds],
      };
    }
  }

  // For every current recommendation, record the rank-0 repo as the pending_attempt
  for (const rec of recommendations) {
    const key = `${rec.category}/${rec.feature}`;
    const topRepo = rec.candidates[0]?.repo || null;
    const existing = newState.entries[key] || {};
    newState.entries[key] = {
      ...existing,
      last_score: rec.percent,
      pending_attempt: topRepo,
      dead_ends: existing.dead_ends || [],
      status: existing.status || "pending",
    };
  }

  // Also record scores for blueprints that climbed above hysteresis this run
  // (so future delta calculations have a baseline)
  for (const bp of scored) {
    const key = `${bp.category}/${bp.feature}`;
    if (!newState.entries[key]) continue; // only track features we're already watching
    if (bp.percent >= 75 && newState.entries[key].status !== "proven") {
      newState.entries[key].last_score = bp.percent;
    }
  }

  return newState;
}

// ─── Markdown rendering ───────────────────────────────────

function renderMarkdown(recommendations, stats) {
  if (recommendations.length === 0) {
    return [
      "<!-- Auto-generated by `npm run fitness:recommend`. Do not edit by hand. -->",
      "",
      `_Last run: ${new Date().toISOString().slice(0, 10)} — **all ${stats.total} blueprints** are at or above the fitness threshold. Nothing to recommend right now._`,
      "",
    ].join("\n");
  }

  const lines = [];
  lines.push("<!-- Auto-generated by `npm run fitness:recommend`. Do not edit by hand. -->");
  lines.push("");
  lines.push(
    `_Last run: ${new Date().toISOString().slice(0, 10)} — ${recommendations.length} blueprint${recommendations.length === 1 ? "" : "s"} below the fitness threshold. Pick a row, paste the command into Claude Code, and \`/fdl-auto-evolve\` will re-score after extraction._`
  );
  lines.push("");

  for (const rec of recommendations) {
    const badge = rec.verdict?.status === "partial" ? "🟡" : "🔴";
    const deltaSuffix = rec.verdict?.status === "partial" ? `  *(+${rec.verdict.delta} from last extraction)*` : "";
    lines.push(`### ${badge} ${rec.category}/${rec.feature} — ${rec.percent}/100${deltaSuffix}`);

    const wn = rec.weakest;
    const noteStr = wn.notes?.length ? ` — ${wn.notes.slice(0, 2).join(", ")}` : "";
    lines.push(`**Weakest dimension:** \`${wn.name}\` (${wn.score}/${wn.max})${noteStr}`);
    lines.push("");

    if (rec.verdict?.status === "partial") {
      lines.push(
        `⚠ Previous attempt: \`${repoShortName(rec.verdict.prev_repo)}\` lifted score ${rec.verdict.prev_score} → ${rec.percent} but still below 75. Try next:`
      );
      lines.push("");
    } else if (rec.verdict?.status === "no_improvement") {
      lines.push(
        `⚠ \`${repoShortName(rec.verdict.prev_repo)}\` was tried — score went ${rec.verdict.prev_score} → ${rec.percent}. Deprioritized. Try instead:`
      );
      lines.push("");
    }

    if (rec.candidates.length === 0) {
      lines.push(`_No candidates mapped for \`${rec.category}\` + \`${wn.name}\`. Run \`/fdl-recommend-discover ${rec.feature}\` to find some._`);
      lines.push("");
      continue;
    }

    // List up to 3 candidates
    for (const cand of rec.candidates.slice(0, 3)) {
      const short = repoShortName(cand.repo);
      lines.push(`- **${short}** — ${cand.description}`);
      lines.push("  ```");
      lines.push(`  ${extractCommandFor(rec.feature, rec.category, cand.repo)}`);
      lines.push("  ```");
    }
    lines.push("");
  }

  // Footer legend
  lines.push("---");
  lines.push("");
  lines.push(
    "_Legend: 🔴 untried or below-threshold · 🟡 partial improvement (70–74) · ✅ proven wins (≥ 75) are removed from this list. State tracked in `.fitness-recommend-state.json`._"
  );
  lines.push("");
  return lines.join("\n");
}

function rewriteReadme(newBlock) {
  const content = readFileSync(README_PATH, "utf-8");
  if (!content.includes(BEGIN_MARKER) || !content.includes(END_MARKER)) {
    throw new Error(
      `README.md is missing the marker block. Add:\n${BEGIN_MARKER}\n${END_MARKER}\nbetween appropriate sections.`
    );
  }
  const re = new RegExp(
    `${BEGIN_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "m"
  );
  const replacement = `${BEGIN_MARKER}\n${newBlock}\n${END_MARKER}`;
  const updated = content.replace(re, replacement);
  if (updated !== content) writeFileSync(README_PATH, updated);
  return updated !== content;
}

// ─── CLI ──────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const updateReadme = args.includes("--update-readme");
  const tIdx = args.indexOf("--threshold");
  const hIdx = args.indexOf("--hysteresis");
  const threshold = tIdx >= 0 ? parseInt(args[tIdx + 1]) || 70 : 70;
  const hysteresis = hIdx >= 0 ? parseInt(args[hIdx + 1]) || 75 : 75;

  const scored = await loadBlueprints();
  const candidates = loadCandidates();
  const state = loadState();

  const verdicts = runVerification(scored, state, threshold, hysteresis);
  const recommendations = buildRecommendations(scored, candidates, state, verdicts, threshold, hysteresis);
  const newState = updateState(scored, recommendations, verdicts, state);

  const stats = {
    total: scored.length,
    below_threshold: scored.filter((s) => s.percent < threshold).length,
    matched: recommendations.filter((r) => r.candidates.length > 0).length,
    uncovered: recommendations.filter((r) => r.candidates.length === 0).length,
    verdicts: Object.keys(verdicts).length,
    proven: Object.values(verdicts).filter((v) => v.status === "proven").length,
    partial: Object.values(verdicts).filter((v) => v.status === "partial").length,
    no_improvement: Object.values(verdicts).filter((v) => v.status === "no_improvement").length,
  };

  if (jsonOutput) {
    console.log(JSON.stringify({ stats, recommendations, verdicts, threshold, hysteresis }, null, 2));
    return;
  }

  const markdown = renderMarkdown(recommendations, stats);

  if (updateReadme) {
    const changed = rewriteReadme(markdown);
    writeFileSync(STATE_PATH, JSON.stringify(newState, null, 2));
    console.log(`Fitness Recommender`);
    console.log(`  ${stats.total} blueprints scored`);
    console.log(`  ${stats.below_threshold} below threshold (${threshold})`);
    console.log(`  ${stats.matched} matched to candidates`);
    console.log(`  ${stats.uncovered} uncovered`);
    if (stats.verdicts > 0) {
      console.log(`  verdicts: ${stats.proven} proven · ${stats.partial} partial · ${stats.no_improvement} no_improvement`);
    }
    console.log(`  README ${changed ? "updated" : "unchanged"}`);
    console.log(`  state written to .fitness-recommend-state.json`);
    return;
  }

  // Console output without writing
  console.log("Fitness Recommender (dry)\n");
  console.log(`Scanned: ${stats.total} blueprints`);
  console.log(`Below threshold (${threshold}): ${stats.below_threshold}`);
  console.log(`Matched to candidates: ${stats.matched}`);
  console.log(`Uncovered: ${stats.uncovered}`);
  if (stats.verdicts > 0) {
    console.log(`\nVerdicts from previous state:`);
    console.log(`  proven:         ${stats.proven}`);
    console.log(`  partial:        ${stats.partial}`);
    console.log(`  no_improvement: ${stats.no_improvement}`);
  }
  console.log("\n" + "=".repeat(60) + "\n");
  console.log(markdown);
  console.log("\n(use --update-readme to write to README.md)");
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
