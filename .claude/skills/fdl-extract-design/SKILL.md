---
name: fdl-extract-design
description: Produce a DESIGN.md design-system file that /fdl-generate and /fdl-build consume when scaffolding UI
user_invocable: true
command: fdl-extract-design
arguments: "[source] [--out <path>] [--dark] [--preview]"
---

# FDL Extract Design — Brand/Design-System to DESIGN.md

Produce a `DESIGN.md` file — a plain-markdown design system that AI coding agents (this kit's `/fdl-generate` and `/fdl-build`, as well as Cursor, Copilot, Aider, etc.) read before generating UI so the output matches the target brand. This skill is an **add-on**, not a replacement — it does not modify any existing skill or blueprint, and it does not produce YAML. Its sole output is a markdown file.

Inspired by Google Stitch's DESIGN.md concept and the VoltAgent awesome-design-md collection.

## Core principle: plain language, human-first output

- NEVER write YAML. Output is always `DESIGN.md` (markdown).
- NEVER invent brand tokens. If a value can't be derived from the source, say so and ask before filling it in.
- Extracted tokens must map to a concrete source: a URL, an image region, a CSS variable, a Tailwind key, or a user statement.
- Treat the output as a **living contract** — generators will rely on it verbatim, so precision (hex codes, px/rem values, font stacks) matters more than prose.

## Usage

```
# Crawl a brand/product site and derive tokens
/fdl-extract-design https://stripe.com --out DESIGN.md

# Extract from a screenshot or logo asset
/fdl-extract-design ./assets/brand/home.png

# Reverse-engineer from an existing codebase's theme files
/fdl-extract-design ./apps/web --from-code

# Start from a preset (stripe, vercel, linear, notion, shadcn, material)
/fdl-extract-design --preset linear

# Plain-English brief (skill asks questions then writes the file)
/fdl-extract-design "modern fintech, navy + teal accent, Inter, rounded 8px, generous whitespace"

# Add a dark-mode variant block
/fdl-extract-design https://example.com --dark

# Also emit preview.html swatches next to the DESIGN.md
/fdl-extract-design --preset vercel --preview
```

## Arguments

- `[source]` — One of:
  - A URL → crawl mode (uses the same Chrome MCP approach as `/fdl-extract-web`)
  - A local image path (`.png`, `.jpg`, `.webp`, `.svg`) → vision mode
  - A local folder → `--from-code` mode (scans `tailwind.config.*`, `*.css` / `*.scss` tokens, `theme.ts/js`, design-token JSON)
  - A plain-English description → brief mode (skill clarifies via questions)
- `--out <path>` — Output path. Default: `DESIGN.md` at the project root. If the user ran this inside a generated app (see `/fdl-build --path`), default is `<path>/DESIGN.md`.
- `--preset <name>` — Start from a known reference system (`stripe`, `vercel`, `linear`, `notion`, `shadcn`, `material`, `ios-hig`). Values are seeded from the awesome-design-md family and then refined with the user.
- `--dark` — Emit a `## Dark Mode` section with dark-variant color roles.
- `--preview` — Also write `preview.html` (and `preview-dark.html` when `--dark` is set) next to the `DESIGN.md`. Swatches + type scale + button states, zero dependencies.
- `--from-code` — Force codebase-scan mode even when the source looks like a folder of assets.

## Security / POPIA

- Do NOT include customer screenshots, internal URLs, or any PII in the `DESIGN.md`. Design tokens are safe; product-specific screen content is not.
- When crawling a site, strip any query strings, auth headers, or session tokens from recorded URLs.
- Never embed real API keys, CMS IDs, or analytics IDs found in page source — even in comments.
- If a source image clearly contains PII (names, account numbers, ID numbers), refuse to process and ask the user to provide a sanitized asset.

## Workflow

### Step 1: Decide the source mode

Parse `[source]` (or `--preset` / `--from-code`) and pick ONE mode:

| Mode | Trigger | Tooling |
|---|---|---|
| **Crawl** | `source` is a URL | Chrome MCP (`navigate`, `get_page_text`, `screenshot`, DOM JS) |
| **Vision** | `source` is an image path | Built-in `Read` on the image |
| **Code** | `source` is a folder, or `--from-code` | `Glob` + `Read` on theme files |
| **Preset** | `--preset <name>` | Seed from the preset table below |
| **Brief** | `source` is free text or empty | `AskUserQuestion` rounds |

If the user's input is ambiguous (e.g. a URL that 404s, an image that's corrupt), fall back to brief mode — never silently invent values.

### Step 2: Gather raw signal

#### Crawl mode
1. Connect Chrome MCP and navigate to the URL.
2. Screenshot the landing hero (full page).
3. Extract the computed style of key elements — buttons, headings, body text, links, form inputs, cards. Use `document.defaultView.getComputedStyle(...)` via the MCP `evaluate`-style call.
4. Pull the site's CSS custom properties (`--*`) from `:root` and the `<body>` element. These are often the brand token source of truth.
5. Collect font-family declarations (de-dupe) and the numeric font sizes used on H1/H2/H3/body/small.
6. Collect the top ~8 distinct colors by frequency from the computed styles. Record both hex and role (surface, text, accent, border).
7. Capture `border-radius`, `box-shadow`, and `spacing` (margins, paddings) from the same sample set.
8. Note the responsive breakpoints by resizing the viewport (`computer` action `set_viewport_size` at 375, 768, 1024, 1440 if available) and observing which styles change.

#### Vision mode
1. `Read` the image. Describe it systematically: dominant colors, text treatment, density, shape language (pill vs square corners), shadow usage.
2. Produce hex approximations for the top 6–8 colors. Be explicit that these are approximations and ask the user to confirm critical accent colors.
3. If multiple images are attached (light + dark, home + dashboard), process each and merge.

#### Code mode
1. `Glob` for design-token sources in this order — stop at the first hit:
   - `tailwind.config.{js,ts,cjs,mjs}` → read `theme.extend.colors`, `fontFamily`, `fontSize`, `borderRadius`, `boxShadow`, `spacing`.
   - `*.css`, `*.scss`, `*.less` under `src/`, `styles/`, `app/`, `theme/` → parse `:root { --* }` custom properties.
   - `theme.{ts,js,json}`, `design-tokens.json`, `tokens.json` → read directly.
   - `app.json` / `expo.config.*` (React Native/Expo) → read theme block.
2. Report which file(s) were used so the user can see traceability.

#### Preset mode
Seed the DESIGN.md from the preset, then ask the user what to tweak:

| Preset | Core palette | Typography | Shape |
|---|---|---|---|
| `stripe` | indigo accent on white; purple→blue gradients | Sohne / Inter stack | soft 6–8px radius, subtle shadows |
| `vercel` | black/white, geist blue accent | Geist / Inter stack | sharp 4px radius, crisp borders |
| `linear` | deep violet on near-black; mono accents | Inter Tight | 6px radius, subtle inner-glow |
| `notion` | warm whites, paper tones, 1-2 accents | Inter / system | 4px radius, flat |
| `shadcn` | neutral slate + zinc, CSS variable driven | Geist / system | 6–8px radius, card-centric |
| `material` | Material 3 dynamic color | Roboto Flex | 12px radius, elevation 1–5 |
| `ios-hig` | SF system blues + neutrals | SF Pro | 10px radius, frosted-glass blurs |

Presets are seeds, not outputs. Always confirm with the user before writing.

#### Brief mode
Ask a short, focused set via `AskUserQuestion`:
1. Product category / mood (fintech, playful, editorial, ops-dashboard, …)
2. Primary brand color (hex or named)
3. Accent color (optional)
4. Surface tone (white, warm-white, near-black, dark-gray)
5. Font preference (system, Inter, Geist, custom display + body pair)
6. Shape language (sharp / rounded / pill)
7. Density (compact, comfortable, spacious)
8. Dark mode required? (yes / no)

Keep it to ≤8 questions. Batch them in one AskUserQuestion call when possible.

### Step 3: Present the extracted token summary

Before writing the file, show the user a plain-English summary (no markdown code blocks in the conversation). Example:

```
Here's what I pulled from {source}:

COLORS (8)
  Primary       #635BFF    buttons, links, focus
  Primary hover #5A52E5
  Background    #FFFFFF
  Surface       #F7FAFC    cards, panels
  Border        #E3E8EE
  Text          #0A2540    body
  Text muted    #425466    secondary
  Danger        #DF1B41

TYPOGRAPHY
  Display: Sohne, Inter, system-ui (700 weight)
  Body: Sohne, Inter, system-ui (400 weight)
  Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64

SHAPE
  Radius: 6px (inputs, cards) / 9999px (pills)
  Shadows: subtle 0 1px 3px rgba(0,0,0,0.08)

SPACING
  Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

COMPONENT NOTES
  Buttons: filled primary, hairline secondary, ghost tertiary
  Inputs: 40px height, 1px border, focus ring in primary/20
  Cards: 1px border, radius 6, subtle shadow on hover

⚠ ITEMS I'M NOT SURE ABOUT
  - Dark-mode surface tone (source site has no dark variant)
  - Danger hover state
```

Use `AskUserQuestion` to resolve the uncertain items. Wait for confirmation.

### Step 4: Write DESIGN.md

Write to `--out` (default `DESIGN.md`) following the 9-section Stitch format. ALL sections are required; omit nothing — if a section has no content, write `_Not specified — defaults to framework/system values._` so downstream generators know it's intentional.

```markdown
# DESIGN.md — {Brand / Feature name}

> Source: {URL / image path / preset / codebase path} · Generated {ISO date} by `/fdl-extract-design`.
> This file is read by AI coding agents before generating UI. Treat it as the source of truth for tokens, components, and do/don't rules.

## 1. Visual Theme & Atmosphere
{2–5 sentences: mood, density, design philosophy. No marketing fluff — describe what a designer would see.}

## 2. Color Palette & Roles
| Role | Hex | Usage |
|---|---|---|
| primary | #635BFF | Primary CTAs, links, focus rings |
| primary-hover | #5A52E5 | Hover state of primary |
| background | #FFFFFF | Page surface |
| surface | #F7FAFC | Cards, elevated panels |
| border | #E3E8EE | Hairline borders |
| text | #0A2540 | Body copy |
| text-muted | #425466 | Secondary copy, captions |
| danger | #DF1B41 | Destructive actions, errors |
| success | #0E9F6E | Confirmations |
| warning | #C27803 | Cautions |

## 3. Typography Rules
- **Display font:** {stack}, weights {...}
- **Body font:** {stack}, weights {...}
- **Mono font:** {stack} (for code / data)
- **Scale (rem):** h1 3 · h2 2 · h3 1.5 · h4 1.25 · body 1 · small 0.875 · xs 0.75
- **Line-heights:** display 1.1 · body 1.5 · compact 1.25
- **Letter-spacing:** display −0.02em · body 0 · caps 0.06em

## 4. Component Stylings
### Buttons
- Primary: filled, radius 6, height 40, weight 500, hover = primary-hover, focus = 3px ring primary/25, disabled = 50% opacity.
- Secondary: 1px border, transparent fill.
- Ghost: no border, text only, hover = surface.
- Destructive: variant of primary using `danger` role.

### Inputs
- Height 40, 1px border, radius 6, focus = primary border + 3px ring.
- Label above, hint below in text-muted.
- Error state: border + helper text in `danger`.

### Cards
- Radius 8, 1px border, background surface.
- Hover = subtle shadow (see §6).

### Navigation
- Top nav height 56–64, border-bottom hairline.
- Active item: primary text + 2px bottom accent.

## 5. Layout Principles
- **Spacing scale (px):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
- **Container max-width:** {e.g. 1200px}
- **Grid:** 12-column, 24px gutter on desktop, 16px on mobile.
- **Whitespace philosophy:** {one sentence — "generous vertical rhythm", "dense ops-dashboard", etc.}

## 6. Depth & Elevation
| Level | Usage | Shadow |
|---|---|---|
| 0 | Flat surface | none |
| 1 | Cards at rest | 0 1px 2px rgba(0,0,0,0.06) |
| 2 | Hovered card / dropdown | 0 2px 8px rgba(0,0,0,0.08) |
| 3 | Popover / menu | 0 8px 24px rgba(0,0,0,0.12) |
| 4 | Modal / dialog | 0 24px 48px rgba(0,0,0,0.18) |

## 7. Do's and Don'ts
**Do**
- Use `primary` only for the single most important action on screen.
- Use `text-muted` for metadata, timestamps, helper copy.
- Pair dense data tables with comfortable whitespace around them.

**Don't**
- Don't layer two shadow levels on the same element.
- Don't use `danger` for anything other than destructive or error states.
- Don't mix radii — pick one of {6, 8} for cards/inputs and stay consistent.
- Don't hard-code colors outside this palette. If a new role is needed, add it here first.

## 8. Responsive Behavior
- **Breakpoints:** sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536
- **Touch target minimum:** 44×44 (mobile), 32×32 (desktop pointer).
- **Stacking rule:** multi-column layouts collapse to single-column below `md`.
- **Navigation:** top nav becomes hamburger drawer below `md`.
- **Typography scaling:** display scales down one step below `md`.

## 9. Agent Prompt Guide
Quick reference for AI coding agents (Claude Code, Copilot, Cursor):

```
Use these brand tokens when generating UI for this project:
- Primary color: #635BFF (role: primary)
- Background: #FFFFFF, Surface: #F7FAFC, Border: #E3E8EE
- Text: #0A2540 (primary), #425466 (muted)
- Font stack: Sohne, Inter, system-ui
- Radius: 6px (inputs/cards), 9999px (pills)
- Spacing scale: 4/8/12/16/24/32/48/64
- Respect the Do's and Don'ts in §7 strictly.
- If a value is missing, derive it from the role (e.g. primary-active = darken primary-hover 10%) rather than inventing a new color.
```

{OPTIONAL: if --dark}
## Dark Mode
| Role | Hex (dark) |
|---|---|
| background | #0B0E14 |
| surface | #141821 |
| border | #1F2430 |
| text | #E6EDF3 |
| text-muted | #8B949E |
| primary | {same or tuned} |
```

### Step 5: Emit optional previews

If `--preview` is set:
1. Write `preview.html` next to the `DESIGN.md`. It must be a zero-dependency static file (no CDN fonts, no build step) that renders:
   - Color swatch grid (one card per role with hex + name)
   - Type scale ladder (h1–small)
   - Button variants in each state (rest, hover-frozen, focus-frozen, disabled)
   - Input + card + alert examples
2. If `--dark` is also set, emit `preview-dark.html` with dark tokens applied.

The preview is purely for human review — never parsed by generators.

### Step 6: Register the DESIGN.md with the project

1. If `--out` is inside a path that already has a `CLAUDE.md`, append a one-line reference to `CLAUDE.md` under a "Design System" section (create if missing):
   ```markdown
   ## Design System
   See [DESIGN.md](./DESIGN.md) — read before generating any UI.
   ```
   Only append if that exact line is not already present. Never modify existing CLAUDE.md rules.
2. Do NOT commit automatically. This skill is a generator, not an evolver — the user decides when to commit. Print:
   ```
   Wrote DESIGN.md to {path}.
   Review, adjust, then run `git add DESIGN.md` when you're happy with it.
   ```

### Step 7: Output summary

```
Created: {path}/DESIGN.md
Source:  {source}
Colors:  {N} roles
Fonts:   {N} families
Preview: {written? yes/no}

/fdl-generate and /fdl-build will read this file automatically for UI tasks in this project.

Next steps:
  - Open DESIGN.md and tweak anything that looks off.
  - Re-run this skill with --preset or a new source to regenerate.
  - Run /fdl-generate <feature> <framework> — UI will match these tokens.
```

## Handling edge cases

### Multiple conflicting sources
If `source` is a URL but `--from-code` also matches, prefer the source the user named explicitly. Call out the conflict and ask.

### Source contains many themes (theme switcher, brand family)
Ask the user which theme / product line this DESIGN.md should represent. Don't silently merge.

### Code mode finds no theme files
Fall back to brief mode, but tell the user: "No `tailwind.config`, `theme.{ts,js,json}`, or `:root` CSS variables found under {path}. Let's build one from scratch."

### Existing DESIGN.md at `--out`
Do not overwrite without confirmation. Show a diff-style summary of what would change and ask.

### Site requires login (crawl mode)
Ask the user to log in manually in Chrome. Never enter credentials on their behalf.

## What this skill does NOT do

- It does NOT create or modify `.blueprint.yaml` files.
- It does NOT run `/fdl-auto-evolve`, validation, or generation. Those are separate skills.
- It does NOT commit to git.
- It does NOT touch the schema or the blueprint index.
- It does NOT replace `/fdl-extract`, `/fdl-extract-web`, `/fdl-extract-code`, or any other skill — it lives alongside them and produces a different artifact (markdown, not YAML).

## Integration with other skills

- **`/fdl-generate`** — reads `DESIGN.md` at project root (or the `--path` target) before emitting UI code. If missing, generation proceeds as before with framework defaults.
- **`/fdl-build`** — does the same, and additionally offers to invoke this skill if no `DESIGN.md` exists when the stack has a UI target (nextjs, angular, flutter, react, vue, svelte, etc.).
- **Third-party agents** (Cursor, Copilot, Aider, Continue) — `DESIGN.md` is plain markdown with no FDL-specific schema, so they consume it automatically when reading project files.
