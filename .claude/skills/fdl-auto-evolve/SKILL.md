# FDL Auto-Evolve — Skill

Auto-validate, generate docs, and commit blueprint changes in a single operation.

## Description

When blueprints are created or modified, this skill automatically:
1. **Validates** all blueprints against the schema
2. **Generates** documentation and JSON API
3. **Commits** changes with proper messaging
4. **Tracks** improvements with version bumps
5. **Reports** what changed and why

This turns FDL from a manual process into an evolving system that improves automatically.

## Trigger Points

Run this skill after:
- Extracting blueprints from code (`/fdl-extract-code`)
- Creating new blueprints (`/fdl-create`)
- Improving existing blueprints (via edit)
- Any `blueprints/` directory changes

## Usage

```
/fdl-auto-evolve
/fdl-auto-evolve --dry-run     # Preview changes without committing
/fdl-auto-evolve --verbose     # Show detailed validation output
```

## What It Does

### Step 0: Clean Up Proposed Files

Before validating, check for any pending `.proposed.blueprint.yaml` files left over from extract-code delta reviews:

```bash
# Find any proposed blueprints awaiting merge decision
find blueprints/ -name "*.proposed.blueprint.yaml" 2>/dev/null
```

- If any exist: warn the user — "These proposed blueprint updates haven't been reviewed yet: [list]. Run `/fdl-extract-code` again to review them, or delete them to dismiss."
- Do NOT delete them automatically — they represent unreviewed changes.
- Proceed with the rest of auto-evolve (validate/generate/commit) on the main blueprint files only.

### Step 1: Validate
```bash
node scripts/validate.js
```
- Validates all blueprints against schema
- Detects cross-reference errors
- Reports warnings for missing features
- Fails fast if any blueprint is invalid

### Step 1b: Completeness Check (semantic gate)
```bash
node scripts/completeness-check.js
```
- Catches blueprints that pass the schema but are semantically incomplete
- Rejects placeholder tokens (TODO, TBD, FIXME, XXX, "add description here", ...)
- Rejects empty `outcomes` / `flows` sections
- Rejects outcomes whose `error:` reference points to a non-existent error code
- Warns when a blueprint has no outcome that looks like a failure path (every blueprint must model errors)
- Fails fast if any blueprint is incomplete — no docs generation, no commit

This is the **blueprint-as-spec discipline**: the terminal state of every `/fdl-*` skill must be a blueprint that passes BOTH validation layers. Structural correctness is not enough — the blueprint must actually say something.

### Step 1c: AGI Freshness Check

Count how many blueprints have AGI sections vs total:

```bash
# Count blueprints with AGI
grep -rl "^agi:" blueprints/ | wc -l
# Count total blueprints
ls blueprints/**/*.blueprint.yaml | wc -l
```

- If **more than 50%** of blueprints lack AGI sections:
  - WARN: "⚠ {N} of {total} blueprints are missing AGI sections. Run `/fdl-propagate-agi` to update them."
- This is a **WARNING only** — does not block the pipeline
- If the user just ran `/fdl-propagate-agi`, skip this check

### Step 2: Generate Docs
```bash
npm run generate
```
- Regenerates `docs/blueprints/**/*.md` — Jekyll reference pages for the docs site
- Regenerates `docs/api/**/*.json` — static JSON API
- Regenerates `blueprints/**/*.md` — human-friendly summaries next to each YAML (via `scripts/generate-readmes.js`)
- Updates `registry.json` with all features
- Keeps every generated artifact in sync with the YAML source of truth

### Step 2b: Fitness Recommendation & Verification Loop (autoresearch keep-or-reset)
```bash
npm run fitness:recommend
```

This is the **post-extraction verification step**. It does three things in one pass:

1. **Re-scores every blueprint** with `scripts/fitness.js` (inline) and compares each feature's score to its previously-recorded value in `.fitness-recommend-state.json`.
2. **Fires a verdict** whenever a feature's score changed since the last run:
   - **Proven win** (`score ≥ 75` and delta > 0): remove the card from the README, mark the recommended repo as `proven_by` in state. The extraction worked.
   - **Partial** (`70 ≤ score < 75` and delta > 0): keep the card with a 🟡 badge and a `(+N from last extraction)` annotation.
   - **No improvement** (delta < 0): mark the tried repo as a dead-end, rotate it to the back of the candidate list, annotate the card with `⚠ <repo> was tried — score went <old> → <new>. Deprioritized.`
3. **Rewrites the README marker block** (`<!-- BEGIN:recommended-repos -->` … `<!-- END:recommended-repos -->`) with the refreshed card list. Idempotent — running it twice with no score changes produces zero diff.

This step is where the system closes the loop: every extraction driven by a recommendation gets measured against the score delta, and the README always reflects the current truth about which repos earn their keep. The seed map lives at `data/extraction-candidates.yaml` and can be extended via `/fdl-recommend-discover`.

**Failure modes:**
- If `README.md` is missing the marker block, this step prints a helpful error and aborts (nothing downstream touches README).
- If `.fitness-recommend-state.json` doesn't exist yet (first ever run), it's created from the current state with no verdicts fired.
- If `data/extraction-candidates.yaml` is missing, the recommender logs a warning and emits cards with an `_uncovered_` note directing the user to `/fdl-recommend-discover`.

### Step 3: Detect Changes
- Compare git index before/after validate/generate
- Identify which blueprints changed
- Calculate version bumps (patch/minor/major)
- Summarize improvements

### Step 4: Commit
- Stage all validated changes
- Generate commit message with:
  - List of updated blueprints
  - Summary of improvements
  - Version updates
- Create atomic commit (all-or-nothing)

### Step 5: Report
- Show user what changed
- List new features
- Highlight improvements
- Suggest next steps

## Exit Codes

- **0** — Success: blueprints valid, docs generated, commit created
- **1** — Validation failed: fix blueprints and retry
- **2** — User cancelled (dry-run mode)
- **3** — Git/workspace error: clean up and retry

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FDL AUTO-EVOLVE — Blueprint Evolution Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ VALIDATION       [51/51 blueprints passed]
✓ DOCUMENTATION   [23 pages generated]
✓ CHANGES DETECTED [3 blueprints updated]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATED BLUEPRINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 auth/login (v1.0.0 → v1.1.0)
   • Added OAuth/social login outcomes
   • Enhanced session management with refresh tokens
   • Improved timing-attack mitigation docs

📝 auth/session-management (NEW)
   • Token refresh strategies (compact, JWT, JWE)
   • Device tracking and session isolation
   • Auto-refresh configuration

📝 auth/two-factor-authentication (IMPROVED)
   • TOTP + backup codes with trusted devices
   • Rate limiting and recovery procedures
   • Integration with existing login flow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMIT CREATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Commit: abc1234
   Extract auth features from better-auth codebase

   • Enhanced login with OAuth and device tracking
   • Added session management with token refresh
   • Added two-factor authentication with TOTP

   All blueprints validated, docs generated, API updated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Ready to push: git push origin main
```

## Integration with Other Skills

- **fdl-extract-code**: Automatically runs `/fdl-auto-evolve` after extraction
- **fdl-create**: Automatically runs `/fdl-auto-evolve` after blueprint creation
- **fdl-generate**: Manually trigger `/fdl-auto-evolve` for docs updates

## Implementation Notes

- Uses `git diff` to detect changes (fast, efficient)
- Creates single atomic commit (no partial states)
- Fails validation = no commit (safety first)
- Dry-run mode for preview without side effects
- Idempotent: safe to run multiple times

## What Makes FDL "Evolving"

This skill transforms FDL from a static repository into an **adapting system**:

1. **Automatic Validation** — Ensures quality gates are always met
2. **Automatic Documentation** — Docs are never out of sync
3. **Atomic Commits** — All-or-nothing changes (no partial states)
4. **Change Tracking** — Knows what improved and why
5. **Integration** — Other skills trigger evolution automatically

Result: Every improvement (from extraction, creation, or manual edits) **automatically propagates** through validation → documentation → version tracking → commit.

## Future Enhancements

- [ ] Semantic versioning based on changes
- [ ] Blueprint diff reports (what changed between versions)
- [ ] Dependency resolution (auto-detect related features)
- [ ] Migration guides for API-breaking changes
- [ ] Changelog auto-generation from commits
- [ ] Integration with CI/CD for automated releases
