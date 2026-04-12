---
title: "Vehicle Disposal Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Manage end-of-life decommissioning of fleet vehicles through inspection, management approval, method selection (sale, auction, scrap, trade-in), disposal value "
---

# Vehicle Disposal Blueprint

> Manage end-of-life decommissioning of fleet vehicles through inspection, management approval, method selection (sale, auction, scrap, trade-in), disposal value recording, and final asset closure.

| | |
|---|---|
| **Feature** | `vehicle-disposal` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, disposal, decommissioning, scrap, sale, finance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/vehicle-disposal.blueprint.yaml) |
| **JSON API** | [vehicle-disposal.json]({{ site.baseurl }}/api/blueprints/workflow/vehicle-disposal.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Initiates disposal, records inspection findings, and selects disposal method |
| `finance_manager` | Finance Manager | human | Reviews book value, approves disposal, and confirms accounting entries |
| `operations_manager` | Operations Manager | human | Approves decommissioning decisions for vehicles in active operational use |
| `system` | System | system | Calculates gain/loss on disposal and posts final accounting entries |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `vehicle` | text | Yes | Vehicle |  |
| `disposal_reason` | select | Yes | Disposal Reason |  |
| `current_book_value` | number | No | Current Book Value |  |
| `disposal_method` | select | Yes | Disposal Method |  |
| `disposal_date` | date | Yes | Disposal Date |  |
| `disposal_value` | number | No | Agreed Disposal Value |  |
| `proceeds_received` | number | No | Proceeds Received |  |
| `buyer_details` | text | No | Buyer / Recipient Details |  |
| `inspection_date` | date | No | Inspection Date |  |
| `inspection_findings` | rich_text | No | Inspection Findings |  |
| `approved_by` | text | No | Approved By |  |
| `approval_date` | date | No | Approval Date |  |
| `gain_or_loss` | number | No | Gain / (Loss) on Disposal |  |
| `notes` | text | No | Notes |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `initiated` | Yes |  |
| `inspection_done` |  |  |
| `pending_approval` |  |  |
| `approved` |  |  |
| `disposed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `initiated` | `inspection_done` | fleet_manager |  |
|  | `inspection_done` | `pending_approval` | fleet_manager |  |
|  | `pending_approval` | `approved` | finance_manager |  |
|  | `approved` | `disposed` | fleet_manager |  |
|  | `any` | `cancelled` | operations_manager |  |

## Rules

- **disposal_date_recency:**
  - **description:** Disposal date cannot be in the past more than 90 days without a documented reason
- **approval_required:**
  - **description:** Finance manager approval is required before executing any disposal
- **sale_requires_buyer:**
  - **description:** For sale or auction, disposal_value must be provided and buyer_details are required
- **gain_loss_computation:**
  - **description:** Gain or loss is computed as disposal_value minus current_book_value; negative result is a loss
- **auto_end_assignments:**
  - **description:** When the vehicle is disposed, all active driver assignments are automatically ended
- **cancel_maintenance_schedules:**
  - **description:** All active scheduled maintenance tasks for the vehicle are cancelled on disposal
- **flag_insurance_for_cancellation:**
  - **description:** Insurance policies for the vehicle are flagged for cancellation on disposal
- **disposal_records_permanent:**
  - **description:** Disposal records are permanent and cannot be deleted once the status reaches disposed

## Outcomes

### Disposal_cancelled (Priority: 5)

**Given:**
- status is initiated, inspection_done, pending_approval, or approved
- cancellation reason is provided

**Then:**
- **set_field** target: `status` value: `cancelled`
- **emit_event** event: `disposal.cancelled`

**Result:** Disposal is abandoned; vehicle remains in active fleet

### Vehicle_scrapped (Priority: 6)

**Given:**
- status is approved
- disposal_method is scrap

**Then:**
- **set_field** target: `gain_or_loss` — Negative of current_book_value since no proceeds
- **set_field** target: `status` value: `disposed`
- **set_field** target: `vehicle.status` value: `decommissioned`
- **emit_event** event: `disposal.scrapped`

**Result:** Vehicle is scrapped; full book value is written off as a loss

### Vehicle_disposed (Priority: 7)

**Given:**
- status is approved
- disposal_date is provided
- disposal method is sale or auction and proceeds_received is provided

**Then:**
- **set_field** target: `gain_or_loss` — Compute disposal_value minus current_book_value
- **set_field** target: `status` value: `disposed`
- **set_field** target: `vehicle.status` value: `decommissioned` — Update vehicle master status to decommissioned
- **emit_event** event: `disposal.completed`

**Result:** Vehicle is formally removed from the active fleet; gain or loss on disposal is recorded; final accounting entries are posted

### Disposal_approved (Priority: 8)

**Given:**
- status is pending_approval
- finance manager or operations manager authorises disposal

**Then:**
- **set_field** target: `approved_by` value: `current_user`
- **set_field** target: `approval_date` value: `today`
- **set_field** target: `status` value: `approved`
- **emit_event** event: `disposal.approved`

**Result:** Disposal is authorised and the vehicle can be physically transferred

### Inspection_recorded (Priority: 9)

**Given:**
- status is initiated
- inspection_date and inspection_findings are provided

**Then:**
- **set_field** target: `status` value: `inspection_done`
- **emit_event** event: `disposal.inspection_recorded`

**Result:** Inspection findings are recorded; disposal package can be submitted for approval

### Disposal_initiated (Priority: 10)

**Given:**
- vehicle exists and is in active or decommissioned status
- disposal_reason is provided

**Then:**
- **set_field** target: `status` value: `initiated`
- **notify** — Notify fleet manager and finance manager that disposal has been initiated
- **emit_event** event: `disposal.initiated`

**Result:** Disposal workflow is started; vehicle is flagged for decommissioning review

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DISPOSAL_APPROVAL_REQUIRED` | 422 | Disposal requires approval from a finance or operations manager before it can be executed. | No |
| `DISPOSAL_MISSING_BUYER` | 422 | Buyer details are required for sale or auction disposal. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `disposal.initiated` | A fleet vehicle has been submitted for decommissioning review | `vehicle`, `disposal_reason`, `initiated_by` |
| `disposal.inspection_recorded` | Pre-disposal vehicle condition inspection has been completed | `vehicle`, `inspection_date`, `inspection_findings`, `current_book_value` |
| `disposal.approved` | A vehicle disposal has been authorised by management | `vehicle`, `approved_by`, `disposal_method`, `disposal_value` |
| `disposal.completed` | A fleet vehicle has been formally disposed of and removed from the active fleet | `vehicle`, `disposal_date`, `disposal_method`, `proceeds_received`, `gain_or_loss` |
| `disposal.scrapped` | A fleet vehicle has been scrapped with no proceeds | `vehicle`, `disposal_date`, `current_book_value`, `gain_or_loss` |
| `disposal.cancelled` | A vehicle disposal process was abandoned and the vehicle retained | `vehicle`, `cancelled_by`, `cancellation_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-depreciation | required | Current book value at disposal is sourced from the depreciation record; final disposal entries are posted |
| vehicle-master-data | required | Vehicle master status is set to decommissioned when disposal is complete |
| vehicle-insurance | recommended | Active insurance policies are flagged for cancellation when a vehicle is disposed |
| driver-vehicle-assignment | recommended | Active driver assignments are automatically ended when the vehicle is disposed |

## AGI Readiness

### Goals

#### Reliable Vehicle Disposal

Manage end-of-life decommissioning of fleet vehicles through inspection, management approval, method selection (sale, auction, scrap, trade-in), disposal value recording, and final asset closure.

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
| `vehicle_depreciation` | vehicle-depreciation | degrade |
| `vehicle_master_data` | vehicle-master-data | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| disposal_initiated | `autonomous` | - | - |
| inspection_recorded | `autonomous` | - | - |
| disposal_approved | `supervised` | - | - |
| vehicle_disposed | `autonomous` | - | - |
| vehicle_scrapped | `autonomous` | - | - |
| disposal_cancelled | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERPNext
  tech_stack: Python + Frappe Framework
  files_traced: 3
  entry_points:
    - erpnext/assets/doctype/asset/asset.py
    - erpnext/assets/doctype/asset/depreciation.py
    - erpnext/assets/doctype/asset_activity/asset_activity.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Vehicle Disposal Blueprint",
  "description": "Manage end-of-life decommissioning of fleet vehicles through inspection, management approval, method selection (sale, auction, scrap, trade-in), disposal value ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, disposal, decommissioning, scrap, sale, finance"
}
</script>
