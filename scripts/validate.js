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

// ─── JSON Schema equivalent of our FDL meta-schema ────────
// This is the machine-readable validation layer

const blueprintJsonSchema = {
  type: "object",
  required: [
    "feature",
    "version",
    "description",
    "category",
    "fields",
    "rules",
    "flows",
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
    ui_hints: { type: "object" },
    extensions: { type: "object" },
  },
  additionalProperties: false,
  $defs: {
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
          enum: [400, 401, 403, 404, 409, 422, 423, 429, 500],
        },
        message: { type: "string" },
        retry: { type: "boolean" },
        redirect: { type: "string" },
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

  if (valid) {
    return { file: relPath, valid: true, feature: data.feature, version: data.version };
  }

  const errors = validate.errors.map((err) => {
    const path = err.instancePath || "(root)";
    return `  ${path}: ${err.message}${err.params ? ` (${JSON.stringify(err.params)})` : ""}`;
  });

  return { file: relPath, valid: false, errors };
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

  // Cross-reference check
  const warnings = validateRelationships(results);
  if (warnings.length > 0) {
    console.log(`\n  WARNINGS (missing related blueprints):`);
    for (const w of warnings) {
      console.log(`    WARN  ${w}`);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`  ${passed} passed, ${failed} failed, ${warnings.length} warnings`);
  console.log(`${"=".repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
