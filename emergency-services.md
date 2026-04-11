# Emergency Services & First Responders (911-style) — FDL Extraction Plan

A strategic plan for building a complete emergency services platform — citizen-facing panic app, dispatcher console (CAD), and responder mobile app — by extracting from open-source repos. Builds on `tracking.md` and `messaging.md`.

## The three-app family

Emergency services is not one app — it's a family of three:

1. **Citizen app** — panic button, silent SOS, location share, follow-home, welfare check, incident reporting
2. **Dispatcher console (CAD)** — call intake, triage, unit dispatch, active call board, resource tracking
3. **Responder mobile app** — receive dispatch, navigate, update status, capture scene data, ePCR, hospital handoff

## Extraction order

```bash
# 1. CAD / dispatch core — 911 intake, triage, unit dispatch
/fdl-extract-code-feature https://github.com/SnailyCAD/snaily-cadv4

# 2. Disaster / incident / resource / volunteer management
/fdl-extract-code-feature https://github.com/sahana/eden

# 3. Crowdsourced intake + crisis mapping + SMS reporting
/fdl-extract-code-feature https://github.com/ushahidi/platform

# 4. Mass notification / alerting fanout
/fdl-extract-code-feature https://github.com/binwiederhier/ntfy
/fdl-extract-code-feature https://github.com/caronc/apprise

# 5. Patient care records (ePCR) - pick ONE
/fdl-extract-code-feature https://github.com/Bahmni/Bahmni-EMR
# Alternative (older but more mature):
# /fdl-extract-code-feature https://github.com/openemr/openemr

# 6. Dispatcher voice / push-to-talk / talkgroups
/fdl-extract-code-feature https://github.com/mumble-voip/mumble

# 7. AVL / unit tracking — already in tracking.md
# /fdl-extract-code-feature https://github.com/traccar/traccar
```

`/fdl-auto-evolve` will run automatically after each extraction to validate, generate docs, and commit.

> **Note on Sahana Eden:** Huge repo with many modules. Scope your feature menu to **Incident Management**, **Volunteers**, **Shelters**, **Missing Persons**, and **Resources**. Skip the rest (agriculture, finance, etc.).

---

## 1. SnailyCAD — CAD / dispatch core

**Repo:** `https://github.com/SnailyCAD/snaily-cadv4`
**Strength:** Modern TypeScript/Next.js open-source CAD. Originally for FiveM roleplay but the **dispatch business logic is genuinely transferable** to real public safety use.

Features to select:

 1. 911 call intake with caller details
 2. Call triage and priority assignment
 3. Incident creation from a 911 call
 4. Dispatch to units (police, fire, EMS)
 5. Multi-discipline simultaneous dispatch
 6. Unit status codes (10-codes / signals)
 7. Unit status lifecycle (available → en route → on scene → transporting → clear)
 8. Active call board (real-time view of all incidents)
 9. BOLOs (Be On LookOut) broadcast to units
10. Warrant lookup tied to persons
11. Person and vehicle records
12. Incident / call narrative and supplements
13. Dispatcher notes vs. public narrative
14. Call history per unit and per officer
15. Officer check-in / check-out / break status
16. Shift management and roster
17. Panic button from unit (officer down)
18. Dispatcher alert broadcast to all units

---

## 2. Sahana Eden — Incident / resource / volunteer / shelter management

**Repo:** `https://github.com/sahana/eden`
**Scope:** Incident management, volunteers, shelters, missing persons, resources only.
**Strength:** **The** open-source disaster response platform. Battle-tested in real disasters (Haiti, Nepal, Philippines). Python.

Features to select:

 1. Incident Command System (ICS) structure and roles
 2. Unified Command (multi-agency shared command)
 3. Mutual aid request and acceptance workflow
 4. Resource inventory (vehicles, equipment, supplies)
 5. Resource commitment to an incident
 6. Volunteer registration and credentials
 7. Volunteer rostering and dispatch
 8. Shelter registration with capacity and amenities
 9. Shelter occupancy tracking and check-in/out
10. Missing persons registry with descriptors and last-seen
11. Missing persons resolution and reunification
12. Hospital bed availability tracking
13. Supply requests and fulfilment
14. Donations intake and distribution
15. Beneficiary registration and aid tracking
16. Situation reports (SitRep) generation
17. After-action review (AAR) documentation
18. Mass casualty incident (MCI) triage tags (START/JumpSTART)

---

## 3. Ushahidi Platform — Crowdsourced intake & crisis mapping

**Repo:** `https://github.com/ushahidi/platform`
**Strength:** Famous for real-world crisis deployments. PHP/Laravel. SMS/email/social ingestion with verification workflows.

Features to select:

 1. Public incident reporting form (web and API)
 2. SMS intake (report via text message)
 3. Email intake
 4. Social media intake
 5. Report categorization and tagging
 6. Verification workflow (unverified → verified → confirmed)
 7. Duplicate detection and merging
 8. Map-based visualization of reports
 9. Time-based filtering and playback
10. Bulk messaging out to reporters
11. Data export (CSV, GeoJSON, KML)
12. Custom survey / form builder
13. Multi-language support
14. Anonymous reporting option
15. Media attachments (photo, video)
16. Sets / collections of reports for a specific event

---

## 4. ntfy + Apprise — Mass notification / alerting

**Repos:**
- `https://github.com/binwiederhier/ntfy`
- `https://github.com/caronc/apprise`

**Strength:** ntfy is self-hosted pub/sub push; Apprise is a multi-channel fanout library (SMS, email, Slack, Teams, Matrix, push). Together they cover alerting on-call staff and broadcasting to the public.

Features to select (ntfy):

 1. Topic-based pub/sub subscriptions
 2. HTTP publish endpoint for alerts
 3. Priority levels (min / low / default / high / urgent)
 4. Attachment support (photos, PDFs)
 5. Scheduled / delayed delivery
 6. Click actions and call actions
 7. Email-to-topic bridge
 8. Access control per topic
 9. Delivery receipts and retention

Features to select (Apprise):

10. Multi-channel fanout (one alert → SMS + email + push + chat)
11. Channel-specific formatting
12. Tag-based routing (severity → destination)
13. Template-based alert bodies
14. Retry and failure handling per channel
15. Attachment forwarding across channels

---

## 5. Bahmni — Patient care record (ePCR)

**Repo:** `https://github.com/Bahmni/Bahmni-EMR`
**Alternative:** `https://github.com/openemr/openemr`
**Strength:** Modern hospital EMR built on OpenMRS. Extract the **clinical primitives** and adapt them to EMS pre-hospital care.

Features to select:

 1. Patient registration (fast registration for unknown patients)
 2. Vital signs capture (BP, HR, RR, SpO2, GCS, temp)
 3. Chief complaint and history
 4. Medication administration log
 5. Procedures performed
 6. Allergies and medical history
 7. Triage category (immediate, delayed, minor, deceased)
 8. Clinical notes and observations
 9. Hospital handoff record
10. Encounter lifecycle (registration → assessment → treatment → disposition)
11. Document attachments (ECG strips, photos)
12. Provider / responder signature on the encounter
13. Patient search and merging (same patient multiple encounters)
14. Legal documentation (refusal of care, consent)
15. NEMSIS-style structured data export

---

## 6. Mumble — Dispatcher voice / push-to-talk

**Repo:** `https://github.com/mumble-voip/mumble`
**Strength:** Low-latency voice with channel-based model. Channels map naturally to **talkgroups** (Dispatch, Fire-1, EMS-1, Tactical).

Features to select:

 1. Channel-based voice rooms (talkgroups)
 2. Push-to-talk and voice activation
 3. Channel permissions (who can transmit, who can listen)
 4. Priority speaker override
 5. Whisper / targeted transmission
 6. Recording per channel
 7. User presence in channels
 8. Channel link (relay transmissions across channels)
 9. Mute / deafen controls
10. Text messages alongside voice

---

## Three-app assembly guide

### Citizen app
Patterns from:
- **SnailyCAD** — 911 call creation flow
- **Ushahidi** — anonymous reporting, media attachments, categorization
- **ntfy** — receiving public alerts and welfare check pings
- **OwnTracks** (from `tracking.md`) — minimal location sharing

Unique features to model manually:
- Silent SOS (no audio, live location share, discreet UI)
- Follow-home / trusted contact share
- Welfare check (auto-alert if user doesn't confirm safe)
- Geofenced public alerts (receive WEA-style messages)
- Pre-arrival instructions viewer (CPR, choking, childbirth)

### Dispatcher console (CAD)
Patterns from:
- **SnailyCAD** — active call board, unit dispatch, status tracking, BOLOs
- **Sahana Eden** — resource inventory, ICS, mutual aid
- **Ushahidi** — public report triage and verification
- **Mumble** — dispatcher voice to units
- **Apprise/ntfy** — alert fanout to on-call staff

Unique features to model manually:
- Caller location (E911 / NG911 phase-1/phase-2 patterns)
- Emergency Medical Dispatch (EMD) scripted protocols
- Dispatch algorithm (nearest available, balanced, skill-matched)
- Response time SLA tracking (call received → dispatched → on scene → cleared)

### Responder mobile app
Patterns from:
- **SnailyCAD** — receive dispatch, update status, scene narrative
- **Traccar** (from `tracking.md`) — AVL, routing to scene
- **Bahmni** — ePCR capture (vitals, meds, procedures)
- **Mumble** — talkgroup voice
- **Rocket.Chat** (from `messaging.md`) — text coordination

Unique features to model manually:
- Offline-first scene data capture (sync when back in coverage)
- Evidence collection with chain of custody
- Hospital handoff with NEMSIS-compliant data
- Body-worn camera metadata (immich pattern for media storage)

---

## Emergency-services-specific features to model manually

These aren't cleanly available in any one repo — blueprint them directly via `/fdl-create`:

1. **911 text intake (RTT / SMS)**
2. **NG911 / RapidSOS caller location integration**
3. **Emergency Medical Dispatch (EMD) scripted protocols**
4. **Pre-arrival instructions library (CPR, choking, childbirth, bleeding)**
5. **Dispatch algorithm** (nearest, balanced, skill-matched, jurisdictional)
6. **Response time SLAs** (received → dispatched → en route → on scene → transport → clear)
7. **Common Alerting Protocol (CAP)** message format for public alerts
8. **Wireless Emergency Alerts (WEA)** broadcast patterns
9. **Silent SOS** with discreet UI and no-audio mode
10. **Follow-home / welfare check** with auto-escalation
11. **Chain of custody** for evidence media
12. **Body-worn camera metadata** and event-triggered recording
13. **NEMSIS data export** for EMS compliance
14. **Mass casualty triage (START/JumpSTART)**
15. **Unified Command** across multiple agencies
16. **Mutual aid auto-activation** based on incident type and severity
17. **Jurisdictional geofence routing** (which agency handles which zone)
18. **Shift roster with on-call escalation**
19. **After-action review (AAR) workflow** with lessons learned
20. **Agency-specific 10-code / signal dictionaries**

---

## Coverage matrix

| Concern | Covered by |
|---|---|
| 911 call intake and triage | SnailyCAD |
| Unit dispatch (police/fire/EMS) | SnailyCAD |
| Active call board | SnailyCAD |
| Unit status codes and lifecycle | SnailyCAD |
| BOLOs, warrants, person/vehicle records | SnailyCAD |
| Officer shift, check-in, panic | SnailyCAD |
| Incident Command System (ICS) | Sahana Eden |
| Mutual aid and resource commitment | Sahana Eden |
| Shelter management | Sahana Eden |
| Missing persons registry | Sahana Eden |
| Volunteer coordination | Sahana Eden |
| Mass casualty triage | Sahana Eden |
| Public / crowdsourced reporting | Ushahidi |
| SMS / email / social intake | Ushahidi |
| Crisis mapping | Ushahidi |
| Verification workflow | Ushahidi |
| Mass notification fanout | ntfy + Apprise |
| Multi-channel alert routing | Apprise |
| Patient care record (ePCR) | Bahmni (or OpenEMR) |
| Vital signs, medications, procedures | Bahmni |
| Hospital handoff | Bahmni |
| Dispatcher ↔ responder voice (PTT) | Mumble |
| Talkgroup channel model | Mumble |
| Unit GPS / AVL | Traccar (from `tracking.md`) |
| Dispatcher ↔ responder text | Rocket.Chat (from `messaging.md`) |
| EMD protocols, CAP, WEA, NG911 | **Model manually via /fdl-create** |
| Silent SOS, follow-home, welfare check | **Model manually via /fdl-create** |
| Chain of custody, BWC metadata | **Model manually via /fdl-create** |

**Total:** ~100 features extractable across 6 core repos, plus ~20 emergency-specific features to model manually.

---

## Minimum viable stack

1. **SnailyCAD** — CAD / dispatch core (non-negotiable)
2. **Traccar** (from `tracking.md`) — unit tracking / AVL
3. **Sahana Eden** — incident and resource management
4. **ntfy** — alerting fanout

Add **Bahmni** when you need ePCR, **Ushahidi** when you need crowdsourced intake, **Mumble** when you need PTT voice.

---

## Critical caveats

**This is a life-safety domain. Before building any of this for real use:**

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

## Why these repos

- **SnailyCAD** → the only modern open-source CAD with a transferable feature surface
- **Sahana Eden** → proven in real disasters; nothing else comes close on disaster/incident management breadth
- **Ushahidi** → unique crowdsourced intake and crisis mapping, battle-tested in real events
- **ntfy + Apprise** → clean alerting primitives without reinventing fanout
- **Bahmni / OpenEMR** → mature clinical primitives adaptable to pre-hospital ePCR
- **Mumble** → the only serious open-source PTT / talkgroup voice option
