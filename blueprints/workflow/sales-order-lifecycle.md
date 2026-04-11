<!-- AUTO-GENERATED FROM sales-order-lifecycle.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Sales Order Lifecycle

> Sales order lifecycle from draft through delivery and billing to completion, with credit limits, blanket orders, stock reservation, and auto-status.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** sales · order-management · delivery · billing · credit-limit · stock-reservation

## What this does

Sales order lifecycle from draft through delivery and billing to completion, with credit limits, blanket orders, stock reservation, and auto-status.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **customer** *(text, required)* — Customer
- **transaction_date** *(date, required)* — Transaction Date
- **delivery_date** *(date, optional)* — Delivery Date
- **items** *(json, required)* — Order Items
- **grand_total** *(number, required)* — Grand Total
- **per_delivered** *(number, optional)* — % Delivered
- **per_billed** *(number, optional)* — % Billed
- **per_picked** *(number, optional)* — % Picked
- **status** *(select, required)* — Status
- **advance_paid** *(number, optional)* — Advance Paid
- **advance_payment_status** *(select, optional)* — Advance Payment Status
- **payment_schedule** *(json, optional)* — Payment Schedule
- **reserve_stock** *(boolean, optional)* — Reserve Stock

## What must be true

- **credit_limit_on_submit:** System validates the customer's credit limit before allowing order submission. Outstanding amount plus new order total must not exceed the configured credit limit for the customer-company pair.
- **blanket_order_compliance:** If items reference a blanket order, the ordered quantity and rate must comply with the blanket order terms. Rate cannot exceed blanket order rate, and total ordered qty cannot exceed blanket order qty.
- **stock_items_need_warehouse:** Every line item that is a stock item must have a warehouse assigned. Non-stock and service items do not require a warehouse.
- **status_auto_computed:** Status is automatically computed based on per_delivered and per_billed percentages. No manual status override is allowed on submitted orders.
- **naming_series:** Sales orders follow the naming series pattern SAL-ORD-.YYYY.- generating sequential document names per fiscal year.
- **amendment_creates_new_version:** Amending a cancelled order creates a new sales order with a version suffix (e.g., SAL-ORD-2024-00001-1) and links back to the original.
- **reserve_stock_on_submit:** When reserve_stock is enabled, stock is reserved in the specified warehouses upon order submission to prevent overselling.

## Success & failure scenarios

**✅ Success paths**

- **Create Sales Order** — when sales user provides customer, items, and delivery date; at least one line item is present with valid item code, qty, and rate, then Sales order created in Draft status with computed totals.
- **Submit Order** — when sales order is in Draft status; customer credit limit is not exceeded; all stock items have warehouses assigned; blanket order terms are satisfied (if applicable), then Sales order submitted and ready for fulfillment.
- **Create Delivery Note** — when sales order is in To Deliver and Bill or To Deliver status; items have sufficient stock in assigned warehouses, then Delivery note created, delivery percentage updated.
- **Create Sales Invoice** — when sales order is in To Deliver and Bill or To Bill status, then Sales invoice created, billing percentage updated.
- **Close Order** — when sales order is in a submitted status (not Draft or Cancelled); sales user elects to close the order, then Sales order closed, no further deliveries or invoices created.
- **Cancel Order** — when sales order has no linked submitted delivery notes or invoices; sales user cancels the order, then Sales order cancelled, reserved stock released.

**❌ Failure paths**

- **Credit Limit Exceeded** — when sales user submits order; Customer outstanding plus order total exceeds credit limit, then Submission blocked until credit limit is resolved or overridden. *(error: `SO_CREDIT_LIMIT_EXCEEDED`)*
- **Warehouse Required** — when sales user submits order; one or more stock items do not have a warehouse assigned, then Submission blocked until all stock items have warehouses. *(error: `SO_WAREHOUSE_REQUIRED`)*
- **Blanket Order Violation** — when item references a blanket order; ordered qty or rate violates blanket order terms, then Submission blocked until blanket order compliance is met. *(error: `SO_BLANKET_ORDER_VIOLATION`)*
- **Overallocation Prevented** — when delivery note qty exceeds sales order qty beyond tolerance, then Over-delivery prevented, qty must be within allowed tolerance. *(error: `SO_OVERALLOCATION`)*

## Errors it can return

- `SO_CREDIT_LIMIT_EXCEEDED` — Customer credit limit exceeded. Outstanding amount plus this order exceeds the allowed limit.
- `SO_WAREHOUSE_REQUIRED` — Warehouse is required for all stock items in the sales order.
- `SO_BLANKET_ORDER_VIOLATION` — Order violates blanket order terms. Check qty and rate against the blanket order.
- `SO_OVERALLOCATION` — Delivery qty exceeds the sales order qty beyond the allowed tolerance.

## Connects to

- **sales-purchase-invoicing** *(required)* — Invoicing engine for creating sales invoices from orders
- **pick-list-shipping** *(recommended)* — Pick list and shipping workflow for warehouse fulfillment
- **customer-supplier-management** *(recommended)* — Customer master data, credit limits, and territory management
- **pricing-rules-promotions** *(optional)* — Pricing rules and discount schemes applied to order items

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/sales-order-lifecycle/) · **Spec source:** [`sales-order-lifecycle.blueprint.yaml`](./sales-order-lifecycle.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
