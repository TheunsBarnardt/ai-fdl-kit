<!--
  FDL Visual Spec — Tender
  For: Palm Vein Payment Terminal v3
  Generated: 2026-04-17
  Source: payment-terminal-app-v3.md plan + original prototype (rebuilt)
  Stack target: Android (Kotlin) for terminal · React/TypeScript for admin

  Companion prototype: payment-terminal-app-v3.prototype.html
  Sibling design language: docs/plans/community-safety-platform.DESIGN.md (Vigil)
-->

# Visual Spec — Tender

> **Deliberate trust at the moment of value transfer.** A payment terminal at a busy counter is the opposite context to an emergency app: well-lit, public, transactional, repeated dozens of times an hour. Tender is built for that. Calm and quick, scientific where biometrics happen, generous where the amount appears, and brand-neutral so it serves any merchant.

## Why this exists (and why it's not Vigil)

The previous v3 prototype used the standard "AI-generated 2020 SaaS" look — dark indigo terminal palette, light-blue admin, generic shadows, 8px radius everywhere, Inter + SF Mono. It worked, but it didn't earn trust at a counter the way Stripe Terminal or Square Reader do.

Tender is the **inverse design language to Vigil** by deliberate symmetry:

| Axis | Vigil (community safety) | Tender (payment terminal) |
|---|---|---|
| Default mode | Dark-first warm-dark (#0B0F14) | **Light-first warm-paper (#F8F5EE)** |
| Reserved color | One red — active emergency only | **One ink — the action only** |
| State semantics | Severity scale (panic/attention/info/resolved/neutral) | **Binary: action / success / fail / wait** |
| Primary affordance | The screen IS the panic button | **The screen IS the amount** |
| Hero moment | Frame breathing red glow | **Palm reticle (medical-imaging)** |
| Motion | Spring physics on critical state | **Slow eased deliberation (180ms)** |
| Trust layer | Ambient confidence (live patrollers, last drill) | **Visible verification (vein-pattern visualisation, signed receipt, audit chain)** |

Same project, two different design languages because they serve two different real-world physical contexts. A terminal at a Pick n Pay till is not a phone in someone's pocket at 2am. The bar for both is identical: **users trust it without thinking.**

## Tender's specific decisions

1. **Light-first, warm paper.** Background `#F8F5EE` — a warm off-white that reads as paper / banknote / receipt, not as "white SaaS app". Counters are well-lit; light-mode is the right default.
2. **One ink, one job.** `#0B0E14` (near-black with warmth) carries every primary action: the amount, the primary button, the actionable state. When ink appears, the cashier or customer knows that's what to look at.
3. **Binary state semantics, not severity.** Payments are not emergencies — there are four states: **action** (waiting for input), **wait** (processing), **success** (cleared), **fail** (declined). No graduated panic levels.
4. **The amount IS the screen.** Stripe Terminal pattern: amount entry shows the number at display weight, full-width, dominant. Everything else gets out of the way.
5. **Palm scan as scientific moment.** Hero animation — a circular reticle with concentric breath rings, vein-pattern dots tracing the scan zone. Feels like medical imaging or 1Password biometric, not magic.
6. **IBM Plex Mono everywhere data lives.** Amounts, references, BINs, plates, OTPs, settlement timestamps, audit hashes. Plex Mono carries an "official document" weight — it's what bank statements feel like.
7. **Sharp 4px controls, generous 20px sheets.** Even sharper commitment than Vigil — payment screens have less visual density than dispatch consoles, so larger sheet radius reads as confidence, not playfulness.
8. **Slow eased motion (180ms `ease-out-cubic`).** No springs. Money transfers are deliberate; springs feel playful and wrong for value-transfer moments. Transitions are calm and predictable.
9. **Hardware-aware framing.** The terminal frame in the prototype is sized like a real payment device (400×640), with a top status LED strip and a hint of the palm-scanner cutout below the screen on the bezel. The screen is a *thing*, not an app.
10. **Localization built in.** Same line-height baseline as Vigil (1.55) — Nguni/Sotho diacritics are tested. Currency is presented in ZAR by default with `R 1 234,56` South African formatting (space thousands separator, comma decimal).

## tokens

<!-- Machine-readable block. DO NOT rename keys — framework adapters depend on them. -->

```yaml
brand: tender
source: rebuild from payment-terminal-app-v3.prototype.html (generic SaaS baseline)

colors:
  # Warm-paper surfaces — light-first, never pure white
  background:        "#F8F5EE"   # warm paper / banknote feel
  surface:           "#FFFFFF"   # crisp surface card on paper
  surface_2:         "#EFEAE0"   # one step recessed
  surface_3:         "#E5DFD2"   # hover / pressed
  border:            "#D8D1C0"   # hairline
  border_strong:     "#B8AE99"   # strong border, used for the "ink" frame around CTAs

  # Text — deep ink with warmth, never pure black
  text:              "#0B0E14"   # the action color
  text_muted:        "#5A5648"   # secondary
  text_placeholder:  "#9A9279"   # tertiary / placeholder

  # Action color — the SAME as text. The action and the truth are one.
  action:            "#0B0E14"
  action_hover:      "#000000"   # inkier on hover
  action_inverse:    "#F8F5EE"   # text-on-ink

  # Single semantic states — payment is binary
  success:           "#1E7A4D"   # deep cleared-green, like a bank stamp
  success_ambient:   "rgba(30,122,77,0.08)"
  fail:              "#A8341A"   # deep brick-clay, not panic red
  fail_ambient:      "rgba(168,52,26,0.08)"
  attention:         "#9C6A12"   # wax-stamp gold — used for "review" / non-failures
  attention_ambient: "rgba(156,106,18,0.08)"

  # Scan / biometric color — distinct hue used ONLY in the palm scan moment
  scan:              "#1F4FA8"   # near-IR scientific blue
  scan_ambient:      "rgba(31,79,168,0.08)"
  scan_glow:         "rgba(31,79,168,0.32)"

  focus_ring:        "rgba(31,79,168,0.35)"

dark:                # cashier-dark mode for low-light kiosks (optional)
  background:        "#161512"   # warm-dark equivalent
  surface:           "#1F1D17"
  text:              "#F2EEDF"
  border:            "#3A3429"

typography:
  display_family:    '"Inter Variable", "Inter", system-ui, sans-serif'
  body_family:       '"Inter Variable", "Inter", system-ui, sans-serif'
  mono_family:       '"IBM Plex Mono", "JetBrains Mono", ui-monospace, Menlo, monospace'
  weights:
    regular:  400
    medium:   500
    semibold: 600
    bold:     700
    display:  800
  scale:           # rem
    xs:    0.75    # 12px — meta only
    sm:    0.8125  # 13px — secondary
    base:  0.9375  # 15px — body
    lg:    1.0625  # 17px — emphasized body, button labels
    xl:    1.375   # 22px — section headings
    "2xl": 1.75    # 28px — page headings
    "3xl": 2.5     # 40px — large numbers
    "4xl": 4       # 64px — the AMOUNT (display)
    "5xl": 6       # 96px — full-screen amount confirmation
  line_heights:
    display:    1.0     # tight, for amount numerals
    body:       1.55    # Nguni-tested
    compact:    1.3
  letter_spacing:
    display:    "-0.04em"   # tight, optical-sized
    body:       "0"
    caps:       "0.08em"
    mono:       "0"
    amount:     "-0.05em"   # very tight on display amount

shape:
  radius:
    control:  "4px"     # buttons, inputs — sharp
    pill:     "9999px"  # status pills only
    sheet:    "20px"    # cards, modals — generous
    canvas:   "24px"    # admin frame
    device:   "28px"    # terminal device frame
  borders:
    hairline: "1px solid var(--border)"
    strong:   "2px solid var(--border-strong)"
    ink:      "2px solid var(--text)"
    none:     "0"
  shadows:
    none:    "none"
    card:    "0 1px 0 rgba(11,14,20,0.04), 0 2px 8px rgba(11,14,20,0.05)"
    sheet:   "0 4px 16px rgba(11,14,20,0.08)"
    device:  "0 32px 80px rgba(11,14,20,0.18), 0 0 0 1px var(--border)"
    glow_scan:    "0 0 0 1px var(--scan), 0 0 32px var(--scan-glow)"
    glow_success: "0 0 0 1px var(--success), 0 0 24px rgba(30,122,77,0.25)"
    glow_fail:    "0 0 0 1px var(--fail), 0 0 24px rgba(168,52,26,0.25)"

spacing:
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128]

layout:
  container_max:   "1500px"
  device_width:    "400px"   # terminal (slightly wider than a phone)
  device_height:   "640px"   # terminal
  enrol_width:     "360px"   # mobile enrolment frame
  console_min:     "560px"
  gutter_desktop:  "32px"
  gutter_mobile:   "16px"

motion:
  durations:
    instant: "60ms"
    fast:    "120ms"
    base:    "180ms"   # default — slow eased deliberation
    slow:    "320ms"   # state transitions
    scan:    "1800ms"  # palm-scan reticle breath cycle
  easings:
    snap:    "cubic-bezier(0.4, 0, 0.2, 1)"
    eased:   "cubic-bezier(0.33, 1, 0.68, 1)"   # default — out-cubic, calm
    linear:  "linear"
  rules:
    - "default transition: var(--motion-base) var(--motion-eased)"
    - "no spring physics — money transfers are deliberate, not playful"
    - "scan reticle uses linear breath cycle for predictability"
    - "respect prefers-reduced-motion: reduce ambient animations to opacity fades only"

accessibility:
  tap_min:           "48px"   # generous; cashiers gloves, customers in winter
  tap_primary:       "72px"   # primary CTAs (Pay, Confirm) — extra-large
  focus_ring_width:  "2px"
  focus_ring_offset: "3px"
  focus_ring_color:  "var(--scan)"
  contrast_target:   "AAA"    # payment terminal — 7:1 body, 4.5:1 large
  motion_safe:       true

density:
  terminal:           # public-facing, often used by elderly
    control_height:    "64px"
    control_padding:   "0 24px"
    field_height:      "60px"
    section_gap:       "32px"
  admin:              # operator console
    control_height:    "36px"
    control_padding:   "0 14px"
    field_height:      "36px"
    row_height:        "44px"
    section_gap:       "20px"

localization:
  scripts: [latin, nguni, sotho]
  line_height_min: 1.55
  font_subsets: [latin, latin-ext, vietnamese]
  currency:
    iso: ZAR
    symbol: "R"
    thousands_separator: " "         # SA convention: space, not comma
    decimal_separator: ","           # SA convention: comma, not dot
    pattern: "R {whole} {space} ,{cents}"   # e.g. R 1 234,56
  test_strings:
    latin:  "R 1 234,56 — Confirm to pay"
    nguni:  "Qinisekisa ukukhokha — R 1 234,56"
    sotho:  "Tiisetsa tefo — R 1 234,56"
```

## Color philosophy — the one-ink rule

**`text` and `action` are the same color.** That's the rule. The thing the user is supposed to do, and the words they read, are rendered in the same `#0B0E14` ink. Primary buttons are inverse (paper text on ink fill). This collapses the visual hierarchy onto one decision: ink = "this is the truth or this is the action." Anywhere else feels like noise.

**Reserved palette:**

- `success` (deep cleared-green) — only on **payment cleared** confirmation, signed receipt, audit-chain matches
- `fail` (deep brick-clay) — only on **declined / void / refund-failed** moments
- `attention` (wax-stamp gold) — only on **manager-review** prompts (refunds, large amounts, sandbox banner)
- `scan` (near-IR scientific blue) — only on the **palm-scan reticle** moment

These colors **must not appear decoratively.** No "look at this success-green button" — green appears only when a payment has cleared. Once it appears, it means something specific.

## State semantics — four states, no spectrum

Payment is binary at any point in time:

| State | When | Color | Motion |
|---|---|---|---|
| **action** | Waiting for cashier or customer input | ink (`text`) | none |
| **wait** | Processing — gateway, rail, scan, settlement | scan blue with progress | scan-breath cycle |
| **success** | Cleared, settled, signed | success green | brief ease-in then hold |
| **fail** | Declined, voided, error | fail clay | brief shake (0.2s, single) then hold |

There is no `attention` state for in-progress flows — those are `wait`. `attention` is reserved for **manager-required** actions (refunds, large amounts, sandbox warnings) which are pre-action, not in-flight.

## Typography — the amount is the protagonist

- **Amount display** (Inter Variable, weight 800, optical sizing engaged, letter-spacing -0.05em): the dominant element on amount-entry, confirmation, and success screens. Up to 96px on success.
- **Heading** (Inter Variable, 600, letter-spacing -0.015em): section titles
- **Body** (Inter Variable, 400, line-height 1.55): all prose
- **Label** (Inter Variable, 500, letter-spacing 0.08em, uppercase, size xs): meta labels
- **Mono** (IBM Plex Mono, 500): every numerical or alphanumerical identifier. Specifically required for: amount values (always), card last-4, BIN, transaction reference, settlement timestamp, audit hash, OTP, terminal serial, fleet device ID, vendor credential masks.

Plex Mono is chosen over Geist Mono (Vigil's choice) because it carries a more "document" feel — what bank statements and tax documents are typeset in. It signals "this is official, not marketing."

## Components

### Device frame (terminal)

- 400px wide × 640px tall — terminal proportions (not phone)
- `border-radius: 28px`, deep `device` shadow with subtle inner highlight
- Top status strip: 32px height with LED indicator (green = paired/online, amber = needs attention, red = offline), merchant name, terminal serial in mono
- Below the screen on the bezel: subtle palm-scanner cutout indicator and card slot (visual only — these are real hardware on the device)
- Background `surface` (white card on warm-paper canvas)

### Console frame (admin)

- Wide canvas (max 1080px), `border-radius: 24px`, `card` shadow
- Header: hairline border-bottom only — no contrast bar
- Side nav (200px) with section labels and current selection
- Body padding 24px

### Enrolment frame (mobile companion)

- 360px wide × 740px tall (phone)
- Same Tender tokens as terminal, just phone-sized

### Amount display (the hero)

- `font-family: var(--font)`, `font-weight: 800`, `font-size: 4xl` (64px) on entry, `5xl` (96px) on confirmation
- `letter-spacing: -0.05em`, `line-height: 1`
- Currency symbol (`R`) at smaller size (lg or xl) with right margin, never bigger than the amount
- Format `R 1 234,56` (SA convention — space thousands, comma decimal)
- On success: animated count-up from 0 to amount over 320ms eased

### Number pad (terminal)

- 4-row × 3-column grid, 64px tall buttons each
- Mono digits in `text` color
- Bottom row: `00` (decimal), `0`, backspace `⌫`
- Subtle separator hairlines between cells

### Palm scan reticle (the hero biometric moment)

- Full-screen takeover, `surface` background
- Circular reticle 240px diameter, centered
- Outer ring: 2px solid `scan` color, breathing radius animation (240px → 280px) over 1.8s linear
- Inner ring: 1px dashed `scan_ambient`, rotating slowly (10s)
- Center: vein-pattern visualization — 24-30 dots arranged in vein-like Y/branching pattern, individual dots fading in sequentially during scan to simulate feature extraction
- Below reticle: instruction text in body size, then mono progress text ("EXTRACTING FEATURES · 0.4S")
- On success: reticle collapses to a check mark with `success` color and `glow_success`
- On fail: reticle shakes once (0.2s) and turns to `fail` clay with retry CTA

### Primary button (the only CTA)

- Height: density.terminal.control_height (64px) or density.admin.control_height (36px)
- Background: `text` (ink)
- Color: `action_inverse` (paper)
- `border-radius: 4px`, no shadow
- Hover: background → `action_hover` (inkier black)
- Active: scale(0.985)
- One per screen — Tender is opinionated about this

### Secondary button (cancel, retry, alternative)

- Background: transparent
- Color: `text`
- Border: `1px solid border_strong`
- Hover: background → `surface_2`
- Use for: secondary actions, declines, "use card instead", etc.

### Field (input, OTP, amount entry)

- Height: density.terminal.field_height (60px)
- Background: `surface`
- Border: `2px solid border_strong`
- `border-radius: 4px`
- Focus: border → `scan`, ring → `focus_ring`
- Mono font for any field that holds numerical data

### Status pill

- Height: 26px, padding `0 12px`, `border-radius: 9999px`
- `font-size: 10px`, weight 600, uppercase, letter-spacing 0.08em
- Variants: `--success`, `--fail`, `--attention`, `--scan`, `--neutral`
- Always preceded by a 6px filled circle in the same color

### Receipt (digital)

- Recreated as a "physical" feel: `surface` background, dashed border, mono everywhere, amount display at center, signed-hash footer at bottom
- Saw-tooth bottom edge (CSS `clip-path`) optional touch — receipt-feel without skeuomorphic excess

### Card chip / NFC visual

- Apple Pay-style card chip illustration when card is being captured
- NFC waves animation when contactless tap detected
- Transitions are 320ms slow eased — "we're capturing this carefully"

## The familiar-patterns rule

Same rule as Vigil: **novel UI is hostile UI** in trust-moments. Tender inherits its interaction vocabulary verbatim from products people already use:

| Surface | Reference | What we inherit |
|---|---|---|
| **Amount entry** | **Stripe Terminal** | Big-number display, on-screen number pad below, single primary CTA, currency symbol fixed size |
| **Method selection** | **Apple Pay sheet** | Two large stacked options, primary visually emphasized, single tap to choose |
| **Palm scan reticle** | **Apple Face ID + Wise verification** | Full-screen takeover, circular reticle, breathing animation, "Hold still" instruction, success collapse to check |
| **Card capture** | **Square Reader** | Card-chip illustration, "Insert chip card" / "Tap to pay" instruction, NFC waves on detection |
| **PIN entry** | **iOS / Android passcode** | Hidden digits as solid dots, mono font, generous tap targets |
| **OTP entry** | **WhatsApp / banking app verification** | Six split cells, auto-advance on input, mono digits, paste-aware |
| **Payment success** | **Apple Pay confirmation** | Full-screen check, success-green tint, amount displayed, brief hold then auto-dismiss |
| **Receipt selection** | **Stripe Terminal receipt sheet** | Three options stacked: SMS · Email · No receipt |
| **Manager refund auth** | **POS PIN entry (Vend, Shopify POS)** | Generic "Manager PIN" challenge, hidden entry, single confirm |
| **Admin transactions table** | **Linear / Stripe Dashboard** | Dense rows, mono identifiers, status pills, click-to-drill |
| **Admin drill-down** | **Stripe Dashboard payment timeline** | Timeline of state changes, raw-payload toggle, refund button at top-right |
| **Vendor credential rotation** | **Apple ID password change** | Step-by-step, mask values, validate before promote |
| **Sandbox banner** | **Vercel preview-deployment banner** | Persistent top strip identifying non-prod environment |

**Test:** if a 65-year-old tap-to-pay user, a 19-year-old cashier on their first shift, and a regulator auditing a transaction can all complete their flow without instruction — pattern is correct. If anyone hesitates, pattern is wrong.

## Trust signals — built into every payment

The terminal is in public view dozens of times an hour. Every transaction must communicate "this is real, this is yours, this is recorded" without being noisy:

- **Top status LED** on the device frame: green dot when paired and online, amber when settling slowly, red when offline. A glance from the cashier or customer confirms readiness.
- **Merchant name + terminal serial** in the status strip — small, mono, always visible. Customer can verify they're at the merchant they think they are; cashier knows which terminal they're on for shift handover.
- **Amount displayed at all times during the transaction** — never hidden behind a "confirm" sheet. The number is the truth and stays visible.
- **Settlement reference appears mono on success** — `PAY-2026-04-17-A8K2L9` — a customer can quote that to the merchant or their bank instantly.
- **Signed-hash footer on every receipt** — short hex, mono. Audit chain proof, surfaced to the user. They don't need to verify it; just seeing it builds trust that *someone could*.
- **Sandbox banner is unmissable** — when in sandbox, a persistent gold-amber strip at top reads `SANDBOX · NO REAL MONEY · SCENARIO: approve-fast`. Customers and merchants can never confuse real from test.
- **Admin drill-down shows the full chain** — every transaction view shows the gateway routing decision, rail-adapter call, settlement webhook, and audit-hash entry. When a customer disputes, the operator has the complete record one click away.

## Do rules

- One ink color for action and truth. The primary button and the body text are the same color.
- The amount is the screen. Display weight 800, optical sizing on, ZAR formatting (`R 1 234,56`).
- Mono for every number, ID, hash, OTP, BIN, plate, timestamp.
- One primary CTA per screen. Secondary actions are outlined ghost.
- 4px on controls, 20px on sheets, 28px on the device frame. Sharp commitment.
- Default transition: 180ms ease-out-cubic. Slow, deliberate, predictable.
- Palm scan reticle is a hero moment — give it the full screen and the full 1.8s breath cycle.
- Status communicated by the screen state and the top LED. Pills are accents, not the carriers of meaning.
- Currency formatting follows SA convention always: `R` symbol, space thousands, comma decimal.
- Receipt is recreated as a "document" — dashed border, mono-everywhere, signed footer.

## Don't rules

- Don't use `success` green for anything other than cleared / settled / matched.
- Don't use `fail` clay for anything other than declined / voided / refund-failed.
- Don't use `scan` blue outside the palm-scan reticle moment.
- Don't put a contrast-color header bar at the top. Hairline border-bottom only.
- Don't use proportional digits for any number on this screen. Mono.
- Don't use spring motion. Money transfers are deliberate.
- Don't hide the amount during a transaction. Once entered, it stays visible until success or cancel.
- Don't use `border-radius: 8px` or `12px`. Pick a side: 4px controls, 20px sheets.
- Don't use a second sans family. Inter Variable does all weights.
- Don't show the sandbox status as a small pill. It must be an unmissable top strip.
- Don't lose the merchant name and terminal serial. They appear on every screen.
- Don't put two primary buttons on a screen. There is one action.

## Density

- **`terminal`** — public-facing. 64px primary controls, 60px fields, 32px section gaps. Designed for cashiers in gloves and elderly customers.
- **`admin`** — operator-facing. 36px controls, 36px fields, 20px section gaps. Designed for keyboard-heavy daily use.
- **`enrolment`** — mobile companion app. Same as terminal density (designed for one-hand-on-phone use, generous taps).

## Localization

- Body line-height 1.55 (Nguni/Sotho diacritic safe).
- Currency: ZAR with `R 1 234,56` formatting (space thousands, comma decimal).
- All strings extracted to a localisation table; English source-of-truth.
- `test_strings` block must render at body type scale without clip on every screen that displays prose.
- Cultural review for icons — no English metaphors (no "OK hand," no "thumbs up").
- Right-to-left support **out of scope** (no LTR/RTL switch in v1; ZA market doesn't need it for v1).

## Accessibility

- Tap minimum 48px. Primary CTAs 72px (Pay, Confirm).
- Focus ring 2px solid `scan` with 3px offset. Never removed.
- Contrast AAA on all body text — payment terminal regulatory requirement (PCI guidance + SA accessibility law).
- All interactive elements keyboard navigable (admin console).
- Receipt also offered as accessible PDF (text-selectable) on email delivery.
- Cashier-mode TalkBack tested on Android terminal.
- Reduce-motion: scan reticle becomes static circle with a progress text ticker; success animation becomes instant state change.

## Compared to the original v3 prototype

| | Original (generic SaaS) | Tender |
|---|---|---|
| Default mode | Dark terminal + light admin | **Light-first warm-paper everywhere** |
| Background | Indigo-dark (#0B1120) terminal | **Warm-paper (#F8F5EE)** |
| Primary | Indigo blue (#3B82F6) | **Ink (#0B0E14) — same as text** |
| Status semantics | 4 colors (success/danger/warning/info) | **Binary state + scan blue (reserved)** |
| Amount typography | Generic | **Display-weight 800, 64px hero** |
| Numbers | SF Mono mixed with proportional | **IBM Plex Mono everywhere data lives** |
| Palm scan | Pulsing circle | **Full-screen scientific reticle with vein-pattern dots** |
| Motion | 200ms ease default | **180ms ease-out-cubic — slower deliberation** |
| Card capture | Generic card icon | **Apple-Pay-style chip illustration** |
| Receipt | Card with text | **Document feel — dashed border, signed-hash footer** |
| Sandbox indicator | Small banner | **Unmissable top strip across whole UI** |
| Currency | `R250.00` | **`R 250,00` (SA convention)** |
| Radius | 8px everywhere | **4px controls / 20px sheets / 28px device** |
| Frame | Phone-shaped (375×700) | **Terminal-shaped (400×640) with status LED + scanner cutout** |

## Framework adapters

- **Android (terminal)** — emit Compose theme: ColorScheme + Typography + Shapes from these tokens
- **React (admin)** — emit Tailwind config theme.extend + globals.css with CSS custom properties
- **shadcn/ui** — HSL remap of color tokens; replace default focus ring with `scan` blue
- **Next.js / SSR** — same React adapter

The companion HTML prototype (`payment-terminal-app-v3.prototype.html`) uses raw CSS custom properties so the design can be inspected and refined before committing to a framework.

## Sibling

Vigil (community-safety) and Tender (payment-terminal) are sibling design languages. Both inherit:

- Inter Variable display family
- Mono-for-all-data rule
- Sharp radius commitment (no 6–12px middle)
- Familiar-patterns benchmark approach
- Localization built in (Nguni/Sotho line-height baseline)
- Accessibility-first tokens
- Density modes
- "Trust built daily, cashed once" trust-signals philosophy

They diverge on default mode (dark vs light), state semantics (severity scale vs binary), motion philosophy (springs vs eased), and hero moments (frame breath vs amount + reticle). Together they're the start of a design-system family — different products, recognisably the same maker.
