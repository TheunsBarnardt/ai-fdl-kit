<!-- AUTO-GENERATED FROM serial-batch-tracking.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Serial Batch Tracking

> Serial number and batch tracking with lifecycle management, batch-wise valuation, expiry tracking, and serial/batch bundles.

**Category:** Inventory · **Version:** 1.0.0 · **Tags:** serial-number · batch-tracking · traceability · expiry · inventory · valuation

## What this does

Serial number and batch tracking with lifecycle management, batch-wise valuation, expiry tracking, and serial/batch bundles.

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **serial_no** *(text, required)* — Serial Number
- **item_code** *(text, required)* — Item Code
- **batch_no** *(text, optional)* — Batch Number
- **warehouse** *(text, optional)* — Current Warehouse
- **status** *(select, required)* — Serial Status
- **warranty_expiry_date** *(date, optional)* — Warranty Expiry Date
- **amc_expiry_date** *(date, optional)* — AMC Expiry Date
- **maintenance_status** *(select, optional)* — Maintenance Status
- **purchase_rate** *(number, optional)* — Purchase Rate
- **batch_id** *(text, required)* — Batch ID
- **batch_item** *(text, required)* — Batch Item Code
- **expiry_date** *(date, optional)* — Expiry Date
- **manufacturing_date** *(date, optional)* — Manufacturing Date
- **batch_qty** *(number, optional)* — Batch Quantity
- **use_batchwise_valuation** *(boolean, optional)* — Use Batch-wise Valuation
- **batch_disabled** *(boolean, optional)* — Batch Disabled
- **bundle_item_code** *(text, required)* — Bundle Item Code
- **bundle_warehouse** *(text, required)* — Bundle Warehouse
- **type_of_transaction** *(select, required)* — Transaction Type
- **entries** *(json, required)* — Bundle Entries
- **total_qty** *(number, optional)* — Total Quantity
- **total_amount** *(number, optional)* — Total Amount
- **avg_rate** *(number, optional)* — Average Rate
- **is_cancelled** *(boolean, optional)* — Is Cancelled

## What must be true

- **serial_uniqueness:** Serial numbers must be globally unique per item. The same serial number cannot exist for two different items. Duplicate serial numbers within the same item are rejected at creation time.
- **serial_warehouse_immutability:** A serial number's warehouse can only change through stock transactions (stock entry, purchase receipt, delivery note). Direct modification of the warehouse field is not permitted.
- **batch_expiry_validation:** For outgoing transactions (delivery, issue), the batch expiry date must be on or after the current date. Expired batches cannot be used for outgoing stock movements unless explicitly overridden.
- **batch_deletion_protection:** A batch cannot be deleted if it has been referenced in any stock ledger entry. Historical traceability must be preserved.
- **bundle_no_duplicates:** A serial and batch bundle must not contain duplicate serial numbers or duplicate batch entries. Each serial number or batch row must appear exactly once in the bundle.
- **maintenance_status_auto_calculation:** Maintenance status is automatically derived from warranty_expiry_date and amc_expiry_date. If warranty is active, status is "Under Warranty". If warranty expired but AMC is active, status is "Under AMC". Otherwise the corresponding "Out of" status applies.

## Success & failure scenarios

**✅ Success paths**

- **Create Serial** — when item is configured for serial number tracking; serial number is unique for the item; incoming stock transaction provides the serial number, then Serial number created and tracked in the specified warehouse.
- **Consume Serial** — when serial number exists and is in Active status; outgoing stock transaction references the serial number; transaction type is manufacturing consumption, then Serial number marked as consumed and removed from warehouse.
- **Deliver Serial** — when serial number exists and is in Active status; outgoing delivery transaction references the serial number, then Serial number marked as delivered to customer.
- **Create Batch** — when item is configured for batch tracking; batch ID is unique for the item, then Batch created and available for stock transactions.
- **Track Expiry** — when batch has an expiry date; current date is past the expiry date, then Batch flagged as expired and blocked from outgoing transactions.
- **Create Bundle** — when stock transaction involves multiple serial numbers or batches; bundle entries contain no duplicate serial numbers or batch rows; total quantity matches the sum of entry quantities, then Serial and batch bundle created for grouped transaction processing.

**❌ Failure paths**

- **Serial Duplicate Rejected** — when serial number already exists for the item, then Serial number creation rejected due to duplicate. *(error: `SERIAL_DUPLICATE`)*
- **Serial Warehouse Mismatch** — when outgoing transaction references a serial number; serial number is not in the specified source warehouse, then Transaction rejected because serial is in a different warehouse. *(error: `SERIAL_WAREHOUSE_MISMATCH`)*
- **Batch Expired Rejection** — when outgoing transaction references a batch; Batch expiry date is before today, then Transaction rejected because batch has expired. *(error: `BATCH_EXPIRED`)*

## Errors it can return

- `SERIAL_DUPLICATE` — Serial number already exists for this item.
- `SERIAL_WAREHOUSE_MISMATCH` — Serial number is not in the specified warehouse. Check the current location.
- `SERIAL_FUTURE_TRANSACTION` — Cannot process a serial number transaction with a future date.
- `BATCH_EXPIRED` — Batch has expired and cannot be used for outgoing transactions.
- `BATCH_NEGATIVE_STOCK` — Transaction would result in negative batch quantity.
- `BUNDLE_DUPLICATE_ENTRY` — Bundle contains duplicate serial numbers or batch entries.

## Connects to

- **stock-entry-movements** *(required)* — Stock entries are the primary mechanism for serial/batch movement
- **warehouse-bin-management** *(required)* — Serial and batch quantities are tracked per warehouse bin

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/inventory/serial-batch-tracking/) · **Spec source:** [`serial-batch-tracking.blueprint.yaml`](./serial-batch-tracking.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
