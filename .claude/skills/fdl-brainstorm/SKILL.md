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

### Step 5b — Research all external systems, APIs, and hardware (mandatory, automatic)

**This step runs automatically after Step 5. Do NOT skip it. Do NOT use assumed or generic details.**

For every external system, API, payment rail, hardware device, or third-party service mentioned in the brainstorm, you MUST research the actual technical details before proceeding to Step 6. This means:

1. **Identify every external dependency** from the user's answers (payment rails, hardware SDKs, bank APIs, notification services, identity providers, etc.)

2. **For each dependency, use WebSearch and WebFetch to find:**
   - Official API documentation and developer portals
   - OpenAPI/Swagger specifications (fetch and extract operations)
   - Transaction limits, fee structures, SLAs
   - Authentication methods
   - Supported message formats (ISO 20022, REST, SOAP, etc.)
   - Participating institutions or supported regions
   - Certification or compliance requirements
   - Hardware specifications (if physical device)

3. **For hardware devices** (scanners, card readers, terminals):
   - SDK documentation and supported platforms
   - API operations and function signatures
   - Supported operating systems and architectures
   - Device specifications (scan distance, capture count, connection types)

4. **Record every researched detail** in working memory. These go into:
   - The blueprint's `rules:` section (accurate limits, SLAs, API operations)
   - The blueprint's `extensions:` section (API endpoints, SDK details, OpenAPI spec URLs)
   - The proposal's Appendix A (Technical Specifications)
   - The proposal's main body (accurate numbers, not guesses)

**Never use placeholder values.** If you cannot find the actual limit, fee, or SLA — say so explicitly in the proposal and flag it as "requires confirmation from provider". Do NOT invent numbers.

**Examples of what must be researched, not assumed:**
- PayShap transaction limit is R50,000 (not R5,000) — raised in August 2024
- PayShap proxy types include ShapID, phone, account, and Shap Name (not just phone and account)
- PayShap fees: R1 under R100, R5 for R100-R1,000, 0.05% or R35 cap above R1,000
- Palm vein scanner requires 4 captures for registration, uses near-infrared light, 15-30cm scan distance
- Electrum API is asynchronous (HTTP 202), uses ISO 20022 message types (pacs.008, pacs.002, pain.013)

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

### Step 9 — Write the business proposal (mandatory, client-facing)

Before any handoff, **always** write a comprehensive, client-presentable business proposal document. This is the primary deliverable of the brainstorm skill — it must be professional enough to present to stakeholders, clients, or decision-makers without editing.

**This is NOT a developer design doc.** It is a layered business proposal with an executive summary for non-technical readers and a technical appendix for engineers. Think of it as the document the user would email to their client or present in a meeting.

**Filename:** `{feature-kebab-case}.brainstorm.md` (e.g. `regulatory-complaint.brainstorm.md`).

**Location:** depends on the project decision in Step 10. Until then, hold the contents in memory; do not guess a path.

**Required sections** (in this order):

```markdown
# {Feature Name — Human-Readable Title}

## Business Proposal & Solution Design

---

## Original Request

> *"{The user's original request, quoted verbatim}"*

### Requirements Elicitation

The following requirements were gathered through structured questioning:

| Question | Answer |
|----------|--------|
| {Each question asked during Steps 2-6} | {The user's answer} |
| ... | ... |

{Include EVERY question-answer pair from the Socratic flow. This shows the client how the requirements were systematically extracted from a rough idea. It demonstrates the rigour of the process and creates an audit trail of decisions.}

---

## 1. Executive Summary

{2-3 paragraphs: what this is, what problem it solves, why it matters. Written for a non-technical executive who will read only this section. Include a value proposition table showing benefits for each stakeholder (customers, merchants, operators, etc.).}

{Include a "How It Works" subsection — a 30-second plain-English overview with numbered steps. No jargon.}

---

## 2. The Problem

{Describe the business problem this feature solves. Frame it from the end-user's and the business's perspective. Use bullet points for specific pain points. This comes from Step 2 but must be rewritten for a client audience — not raw notes.}

---

## 3. The Solution

{Detailed description of what the solution does. Break into subsections for each major capability.

**CRITICAL: Weave technical detail INTO the business narrative.** Both business and technical readers will look at this section. For each capability:
- Lead with what it does (business value)
- Follow with HOW it works (technical flow table showing each step, the system/API call, and timing)
- Include specific API endpoints, SDK functions, message formats, limits, and fees — inline, not in an appendix
- Use tables for structured data (parameters, fees, operations)

Example: don't just say "payments settle in real time" — show the 6-step flow from palm scan to pacs.008 credit transfer to pacs.002 settlement confirmation with timing at each step.

The appendix should contain reference tables (full API operation lists, SDK function signatures). The main body should contain enough technical detail that an engineer can evaluate feasibility without flipping to the appendix.}

---

## 4. User Journeys

{For each major user workflow, provide:}
- A clear ASCII flow diagram or numbered step sequence
- Time estimates per step
- What happens at each decision point
- What happens when things go wrong

{Minimum journeys: primary happy path, onboarding/setup, error recovery. Add more as the feature warrants.}

---

## 5. System Architecture

{Two levels:}

### 5.1 High-Level Overview
{ASCII architecture diagram showing all components, their relationships, and external systems. Label each box clearly.}

### 5.2 Component Summary
{Table with columns: Component | Purpose | Technology | Key Integration. Include the specific SDK, API, protocol, or library each component integrates with — not just generic labels like "Backend service".}

---

## 6. Offline / Resilience
{Only if applicable. How the system behaves when connectivity is lost, services are down, or partial failures occur. Include a table of configurable parameters with defaults.}

---

## 7. Operations & Management
{Only if applicable. Fleet management, monitoring, remote configuration, update strategy, alerting, decommissioning.}

---

## 8. Security & Compliance

### 8.1 Data Protection
{Table of security measures and their implementations. Cover encryption, authentication, fraud prevention.}

### 8.2 Regulatory Compliance
{Table: Regulation | Relevance | Approach. Cover all applicable regulations (POPIA, PCI DSS, GDPR, industry-specific).}

---

## 9. Risk Assessment

{Table: Risk | Likelihood | Impact | Mitigation. Cover at least 5-7 risks spanning technical, operational, adoption, and regulatory categories.}

---

## 10. Implementation Roadmap

{Break into 3-5 phases with week ranges. Each phase should have:}
- A clear name and time range
- 4-6 bullet points of deliverables
- Dependencies on previous phases

{End with a hardening/launch phase that includes security audit, compliance, pilot, and load testing.}

---

## 11. Key Metrics & Success Criteria

{Table: Metric | Target | How Measured. Include at least 5-6 measurable KPIs that prove the solution works.}

---

## 12. Production Readiness Assessment

{AUTO-GENERATED by Step 9b. Do not write this section manually — it is populated by the production readiness gap analysis.}

### 12.1 Initial Coverage (Before Gap Resolution)

{Table: Category | Status (Covered/Partial/Gap) | Covered By | Notes}

**Initial Score: {X} / {Total} — {percentage}%**

### 12.2 Gaps Identified

{Table: # | Gap | Why It's Needed for Production}

### 12.3 Steps Taken to Resolve Gaps

{For each gap, document what was actually done — not what "should" be done. This section is filled AFTER Step 11b executes gap resolution. Each entry records the action taken and its result.}

| # | Gap | Action Taken | Result |
|---|-----|-------------|--------|
| 1 | {gap name} | Ran `/fdl-recommend-discover` — found `org/repo`, extracted features via `/fdl-extract-code-feature` | Created `category/blueprint-name` blueprint |
| 2 | {gap name} | Ran `/fdl-recommend-discover` — no suitable repo found, created from scratch via `/fdl-create` | Created `category/blueprint-name` blueprint |
| 3 | {gap name} | Existing blueprint `category/existing` already covers this — linked via `related` array | Updated `related` in `terminal-payment-flow` |
| ... | ... | ... | ... |

### 12.4 Existing Blueprints Integrated

{Blueprints that already existed and were linked to the system:}

| Blueprint | Category | How It Fits | Link Added To |
|-----------|----------|------------|---------------|
| ... | ... | ... | ... |

### 12.5 Final Coverage (After Gap Resolution)

{Same table as 12.1 but updated after all gaps are resolved:}

{Table: Category | Status (Covered/Partial/Gap) | Covered By | Notes}

**Final Score: {X} / {Total} — {percentage}%**

{Verdict:}
{If below 80%: "This system requires further work before production deployment. Remaining gaps are listed above."}
{If 80-95%: "This system is near production-ready. Remaining items are non-blocking and can be addressed during the hardening phase."}
{If above 95%: "This system meets production readiness requirements."}

---

## Appendix A: Technical Specifications

{Tables of technical parameters organised by subsystem. Include hardware specs, API details, protocol versions, default configuration values. This is the section engineers will reference.}

---

## Appendix B: Feature Blueprint Reference

{Table listing all FDL blueprints (existing + new) with: Feature | Blueprint (hyperlinked) | One-line description.

**CRITICAL: The Blueprint column must be a clickable hyperlink** to the co-located `.md` file for that blueprint. Use relative paths from the proposal's location to `blueprints/{category}/{feature}.md`. Example:

```
| Palm Pay | [`payment/palm-pay`](../../blueprints/payment/palm-pay.md) | Palm template to payment proxy linking |
```

Adjust the relative path depth (`../../`) based on where the proposal is saved. If saved under `projects/{name}/brainstorms/`, use `../../../blueprints/...`. If under `docs/plans/`, use `../../blueprints/...`. If under `docs/brainstorms/`, use `../../blueprints/...`.

Never use plain text or backtick-only references — every blueprint name must be a working link.}

---

## Appendix C: Design Decisions Log

- **Feature:** `{kebab-case-name}`
- **Category:** `{category}`
- **Date:** {YYYY-MM-DD}
- **Status:** Draft — pending `/fdl-create`

### Decisions Made During Brainstorm
{Record every decision from the Socratic questioning: what was chosen and why. This is the audit trail.}

### Skill Delegations
{From Step 5 Axis 2. Record data sources and stack companions chosen, or "None".}

### Open Questions
{Anything deferred. If none, write "None".}

### Next Steps
Run `/fdl-create {feature-kebab-case}` to materialise this brainstorm into validated YAML blueprints.

---

## Appendix D: Build Commands

### Production Readiness Status

{Summary table showing:}

| Metric | Value |
| --- | --- |
| **Initial assessment** | {X} / {Total} categories — **{percentage}%** |
| **After gap resolution** | {Y} / {Total} categories — **{percentage}%** |
| **Total blueprints** | {N} ({breakdown by new/gap-fill/existing}) |
| **Verdict** | **{Production-ready / Near-ready / Not ready}** — {summary} |

### Remaining Gaps to Fill Before Building

{If any gaps remain unresolved, list each with the exact command to resolve it. If all gaps are resolved, write "None — all production categories covered."}

| Gap | How to Fill | Command |
| --- | --- | --- |
| {gap name} | {approach: create from scratch / extract from repo / link existing} | {exact `/fdl-create` or `/fdl-recommend-discover` or `/fdl-extract-code-feature` command} |

{Include pre-build validation gate:}

```bash
# Verify all blueprints are valid
node scripts/validate.js

# Verify no incomplete blueprints
node scripts/completeness-check.js
```

**Do NOT proceed to build until all gaps read "Covered" and both checks pass.**

---

### Build Commands

{List every `/fdl-generate` command needed to produce a complete implementation from the blueprints. Organise by phase matching the Implementation Roadmap (Section 10). Include ALL blueprints — both new and existing — that are part of this system.}

```bash
# Phase 1: {phase name}
/fdl-generate {blueprint-name} {target-framework}
/fdl-generate {blueprint-name} {target-framework}

# Phase 2: {phase name}
...
```

{End with validation and auto-evolve commands. Include a total count line:}
"Total: {N} blueprints → {N} `/fdl-generate` commands → production-ready {system description}"

**This section is mandatory.** The user must be able to copy-paste these commands and build the entire system. If a blueprint is in Appendix B but not in Appendix D, the system is incomplete.}
```

**Writing guidelines:**
- **Tone:** Professional, confident, jargon-free in the main body. Technical precision in the appendices.
- **Tables over prose:** Use tables for any structured data (comparisons, parameters, risks). They scan faster.
- **Diagrams:** Always use **Mermaid** (` ```mermaid ` code blocks) for all diagrams — architecture, flows, state machines, sequences. Never use ASCII art. Mermaid renders as proper vector graphics on GitHub and in VS Code. Use `flowchart TD` for payment/user flows, `graph TD` for architecture overviews, `sequenceDiagram` for API interactions, `stateDiagram-v2` for state machines.
- **Be comprehensive:** A thin proposal signals a thin brainstorm. If a section feels empty, loop back to the relevant Socratic step and gather more information before writing.
- **Fill every section or explicitly mark N/A:** Don't silently skip sections. If "Offline / Resilience" doesn't apply, write "Not applicable — this feature requires constant connectivity."
- **South African context:** Use ZAR for currency, reference POPIA (not GDPR) as primary privacy regulation, reference SARB where relevant for financial services.

**Do NOT:**
- Produce a developer cheat sheet with bullet points and YAML paths. That's what `blueprints/INDEX.md` and the co-located readmes are for.
- Invent content the user didn't confirm. If the brainstorm didn't cover a section, loop back and ask.
- Include real data, credentials, or PII (per `CLAUDE.md` POPIA rules).
- Write the YAML itself — that's `/fdl-create`'s job.
- Use internal jargon like "blueprint", "FDL", or "outcome" in the executive summary. Those terms belong in the appendices only.

### Step 9b — Production readiness gap analysis (mandatory, automatic)

**This step runs automatically after writing the proposal. Do NOT skip it. Do NOT wait for the user to ask.**

The brainstorm proposal describes the *desired* system. This step audits it against what a **production-ready** deployment actually requires and surfaces every gap — missing blueprints, missing infrastructure, missing compliance, missing operational tooling.

#### 9b.1 — Define the production checklist

Every production system needs these categories covered. Walk through each one and check whether the brainstorm's blueprint set (existing + new) addresses it:

| Category | What it covers | Examples |
|----------|---------------|----------|
| **Authentication** | How do operators log in to the system? | Terminal login, API auth, service-to-service auth |
| **Authorisation** | Who can do what? Role separation? | Manager vs cashier, admin vs operator, RBAC |
| **Transaction records** | Is every transaction persisted and queryable? | Transaction history, search, export |
| **Reconciliation** | Can the business prove money moved correctly? | End-of-day settlement, bank statement matching |
| **Notifications** | How are users/operators informed? | SMS (OTP, receipts), email, push alerts |
| **Audit trail** | Is every action logged immutably? | Audit logging with tamper detection, retention policy |
| **Fraud & risk** | How is fraud detected and prevented? | Velocity checks, anomaly scoring, device fingerprinting |
| **Disputes** | How are chargebacks/complaints handled? | Dispute lifecycle, evidence submission, resolution |
| **Compliance** | Regulatory requirements met? | POPIA, PCI DSS, FICA, SARB, industry-specific |
| **Observability** | Can ops see what's happening in production? | Metrics, dashboards, alerting, health checks |
| **Encryption & keys** | Is data protected at rest and in transit? | HSM, key rotation, certificate management |
| **Customer data** | Where are customer profiles stored? | Customer DB, consent management, data export |
| **Hardware integration** | Are all hardware SDKs covered? | EMV kernel, card reader SDK, biometric scanner SDK |
| **Resilience** | What happens when things fail? | Offline mode, circuit breakers, retry policies, failover |
| **Operations** | How is the system managed day-to-day? | Fleet management, remote config, OTA updates, decommissioning |
| **Testing** | How is quality assured? | Test strategy, load testing, penetration testing |

#### 9b.2 — Search for existing blueprints that fill gaps

For each gap identified, search `blueprints/INDEX.md` for existing blueprints that could fill it. Use the same lookup approach as Step 1a:

1. Read `blueprints/INDEX.md`
2. For each gap category, search for relevant keywords
3. Classify each existing blueprint as: **direct match** (covers the gap fully), **partial match** (covers some of it), or **no match**

#### 9b.3 — Discover and resolve extraction candidates for remaining gaps

For gaps where no existing blueprint provides coverage:

1. **First check `data/extraction-candidates.yaml`** for repos that implement the missing capability. Use the same approach as Step 1b.
2. **If no candidate exists in the map, run `/fdl-recommend-discover` automatically** for each gap. Do NOT just list it as a suggestion — actually execute the discovery. Pass the gap description as keywords so the web search finds relevant repos.
3. **Record every action taken** — what was searched, what was found (or not found), what was extracted. This becomes the "Steps Taken" table in Section 12.3 of the proposal.

#### 9b.4 — Write the gap analysis into the proposal

Add the following sections to the business proposal (between "Key Metrics" and "Appendix A"):

```markdown
---

## 12. Production Readiness Assessment

### 12.1 Coverage Summary

| Category | Status | Covered By | Notes |
|----------|--------|-----------|-------|
| Authentication | Covered | `auth/login` | Needs `related` link to terminal flow |
| Authorisation | Covered | `access/role-based-access` | Configure manager vs cashier roles |
| Transaction records | Gap | — | Need transaction history blueprint |
| ... | ... | ... | ... |

### 12.2 Gaps Requiring New Blueprints

{For each gap not covered by any existing blueprint:}

| # | Gap | Why It's Needed | Recommended Approach |
|---|-----|-----------------|---------------------|
| 1 | Fraud detection | Production payment systems must detect and block suspicious transactions | Create new blueprint or extract from open-source fraud engine |
| 2 | ... | ... | ... |

### 12.3 Existing Blueprints to Integrate

{Blueprints that exist but aren't yet linked to this system:}

| Blueprint | Category | How It Fits | Action Needed |
|-----------|----------|------------|---------------|
| `sms-notifications` | notification | OTP delivery during enrollment, receipt sending | Add `related` entry in `terminal-enrollment` and `terminal-payment-flow` |
| ... | ... | ... | ... |

### 12.4 Recommended Extractions

{For gaps where open-source repos exist that implement the feature:}

| Gap | Recommended Repo | Why This Repo | Command |
|-----|-----------------|---------------|---------|
| Fraud detection | `org/fraud-engine` | Implements velocity checks, risk scoring, and rule engine | `/fdl-extract-code-feature https://github.com/org/fraud-engine` |
| ... | ... | ... | ... |

{If no extraction candidates exist for a gap, recommend `/fdl-recommend-discover` to find one, or `/fdl-create` to build from scratch.}

### 12.5 Production Readiness Score

**{X} / {Total} categories covered** — {percentage}%

{If below 80%: "This system is NOT production-ready. The gaps above must be addressed before launch."}
{If 80-95%: "This system is near production-ready. Address the remaining gaps during the hardening phase."}
{If above 95%: "This system meets production readiness requirements."}
```

#### 9b.5 — Execute gap resolution automatically

**Do NOT present gaps as suggestions or ask the user what to do. Act on them immediately.**

After the initial gap analysis:

1. **For each gap with no extraction candidate in `data/extraction-candidates.yaml`:**
   - Run `/fdl-recommend-discover` with the gap description as keywords
   - If a repo is found: run `/fdl-extract-code-feature <repo-url>` to extract relevant features
   - If no repo is found: create the blueprint from scratch via `/fdl-create` using the production checklist requirements as the spec

2. **For each gap with an existing extraction candidate:**
   - Run `/fdl-extract-code-feature <repo-url>` directly

3. **For each existing blueprint that needs integration:**
   - Update `related` arrays in both directions

4. **Record every action and result** in the "Steps Taken" table (Section 12.3)

5. **Re-score production readiness** and write Section 12.5 (Final Coverage)

6. **Present the before/after summary to the user:**

> "Production readiness assessment complete.
>
> **Before:** {X}/{Total} ({percentage}%)
> **After:** {Y}/{Total} ({percentage}%)
>
> **Steps taken:**
> 1. {action 1} — {result}
> 2. {action 2} — {result}
> ...
>
> **Remaining gaps (if any):** {list, or 'None — all categories covered'}"

**The gap analysis is the brainstorm's quality gate.** A brainstorm that doesn't surface AND resolve gaps is a brainstorm that will fail in production. This step ensures the user leaves with a production-ready system, not just a happy-path design.

**HARD RULE: No gap may remain as "Pending" when the brainstorm finishes.**

Every row in Section 12.3 (Steps Taken) must have an actual result — either a created blueprint, an extracted blueprint, or an updated `related` array. If a gap cannot be resolved (e.g., requires a proprietary API the user must provide), it must be explicitly flagged as "BLOCKED — requires {specific thing from user}" with a clear action item, not silently left as "Pending".

The brainstorm skill does NOT terminate until:
1. Every gap has been acted on (blueprint created, extraction run, or explicitly blocked with reason)
2. Every existing blueprint that needs integration has its `related` arrays updated
3. Section 12.5 (Final Coverage) shows the actual final score (not "Pending")
4. Appendix B lists ALL blueprints including gap-filling ones, with hyperlinks
5. The proposal document is fully self-consistent — no section references a "Pending" action

**Why this matters for `/fdl-generate`:** The proposal is ultimately a plan for code generation. `/fdl-generate` works from blueprints. If a gap blueprint doesn't exist, `/fdl-generate` cannot generate that capability, and the system ships with a hole. Every "Pending" in the proposal is a production defect waiting to happen.

### Step 9c — Flat prototype (clickable HTML showcase)

After the gap analysis, offer the user a self-contained, clickable HTML prototype of the feature. The prototype is a **showcase and adjustment tool** — it lets stakeholders see and click through the feature before a single line of production code is written. Think Figma mockup, but in a plain HTML file that needs no design tool, no build step, and no internet connection.

**This step is offered, not forced.** Ask once via `AskUserQuestion`:

> "Want me to generate a clickable HTML prototype of this feature?
>
> It will show the main screens (happy path + key error states) using the design tokens from `DESIGN.md` if one exists. You can open it in a browser, adjust the HTML directly, or share it with stakeholders for feedback.
>
> (yes · no)"

If the user says **no**, skip this step entirely. Do not re-ask.
If the user says **yes**, proceed with the generation rules below.

#### What the prototype covers

Derive the screen list directly from the brainstorm (Steps 3–6). Do not invent screens the brainstorm did not establish.

| Brainstorm source | Screen to generate |
|---|---|
| Step 3 happy path | Primary success view (confirmation, list, dashboard panel) |
| Step 6 "Data" section fields | Form screen with all collected fields + a submit button |
| Step 4 failure modes | One error-state screen per major failure (form validation, auth, service-down) |
| Step 6 user journey — multi-step | Wizard/step sequence (one HTML panel per step, Next/Back nav) |
| Step 6 "states" (state machine) | A status timeline or badge showing the lifecycle |
| Actor: admin / manager | Admin view screen (approve/reject actions, list of items) |

Keep to the screens you can justify from the brainstorm. Three well-derived screens beat eight invented ones.

#### Generation rules

**Self-contained single file** — one `.html` file, inline `<style>` and `<script>`, zero external dependencies. Must open correctly with `file://` in any modern browser.

**Navigation** — clicking a button or action transitions to the relevant screen. Implement with vanilla JS that shows/hides named `<section id="screen-*">` panels:

```js
function show(id) {
  document.querySelectorAll('[data-screen]').forEach(s => s.hidden = true);
  document.getElementById(id).hidden = false;
}
```

**Design tokens** — check whether `DESIGN.md` exists at project root or the target path:
- If it exists, parse the `## tokens` YAML block and apply colors, typography, radius, shadows as inline CSS custom properties on `:root`. Use the exact hex values from the file.
- If it doesn't exist, apply a clean neutral default palette (white bg, #0F172A text, #6366F1 primary, 6px radius, Inter/system font). This default is intentionally conservative — it showcases the layout, not a brand.

**Layout** — use a simple centered-content shell. On desktop, cap width at 860px. No grid frameworks.

**Prototype badge** — every screen must show a fixed top-right badge:

```html
<div style="position:fixed;top:12px;right:12px;background:#FEF3C7;color:#92400E;
            padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;
            border:1px solid #FCD34D;z-index:9999">
  FDL Prototype · Not for production
</div>
```

**Screen nav bar** — a fixed bottom or sidebar panel listing all screen names so reviewers can jump around without following the happy path:

```html
<nav style="position:fixed;bottom:0;left:0;right:0;background:#F8FAFC;
            border-top:1px solid #E2E8F0;display:flex;gap:8px;padding:8px 16px;
            overflow-x:auto;z-index:9998">
  <button onclick="show('screen-form')">Form</button>
  <button onclick="show('screen-success')">Success</button>
  <button onclick="show('screen-error')">Error</button>
  <!-- one button per screen -->
</nav>
```

**Interactivity** — keep it minimal but convincing:
- Form fields are real `<input>` / `<select>` / `<textarea>` elements (they hold values, but submission is faked).
- Submit button runs a brief "processing" state (1.2s spinner) then shows the success screen.
- Error state is reachable via a nav-bar button OR a "simulate error" toggle.
- State badges reflect the lifecycle from the brainstorm's `states` section.

**Annotation comments** — each screen section starts with an HTML comment that links it back to the brainstorm:

```html
<!-- Screen: form
     Source: Step 6 "Data" section — fields: {field list}
     Blueprint outcome: {outcome name} -->
```

#### File naming and location

Hold in memory until Step 10 resolves the save path. Then write to:

```
projects/{project}/brainstorms/{feature}.prototype.html
```

Or, if the user skipped project setup:

```
docs/brainstorms/{feature}.prototype.html
```

Print the final path after writing:

```
✓ Prototype written: projects/{project}/brainstorms/{feature}.prototype.html
  Open in browser → file://{absolute-path}
  Screens: {N} ({comma-separated screen names})
  Tokens: {DESIGN.md found and applied | default palette used}
```

#### What this prototype is NOT

- Not production code — never connected to a backend, never committed as app source.
- Not a Figma replacement — no design-token export, no component library, no constraints.
- Not editable by the skill — the user adjusts the HTML directly in a text editor. The skill generates once; subsequent edits are manual.
- Not re-generated automatically — running the brainstorm again offers a fresh prototype but does not overwrite an existing one without confirmation.

---

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

### Step 11 — Hand off to `/fdl-create` and execute gap resolution

Only after the brainstorm doc is written and its path confirmed:

> "Brainstorm saved to `{path}`. Now I'll create the blueprints and resolve gaps."

#### 11a — Create the primary blueprints

Invoke `/fdl-create` for each new blueprint identified during the brainstorm, with the full specification accumulated through steps 2-6, AND the skill delegations recorded in Step 5 Axis 2. Pass the delegations as part of the description so `/fdl-create` can fold them into the blueprint:

- **Data-source delegations** → add a tag like `delegate:google-calendar` and a `related:` entry pointing at the skill URL in a comment. The blueprint's `events:` payload references the skill's data shape rather than inventing a new schema.
- **Stack-companion delegations** → add a tag like `stack:shadcn`. The blueprint's `ui_hints` section notes that shadcn primitives should drive the component selection.
- **No delegations** → pass nothing extra; `/fdl-create` builds a vanilla blueprint.

#### 11b — Resolve gaps automatically (from Step 9b)

After primary blueprints are created, execute the gap resolution plan from Step 9b **automatically** — do not wait for the user to ask:

1. **Extractions first:** For each gap with a recommended extraction candidate, invoke `/fdl-extract-code-feature <repo-url>`. Present the feature menu to the user and extract selected features.

2. **New blueprints second:** For each gap needing a new blueprint (no extraction candidate available), invoke `/fdl-create` with a spec derived from the gap description and the production checklist requirements.

3. **Related links last:** For each existing blueprint that should be integrated, update the `related` arrays in both the existing blueprint and the new blueprints to cross-reference each other.

#### 11c — Auto-evolve

After all blueprints are created and gaps resolved:

1. Run `node scripts/validate.js` (schema) — all blueprints must pass
2. Run `node scripts/completeness-check.js` (semantic) — all blueprints must pass
3. Trigger `/fdl-auto-evolve` (validate, generate docs, AGI propagation, commit)

#### 11d — Final production readiness re-check

After gap resolution, re-run the production readiness checklist from Step 9b against the updated blueprint set. Update the proposal document's Section 12 with the new scores. Report to the user:

> "Gap resolution complete. Production readiness: **{X}/{Total} ({percentage}%)**
>
> **Resolved:** {list of gaps that were filled}
> **Remaining:** {list of any gaps still open, with recommended next steps}
>
> Proposal updated at `{path}`."

**If the blueprint fails either check, that's a failure of this skill too.** The brainstorm was incomplete. Go back to step 6 and find the missing piece. The brainstorm doc from Step 9 stays on disk regardless — it's the audit trail of the conversation.

## Explicit non-goals

- ❌ This skill does not write YAML (that's `/fdl-create`)
- ❌ This skill does not produce a task list
- ❌ This skill does not generate code
- ❌ This skill does not commit to git
- ❌ This skill does not produce developer-only internal docs — the output must be client-presentable

**Outputs of this skill (all produced automatically):**
1. A **client-facing business proposal** at `projects/{project}/brainstorms/{feature}.brainstorm.md` (or `docs/brainstorms/` if no project) — comprehensive enough to present to stakeholders without editing.
2. A **production readiness gap analysis** embedded in the proposal (Section 12) — identifies every missing capability, maps existing blueprints, and recommends extractions.
3. **Clickable HTML prototype** at `projects/{project}/brainstorms/{feature}.prototype.html` (optional, Step 9c) — self-contained flat mockup of all key screens, zero dependencies, opens in any browser. Uses design tokens from `DESIGN.md` if present.
4. **Primary blueprints** created via `/fdl-create` — the core features designed during the brainstorm.
5. **Gap-filling blueprints** created via `/fdl-create` or `/fdl-extract-code-feature` — addressing every gap the analysis identified.
6. **Cross-references updated** — `related` arrays linked between all new and existing blueprints.
7. **Auto-evolve** — validation, docs generation, AGI propagation, and commit.

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

Claude: [Step 1b] Checking extraction-candidates.yaml for "complaint", "ombudsman",
        "regulatory" in category "workflow"... no candidates found.
        Two options: (1) discover a repo, or (2) create from scratch.

User: Create from scratch — this is very specific to our domain.

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

### Example: extraction path (gap filled from a known repo)

```
User: /fdl-brainstorm I need role-based access control for my app

Claude: [Step 1a] Reading blueprints/INDEX.md and running blueprint-lookup.js for
        candidates: rbac, role, permission, access, authorization...
        Found `access/role-based-access.blueprint.yaml` — but it's a basic RBAC
        pattern. Let me check if it covers your needs.
        Is this what you need, or is this distinct?

User: I need something more advanced — policy-based, with conditions and deny rules.

Claude: [Step 1b] Checking extraction-candidates.yaml for "access", "rbac", "policy",
        "authorization" in category "access"...
        Found candidates:
        1. `openfga/openfga` — Relationship-based access control (ReBAC) with
           conditional rules and policy evaluation
        2. `cerbos/cerbos` — Policy-as-code access control with conditions, deny
           rules, and audit logging

        Three options:
        1. **Extract from a repo** — I'll scan one of these and you pick the features
        2. **Discover a different repo** — I'll search for other options
        3. **Create from scratch** — Socratic design from your requirements

User: Extract from cerbos — that's exactly what I need.

Claude: Handing off to /fdl-extract-code-feature https://github.com/cerbos/cerbos
        [brainstorm exits — extraction skill takes over]
```
