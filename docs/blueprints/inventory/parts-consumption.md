---
title: "Parts Consumption Blueprint"
layout: default
parent: "Inventory"
grand_parent: Blueprint Catalog
description: "Record parts and materials consumed during vehicle service or repair events, validate stock availability, trigger inventory deductions, and attribute parts cost"
---

# Parts Consumption Blueprint

> Record parts and materials consumed during vehicle service or repair events, validate stock availability, trigger inventory deductions, and attribute parts cost to the service record.

| | |
|---|---|
| **Feature** | `parts-consumption` |
| **Category** | Inventory |
| **Version** | 1.0.0 |
| **Tags** | fleet, vehicle, parts, inventory, consumption, service, stock |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/inventory/parts-consumption.blueprint.yaml) |
| **JSON API** | [parts-consumption.json]({{ site.baseurl }}/api/blueprints/inventory/parts-consumption.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `technician` | Technician | human | Records the parts used during a service; selects items from approved stock locations |
| `fleet_manager` | Fleet Manager | human | Reviews parts consumption and approves high-value replacements |
| `stores_clerk` | Stores Clerk | human | Confirms stock availability and processes the inventory issue |
| `system` | System | system | Validates stock levels, computes costs, and triggers inventory deduction transactions |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `service_record` | text | Yes | Service Record Reference |  |
| `vehicle` | text | Yes | Vehicle |  |
| `item_code` | text | Yes | Item Code |  |
| `item_description` | text | No | Item Description |  |
| `warehouse` | text | Yes | Source Warehouse |  |
| `quantity` | number | Yes | Quantity |  |
| `unit_of_measure` | text | Yes | Unit of Measure |  |
| `unit_cost` | number | No | Unit Cost |  |
| `total_cost` | number | No | Total Cost |  |
| `batch_number` | text | No | Batch Number |  |
| `serial_number` | text | No | Serial Number |  |
| `stock_entry_reference` | text | No | Stock Entry Reference |  |
| `status` | select | Yes | Status |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `reserved` |  |  |
| `issued` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `reserved` | stores_clerk |  |
|  | `reserved` | `issued` | stores_clerk |  |
|  | `draft` | `issued` | stores_clerk |  |
|  | `draft` | `cancelled` | technician |  |
|  | `reserved` | `cancelled` | technician |  |

## Rules

- **quantity_positive:**
  - **description:** Quantity must be greater than zero
- **item_must_exist:**
  - **description:** Item must exist in the inventory catalogue
- **stock_availability:**
  - **description:** Sufficient stock must be available in the specified warehouse before issuing; insufficient stock blocks the transaction
- **total_cost_computation:**
  - **description:** Total cost is computed as quantity × unit_cost; unit_cost is sourced from inventory valuation if not manually entered
- **stock_deduction_on_issue:**
  - **description:** On confirmation (status → issued), a stock deduction transaction is created automatically in the inventory system
- **cancellation_requires_return:**
  - **description:** Cancelling an issued consumption requires a return transaction to restore the stock
- **serial_tracking:**
  - **description:** Serial-tracked items require a valid serial number that is currently in stock at the specified warehouse
- **batch_tracking:**
  - **description:** Batch-tracked items require a valid batch number that has sufficient quantity available

## Outcomes

### Insufficient_stock_blocked (Priority: 1) — Error: `PARTS_INSUFFICIENT_STOCK`

**Given:**
- requested quantity exceeds available stock in the specified warehouse

**Result:** Issue is blocked; technician is notified of the shortfall and must select an alternative warehouse or raise a purchase request

### Invalid_quantity_rejected (Priority: 2) — Error: `PARTS_INVALID_QUANTITY`

**Given:**
- `quantity` (input) lte `0`

**Result:** Consumption line is rejected with a quantity validation error

### Serial_number_invalid (Priority: 3) — Error: `PARTS_INVALID_SERIAL`

**Given:**
- item is serialised
- serial_number is not in stock at the specified warehouse

**Result:** Issue blocked; technician must provide a valid serial number available in stock

### Consumption_cancelled (Priority: 8)

**Given:**
- status is draft or reserved
- cancellation requested by technician or fleet manager

**Then:**
- **set_field** target: `status` value: `cancelled`
- **emit_event** event: `parts.consumption_cancelled`

**Result:** Consumption line is cancelled; any reservation is released back to available stock

### Cost_attributed_to_service (Priority: 9)

**Given:**
- parts_issued outcome has fired
- service_record is linked

**Then:**
- **set_field** target: `service_record.parts_cost` — Add total_cost to the service record's parts cost total
- **emit_event** event: `parts.cost_attributed`

**Result:** Service record's parts cost total is updated to include this consumption

### Parts_issued (Priority: 10)

**Given:**
- item_code exists in the inventory catalogue
- `quantity` (input) gt `0`
- sufficient stock is available in the specified warehouse
- serial/batch requirements are met if item is tracked

**Then:**
- **set_field** target: `unit_cost` — Fetch current valuation rate from inventory if not manually provided
- **set_field** target: `total_cost` — Compute quantity × unit_cost
- **set_field** target: `status` value: `issued`
- **create_record** — Create a stock deduction (material issue) transaction against the warehouse
- **set_field** target: `stock_entry_reference` — Store the reference of the created stock deduction transaction
- **emit_event** event: `parts.issued`

**Result:** Parts are recorded as consumed, inventory is decremented, and cost is attributed to the service record

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PARTS_INSUFFICIENT_STOCK` | 422 | Insufficient stock available. Please check the warehouse or raise a parts request. | No |
| `PARTS_INVALID_QUANTITY` | 400 | Quantity must be greater than zero. | No |
| `PARTS_INVALID_SERIAL` | 422 | The specified serial number is not available in this warehouse. | No |
| `PARTS_ITEM_NOT_FOUND` | 404 | The item code does not exist in the inventory catalogue. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `parts.issued` | Parts have been issued from stock for a vehicle service event | `vehicle`, `service_record`, `item_code`, `quantity`, `total_cost`, `warehouse`, `stock_entry_reference` |
| `parts.cost_attributed` | Parts cost from an issued consumption has been added to the linked service record | `vehicle`, `service_record`, `total_cost` |
| `parts.consumption_cancelled` | A parts consumption line has been cancelled and any reservation released | `vehicle`, `service_record`, `item_code`, `quantity` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| vehicle-maintenance-log | required | Parts consumption is linked to a maintenance log record and contributes to service parts cost |
| scheduled-maintenance | optional | Scheduled service tasks may have standard parts lists that pre-populate consumption lines |

## AGI Readiness

### Goals

#### Reliable Parts Consumption

Record parts and materials consumed during vehicle service or repair events, validate stock availability, trigger inventory deductions, and attribute parts cost to the service record.

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

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | speed | inventory counts must be precise to prevent stockouts and overstock |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `vehicle_maintenance_log` | vehicle-maintenance-log | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| parts_issued | `autonomous` | - | - |
| insufficient_stock_blocked | `human_required` | - | - |
| invalid_quantity_rejected | `supervised` | - | - |
| serial_number_invalid | `autonomous` | - | - |
| consumption_cancelled | `supervised` | - | - |
| cost_attributed_to_service | `autonomous` | - | - |

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
    - erpnext/assets/doctype/asset_repair_consumed_item/asset_repair_consumed_item.py
    - erpnext/assets/doctype/asset/asset.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Parts Consumption Blueprint",
  "description": "Record parts and materials consumed during vehicle service or repair events, validate stock availability, trigger inventory deductions, and attribute parts cost",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, vehicle, parts, inventory, consumption, service, stock"
}
</script>
