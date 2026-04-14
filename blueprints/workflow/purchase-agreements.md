<!-- AUTO-GENERATED FROM purchase-agreements.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Purchase Agreements

> Purchase agreement management supporting blanket orders and calls for tender with vendor selection, purchase order generation, and supplier catalog synchronization.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** procurement · blanket-order · call-for-tender · vendor-management · purchasing

## What this does

Purchase agreement management supporting blanket orders and calls for tender with vendor selection, purchase order generation, and supplier catalog synchronization.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **agreement_type** *(select, required)* — Agreement Type
- **agreement_name** *(text, required)* — Agreement Reference
- **agreement_state** *(select, required)* — State
- **vendor_id** *(text, optional)* — Vendor
- **currency_id** *(text, required)* — Currency
- **date_start** *(date, optional)* — Start Date
- **date_end** *(date, optional)* — End Date
- **agreement_lines** *(json, required)* — Agreement Lines
- **line_product_id** *(text, required)* — Product
- **line_quantity** *(number, required)* — Agreed Quantity
- **line_price_unit** *(number, required)* — Agreed Price
- **quantity_ordered** *(number, optional)* — Quantity Ordered
- **purchase_order_count** *(number, optional)* — Generated POs
- **representative_id** *(text, optional)* — Purchase Representative

## What must be true

- **blanket_order_requires_positive_prices:** When confirming a blanket order, every line must have a unit price greater than zero and a quantity greater than zero.
- **end_date_after_start:** End date must be on or after start date when both are set
- **cannot_close_with_pending_pos:** An agreement cannot be closed (done) while there are purchase orders in draft, sent, or awaiting-approval states linked to it.
- **supplier_catalog_sync_on_confirm:** Confirming a blanket order creates supplier catalog entries linking the vendor to each product at the agreed price.
- **supplier_catalog_cleanup_on_close:** Closing or cancelling an agreement removes the supplier catalog entries it created, restoring previous vendor pricing.
- **type_immutable_after_draft:** Agreement type and company cannot be changed after leaving draft state. Changing in draft regenerates the reference number.
- **delete_only_draft_or_cancel:** Agreements can only be deleted in draft or cancelled state
- **vendor_duplicate_warning:** When selecting a vendor for a blanket order, the system warns if an active blanket order already exists for that vendor (suggests completing the existing one first).

## Success & failure scenarios

**✅ Success paths**

- **Agreement Confirmed** — when procurement officer sets vendor and agreement lines; all lines have valid products, quantities, and prices, then Agreement active, vendor pricing synchronized, POs can be generated.
- **Purchase Order Generated** — when agreement is in confirmed state; procurement officer creates a purchase order from the agreement, then Purchase order created with pre-negotiated terms.
- **Agreement Closed** — when all generated POs are in final state; procurement officer closes the agreement, then Agreement closed, vendor catalog restored to prior state.
- **Agreement Cancelled** — when procurement officer cancels the agreement, then Agreement and linked draft POs cancelled.

**❌ Failure paths**

- **Close Blocked Pending Pos** — when procurement officer attempts to close the agreement; one or more linked POs are still in draft/sent/approval state, then Agreement cannot be closed until all POs are final. *(error: `AGREEMENT_PENDING_POS`)*
- **Confirm Invalid Lines** — when blanket order has lines with zero price or zero quantity, then Confirmation blocked until all lines have valid prices and quantities. *(error: `AGREEMENT_INVALID_LINES`)*

## Errors it can return

- `AGREEMENT_PENDING_POS` — Cannot close agreement while purchase orders are pending. Finalize or cancel them first.
- `AGREEMENT_INVALID_LINES` — All agreement lines must have a positive price and quantity.
- `AGREEMENT_END_BEFORE_START` — Agreement end date must be on or after the start date.
- `AGREEMENT_DELETE_NOT_DRAFT` — Only draft or cancelled agreements can be deleted.

## Events

**`purchase.agreement.confirmed`** — Agreement activated and vendor pricing synchronized
  Payload: `agreement_id`, `vendor_id`, `line_count`

**`purchase.agreement.po_generated`** — Purchase order generated from an agreement
  Payload: `agreement_id`, `purchase_order_id`, `vendor_id`

**`purchase.agreement.closed`** — Agreement closed after fulfillment
  Payload: `agreement_id`, `total_ordered`

**`purchase.agreement.cancelled`** — Agreement cancelled
  Payload: `agreement_id`

## Connects to

- **invoicing-payments** *(required)* — Generated POs lead to vendor bills in accounting
- **automation-rules** *(optional)* — Automate PO generation when stock falls below reorder point

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `████████░░` | 8/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/purchase-agreements/) · **Spec source:** [`purchase-agreements.blueprint.yaml`](./purchase-agreements.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
