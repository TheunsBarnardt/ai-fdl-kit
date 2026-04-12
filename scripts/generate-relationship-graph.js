#!/usr/bin/env node

/**
 * FDL Relationship Graph Generator
 *
 * Scans all blueprints' related[] arrays and builds a dependency graph.
 * AI tools use this to discover feature dependencies without fetching
 * every blueprint individually.
 *
 * Output: docs/api/relationship-graph.json
 *
 * Usage:
 *   node scripts/generate-relationship-graph.js          # generate
 *   node scripts/generate-relationship-graph.js --json   # stdout only
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, relative, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import YAML from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");

/**
 * Build a relationship graph from blueprint files.
 * @param {string[]} files - absolute paths to blueprint YAML files
 * @returns {object} graph with nodes, edges, reverse, categories
 */
function buildRelationshipGraph(files) {
  const nodes = {};
  const edges = {};
  const reverse = {};
  const categories = {};

  // Parse all blueprints
  for (const file of files) {
    let bp;
    try {
      bp = YAML.parse(readFileSync(file, "utf-8"));
    } catch {
      continue;
    }
    if (!bp || !bp.feature) continue;

    const relPath = relative(PROJECT_ROOT, file).replace(/\\/g, "/");

    // Register node
    nodes[bp.feature] = {
      category: bp.category || "unknown",
      file: relPath,
      description: bp.description || "",
      tags: bp.tags || [],
    };

    // Register in category index
    const cat = bp.category || "unknown";
    if (!categories[cat]) categories[cat] = [];
    if (!categories[cat].includes(bp.feature)) categories[cat].push(bp.feature);

    // Build forward edges from related[]
    if (Array.isArray(bp.related)) {
      if (!edges[bp.feature]) {
        edges[bp.feature] = { required: [], recommended: [], optional: [], extends: [] };
      }
      for (const rel of bp.related) {
        if (!rel || !rel.feature || !rel.type) continue;
        const type = rel.type;
        if (edges[bp.feature][type] && !edges[bp.feature][type].includes(rel.feature)) {
          edges[bp.feature][type].push(rel.feature);
        }

        // Build reverse edges
        if (!reverse[rel.feature]) {
          reverse[rel.feature] = { required_by: [], recommended_by: [], optional_for: [], extended_by: [] };
        }
        const reverseKey = type === "required" ? "required_by"
          : type === "recommended" ? "recommended_by"
          : type === "optional" ? "optional_for"
          : "extended_by";
        if (!reverse[rel.feature][reverseKey].includes(bp.feature)) {
          reverse[rel.feature][reverseKey].push(bp.feature);
        }
      }
    }
  }

  // Sort category lists
  for (const cat of Object.keys(categories)) {
    categories[cat].sort();
  }

  // Stats
  const totalEdges = Object.values(edges).reduce((sum, e) =>
    sum + e.required.length + e.recommended.length + e.optional.length + e.extends.length, 0);

  return {
    generated: new Date().toISOString(),
    stats: {
      totalNodes: Object.keys(nodes).length,
      totalEdges,
      totalCategories: Object.keys(categories).length,
    },
    nodes,
    edges,
    reverse,
    categories,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");

  const files = await glob("blueprints/**/*.blueprint.yaml", {
    cwd: PROJECT_ROOT,
    absolute: true,
  });

  const graph = buildRelationshipGraph(files.filter((f) => !f.includes(".proposed.")));

  if (jsonOutput) {
    console.log(JSON.stringify(graph, null, 2));
  } else {
    const outDir = resolve(PROJECT_ROOT, "docs/api");
    mkdirSync(outDir, { recursive: true });
    const outPath = resolve(outDir, "relationship-graph.json");
    writeFileSync(outPath, JSON.stringify(graph, null, 2));

    const { stats } = graph;
    console.log(`\nRelationship Graph generated`);
    console.log(`  nodes:      ${stats.totalNodes}`);
    console.log(`  edges:      ${stats.totalEdges}`);
    console.log(`  categories: ${stats.totalCategories}`);
    console.log(`  written to: ${relative(PROJECT_ROOT, outPath)}`);
  }
}

// ─── Exports for testing ─────────────────────────────────

export { buildRelationshipGraph };

// ─── Run CLI only when invoked directly ──────────────────

import { pathToFileURL } from "url";
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
