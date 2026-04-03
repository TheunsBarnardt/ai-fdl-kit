---
title: "Stock Entry Movements Blueprint"
layout: default
parent: "Inventory"
grand_parent: Blueprint Catalog
description: "Stock entry and material movement system supporting issue, receipt, transfer, manufacture, repack, and subcontracting with stock ledger and GL entries. . 13 fie"
---

# Stock Entry Movements Blueprint

> Stock entry and material movement system supporting issue, receipt, transfer, manufacture, repack, and subcontracting with stock ledger and GL entries.


| | |
|---|---|
| **Feature** | `stock-entry-movements` |
| **Category** | Inventory |
| **Version** | 1.0.0 |
| **Tags** | stock-entry, material-movement, stock-ledger, valuation, manufacturing, inventory |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/inventory/stock-entry-movements.blueprint.yaml) |
| **JSON API** | [stock-entry-movements.json]({{ site.baseurl }}/api/blueprints/inventory/stock-entry-movements.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `company` | text | Yes | Company |  |
| `purpose` | select | Yes | Stock Entry Purpose |  |
| `posting_date` | date | Yes | Posting Date |  |
| `posting_time` | text | Yes | Posting Time |  |
| `from_warehouse` | text | No | Source Warehouse |  |
| `to_warehouse` | text | No | Target Warehouse |  |
| `items` | json | Yes | Stock Entry Items |  |
| `work_order` | text | No | Work Order |  |
| `bom_no` | text | No | Bill of Materials |  |
| `fg_completed_qty` | number | No | Finished Goods Completed Qty |  |
| `process_loss_percentage` | number | No | Process Loss Percentage |  |
| `inspection_required` | boolean | No | Inspection Required |  |
| `is_return` | boolean | No | Is Return |  |

## States

**State field:** `docstatus`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `submitted` |  |  |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `submitted` | stock_user |  |
|  | `submitted` | `cancelled` | stock_manager |  |

## Rules

- **purpose_warehouse_requirements:**
  - **description:** Purpose determines which warehouse fields are required. Material Issue requires a source warehouse only. Material Receipt requires a target warehouse only. Material Transfer requires both source and target warehouses. Manufacture requires a target warehouse for finished goods.

- **stock_ledger_on_submit:**
  - **description:** On submission, stock ledger entries (SLE) are created for each item row tracking actual_qty changes and valuation_rate. Incoming entries increase actual_qty; outgoing entries decrease it. Valuation uses either FIFO or moving average based on item configuration.

- **gl_entries_on_submit:**
  - **description:** General ledger entries are created for accounting impact when perpetual inventory is enabled. Debit/credit accounts are derived from warehouse default accounts or item group defaults.

- **serial_batch_validation:**
  - **description:** Items with serial number tracking require valid serial numbers matching the quantity. Items with batch tracking require a valid batch number. Serial numbers must exist in the source warehouse for outgoing transactions.

- **manufacture_qty_match:**
  - **description:** For Manufacture purpose, the work order quantity must match the fg_completed_qty. Raw material quantities are calculated from the BOM based on fg_completed_qty and process_loss_percentage.

- **backdated_entry_reposting:**
  - **description:** When a stock entry is backdated (posting_date/time before the latest existing SLE), all future stock ledger entries and GL entries are recalculated to maintain correct running balances and valuations.

- **stock_freeze:**
  - **description:** Entries cannot be posted before the stock freeze date configured in inventory settings. Only users with the stock freeze role can bypass this restriction.


## Outcomes

### Submit_stock_entry (Priority: 1)

**Given:**
- stock entry is in draft state with all required fields populated
- purpose-specific warehouse requirements are satisfied
- all item quantities are greater than zero
- serial/batch numbers are valid for tracked items

**Then:**
- **create_record** target: `stock_ledger_entries` — SLE created per item row with actual_qty and valuation_rate
- **create_record** target: `gl_entries` — GL entries created for perpetual inventory accounting
- **transition_state** field: `docstatus` from: `draft` to: `submitted`
- **emit_event** event: `stock.entry_submitted`

**Result:** Stock entry submitted with SLE and GL entries created

### Negative_stock_detected (Priority: 1) — Error: `STOCK_NEGATIVE_BALANCE`

**Given:**
- outgoing transaction would cause negative stock balance in warehouse
- negative stock is not allowed in inventory settings

**Then:**
- **emit_event** event: `stock.negative_detected`

**Result:** Stock entry rejected due to insufficient stock

### Stock_freeze_violated (Priority: 1) — Error: `STOCK_FREEZE_VIOLATION`

**Given:**
- posting_date is before the configured stock freeze date
- user does not have stock freeze bypass role

**Result:** Stock entry rejected due to stock freeze restriction

### Cancel_stock_entry (Priority: 2)

**Given:**
- stock entry is in submitted state
- no dependent transactions reference this entry

**Then:**
- **create_record** target: `stock_ledger_entries` — Reversal SLE created with negated actual_qty for each item
- **create_record** target: `gl_entries` — Reversal GL entries created to undo accounting impact
- **transition_state** field: `docstatus` from: `submitted` to: `cancelled`
- **emit_event** event: `stock.entry_cancelled`

**Result:** Stock entry cancelled with all ledger entries reversed

### Transfer_material (Priority: 3)

**Given:**
- purpose is Material Transfer
- source warehouse has sufficient stock for all items
- source and target warehouses belong to the same company

**Then:**
- **create_record** target: `stock_ledger_entries` — Outgoing SLE from source warehouse and incoming SLE to target warehouse
- **emit_event** event: `stock.entry_submitted`

**Result:** Material transferred between warehouses with ledger updated

### Manufacture_finished_goods (Priority: 4)

**Given:**
- purpose is Manufacture
- work order and BOM are linked
- fg_completed_qty matches expected quantity
- raw material quantities satisfy BOM requirements

**Then:**
- **create_record** target: `stock_ledger_entries` — Outgoing SLE for raw materials, incoming SLE for finished goods
- **set_field** target: `work_order_produced_qty` — Work order produced quantity updated
- **emit_event** event: `stock.entry_submitted`

**Result:** Finished goods manufactured and work order progress updated

### Valuation_changed (Priority: 5)

**Given:**
- stock entry submission changes the valuation rate of an item

**Then:**
- **emit_event** event: `stock.valuation_changed`

**Result:** Item valuation rate updated in warehouse

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STOCK_NEGATIVE_BALANCE` | 400 | Insufficient stock: this transaction would result in a negative balance for the item in the specified warehouse. | No |
| `STOCK_FREEZE_VIOLATION` | 403 | Stock transactions are frozen before the configured freeze date. Contact a stock manager to bypass. | No |
| `STOCK_WAREHOUSE_MISMATCH` | 400 | Source and target warehouses must belong to the same company and match the stock entry purpose. | No |
| `STOCK_BACKDATED_BLOCKED` | 403 | Backdated stock entries are not permitted by the current inventory policy. | No |
| `STOCK_INSPECTION_REQUIRED` | 400 | Quality inspection must be completed before this stock entry can be submitted. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `stock.entry_submitted` | Stock entry submitted, ledger entries created | `entry_id`, `purpose`, `posting_date`, `item_count` |
| `stock.entry_cancelled` | Stock entry cancelled, ledger entries reversed | `entry_id`, `purpose`, `posting_date` |
| `stock.valuation_changed` | Item valuation rate changed due to stock transaction | `item_code`, `warehouse`, `old_rate`, `new_rate` |
| `stock.negative_detected` | Attempted transaction would cause negative stock balance | `item_code`, `warehouse`, `available_qty`, `requested_qty` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| warehouse-bin-management | required | Stock entries update bin quantities and require valid warehouse references |
| serial-batch-tracking | recommended | Serial and batch numbers validated during stock transactions |
| work-orders-job-cards | recommended | Manufacture entries linked to work orders and BOM |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
  files_traced: 25
  entry_points:
    - erpnext/stock/doctype/stock_entry/stock_entry.py
    - erpnext/stock/stock_ledger.py
    - erpnext/stock/general_ledger.py
    - erpnext/stock/doctype/stock_entry/stock_entry.js
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Stock Entry Movements Blueprint",
  "description": "Stock entry and material movement system supporting issue, receipt, transfer, manufacture, repack, and subcontracting with stock ledger and GL entries.\n. 13 fie",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "stock-entry, material-movement, stock-ledger, valuation, manufacturing, inventory"
}
</script>
