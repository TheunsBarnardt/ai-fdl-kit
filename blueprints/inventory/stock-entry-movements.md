<!-- AUTO-GENERATED FROM stock-entry-movements.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Stock Entry Movements

> Stock entry and material movement system supporting issue, receipt, transfer, manufacture, repack, and subcontracting with stock ledger and GL entries.

**Category:** Inventory · **Version:** 1.0.0 · **Tags:** stock-entry · material-movement · stock-ledger · valuation · manufacturing · inventory

## What this does

Stock entry and material movement system supporting issue, receipt, transfer, manufacture, repack, and subcontracting with stock ledger and GL entries.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **company** *(text, required)* — Company
- **purpose** *(select, required)* — Stock Entry Purpose
- **posting_date** *(date, required)* — Posting Date
- **posting_time** *(text, required)* — Posting Time
- **from_warehouse** *(text, optional)* — Source Warehouse
- **to_warehouse** *(text, optional)* — Target Warehouse
- **items** *(json, required)* — Stock Entry Items
- **work_order** *(text, optional)* — Work Order
- **bom_no** *(text, optional)* — Bill of Materials
- **fg_completed_qty** *(number, optional)* — Finished Goods Completed Qty
- **process_loss_percentage** *(number, optional)* — Process Loss Percentage
- **inspection_required** *(boolean, optional)* — Inspection Required
- **is_return** *(boolean, optional)* — Is Return

## What must be true

- **purpose_warehouse_requirements:** Purpose determines which warehouse fields are required. Material Issue requires a source warehouse only. Material Receipt requires a target warehouse only. Material Transfer requires both source and target warehouses. Manufacture requires a target warehouse for finished goods.
- **stock_ledger_on_submit:** On submission, stock ledger entries (SLE) are created for each item row tracking actual_qty changes and valuation_rate. Incoming entries increase actual_qty; outgoing entries decrease it. Valuation uses either FIFO or moving average based on item configuration.
- **gl_entries_on_submit:** General ledger entries are created for accounting impact when perpetual inventory is enabled. Debit/credit accounts are derived from warehouse default accounts or item group defaults.
- **serial_batch_validation:** Items with serial number tracking require valid serial numbers matching the quantity. Items with batch tracking require a valid batch number. Serial numbers must exist in the source warehouse for outgoing transactions.
- **manufacture_qty_match:** For Manufacture purpose, the work order quantity must match the fg_completed_qty. Raw material quantities are calculated from the BOM based on fg_completed_qty and process_loss_percentage.
- **backdated_entry_reposting:** When a stock entry is backdated (posting_date/time before the latest existing SLE), all future stock ledger entries and GL entries are recalculated to maintain correct running balances and valuations.
- **stock_freeze:** Entries cannot be posted before the stock freeze date configured in inventory settings. Only users with the stock freeze role can bypass this restriction.

## Success & failure scenarios

**✅ Success paths**

- **Submit Stock Entry** — when stock entry is in draft state with all required fields populated; purpose-specific warehouse requirements are satisfied; all item quantities are greater than zero; serial/batch numbers are valid for tracked items, then Stock entry submitted with SLE and GL entries created.
- **Cancel Stock Entry** — when stock entry is in submitted state; no dependent transactions reference this entry, then Stock entry cancelled with all ledger entries reversed.
- **Transfer Material** — when purpose is Material Transfer; source warehouse has sufficient stock for all items; source and target warehouses belong to the same company, then Material transferred between warehouses with ledger updated.
- **Manufacture Finished Goods** — when purpose is Manufacture; work order and BOM are linked; fg_completed_qty matches expected quantity; raw material quantities satisfy BOM requirements, then Finished goods manufactured and work order progress updated.
- **Valuation Changed** — when stock entry submission changes the valuation rate of an item, then Item valuation rate updated in warehouse.

**❌ Failure paths**

- **Negative Stock Detected** — when outgoing transaction would cause negative stock balance in warehouse; negative stock is not allowed in inventory settings, then Stock entry rejected due to insufficient stock. *(error: `STOCK_NEGATIVE_BALANCE`)*
- **Stock Freeze Violated** — when posting_date is before the configured stock freeze date; user does not have stock freeze bypass role, then Stock entry rejected due to stock freeze restriction. *(error: `STOCK_FREEZE_VIOLATION`)*

## Errors it can return

- `STOCK_NEGATIVE_BALANCE` — Insufficient stock: this transaction would result in a negative balance for the item in the specified warehouse.
- `STOCK_FREEZE_VIOLATION` — Stock transactions are frozen before the configured freeze date. Contact a stock manager to bypass.
- `STOCK_WAREHOUSE_MISMATCH` — Source and target warehouses must belong to the same company and match the stock entry purpose.
- `STOCK_BACKDATED_BLOCKED` — Backdated stock entries are not permitted by the current inventory policy.
- `STOCK_INSPECTION_REQUIRED` — Quality inspection must be completed before this stock entry can be submitted.

## Events

**`stock.entry_submitted`** — Stock entry submitted, ledger entries created
  Payload: `entry_id`, `purpose`, `posting_date`, `item_count`

**`stock.entry_cancelled`** — Stock entry cancelled, ledger entries reversed
  Payload: `entry_id`, `purpose`, `posting_date`

**`stock.valuation_changed`** — Item valuation rate changed due to stock transaction
  Payload: `item_code`, `warehouse`, `old_rate`, `new_rate`

**`stock.negative_detected`** — Attempted transaction would cause negative stock balance
  Payload: `item_code`, `warehouse`, `available_qty`, `requested_qty`

## Connects to

- **warehouse-bin-management** *(required)* — Stock entries update bin quantities and require valid warehouse references
- **serial-batch-tracking** *(recommended)* — Serial and batch numbers validated during stock transactions
- **work-orders-job-cards** *(recommended)* — Manufacture entries linked to work orders and BOM

## Quality fitness 🟡 71/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████░░░░░░` | 19/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/inventory/stock-entry-movements/) · **Spec source:** [`stock-entry-movements.blueprint.yaml`](./stock-entry-movements.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
