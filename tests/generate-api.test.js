import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scoreBlueprint } from "../scripts/fitness.js";
import { generatePrerequisites } from "../scripts/propagate-prerequisites.js";

// Test that quality signals are computable for blueprints
// (generate-api.js uses scoreBlueprint inline — we test the integration)

describe("quality signals integration", () => {
  it("scoreBlueprint returns fitness percent for a valid blueprint", () => {
    const result = scoreBlueprint({
      feature: "test",
      version: "1.0.0",
      description: "Authenticate a user with email and password",
      category: "auth",
      rules: { security: ["rule 1", "rule 2"], validation: ["rule 3", "rule 4"] },
      outcomes: {
        successful: {
          priority: 10,
          given: [{ field: "email", operator: "exists", source: "db" }],
          then: [{ action: "emit_event", event: "login.success" }],
          result: "Authenticated",
        },
        invalid: {
          priority: 5,
          error: "ERR",
          given: ["bad creds"],
          result: "Failed",
        },
      },
      errors: [{ code: "ERR", status: 401, message: "Invalid" }],
    });

    assert.ok(typeof result.percent === "number");
    assert.ok(result.percent >= 0 && result.percent <= 100);
    assert.ok(result.dims.structure);
    assert.ok(typeof result.dims.structure.score === "number");
    assert.ok(typeof result.dims.structure.max === "number");
  });

  it("structure_ratio is computable from scoreBlueprint dims", () => {
    const result = scoreBlueprint({
      feature: "test",
      version: "1.0.0",
      description: "A test blueprint",
      category: "auth",
      rules: { x: ["r1", "r2"] },
      outcomes: {
        success: {
          given: [{ field: "x", operator: "eq", value: 1, source: "input" }],
          then: [{ action: "set_field", target: "y" }],
          result: "ok",
        },
      },
    });

    const structureRatio = result.dims.structure.max > 0
      ? Math.round((result.dims.structure.score / result.dims.structure.max) * 100) / 100
      : 0;

    assert.ok(typeof structureRatio === "number");
    assert.ok(structureRatio >= 0 && structureRatio <= 1);
    assert.equal(structureRatio, 1); // all conditions are structured
  });
});

// Test payload_schema fitness bonus
describe("payload_schema fitness bonus", () => {
  it("events with payload_schema score higher than plain payload", () => {
    const plain = scoreBlueprint({
      feature: "test",
      version: "1.0.0",
      description: "Test blueprint for events",
      category: "auth",
      rules: { x: ["r1", "r2"] },
      outcomes: { success: { result: "ok" } },
      events: [
        { name: "auth.login.success", payload: ["user_id", "email"] },
        { name: "auth.login.failed", payload: ["email", "reason"] },
      ],
    });

    const typed = scoreBlueprint({
      feature: "test",
      version: "1.0.0",
      description: "Test blueprint for events",
      category: "auth",
      rules: { x: ["r1", "r2"] },
      outcomes: { success: { result: "ok" } },
      events: [
        {
          name: "auth.login.success",
          payload: ["user_id", "email"],
          payload_schema: [
            { field: "user_id", type: "string", source: "db.users" },
            { field: "email", type: "email", source: "input" },
          ],
        },
        { name: "auth.login.failed", payload: ["email", "reason"] },
      ],
    });

    assert.ok(typed.dims.events.score >= plain.dims.events.score,
      `Typed (${typed.dims.events.score}) should be >= plain (${plain.dims.events.score})`);
  });
});

// Test outcome prerequisites
describe("generatePrerequisites", () => {
  it("generates prereqs from db source conditions", () => {
    const prereqs = generatePrerequisites({
      given: [
        { field: "user", source: "db", operator: "exists" },
      ],
    });
    assert.ok(prereqs);
    assert.ok(prereqs.some((p) => /database/i.test(p)));
  });

  it("generates prereqs from session source", () => {
    const prereqs = generatePrerequisites({
      given: [
        { field: "token", source: "session", operator: "exists" },
      ],
    });
    assert.ok(prereqs);
    assert.ok(prereqs.some((p) => /session/i.test(p)));
  });

  it("returns null for input-only conditions", () => {
    const prereqs = generatePrerequisites({
      given: [
        { field: "email", source: "input", operator: "exists" },
      ],
    });
    assert.equal(prereqs, null);
  });

  it("returns null for plain-text conditions", () => {
    const prereqs = generatePrerequisites({
      given: ["user provides valid email"],
    });
    assert.equal(prereqs, null);
  });

  it("handles any/all groups", () => {
    const prereqs = generatePrerequisites({
      given: [
        {
          any: [
            { field: "user", source: "db", operator: "not_exists" },
            { field: "password", source: "input", operator: "neq" },
          ],
        },
      ],
    });
    assert.ok(prereqs);
    assert.ok(prereqs.some((p) => /database/i.test(p)));
  });

  it("returns null for missing given", () => {
    assert.equal(generatePrerequisites({}), null);
    assert.equal(generatePrerequisites(null), null);
  });
});
