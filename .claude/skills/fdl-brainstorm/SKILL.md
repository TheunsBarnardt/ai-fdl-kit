---
name: fdl-brainstorm
description: Socratic requirements elicitation for users who don't know what blueprint they want. Terminates in /fdl-create.
user_invocable: true
command: fdl-brainstorm
arguments: "[rough idea or topic]"
---

# FDL Brainstorm — Socratic Blueprint Elicitation

Help a user go from "I have a vague idea" to "a concrete FDL blueprint" through structured questioning.

**This skill does NOT produce a blueprint on its own.** Its terminal state is an invocation of `/fdl-create` with a fully-specified description. The blueprint is always the end goal.

## When to use

- User says something vague: "I need something for handling user uploads but I'm not sure how it should work"
- User has a problem, not a solution: "How do I stop bots from spamming my form?"
- User wants to explore alternatives before committing: "What are the different ways to handle expense approvals?"
- A previous skill (like `/fdl-build`) identified a gap and needs a new blueprint but the shape isn't clear

## When NOT to use

- User already knows what they want → use `/fdl-create <feature>` directly
- User has a codebase or document to extract from → use `/fdl-extract-code` or `/fdl-extract`
- User already knows which repo to extract specific features from → use `/fdl-extract-code-feature <repo>` directly
- User is describing an existing feature → search blueprints first

## Core principle — borrowed from Superpowers `brainstorming`, re-bound to FDL

Superpowers' brainstorming skill ends by writing a design doc to `docs/superpowers/specs/`. This skill ends by invoking `/fdl-create` with a specification detailed enough to produce a valid blueprint. **The blueprint is the only acceptable terminal state of the FDL system — no markdown design docs, no task lists, no pseudocode.**

## Workflow (11 steps, executed one at a time)

### Step 1 — Explore existing context (INDEX-first, skill-aware, extraction-aware)

Before asking anything, gather the full picture of what already exists. **You MUST do both of these before asking any question — the user should never hear "let me think about that" when the answer is a one-command lookup.**

#### 1a. Check the blueprint INDEX

The repo ships a deterministic catalog at `blueprints/INDEX.md` (auto-generated, lists every blueprint grouped by category with links). Read it first — **never glob** `blueprints/**/*.blueprint.yaml` unless the INDEX is missing:

1. **Read `blueprints/INDEX.md`** in one call. This gives you all 200+ blueprints with their categories, versions, and one-line descriptions in under a few hundred lines.
2. **Extract candidate feature names** from the user's rough idea. Example: *"I need something to track my daily calendar and who attended"* → candidates `calendar`, `scheduling`, `meeting`, `attendance`, `event`.
3. **For each candidate, run the lookup script:**
   ```
   Bash: node scripts/blueprint-lookup.js <candidate>
   ```
   Exit 0 means a blueprint with that exact name exists — use its returned JSON (`category`, `description`, `yaml_path`) to offer the user an extension or variant. Exit 1 means no exact match — fall back to fuzzy search against the INDEX's descriptions (substring match on `description` column, surface the top 3 closest hits).
4. **If one or more close matches exist**, tell the user and offer three concrete paths:
   > "I found these related blueprints already: `{existing-1}` in `{category-1}` ({one-liner}), `{existing-2}` in `{category-2}` ({one-liner}). Do you want to: (a) extend one of them, (b) create a variant, or (c) build something distinct?"
5. **Never invent a new blueprint when an existing one would do.** The INDEX is your guard against duplication.

**Fallback only when `blueprints/INDEX.md` is missing:** if Read returns "file not found", tell the user *"INDEX.md is missing — run `npm run generate:readmes` to rebuild it"* and stop. Do NOT silently glob the repo. The index is the source of truth.

#### 1b. Gap-filling via extraction (when no blueprint exists)

**Trigger:** This step runs only when Step 1a found NO close matches, OR when the user chose "(c) build something distinct" after seeing matches. If 1a found a usable blueprint and the user chose extend/variant, skip this step entirely.

The FDL system maintains `data/extraction-candidates.yaml` — a curated map of open-source repos known to implement features that could become blueprints. Before falling through to "create from scratch," check whether the gap can be filled by extracting from one of these repos.

**1b.1 — Read the extraction candidates map:**

Read `data/extraction-candidates.yaml` in one call. If the file doesn't exist, print *"extraction-candidates.yaml not found — skipping extraction lookup"* and fall through to Step 1c (skill-delegation signals), then Step 2.

**1b.2 — Look up candidates for the gap:**

Reuse the candidate feature names extracted in Step 1a (e.g., for *"I need something to handle fleet dispatch"* → candidates `fleet`, `dispatch`, `delivery`, `order`). Also infer the most likely FDL category from keyword signals:

| Keywords in idea | Inferred category |
|---|---|
| login, auth, password, MFA, 2FA, session, SSO, SAML | auth |
| permission, role, access, RBAC, policy, authorization | access |
| OAuth, OIDC, federation, LDAP, API gateway, webhook | integration |
| CMS, CRUD, collection, schema, migration, data model | data |
| trade, derivative, commodity, portfolio, pricing | trading |
| UI, component, editor, drag, canvas, form, layout | ui |
| payment, checkout, billing, invoice, subscription | payment |
| notification, email, SMS, push, alert | notification |
| workflow, approval, process, state machine | workflow |
| vehicle, fleet, tracking, GPS, geofence, dispatch, route | data or integration |
| inventory, stock, warehouse | inventory |
| manufacturing, production, BOM | manufacturing |
| CRM, customer, lead, pipeline | crm |
| asset, equipment, depreciation | asset |

Look up repos using the same priority order as `scripts/fitness-recommend.js`:

1. `features.<candidate-name>` — exact feature-level override (highest priority)
2. `categories.<inferred-category>.<any-dimension>` — any dimension entries for the category
3. `categories.<inferred-category>.any` — generic category fallback

Collect all unique repos (deduplicate by URL), keeping up to 3 candidates.

**1b.3 — Present the user with options:**

**When candidates are found:**

> "I didn't find an existing blueprint for this, but I found open-source repos in the extraction candidates map that implement similar features:
>
> 1. **Extract from a repo** — I'll scan it, show you the features it implements, and you pick which ones to extract into blueprints:
>    - `org/repo-1` — {description}
>    - `org/repo-2` — {description}
>
> 2. **Discover a different repo** — I'll search the web for open-source projects that implement this feature and add them to the candidates map.
>
> 3. **Create from scratch** — I'll walk you through designing the feature step-by-step using Socratic questioning.
>
> Which approach?"

**When no candidates are found:**

> "I didn't find an existing blueprint or any mapped extraction candidates for this feature area. Two options:
>
> 1. **Discover a repo** — I'll search the web for open-source projects that implement this feature.
>
> 2. **Create from scratch** — I'll walk you through designing the feature step-by-step.
>
> Which approach?"

**1b.4 — Handle the user's choice:**

- **"Extract from repo"**: If multiple repos were listed, ask which one. Then invoke `/fdl-extract-code-feature <repo-url>` and **EXIT the brainstorm entirely**. The extraction skill handles everything from there (feature menu, blueprint creation, auto-evolve).

- **"Discover a repo"**: Invoke `/fdl-recommend-discover` and **EXIT the brainstorm entirely**. The discovery skill handles WebSearch, user approval, and YAML append.

- **"Create from scratch"**: Continue to Step 1c (skill-delegation signals), then Step 2 as normal. No change to the existing Socratic flow.

**Edge cases:**

- **Idea spans multiple features, some exist as blueprints, some don't:** Step 1a handles the "exists" portion. Step 1b only fires for the unmatched portion of the idea.
- **Multiple repos cover different aspects of the idea:** Group them by which aspect they cover — e.g., *"For the dispatch part: fleetbase. For the vehicle lifecycle part: erpnext. Which repo, or create from scratch?"*
- **User picks extract but the repo lacks the feature they need:** Handled by `/fdl-extract-code-feature`'s feature menu. If the user doesn't find what they need, they can come back and run `/fdl-brainstorm` again.

**Execution order note:** If the user chooses "extract" or "discover" in this step, the brainstorm exits and Steps 1c through 11 never run. Step 1c (skill-delegation signals) and the Socratic flow only execute when the user chose "create from scratch."

#### 1c. Scan the idea for skill-delegation signals

While you have the user's rough idea in front of you, also scan it for keywords that map to known companion/data-source skills. These become **informed options** in Step 5 instead of generic alternatives.

**Stack-companion signals** (UI libraries, ORMs, auth providers):

| Keyword in idea | Known skill / library | Inform the user |
|---|---|---|
| `shadcn`, `shadcn/ui` | [shadcn/ui](https://skills.sh/shadcn/ui/shadcn) — UI component pack | A dedicated skill exists that can install and compose shadcn primitives. |
| `tailwind v4` + `shadcn` | [tailwind-v4-shadcn](https://skills.sh/jezweb/claude-skills/tailwind-v4-shadcn) | Combined setup skill covers both. |
| `clerk`, `clerk auth` | [clerk-custom-ui](https://skills.sh/clerk/skills/clerk-custom-ui) | Drop-in auth provider — replaces hand-rolled login flow. |
| `prisma`, `drizzle`, `nextauth` | no dedicated skill pack; inline patterns | Widely-used libraries — `/fdl-generate` knows how to emit them idiomatically. |

**Data-source signals** (external data, integrations):

| Concept in idea | Known skill / library | Inform the user |
|---|---|---|
| `calendar`, `schedule`, `events`, `appointments`, `meeting` | [google-calendar](https://skills.sh/baphomet480/claude-skills/google-calendar) — full CRUD skill | You can plug in Google Calendar as the backing store instead of building your own event table. |
| `payment`, `checkout`, `subscription`, `stripe` | Stripe inline | Stripe is the default; mention it as an option alongside building your own payment flow. |
| `sms`, `otp via text`, `twilio` | Twilio inline | Same pattern. |
| `email`, `transactional email` | Resend / SendGrid inline | Same pattern. |
| `file upload`, `storage`, `s3`, `r2` | S3 / Cloudflare R2 inline | Same pattern. |
| `maps`, `geocoding` | Google Maps inline | Same pattern. |

**The full, authoritative tables live in `.claude/skills/fdl-generate/SKILL.md` under Steps 0b and 0c.** This brainstorm skill maintains a summary so it can make decisions during Socratic questioning; the full delegate metadata (install commands, env vars, generation hints) only needs to be in fdl-generate's hands at code-generation time.

**What to do with the signals you find:** store them in working memory and surface them as options in Step 5. Do NOT volunteer them in Step 1 — at this stage you're just building context. The user hasn't committed to a shape yet, and you don't want to bias them toward a specific vendor until they've told you what problem they're solving.

### Step 2 — Understand the problem, not the solution

Ask ONE question:

> "Before we talk about how this should work — what's the problem you're trying to solve for the user?"

Listen for the outcome. If they describe a mechanism ("I want a form with three fields"), redirect: "What happens *after* they submit the form? What problem does that solve?"

### Step 3 — Clarify success

Ask ONE question:

> "How would you know this feature is working correctly? What has to be true?"

Their answer becomes the first draft of `outcomes.*.given` and `outcomes.*.result`.

### Step 4 — Surface failure modes

Ask ONE question:

> "What should happen when things go wrong? Think: invalid input, someone not authorized, rate limits, external service down, partial failures."

**This is the most important question.** Blueprints with no failure outcomes fail the completeness checker. If the user can't name at least 2 failure modes, probe harder — every real feature has them.

### Step 4b — Ask about third-party skills

Before you propose approaches, give the user one explicit opening to plug in Claude skills that Step 1c didn't detect. This step runs ONCE and is non-negotiable — it's the user's chance to tell us about a skill pack we don't know about, so we frame the Step 5 trade-offs against their preferred tooling instead of ours.

Ask ONE question:

> "Before I lay out the options — are there any specific Claude skills or third-party skill packs you want to use?
>
> I already noticed: `{list from Step 1c signals, or "(nothing specific)"}`.
>
> You can browse more at:
> - **skills.sh** — https://skills.sh (community catalog)
> - **anthropics/skills** — https://github.com/anthropics/skills (official)
> - **awesome-claude-skills** — https://github.com/travisvn/awesome-claude-skills (curated list)
>
> Paste install commands or skill URLs if you have specific ones in mind, or just say 'none' to proceed with what I auto-detected.
>
> Example: `npx skills add https://github.com/shadcn/ui --skill shadcn`"

**Do NOT search skills.sh yourself.** If the user answers 'none' or gives an empty response, move on with whatever Step 1c surfaced and don't prompt again. If they paste install commands or URLs, parse each line:

- Extract the install command if present (starts with `npx skills add`, `npm i`, `pnpm add`, `npx shadcn`, `uv add`, etc.)
- Extract the skill URL (skills.sh or github.com link)
- Extract a short name (from `--skill <name>` or the URL's last path segment)
- Classify as `data_source` (mentions calendar/payment/email/sms/storage/maps/crm/api keywords) or `stack_companion` (UI/ORM/auth keywords) or `user_skill` (neither)

Store the parsed entries in working memory alongside the Step 1c signals. In Step 5, when you present Axis 2 (delegate vs. own), user-provided skills become first-class "delegate to X" options alongside the auto-detected ones. In Step 9 (brainstorm doc), they get listed under the skill-delegations section. In Step 11 (handoff), they're carried forward to `/fdl-create` as `user-skill:<name>` tags so `/fdl-generate` later wires them idiomatically — same pipeline as auto-detected delegations.

**Never auto-install.** The install commands go into the brainstorm doc so the user can run them themselves when they're ready to generate code.

### Step 5 — Propose 2-3 approaches with trade-offs

Never jump to a single solution. Lay out alternatives across **two axes** and let the user pick from each:

#### Axis 1: Blueprint shape

> "There are a few ways to model this. Each has trade-offs:
>
> **A. Simple CRUD-style** — One outcome per operation (create/read/update/delete), no state machine. Simple, fast to implement. Good if the lifecycle is trivial.
>
> **B. State machine** — Add a `states:` section with valid transitions (draft → submitted → approved → paid). More work, but makes the lifecycle explicit and prevents illegal transitions.
>
> **C. Full workflow** — Add `actors:` (humans + systems), `flows:` (step-by-step procedures), and `sla:` (time limits). Right choice when humans are making decisions in the loop.
>
> Given what you described, I'd lean toward **B**. Which matches your mental model?"

#### Axis 2: Delegate vs. own (only when Step 1c found skill-delegation signals)

When Step 1c surfaced a known data-source or stack skill, the user has a real choice: own the data end-to-end or delegate to a specialist. Frame this explicitly — don't hide it, and don't assume the answer.

**Template when a data-source skill was detected (e.g., calendar → google-calendar):**

> "Before I lock this in — you mentioned calendar events. There's a real fork here:
>
> **1. Own the data** — Blueprint has its own `events` table with fields for title, start, end, attendees, location. You control the schema, you own the history, you handle all backup/export/audit. Good if compliance or data residency matters, or you need to integrate with something Google Calendar can't (e.g., your existing attendance system).
>
> **2. Delegate to Google Calendar** — The `google-calendar` skill pack at skills.sh provides full CRUD against a user's real Google Calendar. You don't store events at all — you read and write through their account. Good if the user already lives in Google Calendar, the data should sync across their other tools, and you don't need to add structure beyond what Google supports. Requires OAuth setup and a per-user consent flow.
>
> Which direction fits? I can also propose a hybrid — own the blueprint metadata (e.g., who attended, any internal tags) but pull the events themselves from Google Calendar."

**Template when a stack-companion skill was detected (e.g., shadcn, clerk):**

> "For the UI shell, you mentioned shadcn. Two options:
>
> **1. Use the shadcn skill pack** — The blueprint's `ui_hints` get mapped to shadcn primitives at code-generation time. Install is one line (`npx shadcn@latest init`). Idiomatic, batteries-included.
>
> **2. Build the components yourself** — The blueprint stays UI-library-agnostic; you decide at generation time whether to use shadcn, MUI, Chakra, or hand-rolled Tailwind. More flexible but more work.
>
> Default recommendation: **1**. Any reason to pick **2**?"

**When no skill signals were found, skip Axis 2 entirely.** Don't fabricate vendor options to fill space — the user didn't ask for them.

#### Recording the choice

Write the user's answers on both axes into the brainstorm working state:

- `shape` → A / B / C (determines blueprint section structure)
- `delegate_data` → which external data source, if any, will back this feature
- `delegate_stack` → which stack companion, if any, will drive the UI generation

These three values get carried forward to Step 6 (design sections), into the brainstorm doc at Step 9, and into the handoff at Step 11 so `/fdl-create` (and downstream `/fdl-generate`) can honor the user's decisions without re-asking.

### Step 6 — Present design sections iteratively, wait for acknowledgment

Walk through each section. **Do not dump the whole design at once.** After each section, pause and ask "Does that match what you want, or adjust?"

1. **Data** — what fields, types, required/optional
2. **Success path** — one outcome with given/then/result
3. **Failure paths** — one outcome per failure mode, each with a bound error code
4. **Security** — auth, rate limits, input validation rules
5. **Related features** — blueprints this depends on or extends

### Step 7 — Hard gate: user must approve the full design

No invocation of `/fdl-create` until the user says "yes, that's what I want" to the complete picture. If they hesitate, loop back to the specific section that feels wrong.

**Ultraplan option:** Before asking for final approval, offer the user the choice to review the full design with [ultraplan](https://code.claude.com/docs/en/ultraplan) on Claude Code on the web. This is especially useful when the design has 3+ failure paths or involves a state machine — the browser's inline comments let the user flag specific fields, outcomes, or security rules rather than describing concerns in chat. If the user accepts, send the complete design (data fields, success/failure outcomes, security rules, related features) as a structured plan. When the user approves in the browser, resume at Step 8. If the user prefers to stay in the terminal, proceed with the standard approval flow.

### Step 8 — Self-review the design against completeness rules

Before handoff, internally check:

- [ ] Feature name is kebab-case and not already in `blueprints/`
- [ ] Category is one of the valid FDL categories
- [ ] At least one success outcome
- [ ] At least one failure outcome
- [ ] Every failure outcome has a named error code
- [ ] At least one security rule (auth, rate limit, or input validation)
- [ ] `related:` connects to at least one existing blueprint (if any are relevant)
- [ ] No placeholder language ("TODO", "TBD", "figure out later")

If any box is unchecked, loop back and fill the gap with the user.

### Step 9 — Write the brainstorm design doc (mandatory)

Before any handoff, **always** write a full markdown design doc capturing the complete brainstorm. This is a non-negotiable output of the skill — the user gets a durable artifact they can review, share, or version-control independently of the blueprint.

**Filename:** `{feature-kebab-case}.brainstorm.md` (e.g. `regulatory-complaint.brainstorm.md`).

**Location:** depends on the project decision in Step 10. Until then, hold the contents in memory; do not guess a path.

**Required sections** (in this order):

```markdown
# {Feature Name} — Brainstorm

- **Feature:** `{kebab-case-name}`
- **Category:** `{category}`
- **Status:** Draft — pending `/fdl-create`
- **Date:** {YYYY-MM-DD}
- **Project:** {project name, filled in at Step 10}

## 1. Problem
{User's answer to Step 2 — what problem this solves for the end user.}

## 2. Success criteria
{User's answer to Step 3 — what has to be true for this to be "working".}

## 3. Failure modes
{Bulleted list from Step 4 — every failure the user named, each mapped to a tentative error code.}

## 4. Design approach
{Which of the Step 5 alternatives was chosen (A/B/C), and WHY — the user's reasoning, not yours.}

## 5. Data model
{Fields with type, required/optional, validation notes — from Step 6.1.}

## 6. Outcomes
### Success
{Given / then / result — from Step 6.2.}
### Failures
{One block per failure outcome, each with its error code — from Step 6.3.}

## 7. Security rules
{Auth, rate limits, input validation — from Step 6.4.}

## 8. Related blueprints
{From Step 6.5 — list as `category/feature` with relationship type.}

## 9. Skill delegations
{From Step 5 Axis 2. Record in this order — omit lines that didn't apply:}

- **Data source:** `{e.g. google-calendar via https://skills.sh/baphomet480/claude-skills/google-calendar}` — *Rationale: {user's reason}*
- **Stack companion:** `{e.g. shadcn via https://skills.sh/shadcn/ui/shadcn}` — *Rationale: {user's reason}*

{If no delegations were chosen, write "None — feature owns its own data and UI."}

## 10. Open questions
{Anything the user deferred or flagged as "figure out during /fdl-create". If none, write "None".}

## 11. Next step
Run `/fdl-create {feature-kebab-case}` to materialize this brainstorm into a validated YAML blueprint. Any skill delegations recorded in section 9 will be carried into the blueprint's `tags` and `related` fields so `/fdl-generate` picks them up automatically at code-generation time.
```

**Do NOT:**
- Invent content the user didn't confirm. If a section is thin, that means the brainstorm was thin — loop back to the relevant step and fill it before writing the doc.
- Include real data, credentials, or PII (per `CLAUDE.md` POPIA rules).
- Write the YAML itself — that's `/fdl-create`'s job.

### Step 10 — Ask about the project; create one if none exists

Before saving the brainstorm doc, ask the user where it belongs.

1. **Check for existing projects.** Look for a `projects/` directory at the repo root. If it exists, list its subdirectories to the user.
2. **Ask the user one question,** offering these options:
   - **Use an existing project** — pick one from the list (only if `projects/` has entries).
   - **Create a new project** — user supplies a kebab-case project name.
   - **Skip — don't store under a project** — save the doc to `docs/brainstorms/{feature}.brainstorm.md` instead.
3. **Apply the answer:**
   - **Existing project:** write to `projects/{project-name}/brainstorms/{feature}.brainstorm.md`. Create the `brainstorms/` subfolder if missing.
   - **New project:** create the full scaffold before writing:
     ```
     projects/{project-name}/
     ├── README.md              ← one-line description of the project
     ├── brainstorms/           ← design docs from /fdl-brainstorm
     └── blueprints/            ← symlink or placeholder; project-scoped blueprints go here
     ```
     Then write the brainstorm doc into `projects/{project-name}/brainstorms/`.
   - **Skip:** write to `docs/brainstorms/{feature}.brainstorm.md` (create the directory if missing). Still a durable artifact, just not project-scoped.
4. **Fill in the `Project:` field** in the doc's header before writing — with the chosen project name, or `(none)` if skipped.
5. **Confirm the write** by echoing the final path to the user.

Never overwrite an existing brainstorm doc. If the target filename already exists, suffix with `-v2`, `-v3`, etc. and tell the user what you did.

### Step 11 — Hand off to `/fdl-create`

Only after the brainstorm doc is written and its path confirmed:

> "Brainstorm saved to `{path}`. Now I'll create the blueprint."

Then invoke `/fdl-create` with the feature name, category, the full specification accumulated through steps 2-6, AND the skill delegations recorded in Step 5 Axis 2. Pass the delegations as part of the description so `/fdl-create` can fold them into the blueprint:

- **Data-source delegations** → add a tag like `delegate:google-calendar` and a `related:` entry pointing at the skill URL in a comment. The blueprint's `events:` payload references the skill's data shape rather than inventing a new schema.
- **Stack-companion delegations** → add a tag like `stack:shadcn`. The blueprint's `ui_hints` section notes that shadcn primitives should drive the component selection.
- **No delegations** → pass nothing extra; `/fdl-create` builds a vanilla blueprint.

`/fdl-create` then:
1. Writes the YAML (including any delegation tags from the brainstorm)
2. Runs `node scripts/validate.js` (schema)
3. Runs `node scripts/completeness-check.js` (semantic)
4. Triggers `/fdl-auto-evolve` (auto-commit)

Downstream, when the user later runs `/fdl-generate <feature>`, Step 0b and Step 0c of that skill will see the delegation tags in the blueprint and auto-wire the matching skills — closing the loop from brainstorm → blueprint → code without re-asking the user any of the decisions made here.

**If the blueprint fails either check, that's a failure of this skill too.** The brainstorm was incomplete. Go back to step 6 and find the missing piece. The brainstorm doc from Step 9 stays on disk regardless — it's the audit trail of the conversation.

## Explicit non-goals

- ❌ This skill does not write YAML (that's `/fdl-create`)
- ❌ This skill does not produce a task list
- ❌ This skill does not generate code
- ❌ This skill does not commit to git

**Outputs of this skill:**
1. A markdown brainstorm doc at `projects/{project}/brainstorms/{feature}.brainstorm.md` (or `docs/brainstorms/` if no project) — written in Step 9-10.
2. A handoff to `/fdl-create` with enough context to produce a clean, validated, complete blueprint — Step 11.

## Why this skill exists

FDL's existing skills assume the user knows what feature they want. That assumption breaks for greenfield cases where the user has a problem, not a solution. Without a front-end for ambiguity, users either:
1. Write vague blueprints that fail the completeness check, or
2. Skip FDL and go straight to code, losing the spec-first discipline.

`/fdl-brainstorm` closes that gap by borrowing the Socratic rigor from the Superpowers `brainstorming` skill and rebinding its terminal state from "write a design doc" to "hand off to `/fdl-create`".

## Example invocation

```
User: /fdl-brainstorm I need something to handle customer complaints

Claude: [Step 1a] Reading blueprints/INDEX.md and running blueprint-lookup.js for
        candidates: complaint, ticket, feedback, customer-support, ombudsman...
        Found `workflow/customer-support-ticket.blueprint.yaml`. It covers ticket
        intake, assignment, and resolution.
        [Step 1c] No stack or data-source keywords in the prompt — skipping skill scan.
        Is this what you need, or is this distinct?

User: It's distinct — these are regulatory complaints that need an ombudsman review.

Claude: [Step 2] What problem does this solve for the user? What happens if they
        don't have this feature?

User: Regulators require us to track every complaint, provide a resolution within
      30 days, and escalate to an ombudsman if unresolved.

Claude: [Step 3] So success means: (a) every complaint is logged, (b) resolution
        happens within 30 days, (c) unresolved ones reach an ombudsman. Anything
        I'm missing?

User: And the customer needs to acknowledge the resolution.

Claude: [Step 4] Good. What should happen when:
        - Complaint is filed but missing required info?
        - 30 days pass without resolution?
        - Ombudsman is unavailable?
        - Customer refuses to acknowledge?

[... continues through steps 5-8 ...]

Claude: [Step 9] Writing the brainstorm doc now.

        [Step 10] I don't see a `projects/` directory yet. Do you want to:
          1. Create a new project (give me a kebab-case name)
          2. Skip — save under `docs/brainstorms/` instead

User: New project — call it "ombudsman-portal".

Claude: Created `projects/ombudsman-portal/` with README, brainstorms/, and blueprints/.
        Saved brainstorm to:
        projects/ombudsman-portal/brainstorms/regulatory-complaint.brainstorm.md

        [Step 11] Now invoking /fdl-create regulatory-complaint workflow with the
        specification we built.
```
