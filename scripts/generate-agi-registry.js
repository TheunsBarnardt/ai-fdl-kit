#!/usr/bin/env node

/**
 * FDL AGI Capability Registry Generator
 *
 * Scans all blueprints for agi.coordination sections and produces a
 * central registry mapping capabilities to their providers and consumers.
 *
 * Output: docs/api/agi-capability-registry.json
 *
 * Usage:
 *   node scripts/generate-agi-registry.js           # generate registry
 *   node scripts/generate-agi-registry.js --json     # output to stdout instead of file
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
 * Scan blueprints and build the capability registry.
 * @param {string[]} files - absolute paths to blueprint files
 * @returns {object} registry data
 */
function buildRegistry(files) {
  // capability name → { exportedBy, contract, consumers[] }
  const capabilities = {};
  // Tracking issues
  const orphanConsumes = [];
  const unexposedCapabilities = [];

  // First pass: collect all exposes
  const blueprintMap = new Map(); // feature → { file, exposes Set }
  const allConsumes = []; // deferred for second pass

  for (const file of files) {
    let bp;
    try {
      bp = YAML.parse(readFileSync(file, "utf-8"));
    } catch {
      continue;
    }
    if (!bp || !bp.feature) continue;

    const relPath = relative(PROJECT_ROOT, file).replace(/\\/g, "/");
    const exposesSet = new Set();

    if (bp.agi?.coordination?.exposes) {
      for (const exp of bp.agi.coordination.exposes) {
        if (!exp.capability) continue;
        exposesSet.add(exp.capability);

        if (!capabilities[exp.capability]) {
          capabilities[exp.capability] = {
            exportedBy: bp.feature,
            file: relPath,
            contract: exp.contract || "",
            consumers: [],
          };
        }
      }
    }

    blueprintMap.set(bp.feature, { file: relPath, exposes: exposesSet });

    if (bp.agi?.coordination?.consumes) {
      for (const con of bp.agi.coordination.consumes) {
        allConsumes.push({
          feature: bp.feature,
          file: relPath,
          capability: con.capability,
          from: con.from,
          fallback: con.fallback || "fail",
        });
      }
    }
  }

  // Second pass: resolve consumes against exposes
  for (const con of allConsumes) {
    const provider = blueprintMap.get(con.from);

    if (!provider) {
      // Provider blueprint doesn't exist
      orphanConsumes.push({
        feature: con.feature,
        capability: con.capability,
        from: con.from,
        reason: `blueprint "${con.from}" not found`,
      });
      continue;
    }

    if (!provider.exposes.has(con.capability)) {
      // Provider exists but doesn't expose this capability
      unexposedCapabilities.push({
        feature: con.feature,
        capability: con.capability,
        from: con.from,
        reason: `"${con.from}" exists but does not expose capability "${con.capability}"`,
      });
      continue;
    }

    // Valid consume → add to the capability's consumer list
    if (capabilities[con.capability]) {
      capabilities[con.capability].consumers.push({
        feature: con.feature,
        fallback: con.fallback,
      });
    }
  }

  // Stats
  const totalCapabilities = Object.keys(capabilities).length;
  const totalConsumes = allConsumes.length;
  const validConsumes = totalConsumes - orphanConsumes.length - unexposedCapabilities.length;

  return {
    generated: new Date().toISOString(),
    stats: {
      totalCapabilities,
      totalConsumes,
      validConsumes,
      orphanConsumes: orphanConsumes.length,
      unexposedCapabilities: unexposedCapabilities.length,
    },
    capabilities,
    orphanConsumes,
    unexposedCapabilities,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");

  const files = await glob("blueprints/**/*.blueprint.yaml", {
    cwd: PROJECT_ROOT,
    absolute: true,
  });

  const registry = buildRegistry(files.filter((f) => !f.includes(".proposed.")));

  if (jsonOutput) {
    console.log(JSON.stringify(registry, null, 2));
  } else {
    const outDir = resolve(PROJECT_ROOT, "docs/api");
    mkdirSync(outDir, { recursive: true });
    const outPath = resolve(outDir, "agi-capability-registry.json");
    writeFileSync(outPath, JSON.stringify(registry, null, 2));

    const { stats } = registry;
    console.log(`\nAGI Capability Registry generated`);
    console.log(`  capabilities: ${stats.totalCapabilities}`);
    console.log(`  consumes:     ${stats.totalConsumes} (${stats.validConsumes} valid)`);
    if (stats.orphanConsumes > 0) {
      console.log(`  orphan:       ${stats.orphanConsumes} (provider blueprint missing)`);
    }
    if (stats.unexposedCapabilities > 0) {
      console.log(`  unexposed:    ${stats.unexposedCapabilities} (provider exists but doesn't expose capability)`);
    }
    console.log(`  written to:   ${relative(PROJECT_ROOT, outPath)}`);
  }
}

// ─── Exports for testing ─────────────────────────────────

export { buildRegistry };

// ─── Run CLI only when invoked directly ──────────────────

import { pathToFileURL } from "url";
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
