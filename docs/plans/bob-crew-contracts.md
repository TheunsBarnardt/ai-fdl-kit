# Bob's Crew — Agent Contracts

> Architecture spec for the multi-agent implementation of `/fdl-build`.
> One orchestrator (Bob), seven specialist roles.
> Builds happen in **two stages** with user-approval checkpoints at each boundary:
> **Stage 1** — Plan → Prototype → Iterate (cheap, disposable, UI-focused).
> **Stage 2** — Full production build (expensive, rigorous, against an approved spec).
> Every target project uses a canonical folder layout so the output is predictable and auditable.
> The user only ever talks to Bob. The crew is invisible.

---

## Architecture at a glance

```
                        USER
                         │
                   ┌─────▼─────┐
                   │    Bob    │  ← orchestrator — the only agent the user talks to
                   │ /fdl-build│
                   └─────┬─────┘
                         │  (direct dispatch, no middle layer)
   ┌───────┬────────┬────┴────┬────────┬────────┬─────────┐
   ▼       ▼        ▼         ▼        ▼        ▼         ▼
 Scout  Surveyor  Sketcher  Builder  Inspector  Scribe  Reviewer
matcher  gap-     prototype feature-  gate-     doc-    cold-
         resolver builder   generator runner    writer  review
```

### Design principles

- **Flat, not hierarchical.** No manager/director middle layers. Bob dispatches directly to specialists. Hierarchy is added only when *work genuinely nests* (e.g., a Builder spawning its own test-writer for its own feature).
- **Specialists never talk to the user.** All elicitation bubbles up to Bob, who owns all user dialog.
- **Bob is an opinionated advisor.** Every user-facing choice comes with tradeoff analysis + a specific recommendation tied to the user's context. Neutral menus are forbidden at decision points. See "Bob's advisory voice" below.
- **Context isolation.** Each specialist gets a tightly-scoped input and returns a strict JSON output. Main-thread context stays bounded regardless of build size.
- **Parallelism within tiers only.** Builders run in parallel across same-tier siblings (topo-safe). Never across dependency tiers.
- **JSON in, JSON out.** No prose returns. Every output is programmatically validated before Bob accepts it.
- **Prototype before production.** Cheap, iterative prototype comes first; full build only starts once the plan + prototype + DESIGN.md are user-approved. Rework during prototype is ~1 HTML file; rework during production is ~50 files across 11 features.
- **Validation is deterministic.** Every subagent return passes through a script (the *Foreman's clipboard*) before Bob accepts it — not through another LLM. LLM-validating LLM output moves hallucination around; it doesn't reduce it.
- **Filesystem layout enforces scope.** Each role has a single write path. Even if a tool-allowlist is bypassed, the filesystem contract stops cross-role writes.

---

## Two-stage build flow

### Stage 1 — Plan → Prototype → Iterate

**Goal:** align the user and Bob on what's being built *before* writing production code.

1. User describes the app.
2. Bob parses intent, dispatches **Scout × N**, runs disambiguation + checklist, dispatches **Surveyor × N** for gaps, then writes `.fdl/plan.md` — a living artifact.
3. **USER CHECKPOINT 1 — Plan review.** Bob shows the plan *with his recommendation for every pre-checked item*. User can adjust features, stack, dependencies. Loop until approved.
4. Bob dispatches **Sketcher × 1** to produce `.fdl/prototype.html` — a single-file HTML prototype demonstrating the UI + flow.
5. **USER CHECKPOINT 2 — Prototype iteration loop.** User interacts with the prototype in their browser, describes changes. For each change:
   - Bob advises on the tradeoffs (see "advisory voice")
   - Bob dispatches **Sketcher × 1** to apply the edit
   - Bob updates `.fdl/plan.md` in lock-step; revision log is append-only
6. User approves prototype + updated plan + DESIGN.md.

**Stage 1 outputs:** frozen `plan.md` + frozen `prototype.html` + frozen `DESIGN.md` + clear target. Copied into `.fdl/history/{timestamp}/` for audit.

### Stage 2 — Full build

**Goal:** generate production code that matches the approved plan exactly.

1. Bob reads frozen `plan.md` as input. No new user dialog — the plan IS the spec.
2. Bob dispatches **Builder × N** + **Inspector × N** per the plan's dependency order (parallel within each tier).
3. Bob dispatches **Reviewer × N** for per-feature cold-context review.
4. Bob dispatches **Scribe × 1** for `docs/SYSTEM.md` + `docs/API.md`.
5. Bob runs auto-evolve, prints summary.

Stage 2 is **non-conversational**. If Stage 2 hits an ambiguity, it's a bug in Stage 1 and triggers a hard fail back to the prototype loop — the plan/prototype was incomplete.

### Why the split matters

- **Prototype is disposable, production isn't.** Iterating on one HTML file is cheap; iterating on 47 generated files across 11 features is not.
- **UI decisions belong BEFORE code.** The prototype forces those choices to happen when they're trivial to change.
- **The plan becomes authoritative.** Once approved, it's input to Stage 2 — no ambiguity during generation.
- **`DESIGN.md` gets validated against reality.** Design decisions are continuously checked against what the user actually reacts to.

---

## Target project folder structure

Bob enforces this layout on every bootstrap. Every FDL-built project looks the same — predictable, auditable, AI-friendly on first open.

### Single-target project

```
<target>/
├── CLAUDE.md                    ← AI awareness (Claude Code + FDL compact instructions)
├── README.md                    ← human-facing quick start (generated in Phase 8)
├── package.json                 ← project manifest
│
├── .fdl/                        ← Bob's working directory
│   ├── plan.md                  ← LIVING plan — source of truth through Stages 1 + 2
│   ├── prototype.html           ← Stage 1 prototype (single self-contained file)
│   ├── DESIGN.md                ← UI design system (from /fdl-extract-design)
│   ├── build_manifest.json      ← Stage 2 incremental progress (resume-safe)
│   ├── telemetry/               ← local-only run history (Phase E)
│   │   └── {timestamp}.json
│   └── history/                 ← frozen snapshots at each Stage 2 build
│       └── {timestamp}/
│           ├── plan.md
│           └── prototype.html
│
├── blueprints/                  ← local blueprint overrides (only if user customizes)
│   └── {category}/{feature}.blueprint.yaml
│
├── docs/
│   ├── SYSTEM.md                ← full system doc (Phase 8)
│   └── API.md                   ← API reference (Phase 8)
│
└── src/                         ← generated application code (framework-specific structure)
```

### Multi-target project (e.g., gateway + terminal + admin)

```
<target>/
├── CLAUDE.md
├── README.md
├── package.json                 ← root manifest (npm workspaces if applicable)
│
├── .fdl/                        ← shared across all targets
│   ├── plan.md                  ← one plan covers all targets
│   ├── prototypes/              ← one prototype per UI target
│   │   ├── terminal.html
│   │   └── admin.html
│   ├── DESIGN.md
│   ├── build_manifest.json
│   └── history/
│
├── blueprints/                  ← shared local overrides
│
├── docs/
│   ├── SYSTEM.md                ← covers all targets
│   └── API.md                   ← endpoints across all targets
│
└── targets/
    ├── gateway/
    │   ├── package.json
    │   └── src/
    ├── terminal/
    │   ├── package.json
    │   └── src/
    └── admin/
        ├── package.json
        └── src/
```

For headless targets (e.g., `gateway`) there's no prototype — Sketcher is skipped.

### Purpose + git-tracking by path

| Path | Purpose | Git tracked? |
|------|---------|--------------|
| `CLAUDE.md` | AI awareness on project open | ✅ committed |
| `package.json` | project manifest | ✅ committed |
| `.fdl/plan.md` | living build plan, source of truth | ✅ committed |
| `.fdl/prototype.html` (or `prototypes/*`) | Stage 1 approved prototype | ✅ committed |
| `.fdl/DESIGN.md` | UI design system | ✅ committed |
| `.fdl/build_manifest.json` | Stage 2 transient state | ❌ gitignored |
| `.fdl/telemetry/` | local run history | ❌ gitignored |
| `.fdl/history/` | frozen plan snapshots | ✅ committed (audit trail) |
| `blueprints/` | local blueprint overrides | ✅ committed |
| `docs/SYSTEM.md` / `docs/API.md` | generated docs | ✅ committed |
| `src/**` or `targets/*/src/**` | generated app code | ✅ committed |

Bob writes the `.gitignore` entries for `build_manifest.json` and `telemetry/` during bootstrap if they're missing.

### Write paths by role (enforced at filesystem level)

| Role | Allowed write paths |
|------|---------------------|
| Bob | `CLAUDE.md` (bootstrap), `.fdl/plan.md`, `.fdl/build_manifest.json`, `.fdl/history/**`, `.gitignore` |
| Sketcher | `.fdl/prototype.html` or `.fdl/prototypes/*.html` |
| Builder | `src/**` or `targets/*/src/**` |
| Scribe | `docs/SYSTEM.md`, `docs/API.md`, `README.md` |
| `/fdl-extract-design` | `.fdl/DESIGN.md` |
| Scout, Surveyor, Inspector, Reviewer | **no write access** (pure read + tool invocations) |

No two roles share a write path. If a specialist attempts to write outside its allowed path, the Foreman's clipboard rejects the return.

### Bootstrap contract

Phase 0.6 creates this layout. Idempotent — if `.fdl/` already exists, Bob reconciles (reads existing plan if any, preserves history, adds missing gitignore entries). Never overwrites a user's existing `CLAUDE.md`; appends FDL section between `<!-- FDL:BEGIN -->` / `<!-- FDL:END -->` markers.

---

## The `plan.md` artifact

`.fdl/plan.md` is Bob's living source of truth. Written after Scout/Surveyor rounds, updated continuously during prototype iteration, then frozen and consumed as input to Stage 2.

### Required sections

```markdown
# Build Plan — {app name}

## Goal
{user's original ask, clarified}

## Tech Stack
- Framework: ...
- Database: ...
- UI: ...
- Auth: ...

## Features (selected blueprints)
### CORE
- feature/name — rationale
### REQUIRED (transitive dependencies, auto-added)
- ...
### RECOMMENDED (user-selected)
- ...

## Gaps → Resolution
| Gap | Resolution method | Resulting blueprint |

## Architecture
- Dependency order (topo-sorted)
- Integration points (shared types, auth middleware, event bus, etc.)

## UI Decisions
{captured from prototype iteration}

## Deferred / Skipped
{features explicitly skipped, with notes}

## Revision Log
| Rev | Change | Source |
```

### Lifecycle

1. Bob writes `plan.md` after Phase 4.
2. Bob updates it at every user checkpoint and with every prototype edit. Revision Log is append-only.
3. User can edit `plan.md` directly — Bob detects this on next invocation and asks whether to regenerate prototype or accept.
4. At Stage 2 start, `plan.md` is frozen and copied to `.fdl/history/{timestamp}/`.
5. After Stage 2, `plan.md` ships as the definitive record of what was built and why.

---

## Bob's advisory voice — how to present choices

Bob is an **opinionated advisor, not a passive menu.** Every user-facing question at a checkpoint or decision point follows this pattern.

### The template

```
[SITUATION]
One-line summary of what the choice is about and why it matters.

[OPTIONS]
OPTION A — {name}
  How it works: ...
  Good for: ...
  Tradeoff / risk: ...

OPTION B — {name}
  How it works: ...
  Good for: ...
  Tradeoff / risk: ...

[RECOMMENDATION]
I'd recommend {X} because {specific reason tied to user's stated context}.
You might choose {Y} instead if {specific scenario where Y wins}.

[QUESTION]
{clear prompt for the user}
```

### Worked example — auth disambiguation

> Three auth blueprints match your stack.
>
> **OPTION A — auth/login (email + password)**
> *How it works:* user registers with email, logs in with a password
> *Good for:* standard web apps, staff rotating across devices
> *Tradeoff:* requires password-reset flow, email verification, phishing surface
>
> **OPTION B — auth/biometric-auth (palm-vein scanner)**
> *How it works:* user scans their hand on dedicated hardware
> *Good for:* kiosks, POS terminals, physical access control
> *Tradeoff:* hardware investment, enrolment step, only works at that terminal
>
> **OPTION C — auth/payload-auth (JWT + API keys + account locking)**
> *How it works:* full session management with token rotation and lockout
> *Good for:* multi-tenant APIs, headless CMS, apps on Payload
> *Tradeoff:* overkill for a single-business POS, adds complexity with no upside here
>
> I'd recommend **OPTION A** because you described "a full POS system" — staff rotate across devices, Next.js + Mongoose pairs cleanly with email/password, and you get password-reset + email-verification for free.
>
> Choose **B** instead if you already have biometric hardware at each terminal — in that case the UX win is real (faster shift changes, no typing under gloves).
>
> **C** is only worth it if you're also building a headless API for external partners.
>
> Which fits?

### Worked example — prototype iteration

User says: *"the login form feels too long."*

> Three ways to shorten it:
>
> **A — drop "remember me" + inline "forgot password" to a smaller link**
> *Saves:* 2 UI elements
> *Risk:* none, standard pattern
>
> **B — magic link (one field: email only, no password at login-time)**
> *Saves:* the entire password field
> *Risk:* requires email delivery + tolerable latency; **doesn't work offline** — in a POS, a dead internet = no logins
>
> **C — biometric primary with password fallback**
> *Saves:* zero fields in the happy path
> *Risk:* this isn't a UI tweak — it's a plan-level change. Triggers re-scoping and you already approved the plan.
>
> I'd go with **A**. Shortest safe change. B is tempting but POS offline-risk is real. C re-opens the plan.
>
> Apply A?

### When Bob's voice is mandatory

- Disambiguation (overlap between blueprints)
- Gap resolution method choice (create vs extract)
- Plan checkpoint — every pre-checked item needs rationale
- Stack ambiguity (vague description)
- Prototype iteration — every non-trivial change
- Stage 2 ambiguity halt (if ever triggered)
- Anti-pattern collision — user asks for something a blueprint forbids; advise alternatives

### When neutral presentation is okay

- Tier 0 lookup hits — deterministic, no real choice
- Pre-filled confirmations with no meaningful alternative
- `required` relations — no choice, the blueprint says it needs X

### What to avoid

- ❌ "Here are three options, pick one." (no opinion)
- ❌ Recommending by popularity ("most people choose A") instead of by user context
- ❌ Soft-pedalling real risks ("it's fine either way") when there's a genuine tradeoff
- ❌ Burying the recommendation in long paragraphs — it should be visible in 1–2 sentences

### Rule of thumb

If the user has to ask *"what do you think I should do?"* at a decision point, Bob has failed his job at that checkpoint. The recommendation should appear before the user has to request it.

---

## Scout — matcher

**Purpose:** match ONE user keyword against the blueprint corpus. Deterministic-first, fuzzy fallback.

### Inputs (JSON)

- `keyword` — one extracted feature term
- `corpus_source` — `"local"` | `"remote"`
- `stack` — `{framework, database, ui}` for biasing
- `deterministic_only` — if true, only run `blueprint-lookup.js` (Tier 0)

### Outputs (JSON)

- `keyword` — echoed
- `tier_hit` — `0` | `1` | `2` | `3` | `"miss"`
- `matches[]` — `{feature, category, score, matched_via: name|alias|tag|description}`
- `overlaps` — boolean (multiple category-siblings matched)
- `gap` — boolean (zero matches)

### Allowed tools

Read, Glob, Grep, Bash (for `blueprint-lookup.js`), WebFetch (remote registry only).

### NOT allowed

- Write/Edit anything
- Invoke other agents
- Invoke `/fdl-*` skills

### Failure policy

- Corpus unreachable → return `{error: "corpus_unavailable"}`
- **Zero retries** — pure function, same input = same output

### Parallelism

One Scout per keyword. Fully parallel. **~3–15 per build.**

---

## Surveyor — gap-resolver

**Purpose:** resolve ONE gap by creating or extracting a new blueprint.

### Inputs (JSON)

- `gap_description` — what the user said
- `resolution_method` — `"create"` | `"extract-file"` | `"extract-web"` | `"extract-code"`
- `resolution_source` — path / URL / null
- `stack` — for sensible defaults
- `target_category` — which FDL category

### Outputs (JSON)

- `blueprint_path`, `blueprint_feature`, `blueprint_version`
- `related_additions[]` — any new transitive deps introduced
- `status` — `"success"` | `"deferred"` | `"failed"`
- `error` — string | null

### Allowed tools

Read, Write (new blueprint file only), Bash (invoke `/fdl-create`, `/fdl-extract-*`, `validate.js`), WebFetch.

### NOT allowed

- Modify existing blueprints
- Touch generated app code
- Talk to the user directly — Bob relays all elicitation

### Failure policy

- `/fdl-create` fails validation → one retry with adjusted inputs, then fail
- Extract source unreachable → `failed` + clean error; Bob re-asks user
- Cross-ref validation fail → auto-stub missing `related` entries OR fail cleanly

### Parallelism

One Surveyor per gap. Parallel **except** serialize when gaps share a URL. **~0–5 per build.**

---

## Sketcher — prototype-builder

**Purpose:** produce a single-file HTML prototype from the approved plan. Applies iteration edits during Stage 1's prototype loop. Prototype is intentionally one self-contained HTML file (or one per UI target in multi-target builds).

### Inputs (JSON)

- `plan_path` — path to current `.fdl/plan.md`
- `design_path` — path to `.fdl/DESIGN.md` (if present)
- `target_dir` — where the prototype is written (`.fdl/` or `.fdl/prototypes/`)
- `target_key` — optional — which UI target (for multi-target)
- `mode` — `"initial"` | `"iterate"`
- `iteration_request` — string | null — user's change description (only when `mode = "iterate"`)
- `previous_prototype_path` — string | null — existing prototype (only when `mode = "iterate"`)

### Outputs (JSON)

- `prototype_path` — path to the written HTML
- `plan_updates[]` — array of `{section, change, rationale}` for Bob to apply to `plan.md`
- `ui_decisions_captured[]` — UI choices made/changed this iteration (feed into plan's "UI Decisions")
- `ambiguities[]` — questions the user must answer (surfaced via Bob with advisory voice)
- `status` — `"success"` | `"partial"` | `"failed"`

### Allowed tools

Read, Write (ONLY `.fdl/prototype.html` or `.fdl/prototypes/*.html`).

### NOT allowed

- Generate production code (Stage 2's job)
- Modify blueprints
- Write multiple files per invocation (one HTML file, inline CSS + JS)
- Write outside the `.fdl/` prototype paths
- Invoke other agents
- Talk to the user directly

### Failure policy

- Plan missing required sections → `{status: "failed", error: "plan_incomplete"}`; Bob returns to checklist
- Iteration request ambiguous → return `ambiguities[]`; Bob advises user and re-invokes
- No retries on first-generation failure
- One retry on iteration edits (single-shot with a reminder of the plan's current state)

### Parallelism

Single instance per target. Not parallelized. **~1–10 invocations per build** (1 initial + N iteration edits per UI target).

---

## Builder — feature-generator

**Purpose:** generate implementation code for ONE blueprint in the target stack. Core workhorse of Stage 2.

### Inputs (JSON)

- `blueprint_path`
- `stack` — full spec from `plan.md`
- `target_dir` — `src/` or `targets/{key}/src/`
- `shared_manifest` — what previous Builders have exported (prevents duplication)
- `template_dir` — per-stack skeletons (from Phase D)
- `capabilities[]` — `code-quality-baseline`, `security-baseline`, `ai-pr-review`
- `agi_preferences` — user answers from Phase 6 Step 2.5
- `ui_decisions` — relevant entries from `plan.md`'s UI Decisions (may override default components)

### Outputs (JSON)

- `files_written[]` — `{path, blueprint_trace, outcomes_covered[], bytes}`
- `manifest_additions` — new types/models/services for downstream Builders
- `unresolved_imports[]` — symbols referenced but not written (integration-layer job)
- `anti_pattern_compliance[]` — `{rule, how_honored}`
- `gate_hints` — findings Inspector should know about
- `status` — `"success"` | `"partial"` | `"failed"`

### Allowed tools

Read, Write (ONLY under `src/` or `targets/{key}/src/`), Edit (own just-written files only), Bash (formatter on own output).

### NOT allowed

- Read other blueprints (only what's echoed via `shared_manifest`)
- Modify files from other Builders
- Invoke `/fdl-*` skills
- Write outside `src/` / `targets/{key}/src/`
- Mock/stub external services

### Failure policy

- Blueprint missing `api:` → fail fast with `blueprint_needs_api_block` (per Rule 14)
- Template missing for an outcome → emit placeholder + `unresolved_imports` entry, `status: partial`
- Formatter crashes → unformatted output + warning
- **Zero retries** — determinism > retry

### Parallelism

Parallel **within the same dependency tier**, never across tiers. **~5–15 per build.**

---

## Inspector — gate-runner

**Purpose:** run the 3-gate pipeline against ONE feature's generated output.

### Inputs (JSON)

- `blueprint_path`
- `files_written[]` (from Builder)
- `stack`
- `gates_enabled[]` — `["compile", "capability", "outcomes-coverage"]`

### Outputs (JSON)

- `gate_1_compile` — `{status: pass|fail|warn, findings[]}`
- `gate_2_capability` — `{status, findings[]}`
- `gate_3_outcomes` — `{status, findings[], uncovered_outcomes[]}`
- `overall` — `"pass"` | `"warn"` | `"block"`
- `auto_patchable` — boolean (findings fixable in blueprint vs. needing regen)

### Allowed tools

Read, Bash (`compile-gate.js`, `outcomes-coverage.js`, `post-gen-scan.js`). **Pure read-only.**

### NOT allowed

- Write/Edit anything
- Invoke other agents

### Failure policy

- Any gate = `block` → Bob decides: auto-patch blueprint + re-invoke Builder (one retry max), or halt for user (advisory voice kicks in to present resolution options)
- Missing toolchain → `warn` not `block`
- Inspector itself crashes → treat as block

### Parallelism

One Inspector per feature. Fully parallel (read-only = safe). **~5–15 per build.**

---

## Scribe — doc-writer

**Purpose:** produce `docs/SYSTEM.md`, `docs/API.md`, and `README.md` once Stage 2 completes.

### Inputs (JSON)

- `build_manifest` — full build state
- `plan_path` — frozen `.fdl/plan.md`
- `generated_files[]` — flat list with trace comments
- `blueprint_registry` — `{feature → path}` for traceability
- `target_dir`, `app_name`

### Outputs (JSON)

- `files_written[]` — `[{path, sections_count, endpoints_count}]`
- `status` — `"success"` | `"failed"`

### Allowed tools

Read, Write (ONLY `docs/SYSTEM.md`, `docs/API.md`, `README.md`).

### NOT allowed

- Modify code or blueprints
- Write anywhere else

### Failure policy

- Source files missing → skip section with warning
- Manifest incomplete → write partial doc with explicit `INCOMPLETE` banner
- Zero retries

### Parallelism

Single instance, runs once at end of Stage 2. **1 per build.**

---

## Reviewer — cold-context PR review

**Purpose:** second-pass semantic review against blueprint with **no prior build context** — fresh eyes. Mandatory on every Builder output.

### Inputs (JSON)

- `blueprint_path`
- `files_to_review[]`
- `capability_rubric_version`
- `scope` — `"per-feature"` | `"whole-build"`

### Outputs (JSON)

- `findings[]` — `{severity: blocking|major|minor|nit, file, line, rule_violated, suggestion}`
- `capability_scores` — per-capability 0–100
- `overall_verdict` — `"approve"` | `"request_changes"` | `"block"`
- `confidence` — 0–1

### Allowed tools

Read, Bash (read-only lints / type-checkers).

### NOT allowed

- Write/Edit anything
- Access prior build manifest (cold context intentional)
- Access other features unless scope is `"whole-build"`

### Failure policy

- Stateless → retries safe
- Malformed JSON output → one retry with strict schema reminder, then surface raw
- `verdict: block` → Bob holds the summary, uses advisory voice to surface findings + resolution options

### Parallelism

One Reviewer per feature (per-feature scope) — parallel. **~5–15 per build.**

---

## Bob — orchestrator

**Purpose:** the only agent the user ever talks to. Owns the two-stage flow, dispatches the crew, **maintains `.fdl/plan.md` as a living artifact**, validates every crew return via the Foreman's clipboard, presents every decision point with advisory voice, aggregates output, and writes the final summary.

### Inputs

User's `/fdl-build` command + args. On re-invocation, Bob reads the current `.fdl/plan.md` to determine whether to resume Stage 1 (iteration loop) or start Stage 2.

### Outputs

- The final build summary (user-facing)
- `.fdl/plan.md` (living through Stage 1, frozen at Stage 2 start)
- `.fdl/build_manifest.json` (Stage 2 progress, resume-safe)
- `.fdl/history/{timestamp}/` snapshots

### Allowed tools

AskUserQuestion, Agent (spawn crew), Bash (deterministic scripts: `build-orchestrate.js`, `build-sort.js`, `bootstrap`, `validate-crew-output.js`, `auto-evolve`), Read, Write (ONLY `CLAUDE.md` during bootstrap + `.fdl/plan.md` + `.fdl/build_manifest.json` + `.fdl/history/**` + `.gitignore`).

### NOT allowed

- Generate code directly (always Builder)
- Generate prototype directly (always Sketcher)
- Run gates directly (always Inspector)
- Write docs directly (always Scribe)
- Skip deterministic scripts and "do it himself"
- Accept a subagent return without running the Foreman's clipboard
- Present a decision neutrally at a mandatory-advisory checkpoint (see advisory voice above)

### Foreman's clipboard (validation gate)

**Every subagent return passes through `scripts/validate-crew-output.js` before Bob accepts it.** Deterministic script — NOT another agent. Four checks:

1. **Schema** — output matches the role's JSON contract (AJV).
2. **Input echo** — output references the exact inputs Bob sent (catches "worked on the wrong thing").
3. **Scope adherence** — tool-use log stays within the role's allowlist, **and writes stay within the role's filesystem path** (catches scope violations that bypassed the tool check).
4. **Status consistency** — `status: success` has all required fields populated (catches "specialist lied about its status").

On pass → Bob aggregates. On fail → one retry with the violation echoed back; second failure surfaces via advisory voice.

### Failure policy

- Per-role policy applied first
- Foreman's clipboard enforced on every return, no exceptions
- Deterministic script exits non-zero → halt with exact error, no workaround
- User abandons Stage 1 mid-loop → save current `.fdl/plan.md` + `.fdl/prototype.html`, clean exit; resume next invocation
- User abandons Stage 2 mid-build → save `.fdl/build_manifest.json` with `status: paused`; resume with `--resume`

### Parallelism

One Bob per `/fdl-build`. **Never parallel Bobs.**

---

## The shape of a build, with the crew

```
user says "nextjs POS with login"
        │
        ▼
┌────── STAGE 1: Plan → Prototype → Iterate ──────────┐
│                                                      │
│   Bob  (bootstraps folder structure, runs prep)      │
│    │                                                 │
│    ├──► Scout × 4     (parallel keyword matching)    │
│    ▼                                                 │
│   Bob  (disambiguation with advisory voice)          │
│    │                                                 │
│    ├──► Surveyor × 2  (parallel gap resolution)      │
│    ▼                                                 │
│   Bob  (writes .fdl/plan.md)                         │
│    │                                                 │
│    └─► USER CHECKPOINT 1 — plan review (with advice) │
│           │  (adjustments loop back to checklist)    │
│           ▼                                          │
│   Bob  (plan.md approved, dispatch Sketcher)         │
│    │                                                 │
│    ├──► Sketcher × 1  (writes .fdl/prototype.html)   │
│    │                                                 │
│    └─► USER CHECKPOINT 2 — prototype iteration       │
│           │                                          │
│           ▼ ─── iteration loop ─────                 │
│           │                                          │
│           ├──► user describes change                 │
│           │                                          │
│           ├──► Bob advises (X vs Y tradeoffs)        │
│           │                                          │
│           ├──► Sketcher × 1  (applies edit)          │
│           │                                          │
│           ├──► Bob updates plan.md (Revision Log)    │
│           │                                          │
│           └──◄ back to Checkpoint 2 (loop)           │
│                                                      │
│   ◄── user approves → freeze to .fdl/history/{ts}/   │
│                                                      │
└──────────────────────────────────────────────────────┘
        │
        ▼
┌────── STAGE 2: Full Build ──────────────────────────┐
│                                                      │
│   Bob  (reads frozen plan.md — no user dialog)       │
│    │                                                 │
│    ├──► Builder × 3     (tier 0 — parallel)          │
│    ├──► Inspector × 3   (parallel)                   │
│    ├──► Reviewer × 3    (parallel)                   │
│    │                                                 │
│    ├──► Builder × 4     (tier 1 — parallel)          │
│    ├──► Inspector × 4                                │
│    ├──► Reviewer × 4                                 │
│    │                                                 │
│    ├──► Builder × 4     (tier 2 — parallel)          │
│    ├──► Inspector × 4                                │
│    ├──► Reviewer × 4                                 │
│    │                                                 │
│    ├──► Scribe × 1      (docs/SYSTEM.md + API.md)    │
│    ▼                                                 │
│   Bob  (auto-evolve, final summary)                  │
│                                                      │
└──────────────────────────────────────────────────────┘

Every subagent return passes through the Foreman's clipboard before Bob accepts it.
At no point does the user see anything except Bob.
```

---

## Invariants across every role

1. **JSON in, JSON out.** No prose returns. Schemas programmatically validated.
2. **Foreman's clipboard on every return.** Schema + input echo + scope adherence + status consistency. Deterministic, not LLM-based.
3. **Scope isolation at both tool and filesystem level.** Tool allowlist enforced by harness; write path enforced by the clipboard.
4. **No user contact except Bob.** Elicitation bubbles up.
5. **Advisory voice at every decision point.** Bob presents tradeoffs + recommendation, never a neutral menu.
6. **Deterministic where possible.** Scout and Inspector effectively pure functions. Builder aims for determinism via templates.
7. **Explicit failure states.** Every output has a `status` field. No silent partials.
8. **Plan is source of truth.** `.fdl/plan.md` is authoritative for Stage 2. Prototype/plan drift during Stage 1 is a bug Bob must fix before approval.
9. **Filesystem layout enforces scope.** Each role has one write path. No two roles overlap.

---

## Relationship to the `/fdl-build` hardening plan

This spec is Phase C of the tiered plan documented separately:

- **Phase A** — extract deterministic orchestrator out of prose (`build-orchestrate.js`, `build-sort.js`, `bootstrap` with folder layout)
- **Phase B** — `build_manifest.json` + `--resume` + outcomes-coverage gate + `validate-crew-output.js` (Foreman's clipboard)
- **Phase C** — **this document** — introduce the crew, the two-stage flow, `.fdl/plan.md` as living artifact, advisory voice, target folder structure
- **Phase D** — per-stack template layer (makes Builder deterministic)
- **Phase E** — version pinning, telemetry, `--plan-only`, batched gap elicitation

Phase C depends on A and B landing first. The Foreman's clipboard script in Phase B is a **prerequisite** for Phase C — we never spawn a crew member without a validator to receive its output.

---

## Open questions for review

1. **Sketcher's stack choice for the prototype.** Plain HTML + inline CSS/JS (my preference — fastest iteration, truly disposable) vs. scaffolded in the target framework (higher fidelity but the prototype becomes non-throwaway, which defeats the point).

2. **User edits `prototype.html` directly between iterations.** Sketcher's next invocation needs to diff and reconcile. My preference: Sketcher reads the current file, treats it as new baseline, surfaces any intent-diverging changes to Bob as ambiguities.

3. **Mid-Stage-2 ambiguity discovery.** My preference: **hard fail back to Stage 1** — keeps Stage 2 non-conversational. Alternative: Bob asks inline with advisory voice, more forgiving but blurs the stage boundary.

4. **Multi-target prototype count.** One prototype per UI target (my preference) vs. a single multi-tab prototype HTML. Single file is simpler; per-target matches deployment reality.

5. **User edits `.fdl/plan.md` directly.** My preference: Bob detects on next invocation and asks "regenerate prototype or accept?" with advisory voice on both paths.

6. **Whole-build Reviewer scope.** Per-feature cold review is mandatory. Is one additional whole-build Reviewer pass worth the cost? Telemetry in Phase E should decide.

7. **Cost envelope.** ~30+ subagent calls per build plus prototype iterations is a real token bill. Phase E telemetry tracks per-role cost.
