#!/usr/bin/env node
/**
 * corpus.js — shared blueprint corpus loader with content-hash cache
 *
 * Single source of truth for reading blueprints. Eliminates redundant YAML
 * parses across the pipeline (validate/completeness/propagate/generate/...).
 *
 * Public API:
 *   loadCorpus({ incremental?: boolean, full?: boolean })
 *     → { blueprints: Map<path, Entry>, byId: Map<feature, Entry>,
 *         byCategory: Map<category, Entry[]>, changed: Set<path>, all: Entry[] }
 *
 *   Entry = { path, relPath, raw, parsed, hash, mtime, category, feature, cached }
 *
 *   saveManifest(corpus) — persist hash manifest after a successful run.
 *
 * The manifest lives at .cache/corpus-manifest.json and invalidates when
 * any file under scripts/lib/ or schema/ changes.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync } from "fs";
import { resolve, relative, dirname, join } from "path";
import { createHash } from "crypto";
import { glob } from "glob";
import YAML from "yaml";

const PROJECT_ROOT = resolve(import.meta.dirname, "..", "..");
const CACHE_DIR = join(PROJECT_ROOT, ".cache");
const MANIFEST_PATH = join(CACHE_DIR, "corpus-manifest.json");
const BLUEPRINT_GLOB = "blueprints/**/*.blueprint.yaml";

function sha1(buf) {
  return createHash("sha1").update(buf).digest("hex");
}

function walkForLibHash(dir) {
  let h = createHash("sha1");
  if (!existsSync(dir)) return h.digest("hex");
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      h.update(walkForLibHash(full));
    } else {
      h.update(name);
      h.update(readFileSync(full));
    }
  }
  return h.digest("hex");
}

function computeToolchainHash() {
  const libHash = walkForLibHash(join(PROJECT_ROOT, "scripts", "lib"));
  const schemaPath = join(PROJECT_ROOT, "schema", "blueprint.schema.yaml");
  const schemaHash = existsSync(schemaPath) ? sha1(readFileSync(schemaPath)) : "no-schema";
  return sha1(libHash + schemaHash);
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
  } catch {
    return null;
  }
}

export async function loadCorpus({ incremental = false, full = false } = {}) {
  const toolchainHash = computeToolchainHash();
  const manifest = incremental && !full ? loadManifest() : null;
  const manifestValid = manifest && manifest.toolchainHash === toolchainHash;
  const prevHashes = manifestValid ? manifest.hashes || {} : {};

  const files = await glob(BLUEPRINT_GLOB, { cwd: PROJECT_ROOT, absolute: true });

  const blueprints = new Map();
  const byId = new Map();
  const byCategory = new Map();
  const changed = new Set();
  const all = [];
  const currentHashes = {};

  let parsedCount = 0;

  for (const file of files) {
    const relPath = relative(PROJECT_ROOT, file).replace(/\\/g, "/");
    const raw = readFileSync(file, "utf-8");
    const hash = sha1(raw);
    currentHashes[relPath] = hash;

    const isCached = manifestValid && prevHashes[relPath] === hash;
    if (!isCached) changed.add(relPath);

    let parsed = null;
    let parseError = null;
    try {
      parsed = YAML.parse(raw);
      parsedCount++;
    } catch (err) {
      parseError = err.message;
    }

    const mtime = statSync(file).mtimeMs;
    const entry = {
      path: file,
      relPath,
      raw,
      parsed,
      parseError,
      hash,
      mtime,
      cached: isCached,
      category: parsed?.category || null,
      feature: parsed?.feature || null,
    };
    blueprints.set(relPath, entry);
    all.push(entry);
    if (entry.feature) byId.set(entry.feature, entry);
    if (entry.category) {
      if (!byCategory.has(entry.category)) byCategory.set(entry.category, []);
      byCategory.get(entry.category).push(entry);
    }
  }

  const corpus = {
    blueprints,
    byId,
    byCategory,
    changed,
    all,
    stats: {
      total: all.length,
      parsed: parsedCount,
      changed: changed.size,
      cached: all.length - changed.size,
      toolchainHash,
    },
    _currentHashes: currentHashes,
    _toolchainHash: toolchainHash,
  };

  return corpus;
}

export function saveManifest(corpus) {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const manifest = {
    version: 1,
    toolchainHash: corpus._toolchainHash,
    writtenAt: new Date().toISOString(),
    hashes: corpus._currentHashes,
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
}

export { PROJECT_ROOT };
