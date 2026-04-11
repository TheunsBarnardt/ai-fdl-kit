---
title: "Quality Inspection Blueprint"
layout: default
parent: "Quality"
grand_parent: Blueprint Catalog
description: "Quality inspection for incoming, outgoing, and in-process materials with numeric range checks, formula-based acceptance criteria, and template-driven reading pa"
---

# Quality Inspection Blueprint

> Quality inspection for incoming, outgoing, and in-process materials with numeric range checks, formula-based acceptance criteria, and template-driven reading parameters.


| | |
|---|---|
| **Feature** | `quality-inspection` |
| **Category** | Quality |
| **Version** | 1.0.0 |
| **Tags** | quality-inspection, incoming-inspection, outgoing-inspection, quality-control, acceptance-criteria, manufacturing |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/quality/quality-inspection.blueprint.yaml) |
| **JSON API** | [quality-inspection.json]({{ site.baseurl }}/api/blueprints/quality/quality-inspection.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `inspection_type` | select | Yes | Inspection Type |  |
| `reference_type` | select | No | Reference Document Type |  |
| `reference_name` | text | No | Reference Document Name |  |
| `item_code` | text | Yes | Item Code |  |
| `sample_size` | number | No | Sample Size | Validations: min |
| `status` | select | Yes | Inspection Status |  |
| `inspected_by` | text | No | Inspected By |  |
| `report_date` | date | Yes | Report Date |  |
| `readings` | json | Yes | Inspection Readings |  |
| `quality_inspection_template` | text | No | Inspection Template |  |
| `manual_inspection` | boolean | No | Manual Inspection |  |
| `batch_no` | text | No | Batch Number |  |

## Rules

- **template_auto_populate:**
  - **description:** When a quality inspection template is selected, reading parameters (specification, min_value, max_value, formula) are auto-populated from the template.

- **numeric_range_check:**
  - **description:** Numeric readings are evaluated against min_value and max_value. A reading within the range (inclusive) is Accepted; outside is Rejected.

- **non_numeric_exact_match:**
  - **description:** Non-numeric readings are evaluated as exact value matches against the expected specification value.

- **formula_based_criteria:**
  - **description:** Formula-based acceptance criteria are supported, allowing complex expressions to determine acceptance status.

- **all_readings_required:**
  - **description:** All readings must have a status (Accepted/Rejected) before the inspection can be submitted.

- **overall_status_from_readings:**
  - **description:** Overall inspection status is set to Rejected if any individual reading is Rejected. All readings must be Accepted for overall Accepted status.

- **source_document_link:**
  - **description:** Inspection links back to the source document (Purchase Receipt, Delivery Note, Stock Entry, or Job Card) for traceability.

- **inspection_required_flag:**
  - **description:** Items must have the inspection_required flag enabled in their master data for inspections to be created.

- **stock_settings_on_failure:**
  - **description:** Stock settings control the action on inspection failure: Warn (allow with warning), Stop (block), or Ignore.


## Outcomes

### Create_inspection (Priority: 10) — Error: `QI_INSPECTION_NOT_REQUIRED`

**Given:**
- item_code and inspection_type are provided
- item has inspection_required flag enabled

**Then:**
- **create_record** target: `quality_inspection` — Quality inspection record created
- **emit_event** event: `inspection.created`

**Result:** Quality inspection created and ready for readings

### Populate_from_template (Priority: 11) — Error: `QI_TEMPLATE_NOT_FOUND`

**Given:**
- quality_inspection_template is provided and exists

**Then:**
- **set_field** target: `readings` — Reading parameters populated from template

**Result:** Inspection readings pre-populated from template specifications

### Evaluate_readings (Priority: 12) — Error: `QI_FORMULA_INVALID`

**Given:**
- all readings have reading_value entered

**Then:**
- **set_field** target: `readings` — Each reading status set based on acceptance criteria

**Result:** All readings evaluated against acceptance criteria

### Accept_inspection (Priority: 13)

**Given:**
- all readings have status Accepted
- `status` (db) neq `Cancelled`

**Then:**
- **set_field** target: `status` value: `Accepted`
- **emit_event** event: `inspection.accepted`

**Result:** Inspection accepted, material cleared for use

### Reject_inspection (Priority: 14)

**Given:**
- one or more readings have status Rejected

**Then:**
- **set_field** target: `status` value: `Rejected`
- **emit_event** event: `inspection.rejected`

**Result:** Inspection rejected, material flagged per stock settings

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `QI_READING_STATUS_MISSING` | 400 | All readings must have an Accepted or Rejected status before submission. | No |
| `QI_FORMULA_INVALID` | 400 | The acceptance formula for one or more readings is invalid. | No |
| `QI_INSPECTION_NOT_REQUIRED` | 400 | Quality inspection is not required for this item. | No |
| `QI_TEMPLATE_NOT_FOUND` | 404 | The specified quality inspection template does not exist. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `inspection.created` | Fired when a quality inspection is created | `item_code`, `inspection_type`, `reference_type`, `reference_name` |
| `inspection.accepted` | Fired when an inspection passes all readings | `item_code`, `inspection_type`, `reference_name` |
| `inspection.rejected` | Fired when an inspection has rejected readings | `item_code`, `inspection_type`, `reference_name`, `rejected_readings` |
| `inspection.cancelled` | Fired when an inspection is cancelled | `item_code`, `inspection_type`, `reference_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| stock-entry-movements | recommended | Inspections linked to stock entries for in-process checks |
| pick-list-shipping | recommended | Outgoing inspections linked to delivery notes |
| work-orders-job-cards | optional | In-process inspections linked to job cards |

## AGI Readiness

### Goals

#### Reliable Quality Inspection

Quality inspection for incoming, outgoing, and in-process materials with numeric range checks, formula-based acceptance criteria, and template-driven reading parameters.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| thoroughness | speed | quality checks must be comprehensive to catch defects early |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_inspection | `supervised` | - | - |
| populate_from_template | `autonomous` | - | - |
| evaluate_readings | `autonomous` | - | - |
| accept_inspection | `autonomous` | - | - |
| reject_inspection | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Quality Inspection Blueprint",
  "description": "Quality inspection for incoming, outgoing, and in-process materials with numeric range checks, formula-based acceptance criteria, and template-driven reading pa",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "quality-inspection, incoming-inspection, outgoing-inspection, quality-control, acceptance-criteria, manufacturing"
}
</script>
