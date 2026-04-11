---
title: "Tyre Lifecycle Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Track tyre fitment, rotation, tread depth assessments, and replacement across the fleet with a per-position history and automated low-tread warnings.. 17 fields"
---

# Tyre Lifecycle Blueprint

> Track tyre fitment, rotation, tread depth assessments, and replacement across the fleet with a per-position history and automated low-tread warnings.

| | |
|---|---|
| **Feature** | `tyre-lifecycle` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, tyre, lifecycle, maintenance, safety |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/tyre-lifecycle.blueprint.yaml) |
| **JSON API** | [tyre-lifecycle.json]({{ site.baseurl }}/api/blueprints/workflow/tyre-lifecycle.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Manages tyre procurement, fitment authorisation, and disposal decisions |
| `technician` | Technician | human | Fits, inspects, rotates, and removes tyres; records condition and tread depth |
| `system` | System | system | Monitors tread depth thresholds and km-since-fitted to trigger inspection alerts |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `tyre_position` | select | Yes | Tyre Position |  |
| `brand` | text | No | Brand |  |
| `model` | text | No | Model / Pattern |  |
| `size` | text | No | Size |  |
| `serial_number` | text | No | Serial Number / DOT Code |  |
| `manufacture_year` | number | No | Manufacture Year |  |
| `fitted_date` | date | Yes | Fitted Date |  |
| `fitted_odometer` | number | No | Odometer at Fitment (km) |  |
| `removed_date` | date | No | Removed Date |  |
| `removed_odometer` | number | No | Odometer at Removal (km) |  |
| `km_on_tyre` | number | No | km on Tyre |  |
| `last_tread_depth_mm` | number | No | Last Tread Depth (mm) |  |
| `last_inspection_date` | date | No | Last Inspection Date |  |
| `condition_rating` | select | No | Condition Rating |  |
| `reason_for_removal` | select | No | Reason for Removal |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `in_storage` | Yes |  |
| `fitted` |  |  |
| `inspection_due` |  |  |
| `removed` |  |  |
| `disposed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `in_storage` | `fitted` | technician |  |
|  | `fitted` | `inspection_due` | system |  |
|  | `inspection_due` | `fitted` | technician |  |
|  | `inspection_due` | `removed` | technician |  |
|  | `fitted` | `removed` | technician |  |
|  | `removed` | `in_storage` | technician |  |
|  | `removed` | `disposed` | fleet_manager |  |

## Rules

- **one_tyre_per_position:**
  - **description:** A vehicle position can have at most one tyre in fitted or inspection_due status at a time
- **removal_odometer_progression:**
  - **description:** Removed tyre odometer must be >= fitted odometer
- **km_on_tyre_computation:**
  - **description:** km_on_tyre is computed as removed_odometer minus fitted_odometer when removed
- **legal_minimum_tread:**
  - **description:** A tyre with tread depth below the legal minimum (typically 1.6 mm) must not remain in fitted status
- **warning_threshold:**
  - **description:** A warning is triggered when tread depth falls below a configurable warning threshold (e.g., 3 mm)
- **age_based_replacement:**
  - **description:** Tyres older than a configurable maximum age (e.g., 5 years from manufacture year) should be flagged for replacement regardless of tread depth
- **inspection_requires_date:**
  - **description:** Tread depth measurements must be recorded with a measurement date

## Outcomes

### Position_conflict_rejected (Priority: 1) — Error: `TYRE_POSITION_CONFLICT`

**Given:**
- another tyre is already fitted at the same vehicle position

**Result:** Fitment is rejected until the existing tyre is removed from that position

### Tyre_disposed (Priority: 6)

**Given:**
- status is removed
- disposal decision confirmed by fleet manager

**Then:**
- **set_field** target: `status` value: `disposed`
- **emit_event** event: `tyre.disposed`

**Result:** Tyre is permanently closed out; lifecycle record retained for reporting

### Tyre_removed (Priority: 7)

**Given:**
- status is fitted or inspection_due
- removed_date is provided
- reason_for_removal is provided

**Then:**
- **set_field** target: `removed_date` value: `removed_date`
- **set_field** target: `removed_odometer` value: `current_odometer`
- **set_field** target: `km_on_tyre` — Compute removed_odometer minus fitted_odometer
- **set_field** target: `status` value: `removed`
- **emit_event** event: `tyre.removed`

**Result:** Tyre removal is recorded with distance travelled; position is freed for a new tyre

### Low_tread_warning (Priority: 8)

**Given:**
- status is fitted or inspection_due
- `last_tread_depth_mm` (input) lte `warning_threshold_mm`

**Then:**
- **set_field** target: `status` value: `inspection_due`
- **notify** — Send low tread alert to fleet manager
- **emit_event** event: `tyre.low_tread_warning`

**Result:** Fleet manager is notified that the tyre is approaching the minimum legal tread depth

### Tyre_inspected (Priority: 9)

**Given:**
- status is fitted or inspection_due
- last_tread_depth_mm is provided
- last_inspection_date is provided

**Then:**
- **set_field** target: `last_tread_depth_mm` value: `measured_depth`
- **set_field** target: `last_inspection_date` value: `inspection_date`
- **set_field** target: `condition_rating` — Derive condition from tread depth thresholds
- **emit_event** event: `tyre.inspected`

**Result:** Inspection result is recorded; status transitions if depth is below threshold

### Tyre_fitted (Priority: 10)

**Given:**
- vehicle and position are valid
- no other tyre is currently fitted at the same position
- fitted_date is not in the future

**Then:**
- **set_field** target: `status` value: `fitted`
- **emit_event** event: `tyre.fitted`

**Result:** Tyre is recorded as fitted to the vehicle at the specified position

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TYRE_POSITION_CONFLICT` | 409 | Another tyre is already fitted at this position. Please remove the existing tyre first. | No |
| `TYRE_INVALID_ODOMETER` | 400 | Removal odometer cannot be less than the odometer at fitment. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `tyre.fitted` | A tyre has been mounted on a vehicle at a specific position | `vehicle`, `tyre_position`, `brand`, `model`, `size`, `serial_number`, `fitted_date`, `fitted_odometer` |
| `tyre.inspected` | A tread depth measurement has been recorded for a fitted tyre | `vehicle`, `tyre_position`, `last_tread_depth_mm`, `condition_rating`, `last_inspection_date` |
| `tyre.low_tread_warning` | A tyre's tread depth is at or below the configured warning threshold | `vehicle`, `tyre_position`, `last_tread_depth_mm`, `warning_threshold_mm` |
| `tyre.removed` | A tyre has been dismounted from a vehicle position | `vehicle`, `tyre_position`, `reason_for_removal`, `km_on_tyre`, `removed_date` |
| `tyre.disposed` | A removed tyre has been permanently scrapped or recycled | `vehicle`, `tyre_position`, `serial_number`, `km_on_tyre` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-master-data | required | Vehicle master provides current odometer for km-on-tyre calculations |
| odometer-tracking | recommended | Validated odometer readings feed into km-on-tyre calculations and age-based alerts |
| vehicle-maintenance-log | recommended | Tyre changes are typically recorded as service events in the maintenance log |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 1
  entry_points:
    - erpnext/setup/doctype/vehicle/vehicle.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Tyre Lifecycle Blueprint",
  "description": "Track tyre fitment, rotation, tread depth assessments, and replacement across the fleet with a per-position history and automated low-tread warnings.. 17 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, tyre, lifecycle, maintenance, safety"
}
</script>
