#!/usr/bin/env node
/**
 * run-generate.js — fast parallel generate orchestrator
 *
 * Runs all generate sub-scripts concurrently instead of sequentially.
 * Also emits blueprint-headers.json as the slim retrieval index for skills.
 *
 * Usage:
 *   node scripts/run-generate.js            # full run
 *   node scripts/run-generate.js --headers  # headers only (fast)
 *   node scripts/run-generate.js --no-headers  # skip headers
 *
 * Sequential (old): docs → api → readmes → registry → graph  (~5-6 min)
 * Parallel   (new): all 5 concurrently + headers              (~1-1.5 min)
 */

import { spawn } from "child_process";
import { join } from "path";
import { loadCorpus, saveManifest, PROJECT_ROOT } from "./lib/corpus.js";

const SCRIPTS_DIR = join(PROJECT_ROOT, "scripts");

function runScript(name) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const child = spawn(process.execPath, [join(SCRIPTS_DIR, name)], {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const out = [];
    const err = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => err.push(d));

    child.on("close", (code) => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const label = name.replace("generate-", "").replace(".js", "");
      if (code === 0) {
        const lastLine = Buffer.concat(out).toString().trim().split("\n").pop() || "ok";
        console.log(`  ✓ ${label.padEnd(14)} ${elapsed}s  ${lastLine}`);
        resolve();
      } else {
        const errText = Buffer.concat(err).toString().trim() || Buffer.concat(out).toString().trim();
        console.error(`  ✗ ${label.padEnd(14)} ${elapsed}s  FAILED`);
        console.error(errText.split("\n").slice(0, 6).map((l) => `    ${l}`).join("\n"));
        reject(new Error(`${name} exited ${code}`));
      }
    });
  });
}

async function generateHeaders(corpus) {
  const { default: { writeFileSync } } = await import("fs");
  const { join: pjoin } = await import("path");

  const OUTPUT = pjoin(PROJECT_ROOT, "blueprints", "blueprint-headers.json");
  const start = Date.now();

  function oneline(desc, max = 100) {
    if (!desc) return "";
    const s = String(desc).replace(/\s+/g, " ").trim();
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  }

  const headers = [];
  for (const entry of corpus.all) {
    const bp = entry.parsed;
    if (!bp?.feature || !bp?.category) continue;
    const h = { id: bp.feature, c: bp.category, d: oneline(bp.description) };
    const a = Array.isArray(bp.aliases) && bp.aliases.length ? bp.aliases.slice(0, 4) : null;
    if (a) h.a = a;
    const t = Array.isArray(bp.tags) && bp.tags.length ? bp.tags.slice(0, 5) : null;
    if (t) h.t = t;
    const r = Array.isArray(bp.related)
      ? bp.related.map((x) => (typeof x === "string" ? x : x?.feature)).filter(Boolean).slice(0, 5)
      : [];
    if (r.length) h.r = r;
    headers.push(h);
  }

  headers.sort((a, b) => (a.c + a.id).localeCompare(b.c + b.id));
  const payload = {
    version: 1,
    generated_at: new Date().toISOString(),
    count: headers.length,
    categories: [...new Set(headers.map((h) => h.c))].sort(),
    // Keys: id=feature, c=category, d=description, a=aliases, t=tags, r=related
    blueprints: headers,
  };
  const json = JSON.stringify(payload);
  writeFileSync(OUTPUT, json, "utf-8");

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const sizeKb = (Buffer.byteLength(json) / 1024).toFixed(0);
  console.log(`  ✓ headers         ${elapsed}s  ${headers.length} blueprints → ${sizeKb} KB`);
}

async function main() {
  const args = process.argv.slice(2);
  const headersOnly = args.includes("--headers");
  const skipHeaders = args.includes("--no-headers");

  const total = Date.now();
  console.log("\nFDL Generate (parallel)\n" + "─".repeat(44));

  // Load corpus once for headers generation + manifest save
  const corpus = await loadCorpus({ incremental: true });

  const tasks = [];

  if (!skipHeaders) {
    tasks.push(generateHeaders(corpus));
  }

  if (!headersOnly) {
    tasks.push(
      runScript("generate-docs.js"),
      runScript("generate-api.js"),
      runScript("generate-readmes.js"),
      runScript("generate-agi-registry.js"),
      runScript("generate-relationship-graph.js"),
    );
  }

  const results = await Promise.allSettled(tasks);
  const failed = results.filter((r) => r.status === "rejected");

  // Save manifest after a successful (or partial) run — next run benefits from cache
  try { saveManifest(corpus); } catch { /* non-fatal */ }

  const elapsed = ((Date.now() - total) / 1000).toFixed(1);
  console.log("─".repeat(44));
  if (failed.length) {
    console.error(`\n${failed.length} task(s) failed:`);
    for (const f of failed) console.error("  •", f.reason?.message);
    process.exit(1);
  }
  console.log(`\n✓ Done in ${elapsed}s  (corpus: ${corpus.stats.total} blueprints, ${corpus.stats.changed} changed)\n`);
}

main().catch((err) => {
  console.error("run-generate failed:", err.message);
  process.exit(1);
});
