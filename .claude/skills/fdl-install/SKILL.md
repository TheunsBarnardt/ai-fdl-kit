---
name: fdl-install
description: Deploy FDL instructions to any AI coding tool (Cursor, Windsurf, Copilot, Gemini, Continue, Cline, Kiro, Amazon Q, Codex)
user_invocable: true
command: fdl-install
arguments: "[tool] [--all]"
---

# FDL Install — Multi-Tool Deployment

Deploy FDL instructions to your AI coding tool of choice so it can read blueprints and generate code without having the full FDL repository installed.

## Usage

```
/fdl-install                    # interactive — pick tools from a list
/fdl-install cursor             # install for Cursor only
/fdl-install windsurf           # install for Windsurf only
/fdl-install copilot            # install for GitHub Copilot
/fdl-install gemini             # install for Gemini CLI
/fdl-install continue           # install for Continue
/fdl-install cline              # install for Cline
/fdl-install kiro               # install for Kiro (AWS)
/fdl-install amazonq            # install for Amazon Q Developer
/fdl-install codex              # install for OpenAI Codex CLI
/fdl-install --all              # install for ALL supported tools
```

## Supported Tools

| Tool | Instruction File | Notes |
|------|-----------------|-------|
| Claude Code | Already installed — this IS Claude Code | No action needed |
| Cursor | `.cursor/rules/fdl.mdc` | MDC format with frontmatter |
| Windsurf | `.windsurf/rules/fdl.md` | Markdown rules file |
| GitHub Copilot | `.github/copilot-instructions.md` | Appends to existing file |
| Gemini CLI | `.gemini/GEMINI.md` | Appends to existing file |
| Continue | `.continue/rules/fdl.md` | Rules directory |
| Cline | `.clinerules` | Appends to existing file |
| Kiro (AWS) | `.kiro/steering/fdl.md` | Steering documents |
| Amazon Q Developer | `.aws/amazonq/instructions.md` | Appends to existing file |
| OpenAI Codex CLI | `~/.codex/prompts/fdl.md` | Global user prompt |

## Workflow

### Step 1: Determine Target

If no tool argument was given, show a menu using AskUserQuestion:

```
Which AI coding tool(s) should I install FDL for?
- Cursor
- Windsurf
- GitHub Copilot
- Gemini CLI
- Continue
- Cline
- Kiro (AWS)
- Amazon Q Developer
- OpenAI Codex CLI
- All of the above
```

### Step 2: Detect Blueprint Source

Check whether this project has local blueprints:
- Glob `blueprints/**/*.blueprint.yaml` — if results found, this is the FDL repo itself or a project with local blueprints
- If local blueprints exist: instructions will reference local blueprints
- If no local blueprints: instructions will reference the remote API at `https://theunsbarnardt.github.io/claude-fdl/api/`

### Step 3: Generate FDL Compact Instructions

Produce the instruction content (see template below). Customize the blueprint source based on Step 2.

### Step 4: Write to Tool-Specific Location

For each selected tool, write or append to the appropriate file:

**Cursor** — `.cursor/rules/fdl.mdc`
```
---
description: FDL — Feature Definition Language blueprints and code generation
alwaysApply: true
---
{FDL_COMPACT_INSTRUCTIONS}
```

**Windsurf** — `.windsurf/rules/fdl.md`
```
{FDL_COMPACT_INSTRUCTIONS}
```

**GitHub Copilot** — `.github/copilot-instructions.md`
- If file exists: append a `## FDL — Feature Definition Language` section
- If file doesn't exist: create with FDL instructions as the only content

**Gemini CLI** — `.gemini/GEMINI.md`
- If file exists: append a `## FDL — Feature Definition Language` section
- If file doesn't exist: create with FDL instructions

**Continue** — `.continue/rules/fdl.md`
```
{FDL_COMPACT_INSTRUCTIONS}
```

**Cline** — `.clinerules`
- If file exists: append FDL section
- If file doesn't exist: create with FDL instructions

**Kiro (AWS)** — `.kiro/steering/fdl.md`
```
{FDL_COMPACT_INSTRUCTIONS}
```

**Amazon Q Developer** — `.aws/amazonq/instructions.md`
- If file exists: append FDL section
- If file doesn't exist: create with FDL instructions

**OpenAI Codex CLI** — `~/.codex/prompts/fdl.md` (user home directory, global)
```
{FDL_COMPACT_INSTRUCTIONS}
```

### Step 5: Create Required Directories

Before writing, ensure parent directories exist. Use Bash mkdir -p for each.

### Step 6: Confirm

Show what was installed:

```
FDL installed for: Cursor, Windsurf

FILES WRITTEN:
  .cursor/rules/fdl.mdc
  .windsurf/rules/fdl.md

BLUEPRINT SOURCE: remote API (https://theunsbarnardt.github.io/claude-fdl/api/)

Your AI tool will now:
  - Read blueprints via the FDL remote API
  - Generate code with /fdl-generate <feature> <framework>
  - Understand all FDL blueprint structure and rules

To use local blueprints instead, copy blueprints/ from the FDL repo
or run /fdl-create to build your own.
```

---

## FDL Compact Instructions Template

Use this template as the content to write into each tool's file. Replace {BLUEPRINT_SOURCE} with either:
- `Local blueprints in the blueprints/ directory of this project`
- `Remote API at https://theunsbarnardt.github.io/claude-fdl/api/`

```
# FDL — Feature Definition Language

You have access to FDL (Feature Definition Language) blueprints. These are YAML files that define software features as acceptance criteria, fields, rules, and error codes — independent of any technology stack.

## Blueprint Source

{BLUEPRINT_SOURCE}

## How to Find a Blueprint

**Local:** Read `blueprints/{category}/{feature}.blueprint.yaml`
Categories: auth, data, access, ui, integration, notification, payment, workflow, inventory, manufacturing, crm, asset, project, quality, procurement, ai, trading, infrastructure, observability

**Remote fallback (no local blueprints):**
1. Fetch registry: GET https://theunsbarnardt.github.io/claude-fdl/api/registry.json
2. Find the feature entry to get its category
3. Fetch blueprint: GET https://theunsbarnardt.github.io/claude-fdl/api/blueprints/{category}/{feature}.json

## How to Generate Code from a Blueprint

When asked to implement a feature from a blueprint:

1. Load the blueprint (local or remote)
2. Read outcomes — these are your acceptance criteria (sorted by priority, lower = first)
3. Read rules — these are your constraints (security, business logic)
4. Read fields — these are your data model
5. Read errors — these are the error responses you must return
6. Write code that satisfies ALL outcomes for the target framework

### Priority = Execution Order
Lower priority number = checked first (guard clauses). Higher priority = success path.

### Structured Conditions
- `source: input` = request body
- `source: db` = database lookup result
- `source: session` = authenticated session state
- `any:` = OR group (at least one must be true)
- Top-level given[] items = AND (all must be true)

### Structured Side Effects
- `action: set_field` = database update or variable assignment
- `action: emit_event` = event bus / pub-sub call
- `action: transition_state` = status field update
- `action: create_record` = database insert
- `when:` on a side effect = wrap in a conditional

### RFC 2119 Rule Strength
- `MUST:` / `SHALL:` — always implement, never omit
- `SHOULD:` — implement by default; add TODO comment if skipping
- `MAY:` — implement only if explicitly requested
- *(no prefix)* — treat as SHOULD

## Project Config (fdl.config.yaml)

If `fdl.config.yaml` exists in the project root, read it before generating code. Use `stack.*` and `conventions.*` values to drive all code generation decisions (framework, ORM, import style, etc.).

## What to Generate

**Backend:** business logic, validation, types, route/action entry point
**Frontend (when ui_hints exist):** form component, page, error handling

Every outcome must have a code path. Every error must be reachable. Every event must be emitted.

## Self-Check Before Outputting

For each outcome, verify:
- Every given condition has a guard clause
- Every then action is implemented
- The result (response/redirect/return) matches the blueprint
- All MUST rules are enforced
- All events are emitted
- All error codes have a reachable code path
```

---

## Edge Cases

### Tool already has instructions
If the target file exists and already contains FDL instructions (check for "Feature Definition Language" text), ask the user:
- "Update existing FDL instructions" (replaces the FDL section)
- "Skip — already installed"

### This IS the FDL repository
If `blueprints/` directory has many blueprints AND `scripts/validate.js` exists, this is the FDL repo itself. Claude Code is already configured. Suggest the user run `/fdl-install` in their project directory instead.

### Codex global install
The `~/.codex/prompts/fdl.md` file is in the user's home directory — it applies to ALL Codex projects. Warn the user: "This will add FDL to Codex globally for all projects. Continue?"

### Unknown tool
If the user requests a tool not in the supported list, tell them the instruction file location pattern and provide the compact instructions content so they can install manually.
