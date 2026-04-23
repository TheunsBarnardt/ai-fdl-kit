<!-- AUTO-GENERATED FROM driver-assignment-dispatch.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Driver Assignment Dispatch

> Assign a driver to an order and dispatch the order to that driver, supporting both manual assignment and proximity-based adhoc dispatch.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** dispatch · driver-assignment · adhoc · fleet-ops · fleet · vehicle

## What this does

Assign a driver to an order and dispatch the order to that driver, supporting both manual assignment and proximity-based adhoc dispatch.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **order_id** *(text, required)* — Identifier of the order to dispatch.
- **driver_id** *(text, optional)* — Public identifier of the driver to assign (omit for adhoc mode).
- **adhoc** *(boolean, optional)* — If true, order is broadcast to nearby drivers; first to accept is assigned.
- **adhoc_distance** *(number, optional)* — Radius in meters within which nearby drivers are pinged for adhoc orders.
- **dispatch_immediately** *(boolean, optional)* — Whether to dispatch the order immediately after assignment.
- **dispatched** *(boolean, optional)* — Whether the order has been successfully dispatched.
- **dispatched_at** *(datetime, optional)* — Timestamp of dispatch.
- **vehicle_id** *(text, optional)* — Vehicle assigned to the driver for this order.
- **driver_response** *(select, optional)* — Driver response to dispatch (accepted, rejected).
- **driver_response_at** *(datetime, optional)* — Timestamp when driver responded.
- **notes** *(text, optional)* — Dispatcher notes for this assignment.
- **status** *(select, required)* — Current dispatch status.

## What must be true

- **rule_01:** A driver can only be assigned to one active order at a time (current_job).
- **rule_02:** Assigning a driver does not automatically dispatch; dispatch is a separate explicit action.
- **rule_03:** In adhoc mode, the order is broadcast to all available drivers within adhoc_distance; the first driver to accept is assigned.
- **rule_04:** A dispatched order cannot be dispatched a second time.
- **rule_05:** If no driver is assigned and adhoc is false, dispatch fails with ORDER_NO_DRIVER_ASSIGNED.
- **rule_06:** When a driver is assigned, the driver receives a push notification with order details.
- **rule_07:** Vehicle assignment is exclusive; a vehicle can only be active for one driver at a time.
- **rule_08:** Driver must have status 'available' (online, not on an active order) to be assigned.
- **rule_09:** Vehicle must be operational and not already assigned to another active order.
- **rule_10:** System should suggest the nearest available driver based on current GPS position.
- **rule_11:** If a driver rejects a dispatch the order returns to the queue for reassignment.
- **rule_12:** Dispatcher can override system suggestions and manually select any available driver.
- **rule_13:** Driver acceptance or rejection must be timestamped for SLA tracking.

## Success & failure scenarios

**✅ Success paths**

- **Driver Manually Assigned** — when dispatcher provides a valid driver_id; driver is available (not on another active order), then Driver is linked to the order and notified. Order is ready to dispatch.
- **Adhoc Ping Sent** — when adhoc is true; no driver is pre-assigned; order is dispatched, then Nearby drivers receive a ping and can accept or reject the order.
- **Order Dispatched** — when driver is assigned OR adhoc is true; order has not been dispatched already, then Order is live; driver begins navigating to pickup.
- **Driver Assigned At Adhoc Accept** — when order is in adhoc mode; a driver accepts the order ping; no other driver has already accepted, then Driver is assigned; order proceeds with this driver.
- **Driver Accepted** — when driver_response eq "accepted", then Driver accepted; order is en route.

**❌ Failure paths**

- **Driver Rejected** — when driver_response eq "rejected", then Driver rejected; order returned to dispatch queue for reassignment. *(error: `DISPATCH_DRIVER_REJECTED`)*
- **Dispatch Failed No Driver** — when adhoc is false; no driver_id is provided, then Dispatch is rejected; operator must assign a driver first. *(error: `ORDER_NO_DRIVER_ASSIGNED`)*

## Errors it can return

- `ORDER_NO_DRIVER_ASSIGNED` — No driver assigned to dispatch.
- `ORDER_ALREADY_DISPATCHED` — This order has already been dispatched.
- `DRIVER_NOT_FOUND` — The specified driver could not be found.
- `DISPATCH_DRIVER_REJECTED` — The driver declined this order.
- `DISPATCH_VEHICLE_UNAVAILABLE` — The selected vehicle is not available for dispatch.

## Events

**`order.driver_assigned`** — Fired when a driver is linked to an order.
  Payload: `order_id`, `driver_id`, `assigned_at`

**`order.dispatched`** — Fired when an order is dispatched (to a specific driver or broadcast in adhoc mode).
  Payload: `order_id`, `driver_id`, `adhoc`, `dispatched_at`

**`order.dispatch_failed`** — Fired when dispatch cannot be completed.
  Payload: `order_id`, `reason`

**`dispatch.accepted`** — Fired when driver accepts the dispatch.
  Payload: `order_id`, `driver_id`, `driver_response_at`

**`dispatch.rejected`** — Fired when driver rejects the dispatch.
  Payload: `order_id`, `driver_id`, `driver_response_at`

**`dispatch.reassigned`** — Fired when order is reassigned to a different driver after rejection.
  Payload: `order_id`, `new_driver_id`, `previous_driver_id`

## Connects to

- **ride-request-lifecycle** *(required)* — Dispatch is a key state transition in the ride lifecycle.
- **driver-app-flow** *(required)* — Driver app handles the ping, accept, and reject interaction.
- **driver-shift-management** *(recommended)* — Only online/on-shift drivers should receive pings.
- **fleet-vehicle-registry** *(optional)* — Vehicle assignment is validated as part of driver dispatch readiness.
- **driver-profile** *(required)* — Driver availability and status comes from driver profile.
- **realtime-driver-tracking** *(recommended)* — Driver location used for nearest-driver auto-assignment and adhoc radius.

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/driver-assignment-dispatch/) · **Spec source:** [`driver-assignment-dispatch.blueprint.yaml`](./driver-assignment-dispatch.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
