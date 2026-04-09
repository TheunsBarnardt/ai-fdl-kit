#!/usr/bin/env node

/**
 * propagate-agi.js — Auto-generate AGI sections for blueprints that lack them
 *
 * Analyzes each blueprint's category, fields, actors, outcomes, errors, and rules
 * to generate an appropriate AGI section with goals, autonomy, safety, and more.
 *
 * Usage:
 *   node scripts/propagate-agi.js                    # Dry-run (preview only)
 *   node scripts/propagate-agi.js --apply            # Modify blueprint files
 *   node scripts/propagate-agi.js --category auth    # Only process one category
 *   node scripts/propagate-agi.js --file <path>      # Process a single file
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, relative } from "path";
import { glob } from "glob";
import YAML from "yaml";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");

// ─── Category-based AGI templates ────────────────────────

const CATEGORY_CONFIG = {
  auth: {
    autonomy: "supervised",
    risk: "high",
    goalFocus: "security",
    defaultTradeoff: { prefer: "security", over: "performance", reason: "authentication must prioritize preventing unauthorized access" },
  },
  access: {
    autonomy: "supervised",
    risk: "high",
    goalFocus: "security",
    defaultTradeoff: { prefer: "security", over: "usability", reason: "access control must enforce least-privilege principle" },
  },
  payment: {
    autonomy: "supervised",
    risk: "high",
    goalFocus: "compliance",
    defaultTradeoff: { prefer: "accuracy", over: "speed", reason: "financial transactions must be precise and auditable" },
  },
  trading: {
    autonomy: "supervised",
    risk: "high",
    goalFocus: "compliance",
    defaultTradeoff: { prefer: "accuracy", over: "latency", reason: "trading operations require precise execution and full audit trails" },
  },
  workflow: {
    autonomy: "semi_autonomous",
    risk: "medium",
    goalFocus: "efficiency",
    defaultTradeoff: { prefer: "reliability", over: "speed", reason: "workflow steps must complete correctly before proceeding" },
  },
  data: {
    autonomy: "supervised",
    risk: "medium",
    goalFocus: "integrity",
    defaultTradeoff: { prefer: "data_integrity", over: "performance", reason: "data consistency must be maintained across all operations" },
  },
  integration: {
    autonomy: "supervised",
    risk: "medium",
    goalFocus: "reliability",
    defaultTradeoff: { prefer: "reliability", over: "throughput", reason: "integration failures can cascade across systems" },
  },
  ai: {
    autonomy: "fully_autonomous",
    risk: "high",
    goalFocus: "alignment",
    defaultTradeoff: { prefer: "safety", over: "capability", reason: "AI systems must operate within defined safety boundaries" },
  },
  notification: {
    autonomy: "semi_autonomous",
    risk: "low",
    goalFocus: "delivery",
    defaultTradeoff: { prefer: "delivery_reliability", over: "speed", reason: "notifications must reach recipients even if delayed" },
  },
  ui: {
    autonomy: "semi_autonomous",
    risk: "low",
    goalFocus: "usability",
    defaultTradeoff: { prefer: "accessibility", over: "aesthetics", reason: "UI must be usable by all users including those with disabilities" },
  },
  infrastructure: {
    autonomy: "supervised",
    risk: "high",
    goalFocus: "availability",
    defaultTradeoff: { prefer: "availability", over: "cost", reason: "infrastructure downtime impacts all dependent services" },
  },
  manufacturing: {
    autonomy: "semi_autonomous",
    risk: "high",
    goalFocus: "safety",
    defaultTradeoff: { prefer: "safety", over: "throughput", reason: "manufacturing processes must prioritize worker and product safety" },
  },
  inventory: {
    autonomy: "semi_autonomous",
    risk: "medium",
    goalFocus: "accuracy",
    defaultTradeoff: { prefer: "accuracy", over: "speed", reason: "inventory counts must be precise to prevent stockouts and overstock" },
  },
  crm: {
    autonomy: "semi_autonomous",
    risk: "medium",
    goalFocus: "engagement",
    defaultTradeoff: { prefer: "data_quality", over: "volume", reason: "CRM data quality directly impacts customer relationship decisions" },
  },
  observability: {
    autonomy: "semi_autonomous",
    risk: "low",
    goalFocus: "visibility",
    defaultTradeoff: { prefer: "completeness", over: "performance", reason: "observability gaps hide production issues" },
  },
  quality: {
    autonomy: "supervised",
    risk: "medium",
    goalFocus: "compliance",
    defaultTradeoff: { prefer: "thoroughness", over: "speed", reason: "quality checks must be comprehensive to catch defects early" },
  },
  procurement: {
    autonomy: "supervised",
    risk: "medium",
    goalFocus: "compliance",
    defaultTradeoff: { prefer: "compliance", over: "speed", reason: "procurement must follow approval policies and budget controls" },
  },
  project: {
    autonomy: "semi_autonomous",
    risk: "medium",
    goalFocus: "efficiency",
    defaultTradeoff: { prefer: "visibility", over: "simplicity", reason: "project tracking must provide accurate status for stakeholders" },
  },
  asset: {
    autonomy: "supervised",
    risk: "medium",
    goalFocus: "tracking",
    defaultTradeoff: { prefer: "accuracy", over: "convenience", reason: "asset tracking must maintain precise location and status records" },
  },
};

// ─── AGI section generator ───────────────────────────────

function generateAgi(bp) {
  const config = CATEGORY_CONFIG[bp.category] || CATEGORY_CONFIG.data;
  const featureTitle = bp.feature.replace(/-/g, " ");
  const hasActors = Array.isArray(bp.actors) && bp.actors.length > 0;
  const hasHumanActors = hasActors && bp.actors.some((a) => a.type === "human");
  const hasStates = bp.states && bp.states.values;
  const outcomeNames = bp.outcomes ? Object.keys(bp.outcomes) : [];
  const errorCount = Array.isArray(bp.errors) ? bp.errors.length : 0;
  const fieldCount = Array.isArray(bp.fields) ? bp.fields.length : 0;
  const hasSensitiveFields = Array.isArray(bp.fields) && bp.fields.some((f) => f.sensitive || f.type === "password" || f.type === "token");
  const relatedFeatures = Array.isArray(bp.related) ? bp.related : [];

  const agi = {};

  // ─── Goals ───
  const goalId = bp.feature.replace(/-/g, "_");
  const goal = {
    id: `reliable_${goalId}`,
    description: `${bp.description}`,
    success_metrics: [],
    constraints: [],
  };

  // Success metrics based on category focus
  switch (config.goalFocus) {
    case "security":
      goal.success_metrics.push(
        { metric: "unauthorized_access_rate", target: "0%", measurement: "Failed authorization attempts that succeed" },
        { metric: "response_time_p95", target: "< 500ms", measurement: "95th percentile response time" }
      );
      goal.constraints.push({ type: "security", description: "Follow OWASP security recommendations", negotiable: false });
      break;
    case "compliance":
      goal.success_metrics.push(
        { metric: "policy_violation_rate", target: "0%", measurement: "Operations that violate defined policies" },
        { metric: "audit_completeness", target: "100%", measurement: "All decisions have complete audit trails" }
      );
      goal.constraints.push({ type: "regulatory", description: "All operations must be auditable and traceable", negotiable: false });
      break;
    case "efficiency":
      goal.success_metrics.push(
        { metric: "processing_time", target: "< 5s", measurement: "Time from request to completion" },
        { metric: "success_rate", target: ">= 99%", measurement: "Successful operations divided by total attempts" }
      );
      goal.constraints.push({ type: "performance", description: "Must not block dependent workflows", negotiable: true });
      break;
    case "integrity":
      goal.success_metrics.push(
        { metric: "data_accuracy", target: "100%", measurement: "Records matching source of truth" },
        { metric: "duplicate_rate", target: "0%", measurement: "Duplicate records detected post-creation" }
      );
      goal.constraints.push({ type: "performance", description: "Data consistency must be maintained across concurrent operations", negotiable: false });
      break;
    case "reliability":
      goal.success_metrics.push(
        { metric: "success_rate", target: ">= 99.5%", measurement: "Successful operations divided by total attempts" },
        { metric: "error_recovery_rate", target: ">= 95%", measurement: "Errors that auto-recover without manual intervention" }
      );
      goal.constraints.push({ type: "availability", description: "Must degrade gracefully when dependencies are unavailable", negotiable: false });
      break;
    default:
      goal.success_metrics.push(
        { metric: "success_rate", target: ">= 99%", measurement: "Successful operations divided by total attempts" },
        { metric: "error_rate", target: "< 1%", measurement: "Failed operations divided by total attempts" }
      );
      break;
  }

  if (hasSensitiveFields) {
    goal.constraints.push({ type: "security", description: "Sensitive fields must be encrypted at rest and never logged in plaintext", negotiable: false });
  }

  agi.goals = [goal];

  // ─── Autonomy ───
  const autonomy = { level: config.autonomy };

  if (hasHumanActors || config.risk === "high") {
    autonomy.human_checkpoints = [];
    if (hasSensitiveFields) autonomy.human_checkpoints.push("before modifying sensitive data fields");
    if (hasStates) autonomy.human_checkpoints.push("before transitioning to a terminal state");
    if (outcomeNames.some((n) => /delet|remov|purg|destroy/i.test(n))) {
      autonomy.human_checkpoints.push("before permanently deleting records");
    }
    if (autonomy.human_checkpoints.length === 0) {
      autonomy.human_checkpoints.push("before making irreversible changes");
    }
  }

  if (errorCount > 0) {
    autonomy.escalation_triggers = [`error_rate > 5`];
    if (config.risk === "high") {
      autonomy.escalation_triggers.push(`consecutive_failures > 3`);
    }
  }

  agi.autonomy = autonomy;

  // ─── Safety ───
  if (outcomeNames.length > 0) {
    const actionPermissions = [];
    for (const name of outcomeNames) {
      let permission = "autonomous";
      if (/delet|remov|purg|destroy|disable|block|suspend|revok/i.test(name)) {
        permission = "human_required";
      } else if (/creat|updat|modif|chang|approv|reject|cancel|override/i.test(name)) {
        permission = "supervised";
      }
      actionPermissions.push({ action: name, permission });
    }
    // Deduplicate by permission level — keep the most restrictive for similar actions
    if (actionPermissions.length > 0) {
      agi.safety = { action_permissions: actionPermissions };
    }
  }

  // ─── Tradeoffs ───
  agi.tradeoffs = [config.defaultTradeoff];

  // ─── Verification (for high-risk categories) ───
  if (config.risk === "high" || hasSensitiveFields) {
    const invariants = [];
    if (hasSensitiveFields) {
      invariants.push("sensitive fields are never logged in plaintext");
      invariants.push("all data access is authenticated and authorized");
    }
    if (errorCount > 0) {
      invariants.push("error messages never expose internal system details");
    }
    if (hasStates) {
      invariants.push("state transitions follow the defined state machine — no illegal transitions");
    }
    if (invariants.length > 0) {
      agi.verification = { invariants };
    }
  }

  // ─── Coordination (if related features exist) ───
  if (relatedFeatures.length > 0) {
    const consumes = [];
    for (const rel of relatedFeatures) {
      if (rel.type === "required") {
        consumes.push({
          capability: rel.feature.replace(/-/g, "_"),
          from: rel.feature,
          fallback: config.risk === "high" ? "fail" : "degrade",
        });
      }
    }
    if (consumes.length > 0) {
      agi.coordination = {
        protocol: hasActors ? "orchestrated" : "request_response",
        consumes,
      };
    }
  }

  return agi;
}

// ─── YAML serializer for AGI section ─────────────────────

function serializeAgi(agi) {
  // Use YAML library to serialize, then add the section header comment
  const doc = new YAML.Document(agi);
  doc.commentBefore = " --- AGI READINESS (auto-generated by propagate-agi.js) ---";
  let yaml = doc.toString({ lineWidth: 120 });
  // Indent everything under "agi:" top-level key
  const lines = yaml.split("\n");
  const indented = lines.map((line) => (line.trim() === "" ? "" : `  ${line}`)).join("\n");
  return `\n# ─── AGI READINESS ─────────────────────────────────────────\n\nagi:\n${indented}`;
}

// ─── Find insertion point in blueprint file ──────────────

function findInsertionPoint(content) {
  const lines = content.split("\n");

  // Look for ui_hints or extensions — insert before them
  for (let i = 0; i < lines.length; i++) {
    if (/^ui_hints:/.test(lines[i]) || /^extensions:/.test(lines[i])) {
      return i;
    }
  }

  // Otherwise append at the end
  return lines.length;
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const categoryFilter = args.includes("--category") ? args[args.indexOf("--category") + 1] : null;
  const fileFilter = args.includes("--file") ? args[args.indexOf("--file") + 1] : null;

  let files;
  if (fileFilter) {
    files = [resolve(fileFilter)];
  } else {
    const pattern = categoryFilter
      ? `blueprints/${categoryFilter}/*.blueprint.yaml`
      : "blueprints/**/*.blueprint.yaml";
    files = await glob(pattern, { cwd: PROJECT_ROOT, absolute: true });
  }

  console.log(`FDL AGI Propagation${apply ? "" : " (DRY RUN)"}`);
  console.log("=".repeat(60));
  console.log(`\nScanning ${files.length} blueprint files...\n`);

  let skipped = 0;
  let updated = 0;
  let errors = 0;

  for (const file of files) {
    const relPath = relative(PROJECT_ROOT, file).replace(/\\/g, "/");
    let content;
    try {
      content = readFileSync(file, "utf-8");
    } catch (err) {
      console.log(`  ERROR  ${relPath}: ${err.message}`);
      errors++;
      continue;
    }

    // Skip if already has agi section
    if (/^agi:/m.test(content)) {
      skipped++;
      continue;
    }

    let bp;
    try {
      bp = YAML.parse(content);
    } catch (err) {
      console.log(`  ERROR  ${relPath}: YAML parse error — ${err.message}`);
      errors++;
      continue;
    }

    if (!bp || !bp.feature || !bp.category) {
      console.log(`  SKIP   ${relPath}: missing feature or category`);
      skipped++;
      continue;
    }

    // Generate AGI section
    const agi = generateAgi(bp);
    const agiYaml = serializeAgi(agi);

    if (apply) {
      // Insert AGI section into the file
      const lines = content.split("\n");
      const insertAt = findInsertionPoint(content);
      lines.splice(insertAt, 0, agiYaml);
      writeFileSync(file, lines.join("\n"), "utf-8");
      console.log(`  APPLY  ${relPath} (${bp.category})`);
    } else {
      console.log(`  WOULD  ${relPath} (${bp.category})`);
      console.log(`         autonomy: ${agi.autonomy.level}, goals: ${agi.goals.length}, safety: ${agi.safety?.action_permissions?.length || 0} actions`);
    }
    updated++;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${updated} ${apply ? "updated" : "would update"}, ${skipped} skipped (already have AGI), ${errors} errors`);
  console.log("=".repeat(60));

  if (!apply && updated > 0) {
    console.log(`\nRun with --apply to write changes to disk.`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
