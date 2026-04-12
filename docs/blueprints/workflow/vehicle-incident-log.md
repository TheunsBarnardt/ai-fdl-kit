---
title: "Vehicle Incident Log Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Record vehicle accidents, breakdowns, and operational incidents with damage assessment, third-party details, injury reporting, police report linkage, and insura"
---

# Vehicle Incident Log Blueprint

> Record vehicle accidents, breakdowns, and operational incidents with damage assessment, third-party details, injury reporting, police report linkage, and insurance claim lifecycle management.

| | |
|---|---|
| **Feature** | `vehicle-incident-log` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, accident, incident, insurance, claim, safety |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/vehicle-incident-log.blueprint.yaml) |
| **JSON API** | [vehicle-incident-log.json]({{ site.baseurl }}/api/blueprints/workflow/vehicle-incident-log.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Reports the incident immediately after it occurs |
| `fleet_manager` | Fleet Manager | human | Investigates the incident, authorises repair, and manages insurance claims |
| `insurance_assessor` | Insurance Assessor | external | Assesses damage and approves claim settlement |
| `system` | System | system | Tracks claim status and escalates unresolved incidents |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `incident_date` | datetime | Yes | Incident Date and Time |  |
| `incident_type` | select | Yes | Incident Type |  |
| `location` | text | Yes | Location |  |
| `incident_description` | rich_text | Yes | Incident Description |  |
| `driver_at_incident` | text | No | Driver at Time of Incident |  |
| `injuries_reported` | boolean | No | Injuries Reported |  |
| `injury_details` | text | No | Injury Details |  |
| `third_party_involved` | boolean | No | Third Party Involved |  |
| `third_party_details` | text | No | Third Party Details |  |
| `damage_description` | rich_text | No | Vehicle Damage Description |  |
| `estimated_repair_cost` | number | No | Estimated Repair Cost |  |
| `actual_repair_cost` | number | No | Actual Repair Cost |  |
| `police_report_number` | text | No | Police Report Number |  |
| `insurance_claim_number` | text | No | Insurance Claim Number |  |
| `claim_settlement_amount` | number | No | Claim Settlement Amount |  |
| `photos` | file | No | Incident Photos |  |
| `root_cause` | text | No | Root Cause |  |
| `corrective_actions` | text | No | Corrective Actions |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `reported` | Yes |  |
| `under_investigation` |  |  |
| `repair_authorised` |  |  |
| `insurance_submitted` |  |  |
| `insurance_settled` |  |  |
| `closed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `reported` | `under_investigation` | fleet_manager |  |
|  | `under_investigation` | `repair_authorised` | fleet_manager |  |
|  | `under_investigation` | `insurance_submitted` | fleet_manager |  |
|  | `repair_authorised` | `insurance_submitted` | fleet_manager |  |
|  | `insurance_submitted` | `insurance_settled` | insurance_assessor |  |
|  | `repair_authorised` | `closed` | fleet_manager |  |
|  | `insurance_settled` | `closed` | fleet_manager |  |
|  | `reported` | `cancelled` | fleet_manager |  |

## Rules

- **date_not_future:**
  - **description:** Incident date cannot be in the future
- **injury_escalation:**
  - **description:** When injuries_reported is true, incident must be escalated to fleet manager immediately
- **third_party_details_required:**
  - **description:** When third_party_involved is true, third_party_details are required before the record can move past reported
- **insurance_requires_active_policy:**
  - **description:** An insurance claim cannot be submitted if the vehicle has no active insurance policy
- **out_of_order_on_damage:**
  - **description:** Vehicle status is set to Out of Order when an incident is reported with damage; cleared when repair is complete
- **police_report_before_claim:**
  - **description:** Police report number is required for incidents involving third parties or injuries before insurance submission
- **closed_records_readonly:**
  - **description:** Closed incidents are read-only; corrections require a linked amendment record

## Outcomes

### Injury_escalated (Priority: 1)

**Given:**
- incident_reported outcome has fired
- injuries_reported is true

**Then:**
- **notify** — Send urgent escalation to operations supervisor and HR
- **emit_event** event: `incident.injury_reported`

**Result:** Injury incident is urgently escalated to senior management

### Missing_third_party_details (Priority: 2) — Error: `INCIDENT_MISSING_THIRD_PARTY`

**Given:**
- third_party_involved is true
- third_party_details is empty
- status transition past reported is requested

**Result:** Transition is blocked until third-party details are recorded

### Repair_completed_and_closed (Priority: 8)

**Given:**
- status is repair_authorised or insurance_settled
- actual_repair_cost is provided
- root_cause and corrective_actions are recorded

**Then:**
- **set_field** target: `status` value: `closed`
- **emit_event** event: `incident.closed`

**Result:** Incident is fully resolved and closed with a complete record

### Insurance_claim_submitted (Priority: 9)

**Given:**
- vehicle has an active insurance policy
- damage_description is provided
- police_report_number is provided if third_party_involved is true

**Then:**
- **set_field** target: `insurance_claim_number` — Record the claim reference from the insurer
- **set_field** target: `status` value: `insurance_submitted`
- **emit_event** event: `incident.insurance_claim_submitted`

**Result:** Insurance claim is on record; fleet manager tracks settlement

### Incident_reported (Priority: 10)

**Given:**
- vehicle exists in the fleet
- incident_date is not in the future
- incident_type, location, and incident_description are provided

**Then:**
- **set_field** target: `status` value: `reported`
- **notify** — Immediately notify the fleet manager of the new incident report
- **emit_event** event: `incident.reported`

**Result:** Incident is logged and the fleet manager is notified for follow-up

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INCIDENT_FUTURE_DATE` | 400 | Incident date cannot be in the future. | No |
| `INCIDENT_MISSING_THIRD_PARTY` | 422 | Third-party details are required when a third party is involved. | No |
| `INCIDENT_NO_ACTIVE_INSURANCE` | 422 | No active insurance policy found for this vehicle. Please add insurance before submitting a claim. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `incident.reported` | A vehicle incident has been recorded and reported | `vehicle`, `incident_type`, `incident_date`, `location`, `injuries_reported`, `driver_at_incident` |
| `incident.injury_reported` | An incident involving injuries has been escalated | `vehicle`, `incident_date`, `location`, `injury_details`, `driver_at_incident` |
| `incident.insurance_claim_submitted` | An insurance claim has been submitted for a vehicle incident | `vehicle`, `incident_date`, `insurance_claim_number`, `estimated_repair_cost` |
| `incident.closed` | A vehicle incident has been fully resolved and closed | `vehicle`, `incident_date`, `actual_repair_cost`, `claim_settlement_amount`, `root_cause` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-insurance | required | Active insurance policy is required for claim submission from an incident |
| vehicle-maintenance-log | recommended | Repair work performed after an incident is logged in the maintenance history |
| vehicle-master-data | required | Vehicle identification and assignment details are sourced from the master record |
| vehicle-expense-tracking | recommended | Incident repair costs and insurance shortfalls roll into per-vehicle expense reporting |

## AGI Readiness

### Goals

#### Reliable Vehicle Incident Log

Record vehicle accidents, breakdowns, and operational incidents with damage assessment, third-party details, injury reporting, police report linkage, and insurance claim lifecycle management.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `vehicle_insurance` | vehicle-insurance | degrade |
| `vehicle_master_data` | vehicle-master-data | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| incident_reported | `autonomous` | - | - |
| injury_escalated | `autonomous` | - | - |
| insurance_claim_submitted | `autonomous` | - | - |
| repair_completed_and_closed | `autonomous` | - | - |
| missing_third_party_details | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 3
  entry_points:
    - erpnext/assets/doctype/asset_repair/asset_repair.py
    - erpnext/setup/doctype/vehicle/vehicle.py
    - erpnext/setup/doctype/vehicle/vehicle.json
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Incident Log Blueprint",
  "description": "Record vehicle accidents, breakdowns, and operational incidents with damage assessment, third-party details, injury reporting, police report linkage, and insura",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, accident, incident, insurance, claim, safety"
}
</script>
