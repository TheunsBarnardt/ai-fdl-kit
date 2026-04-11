---
name: fdl-generate
description: Generate implementation code from an FDL blueprint for a specific framework
user_invocable: true
command: fdl-generate
arguments: "<feature> <framework>"
---

# FDL Generate — Code Generation from Blueprints

Generate a complete implementation from an FDL blueprint. Your job is to produce code that **satisfies every outcome** in the blueprint. The outcomes tell you WHAT must be true — you decide HOW to implement it for the target framework.

## Usage

```
/fdl-generate login nextjs
/fdl-generate signup laravel
/fdl-generate password-reset express
/fdl-generate login angular
/fdl-generate signup csharp
/fdl-generate expense-approval rust
```

## Arguments

- `<feature>` — The blueprint feature name (e.g., `login`, `signup`, `password-reset`)
- `<framework>` — Target language or framework (e.g., `nextjs`, `express`, `laravel`, `angular`, `csharp`, `rust`, `python`, `go`, `flutter`, or any other)

## How to Think About Code Generation

**DO NOT treat this as a recipe to follow step by step.**

Instead, think of it like this:
1. Read the `outcomes` — these are your acceptance criteria, sorted by `priority` (lower = check first)
2. Read the `rules` — these are your constraints (security, business logic)
3. Read the `fields` — these are your data model
4. Read the `errors` — these are the error responses you must return
5. Now write the code that makes ALL of it true, using the best patterns for the target framework

The blueprint tells you WHAT. You decide HOW based on the framework.

## Step 0a: Detect and Extract External Inputs

**Before** loading the blueprint, scan the user's raw prompt for auxiliary inputs. When an input is present, delegate to a specialist skill to extract it — do NOT try to parse Figma files, OpenAPI specs, or Postman collections yourself.

This layer is **optional**. If no input is detected, skip this step entirely and proceed to Step 0. If an input is detected but the delegate skill is unavailable, fall back gracefully — never crash.

### Source detection table

| Indicator in prompt | Input type | Delegate | Fallback if missing |
|---|---|---|---|
| `figma.com/` or `figma.design/` URL | Figma design | `figma-extract-tokens` + `figma-use` (Figma MCP plugin) | Print "Figma MCP not installed. Install the Figma plugin or pass the design as an image." and continue with blueprint only |
| `openapi.json`, `swagger.json`, `/api-docs`, or `.yaml`+OpenAPI keywords | OpenAPI / REST spec | `/fdl-extract-web` | Continue with blueprint only |
| GitHub URL or local folder path that isn't a blueprint | Existing codebase | `/fdl-extract-code` | Continue with blueprint only |
| `.pdf`, `.docx`, `.pptx` path or link | Document spec | `/fdl-extract` | Continue with blueprint only |
| An image attachment in the message | Design screenshot | Built-in `Read` on the image (Claude vision) | None needed — always available |
| Nothing recognized | — | Skip Step 0a | — |

### Figma path (canonical example)

When the prompt contains a Figma URL:

1. **Extract design tokens** — call `figma-extract-tokens` on the selected frame. Expect back `{ colors, typography, spacing, radius, shadows }`, often pre-mapped to Tailwind classes.
2. **Extract component structure** — call `figma-use` / `get_variable_defs` on the same selection to get the component tree (input fields, buttons, labels, images, layout).
3. **Build the context bundle** (see below) from the combined output.

If the Figma MCP plugin is not installed, the call will fail. **Catch the failure gracefully**:
```
⚠ Figma MCP not installed. Install the Figma plugin or pass the design as an image.
Proceeding with blueprint-only generation.
```
Then continue to Step 0 as if no input were provided.

### Other input paths

- **OpenAPI** — invoke `/fdl-extract-web <url>` first. Its output is a blueprint-shaped object. Use its `fields`, `rules`, and `errors` to augment the blueprint context.
- **Existing code** — invoke `/fdl-extract-code <path>` first. Use its extracted fields / outcomes as hints for what the user already expects.
- **Document spec** — invoke `/fdl-extract <path>` first. Same merge rules.
- **Attached image** — read the image with the built-in Read tool. The model describes layout, colors, and components in natural language. Use the description to populate `extracted.layout`.

### Context bundle shape

The output of this phase is an in-memory object — **not** a file, not a blueprint edit — that gets merged into the blueprint context used by Steps 1–4:

```
extracted = {
  design_tokens: { colors, typography, spacing, radius, shadows },  // → Tailwind/CSS vars
  fields: [...],                                                     // → reconciled with blueprint.fields
  layout: { component_tree, order, grouping },                       // → ui_hints at runtime
  source: "figma" | "openapi" | "code" | "document" | "image",
  source_url_or_path: "..."                                          // for audit comments in generated code
}
```

### Merge rules (critical)

When Step 1 starts generating code, reconcile `extracted` with the blueprint:

1. **Security and behavior rules come from the blueprint. ALWAYS.** A Figma mock showing a "Stay logged in forever" checkbox does NOT override `session.refresh_token.expiry_days: 7`. The blueprint wins on anything under `rules`, `outcomes`, or `errors`.
2. **Visual styling comes from `extracted.design_tokens`.** Blueprint `ui_hints` are a floor; Figma tokens override them for colors, spacing, typography. Write these into generated CSS / Tailwind classes / CSS variables.
3. **Field labels / placeholders / order come from `extracted`** when present, blueprint otherwise.
4. **Field additions require user approval.** If `extracted.fields` has a field not in `blueprint.fields`, stop and ask via AskUserQuestion: *"The design has a '{name}' field but the {feature} blueprint doesn't define it. Skip it or add it to the generated code?"*. Never silently add or drop fields.
5. **Field removals require user approval** — same rule in reverse. If the blueprint has a required field the design doesn't show, ask before hiding it.
6. **Add an audit comment to every generated file** so the source is traceable:
   ```
   // FDL: feature=login  blueprint=blueprints/auth/login.blueprint.yaml  source={extracted.source}={extracted.source_url_or_path}
   ```

## Step 0b: Stack-Companion Skill Detection

**You MUST run this step on every invocation, automatically.** Scan the lowercased raw prompt for any of the keywords in the table below. For every hit, add a `stack_companion` entry to the context bundle and surface it in the final summary. **DO NOT ask the user "should I use shadcn?" — if they named it, they want it.**

### Trigger table (authoritative)

| Keyword in prompt | Stack type | Skill URL | Install command | Generation hints |
|---|---|---|---|---|
| `shadcn`, `shadcn/ui`, `shadcn-ui` | UI library | https://skills.sh/shadcn/ui/shadcn | `npx shadcn@latest init` then `npx shadcn@latest add button input form label card` (plus any primitives the feature needs — `calendar`, `popover`, `dialog`, etc.) | Use `@/components/ui/*` imports. Do NOT emit raw HTML `<button>` / `<input>`. Tag each generated file with `// FDL stack-companion: shadcn`. |
| `tailwind v4`, `tailwindcss v4`, `tailwind-v4 + shadcn` | UI library combo | https://skills.sh/jezweb/claude-skills/tailwind-v4-shadcn | (see pack) | Use Tailwind v4 config syntax (`@theme` blocks, no `tailwind.config.js`). |
| `clerk`, `@clerk/nextjs` | Auth provider | https://skills.sh/clerk/skills/clerk-custom-ui | `npm i @clerk/nextjs` | Wrap the app in `<ClerkProvider>`, use `<SignIn />` / `<SignUp />` components. Blueprint security rules (bcrypt, rate limiting) become Clerk configuration, not hand-rolled code. |
| `prisma` | ORM | — (no dedicated skill pack; inline) | `npx prisma init` then `npx prisma generate` | Generate a `schema.prisma` matching `blueprint.fields`. Use `prisma.<model>.findUnique / create / update`. |
| `drizzle` | ORM | — | `npm i drizzle-orm drizzle-kit` | Generate a schema file using `pgTable` / `mysqlTable`. |
| `nextauth`, `next-auth` | Auth provider | — | `npm i next-auth` | Generate `auth.ts` with the providers the blueprint implies (credentials + email). |

### Algorithm

1. Lowercase the full raw prompt the user sent.
2. For every row in the table, check if the keyword (or any alias in that row's first column) is a substring of the lowercased prompt.
3. For each hit, record `{ keyword, skill_url, install_cmd, invocation_cmd, generation_hint }` in a `stack_companions[]` list.
4. During code generation (Steps 1–4), apply the `generation_hint` for every stack companion in the list. When multiple are in scope, they compose: `shadcn + prisma + nextauth` means shadcn-imported forms, Prisma queries for data, and NextAuth wrapping the auth flow.
5. In the final `Output to User` summary, emit a `STACK COMPANIONS` block listing each hit with its install command (see the Output section). The user runs the install commands themselves.
6. **DO NOT auto-execute `npx skills add`, `npm install`, `npx shadcn init`, or any other install command.** Surfacing the command in the summary is the correct boundary. Installing third-party skill packs is a user decision.

### Unknown stack hint

If the prompt mentions a library name that isn't in the table (examples: `chakra`, `mui`, `antd`, `radix` standalone, `emotion`, `styled-components`), **do NOT WebFetch or WebSearch skills.sh on the user's behalf** — auto-discovery adds latency and can silently pick a wrong skill. The user-facing path is Step 0e: when the skill asks *"any third-party skills you want to wire in?"*, the user can paste an install command for the library. Everything pasted there goes through Step 0e's parser, not through this table.

For this step specifically:

- Record the unknown library in a `stack_hints[]` working list so Step 0e can pre-fill its question (*"I noticed you mentioned `chakra` — do you want to plug in a Claude skill for it?"*).
- Proceed with generation using base framework conventions (no library-specific imports) UNLESS Step 0e later adds a user-provided entry for that library.

### Silent behavior when nothing matches

If no keyword matches, this step is a no-op — no section in the summary, no change to generation. Fall through to Step 0c.

## Step 0c: Data-Source Skill Detection

Same pattern as Step 0b, but for external data sources and integration skills. **Runs automatically on every invocation. Do not ask the user.**

### Trigger table

| Concept in prompt or feature | Data source | Skill URL | Install command | Generation hints |
|---|---|---|---|---|
| `calendar`, `schedule`, `events` (when tied to viewing/managing personal or shared schedules), `appointments`, `google calendar` | Google Calendar | https://skills.sh/baphomet480/claude-skills/google-calendar | `npx skills add https://github.com/baphomet480/claude-skills --skill google-calendar` | Use the skill's `list` / `get` / `search` / `create` / `update` / `delete` / `quick_add` commands via `uv run skills/google-calendar/scripts/google_calendar.py`. OAuth setup: enable Calendar API in Google Cloud Console, download credentials.json. Also in summary: note that OAuth client ID + secret must be configured before first run. |
| `payment`, `checkout`, `subscription`, `stripe` | Stripe | — (inline) | `npm i stripe` | Generate a Stripe client singleton (`lib/stripe.ts`) and use `stripe.paymentIntents.create` / `stripe.subscriptions.create`. Environment: `STRIPE_SECRET_KEY`. |
| `sms`, `text message`, `otp via text`, `twilio` | Twilio | — | `npm i twilio` | Generate a Twilio client and use `client.messages.create`. Environment: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`. |
| `email`, `transactional email`, `resend`, `sendgrid` | Resend / SendGrid | — | `npm i resend` | Generate a Resend client and use `resend.emails.send`. Environment: `RESEND_API_KEY`. |
| `storage`, `file upload`, `s3`, `r2` | S3 / Cloudflare R2 | — | `npm i @aws-sdk/client-s3` | Generate an S3 client. For R2, point `endpoint` at the R2 URL. Environment: `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`. |
| `maps`, `geocoding`, `google maps` | Google Maps | — | `npm i @googlemaps/js-api-loader` | Generate a map component using the JS API loader. Environment: `NEXT_PUBLIC_GOOGLE_MAPS_KEY`. |

### Algorithm

Same as Step 0b: lowercase scan, substring match, record `data_sources[]` entries with `{ concept, skill_url, install_cmd, env_vars, generation_hint }`, emit a `DATA SOURCES` block in the summary, and wire the generation hint into the relevant files.

### Critical rule — scoping

**Data-source skills scope to the feature that needs them, not the whole project.** In the canonical example *"app with login and dashboard showing daily calendar"*, Google Calendar is wired ONLY into the calendar widget — NOT into the login handler, NOT into the dashboard container's other widgets. The blueprint for `login` doesn't get a Google Calendar dependency just because the sibling feature needed one.

### Environment variables in the summary

For every data-source hit, list the required environment variables in the `DATA SOURCES` block so the user knows what to set before running the app. Do NOT generate a `.env` file with real credentials — use a `.env.example` template with placeholder values (e.g., `STRIPE_SECRET_KEY=sk-fake-example-key-not-real`). POPIA/security rule: never write real secrets anywhere.

## Step 0d: Multi-Feature Parsing

**You MUST run this step on every invocation, automatically, before loading any blueprint.** When the user's prompt names more than one feature, generate all of them in one invocation — do NOT ask *"just {first_feature}?"* and do NOT require the user to run `/fdl-generate` N times.

### Trigger detection

The prompt contains multi-feature intent if ANY of these are true:
- More than one known feature name appears as a substring (check by running `blueprint-lookup.js` against each candidate token)
- The phrases `" and "`, `" + "`, or a comma separate two feature-like tokens
- The prompt contains any of: `" app "`, `" create an app "`, `" scaffold "`, `" build me "`, `" full stack "` (these indicate app-level multi-feature intent)

### Algorithm

1. Strip the leading command and arguments from the prompt (everything before the first natural-language noun).
2. Tokenize the remainder on `and`, `,`, `with`, `+`, and the phrase `that has`.
3. For each token, extract candidate feature names (noun phrases). Examples:
   - *"basic login"* → `login`
   - *"dashboard"* → `dashboard`, `dashboard-analytics`, `admin-panel`
   - *"daily calendar"* → `calendar-view`, `scheduling-calendar`, `calendar`
4. For each candidate, run `node scripts/blueprint-lookup.js <candidate>`:
   - Exit 0 → add the returned JSON to `features_to_generate[]`
   - Exit 1 → add the candidate to `missing_features[]`
5. **Skip the existing "Scope" question entirely** when `features_to_generate.length > 1`. The user already told us what they want — don't interrupt.
6. **Share one answer across features** for Database, AGI-flow, and project-skeleton questions. Do NOT ask them once per feature. One generation run → one set of answers.
7. **Multi-feature AGI collapse:** when generating more than one feature at once, replace the six granular AGI questions with ONE question: *"Generate with default security and no tests, or tune settings?"* — options: `Generate now (defaults)` / `Tune settings (unfolds the full wizard)`. Most scaffolding asks pick the first option.
8. **Missing-feature handoff at the END.** If any candidate wasn't in the INDEX, do NOT interrupt the flow. Collect them all and surface ONE question at the very end, just before Step 5/6:
   > *"The following concept doesn't have a dedicated blueprint: `{list}`. Options: (a) generate inline without a blueprint, (b) run `/fdl-create <name>` first, (c) use the closest blueprint ({closest match from INDEX — use fuzzy match on feature names and descriptions}) as the base."*

### Cross-cutting glue for multi-feature runs

When `features_to_generate.length > 1`, the skill must also emit cross-cutting project glue that no single feature blueprint owns:

- **Route protection middleware** — `middleware.ts` that gates `(app)` / `(protected)` route groups behind a valid session cookie. Required whenever any non-auth feature is in the run alongside `login` / `signup` / `session`.
- **Root layout** — `src/app/(app)/layout.tsx` (or framework equivalent) with navigation shell, auth context provider, and a slot for the feature pages.
- **Environment template** — `.env.example` listing every environment variable from every data-source skill detected in Step 0c.

These files get tagged with `// FDL cross-cutting: multi-feature-app` so they're distinguishable from feature-owned files.

### Single-feature runs

When `features_to_generate.length === 1`, Step 0d is a no-op and generation proceeds as before — the existing Scope question (if the one blueprint has `related` entries) still fires.

## Step 0e: Ask About Third-Party Skills

**You MUST run this step exactly once per invocation, after Steps 0a–0d have finished and before Step 0 loads the blueprints.** This is the user's only chance to plug in skills that the static tables in Steps 0b/0c don't know about. Do NOT search skills.sh or any other catalog on the user's behalf — ask, then accept whatever they paste.

### What to show the user

Ask ONE `AskUserQuestion` with the question body shaped like this (fill in the bracketed parts from what Steps 0b/0c detected):

> **Third-party skills for this run**
>
> I auto-detected: `{list from stack_companions[] and data_sources[], or "(none)"}`.
>
> Are there any other Claude skills or skill packs you want me to wire in? You can browse:
>
> - **skills.sh** — https://skills.sh (community catalog, largest)
> - **anthropics/skills** — https://github.com/anthropics/skills (official)
> - **awesome-claude-skills** — https://github.com/travisvn/awesome-claude-skills (curated list)
>
> Paste the install command or skill URL (one per line), or pick "Skip" to use only what I auto-detected.
>
> Example: `npx skills add https://github.com/shadcn/ui --skill shadcn`

Offer three options:

| Option | What it does |
|---|---|
| **Skip** | Proceed with only what Steps 0b/0c auto-detected. Most common choice. |
| **Paste install commands** | The user types/pastes one or more install lines. |
| **Paste skill URLs** | The user pastes bare URLs to skills.sh or GitHub pages; you treat them as stack hints without an install command. |

### Parsing the response

For each non-empty line in the user's paste, extract:

- **Install command** — if the line starts with `npx skills add`, `npx skills install`, `npm i`, `pnpm add`, `npx shadcn`, `uv add`, or similar, take the whole line as `install_cmd`.
- **Skill URL** — if the line contains `skills.sh/` or `github.com/.../skills` or a bare URL, take it as `skill_url`.
- **Skill name** — extract from `--skill <name>` if present, or from the last path segment of the URL.
- **Classification heuristic** — if the URL/command mentions UI/component keywords (`ui`, `shadcn`, `radix`, `tailwind`, `chakra`, `mui`, `antd`, `mantine`), file it under `stack_companions[]`. If it mentions data/integration keywords (`calendar`, `stripe`, `twilio`, `maps`, `s3`, `database`, `api`, `crm`, `email`), file it under `data_sources[]`. Anything else goes in a new `user_skills[]` bucket that behaves like `stack_companions[]` in the summary but doesn't get a `generation_hint` (you don't know enough to compose it automatically).

For each parsed entry, record:
```
{ name, skill_url, install_cmd, source: "user", generation_hint: null }
```

The `generation_hint` is intentionally blank for user-pasted skills — you don't know how that skill's API is shaped, so you can't auto-wire imports the way you do for entries in the static table. The install command still goes into the summary so the user can run it and follow the skill's own documentation for integration.

### Surface in the summary

When parsing produced at least one entry, add a new `USER-PROVIDED SKILLS` block to the summary, immediately after `DATA SOURCES`:

```
USER-PROVIDED SKILLS:
  ✓ shadcn (https://github.com/shadcn/ui)
    Install: npx skills add https://github.com/shadcn/ui --skill shadcn
    Note: Follow the skill's own documentation for integration — FDL doesn't auto-wire imports for user-provided skills.
```

When parsing produced no entries (user picked "Skip" or pasted nothing parseable), emit nothing — no empty block.

### What this step is NOT

- **NOT a WebSearch.** You do not `WebSearch site:skills.sh` on behalf of the user. The user tells you what they want; you don't go shopping for them. The original reason for this (latency, catalog reliability, scope creep) still stands — the fix is asking one question, not running a crawl.
- **NOT an auto-installer.** You never execute `npx skills add` yourself. Surfacing the command in the summary is the correct boundary.
- **NOT a validator of the user's paste.** If they paste garbage, record it anyway and let them see it echoed in the summary. They'll notice if it's wrong.

## Handling Structured Outcomes

Outcomes may use structured conditions and side effects. Here's how to translate them to code:

### Priority → execution order
Outcomes with `priority: 1` are checked FIRST (rate limit, validation). `priority: 10` is checked last (success). Generate guard clauses in this order.

### Structured conditions → guard clauses
- `field` + `source` tells you WHERE to get the data (input = request body, db = database query, session = auth state, computed = derived)
- `operator` tells you the comparison (eq → ===, gt → >, matches → regex test, exists → != null)
- `value` is the comparand

### AND/OR groups → logical expressions
- Top-level given[] items are AND (all must pass)
- `any:` groups are OR (at least one must pass)
- `all:` groups are nested AND

```typescript
// any: [user not_exists, password neq stored_hash]
if (!user || !(await bcrypt.compare(password, user.hash))) { ... }

// all: [status eq active, email_verified eq true]  (default AND)
if (user.status === 'active' && user.email_verified) { ... }
```

### Structured side effects → function calls
- `action: set_field` → database update or variable assignment
- `action: emit_event` → event bus / console.log placeholder
- `action: transition_state` → status field update with validation
- `action: notify` → email/push service call
- `action: invalidate` → token/session revocation
- `action: create_record` → database insert
- `action: call_service` → external API call

When `when:` is present on a side effect, wrap it in a conditional.

## Step 0: Load the Blueprint

**You MUST use `scripts/blueprint-lookup.js` as the FIRST action in this step. Do NOT Read, Glob, or Grep blueprint files manually until the script has returned or failed.** The INDEX is a deterministic O(1) lookup — globbing is slower and less reliable.

### Mandatory flow

1. **Run the lookup script:**
   ```
   Bash: node scripts/blueprint-lookup.js <feature>
   ```

2. **Interpret the exit code:**

   | Exit | Meaning | What to do |
   |---|---|---|
   | `0` | Found in INDEX | Parse the JSON from stdout. It has `{ feature, category, yaml_path, md_path, version, description }`. Read the `yaml_path` it returned. Done loading — skip steps 3 and 4. |
   | `1` | Not in INDEX | The blueprint may not exist in this repo yet. Proceed to step 3 (remote fallback). |
   | `2` | INDEX.md missing or empty arg | Print the script's stderr message verbatim to the user and **stop**. Do NOT silently glob. The user needs to run `npm run generate:readmes` to regenerate the index. |

3. **Remote fallback** (only when step 2 returned exit 1, e.g. the user is working outside the FDL repo or the feature was published but not yet pulled locally):
   - `WebFetch https://theunsbarnardt.github.io/ai-fdl-kit/api/registry.json` — search the array for `feature === "<feature>"` to get its `category`.
   - Then fetch the full blueprint: `WebFetch https://theunsbarnardt.github.io/ai-fdl-kit/api/blueprints/{category}/{feature}.json`
   - Treat the JSON response as equivalent to the YAML (same field names).

4. **Nothing found locally or remotely:** tell the user *"No blueprint found for '{feature}'. Run `/fdl-create {feature}` first to define it."* and stop.

**Why a script and not prose instructions:** the INDEX parser is a tiny, deterministic helper that cannot be skipped or misread. It guarantees the skill always consults `blueprints/INDEX.md` first, never globs, and never guesses categories. If you find yourself about to run `Glob blueprints/**/*.blueprint.yaml`, stop — you're doing it wrong. Run the script instead.

**The blueprint JSON from the API has the same structure as the YAML** — same fields, outcomes, rules, errors, events. Use it identically.

**After loading the blueprint**, also check for project config:
- `Read fdl.config.yaml` if it exists — use `stack.*` and `conventions.*` to drive all code generation decisions (framework, database ORM, import style, test framework, etc.)
- Config values answer the "How should I handle the database?" question automatically — skip that question if the answer is in the config.

---

## Conversation with the User (max 2 questions)

Use AskUserQuestion. Only ask what changes the generated code.

**Question 1 — Scope** (if there are related features):
"Generate just {feature}, or include related features?"
- "{feature} only"
- "Include required features too ({list})"
- "Include all related features ({list})"

**Question 2 — Database** (if the feature needs persistence):
"How should I handle the database?"
- "Use mock/demo data (I'll swap in a real database later)"
- "Prisma (PostgreSQL)"
- "Drizzle (PostgreSQL)"
- "MongoDB/Mongoose"

Skip if frontend-only. Don't ask more questions — use smart defaults.

## AGI-Readiness Integration (automatic when `agi` section exists)

After loading the blueprint, check if it has an `agi` section. If it does, **automatically** ask the user plain-English questions using AskUserQuestion. **NEVER use technical terms like autonomy, invariants, acceptance tests, deprecation, tradeoffs, AGI, or monitoring.** Translate everything into simple, human language.

**CRITICAL: The user knows NOTHING about AGI, YAML, or blueprints. Write questions like you're talking to a business owner, not a developer.**

### Step 1: Control question (from `agi.autonomy`)

Read `agi.autonomy` and ask in plain English:

"How much control do you want over this feature?"
- "Handle everything automatically" 
- "Let it run but I want to review important actions like: {rewrite human_checkpoints in plain English}"
- "I want to approve every step"

Example: if `human_checkpoints` says "before disabling an account permanently", the option reads: "Let it run but I want to review things like disabling accounts"

### Step 2: Priority question (from `agi.tradeoffs`)

Combine all tradeoffs into ONE plain-English question. Don't mention "tradeoffs":

"What matters more for your app?"
- For each tradeoff entry, create a plain option. Example:
  - If `prefer: security, over: performance, reason: "constant-time comparison prevents timing attacks"` → option: "Maximum security even if it's slightly slower (recommended)"
  - The other side: "Fastest possible speed, standard security"

### Step 3: Testing question (from `agi.verification`)

Don't say "acceptance tests" or "invariants". Say:

"This feature comes with {N} built-in quality checks. Want me to generate test code to make sure everything works correctly?"
- "Yes — include the tests"
- "No — just build the feature"

### Step 4: Modernization question (from `agi.evolution.deprecation`)

Don't say "deprecation" or "migration". Translate to plain English:

"The '{field}' option is being phased out. The newer approach is: {rewrite migration in plain English}. Want me to use the newer approach?"
- "Yes — use the newer way"
- "No — keep it as is for now"

Example: if `field: remember_me, migration: "use refresh token rotation with configurable TTL instead"` → "The 'remember me' checkbox is being replaced with a smarter system that keeps you logged in automatically. Want me to use the newer approach?"

### Step 5: Safety question (from `agi.safety`)

If the blueprint has `agi.safety.action_permissions`, present a summary and ask:

"Some actions in this feature have special permission levels:"
- For each action_permission, describe it in plain English:
  - If `autonomous`: "{action} — runs automatically"
  - If `supervised`: "{action} — runs but you'll see a log entry"
  - If `human_required`: "{action} — needs your approval every time"
- If there's a cooldown: add "(at most once every {cooldown})"
- If there's max_auto_decisions: add "(auto-approved up to {N} times, then asks you)"

Then ask: "Does this look right?"
- "Looks good" (keep as-is)
- "I want more control" (upgrade all `autonomous` → `supervised`, `supervised` → `human_required`)
- "I want less control" (downgrade all `human_required` → `supervised`, `supervised` → `autonomous`)

### Step 6: Logging question (from `agi.explainability`)

If the blueprint has `agi.explainability`, ask:

"This feature can keep a detailed log of every decision it makes. Want to turn on decision logging?"
- "Yes — log everything" (set `log_decisions: true`, `reasoning_depth: full`)
- "Just the important ones" (use only `audit_events` — generate logging only for those specific decisions)
- "No logging needed" (skip all explainability code)

### How answers shape the code (internal — don't explain this to the user)

- **Control** → Generates approval screens or automated flows based on choice
- **Priority** → Shapes code decisions (e.g., security-first → constant-time everything)
- **Testing** → If yes, generates test files from `acceptance_tests` (each → test case) and `invariants` (each → assertion)
- **Modernization** → Uses new patterns or keeps old ones
- **Safety** → Generates permission checks, approval gates, and cooldown enforcement per action
- **Logging** → Generates audit middleware or decision logging based on `audit_events` schema
- **Additionally, always silently apply:**
  - `agi.verification.monitoring` → generate health-check endpoints
  - `agi.boundaries` → enforce execution order in generated code
  - `agi.capabilities` → document dependencies in code comments
  - `agi.goals` → add goal comments: `// GOAL: {description} — target: {metric} {target}`
  - `agi.evolution.triggers` → add TODO comments: `// TODO: if {condition}, consider {action}`
  - `agi.coordination.exposes` → add interface comments: `// EXPOSES: {capability} — {contract}`
  - `agi.coordination.consumes` → add dependency comments: `// CONSUMES: {capability} from {from} — fallback: {fallback}`
  - `agi.learning.signals` → add monitoring comments: `// MONITOR: {metric} (window: {window}, baseline: {baseline})`
  - `agi.learning.adaptations` → add TODO comments: `// TODO: experiment "{experiment}" when {when}`

**If the blueprint has NO `agi` section, skip all of this silently.**

---

## Code Generation: Outcome-Driven Approach

For each outcome in the blueprint, your generated code must:

1. **Check every `given` condition** — these become guards/validations in your code
2. **Perform every `then` action** — these become the side effects (DB writes, events, notifications)
3. **Produce the `result`** — this becomes the response (redirect, error message, return value)

### Example: Translating a Structured Outcome to Code

**Blueprint outcome (with priority, sources, AND/OR, structured effects):**
```yaml
invalid_credentials:
  priority: 4
  given:
    - any:                              # OR group
        - field: user
          source: db
          operator: not_exists
        - field: password
          source: input
          operator: neq
          value: stored_hash
  then:
    - action: set_field
      target: failed_login_attempts
      value: "increment"
    - action: emit_event
      event: login.failed
      payload: [email, timestamp, ip_address, attempt_count, reason]
    - action: set_field
      target: locked_until
      value: "now + 15 minutes"
      when: "failed_login_attempts >= 5"
  result: show "Invalid email or password" (SAME message for both cases)
```

**Generated code (any language — this example is TypeScript):**
```typescript
// FDL outcome: invalid_credentials (priority: 4)
// Given: any[user not_exists, password neq stored_hash]
if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
  // Then: set_field failed_login_attempts = increment
  const newAttempts = (user?.failed_login_attempts ?? 0) + 1;

  // Then: set_field locked_until (when: attempts >= 5)
  const lockUntil = newAttempts >= 5
    ? new Date(Date.now() + 15 * 60_000)
    : null;
  await updateLoginAttempts(user?.id, newAttempts, lockUntil);

  // Then: emit_event login.failed
  await emitLoginFailed({ email, timestamp: new Date(), ip_address, attempt_count: newAttempts, reason: !user ? "not_found" : "wrong_password" });

  // Result: same error for both cases (enumeration prevention)
  return { success: false, error: AUTH_ERRORS.LOGIN_INVALID_CREDENTIALS };
}
```

**What the code generator did:**
- `any:` group → `||` in the if condition
- `source: db` → looked up via database query earlier in the function
- `source: input` → came from the request body
- `action: set_field` → database update call
- `action: emit_event` → event emitter call with specified payload
- `when:` on a side effect → wrapped in a conditional
- `priority: 4` → this guard runs after rate-limit (1), lock-check (2), and disabled-check (3)

## What to Generate

For each feature, produce these files (adapt to framework conventions):

**Backend:**
- Business logic — the core: every outcome becomes a code path
- Validation — server-side, from `fields[].validation`
- Types — interfaces from `fields`, `errors`, `events`
- Route/action — the entry point that calls business logic

**Frontend (when ui_hints exist):**
- Form component — fields from `fields`, client validation, accessibility
- Page — renders the form with layout from `ui_hints`
- Error handling — maps error codes to user-facing messages

**Don't generate:**
- Documentation (the blueprint IS the documentation)
- Migration files (the user handles their own DB schema)

Tests are handled by the optional Step 5 below — see the trigger rules there.

## Step 5: Emit Tests (optional post-processing)

**Skip this step entirely unless** one of these conditions is true:
- The user passed `--with-tests` in the command
- The user answered "Yes — include the tests" to the AGI testing question in Step 3 of the AGI flow
- The blueprint has `agi.verification.acceptance_tests` (auto-enable)

When triggered, generate a test file that maps each structured outcome directly to a test case. Blueprints already encode everything you need: `given[]` is the arrange step, `then[]` is the act/assert step, `result` is the final expectation.

### Framework → test framework mapping

Detect the project's test framework from the existing files (don't ask):

| Target | Default | Detection hints |
|---|---|---|
| Next.js / Node.js | Vitest | `vitest.config.*` or `"vitest"` in `package.json`. Fall back to Jest if `jest.config.*` exists. |
| Express | Jest + supertest | `jest.config.*`, `"jest"` in `package.json` |
| Python (Django / FastAPI) | pytest | `pytest.ini`, `pyproject.toml` with `[tool.pytest]`, or `conftest.py` |
| Laravel | phpunit | `phpunit.xml` |
| Rust (Axum / Actix) | built-in `#[test]` + `cargo test` | Always — no detection needed |
| .NET / ASP.NET | xUnit | `*.Tests.csproj`, references to `Xunit` |
| Go | standard `testing` + `go test` | Always — no detection needed |
| Angular | Jasmine + Karma (or Vitest if migrated) | `karma.conf.*`, `angular.json` |

### Test file location

Use the framework's conventional path — **do not invent**:

- Next.js → `src/lib/{category}/__tests__/{feature}.test.ts`
- Express → `tests/{category}/{feature}.test.ts`
- Python → `tests/{category}/test_{feature}.py`
- Laravel → `tests/Feature/{Feature}Test.php`
- Rust → inline `#[cfg(test)] mod tests` in the handler file, OR `tests/{feature}.rs`
- .NET → `{Project}.Tests/{Category}/{Feature}Tests.cs`
- Go → `{category}/{feature}_test.go` (same package)

### Mapping structured outcomes → test cases

For every outcome, emit one test. The pattern is always the same — only the framework idioms change:

```
describe("{feature}", () => {
  describe("outcomes.{outcome_name}", () => {
    it("{result or titleCase(outcome_name)}", async () => {
      // ARRANGE — set up every `given` condition
      //   - field/source/operator/value → mock the data source at that value
      //   - string givens → best-effort setup from natural language
      //   - `any:` groups → set up ONE branch (pick the first) per test, or split into N sub-tests
      //   - `all:` groups → set up all
      const input = { ... };
      mockDb({ ... });

      // ACT — invoke the feature's entry point
      const result = await login(input);

      // ASSERT — verify every `then` action ran AND the `result` was produced
      expect(result).toMatch(/{expected-result}/);
      expect(mockDb.updates).toContainEqual({ failed_login_attempts: N });
      expect(mockEvents).toContainEqual({ name: "login.failed", ... });
    });
  });
});
```

### Rules

- **Outcome coverage is non-negotiable.** Every outcome in the blueprint MUST produce at least one test. Name each test after the outcome (or its `result`) so coverage is auditable.
- **Use mock data sources** — tests must not depend on a real database. Use the same mock store the main generated code falls back to when the user chose "mock/demo data" in Step 0.
- **Test the error codes literally.** When an outcome has `error: LOGIN_RATE_LIMITED`, assert on that exact code in the test.
- **`any:` branches** — if an outcome's `given` has an `any:` group, emit one test per branch so each branch is independently covered.
- **Don't mock framework internals.** Mock data sources and external services, not your own modules.
- **Add AGI acceptance tests on top.** If `agi.verification.acceptance_tests` exists, emit one additional test per entry with the scenario name as the test name.

### Silent behavior when skipped

If none of the trigger conditions are met, do not generate tests, do not mention tests in the summary, do not ask "do you want tests?" — stay out of the way.

## Step 6: Verify Loop (optional post-processing)

**Skip this step entirely unless** one of these conditions is true:
- The user passed `--verify` in the command
- The user answered "yes" to the final prompt: *"Run the generated tests now?"* (only asked when Step 5 ran)

When triggered, run the tests and iterate on failures until green — with a hard cap.

### The loop

1. **Detect the test command.** Read the project's package manager / build file and pick the right invocation:
   - `package.json` with `"scripts": { "test": ... }` → `npm test` (or `pnpm test` / `yarn test` based on lockfile)
   - Python project → `pytest` (or `python -m pytest`)
   - Rust → `cargo test`
   - Go → `go test ./...`
   - Laravel → `php artisan test`
   - .NET → `dotnet test`
2. **Run it** via Bash, capturing stdout and stderr. For browser/UI flows, prefer `preview_start` + `preview_logs` over Bash.
3. **Parse the result.**
   - All green → exit the loop, report "Pass: N/N" in the summary.
   - Any red → identify the first failing test, map its name back to the outcome it covers, read the generated source file that implements that outcome, and patch it.
4. **GOTO step 2.**

### Hard cap: 3 iterations

The loop MUST stop after 3 iterations regardless of state. Unbounded iteration is the fastest way to burn context and tokens on an unreachable fix. When the cap is hit:

- Stop. Do not delete the generated tests or source.
- Print a clean handoff to the user: *"After 3 attempts the following tests are still failing: {list}. The blueprint outcome is: {outcome_name}. Investigate manually — the likely cause is {first stderr line}."*
- Include the failing test output so the user can debug without re-running.

### What to patch

- **Only patch files that `/fdl-generate` just created** (they carry the `// FDL:` audit comment). Do NOT patch pre-existing project files.
- **Never patch the tests themselves to make them pass.** Tests come from the blueprint and are the spec. If a test is wrong, the blueprint is wrong — stop, do not touch.
- **If a failure is caused by a missing dependency** (e.g., `Cannot find module 'bcrypt'`), stop the loop immediately and tell the user which package to install. Don't try to install packages automatically.

## Self-Check: Outcome Coverage

After generating ALL code, verify every outcome is covered. Go through each one:

```
outcomes.successful_login:
  given: email valid? ✓ (validation in validateLoginInput)
  given: user exists? ✓ (lookupUserByEmail check)
  given: password matches? ✓ (bcrypt.compare)
  given: not locked? ✓ (locked_until check)
  given: not disabled? ✓ (status check)
  given: email verified? ✓ (email_verified check)
  then: reset counter? ✓ (updateLoginAttempts(0))
  then: create tokens? ✓ (createSession)
  then: emit event? ✓ (emitLoginSuccess)
  result: redirect /dashboard? ✓ (redirect in action)

outcomes.invalid_credentials:
  given: user not found or wrong password? ✓ (both return same error)
  then: increment counter? ✓
  then: lock if >= 5? ✓
  then: emit event? ✓
  result: same error message? ✓ (LOGIN_INVALID_CREDENTIALS for both)

[...continue for every outcome]
```

If ANY check fails, fix the code before outputting.

Also verify:
- Every `rules.security` constraint is enforced (rate limits, constant-time, etc.)
- Every `errors` entry has a code path that can trigger it
- Every `events` entry is emitted somewhere
- If `states` exists, transitions are enforced
- If `actors` exist, authorization checks match

## Output to User

Show a clean summary (no YAML, no implementation details). Every block below is **conditionally included** — only show a block when its step actually produced something. Empty headings are forbidden.

```
Generated: nextjs app with login + dashboard-analytics + calendar-view

SOURCE:
  ✓ Blueprint:     blueprints/auth/login.blueprint.yaml
  ✓ Blueprint:     blueprints/ui/dashboard-analytics.blueprint.yaml
  ✓ Inline:        calendar-view (no blueprint — generated as a read-only widget)

STACK COMPANIONS:
  ✓ shadcn (https://skills.sh/shadcn/ui/shadcn)
    Install: npx shadcn@latest init
             npx shadcn@latest add button input form label card calendar popover

DATA SOURCES:
  ✓ google-calendar (https://skills.sh/baphomet480/claude-skills/google-calendar)
    Install:   npx skills add https://github.com/baphomet480/claude-skills --skill google-calendar
    OAuth:     enable Calendar API in Google Cloud Console, download credentials.json
    Env vars:  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

USER-PROVIDED SKILLS:
  ✓ shadcn (https://github.com/shadcn/ui)                    ← pasted in Step 0e
    Install: npx skills add https://github.com/shadcn/ui --skill shadcn
    Note:    FDL doesn't auto-wire imports for user-provided skills — follow the skill's own docs.

FILES:
  src/app/(auth)/login/page.tsx          — Login page
  src/app/(auth)/login/actions.ts        — Server action
  src/lib/auth/login.ts                  — Business logic
  src/app/(app)/layout.tsx               — Protected layout (auth wrapper)
  src/app/(app)/dashboard/page.tsx       — Dashboard container
  src/components/dashboard/CalendarWidget.tsx — Daily calendar widget
  src/middleware.ts                      — Route protection (cross-cutting)
  .env.example                           — Env var template

IMPLEMENTED:
  ✓ Email + password login with "remember me"
  ✓ Account lockout, rate limiting, generic errors (blueprint-enforced)
  ✓ JWT session with secure cookies
  ✓ Protected /dashboard route via middleware
  ✓ Dashboard shell with calendar widget slot
  ✓ Read-only daily calendar widget wired to Google Calendar skill
  ✓ shadcn Card / Button / Calendar / Popover used throughout

POST-PROCESSING:
  ✓ Tests emitted   — 6 test cases across 6 outcomes (Vitest)
  ✓ Verify loop     — 2/2 iterations, all green (12/12 passing)

NEEDS YOUR WORK:
  ⚠ Run `npx create-next-app@latest` before using the generated files
  ⚠ Run the shadcn install commands in STACK COMPANIONS above
  ⚠ Set up Google Cloud OAuth credentials (Client ID + Secret)
  ⚠ Database queries (currently mock — swap in Prisma/Drizzle)
  ⚠ Rate limiting store (needs Redis or similar)

DEMO CREDENTIALS (mock data):
  Email: demo@example.com | Password: Password1
```

### Rules for the summary

- **`SOURCE` block** — list every blueprint loaded (one line per feature when Step 0d found multiple). If Step 0a extracted external input (Figma, OpenAPI, etc.), add a line for it. If Step 0d had a `missing_feature` that was generated inline, add an `Inline:` line for it.
- **`STACK COMPANIONS` block** — list every hit from Step 0b. One line for the skill URL, one indented line for the install command. When the user needs to run multiple install steps (e.g., shadcn init + shadcn add primitives), show them on separate lines. **Only include this block when Step 0b produced at least one hit.**
- **`DATA SOURCES` block** — list every hit from Step 0c. One line for the skill URL, one indented line for install, one for OAuth/setup if applicable, one for required env vars. **Only include this block when Step 0c produced at least one hit.**
- **`USER-PROVIDED SKILLS` block** — list every entry the user pasted in Step 0e. One line for the name + URL, one indented line for the install command, one indented line noting that FDL doesn't auto-wire imports for these. **Only include this block when Step 0e produced at least one parsed entry.**
- **`POST-PROCESSING` block** — list Step 5 (tests) and Step 6 (verify loop) only if they ran. When the verify loop stopped at the 3-iteration cap, show it as `⚠ Verify loop   — stopped at 3 iterations, {N} tests still failing` and include the failing test names under `NEEDS YOUR WORK`.
- **`FILES` block** — tag cross-cutting glue files (middleware, layouts, .env.example) with a short suffix so the user can see which files are feature-owned vs multi-feature glue.
- **Never show empty blocks.** The absence of a block tells the user the step didn't run — don't emit `STACK COMPANIONS: (none)`.
- **Never auto-execute install commands.** They always go in the summary for the user to run themselves. This is a safety boundary for third-party code execution.

## Framework Patterns

Use the target framework's idiomatic file structure. Here are examples — but adapt to whatever the user asks for:

### Next.js (App Router)
```
src/app/{route}/page.tsx           — Server component (page)
src/app/{route}/actions.ts         — Server actions
src/lib/{category}/{feature}.ts    — Business logic
src/lib/{category}/types.ts        — Shared types
src/components/{category}/{Form}.tsx — Client form
```

### Express
```
src/routes/{category}/{feature}.ts     — Route + handler
src/services/{category}/{feature}.ts   — Business logic
src/validators/{category}/{feature}.ts — Zod/Joi validation
src/types/{category}.ts                — Types
```

### Laravel
```
app/Http/Controllers/{Category}/{Feature}Controller.php
app/Http/Requests/{Category}/{Feature}Request.php
app/Services/{Category}/{Feature}Service.php
resources/views/{category}/{feature}.blade.php
routes/{category}.php
```

### C# / ASP.NET
```
Controllers/{Category}/{Feature}Controller.cs
Services/{Category}/{Feature}Service.cs
Models/{Category}/{Feature}Request.cs
Models/{Category}/{Feature}Response.cs
```

### Angular
```
src/app/{category}/{feature}/{feature}.component.ts
src/app/{category}/{feature}/{feature}.component.html
src/app/{category}/{feature}/{feature}.service.ts
src/app/{category}/{feature}/{feature}.model.ts
```

### Rust (Actix / Axum)
```
src/handlers/{category}/{feature}.rs
src/services/{category}/{feature}.rs
src/models/{category}.rs
src/errors/{category}.rs
```

### Python (Django / FastAPI)
```
{category}/views.py or {category}/routes.py
{category}/services/{feature}.py
{category}/models.py
{category}/schemas.py
```

### Any Other Framework
Follow that framework's conventions. The blueprint gives you WHAT to build — you decide the file structure, naming patterns, and idioms that are standard for the target.

## RFC 2119 Rule Strength — MUST / SHOULD / MAY

Rules in blueprints may be prefixed with RFC 2119 strength keywords. Enforce them accordingly:

| Prefix | Meaning | Code generation behaviour |
|--------|---------|--------------------------|
| `MUST:` or `SHALL:` | Absolute requirement | Always implement. Never omit. Fail the generation if you can't satisfy it. |
| `SHOULD:` | Strongly recommended | Implement by default. If skipping, add a `// TODO: [SHOULD] reason` comment. |
| `MAY:` | Optional enhancement | Implement only if the user explicitly asked for it or it's trivially free. |
| *(no prefix)* | Treat as `SHOULD:` | Implement by default. |

**Examples:**
```yaml
rules:
  security:
    - "MUST: Passwords must be hashed with bcrypt (min cost 12)"
    - "MUST: Rate limit login to 5 attempts per 15 minutes per IP"
    - "SHOULD: Log failed login attempts with IP and timestamp"
    - "MAY: Send login notification email to user"
```

Generated code **must** implement both MUST rules above. It **should** implement the SHOULD rule. It **may** skip the MAY rule unless requested.

## Non-Negotiable Rules

1. **Security constraints are mandatory** — `constant_time: true` means bcrypt.compare, not `===`. `generic_message: true` means identical error for wrong-user and wrong-password. No exceptions.
2. **Every outcome must have a code path** — if the blueprint says it can happen, the code must handle it.
3. **Use blueprint values, not your own** — `max_attempts: 5` means 5, not 3 or 10.
4. **Add `// FDL: {path}` comments** — so developers can trace code back to the blueprint.
5. **Outcomes > flows** — when both exist, implement from outcomes. Flows are for documentation.
