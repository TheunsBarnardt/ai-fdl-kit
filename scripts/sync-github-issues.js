#!/usr/bin/env node

/**
 * Syncs two backlogs into GitHub Issues:
 *
 *   1. Fitness: blueprints below the fitness threshold → one issue each,
 *      labeled `fitness-low` + `priority:low`. Closed automatically when
 *      the blueprint's score climbs back above the hysteresis ceiling.
 *   2. Extraction backlog: `TODO.md` rows whose Status isn't `DONE` →
 *      one issue each, labeled `extraction-backlog` + `enhancement`.
 *      Closed automatically when the row flips to `DONE`.
 *
 * Each issue carries an invisible HTML marker in its body so the script
 * can find-and-update existing issues instead of duplicating them.
 *
 * Usage:
 *   node scripts/sync-github-issues.js              # dry-run (default)
 *   node scripts/sync-github-issues.js --apply      # actually create/update/close
 *   node scripts/sync-github-issues.js --only fitness
 *   node scripts/sync-github-issues.js --only backlog
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = resolve(dirname(__filename), "..");
const TODO_PATH = resolve(PROJECT_ROOT, "TODO.md");
const RECOMMEND_SCRIPT = resolve(PROJECT_ROOT, "scripts/fitness-recommend.js");

const LABELS = {
  fitness: [
    { name: "fitness-low", color: "d93f0b", description: "Blueprint below fitness threshold (<70/100)" },
    { name: "priority:low", color: "c5def5", description: "Low priority — nice-to-have" },
  ],
  backlog: [
    { name: "extraction-backlog", color: "5319e7", description: "Source queued for blueprint extraction" },
    { name: "enhancement", color: "a2eeef", description: "New feature or request" },
  ],
};

const MARKER_FITNESS = (key) => `<!-- fdl-fitness:${key} -->`;
const MARKER_BACKLOG = (url) => `<!-- fdl-backlog:${url} -->`;
const MARKER_REGEX = /<!-- fdl-(fitness|backlog):([^ >]+) -->/;

// ─── gh CLI wrapper ───────────────────────────────────────

function gh(args, { input, json = false, allowFail = false } = {}) {
  const res = spawnSync("gh", args, {
    input,
    encoding: "utf-8",
    stdio: input === undefined ? ["ignore", "pipe", "pipe"] : ["pipe", "pipe", "pipe"],
  });
  if (res.status !== 0 && !allowFail) {
    throw new Error(`gh ${args.slice(0, 3).join(" ")} failed: ${res.stderr || res.stdout}`);
  }
  if (json && res.stdout) return JSON.parse(res.stdout);
  return res.stdout;
}

function ensureLabel({ name, color, description }, apply) {
  if (!apply) return;
  gh(
    ["label", "create", name, "--color", color, "--description", description, "--force"],
    { allowFail: true }
  );
}

function listOpenIssuesWithLabel(label) {
  return gh(
    ["issue", "list", "--label", label, "--state", "open", "--limit", "500", "--json", "number,title,body,labels"],
    { json: true }
  );
}

function indexByMarker(issues) {
  const map = new Map();
  for (const issue of issues) {
    const m = (issue.body || "").match(MARKER_REGEX);
    if (m) map.set(m[2], issue);
  }
  return map;
}

function createIssue({ title, body, labels }, apply) {
  if (!apply) return { number: null, created: true, dryRun: true };
  const res = gh(
    ["issue", "create", "--title", title, "--body-file", "-", "--label", labels.join(",")],
    { input: body }
  );
  const m = res.match(/\/issues\/(\d+)/);
  return { number: m ? parseInt(m[1], 10) : null, created: true };
}

function updateIssueBody(number, { title, body }, apply) {
  if (!apply) return;
  gh(["issue", "edit", String(number), "--title", title, "--body-file", "-"], { input: body });
}

function closeIssue(number, comment, apply) {
  if (!apply) return;
  if (comment) gh(["issue", "comment", String(number), "--body", comment]);
  gh(["issue", "close", String(number)]);
}

// ─── Fitness source ───────────────────────────────────────

function loadFitnessRecommendations() {
  const res = spawnSync("node", [RECOMMEND_SCRIPT, "--json"], { encoding: "utf-8" });
  if (res.status !== 0) {
    throw new Error(`fitness-recommend --json failed: ${res.stderr}`);
  }
  return JSON.parse(res.stdout);
}

function fitnessIssueFor(rec) {
  const key = `${rec.category}/${rec.feature}`;
  const marker = MARKER_FITNESS(key);
  const title = `fitness: ${key} — ${rec.percent}/100`;
  const lines = [];
  lines.push(marker);
  lines.push("");
  lines.push(`Blueprint **[\`${rec.file}\`](../blob/master/${rec.file})** is scoring **${rec.percent}/100**.`);
  lines.push("");
  lines.push(`**Weakest dimension:** \`${rec.weakest.name}\` (${rec.weakest.score}/${rec.weakest.max})`);
  if (rec.weakest.notes?.length) {
    lines.push(`_${rec.weakest.notes.slice(0, 2).join(" · ")}_`);
  }
  lines.push("");
  if (rec.candidates.length) {
    lines.push("### Suggested upstream repos");
    lines.push("");
    for (const cand of rec.candidates.slice(0, 3)) {
      lines.push(`- **${cand.repo.replace(/^https:\/\/github\.com\//, "")}** — ${cand.description}`);
      lines.push("  ```");
      lines.push(`  /fdl-extract-code ${cand.repo} ${rec.feature} ${rec.category}`);
      lines.push("  ```");
    }
  } else {
    lines.push(`_No candidates mapped. Run \`/fdl-recommend-discover ${rec.feature}\` to find some._`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`This issue auto-closes when the blueprint's fitness score reaches **≥75/100**. Managed by \`scripts/sync-github-issues.js\`.`);
  return { key, title, body: lines.join("\n"), labels: ["fitness-low", "priority:low"] };
}

function syncFitness({ apply }) {
  for (const l of LABELS.fitness) ensureLabel(l, apply);
  const { recommendations } = loadFitnessRecommendations();
  const open = listOpenIssuesWithLabel("fitness-low");
  const byMarker = indexByMarker(open);
  const wantedKeys = new Set();
  const actions = { created: [], updated: [], closed: [], unchanged: [] };

  for (const rec of recommendations) {
    const spec = fitnessIssueFor(rec);
    wantedKeys.add(spec.key);
    const existing = byMarker.get(spec.key);
    if (!existing) {
      createIssue(spec, apply);
      actions.created.push(spec.key);
      continue;
    }
    if (existing.title !== spec.title || (existing.body || "").trim() !== spec.body.trim()) {
      updateIssueBody(existing.number, spec, apply);
      actions.updated.push(`#${existing.number} ${spec.key}`);
    } else {
      actions.unchanged.push(spec.key);
    }
  }

  for (const [key, issue] of byMarker) {
    if (!wantedKeys.has(key)) {
      closeIssue(
        issue.number,
        `Blueprint **${key}** has climbed to or above the fitness threshold — auto-closing. Managed by \`scripts/sync-github-issues.js\`.`,
        apply
      );
      actions.closed.push(`#${issue.number} ${key}`);
    }
  }
  return actions;
}

// ─── Backlog source ───────────────────────────────────────

function parseBacklog() {
  if (!existsSync(TODO_PATH)) return [];
  const text = readFileSync(TODO_PATH, "utf-8");
  const rows = [];
  let currentCategory = null;
  for (const line of text.split("\n")) {
    const header = line.match(/^##\s+.*→\s+`([^`]+)`/);
    if (header) {
      currentCategory = header[1];
      continue;
    }
    const m = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*(Web|Code)\s*\|\s*(https?:\/\/\S+)\s*\|\s*([^|]+?)\s*\|$/i);
    if (m && currentCategory) {
      rows.push({
        id: m[1],
        source: m[2].trim(),
        type: m[3].trim(),
        url: m[4].trim(),
        status: m[5].trim(),
        category: currentCategory,
      });
    }
  }
  return rows;
}

function backlogIssueFor(row) {
  const marker = MARKER_BACKLOG(row.url);
  const title = `extract: ${row.source} → ${row.category}`;
  const commandHint = row.type === "Web"
    ? `/fdl-extract-web ${row.url}`
    : `/fdl-extract-code ${row.url} <feature> ${row.category}`;
  const body = [
    marker,
    "",
    `Queued source for blueprint extraction.`,
    "",
    `- **Source:** ${row.source}`,
    `- **URL:** ${row.url}`,
    `- **Category:** \`${row.category}\``,
    `- **Type:** ${row.type}`,
    "",
    "### Run",
    "",
    "```",
    commandHint,
    "```",
    "",
    "---",
    "",
    "This issue auto-closes when the row in [`TODO.md`](../blob/master/TODO.md) flips to **DONE**. Managed by `scripts/sync-github-issues.js`.",
  ].join("\n");
  return { key: row.url, title, body, labels: ["extraction-backlog", "enhancement"] };
}

function syncBacklog({ apply }) {
  for (const l of LABELS.backlog) ensureLabel(l, apply);
  const rows = parseBacklog();
  const open = listOpenIssuesWithLabel("extraction-backlog");
  const byMarker = indexByMarker(open);
  const actions = { created: [], updated: [], closed: [], unchanged: [] };

  const pending = rows.filter((r) => !/^done$/i.test(r.status));
  const done = rows.filter((r) => /^done$/i.test(r.status));
  const wantedKeys = new Set(pending.map((r) => r.url));

  for (const row of pending) {
    const spec = backlogIssueFor(row);
    const existing = byMarker.get(spec.key);
    if (!existing) {
      createIssue(spec, apply);
      actions.created.push(`${row.source}`);
      continue;
    }
    if (existing.title !== spec.title || (existing.body || "").trim() !== spec.body.trim()) {
      updateIssueBody(existing.number, spec, apply);
      actions.updated.push(`#${existing.number} ${row.source}`);
    } else {
      actions.unchanged.push(row.source);
    }
  }

  for (const row of done) {
    const existing = byMarker.get(row.url);
    if (existing) {
      closeIssue(
        existing.number,
        `**${row.source}** is marked \`DONE\` in [\`TODO.md\`](../blob/master/TODO.md) — auto-closing. Managed by \`scripts/sync-github-issues.js\`.`,
        apply
      );
      actions.closed.push(`#${existing.number} ${row.source}`);
    }
  }

  for (const [key, issue] of byMarker) {
    if (!wantedKeys.has(key) && !done.find((r) => r.url === key)) {
      closeIssue(
        issue.number,
        `Source removed from [\`TODO.md\`](../blob/master/TODO.md) — auto-closing. Managed by \`scripts/sync-github-issues.js\`.`,
        apply
      );
      actions.closed.push(`#${issue.number} (removed)`);
    }
  }
  return actions;
}

// ─── CLI ──────────────────────────────────────────────────

function summarize(label, actions) {
  const total = actions.created.length + actions.updated.length + actions.closed.length;
  console.log(`\n${label}:`);
  console.log(`  create:    ${actions.created.length}`);
  console.log(`  update:    ${actions.updated.length}`);
  console.log(`  close:     ${actions.closed.length}`);
  console.log(`  unchanged: ${actions.unchanged.length}`);
  if (total === 0) return;
  if (actions.created.length) console.log(`  → new:     ${actions.created.slice(0, 5).join(", ")}${actions.created.length > 5 ? ", ..." : ""}`);
  if (actions.closed.length) console.log(`  → closed:  ${actions.closed.slice(0, 5).join(", ")}${actions.closed.length > 5 ? ", ..." : ""}`);
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

  if (!apply) {
    console.log("DRY RUN — pass --apply to create/update/close issues on GitHub.\n");
  }

  if (!only || only === "fitness") {
    summarize("Fitness", syncFitness({ apply }));
  }
  if (!only || only === "backlog") {
    summarize("Backlog", syncBacklog({ apply }));
  }
}

main();
