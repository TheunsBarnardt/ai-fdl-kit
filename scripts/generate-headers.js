#!/usr/bin/env node
/**
 * generate-headers.js — emit blueprints/blueprint-headers.json
 *
 * Slim retrieval index consumed by /fdl-build, /fdl-brainstorm, /fdl-create
 * in place of loading the 287 KB INDEX.md. Target: <100 KB total.
 *
 * Record shape:
 *   { id, category, title, aliases, tags, oneline, related }
 *
 * INDEX.md remains as the human-readable artifact; skills should prefer
 * this JSON file for match/filter, then lazy-load the full YAML for the
 * 1-5 blueprints they actually need.
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { loadCorpus, PROJECT_ROOT } from "./lib/corpus.js";

const OUTPUT = join(PROJECT_ROOT, "blueprints", "blueprint-headers.json");

function oneline(desc, max = 100) {
  if (!desc) return "";
  const s = String(desc).replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function headerFor(bp) {
  if (!bp) return null;
  const h = {
    id: bp.feature,
    c: bp.category,  // abbreviated key to reduce JSON bulk
    d: oneline(bp.description),
  };
  const aliases = Array.isArray(bp.aliases) && bp.aliases.length ? bp.aliases.slice(0, 4) : null;
  if (aliases) h.a = aliases;
  const tags = Array.isArray(bp.tags) && bp.tags.length ? bp.tags.slice(0, 5) : null;
  if (tags) h.t = tags;
  const related = Array.isArray(bp.related)
    ? bp.related.map((r) => (typeof r === "string" ? r : r.feature)).filter(Boolean).slice(0, 5)
    : [];
  if (related.length) h.r = related;
  return h;
}

async function main() {
  const corpus = await loadCorpus();
  const headers = [];
  let skipped = 0;

  for (const entry of corpus.all) {
    if (!entry.parsed || !entry.parsed.feature || !entry.parsed.category) {
      skipped++;
      continue;
    }
    headers.push(headerFor(entry.parsed));
  }

  headers.sort((a, b) => (a.c + a.id).localeCompare(b.c + b.id));

  const payload = {
    version: 1,
    generated_at: new Date().toISOString(),
    count: headers.length,
    categories: [...new Set(headers.map((h) => h.c))].sort(),
    // Keys: id=feature id, c=category, d=description (oneline), a=aliases, t=tags, r=related features
    blueprints: headers,
  };

  const json = JSON.stringify(payload);
  writeFileSync(OUTPUT, json, "utf-8");

  const sizeKb = (Buffer.byteLength(json, "utf-8") / 1024).toFixed(1);
  console.log(`generate-headers: ${headers.length} blueprints → ${OUTPUT} (${sizeKb} KB, skipped ${skipped})`);
}

main().catch((err) => {
  console.error("generate-headers failed:", err);
  process.exit(1);
});
