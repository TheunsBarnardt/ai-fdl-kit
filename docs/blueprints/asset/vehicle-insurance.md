---
title: "Vehicle Insurance Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Track insurance policies for fleet vehicles including coverage type, premium, excess, validity dates, and renewal lifecycle.. 13 fields. 5 outcomes. 3 error cod"
---

# Vehicle Insurance Blueprint

> Track insurance policies for fleet vehicles including coverage type, premium, excess, validity dates, and renewal lifecycle.

| | |
|---|---|
| **Feature** | `vehicle-insurance` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, insurance, compliance, policy |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/vehicle-insurance.blueprint.yaml) |
| **JSON API** | [vehicle-insurance.json]({{ site.baseurl }}/api/blueprints/asset/vehicle-insurance.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Manages insurance policy records for fleet vehicles |
| `finance_manager` | Finance Manager | human | Approves premium payments and reviews coverage adequacy |
| `system` | System | system | Monitors policy expiry dates and triggers renewal reminders |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `insurance_provider` | text | Yes | Insurance Provider |  |
| `policy_number` | text | Yes | Policy Number |  |
| `policy_type` | select | Yes | Policy Type |  |
| `coverage_type` | text | No | Coverage Type |  |
| `insured_value` | number | No | Insured Value |  |
| `premium_amount` | number | No | Annual Premium |  |
| `excess_amount` | number | No | Excess / Deductible |  |
| `start_date` | date | Yes | Policy Start Date |  |
| `end_date` | date | Yes | Policy End Date |  |
| `renewal_reminder_days` | number | No | Renewal Reminder (days before expiry) |  |
| `notes` | text | No | Notes |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `expiring_soon` |  |  |
| `expired` |  |  |
| `cancelled` |  | Yes |
| `renewed` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `expiring_soon` | system |  |
|  | `expiring_soon` | `renewed` | fleet_manager |  |
|  | `expiring_soon` | `expired` | system |  |
|  | `active` | `cancelled` | fleet_manager |  |
|  | `expired` | `active` | fleet_manager |  |

## Rules

- **end_date_after_start_date:**
  - **description:** Policy end date must be after policy start date
- **unique_policy_number:**
  - **description:** Policy number must be unique per insurance provider
- **no_dispatch_uninsured:**
  - **description:** A vehicle should not be dispatched while its insurance status is Expired or Cancelled
- **positive_monetary_values:**
  - **description:** Premium amount and insured value must be positive values if provided
- **excess_not_exceeds_insured:**
  - **description:** Excess amount must not exceed the insured value
- **one_active_policy_per_type:**
  - **description:** Only one active policy of each type should exist per vehicle at a time

## Outcomes

### Policy_end_date_invalid (Priority: 1) — Error: `INSURANCE_INVALID_DATE_RANGE`

**Given:**
- `end_date` (input) lte `start_date`

**Result:** Policy record is rejected with a date validation error

### Policy_cancelled (Priority: 7)

**Given:**
- fleet manager initiates cancellation
- policy is in active or expiring_soon status

**Then:**
- **set_field** target: `status` value: `cancelled`
- **emit_event** event: `vehicle.insurance_cancelled`

**Result:** Policy is marked cancelled and a compliance warning is raised for the vehicle

### Policy_renewed (Priority: 8)

**Given:**
- vehicle has an expiring or expired policy
- new policy details are provided with a valid future end date

**Then:**
- **set_field** target: `status` value: `renewed` — Mark old policy as renewed
- **create_record** — Create new active policy record with updated dates and details
- **emit_event** event: `vehicle.insurance_renewed`

**Result:** Old policy is marked renewed and a new active policy record exists

### Expiry_reminder_triggered (Priority: 9)

**Given:**
- days until end_date is less than or equal to renewal_reminder_days
- policy is in active status

**Then:**
- **set_field** target: `status` value: `expiring_soon`
- **notify** — Send renewal reminder to fleet manager and assigned driver
- **emit_event** event: `vehicle.insurance_expiring`

**Result:** Policy transitions to expiring_soon and a reminder notification is sent

### Policy_activated (Priority: 10)

**Given:**
- vehicle exists in the fleet
- policy number is unique for this provider
- end_date is after start_date

**Then:**
- **set_field** target: `status` value: `active`
- **emit_event** event: `vehicle.insurance_activated`

**Result:** Insurance policy is recorded and the vehicle shows as insured

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INSURANCE_INVALID_DATE_RANGE` | 400 | Policy end date must be after the policy start date. | No |
| `INSURANCE_DUPLICATE_POLICY` | 409 | A policy with this number already exists for this provider. | No |
| `INSURANCE_VEHICLE_UNINSURED` | 422 | Vehicle cannot be dispatched — no active insurance policy on record. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `vehicle.insurance_activated` | A new insurance policy has been recorded for the vehicle | `vehicle`, `policy_number`, `insurance_provider`, `start_date`, `end_date` |
| `vehicle.insurance_expiring` | An insurance policy is within the renewal reminder window | `vehicle`, `policy_number`, `end_date`, `days_remaining` |
| `vehicle.insurance_renewed` | An insurance policy has been renewed with a new effective period | `vehicle`, `old_policy_number`, `new_policy_number`, `new_end_date` |
| `vehicle.insurance_cancelled` | An insurance policy has been cancelled before its expiry date | `vehicle`, `policy_number`, `cancellation_reason` |
| `vehicle.insurance_expired` | An insurance policy lapsed without renewal | `vehicle`, `policy_number`, `end_date` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-registration | required | Insurance is tied to a registered vehicle |
| vehicle-renewal-reminders | recommended | Centralised reminder system can manage insurance renewal alongside other document renewals |
| vehicle-documents | recommended | Policy documents and certificates of insurance are stored in the document management feature |

## AGI Readiness

### Goals

#### Reliable Vehicle Insurance

Track insurance policies for fleet vehicles including coverage type, premium, excess, validity dates, and renewal lifecycle.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | convenience | asset tracking must maintain precise location and status records |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `vehicle_registration` | vehicle-registration | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| policy_activated | `autonomous` | - | - |
| policy_end_date_invalid | `autonomous` | - | - |
| policy_renewed | `autonomous` | - | - |
| policy_cancelled | `supervised` | - | - |
| expiry_reminder_triggered | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 3
  entry_points:
    - erpnext/setup/doctype/vehicle/vehicle.py
    - erpnext/setup/doctype/vehicle/vehicle.json
    - erpnext/assets/doctype/asset/asset.json
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Insurance Blueprint",
  "description": "Track insurance policies for fleet vehicles including coverage type, premium, excess, validity dates, and renewal lifecycle.. 13 fields. 5 outcomes. 3 error cod",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, insurance, compliance, policy"
}
</script>
