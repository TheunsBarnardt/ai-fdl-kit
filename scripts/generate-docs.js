#!/usr/bin/env node

/**
 * generate-docs.js
 * Reads all YAML blueprints and generates:
 *   - docs/blueprints/{category}/index.md  (category index pages)
 *   - docs/blueprints/{category}/{feature}.md (per-blueprint detail pages)
 *
 * AUTO-GENERATED FILES — do not edit the output manually.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename, dirname } from 'path';
import { glob } from 'glob';
import YAML from 'yaml';

const ROOT = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const PROJECT_ROOT = join(ROOT, '..');
const BLUEPRINTS_DIR = join(PROJECT_ROOT, 'blueprints');
const DOCS_DIR = join(PROJECT_ROOT, 'docs', 'blueprints');

const CATEGORY_LABELS = {
  auth: 'Auth',
  access: 'Access Control',
  data: 'Data',
  integration: 'Integration',
  payment: 'Payment',
  ui: 'UI',
  workflow: 'Workflow',
};

const CATEGORY_DESCRIPTIONS = {
  auth: 'Authentication, identity, and session management blueprints.',
  access: 'Permissions, roles, and access control blueprints.',
  data: 'CRUD, storage, versioning, and data management blueprints.',
  integration: 'External service and hardware integration blueprints.',
  payment: 'Checkout, invoicing, POS, and financial transaction blueprints.',
  ui: 'UI component systems, visual editors, and developer tooling blueprints.',
  workflow: 'Business process, job queue, automation, and pipeline blueprints.',
};

const CATEGORY_ORDER = {
  auth: 1,
  access: 2,
  data: 3,
  integration: 4,
  payment: 5,
  ui: 6,
  workflow: 7,
};

// ─── Helpers ────────────────────────────────────────────────

function titleCase(str) {
  return str
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function escMd(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

// ─── Renderers ──────────────────────────────────────────────

function renderFields(fields) {
  if (!fields || fields.length === 0) return '';
  let md = '## Fields\n\n';
  md += '| Name | Type | Required | Label | Description |\n';
  md += '|------|------|----------|-------|-------------|\n';
  for (const f of fields) {
    const validations = (f.validation || []).map((v) => v.type).join(', ');
    md += `| \`${f.name}\` | ${f.type} | ${f.required ? 'Yes' : 'No'} | ${escMd(f.label || '')} | ${validations ? `Validations: ${validations}` : ''} |\n`;
  }
  return md + '\n';
}

function renderRules(rules, depth = 0) {
  if (!rules) return '';
  let md = depth === 0 ? '## Rules\n\n' : '';
  const indent = '  '.repeat(depth);
  if (typeof rules === 'object' && !Array.isArray(rules)) {
    for (const [key, val] of Object.entries(rules)) {
      if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
        md += `${indent}- **${key}:**\n`;
        md += renderRules(val, depth + 1);
      } else if (Array.isArray(val)) {
        md += `${indent}- **${key}:** ${val.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(', ')}\n`;
      } else {
        md += `${indent}- **${key}:** ${val}\n`;
      }
    }
  } else if (Array.isArray(rules)) {
    for (const item of rules) {
      if (typeof item === 'string') {
        md += `${indent}- ${item}\n`;
      } else {
        md += renderRules(item, depth);
      }
    }
  }
  return depth === 0 ? md + '\n' : md;
}

function renderCondition(cond) {
  if (typeof cond === 'string') return cond;
  if (cond.field) {
    const parts = [`\`${cond.field}\``];
    if (cond.source) parts.push(`(${cond.source})`);
    parts.push(cond.operator || 'eq');
    if (cond.value !== undefined) parts.push(`\`${cond.value}\``);
    return parts.join(' ');
  }
  if (cond.any) return `ANY: ${cond.any.map(renderCondition).join(' OR ')}`;
  if (cond.all) return `ALL: ${cond.all.map(renderCondition).join(' AND ')}`;
  return JSON.stringify(cond);
}

function renderAction(action) {
  if (typeof action === 'string') return action;
  const parts = [`**${action.action}**`];
  if (action.target) parts.push(`target: \`${action.target}\``);
  if (action.event) parts.push(`event: \`${action.event}\``);
  if (action.field) parts.push(`field: \`${action.field}\``);
  if (action.value !== undefined) parts.push(`value: \`${action.value}\``);
  if (action.from) parts.push(`from: \`${action.from}\``);
  if (action.to) parts.push(`to: \`${action.to}\``);
  if (action.when) parts.push(`when: \`${action.when}\``);
  if (action.description) parts.push(`— ${action.description}`);
  return parts.join(' ');
}

function renderOutcomes(outcomes) {
  if (!outcomes) return '';
  let md = '## Outcomes\n\n';
  const entries = Object.entries(outcomes);
  // Sort by priority if available
  entries.sort((a, b) => (a[1].priority ?? 99) - (b[1].priority ?? 99));
  for (const [name, outcome] of entries) {
    md += `### ${titleCase(name)}`;
    if (outcome.priority !== undefined) md += ` (Priority: ${outcome.priority})`;
    if (outcome.error) md += ` — Error: \`${outcome.error}\``;
    if (outcome.transaction) md += ` | Transaction: atomic`;
    md += '\n\n';

    if (outcome.given && outcome.given.length > 0) {
      md += '**Given:**\n';
      for (const cond of outcome.given) {
        md += `- ${renderCondition(cond)}\n`;
      }
      md += '\n';
    }
    if (outcome.then && outcome.then.length > 0) {
      md += '**Then:**\n';
      for (const action of outcome.then) {
        md += `- ${renderAction(action)}\n`;
      }
      md += '\n';
    }
    if (outcome.result) {
      md += `**Result:** ${outcome.result}\n\n`;
    }
  }
  return md;
}

function renderErrors(errors) {
  if (!errors || errors.length === 0) return '';
  let md = '## Errors\n\n';
  md += '| Code | Status | Message | Retry |\n';
  md += '|------|--------|---------|-------|\n';
  for (const e of errors) {
    md += `| \`${e.code}\` | ${e.status || ''} | ${escMd(e.message || '')} | ${e.retry ? 'Yes' : 'No'} |\n`;
  }
  return md + '\n';
}

function renderEvents(events) {
  if (!events || events.length === 0) return '';
  let md = '## Events\n\n';
  md += '| Event | Description | Payload |\n';
  md += '|-------|-------------|----------|\n';
  for (const ev of events) {
    const payload = Array.isArray(ev.payload) ? ev.payload.map((p) => `\`${p}\``).join(', ') : '';
    md += `| \`${ev.name}\` | ${escMd(ev.description || '')} | ${payload} |\n`;
  }
  return md + '\n';
}

function renderRelated(related, category) {
  if (!related || related.length === 0) return '';
  let md = '## Related Blueprints\n\n';
  md += '| Feature | Relationship | Reason |\n';
  md += '|---------|-------------|--------|\n';
  for (const r of related) {
    const name = r.feature || r.name || '';
    md += `| ${escMd(name)} | ${r.type || ''} | ${escMd(r.reason || '')} |\n`;
  }
  return md + '\n';
}

function renderActors(actors) {
  if (!actors || actors.length === 0) return '';
  let md = '## Actors\n\n';
  md += '| ID | Name | Type | Description |\n';
  md += '|----|------|------|-------------|\n';
  for (const a of actors) {
    md += `| \`${a.id}\` | ${escMd(a.name)} | ${a.type} | ${escMd(a.description || '')} |\n`;
  }
  return md + '\n';
}

function renderStates(states) {
  if (!states) return '';
  let md = '## States\n\n';
  md += `**State field:** \`${states.field}\`\n\n`;
  if (states.values) {
    md += '**Values:**\n\n';
    md += '| State | Initial | Terminal |\n';
    md += '|-------|---------|----------|\n';
    // Handle both array and object formats
    const values = Array.isArray(states.values)
      ? states.values
      : Object.entries(states.values).map(([key, val]) =>
          typeof val === 'object' ? { name: key, ...val } : { name: key }
        );
    for (const v of values) {
      const name = v.name || v.value || v.id || v;
      md += `| \`${name}\` | ${v.initial ? 'Yes' : ''} | ${v.terminal ? 'Yes' : ''} |\n`;
    }
    md += '\n';
  }
  if (states.transitions) {
    md += '**Transitions:**\n\n';
    md += '| Name | From | To | Actor | Condition |\n';
    md += '|------|------|----|-------|-----------|\n';
    // Handle both array and object formats
    const transitions = Array.isArray(states.transitions)
      ? states.transitions
      : Object.entries(states.transitions).map(([key, val]) =>
          typeof val === 'object' ? { name: key, ...val } : { name: key }
        );
    for (const t of transitions) {
      md += `| ${escMd(t.name || '')} | \`${t.from}\` | \`${t.to}\` | ${escMd(t.actor || '')} | ${escMd(t.condition || '')} |\n`;
    }
    md += '\n';
  }
  return md;
}

function renderSla(sla) {
  if (!sla) return '';
  let md = '## SLA\n\n';
  md += '| Scope | Max Duration | Escalation |\n';
  md += '|-------|-------------|------------|\n';
  // Handle both array and object formats
  const items = Array.isArray(sla)
    ? sla
    : Object.entries(sla).map(([key, val]) =>
        typeof val === 'object' ? { name: key, ...val } : { name: key, max_duration: val }
      );
  for (const s of items) {
    const scope = s.name || s.transition || `${s.from_state || ''} → ${s.to_state || ''}`;
    md += `| ${escMd(scope)} | ${s.max_duration || ''} | ${escMd(s.escalation?.action || s.escalation || '')} |\n`;
  }
  return md + '\n';
}

function renderFlows(flows) {
  if (!flows) return '';
  let md = '## Flows\n\n';
  const entries = typeof flows === 'object' && !Array.isArray(flows) ? Object.entries(flows) : [];
  for (const [name, flow] of entries) {
    md += `### ${titleCase(name)}\n\n`;
    if (flow.description) md += `${flow.description}\n\n`;
    if (flow.steps) {
      for (const step of flow.steps) {
        md += `1. **${step.action || step.id}**`;
        if (step.actor) md += ` (${step.actor})`;
        if (step.description) md += ` — ${step.description}`;
        md += '\n';
      }
      md += '\n';
    }
  }
  return md;
}

function renderUiHints(ui_hints) {
  if (!ui_hints) return '';
  let md = '<details>\n<summary><strong>UI Hints</strong></summary>\n\n';
  md += '```yaml\n';
  md += YAML.stringify(ui_hints);
  md += '```\n\n</details>\n\n';
  return md;
}

function renderExtensions(extensions) {
  if (!extensions) return '';
  let md = '<details>\n<summary><strong>Extensions (framework-specific hints)</strong></summary>\n\n';
  md += '```yaml\n';
  md += YAML.stringify(extensions);
  md += '```\n\n</details>\n\n';
  return md;
}

function renderAgi(agi) {
  if (!agi) return '';
  let md = '## AGI Readiness\n\n';

  // Goals
  if (agi.goals?.length > 0) {
    md += '### Goals\n\n';
    for (const goal of agi.goals) {
      md += `#### ${titleCase(goal.id.replace(/_/g, '-'))}\n\n`;
      md += `${goal.description}\n\n`;
      if (goal.success_metrics?.length > 0) {
        md += '**Success Metrics:**\n\n';
        md += '| Metric | Target | Measurement |\n';
        md += '|--------|--------|-------------|\n';
        for (const m of goal.success_metrics) {
          md += `| ${escMd(m.metric)} | ${escMd(m.target)} | ${escMd(m.measurement || '')} |\n`;
        }
        md += '\n';
      }
      if (goal.constraints?.length > 0) {
        md += '**Constraints:**\n\n';
        for (const c of goal.constraints) {
          md += `- **${c.type}** ${c.negotiable ? '(negotiable)' : '(non-negotiable)'}: ${c.description}\n`;
        }
        md += '\n';
      }
    }
  }

  // Autonomy
  if (agi.autonomy) {
    md += '### Autonomy\n\n';
    md += `**Level:** \`${agi.autonomy.level}\`\n\n`;
    if (agi.autonomy.human_checkpoints?.length > 0) {
      md += '**Human Checkpoints:**\n\n';
      for (const cp of agi.autonomy.human_checkpoints) md += `- ${cp}\n`;
      md += '\n';
    }
    if (agi.autonomy.escalation_triggers?.length > 0) {
      md += '**Escalation Triggers:**\n\n';
      for (const t of agi.autonomy.escalation_triggers) md += `- \`${t}\`\n`;
      md += '\n';
    }
  }

  // Verification
  if (agi.verification) {
    md += '### Verification\n\n';
    if (agi.verification.invariants?.length > 0) {
      md += '**Invariants:**\n\n';
      for (const inv of agi.verification.invariants) md += `- ${inv}\n`;
      md += '\n';
    }
    if (agi.verification.acceptance_tests?.length > 0) {
      md += '**Acceptance Tests:**\n\n';
      md += '| Scenario | Given | When | Expect |\n';
      md += '|----------|-------|------|--------|\n';
      for (const test of agi.verification.acceptance_tests) {
        md += `| ${escMd(test.scenario)} | ${escMd(test.given || '')} | ${escMd(test.when || '')} | ${escMd(test.expect)} |\n`;
      }
      md += '\n';
    }
    if (agi.verification.monitoring?.length > 0) {
      md += '**Monitoring:**\n\n';
      md += '| Metric | Threshold | Action |\n';
      md += '|--------|-----------|--------|\n';
      for (const m of agi.verification.monitoring) {
        md += `| ${escMd(m.metric)} | ${escMd(m.threshold)} | ${escMd(m.action)} |\n`;
      }
      md += '\n';
    }
  }

  // Capabilities and Boundaries
  if (agi.capabilities?.length > 0 || agi.boundaries?.length > 0) {
    md += '### Composability\n\n';
    if (agi.capabilities?.length > 0) {
      md += '**Capabilities:**\n\n';
      for (const cap of agi.capabilities) {
        md += `- \`${cap.id}\`: ${cap.description}`;
        if (cap.requires?.length > 0) md += ` (requires: ${cap.requires.map((r) => `\`${r}\``).join(', ')})`;
        md += '\n';
      }
      md += '\n';
    }
    if (agi.boundaries?.length > 0) {
      md += '**Boundaries:**\n\n';
      for (const b of agi.boundaries) md += `- ${b}\n`;
      md += '\n';
    }
  }

  // Tradeoffs
  if (agi.tradeoffs?.length > 0) {
    md += '### Tradeoffs\n\n';
    md += '| Prefer | Over | Reason |\n';
    md += '|--------|------|--------|\n';
    for (const t of agi.tradeoffs) {
      md += `| ${escMd(t.prefer)} | ${escMd(t.over)} | ${escMd(t.reason || '')} |\n`;
    }
    md += '\n';
  }

  // Evolution
  if (agi.evolution) {
    md += '### Evolution\n\n';
    if (agi.evolution.triggers?.length > 0) {
      md += '**Triggers:**\n\n';
      md += '| Condition | Action |\n';
      md += '|-----------|--------|\n';
      for (const t of agi.evolution.triggers) {
        md += `| \`${escMd(t.condition)}\` | ${escMd(t.action)} |\n`;
      }
      md += '\n';
    }
    if (agi.evolution.deprecation?.length > 0) {
      md += '**Deprecation:**\n\n';
      md += '| Field | Remove After | Migration |\n';
      md += '|-------|-------------|----------|\n';
      for (const d of agi.evolution.deprecation) {
        md += `| \`${d.field}\` | ${d.remove_after} | ${escMd(d.migration)} |\n`;
      }
      md += '\n';
    }
  }

  return md;
}

// ─── SEO Description Generator ──────────────────────────────

function generateSeoDescription(bp) {
  const parts = [bp.description || ''];
  if (bp.fields) parts.push(`${bp.fields.length} fields`);
  if (bp.outcomes) parts.push(`${Object.keys(bp.outcomes).length} outcomes`);
  if (bp.errors) parts.push(`${bp.errors.length} error codes`);
  if (bp.rules) {
    const ruleKeys = Object.keys(bp.rules);
    if (ruleKeys.length > 0) parts.push(`rules: ${ruleKeys.slice(0, 3).join(', ')}`);
  }
  if (bp.agi) parts.push(`AGI: ${bp.agi.autonomy?.level || 'enabled'}`);
  return parts.join('. ').slice(0, 160);
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  const files = await glob('blueprints/**/*.blueprint.yaml', { cwd: PROJECT_ROOT });
  console.log(`Found ${files.length} blueprints`);

  const byCategory = {};

  for (const file of files) {
    const raw = readFileSync(join(PROJECT_ROOT, file), 'utf8');
    const bp = YAML.parse(raw);
    const category = bp.category || basename(dirname(file));
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push({ bp, file });
  }

  let totalPages = 0;

  for (const [category, blueprints] of Object.entries(byCategory)) {
    const catDir = join(DOCS_DIR, category);
    mkdirSync(catDir, { recursive: true });

    const label = CATEGORY_LABELS[category] || titleCase(category);
    const catDesc = CATEGORY_DESCRIPTIONS[category] || `${label} blueprints.`;

    // Category index page
    let indexMd = `---\ntitle: "${label}"\nlayout: default\nparent: Blueprint Catalog\nhas_children: true\nnav_order: ${CATEGORY_ORDER[category] || 99}\ndescription: "${escMd(catDesc)}"\n---\n\n`;
    indexMd += `# ${label} Blueprints\n\n`;
    indexMd += `${catDesc}\n\n`;
    indexMd += '| Blueprint | Description | Version |\n';
    indexMd += '|-----------|-------------|----------|\n';

    blueprints.sort((a, b) => a.bp.feature.localeCompare(b.bp.feature));

    for (const { bp } of blueprints) {
      indexMd += `| [${titleCase(bp.feature)}]({{ site.baseurl }}/blueprints/${category}/${bp.feature}/) | ${escMd(bp.description)} | ${bp.version} |\n`;
    }

    writeFileSync(join(catDir, 'index.md'), indexMd);

    // Per-blueprint pages
    for (const { bp, file } of blueprints) {
      const pageTitle = `${titleCase(bp.feature)} Blueprint`;
      const seoDesc = generateSeoDescription(bp);
      const tags = (bp.tags || []).join(', ');
      const yamlUrl = `https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/${file.replace(/\\/g, '/')}`;
      const apiUrl = `{{ site.baseurl }}/api/blueprints/${category}/${bp.feature}.json`;

      let md = `---\ntitle: "${pageTitle}"\nlayout: default\nparent: "${label}"\ngrand_parent: Blueprint Catalog\ndescription: "${escMd(seoDesc)}"\n---\n\n`;

      // Header
      md += `# ${pageTitle}\n\n`;
      md += `> ${bp.description}\n\n`;
      md += `| | |\n|---|---|\n`;
      md += `| **Feature** | \`${bp.feature}\` |\n`;
      md += `| **Category** | ${label} |\n`;
      md += `| **Version** | ${bp.version} |\n`;
      if (tags) md += `| **Tags** | ${tags} |\n`;
      md += `| **YAML Source** | [View on GitHub](${yamlUrl}) |\n`;
      md += `| **JSON API** | [${bp.feature}.json](${apiUrl}) |\n`;
      md += '\n';

      // Sections in order
      if (bp.actors) md += renderActors(bp.actors);
      md += renderFields(bp.fields);
      if (bp.states) md += renderStates(bp.states);
      md += renderRules(bp.rules);
      if (bp.sla) md += renderSla(bp.sla);
      if (bp.flows) md += renderFlows(bp.flows);
      md += renderOutcomes(bp.outcomes);
      md += renderErrors(bp.errors);
      md += renderEvents(bp.events);
      md += renderRelated(bp.related, category);
      if (bp.agi) md += renderAgi(bp.agi);
      if (bp.ui_hints) md += renderUiHints(bp.ui_hints);
      if (bp.extensions) md += renderExtensions(bp.extensions);

      // JSON-LD structured data for SEO
      md += `\n<script type="application/ld+json">\n`;
      md += JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: pageTitle,
          description: seoDesc,
          programmingLanguage: 'YAML',
          codeRepository: 'https://github.com/TheunsBarnardt/ai-fdl-kit',
          license: 'https://opensource.org/licenses/MIT',
          keywords: tags,
        },
        null,
        2
      );
      md += '\n</script>\n';

      writeFileSync(join(catDir, `${bp.feature}.md`), md);
      totalPages++;
    }
  }

  console.log(`Generated ${totalPages} blueprint pages across ${Object.keys(byCategory).length} categories`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
