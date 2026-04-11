<!-- AUTO-GENERATED FROM purchase-order-lifecycle.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Purchase Order Lifecycle

> Purchase order lifecycle from draft through receipt and billing to completion, with supplier validation, material request tracking, warehouse bin updates, and over-receipt tolerance enforcement.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** purchasing · procurement · order-management · goods-receipt · billing · material-request

## What this does

Purchase order lifecycle from draft through receipt and billing to completion, with supplier validation, material request tracking, warehouse bin updates, and over-receipt tolerance enforcement.

Specifies 11 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **supplier** *(text, required)* — Supplier
- **transaction_date** *(date, required)* — Transaction Date
- **schedule_date** *(date, required)* — Required By Date
- **items** *(json, required)* — Order Items
- **grand_total** *(number, required)* — Grand Total
- **per_received** *(number, optional)* — % Received
- **per_billed** *(number, optional)* — % Billed
- **status** *(select, required)* — Status
- **is_subcontracted** *(boolean, optional)* — Is Subcontracted

## What must be true

- **supplier_not_on_hold:** Orders cannot be submitted to a supplier that is currently on hold. The hold must be released before the order can proceed.
- **supplier_not_closed:** Orders cannot be created for a supplier that has been permanently disabled or closed in the system.
- **material_request_tracking:** When items originate from a material request, the ordered quantity is tracked against the material request item. The material request status updates based on how much has been ordered.
- **posting_date_validation:** Purchase receipt and purchase invoice posting dates must be on or after the purchase order transaction date.
- **warehouse_bin_update_on_submit:** On submission, ordered quantity is updated in the warehouse bin for each item-warehouse combination, enabling stock planning visibility.
- **over_receipt_tolerance:** Received quantity cannot exceed the ordered quantity beyond the configured over-receipt tolerance percentage for the item or globally.
- **last_purchase_rate_tracking:** The system tracks the last purchase rate per supplier-item pair after receipt, used for future pricing reference and reports.
- **subcontract_raw_material_transfer:** For subcontracted orders, raw materials must be transferred to the supplier warehouse before the finished goods can be received.

## Success & failure scenarios

**✅ Success paths**

- **Create Purchase Order** — when purchase user provides supplier, items, and schedule date; supplier is active and not on hold or closed; at least one line item with valid item code, qty, and rate, then Purchase order created in Draft status with computed totals.
- **Submit Order** — when purchase order is in Draft status; supplier is not on hold and not closed; all items have valid warehouses for stock items, then Purchase order submitted, warehouse bins updated with ordered quantities.
- **Create Purchase Receipt** — when purchase order is in To Receive and Bill or To Receive status; received qty does not exceed ordered qty beyond tolerance, then Purchase receipt created, stock updated, receipt percentage recalculated.
- **Create Purchase Invoice** — when purchase order is in To Receive and Bill or To Bill status, then Purchase invoice created, billing percentage updated.
- **Close Order** — when purchase order is in a submitted status (not Draft or Cancelled); purchase user elects to close the order, then Purchase order closed, no further receipts or invoices expected.
- **Cancel Order** — when purchase order has no linked submitted receipts or invoices; purchase user cancels the order, then Purchase order cancelled, warehouse bin ordered quantities reversed.

**❌ Failure paths**

- **Supplier On Hold Blocked** — when purchase user submits order; supplier is currently on hold, then Submission blocked until supplier hold is released. *(error: `PO_SUPPLIER_ON_HOLD`)*
- **Supplier Closed Blocked** — when purchase user creates or submits order; supplier is disabled or closed, then Order cannot proceed with a closed supplier. *(error: `PO_SUPPLIER_CLOSED`)*
- **Qty Mismatch Blocked** — when purchase receipt qty exceeds ordered qty beyond tolerance, then Over-receipt prevented, qty must be within tolerance. *(error: `PO_QTY_MISMATCH`)*
- **Posting Date Invalid** — when purchase receipt or invoice posting date is before the purchase order date, then Posting date must be on or after the purchase order transaction date. *(error: `PO_POSTING_DATE_INVALID`)*
- **Material Request Invalid** — when item references a material request that does not exist or is cancelled, then Material request reference is invalid or no longer active. *(error: `PO_MATERIAL_REQUEST_INVALID`)*

## Errors it can return

- `PO_SUPPLIER_ON_HOLD` — Supplier is currently on hold. Release the hold before submitting this order.
- `PO_SUPPLIER_CLOSED` — Supplier is disabled or closed. Orders cannot be placed with inactive suppliers.
- `PO_QTY_MISMATCH` — Received quantity exceeds ordered quantity beyond the allowed tolerance.
- `PO_POSTING_DATE_INVALID` — Posting date cannot be before the purchase order transaction date.
- `PO_MATERIAL_REQUEST_INVALID` — Referenced material request does not exist or has been cancelled.

## Connects to

- **sales-purchase-invoicing** *(required)* — Invoicing engine for creating purchase invoices from orders
- **stock-entry-movements** *(recommended)* — Stock entry and movement tracking for warehouse operations
- **customer-supplier-management** *(required)* — Supplier master data, hold status, and payment terms
- **subcontracting** *(optional)* — Subcontracting workflow for outsourced manufacturing

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/purchase-order-lifecycle/) · **Spec source:** [`purchase-order-lifecycle.blueprint.yaml`](./purchase-order-lifecycle.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
