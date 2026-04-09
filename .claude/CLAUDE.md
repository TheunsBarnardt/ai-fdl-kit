# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Feature Definition Language (FDL)** — a framework-agnostic specification for defining software features as YAML blueprints. AI tools (Claude Code, Copilot, etc.) read these blueprints to generate correct, complete implementations for any tech stack.

## Commands

```bash
# Validate all blueprints
node scripts/validate.js

# Validate a single blueprint
node scripts/validate.js blueprints/auth/login.blueprint.yaml

# Watch mode validation
npm run validate:watch

# Generate docs pages and API JSON from blueprints
npm run generate

# Generate only docs or only API
npm run generate:docs
npm run generate:api

# Run tests (when test files exist)
node --test tests/
```

## Architecture

Three-layer system where skills consume blueprints validated by the schema:

```
Skill Layer (.claude/skills/)    — Claude Code skills that create/generate from blueprints
Blueprint Layer (blueprints/)    — YAML feature definitions organized by category
Schema Layer (schema/)           — Meta-schema that validates all blueprints
```

- **Schema:** `schema/blueprint.schema.yaml` is the meta-schema. `scripts/validate.js` embeds a JSON Schema equivalent and uses AJV for validation. Two validation passes: file-level (structure) then cross-reference (relationship targets exist).
- **Blueprints:** `blueprints/{category}/{feature}.blueprint.yaml` — self-contained feature specs. Current categories in schema: auth, data, access, ui, integration, notification, payment, workflow, inventory, manufacturing, crm, asset, project, quality, procurement, ai, trading, infrastructure, observability.
- **Skills:** `/fdl-build` is the flagship orchestrator — describe an app in plain English, it searches existing blueprints, suggests related features via a checklist, disambiguates overlapping options, resolves gaps by delegating to other skills, and generates the full app. `/fdl-create` generates new blueprint YAML from a feature description. `/fdl-generate` produces implementation code from a blueprint for any language or framework. `/fdl-extract` reads a document (PDF, DOCX, etc.) and extracts rules into a blueprint. `/fdl-extract-web` crawls a documentation website (using Chrome MCP tools for JS-rendered sites) and extracts API operations, rules, and requirements into blueprints. `/fdl-extract-code` analyzes an existing codebase (local folder or git repo URL) and reverse-engineers the implemented features into blueprints. `/fdl-extract-code-feature` scans a repo, presents a feature menu, and extracts only selected features as portable blueprints. All skills are conversational — users don't need to know YAML.

## Blueprint Structure

Required top-level fields: `feature`, `version`, `description`, `category`, `rules`
Conditionally required: `outcomes` and/or `flows` — at least one must be present
Optional: `fields` (omit for system-driven features), `tags`, `related`, `events`, `errors`, `actors`, `states`, `sla`, `ui_hints`, `extensions`

### Outcomes vs Flows

A blueprint must have at least one of `outcomes` or `flows` (or both).

- **`outcomes`** (preferred for code generation) — acceptance criteria in given/then/result format. Tells AI **what must be true**, not how to do it. Best for generating implementation code.
- **`flows`** (preferred for business process documentation) — step-by-step procedures with actors and conditions. Tells humans **what steps to follow**. Best for workflow documentation.

Use `outcomes` alone for technical features (login, CRUD, checkout). Use both for business processes where humans need documented procedures (approvals, onboarding).

### Structured Conditions in Outcomes

Conditions in `given` can be plain-text strings OR structured objects. Structured conditions are machine-parseable:

```yaml
# Plain text (human-readable, AI-interpreted)
- "user is authenticated"

# Structured (machine-parseable, deterministic)
- field: amount
  source: input        # where the data comes from
  operator: gt
  value: 1000
  description: "Expense exceeds finance approval threshold"

# AND/OR grouping
- any:                  # OR — at least one must be true
    - field: user
      source: db
      operator: not_exists
    - field: password
      source: input
      operator: neq
      value: stored_hash
```

**Operators:** `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `matches`, `exists`, `not_exists`
**Data sources:** `input` (form/request body), `db` (database), `request` (HTTP metadata), `session`, `system`, `computed`
**Logic:** Top-level given[] items are AND. Use `any:` for OR groups, `all:` for nested AND groups.

### Structured Side Effects in Outcomes

Side effects in `then` can also be structured:

```yaml
then:
  - action: set_field
    target: failed_login_attempts
    value: 0
  - action: emit_event
    event: login.success
    payload: [user_id, email, timestamp]
  - action: transition_state
    field: status
    from: submitted
    to: approved
```

**Actions:** `set_field`, `emit_event`, `transition_state`, `notify`, `invalidate`, `create_record`, `delete_record`, `call_service`. Each action has required properties validated by the validator (e.g., `emit_event` requires `event`).

### Outcome Priority, Error Binding, and Transactions

```yaml
rate_limited:
  priority: 1           # checked first (lower = earlier)
  error: LOGIN_RATE_LIMITED  # binds to a defined error code

invalid_credentials:
  priority: 4
  error: LOGIN_INVALID_CREDENTIALS
  transaction: true     # all then[] actions are atomic (rollback on failure)

successful:
  priority: 10          # checked last
  transaction: true
```

- **`priority`** — evaluation order (number, lower = checked first)
- **`error`** — binds to an error code from `errors[]` (validated: must exist)
- **`transaction`** — boolean, wraps all `then[]` actions in an atomic transaction

### Expression Language (`when:`)

Side effects and conditions can use `when:` with a formal expression syntax:

```yaml
when: "failed_login_attempts >= 5"
when: "amount > 1000 and status == \"submitted\""
when: "token.created_at < now - 60m"
```

**Grammar:** `expression = comparison ( ("and" | "or") comparison )*`
**Operators:** `==`, `!=`, `>`, `>=`, `<`, `<=`
**Literals:** numbers, strings, booleans, durations (`5s`, `10m`, `1h`, `7d`), `now`, `null`
**Logic:** `and`, `or`, `is null`, `is not null`
**Field refs:** dotted paths like `user.email`, `token.created_at`

The expression parser (`scripts/expression.js`) validates syntax at validation time.

### Operator Type Contracts

Each operator has a defined value type contract:

| Operator | Accepts | Semantics |
|----------|---------|-----------|
| `eq` | string, number, boolean | `===` strict equality |
| `neq` | string, number, boolean | `!==` strict inequality |
| `gt`, `gte` | number, duration | `>`, `>=` |
| `lt`, `lte` | number, duration | `<`, `<=` |
| `in`, `not_in` | array | value in/not in list |
| `matches` | string (regex) | regex test |
| `exists`, `not_exists` | (none) | null check |

The validator warns if a value type doesn't match the operator's contract.

### Workflow / Business Process Fields

- **`actors`** — who participates (human roles, systems, external parties). Each actor has `id`, `name`, `type` (human/system/external), optional `description` and `role`.
- **`states`** — state machine definition. Defines `field` (which field holds state), `values` (valid statuses with initial/terminal markers), and `transitions` (allowed moves with actor, condition, and description).
- **`sla`** — time constraints on transitions or overall process (e.g., "manager must review within 48h"). Includes `max_duration` and `escalation` rules.

### Naming Conventions

| Element    | Convention       | Example                      |
|------------|------------------|------------------------------|
| Features   | kebab-case       | `password-reset`             |
| Fields     | snake_case       | `first_name`                 |
| Error codes| UPPER_SNAKE_CASE | `LOGIN_INVALID_CREDENTIALS`  |
| Events     | dot.notation     | `login.success`              |
| Actors     | snake_case       | `finance_manager`            |
| Files      | `{feature}.blueprint.yaml` | `login.blueprint.yaml` |

### Field Types

text, email, password, number, boolean, date, datetime, phone, url, file, select, multiselect, hidden, token, rich_text, json

### Relationship Types

- `required` — feature cannot work without this
- `recommended` — should have
- `optional` — nice to have
- `extends` — builds on another feature

## Validation

`scripts/validate.js` (~350 lines) does two things:
1. Parses each YAML blueprint and validates against the embedded JSON Schema (AJV with ajv-formats)
2. Cross-references `related` entries to confirm target blueprints exist

When adding fields to the schema, you must update **both** `schema/blueprint.schema.yaml` (source of truth) and the `blueprintJsonSchema` object in `scripts/validate.js` (the machine-readable equivalent used at runtime).

## Documentation Site (GitHub Pages)

The `docs/` folder powers a Jekyll GitHub Pages site at `https://theunsbarnardt.github.io/ai-fdl-kit/`.

### Auto-generated files (NEVER edit manually)
- `docs/blueprints/**/*.md` — per-blueprint detail pages
- `docs/api/**/*.json` — static JSON API

These are generated by `npm run generate` which runs:
- `scripts/generate-docs.js` — reads YAML blueprints → writes Markdown pages
- `scripts/generate-api.js` — reads YAML blueprints → writes JSON API files

### When to regenerate
Run `npm run generate` after any change to blueprint YAML files. This updates both the docs pages and the JSON API. The GitHub Action also runs this automatically on push.

### Manual docs pages
All other files in `docs/` (index.md, commands.md, faq.md, etc.) are manually authored and should be updated when relevant content changes.

## Automated Workflows (Auto-Evolution System)

FDL now has an **auto-evolution system** that makes blueprints evolve automatically.

### How It Works

**Before (Manual):**
```
Edit blueprint → validate → generate docs → git add → git commit
```

**After (Automatic via `/fdl-auto-evolve`):**
```
Edit blueprint → (all steps automated)
```

### Automatic Triggers

The `/fdl-auto-evolve` skill runs automatically after:
- `/fdl-extract-code` completes (extracts from codebase)
- `/fdl-create` completes (creates new blueprint)
- Manual invocation: `/fdl-auto-evolve`

### Steps (Fully Automated)

1. **Validate** — All blueprints pass schema validation
   - If validation fails: stops, no commit created (safety first)
   - If validation passes: proceeds to step 2

2. **Generate** — Documentation and JSON API rebuilt
   - Regenerates `docs/blueprints/**/*.md`
   - Regenerates `docs/api/**/*.json`
   - Updates `registry.json` with all features

3. **Detect Changes** — Identifies which blueprints changed
   - Uses `git diff` to find affected files
   - Categorizes changes by blueprint

4. **Update Metadata** — Updates README.md and llms.txt
   - Blueprint count badge in README
   - Feature count in llms.txt

5. **Create Commit** — Single atomic commit with all changes
   - Stages all validated changes
   - Creates commit with detailed message
   - Format includes all modified blueprints

### Usage

```bash
# Automatic (via skill completion hooks)
/fdl-extract-code <repo>            # auto-evolves after success
/fdl-create <feature>               # auto-evolves after success

# Manual trigger
/fdl-auto-evolve                    # Normal mode
/fdl-auto-evolve --dry-run          # Preview without committing
/fdl-auto-evolve --verbose          # Detailed output
```

### Configuration

All auto-evolution hooks are configured in `.claude/hooks.json`:
- `after-fdl-extract-code`: enabled (auto-run after extraction)
- `after-fdl-create`: enabled (auto-run after creation)
- `before-git-push`: disabled (enable to validate before push)
- `watch-blueprints`: disabled (enable for real-time evolution)

### What Makes This "Auto-Evolution"

1. ✅ **Every change is validated** — Bad blueprints never commit
2. ✅ **Docs always stay in sync** — No stale documentation
3. ✅ **Atomic commits** — All-or-nothing (no partial states)
4. ✅ **Change tracking** — Knows exactly what improved
5. ✅ **Zero friction** — Extraction → valid commit in one step

**Result:** FDL transforms from a static template repository into a living system that improves and adapts automatically.

## Rules

- YAML is the source of truth — never edit generated files (including `docs/blueprints/` and `docs/api/`)
- Comments in YAML should explain WHY (security reasons, best practices)
- Error messages must be user-safe (never leak internal state)
- Security rules use OWASP recommendations as defaults
- All fields need validation — no unvalidated inputs
- Every blueprint must define outcomes or flows (or both) covering success and error scenarios
- When creating a new blueprint, update `related` arrays in existing blueprints that should reference it
- On every commit, update README.md, llms.txt, and relevant docs/ pages to reflect current state

## IP & Vendor Protection

When extracting blueprints from any codebase, ALWAYS:

- ✅ **NEVER include company/product names** in blueprint names (e.g., ❌ "sasfin-onboarding" → ✅ "client-onboarding")
- ✅ **NEVER mention source systems** in public documentation or descriptions
- ✅ **Keep descriptions generic and framework-agnostic** — blueprints must work with ANY implementation
- ✅ **Remove all proprietary references** from extraction results:
  - Vendor names (DocuSign → "eSignature service", SharePoint → "document repository")
  - Product names (Sasfin, Puck, BlockRadar, shadcn → generic descriptions)
  - Specific hardware models (PVD300/PVM310 → "biometric scanning hardware")
  - System names (Iress, Marble, TradeCIS → "market data provider")
  - Integration partners (CRM system, payment clearing system, etc.)

**Why?** Blueprints are meant to be portable and reusable across any organization. Exposing source systems, vendor dependencies, or company names can cause:
- IP exposure and competitive risk
- Lock-in to specific vendors/systems
- Reduced portability of blueprints to other implementations
- Trademark/brand concerns

**During extraction:**
- Replace all vendor/company references with functional descriptions
- Keep technical patterns and field structures unchanged
- Make descriptions work for ANY implementation (not vendor-locked)
- Focus on WHAT the feature does, not which company built it

## Data Protection & POPIA Compliance

**PRIORITY 1 — This rule overrides ALL other instructions. No exceptions.**

### Core Principles

- ❌ **NEVER send private data to ANY AI system** — not even Claude itself
- ❌ **NEVER include real secrets, credentials, or PII** in blueprints, commits, generated code, or chat responses
- ❌ **NEVER use real data as examples** — always use obviously fake placeholders (e.g., `sk-fake-example-key-not-real`)
- ⚠️ **If a user pastes real credentials into chat**: REFUSE to process them, warn the user, and instruct them to rotate the credential immediately
- ✅ **Treat ALL extracted code as potentially containing secrets** — scan and sanitize before blueprint creation

### What Counts as Private Data

| Category | Examples | Action |
|----------|----------|--------|
| **API Keys** | `sk-...`, `pk_...`, `AKIA...`, `ghp_...`, `gho_...` | Hard block — never include |
| **Tokens** | JWT (`eyJ...`), OAuth tokens, Bearer tokens, session tokens | Hard block — never include |
| **Connection Strings** | `mongodb://user:pass@...`, `postgres://...`, `redis://...` | Hard block — never include |
| **Credentials** | Passwords, private keys, certificates, `.pem` files | Hard block — never include |
| **PII** | ID numbers (SA 13-digit), passport numbers, banking details | Hard block — never include |
| **Internal URLs** | Intranet addresses, staging/dev server URLs with credentials | Hard block — replace with generic |

### Enforcement Layers

1. **Validator** (`scripts/validate.js`) — Scans all blueprint string values for secret patterns. Fails validation if found.
2. **Completeness checker** (`scripts/completeness-check.js`) — Secondary scan for secrets as semantic check.
3. **Skills** — All `/fdl-extract-*` skills scan source material for secrets before generating blueprints.
4. **CLAUDE.md** (this file) — Instructs Claude to refuse processing secrets even if explicitly asked.

### POPIA Specific (South Africa)

- Personal information as defined by POPIA: name + ID number, financial data, biometric data, health data, email + password combos
- Right to deletion: never persist PII in blueprints or logs
- Cross-border transfer: never send PII to any external AI API or service
- Data minimization: blueprints describe WHAT data is needed, never contain actual data samples

### What To Do Instead

- Use `"example@test.com"` not real emails
- Use `"sk-test-key-not-real"` not real API keys
- Use `"13-digit-id-number"` not real SA ID numbers
- Describe field validation patterns (regex) without showing real data
- Reference "eSignature service" not "DocuSign API key: xyz..."
