import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { buildRegistry } from "../scripts/generate-agi-registry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tmpDir = resolve(__dirname, ".tmp-agi-test");

// Helper: write a temp blueprint file and return its path
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

describe("buildRegistry", () => {
  it("detects valid expose/consume relationship", () => {
    cleanup();
    const providerFile = writeTmpBlueprint("auth", "provider", `
feature: provider
version: "1.0.0"
description: "A provider blueprint that exposes capabilities"
category: auth
rules:
  security:
    - "Must be secure"
outcomes:
  success:
    result: "Done"
agi:
  coordination:
    protocol: request_response
    exposes:
      - capability: credential_validation
        contract: "Accepts email+password, returns boolean"
`);

    const consumerFile = writeTmpBlueprint("auth", "consumer", `
feature: consumer
version: "1.0.0"
description: "A consumer blueprint that consumes capabilities"
category: auth
rules:
  security:
    - "Must be secure"
outcomes:
  success:
    result: "Done"
agi:
  coordination:
    protocol: request_response
    consumes:
      - capability: credential_validation
        from: provider
        fallback: degrade
`);

    const registry = buildRegistry([providerFile, consumerFile]);

    assert.equal(registry.stats.totalCapabilities, 1);
    assert.equal(registry.stats.validConsumes, 1);
    assert.equal(registry.stats.orphanConsumes, 0);
    assert.equal(registry.stats.unexposedCapabilities, 0);
    assert.ok(registry.capabilities.credential_validation);
    assert.equal(registry.capabilities.credential_validation.exportedBy, "provider");
    assert.equal(registry.capabilities.credential_validation.consumers.length, 1);
    assert.equal(registry.capabilities.credential_validation.consumers[0].feature, "consumer");

    cleanup();
  });

  it("flags orphan consume when provider blueprint is missing", () => {
    cleanup();
    const consumerFile = writeTmpBlueprint("auth", "orphan-consumer", `
feature: orphan-consumer
version: "1.0.0"
description: "Consumes from a nonexistent provider"
category: auth
rules:
  security:
    - "Must be secure"
outcomes:
  success:
    result: "Done"
agi:
  coordination:
    protocol: request_response
    consumes:
      - capability: some_cap
        from: nonexistent-provider
        fallback: fail
`);

    const registry = buildRegistry([consumerFile]);

    assert.equal(registry.stats.orphanConsumes, 1);
    assert.ok(registry.orphanConsumes[0].from === "nonexistent-provider");

    cleanup();
  });

  it("flags unexposed capability when provider exists but does not expose it", () => {
    cleanup();
    const providerFile = writeTmpBlueprint("auth", "partial-provider", `
feature: partial-provider
version: "1.0.0"
description: "A provider that exposes only one capability"
category: auth
rules:
  security:
    - "Must be secure"
outcomes:
  success:
    result: "Done"
agi:
  coordination:
    protocol: request_response
    exposes:
      - capability: cap_a
        contract: "Only exposes cap_a"
`);

    const consumerFile = writeTmpBlueprint("auth", "greedy-consumer", `
feature: greedy-consumer
version: "1.0.0"
description: "Tries to consume a capability that the provider does not expose"
category: auth
rules:
  security:
    - "Must be secure"
outcomes:
  success:
    result: "Done"
agi:
  coordination:
    protocol: request_response
    consumes:
      - capability: cap_b
        from: partial-provider
        fallback: degrade
`);

    const registry = buildRegistry([providerFile, consumerFile]);

    assert.equal(registry.stats.unexposedCapabilities, 1);
    assert.ok(registry.unexposedCapabilities[0].capability === "cap_b");
    assert.ok(registry.unexposedCapabilities[0].from === "partial-provider");

    cleanup();
  });

  it("handles blueprints with no AGI section", () => {
    cleanup();
    const plainFile = writeTmpBlueprint("data", "plain", `
feature: plain
version: "1.0.0"
description: "A blueprint without AGI coordination"
category: data
rules:
  validation:
    - "Validate inputs"
outcomes:
  success:
    result: "Done"
`);

    const registry = buildRegistry([plainFile]);

    assert.equal(registry.stats.totalCapabilities, 0);
    assert.equal(registry.stats.totalConsumes, 0);

    cleanup();
  });
});
