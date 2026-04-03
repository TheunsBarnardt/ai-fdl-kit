---
title: "Subcontracting Blueprint"
layout: default
parent: "Manufacturing"
grand_parent: Blueprint Catalog
description: "Subcontracting workflow for outsourcing manufacturing to suppliers, including raw material dispatch, finished goods receipt, quality inspection, rejection handl"
---

# Subcontracting Blueprint

> Subcontracting workflow for outsourcing manufacturing to suppliers, including raw material dispatch, finished goods receipt, quality inspection, rejection handling, and cost tracking.


| | |
|---|---|
| **Feature** | `subcontracting` |
| **Category** | Manufacturing |
| **Version** | 1.0.0 |
| **Tags** | subcontracting, outsourced-manufacturing, supplier, contract-manufacturing, procurement |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/manufacturing/subcontracting.blueprint.yaml) |
| **JSON API** | [subcontracting.json]({{ site.baseurl }}/api/blueprints/manufacturing/subcontracting.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `purchase_order` | text | Yes | Purchase Order Reference | Validations: required |
| `supplier` | text | Yes | Supplier | Validations: required |
| `order_items` | json | Yes | Finished Goods Items | Validations: required |
| `service_items` | json | No | Service Items |  |
| `supplied_items` | json | Yes | Supplied Raw Materials | Validations: required |
| `order_status` | select | Yes | Order Status |  |
| `order_additional_costs` | json | No | Order Additional Costs |  |
| `distribute_additional_costs_based_on` | select | No | Distribute Additional Costs Based On |  |
| `reserve_stock` | boolean | No | Reserve Stock |  |
| `receipt_company` | text | Yes | Company |  |
| `receipt_posting_date` | date | Yes | Posting Date |  |
| `receipt_items` | json | Yes | Received Items |  |
| `receipt_supplied_items` | json | No | Consumed Raw Materials |  |
| `is_return` | boolean | No | Is Return |  |
| `return_against` | text | No | Return Against Receipt |  |
| `bill_no` | text | No | Supplier Invoice Number |  |
| `bill_date` | date | No | Supplier Invoice Date |  |
| `receipt_additional_costs` | json | No | Receipt Additional Costs |  |
| `receipt_status` | select | Yes | Receipt Status |  |

## States

**State field:** `order_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `draft` | Yes |  |
| `open` |  |  |
| `partially_received` |  |  |
| `completed` |  | Yes |
| `closed` |  | Yes |
| `cancelled` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `draft` | `open` | procurement_manager | Purchase order must be submitted with subcontracted flag |
|  | `open` | `partially_received` | warehouse_operator |  |
|  | `partially_received` | `completed` | warehouse_operator | All ordered quantities received within tolerance |
|  | `open` | `completed` | warehouse_operator |  |
|  | `open` | `closed` | procurement_manager |  |
|  | `partially_received` | `closed` | procurement_manager |  |
|  | `draft` | `cancelled` | procurement_manager |  |

## Rules

- **purchase_order_subcontracted:**
  - **description:** The linked purchase order must be in submitted status with the subcontracted flag enabled. Non-subcontracted purchase orders cannot be used.

- **items_must_be_stock:**
  - **description:** All finished good items in the order must be stock items with a valid BOM. Non-stock items are only allowed in the service items table.

- **service_items_non_stock:**
  - **description:** Service items represent non-stock charges (labor, handling, etc.) and must not be stock items. They are added to the cost of finished goods.

- **warehouse_conflict_prevention:**
  - **description:** The raw material reserve warehouse cannot be the same as the supplier warehouse. Materials must move from an internal warehouse to the supplier location.

- **raw_material_reservation:**
  - **description:** Raw materials are reserved from the specified reserve warehouse when reserve_stock is enabled. Reserved quantities are deducted from available stock to prevent over-commitment.

- **receipt_qty_tolerance:**
  - **description:** Received quantity per item cannot exceed the ordered quantity plus the configured over-receipt tolerance percentage. Excess receipts are rejected.

- **quality_inspection_on_receipt:**
  - **description:** If the BOM specifies inspection_required, a quality inspection must be created and approved for each received item before the receipt can be submitted.

- **rejected_items_warehouse:**
  - **description:** Items that fail quality inspection are moved to a separate rejected items warehouse. The rejected quantity is tracked separately from accepted quantity.

- **cost_calculation:**
  - **description:** Total cost per finished good equals raw material cost plus service charges plus additional costs. Additional costs are distributed across items based on quantity or amount as configured.


## Outcomes

### Create_subcontracting_order (Priority: 1) — Error: `SC_PO_NOT_SUBCONTRACTED`

**Given:**
- purchase order exists with subcontracted flag enabled
- all items have valid BOMs
- supplier and warehouses are specified

**Then:**
- **create_record** — Create subcontracting order with items and supplied materials
- **set_field** target: `order_status` value: `open`
- **set_field** target: `supplied_items` — Populate raw materials from BOMs of ordered items
- **emit_event** event: `subcontract.order_created`

**Result:** Subcontracting order created with raw material requirements from BOMs

### Send_raw_materials (Priority: 2)

**Given:**
- `order_status` (db) eq `open`
- raw materials are available in reserve warehouse

**Then:**
- **create_record** — Create stock entry to transfer raw materials to supplier
- **set_field** target: `supplied_items` — Update supplied quantity for each raw material
- **emit_event** event: `subcontract.materials_sent`

**Result:** Raw materials dispatched to supplier via stock transfer entry

### Receive_finished_goods (Priority: 3) — Error: `SC_OVERRECEIPT`

**Given:**
- `order_status` (db) in `open,partially_received`
- received quantity is within ordered quantity plus tolerance

**Then:**
- **create_record** — Create receipt with received quantities and consumed materials
- **set_field** target: `receipt_supplied_items` — Record raw materials consumed by supplier
- **transition_state** field: `order_status` from: `open` to: `partially_received` — Or to completed if all quantities received
- **emit_event** event: `subcontract.goods_received`

**Result:** Finished goods received and raw material consumption recorded

### Reject_items (Priority: 4) — Error: `SC_INSPECTION_FAILED`

**Given:**
- received items fail quality inspection
- rejected items warehouse is configured

**Then:**
- **set_field** target: `receipt_items` — Split received quantity into accepted and rejected
- **create_record** — Move rejected items to rejected items warehouse
- **emit_event** event: `subcontract.items_rejected`

**Result:** Rejected items moved to separate warehouse with rejection reason recorded

### Process_return (Priority: 5)

**Given:**
- receipt exists in completed status
- `is_return` (input) eq `true`

**Then:**
- **create_record** — Create return receipt with negative quantities
- **set_field** target: `receipt_status` value: `return_issued`
- **set_field** target: `supplied_items` — Reverse raw material consumption for returned items

**Result:** Return processed with finished goods returned and raw material consumption reversed

### Close_order (Priority: 6)

**Given:**
- `order_status` (db) in `open,partially_received`

**Then:**
- **transition_state** field: `order_status` from: `open` to: `closed` — Or from partially_received to closed
- **emit_event** event: `subcontract.order_completed`

**Result:** Subcontracting order closed; no further receipts can be made

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SC_PO_NOT_SUBCONTRACTED` | 422 | The linked purchase order must have the subcontracted flag enabled. | Yes |
| `SC_ITEM_NOT_STOCK` | 422 | All finished good items must be stock items with a valid BOM. | Yes |
| `SC_WAREHOUSE_CONFLICT` | 422 | Raw material reserve warehouse cannot be the same as the supplier warehouse. | Yes |
| `SC_OVERRECEIPT` | 422 | Received quantity exceeds the ordered quantity plus the allowed tolerance. | No |
| `SC_INSPECTION_FAILED` | 422 | Quality inspection must be completed and approved before accepting received items. | Yes |
| `SC_BOM_QTY_MISMATCH` | 422 | Consumed raw material quantities do not match the expected BOM quantities within tolerance. | Yes |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `subcontract.order_created` | Fired when a new subcontracting order is created and submitted | `order_id`, `supplier`, `items`, `supplied_items` |
| `subcontract.materials_sent` | Fired when raw materials are dispatched to the supplier | `order_id`, `supplier`, `materials`, `warehouse` |
| `subcontract.goods_received` | Fired when finished goods are received from the supplier | `order_id`, `receipt_id`, `received_items`, `consumed_materials` |
| `subcontract.items_rejected` | Fired when received items fail quality inspection and are rejected | `order_id`, `receipt_id`, `rejected_items`, `rejection_reason` |
| `subcontract.order_completed` | Fired when a subcontracting order is fully received or closed | `order_id`, `supplier`, `total_received`, `total_ordered` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| purchase-order-lifecycle | required | Subcontracting orders are linked to purchase orders with subcontracted flag |
| bill-of-materials | required | BOMs define raw material requirements for subcontracted items |
| stock-entry-movements | required | Stock entries handle raw material dispatch and finished goods receipt |
| quality-inspection | optional | Quality inspection validates received goods before acceptance |

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
  "name": "Subcontracting Blueprint",
  "description": "Subcontracting workflow for outsourcing manufacturing to suppliers, including raw material dispatch, finished goods receipt, quality inspection, rejection handl",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "subcontracting, outsourced-manufacturing, supplier, contract-manufacturing, procurement"
}
</script>
