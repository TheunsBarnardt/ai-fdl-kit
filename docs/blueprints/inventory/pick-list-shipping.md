---
title: "Pick List Shipping Blueprint"
layout: default
parent: "Inventory"
grand_parent: Blueprint Catalog
description: "Pick list and shipping system with warehouse picking, delivery notes, shipment tracking, and delivery trip planning. . 28 fields. 10 outcomes. 5 error codes. ru"
---

# Pick List Shipping Blueprint

> Pick list and shipping system with warehouse picking, delivery notes, shipment tracking, and delivery trip planning.


| | |
|---|---|
| **Feature** | `pick-list-shipping` |
| **Category** | Inventory |
| **Version** | 1.0.0 |
| **Tags** | pick-list, shipping, delivery-note, shipment, delivery-trip, logistics, inventory |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/claude-fdl/blob/master/blueprints/inventory/pick-list-shipping.blueprint.yaml) |
| **JSON API** | [pick-list-shipping.json]({{ site.baseurl }}/api/blueprints/inventory/pick-list-shipping.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `pick_list_company` | text | Yes | Company |  |
| `pick_list_purpose` | select | Yes | Pick List Purpose |  |
| `locations` | json | Yes | Pick List Locations |  |
| `pick_list_status` | select | Yes | Pick List Status |  |
| `scan_mode` | boolean | No | Scan Mode |  |
| `group_same_items` | boolean | No | Group Same Items |  |
| `customer` | text | Yes | Customer |  |
| `posting_date` | date | Yes | Posting Date |  |
| `delivery_items` | json | Yes | Delivery Items |  |
| `is_return` | boolean | No | Is Return |  |
| `return_against` | text | No | Return Against |  |
| `per_billed` | number | No | Percentage Billed |  |
| `shipping_address` | text | No | Shipping Address |  |
| `driver` | text | No | Driver |  |
| `vehicle_no` | text | No | Vehicle Number |  |
| `shipment_type` | select | Yes | Shipment Type |  |
| `pickup_date` | date | Yes | Pickup Date |  |
| `parcels` | json | Yes | Parcels |  |
| `carrier` | text | No | Shipping Carrier |  |
| `awb_number` | text | No | AWB / Tracking Number |  |
| `tracking_status` | text | No | Tracking Status |  |
| `total_weight` | number | No | Total Weight |  |
| `value_of_goods` | number | No | Value of Goods |  |
| `trip_vehicle` | text | Yes | Vehicle |  |
| `trip_driver` | text | Yes | Driver |  |
| `delivery_stops` | json | Yes | Delivery Stops |  |
| `departure_time` | datetime | No | Departure Time |  |
| `total_distance` | number | No | Total Distance |  |

## States

**State field:** `composite_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `pick_draft` | Yes |  |
| `pick_open` |  |  |
| `pick_partly_delivered` |  |  |
| `pick_completed` |  | Yes |
| `dn_draft` |  |  |
| `dn_to_bill` |  |  |
| `dn_completed` |  | Yes |
| `dn_return` |  | Yes |
| `shipment_draft` |  |  |
| `shipment_submitted` |  |  |
| `shipment_booked` |  |  |
| `shipment_completed` |  | Yes |
| `trip_draft` |  |  |
| `trip_scheduled` |  |  |
| `trip_in_transit` |  |  |
| `trip_completed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `pick_draft` | `pick_open` | stock_user |  |
|  | `pick_open` | `pick_partly_delivered` | stock_user |  |
|  | `pick_open` | `pick_completed` | stock_user |  |
|  | `pick_partly_delivered` | `pick_completed` | stock_user |  |
|  | `dn_draft` | `dn_to_bill` | stock_user |  |
|  | `dn_to_bill` | `dn_completed` | accounts_user |  |
|  | `dn_to_bill` | `dn_return` | stock_user |  |
|  | `shipment_draft` | `shipment_submitted` | stock_user |  |
|  | `shipment_submitted` | `shipment_booked` | system |  |
|  | `shipment_booked` | `shipment_completed` | system |  |
|  | `trip_draft` | `trip_scheduled` | stock_user |  |
|  | `trip_scheduled` | `trip_in_transit` | driver |  |
|  | `trip_in_transit` | `trip_completed` | driver |  |

## Rules

- **pick_list_stock_availability:**
  - **description:** Pick list items are limited by available stock in the specified warehouse. The system validates that actual_qty minus already reserved quantities is sufficient for each pick item. Batch-specific availability is checked when batch tracking is enabled.

- **batch_expiry_during_picking:**
  - **description:** When picking batch-tracked items, the system validates that the batch expiry date has not passed. Expired batches are excluded from auto-picking and flagged during manual picking.

- **delivery_note_gl_entry:**
  - **description:** Submitting a delivery note creates accounts receivable GL entries for the delivery value. Cost of goods sold entries are created based on the item valuation from the source warehouse.

- **shipment_parcel_requirement:**
  - **description:** A shipment requires at least one parcel entry. Each parcel must have a weight greater than zero. Total weight is auto-calculated from individual parcel weights.

- **delivery_trip_driver_required:**
  - **description:** A delivery trip must have a driver assigned before it can be scheduled or dispatched. The driver must be an active employee or contractor.

- **trip_stop_address_validation:**
  - **description:** Each delivery stop must have a valid address. Stops are ordered by their order_index for route planning. The visited flag is updated as the driver completes each stop.


## Outcomes

### Create_pick_list (Priority: 1)

**Given:**
- user creates a pick list with purpose and item locations
- all items have available stock in specified warehouses

**Then:**
- **create_record** target: `pick_list` — Pick list created with item locations for warehouse picking
- **emit_event** event: `pick_list.completed`

**Result:** Pick list created and ready for warehouse fulfillment

### Pick_insufficient_stock (Priority: 1) — Error: `PICK_INSUFFICIENT_STOCK`

**Given:**
- pick list item requested quantity exceeds available stock

**Result:** Pick list creation blocked due to insufficient stock

### Pick_batch_expired (Priority: 1) — Error: `PICK_BATCH_EXPIRED`

**Given:**
- pick list references a batch that has passed its expiry date

**Result:** Expired batch excluded from pick list

### Delivery_return_exceeded (Priority: 1) — Error: `DELIVERY_RETURN_QTY_EXCEEDED`

**Given:**
- return quantity exceeds the originally delivered quantity

**Result:** Return rejected because quantity exceeds original delivery

### Auto_pick_locations (Priority: 2)

**Given:**
- pick list items have no warehouse locations specified
- items have stock available across one or more warehouses

**Then:**
- **set_field** target: `locations` — Locations auto-populated based on stock availability, batch expiry (FEFO), and warehouse priority

**Result:** Pick locations automatically assigned using optimal stock allocation

### Submit_delivery_note (Priority: 3)

**Given:**
- delivery note has valid customer and item details
- all items have sufficient stock in source warehouses
- serial/batch numbers are valid for tracked items

**Then:**
- **create_record** target: `stock_ledger_entries` — Outgoing SLE created for each delivered item
- **create_record** target: `gl_entries` — AR and COGS GL entries created
- **emit_event** event: `delivery.submitted`

**Result:** Delivery note submitted with stock and accounting entries created

### Create_shipment (Priority: 4)

**Given:**
- shipment has at least one parcel with weight greater than zero
- pickup date is specified

**Then:**
- **create_record** target: `shipment` — Shipment created with parcel details and carrier info
- **emit_event** event: `shipment.booked`

**Result:** Shipment created and ready for carrier booking

### Plan_delivery_trip (Priority: 5)

**Given:**
- delivery trip has a driver and vehicle assigned
- at least one delivery stop has a valid address

**Then:**
- **create_record** target: `delivery_trip` — Delivery trip created with route and stop sequence
- **emit_event** event: `trip.completed`

**Result:** Delivery trip planned with driver, vehicle, and ordered stops

### Mark_stop_visited (Priority: 6)

**Given:**
- delivery trip is in transit
- driver arrives at a delivery stop

**Then:**
- **set_field** target: `delivery_stops[].visited` value: `true` — Stop marked as visited with timestamp

**Result:** Delivery stop marked as completed

### Return_delivery (Priority: 7)

**Given:**
- original delivery note exists and is submitted
- return quantity does not exceed delivered quantity
- is_return is true and return_against references the original

**Then:**
- **create_record** target: `stock_ledger_entries` — Incoming SLE created to return stock to warehouse
- **emit_event** event: `delivery.returned`

**Result:** Sales return processed and stock returned to warehouse

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PICK_INSUFFICIENT_STOCK` | 400 | Insufficient stock available for the requested pick quantity in the specified warehouse. | No |
| `PICK_BATCH_EXPIRED` | 400 | The specified batch has expired and cannot be included in the pick list. | No |
| `DELIVERY_RETURN_QTY_EXCEEDED` | 400 | Return quantity cannot exceed the quantity in the original delivery note. | No |
| `SHIPMENT_NO_PARCELS` | 400 | Shipment must have at least one parcel with a weight greater than zero. | No |
| `TRIP_NO_DRIVER` | 400 | A driver must be assigned before the delivery trip can be scheduled. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `pick_list.completed` | Pick list created or fully picked | `pick_list_id`, `purpose`, `item_count` |
| `delivery.submitted` | Delivery note submitted with stock and GL entries | `delivery_note_id`, `customer`, `total_qty`, `total_amount` |
| `delivery.returned` | Delivery note return processed | `delivery_note_id`, `return_against`, `return_qty` |
| `shipment.booked` | Shipment booked with carrier and tracking assigned | `shipment_id`, `carrier`, `awb_number`, `total_weight` |
| `trip.completed` | Delivery trip completed with all stops visited | `trip_id`, `driver`, `stop_count`, `total_distance` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| stock-entry-movements | required | Pick lists generate stock entries for material transfers |
| warehouse-bin-management | required | Stock availability checked against warehouse bins |
| serial-batch-tracking | recommended | Serial and batch numbers validated during picking and delivery |
| sales-order-lifecycle | recommended | Delivery notes fulfill sales orders and update billing status |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/frappe/erpnext
  project: ERP system
  tech_stack: Python/Frappe Framework
  files_traced: 30
  entry_points:
    - erpnext/stock/doctype/pick_list/pick_list.py
    - erpnext/stock/doctype/delivery_note/delivery_note.py
    - erpnext/stock/doctype/shipment/shipment.py
    - erpnext/stock/doctype/delivery_trip/delivery_trip.py
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Pick List Shipping Blueprint",
  "description": "Pick list and shipping system with warehouse picking, delivery notes, shipment tracking, and delivery trip planning.\n. 28 fields. 10 outcomes. 5 error codes. ru",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/claude-fdl",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "pick-list, shipping, delivery-note, shipment, delivery-trip, logistics, inventory"
}
</script>
