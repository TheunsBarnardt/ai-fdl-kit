import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { buildRelationshipGraph } from "../scripts/generate-relationship-graph.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tmpDir = resolve(__dirname, ".tmp-graph-test");

function writeTmpBlueprint(category, name, content) {
  const dir = resolve(tmpDir, category);
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `${name}.blueprint.yaml`);
  writeFileSync(file, content);
  return file;
}

function cleanup() {
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}

describe("buildRelationshipGraph", () => {
  it("builds forward and reverse edges from related arrays", () => {
    cleanup();
    const loginFile = writeTmpBlueprint("auth", "login", `
feature: login
version: "1.0.0"
description: "User login"
category: auth
rules:
  security:
    - "Must be secure"
outcomes:
  success:
    result: "Done"
related:
  - feature: signup
    type: required
    reason: "Users must register first"
  - feature: password-reset
    type: recommended
    reason: "For locked out users"
`);

    const signupFile = writeTmpBlueprint("auth", "signup", `
feature: signup
version: "1.0.0"
description: "User registration"
category: auth
rules:
  validation:
    - "Validate inputs"
outcomes:
  success:
    result: "Done"
`);

    const graph = buildRelationshipGraph([loginFile, signupFile]);

    // Forward edges
    assert.ok(graph.edges.login);
    assert.ok(graph.edges.login.required.includes("signup"));
    assert.ok(graph.edges.login.recommended.includes("password-reset"));

    // Reverse edges
    assert.ok(graph.reverse.signup);
    assert.ok(graph.reverse.signup.required_by.includes("login"));
    assert.ok(graph.reverse["password-reset"]);
    assert.ok(graph.reverse["password-reset"].recommended_by.includes("login"));

    // Nodes
    assert.ok(graph.nodes.login);
    assert.equal(graph.nodes.login.category, "auth");
    assert.ok(graph.nodes.signup);

    // Categories
    assert.ok(graph.categories.auth.includes("login"));
    assert.ok(graph.categories.auth.includes("signup"));

    // Stats
    assert.equal(graph.stats.totalNodes, 2);
    assert.equal(graph.stats.totalEdges, 2);

    cleanup();
  });

  it("handles blueprints with no relationships", () => {
    cleanup();
    const file = writeTmpBlueprint("data", "plain", `
feature: plain
version: "1.0.0"
description: "No relationships"
category: data
rules:
  validation:
    - "Validate"
outcomes:
  success:
    result: "Done"
`);

    const graph = buildRelationshipGraph([file]);

    assert.equal(graph.stats.totalNodes, 1);
    assert.equal(graph.stats.totalEdges, 0);
    assert.ok(graph.nodes.plain);
    assert.ok(!graph.edges.plain);

    cleanup();
  });

  it("handles empty file list", () => {
    const graph = buildRelationshipGraph([]);
    assert.equal(graph.stats.totalNodes, 0);
    assert.equal(graph.stats.totalEdges, 0);
  });
});
