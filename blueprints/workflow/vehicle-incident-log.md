<!-- AUTO-GENERATED FROM vehicle-incident-log.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Vehicle Incident Log

> Record vehicle accidents, breakdowns, and operational incidents with damage assessment, third-party details, injury reporting, police report linkage, and insurance claim lifecycle management.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** fleet · vehicle · accident · incident · insurance · claim · safety

## What this does

Record vehicle accidents, breakdowns, and operational incidents with damage assessment, third-party details, injury reporting, police report linkage, and insurance claim lifecycle management.

Specifies 5 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **vehicle** *(text, required)* — Vehicle
- **incident_date** *(datetime, required)* — Incident Date and Time
- **incident_type** *(select, required)* — Incident Type
- **location** *(text, required)* — Location
- **incident_description** *(rich_text, required)* — Incident Description
- **driver_at_incident** *(text, optional)* — Driver at Time of Incident
- **injuries_reported** *(boolean, optional)* — Injuries Reported
- **injury_details** *(text, optional)* — Injury Details
- **third_party_involved** *(boolean, optional)* — Third Party Involved
- **third_party_details** *(text, optional)* — Third Party Details
- **damage_description** *(rich_text, optional)* — Vehicle Damage Description
- **estimated_repair_cost** *(number, optional)* — Estimated Repair Cost
- **actual_repair_cost** *(number, optional)* — Actual Repair Cost
- **police_report_number** *(text, optional)* — Police Report Number
- **insurance_claim_number** *(text, optional)* — Insurance Claim Number
- **claim_settlement_amount** *(number, optional)* — Claim Settlement Amount
- **photos** *(file, optional)* — Incident Photos
- **root_cause** *(text, optional)* — Root Cause
- **corrective_actions** *(text, optional)* — Corrective Actions
- **status** *(select, required)* — Status

## What must be true

- **date_not_future:** Incident date cannot be in the future
- **injury_escalation:** When injuries_reported is true, incident must be escalated to fleet manager immediately
- **third_party_details_required:** When third_party_involved is true, third_party_details are required before the record can move past reported
- **insurance_requires_active_policy:** An insurance claim cannot be submitted if the vehicle has no active insurance policy
- **out_of_order_on_damage:** Vehicle status is set to Out of Order when an incident is reported with damage; cleared when repair is complete
- **police_report_before_claim:** Police report number is required for incidents involving third parties or injuries before insurance submission
- **closed_records_readonly:** Closed incidents are read-only; corrections require a linked amendment record

## Success & failure scenarios

**✅ Success paths**

- **Injury Escalated** — when incident_reported outcome has fired; injuries_reported is true, then Injury incident is urgently escalated to senior management.
- **Repair Completed And Closed** — when status is repair_authorised or insurance_settled; actual_repair_cost is provided; root_cause and corrective_actions are recorded, then Incident is fully resolved and closed with a complete record.
- **Insurance Claim Submitted** — when vehicle has an active insurance policy; damage_description is provided; police_report_number is provided if third_party_involved is true, then Insurance claim is on record; fleet manager tracks settlement.
- **Incident Reported** — when vehicle exists in the fleet; incident_date is not in the future; incident_type, location, and incident_description are provided, then Incident is logged and the fleet manager is notified for follow-up.

**❌ Failure paths**

- **Missing Third Party Details** — when third_party_involved is true; third_party_details is empty; status transition past reported is requested, then Transition is blocked until third-party details are recorded. *(error: `INCIDENT_MISSING_THIRD_PARTY`)*

## Errors it can return

- `INCIDENT_FUTURE_DATE` — Incident date cannot be in the future.
- `INCIDENT_MISSING_THIRD_PARTY` — Third-party details are required when a third party is involved.
- `INCIDENT_NO_ACTIVE_INSURANCE` — No active insurance policy found for this vehicle. Please add insurance before submitting a claim.

## Connects to

- **vehicle-insurance** *(required)* — Active insurance policy is required for claim submission from an incident
- **vehicle-maintenance-log** *(recommended)* — Repair work performed after an incident is logged in the maintenance history
- **vehicle-master-data** *(required)* — Vehicle identification and assignment details are sourced from the master record
- **vehicle-expense-tracking** *(recommended)* — Incident repair costs and insurance shortfalls roll into per-vehicle expense reporting

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/vehicle-incident-log/) · **Spec source:** [`vehicle-incident-log.blueprint.yaml`](./vehicle-incident-log.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
