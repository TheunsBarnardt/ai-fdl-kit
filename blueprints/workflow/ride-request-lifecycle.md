<!-- AUTO-GENERATED FROM ride-request-lifecycle.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Ride Request Lifecycle

> End-to-end lifecycle of a ride request from creation through dispatch, pickup, and completion or cancellation.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** ride-hailing · order · lifecycle · dispatch · pickup · completion

## What this does

End-to-end lifecycle of a ride request from creation through dispatch, pickup, and completion or cancellation.

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **order_id** *(text, required)* — Unique public identifier for the ride request.
- **status** *(select, required)* — Current lifecycle status of the ride request.
- **customer_id** *(text, required)* — Reference to the customer who requested the ride.
- **driver_id** *(text, optional)* — Reference to the assigned driver (set at dispatch or on adhoc acceptance).
- **pickup_location** *(json, required)* — Geographic coordinates and address of the pickup point.
- **dropoff_location** *(json, required)* — Geographic coordinates and address of the drop-off point.
- **tracking_number** *(text, optional)* — Human-readable tracking code for the ride.
- **dispatched** *(boolean, optional)* — Whether the order has been sent to a driver.
- **dispatched_at** *(datetime, optional)* — Timestamp when the order was dispatched.
- **started** *(boolean, optional)* — Whether the driver has started the trip (picked up the rider).
- **started_at** *(datetime, optional)* — Timestamp when the trip started.
- **distance** *(number, optional)* — Estimated or actual trip distance in meters.
- **estimated_time** *(number, optional)* — Estimated trip duration in seconds.
- **scheduled_at** *(datetime, optional)* — Optional future date/time for scheduled rides.
- **pod_required** *(boolean, optional)* — Whether proof of pickup/drop-off is required.
- **pod_method** *(select, optional)* — Method of proof collection.
- **notes** *(text, optional)* — Additional instructions or notes from the customer.

## What must be true

- **rule_01:** A ride request defaults to status "created" on creation.
- **rule_02:** An order must have a pickup and drop-off location to be created.
- **rule_03:** Dispatch requires either a pre-assigned driver or adhoc mode where nearby drivers are pinged.
- **rule_04:** An order cannot be dispatched more than once.
- **rule_05:** An order cannot be started before it has been dispatched (unless skip_dispatch flag is used).
- **rule_06:** Cancellation fires a cancellation event and halts any further activity transitions.
- **rule_07:** A tracking number is generated at order creation for customer-facing status lookups.
- **rule_08:** If proof of delivery is required, trip completion is only allowed after proof is captured.
- **rule_09:** Preliminary distance and time estimates are computed at order creation using routing data.

## Success & failure scenarios

**✅ Success paths**

- **Order Created** — when customer submits a ride request with valid pickup and drop-off, then Ride request is created and a tracking number is returned to the customer.
- **Order Dispatched** — when order status is created; driver is assigned or order is in adhoc mode, then Driver receives a push notification with ride details.
- **Driver Accepts And Enroutes** — when order status is dispatched; driver updates activity to driver_enroute, then Customer sees driver is en route; ETA is surfaced.
- **Driver Arrives** — when order status is driver_enroute; driver updates activity to arrived, then Customer is notified that the driver has arrived.
- **Trip Starts** — when order status is arrived; driver confirms pickup, then Trip is underway; customer tracking is updated live.
- **Trip Completed** — when order status is in_progress; driver marks delivery complete; proof captured if pod_required is true, then Ride is complete; driver is freed for next assignment.

**❌ Failure paths**

- **Order Canceled** — when customer or platform requests cancellation; order status is not completed, then Ride request is terminated; no further activity can be applied. *(error: `ORDER_CANCELED`)*
- **Dispatch Failed** — when order is dispatched; no driver accepts within the timeout period, then Platform notifies the operator; order may be re-dispatched or canceled. *(error: `ORDER_DISPATCH_FAILED`)*

## Errors it can return

- `ORDER_CANCELED` — This ride request has been canceled.
- `ORDER_DISPATCH_FAILED` — Unable to find a driver for your request. Please try again.
- `ORDER_ALREADY_DISPATCHED` — This order has already been dispatched.
- `ORDER_ALREADY_STARTED` — This order has already started.
- `ORDER_NOT_DISPATCHED` — Order must be dispatched before it can be started.

## Events

**`order.created`** — Fired when a new ride request is successfully created.
  Payload: `order_id`, `customer_id`, `pickup_location`, `dropoff_location`, `tracking_number`

**`order.dispatched`** — Fired when an order is dispatched to a driver.
  Payload: `order_id`, `driver_id`, `dispatched_at`

**`order.updated`** — Fired on any status or data change to the order.
  Payload: `order_id`, `status`, `updated_at`

**`order.completed`** — Fired when the trip is successfully completed.
  Payload: `order_id`, `driver_id`, `customer_id`, `distance`, `duration`

**`order.canceled`** — Fired when the order is canceled.
  Payload: `order_id`, `canceled_by`, `reason`

**`order.dispatch_failed`** — Fired when dispatch cannot be completed.
  Payload: `order_id`

## Connects to

- **driver-assignment-dispatch** *(required)* — Dispatch requires a driver to be assigned or adhoc mode.
- **driver-app-flow** *(required)* — Driver app triggers activity updates (enroute, arrived, in_progress, completed).
- **customer-app-flow** *(required)* — Customer app creates the request and tracks status changes.
- **order-trip-state-machine** *(extends)* — Detailed configurable state machine that governs activity transitions.
- **webhook-trip-lifecycle** *(recommended)* — Webhooks deliver lifecycle events to external systems.
- **proof-of-delivery** *(optional)* — Required when pod_required is true on the order.
- **eta-calculation** *(recommended)* — Preliminary ETA is set at creation; updated at each transition.

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████████░` | 24/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/ride-request-lifecycle/) · **Spec source:** [`ride-request-lifecycle.blueprint.yaml`](./ride-request-lifecycle.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
