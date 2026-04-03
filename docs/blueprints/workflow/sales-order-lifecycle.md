---
title: "Sales Order Lifecycle Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Sales order lifecycle from draft through delivery and billing to completion, with credit limits, blanket orders, stock reservation, and auto-status. . 13 fields"
---

# Sales Order Lifecycle Blueprint

> Sales order lifecycle from draft through delivery and billing to completion, with credit limits, blanket orders, stock reservation, and auto-status.


| | |
|---|---|
| **Feature** | `sales-order-lifecycle` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | sales, order-management, delivery, billing, credit-limit, stock-reservation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/workflow/sales-order-lifecycle.blueprint.yaml) |
| **JSON API** | [sales-order-lifecycle.json]({{ site.baseurl }}/api/blueprints/workflow/sales-order-lifecycle.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `sales_user` | Sales User | human | Creates and submits sales orders, monitors fulfillment progress |
| `warehouse_user` | Warehouse User | human | Creates delivery notes from sales orders, manages stock picking |
| `accounts_user` | Accounts User | human | Creates sales invoices from sales orders, manages billing |
| `system` | System | system | Validates credit limits, computes status, enforces stock rules |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `customer` | text | Yes | Customer |  |
| `transaction_date` | date | Yes | Transaction Date |  |
| `delivery_date` | date | No | Delivery Date |  |
| `items` | json | Yes | Order Items |  |
| `grand_total` | number | Yes | Grand Total |  |
| `per_delivered` | number | No | % Delivered | Validations: min, max |
| `per_billed` | number | No | % Billed | Validations: min, max |
| `per_picked` | number | No | % Picked | Validations: min, max |
| `status` | select | Yes | Status |  |
| `advance_paid` | number | No | Advance Paid |  |
| `advance_payment_status` | select | No | Advance Payment Status |  |
| `payment_schedule` | json | No | Payment Schedule |  |
| `reserve_stock` | boolean | No | Reserve Stock |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `Draft` | Yes |  |
| `On Hold` |  |  |
| `To Pay` |  |  |
| `To Deliver and Bill` |  |  |
| `To Bill` |  |  |
| `To Deliver` |  |  |
| `Completed` |  | Yes |
| `Cancelled` |  | Yes |
| `Closed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `Draft` | `On Hold` | sales_user |  |
|  | `On Hold` | `Draft` | sales_user |  |
|  | `Draft` | `To Pay` | sales_user | Advance payment is required and not yet received |
|  | `Draft` | `To Deliver and Bill` | sales_user | Credit limit not exceeded, all validations pass |
|  | `To Deliver and Bill` | `To Bill` | warehouse_user | per_delivered reaches 100% |
|  | `To Deliver and Bill` | `To Deliver` | accounts_user | per_billed reaches 100% |
|  | `To Deliver and Bill,To Bill,To Deliver` | `Completed` | system | per_delivered == 100% and per_billed == 100% |
|  | `Draft,On Hold,To Pay,To Deliver and Bill,To Bill,To Deliver` | `Cancelled` | sales_user | No linked documents prevent cancellation |
|  | `To Deliver and Bill,To Bill,To Deliver,Completed` | `Closed` | sales_user |  |

## Rules

- **credit_limit_on_submit:**
  - **description:** System validates the customer's credit limit before allowing order submission. Outstanding amount plus new order total must not exceed the configured credit limit for the customer-company pair.

- **blanket_order_compliance:**
  - **description:** If items reference a blanket order, the ordered quantity and rate must comply with the blanket order terms. Rate cannot exceed blanket order rate, and total ordered qty cannot exceed blanket order qty.

- **stock_items_need_warehouse:**
  - **description:** Every line item that is a stock item must have a warehouse assigned. Non-stock and service items do not require a warehouse.

- **status_auto_computed:**
  - **description:** Status is automatically computed based on per_delivered and per_billed percentages. No manual status override is allowed on submitted orders.

- **naming_series:**
  - **description:** Sales orders follow the naming series pattern SAL-ORD-.YYYY.- generating sequential document names per fiscal year.

- **amendment_creates_new_version:**
  - **description:** Amending a cancelled order creates a new sales order with a version suffix (e.g., SAL-ORD-2024-00001-1) and links back to the original.

- **reserve_stock_on_submit:**
  - **description:** When reserve_stock is enabled, stock is reserved in the specified warehouses upon order submission to prevent overselling.


## Outcomes

### Create_sales_order (Priority: 1)

**Given:**
- sales user provides customer, items, and delivery date
- at least one line item is present with valid item code, qty, and rate

**Then:**
- **create_record** — Create sales order in Draft status
- **set_field** target: `status` value: `Draft`

**Result:** Sales order created in Draft status with computed totals

### Credit_limit_exceeded (Priority: 1) — Error: `SO_CREDIT_LIMIT_EXCEEDED`

**Given:**
- sales user submits order
- `grand_total` (computed) gt `0`

**Then:**
- **notify** — Display credit limit exceeded warning with outstanding amount

**Result:** Submission blocked until credit limit is resolved or overridden

### Warehouse_required (Priority: 1) — Error: `SO_WAREHOUSE_REQUIRED`

**Given:**
- sales user submits order
- one or more stock items do not have a warehouse assigned

**Then:**
- **notify** — Highlight items missing warehouse assignment

**Result:** Submission blocked until all stock items have warehouses

### Blanket_order_violation (Priority: 1) — Error: `SO_BLANKET_ORDER_VIOLATION`

**Given:**
- item references a blanket order
- ordered qty or rate violates blanket order terms

**Then:**
- **notify** — Show blanket order constraint that was violated

**Result:** Submission blocked until blanket order compliance is met

### Overallocation_prevented (Priority: 1) — Error: `SO_OVERALLOCATION`

**Given:**
- delivery note qty exceeds sales order qty beyond tolerance

**Then:**
- **notify** — Show allowed qty vs attempted qty

**Result:** Over-delivery prevented, qty must be within allowed tolerance

### Submit_order (Priority: 2) | Transaction: atomic

**Given:**
- sales order is in Draft status
- customer credit limit is not exceeded
- all stock items have warehouses assigned
- blanket order terms are satisfied (if applicable)

**Then:**
- **transition_state** field: `status` from: `Draft` to: `To Deliver and Bill`
- **set_field** target: `per_delivered` value: `0`
- **set_field** target: `per_billed` value: `0`
- **emit_event** event: `sales_order.submitted`

**Result:** Sales order submitted and ready for fulfillment

### Create_delivery_note (Priority: 3)

**Given:**
- sales order is in To Deliver and Bill or To Deliver status
- items have sufficient stock in assigned warehouses

**Then:**
- **create_record** — Create delivery note linked to this sales order
- **set_field** target: `per_delivered` — Updated based on delivered qty vs ordered qty
- **emit_event** event: `sales_order.delivered`

**Result:** Delivery note created, delivery percentage updated

### Create_sales_invoice (Priority: 4)

**Given:**
- sales order is in To Deliver and Bill or To Bill status

**Then:**
- **create_record** — Create sales invoice linked to this sales order
- **set_field** target: `per_billed` — Updated based on billed qty vs ordered qty
- **emit_event** event: `sales_order.billed`

**Result:** Sales invoice created, billing percentage updated

### Close_order (Priority: 5)

**Given:**
- sales order is in a submitted status (not Draft or Cancelled)
- sales user elects to close the order

**Then:**
- **transition_state** field: `status` to: `Closed`
- **emit_event** event: `sales_order.completed`

**Result:** Sales order closed, no further deliveries or invoices created

### Cancel_order (Priority: 6) | Transaction: atomic

**Given:**
- sales order has no linked submitted delivery notes or invoices
- sales user cancels the order

**Then:**
- **transition_state** field: `status` to: `Cancelled`
- **emit_event** event: `sales_order.cancelled`

**Result:** Sales order cancelled, reserved stock released

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SO_CREDIT_LIMIT_EXCEEDED` | 403 | Customer credit limit exceeded. Outstanding amount plus this order exceeds the allowed limit. | No |
| `SO_WAREHOUSE_REQUIRED` | 422 | Warehouse is required for all stock items in the sales order. | No |
| `SO_BLANKET_ORDER_VIOLATION` | 422 | Order violates blanket order terms. Check qty and rate against the blanket order. | No |
| `SO_OVERALLOCATION` | 422 | Delivery qty exceeds the sales order qty beyond the allowed tolerance. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `sales_order.submitted` | Sales order has been submitted for fulfillment | `order_id`, `customer`, `grand_total`, `delivery_date` |
| `sales_order.delivered` | Delivery note created against the sales order | `order_id`, `delivery_note_id`, `per_delivered` |
| `sales_order.billed` | Sales invoice created against the sales order | `order_id`, `invoice_id`, `per_billed` |
| `sales_order.completed` | Sales order fully delivered and billed, or manually closed | `order_id`, `per_delivered`, `per_billed` |
| `sales_order.cancelled` | Sales order has been cancelled | `order_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| sales-purchase-invoicing | required | Invoicing engine for creating sales invoices from orders |
| pick-list-shipping | recommended | Pick list and shipping workflow for warehouse fulfillment |
| customer-supplier-management | recommended | Customer master data, credit limits, and territory management |
| pricing-rules-promotions | optional | Pricing rules and discount schemes applied to order items |

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
  "name": "Sales Order Lifecycle Blueprint",
  "description": "Sales order lifecycle from draft through delivery and billing to completion, with credit limits, blanket orders, stock reservation, and auto-status.\n. 13 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "sales, order-management, delivery, billing, credit-limit, stock-reservation"
}
</script>
