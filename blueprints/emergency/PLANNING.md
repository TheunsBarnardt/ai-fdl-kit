# Emergency Dispatch System — Blueprint Plan

> **Status:** Planned — Phase 4 in `execution-order.md`. Build after tracking, messaging, and ride-hailing foundations are complete.

## Where This Fits

This is **Phase 4 (Emergency services layer)** in the master execution order. See `execution-order.md` for the full sequence.

**Dependencies from earlier phases:**
- **Phase 1 (Tracking):** GPS ingestion, live tracking, geofencing, route optimization → feeds unit AVL and response time metrics
- **Phase 2 (Messaging):** Channels, threading, RBAC, federation, E2EE → feeds dispatcher↔responder comms and multi-agency federation
- **Phase 3 (Ride-hailing):** Identity/KYC (Ory Kratos), payments/payouts (Medusa), support (Chatwoot) → feeds responder auth, contractor payouts, citizen support

**Phase 4 extraction repos (7 repos):**
```
14. SnailyCAD/snaily-cadv4    — CAD/dispatch core
15. sahana/eden               — ICS/shelters/resources (extract Incident, Volunteers, Shelters, Missing Persons, Resources only)
16. ushahidi/platform         — crowdsourced intake, crisis mapping
17. binwiederhier/ntfy        — pub/sub alerting
18. caronc/apprise            — multi-channel notification fanout
19. Bahmni/Bahmni-EMR         — ePCR/clinical (vitals, meds, procedures, hospital handoff)
20. mumble-voip/mumble        — PTT/talkgroups
```

**After extraction — manual blueprinting (`/fdl-create`):**
911 text intake (RTT/SMS), NG911/RapidSOS caller location, EMD scripted protocols, pre-arrival instructions, dispatch algorithms, response time SLAs, CAP/WEA public alerts, silent SOS, follow-home/welfare check, chain of custody, BWC metadata, NEMSIS export, mass casualty triage, unified command, mutual aid auto-activation, jurisdictional geofence routing, shift roster with escalation, after-action review, agency 10-code dictionaries.

## Vision

A 911/emergency dispatch guidance system modeled as FDL blueprints. Operators are guided through structured triage questions, incident classification, priority assignment, and pre-arrival instructions — all driven by decision-tree logic that maps naturally to FDL outcomes, flows, and states.

## Proposed Blueprints

### Core Call Handling
| Blueprint | Purpose |
|-----------|---------|
| `emergency-call-intake` | Caller info, location, callback number, scene safety |
| `incident-classification` | Determine type: medical, fire, police, multi-agency |
| `unit-dispatch` | Match priority to available units, CAD integration |
| `call-escalation` | Supervisor override, multi-agency coordination |

### Medical Dispatch (MPDS-style)
| Blueprint | Purpose |
|-----------|---------|
| `medical-triage-dispatch` | Scripted question flow → priority code (Alpha–Echo) |
| `pre-arrival-instructions` | First aid guidance read to caller by operator |
| `medical-priority-codes` | Priority level definitions and response requirements |

### Fire Dispatch
| Blueprint | Purpose |
|-----------|---------|
| `fire-triage-dispatch` | Fire-specific triage protocol |
| `hazmat-assessment` | Hazardous materials identification and response |

### Police Dispatch
| Blueprint | Purpose |
|-----------|---------|
| `police-triage-dispatch` | Police-specific triage protocol |
| `threat-assessment` | Active threat level determination |

## Key FDL Mappings

```
Scripted questions        → flows (steps + conditions)
Triage decision trees     → outcomes (structured given/then)
Priority levels           → states (Alpha → Echo with transitions)
Caller/location/scene     → fields (with validation)
Dispatch rules            → rules (priority ordering)
Response time targets     → sla
Dispatcher/caller/units   → actors
Unit dispatched/arrived   → events
No units/bad location     → errors
```

## Priority Codes (Medical Reference)

| Code | Level | Example | Response |
|------|-------|---------|----------|
| Echo | Immediate life threat | Cardiac arrest, not breathing | Nearest unit + ALS |
| Delta | Serious | Chest pain, severe bleeding | ALS response |
| Charlie | Moderate | Altered consciousness | BLS + ALS |
| Bravo | Minor but needs transport | Non-severe injury | BLS response |
| Alpha | Minor | Minor cuts, non-urgent | Scheduled/low priority |
| Omega | Non-emergency | Referral to clinic | No dispatch needed |

## Notes

- Industry standards: MPDS (Medical Priority Dispatch System), FPDS (Fire), PPDS (Police)
- All protocols must be generic — no vendor names (ProQA, PowerPhone, etc.)
- Pre-arrival instructions are the "first aid" piece — operator reads scripted guidance to caller
- Decision trees can use FDL structured conditions (`field`/`operator`/`value`, `any`/`all`)
- `emergency` will need to be added as a schema category when building starts
- Consider `related` links between all dispatch blueprints and to existing blueprints like `notification`, `workflow`
- ~80% of features will come from foundation phases (tracking, messaging, identity) — only ~20% is emergency-specific
- See `emergency-services.md` for full Phase 4 details and repo-by-repo feature lists
- See `execution-order.md` for master sequence and reusability matrix
