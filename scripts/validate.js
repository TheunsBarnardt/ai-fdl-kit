#!/usr/bin/env node

/**
 * FDL Blueprint Validator
 *
 * Validates blueprint YAML files against the FDL meta-schema.
 * Can validate a single file or all blueprints in the project.
 *
 * Usage:
 *   node scripts/validate.js                          # validate all
 *   node scripts/validate.js blueprints/auth/login.blueprint.yaml  # validate one
 */

import { readFileSync } from "fs";
import { resolve, relative } from "path";
import { glob } from "glob";
import YAML from "yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { validateExpression } from "./expression.js";

// ─── JSON Schema equivalent of our FDL meta-schema ────────
// This is the machine-readable validation layer

const blueprintJsonSchema = {
  type: "object",
  required: [
    "feature",
    "version",
    "description",
    "category",
    "rules",
    // fields is optional for system-driven features (webhooks, scheduled jobs)
    // flows and outcomes are conditionally required — checked in validateFile()
  ],
  properties: {
    feature: {
      type: "string",
      pattern: "^[a-z][a-z0-9-]*$",
      description: "Unique kebab-case identifier",
    },
    version: {
      type: "string",
      pattern: "^\\d+\\.\\d+\\.\\d+$",
      description: "Semantic version",
    },
    description: {
      type: "string",
      maxLength: 200,
    },
    category: {
      type: "string",
      enum: [
        "auth",
        "data",
        "access",
        "ui",
        "integration",
        "notification",
        "payment",
        "workflow",
        "inventory",
        "manufacturing",
        "crm",
        "asset",
        "project",
        "quality",
        "procurement",
        "ai",
        "trading",
        "infrastructure",
        "observability",
        "security",
      ],
    },
    tags: {
      type: "array",
      items: { type: "string" },
    },
    fields: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/$defs/field" },
    },
    rules: {
      type: "object",
      minProperties: 1,
    },
    flows: {
      type: "object",
      minProperties: 1,
    },
    outcomes: {
      type: "object",
      minProperties: 1,
    },
    related: {
      type: "array",
      items: { $ref: "#/$defs/relationship" },
    },
    events: {
      type: "array",
      items: { $ref: "#/$defs/event" },
    },
    errors: {
      type: "array",
      items: { $ref: "#/$defs/error" },
    },
    actors: {
      type: "array",
      items: { $ref: "#/$defs/actor" },
    },
    states: { type: "object" },
    sla: { type: "object" },
    ui_hints: { type: "object" },
    extensions: { type: "object" },
    agi: {
      type: "object",
      additionalProperties: false,
      properties: {
        goals: {
          type: "array",
          minItems: 1,
          items: { $ref: "#/$defs/agiGoal" },
        },
        autonomy: { $ref: "#/$defs/agiAutonomy" },
        verification: { $ref: "#/$defs/agiVerification" },
        capabilities: {
          type: "array",
          items: { $ref: "#/$defs/agiCapability" },
        },
        boundaries: {
          type: "array",
          items: { type: "string" },
        },
        tradeoffs: {
          type: "array",
          items: { $ref: "#/$defs/agiTradeoff" },
        },
        evolution: { $ref: "#/$defs/agiEvolution" },
        coordination: { $ref: "#/$defs/agiCoordination" },
        safety: { $ref: "#/$defs/agiSafety" },
        explainability: { $ref: "#/$defs/agiExplainability" },
        learning: { $ref: "#/$defs/agiLearning" },
      },
    },
  },
  additionalProperties: false,
  $defs: {
    actor: {
      type: "object",
      required: ["id", "name", "type"],
      properties: {
        id: {
          type: "string",
          pattern: "^[a-z][a-z0-9_]*$",
        },
        name: { type: "string" },
        type: {
          type: "string",
          enum: ["human", "system", "external"],
        },
        description: { type: "string" },
        role: { type: "string" },
      },
      additionalProperties: false,
    },
    field: {
      type: "object",
      required: ["name", "type", "required"],
      properties: {
        name: {
          type: "string",
          pattern: "^[a-z][a-z0-9_]*$",
        },
        type: {
          type: "string",
          enum: [
            "text",
            "email",
            "password",
            "number",
            "boolean",
            "date",
            "datetime",
            "phone",
            "url",
            "file",
            "select",
            "multiselect",
            "hidden",
            "token",
            "rich_text",
            "json",
          ],
        },
        required: { type: "boolean" },
        label: { type: "string" },
        placeholder: { type: "string" },
        default: {},
        sensitive: { type: "boolean" },
        immutable: { type: "boolean" },
        form: { type: "string" },
        options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              value: { type: "string" },
              label: { type: "string" },
            },
          },
        },
        validation: {
          type: "array",
          items: { $ref: "#/$defs/validationRule" },
        },
      },
      additionalProperties: false,
    },
    validationRule: {
      type: "object",
      required: ["type", "message"],
      properties: {
        type: {
          type: "string",
          enum: [
            "required",
            "minLength",
            "maxLength",
            "min",
            "max",
            "pattern",
            "email",
            "phone",
            "url",
            "oneOf",
            "unique",
            "match",
            "custom",
          ],
        },
        message: { type: "string" },
        value: {},
        field: { type: "string" },
      },
      additionalProperties: false,
    },
    relationship: {
      type: "object",
      required: ["feature", "type"],
      properties: {
        feature: { type: "string" },
        type: {
          type: "string",
          enum: ["required", "recommended", "optional", "extends"],
        },
        reason: { type: "string" },
        ui_link: { type: "string" },
        ui_link_position: { type: "string" },
        insert_after: { type: "string" },
      },
      additionalProperties: false,
    },
    event: {
      type: "object",
      required: ["name", "payload"],
      properties: {
        name: {
          type: "string",
          pattern: "^[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+$",
        },
        description: { type: "string" },
        payload: {
          type: "array",
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
    error: {
      type: "object",
      required: ["code", "status", "message"],
      properties: {
        code: {
          type: "string",
          pattern: "^[A-Z][A-Z0-9_]*$",
        },
        status: {
          type: "integer",
          enum: [400, 401, 403, 404, 409, 410, 413, 422, 423, 429, 500, 503],
        },
        message: { type: "string" },
        retry: { type: "boolean" },
        redirect: { type: "string" },
      },
      additionalProperties: false,
    },
    agiGoal: {
      type: "object",
      required: ["id", "description"],
      properties: {
        id: { type: "string", pattern: "^[a-z][a-z0-9_]*$" },
        description: { type: "string" },
        success_metrics: {
          type: "array",
          items: {
            type: "object",
            required: ["metric", "target"],
            properties: {
              metric: { type: "string" },
              target: { type: "string" },
              measurement: { type: "string" },
            },
            additionalProperties: false,
          },
        },
        constraints: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "description"],
            properties: {
              type: {
                type: "string",
                enum: ["regulatory", "performance", "cost", "security", "availability"],
              },
              description: { type: "string" },
              negotiable: { type: "boolean" },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    agiAutonomy: {
      type: "object",
      required: ["level"],
      properties: {
        level: {
          type: "string",
          enum: ["human_in_loop", "supervised", "semi_autonomous", "fully_autonomous"],
        },
        human_checkpoints: {
          type: "array",
          items: { type: "string" },
        },
        escalation_triggers: {
          type: "array",
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
    agiVerification: {
      type: "object",
      properties: {
        invariants: {
          type: "array",
          items: { type: "string" },
        },
        acceptance_tests: {
          type: "array",
          items: {
            type: "object",
            required: ["scenario", "expect"],
            properties: {
              scenario: { type: "string" },
              given: { type: "string" },
              when: { type: "string" },
              expect: { type: "string" },
            },
            additionalProperties: false,
          },
        },
        monitoring: {
          type: "array",
          items: {
            type: "object",
            required: ["metric", "threshold", "action"],
            properties: {
              metric: { type: "string" },
              threshold: { type: "string" },
              action: { type: "string" },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    agiCapability: {
      type: "object",
      required: ["id", "description"],
      properties: {
        id: { type: "string", pattern: "^[a-z][a-z0-9_]*$" },
        description: { type: "string" },
        requires: {
          type: "array",
          items: { type: "string" },
        },
      },
      additionalProperties: false,
    },
    agiTradeoff: {
      type: "object",
      required: ["prefer", "over"],
      properties: {
        prefer: { type: "string" },
        over: { type: "string" },
        reason: { type: "string" },
      },
      additionalProperties: false,
    },
    agiEvolution: {
      type: "object",
      properties: {
        triggers: {
          type: "array",
          items: {
            type: "object",
            required: ["condition", "action"],
            properties: {
              condition: { type: "string" },
              action: { type: "string" },
            },
            additionalProperties: false,
          },
        },
        deprecation: {
          type: "array",
          items: {
            type: "object",
            required: ["field", "remove_after", "migration"],
            properties: {
              field: { type: "string" },
              remove_after: { type: "string" },
              migration: { type: "string" },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    agiCoordination: {
      type: "object",
      required: ["protocol"],
      properties: {
        protocol: {
          type: "string",
          enum: ["request_response", "pub_sub", "negotiation", "orchestrated"],
        },
        exposes: {
          type: "array",
          items: {
            type: "object",
            required: ["capability", "contract"],
            properties: {
              capability: { type: "string" },
              contract: { type: "string" },
            },
            additionalProperties: false,
          },
        },
        consumes: {
          type: "array",
          items: {
            type: "object",
            required: ["capability", "from", "fallback"],
            properties: {
              capability: { type: "string" },
              from: { type: "string" },
              fallback: {
                type: "string",
                enum: ["degrade", "queue", "fail"],
              },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    agiSafety: {
      type: "object",
      properties: {
        action_permissions: {
          type: "array",
          items: {
            type: "object",
            required: ["action", "permission"],
            properties: {
              action: { type: "string" },
              permission: {
                type: "string",
                enum: ["autonomous", "supervised", "human_required"],
              },
              cooldown: { type: "string" },
              max_auto_decisions: { type: "number", minimum: 1 },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    agiExplainability: {
      type: "object",
      properties: {
        log_decisions: { type: "boolean" },
        reasoning_depth: {
          type: "string",
          enum: ["full", "summary", "none"],
        },
        audit_events: {
          type: "array",
          items: {
            type: "object",
            required: ["decision", "must_log"],
            properties: {
              decision: { type: "string" },
              must_log: {
                type: "array",
                items: { type: "string" },
              },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    agiLearning: {
      type: "object",
      properties: {
        signals: {
          type: "array",
          items: {
            type: "object",
            required: ["metric", "window", "baseline"],
            properties: {
              metric: { type: "string" },
              window: { type: "string" },
              baseline: { type: "string" },
            },
            additionalProperties: false,
          },
        },
        adaptations: {
          type: "array",
          items: {
            type: "object",
            required: ["when", "experiment"],
            properties: {
              when: { type: "string" },
              experiment: { type: "string" },
              rollback_if: { type: "string" },
              requires_approval: { type: "boolean" },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
  },
};

// ─── Validator ────────────────────────────────────────────

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);
const validate = ajv.compile(blueprintJsonSchema);

function validateFile(filePath) {
  const absPath = resolve(filePath);
  const relPath = relative(process.cwd(), absPath);

  let content;
  try {
    content = readFileSync(absPath, "utf-8");
  } catch (err) {
    return { file: relPath, valid: false, errors: [`File not found: ${absPath}`] };
  }

  let data;
  try {
    data = YAML.parse(content);
  } catch (err) {
    return { file: relPath, valid: false, errors: [`YAML parse error: ${err.message}`] };
  }

  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors.map((err) => {
      const path = err.instancePath || "(root)";
      return `  ${path}: ${err.message}${err.params ? ` (${JSON.stringify(err.params)})` : ""}`;
    });
    return { file: relPath, valid: false, errors };
  }

  // ─── Custom validation checks ───────────────────────────

  const customErrors = [];
  const customWarnings = [];

  // Check: must have at least one of flows or outcomes
  const hasFlows = data.flows && Object.keys(data.flows).length > 0;
  const hasOutcomes = data.outcomes && Object.keys(data.outcomes).length > 0;
  if (!hasFlows && !hasOutcomes) {
    customErrors.push('  (root): must have at least one of "flows" or "outcomes"');
  }

  // Check: fields is optional but warn if missing (system-driven features may skip it)
  if (!data.fields || data.fields.length === 0) {
    customWarnings.push(
      `${data.feature} has no fields — this is OK for system-driven features but unusual otherwise`
    );
  }

  // ─── Operator contracts ─────────────────────────────────
  // Each operator has a name, expected value type(s), and semantics

  const operatorContracts = {
    eq:         { accepts: ["string", "number", "boolean"], semantics: "=== strict equality" },
    neq:        { accepts: ["string", "number", "boolean"], semantics: "!== strict inequality" },
    gt:         { accepts: ["number", "duration"],          semantics: "> greater than" },
    gte:        { accepts: ["number", "duration"],          semantics: ">= greater than or equal" },
    lt:         { accepts: ["number", "duration"],          semantics: "< less than" },
    lte:        { accepts: ["number", "duration"],          semantics: "<= less than or equal" },
    in:         { accepts: ["array"],                       semantics: "value is contained in list" },
    not_in:     { accepts: ["array"],                       semantics: "value is not in list" },
    matches:    { accepts: ["string"],                      semantics: "regex test (value is the pattern)" },
    exists:     { accepts: [],                              semantics: "field is not null/undefined" },
    not_exists: { accepts: [],                              semantics: "field is null/undefined" },
  };

  const validOperators = new Set(Object.keys(operatorContracts));
  const validSources = new Set([
    "input", "db", "request", "session", "system", "computed",
  ]);

  // ─── Value type system ─────────────────────────────────
  // Typed values replace ambiguous strings

  const VALUE_TYPES = new Set([
    "string", "number", "boolean", "duration", "field_ref", "expression", "array", "null",
  ]);

  function inferValueType(value) {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (Array.isArray(value)) return "array";
    if (typeof value === "string") {
      // Duration: 5s, 10m, 1h, 7d, 30d
      if (/^\d+(s|m|h|d)$/.test(value)) return "duration";
      // Field reference: starts with letter, contains dots or underscores
      if (/^[a-z][a-z0-9_.]*$/.test(value) && !value.includes(" ")) return "field_ref";
      // Expression: contains operators
      if (/[><=!]|and |or /.test(value)) return "expression";
      return "string";
    }
    return "unknown";
  }

  // ─── Action contracts ──────────────────────────────────
  // Each action has required and optional properties

  const actionContracts = {
    // Core actions
    set_field:        { required: ["target"], optional: ["value", "description", "when"] },
    emit_event:       { required: ["event"],  optional: ["payload", "description", "when"] },
    transition_state: { required: ["field"],  optional: ["from", "to", "description", "when"] },
    notify:           { required: ["channel"], optional: ["template", "to", "description", "when"] },
    invalidate:       { required: ["target"], optional: ["scope", "description", "when"] },
    create_record:    { required: ["type"], optional: ["fields", "description", "when"] },
    delete_record:    { required: ["type"], optional: ["id", "description", "when"] },
    call_service:     { required: ["target"], optional: ["params", "description", "when"] },

    // Data retrieval and query actions
    fetch_record:     { required: ["source"], optional: ["query", "fields", "description", "when"] },
    search_data:      { required: ["source"], optional: ["field", "operator", "value", "description", "when"] },

    // Data transformation and computation actions
    compute_field:    { required: ["field"], optional: ["formula", "description", "when"] },
    filter_data:      { required: ["by"], optional: ["value", "description", "when"] },
    filter_field:     { required: ["field"], optional: ["condition", "description", "when"] },
    sort_data:        { required: ["by"], optional: ["order", "description", "when"] },
    limit_results:    { required: ["count"], optional: ["description", "when"] },

    // Data export and generation actions
    export_data:      { required: ["format"], optional: ["fields", "style", "description", "when"] },
    generate_output:  { required: ["engine"], optional: ["format", "input", "description", "when"] },
    generate_token:   { required: ["type"], optional: ["ttl", "max_uses", "description", "when"] },

    // Data handling actions
    parse_data:       { required: ["format"], optional: ["source", "description", "when"] },
    validate_data:    { required: ["rules"], optional: ["description", "when"] },
    merge_data:       { required: ["template"], optional: ["with", "description", "when"] },
    store_file:       { required: ["destination"], optional: ["file", "location", "description", "when"] },
  };

  const validActions = new Set(Object.keys(actionContracts));

  // ─── Validate conditions (recursive, supports any/all) ─

  function validateCondition(condition, path) {
    if (typeof condition === "string") return; // plain-text, always valid
    if (typeof condition !== "object" || condition === null) return;

    // Logical group: any (OR) or all (AND)
    if (condition.any || condition.all) {
      const groupKey = condition.any ? "any" : "all";
      const items = condition[groupKey];
      if (!Array.isArray(items)) {
        customErrors.push(`  ${path}.${groupKey}: must be an array of conditions`);
        return;
      }
      for (let j = 0; j < items.length; j++) {
        validateCondition(items[j], `${path}.${groupKey}[${j}]`);
      }
      return;
    }

    // Structured condition
    if (!condition.field) {
      customErrors.push(`  ${path}: structured condition must have a "field" property`);
    }
    if (!condition.operator) {
      customErrors.push(`  ${path}: structured condition must have an "operator" property`);
    } else if (!validOperators.has(condition.operator)) {
      customErrors.push(
        `  ${path}: unknown operator "${condition.operator}" — valid: ${[...validOperators].join(", ")}`
      );
    } else {
      // Type-check: validate value type matches operator contract
      const contract = operatorContracts[condition.operator];
      if (contract.accepts.length > 0 && condition.value !== undefined) {
        const valueType = inferValueType(condition.value);
        if (valueType !== "unknown" && valueType !== "field_ref" && valueType !== "expression"
            && !contract.accepts.includes(valueType)) {
          customWarnings.push(
            `${path}: operator "${condition.operator}" expects ${contract.accepts.join("|")} but got ${valueType}`
          );
        }
      }
    }
    if (condition.source && !validSources.has(condition.source)) {
      customErrors.push(
        `  ${path}: unknown source "${condition.source}" — valid: ${[...validSources].join(", ")}`
      );
    }
    // Validate when: expression if present
    if (condition.when) {
      const exprResult = validateExpression(condition.when);
      if (!exprResult.valid) {
        customErrors.push(`  ${path}.when: invalid expression — ${exprResult.error}`);
      }
    }
  }

  // ─── Validate side effects ─────────────────────────────

  function validateSideEffect(effect, path) {
    if (typeof effect === "string") return;
    if (typeof effect !== "object" || effect === null) return;

    if (!effect.action) return; // no action key = plain-text-like object, skip

    if (!validActions.has(effect.action)) {
      customErrors.push(
        `  ${path}: unknown action "${effect.action}" — valid: ${[...validActions].join(", ")}`
      );
      return;
    }

    // Validate required properties for this action
    const contract = actionContracts[effect.action];
    for (const req of contract.required) {
      if (effect[req] === undefined) {
        customErrors.push(`  ${path}: action "${effect.action}" requires "${req}" property`);
      }
    }

    // Validate when: expression if present
    if (effect.when) {
      const exprResult = validateExpression(effect.when);
      if (!exprResult.valid) {
        customErrors.push(`  ${path}.when: invalid expression — ${exprResult.error}`);
      }
    }
  }

  // ─── Validate outcomes ─────────────────────────────────

  if (data.outcomes) {
    const validOutcomeKeys = new Set(["given", "then", "result", "priority", "error", "transaction"]);
    const errorCodes = new Set((data.errors || []).map((e) => e.code));

    for (const [name, outcome] of Object.entries(data.outcomes)) {
      if (typeof outcome !== "object" || outcome === null) {
        customErrors.push(`  outcomes.${name}: must be an object with given/then/result keys`);
        continue;
      }
      const outcomeKeys = Object.keys(outcome);
      const hasValidKey = outcomeKeys.some((k) => validOutcomeKeys.has(k));
      if (!hasValidKey) {
        customErrors.push(
          `  outcomes.${name}: must have at least one of "given", "then", or "result"`
        );
      }

      // Validate priority
      if (outcome.priority !== undefined && typeof outcome.priority !== "number") {
        customErrors.push(`  outcomes.${name}.priority: must be a number`);
      }

      // Validate error binding — must reference a defined error code
      if (outcome.error && !errorCodes.has(outcome.error)) {
        customErrors.push(
          `  outcomes.${name}.error: "${outcome.error}" is not defined in errors[]`
        );
      }

      // Validate transaction boundary
      if (outcome.transaction !== undefined && typeof outcome.transaction !== "boolean") {
        customErrors.push(`  outcomes.${name}.transaction: must be a boolean`);
      }

      // Validate conditions in given[]
      if (Array.isArray(outcome.given)) {
        for (let i = 0; i < outcome.given.length; i++) {
          validateCondition(outcome.given[i], `outcomes.${name}.given[${i}]`);
        }
      }

      // Validate structured side effects in then[]
      if (Array.isArray(outcome.then)) {
        for (let i = 0; i < outcome.then.length; i++) {
          validateSideEffect(outcome.then[i], `outcomes.${name}.then[${i}]`);
        }
      }
    }
  }

  // ─── Validate AGI section ──────────────────────────────

  if (data.agi) {
    // Validate goal IDs are unique
    if (data.agi.goals) {
      const goalIds = data.agi.goals.map((g) => g.id);
      const dupes = goalIds.filter((id, i) => goalIds.indexOf(id) !== i);
      if (dupes.length > 0) {
        customErrors.push(`  agi.goals: duplicate goal IDs: ${dupes.join(", ")}`);
      }
    }

    // Validate capability IDs are unique
    if (data.agi.capabilities) {
      const capIds = data.agi.capabilities.map((c) => c.id);
      const dupes = capIds.filter((id, i) => capIds.indexOf(id) !== i);
      if (dupes.length > 0) {
        customErrors.push(`  agi.capabilities: duplicate capability IDs: ${dupes.join(", ")}`);
      }

      // Validate capability requires references
      const capIdSet = new Set(capIds);
      for (const cap of data.agi.capabilities) {
        if (cap.requires) {
          for (const req of cap.requires) {
            if (!capIdSet.has(req)) {
              customWarnings.push(
                `agi.capabilities: "${cap.id}" requires "${req}" which is not defined in this blueprint's capabilities`
              );
            }
          }
        }
      }
    }

    // Validate autonomy level vs actors consistency
    if (data.agi.autonomy?.level === "human_in_loop") {
      const hasHumanActor = (data.actors || []).some((a) => a.type === "human");
      if (!hasHumanActor) {
        customWarnings.push(
          'agi.autonomy.level is "human_in_loop" but no human actors are defined'
        );
      }
    }

    // Validate escalation triggers as expressions (warnings only)
    if (data.agi.autonomy?.escalation_triggers) {
      for (let i = 0; i < data.agi.autonomy.escalation_triggers.length; i++) {
        const trigger = data.agi.autonomy.escalation_triggers[i];
        const exprResult = validateExpression(trigger);
        if (!exprResult.valid) {
          customWarnings.push(
            `agi.autonomy.escalation_triggers[${i}]: may not be a valid expression — ${exprResult.error}`
          );
        }
      }
    }

    // Validate evolution trigger conditions as expressions (warnings only)
    if (data.agi.evolution?.triggers) {
      for (let i = 0; i < data.agi.evolution.triggers.length; i++) {
        const trigger = data.agi.evolution.triggers[i];
        const exprResult = validateExpression(trigger.condition);
        if (!exprResult.valid) {
          customWarnings.push(
            `agi.evolution.triggers[${i}].condition: may not be a valid expression — ${exprResult.error}`
          );
        }
      }
    }

    // Validate deprecation dates are valid
    if (data.agi.evolution?.deprecation) {
      for (let i = 0; i < data.agi.evolution.deprecation.length; i++) {
        const dep = data.agi.evolution.deprecation[i];
        if (isNaN(Date.parse(dep.remove_after))) {
          customErrors.push(
            `  agi.evolution.deprecation[${i}].remove_after: "${dep.remove_after}" is not a valid date`
          );
        }
      }
    }

    // Validate deprecation field names exist in fields[]
    if (data.agi.evolution?.deprecation && data.fields) {
      const fieldNames = new Set(data.fields.map((f) => f.name));
      for (const dep of data.agi.evolution.deprecation) {
        if (!fieldNames.has(dep.field)) {
          customWarnings.push(
            `agi.evolution.deprecation: "${dep.field}" is not in fields[] — may refer to a computed or external field`
          );
        }
      }
    }

    // Validate safety action_permissions — unique action names
    if (data.agi.safety?.action_permissions) {
      const actions = data.agi.safety.action_permissions.map((a) => a.action);
      const dupes = actions.filter((a, i) => actions.indexOf(a) !== i);
      if (dupes.length > 0) {
        customErrors.push(
          `  agi.safety.action_permissions: duplicate action names: ${dupes.join(", ")}`
        );
      }
      // Validate cooldown format (duration like 5s, 10m, 1h, 7d)
      for (let i = 0; i < data.agi.safety.action_permissions.length; i++) {
        const perm = data.agi.safety.action_permissions[i];
        if (perm.cooldown && !/^\d+[smhd]$/.test(perm.cooldown)) {
          customWarnings.push(
            `agi.safety.action_permissions[${i}].cooldown: "${perm.cooldown}" may not be a valid duration (expected: 5s, 10m, 1h, 7d)`
          );
        }
      }
    }

    // Validate explainability audit_events — unique decision names
    if (data.agi.explainability?.audit_events) {
      const decisions = data.agi.explainability.audit_events.map((e) => e.decision);
      const dupes = decisions.filter((d, i) => decisions.indexOf(d) !== i);
      if (dupes.length > 0) {
        customErrors.push(
          `  agi.explainability.audit_events: duplicate decision names: ${dupes.join(", ")}`
        );
      }
    }

    // Validate learning adaptation expressions
    if (data.agi.learning?.adaptations) {
      for (let i = 0; i < data.agi.learning.adaptations.length; i++) {
        const adapt = data.agi.learning.adaptations[i];
        const whenResult = validateExpression(adapt.when);
        if (!whenResult.valid) {
          customWarnings.push(
            `agi.learning.adaptations[${i}].when: may not be a valid expression — ${whenResult.error}`
          );
        }
        if (adapt.rollback_if) {
          const rollbackResult = validateExpression(adapt.rollback_if);
          if (!rollbackResult.valid) {
            customWarnings.push(
              `agi.learning.adaptations[${i}].rollback_if: may not be a valid expression — ${rollbackResult.error}`
            );
          }
        }
      }
    }
  }

  // ─── POPIA / Secret Detection ──────────────────────────────
  // Scan all string values in the blueprint for leaked secrets.
  // This is a hard block — blueprints with secrets NEVER pass validation.

  const SECRET_PATTERNS = [
    { pattern: /sk-[a-zA-Z0-9]{20,}/, label: "OpenAI/Stripe API key" },
    { pattern: /pk_(test|live)_[a-zA-Z0-9]{20,}/, label: "Stripe publishable key" },
    { pattern: /AKIA[A-Z0-9]{16}/, label: "AWS access key" },
    { pattern: /ghp_[a-zA-Z0-9]{36}/, label: "GitHub personal access token" },
    { pattern: /gho_[a-zA-Z0-9]{36}/, label: "GitHub OAuth token" },
    { pattern: /glpat-[a-zA-Z0-9\-_]{20,}/, label: "GitLab personal access token" },
    { pattern: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, label: "JWT token" },
    { pattern: /(mongodb|postgres|postgresql|mysql|redis|amqp):\/\/[^\s]+:[^\s]+@/, label: "Connection string with credentials" },
    { pattern: /BEGIN\s+(RSA|EC|OPENSSH|DSA|PGP)\s+PRIVATE\s+KEY/, label: "Private key" },
    { pattern: /xox[bpsar]-[a-zA-Z0-9\-]{10,}/, label: "Slack token" },
    { pattern: /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/, label: "Slack webhook URL" },
    { pattern: /AIza[a-zA-Z0-9_-]{35}/, label: "Google API key" },
    { pattern: /[0-9]{13}(?<!\d{14})/, label: "Possible SA ID number (13 digits)" },
  ];

  function scanForSecrets(obj, path) {
    if (typeof obj === "string") {
      for (const { pattern, label } of SECRET_PATTERNS) {
        if (pattern.test(obj)) {
          // Don't include the actual secret in the error message!
          customErrors.push(
            `  SECURITY: ${path} contains what looks like a ${label} — remove it immediately`
          );
        }
      }
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        scanForSecrets(obj[i], `${path}[${i}]`);
      }
    } else if (obj && typeof obj === "object") {
      for (const [key, val] of Object.entries(obj)) {
        scanForSecrets(val, `${path}.${key}`);
      }
    }
  }

  scanForSecrets(data, "blueprint");

  if (customErrors.length > 0) {
    return { file: relPath, valid: false, errors: customErrors };
  }

  return {
    file: relPath,
    valid: true,
    feature: data.feature,
    version: data.version,
    warnings: customWarnings,
  };
}

// ─── Cross-blueprint relationship validation ──────────────

function validateRelationships(results) {
  const features = new Set(results.filter((r) => r.valid).map((r) => r.feature));
  const warnings = [];

  for (const result of results) {
    if (!result.valid) continue;

    const absPath = resolve(result.file);
    const content = readFileSync(absPath, "utf-8");
    const data = YAML.parse(content);

    if (data.related) {
      for (const rel of data.related) {
        if (rel.type === "required" && !features.has(rel.feature)) {
          warnings.push(
            `${result.feature} requires "${rel.feature}" but no blueprint found for it`
          );
        }
      }
    }

    // Validate coordination consumes references
    if (data.agi?.coordination?.consumes) {
      for (const c of data.agi.coordination.consumes) {
        if (!features.has(c.from)) {
          warnings.push(
            `${result.feature} agi.coordination.consumes: capability "${c.capability}" references blueprint "${c.from}" which was not found`
          );
        }
      }
    }
  }

  return warnings;
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let files;

  if (args.length > 0) {
    files = args;
  } else {
    files = await glob("blueprints/**/*.blueprint.yaml");
  }

  if (files.length === 0) {
    console.log("No blueprint files found.");
    process.exit(0);
  }

  console.log(`\nFDL Blueprint Validator v0.1.0`);
  console.log(`${"=".repeat(50)}\n`);

  const results = files.map(validateFile);
  let passed = 0;
  let failed = 0;

  for (const result of results) {
    if (result.valid) {
      console.log(`  PASS  ${result.file} (${result.feature} v${result.version})`);
      passed++;
    } else {
      console.log(`  FAIL  ${result.file}`);
      for (const err of result.errors) {
        console.log(`        ${err}`);
      }
      failed++;
    }
  }

  // Collect all warnings: per-file custom warnings + cross-reference warnings
  const allWarnings = [];

  for (const result of results) {
    if (result.valid && result.warnings) {
      allWarnings.push(...result.warnings);
    }
  }

  allWarnings.push(...validateRelationships(results));

  if (allWarnings.length > 0) {
    console.log(`\n  WARNINGS:`);
    for (const w of allWarnings) {
      console.log(`    WARN  ${w}`);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`  ${passed} passed, ${failed} failed, ${allWarnings.length} warnings`);
  console.log(`${"=".repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
