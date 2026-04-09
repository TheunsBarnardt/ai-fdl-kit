---
title: "Work Orders Job Cards Blueprint"
layout: default
parent: "Manufacturing"
grand_parent: Blueprint Catalog
description: "Work order execution and job card tracking for manufacturing operations, including material transfers, time logging, sequential operation control, and productio"
---

# Work Orders Job Cards Blueprint

> Work order execution and job card tracking for manufacturing operations, including material transfers, time logging, sequential operation control, and production completion.


| | |
|---|---|
| **Feature** | `work-orders-job-cards` |
| **Category** | Manufacturing |
| **Version** | 1.0.0 |
| **Tags** | work-order, job-card, production, manufacturing, shop-floor, time-tracking |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/manufacturing/work-orders-job-cards.blueprint.yaml) |
| **JSON API** | [work-orders-job-cards.json]({{ site.baseurl }}/api/blueprints/manufacturing/work-orders-job-cards.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `production_item` | text | Yes | Item to Manufacture | Validations: required |
| `bom_no` | text | Yes | BOM Number | Validations: required |
| `qty` | number | Yes | Quantity to Manufacture | Validations: min |
| `wo_status` | select | Yes | Work Order Status |  |
| `planned_start_date` | datetime | Yes | Planned Start Date |  |
| `actual_start_date` | datetime | No | Actual Start Date |  |
| `actual_end_date` | datetime | No | Actual End Date |  |
| `required_items` | json | No | Required Items |  |
| `wo_operations` | json | No | Work Order Operations |  |
| `source_warehouse` | text | Yes | Source Warehouse |  |
| `fg_warehouse` | text | Yes | Finished Goods Warehouse |  |
| `wip_warehouse` | text | Yes | Work-in-Progress Warehouse |  |
| `produced_qty` | number | No | Produced Quantity |  |
| `material_transferred_for_manufacturing` | number | No | Material Transferred |  |
| `skip_transfer` | boolean | No | Skip Material Transfer |  |
| `reserve_stock` | boolean | No | Reserve Stock |  |
| `use_multi_level_bom` | boolean | No | Use Multi-Level BOM |  |
| `planned_operating_cost` | number | No | Planned Operating Cost |  |
| `actual_operating_cost` | number | No | Actual Operating Cost |  |
| `work_order` | text | Yes | Work Order Reference |  |
| `operation` | text | Yes | Operation |  |
| `for_quantity` | number | Yes | For Quantity | Validations: min |
| `jc_status` | select | Yes | Job Card Status |  |
| `time_logs` | json | No | Time Logs |  |
| `manufactured_qty` | number | No | Manufactured Quantity |  |
| `workstation` | text | Yes | Workstation |  |
| `hour_rate` | number | No | Hour Rate |  |
| `total_time_in_mins` | number | No | Total Time (Minutes) |  |
| `jc_items` | json | No | Consumed Materials |  |

## States

**State field:** `wo_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `not_started` |  |  |
| `in_process` |  |  |
| `completed` |  | Yes |
| `stopped` |  |  |
| `closed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `not_started` | production_manager | BOM must be submitted and active |
|  | `not_started` | `in_process` | shop_floor_operator |  |
|  | `in_process` | `completed` | system | produced_qty equals qty |
|  | `in_process` | `stopped` | production_manager |  |
|  | `stopped` | `in_process` | production_manager |  |
|  | `in_process` | `closed` | production_manager |  |
|  | `not_started` | `cancelled` | production_manager |  |

## Rules

- **bom_must_be_active:**
  - **description:** Work order can only be submitted if the referenced BOM is in submitted status and marked as active. Draft or cancelled BOMs are rejected.

- **overproduction_limit:**
  - **description:** Produced quantity cannot exceed the ordered quantity plus the configured overproduction tolerance percentage. Excess production is rejected.

- **job_cards_auto_created:**
  - **description:** When a work order with operations is submitted, job cards are automatically created for each operation defined in the BOM.

- **time_log_no_overlap:**
  - **description:** Time logs on the same workstation cannot overlap. The system validates from_time and to_time against existing logs for the workstation.

- **sequential_operations:**
  - **description:** When operations are marked as sequential, each operation's job card can only start after the previous operation's job card is completed.

- **material_transfer_required:**
  - **description:** Raw materials must be transferred from source warehouse to WIP warehouse before manufacturing can begin, unless skip_transfer is enabled on the work order.

- **quality_inspection_required:**
  - **description:** If the BOM specifies inspection_required, a quality inspection record must be created and approved before the work order can be completed.

- **no_cancel_with_production:**
  - **description:** A work order with produced_qty greater than zero cannot be cancelled. It must be stopped or closed instead.


## Outcomes

### Create_work_order (Priority: 1)

**Given:**
- user provides production item, BOM, quantity, and warehouse details

**Then:**
- **create_record** — Create work order in draft status
- **set_field** target: `wo_status` value: `draft`
- **set_field** target: `required_items` — Populate required items from BOM materials

**Result:** Work order is created in draft with materials populated from BOM

### Submit_work_order (Priority: 2) — Error: `WO_BOM_INVALID`

**Given:**
- `wo_status` (db) eq `draft`
- `bom_no` (db) exists
- referenced BOM is submitted and active

**Then:**
- **transition_state** field: `wo_status` from: `draft` to: `not_started`
- **create_record** — Auto-create job cards for each BOM operation
- **emit_event** event: `work_order.submitted`

**Result:** Work order is submitted with job cards created for each operation

### Create_job_card (Priority: 3)

**Given:**
- work order is submitted with operations
- operation has a workstation and time defined

**Then:**
- **create_record** — Create job card for the operation
- **set_field** target: `jc_status` value: `open`

**Result:** Job card is created and linked to the work order operation

### Log_time (Priority: 4) — Error: `JC_TIME_OVERLAP`

**Given:**
- `jc_status` (db) in `open,work_in_progress`
- time log from_time and to_time do not overlap with existing logs on the workstation

**Then:**
- **set_field** target: `jc_status` value: `work_in_progress`
- **set_field** target: `total_time_in_mins` — Accumulate time from all time logs
- **emit_event** event: `job_card.started`

**Result:** Time log is recorded and job card status updated to work in progress

### Transfer_material (Priority: 5)

**Given:**
- `wo_status` (db) in `not_started,in_process`
- `skip_transfer` (db) eq `false`

**Then:**
- **create_record** — Create material transfer entry from source to WIP warehouse
- **set_field** target: `material_transferred_for_manufacturing` — Update transferred quantity
- **emit_event** event: `material.transferred`

**Result:** Raw materials transferred from source warehouse to WIP warehouse

### Complete_manufacturing (Priority: 6) — Error: `WO_OVERPRODUCTION`

**Given:**
- `wo_status` (db) eq `in_process`
- all job cards are completed
- produced_qty meets ordered qty

**Then:**
- **transition_state** field: `wo_status` from: `in_process` to: `completed`
- **create_record** — Create manufacture entry moving finished goods to FG warehouse
- **emit_event** event: `work_order.completed`

**Result:** Work order completed, finished goods moved to target warehouse

### Stop_production (Priority: 7)

**Given:**
- `wo_status` (db) eq `in_process`

**Then:**
- **transition_state** field: `wo_status` from: `in_process` to: `stopped`
- **emit_event** event: `work_order.stopped`

**Result:** Production is halted; work order can be resumed or closed later

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WO_BOM_INVALID` | 422 | Referenced BOM must be submitted and active before the work order can proceed. | Yes |
| `WO_OVERPRODUCTION` | 422 | Produced quantity exceeds the allowed limit (order quantity plus overproduction tolerance). | No |
| `WO_CANCEL_WITH_PRODUCTION` | 409 | Cannot cancel a work order that has already produced items. Stop or close it instead. | No |
| `JC_TIME_OVERLAP` | 409 | Time log overlaps with an existing entry on the same workstation. | Yes |
| `JC_SEQUENCE_VIOLATION` | 422 | Previous operation must be completed before starting this sequential operation. | No |
| `JC_INSPECTION_REQUIRED` | 422 | Quality inspection must be completed and approved before finishing this job card. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `work_order.submitted` | Fired when a work order is submitted and job cards are created | `work_order_id`, `production_item`, `qty`, `bom_no` |
| `work_order.completed` | Fired when all quantities are produced and work order is completed | `work_order_id`, `production_item`, `produced_qty`, `actual_operating_cost` |
| `work_order.stopped` | Fired when production is halted before completion | `work_order_id`, `production_item`, `produced_qty`, `qty` |
| `job_card.started` | Fired when a job card begins time logging | `job_card_id`, `work_order_id`, `operation`, `workstation` |
| `job_card.completed` | Fired when a job card operation is fully completed | `job_card_id`, `work_order_id`, `operation`, `manufactured_qty`, `total_time_in_mins` |
| `material.transferred` | Fired when raw materials are transferred to WIP warehouse for manufacturing | `work_order_id`, `items`, `source_warehouse`, `wip_warehouse` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bill-of-materials | required | Work orders consume BOMs to determine materials and operations |
| stock-entry-movements | required | Material transfers and manufacture entries use stock entry documents |
| production-planning | recommended | Production planning auto-creates work orders from planned items |
| quality-inspection | optional | Quality inspections validate manufactured goods before completion |

## AGI Readiness

### Goals

#### Reliable Work Orders Job Cards

Work order execution and job card tracking for manufacturing operations, including material transfers, time logging, sequential operation control, and production completion.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| safety | throughput | manufacturing processes must prioritize worker and product safety |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `bill_of_materials` | bill-of-materials | fail |
| `stock_entry_movements` | stock-entry-movements | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_work_order | `supervised` | - | - |
| submit_work_order | `autonomous` | - | - |
| create_job_card | `supervised` | - | - |
| log_time | `autonomous` | - | - |
| transfer_material | `autonomous` | - | - |
| complete_manufacturing | `autonomous` | - | - |
| stop_production | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source: https://github.com/frappe/erpnext
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Work Orders Job Cards Blueprint",
  "description": "Work order execution and job card tracking for manufacturing operations, including material transfers, time logging, sequential operation control, and productio",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "work-order, job-card, production, manufacturing, shop-floor, time-tracking"
}
</script>
