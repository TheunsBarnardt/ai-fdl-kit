---
title: Post-Gen Gates
layout: default
nav_order: 9
description: "The three-gate post-generation pipeline that blocks placeholder code, type errors, and contract violations from shipping out of /fdl-generate."
---

# Post-Gen Gates

When `/fdl-generate` (and `/fdl-build`) emit code, the output passes through a three-gate pipeline before it ever reaches the user. A failing gate is a generation defect — the run does not declare success, the `FILES` block is replaced with `BLOCKED`, and the findings are surfaced for re-planning.

The gates are declared per-feature via capability imports (`uses: [code-quality-baseline, security-baseline, ai-pr-review]`) so the enforcement surface is deterministic and discoverable, not ad-hoc per skill.

## Why this exists

On 2026-04-12, a generation run shipped code that called `/api/v1/sessions` — an endpoint that did not exist in the consuming blueprint's `api.http.path`. Nothing in the pipeline cross-checked the emitted endpoint literal against the contract, and no second-pass reviewer caught it because the generator's own context had rationalised the choice. The post-gen pipeline exists to make that class of defect impossible to ship.

## The three gates

| # | Gate | Script / skill | Capability that pins it | Blocks emit on |
|---|---|---|---|---|
| 1 | Static fake / placeholder scan | [`scripts/post-gen-scan.js`](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/scripts/post-gen-scan.js) | `code-quality-baseline` + `security-baseline` | any `severity: critical` finding |
| 2 | Compile / type-check | [`scripts/compile-gate.js`](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/scripts/compile-gate.js) | implicit (target ecosystem) | non-zero exit / any `severity: critical` finding |
| 3 | Cold-context AI PR review | `/fdl-pr-review` skill | `ai-pr-review` | any `severity: critical` finding |

### Gate 1 — Static scan

Reads the resolved blueprint JSON and every `uses:` capability's `anti_patterns[]`, then walks the generated code dir and flags:

- `TODO` / `FIXME` / `XXX` / `HACK` / `TEMP` markers (anywhere)
- `mock` / `stub` / `fake` / `dummy` / `sample` identifiers (outside test paths)
- Hardcoded sample data (`localhost`, `127.0.0.1`, `example.com`, `test@test.com`, `Lorem ipsum`)
- Endpoint string literals that aren't in the consuming blueprint's `api.http.path`
- Secret patterns (mirrors the `SECRET_PATTERNS` set in `scripts/validate.js`)

```bash
node scripts/post-gen-scan.js \
  --code <output-dir> \
  --blueprint docs/api/blueprints/<category>/<feature>.json \
  --json
```

Exit codes: `0` clean, `1` warn-only, `2` critical, `3` usage error.

### Gate 2 — Compile / type-check

Auto-detects the target ecosystem from `tsconfig.json` / `pubspec.yaml` / `go.mod` / `pyproject.toml` and runs the authoritative compile command:

| Target | Command |
|---|---|
| TypeScript | `npx tsc --noEmit` |
| Python | `pyright` if available, else `python -m py_compile` |
| Go | `go build ./...` |
| Dart / Flutter | `dart analyze` |
| JavaScript | `node --check` per file (syntax only) |

When the underlying tool isn't installed, the gate emits a `tool-unavailable` warn rather than a false pass — the operator decides whether to install or run the gate manually.

```bash
node scripts/compile-gate.js --code <output-dir> --json
```

Exit codes: `0` clean, `2` critical, `3` usage / no target / unsupported.

### Gate 3 — Cold-context AI PR review

The slowest and most expensive gate, run only after Gates 1 + 2 pass. Implemented by the `/fdl-pr-review` skill per the contract pinned by the [`ai-pr-review` capability blueprint](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/capabilities/quality/ai-pr-review.capability.yaml).

The reviewer's prompt context contains **only**:

- The resolved blueprint JSON(s)
- Every `uses:` capability JSON
- The implicit baselines (`code-quality-baseline`, `security-baseline`)
- The diff or generated files

It never sees the generator's planning notes, scratch reasoning, or the user's original `/fdl-generate` prompt. That cold context is the entire point — shared context produces shared blind spots.

The rubric is built deterministically from the blueprint's `api.http`, `fields`, `outcomes`, `errors`, `anti_patterns`, `rules.security`, and every capability's `contract.guarantees` + `anti_patterns` + `tests`. Every finding cites the rule it violates — no free-floating opinions, no silent severity downgrades.

If the first pass returns zero findings on a non-trivial diff (>50 changed lines or >3 changed files), the reviewer re-reads under a devil's-advocate prompt before signing off.

```
/fdl-pr-review <output-dir> \
  --blueprint docs/api/blueprints/<category>/<feature>.json \
  --json
```

Exit codes: `0` clean, `2` critical, `3` usage / missing contract.

## How capabilities declare gate membership

Every feature blueprint can declare which gates apply via its `uses:` array:

```yaml
feature: login
version: "1.2.0"
uses:
  - ui-design-system        # opts in to the UI design system contract
  - code-quality-baseline   # explicit hygiene floor (also implicit)
  - security-baseline       # explicit security floor (also implicit)
  - ai-pr-review            # explicit Gate 3 (also implicit on /fdl-generate)
```

The two baselines (`code-quality-baseline`, `security-baseline`) and the AI PR review are **always in scope** for `/fdl-generate` even if a feature does not list them — they are the floor. Listing them explicitly is a documentation choice, not a behavioural one.

When a capability declares concrete `anti_patterns[]`, those become per-feature checks at every gate that consumes them. Adding a new anti-pattern to a capability automatically raises the bar for every feature that uses it — the next generation run picks it up without any code change to the gates themselves.

## Iteration cap

Each gate has a 3-iteration patch cap. If a gate is still failing after three patch attempts, `/fdl-generate` stops, replaces the `FILES` block with `BLOCKED`, and surfaces the structured findings to the user — partial fixes never ship.

## Output to the user

The generator's summary always includes a `POST-GEN GATES` block:

```
POST-GEN GATES:
  ✓ Gate 1 (post-gen-scan)  — clean, 0 findings
  ✓ Gate 2 (compile-gate)   — tsc --noEmit, 0 errors
  ✓ Gate 3 (ai-pr-review)   — clean, 0 findings, devils_advocate_run=true
```

`✓` for clean, `⚠` for warn-only or skipped (tool-unavailable), `✗` for critical. Any `✗` triggers the `BLOCKED` notice.

## Related

- [`code-quality-baseline` capability](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/capabilities/quality/code-quality-baseline.capability.yaml) — Gate 1's hygiene contract
- [`security-baseline` capability](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/capabilities/security/security-baseline.capability.yaml) — Gate 1's security contract
- [`ai-pr-review` capability](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/capabilities/quality/ai-pr-review.capability.yaml) — Gate 3's contract
- [`/fdl-pr-review` skill](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/.claude/skills/fdl-pr-review/SKILL.md) — Gate 3's runtime
