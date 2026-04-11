---
name: fdl-recommend-discover
description: Discover upstream open-source repos to extract from, when a low-scoring blueprint has no mapped candidate
user_invocable: true
command: fdl-recommend-discover
arguments: "[feature] | --uncovered"
---

# FDL Recommend Discover — Extend the extraction candidates map via WebSearch

When a blueprint scores below the fitness threshold and `data/extraction-candidates.yaml` has no matching repo for its weakest dimension, this skill uses `WebSearch` to find 2–3 reputable open-source projects and appends them to the map (with user approval) so `npm run fitness:recommend` can surface them in the README.

This is the **Phase 2** extension to the recommender. The static seed map ships with the repo and handles the bottom-12 well; this skill is for when new low-scoring blueprints appear (e.g., after extraction adds new features) and the map needs to grow.

## Usage

```
/fdl-recommend-discover                          # scan for all uncovered low-scoring features
/fdl-recommend-discover --uncovered              # same as above
/fdl-recommend-discover <feature>                # target a specific feature by name
/fdl-recommend-discover fine-grained-authorization
```

## Workflow

### Step 1: Identify uncovered features

Run `node scripts/fitness-recommend.js --json` and parse the `recommendations` array. For each recommendation where `candidates.length === 0` (no entry matched in the seed map), add the feature to a **target list**. If the user passed an explicit feature name, override the target list with just that one.

If the target list is empty, print:

```
✓ All low-scoring features already have candidates mapped.
  Run `npm run fitness:recommend` to refresh the README if needed.
```

…and stop.

### Step 2: Search for each target

For each target feature, take the blueprint's `feature`, `category`, and weakest dimension and craft WebSearch queries that bias toward well-known OSS projects:

```
"<feature keywords> open source github <language>"
"best <category> library <feature>"
"<feature> reference implementation site:github.com"
```

Example: for `security/prompt-attack-augmentation` (weakest: `agi`), search:

```
"LLM red team augmentation open source github"
"prompt attack library python site:github.com"
"jailbreak generation reference implementation"
```

Run 2–3 queries per target. Collect candidate repos. Filter for:

- Must be `github.com/org/repo` URLs
- Must have a clear description from the search snippet
- Prefer repos with > 500 stars (if the snippet mentions stars) — but don't hard-block, since new projects might be relevant
- Skip archived/deprecated forks
- Reject anything that looks promotional or AI-generated (gibberish README, no clear scope)

### Step 3: Present candidates to the user

For each target feature, print the proposed additions as a numbered list and **ask for explicit approval** via `AskUserQuestion`:

```
Proposed additions to data/extraction-candidates.yaml:

For `security/prompt-attack-augmentation` (weakest: agi)
  1. https://github.com/leondz/garak
     NVIDIA's LLM vulnerability scanner — probes and attack suites
  2. https://github.com/protectai/llm-guard
     Input/output guardrails with attack detection
  3. https://github.com/Azure/PyRIT
     Python Risk Identification Toolkit for generative AI

Append all 3? Or pick specific ones?
```

Options to offer via `AskUserQuestion`:

- **Append all** — add every proposed repo to the YAML
- **Pick specific** — ask the user which indices to include
- **Skip this feature** — don't append anything for this target
- **Abort** — stop the entire discover run

### Step 4: Append to YAML (ONLY after explicit approval)

For each approved entry, append to `data/extraction-candidates.yaml` under the correct key:

- If the feature matches a single domain, append under `features.<feature-name>[]`
- If the search produced category-generic results, append under `categories.<category>.<weak_dimension>[]`

**Never overwrite existing entries.** Read the file, parse as YAML, append to the right array, write back with `YAML.stringify`. Preserve comments where possible (or warn the user if comments will be lost).

Each appended entry MUST have:

```yaml
- repo: https://github.com/org/repo
  description: One-line summary from the WebSearch snippet (or inferred if the snippet is thin)
  notes: Added by /fdl-recommend-discover on YYYY-MM-DD from WebSearch query "<query>"
```

The `notes` field creates an audit trail — anyone reviewing the YAML can see which entries were machine-suggested vs. hand-curated.

### Step 5: Refresh the README

After a successful append, automatically run:

```bash
npm run fitness:recommend
```

This regenerates the README marker block with the new entries. Show the user the updated section count in the summary.

### Step 6: Report

Print a summary:

```
fdl-recommend-discover complete

  Target features scanned:  N
  Proposals presented:      M
  Entries appended:         K
  README refreshed:         ✓

New candidates:
  - security/prompt-attack-augmentation
      + leondz/garak
      + protectai/llm-guard

  - trading/carbon-credits-trading
      + (skipped — no reputable OSS found)

Next step: run `git diff data/extraction-candidates.yaml` to review the additions,
           then `git commit` once you're satisfied.
```

## Safety rules

- **Never overwrite existing YAML entries.** Only append. If a repo URL is already in the file, skip it silently and note "already mapped" in the summary.
- **Never write without explicit user approval** — every append MUST be preceded by an `AskUserQuestion` call. A user silence or timeout is NOT approval.
- **Flag suspicious URLs.** Reject anything that isn't a clean `github.com/org/repo` URL. Warn about URLs containing tracking parameters, URL shorteners, or non-github hosts.
- **Respect POPIA rules** (see `.claude/CLAUDE.md`). Do not send any blueprint content, PII, or secrets to WebSearch. Only use generic category + dimension keywords in queries.
- **Do not claim a repo is good** without reading its description. If the WebSearch snippet is too thin to explain what the repo does, skip it and tell the user.
- **Never auto-run `/fdl-extract-code`** on the discovered repos. The discover skill only populates the candidates map. Actual extraction is always a separate, user-initiated step.

## Relationship to other skills

- **`fitness-recommend.js`** — This skill extends the data file that `fitness-recommend.js` reads. After appending, it calls the script to refresh the README.
- **`/fdl-extract-code`** — This skill populates recommendations; `/fdl-extract-code` acts on them. The two are decoupled: the discover skill never triggers an extraction.
- **`/fdl-auto-evolve`** — After an extraction driven by a recommendation, auto-evolve runs `npm run fitness:recommend`, which re-scores and verifies whether the recommended repo earned its keep (see Step 7 of auto-evolve).

## Example invocation

```
user: /fdl-recommend-discover --uncovered

assistant: I'll scan for low-scoring blueprints without mapped candidates.

> node scripts/fitness-recommend.js --json

Found 1 uncovered feature:
  - security/prompt-attack-augmentation (67/100, weakest: agi)

Searching WebSearch for reputable open-source implementations...

Proposals for security/prompt-attack-augmentation:
  1. https://github.com/leondz/garak — NVIDIA LLM vulnerability scanner
  2. https://github.com/protectai/llm-guard — input/output guardrails
  3. https://github.com/Azure/PyRIT — Python Risk Identification Toolkit

[asks AskUserQuestion for approval]

user: [approves all 3]

assistant: Appending 3 entries to data/extraction-candidates.yaml under
           features.prompt-attack-augmentation[] ...
           Running npm run fitness:recommend ...

           ✓ README updated. 3 new candidates available for
             security/prompt-attack-augmentation.

           Review the diff: git diff data/extraction-candidates.yaml README.md
```
