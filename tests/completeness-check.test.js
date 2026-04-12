import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  checkBlueprint,
  containsPlaceholder,
  SECRET_PATTERNS,
  PLACEHOLDER_TOKENS,
} from "../scripts/completeness-check.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => resolve(__dirname, "fixtures", name);

// ─── containsPlaceholder ─────────────────────────────────

describe("containsPlaceholder", () => {
  it("detects uppercase TODO", () => {
    assert.equal(containsPlaceholder("TODO: implement this"), true);
  });

  it("detects TBD", () => {
    assert.equal(containsPlaceholder("TBD"), true);
  });

  it("detects FIXME", () => {
    assert.equal(containsPlaceholder("FIXME: broken logic"), true);
  });

  it("detects Lorem ipsum", () => {
    assert.equal(containsPlaceholder("Lorem ipsum dolor sit amet"), true);
  });

  it("detects 'fill this in'", () => {
    assert.equal(containsPlaceholder("fill this in"), true);
  });

  it("detects 'to be defined'", () => {
    assert.equal(containsPlaceholder("to be defined"), true);
  });

  it("detects ellipsis-only line", () => {
    assert.equal(containsPlaceholder("  ...  "), true);
  });

  it("does not flag normal prose", () => {
    assert.equal(containsPlaceholder("The user must authenticate before accessing resources"), false);
  });

  it("does not flag non-string values", () => {
    assert.equal(containsPlaceholder(42), false);
    assert.equal(containsPlaceholder(null), false);
    assert.equal(containsPlaceholder(undefined), false);
  });

  it("does not flag lowercase 'todo' as part of a word", () => {
    // 'todo' as a status value should not trigger the detector
    // PLACEHOLDER_TOKENS use \bTODO\b (case-sensitive uppercase)
    assert.equal(containsPlaceholder("todo_status"), false);
  });
});

// ─── SECRET_PATTERNS ─────────────────────────────────────

describe("SECRET_PATTERNS", () => {
  it("detects sk- API key pattern", () => {
    const match = SECRET_PATTERNS.some((p) =>
      p.pattern.test("sk-aaaaaabbbbbbccccccddddddeeeeee")
    );
    assert.equal(match, true);
  });

  it("detects AWS access key pattern", () => {
    const match = SECRET_PATTERNS.some((p) =>
      p.pattern.test("AKIAIOSFODNN7EXAMPLE")
    );
    assert.equal(match, true);
  });

  it("detects JWT token pattern", () => {
    const match = SECRET_PATTERNS.some((p) =>
      p.pattern.test("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U")
    );
    assert.equal(match, true);
  });

  it("detects connection string with credentials", () => {
    const match = SECRET_PATTERNS.some((p) =>
      p.pattern.test("mongodb://admin:secretpass@db.example.com:27017/mydb")
    );
    assert.equal(match, true);
  });

  it("detects private key header", () => {
    const match = SECRET_PATTERNS.some((p) =>
      p.pattern.test("BEGIN RSA PRIVATE KEY")
    );
    assert.equal(match, true);
  });

  it("detects GitHub personal token", () => {
    const match = SECRET_PATTERNS.some((p) =>
      p.pattern.test("ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij")
    );
    assert.equal(match, true);
  });

  it("does not flag normal text", () => {
    const match = SECRET_PATTERNS.some((p) =>
      p.pattern.test("This is a normal description of a feature")
    );
    assert.equal(match, false);
  });
});

// ─── checkBlueprint ──────────────────────────────────────

describe("checkBlueprint", () => {
  it("returns zero issues for a clean blueprint", () => {
    const issues = checkBlueprint(fixture("valid-full.blueprint.yaml"));
    assert.equal(issues.errors.length, 0, `Unexpected errors: ${JSON.stringify(issues.errors)}`);
    // valid-full has complete outcomes so warnings should be minimal
  });

  it("returns zero issues for a valid minimal blueprint", () => {
    const issues = checkBlueprint(fixture("valid-minimal.blueprint.yaml"));
    assert.equal(issues.errors.length, 0, `Unexpected errors: ${JSON.stringify(issues.errors)}`);
  });

  it("detects placeholder in description", () => {
    const issues = checkBlueprint(fixture("placeholder-description.blueprint.yaml"));
    assert.ok(
      issues.errors.some((e) => e.path === "description" && /placeholder/i.test(e.message)),
      `Expected placeholder error in description, got: ${JSON.stringify(issues.errors)}`
    );
  });

  it("detects secret in blueprint content", () => {
    const issues = checkBlueprint(fixture("invalid-secret.blueprint.yaml"));
    assert.ok(
      issues.errors.some((e) => /SECURITY/i.test(e.message)),
      `Expected security error, got: ${JSON.stringify(issues.errors)}`
    );
  });

  it("detects missing outcomes and flows", () => {
    const issues = checkBlueprint(fixture("invalid-no-outcomes.blueprint.yaml"));
    assert.ok(
      issues.errors.some((e) => /outcome/.test(e.message) || /flow/.test(e.message)),
      `Expected outcomes/flows error, got: ${JSON.stringify(issues.errors)}`
    );
  });

  it("handles nonexistent file gracefully", () => {
    const issues = checkBlueprint(fixture("nonexistent.blueprint.yaml"));
    assert.ok(issues.errors.length > 0);
    assert.ok(issues.errors.some((e) => /parse|YAML|ENOENT/i.test(e.message)));
  });

  it("warns about missing success path outcomes", () => {
    // valid-minimal has an outcome named "successful" which matches, so no warning
    const issues = checkBlueprint(fixture("valid-minimal.blueprint.yaml"));
    const successWarning = issues.warnings.filter((w) => /success path/i.test(w.message));
    assert.equal(successWarning.length, 0, "Should not warn about success path for 'successful' outcome");
  });
});
