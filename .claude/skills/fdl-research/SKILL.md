# FDL Research — Self-Improvement Through AI Research

Research the latest AI/AGI developments and suggest improvements to FDL's schema, skills, and blueprints.

---
command: fdl-research
description: "Research latest AI developments and suggest FDL improvements"
arguments: "[topic]"
---

## Description

FDL must evolve as fast as AI itself. This skill searches the web for the latest developments in AI agent frameworks, safety/alignment research, specification patterns, and tool-use conventions — then proposes concrete improvements to FDL.

**Why this exists:** AI is moving fast. If FDL doesn't keep up, its blueprints become stale specifications that don't reflect how modern AI systems actually work.

## Usage

```
/fdl-research                     # General research across all topics
/fdl-research safety              # Focus on AI safety and alignment
/fdl-research agents              # Focus on agent frameworks and patterns
/fdl-research schema              # Focus on specification/schema patterns
/fdl-research mcp                 # Focus on MCP and tool-use patterns
```

## Workflow

### Step 1: Scan Current FDL State

Before researching, understand what FDL currently has:

1. Count blueprints: `ls blueprints/**/*.blueprint.yaml | wc -l`
2. Read `schema/blueprint.schema.yaml` — note all current field types and AGI sub-sections
3. Read `CLAUDE.md` — note current rules and conventions
4. Check AGI coverage: how many blueprints have `agi:` sections vs total?
5. Note the current version from `package.json`

Present a brief state summary:
```
FDL State: {N} blueprints, {M} categories, {K}% AGI coverage
Schema version: {version}
Last major update: {date from git log}
```

### Step 2: Research (Web Search)

Use WebSearch to find the latest developments. Always search with the current year.

**Research topics (search all unless a specific topic was requested):**

#### 2a. Agent Frameworks & Patterns
- "AI agent framework patterns 2026"
- "multi-agent orchestration best practices"
- "LangGraph CrewAI AutoGen agent architecture"
- "AI agent safety guardrails implementation"

#### 2b. AI Safety & Alignment
- "NIST AI Risk Management Framework updates"
- "EU AI Act compliance requirements"
- "AI alignment techniques production systems"
- "AI guardrails and red teaming best practices"
- "POPIA AI compliance South Africa"

#### 2c. Specification & Schema Patterns
- "AI feature specification standards"
- "OpenAPI AsyncAPI specification evolution"
- "infrastructure as code declarative patterns"
- "AI-readable documentation standards"

#### 2d. MCP & Tool Use
- "Model Context Protocol MCP latest features"
- "AI tool use patterns and conventions"
- "function calling best practices AI agents"

#### 2e. Blueprint & Low-Code Patterns
- "low-code no-code AI generation patterns"
- "feature flag specification standards"
- "declarative UI specification formats"

### Step 3: Analyze Gaps

For each research finding, compare against FDL's current state:

1. **Does FDL already have this?** → Skip
2. **Is this relevant to FDL's mission?** → Keep
3. **Would this break existing blueprints?** → Flag as breaking change
4. **How much effort to implement?** → Estimate (low/medium/high)

### Step 4: Propose Improvements

Present findings as a numbered list using AskUserQuestion:

```
Based on my research, here are {N} improvements for FDL:

[1] {title} — {one-line description}
    Impact: {high/medium/low}  Effort: {high/medium/low}
    Affects: {schema/skills/blueprints/docs}
    Source: {link}

[2] ...
```

Group by priority:
- **Critical** — FDL is missing something the industry considers standard
- **Important** — Would significantly improve blueprint quality or coverage
- **Nice-to-have** — Emerging patterns worth watching

Ask the user: "Which improvements should I implement? (Pick numbers or 'all')"

### Step 5: Execute Approved Improvements

For each approved improvement:

1. **Schema changes** → Edit `schema/blueprint.schema.yaml` and `scripts/validate.js`
2. **New blueprint categories** → Run `/fdl-create` for new feature types
3. **Skill updates** → Edit relevant skill SKILL.md files
4. **AGI enhancements** → Update AGI sub-sections and run `/fdl-propagate-agi`
5. **Documentation** → Update `CLAUDE.md`, docs pages

After all changes: run `/fdl-auto-evolve` to validate, generate docs, and commit.

### Step 6: Report

Show a summary of what was researched, what was proposed, what was implemented:

```
FDL Research Report
===================
Topics researched: {list}
Sources consulted: {count} web pages
Improvements proposed: {N}
Improvements approved: {M}
Changes made:
  - Schema: {list of changes}
  - Skills: {list of changes}
  - Blueprints: {list of changes}
  - Docs: {list of changes}

Next research recommended: {suggested date/topic}
```

## Research Quality Rules

- **NEVER blindly copy** patterns from other frameworks — adapt them to FDL's YAML-first, framework-agnostic philosophy
- **NEVER add features just because they're trendy** — every addition must improve blueprint quality or code generation
- **ALWAYS check backward compatibility** — new schema fields must be optional
- **ALWAYS cite sources** — every proposed change must link to where you found it
- **POPIA applies to research too** — never search for or process private data during research

## Integration

- **Manual trigger only** — research is user-initiated, never automatic
- After implementing changes → auto-triggers `/fdl-auto-evolve`
- If AGI schema changes → suggest running `/fdl-propagate-agi`
