---
name: fdl-build
description: Build a full application from a natural language description — searches blueprints, suggests features, resolves gaps, and generates code
user-invocable: true
argument-hint: "<app-description> [--plan <path>] [--path <abs-path>] [--targets <map>]"
---

# FDL Build — App Orchestrator

Build a complete application from a plain-English description. You don't need to know what blueprints exist — this skill searches them, suggests what you're missing, explains why each piece matters, disambiguates overlapping options, fills gaps, and orchestrates full code generation.

This is the flagship skill of FDL. It ties together `/fdl-create`, `/fdl-generate`, `/fdl-extract`, `/fdl-extract-web`, and `/fdl-extract-code` into a single guided experience.

## Usage

```
/fdl-build "nextjs app with shadcn and mongoose, OTP login, full POS system"
/fdl-build "express API for expense approval workflow with email notifications"
/fdl-build "flutter mobile app with biometric login and product catalog"
/fdl-build "laravel e-commerce store with stripe payments and admin dashboard"
/fdl-build "react app with supabase auth and drag-drop page builder"
```

## Arguments

- `<app-description>` — Plain-English description of the app. Include the tech stack, features, and any specific requirements. Be as vague or specific as you want — the skill will ask clarifying questions and fill in the rest.
- `--plan <path>` — Path to an FDL plan markdown (e.g. `docs/plans/*.md`) whose Appendix B lists the blueprints to build. When provided, skips Phase 1/2/3/4 user questions — the plan IS the approved spec.
- `--targets <map>` — Comma-separated `<target-key>:<stack>` pairs, e.g. `"gateway:typescript-node,terminal:kotlin-android,admin:typescript-react"`. Each target-key becomes a sub-directory under `--path`. When omitted, the skill infers a single target from the stack detected in Phase 1.
- `--path <absolute-path>` — Destination directory where generated app code is written. Created if missing. Each target writes to `<path>/<target-key>/` (or straight into `<path>/` if there is only one target). The FDL kit repo itself is never copied into `--path` — only the published `ai-fdl-kit` npm package (same as `npx ai-fdl-kit`) plus a `CLAUDE.md` are installed there so the new project is Claude-Code-ready and FDL-aware on first open. If omitted, defaults to the current working directory.

## Core Principles

1. **The user knows NOTHING about YAML or blueprints.** Never show YAML. Never use FDL jargon (outcomes, flows, events, fields). Use plain language throughout.
2. **Be an opinionated advisor, not a passive menu.** Actively guide the user toward a complete, production-ready system. Warn about missing pieces. Explain why each suggestion matters.
3. **Never skip security.** If the app needs authentication, insist on it even if the user didn't mention it. If a blueprint has rate limiting, implement it.
4. **Leverage existing blueprints first.** Only create new ones when nothing fits. The 50+ existing blueprints cover a LOT — search thoroughly before declaring a gap.
5. **Explain WHY, not just WHAT.** Every suggestion has a reason. "You need tax-engine because POS order lines need tax computation" — not just "Adding tax-engine."
6. **One invocation does everything — never ask the user to run prep or post-build steps separately.** This skill owns validate → auto-patch capability pinning → auto-patch POPIA links → re-validate → build → 3-gate pipeline → auto-evolve. If any of those can be automated, automate them. Do not tell the user "now run `node scripts/validate.js`" or "now run `/fdl-auto-evolve`" — this skill runs them itself.

---

## Phase 0: Auto-prep (runs automatically on every invocation — never skip, never ask)

Before any blueprint search or user-facing question, run the prep sequence. The user must never be asked to run these manually and must never see a "please run X then re-invoke" message. If prep fails in a way the skill cannot auto-fix, surface the specific blocker and halt — but do not delegate the prep itself back to the user.

### Step 0.1: Validate

```bash
node scripts/validate.js
```

- If exit 0 → proceed.
- If exit non-zero with schema failures → read the failures, attempt auto-fix for the ones in Step 0.3/0.4 scope, then re-run. If failures remain after one auto-fix pass, halt and report the specific blueprint + rule that can't be auto-fixed.

### Step 0.2: Completeness / secret scan

```bash
node scripts/completeness-check.js
```

- Warnings are advisory — do not halt on them.
- A secret-scan hit halts immediately (secrets in blueprints are a POPIA/IP violation, never auto-patch). Report the file and offending line; refuse to proceed.

### Step 0.3: Auto-patch capability pinning (plan-driven builds)

If invoked with `--plan <path>`, parse the plan's Appendix B (or equivalent blueprint-reference section) to get the list of blueprints the build will generate against. For each listed blueprint:

- Read the blueprint YAML.
- If `uses:` is missing or does not contain all of `code-quality-baseline`, `security-baseline`, `ai-pr-review` → patch the YAML to add the missing capability imports. Preserve existing entries; merge, do not overwrite.
- Do this silently — no prompt, no confirmation. The pinning is non-negotiable per the plan's own contract.

Example patch (conceptual, not shown to the user):

```yaml
uses:
  - code-quality-baseline
  - security-baseline
  - ai-pr-review
```

### Step 0.4: Auto-patch POPIA relation (PII-handling blueprints)

For every blueprint referenced by the plan, detect whether it handles SA personal information. Heuristics:

- Any field with type `email`, `phone`, `date` + name suggesting DOB, or `text` fields named `id_number`, `passport_number`, `national_id`, `address`, `bank_account`, `biometric*`, `palm_*`, `vein_*`, `face_*`, `fingerprint*`
- Any rule or description mentioning PII, personal information, POPIA, GDPR, data subject, biometric, KYC, AML, consent
- Any blueprint in category `auth`, `payment`, `integration` (palm-vein, card-reader), or `crm` that names a person

For each PII-handling blueprint:

- Read `related[]`. If no entry with `feature: popia-compliance` exists → add `{ feature: popia-compliance, type: required, reason: "Handles personal information of SA data subjects — must satisfy POPIA Act 4 of 2013" }`.
- If an entry exists but type is not `required` → upgrade to `required` (never downgrade).

Do this silently. POPIA linkage is mandated by CLAUDE.md Priority 1; it is not a user choice.

### Step 0.5: Re-validate after patching

```bash
node scripts/validate.js
```

If patches introduced a validation error, halt and report — the auto-patch logic has a bug that needs human attention. Do not proceed to the build with invalid YAML.

### Step 0.6: Target-directory setup (runs every time — assume new project)

Always assume the target is a **fresh project** that has never been bootstrapped. Every invocation re-runs the full bootstrap: init → install → skills → `CLAUDE.md`. This is idempotent — existing files are detected and left alone (or updated in place), never clobbered. The user must never be asked to `npm init`, install packages, drop a `CLAUDE.md`, or copy skills manually.

**Target resolution:**
- If `--path <absolute-path>` is given → that is the target.
- If `--path` is omitted → target is the current working directory.

**Bootstrap sequence (runs every time, in order):**

1. **Ensure the directory exists.** `mkdir -p <target>`. If it already exists and is non-empty with unrelated content (not `.git/`, `package.json`, `CLAUDE.md`, `.claude/`, `node_modules/`, or prior FDL output), halt and ask before writing into it — overwriting a user's existing project is destructive.
2. **Initialize `package.json` if missing.** `cd <target> && npm init -y`. Set `name` to the last path segment. If `package.json` already exists, skip (don't touch the user's manifest).
3. **Install the FDL npm package.** `cd <target> && npm install ai-fdl-kit` (or `npm install ai-fdl-kit --save-dev` if `--dev` flag set). This is the same surface a user gets from `npx ai-fdl-kit` — the published package bundles the validator, schema, templates, and skills (see `package.json#files`). If already installed at the current version, skip. Do NOT copy `blueprints/`, `scripts/`, or `schema/` from the FDL kit repo into the target; the npm install is the distribution boundary. Remote blueprints fall back to `https://theunsbarnardt.github.io/ai-fdl-kit/api/` at runtime.
4. **Copy `.claude/skills/*` into `<target>/.claude/skills/`.** This makes `/fdl-build`, `/fdl-auto-evolve`, `/fdl-create`, `/fdl-generate`, and every other FDL slash-command available natively when the user opens Claude Code in the target project — so follow-up runs don't need to trampoline through the FDL kit repo. Use the same directory-copy logic as `installClaudeSkills()` in `bin/fdl.js`: for each skill subdirectory in the package's `.claude/skills/`, create the matching dir in the target and copy every file. If a skill directory already exists in the target, skip it (don't overwrite user customizations). Report how many were copied vs. skipped.
5. **Write `<target>/CLAUDE.md`.** Generate the Claude-Code flavor of the FDL compact instructions (same content `compactInstructions()` in `bin/fdl.js` produces for `--tool claude`). Include: the three-tier blueprint lookup rules, the api-pinning contract, the anti-patterns rule, the priority/execution-order rule, and a pointer to the remote blueprint API. If `CLAUDE.md` already exists and already contains `# FDL — AI Feature Definition Language`, skip (it's up to date). If it exists but lacks the FDL section, append it delimited by `<!-- FDL:BEGIN -->` / `<!-- FDL:END -->` — never overwrite a user's existing CLAUDE.md content.
6. **Record the target in the build context.** All subsequent file writes during Phase 6 go under `<target>/<target-key>/` (or `<target>/` if only one target). Never write generated app code into the FDL kit repo or outside `<target>`.

If any step fails (network error on `npm install`, permission error on `mkdir`), halt with the specific error — do not fall through to code generation against a half-initialized target.

**Idempotency contract:** running `/fdl-build` twice against the same `--path` must not break anything or duplicate files. Every step above checks-then-acts. A re-run is safe and cheap.

### Step 0.7: Proceed

Only after 0.1–0.6 succeed, continue to Phase 1. Do not tell the user any of this happened unless something required a halt or a bootstrap step actually did work (in which case a single terse line like "Bootstrapped VenaPalm — installed ai-fdl-kit, copied 19 skills, wrote CLAUDE.md" is fine; no multi-step narration).

### Step 0.7: DESIGN.md detection (UI targets only)

After Phase 1 resolves the stack (so you know whether the build has any UI target — nextjs, react, angular, vue, svelte, flutter, react-native, expo, etc.):

1. For each target directory that will contain UI code, check whether `DESIGN.md` already exists at the target root (or at `--path` root for single-target builds).
2. If it exists → do nothing. `/fdl-generate` will read it automatically.
3. If it's missing AND the target has UI → offer once, via a single `AskUserQuestion`:
   > "No DESIGN.md found for the {target} UI. Want me to generate one so the UI matches a specific brand? (skip · generate from preset · generate from URL · generate from brief)"
   - **skip** → proceed with framework defaults. Never re-ask for this build.
   - **preset / URL / brief** → invoke `/fdl-extract-design` with the appropriate arguments, let it complete, then proceed. The generated `DESIGN.md` is picked up automatically when `/fdl-generate` runs in Phase 4.
4. Never block the build on this. If the user declines, move on.

---

## Phase 1: Parse & Confirm Intent (1 question max)

### Step 1: Extract from the description

Split the user's input into three buckets:

- **Stack** — framework, UI library, database/ORM, infrastructure
- **Features** — everything else (login, POS, approval workflow, etc.)
- **Implicit requirements** — things the user didn't say but clearly need (e.g., "POS" implies products, payments, tax, receipts)

### Step 2: Recognize technology terms

Use this lookup to classify terms from the description:

**Frameworks:**
| User says | Means |
|-----------|-------|
| next, nextjs, next.js | Next.js (App Router — not Pages Router) |
| express | Express.js |
| laravel | Laravel (PHP) |
| angular | Angular |
| react | React (Vite — not Next.js unless SSR mentioned) |
| vue, nuxt | Vue.js / Nuxt |
| svelte, sveltekit | SvelteKit |
| django | Django (Python) |
| fastapi | FastAPI (Python) |
| flask | Flask (Python) |
| go, gin | Go (Gin) |
| rust, axum, actix | Rust (Axum/Actix) |
| csharp, dotnet, aspnet | ASP.NET (C#) |
| flutter | Flutter (Dart) |
| react-native | React Native (mobile) |

**UI libraries:**
| User says | Maps to | Has blueprint? |
|-----------|---------|----------------|
| shadcn | shadcn/ui | YES — `ui/shadcn-components` + `ui/shadcn-cli` |
| material, mui | Material UI | No |
| bootstrap | Bootstrap | No |
| tailwind | Tailwind CSS (utility CSS, not a component lib) | No |
| antd | Ant Design | No |

**Databases / ORMs:**
| User says | Database choice |
|-----------|----------------|
| mongoose, mongo, mongodb | MongoDB via Mongoose |
| prisma | Prisma (ask: PostgreSQL or MySQL?) |
| drizzle | Drizzle ORM |
| typeorm | TypeORM |
| sequelize | Sequelize |
| postgres, pg | PostgreSQL (ask which ORM) |
| mysql | MySQL (ask which ORM) |
| sqlite | SQLite |
| supabase | Supabase (PostgreSQL + auth + realtime) |

### Step 3: Present interpretation for confirmation

```
I understood your request as:

STACK:
  Framework: Next.js (App Router)
  UI Library: shadcn/ui
  Database: MongoDB via Mongoose

FEATURES YOU NEED:
  - User authentication with OTP login
  - Full Point-of-Sale system (sales, payments, products, receipts)

Is this right, or should I adjust anything?
```

Use AskUserQuestion with options:
- "Yes, find the blueprints" (proceed to Phase 2)
- "I want to adjust something" (ask what to change)

**Only ask this question if the description is ambiguous.** If it's crystal clear (e.g., "nextjs pos with login"), skip confirmation and go straight to Phase 2.

---

## Phase 1.5: Load Project Config (fdl.config.yaml)

Before searching blueprints, check for a project config file. This eliminates the need to ask about tech stack on every run.

1. Try to `Read fdl.config.yaml` in the current working directory
2. If found, extract:
   - `stack.*` — framework, language, database, db_engine, ui, auth, api_style
   - `conventions.*` — import_style, test_framework, css_approach, error_handling
   - `project.name` and `project.description`
3. **Inject this into every subsequent code generation step** — skip any questions whose answers are already in the config
4. If `fdl.config.yaml` is missing, proceed normally (ask stack questions when needed)

**The config is additive.** If the user specifies something different in their request ("use MongoDB instead"), that overrides the config for this run.

---

## Phase 2: Blueprint Search & Match

### Step 1: Load the COMPLETE blueprint inventory (dynamic — never hardcoded)

**Always discover blueprints dynamically. Never rely on a hardcoded list — new blueprints can be added at any time.**

#### Source A — Local filesystem (FDL repo present)

1. Glob `blueprints/**/*.blueprint.yaml` to find ALL blueprint files on disk.
2. For each file found: read the YAML header to extract `feature`, `description`, `tags[]`, `category`, and `related[]`.
3. Also read `docs/api/registry.json` as a quick index — but local files always win over the registry if they differ.

**Why filesystem-first:** Users frequently add new blueprints via `/fdl-create`, `/fdl-extract`, etc. These files exist on disk before the registry is regenerated.

#### Source B — Remote API (no local blueprints found)

**If Glob returns 0 results** (the user is working in a new project outside the FDL repo), fall back to the public JSON API — no installation required:

1. Fetch the registry: `WebFetch https://theunsbarnardt.github.io/ai-fdl-kit/api/registry.json`
   - This returns an array of `{ feature, category, description, tags }` entries for all 180+ blueprints.
   - Use this as the full inventory for Steps 2–3 matching.
2. When a specific blueprint is needed (to read rules, outcomes, fields): fetch it individually:
   `WebFetch https://theunsbarnardt.github.io/ai-fdl-kit/api/blueprints/{category}/{feature}.json`
   - Only fetch blueprints that are actually matched and needed — don't fetch all 180.
3. Blueprints created locally during this session (via `/fdl-create`) live in memory — treat them as local overrides that take priority over the remote API.

**Why remote fallback:** Blueprints are published to GitHub Pages on every push. Any project can use `/fdl-build` without cloning the FDL repo — just point Claude at the app directory and run the command.

### Step 2: Matching algorithm (deterministic tier first, then fuzzy fallback)

For each feature keyword extracted in Phase 1, always run **Tier 0** FIRST. Only fall through to Tiers 1–3 when Tier 0 misses.

**Token efficiency: load headers first, full YAML only when needed.**
Read `blueprints/blueprint-headers.json` once at the start of Phase 1. Keys: `id` (feature name), `c` (category), `d` (one-line description), `a` (aliases), `t` (tags), `r` (related feature IDs). Use this compact index for all Tiers 0–3 matching. Only read the full `.blueprint.yaml` file for blueprints the user confirms they want — loading full YAMLs during the match phase inflates context needlessly.

**Tier 0 — Deterministic alias/name lookup (MANDATORY FIRST PASS)**

Run `node scripts/blueprint-lookup.js "<keyword>"` for each keyword. This consults the JSON index directly and matches both canonical `feature` names AND registered `aliases[]`. Exit codes:
- `0` = hit. Use the returned blueprint verbatim — do not run Tiers 1–3 for this keyword. This prevents fuzzy matching from inventing alternates when an exact alias already resolves ("sign in" → `auth/login` via alias).
- `1` = miss. Keyword is not a known feature or alias. Fall through to Tiers 1–3 below.
- `2` = INDEX missing. Stop and ask the user to run `npm run generate`.

The deterministic tier closes the failure mode where fuzzy matching picked the wrong blueprint (or failed to recognize that one existed) and let code generation invent an endpoint. If a user keyword matches any blueprint's `aliases[]` exactly (case-insensitive), that blueprint is authoritative — no further matching needed.

**Tier 1 — Exact feature name match** (against `id` field in headers)
Check if any blueprint's `id` matches the keyword exactly or with common suffix/prefix patterns:
- "login" → `id: login` (exact)
- "pos" → `id: pos-core` (prefix match)
- "expense" → `id: expense-approval` (prefix match)

**Tier 2 — Tag match** (against `t` field in headers — no YAML reads needed)
Scan every blueprint's `t` (tags) array for the keyword. Also try common synonyms:
- For the user's keyword, check if any blueprint's tags contain the keyword as a substring or exact match
- Expand with domain synonyms (e.g., "auth" → "authentication", "login", "session")
- Score by number of tag hits — more matching tags = stronger match

**This is fully dynamic.** Scanning the headers index directly — no YAML files read.

**Tier 3 — Semantic / description match** (against `d` field in headers — no YAML reads)
Scan each blueprint's `d` (description) and use domain knowledge to match concepts that don't hit on name or tags:
- If the user says "full X" (e.g., "full POS"), look at the matched blueprint's `r` (related IDs) in headers to discover the ecosystem
- If no blueprint matches a keyword at all, flag it as a GAP

### Step 3: Read `related` arrays from every matched blueprint

For each matched blueprint, read the actual YAML file and extract its `related` array. Each entry has:
- `feature` — the related blueprint's feature name
- `type` — one of: `required`, `recommended`, `optional`, `extends`
- `reason` — human-readable explanation of WHY this relation exists

Collect all related blueprints into three buckets:
- **Required** — MUST be included. The matched blueprint literally won't work without these.
- **Recommended** — SHOULD be included. The matched blueprint works without these, but the system is incomplete.
- **Optional** — COULD be included. Nice-to-have additions.

### Step 4: Scan category siblings

For each matched blueprint, list other blueprints in the **same category** that weren't already found. These become "You might also want" suggestions.

Example: If `payment/pos-core` is matched, also list `payment/invoicing-payments` and `payment/loyalty-coupons` if they weren't already found via `related` arrays.

---

## Phase 3: Disambiguate Overlapping Blueprints

**BEFORE presenting the suggestion checklist**, check if any of the matched blueprints overlap — meaning multiple blueprints could serve the same purpose.

### How to detect overlaps

- Same category + similar tags (e.g., `auth/login`, `auth/biometric-auth`, `auth/payload-auth` all have authentication-related tags)
- Same concept but different scope (e.g., `data/expense-approval` vs `workflow/odoo-expense-approval`)
- Feature name is a substring of another (e.g., `document-management` vs `payload-uploads`)

### Known overlap groups

| Concept | Options | Key difference |
|---------|---------|----------------|
| Authentication | `auth/login`, `auth/biometric-auth`, `auth/payload-auth` | Email+password vs biometric scanner vs full JWT+API key system |
| Expense approval | `data/expense-approval`, `workflow/odoo-expense-approval` | Generic vs Odoo-specific with accounting integration |
| Onboarding | `workflow/client-onboarding`, `workflow/advisor-onboarding` | Client/customer vs financial advisor |
| Collections/CRUD | `data/payload-collections`, (generic CRUD) | Payload CMS collections vs generic REST CRUD |
| Document management | `data/document-management`, `data/payload-uploads` | Full doc management with versions vs file uploads only |

### Disambiguation format

When an overlap is detected, present a comparison using AskUserQuestion with multiSelect: true:

```
I found 3 authentication blueprints. Which fits your app?

1. auth/login — Simple email + password
   Best for: Standard web apps. Most common choice.

2. auth/biometric-auth — Palm vein biometric scanner
   Best for: Kiosks, physical access, high-security environments.

3. auth/payload-auth — JWT sessions + API keys + account locking
   Best for: CMS/headless apps built on the Payload framework.

You can pick more than one if you want multiple login methods.
```

### Auto-resolve rules

Skip the question and pre-select when context makes the answer obvious:
- User said "biometric POS" → pre-select `biometric-auth`, confirm briefly
- User said "payload CMS" → pre-select `payload-auth`
- User said "simple login" or just "login" → pre-select `auth/login`
- User said "kiosk" → pre-select `biometric-auth` if available
- User mentions a specific system name (Payload, Odoo) → pick that variant

Even when auto-resolving, briefly mention: "I'm using auth/login (email + password) since you described a standard web app. Let me know if you want biometric or API-key auth instead."

---

## Phase 4: The Suggestion Checklist (FLAGSHIP INTERACTION)

This is the key UX of `/fdl-build`. Present all discovered blueprints as a **grouped, selectable checklist** that guides the user toward a complete system.

### Grouping rules

Organize blueprints into these groups, in this order:

1. **CORE** — Blueprints directly matched from the user's description. Pre-checked.
2. **REQUIRED** — Blueprints that are `related.type: required` by any CORE blueprint. Pre-checked. Show the `reason` field.
3. **RECOMMENDED** — Blueprints that are `related.type: recommended` by any matched blueprint. NOT pre-checked. Show the `reason` field.
4. **YOU MIGHT ALSO WANT** — Category siblings + `optional` relations + domain-knowledge suggestions. NOT pre-checked. Brief description only.
5. **GAPS** — Features the user mentioned but no blueprint exists for. Flagged with `!`.

### Presentation format

First, present the full list as formatted text so the user can see everything at a glance:

```
Based on your description, here's what I found in the blueprint library:

CORE (from your description):
  [x] auth/login — Email + password authentication
  [x] payment/pos-core — Sales sessions, orders, payments, receipts
  [x] ui/shadcn-components — Accessible UI component library
  [x] ui/shadcn-cli — CLI tooling for shadcn project setup

REQUIRED (needed by your core features):
  [x] auth/signup — User must exist before they can log in (required by login)
  [x] payment/invoicing-payments — POS session closing posts journal entries to accounting (required by pos-core)
  [x] data/tax-engine — Tax computation applied to every order line (required by pos-core)

RECOMMENDED (will make your app more complete):
  [ ] auth/password-reset — Users will forget passwords (recommended by login)
  [ ] auth/logout — End user session and clear tokens
  [ ] auth/email-verification — Verify email ownership before account is fully active
  [ ] payment/loyalty-coupons — Rewards, discounts, and promotions for POS orders
  [ ] data/product-configurator — Product attributes, variants, and dynamic pricing

YOU MIGHT ALSO WANT:
  [ ] ui/self-order-kiosk — Customer self-ordering terminals for your POS
  [ ] ui/ecommerce-store — Full online storefront with cart and checkout
  [ ] data/bank-reconciliation — Reconcile POS payments with bank statements
  [ ] workflow/automation-rules — Event-driven automation triggers

GAPS (no blueprint exists yet):
  ! OTP / one-time-password login — not in the blueprint library
```

Then use AskUserQuestion with multiSelect: true to let the user select which RECOMMENDED and YOU MIGHT ALSO WANT items to include. List all non-pre-checked items as selectable options.

### Opinionated guidance rules

Be an advisor, not just a list presenter. Add warnings and explanations:

**Missing foundation warnings (driven by `related` arrays):**

The primary source for these warnings is the `related` array in each selected blueprint. If a blueprint declares a `required` or `recommended` relation to another blueprint, and that target is NOT in the user's selection, warn them using the `reason` field from the relation.

For example, if `payment/pos-core` declares:
```yaml
related:
  - feature: tax-engine
    type: required
    reason: "Tax computation applied to every order line"
```
...and the user hasn't selected `tax-engine`, warn: "POS order totals won't include tax — tax-engine is required by pos-core because: Tax computation applied to every order line."

**This is fully dynamic.** If someone adds a new blueprint with a `related: required` entry, the warning appears automatically. No hardcoded warning table to maintain.

**Additional domain-knowledge warnings:**

Beyond what `related` arrays declare, apply these general principles:
- If ANY feature requires authentication (check its rules/outcomes for auth references) but no auth blueprint is selected → warn and suggest adding auth
- If auth blueprints are selected but no logout → warn about missing session termination
- If data/backend features are selected but no UI blueprints → ask if UI suggestions are wanted
- If multiple auth methods are selected → note they'll share a unified session system

**Anti-pattern warnings:**

- Auth without email-verification → "Unverified emails mean fake accounts and no recovery path"
- Multiple auth methods but no unified session handling → "I'll ensure these share a single session system"
- Any feature with security rules but auth not selected → "This feature needs authentication — adding it"

### Required relation enforcement

If the user unchecks a `required` relation, warn them specifically:

```
pos-core REQUIRES tax-engine — without it, order totals won't include tax and the accounting integration will break. Are you sure you want to remove it?
```

Use AskUserQuestion:
- "Keep it (you're right)" (re-add it)
- "Remove it anyway (I'll handle tax myself)" (respect the choice)

### Second round of suggestions

After the user makes their selection, check if any NEWLY selected blueprints have their own `related` blueprints that weren't shown in the first round.

- If 3+ new suggestions emerge, present a brief second-round checklist
- If 1-2 new suggestions, mention them in text: "Since you added loyalty-coupons, you might also want automation-rules for triggering promotions automatically."
- **Maximum 2 suggestion rounds.** After the second round, proceed regardless.

---

### Ultraplan checkpoint (optional)

For complex builds (10+ features selected, or when the user explicitly asks), offer to refine the plan with ultraplan before resolving gaps:

> "This is a large build with {N} features and {M} gaps. Would you like to review the full feature list with ultraplan on Claude Code on the web? You can comment on individual features, flag concerns, and adjust selections visually — then return here to continue."

If the user accepts, launch `/ultraplan` with the confirmed checklist, gap list, and dependency relationships. When the user approves in the browser and sends the plan back to the terminal, resume at Phase 5 with any adjustments applied.

If the user declines or the build is small, proceed normally.

---

## Phase 5: Resolve Gaps

For each feature that has NO matching blueprint (shown as GAPS in the checklist), present resolution options.

### Gap resolution format

```
"OTP login" doesn't have a blueprint yet. How would you like to handle it?
```

Use AskUserQuestion:
- **"Create from scratch"** — Invoke `/fdl-create otp-login auth` inline. Let it ask its 1-2 questions about the feature (SMS vs email OTP, code length, expiry time, etc.), generate the blueprint, then continue with the build. The new blueprint is added to the generation list.
- **"Extract from documentation"** — Ask for a URL or file path. If URL, invoke `/fdl-extract-web <url>`. If file, invoke `/fdl-extract <file-path>`. Get the blueprint, add to generation list.
- **"Extract from existing code"** — Ask for a local folder path or git repo URL. Invoke `/fdl-extract-code <path>`. Get the blueprint, add to generation list.
- **"Skip for now"** — Exclude from generation. Note it as a TODO in the final summary so the user remembers to come back to it.

### Delegation rules for gap resolution

When delegating to another skill:
1. Let the delegated skill run its full conversation flow (it may ask 1-2 questions)
2. Once the blueprint is created and validated, resume the build flow
3. Add the new blueprint to the generation list in the correct dependency position
4. If the new blueprint declares `related` entries, check if any new required dependencies were introduced

---

## Phase 6: Generation Plan & Execution

### Step 1: Build dependency order

Read `related` arrays from ALL selected blueprints. Build a dependency graph:
- `required` relations = **hard dependencies** (generate dependency FIRST)
- `recommended` and `optional` relations = **no ordering constraint** (can be generated in any order)

Topologically sort the graph. If cycles exist (rare), break at the `optional` edge.

### Step 2: Present the generation plan

```
GENERATION PLAN (Next.js + shadcn + Mongoose):

  Order  Feature                    Depends on
  ─────  ─────────────────────────  ──────────────────────
  1      auth/signup                (none — foundation)
  2      auth/login                 signup
  3      auth/otp-login             login (NEW blueprint)
  4      auth/password-reset        signup
  5      auth/logout                login
  6      data/tax-engine            (none)
  7      data/product-configurator  (none)
  8      payment/invoicing-payments (none)
  9      payment/pos-core           invoicing-payments, tax-engine
  10     payment/loyalty-coupons    pos-core
  11     ui/shadcn-components       (none — UI foundation)

  Database: MongoDB via Mongoose (applied to all)
  UI Library: shadcn/ui

Ready to generate? Or adjust the order/selection?
```

Use AskUserQuestion:
- "Generate all" (proceed)
- "I want to adjust" (ask what to change)
- "Refine with ultraplan" (send the full generation plan to Claude Code on the web for browser-based review — see Ultraplan Integration below)

### Step 2.5: Smart Questions (automatic when any blueprint has `agi` section)

After presenting the generation plan, scan all selected blueprints for `agi` sections. If ANY blueprint has one, automatically ask plain-English questions before generating code.

**CRITICAL: The user knows NOTHING about AGI, YAML, schemas, or blueprints. NEVER use technical terms like autonomy, invariants, acceptance tests, deprecation, tradeoffs, monitoring, or AGI. Write questions like you're talking to a business owner.**

**Collect data across all selected blueprints:**
- Gather all `agi.autonomy` entries
- Gather all `agi.tradeoffs` entries  
- Count total `agi.verification.acceptance_tests` and `agi.verification.invariants`
- Gather all `agi.evolution.deprecation` entries

**Ask these questions using AskUserQuestion (skip any that don't apply):**

**Question 1 — Control** (if any blueprint has `agi.autonomy`):
"How much control do you want over the system?"
- "Handle everything automatically"
- "Let it run but I want to review important actions like: {rewrite human_checkpoints in plain English}"
- "I want to approve every step"

Example: if human_checkpoints says "before disabling an account permanently" → "Let it run but I want to review things like disabling accounts"

**Question 2 — What matters most** (if any blueprint has `agi.tradeoffs`):
"What matters more for your app?"
- Translate each tradeoff into a plain-English option. Example:
  - `prefer: security, over: performance` → "Maximum security even if slightly slower (recommended)"
  - The other side → "Fastest possible speed, standard security"
- Don't say "tradeoff" — just present the choices naturally

**Question 3 — Quality checks** (if any blueprint has `agi.verification`):
"Your features come with {N} built-in quality checks. Want me to generate test code to make sure everything works correctly?"
- "Yes — include the tests"
- "No — just build the features"

**Question 4 — Newer alternatives** (if any blueprint has `agi.evolution.deprecation`):
Translate each deprecation into plain English and ask:
"Some options have newer replacements available:"
- For each: "'{field}' → {rewrite migration in plain English}. Use the newer way?"

Example: `field: remember_me, migration: "use refresh token rotation"` → "The 'remember me' checkbox is being replaced with a smarter system that keeps you logged in automatically. Want me to use the newer approach?"

**Question 5 — Safety** (if any blueprint has `agi.safety.action_permissions`):
Collect all action_permissions across selected blueprints and present a summary:

"Some actions have special permission levels:"
- For each action: describe in plain English (e.g., "Adjusting prices — runs automatically, at most once every 6 hours")
- Then ask: "Does this look right?"
  - "Looks good"
  - "I want more control" (upgrade all permission levels one step)
  - "I want less control" (downgrade all permission levels one step)

**Question 6 — Logging** (if any blueprint has `agi.explainability`):
"Your features can keep a detailed log of every decision they make. Want to turn on decision logging?"
- "Yes — log everything"
- "Just the important ones" (use only `audit_events`)
- "No logging needed"

**How answers shape generation (internal — don't explain to user):**
- Control → generates approval screens or fully automated flows
- Priority → shapes code decisions (security-first, speed-first, etc.)
- Quality checks → if yes, generates test files from acceptance_tests and invariants
- Newer alternatives → uses modern patterns or keeps old ones
- Safety → generates permission checks, approval gates, and cooldown enforcement per action
- Logging → generates audit middleware or decision logging based on audit_events
- **Always silently apply:** monitoring → health checks, boundaries → execution order, goals → code comments, evolution triggers → TODO comments, coordination exposes/consumes → interface/dependency comments, learning signals → monitoring comments, learning adaptations → experiment TODO comments

**If NO selected blueprint has an `agi` section, skip all of this silently.**

### Step 3: Generate shared infrastructure

Before generating individual features, create the project scaffolding:

- **Database connection module** — single connection file shared by all features (e.g., `src/lib/db.ts` for Mongoose)
- **Auth middleware** — if any auth features are selected, create the middleware that protects routes
- **Shared types file** — start with common types (User, Session, ApiResponse, etc.)
- **Base layout** — if frontend framework, create root layout with providers (auth, theme, etc.)
- **Environment config** — `.env.example` with all required environment variables
- **Package dependencies** — consolidated `package.json` additions

### Step 4: Generate each feature

For each blueprint in dependency order, apply the same generation approach as `/fdl-generate`:

1. **Read the blueprint YAML** — load the full file
2. **Read outcomes** sorted by `priority` (lower = check first) — these are acceptance criteria
3. **Read rules** — these are constraints (security, business logic)
4. **Read fields** — these are the data model
5. **Read errors** — these are error responses
6. **Generate code** that satisfies ALL outcomes using the target framework's idiomatic patterns
7. **Track generated files** — maintain a running list so the next feature can import from previous ones

**Critical: Import, don't duplicate.** Before generating a type/model/service, check if a previous feature already created it. If login created a `User` model, signup MUST import it — not create a new one.

**Critical: Consistent patterns.** All features use the same:
- Error handling pattern
- Validation library (pick once: Zod, Joi, Yup, etc.)
- API response format
- Auth checking approach
- Code style and conventions

### Step 5: Show progress

After each feature is generated, show brief progress:

```
[1/11] auth/signup ✓ — 5 files
[2/11] auth/login ✓ — 5 files
[3/11] auth/otp-login ✓ — 4 files (NEW blueprint)
[4/11] auth/password-reset ✓ — 4 files
[5/11] auth/logout ✓ — 3 files
[6/11] data/tax-engine ✓ — 4 files
[7/11] data/product-configurator ✓ — 6 files
[8/11] payment/invoicing-payments ✓ — 6 files
[9/11] payment/pos-core ✓ — 8 files
[10/11] payment/loyalty-coupons ✓ — 5 files
[11/11] ui/shadcn-components ✓ — setup complete
```

### Step 6: Cross-feature integration glue

After all individual features are generated, create the integration layer:

- **Navigation component** — links to all generated pages/routes
- **Route protection** — auth middleware applied to routes that need it
- **Type consolidation** — if multiple features created overlapping types, merge into shared module
- **Event bus setup** — if multiple features emit events, create a shared event system
- **Error handling** — unified error boundary / error handler that knows all error codes

---

## Phase 7: Final Summary

Present the complete build result:

```
BUILD COMPLETE: POS App (Next.js + shadcn + Mongoose)

FILES GENERATED: 47 files across 11 features

FEATURES:
  ✓ auth/signup — User registration
  ✓ auth/login — Email + password login
  ✓ auth/otp-login — One-time password login (NEW blueprint)
  ✓ auth/password-reset — Password recovery
  ✓ auth/logout — Session termination
  ✓ data/tax-engine — Tax computation
  ✓ data/product-configurator — Product catalog
  ✓ payment/invoicing-payments — Invoicing lifecycle
  ✓ payment/pos-core — Point-of-sale
  ✓ payment/loyalty-coupons — Rewards & discounts
  ✓ ui/shadcn-components — UI components

INTEGRATION:
  ✓ Shared MongoDB connection (src/lib/db.ts)
  ✓ Auth middleware (src/middleware.ts)
  ✓ Root layout with providers (src/app/layout.tsx)
  ✓ Navigation component (src/components/nav.tsx)
  ✓ Shared types (src/lib/types/)

NEEDS YOUR WORK:
  ⚠ Environment variables — copy .env.example to .env and fill in:
    - MONGODB_URI (your MongoDB connection string)
    - OTP_PROVIDER_KEY (SMS/email service API key)
    - PAYMENT_PROVIDER_KEY (Stripe/etc. API key)
    - JWT_SECRET (generate a random 64-char string)

SKIPPED (come back to these later):
  ○ (none — or list any features the user chose to skip)

NEXT STEPS:
  1. cp .env.example .env  (then fill in credentials)
  2. npm install
  3. npm run dev
  4. Visit http://localhost:3000

BLUEPRINTS CREATED: 1 new blueprint
  - blueprints/auth/otp-login.blueprint.yaml (created during this build)
```

---

## Phase 8: System Documentation (MANDATORY — never skip)

After all code is generated and the summary is shown, produce comprehensive documentation for the entire system. This is NOT optional — every build ends with documentation.

### Step 1: Create `SYSTEM.md` in the project root

This is the master document. It covers:

```markdown
# {App Name} — System Documentation

## Architecture Overview
- High-level description of the system
- Tech stack: framework, database, UI library, key packages
- Folder structure diagram (generated from the file manifest)

## Features
For each feature, document:
- What it does (plain English)
- Which blueprint powered it
- Key files generated
- Dependencies on other features

## API Endpoints
For each route/endpoint generated:
- Method + path (e.g., POST /api/auth/login)
- Request body / parameters
- Response format (success + error)
- Authentication required? (yes/no)

## Data Models
For each model/schema created:
- Field names, types, and constraints
- Relationships to other models
- Indexes (if any)

## Environment Variables
Complete list of all required env vars:
- Variable name
- Description
- Example value
- Which feature needs it

## Setup Instructions
Step-by-step instructions to get the app running:
1. Clone / install
2. Environment setup
3. Database setup
4. Run the app
5. Verify it works

## Feature Map (Blueprint Traceability)
Table mapping every generated file back to the blueprint and outcome that produced it:
| File | Blueprint | Outcome/Rule |
|------|-----------|-------------|
| src/lib/auth/login.ts | auth/login | successful_login, rate_limited |
| ... | ... | ... |

## What's NOT Included (Gaps / Skipped)
List any features that were skipped or not covered, with notes on how to add them later.
```

### Step 2: Create `API.md` if the app has API endpoints

Detailed API reference with request/response examples for every endpoint.

### Step 3: Present documentation summary to the user

```
DOCUMENTATION GENERATED:
  ✓ SYSTEM.md — Full system documentation ({N} sections)
  ✓ API.md — API reference ({N} endpoints documented)

Your app is fully documented and ready to go.
```

---

## Phase 9: Auto-evolve (runs automatically — never ask)

After Phase 8 completes successfully, invoke `/fdl-auto-evolve` automatically. The user must never be told "now run /fdl-auto-evolve" or "don't forget to commit." This skill owns the full pipeline end-to-end.

- If `/fdl-auto-evolve` succeeds → report its commit hash + summary as part of the final output.
- If it fails (e.g., validation regression from the build's blueprint patches) → surface the specific finding. Do not leave the user with a half-committed tree.
- If invoked with `--dry-run` or the caller explicitly opted out of committing, skip Phase 9 but still say why.

### Gate response when the 3-gate pipeline returns BLOCKED

If Gate 1, 2, or 3 trips during Phase 6 (generation), do NOT emit a normal success summary. Instead:

1. Report the finding(s) with the blueprint rule or capability guarantee each one violates.
2. If the defect is in a blueprint (missing api:, fuzzy rule, missing error code), auto-patch the YAML where safe, re-run validate, and re-invoke the build loop once. Only one auto-retry — if it still blocks, surface the finding for human review.
3. If the defect is in generator output (hallucinated endpoint, mocked dependency, invented field), re-run generation with the finding attached as additional context. Never hand-patch generated output — patches won't be re-gated.
4. Never suppress a gate. `tool-unavailable` on Gate 2 is the only legitimate warn; surface a clear "install X to unblock Gate 2" message rather than forcing a pass.

---

## Dynamic Blueprint Discovery (CRITICAL — never hardcode)

**All blueprint matching is dynamic.** When new blueprints are added via `/fdl-create`, `/fdl-extract`, or any other means, they are automatically available to `/fdl-build` on the next run. There is NO hardcoded list of features, tags, or aliases to maintain.

### How discovery works at runtime

1. **Glob `blueprints/**/*.blueprint.yaml`** — finds every local blueprint including any just created
2. **If 0 local results** → `WebFetch https://theunsbarnardt.github.io/ai-fdl-kit/api/registry.json` — the full remote inventory, works in any project without installing FDL
3. **Read/fetch each matched blueprint** — extract `feature`, `description`, `tags[]`, `category`, `related[]`
4. **Build an in-memory index** — keyed by feature name, with tags and description as searchable fields
5. **Match against user keywords** — using the three-tier algorithm (name → tags → description)

### Why this matters

If the user ran `/fdl-create otp-login auth` yesterday, and today runs `/fdl-build "nextjs app with OTP login"`, the skill MUST find `auth/otp-login` automatically. It should never say "OTP is a gap" when a blueprint for it exists on disk.

### Technology alias map (static — these are stack terms, not blueprints)

Framework and database terms are NOT blueprints — they describe the tech stack. These aliases are stable:

**Frameworks:** next/nextjs → Next.js, express → Express.js, laravel → Laravel, angular → Angular, react → React, vue/nuxt → Vue/Nuxt, svelte/sveltekit → SvelteKit, django → Django, fastapi → FastAPI, go/gin → Go, rust/axum/actix → Rust, csharp/dotnet → ASP.NET, flutter → Flutter, react-native → React Native

**Databases:** mongoose/mongo → MongoDB, prisma → Prisma, drizzle → Drizzle, postgres → PostgreSQL, mysql → MySQL, sqlite → SQLite, supabase → Supabase

**UI libraries:** shadcn → shadcn/ui, material/mui → Material UI, bootstrap → Bootstrap, tailwind → Tailwind CSS, antd → Ant Design

### Dynamic synonym expansion

When matching user keywords to blueprints, expand synonyms using domain knowledge:
- "auth" → also search for "authentication", "login", "session", "jwt"
- "pos" → also search for "point-of-sale", "sales", "checkout", "register"
- "ecommerce" → also search for "store", "shop", "cart", "catalog"
- etc.

But do NOT hardcode which blueprint these map to. Let the tag/name/description search find the right ones dynamically. If someone adds a new `auth/sso-login` blueprint with tag "authentication", it will be found automatically.

---

## Dynamic Disambiguation

When multiple blueprints match the same user keyword, ALWAYS disambiguate before proceeding.

### How to detect overlaps (dynamically)

After running the three-tier matching algorithm, check if a single user keyword matched **2+ blueprints in the same category** or **2+ blueprints with overlapping tags**. These are overlaps that need disambiguation.

**Do NOT maintain a hardcoded list of known overlaps.** Detect them at runtime:
1. Group all matched blueprints by the user keyword that found them
2. If a keyword matched 2+ blueprints, it's an overlap
3. Read each overlapping blueprint's `description` to understand the difference

### Disambiguation presentation

For each overlap group, present a comparison using each blueprint's own `description` field:

```
I found {N} blueprints for "{keyword}". Which fits your app?

1. {category}/{feature} — {first line of description}
   Best for: {infer from description and tags}

2. {category}/{feature} — {first line of description}
   Best for: {infer from description and tags}

You can pick more than one if you want to combine them.
```

Use AskUserQuestion with multiSelect: true.

### Auto-resolve rules (skip the question when context is clear)

- User mentions a **specific system name** that appears in a blueprint's description or tags (e.g., "Payload", "Odoo", "Electrum") → pick that variant, confirm briefly
- User says "simple" or "basic" → pick the blueprint with the shortest description / fewest features
- User says "full" or "complete" → pick the blueprint with the most comprehensive description
- Only one blueprint's description actually matches the user's use case → pick it, confirm briefly

Even when auto-resolving, briefly mention your choice so the user can correct it.

---

## Delegation Rules

How `/fdl-build` delegates to other FDL skills:

| Situation | Delegate to | How |
|-----------|-------------|-----|
| Gap: user chooses "create from scratch" | `/fdl-create <feature> <category>` | Invoke the skill. Let it run its 1-2 question conversation. Get the blueprint. Resume build. |
| Gap: user has a requirements document | `/fdl-extract <file-path>` | Invoke with the file path. Let it extract. Get the blueprint. Resume build. |
| Gap: user has a documentation URL | `/fdl-extract-web <url>` | Invoke with the URL. Let it crawl and extract. Get the blueprint. Resume build. |
| Gap: user has existing code | `/fdl-extract-code <path>` | Invoke with the path/repo URL. Let it analyze. Get the blueprint. Resume build. |
| User wants to discover features in code | `/fdl-extract-code-feature <path>` | For discovery only — presents a feature menu from the codebase. Not part of main build flow. |
| Code generation for each feature | Apply `/fdl-generate` approach directly | Do NOT invoke as a separate skill (would lose context). Instead, follow the same outcome-driven generation approach: read blueprint, generate code for framework. This preserves knowledge of previously generated files and enables cross-feature imports. |

### Important: Inline generation, not skill delegation

For the actual code generation step, do NOT literally call `/fdl-generate` as a separate skill invocation. This would lose the context of:
- Previously generated files (needed to prevent duplicates)
- Shared types already created
- Database connection module location
- Auth middleware location
- The user's stack choices

Instead, apply the same generation approach that `/fdl-generate` uses (read outcomes, translate to code) but within the build context where you have full knowledge of what's already been generated.

---

## Multi-Blueprint Generation Rules

These rules apply when generating multiple features in sequence. They prevent the common problems of multi-feature generation: duplicated code, inconsistent patterns, and missing integration.

### Rule 1: Shared infrastructure first

Before generating any feature-specific code, create:
- Database connection module (`src/lib/db.ts` or equivalent)
- Auth middleware (if any auth features are selected)
- Shared types file (`src/lib/types/index.ts` or equivalent)
- Base layout (if frontend framework — root layout with providers)
- Environment config (`.env.example` with all required variables)
- Package.json additions (all dependencies for all features)

### Rule 2: Import, don't duplicate

Before generating any type, model, or service, check if a previous feature already created it:
- If login created `User` model → signup MUST import it
- If signup created `validateEmail()` → login MUST import it
- If pos-core created `Order` type → invoicing-payments MUST import it

Maintain a running registry of all exports from all generated files.

### Rule 3: Consistent patterns across all features

Pick these choices ONCE and apply to ALL features:
- Validation library (Zod, Joi, Yup — pick one)
- Error handling pattern (error codes + messages format)
- API response format (`{ success, data, error }` or similar)
- Auth checking approach (middleware vs per-route vs decorator)
- State management approach (if frontend)
- Code style (named exports vs default, async/await vs promises)

### Rule 4: Track all generated files

After generating each feature, add its files to a running manifest:
```
GENERATED FILES:
  src/lib/db.ts                     (shared — database connection)
  src/lib/types/user.ts             (shared — User type)
  src/lib/types/session.ts          (shared — Session type)
  src/lib/auth/signup.ts            (auth/signup — business logic)
  src/app/(auth)/signup/page.tsx    (auth/signup — page)
  src/app/(auth)/signup/actions.ts  (auth/signup — server actions)
  src/components/auth/SignupForm.tsx (auth/signup — form component)
  src/lib/auth/login.ts             (auth/login — business logic)
  ...
```

Use this manifest to:
- Prevent duplicate file creation
- Enable cross-feature imports
- Build the final summary

### Rule 5: FDL trace comments

Every generated file includes trace comments back to the blueprint:
```typescript
// FDL: auth/login — business logic
// FDL outcome: rate_limited (priority: 1)
// FDL outcome: account_locked (priority: 2)
// FDL outcome: invalid_credentials (priority: 4)
// FDL outcome: successful_login (priority: 10)
```

---

## Non-Negotiable Rules

1. **PLAN BEFORE CODE — ABSOLUTE GATE.** Before writing a SINGLE line of code, you MUST: (a) read all blueprints from disk, (b) match the best ones to the user's request, (c) write a full plan with grouped suggestions (core, required, recommended, optional), (d) present missing blueprint suggestions (gaps), and (e) get explicit user approval on the plan. NO CODE until the plan is approved. This is the #1 rule.
2. **Document the entire system at the end.** After all code is generated, produce comprehensive system documentation covering: architecture overview, all features and how they connect, API endpoints, data models, environment variables, setup instructions, and a feature map showing which blueprints powered which parts of the system.
3. **Security constraints are mandatory.** If a blueprint says `constant_time: true`, use bcrypt.compare — not `===`. If it says `generic_message: true`, return identical errors for wrong-user and wrong-password. No exceptions.
4. **Every outcome must have a code path.** If the blueprint says it can happen, the generated code must handle it.
5. **Blueprint values are authoritative.** If a blueprint says `max_attempts: 5`, use 5. Don't substitute your own values.
6. **Never show YAML.** Everything is plain English. The user doesn't know blueprints exist.
7. **Always explain WHY.** Every suggestion has a reason. Not "Adding tax-engine" but "Adding tax-engine because POS order lines need tax computation — without it, totals will be wrong."
8. **Respect the user's final choices.** After warning about missing features, accept if the user says skip. Warn once, then move on. Don't nag.
9. **Maximum 2 suggestion rounds.** Don't keep discovering new suggestions endlessly. Two rounds of the checklist, then proceed to generation.
10. **Generate working code.** The output should run after `npm install && npm run dev` (or equivalent). Include all imports, config files, and integration glue.
11. **Add FDL trace comments.** Every generated file has `// FDL: {feature}/{outcome}` comments for traceability.
12. **Outcomes over flows.** When a blueprint has both outcomes and flows, generate code from outcomes. Flows are for human documentation.
13. **`api:` block is the wire contract — emit it verbatim.** When a blueprint declares an `api:` section, the generated HTTP endpoint MUST use `api.http.method` and `api.http.path` exactly as written. No alternate paths, no renamed methods, no additional endpoints beyond those the blueprint declares. The request body must match `api.request.schema`. The success response must match `api.response.success.schema`. Error responses must use the `status` + `error_code` pairs in `api.response.errors[]`. This is how yesterday's fake endpoint (`/signin` invented when `/auth/login` existed) is prevented.
14. **If a blueprint lacks `api:` but needs an HTTP surface, STOP and ask the user to add one before generating code.** Do not improvise the method/path/schema. Offer to populate `api:` by invoking `/fdl-create` in edit mode, or accept a user-provided value. Never emit an endpoint whose shape was guessed rather than pinned.
15. **`anti_patterns:` are binding, not advisory.** When a blueprint has an `anti_patterns:` block, read every entry before generating code. Each entry's `rule` is a hard constraint — violating it is a generation defect. Cite the relevant rule in code comments when a given line exists specifically to honor an anti-pattern (e.g., `// FDL anti-pattern: do not use == for password comparison — using bcrypt.compare`).
16. **Deterministic lookup before fuzzy matching.** Always run `scripts/blueprint-lookup.js` for every user keyword before any tag/description inference. If the deterministic lookup hits on a feature name or alias, that result is authoritative — do not run fuzzy matching for that keyword.

---

## Ultraplan Integration

[Ultraplan](https://code.claude.com/docs/en/ultraplan) hands a planning task from the CLI to Claude Code on the web for browser-based review. The user gets inline comments, emoji reactions, and an outline sidebar — a richer review surface than the terminal.

### When to offer ultraplan

- **Automatically** when the build has **10+ selected features** or **3+ gaps** — the checklist is complex enough that inline browser review adds real value
- **Always** when the user explicitly asks (e.g., "ultraplan this", "let me review in the browser")
- **Never force it** — ultraplan is always an option alongside the standard CLI flow

### Two integration points in `/fdl-build`

1. **After Phase 4 checklist confirmation** — send the confirmed feature list, gap list, and dependency relationships to ultraplan. The user reviews feature selections visually, comments on individual items ("Why is tax-engine required?"), and adjusts. When approved, resume at Phase 5 with any changes applied.

2. **At Phase 6 Step 2 generation plan** — send the dependency graph, build order, and integration notes to ultraplan. The user reviews sequencing, flags integration concerns, and adjusts order. When approved, resume at Phase 6 Step 3 for code generation.

### What gets sent to ultraplan

Structure the plan as a markdown document with clear sections:

```markdown
# Build Plan: {app description}

## Tech Stack
- Framework: {framework}
- Database: {database}
- UI Library: {ui library}

## Selected Features ({N} total)

### Core Features
- [ ] auth/login — Email/password authentication
- [ ] auth/signup — User registration
...

### Required Dependencies
- [ ] data/tax-engine — Required by pos-core for order totals
...

### Recommended Additions
- [ ] notification/email-notifications — Recommended for signup confirmation
...

### Gaps (no blueprint exists)
- [ ] otp-login — Needs creation or extraction
...

## Dependency Graph
1. auth/signup (no deps)
2. auth/login → signup
3. payment/pos-core → tax-engine
...

## Integration Notes
- Login middleware protects all /api routes
- POS shares the tax-engine with invoicing
```

### How to resume after ultraplan

When the plan returns from the browser (either via "Approve plan and teleport back to terminal" or by the user choosing to implement locally):
1. Parse any adjustments — features added/removed, gaps resolved, order changes
2. Update the internal feature list and dependency graph
3. Resume at the appropriate phase (Phase 5 if gaps remain, Phase 6 if ready to generate)
