---
name: fdl-extract-design
description: Produce a DESIGN.md design-system file that /fdl-generate and /fdl-build consume when scaffolding UI
user-invocable: true
argument-hint: "[source-or-brand] [--stack <framework>] [--out <path>] [--dark] [--safety] [--density touch|compact|both] [--locale <scripts>]"
---

# FDL Extract Design — Visual Spec Generator

Capture a brand's visual language into an **FDL Visual Spec** (`DESIGN.md`) so that `/fdl-generate` and `/fdl-build` produce UI that actually looks like the target brand. Zero external dependencies — uses only the tools already in this kit.

This skill is **not** a port of Google Stitch or awesome-design-md. It produces an FDL-native format with a machine-readable `tokens:` block that framework adapters can apply directly to Tailwind, CSS variables, Material theme, or native stylesheets.

## Core principle

The entire value is the moment when a developer says **"make it look like Stripe"** and gets code that _actually_ looks like Stripe — not a generic template. This skill bridges that gap. It is:

- **Source-agnostic** — derives tokens from a URL, a screenshot, an existing codebase, or a plain-English brief
- **Framework-aware** — knows how to emit tokens as Tailwind `theme.extend`, CSS custom properties, or a native theme object
- **Inline-first** — triggered automatically by `/fdl-generate` and `/fdl-build` when a "looks like X" phrase is detected; can also be invoked standalone

## Usage

```
# Standalone — specific brand URL
/fdl-extract-design https://stripe.com

# Standalone — named brand (uses built-in seed library, then live-refines)
/fdl-extract-design stripe
/fdl-extract-design linear --dark
/fdl-extract-design vercel --stack nextjs

# Standalone — from a screenshot or logo
/fdl-extract-design ./assets/brand-reference.png

# Standalone — from existing codebase theme files
/fdl-extract-design ./apps/web --from-code

# Standalone — plain-English brief (short Q&A then writes)
/fdl-extract-design "dark fintech, deep navy, electric blue accent, Inter, sharp 4px corners"

# Inline — triggered by /fdl-generate or /fdl-build (see "Trigger Detection" below)
/fdl-generate login nextjs --looks-like stripe
/fdl-build "nextjs expense tracker styled like Linear"
```

## Arguments

| Argument | Description |
|---|---|
| `[source-or-brand]` | URL · local image · local folder · brand name · plain-English brief |
| `--stack <framework>` | `nextjs` `react` `vue` `svelte` `angular` `flutter` `expo` `laravel`. Drives the Framework Adapter output. When called inline from another skill, the stack is inherited automatically. |
| `--out <path>` | Output path. Default: `DESIGN.md` at project root (or `<--path>/DESIGN.md` when called from `/fdl-build`). |
| `--dark` | Add a dark-mode token block to the file. With `--safety`, dark becomes the default and light is the secondary. |
| `--from-code` | Force codebase-scan mode even when source looks like an asset folder. |
| `--safety` | **Safety / emergency-app mode.** Activates the one-reserved-color rule, mandatory `severity:` scale (panic/attention/info/resolved/neutral), elevated tap targets (88px for primary CTA), AAA contrast targets, and dark-first defaults. Use for safety, dispatch, medical, or any product where status must read at a glance under stress. |
| `--density touch\|compact\|both` | Emit one or both density profiles. `touch` = mobile / consumer. `compact` = operator console / admin. `both` = same tokens, two profile blocks (used when one product spans both surface types). Default: `touch`. |
| `--locale <scripts>` | Comma-separated list of scripts the type stack must support: `latin,nguni,sotho,arabic,cjk,devanagari,thai,…`. Drives `localization.line_height_min` and `font_subsets`. Default: `latin`. |

---

## Trigger Detection (inline use in /fdl-generate and /fdl-build)

`/fdl-generate` and `/fdl-build` scan the raw user prompt for design-intent keywords **before** anything else. When a match is found, they invoke this skill automatically and feed the resulting token block into code generation.

### Phrase patterns that trigger this skill

| Phrase pattern | Example |
|---|---|
| `look(s) like <X>` | "looks like Stripe" |
| `styled like <X>` | "styled like Linear" |
| `design like <X>` | "design like Vercel" |
| `inspired by <X>` | "inspired by Notion" |
| `<X> style` | "Stripe style" / "in a Vercel style" |
| `<X> design` | "with a Notion design" |
| `similar to <X>` | "UI similar to Supabase" |
| `theme of <X>` | "with the theme of GitHub" |
| `make it look like <X>` | "make it look like Figma" |

**`X`** is resolved in this order:
1. Match against the Built-in Brand Library (below) — fires the seed immediately, no crawling required.
2. If `X` is a URL → crawl mode.
3. If `X` is an unknown brand name → brief mode: "I don't have a built-in seed for '{X}'. Give me their site URL or a screenshot and I'll extract it."

When triggered inline, the skill writes the `DESIGN.md` silently, then returns control to the calling skill. The calling skill then applies the tokens via the Framework Adapter before emitting any UI files.

---

## Built-in Brand Library

Seeded from FDL's own knowledge — not copied from any external collection. Each entry is a compact token seed that the skill refines by fetching live signal from the brand's public site when network access is available.

### Developer Tools

| Brand | Mood | Primary | Surface | Radius | Font |
|---|---|---|---|---|---|
| `vercel` | Minimal, black/white, ultra-clean | #000000 | #FFFFFF / #111111 dark | 6px | Geist, Inter, system |
| `linear` | Dark, violet-accented, dense | #5E6AD2 | #1A1A2E / #0F0F23 dark | 6px | Inter Tight, Inter |
| `supabase` | Dark, green-accented, data-dense | #3ECF8E | #1C1C1C / #141414 dark | 8px | Custom, Inter |
| `github` | Neutral, gray-scale, utilitarian | #0969DA | #FFFFFF / #0D1117 dark | 6px | -apple-system, Segoe |
| `raycast` | Dark, frost-glass, macOS-native | #FF6363 | #1C1C1E / #111111 dark | 10px | SF Pro, system |

### Fintech

| Brand | Mood | Primary | Surface | Radius | Font |
|---|---|---|---|---|---|
| `stripe` | Clean, editorial, indigo | #635BFF | #FFFFFF / #0A2540 | 6px | Sohne, Inter |
| `wise` | Fresh, green, approachable | #9FE870 | #FFFFFF / #163300 | 8px | Inter, system |
| `revolut` | Dark, purple, bold | #7B61FF | #191919 / #0D0D0D dark | 8px | Inter, Helvetica |
| `shopify` | Green, trust-building, merchant | #008060 | #FFFFFF / #1A1A1A | 4px | ShopifySans, system |

### AI Platforms

| Brand | Mood | Primary | Surface | Radius | Font |
|---|---|---|---|---|---|
| `openai` | Dark neutral, minimal, confident | #10A37F | #FFFFFF / #212121 dark | 8px | Söhne, system |
| `anthropic` | Warm, terracotta/sand, thoughtful | #D97757 | #FAF9F6 / #1A1A18 dark | 8px | Tiempos Text, Inter |

### Productivity & Design

| Brand | Mood | Primary | Surface | Radius | Font |
|---|---|---|---|---|---|
| `notion` | Warm white, papery, minimal | #000000 | #FFFFFF / #191919 dark | 3px | ui-sans-serif, system |
| `figma` | Bold purple-pink, design-native | #A259FF | #1E1E1E / #2C2C2C dark | 6px | Inter, system |
| `airtable` | Colorful, approachable, SaaS | #FCB400 | #FFFFFF / #18181B dark | 6px | CircularXX, Inter |

### Safety / Operations / Dispatch

These seeds default to `--safety` mode: dark-first, severity scale mandatory, AAA contrast, frame-mood pattern, mono-for-data baseline.

| Brand | Mood | Reserved color | Surface | Radius | Font |
|---|---|---|---|---|---|
| `vigil` | Calm authority, ATC-console, ambient-status | #FF3B30 (panic only) | #0B0F14 dark / #F4F1EC warm-light admin | 4px control / 16px sheet | Inter Variable + Geist Mono |
| `dispatch` | Mission-critical ops, pre-2030 console | #FF6B35 (active alarm only) | #0F0F11 / #1A1A1F | 4px / 12px | Geist + Geist Mono |
| `medic` | Clinical-calm, healthcare-grade | #2EBD8E (resolved primary, panic reserved) | #0E1218 / #F7F5F0 light | 6px / 16px | Inter + JetBrains Mono |

**Reference build:** `vigil` is fully realised in `docs/plans/community-safety-platform.DESIGN.md` (spec) and `docs/plans/community-safety-platform.vigil.prototype.html` (working prototype). Treat that pair as the canonical example of a `--safety` DESIGN.md. When users say "looks like Vigil" or describe a safety/dispatch/emergency app, use this seed and load the spec for reference.

---

## Workflow

### Step 1: Resolve source mode

```
source-or-brand
├── URL → Crawl mode
├── Local image (.png / .jpg / .webp / .svg) → Vision mode
├── Local folder → Code mode
├── Name in Built-in Brand Library → Seed mode (+ optional live-refine)
└── Free text / unknown brand → Brief mode
```

If called inline from another skill, the detected `<X>` phrase is the source. If `X` matches the built-in library, jump directly to Seed mode (no Q&A, no waiting — speed matters in inline use).

---

### Step 2: Gather signal

#### Seed mode (built-in brand)
1. Load the token seed from the Built-in Brand Library table.
2. If network is available, live-refine by fetching the brand's public homepage with `WebFetch`:
   - Ask it to describe computed CSS colors, typography, radii, shadow, density.
   - Merge live observations into the seed — live data wins on hex values, seed wins on role assignments.
3. Skip live-refine silently if network is unavailable; proceed with seed.

#### Crawl mode (URL)
1. Use Chrome MCP if available: `navigate`, wait 2–3s, `screenshot`, then extract `:root` CSS custom properties and `getComputedStyle` on key elements (h1, button, input, card).
2. Fall back to `WebFetch` if Chrome MCP is unavailable. Ask the fetch result to describe colors, typography, radius, shadows, density.
3. Collect: top 8–10 color hex values + roles, font families, numeric font sizes on h1/h2/h3/body/small, border-radius, box-shadow values, spacing rhythm.

#### Vision mode (image)
1. `Read` the image file (Claude multimodal vision).
2. Describe systematically: dominant colors (with approximate hex), text treatment, density, shape language, shadow presence.
3. Flag that hex values are approximations and ask user to confirm the accent/primary before writing.

#### Code mode (local folder)
Scan in priority order — stop at first match per category:

| Category | Files to scan |
|---|---|
| Colors | `tailwind.config.{js,ts,cjs,mjs}` → `theme.extend.colors` |
| Colors alt | `:root { --* }` in `*.css`, `*.scss` under `src/`, `styles/`, `app/`, `theme/` |
| Colors alt | `theme.{ts,js,json}`, `design-tokens.json`, `tokens.json` |
| Typography | Same tailwind config → `fontFamily`, `fontSize` |
| Spacing | Same tailwind config → `spacing`, `padding` |
| Radius | Same tailwind config → `borderRadius` |
| Shadows | Same tailwind config → `boxShadow` |

Record which file each token came from for traceability.

#### Brief mode (free text or unknown brand)
Ask in one `AskUserQuestion` call (batch all questions):
1. Mood — fintech / playful / editorial / ops-dashboard / consumer / developer / other?
2. Primary brand color (hex or description)
3. Accent or secondary color?
4. Surface: white / warm-white / near-black / dark-gray?
5. Font preference: system / Inter / Geist / custom?
6. Shape: sharp (2–4px) / rounded (6–8px) / pill (12px+)?
7. Density: compact / comfortable / spacious?
8. Dark mode needed?

---

### Step 3: Confirm extracted tokens (interactive runs only)

In interactive (non-inline) runs, present a compact plain-language summary and use `AskUserQuestion` to resolve uncertainty before writing the file. In inline runs, write immediately without prompting — speed over perfection, and the user can re-run the skill standalone to refine.

**Example interactive summary:**
```
DESIGN TOKENS — Stripe (live-refined)

Colors (10 roles):
  primary      #635BFF  CTAs, links, focus
  primary-hover #5A52E5  hover
  background   #FFFFFF  page
  surface      #F6F9FC  cards, panels
  border       #E3E8EE  hairlines
  text         #0A2540  body
  text-muted   #425466  secondary
  danger       #DF1B41  errors
  success      #0E9F6E  confirmations
  warning      #C27803  cautions

Typography:
  heading: Sohne, Inter, system-ui  weight 600/700
  body:    Sohne, Inter, system-ui  weight 400/500
  mono:    "Sohne Mono", "SF Mono", Menlo
  scale:   12 / 14 / 16 / 18 / 24 / 32 / 48 / 64

Shape:
  radius: 6px (controls) · 8px (cards) · 9999px (pills)
  shadow: 4 levels (0.06 → 0.18 rgba)

Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

⚠ Not confirmed: dark-mode surface tone (no dark variant on live site)
```

---

### Step 4: Write DESIGN.md (FDL Visual Spec format)

This is the FDL-native format. It is NOT Stitch's 9-section format — it leads with a machine-readable `tokens:` YAML block so framework adapters can parse it directly, followed by human-readable rules.

```markdown
<!--
  FDL Visual Spec — {Brand}
  Generated: {ISO date} by /fdl-extract-design
  Source: {url / image path / built-in seed / brief}
  Stack target: {framework or "any"}

  This file is the source of truth for UI tokens in this project.
  /fdl-generate and /fdl-build read it before emitting any UI code.
  Edit manually to refine; re-run /fdl-extract-design to rebuild from source.
-->

# Visual Spec — {Brand}

## tokens
<!-- Machine-readable block. DO NOT rename keys — framework adapters depend on them. -->

```yaml
brand: {brand-name}
source: {url | seed | image | code | brief}

colors:
  primary:       "#635BFF"
  primary_hover: "#5A52E5"
  primary_active: "#4840C4"
  background:    "#FFFFFF"
  surface:       "#F6F9FC"
  surface_2:     "#EFF3F8"
  border:        "#E3E8EE"
  text:          "#0A2540"
  text_muted:    "#425466"
  text_placeholder: "#8898AA"
  danger:        "#DF1B41"
  success:       "#0E9F6E"
  warning:       "#C27803"
  focus_ring:    "rgba(99,91,255,0.25)"

dark:                         # present only when --dark or brand has native dark
  background:    "#0A2540"
  surface:       "#0D2D4A"
  surface_2:     "#1A3A5C"
  border:        "#1E3A56"
  text:          "#E6EDF3"
  text_muted:    "#8B949E"

typography:
  heading_family: '"Sohne", "Inter", system-ui, sans-serif'
  body_family:    '"Sohne", "Inter", system-ui, sans-serif'
  mono_family:    '"Sohne Mono", "SF Mono", Menlo, monospace'
  weights:
    regular: 400
    medium:  500
    semibold: 600
    bold:    700
  scale:          # rem
    xs:    0.75
    sm:    0.875
    base:  1
    lg:    1.125
    xl:    1.25
    "2xl": 1.5
    "3xl": 2.25
    "4xl": 3
    "5xl": 3.5
  line_heights:
    display: 1.1
    body:    1.5
    compact: 1.25
  letter_spacing:
    display: "-0.02em"
    body:    "0"
    caps:    "0.06em"

shape:
  radius:
    control:  "6px"          # inputs, buttons, badges
    card:     "8px"          # cards, panels
    dialog:   "12px"         # modals, drawers
    pill:     "9999px"       # tags, chips
  shadows:
    level_0: "none"
    level_1: "0 1px 2px rgba(10,37,64,0.06)"
    level_2: "0 2px 8px rgba(10,37,64,0.08)"
    level_3: "0 8px 24px rgba(10,37,64,0.12)"
    level_4: "0 24px 48px rgba(10,37,64,0.18)"

spacing:                      # px — also used as Tailwind spacing multiplier
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]

layout:
  container_max: "1200px"
  columns: 12
  gutter_desktop: "32px"
  gutter_mobile: "16px"

# ─── SEVERITY (mandatory under --safety, optional otherwise) ───
# Drives ambient screen mood — frame border-glow + surface tint, not just badges.
# Use distinct semantic weights; never overload `danger` for both
# "delete a row" AND "active emergency" — those need different colors.
severity:
  panic:     "#FF3B30"   # active life/property emergency in progress
  attention: "#FFB020"   # advisory, suspicious, medical-non-critical
  info:      "#5CC8FF"   # in-progress, on-scene, awaiting confirmation
  resolved:  "#34C77B"   # closed positively
  neutral:   "#6C7684"   # idle, no active state
  # Companion ambient + glow tokens for each level — required for frame-mood pattern.
  panic_ambient:     "rgba(255,59,48,0.08)"
  panic_glow:        "rgba(255,59,48,0.35)"
  attention_ambient: "rgba(255,176,32,0.10)"
  attention_glow:    "rgba(255,176,32,0.28)"
  info_ambient:      "rgba(92,200,255,0.10)"
  info_glow:         "rgba(92,200,255,0.28)"
  resolved_ambient:  "rgba(52,199,123,0.10)"
  resolved_glow:     "rgba(52,199,123,0.28)"

# ─── MOTION (always emit; replaces prose-only motion guidance) ───
# 120ms snap is the default — the AI-default 200ms ease-out is what dates UI.
# Spring curves only on critical state changes (panic activation, modal entry).
motion:
  durations:
    instant: "60ms"     # acknowledgement (button press feedback)
    fast:    "120ms"    # hover, focus, micro-interactions — DEFAULT
    base:    "200ms"    # screen transitions
    slow:    "320ms"    # critical state changes
    breath:  "3000ms"   # ambient breathing rate (0.3hz) for active-state glow
  easings:
    snap:        "cubic-bezier(0.4, 0, 0.2, 1)"        # default
    spring_soft: "cubic-bezier(0.34, 1.18, 0.64, 1)"   # overdamped, no overshoot — sheets/modals
    spring_firm: "cubic-bezier(0.5, 0, 0.2, 1.1)"      # critical state activation
    linear:      "linear"

# ─── ACCESSIBILITY (always emit) ───
# First-class tokens — generators must enforce, not infer from prose.
accessibility:
  tap_min:           "44px"   # WCAG AA minimum interactive surface
  tap_emergency:     "88px"   # safety-mode primary CTA (assumes shaking hands)
  focus_ring_width:  "2px"
  focus_ring_offset: "2px"
  focus_ring_color:  "var(--info)"   # use the info color, never disable focus
  contrast_target:   "AA"     # AAA under --safety
  motion_safe:       true     # all ambient animation respects prefers-reduced-motion

# ─── DENSITY (one or both, controlled by --density) ───
# Same tokens, different size profiles. `touch` for mobile/consumer,
# `compact` for operator console / admin / data-dense surfaces.
density:
  touch:
    control_height:  "52px"
    control_padding: "0 16px"
    field_height:    "52px"
    row_height:      "64px"
    section_gap:     "24px"
  compact:
    control_height:  "32px"
    control_padding: "0 12px"
    field_height:    "34px"
    row_height:      "40px"
    section_gap:     "16px"

# ─── LOCALIZATION (driven by --locale) ───
# Drives line-height baseline and font subsets. Diacritics from
# Nguni / Sotho / Vietnamese / Devanagari etc. clip at the
# typical `line-height: 1.5` — bump to 1.55+ when those scripts are listed.
localization:
  scripts: [latin]                # extend per --locale flag
  line_height_min: 1.5            # 1.55 if any script in [nguni, sotho, vietnamese, arabic, devanagari, thai]
  font_subsets: [latin]           # add `latin-ext`, `vietnamese`, etc. as needed
  test_strings:                   # used to verify the type stack renders chosen scripts
    latin: "The quick brown fox jumps over the lazy dog"
    # nguni: "Ngiyaxhumana — Awusekho phakathi kwengozi?"
    # sotho: "O bolokegile? Re hloka ho tseba hore na o phela hantle."
```

## Color roles
| Role | Hex | When to use |
|---|---|---|
| `primary` | #635BFF | The single most important action on screen — one per view |
| `primary-hover` | #5A52E5 | Hover state of any primary interactive element |
| `background` | #FFFFFF | Page canvas |
| `surface` | #F6F9FC | Cards, panels, elevated sections |
| `border` | #E3E8EE | All hairline separators |
| `text` | #0A2540 | Body copy and headings |
| `text-muted` | #425466 | Secondary copy, timestamps, helper text |
| `danger` | #DF1B41 | Destructive actions and error states only |
| `success` | #0E9F6E | Confirmation states |
| `warning` | #C27803 | Caution states |

## Typography
- Heading stack: {heading_family} · semibold / bold
- Body stack: {body_family} · regular / medium
- Code / data: {mono_family}
- Scale: xs(12) · sm(14) · base(16) · lg(18) · xl(20) · 2xl(24) · 3xl(36) · 4xl(48) · 5xl(56)
- Display copy: −0.02em letter-spacing, 1.1 line-height
- Body copy: 0em letter-spacing, 1.5 line-height

## Components

### Button
- **Primary** height:{control-height} radius:{shape.radius.control} weight:500 fill:primary hover:primary-hover focus:{focus_ring} disabled:opacity-50
- **Secondary** height:same 1px-border:text fill:transparent hover:surface
- **Ghost** no border fill:transparent hover:surface
- **Destructive** same shape as primary, fill:danger

### Input
- Height:{control-height} radius:{shape.radius.control} border:1px-{border} focus:{primary}-border+{focus_ring}
- Label above in text/sm/medium · hint below in text-muted/sm/regular · error in danger/sm

### Card
- radius:{shape.radius.card} border:1px-{border} background:surface
- hover → shadow.level_2 (no border-color change)

### Navigation
- Top bar height:64 border-bottom:1px-{border}
- Active item: primary text + 2px bottom indicator
- Below md: drawer/hamburger pattern

## Severity scale — ambient screen mood
<!-- Always emit when --safety, optional otherwise. The pattern is: state is the screen's mood, not just a badge. -->

When a screen represents an active state (incident, in-progress, awaiting confirmation, resolved), the **frame itself glows** the severity color, breathing at 0.3hz (`motion.durations.breath`). A user glancing at the screen knows what's happening before reading any text.

| State | Frame border-glow | Surface tint | Badge color | When |
|---|---|---|---|---|
| `neutral` | none | none | `text-muted` | Idle |
| `info` | `severity.info` ring + `severity.info_glow` | `severity.info_ambient` | `severity.info` | In-progress, on-scene, awaiting |
| `attention` | `severity.attention` ring + `severity.attention_glow` | `severity.attention_ambient` | `severity.attention` | Advisory, suspicious, non-critical medical |
| `panic` | `severity.panic` ring + `severity.panic_glow` (animated breath) | `severity.panic_ambient` | `severity.panic` | Active life/property emergency |
| `resolved` | `severity.resolved` ring (3s fade) | `severity.resolved_ambient` | `severity.resolved` | Closed positively |

Reference CSS (emit verbatim into the framework adapter):
```css
@keyframes mood-breath {
  0%,100% { box-shadow: 0 0 0 1px var(--severity-color), 0 0 24px var(--severity-glow); }
  50%     { box-shadow: 0 0 0 1px var(--severity-color), 0 0 48px var(--severity-glow); }
}
.frame--panic { animation: mood-breath 3s ease-in-out infinite; --severity-color: var(--severity-panic); --severity-glow: var(--severity-panic-glow); }
```

## Density modes
<!-- Emit one or both depending on --density. -->

The same token system serves two surface types: `touch` (mobile, consumer, stress contexts) and `compact` (operator console, admin, data-dense). Pick by surface, not by viewport. A mobile operator console still uses `compact`; a desktop tablet checkout still uses `touch`.

- **`touch`** — primary controls 52px tall, rows 64px. Used for resident apps, patroller apps, customer-facing surfaces.
- **`compact`** — primary controls 32px tall, rows 40px. Used for operator dashboards, admin tools, data tables.

Generators read `density.touch` and `density.compact` independently and emit per-surface CSS classes (`.density-touch .btn` vs `.density-compact .btn`) — never bake one density into the global stylesheet.

## Localization
<!-- Drives line-height baseline + font subsets. Always emit when --locale lists non-Latin scripts. -->

Diacritics from Nguni, Sotho, Vietnamese, Devanagari, and Thai clip at the typical `line-height: 1.5`. When `localization.scripts` includes any of those, `localization.line_height_min` MUST be ≥ 1.55. Generators apply this to body text and any prose surface — not headings (which use `line_heights.display`).

- Emit `font_subsets` into the font-loading config (Google Fonts URL params, Fontsource subsets, or `@font-face` `unicode-range`).
- Use `test_strings` in the spec as visual regression checks: render each at the body type scale and verify no clip.
- Avoid English-metaphor icons (thumbs-up, OK hand, fingers-crossed). Geometric symbols only.

## Do rules
- One `primary` action per screen. Secondary and ghost for everything else.
- Use `text-muted` for all metadata — never a custom gray.
- **Status by frame mood + surface tint + badge — never badge alone.** The badge is an accent; the glow is the meaning.
- **Mono for all data** users will compare or read aloud — IDs, ETAs, distances, timestamps, coordinates, counts, reference numbers.
- **Commit on radius**: `shape.radius.control` (sharp, ≤4px) for controls, `shape.radius.sheet` (generous, ≥16px) for cards. Avoid the 6–12px middle ground — it's the AI-default tell.
- **120ms snap is the default** for hover/focus/state changes. Use `motion.easings.spring_firm` only for critical state activation. Use `spring_soft` only for sheet/modal entry.
- Maintain 96px minimum vertical rhythm between major page sections.
- Accent gradient (if defined) is for hero / marketing surfaces only — never controls.
- **Under `--safety`**: reserve the `severity.panic` color for active emergencies only. Destructive UI actions (delete, cancel) use `surface_3` outlined with `border_strong`, never panic red.

## Don't rules
- Don't stack two shadow levels on one element.
- Don't use `danger` (or `severity.panic` under safety) for anything other than its single defined purpose. Once you reuse a status color decoratively, the eye habituates and the signal is destroyed.
- Don't mix `shape.radius.control` and `shape.radius.sheet` on the same element.
- Don't hard-code any hex value outside this spec — add a role here first.
- Don't apply `shadow` to cards on mobile — use `border` instead.
- **Don't put a contrast-color header bar at the top of frames.** Hairline border-bottom only. Solid red/blue/branded headers are a 2018 SaaS pattern that screams "AI-generated."
- **Don't use proportional digits for IDs, times, distances, ETAs.** Mono.
- **Don't use shadows on dark surfaces** — they don't work. Use elevated surface colors (`surface_2`, `surface_3`) for hierarchy instead.
- **Don't use 200ms `ease-out` for everything.** That's the AI-default tell. Use `motion.durations.fast` (120ms) with `motion.easings.snap`.
- **Don't use a second sans-serif.** Inter Variable / Geist / one chosen variable family does all weights and optical sizes. Pairing two sans families is a mid-2010s pattern.
- **Don't lift, scale, or translate on hover** unless the element is a card being picked up. Hover = subtle background tint via `surface_2` → `surface_3`. Save motion for state changes that mean something.
- **Don't remove focus rings** without replacing them with a visible alternative. WCAG 2.4.7. Generators that emit `outline:none` without a substitute fail the spec.
- **Don't badge an active state without lighting the frame** (under `--safety`). Badge alone reads as "informational"; frame glow reads as "this is happening now."

## Responsive
| Breakpoint | px | Changes |
|---|---|---|
| sm | 640 | Single-column; typography scale −1 step |
| md | 768 | Two-column grid; nav collapses to drawer |
| lg | 1024 | Full grid; cards show hover shadows |
| xl | 1280 | Container capped at max_width |
| 2xl | 1536 | Full-bleed hero only |

Touch targets: 44×44 minimum on mobile, 32×32 on desktop pointer.

## Generation instructions
<!-- Section read verbatim by /fdl-generate and /fdl-build when emitting UI. -->

```
Tokens are in the ## tokens block above. Use them as follows:

CORE
- Map color roles to the framework adapter output (CSS vars / Tailwind extend / theme object).
- Never use a raw hex that is not in the tokens block.
- Apply shape.radius.control to all interactive controls; shape.radius.sheet (or .card) to all card/panel surfaces.
  Avoid the 6–12px radius middle ground — commit to one side per element.
- Use shadow levels for elevation on LIGHT surfaces only. On dark surfaces, use elevated surface colors
  (surface_2, surface_3) instead — shadows do not work on dark.
- Honour every rule in ## Do rules and ## Don't rules as hard constraints, not suggestions.
- When the stack has no explicit Tailwind config, emit CSS custom properties from the tokens block.

SEVERITY (when present)
- For each severity level, emit three CSS variables: solid (--severity-{name}), ambient (--severity-{name}-ambient), glow (--severity-{name}-glow).
- For each surface that represents an active state, emit a frame-mood class (.frame--{level}) using the breath keyframe in ## Severity scale.
- Pills and badges use the ambient + solid pair; the frame uses the glow.
- The reserved color (severity.panic under --safety) MUST appear ONLY in panic-level UI. Generators that emit it for delete/destructive actions, hover states, or decoration FAIL the spec.

MOTION
- Default transition: var(--motion-fast) var(--motion-snap). Do not emit 200ms ease-out as a default.
- Use spring_firm only for critical state activation (panic, alarm). Use spring_soft for sheet/modal entry.
- All ambient breathing animations MUST be wrapped in `@media (prefers-reduced-motion: reduce) { animation: none; }`.

ACCESSIBILITY (always enforce)
- Every interactive element ≥ accessibility.tap_min. Under --safety, the primary CTA ≥ accessibility.tap_emergency.
- Focus rings: width × offset × color from accessibility.* — never `outline: none` without a visible alternative.
- Contrast: meet accessibility.contrast_target. Validate body text and labels at generation time.

DENSITY (when both modes present)
- Emit two CSS scopes: `.density-touch` and `.density-compact`. Apply per-surface, not globally.
- Operator/admin layouts inherit `.density-compact`. Mobile/consumer layouts inherit `.density-touch`.

LOCALIZATION
- If localization.scripts includes any non-Latin entry, body line-height MUST be ≥ localization.line_height_min.
- Emit font-loading directives that include all listed font_subsets.
- Render localization.test_strings in a hidden test page or Storybook story so visual regression catches diacritic clipping.

DATA TYPOGRAPHY
- All IDs, ETAs, distances, timestamps, coordinates, counts, and reference numbers MUST render in the mono family.
- This is non-negotiable for safety/dispatch/admin contexts where users compare values across rows.
```
```

---

### Step 5: Framework Adapter output

After writing `DESIGN.md`, emit a second file in the correct format for the target stack. This is what the code generator pastes directly into framework boilerplate — no manual translation required.

#### nextjs / react / vue / svelte → `design-tokens.{js,ts}`

```ts
// design-tokens.ts — generated by /fdl-extract-design
// Source: {brand} · {date}
// DO NOT EDIT — re-run /fdl-extract-design to regenerate.

export const tokens = {
  colors: {
    primary:      "#635BFF",
    primaryHover: "#5A52E5",
    background:   "#FFFFFF",
    surface:      "#F6F9FC",
    border:       "#E3E8EE",
    text:         "#0A2540",
    textMuted:    "#425466",
    danger:       "#DF1B41",
    success:      "#0E9F6E",
    warning:      "#C27803",
  },
  radius: { control: "6px", card: "8px", dialog: "12px", pill: "9999px" },
  shadow: {
    1: "0 1px 2px rgba(10,37,64,0.06)",
    2: "0 2px 8px rgba(10,37,64,0.08)",
    3: "0 8px 24px rgba(10,37,64,0.12)",
    4: "0 24px 48px rgba(10,37,64,0.18)",
  },
  font: {
    heading: '"Sohne", "Inter", system-ui, sans-serif',
    body:    '"Sohne", "Inter", system-ui, sans-serif',
    mono:    '"Sohne Mono", "SF Mono", Menlo, monospace',
  },
} as const;
```

#### Tailwind → additions to `tailwind.config.{js,ts}` `theme.extend`

```js
// Paste into theme.extend:
colors: {
  primary:       "#635BFF",
  "primary-hover": "#5A52E5",
  surface:       "#F6F9FC",
  border:        "#E3E8EE",
  "text-base":   "#0A2540",
  "text-muted":  "#425466",
  danger:        "#DF1B41",
  success:       "#0E9F6E",
},
borderRadius: { control: "6px", card: "8px", dialog: "12px" },
boxShadow: {
  1: "0 1px 2px rgba(10,37,64,0.06)",
  2: "0 2px 8px rgba(10,37,64,0.08)",
  3: "0 8px 24px rgba(10,37,64,0.12)",
  4: "0 24px 48px rgba(10,37,64,0.18)",
},
fontFamily: {
  sans: ['"Sohne"', '"Inter"', 'system-ui', 'sans-serif'],
  mono: ['"Sohne Mono"', '"SF Mono"', 'Menlo', 'monospace'],
},
```

#### Under `--safety`: additional vars per adapter

When `--safety` is set, every adapter MUST also emit:

- `--severity-{level}`, `--severity-{level}-ambient`, `--severity-{level}-glow` for each level in `tokens.severity`
- `--motion-fast`, `--motion-base`, `--motion-slow`, `--motion-breath` from `tokens.motion.durations`
- `--motion-snap`, `--motion-spring-soft`, `--motion-spring-firm` from `tokens.motion.easings`
- `--tap-min`, `--tap-emergency`, `--focus-ring-width`, `--focus-ring-offset`, `--focus-ring-color` from `tokens.accessibility`
- A pair of CSS scopes `.density-touch` and `.density-compact` redeclaring `--control-height`, `--field-height`, `--row-height`, `--section-gap`
- A `@keyframes mood-breath { … }` rule plus four classes (`.frame--info`, `.frame--attention`, `.frame--panic`, `.frame--resolved`) implementing the severity-as-mood pattern

**Worked reference:** `docs/plans/community-safety-platform.vigil.prototype.html` is the canonical Vigil adapter — copy its CSS custom properties block as the starting template for any safety-mode generation.

#### CSS custom properties → `tokens.css`

```css
/* tokens.css — generated by /fdl-extract-design */
:root {
  --color-primary:      #635BFF;
  --color-primary-hover:#5A52E5;
  --color-background:   #FFFFFF;
  --color-surface:      #F6F9FC;
  --color-border:       #E3E8EE;
  --color-text:         #0A2540;
  --color-text-muted:   #425466;
  --color-danger:       #DF1B41;
  --color-success:      #0E9F6E;
  --color-warning:      #C27803;
  --radius-control:     6px;
  --radius-card:        8px;
  --radius-dialog:      12px;
  --shadow-1: 0 1px 2px rgba(10,37,64,0.06);
  --shadow-2: 0 2px 8px rgba(10,37,64,0.08);
  --shadow-3: 0 8px 24px rgba(10,37,64,0.12);
  --shadow-4: 0 24px 48px rgba(10,37,64,0.18);
  --font-heading: "Sohne", "Inter", system-ui, sans-serif;
  --font-body:    "Sohne", "Inter", system-ui, sans-serif;
  --font-mono:    "Sohne Mono", "SF Mono", Menlo, monospace;
}
```

#### Flutter → `design_tokens.dart`

```dart
// design_tokens.dart — generated by /fdl-extract-design
import 'package:flutter/material.dart';
class DesignTokens {
  static const Color primary      = Color(0xFF635BFF);
  static const Color background   = Color(0xFFFFFFFF);
  static const Color surface      = Color(0xFFF6F9FC);
  static const Color textBase     = Color(0xFF0A2540);
  static const Color textMuted    = Color(0xFF425466);
  static const Color danger       = Color(0xFFDF1B41);
  static const double radiusControl = 6.0;
  static const double radiusCard    = 8.0;
}
```

#### shadcn/ui → add to `globals.css` `:root` block

Emit the CSS custom properties above AND remap the shadcn semantic variables:
```css
:root {
  --background: 0 0% 100%;          /* #FFFFFF */
  --foreground: 213 96% 14%;        /* #0A2540 */
  --primary: 243 100% 69%;          /* #635BFF */
  --primary-foreground: 0 0% 100%;
  --muted: 213 40% 96%;             /* #F6F9FC */
  --muted-foreground: 213 22% 56%;  /* #425466 */
  --border: 213 24% 91%;            /* #E3E8EE */
  --radius: 6px;
}
```
(Convert hex to HSL — do the math correctly. Never approximate HSL.)

---

### Step 6: Register and complete

1. If `DESIGN.md` already exists at the output path, show a one-line diff summary and ask before overwriting.
2. After writing, print:
   ```
   ✓ DESIGN.md written to {path}
   ✓ {adapter-file} written ({framework} adapter)

   /fdl-generate and /fdl-build will apply these tokens automatically.
   Refine: edit DESIGN.md · Rebuild: /fdl-extract-design {source}
   ```
3. Do NOT commit. Do NOT run validate. Do NOT invoke auto-evolve. This skill produces design files, not blueprints.

---

## What this skill does NOT do

- Does not create or modify `.blueprint.yaml` files.
- Does not copy from, reference, or depend on awesome-design-md, Firecrawl, or Google Stitch.
- Does not require any external API key or paid service.
- Does not commit or push.
- Does not replace any other skill.

## Security / POPIA

- Strip credentials, auth tokens, and analytics IDs from any crawled page source before recording URLs in the spec.
- Refuse to process images that visibly contain PII (ID numbers, names + account numbers).
- Never include real API keys or secrets in the token output — design tokens are purely visual.

## Integration with other skills

- **`/fdl-generate`** — reads `DESIGN.md` + the framework adapter file at Step 0a.5 before emitting UI. Tokens in the `## tokens` YAML block are parsed and merged into `extracted.design_tokens`. Rules in `## Do rules` and `## Don't rules` become hard constraints alongside blueprint rules.
- **`/fdl-build`** — at Step 0.7, detects "looks like X" phrases and calls this skill inline before code generation begins. If no DESIGN.md exists and the build has a UI target, offers to generate one.
- **Third-party agents** (Cursor, Copilot, Aider, Continue) — `DESIGN.md` is plain markdown; they consume it natively. The `## tokens` block is fenced YAML, readable by any agent.
