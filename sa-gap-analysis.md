# South African Market — Gap Analysis & Brainstorming Plan

**Purpose:** The 20-repo open-source extraction plan (`execution-order.md`) produces ~321 feature blueprints but won't cover the ~77 SA-specific features that exist in the local market — private security marketplaces, stolen vehicle recovery, alarm monitoring, telematics insurance, private EMS, hijacking protocols, POPIA/PSIRA compliance. This doc catalogs those gaps and describes how to use **`/fdl-brainstorm`** (Socratic requirements elicitation) to design them as blueprints.

## Why brainstorming, not reverse engineering

FDL blueprints describe **what a feature must do** — actors, inputs, rules, outcomes, flows. The SA-specific features aren't new problems; they're well-understood patterns that exist because the SA market has been solving the same threats for decades. We don't need to copy any provider — we need to **design the features from the problem**, using public domain knowledge as context.

`/fdl-brainstorm` is built exactly for this: Socratic requirements elicitation for users who know the problem but don't know the blueprint yet. It asks questions, you answer, and the session terminates in `/fdl-create` which generates the validated blueprint.

**The workflow:**

```
Problem (e.g., "armed response dispatch")
    ↓ Gather domain context from public sources
    ↓ Run /fdl-brainstorm with context
    ↓ Socratic Q&A elicits actors, rules, flows, outcomes
    ↓ Terminates in /fdl-create
    ↓ Blueprint generated, validated, committed
```

No reverse engineering. No decompiling. No scraping. Just **informed design**.

---

## Part 1 — The SA-specific feature gap

### Category A: Private security marketplace (AURA, Namola, Secura, Beame pattern)

 1. Multi-provider partner network (cross-company dispatch) — `/fdl-brainstorm "private security marketplace with multi-provider partner network for cross-company armed response dispatch"`
 2. Auto-dispatch to nearest armed responder across all partners — `/fdl-brainstorm "auto-dispatch to nearest armed responder across partner network with geospatial routing"`
 3. Subscription + pay-per-use hybrid billing — `/fdl-brainstorm "hybrid subscription plus pay-per-use billing for security services"`
 4. Commission split to responding partner — `/fdl-brainstorm "commission split and settlement to responding security partner per incident"`
 5. Family / group plans (cover dependents) — `/fdl-brainstorm "family and group plans covering multiple dependents under one security subscription"`
 6. Nationwide coverage regardless of local contract — `/fdl-brainstorm "nationwide panic coverage that routes to local partner regardless of where the incident occurs"`
 7. Insurance partner funding (app free via policy bundle) — `/fdl-brainstorm "insurance partner bundle where the panic app is funded by an insurance policy"`
 8. Corporate wellness integration (employer-funded panic coverage) — `/fdl-brainstorm "employer-funded panic coverage as a corporate wellness benefit"`
 9. Multi-service routing (panic, medical, roadside, trauma counselling) — `/fdl-brainstorm "multi-service routing for panic, medical, roadside, and trauma counselling from one app"`
10. Partner onboarding and PSIRA verification — `/fdl-brainstorm "partner security company onboarding with PSIRA licence verification"`

### Category B: Stolen Vehicle Recovery (Netstar, Tracker, Cartrack, Ctrack pattern)

11. RF beacon + GPS hybrid tracking (jammer-resistant) — `/fdl-brainstorm "hybrid RF beacon and GPS vehicle tracking resistant to signal jamming"`
12. Signal jammer detection and alerting — `/fdl-brainstorm "GPS and cellular signal jammer detection with automatic alerting"`
13. Crash detection with auto-dispatch to scene — `/fdl-brainstorm "vehicle crash detection with automatic dispatch of emergency response to the scene"`
14. Armed recovery team dispatch workflow — `/fdl-brainstorm "armed stolen vehicle recovery team dispatch workflow"`
15. Chop shop detection patterns — `/fdl-brainstorm "chop shop detection based on vehicle movement patterns and clustering"`
16. Cross-border recovery coordination (SADC) — `/fdl-brainstorm "cross-border stolen vehicle recovery coordination across SADC countries"`
17. Aerial / helicopter recovery coordination — `/fdl-brainstorm "aerial helicopter recovery coordination for high-value vehicle pursuits"`
18. VESA fitment certification tracking — `/fdl-brainstorm "VESA-certified tracking device fitment records and certification lifecycle"`
19. SAPS case number integration and lookup — `/fdl-brainstorm "SAPS case number integration and lookup for stolen vehicle recovery"`
20. Insurance claim auto-generation post-recovery — `/fdl-brainstorm "automatic insurance claim generation after a stolen vehicle recovery event"`
21. Driver identification (tag / PIN / RFID) — `/fdl-brainstorm "driver identification via RFID tag, PIN, or key fob for fleet and SVR"`
22. Under-duress codes (silent alert while appearing compliant) — `/fdl-brainstorm "under-duress silent alert code that appears compliant but triggers covert response"`

### Category C: Private alarm monitoring (ADT, Fidelity, Chubb, Beagle Watch pattern)

23. Contact ID / SIA DC-09 alarm signal reception — `/fdl-brainstorm "Contact ID and SIA DC-09 alarm panel signal reception and decoding"`
24. Zone-based alarm monitoring (perimeter, motion, panic, fire, duress) — `/fdl-brainstorm "zone-based alarm monitoring for perimeter, motion, panic, fire, and duress zones"`
25. Open/close scheduling (business-hours arming) — `/fdl-brainstorm "open and close scheduling for business-hours alarm arming and disarming"`
26. Runner verification (false-alarm reduction before armed dispatch) — `/fdl-brainstorm "runner verification step to reduce false alarms before armed response dispatch"`
27. Two-factor alarm verification (audio or video confirmation) — `/fdl-brainstorm "two-factor alarm verification using audio or video confirmation before dispatch"`
28. Entry/exit delay handling — `/fdl-brainstorm "alarm panel entry and exit delay handling with grace periods"`
29. Test mode and scheduled system tests — `/fdl-brainstorm "alarm system test mode and scheduled automatic health tests"`
30. Alarm history and pattern detection — `/fdl-brainstorm "alarm event history and pattern detection for anomaly and false-alarm trends"`
31. Client premises database (floor plans, pet info, medical conditions, key holders) — `/fdl-brainstorm "client premises intelligence database with floor plans, pets, medical conditions, and key holders"`
32. Duress / hold-up alarms distinguishable from normal triggers — `/fdl-brainstorm "duress and hold-up alarms distinguishable from normal intrusion triggers"`

### Category D: Armed response operational SOP

33. Response grade classification (armed / unarmed / tactical) — `/fdl-brainstorm "armed response grade classification across armed, unarmed, and tactical tiers"`
34. Response time SLA per grade — `/fdl-brainstorm "response time SLA tracking per response grade with breach alerts"`
35. Tactical callout procedures — `/fdl-brainstorm "tactical callout procedure for escalated armed response incidents"`
36. Safe word / client verification codes — `/fdl-brainstorm "safe word and client verification code to confirm identity under duress"`
37. Armed escort services (routine movements) — `/fdl-brainstorm "armed escort service for routine high-risk personal and cargo movements"`
38. VIP protection integration — `/fdl-brainstorm "VIP close-protection integration with dispatch and control room"`
39. Convoy mode for high-risk movement — `/fdl-brainstorm "convoy mode for coordinated multi-vehicle high-risk movement with shared tracking"`

### Category E: Telematics-based insurance (Discovery Insure, OUTsurance pattern)

40. Trip scoring algorithm (braking, cornering, speed, phone use, night driving) — `/fdl-brainstorm "telematics trip scoring algorithm covering braking, cornering, speed, phone use, and night driving"`
41. Gamified rewards (points, tiers, partner perks) — `/fdl-brainstorm "gamified telematics rewards with points, tiers, and partner perks"`
42. Premium adjustment based on driving score — `/fdl-brainstorm "insurance premium adjustment based on driver telematics score"`
43. Partner reward integrations (fuel, groceries, coffee, gym) — `/fdl-brainstorm "partner reward redemption across fuel, groceries, coffee, and gym merchants"`
44. Family driver profiles with individual scoring — `/fdl-brainstorm "family driver profiles with individual telematics scoring under a shared policy"`
45. Accident-scene auto-dispatch (Impact Alert pattern) — `/fdl-brainstorm "accident impact detection with automatic dispatch of medical and roadside response"`
46. Corporate wellness tie-in — `/fdl-brainstorm "corporate wellness programme tie-in linking driving behaviour to employee wellness rewards"`

### Category F: Private EMS with tiered membership (ER24, Netcare 911 pattern)

47. Tiered membership (basic / comprehensive / executive) — `/fdl-brainstorm "tiered private EMS membership with basic, comprehensive, and executive tiers"`
48. Aeromedical dispatch coordination — `/fdl-brainstorm "aeromedical helicopter dispatch coordination for critical EMS incidents"`
49. Medical aid integration (Discovery Health, Bonitas, Momentum, GEMS, Profmed) — `/fdl-brainstorm "medical aid scheme integration for claim submission and benefit verification"`
50. Private hospital network routing — `/fdl-brainstorm "private hospital network routing based on capability, distance, and patient condition"`
51. Cross-border repatriation / international assistance — `/fdl-brainstorm "cross-border medical repatriation and international assistance workflow"`
52. Direct billing to medical aid — `/fdl-brainstorm "direct billing to medical aid scheme at point of EMS service delivery"`
53. Corporate wellness programs with medical benefits — `/fdl-brainstorm "corporate wellness programme with bundled private EMS medical benefits"`

### Category G: CCTV / ANPR mesh network (Vumacam pattern)

54. Distributed private camera network with shared operations centre — `/fdl-brainstorm "distributed private CCTV mesh network with a shared operations centre view"`
55. ANPR (automatic number plate recognition) at city scale — `/fdl-brainstorm "automatic number plate recognition at city scale with live matching and alerts"`
56. Real-time flagged-vehicle alerts (stolen, wanted, BOLO) — `/fdl-brainstorm "real-time flagged vehicle alerts for stolen, wanted, and BOLO plates from ANPR"`
57. Behaviour analytics (loitering, wrong-way, gathering) — `/fdl-brainstorm "CCTV behaviour analytics for loitering, wrong-way movement, and unusual gatherings"`
58. POPIA-compliant footage retention and access control — `/fdl-brainstorm "POPIA-compliant CCTV footage retention and access control with audit logs"`
59. Integration with private armed response networks — `/fdl-brainstorm "CCTV integration with private armed response dispatch based on live detections"`
60. Municipal / SAPS handoff workflows — `/fdl-brainstorm "CCTV operations centre handoff of footage and incidents to municipal and SAPS authorities"`

### Category H: SA-specific infrastructure and compliance

61. POPIA compliance (processing, consent, DSR, breach notification) — `/fdl-brainstorm "POPIA compliance for processing, consent, data subject requests, and breach notification"`
62. PSIRA licensing verification and integration — `/fdl-brainstorm "PSIRA private security licence verification and integration for responders and operators"`
63. SAPS case number lookup and linking — `/fdl-brainstorm "SAPS case number lookup and linking to incident records"`
64. Load-shedding awareness (power fallback, comms degradation) — `/fdl-brainstorm "load-shedding aware alarm and comms system with power and network fallback"`
65. Cellular fallback to SMS during network issues — `/fdl-brainstorm "SMS fallback delivery for panic and alert messages when cellular data is unavailable"`
66. Multi-language support (11 official languages) — `/fdl-brainstorm "multi-language panic and support flows across South Africa's 11 official languages"`
67. SASSA integration (for beneficiary services) — `/fdl-brainstorm "SASSA beneficiary verification integration for emergency and welfare services"`
68. eNatis / Transport Dept vehicle registration lookup — `/fdl-brainstorm "eNatis vehicle registration lookup for plate, VIN, and ownership verification"`
69. CIPC business registration lookup — `/fdl-brainstorm "CIPC business registration lookup for partner and client onboarding verification"`
70. SARS eFiling integration — `/fdl-brainstorm "SARS eFiling integration for compliance returns and tax certificates"`

### Category I: Hijacking-specific features (unique to SA threat landscape)

71. Under-duress / silent panic codes — `/fdl-brainstorm "under-duress silent panic code triggered from a phone app or vehicle keypad"`
72. Hijack hot-zone warnings and automatic rerouting — `/fdl-brainstorm "hijack hot-zone warnings with automatic navigation rerouting around high-risk areas"`
73. Vehicle tracking during hijack with silent dispatch — `/fdl-brainstorm "silent vehicle tracking during an active hijack with covert armed response dispatch"`
74. Two-man rule enforcement for high-value cargo — `/fdl-brainstorm "two-man rule enforcement for high-value cargo movement with dual authentication"`
75. Carjacking victim medical + counselling auto-dispatch — `/fdl-brainstorm "carjacking victim support with automatic medical and trauma counselling dispatch"`
76. Convoy mode for group movement — `/fdl-brainstorm "convoy mode for coordinated group vehicle movement with live shared tracking"`
77. Live trip sharing with response room (always-on, no user toggle) — `/fdl-brainstorm "always-on live trip sharing to an armed response control room without user toggle"`

**Total SA-specific gap:** ~77 features across 9 categories.

---

## Part 2 — Socratic analysis via `/fdl-brainstorm`

### How `/fdl-brainstorm` works

`/fdl-brainstorm` is designed for situations where you know the problem exists but don't know what the blueprint should contain. It runs a structured Socratic dialogue:

1. **Problem framing** — what are we solving, for whom, and why?
2. **Actor identification** — who interacts with this feature (human, system, external)?
3. **State and lifecycle** — what are the discrete states and transitions?
4. **Rules and constraints** — what must always be true, and what must never happen?
5. **Outcomes** — given X, when Y, the result is Z
6. **Error and edge cases** — what can go wrong, and how does the system respond?
7. **Integration points** — what other features or systems does this touch?
8. **Hand-off to `/fdl-create`** — generates the validated blueprint

You bring domain knowledge; the skill brings the structured questioning.

### Domain context gathering (before the brainstorm)

Brainstorming produces better blueprints when you walk in with **context**. For SA-specific features, useful public sources to read beforehand:

**Standards and regulatory documents**
- **PSIRA Act and regulations** — defines minimum requirements for licensed security providers
- **SAIDSA standards** — alarm handling, response protocols, industry norms
- **VESA standards** — vehicle security fitment and protocol requirements
- **SANS documents** — SA National Standards on security, data, comms
- **POPIA and Information Regulator guidance** — lawful processing of personal information
- **Health Professions Act** — for EMS and private health features
- **Road Accident Fund Act** — for accident-scene dispatch features

**Public provider information**
- Vendor websites and marketing pages (aura.services, netstar.co.za, discovery.co.za/insure, er24.co.za, vumacam.co.za, etc.)
- App store listings and screenshots
- Privacy policies and terms of service (legally required disclosure of processing activities)
- Help centres and FAQs
- Press releases and case studies
- Patents (Google Patents, WIPO) — these read like functional specifications

**Industry knowledge**
- Trade publications (Hi-Tech Security Solutions, Security Focus SA, Fleet Watch)
- Conference presentations (Securex SA, IFSEC Africa)
- Academic papers on SA private security and telematics insurance
- News coverage of real incidents (reveals how systems actually work)

**Practitioner insight (optional but high-value)**
- Conversations with industry practitioners — ex-operations managers, PSIRA-registered consultants, insurance brokers, paramedics, dispatch operators
- One 30-minute conversation with an experienced practitioner often produces better brainstorm input than a week of desk research

**Important:** All of these are inputs to **your own understanding**, not sources to copy. You read them, you internalize the problem, then you brainstorm the solution.

### Brainstorm session structure per gap

For each feature in the gap list, a brainstorm session looks roughly like:

```
You: /fdl-brainstorm armed-response-dispatch

Brainstorm:
  - What triggers an armed response dispatch?
  - Who are the actors (client, operator, responder, supervisor)?
  - What states does a dispatch move through?
  - What rules determine which responder is sent?
  - What SLA applies to each response grade?
  - What happens if a responder can't reach the scene?
  - What data must be captured for post-incident review?
  - How does this integrate with alarm monitoring and client database?
  - What POPIA and PSIRA constraints apply?

You: [answer each question with your domain knowledge]

Brainstorm: [summarizes into blueprint structure]
Brainstorm: Ready to /fdl-create armed-response-dispatch? [y/n]

You: y

/fdl-create generates the blueprint → /fdl-auto-evolve validates and commits
```

The skill does the structural work. You bring the domain context.

---

## Part 3 — Phase 5 brainstorm plan

After the 20-repo extraction (Phases 1–4) is complete, run these brainstorm sessions in dependency order. Commands are listed inline with each feature in Part 1 — this section groups them by round so you know the execution order.

### Round 1 — Compliance foundation (run first, cascades into everything else)

Features **61–67** from Category H: POPIA, PSIRA, medical aid, SAPS case integration, load-shedding awareness, multi-language support, SMS fallback.

### Round 2 — Private security marketplace

Features **1–10** from Category A. Start with feature 1 (the marketplace model itself), then 2 (dispatch routing), then the rest.

### Round 3 — Alarm monitoring

Features **23–32** from Category C. Start with 23 (Contact ID / SIA DC-09) because every other feature in this round builds on the signal protocol.

### Round 4 — Armed response SOP

Features **33–39** from Category D. Start with 33 (response grades) — the grade classification is referenced by everything else in the round.

### Round 5 — Stolen Vehicle Recovery

Features **11–22** from Category B. Start with 11 (RF + GPS hybrid) and 12 (jammer detection) because they define the tracking primitive everything else depends on.

### Round 6 — Telematics insurance

Features **40–46** from Category E. Start with 40 (trip scoring algorithm) — it's the data source for every downstream feature.

### Round 7 — Private EMS membership

Features **47–53** from Category F. Start with 47 (tiered membership) — the membership model shapes all other benefits.

### Round 8 — CCTV / ANPR mesh

Features **54–60** from Category G. Start with 54 (distributed camera network) then 55 (ANPR).

### Round 9 — Hijacking-specific

Features **71–77** from Category I plus features **68–70** from Category H (eNatis, CIPC, SARS). Start with 71 (under-duress codes) and 72 (hot-zone warnings).

**Total Phase 5:** ~77 brainstorm sessions producing ~77 blueprints. All commands are inline in Part 1 — copy them directly when running each round.

---

## Part 4 — Estimated output

| Phase | Source | Features | Cumulative |
|---|---|---|---|
| Phase 1 — Tracking | `/fdl-extract-code-feature` | 83 | 83 |
| Phase 2 — Messaging | `/fdl-extract-code-feature` | 73 | 156 |
| Phase 3 — Ride-hailing | `/fdl-extract-code-feature` | 65 | 221 |
| Phase 4 — Emergency services | `/fdl-extract-code-feature` | 100 | 321 |
| Phase 5 — SA localization | `/fdl-brainstorm` → `/fdl-create` | 77 | **398** |

**Final library:** ~398 blueprints covering a 911 system + ride-hailing + fleet management + private security marketplace + armed response + SVR + telematics insurance + private EMS + CCTV/ANPR + full SA compliance.

---

## Part 5 — Hard-earned rules for Phase 5

1. **Compliance round first.** POPIA, PSIRA, medical aid, SAPS, load-shedding, and multi-language blueprints cascade into every other SA blueprint. Run Round 1 before anything else.
2. **Gather context before brainstorming.** Read standards, vendor pages, and at least one industry publication before each session. The quality of your answers determines the quality of the blueprint.
3. **One feature per session.** Don't try to brainstorm "private security" — brainstorm "private-security-marketplace" and "partner-dispatch-routing" as separate sessions.
4. **Write in your own words.** FDL is about requirements you understand, not text you copied. If you can't explain the feature without the source document in front of you, you need more context before brainstorming.
5. **No real data.** Use placeholders per `CLAUDE.md` rules (`example@test.com`, `13-digit-id-number`). No real API keys, phone numbers, ID numbers, or vendor credentials.
6. **Verify across three sources.** Before you treat a feature as "real," see it described in at least three independent public sources (vendor + news + industry publication, for example). This stops you from blueprinting features that don't actually exist the way you think they do.
7. **Talk to a practitioner when stuck.** A 30-minute conversation with an ex-operations manager, paramedic, or consultant saves days of guessing. Industry people are usually happy to help if you're building something useful and you credit them.
8. **Reference the pattern, not the vendor.** Describe the feature as "pattern common to SA private security marketplaces" not "copied from AURA." Blueprints should be portable to any implementation.
9. **Let `/fdl-brainstorm` drive the structure.** Don't try to pre-write the blueprint and feed it into `/fdl-create` — the Socratic process produces better blueprints than you will if you freestyle.
10. **Auto-evolve after every session.** `/fdl-auto-evolve` will validate and commit each new blueprint. Don't batch — you'll lose track of which brainstorm produced which artifact.

---

## Part 6 — What FDL blueprints CAN'T replace

Some things you cannot blueprint into existence — they require real partnerships and physical infrastructure:

- **PSIRA licensing** — you must register as a security services provider with PSIRA
- **Medical aid scheme certification** — direct billing requires contractual agreements with Discovery, Bonitas, Momentum, GEMS, Profmed, etc.
- **Insurance underwriting** — telematics insurance requires a licensed underwriting partner (or becoming one, which is a multi-year regulatory journey)
- **CCTV physical infrastructure** — cameras, fibre, operations centres, retention storage
- **Response centre staffing** — 24/7 control rooms with trained PSIRA-registered operators
- **Armed response vehicles and personnel** — licensed, trained, insured, PSIRA-registered
- **Aeromedical capability** — helicopters, pilots, flight paramedics, CAA certification
- **Direct SAPS liaison** — formal relationships with local stations and provincial commands
- **VESA-certified fitment centres** — for SVR device installation

Blueprints describe workflows. Deploying them in SA is a **business development and compliance exercise**, not just an engineering one. Plan your go-to-market around real partnerships.

---

## Part 7 — The full FDL pipeline recap

```
Phase 1 — /fdl-extract-code-feature × 5 (tracking)
Phase 2 — /fdl-extract-code-feature × 4 (messaging)
Phase 3 — /fdl-extract-code-feature × 4 (ride-hailing, new repos only)
Phase 4 — /fdl-extract-code-feature × 7 (emergency services, new repos only)
Phase 5 — /fdl-brainstorm × ~55 → /fdl-create × ~77 (SA localization)

After each step:
  /fdl-auto-evolve → validate → generate docs → commit
```

Phases 1–4 use **extraction** (reading open-source code → blueprint).
Phase 5 uses **brainstorming** (Socratic elicitation → blueprint).

Both terminate in a validated, committed blueprint. The difference is the input source: code for Phases 1–4, your own domain understanding (informed by public sources) for Phase 5.

---

## Document cross-reference

- `execution-order.md` — master 20-repo extraction sequence (Phases 1–4)
- `messaging.md` — Phase 2 detail
- `tracking.md` — Phase 1 detail
- `ridehailing.md` — Phase 3 detail
- `emergency-services.md` — Phase 4 detail
- `sa-gap-analysis.md` — this file, Phase 5 SA localization via `/fdl-brainstorm`
