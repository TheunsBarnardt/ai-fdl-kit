# FDL Propagate AGI — Auto-generate AGI sections for all blueprints

Ensure every blueprint has an AGI-readiness section appropriate to its category and content.

---
command: fdl-propagate-agi
description: "Add AGI sections to all blueprints that don't have them"
arguments: "[--category <name>] [--file <path>]"
---

## Description

When new AGI schema features are added (like coordination, safety, explainability, learning), existing blueprints become stale. This skill propagates AGI sections to all blueprints that lack them, using intelligent defaults based on each blueprint's category, fields, actors, and outcomes.

**Problem:** AGI features were added but only 6 of 203 blueprints had AGI sections — the rest were missing out on safety controls, goals, autonomy levels, and verification.

**Solution:** Run `node scripts/propagate-agi.js` to analyze every blueprint and generate category-appropriate AGI sections automatically.

## Usage

```
/fdl-propagate-agi                    # Propagate to all blueprints
/fdl-propagate-agi --category auth    # Only auth blueprints
/fdl-propagate-agi --file <path>      # Single blueprint
```

## Workflow

### Step 1: Dry Run

Run the propagation script in preview mode:

```bash
node scripts/propagate-agi.js
```

Present the summary to the user:
- "{N} blueprints need AGI sections"
- "{M} already have AGI (will be skipped)"
- Show 3-5 examples across different categories

### Step 2: User Confirmation

Ask the user using AskUserQuestion:

"I'll add AGI sections to {N} blueprints based on their category. Each gets goals, autonomy level, safety permissions, and verification appropriate to its risk level. Want to proceed?"

- "Yes — update all {N} blueprints"
- "Let me pick categories" (then ask which categories)
- "Show me more examples first"

### Step 3: Apply

Run with `--apply`:

```bash
node scripts/propagate-agi.js --apply
```

Or for specific category:
```bash
node scripts/propagate-agi.js --apply --category auth
```

### Step 4: Validate

```bash
node scripts/validate.js
```

If any blueprints fail validation due to the new AGI sections, fix them and re-run.

### Step 5: Generate Docs

```bash
npm run generate
```

### Step 6: Report

Show the user:
- How many blueprints were updated
- Category breakdown
- Any validation warnings
- Suggest running `/fdl-auto-evolve` to commit

## Category Defaults

The script assigns AGI sections based on blueprint category:

| Category | Autonomy | Risk | Focus |
|----------|----------|------|-------|
| auth/access | supervised | high | security |
| payment/trading | supervised | high | compliance |
| workflow | semi_autonomous | medium | efficiency |
| data | supervised | medium | integrity |
| integration | supervised | medium | reliability |
| ai | fully_autonomous | high | alignment |
| notification | semi_autonomous | low | delivery |
| ui | semi_autonomous | low | usability |
| infrastructure | supervised | high | availability |
| manufacturing | semi_autonomous | high | safety |

## When to Run

- After adding new AGI sub-sections to the schema
- After `/fdl-create` generates blueprints without AGI (the auto-evolve step will remind you)
- Periodically to ensure no blueprints are missing AGI sections
- After `/fdl-research` suggests AGI improvements

## Integration

- **Triggered by:** schema changes, auto-evolve AGI freshness warnings, manual invocation
- **Triggers:** `/fdl-auto-evolve` after completion (validates and commits)
- **Never overwrites:** existing AGI sections are always preserved
