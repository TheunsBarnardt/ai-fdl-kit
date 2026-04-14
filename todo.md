# FDL AI-Proofing — Option (B) Execution Plan

**Scope:** Phase 1 (enforcement floor) + Phase 3 (AI PR review).
**Why (B):** Corpus rollout (Tier B / option C) has low marginal value until the gate that catches sloppy output exists. Phase 1 + 3 give the enforcement floor that makes every subsequent improvement load-bearing.
**North star:** *"Tell and execute"* — AI must know exactly how to do anything from the blueprint + capabilities alone; generated code must be verified against the pinned contract before it ships.

---

## Outcome definition

When this plan is done, every `/fdl-generate` (and `/fdl-build`) run will:

1. Emit code from a blueprint's pinned `api:` + resolved capabilities (already working).
2. **Gate 1 — Static fake/placeholder scan** blocks TODO/FIXME, mock/stub, hardcoded example data, fake endpoints that don't match `api.http.path`.
3. **Gate 2 — Compile/type-check** blocks syntactically or type-broken output.
4. **Gate 3 — AI PR review** runs cold-context second-pass review against a principal-engineer rubric; blocks on `severity: critical` findings.
5. All three gates are declared per-feature via capability imports (`uses: [code-quality-baseline, security-baseline, ai-pr-review]`) so the enforcement surface is deterministic and discoverable, not ad-hoc per skill.

Success criteria: taking the pre-existing fake-endpoint incident (2026-04-12) and replaying it must produce a hard-fail at Gate 1 or Gate 3, never a shipped artifact.

---

## Phase 1 — Enforcement floor (fake-scan + compile gate + capability stubs)

### 1.1 Capability stubs (contract-first, no implementations yet)

Three new capability blueprints under `blueprints/capabilities/`. Contract + anti_patterns are load-bearing immediately; `implementations:` are stubbed and fill in as gates come online.

- [ ] `blueprints/capabilities/quality/code-quality-baseline.capability.yaml`
  - **contract.guarantees:** no TODO/FIXME/XXX in shipped code; no `mock`/`stub`/`fake` identifiers outside test files; every exported symbol has a type annotation (for typed languages); no dead imports; no commented-out blocks.
  - **anti_patterns:** hardcoded localhost URLs; inline `sleep`/`setTimeout` as "temporary" code; `any`/`object` as a type shortcut; empty catch blocks; console.log in non-debug paths.
  - **provenance:** Google Engineering Practices, Clean Code, project CLAUDE.md "no speculative abstractions" rule.
  - **stability:** `experimental` (contract locked, scanner evolving).

- [ ] `blueprints/capabilities/security/security-baseline.capability.yaml`
  - **contract.guarantees:** no secrets in source (reuses the POPIA patterns already in `scripts/validate.js`); no string-concatenated SQL; no `eval`/`Function` constructor; no unvalidated redirect; every request handler validates input against a schema; rate-limit applied to auth-adjacent endpoints.
  - **anti_patterns:** returning stack traces to clients; `innerHTML =` with user input; JWT signed with `none` or hardcoded secret; disabled TLS verification; reliance on client-side validation alone.
  - **provenance:** OWASP ASVS v4, OWASP Top 10 2021, NIST 800-63B, POPIA §19.
  - **stability:** `experimental`.

- [ ] `blueprints/capabilities/quality/ai-pr-review.capability.yaml`
  - **contract.guarantees:** every generated diff is reviewed by a cold-context AI pass before emit; review rubric includes correctness vs blueprint, anti_patterns compliance, capability contract compliance, security baseline, perf sanity; findings have `severity: info|warn|critical`; `critical` blocks emit.
  - **anti_patterns:** reviewing with the same context that generated the code (caching bias); accepting a diff without citing the blueprint's `api.http.path`; silently downgrading severity to unblock.
  - **provenance:** principal-engineer review rubrics (Google L7/L8, Meta E7 rubrics — generic, not proprietary).
  - **stability:** `experimental`.

### 1.2 Fake/placeholder scanner

- [ ] Create `scripts/post-gen-scan.js`:
  - Input: a directory of generated code + the resolved blueprint JSON (from `docs/api/blueprints/...`).
  - Reads the blueprint's `api.http` (if present) and every `uses:` capability's `anti_patterns[]` via `blueprints/blueprint-index.json`.
  - Runs pattern scans (regex + AST-lite via `@babel/parser` or `tree-sitter` for JS/TS; `go/parser` fallback for Go; `ast` module for Python) for:
    - TODO / FIXME / XXX / HACK / TEMP
    - `mock` / `stub` / `fake` / `dummy` identifiers outside paths matching `/tests?/|__tests__|\.test\.|\.spec\.`
    - Hardcoded `localhost`, `127.0.0.1`, `example.com`, `test@test.com`, `sk-test-`
    - Endpoint literals (string matching `/\/[a-z]+\/[a-z]+/`) that aren't in the set of declared `api.http.path`s across all features the generator consumed
    - Secret patterns (reuse `validate.js`'s existing regex set)
  - Emits structured JSON report: `{file, line, rule, severity, message, evidence}`.
  - Exit codes: 0 = clean, 1 = findings at `warn`, 2 = findings at `critical`.
- [ ] Add `npm run scan:generated -- <output-dir> <blueprint-json>` script alias.
- [ ] Unit tests in `tests/post-gen-scan.test.js` covering: TODO hit, mock hit outside test path, hardcoded endpoint not in `api.http.path`, clean diff passes.

### 1.3 Compile / type-check gate

- [ ] Create `scripts/compile-gate.js`:
  - Dispatches per target declared in the capability's `implementations:` block (e.g. react-web → `tsc --noEmit`; node → same; flutter → `dart analyze`; python → `pyright` or `mypy`; go → `go build ./...`).
  - If no typed language target applies, runs the generator's declared build command and captures exit code.
  - Emits same JSON report shape as post-gen-scan.

### 1.4 `/fdl-generate` integration

- [ ] Edit `.claude/skills/fdl-generate/SKILL.md`:
  - Add a post-emit phase: "Phase 5 — Gates":
    1. Run `scripts/post-gen-scan.js` → block on severity critical
    2. Run `scripts/compile-gate.js` → block on non-zero exit
    3. Proceed to Phase 3 (AI PR review — added in the next section)
  - Add non-negotiable rule: "Generated code must pass every gate declared by the feature's resolved capabilities. A failing gate is a generation defect — re-plan, do not ship."

### 1.5 Phase 1 verification

- [ ] `node scripts/validate.js` — 406 + 3 new capabilities = 409/409 pass.
- [ ] `blueprint-lookup.js ai-pr-review` → returns capability hit with `kind: capability`.
- [ ] Replay the 2026-04-12 fake-endpoint incident as a fixture: generate against a fake `api.http.path`, confirm `post-gen-scan.js` reports `critical` for the mismatched endpoint literal.
- [ ] Run on an existing clean blueprint implementation → 0 findings.
- [ ] Tests: 110 existing + new scanner tests all green.

---

## Phase 3 — AI PR review skill

### 3.1 New skill `/fdl-pr-review`

- [ ] `.claude/skills/fdl-pr-review/SKILL.md`:
  - Frontmatter: `user-invocable: true`, `argument-hint: "<path-to-diff-or-dir>"`.
  - **Inputs:** path to generated code (or git diff range), resolved blueprint JSON, resolved capability JSONs.
  - **Process:**
    1. Cold-context: start from the blueprint + capabilities only, NOT from the generation conversation. This breaks caching/confirmation bias.
    2. Build a review rubric from:
       - Blueprint's `api.http` (exact path/method/request/response schemas)
       - Blueprint's `anti_patterns[]` (each becomes a review question)
       - Every `uses:` capability's `contract.guarantees` and `anti_patterns`
       - The baseline capabilities (`code-quality-baseline`, `security-baseline`) even if not explicitly declared
    3. Read the diff file-by-file; for each file produce findings with `{file, line_range, rule, severity, citation, remediation}`.
       - `citation` must point back to the blueprint rule or capability guarantee being violated — no floating opinions.
    4. Emit JSON report + a human-readable markdown summary.
  - **Severity bar:**
    - `critical` — violates blueprint `api:`, any anti_pattern, any security guarantee, any secret leak. Blocks emit.
    - `warn` — style drift, missing loading/error states, perf smell. Does not block but surfaces in commit body.
    - `info` — future-improvement suggestions.
  - **Non-negotiable rules:**
    1. Every finding MUST cite the blueprint or capability rule it violates.
    2. No severity downgrade without a blueprint-sourced justification.
    3. If the review agrees with the generator on every file with zero findings, re-read once more with a "devil's advocate" prompt — if still clean, sign off. Silence from a reviewer is suspicious until proven otherwise.
    4. Reviewer never sees the generator's chain-of-thought — only the blueprint, capabilities, and diff.

### 3.2 `/fdl-generate` wiring

- [ ] Make `/fdl-pr-review` a mandatory Phase 5.3 step in `.claude/skills/fdl-generate/SKILL.md`.
- [ ] If Phase 5.3 returns any `critical` finding, `/fdl-generate` must NOT declare success — it must re-plan based on findings or surface them to the user.

### 3.3 Phase 3 verification

- [ ] Hand-crafted broken diff (fake endpoint, missing rate limit, plaintext password log) → review must flag all three as `critical` with blueprint citations.
- [ ] Clean reference diff → review must pass with no false positives.
- [ ] Regression: every existing blueprint still generates + reviews cleanly on a representative language (react-web for UI features, node for API features).

---

## Cross-cutting housekeeping

- [ ] Update `docs/` site: add a short page `docs/gates.md` explaining the post-gen pipeline and how capabilities declare gate membership.
- [ ] Update `MEMORY.md` index with any new feedback/project entries that emerge during execution.
- [ ] `/fdl-auto-evolve --dry-run` must be clean before the first commit.

## Explicitly out of scope (deferred, not forgotten)

- Tier B corpus rollout (option C) — propagate `api/aliases/anti_patterns/uses` across the other 404 blueprints.
- Additional capabilities: `password-hashing`, `rate-limiting`, `session-token`, `ui-form-validation`, `ui-motion`, `csrf-protection`.
- Phase 2 (lint + dep-scan), Phase 4 (self-red-team), Phase 5 (performance/bundle/Lighthouse) from the original 5-phase sketch.
- Readme rendering of the new `uses:` / capability sections.
- Skill-file frontmatter cleanup (`user_invocable` → `user-invocable`).

## Commit strategy

- Commit 1: capability stubs + schema pass (`feat: add code-quality-baseline, security-baseline, ai-pr-review capability stubs`).
- Commit 2: `scripts/post-gen-scan.js` + tests (`feat: post-gen fake/placeholder scanner`).
- Commit 3: `scripts/compile-gate.js` + `/fdl-generate` wiring (`feat: compile-gate in post-gen pipeline`).
- Commit 4: `/fdl-pr-review` skill + wiring (`feat: cold-context AI PR review gate`).

Small, reviewable units. Each commit keeps the suite green.
