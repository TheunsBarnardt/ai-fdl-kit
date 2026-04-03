---
title: "Production Planning Blueprint"
layout: default
parent: "Manufacturing"
grand_parent: Blueprint Catalog
description: "Production planning tool that consolidates demand from sales orders and material requests, explodes multi-level BOMs, and generates work orders and procurement "
---

# Production Planning Blueprint

> Production planning tool that consolidates demand from sales orders and material requests, explodes multi-level BOMs, and generates work orders and procurement requests for manufacturing.


| | |
|---|---|
| **Feature** | `production-planning` |
| **Category** | Manufacturing |
| **Version** | 1.0.0 |
| **Tags** | production-planning, mrp, demand-planning, manufacturing, material-requirements |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/manufacturing/production-planning.blueprint.yaml) |
| **JSON API** | [production-planning.json]({{ site.baseurl }}/api/blueprints/manufacturing/production-planning.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company` | text | Yes | Company |  |
| `posting_date` | date | Yes | Posting Date |  |
| `get_items_from` | select | Yes | Get Items From |  |
| `pp_status` | select | Yes | Status |  |
| `sales_orders` | json | No | Sales Orders |  |
| `material_requests` | json | No | Material Requests |  |
| `po_items` | json | No | Items to Manufacture |  |
| `sub_assembly_items` | json | No | Sub-Assembly Items |  |
| `mr_items` | json | No | Items to Procure |  |
| `combine_items` | boolean | No | Combine Items |  |
| `combine_sub_items` | boolean | No | Combine Sub-Assembly Items |  |
| `include_non_stock_items` | boolean | No | Include Non-Stock Items |  |
| `consider_minimum_order_qty` | boolean | No | Consider Minimum Order Quantity |  |
| `include_safety_stock` | boolean | No | Include Safety Stock |  |
| `total_planned_qty` | number | No | Total Planned Quantity |  |
| `total_produced_qty` | number | No | Total Produced Quantity |  |
| `reserve_stock` | boolean | No | Reserve Stock |  |

## States

**State field:** `pp_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `not_started` |  |  |
| `in_process` |  |  |
| `material_requested` |  |  |
| `completed` |  | Yes |
| `closed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `not_started` | production_planner |  |
|  | `not_started` | `in_process` | production_planner |  |
|  | `in_process` | `material_requested` | production_planner |  |
|  | `in_process` | `completed` | system |  |
|  | `material_requested` | `completed` | system |  |
|  | `not_started` | `closed` | production_planner |  |
|  | `not_started` | `cancelled` | production_planner |  |

## Rules

- **fetch_demand_sources:**
  - **description:** Items are fetched from either sales orders or material requests based on user selection, with configurable filters for date range, item group, customer, and warehouse.

- **combine_duplicate_items:**
  - **description:** When combine_items is enabled, duplicate items across multiple demand sources are consolidated by item code, summing their quantities into a single planned row.

- **multi_level_bom_explosion:**
  - **description:** The system explodes multi-level BOMs to identify sub-assembly items that must be manufactured before the final product. Each sub-assembly is listed with its own BOM and required quantity.

- **sub_assembly_sourcing:**
  - **description:** Sub-assemblies can be sourced via in-house manufacturing (creating work orders) or subcontracting (creating purchase orders to external suppliers), configured per sub-assembly item.

- **material_request_planning:**
  - **description:** For items that need procurement, the system calculates required quantities considering existing stock, ordered quantities, and reserved quantities, unless the user overrides with actual quantities.

- **safety_stock_inclusion:**
  - **description:** When include_safety_stock is enabled, the safety stock quantity defined on each item is added to the procurement requirement to maintain minimum inventory levels.

- **work_order_creation:**
  - **description:** Work orders are created from planned items with BOM, warehouse, and quantity populated automatically. One work order per planned item row.


## Outcomes

### Fetch_sales_orders (Priority: 1)

**Given:**
- `get_items_from` (input) eq `sales_order`
- user applies filters for date range, customer, or item group

**Then:**
- **set_field** target: `sales_orders` — Populate sales orders table with matching pending orders

**Result:** Sales orders matching the filter criteria are loaded into the plan

### Fetch_material_requests (Priority: 2)

**Given:**
- `get_items_from` (input) eq `material_request`
- user applies filters for date range or item group

**Then:**
- **set_field** target: `material_requests` — Populate material requests table with matching pending requests

**Result:** Material requests matching the filter criteria are loaded into the plan

### Get_items_to_manufacture (Priority: 3) — Error: `PP_NO_BOM_FOR_ITEM`

**Given:**
- demand sources (sales orders or material requests) are populated

**Then:**
- **set_field** target: `po_items` — Extract finished goods with BOM, quantity, and warehouse from demand sources
- **set_field** target: `total_planned_qty` — Sum of all planned quantities

**Result:** Items to manufacture are extracted and consolidated from demand sources

### Get_sub_assembly_items (Priority: 4)

**Given:**
- items to manufacture are populated
- at least one item has a multi-level BOM

**Then:**
- **set_field** target: `sub_assembly_items` — Explode BOMs to identify sub-assemblies with sourcing type

**Result:** Sub-assembly items identified with manufacturing or subcontracting sourcing

### Create_work_orders (Priority: 5)

**Given:**
- `pp_status` (db) in `not_started,in_process`
- po_items table has at least one row

**Then:**
- **create_record** — Create one work order per planned item with BOM and warehouse
- **transition_state** field: `pp_status` from: `not_started` to: `in_process`
- **emit_event** event: `work_orders.created`

**Result:** Work orders created for all planned manufacturing items

### Create_material_requests (Priority: 6)

**Given:**
- `pp_status` (db) in `not_started,in_process`
- mr_items table has at least one row

**Then:**
- **create_record** — Create material requests grouped by warehouse for procurement items
- **emit_event** event: `material_requests.created`

**Result:** Material requests created per warehouse for all procurement items

### Create_subcontracted_purchase_orders (Priority: 7)

**Given:**
- sub_assembly_items has items with subcontracting sourcing type

**Then:**
- **create_record** — Create subcontracted purchase orders for outsourced sub-assemblies
- **emit_event** event: `production_plan.submitted`

**Result:** Subcontracted purchase orders created for outsourced sub-assemblies

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PP_NO_BOM_FOR_ITEM` | 422 | No active BOM found for one or more items. Create and submit a BOM before planning production. | Yes |
| `PP_INVALID_SALES_ORDER` | 422 | One or more selected sales orders are not in a valid state for production planning. | Yes |
| `PP_NO_PENDING_ITEMS` | 422 | No pending items found matching the selected filters. Adjust filters and try again. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `production_plan.submitted` | Fired when a production plan is submitted and ready for execution | `production_plan_id`, `company`, `total_planned_qty` |
| `work_orders.created` | Fired when work orders are bulk-created from a production plan | `production_plan_id`, `work_order_ids`, `total_planned_qty` |
| `material_requests.created` | Fired when material requests are created for procurement items | `production_plan_id`, `material_request_ids`, `items` |
| `production_plan.completed` | Fired when all work orders and material requests from the plan are fulfilled | `production_plan_id`, `total_planned_qty`, `total_produced_qty` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| bill-of-materials | required | Production planning requires BOMs to explode material requirements |
| work-orders-job-cards | required | Work orders are the primary output of production planning |
| sales-order-lifecycle | recommended | Sales orders are a primary demand source for production planning |
| purchase-order-lifecycle | recommended | Purchase orders are created for procurement items and subcontracting |
| subcontracting | optional | Sub-assemblies can be outsourced via subcontracting orders |

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
  "name": "Production Planning Blueprint",
  "description": "Production planning tool that consolidates demand from sales orders and material requests, explodes multi-level BOMs, and generates work orders and procurement ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "production-planning, mrp, demand-planning, manufacturing, material-requirements"
}
</script>
