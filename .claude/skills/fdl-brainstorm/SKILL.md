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

## Workflow (9 steps, executed one at a time)

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

### Step 9 — Hand off to `/fdl-create`

The terminal action of this skill is:

> "Great — I have everything I need. Now I'll create the blueprint."

Then invoke `/fdl-create` with the feature name, category, and the full specification accumulated through steps 2-6. `/fdl-create` then:
1. Writes the YAML
2. Runs `node scripts/validate.js` (schema)
3. Runs `node scripts/completeness-check.js` (semantic)
4. Triggers `/fdl-auto-evolve` (auto-commit)

**If the blueprint fails either check, that's a failure of this skill too.** The brainstorm was incomplete. Go back to step 6 and find the missing piece.

## Explicit non-goals

- ❌ This skill does not write YAML
- ❌ This skill does not produce a markdown design document
- ❌ This skill does not produce a task list
- ❌ This skill does not generate code
- ❌ This skill does not commit to git

The ONLY output is a handoff to `/fdl-create` with enough context to produce a clean, validated, complete blueprint.

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

Claude: [Step 9] I have everything I need. Invoking /fdl-create regulatory-complaint
        workflow with the specification we built.
```
