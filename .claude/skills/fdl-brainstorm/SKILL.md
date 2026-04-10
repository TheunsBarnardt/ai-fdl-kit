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
- User is describing an existing feature → search blueprints first

## Core principle — borrowed from Superpowers `brainstorming`, re-bound to FDL

Superpowers' brainstorming skill ends by writing a design doc to `docs/superpowers/specs/`. This skill ends by invoking `/fdl-create` with a specification detailed enough to produce a valid blueprint. **The blueprint is the only acceptable terminal state of the FDL system — no markdown design docs, no task lists, no pseudocode.**

## Workflow (11 steps, executed one at a time)

### Step 1 — Explore existing context

Before asking anything, glob `blueprints/**/*.blueprint.yaml` and scan categories. If a blueprint already exists that's similar to what the user described, tell them:

> "There's already a `{existing}` blueprint in `{category}` that does X. Do you want to extend it, create a variant, or build something distinct?"

Never invent a new blueprint when an existing one would do.

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

### Step 5 — Propose 2-3 approaches with trade-offs

Never jump to a single solution. Lay out alternatives:

> "There are a few ways to model this. Each has trade-offs:
>
> **A. Simple CRUD-style** — One outcome per operation (create/read/update/delete), no state machine. Simple, fast to implement. Good if the lifecycle is trivial.
>
> **B. State machine** — Add a `states:` section with valid transitions (draft → submitted → approved → paid). More work, but makes the lifecycle explicit and prevents illegal transitions.
>
> **C. Full workflow** — Add `actors:` (humans + systems), `flows:` (step-by-step procedures), and `sla:` (time limits). Right choice when humans are making decisions in the loop.
>
> Given what you described, I'd lean toward **B**. Which matches your mental model?"

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

## 9. Open questions
{Anything the user deferred or flagged as "figure out during /fdl-create". If none, write "None".}

## 10. Next step
Run `/fdl-create {feature-kebab-case}` to materialize this brainstorm into a validated YAML blueprint.
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

Then invoke `/fdl-create` with the feature name, category, and the full specification accumulated through steps 2-6. `/fdl-create` then:
1. Writes the YAML
2. Runs `node scripts/validate.js` (schema)
3. Runs `node scripts/completeness-check.js` (semantic)
4. Triggers `/fdl-auto-evolve` (auto-commit)

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

Claude: [Step 1] Let me check what's already in the blueprints...
        Found `workflow/customer-support-ticket.blueprint.yaml`. It covers ticket
        intake, assignment, and resolution. Is this what you need, or is this
        distinct?

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
