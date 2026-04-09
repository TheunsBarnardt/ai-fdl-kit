---
title: "Bill Of Materials Blueprint"
layout: default
parent: "Manufacturing"
grand_parent: Blueprint Catalog
description: "Hierarchical bill of materials defining raw materials, operations, and costs required to manufacture a finished good, with multi-level explosion and cost propag"
---

# Bill Of Materials Blueprint

> Hierarchical bill of materials defining raw materials, operations, and costs required to manufacture a finished good, with multi-level explosion and cost propagation.


| | |
|---|---|
| **Feature** | `bill-of-materials` |
| **Category** | Manufacturing |
| **Version** | 1.0.0 |
| **Tags** | bom, manufacturing, raw-materials, cost-estimation, production |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/manufacturing/bill-of-materials.blueprint.yaml) |
| **JSON API** | [bill-of-materials.json]({{ site.baseurl }}/api/blueprints/manufacturing/bill-of-materials.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `item` | text | Yes | Finished Good | Validations: required |
| `quantity` | number | Yes | Quantity | Validations: min |
| `company` | text | Yes | Company |  |
| `items` | json | Yes | Raw Materials | Validations: required |
| `operations` | json | No | Manufacturing Operations |  |
| `exploded_items` | json | No | Exploded Items |  |
| `is_active` | boolean | Yes | Active |  |
| `is_default` | boolean | No | Default BOM |  |
| `with_operations` | boolean | No | With Operations |  |
| `rm_cost_as_per` | select | Yes | Rate of Materials Based On |  |
| `raw_material_cost` | number | No | Raw Material Cost |  |
| `operating_cost` | number | No | Operating Cost |  |
| `total_cost` | number | No | Total Cost |  |
| `process_loss_percentage` | number | No | Process Loss Percentage | Validations: min, max |
| `process_loss_qty` | number | No | Process Loss Quantity |  |
| `transfer_material_against` | select | No | Transfer Material Against |  |
| `track_semi_finished_goods` | boolean | No | Track Semi-Finished Goods |  |
| `allow_alternative_item` | boolean | No | Allow Alternative Item |  |
| `inspection_required` | boolean | No | Quality Inspection Required |  |
| `currency` | text | Yes | Currency |  |
| `conversion_rate` | number | No | Conversion Rate | Validations: min |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `submitted` |  |  |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `submitted` | production_manager | Items table must not be empty and all validations pass |
|  | `submitted` | `cancelled` | production_manager | No active work orders reference this BOM |

## Rules

- **no_circular_references:**
  - **description:** BOM hierarchy must not contain circular references. System performs recursive tree traversal during validation to detect cycles where a child BOM directly or indirectly references the parent BOM.

- **items_table_not_empty:**
  - **description:** The raw materials (items) table must contain at least one row. A BOM without materials cannot be submitted.

- **material_qty_positive:**
  - **description:** Each raw material row must have a quantity greater than zero. Zero or negative quantities are rejected on save.

- **fixed_asset_not_allowed:**
  - **description:** Fixed asset items cannot be added as raw materials in a BOM. Only stock and non-stock items are permitted.

- **operations_require_workstation:**
  - **description:** Each operation row must specify a workstation and a time greater than zero minutes. Operations without workstation or time are invalid.

- **cost_propagation:**
  - **description:** When a child BOM cost changes, the system propagates the updated cost upward to all parent BOMs that reference it, recalculating total cost at each level.

- **exploded_items_flatten:**
  - **description:** Exploded items table flattens the entire multi-level BOM hierarchy into a single list of leaf-level raw materials with aggregated quantities, accounting for sub-assembly BOMs.

- **process_loss_cap:**
  - **description:** Process loss percentage must be between 0 and 100 inclusive. The process loss quantity is computed as quantity times process loss percentage divided by 100.

- **cost_allocation_sum:**
  - **description:** When secondary items (scrap or by-products) are defined, the cost allocation percentages between the finished good and all secondary items must sum to exactly 100%.

- **inactive_bom_linking:**
  - **description:** An inactive BOM cannot be referenced by any active BOM or work order. Deactivating a BOM triggers validation of all dependent documents.


## Outcomes

### Create_bom (Priority: 1)

**Given:**
- user provides a finished good item, quantity, and at least one raw material

**Then:**
- **create_record** — Create new BOM record in draft status
- **set_field** target: `status` value: `draft`
- **set_field** target: `raw_material_cost` value: `0`

**Result:** BOM is created in draft status with calculated material costs

### Submit_bom (Priority: 2)

**Given:**
- `status` (db) eq `draft`
- items table has at least one row
- no circular references detected in BOM hierarchy

**Then:**
- **transition_state** field: `status` from: `draft` to: `submitted`
- **set_field** target: `is_active` value: `true`
- **emit_event** event: `bom.submitted`

**Result:** BOM is submitted and available for use in work orders and production planning

### Calculate_cost (Priority: 3)

**Given:**
- BOM exists with materials and optionally operations

**Then:**
- **set_field** target: `raw_material_cost` — Sum of (qty * rate) for each raw material row
- **set_field** target: `operating_cost` — Sum of (time_in_mins * hour_rate / 60) for each operation
- **set_field** target: `total_cost` — raw_material_cost + operating_cost

**Result:** BOM costs are recalculated from current material rates and operation costs

### Explode_items (Priority: 4)

**Given:**
- BOM contains sub-assembly items that have their own BOMs

**Then:**
- **set_field** target: `exploded_items` — Flatten multi-level hierarchy into leaf-level materials with aggregated quantities

**Result:** Exploded items table shows all leaf-level raw materials across the full BOM tree

### Update_cost_propagation (Priority: 5)

**Given:**
- a child BOM cost has been updated
- parent BOMs reference the updated child BOM

**Then:**
- **call_service** target: `bom_cost_propagation` — Recursively update costs in all parent BOMs
- **emit_event** event: `bom.cost_updated`

**Result:** All parent BOMs reflect the updated child BOM cost

### Deactivate_bom (Priority: 6) — Error: `BOM_INACTIVE_LINKED`

**Given:**
- `status` (db) eq `submitted`
- no active work orders reference this BOM

**Then:**
- **set_field** target: `is_active` value: `false`
- **emit_event** event: `bom.deactivated`

**Result:** BOM is deactivated and cannot be used for new work orders

### Replace_bom (Priority: 7)

**Given:**
- old BOM exists and new BOM is submitted for the same item

**Then:**
- **set_field** target: `is_default` value: `true` — Set new BOM as default
- **call_service** target: `bom_replacement` — Update all pending work orders to reference new BOM
- **emit_event** event: `bom.replaced`

**Result:** Old BOM is replaced by new BOM across all pending documents

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `BOM_RECURSION_DETECTED` | 422 | Circular reference detected in BOM hierarchy. A BOM cannot reference itself directly or indirectly. | No |
| `BOM_NO_MATERIALS` | 422 | BOM must contain at least one raw material before submission. | Yes |
| `BOM_QTY_ZERO` | 422 | Each raw material must have a quantity greater than zero. | Yes |
| `BOM_OPERATION_TIME_ZERO` | 422 | Each operation must have a time greater than zero minutes. | Yes |
| `BOM_COST_ALLOCATION_MISMATCH` | 422 | Cost allocation between finished good and secondary items must sum to 100%. | Yes |
| `BOM_INACTIVE_LINKED` | 409 | Cannot deactivate BOM while active BOMs or work orders reference it. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `bom.submitted` | Fired when a BOM is submitted and becomes active for production use | `bom_id`, `item`, `quantity`, `total_cost` |
| `bom.cost_updated` | Fired when BOM cost changes due to material rate updates or cost propagation | `bom_id`, `item`, `old_cost`, `new_cost` |
| `bom.deactivated` | Fired when a BOM is deactivated and removed from active use | `bom_id`, `item` |
| `bom.replaced` | Fired when a BOM is replaced by a newer version for the same item | `old_bom_id`, `new_bom_id`, `item` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| work-orders-job-cards | required | Work orders consume BOMs to plan and execute manufacturing |
| production-planning | recommended | Production planning uses BOMs to calculate material requirements |
| stock-entry-movements | recommended | Stock entries transfer materials based on BOM quantities |

## AGI Readiness

### Goals

#### Reliable Bill Of Materials

Hierarchical bill of materials defining raw materials, operations, and costs required to manufacture a finished good, with multi-level explosion and cost propagation.


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
| `work_orders_job_cards` | work-orders-job-cards | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_bom | `supervised` | - | - |
| submit_bom | `autonomous` | - | - |
| calculate_cost | `autonomous` | - | - |
| explode_items | `autonomous` | - | - |
| update_cost_propagation | `supervised` | - | - |
| deactivate_bom | `autonomous` | - | - |
| replace_bom | `autonomous` | - | - |

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
  "name": "Bill Of Materials Blueprint",
  "description": "Hierarchical bill of materials defining raw materials, operations, and costs required to manufacture a finished good, with multi-level explosion and cost propag",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "bom, manufacturing, raw-materials, cost-estimation, production"
}
</script>
