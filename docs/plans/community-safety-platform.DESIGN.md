<!--
  FDL Visual Spec — Vigil
  For: Community Safety Response Platform
  Generated: 2026-04-16
  Source: original prototype (Netcare-inspired) refactored for 2026→2030 product design
  Stack target: any (web, React Native, Flutter)

  This file is the source of truth for UI tokens in the community-safety platform.
  /fdl-generate and /fdl-build read it before emitting any UI code.
  Edit manually to refine; re-run /fdl-extract-design to rebuild from a fresh source.

  Companion prototype: community-safety-platform.vigil.prototype.html
-->

# Visual Spec — Vigil

> **Calm authority.** The interface should feel like a 999 dispatcher who's handled this before — quiet most of the time, absolutely clear when it matters. Closer to Apple Find My crossed with an air-traffic-control console than to a typical SaaS dashboard. Map is the canvas. Status is the screen's mood, not a badge.

## Why this exists

The previous prototype used the shadcn/Material default look — light canvas, hairline cards, indigo-or-red primary, generic ease-out motion. It read as "AI-generated SaaS, 2020." That visual language is wrong for an emergency platform: it doesn't feel trustworthy, it doesn't work at 2am on a patroller's phone, and it gives every red the same weight (delete-button red = panic-button red = error-text red, which means none of them mean anything).

Vigil is what someone reaches for in the worst moment of their life. The bar is not "looks modern." The bar is **"the user trusts it without thinking."** Trust is built daily — every glance at the home screen, every read message, every drill — and cashed in once, when it has to work.

Vigil makes specific decisions instead of safe defaults:

1. **Dark-first, warm.** Background is `#0B0F14` — warm-dark, not pure black. Light mode exists for daytime admin only.
2. **One red, one job.** `#FF3B30` means *active emergency in progress*. Never a delete button, never a hover, never decoration. When red appears, it actually means something.
3. **Status as ambient frame mood.** Active incident = the whole frame gets a subtle red border-glow. Resolved = the frame exhales back to neutral. Badges become accents, not the carriers of meaning.
4. **Mono everywhere data lives.** IDs, ETAs, coordinates, timestamps, distances, counts. Operators read mono numbers like radio dispatch logs.
5. **Sharp commitment on radius.** 4px on controls, 16px on sheets, 32px+ on phone frames. The 8–12px middle ground is the AI-default tell.
6. **Spring motion, not ease curves.** Critical-state changes use overdamped springs. Everything else is 120ms — faster than the AI-default 200ms because urgency.
7. **Inter Variable + Geist Mono.** One variable family used aggressively. Optical sizing engaged on display weights. No second sans.
8. **Localization built in.** Line-height baseline is 1.55 (Nguni/Sotho diacritics tested), not the default 1.5.
9. **Familiar patterns, novel aesthetic.** The visual language can be Vigil. The interaction vocabulary cannot be. Users in stress have no capacity to learn — they need to recognise. Every interaction inherits from apps people already speak fluently.

## The familiar-patterns rule

In an emergency context, novel UI is hostile UI. The user's hands are shaking, their cognitive load is maxed, and they will do whatever pattern their muscle memory already knows. Designing a "clever" panic button costs lives.

So the design language (color, type, severity tokens, spacing) is allowed to be Vigil-original. The **interaction patterns** must be inherited verbatim from apps every South African already uses daily. Treat these as locked benchmarks:

| Surface | Reference app | What we inherit verbatim |
|---|---|---|
| **Active incident tracking** | **Uber** | Driver-style card with photo + name + vehicle + plate; live polyline route; status states ("Heading to you" → "Around the corner" → "Outside"); ETA ticker that visibly counts down; bottom action bar (Call · Message · Share); cancel hidden behind swipe + double-confirm |
| **Messaging** | **WhatsApp** | Read receipts (✓ sent, ✓✓ delivered grey, ✓✓ blue read); typing indicator with three bouncing dots; voice notes with waveform + duration + play button; reply-to-message with quoted strip; presence indicator (green dot + "Online · last seen 13:48"); end-to-end encryption banner; 🎤 hold-to-record button; 📎 attachment |
| **Map + location share** | **Apple Find My** | Full-bleed map; person-pins with severity color; "share my location" as a primary affordance; live trail polyline; coordinate readout in corner |
| **Panic confirmation** | **Citizen / Noonlight** | Big primary surface that IS the button; hold-to-confirm with visible countdown ring; silent-cancel window; haptic + audio + visual redundant feedback |
| **Onboarding** | **Banking app KYC (FNB / Capitec)** | Step indicator dots; one decision per screen; "POPIA notice" inline cards explaining what data does what; biometric enrolment with face-frame visual |
| **Sheets / modals / toggles** | **iOS / Android system** | Standard rounded sheets; toggle switches that match platform; segmented pill controls; bottom-sheet present pattern |
| **Operator console** | **Linear + air-traffic-control** | Tabular dense queue with filter chips; row-level severity color; mono numbers throughout; tab bar at top of console frame |
| **Status broadcast** | **WhatsApp Status / Stories** | Time-bounded sector advisory; severity-tinted preview; one-tap acknowledgement |

**Test:** if a 60-year-old who uses WhatsApp, calls Uber, and banks on their phone can use the panic flow in the back of a moving car without instruction — pattern is correct. If they hesitate or look for help — pattern is wrong, no matter how clean it looks.

## Trust signals — built daily, cashed once

The home screen is the trust surface. People glance at it dozens of times before they ever press SOS. Every glance must reinforce "this is awake, this is ready." Vigil home shows ambient signals at the top, always visible:

- **`23 patrollers awake · 5km`** — live count, never a stale number
- **`AVG 2:14`** — sector's actual response-time over the last 30 days
- **`LAST DRILL · 4 DAYS AGO · Test again →`** — like a smoke-alarm self-test, builds confidence the system actually works

On the splash / first-run, lead with positioning copy that does the work of marketing without sounding like marketing: *"When seconds count, your sector is already moving."* Below it: live sector activity counter, average response, 30-day uptime, and an explicit "offline-aware" callout (load-shedding reality). Trust footer: `END-TO-END ENCRYPTED · POPIA-COMPLIANT · BUILT IN ZA`.

Verified-responder badge on every responder card: `✓ VERIFIED` in resolved-green next to the name. Vehicle, plate, skills, and response count visible Uber-style — `4.9★ · 312 RESPONSES`. The user knows exactly who is coming before they arrive.

## tokens

<!-- Machine-readable block. DO NOT rename keys — framework adapters depend on them. -->

```yaml
brand: vigil
source: rebuild from community-safety-platform.prototype.html (Netcare-inspired baseline)

colors:
  # Warm dark surfaces — never pure black
  background:        "#0B0F14"
  surface:           "#131820"
  surface_2:         "#1A2028"
  surface_3:         "#232A33"
  border:            "#2A323D"
  border_strong:     "#3A4350"

  # Text — near-white with warmth, never pure white
  text:              "#E8ECF1"
  text_muted:        "#A8B2BD"
  text_placeholder:  "#6C7684"

  # THE red — reserved for active emergency only
  emergency:         "#FF3B30"
  emergency_glow:    "rgba(255,59,48,0.35)"
  emergency_ambient: "rgba(255,59,48,0.08)"

  # Semantic statuses — NOT the emergency red
  attention:         "#FFB020"   # amber — non-critical alerts, advisories
  attention_ambient: "rgba(255,176,32,0.10)"
  info:              "#5CC8FF"   # cool blue — informational, in-progress
  info_ambient:      "rgba(92,200,255,0.10)"
  resolved:          "#34C77B"   # desaturated green — successful resolution
  resolved_ambient:  "rgba(52,199,123,0.10)"

  # Accent — for non-status moments (data viz, secondary actions)
  accent:            "#A78BFA"   # muted violet
  focus_ring:        "rgba(92,200,255,0.45)"

dark:                # default — vigil is dark-first
  background:        "#0B0F14"
  surface:           "#131820"

light:               # admin daytime only
  background:        "#F4F1EC"   # warm off-white
  surface:           "#EAE6DF"
  text:              "#1A1F26"
  text_muted:        "#5A636E"
  border:            "#D7D1C7"

severity:            # ambient frame tints — drive the whole-screen mood
  panic:             "#FF3B30"   # active emergency, life-or-property
  attention:         "#FFB020"   # advisory, suspicious activity, medical-non-critical
  info:              "#5CC8FF"   # in-progress, on-scene, awaiting confirmation
  resolved:          "#34C77B"   # closed positively
  neutral:           "#6C7684"   # idle, no active incident

typography:
  display_family:    '"Inter Variable", "Inter", system-ui, sans-serif'
  body_family:       '"Inter Variable", "Inter", system-ui, sans-serif'
  mono_family:       '"Geist Mono", "JetBrains Mono", "Berkeley Mono", ui-monospace, monospace'
  weights:
    regular:  400
    medium:   500
    semibold: 600
    bold:     700
    display:  800
  scale:           # rem — used aggressively, not all sizes per screen
    xs:    0.75    # 12px — meta only (timestamps, captions)
    sm:    0.8125  # 13px — secondary text
    base:  0.9375  # 15px — body
    lg:    1.0625  # 17px — emphasized body, button labels
    xl:    1.25    # 20px — section headings
    "2xl": 1.625   # 26px — page headings
    "3xl": 2.25    # 36px — hero numbers (mono, in operator console)
    "4xl": 3.5     # 56px — emergency CTAs (SOS label)
  line_heights:
    display:    1.05    # tight, for hero numbers
    body:       1.55    # loose enough for Nguni/Sotho diacritics
    compact:    1.3
  letter_spacing:
    display:    "-0.03em"   # tight, optical-sized
    body:       "0"
    caps:       "0.08em"    # uppercase labels
    mono:       "0"

shape:
  radius:
    control:  "4px"     # buttons, inputs — sharp
    pill:     "9999px"  # status pills only
    sheet:    "16px"    # cards, modals
    canvas:   "20px"    # operator console frame, large surfaces
    phone:    "36px"    # phone frame radius (matches real device)
  borders:
    hairline: "1px solid var(--border)"
    strong:   "1px solid var(--border-strong)"
    none:     "0"

  # Dark mode uses elevation, not shadow. These are documented but used sparingly.
  shadows:
    level_0: "none"
    inset_pressed: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)"
    inset_recessed: "inset 0 2px 6px rgba(0,0,0,0.5)"
    glow_emergency: "0 0 0 1px var(--emergency), 0 0 32px var(--emergency-glow)"
    glow_attention: "0 0 0 1px var(--attention), 0 0 24px rgba(255,176,32,0.25)"
    glow_info:      "0 0 0 1px var(--info), 0 0 24px rgba(92,200,255,0.25)"
    glow_resolved:  "0 0 0 1px var(--resolved), 0 0 24px rgba(52,199,123,0.25)"

spacing:
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96]   # 4-based, 12 included for touch components

layout:
  container_max:  "1500px"
  phone_width:    "360px"
  phone_height:   "740px"
  console_min:    "440px"
  gutter_desktop: "24px"
  gutter_mobile:  "16px"

motion:
  durations:
    instant: "60ms"     # acknowledgement
    fast:    "120ms"    # hover, focus, micro-interactions
    base:    "200ms"    # screen transitions
    slow:    "320ms"    # critical state changes (panic activation)
    breath:  "3000ms"   # ambient breathing glow rate (0.3hz)
  easings:
    snap:        "cubic-bezier(0.4, 0, 0.2, 1)"          # default
    spring_soft: "cubic-bezier(0.34, 1.18, 0.64, 1)"     # overdamped, no overshoot
    spring_firm: "cubic-bezier(0.5, 0, 0.2, 1.1)"        # critical state
    linear:      "linear"
  rules:
    - "use spring_firm for emergency state activation only"
    - "use spring_soft for sheet/modal entrance"
    - "use snap for hover, focus, button press"
    - "respect prefers-reduced-motion: reduce ambient animations to opacity fades only"

accessibility:
  tap_min:           "44px"   # WCAG AA — minimum interactive surface
  tap_emergency:     "88px"   # panic CTA — assumes shaking hands
  focus_ring_width:  "2px"
  focus_ring_offset: "2px"
  contrast_target:   "AAA"    # 7:1 body text, 4.5:1 large — emergency app, not a marketing site
  motion_safe:       true     # all ambient animation respects prefers-reduced-motion

density:
  touch:             # resident + patroller mobile
    control_height:    "52px"
    control_padding:   "0 16px"
    field_height:      "52px"
    row_height:        "64px"
    section_gap:       "24px"
  compact:           # operator console, admin portal
    control_height:    "32px"
    control_padding:   "0 12px"
    field_height:      "34px"
    row_height:        "40px"
    section_gap:       "16px"

localization:
  scripts: [latin, nguni, sotho]
  line_height_min: 1.55   # extra room for ǎ ŋ ã diacritics — never tighter
  test_strings:
    nguni: "Ngiyaxhumana — Awusekho phakathi kwengozi?"
    sotho: "O bolokegile? Re hloka ho tseba hore na o phela hantle."
  font_subsets: [latin, latin-ext, vietnamese]   # cover all SA-language diacritics
```

## Color philosophy — the one-red rule

**`emergency` is not a color, it's a signal.** Use it only for:

- The active panic / SOS button (when armed)
- Active-incident state: badge text, ambient frame glow, severity bars
- The "EMERGENCY ACTIVATED" countdown screen
- Live "active" status indicators in operator queue

**Never use `emergency` for:**

- Destructive buttons (delete, cancel, log out) → use `surface_3` outlined with `border_strong`
- Form validation errors → use `attention`
- Hover states → use `surface_3`
- Decorative accents → use `accent`

If you find yourself wanting "a bit of red somewhere," you're misusing the system. Red appearing on screen must mean *something is happening right now that needs attention*. Anywhere else, the eye habituates and the signal is destroyed.

## Severity scale — ambient screen mood

Every screen with an active incident state tints the entire frame, not just a badge:

| State | Frame border-glow | Ambient surface tint | Badge color | When |
|---|---|---|---|---|
| `neutral` | none | none | `text-muted` | Idle, no incident |
| `info` | `glow_info` | `info-ambient` | `info` | In-progress, on-scene, awaiting confirmation |
| `attention` | `glow_attention` | `attention-ambient` | `attention` | Advisory, suspicious, medical-non-critical |
| `panic` | `glow_emergency` | `emergency-ambient` | `emergency` | Active life-or-property emergency |
| `resolved` | `glow_resolved` (3s fade) | `resolved-ambient` | `resolved` | Closed positively — fades back to neutral |

The ambient glow is the screen telling you what's happening. Operators triaging six incidents at once read the queue's overall mood (lots of red glow = chaos) before reading any individual row.

## Typography — one family, used aggressively

- **Display** (Inter Variable, weight 800, optical sizing engaged): hero numbers (counts in operator queue, ETAs in panic state, the SOS label)
- **Heading** (Inter Variable, weight 600): section titles
- **Body** (Inter Variable, weight 400, line-height 1.55): all prose
- **Label** (Inter Variable, weight 500, letter-spacing 0.08em, uppercase, size xs): meta labels above fields
- **Mono** (Geist Mono, weight 500): every time, every ID, every distance, every coordinate, every count, every reference number, every audit-log timestamp

Mono is non-negotiable for data. Operators must trust that `INC-4821` always renders the same width — a UI that uses proportional digits for IDs feels like marketing copy, not dispatch.

## Components

### Phone frame
- `width: 360px; height: 740px` (matches modern device proportions)
- `border-radius: 36px` (real iPhone curvature, not a rectangle)
- `border: 1px solid var(--border)`, with subtle inner highlight via `inset 0 1px 0 rgba(255,255,255,0.04)`
- Background: `var(--background)` — never a header bar in a contrast color
- Status bar: thin (28px), hairline divider only
- Active-incident state: frame gets `glow_emergency` shadow ring; pulses on `--time-breath` cycle

### Operator console frame
- `border-radius: 20px`
- `border: 1px solid var(--border)`
- Background: `var(--surface)` (one step up from canvas — feels embedded in a workstation)
- Header: hairline border-bottom only, no contrast bar

### Button — primary
- Height: density.touch.control_height (52px) or density.compact.control_height (32px)
- Background: `var(--surface_2)`, `border-radius: 4px`
- Border: `1px solid var(--border_strong)`
- Text: `var(--text)`, weight 600, size lg
- Hover: background → `var(--surface_3)`, transition `var(--time-fast) var(--snap)`
- Active (pressed): inset shadow, transform translateY(0.5px)
- Focus-visible: `outline: 2px solid var(--info); outline-offset: 2px`

### Button — emergency
- ONLY appears on emergency screens (SOS, active-incident actions)
- Background: `var(--emergency)`
- Glow: `box-shadow: 0 0 24px var(--emergency-glow)`
- Text: white, weight 700
- Pressed: scale(0.98) with spring_firm

### Button — ghost
- Background: transparent
- Border: `1px solid var(--border)`
- Hover: background → `var(--surface_2)`
- Use for: secondary actions, declines, dismissals

### Field (input, textarea, select)
- Height: density.touch.field_height
- Background: `var(--surface)`
- Border: `1px solid var(--border)`, `border-radius: 4px`
- Focus: border → `var(--info)`, ring → `var(--focus_ring)`
- Padding: `0 16px`
- Font: body_family, size base
- Placeholder: `var(--text-placeholder)`

### Status pill
- Height: 22px (compact) / 26px (touch)
- Padding: `0 10px`
- Border-radius: 9999px
- Background: `{status}-ambient` (the matching ambient tint)
- Border: `1px solid {status}` at 30% alpha
- Text: `{status}`, weight 600, size xs, uppercase, letter-spacing caps
- Always preceded by a 6px filled circle in the same color

### SOS canvas (the panic CTA — not a button, the screen IS the button)
- Fills 50% of phone-body height
- Background: `radial-gradient(circle at center, var(--surface_2), var(--surface))`
- Border: `1px solid var(--border)`, `border-radius: 24px`
- Inner shadow: `inset 0 2px 6px rgba(0,0,0,0.5)` (feels recessed, weighty)
- Outer ambient glow: pulses `var(--emergency-glow)` at `var(--time-breath)` (0.3hz)
- Label: "SOS" in display weight 800, mono family, size 4xl, color `var(--emergency)`
- Sublabel: "Press and hold" in size sm, color `var(--text-muted)`
- Press feedback: scale(0.97) + intensified glow ring; on release after 0.5s → countdown screen
- Disabled (no GPS / offline): glow stops, label desaturates to `var(--text-muted)`, sublabel changes to "Offline — SMS fallback ready"

### Map canvas
- Full-bleed within container, `border-radius: 8px`
- Background: `var(--surface)` with a 24px dot-grid pattern at 6% opacity
- Mono coordinate readout in top-left corner: `-26.0507, 28.0218`
- Floating ETA badge top-right: status pill with mono ETA value
- Pin markers: 12px circles with severity color, `glow_{severity}` shadow

### Data table (operator console)
- `font-family: inherit` (body) for labels, `mono` for all numeric/ID columns
- Row height: density.compact.row_height (40px)
- Hover row: background → `var(--surface_2)`
- Active-incident row: `border-left: 2px solid var(--emergency)`, faint `emergency-ambient` background tint
- Header: text-muted, size xs, uppercase, letter-spacing caps
- No vertical borders. Horizontal hairlines only.

### Frame status glow (the ambient mood)
The defining Vigil pattern. When a screen represents an active state, the **frame itself glows** the severity color, breathing at 0.3hz. This means a patroller glancing at their phone screen-down on the dashboard knows there's an incident before reading any text.

```css
@keyframes vigil-breath {
  0%, 100% { box-shadow: 0 0 0 1px var(--severity-color), 0 0 24px var(--severity-glow); }
  50%      { box-shadow: 0 0 0 1px var(--severity-color), 0 0 48px var(--severity-glow); }
}
.frame--panic     { animation: vigil-breath 3s ease-in-out infinite; --severity-color: var(--emergency); --severity-glow: var(--emergency-glow); }
.frame--attention { animation: vigil-breath 3s ease-in-out infinite; --severity-color: var(--attention); --severity-glow: rgba(255,176,32,0.25); }
```

## Do rules

- One emergency CTA per screen. Everything else is ghost or surface-button.
- Mono for all numbers users will read aloud or compare (IDs, ETAs, coordinates, counts).
- Status communicated by frame glow + ambient surface tint, then badge. Never badge alone.
- 4px radius on controls. 16px on sheets. Pick a side; nothing in between.
- Hover: subtle background tint, never lift/scale/translate. Save motion for state changes.
- Spring motion only on critical state changes (panic activation, resolution). Everything else: 120ms snap.
- Test every typography setting against `Ngiyaxhumana` and `Awusekho` — if diacritics clip, line-height is too tight.

## Don't rules

- Don't use `emergency` red for anything that isn't an active life-or-property incident.
- Don't put a contrast-color header bar at the top of frames. Hairline border-bottom only.
- Don't use proportional digits for IDs, times, distances, ETAs. Mono.
- Don't use shadows on dark surfaces — they don't work. Use elevated surface colors (`surface_2`, `surface_3`) instead.
- Don't use 200ms ease-out for everything. That's the AI-default tell. 120ms snap is the new default.
- Don't use `border-radius: 8px` or `12px`. Either commit to 4px (controls) or 16px (sheets).
- Don't use a second sans-serif. Inter Variable does all weights and optical sizes.
- Don't badge an active state without also lighting the frame. The badge is an accent; the glow is the meaning.

## Density

Two modes, both first-class:

- **`touch`** — resident mobile, patroller mobile. 52px controls, 64px rows, 24px section gaps.
- **`compact`** — operator console, admin portal. 32px controls, 40px rows, 16px section gaps.

Same tokens, different density profile. Operator console must show 8+ active incidents above the fold; resident mobile must let shaking hands hit the right button.

## Localization

- Body line-height baseline is **1.55**, never tighter. Nguni and Sotho diacritics (`ǎ ŋ ã ǐ`) clip at 1.5.
- Type scale tested against the strings in `tokens.localization.test_strings`.
- Font subsets must include `latin-ext` and `vietnamese` to cover all South African language diacritics.
- Avoid English-metaphor icons (no thumbs-up, no OK hand). Geometric symbols only.

## Accessibility

- Tap target minimum: 44px (WCAG AA). Emergency CTAs: 88px.
- Focus ring: 2px solid `var(--info)` with 2px offset. Never removed.
- Contrast: AAA (7:1) on all body text — this is an emergency app, not a marketing site.
- All ambient animation respects `prefers-reduced-motion: reduce` — the breathing glow becomes a static border in that mode.
- Every interactive element has an accessible label. Buttons with icon-only labels include `aria-label`.

## Framework adapters

This spec emits to:

- **Tailwind** — `tailwind.config.js` extending theme with these tokens
- **CSS custom properties** — drop-in `vigil.css` for the prototype
- **shadcn/ui** — HSL remap of the color tokens for `globals.css`
- **React Native (Tamagui)** — token export for cross-platform mobile
- **Flutter** — `vigil_theme.dart` ColorScheme + TextTheme

The companion HTML prototype (`community-safety-platform.vigil.prototype.html`) uses raw CSS custom properties so the design can be inspected and refined before committing to a framework.

## Compared to the previous prototype

| | Previous (Netcare-inspired) | Vigil |
|---|---|---|
| Default mode | Light | Dark |
| Background | `#FFFFFF` pure white | `#0B0F14` warm-dark |
| Red usage | Header bars, primary buttons, panic | **Active emergency only** |
| Header | Solid red contrast bar | Hairline border-bottom |
| Status | Badges with color fills | **Frame glow** + ambient tint + badge |
| Numbers | Inter (proportional) | Geist Mono everywhere |
| Radius | 12px (cards), 8px (controls) | 16px (sheets), 4px (controls) |
| Motion | 150ms ease-out | 120ms snap, spring on state changes |
| SOS button | 200px circle | 50% screen height, weighted, breathing |
| Map | Dashed-border placeholder card | Full-bleed dot-grid canvas |
| Type | Inter | Inter Variable + Geist Mono |
| Line height | 1.5 | 1.55 (Nguni-tested) |
