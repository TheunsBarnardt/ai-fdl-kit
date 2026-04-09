---
title: "Purchase Order Lifecycle Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Purchase order lifecycle from draft through receipt and billing to completion, with supplier validation, material request tracking, warehouse bin updates, and o"
---

# Purchase Order Lifecycle Blueprint

> Purchase order lifecycle from draft through receipt and billing to completion, with supplier validation, material request tracking, warehouse bin updates, and over-receipt tolerance enforcement.


| | |
|---|---|
| **Feature** | `purchase-order-lifecycle` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | purchasing, procurement, order-management, goods-receipt, billing, material-request |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/purchase-order-lifecycle.blueprint.yaml) |
| **JSON API** | [purchase-order-lifecycle.json]({{ site.baseurl }}/api/blueprints/workflow/purchase-order-lifecycle.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `purchase_user` | Purchase User | human | Creates and submits purchase orders, tracks supplier deliveries |
| `warehouse_user` | Warehouse User | human | Creates purchase receipts when goods arrive at warehouse |
| `accounts_user` | Accounts User | human | Creates purchase invoices and processes supplier payments |
| `system` | System | system | Validates suppliers, updates warehouse bins, computes status |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `supplier` | text | Yes | Supplier |  |
| `transaction_date` | date | Yes | Transaction Date |  |
| `schedule_date` | date | Yes | Required By Date |  |
| `items` | json | Yes | Order Items |  |
| `grand_total` | number | Yes | Grand Total |  |
| `per_received` | number | No | % Received | Validations: min, max |
| `per_billed` | number | No | % Billed | Validations: min, max |
| `status` | select | Yes | Status |  |
| `is_subcontracted` | boolean | No | Is Subcontracted |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `Draft` | Yes |  |
| `On Hold` |  |  |
| `To Receive and Bill` |  |  |
| `To Bill` |  |  |
| `To Receive` |  |  |
| `Completed` |  | Yes |
| `Cancelled` |  | Yes |
| `Closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `Draft` | `On Hold` | purchase_user |  |
|  | `On Hold` | `Draft` | purchase_user |  |
|  | `Draft` | `To Receive and Bill` | purchase_user | Supplier must not be on hold or closed |
|  | `To Receive and Bill` | `To Bill` | warehouse_user | per_received reaches 100% |
|  | `To Receive and Bill` | `To Receive` | accounts_user | per_billed reaches 100% |
|  | `To Receive and Bill,To Bill,To Receive` | `Completed` | system | per_received == 100% and per_billed == 100% |
|  | `Draft,On Hold,To Receive and Bill,To Bill,To Receive` | `Cancelled` | purchase_user | No linked submitted receipts or invoices prevent cancellation |
|  | `To Receive and Bill,To Bill,To Receive,Completed` | `Closed` | purchase_user |  |

## Rules

- **supplier_not_on_hold:**
  - **description:** Orders cannot be submitted to a supplier that is currently on hold. The hold must be released before the order can proceed.

- **supplier_not_closed:**
  - **description:** Orders cannot be created for a supplier that has been permanently disabled or closed in the system.

- **material_request_tracking:**
  - **description:** When items originate from a material request, the ordered quantity is tracked against the material request item. The material request status updates based on how much has been ordered.

- **posting_date_validation:**
  - **description:** Purchase receipt and purchase invoice posting dates must be on or after the purchase order transaction date.

- **warehouse_bin_update_on_submit:**
  - **description:** On submission, ordered quantity is updated in the warehouse bin for each item-warehouse combination, enabling stock planning visibility.

- **over_receipt_tolerance:**
  - **description:** Received quantity cannot exceed the ordered quantity beyond the configured over-receipt tolerance percentage for the item or globally.

- **last_purchase_rate_tracking:**
  - **description:** The system tracks the last purchase rate per supplier-item pair after receipt, used for future pricing reference and reports.

- **subcontract_raw_material_transfer:**
  - **description:** For subcontracted orders, raw materials must be transferred to the supplier warehouse before the finished goods can be received.


## Outcomes

### Create_purchase_order (Priority: 1)

**Given:**
- purchase user provides supplier, items, and schedule date
- supplier is active and not on hold or closed
- at least one line item with valid item code, qty, and rate

**Then:**
- **create_record** — Create purchase order in Draft status
- **set_field** target: `status` value: `Draft`

**Result:** Purchase order created in Draft status with computed totals

### Supplier_on_hold_blocked (Priority: 1) — Error: `PO_SUPPLIER_ON_HOLD`

**Given:**
- purchase user submits order
- supplier is currently on hold

**Then:**
- **notify** — Display supplier on-hold message with hold type and release date

**Result:** Submission blocked until supplier hold is released

### Supplier_closed_blocked (Priority: 1) — Error: `PO_SUPPLIER_CLOSED`

**Given:**
- purchase user creates or submits order
- supplier is disabled or closed

**Then:**
- **notify** — Inform that supplier is no longer active

**Result:** Order cannot proceed with a closed supplier

### Qty_mismatch_blocked (Priority: 1) — Error: `PO_QTY_MISMATCH`

**Given:**
- purchase receipt qty exceeds ordered qty beyond tolerance

**Then:**
- **notify** — Show ordered qty, received qty, and tolerance limit

**Result:** Over-receipt prevented, qty must be within tolerance

### Posting_date_invalid (Priority: 1) — Error: `PO_POSTING_DATE_INVALID`

**Given:**
- purchase receipt or invoice posting date is before the purchase order date

**Then:**
- **notify** — Show PO date and attempted posting date

**Result:** Posting date must be on or after the purchase order transaction date

### Material_request_invalid (Priority: 1) — Error: `PO_MATERIAL_REQUEST_INVALID`

**Given:**
- item references a material request that does not exist or is cancelled

**Then:**
- **notify** — Show invalid material request reference

**Result:** Material request reference is invalid or no longer active

### Submit_order (Priority: 2) | Transaction: atomic

**Given:**
- purchase order is in Draft status
- supplier is not on hold and not closed
- all items have valid warehouses for stock items

**Then:**
- **transition_state** field: `status` from: `Draft` to: `To Receive and Bill`
- **set_field** target: `per_received` value: `0`
- **set_field** target: `per_billed` value: `0`
- **call_service** target: `warehouse_bin_service` — Update ordered qty in warehouse bins for all items
- **emit_event** event: `purchase_order.submitted`

**Result:** Purchase order submitted, warehouse bins updated with ordered quantities

### Create_purchase_receipt (Priority: 3)

**Given:**
- purchase order is in To Receive and Bill or To Receive status
- received qty does not exceed ordered qty beyond tolerance

**Then:**
- **create_record** — Create purchase receipt linked to this order
- **set_field** target: `per_received` — Updated based on received qty vs ordered qty
- **call_service** target: `warehouse_bin_service` — Update actual qty in warehouse bins
- **emit_event** event: `purchase_order.received`

**Result:** Purchase receipt created, stock updated, receipt percentage recalculated

### Create_purchase_invoice (Priority: 4)

**Given:**
- purchase order is in To Receive and Bill or To Bill status

**Then:**
- **create_record** — Create purchase invoice linked to this order
- **set_field** target: `per_billed` — Updated based on billed amount vs ordered amount
- **emit_event** event: `purchase_order.billed`

**Result:** Purchase invoice created, billing percentage updated

### Close_order (Priority: 5)

**Given:**
- purchase order is in a submitted status (not Draft or Cancelled)
- purchase user elects to close the order

**Then:**
- **transition_state** field: `status` to: `Closed`
- **emit_event** event: `purchase_order.completed`

**Result:** Purchase order closed, no further receipts or invoices expected

### Cancel_order (Priority: 6) | Transaction: atomic

**Given:**
- purchase order has no linked submitted receipts or invoices
- purchase user cancels the order

**Then:**
- **transition_state** field: `status` to: `Cancelled`
- **call_service** target: `warehouse_bin_service` — Reverse ordered qty in warehouse bins
- **emit_event** event: `purchase_order.cancelled`

**Result:** Purchase order cancelled, warehouse bin ordered quantities reversed

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PO_SUPPLIER_ON_HOLD` | 403 | Supplier is currently on hold. Release the hold before submitting this order. | No |
| `PO_SUPPLIER_CLOSED` | 422 | Supplier is disabled or closed. Orders cannot be placed with inactive suppliers. | No |
| `PO_QTY_MISMATCH` | 422 | Received quantity exceeds ordered quantity beyond the allowed tolerance. | No |
| `PO_POSTING_DATE_INVALID` | 422 | Posting date cannot be before the purchase order transaction date. | No |
| `PO_MATERIAL_REQUEST_INVALID` | 422 | Referenced material request does not exist or has been cancelled. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `purchase_order.submitted` | Purchase order submitted to supplier | `order_id`, `supplier`, `grand_total`, `schedule_date` |
| `purchase_order.received` | Purchase receipt created against the purchase order | `order_id`, `receipt_id`, `per_received` |
| `purchase_order.billed` | Purchase invoice created against the purchase order | `order_id`, `invoice_id`, `per_billed` |
| `purchase_order.completed` | Purchase order fully received and billed, or manually closed | `order_id`, `per_received`, `per_billed` |
| `purchase_order.cancelled` | Purchase order has been cancelled | `order_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| sales-purchase-invoicing | required | Invoicing engine for creating purchase invoices from orders |
| stock-entry-movements | recommended | Stock entry and movement tracking for warehouse operations |
| customer-supplier-management | required | Supplier master data, hold status, and payment terms |
| subcontracting | optional | Subcontracting workflow for outsourced manufacturing |

## AGI Readiness

### Goals

#### Reliable Purchase Order Lifecycle

Purchase order lifecycle from draft through receipt and billing to completion, with supplier validation, material request tracking, warehouse bin updates, and over-receipt tolerance enforcement.


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
| `sales_purchase_invoicing` | sales-purchase-invoicing | degrade |
| `customer_supplier_management` | customer-supplier-management | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_purchase_order | `supervised` | - | - |
| submit_order | `autonomous` | - | - |
| create_purchase_receipt | `supervised` | - | - |
| create_purchase_invoice | `supervised` | - | - |
| close_order | `autonomous` | - | - |
| cancel_order | `supervised` | - | - |
| supplier_on_hold_blocked | `human_required` | - | - |
| supplier_closed_blocked | `human_required` | - | - |
| qty_mismatch_blocked | `human_required` | - | - |
| posting_date_invalid | `autonomous` | - | - |
| material_request_invalid | `autonomous` | - | - |

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
  "name": "Purchase Order Lifecycle Blueprint",
  "description": "Purchase order lifecycle from draft through receipt and billing to completion, with supplier validation, material request tracking, warehouse bin updates, and o",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "purchasing, procurement, order-management, goods-receipt, billing, material-request"
}
</script>
