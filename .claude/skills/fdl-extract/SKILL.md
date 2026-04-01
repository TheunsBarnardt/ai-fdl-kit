---
name: fdl-extract
description: Extract business rules and requirements from a document into an FDL blueprint
user_invocable: true
command: fdl-extract
arguments: "<file-path> [feature-name] [category]"
---

# FDL Extract — Document to Blueprint

Read a business document (BRD, PRD, SOP, compliance policy, process map, or any requirements doc) and extract the rules, fields, outcomes, actors, and states into a complete FDL blueprint YAML file. The user does NOT need to know YAML — use plain language throughout.

## Core Principle: Plain Language, No YAML Jargon

- NEVER show raw YAML during the conversation
- NEVER use FDL-specific terms with the user (outcomes, flows, events, etc.)
- DO use AskUserQuestion to clarify ambiguities found in the document
- DO present extracted information as plain-English bullet points
- DO generate YAML silently behind the scenes
- DO flag things the document doesn't make clear — ask the user rather than guessing

## Usage

```
/fdl-extract docs/expense-policy.pdf expense-approval workflow
/fdl-extract requirements/checkout-brd.docx checkout payment
/fdl-extract specs/onboarding-flow.md onboarding ui
/fdl-extract screenshots/process-diagram.png
```

## Arguments

- `<file-path>` — Path to the document. Supported: PDF, DOCX, TXT, MD, images (PNG, JPG — for flowcharts/diagrams)
- `[feature-name]` — Optional kebab-case name. If omitted, infer from the document title or ask.
- `[category]` — Optional. One of: auth, data, access, ui, integration, notification, payment, workflow. If omitted, infer or ask.

## Workflow

### Step 1: Read the Document

1. Use the Read tool to load the file
   - PDF: Use the `pages` parameter for large documents (read in chunks of 20 pages)
   - DOCX: Read tool handles Word documents natively
   - Images: Read tool renders images visually — useful for flowcharts and process diagrams
   - TXT/MD: Read directly
2. If the document is very large (100+ pages), ask the user which sections are most relevant

### Step 2: Analyze and Extract

Systematically scan the document for each FDL construct. For each item found, note the source (page number, section heading, or quote snippet) so the user can trace back.

#### Extract these elements:

| FDL Construct | What to look for in the document |
|---------------|----------------------------------|
| **Fields** | Input forms, data fields, "the user enters...", field names in tables, entity attributes, database columns |
| **Rules** | "Must", "shall", "required", constraints, thresholds, limits, policies, "no more than", "at least", security requirements, compliance mandates |
| **Outcomes** | Success criteria, acceptance criteria, "the system should...", "when X then Y", expected results, postconditions. Convert these to given/then/result format. |
| **Flows** | Step-by-step procedures, process descriptions, "first... then...", numbered lists, flowchart paths. Only extract as flows if the document describes exact procedures for human actors. |
| **Actors** | Role names, department names, "the manager...", "the system...", RACI matrices, swimlane labels, job titles |
| **States** | Status values, lifecycle stages, "pending", "approved", "draft → submitted", state transition tables |
| **SLAs** | Deadlines, turnaround times, "within 48 hours", "must be completed by", escalation rules, response time targets |
| **Errors** | Failure cases, "if X fails then...", exception handling, error messages, rejection scenarios |
| **Events** | Triggers, "when X happens notify Y", email notifications, alerts, webhooks, "on completion..." |
| **Validation** | Data format rules, length limits, required fields, pattern constraints, "must be a valid email" |
| **Security** | Authentication requirements, authorization rules, rate limits, encryption, audit logging, OWASP references |
| **Relationships** | References to other features/systems, dependencies, integrations, "requires login", "connects to payment" |

#### Extraction rules:

- **Be conservative** — only extract what the document explicitly states. Don't invent requirements.
- **Preserve the document's language** — use the exact thresholds, limits, and terminology from the doc.
- **Flag ambiguity** — if a requirement is vague ("should be fast", "must be secure"), add it to the ambiguous items list.
- **Map to FDL types** — convert document language to FDL constructs (e.g., "the employee fills in their name" → field: `name`, type: text, required: true).

### Step 3: Present Extraction Summary

Before generating, show the user what was found **in plain language** (no YAML jargon):

```
Here's what I found in docs/expense-policy.pdf:

DATA THE FEATURE NEEDS:
  8 fields — title, amount, currency, category, date, description, receipt, status

WHAT SHOULD HAPPEN:
  ✓ Expense submitted → manager notified, starts review
  ✓ Manager approves → auto-approved if under $1,000, otherwise goes to finance
  ✓ Finance approves → queued for payment
  ✓ Payment processed → employee notified, marked as paid
  ✗ Rejected → employee notified with reason, can revise and resubmit

WHO'S INVOLVED:
  4 roles — Employee, Direct Manager, Finance Manager, Payment System

LIFECYCLE:
  draft → submitted → approved → paid (+ rejected branch)

TIME LIMITS:
  - Manager must review within 48 hours
  - Finance must review within 72 hours
  - End-to-end within 30 days

⚠ THINGS THE DOCUMENT DOESN'T MAKE CLEAR:
  - "Expenses should be processed quickly" — how quickly? What's the target?
  - "Large purchases may need additional approval" — what's the dollar threshold?
```

**Use AskUserQuestion** to clarify ambiguous items:
"I found a couple of things the document doesn't specify clearly. Can you help?"
- Present each ambiguous item as a question with suggested options

Wait for user confirmation before proceeding.

### Step 4: Check Existing Blueprints

1. Glob for `blueprints/**/*.blueprint.yaml`
2. Parse all existing blueprints
3. Check if this feature name already exists (warn if so — offer to merge or create new)
4. Identify relationships:
   - Does any existing blueprint reference this feature?
   - Should this blueprint reference existing ones?
5. Show the dependency graph

### Step 5: Generate the Blueprint

Generate a complete `.blueprint.yaml` following the FDL meta-schema. Use the standard FDL file format:

```yaml
# ============================================================
# {FEATURE_NAME} — Feature Blueprint
# FDL v0.1.0 | Blueprint v1.0.0
# ============================================================
# Extracted from: {source document path}
# {Brief description of the source document}
# ============================================================

feature: {feature-name}
version: "1.0.0"
description: {one-line description}
category: {category}
tags: [{relevant, tags}]

actors:
  # Only include if actors were found in the document

fields:
  # Every field with name, type, required, label, validation

states:
  # Only include if state machine / lifecycle was found

rules:
  # All business rules, security policies, constraints
  # Include source references as YAML comments:
  #   # Source: Section 3.2, "Expenses over $1,000 require finance approval"

sla:
  # Only include if time constraints were found

outcomes:
  # Preferred: given/then/result acceptance criteria extracted from the document
  # Convert "when X happens, the system should Y" into outcome format

flows:
  # Only include alongside outcomes when the document describes exact procedures
  # for human actors (approval workflows, manual processes)
  # Include actor on each step when known
  # Include condition for conditional steps

errors:
  # UPPER_SNAKE_CASE codes, user-safe messages

events:
  # dot.notation names with payload fields

related:
  # Connections to existing blueprints

ui_hints:
  # Only include if the document describes UI/forms

extensions:
  # Only include if framework-specific details are mentioned
```

#### Source traceability

Add YAML comments that reference the source document:

```yaml
rules:
  approval:
    finance_threshold: 1000
    # Source: Section 4.1 — "Expenses exceeding $1,000 require Finance Department approval"
```

This allows anyone to trace a rule back to the original document.

### Step 6: Validate

1. Write the file to `blueprints/{category}/{feature}.blueprint.yaml`
2. Run `node scripts/validate.js blueprints/{category}/{feature}.blueprint.yaml`
3. If validation fails, fix the issues and re-validate
4. If cross-reference warnings appear, note them in the output

### Step 7: Output Summary

```
Created: blueprints/workflow/expense-approval.blueprint.yaml
Source:  docs/expense-policy.pdf

Feature: expense-approval v1.0.0
Actors:  4 (employee, manager, finance_manager, payment_system)
Fields:  8 (title, amount, currency, category, date, description, receipt, status)
States:  6 (draft → submitted → manager_approved → approved → paid, + rejected)
Flows:   4 (submit, manager_review, finance_review, payment)
SLAs:    3 (48h manager review, 72h finance review, 30d end-to-end)
Errors:  5
Events:  4

Validation: PASS (2 warnings — missing related blueprints)

⚠ Items that could not be mapped:
  - "Expenses should be processed quickly" — too vague for an SLA, needs a specific duration
  - Section 7 references "tax reporting integration" — no FDL blueprint exists for this yet

💡 Suggested next steps:
  - Create blueprints for missing related features: file-upload, notifications
  - Clarify ambiguous items with the document author
  - Run /fdl-generate expense-approval nextjs to generate implementation code
```

## Extraction Quality Checklist

### Accuracy
- [ ] Every extracted rule has a source reference (section/page/quote)
- [ ] Thresholds and limits match the document exactly (don't round or approximate)
- [ ] Field names are derived from the document's terminology
- [ ] No requirements were invented — only what the document states

### Completeness
- [ ] All sections of the document were scanned
- [ ] Both happy path AND exception paths were captured
- [ ] Validation rules were extracted for every field
- [ ] Security and compliance requirements were captured
- [ ] Ambiguous items were flagged, not silently dropped

### FDL Compliance
- [ ] Feature name: kebab-case
- [ ] Field names: snake_case
- [ ] Error codes: UPPER_SNAKE_CASE
- [ ] Event names: dot.notation
- [ ] Actor IDs: snake_case
- [ ] All required top-level fields present (feature, version, description, category, fields, rules, flows)
- [ ] Comments explain WHY, referencing the source document

## Handling Edge Cases

### Document has multiple features
If the document describes multiple distinct features (e.g., a BRD covering login, signup, AND checkout):
1. List all features found
2. Ask the user which one to extract, or offer to extract all as separate blueprints
3. Generate one blueprint at a time

### Document is ambiguous
If requirements use vague language ("should be fast", "must be secure"):
1. Add to the ambiguous items list
2. Suggest a concrete FDL equivalent where possible (e.g., "should be fast" → suggest `max_duration: 5s`)
3. Mark suggestions clearly so the user can confirm or adjust

### Document references external systems
If the doc mentions integrations with specific systems (Stripe, Salesforce, SAP):
1. Map to `related` features where possible
2. Add framework-specific details to `extensions` if enough info exists
3. Flag as "requires integration blueprint" if no mapping exists

### Document is a diagram/image
For flowchart screenshots or process diagrams:
1. Identify nodes as states or flow steps
2. Identify arrows as transitions
3. Identify swimlanes as actors
4. Identify decision diamonds as conditions
5. Note that extraction from images is best-effort — ask user to verify

### Document contradicts itself
If the same requirement appears with different values in different sections:
1. Flag the contradiction to the user
2. Use the more restrictive/secure value as the default
3. Reference both sections in the YAML comment
