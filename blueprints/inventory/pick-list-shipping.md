<!-- AUTO-GENERATED FROM pick-list-shipping.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Pick List Shipping

> Pick list and shipping system with warehouse picking, delivery notes, shipment tracking, and delivery trip planning.

**Category:** Inventory · **Version:** 1.0.0 · **Tags:** pick-list · shipping · delivery-note · shipment · delivery-trip · logistics · inventory

## What this does

Pick list and shipping system with warehouse picking, delivery notes, shipment tracking, and delivery trip planning.

Specifies 10 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **pick_list_company** *(text, required)* — Company
- **pick_list_purpose** *(select, required)* — Pick List Purpose
- **locations** *(json, required)* — Pick List Locations
- **pick_list_status** *(select, required)* — Pick List Status
- **scan_mode** *(boolean, optional)* — Scan Mode
- **group_same_items** *(boolean, optional)* — Group Same Items
- **customer** *(text, required)* — Customer
- **posting_date** *(date, required)* — Posting Date
- **delivery_items** *(json, required)* — Delivery Items
- **is_return** *(boolean, optional)* — Is Return
- **return_against** *(text, optional)* — Return Against
- **per_billed** *(number, optional)* — Percentage Billed
- **shipping_address** *(text, optional)* — Shipping Address
- **driver** *(text, optional)* — Driver
- **vehicle_no** *(text, optional)* — Vehicle Number
- **shipment_type** *(select, required)* — Shipment Type
- **pickup_date** *(date, required)* — Pickup Date
- **parcels** *(json, required)* — Parcels
- **carrier** *(text, optional)* — Shipping Carrier
- **awb_number** *(text, optional)* — AWB / Tracking Number
- **tracking_status** *(text, optional)* — Tracking Status
- **total_weight** *(number, optional)* — Total Weight
- **value_of_goods** *(number, optional)* — Value of Goods
- **trip_vehicle** *(text, required)* — Vehicle
- **trip_driver** *(text, required)* — Driver
- **delivery_stops** *(json, required)* — Delivery Stops
- **departure_time** *(datetime, optional)* — Departure Time
- **total_distance** *(number, optional)* — Total Distance

## What must be true

- **pick_list_stock_availability:** Pick list items are limited by available stock in the specified warehouse. The system validates that actual_qty minus already reserved quantities is sufficient for each pick item. Batch-specific availability is checked when batch tracking is enabled.
- **batch_expiry_during_picking:** When picking batch-tracked items, the system validates that the batch expiry date has not passed. Expired batches are excluded from auto-picking and flagged during manual picking.
- **delivery_note_gl_entry:** Submitting a delivery note creates accounts receivable GL entries for the delivery value. Cost of goods sold entries are created based on the item valuation from the source warehouse.
- **shipment_parcel_requirement:** A shipment requires at least one parcel entry. Each parcel must have a weight greater than zero. Total weight is auto-calculated from individual parcel weights.
- **delivery_trip_driver_required:** A delivery trip must have a driver assigned before it can be scheduled or dispatched. The driver must be an active employee or contractor.
- **trip_stop_address_validation:** Each delivery stop must have a valid address. Stops are ordered by their order_index for route planning. The visited flag is updated as the driver completes each stop.

## Success & failure scenarios

**✅ Success paths**

- **Create Pick List** — when user creates a pick list with purpose and item locations; all items have available stock in specified warehouses, then Pick list created and ready for warehouse fulfillment.
- **Auto Pick Locations** — when pick list items have no warehouse locations specified; items have stock available across one or more warehouses, then Pick locations automatically assigned using optimal stock allocation.
- **Submit Delivery Note** — when delivery note has valid customer and item details; all items have sufficient stock in source warehouses; serial/batch numbers are valid for tracked items, then Delivery note submitted with stock and accounting entries created.
- **Create Shipment** — when shipment has at least one parcel with weight greater than zero; pickup date is specified, then Shipment created and ready for carrier booking.
- **Plan Delivery Trip** — when delivery trip has a driver and vehicle assigned; at least one delivery stop has a valid address, then Delivery trip planned with driver, vehicle, and ordered stops.
- **Mark Stop Visited** — when delivery trip is in transit; driver arrives at a delivery stop, then Delivery stop marked as completed.
- **Return Delivery** — when original delivery note exists and is submitted; return quantity does not exceed delivered quantity; is_return is true and return_against references the original, then Sales return processed and stock returned to warehouse.

**❌ Failure paths**

- **Pick Insufficient Stock** — when pick list item requested quantity exceeds available stock, then Pick list creation blocked due to insufficient stock. *(error: `PICK_INSUFFICIENT_STOCK`)*
- **Pick Batch Expired** — when pick list references a batch that has passed its expiry date, then Expired batch excluded from pick list. *(error: `PICK_BATCH_EXPIRED`)*
- **Delivery Return Exceeded** — when return quantity exceeds the originally delivered quantity, then Return rejected because quantity exceeds original delivery. *(error: `DELIVERY_RETURN_QTY_EXCEEDED`)*

## Errors it can return

- `PICK_INSUFFICIENT_STOCK` — Insufficient stock available for the requested pick quantity in the specified warehouse.
- `PICK_BATCH_EXPIRED` — The specified batch has expired and cannot be included in the pick list.
- `DELIVERY_RETURN_QTY_EXCEEDED` — Return quantity cannot exceed the quantity in the original delivery note.
- `SHIPMENT_NO_PARCELS` — Shipment must have at least one parcel with a weight greater than zero.
- `TRIP_NO_DRIVER` — A driver must be assigned before the delivery trip can be scheduled.

## Connects to

- **stock-entry-movements** *(required)* — Pick lists generate stock entries for material transfers
- **warehouse-bin-management** *(required)* — Stock availability checked against warehouse bins
- **serial-batch-tracking** *(recommended)* — Serial and batch numbers validated during picking and delivery
- **sales-order-lifecycle** *(recommended)* — Delivery notes fulfill sales orders and update billing status

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/inventory/pick-list-shipping/) · **Spec source:** [`pick-list-shipping.blueprint.yaml`](./pick-list-shipping.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
