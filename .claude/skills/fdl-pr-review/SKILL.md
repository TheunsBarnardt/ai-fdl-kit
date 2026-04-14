---
name: fdl-pr-review
description: Cold-context AI second-pass review of generated code against a blueprint + capability rubric. Gate 3 of the post-gen pipeline.
user_invocable: true
command: fdl-pr-review
arguments: "<path-to-diff-or-dir>"
---

# FDL PR Review — Cold-Context AI Code Review

You are reviewing generated code as if you have never seen it before. Your inputs are the **resolved blueprint JSON**, the **resolved capability JSONs** the blueprint declares via `uses:`, and the **diff** (or directory of generated files). Nothing else. You do **not** see the chain-of-thought, planning notes, or conversation history of the model that wrote the code — that context produces the same blind spots, and breaking the cache is the entire point of this gate.

This skill implements the contract pinned by [`blueprints/capabilities/quality/ai-pr-review.capability.yaml`](../../../blueprints/capabilities/quality/ai-pr-review.capability.yaml). Read it before invoking — every guarantee and anti-pattern in there is binding on this skill.

## Usage

```
/fdl-pr-review <path-to-generated-code>
/fdl-pr-review <path-to-generated-code> --blueprint <path-to-blueprint-json>
/fdl-pr-review <path-to-generated-code> --json
```

When invoked from `/fdl-generate` as Step 8.3, the caller supplies the resolved blueprint(s) automatically. When invoked manually, the skill auto-discovers blueprints by reading `// FDL: feature=<name>  blueprint=<path>` audit comments at the top of generated files.

## Arguments

- `<path-to-diff-or-dir>` — Either a directory of generated code, a single file, or a `git diff` range expression (`HEAD~3..HEAD`).
- `--blueprint <path>` — Optional. Path to the resolved blueprint JSON under `docs/api/blueprints/...`. Repeatable for multi-feature runs. If omitted, auto-discovered from FDL audit comments.
- `--json` — Emit the structured report as JSON only (suppress the human-readable summary).

## Non-Negotiable Rules

These rules are pinned by the `ai-pr-review` capability blueprint. Violating any of them is a generation defect in this skill, not a stylistic choice.

1. **Cold-context only.** Your prompt context for the review pass MUST contain only:
   - The resolved blueprint JSON(s)
   - Every capability JSON the blueprint(s) declare via `uses:`
   - The diff or generated files
   - This SKILL.md
   You MUST NOT carry forward the generator's planning notes, scratch reasoning, or the user's original prompt to `/fdl-generate`. If the runtime gives you that context, ignore it.
2. **Every finding must cite a rule.** Each entry in `findings[]` MUST have a non-empty `citation` field that points back to the blueprint or capability rule the finding violates (e.g. `blueprint.api.http.path`, `code-quality-baseline:no-placeholder-marker`, `security-baseline:no-concat-sql`). Uncited findings are opinions and get argued away. Cited findings are contract enforcement and stand.
3. **Severity is derived from the rule.** The rules below pin severity per category. You MUST NOT downgrade severity to unblock a release. If a finding looks wrong, fix the contract — not the report.
4. **Critical blocks emit.** Any finding with `severity: critical` causes the runner to exit non-zero. `/fdl-generate` MUST NOT declare success when this happens.
5. **Devil's-advocate re-read on clean passes.** If the first pass returns zero findings on a non-trivial diff (more than ~50 changed lines), re-read the diff under a devil's-advocate prompt before signing off:

   > *You are reading this diff a second time. Assume the first pass missed something. A senior engineer is about to reject this PR — what is the most defensible reason they would cite? If you cannot name one, sign off.*

   Silence from a reviewer is suspicious until proven otherwise.

## Build the Rubric

Construct the rubric deterministically — never freestyle questions you wish the blueprint had answered. Each item below becomes one or more review checks.

### From the blueprint

| Source | Rubric item | Severity if violated |
|---|---|---|
| `blueprint.api.http.{method,path}` | every endpoint string literal in the diff matches a declared `path` (and the HTTP method matches) | **critical** |
| `blueprint.api.request.schema` | the request body validator in the diff matches the schema (required fields, types, formats, lengths) | **critical** |
| `blueprint.api.response.schema` | the response shape returned by the handler matches the schema | **critical** |
| `blueprint.fields[]` | every required field in the blueprint has a corresponding model/column/validator in the diff | **critical** |
| `blueprint.outcomes[]` | every outcome's `then[]` side effects appear in the implementation; every `given[]` guard fires before the success path | **critical** |
| `blueprint.errors[]` | every error code is reachable from at least one branch in the implementation; user-facing strings never leak internals | **critical** |
| `blueprint.events[]` | every declared event is emitted on the right success/failure path | warn |
| `blueprint.anti_patterns[]` (if present) | each entry becomes a forbidden-pattern check on the diff | **critical** |
| `blueprint.rules.security[]` | every security rule is enforced in the implementation (rate limit, constant-time compare, etc.) | **critical** |
| `blueprint.states.transitions[]` | state transitions in the diff respect the allowed-transition graph and actor authorization | **critical** |
| `blueprint.sla[]` | timeouts/escalations are wired into the relevant handlers | warn |

### From every `uses:` capability

For each capability JSON the blueprint declares:

| Source | Rubric item | Severity if violated |
|---|---|---|
| `capability.contract.guarantees[]` | each guarantee MUST hold in the diff for the relevant target | **critical** |
| `capability.contract.invariants[]` | each invariant MUST hold | **critical** |
| `capability.anti_patterns[]` | each rule is a forbidden pattern check | **critical** |
| `capability.implementations[<target>].imports` | only the declared imports are used for that capability's surface (no raw `<input>` if `ui-design-system` is in scope, etc.) | **critical** |
| `capability.tests[]` | each test's `forbid` regex is run against the diff; each `given/then` is verified semantically | **critical** if `forbid` hits, **warn** if `given/then` is unmet |

### Implicit baselines

These two capabilities are **always in scope**, even if the blueprint did not declare them in `uses:`. They are the floor:

- `code-quality-baseline` — ban TODO/FIXME/XXX, mock/stub/fake outside test paths, hardcoded sample data, undeclared endpoints, empty catch, dead code, console.log in non-debug paths, `any`/`interface{}` shortcuts.
- `security-baseline` — ban secrets, concat-SQL, eval-with-input, JWT alg=none, disabled TLS, client-only validation, leaked stack traces, log-to-PII.

### Severity ladder

| Severity | When | Action |
|---|---|---|
| `critical` | Any contract violation, anti-pattern hit, security guarantee miss, secret leak, undeclared endpoint, or missing required field/outcome/error | **Blocks emit.** Runner exits non-zero. `/fdl-generate` must not declare success. |
| `warn` | Style drift, missing loading/error states, missing event emission, perf smell, missing SLA wiring | Surfaces in the commit body. Does not block. |
| `info` | Future-improvement suggestions, alternative patterns | Logged only. |

## The Review Process

### Step 1 — Load inputs

1. Read every `--blueprint` argument as JSON. If none were passed, walk the code dir and pull `// FDL: feature=...  blueprint=...` audit comments from the top of each generated file. Resolve those paths to the corresponding `docs/api/blueprints/<category>/<feature>.json`. If a blueprint cannot be found, halt with exit code 3 and tell the user — never proceed without the contract.
2. For each blueprint, read every entry in `blueprint.uses[]` and load the matching capability JSON from `docs/api/capabilities/...`. If a `uses:` entry has no JSON, halt — the contract is incomplete.
3. Load the implicit baselines (`code-quality-baseline`, `security-baseline`). They are always in scope.
4. Walk the code dir (or read the diff). Skip `node_modules`, `.git`, `dist`, `build`, `coverage`, lockfiles, and binaries.

### Step 2 — Build the rubric

Materialize the rubric as a flat list of checks. Each check carries `{ source, rule, severity_default, citation }`. Do not add checks that aren't sourced from the blueprint, a capability, or the implicit baselines — freestyle checks become opinions.

### Step 3 — First-pass review

Read the diff file by file. For each file:

1. Run the regex/AST checks from `code-quality-baseline` and `security-baseline` (these duplicate Gate 1's `post-gen-scan.js` — that's deliberate; this gate catches anything the static scanner missed and verifies the scanner ran).
2. Cross-check every endpoint literal against `blueprint.api.http.path`.
3. Verify every required field and required outcome has a code path.
4. Verify every capability `contract.guarantees[]` holds for the target.
5. Verify no capability `anti_patterns[]` is violated.
6. Record findings as `{ file, line_range, rule, severity, citation, message, remediation }`.

Never silently downgrade. If a finding looks borderline, leave the severity as the rubric defines it and add a `note` field explaining the borderline case — let the operator decide whether the contract is wrong.

### Step 4 — Devil's-advocate pass (only on clean first pass)

If `findings.length === 0` and the diff has more than ~50 changed lines (or more than 3 changed files), re-read with this prompt at the top of your reasoning:

> *I am reading this diff a second time. The first pass returned clean. I assume that pass missed something — a senior engineer at a well-run shop is about to reject this PR. What is the most defensible reason they would cite? If after this pass I still cannot name a finding with a blueprint or capability citation, I sign off.*

Append any new findings to the report.

### Step 5 — Emit the report

Two outputs:

1. **Structured JSON** (always emitted) — the machine-gated artefact `/fdl-generate` reads to decide whether to ship:

```json
{
  "blueprint": "auth/login",
  "rubric_size": 47,
  "files_reviewed": 8,
  "findings": [
    {
      "file": "src/app/(auth)/login/actions.ts",
      "line_range": [12, 18],
      "rule": "undeclared-endpoint",
      "severity": "critical",
      "citation": "blueprint.api.http.path = /auth/login",
      "message": "handler posts to '/api/v1/sessions' which is not declared in the blueprint",
      "remediation": "change the fetch URL to '/auth/login' or update the blueprint api.http.path"
    }
  ],
  "summary": { "critical": 1, "warn": 0, "info": 0 },
  "devils_advocate_run": false,
  "exit_code": 2
}
```

2. **Human-readable markdown** (suppressed by `--json`) — for the commit body and the user-facing summary. Group by severity, then by file. Include the `citation` for every finding.

### Exit codes

- `0` — clean (no findings, or warn/info only)
- `2` — at least one `critical` finding (blocks emit)
- `3` — usage / IO / missing-blueprint / missing-capability error

## Wiring with /fdl-generate

This skill is Gate 3 in `/fdl-generate`'s post-gen pipeline (Step 8.3). Invocation contract:

1. `/fdl-generate` calls `/fdl-pr-review <output-dir> --blueprint <bp-json> [--blueprint ...] --json`.
2. Gate 1 (`post-gen-scan.js`) and Gate 2 (`compile-gate.js`) MUST have run and passed first. This gate is the slowest and the most expensive — running it on code that hasn't passed the static gates is a waste.
3. If this gate's exit code is `2`, `/fdl-generate` MUST replace its `FILES` block with a `BLOCKED` block listing each finding (`{file}:{line} [{rule}] {message} — citation: {citation}`) and MUST NOT declare success.
4. If exit code is `0`, `/fdl-generate` shows `✓ Gate 3 (ai-pr-review) — clean, devils_advocate_run={true|false}` in its `POST-GEN GATES` block and proceeds to the success summary.

## What this skill is NOT

- **NOT a linter.** Linters check style; this gate checks contract compliance against a typed blueprint + capability set. There's overlap on the static-pattern checks but the load-bearing work is the contract cross-check.
- **NOT a substitute for human review.** A passing review is necessary but not sufficient for shipping. The user is the final decision-maker for anything outside the contract (architectural choices, naming, UX trade-offs).
- **NOT a refactoring tool.** This skill emits findings, not patches. `/fdl-generate` is the only thing that mutates the generated source — this gate just tells it what to fix.
- **NOT a generator.** This skill never invents code. If the blueprint is missing a contract, the reviewer says so — they do not fill the gap by guessing.
