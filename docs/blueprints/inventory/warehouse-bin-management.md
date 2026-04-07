---
title: "Warehouse Bin Management Blueprint"
layout: default
parent: "Inventory"
grand_parent: Blueprint Catalog
description: "Warehouse hierarchy and bin management with nested trees, quantity tracking, putaway rules, and perpetual inventory GL integration. . 24 fields. 7 outcomes. 5 e"
---

# Warehouse Bin Management Blueprint

> Warehouse hierarchy and bin management with nested trees, quantity tracking, putaway rules, and perpetual inventory GL integration.


| | |
|---|---|
| **Feature** | `warehouse-bin-management` |
| **Category** | Inventory |
| **Version** | 1.0.0 |
| **Tags** | warehouse, bin-management, putaway, inventory, stock-balance, projected-qty |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/inventory/warehouse-bin-management.blueprint.yaml) |
| **JSON API** | [warehouse-bin-management.json]({{ site.baseurl }}/api/blueprints/inventory/warehouse-bin-management.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `warehouse_name` | text | Yes | Warehouse Name |  |
| `company` | text | Yes | Company |  |
| `parent_warehouse` | text | No | Parent Warehouse |  |
| `warehouse_type` | text | No | Warehouse Type |  |
| `disabled` | boolean | No | Disabled |  |
| `is_group` | boolean | No | Is Group |  |
| `is_rejected_warehouse` | boolean | No | Is Rejected Warehouse |  |
| `default_in_transit_warehouse` | text | No | Default In-Transit Warehouse |  |
| `account` | text | No | Warehouse Account |  |
| `item_code` | text | Yes | Item Code |  |
| `warehouse` | text | Yes | Warehouse |  |
| `actual_qty` | number | No | Actual Quantity |  |
| `ordered_qty` | number | No | Ordered Quantity |  |
| `reserved_qty` | number | No | Reserved Quantity |  |
| `reserved_qty_for_production` | number | No | Reserved for Production |  |
| `projected_qty` | number | No | Projected Quantity |  |
| `planned_qty` | number | No | Planned Quantity |  |
| `stock_value` | number | No | Stock Value |  |
| `valuation_rate` | number | No | Valuation Rate |  |
| `putaway_item_code` | text | Yes | Putaway Item Code |  |
| `putaway_warehouse` | text | Yes | Putaway Warehouse |  |
| `capacity` | number | Yes | Warehouse Capacity |  |
| `priority` | number | Yes | Putaway Priority |  |
| `stock_capacity` | number | No | Available Stock Capacity |  |

## Rules

- **warehouse_tree_hierarchy:**
  - **description:** Warehouses form a nested tree structure via parent_warehouse references. Group warehouses (is_group = true) can contain child warehouses but cannot hold stock directly. Leaf warehouses hold actual stock.

- **warehouse_deletion_protection:**
  - **description:** A warehouse cannot be deleted if it has any stock ledger entries, bin records with non-zero quantities, or child warehouses. The system must verify all dependencies before allowing deletion.

- **bin_projected_qty_formula:**
  - **description:** Projected quantity is computed as: actual_qty + ordered_qty + indented_qty + planned_qty - reserved_qty - reserved_qty_for_production - reserved_qty_for_sub_contract. This formula provides a forward-looking availability estimate.

- **putaway_uniqueness:**
  - **description:** Putaway rules must be unique per item-warehouse combination. Duplicate rules for the same item and warehouse are rejected.

- **putaway_capacity_validation:**
  - **description:** Putaway rule capacity must exceed the current stock quantity in the warehouse. The system validates that the defined capacity is achievable.

- **putaway_allocation_logic:**
  - **description:** When applying putaway rules, stock is distributed to warehouses by priority (lowest number first), then by available capacity. If the highest-priority warehouse is full, overflow goes to the next.

- **perpetual_inventory_gl_link:**
  - **description:** Each warehouse is linked to a GL account for perpetual inventory. Stock value changes in the bin are reflected as GL entries in the linked account.


## Outcomes

### Create_warehouse (Priority: 1)

**Given:**
- user provides a warehouse name and company
- parent warehouse exists if specified
- warehouse name is unique within the company

**Then:**
- **create_record** target: `warehouse` — New warehouse created in the hierarchy
- **emit_event** event: `warehouse.created`

**Result:** Warehouse created and available for stock transactions

### Warehouse_has_stock (Priority: 1) — Error: `WAREHOUSE_HAS_STOCK`

**Given:**
- user attempts to delete or disable a warehouse
- warehouse has non-zero bin quantities or stock ledger entries

**Result:** Deletion blocked because warehouse still contains stock

### Warehouse_has_children (Priority: 1) — Error: `WAREHOUSE_HAS_CHILDREN`

**Given:**
- user attempts to delete a group warehouse
- warehouse has child warehouses

**Result:** Deletion blocked because warehouse has child nodes

### Update_bin_quantities (Priority: 2)

**Given:**
- a stock transaction is processed affecting an item-warehouse combination

**Then:**
- **set_field** target: `actual_qty` — Actual quantity updated from stock ledger aggregation
- **set_field** target: `projected_qty` — Projected quantity recalculated using the formula
- **set_field** target: `stock_value` — Stock value updated based on new quantity and valuation rate
- **emit_event** event: `bin.qty_changed`

**Result:** Bin quantities and values reflect the latest stock position

### Apply_putaway_rule (Priority: 3)

**Given:**
- incoming stock receipt has putaway rules defined for the item
- at least one target warehouse has available capacity

**Then:**
- **set_field** target: `putaway_warehouse_allocations` — Stock distributed across warehouses by priority and capacity
- **emit_event** event: `putaway.applied`

**Result:** Incoming stock automatically distributed to warehouses per putaway rules

### Delete_warehouse (Priority: 4)

**Given:**
- warehouse has no stock ledger entries
- warehouse has no child warehouses
- all bin quantities are zero

**Then:**
- **delete_record** target: `warehouse` — Warehouse removed from hierarchy

**Result:** Warehouse deleted from the system

### Disable_warehouse (Priority: 5)

**Given:**
- user disables a warehouse
- warehouse has no pending transactions

**Then:**
- **set_field** target: `disabled` value: `true`
- **emit_event** event: `warehouse.disabled`

**Result:** Warehouse disabled and excluded from future transactions

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `WAREHOUSE_HAS_STOCK` | 400 | Cannot delete warehouse: it contains stock or has ledger entries. | No |
| `WAREHOUSE_HAS_CHILDREN` | 400 | Cannot delete warehouse: it has child warehouses in the hierarchy. | No |
| `WAREHOUSE_WRONG_COMPANY` | 400 | Warehouse does not belong to the specified company. | No |
| `PUTAWAY_DUPLICATE_RULE` | 409 | A putaway rule already exists for this item-warehouse combination. | No |
| `PUTAWAY_INSUFFICIENT_CAPACITY` | 400 | Putaway capacity must be greater than the current stock in the warehouse. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `warehouse.created` | New warehouse created in the hierarchy | `warehouse_id`, `warehouse_name`, `company`, `parent_warehouse` |
| `warehouse.disabled` | Warehouse disabled and excluded from transactions | `warehouse_id`, `warehouse_name` |
| `bin.qty_changed` | Bin quantities updated after a stock transaction | `item_code`, `warehouse`, `actual_qty`, `projected_qty`, `stock_value` |
| `putaway.applied` | Putaway rules applied to distribute incoming stock | `item_code`, `allocations` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| stock-entry-movements | required | Stock entries are the primary source of bin quantity changes |
| serial-batch-tracking | recommended | Serial and batch tracking integrates with warehouse stock positions |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
  files_traced: 18
  entry_points:
    - erpnext/stock/doctype/warehouse/warehouse.py
    - erpnext/stock/doctype/bin/bin.py
    - erpnext/stock/doctype/putaway_rule/putaway_rule.py
    - erpnext/stock/utils.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Warehouse Bin Management Blueprint",
  "description": "Warehouse hierarchy and bin management with nested trees, quantity tracking, putaway rules, and perpetual inventory GL integration.\n. 24 fields. 7 outcomes. 5 e",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "warehouse, bin-management, putaway, inventory, stock-balance, projected-qty"
}
</script>
