# Master Execution Order — FDL Blueprint Library

**End goal:** Build a 911 / emergency services platform (citizen app + dispatcher console + responder mobile app).
**Strategy:** Extract reusable foundations first so every blueprint is usable beyond the 911 use case — ride-hailing, fleet management, logistics, community safety, etc.

## Why this order

The 911 system is the most complex domain in the plan. Rather than extracting it first, we build a library of **reusable foundation blueprints** from simpler domains, then layer emergency-specific features on top. This means:

- ✅ Every blueprint is **domain-agnostic** where possible (messaging, tracking, identity, payments, alerting)
- ✅ The 911 system reuses ~80% of its features from foundations already built
- ✅ The same blueprints power **ride-hailing**, **fleet management**, **delivery**, **community safety**, **disaster response** — not just 911
- ✅ Early extractions produce immediately useful blueprints; you don't wait until the end to see value
- ✅ Complex domain-specific features (EMD protocols, CAP alerts, ePCR) come last when your library is mature

## The unified run order

Run these sequentially. `/fdl-auto-evolve` runs automatically after each extraction — you get a validated commit every step.

---

### Phase 1 — Tracking foundation (5 repos)

**Why first:** GPS, routing, and fleet operations feed every downstream domain. Traccar is the single most-reused repo across the entire plan.

**Source:** `tracking.md`

```bash
1.  /fdl-extract-code-feature https://github.com/traccar/traccar
2.  /fdl-extract-code-feature https://github.com/fleetbase/fleetbase
3.  /fdl-extract-code-feature https://github.com/frappe/erpnext           # vehicle module only
4.  /fdl-extract-code-feature https://github.com/adriankumpf/teslamate
5.  /fdl-extract-code-feature https://github.com/VROOM-Project/vroom
```

**What you get:** GPS ingestion (200+ protocols), live tracking, geofencing, route optimization, trip analytics, vehicle lifecycle, maintenance, dispatch primitives. Reusable for ride-hailing, delivery, emergency AVL, personal tracking, logistics.

**Scope warning:** ERPNext is massive — extract **Vehicle module only**. Sahana Eden will be similar in Phase 4.

---

### Phase 2 — Messaging foundation (4 repos)

**Why second:** Every downstream domain needs communication — rider↔driver chat, dispatcher↔responder text, mass alerts, E2EE for safety apps, federation for multi-agency.

**Source:** `messaging.md`

```bash
6.  /fdl-extract-code-feature https://github.com/RocketChat/Rocket.Chat
7.  /fdl-extract-code-feature https://github.com/mattermost/mattermost
8.  /fdl-extract-code-feature https://github.com/element-hq/synapse
9.  /fdl-extract-code-feature https://github.com/signalapp/Signal-Server
```

**What you get:** Channels, DMs, threading, reactions, files, search, RBAC, compliance, SSO/SAML/LDAP, MFA, federation, device-based E2EE (Olm/Megolm), Signal Protocol, phone-number auth, disappearing messages, 1:1/group voice+video signaling. Reusable for any team chat, consumer messaging, or secure comms product.

**Critical:** Mattermost's RBAC and compliance patterns inform both ride-hailing ops and emergency dispatcher permissions. Extract it before domain-specific repos.

---

### Phase 3 — Ride-hailing layer (4 NEW repos)

**Why third:** Ride-hailing is simpler than emergency (one app family, clean money flow) and reuses almost everything from Phases 1–2. It proves the foundation works and gives you identity/payments/support primitives that emergency services also needs.

**Source:** `ridehailing.md`
**Skip:** Fleetbase (Phase 1), VROOM (Phase 1)

```bash
10. /fdl-extract-code-feature https://github.com/ory/kratos                # identity/KYC — cross-cutting
11. /fdl-extract-code-feature https://github.com/medusajs/medusa           # payments/wallet/payouts
12. /fdl-extract-code-feature https://github.com/chatwoot/chatwoot         # support/disputes
13. /fdl-extract-code-feature https://github.com/ro31337/libretaxi         # rider/driver bidding
```

**What you get:** Identity verification, document-bound KYC, MFA, wallets, multi-method payments, payouts, refunds, support tickets, SLA tracking, rider/driver split app patterns, fare bidding.

**Critical:** Extract **Ory Kratos first in this phase**. Its identity/KYC patterns cascade into every later repo — driver onboarding, responder authentication, citizen registration, volunteer credentials.

**Bonus:** After Phase 3 you have a **complete ride-hailing platform** in your blueprint library. Usable on its own even if you never built the 911 system.

---

### Phase 4 — Emergency services layer (7 NEW repos)

**Why last:** The most complex domain. Three-app family (citizen + dispatcher + responder), life-safety requirements, ~20 unique features to model manually. By now your library has messaging, tracking, identity, payments, support, fleet ops — emergency services adds CAD, incident management, alerting, ePCR, and PTT voice on top.

**Source:** `emergency-services.md`
**Skip:** Traccar (Phase 1), Rocket.Chat (Phase 2)

```bash
14. /fdl-extract-code-feature https://github.com/SnailyCAD/snaily-cadv4    # CAD/dispatch core
15. /fdl-extract-code-feature https://github.com/sahana/eden               # ICS/shelters/resources
16. /fdl-extract-code-feature https://github.com/ushahidi/platform         # crowdsourced intake
17. /fdl-extract-code-feature https://github.com/binwiederhier/ntfy        # pub/sub alerting
18. /fdl-extract-code-feature https://github.com/caronc/apprise            # multi-channel fanout
19. /fdl-extract-code-feature https://github.com/Bahmni/Bahmni-EMR         # ePCR/clinical
20. /fdl-extract-code-feature https://github.com/mumble-voip/mumble        # PTT/talkgroups
```

**What you get:** 911 call intake, triage, unit dispatch, BOLOs, warrants, active call board, Incident Command System, mutual aid, shelter management, missing persons, crowdsourced reporting, crisis mapping, mass notification fanout, ePCR (vitals/meds/procedures), hospital handoff, push-to-talk talkgroups.

**Scope warning:** Sahana Eden is huge — extract **Incident, Volunteers, Shelters, Missing Persons, Resources** modules only. Skip agriculture, finance, HR, etc.

---

## Totals

| Phase | Repos | Unique features | Cumulative library |
|---|---|---|---|
| 1 — Tracking | 5 | ~83 | 83 |
| 2 — Messaging | 4 | ~73 | 156 |
| 3 — Ride-hailing | 4 new | ~65 | 221 |
| 4 — Emergency | 7 new | ~100 | 321 |
| **Total** | **20 repos** | **~321 blueprints** | |

Plus ~35 features across ride-hailing and emergency that need `/fdl-create` manual blueprinting (fare estimation, surge, EMD protocols, CAP alerts, silent SOS, chain of custody, etc.).

---

## Reusability matrix — what each phase unlocks beyond 911

Each phase produces blueprints usable **far beyond** the 911 system:

| Phase | 911 uses it for | Other systems that can reuse it |
|---|---|---|
| **Phase 1 (tracking)** | Unit AVL, response time metrics | Ride-hailing, delivery, logistics, personal tracking, asset management, fleet leasing, telematics insurance |
| **Phase 2 (messaging)** | Dispatcher↔responder text, federation across agencies | Team collaboration, consumer messaging, customer support, healthcare messaging, secure government comms |
| **Phase 3 (ride-hailing)** | Responder dispatch, driver payouts (for contractor responders), identity/KYC, support | Food delivery, courier services, on-demand home services, patient transport, volunteer coordination |
| **Phase 4 (emergency)** | The whole 911 stack | Disaster response NGOs, community watch apps, corporate crisis management, event safety, school safety, workplace safety |

**Takeaway:** ~75% of the blueprints built for the 911 system are fully reusable for other products. Only the ~25% in Phase 4 (CAD-specific, ePCR, PTT) are emergency-specific — and even those transfer to disaster response and public safety adjacencies.

---

## The three hard-earned rules

1. **Don't re-extract shared repos.** Fleetbase, VROOM, Traccar, Rocket.Chat appear in multiple plans — extract once in the earliest phase, reference from the others.
2. **Ory Kratos before any domain specialization.** Identity/KYC patterns cascade into every later repo. Get them in early and reuse.
3. **Mattermost before Synapse/Signal.** Mattermost's RBAC and compliance patterns inform emergency services' permission models; extracting it early makes later blueprints smarter.

---

## After the 20 repos — manual blueprinting phase

Once all 20 extractions are complete, use `/fdl-create` to add the ~35 features that can't be cleanly extracted. These are called out in each planning doc's "features to model manually" section:

**Ride-hailing manual features (from `ridehailing.md`):**
- Fare estimation, surge pricing, dispatch algorithm, split payments, cancellation fees, pool rides, ride scheduling, referrals, driver incentives, SOS during trip, masked phone numbers, multi-city pricing, rating aggregation, lost-and-found.

**Emergency-services manual features (from `emergency-services.md`):**
- 911 text intake (RTT/SMS), NG911/RapidSOS caller location, EMD scripted protocols, pre-arrival instructions, dispatch algorithms, response time SLAs, CAP/WEA public alerts, silent SOS, follow-home/welfare check, chain of custody, BWC metadata, NEMSIS export, mass casualty triage, unified command, mutual aid auto-activation, jurisdictional geofence routing, shift roster with escalation, after-action review, agency 10-code dictionaries.

These features are **unique to their domains** and don't have clean reference implementations in open source — but with the foundation library already built, each `/fdl-create` session has rich context to reference.

---

## Critical caveats for the 911 end goal

**This is a life-safety domain. Before deploying any of this for real use:**

- ✅ Partner with a licensed public safety agency from day one
- ✅ Understand your jurisdiction's NG911, CAP, NEMSIS, and CJIS compliance requirements
- ✅ Audit for accessibility (ADA, WCAG) — emergency apps must work for everyone
- ✅ Plan for cellular dead zones, offline mode, and power loss
- ✅ Get independent security review (emergency systems are high-value targets)
- ✅ Understand liability — failed dispatches cost lives and invite lawsuits
- ⚠️ The open-source repos above are **reference patterns**, not certified products
- ⚠️ Some features (E911, CJIS-protected data) require certified vendors and cannot be self-built for production use

FDL blueprints describe **what must be true**, not a license to operate. Use them to accelerate design and reference conversations with real public safety stakeholders.

---

## Planning doc index

- `messaging.md` — Phase 2 details (Rocket.Chat, Mattermost, Synapse, Signal-Server)
- `tracking.md` — Phase 1 details (Traccar, Fleetbase, ERPNext, TeslaMate, VROOM)
- `ridehailing.md` — Phase 3 details (Ory Kratos, Medusa, Chatwoot, LibreTaxi)
- `emergency-services.md` — Phase 4 details (SnailyCAD, Sahana Eden, Ushahidi, ntfy, Apprise, Bahmni, Mumble)
- `execution-order.md` — this file, master sequence

Start with `#1 Traccar` and let `/fdl-auto-evolve` carry you forward.
