#!/usr/bin/env node
// Detect near-duplicate blueprints using TF-IDF cosine similarity
// over feature name + aliases + description + tags + rule text.
//
// Usage:
//   node scripts/similarity.js                                 # full pairwise scan
//   node scripts/similarity.js blueprints/auth/login.blueprint.yaml   # nearest neighbours to one file
//   node scripts/similarity.js --threshold 0.45                # override default
//   node scripts/similarity.js --json                          # machine-readable output
//
// Intended caller: /fdl-create — before authoring a new blueprint,
// check whether something semantically close already exists.

import { readFileSync } from 'fs';
import { globSync } from 'glob';
import yaml from 'yaml';

const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','then','of','to','in','on','for','with','by',
  'is','are','was','were','be','been','being','has','have','had','do','does','did',
  'this','that','these','those','it','its','as','at','from','not','no','user','users',
  'must','should','can','may','will','shall','feature','blueprint'
]);

function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

function blueprintText(bp) {
  const parts = [
    bp.feature,
    bp.description,
    (bp.tags || []).join(' '),
    (bp.aliases || []).join(' '),
    Object.keys(bp.rules || {}).join(' '),
    Object.values(bp.rules || {}).map(r => typeof r === 'string' ? r : JSON.stringify(r)).join(' '),
    Object.keys(bp.outcomes || {}).join(' ')
  ];
  return tokenize(parts.join(' '));
}

function termFreq(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

function tfidfVector(tf, idf) {
  const v = new Map();
  for (const [term, count] of tf) {
    const weight = idf.get(term);
    if (weight) v.set(term, count * weight);
  }
  return v;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const [, w] of a) na += w * w;
  for (const [, w] of b) nb += w * w;
  const smaller = a.size < b.size ? a : b;
  const larger = a.size < b.size ? b : a;
  for (const [term, w] of smaller) {
    const other = larger.get(term);
    if (other) dot += w * other;
  }
  return (na && nb) ? dot / Math.sqrt(na * nb) : 0;
}

function loadBlueprints() {
  const files = globSync('blueprints/**/*.blueprint.yaml');
  return files.map(file => {
    try {
      const bp = yaml.parse(readFileSync(file, 'utf8'));
      return { file, bp, tokens: blueprintText(bp) };
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function buildIdf(docs) {
  const df = new Map();
  for (const d of docs) {
    const seen = new Set(d.tokens);
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = docs.length;
  const idf = new Map();
  for (const [t, c] of df) idf.set(t, Math.log(1 + N / c));
  return idf;
}

function run() {
  const args = process.argv.slice(2);
  const jsonOut = args.includes('--json');
  const thrIdx = args.indexOf('--threshold');
  const threshold = thrIdx >= 0 ? parseFloat(args[thrIdx + 1]) : 0.40;
  const target = args.find(a => a.endsWith('.blueprint.yaml'));

  const docs = loadBlueprints();
  const idf = buildIdf(docs);
  for (const d of docs) d.vec = tfidfVector(termFreq(d.tokens), idf);

  const results = [];

  if (target) {
    const normalized = target.replace(/\\/g, '/');
    const anchor = docs.find(d => d.file.replace(/\\/g, '/') === normalized);
    if (!anchor) {
      console.error(`Blueprint not found: ${target}`);
      process.exit(1);
    }
    for (const d of docs) {
      if (d === anchor) continue;
      const score = cosine(anchor.vec, d.vec);
      if (score >= threshold) results.push({ a: anchor.file, b: d.file, score });
    }
  } else {
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const score = cosine(docs[i].vec, docs[j].vec);
        if (score >= threshold) results.push({ a: docs[i].file, b: docs[j].file, score });
      }
    }
  }

  results.sort((x, y) => y.score - x.score);

  if (jsonOut) {
    process.stdout.write(JSON.stringify(results, null, 2));
    return;
  }

  if (!results.length) {
    console.log(`No pairs above threshold ${threshold}.`);
    return;
  }
  console.log(`Found ${results.length} similar pair(s) above ${threshold}:\n`);
  for (const r of results) {
    console.log(`  ${r.score.toFixed(3)}  ${r.a}`);
    console.log(`         ${r.b}\n`);
  }
}

run();
