<!-- AUTO-GENERATED FROM landed-cost-valuation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Landed Cost Valuation

> Landed cost allocation, stock reconciliation, and valuation reposting. Distributes charges across receipt items, adjusts stock quantities/valuations, and recalculates historical entries.

**Category:** Inventory · **Version:** 1.0.0 · **Tags:** landed-cost · valuation · stock-reconciliation · repost-valuation · cost-allocation · inventory-adjustment

## What this does

Landed cost allocation, stock reconciliation, and valuation reposting. Distributes charges across receipt items, adjusts stock quantities/valuations, and recalculates historical entries.

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **posting_date** *(date, required)* — Posting Date
- **company** *(text, required)* — Company
- **distribute_charges_based_on** *(select, required)* — Distribute Charges Based On
- **purchase_receipts** *(json, required)* — Purchase Receipts
- **items** *(json, optional)* — Items
- **taxes** *(json, required)* — Taxes and Charges
- **vendor_invoices** *(json, optional)* — Vendor Invoices
- **total_taxes_and_charges** *(number, optional)* — Total Taxes and Charges
- **reconciliation_posting_date** *(date, optional)* — Reconciliation Posting Date
- **purpose** *(select, optional)* — Purpose
- **reconciliation_items** *(json, optional)* — Reconciliation Items
- **difference_amount** *(number, optional)* — Difference Amount
- **expense_account** *(text, optional)* — Expense Account
- **based_on** *(select, optional)* — Repost Based On
- **voucher_type** *(text, optional)* — Voucher Type
- **voucher_no** *(text, optional)* — Voucher Number
- **repost_item_code** *(text, optional)* — Repost Item Code
- **repost_warehouse** *(text, optional)* — Repost Warehouse
- **repost_posting_date** *(date, optional)* — Repost From Date
- **repost_status** *(select, optional)* — Repost Status
- **allow_negative_stock** *(boolean, optional)* — Allow Negative Stock
- **repost_only_accounting_ledgers** *(boolean, optional)* — Repost Only Accounting Ledgers

## What must be true

- **receipts_must_be_submitted:** Purchase receipt documents must be submitted (not draft or cancelled) and belong to the same company as the landed cost voucher.
- **charges_distributed_proportionally:** Additional charges are distributed across receipt items proportionally based on the selected method (quantity or amount).
- **total_charges_must_equal:** Total applicable charges across all items must equal the total taxes and charges amount. No unallocated charges allowed.
- **vendor_invoices_non_stock:** Vendor invoices referenced must be for non-stock items only (service charges, freight, etc.).
- **landed_cost_updates_valuation:** Submitting a landed cost voucher updates the item valuation rate on the purchase receipt and creates corresponding GL entries.
- **reconciliation_adjusts_values:** Stock reconciliation adjusts both quantity and valuation rate to target values, creating stock ledger and GL entries.
- **repost_async_processing:** Repost valuation recalculates historical stock ledger and GL entries asynchronously via a background job queue.
- **repost_period_restriction:** Cannot repost valuation for dates before the last period closing voucher date or frozen accounting periods.
- **repost_deduplication:** Parallel reposting requests for the same item-warehouse-date combination are deduplicated to prevent conflicts.

## Success & failure scenarios

**❌ Failure paths**

- **Create Landed Cost** — when posting_date, company, and purchase_receipts are provided; taxes with expense accounts and amounts are provided, then Landed cost voucher created with items from purchase receipts. *(error: `LCV_RECEIPT_NOT_SUBMITTED`)*
- **Distribute Charges** — when landed cost voucher exists with items and taxes; distribute_charges_based_on is selected, then Charges distributed across items proportionally. *(error: `LCV_CHARGES_MISMATCH`)*
- **Update Item Valuation** — when landed cost voucher is submitted; applicable charges are fully distributed, then Item valuation updated with landed costs and GL entries posted. *(error: `LCV_WRONG_COMPANY`)*
- **Reconcile Stock** — when reconciliation_items with target qty and valuation_rate are provided; expense_account is specified, then Stock quantities and valuations adjusted to target values. *(error: `RECON_SERIAL_NOT_FOUND`)*
- **Repost Valuation** — when based_on, posting_date, and item/warehouse or voucher are specified; posting_date is after last period closing voucher, then Valuation repost queued for asynchronous recalculation. *(error: `REPOST_PERIOD_CLOSED`)*
- **Recalculate Gl Entries** — when repost valuation job is in progress; stock ledger entries have been recalculated, then General ledger entries recalculated to reflect corrected valuations. *(error: `REPOST_ACCOUNTING_FROZEN`)*

## Errors it can return

- `LCV_RECEIPT_NOT_SUBMITTED` — One or more purchase receipts are not submitted or do not exist.
- `LCV_CHARGES_MISMATCH` — Total applicable charges do not equal total taxes and charges amount.
- `LCV_WRONG_COMPANY` — Purchase receipt does not belong to the same company as the landed cost voucher.
- `RECON_SERIAL_NOT_FOUND` — The specified serial number was not found in the system.
- `REPOST_PERIOD_CLOSED` — Cannot repost valuation for dates before the last period closing voucher.
- `REPOST_ACCOUNTING_FROZEN` — Cannot modify GL entries for a frozen accounting period.

## Events

**`landed_cost.submitted`** — Fired when a landed cost voucher is submitted
  Payload: `purchase_receipts`, `total_taxes_and_charges`

**`valuation.updated`** — Fired when item valuation rates are updated
  Payload: `items`, `new_valuation_rates`

**`stock.reconciled`** — Fired when stock reconciliation is completed
  Payload: `reconciliation_items`, `difference_amount`

**`repost.completed`** — Fired when valuation repost completes successfully
  Payload: `based_on`, `repost_item_code`, `repost_warehouse`

**`repost.failed`** — Fired when valuation repost fails
  Payload: `based_on`, `repost_item_code`, `error_message`

## Connects to

- **stock-entry-movements** *(required)* — Stock ledger entries affected by valuation changes
- **warehouse-bin-management** *(required)* — Warehouse bin quantities adjusted during reconciliation
- **general-ledger** *(required)* — GL entries created for all valuation changes
- **serial-batch-tracking** *(optional)* — Serial numbers validated during stock reconciliation

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `█████` | 5/5 |

**Recent auto-improvements** *(via autoresearch-style keep-or-reset loop — applied only because they raised the fitness score)*

- `T4` **sequential-priority** — added priority to 6 outcomes

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/inventory/landed-cost-valuation/) · **Spec source:** [`landed-cost-valuation.blueprint.yaml`](./landed-cost-valuation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
