---
title: "Serial Batch Tracking Blueprint"
layout: default
parent: "Inventory"
grand_parent: Blueprint Catalog
description: "Serial number and batch tracking with lifecycle management, batch-wise valuation, expiry tracking, and serial/batch bundles. . 24 fields. 9 outcomes. 6 error co"
---

# Serial Batch Tracking Blueprint

> Serial number and batch tracking with lifecycle management, batch-wise valuation, expiry tracking, and serial/batch bundles.


| | |
|---|---|
| **Feature** | `serial-batch-tracking` |
| **Category** | Inventory |
| **Version** | 1.0.0 |
| **Tags** | serial-number, batch-tracking, traceability, expiry, inventory, valuation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/inventory/serial-batch-tracking.blueprint.yaml) |
| **JSON API** | [serial-batch-tracking.json]({{ site.baseurl }}/api/blueprints/inventory/serial-batch-tracking.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `serial_no` | text | Yes | Serial Number |  |
| `item_code` | text | Yes | Item Code |  |
| `batch_no` | text | No | Batch Number |  |
| `warehouse` | text | No | Current Warehouse |  |
| `status` | select | Yes | Serial Status |  |
| `warranty_expiry_date` | date | No | Warranty Expiry Date |  |
| `amc_expiry_date` | date | No | AMC Expiry Date |  |
| `maintenance_status` | select | No | Maintenance Status |  |
| `purchase_rate` | number | No | Purchase Rate |  |
| `batch_id` | text | Yes | Batch ID |  |
| `batch_item` | text | Yes | Batch Item Code |  |
| `expiry_date` | date | No | Expiry Date |  |
| `manufacturing_date` | date | No | Manufacturing Date |  |
| `batch_qty` | number | No | Batch Quantity |  |
| `use_batchwise_valuation` | boolean | No | Use Batch-wise Valuation |  |
| `batch_disabled` | boolean | No | Batch Disabled |  |
| `bundle_item_code` | text | Yes | Bundle Item Code |  |
| `bundle_warehouse` | text | Yes | Bundle Warehouse |  |
| `type_of_transaction` | select | Yes | Transaction Type |  |
| `entries` | json | Yes | Bundle Entries |  |
| `total_qty` | number | No | Total Quantity |  |
| `total_amount` | number | No | Total Amount |  |
| `avg_rate` | number | No | Average Rate |  |
| `is_cancelled` | boolean | No | Is Cancelled |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `Active` | Yes |  |
| `Inactive` |  |  |
| `Consumed` |  | Yes |
| `Delivered` |  | Yes |
| `Expired` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `Active` | `Inactive` | stock_user |  |
|  | `Active` | `Consumed` | system |  |
|  | `Active` | `Delivered` | system |  |
|  | `Active` | `Expired` | system |  |
|  | `Inactive` | `Active` | stock_user |  |

## Rules

- **serial_uniqueness:**
  - **description:** Serial numbers must be globally unique per item. The same serial number cannot exist for two different items. Duplicate serial numbers within the same item are rejected at creation time.

- **serial_warehouse_immutability:**
  - **description:** A serial number's warehouse can only change through stock transactions (stock entry, purchase receipt, delivery note). Direct modification of the warehouse field is not permitted.

- **batch_expiry_validation:**
  - **description:** For outgoing transactions (delivery, issue), the batch expiry date must be on or after the current date. Expired batches cannot be used for outgoing stock movements unless explicitly overridden.

- **batch_deletion_protection:**
  - **description:** A batch cannot be deleted if it has been referenced in any stock ledger entry. Historical traceability must be preserved.

- **bundle_no_duplicates:**
  - **description:** A serial and batch bundle must not contain duplicate serial numbers or duplicate batch entries. Each serial number or batch row must appear exactly once in the bundle.

- **maintenance_status_auto_calculation:**
  - **description:** Maintenance status is automatically derived from warranty_expiry_date and amc_expiry_date. If warranty is active, status is "Under Warranty". If warranty expired but AMC is active, status is "Under AMC". Otherwise the corresponding "Out of" status applies.


## Outcomes

### Create_serial (Priority: 1)

**Given:**
- item is configured for serial number tracking
- serial number is unique for the item
- incoming stock transaction provides the serial number

**Then:**
- **create_record** target: `serial_no` — Serial number record created with item, warehouse, and purchase details
- **emit_event** event: `serial.created`

**Result:** Serial number created and tracked in the specified warehouse

### Serial_duplicate_rejected (Priority: 1) — Error: `SERIAL_DUPLICATE`

**Given:**
- serial number already exists for the item

**Result:** Serial number creation rejected due to duplicate

### Serial_warehouse_mismatch (Priority: 1) — Error: `SERIAL_WAREHOUSE_MISMATCH`

**Given:**
- outgoing transaction references a serial number
- serial number is not in the specified source warehouse

**Result:** Transaction rejected because serial is in a different warehouse

### Batch_expired_rejection (Priority: 1) — Error: `BATCH_EXPIRED`

**Given:**
- outgoing transaction references a batch
- `expiry_date` (db) lt `today`

**Result:** Transaction rejected because batch has expired

### Consume_serial (Priority: 2)

**Given:**
- serial number exists and is in Active status
- outgoing stock transaction references the serial number
- transaction type is manufacturing consumption

**Then:**
- **transition_state** field: `status` from: `Active` to: `Consumed`
- **set_field** target: `warehouse` value: `null` — Warehouse cleared as serial is no longer in stock
- **emit_event** event: `serial.consumed`

**Result:** Serial number marked as consumed and removed from warehouse

### Deliver_serial (Priority: 3)

**Given:**
- serial number exists and is in Active status
- outgoing delivery transaction references the serial number

**Then:**
- **transition_state** field: `status` from: `Active` to: `Delivered`
- **set_field** target: `warehouse` value: `null` — Warehouse cleared as serial is delivered to customer
- **emit_event** event: `serial.delivered`

**Result:** Serial number marked as delivered to customer

### Create_batch (Priority: 4)

**Given:**
- item is configured for batch tracking
- batch ID is unique for the item

**Then:**
- **create_record** target: `batch` — Batch record created with manufacturing date, expiry, and item reference
- **emit_event** event: `batch.created`

**Result:** Batch created and available for stock transactions

### Track_expiry (Priority: 5)

**Given:**
- batch has an expiry date
- current date is past the expiry date

**Then:**
- **emit_event** event: `batch.expired`

**Result:** Batch flagged as expired and blocked from outgoing transactions

### Create_bundle (Priority: 6)

**Given:**
- stock transaction involves multiple serial numbers or batches
- bundle entries contain no duplicate serial numbers or batch rows
- total quantity matches the sum of entry quantities

**Then:**
- **create_record** target: `serial_batch_bundle` — Bundle created grouping all serial/batch entries for the transaction
- **emit_event** event: `bundle.created`

**Result:** Serial and batch bundle created for grouped transaction processing

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SERIAL_DUPLICATE` | 409 | Serial number already exists for this item. | No |
| `SERIAL_WAREHOUSE_MISMATCH` | 400 | Serial number is not in the specified warehouse. Check the current location. | No |
| `SERIAL_FUTURE_TRANSACTION` | 400 | Cannot process a serial number transaction with a future date. | No |
| `BATCH_EXPIRED` | 400 | Batch has expired and cannot be used for outgoing transactions. | No |
| `BATCH_NEGATIVE_STOCK` | 400 | Transaction would result in negative batch quantity. | No |
| `BUNDLE_DUPLICATE_ENTRY` | 400 | Bundle contains duplicate serial numbers or batch entries. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `serial.created` | New serial number registered in the system | `serial_no`, `item_code`, `warehouse` |
| `serial.consumed` | Serial number consumed in a manufacturing process | `serial_no`, `item_code`, `consumed_in` |
| `serial.delivered` | Serial number delivered to a customer | `serial_no`, `item_code`, `customer` |
| `batch.created` | New batch created for an item | `batch_id`, `item_code`, `expiry_date` |
| `batch.expired` | Batch has passed its expiry date | `batch_id`, `item_code`, `expiry_date` |
| `bundle.created` | Serial and batch bundle created for a grouped transaction | `bundle_id`, `item_code`, `type_of_transaction`, `total_qty` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| stock-entry-movements | required | Stock entries are the primary mechanism for serial/batch movement |
| warehouse-bin-management | required | Serial and batch quantities are tracked per warehouse bin |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
  files_traced: 22
  entry_points:
    - erpnext/stock/doctype/serial_no/serial_no.py
    - erpnext/stock/doctype/batch/batch.py
    - erpnext/stock/doctype/serial_and_batch_bundle/serial_and_batch_bundle.py
    - erpnext/stock/serial_batch_bundle.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Serial Batch Tracking Blueprint",
  "description": "Serial number and batch tracking with lifecycle management, batch-wise valuation, expiry tracking, and serial/batch bundles.\n. 24 fields. 9 outcomes. 6 error co",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "serial-number, batch-tracking, traceability, expiry, inventory, valuation"
}
</script>
