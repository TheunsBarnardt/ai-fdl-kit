---
title: "Odometer Tracking Workflow Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Maintain a complete, validated history of odometer readings for each vehicle, detecting rollbacks and anomalous jumps, with an approval workflow for corrections"
---

# Odometer Tracking Workflow Blueprint

> Maintain a complete, validated history of odometer readings for each vehicle, detecting rollbacks and anomalous jumps, with an approval workflow for corrections.

| | |
|---|---|
| **Feature** | `odometer-tracking-workflow` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, odometer, history, validation, mileage |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/odometer-tracking.blueprint.yaml) |
| **JSON API** | [odometer-tracking-workflow.json]({{ site.baseurl }}/api/blueprints/workflow/odometer-tracking-workflow.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Submits odometer readings at key events (fuel fill-up, service, trip end) |
| `fleet_manager` | Fleet Manager | human | Reviews flagged anomalies and approves or rejects corrections |
| `system` | System | system | Validates each reading against the previous and flags anomalies |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `reading_date` | datetime | Yes | Reading Date |  |
| `odometer_value` | number | Yes | Odometer Value (km) |  |
| `reading_source` | select | Yes | Reading Source |  |
| `reference_document` | text | No | Reference Document |  |
| `recorded_by` | text | No | Recorded By |  |
| `previous_reading` | number | No | Previous Reading (km) |  |
| `distance_delta` | number | No | Distance Delta (km) |  |
| `anomaly_reason` | text | No | Anomaly Reason |  |
| `correction_approved_by` | text | No | Correction Approved By |  |
| `is_validated` | boolean | No | Validated |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pending` | Yes |  |
| `validated` |  |  |
| `flagged` |  |  |
| `approved` |  | Yes |
| `rejected` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pending` | `validated` | system |  |
|  | `pending` | `flagged` | system |  |
|  | `flagged` | `approved` | fleet_manager |  |
|  | `flagged` | `rejected` | fleet_manager |  |

## Rules

- **reading_monotonic:**
  - **description:** Each reading must be >= the previous validated reading; a lower value is treated as a rollback
- **rollback_requires_approval:**
  - **description:** A rollback is automatically flagged and requires fleet manager approval before inclusion in history
- **anomaly_threshold:**
  - **description:** A distance delta greater than the configured maximum_daily_km threshold triggers an anomaly flag
- **date_not_future:**
  - **description:** Reading date cannot be in the future
- **date_progression:**
  - **description:** Reading date must be >= the date of the previous reading for the same vehicle
- **update_master_on_valid:**
  - **description:** The current odometer on the vehicle master is updated only from validated or approved readings
- **rejected_retained_for_audit:**
  - **description:** Rejected readings are retained in history for audit purposes but excluded from calculations

## Outcomes

### Rollback_flagged (Priority: 1)

**Given:**
- `odometer_value` (input) lt `previous_reading`

**Then:**
- **set_field** target: `status` value: `flagged`
- **set_field** target: `anomaly_reason` value: `Odometer rollback detected`
- **notify** — Alert fleet manager of a suspected odometer rollback
- **emit_event** event: `odometer.rollback_detected`

**Result:** Reading is held in flagged status pending fleet manager review

### Anomaly_flagged (Priority: 2)

**Given:**
- odometer_value is >= previous_reading
- distance_delta exceeds the configured maximum_daily_km threshold

**Then:**
- **set_field** target: `status` value: `flagged`
- **set_field** target: `anomaly_reason` value: `Distance delta exceeds maximum daily threshold`
- **notify** — Alert fleet manager of an unusually large odometer jump
- **emit_event** event: `odometer.anomaly_flagged`

**Result:** Reading is flagged for manager review

### Reading_rejected (Priority: 7)

**Given:**
- status is flagged
- fleet manager confirms the reading is erroneous

**Then:**
- **set_field** target: `status` value: `rejected`
- **emit_event** event: `odometer.reading_rejected`

**Result:** Reading is excluded from calculations and marked as rejected in the audit trail

### Correction_approved (Priority: 8)

**Given:**
- status is flagged
- fleet manager reviews and confirms the reading is valid

**Then:**
- **set_field** target: `status` value: `approved`
- **set_field** target: `correction_approved_by` value: `current_user`
- **set_field** target: `vehicle.last_odometer` value: `odometer_value`
- **emit_event** event: `odometer.correction_approved`

**Result:** Approved reading is included in the odometer history and updates the vehicle's last odometer

### Reading_validated (Priority: 10)

**Given:**
- `odometer_value` (input) gte `previous_reading`
- distance_delta is within the configured anomaly threshold
- reading_date is not in the future

**Then:**
- **set_field** target: `distance_delta` — Compute odometer_value minus previous_reading
- **set_field** target: `is_validated` value: `true`
- **set_field** target: `status` value: `validated`
- **set_field** target: `vehicle.last_odometer` value: `odometer_value`
- **emit_event** event: `odometer.reading_validated`

**Result:** Reading is accepted, vehicle last odometer is updated, odometer-based maintenance schedules are re-evaluated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ODOMETER_ROLLBACK` | 400 | This odometer reading is lower than the previous validated reading. Please verify and resubmit, or contact the fleet manager. | No |
| `ODOMETER_FUTURE_DATE` | 400 | Odometer reading date cannot be in the future. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `odometer.reading_validated` | An odometer reading passed validation and has been added to the vehicle history | `vehicle`, `reading_date`, `odometer_value`, `distance_delta`, `reading_source` |
| `odometer.rollback_detected` | A submitted reading is lower than the last validated odometer value | `vehicle`, `reading_date`, `odometer_value`, `previous_reading` |
| `odometer.anomaly_flagged` | An odometer jump exceeds the maximum daily threshold | `vehicle`, `reading_date`, `odometer_value`, `distance_delta`, `threshold` |
| `odometer.correction_approved` | A fleet manager approved a flagged odometer reading | `vehicle`, `odometer_value`, `correction_approved_by` |
| `odometer.reading_rejected` | A fleet manager rejected an erroneous odometer reading | `vehicle`, `reading_date`, `odometer_value`, `rejected_by` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-master-data | required | Vehicle master stores the last validated odometer which anchors each new reading |
| fuel-log | recommended | Fuel log entries submit odometer readings that are validated by this feature |
| scheduled-maintenance | recommended | Validated odometer readings trigger re-evaluation of odometer-based maintenance schedules |
| vehicle-maintenance-log | recommended | Service records include odometer readings that feed into this validation history |

## AGI Readiness

### Goals

#### Reliable Odometer Tracking

Maintain a complete, validated history of odometer readings for each vehicle, detecting rollbacks and anomalous jumps, with an approval workflow for corrections.

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
| `vehicle_master_data` | vehicle-master-data | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| reading_validated | `autonomous` | - | - |
| rollback_flagged | `autonomous` | - | - |
| anomaly_flagged | `autonomous` | - | - |
| correction_approved | `supervised` | - | - |
| reading_rejected | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 2
  entry_points:
    - erpnext/setup/doctype/vehicle/vehicle.py
    - erpnext/setup/doctype/vehicle/vehicle.json
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Odometer Tracking Workflow Blueprint",
  "description": "Maintain a complete, validated history of odometer readings for each vehicle, detecting rollbacks and anomalous jumps, with an approval workflow for corrections",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, odometer, history, validation, mileage"
}
</script>
