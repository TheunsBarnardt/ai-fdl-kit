<!-- AUTO-GENERATED FROM subcontracting.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Subcontracting

> Subcontracting workflow for outsourcing manufacturing to suppliers, including raw material dispatch, finished goods receipt, quality inspection, rejection handling, and cost tracking.

**Category:** Manufacturing · **Version:** 1.0.0 · **Tags:** subcontracting · outsourced-manufacturing · supplier · contract-manufacturing · procurement

## What this does

Subcontracting workflow for outsourcing manufacturing to suppliers, including raw material dispatch, finished goods receipt, quality inspection, rejection handling, and cost tracking.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **purchase_order** *(text, required)* — Purchase Order Reference
- **supplier** *(text, required)* — Supplier
- **order_items** *(json, required)* — Finished Goods Items
- **service_items** *(json, optional)* — Service Items
- **supplied_items** *(json, required)* — Supplied Raw Materials
- **order_status** *(select, required)* — Order Status
- **order_additional_costs** *(json, optional)* — Order Additional Costs
- **distribute_additional_costs_based_on** *(select, optional)* — Distribute Additional Costs Based On
- **reserve_stock** *(boolean, optional)* — Reserve Stock
- **receipt_company** *(text, required)* — Company
- **receipt_posting_date** *(date, required)* — Posting Date
- **receipt_items** *(json, required)* — Received Items
- **receipt_supplied_items** *(json, optional)* — Consumed Raw Materials
- **is_return** *(boolean, optional)* — Is Return
- **return_against** *(text, optional)* — Return Against Receipt
- **bill_no** *(text, optional)* — Supplier Invoice Number
- **bill_date** *(date, optional)* — Supplier Invoice Date
- **receipt_additional_costs** *(json, optional)* — Receipt Additional Costs
- **receipt_status** *(select, required)* — Receipt Status

## What must be true

- **purchase_order_subcontracted:** The linked purchase order must be in submitted status with the subcontracted flag enabled. Non-subcontracted purchase orders cannot be used.
- **items_must_be_stock:** All finished good items in the order must be stock items with a valid BOM. Non-stock items are only allowed in the service items table.
- **service_items_non_stock:** Service items represent non-stock charges (labor, handling, etc.) and must not be stock items. They are added to the cost of finished goods.
- **warehouse_conflict_prevention:** The raw material reserve warehouse cannot be the same as the supplier warehouse. Materials must move from an internal warehouse to the supplier location.
- **raw_material_reservation:** Raw materials are reserved from the specified reserve warehouse when reserve_stock is enabled. Reserved quantities are deducted from available stock to prevent over-commitment.
- **receipt_qty_tolerance:** Received quantity per item cannot exceed the ordered quantity plus the configured over-receipt tolerance percentage. Excess receipts are rejected.
- **quality_inspection_on_receipt:** If the BOM specifies inspection_required, a quality inspection must be created and approved for each received item before the receipt can be submitted.
- **rejected_items_warehouse:** Items that fail quality inspection are moved to a separate rejected items warehouse. The rejected quantity is tracked separately from accepted quantity.
- **cost_calculation:** Total cost per finished good equals raw material cost plus service charges plus additional costs. Additional costs are distributed across items based on quantity or amount as configured.

## Success & failure scenarios

**✅ Success paths**

- **Send Raw Materials** — when order_status eq "open"; raw materials are available in reserve warehouse, then Raw materials dispatched to supplier via stock transfer entry.
- **Process Return** — when receipt exists in completed status; is_return eq true, then Return processed with finished goods returned and raw material consumption reversed.
- **Close Order** — when order_status in ["open","partially_received"], then Subcontracting order closed; no further receipts can be made.

**❌ Failure paths**

- **Create Subcontracting Order** — when purchase order exists with subcontracted flag enabled; all items have valid BOMs; supplier and warehouses are specified, then Subcontracting order created with raw material requirements from BOMs. *(error: `SC_PO_NOT_SUBCONTRACTED`)*
- **Receive Finished Goods** — when order_status in ["open","partially_received"]; received quantity is within ordered quantity plus tolerance, then Finished goods received and raw material consumption recorded. *(error: `SC_OVERRECEIPT`)*
- **Reject Items** — when received items fail quality inspection; rejected items warehouse is configured, then Rejected items moved to separate warehouse with rejection reason recorded. *(error: `SC_INSPECTION_FAILED`)*

## Errors it can return

- `SC_PO_NOT_SUBCONTRACTED` — The linked purchase order must have the subcontracted flag enabled.
- `SC_ITEM_NOT_STOCK` — All finished good items must be stock items with a valid BOM.
- `SC_WAREHOUSE_CONFLICT` — Raw material reserve warehouse cannot be the same as the supplier warehouse.
- `SC_OVERRECEIPT` — Received quantity exceeds the ordered quantity plus the allowed tolerance.
- `SC_INSPECTION_FAILED` — Quality inspection must be completed and approved before accepting received items.
- `SC_BOM_QTY_MISMATCH` — Consumed raw material quantities do not match the expected BOM quantities within tolerance.

## Connects to

- **purchase-order-lifecycle** *(required)* — Subcontracting orders are linked to purchase orders with subcontracted flag
- **bill-of-materials** *(required)* — BOMs define raw material requirements for subcontracted items
- **stock-entry-movements** *(required)* — Stock entries handle raw material dispatch and finished goods receipt
- **quality-inspection** *(optional)* — Quality inspection validates received goods before acceptance

## Quality fitness 🟢 78/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `███████░░░` | 7/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/manufacturing/subcontracting/) · **Spec source:** [`subcontracting.blueprint.yaml`](./subcontracting.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
