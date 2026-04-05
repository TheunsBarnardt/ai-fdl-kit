#!/usr/bin/env node

/**
 * generate-api.js
 * Reads all YAML blueprints and generates:
 *   - docs/api/registry.json                         (index of all blueprints)
 *   - docs/api/blueprints/{category}/{feature}.json   (YAML→JSON per blueprint)
 *
 * AUTO-GENERATED FILES — do not edit the output manually.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { glob } from 'glob';
import YAML from 'yaml';

const ROOT = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const PROJECT_ROOT = join(ROOT, '..');
const API_DIR = join(PROJECT_ROOT, 'docs', 'api');
const BLUEPRINTS_API_DIR = join(API_DIR, 'blueprints');

async function main() {
  const files = await glob('blueprints/**/*.blueprint.yaml', { cwd: PROJECT_ROOT });
  console.log(`Found ${files.length} blueprints for API generation`);

  const registry = {
    $schema: 'https://theunsbarnardt.github.io/ai-fdl-kit/api/registry.json',
    name: 'Feature Definition Language (FDL) Blueprint Registry',
    version: '1.0.0',
    generated: new Date().toISOString(),
    total: files.length,
    base_url: 'https://theunsbarnardt.github.io/ai-fdl-kit/api/blueprints',
    categories: {},
  };

  for (const file of files) {
    const raw = readFileSync(join(PROJECT_ROOT, file), 'utf8');
    const bp = YAML.parse(raw);
    const category = bp.category || basename(dirname(file));
    const feature = bp.feature;

    // Write per-blueprint JSON
    const catDir = join(BLUEPRINTS_API_DIR, category);
    mkdirSync(catDir, { recursive: true });
    writeFileSync(join(catDir, `${feature}.json`), JSON.stringify(bp, null, 2));

    // Add to registry
    if (!registry.categories[category]) {
      registry.categories[category] = { count: 0, blueprints: [] };
    }
    registry.categories[category].count++;
    registry.categories[category].blueprints.push({
      feature,
      version: bp.version,
      description: bp.description,
      tags: bp.tags || [],
      api_url: `${registry.base_url}/${category}/${feature}.json`,
      yaml_url: `https://raw.githubusercontent.com/TheunsBarnardt/ai-fdl-kit/master/${file.replace(/\\/g, '/')}`,
    });
  }

  // Sort blueprints within each category
  for (const cat of Object.values(registry.categories)) {
    cat.blueprints.sort((a, b) => a.feature.localeCompare(b.feature));
  }

  // Write registry
  mkdirSync(API_DIR, { recursive: true });
  writeFileSync(join(API_DIR, 'registry.json'), JSON.stringify(registry, null, 2));

  console.log(`Generated ${files.length} JSON files + registry.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
