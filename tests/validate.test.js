import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { validateFile, validateRelationships } from "../scripts/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => resolve(__dirname, "fixtures", name);

// ─── validateFile ────────────────────────────────────────

describe("validateFile", () => {
  it("passes a valid minimal blueprint", () => {
    const result = validateFile(fixture("valid-minimal.blueprint.yaml"));
    assert.equal(result.valid, true, `Expected valid but got errors: ${JSON.stringify(result.errors)}`);
    assert.equal(result.feature, "test-minimal");
    assert.equal(result.version, "1.0.0");
  });

  it("passes a comprehensive blueprint with all sections", () => {
    const result = validateFile(fixture("valid-full.blueprint.yaml"));
    assert.equal(result.valid, true, `Expected valid but got errors: ${JSON.stringify(result.errors)}`);
    assert.equal(result.feature, "test-full");
  });

  it("fails when feature field is missing", () => {
    const result = validateFile(fixture("invalid-missing-feature.blueprint.yaml"));
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  it("fails when category is invalid", () => {
    const result = validateFile(fixture("invalid-bad-category.blueprint.yaml"));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("category") || e.includes("enum")));
  });

  it("fails when blueprint contains a secret pattern", () => {
    const result = validateFile(fixture("invalid-secret.blueprint.yaml"));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => /SECURITY/i.test(e)));
  });

  it("fails when neither outcomes nor flows are present", () => {
    const result = validateFile(fixture("invalid-no-outcomes.blueprint.yaml"));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => /outcomes|flows/i.test(e)));
  });

  it("handles nonexistent file gracefully", () => {
    const result = validateFile(fixture("nonexistent.blueprint.yaml"));
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => /not found/i.test(e)));
  });

  it("returns warnings array for valid blueprints", () => {
    const result = validateFile(fixture("valid-minimal.blueprint.yaml"));
    assert.equal(result.valid, true);
    assert.ok(Array.isArray(result.warnings));
  });
});

// ─── validateRelationships ───────────────────────────────

describe("validateRelationships", () => {
  it("warns when a required related feature does not exist", () => {
    const crossRefResult = validateFile(fixture("cross-ref-missing.blueprint.yaml"));
    // Build a results array simulating what main() would pass
    const results = [crossRefResult];
    const warnings = validateRelationships(results);
    assert.ok(warnings.some((w) => w.includes("nonexistent-feature-xyz")));
  });

  it("returns no warnings when all related features exist", () => {
    const result1 = validateFile(fixture("valid-minimal.blueprint.yaml"));
    const result2 = validateFile(fixture("valid-full.blueprint.yaml"));
    // valid-full references password-reset and multi-factor-authentication
    // which don't exist in our fixture set, but type is "recommended"/"optional" not "required"
    const warnings = validateRelationships([result1, result2]);
    // No required references to missing features
    const requiredWarnings = warnings.filter((w) => w.includes("requires"));
    assert.equal(requiredWarnings.length, 0);
  });
});
