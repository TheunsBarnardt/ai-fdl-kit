---
title: "Vehicle Depreciation Blueprint"
layout: default
parent: "Asset"
grand_parent: Blueprint Catalog
description: "Calculate and record periodic depreciation for fleet vehicles using configurable methods, track book value over time, and generate depreciation schedules per fi"
---

# Vehicle Depreciation Blueprint

> Calculate and record periodic depreciation for fleet vehicles using configurable methods, track book value over time, and generate depreciation schedules per finance book.

| | |
|---|---|
| **Feature** | `vehicle-depreciation` |
| **Category** | Asset |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, depreciation, finance, accounting, book-value |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/asset/vehicle-depreciation.blueprint.yaml) |
| **JSON API** | [vehicle-depreciation.json]({{ site.baseurl }}/api/blueprints/asset/vehicle-depreciation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `finance_manager` | Finance Manager | human | Configures depreciation parameters, approves schedules, and posts depreciation entries |
| `fleet_manager` | Fleet Manager | human | Provides acquisition cost and useful life estimates |
| `system` | System | system | Calculates depreciation schedules and runs periodic posting jobs |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `acquisition_cost` | number | Yes | Acquisition Cost |  |
| `additional_costs` | number | No | Additional Capitalised Costs |  |
| `salvage_value` | number | Yes | Salvage / Residual Value |  |
| `useful_life_years` | number | Yes | Useful Life (years) |  |
| `depreciation_method` | select | Yes | Depreciation Method |  |
| `depreciation_frequency_months` | number | Yes | Depreciation Frequency (months) |  |
| `depreciation_start_date` | date | Yes | Depreciation Start Date |  |
| `opening_accumulated_depreciation` | number | No | Opening Accumulated Depreciation |  |
| `current_book_value` | number | No | Current Book Value |  |
| `accumulated_depreciation` | number | No | Accumulated Depreciation |  |
| `rate_of_depreciation` | number | No | Depreciation Rate (%) |  |
| `daily_prorata` | boolean | No | Daily Pro-Rata |  |
| `is_fully_depreciated` | boolean | No | Fully Depreciated |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `active` |  |  |
| `partially_depreciated` |  |  |
| `fully_depreciated` |  | Yes |
| `disposed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `active` | finance_manager |  |
|  | `active` | `partially_depreciated` | system |  |
|  | `partially_depreciated` | `fully_depreciated` | system |  |
|  | `active` | `disposed` | finance_manager |  |
|  | `partially_depreciated` | `disposed` | finance_manager |  |

## Rules

- **salvage_less_than_cost:**
  - **description:** Salvage value must be less than acquisition cost
- **useful_life_positive:**
  - **description:** Useful life in years must be a positive number greater than zero
- **start_date_after_acquisition:**
  - **description:** Depreciation start date must not precede the acquisition date
- **book_value_floor:**
  - **description:** Book value cannot fall below salvage value — depreciation stops when book value equals salvage value
- **straight_line_formula:**
  - **description:** Straight Line: periodic amount = (acquisition_cost - salvage_value) / total_periods
- **wdv_formula:**
  - **description:** Written Down Value: periodic amount = current_book_value × (rate_of_depreciation / periods_per_year)
- **ddb_formula:**
  - **description:** Double Declining Balance: rate = 2 / useful_life_years; amount = current_book_value × rate; floor at salvage value
- **manual_method:**
  - **description:** Manual method: amounts are entered directly per period by the finance manager
- **capitalised_repair_recalculation:**
  - **description:** When a repair capitalises additional cost, the depreciation base increases and the schedule is recalculated
- **disposal_reversal:**
  - **description:** Depreciation postings for periods beyond the disposal date are reversed on disposal
- **opening_depreciation_reduction:**
  - **description:** Opening accumulated depreciation reduces the net depreciable amount

## Outcomes

### Invalid_salvage_value (Priority: 1) — Error: `DEPRECIATION_INVALID_SALVAGE`

**Given:**
- `salvage_value` (input) gte `acquisition_cost`

**Result:** Schedule generation is rejected; user must provide a salvage value less than acquisition cost

### Schedule_recalculated_after_repair (Priority: 6)

**Given:**
- a capitalised repair has increased the vehicle's asset base
- repair increases useful life (months extension provided)

**Then:**
- **set_field** target: `acquisition_cost` — Increase by capitalised repair cost
- **set_field** target: `current_book_value` — Increase by capitalised repair cost
- **emit_event** event: `depreciation.schedule_recalculated`

**Result:** Depreciation schedule is recalculated from the current book value over the revised remaining life

### Disposal_entries_posted (Priority: 7)

**Given:**
- vehicle is being disposed of (sold or scrapped)
- disposal date and method are provided

**Then:**
- **set_field** target: `status` value: `disposed`
- **emit_event** event: `depreciation.disposal_posted`

**Result:** Final disposal accounting entries are posted; gain or loss on disposal is computed

### Fully_depreciated (Priority: 8)

**Given:**
- current_book_value equals or is less than salvage_value after the latest posting

**Then:**
- **set_field** target: `is_fully_depreciated` value: `true`
- **set_field** target: `status` value: `fully_depreciated`
- **emit_event** event: `depreciation.fully_depreciated`

**Result:** Vehicle is flagged as fully depreciated; no further periodic postings are made

### Depreciation_posted (Priority: 9)

**Given:**
- status is active or partially_depreciated
- current period posting date has been reached
- current_book_value is greater than salvage_value

**Then:**
- **set_field** target: `accumulated_depreciation` — Increment by period_amount
- **set_field** target: `current_book_value` — Reduce by period_amount; floor at salvage_value
- **set_field** target: `status` value: `partially_depreciated`
- **emit_event** event: `depreciation.period_posted`

**Result:** Periodic depreciation amount is posted and book value is updated

### Schedule_generated (Priority: 10)

**Given:**
- vehicle exists in the fleet
- acquisition_cost, salvage_value, useful_life_years, and depreciation_method are provided
- depreciation_start_date is valid
- `salvage_value` (input) lt `acquisition_cost`

**Then:**
- **set_field** target: `status` value: `active`
- **set_field** target: `current_book_value` — Compute acquisition_cost + additional_costs - opening_accumulated_depreciation
- **emit_event** event: `depreciation.schedule_generated`

**Result:** A full depreciation schedule is generated showing the amount and date for each posting period

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEPRECIATION_INVALID_SALVAGE` | 400 | Salvage value must be less than the acquisition cost. | No |
| `DEPRECIATION_INVALID_START_DATE` | 400 | Depreciation start date cannot be before the vehicle's acquisition date. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `depreciation.schedule_generated` | A full depreciation schedule has been computed for a vehicle | `vehicle`, `depreciation_method`, `total_periods`, `period_amount`, `depreciation_start_date` |
| `depreciation.period_posted` | A periodic depreciation amount has been posted for a vehicle | `vehicle`, `posting_date`, `period_amount`, `accumulated_depreciation`, `current_book_value` |
| `depreciation.fully_depreciated` | A vehicle's book value has reached its salvage value | `vehicle`, `depreciation_date`, `salvage_value`, `total_depreciation_posted` |
| `depreciation.disposal_posted` | Final accounting entries for vehicle disposal have been posted | `vehicle`, `disposal_date`, `current_book_value`, `disposal_proceeds`, `gain_or_loss` |
| `depreciation.schedule_recalculated` | The depreciation schedule was revised following a capitalised repair or useful-life extension | `vehicle`, `new_book_value`, `new_total_periods`, `capitalised_repair_amount` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-master-data | required | Acquisition cost and date from the vehicle master seed the depreciation calculation |
| vehicle-disposal | required | Disposal workflow triggers the final depreciation entries and gain/loss calculation |
| vehicle-expense-tracking | recommended | Periodic depreciation amounts can be posted as expense records for management reporting |
| vehicle-maintenance-log | optional | Capitalised repairs from the maintenance log can increase the depreciable base and trigger schedule recalculation |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 5
  entry_points:
    - erpnext/assets/doctype/asset/asset.py
    - erpnext/assets/doctype/asset/depreciation.py
    - erpnext/assets/doctype/asset_depreciation_schedule/asset_depreciation_schedule.py
    - erpnext/assets/doctype/asset_finance_book/asset_finance_book.py
    - erpnext/assets/doctype/asset_value_adjustment/asset_value_adjustment.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Depreciation Blueprint",
  "description": "Calculate and record periodic depreciation for fleet vehicles using configurable methods, track book value over time, and generate depreciation schedules per fi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, depreciation, finance, accounting, book-value"
}
</script>
