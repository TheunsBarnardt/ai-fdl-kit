---
title: "Landed Cost Valuation Blueprint"
layout: default
parent: "Inventory"
grand_parent: Blueprint Catalog
description: "Landed cost allocation, stock reconciliation, and valuation reposting. Distributes charges across receipt items, adjusts stock quantities/valuations, and recalc"
---

# Landed Cost Valuation Blueprint

> Landed cost allocation, stock reconciliation, and valuation reposting. Distributes charges across receipt items, adjusts stock quantities/valuations, and recalculates historical entries.


| | |
|---|---|
| **Feature** | `landed-cost-valuation` |
| **Category** | Inventory |
| **Version** | 1.0.0 |
| **Tags** | landed-cost, valuation, stock-reconciliation, repost-valuation, cost-allocation, inventory-adjustment |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/inventory/landed-cost-valuation.blueprint.yaml) |
| **JSON API** | [landed-cost-valuation.json]({{ site.baseurl }}/api/blueprints/inventory/landed-cost-valuation.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `posting_date` | date | Yes | Posting Date |  |
| `company` | text | Yes | Company |  |
| `distribute_charges_based_on` | select | Yes | Distribute Charges Based On |  |
| `purchase_receipts` | json | Yes | Purchase Receipts |  |
| `items` | json | No | Items |  |
| `taxes` | json | Yes | Taxes and Charges |  |
| `vendor_invoices` | json | No | Vendor Invoices |  |
| `total_taxes_and_charges` | number | No | Total Taxes and Charges | Validations: min |
| `reconciliation_posting_date` | date | No | Reconciliation Posting Date |  |
| `purpose` | select | No | Purpose |  |
| `reconciliation_items` | json | No | Reconciliation Items |  |
| `difference_amount` | number | No | Difference Amount |  |
| `expense_account` | text | No | Expense Account |  |
| `based_on` | select | No | Repost Based On |  |
| `voucher_type` | text | No | Voucher Type |  |
| `voucher_no` | text | No | Voucher Number |  |
| `repost_item_code` | text | No | Repost Item Code |  |
| `repost_warehouse` | text | No | Repost Warehouse |  |
| `repost_posting_date` | date | No | Repost From Date |  |
| `repost_status` | select | No | Repost Status |  |
| `allow_negative_stock` | boolean | No | Allow Negative Stock |  |
| `repost_only_accounting_ledgers` | boolean | No | Repost Only Accounting Ledgers |  |

## Rules

- **receipts_must_be_submitted:**
  - **description:** Purchase receipt documents must be submitted (not draft or cancelled) and belong to the same company as the landed cost voucher.

- **charges_distributed_proportionally:**
  - **description:** Additional charges are distributed across receipt items proportionally based on the selected method (quantity or amount).

- **total_charges_must_equal:**
  - **description:** Total applicable charges across all items must equal the total taxes and charges amount. No unallocated charges allowed.

- **vendor_invoices_non_stock:**
  - **description:** Vendor invoices referenced must be for non-stock items only (service charges, freight, etc.).

- **landed_cost_updates_valuation:**
  - **description:** Submitting a landed cost voucher updates the item valuation rate on the purchase receipt and creates corresponding GL entries.

- **reconciliation_adjusts_values:**
  - **description:** Stock reconciliation adjusts both quantity and valuation rate to target values, creating stock ledger and GL entries.

- **repost_async_processing:**
  - **description:** Repost valuation recalculates historical stock ledger and GL entries asynchronously via a background job queue.

- **repost_period_restriction:**
  - **description:** Cannot repost valuation for dates before the last period closing voucher date or frozen accounting periods.

- **repost_deduplication:**
  - **description:** Parallel reposting requests for the same item-warehouse-date combination are deduplicated to prevent conflicts.


## Outcomes

### Create_landed_cost — Error: `LCV_RECEIPT_NOT_SUBMITTED`

**Given:**
- posting_date, company, and purchase_receipts are provided
- taxes with expense accounts and amounts are provided

**Then:**
- **create_record** target: `landed_cost_voucher` — Landed cost voucher created with receipt items fetched

**Result:** Landed cost voucher created with items from purchase receipts

### Distribute_charges — Error: `LCV_CHARGES_MISMATCH`

**Given:**
- landed cost voucher exists with items and taxes
- distribute_charges_based_on is selected

**Then:**
- **set_field** target: `items` — Applicable charges calculated per item

**Result:** Charges distributed across items proportionally

### Update_item_valuation — Error: `LCV_WRONG_COMPANY`

**Given:**
- landed cost voucher is submitted
- applicable charges are fully distributed

**Then:**
- **set_field** target: `item_valuation_rate` — Item valuation rate updated on purchase receipt
- **create_record** target: `journal_entry` — GL entries created for valuation adjustment
- **emit_event** event: `landed_cost.submitted`
- **emit_event** event: `valuation.updated`

**Result:** Item valuation updated with landed costs and GL entries posted

### Reconcile_stock — Error: `RECON_SERIAL_NOT_FOUND`

**Given:**
- reconciliation_items with target qty and valuation_rate are provided
- expense_account is specified

**Then:**
- **create_record** target: `stock_reconciliation` — Stock reconciliation created with adjustments
- **emit_event** event: `stock.reconciled`

**Result:** Stock quantities and valuations adjusted to target values

### Repost_valuation — Error: `REPOST_PERIOD_CLOSED`

**Given:**
- based_on, posting_date, and item/warehouse or voucher are specified
- posting_date is after last period closing voucher

**Then:**
- **create_record** target: `repost_valuation_entry` — Repost job queued for async processing
- **emit_event** event: `repost.completed` when: `repost_status == "Completed"`
- **emit_event** event: `repost.failed` when: `repost_status == "Failed"`

**Result:** Valuation repost queued for asynchronous recalculation

### Recalculate_gl_entries — Error: `REPOST_ACCOUNTING_FROZEN`

**Given:**
- repost valuation job is in progress
- stock ledger entries have been recalculated

**Then:**
- **set_field** target: `gl_entries` — GL entries recalculated to match updated valuations

**Result:** General ledger entries recalculated to reflect corrected valuations

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LCV_RECEIPT_NOT_SUBMITTED` | 400 | One or more purchase receipts are not submitted or do not exist. | No |
| `LCV_CHARGES_MISMATCH` | 400 | Total applicable charges do not equal total taxes and charges amount. | No |
| `LCV_WRONG_COMPANY` | 400 | Purchase receipt does not belong to the same company as the landed cost voucher. | No |
| `RECON_SERIAL_NOT_FOUND` | 404 | The specified serial number was not found in the system. | No |
| `REPOST_PERIOD_CLOSED` | 400 | Cannot repost valuation for dates before the last period closing voucher. | No |
| `REPOST_ACCOUNTING_FROZEN` | 400 | Cannot modify GL entries for a frozen accounting period. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `landed_cost.submitted` | Fired when a landed cost voucher is submitted | `purchase_receipts`, `total_taxes_and_charges` |
| `valuation.updated` | Fired when item valuation rates are updated | `items`, `new_valuation_rates` |
| `stock.reconciled` | Fired when stock reconciliation is completed | `reconciliation_items`, `difference_amount` |
| `repost.completed` | Fired when valuation repost completes successfully | `based_on`, `repost_item_code`, `repost_warehouse` |
| `repost.failed` | Fired when valuation repost fails | `based_on`, `repost_item_code`, `error_message` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| stock-entry-movements | required | Stock ledger entries affected by valuation changes |
| warehouse-bin-management | required | Warehouse bin quantities adjusted during reconciliation |
| general-ledger | required | GL entries created for all valuation changes |
| serial-batch-tracking | optional | Serial numbers validated during stock reconciliation |

## AGI Readiness

### Goals

#### Reliable Landed Cost Valuation

Landed cost allocation, stock reconciliation, and valuation reposting. Distributes charges across receipt items, adjusts stock quantities/valuations, and recalculates historical entries.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

### Autonomy

**Level:** `semi_autonomous`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | speed | inventory counts must be precise to prevent stockouts and overstock |

### Coordination

**Protocol:** `request_response`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `stock_entry_movements` | stock-entry-movements | degrade |
| `warehouse_bin_management` | warehouse-bin-management | degrade |
| `general_ledger` | general-ledger | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| create_landed_cost | `supervised` | - | - |
| distribute_charges | `autonomous` | - | - |
| update_item_valuation | `supervised` | - | - |
| reconcile_stock | `autonomous` | - | - |
| repost_valuation | `autonomous` | - | - |
| recalculate_gl_entries | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Landed Cost Valuation Blueprint",
  "description": "Landed cost allocation, stock reconciliation, and valuation reposting. Distributes charges across receipt items, adjusts stock quantities/valuations, and recalc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "landed-cost, valuation, stock-reconciliation, repost-valuation, cost-allocation, inventory-adjustment"
}
</script>
