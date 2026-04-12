import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  scoreBlueprint,
  scoreDescription,
  scoreRules,
  scoreOutcomes,
  scoreStructure,
  scoreErrorBinding,
  scoreFields,
  scoreRelationships,
  scoreEvents,
  scoreAgi,
  scoreSimplicity,
  WEIGHTS,
} from "../scripts/fitness.js";

// ─── WEIGHTS ─────────────────────────────────────────────

describe("WEIGHTS", () => {
  it("sum to 100", () => {
    const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    assert.equal(sum, 100);
  });
});

// ─── scoreDescription ────────────────────────────────────

describe("scoreDescription", () => {
  it("returns 0 for missing description", () => {
    const result = scoreDescription({});
    assert.equal(result.score, 0);
  });

  it("returns 0 for non-string description", () => {
    const result = scoreDescription({ description: 123 });
    assert.equal(result.score, 0);
  });

  it("gives partial score for short description", () => {
    const result = scoreDescription({ description: "Short desc" }); // 10 chars
    assert.ok(result.score < WEIGHTS.description);
  });

  it("gives high score for detailed description", () => {
    const result = scoreDescription({
      description: "Authenticate a user with email and password using constant-time comparison and account lockout policies",
    });
    assert.ok(result.score >= 8);
  });
});

// ─── scoreRules ──────────────────────────────────────────

describe("scoreRules", () => {
  it("returns 0 for missing rules", () => {
    const result = scoreRules({});
    assert.equal(result.score, 0);
  });

  it("returns 0 for empty rules object", () => {
    const result = scoreRules({ rules: {} });
    assert.equal(result.score, 0);
  });

  it("gives partial score for single thin category", () => {
    const result = scoreRules({ rules: { validation: ["one rule"] } });
    assert.ok(result.score > 0);
    assert.ok(result.score < WEIGHTS.rules);
  });

  it("gives high score for multiple non-trivial categories", () => {
    const result = scoreRules({
      rules: {
        security: ["rule 1", "rule 2", "rule 3"],
        validation: ["rule 1", "rule 2"],
        rate_limiting: ["rule 1", "rule 2"],
        permissions: ["rule 1", "rule 2"],
      },
    });
    assert.ok(result.score >= 8);
  });
});

// ─── scoreOutcomes ───────────────────────────────────────

describe("scoreOutcomes", () => {
  it("returns 0 for missing outcomes and no flows", () => {
    const result = scoreOutcomes({});
    assert.equal(result.score, 0);
  });

  it("gives partial credit for flows-only blueprints", () => {
    const result = scoreOutcomes({
      flows: { main: { steps: ["step 1", "step 2"] } },
    });
    assert.equal(result.score, 10);
  });

  it("gives high score for well-structured outcomes", () => {
    const result = scoreOutcomes({
      outcomes: {
        successful: {
          priority: 10,
          given: [{ field: "email", operator: "exists" }],
          then: [{ action: "emit_event", event: "login.success" }],
          result: "Authenticated",
        },
        invalid_credentials: {
          priority: 5,
          error: "INVALID",
          given: ["bad creds"],
          then: [{ action: "set_field", target: "attempts" }],
          result: "Failed",
        },
        rate_limited: {
          priority: 1,
          error: "RATE_LIMITED",
          given: ["too many requests"],
          then: ["block"],
          result: "Blocked",
        },
        account_locked: {
          priority: 2,
          error: "LOCKED",
          given: ["locked"],
          then: ["notify"],
          result: "Locked",
        },
        expired_token: {
          priority: 3,
          error: "EXPIRED",
          given: ["token expired"],
          then: ["reject"],
          result: "Expired",
        },
      },
    });
    assert.ok(result.score >= 20, `Expected >= 20 but got ${result.score}`);
  });
});

// ─── scoreStructure ──────────────────────────────────────

describe("scoreStructure", () => {
  it("returns 0 for no outcomes", () => {
    const result = scoreStructure({});
    assert.equal(result.score, 0);
  });

  it("gives high score when all conditions/actions are structured", () => {
    const result = scoreStructure({
      outcomes: {
        success: {
          given: [{ field: "x", operator: "eq", value: 1 }],
          then: [{ action: "set_field", target: "y" }],
        },
      },
    });
    assert.equal(result.score, WEIGHTS.structure);
  });

  it("gives low score when all conditions are plain text", () => {
    const result = scoreStructure({
      outcomes: {
        success: {
          given: ["plain text condition"],
          then: ["plain text action"],
        },
      },
    });
    assert.equal(result.score, 0);
  });
});

// ─── scoreErrorBinding ───────────────────────────────────

describe("scoreErrorBinding", () => {
  it("gives full score when no errors defined", () => {
    const result = scoreErrorBinding({});
    assert.equal(result.score, WEIGHTS.error_binding);
  });

  it("gives low score for orphaned error codes", () => {
    const result = scoreErrorBinding({
      errors: [{ code: "ERR_1", message: "Error 1" }, { code: "ERR_2", message: "Error 2" }],
      outcomes: {},
    });
    assert.ok(result.score < WEIGHTS.error_binding);
  });

  it("gives high score when all errors are bound to outcomes", () => {
    const result = scoreErrorBinding({
      errors: [{ code: "ERR_1", message: "Error 1" }, { code: "ERR_2", message: "Error 2" }],
      outcomes: {
        fail_1: { error: "ERR_1" },
        fail_2: { error: "ERR_2" },
      },
    });
    assert.ok(result.score >= 8);
  });
});

// ─── scoreFields ─────────────────────────────────────────

describe("scoreFields", () => {
  it("gives full score for system-driven features (no fields)", () => {
    const result = scoreFields({});
    assert.equal(result.score, WEIGHTS.fields);
  });

  it("gives low score for fields without validation", () => {
    const result = scoreFields({
      fields: [
        { name: "email", type: "email" },
        { name: "password", type: "password" },
      ],
    });
    assert.ok(result.score < WEIGHTS.fields);
  });

  it("gives high score for fields with type, label, and validation", () => {
    const result = scoreFields({
      fields: [
        { name: "email", type: "email", label: "Email", validation: [{ type: "required" }] },
        { name: "pass", type: "password", label: "Password", validation: [{ type: "minLength" }] },
      ],
    });
    assert.equal(result.score, WEIGHTS.fields);
  });
});

// ─── scoreRelationships ──────────────────────────────────

describe("scoreRelationships", () => {
  it("returns 0 for no relationships", () => {
    const result = scoreRelationships({});
    assert.equal(result.score, 0);
    assert.ok(result.notes.some((n) => n.includes("no relationships")));
  });

  it("gives high score for typed relationships with reasons", () => {
    const result = scoreRelationships({
      related: [
        { feature: "a", type: "required", reason: "Needed for auth" },
        { feature: "b", type: "optional", reason: "Nice to have" },
        { feature: "c", type: "recommended", reason: "Best practice" },
        { feature: "d", type: "extends", reason: "Builds upon" },
      ],
    });
    assert.ok(result.score >= 8);
  });
});

// ─── scoreEvents ─────────────────────────────────────────

describe("scoreEvents", () => {
  it("gives partial score for no events (optional)", () => {
    const result = scoreEvents({});
    assert.equal(result.score, 2);
  });

  it("gives full score for events with payloads", () => {
    const result = scoreEvents({
      events: [
        { name: "login.success", payload: ["user_id", "timestamp"] },
        { name: "login.failed", payload: ["email", "reason"] },
      ],
    });
    assert.equal(result.score, WEIGHTS.events);
  });
});

// ─── scoreAgi ────────────────────────────────────────────

describe("scoreAgi", () => {
  it("returns 0 for missing agi section", () => {
    const result = scoreAgi({});
    assert.equal(result.score, 0);
  });

  it("gives points for goals, autonomy, verification, capabilities", () => {
    const result = scoreAgi({
      agi: {
        goals: [{ id: "g1", description: "Goal 1" }],
        autonomy: { level: "supervised" },
        verification: { invariants: ["inv 1"] },
        capabilities: [{ id: "c1", description: "Cap 1" }],
      },
    });
    assert.equal(result.score, WEIGHTS.agi);
  });
});

// ─── scoreSimplicity ─────────────────────────────────────

describe("scoreSimplicity", () => {
  it("gives full score for a clean blueprint", () => {
    const result = scoreSimplicity({
      outcomes: {
        success: { then: [{ action: "emit_event", event: "done" }], result: "Done" },
      },
    });
    assert.equal(result.score, WEIGHTS.simplicity);
  });

  it("penalizes outcomes with no effect or result", () => {
    const result = scoreSimplicity({
      outcomes: {
        dead1: {},
        dead2: {},
      },
    });
    assert.ok(result.score < WEIGHTS.simplicity);
  });
});

// ─── scoreBlueprint (aggregate) ──────────────────────────

describe("scoreBlueprint", () => {
  it("returns score object with total, max, percent, dims", () => {
    const result = scoreBlueprint({
      feature: "test",
      version: "1.0.0",
      description: "A test blueprint for scoring",
      category: "auth",
      rules: { validation: ["rule 1", "rule 2"] },
      outcomes: {
        success: { result: "It works" },
      },
    });
    assert.ok(typeof result.total === "number");
    assert.ok(typeof result.max === "number");
    assert.ok(typeof result.percent === "number");
    assert.ok(result.percent >= 0 && result.percent <= 100);
    assert.ok(result.dims.description);
    assert.ok(result.dims.rules);
    assert.ok(result.dims.outcomes);
  });

  it("scores a well-structured blueprint higher than a minimal one", () => {
    const minimal = scoreBlueprint({
      feature: "test",
      version: "1.0.0",
      description: "Short",
      category: "auth",
      rules: { x: ["r"] },
      outcomes: { success: { result: "ok" } },
    });

    const full = scoreBlueprint({
      feature: "test",
      version: "1.0.0",
      description: "Authenticate a user with email and password using secure constant-time comparison",
      category: "auth",
      rules: {
        security: ["constant-time comparison", "never reveal account existence"],
        validation: ["email must be valid format", "password minimum 8 chars"],
        rate_limiting: ["lock after 5 failures", "progressive backoff"],
      },
      outcomes: {
        successful: {
          priority: 10,
          given: [{ field: "email", operator: "exists" }],
          then: [{ action: "emit_event", event: "login.success", payload: ["user_id"] }],
          result: "Authenticated",
        },
        invalid_credentials: {
          priority: 5,
          error: "ERR_INVALID",
          given: ["bad creds"],
          then: [{ action: "set_field", target: "attempts" }],
          result: "Failed",
        },
      },
      errors: [{ code: "ERR_INVALID", message: "Invalid credentials" }],
      events: [{ name: "login.success", payload: ["user_id"] }],
      related: [{ feature: "password-reset", type: "recommended", reason: "For locked out users" }],
      agi: {
        goals: [{ id: "auth", description: "Authenticate users" }],
        autonomy: { level: "supervised" },
        verification: { invariants: ["attempts never negative"] },
        capabilities: [{ id: "cred_check", description: "Check credentials" }],
      },
    });

    assert.ok(full.percent > minimal.percent, `Full (${full.percent}) should score higher than minimal (${minimal.percent})`);
  });
});
