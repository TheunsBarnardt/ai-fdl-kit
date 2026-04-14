<!-- AUTO-GENERATED FROM driver-app-flow.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Driver App Flow

> Driver mobile app interactions — authentication, order accept/reject, activity updates, and trip completion through the public API.

**Category:** Workflow · **Version:** 1.0.0 · **Tags:** driver · mobile · accept-reject · authentication · activity

## What this does

Driver mobile app interactions — authentication, order accept/reject, activity updates, and trip completion through the public API.

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **identity** *(text, required)* — Driver login credential — email or phone number.
- **password** *(password, optional)* — Password for email/password login flow.
- **phone** *(phone, optional)* — Phone number for SMS verification login.
- **verification_code** *(text, optional)* — One-time code sent via SMS for phone-based login.
- **auth_token** *(token, optional)* — Bearer token issued after successful authentication.
- **device_token** *(text, optional)* — Push notification token (FCM or APNS) registered for this device.
- **device_platform** *(select, optional)* — Mobile OS of the device.
- **order_id** *(text, optional)* — Identifier of the order the driver is acting on.
- **activity_code** *(text, optional)* — Activity transition code (e.g., driver_enroute, arrived, in_progress, completed).
- **organization_id** *(text, optional)* — Organization the driver wants to switch their session to.

## What must be true

- **rule_01:** A driver can log in with email + password, or phone + SMS verification code.
- **rule_02:** After successful login, a bearer token is issued and must be included in subsequent requests.
- **rule_03:** A driver must register their push notification device token so they can receive order pings.
- **rule_04:** When pinged with an order, the driver can accept (by updating activity) or ignore (ping times out).
- **rule_05:** In adhoc mode, the first driver to accept is assigned; subsequent accepts are rejected.
- **rule_06:** A driver advances the order through activities by calling update-activity with the next activity code.
- **rule_07:** The platform determines the valid next activity at each step; invalid activity codes are rejected.
- **rule_08:** A driver can belong to multiple organizations and switch between them during the session.
- **rule_09:** After completing or canceling an order, the driver's current_job is cleared.

## Success & failure scenarios

**✅ Success paths**

- **Driver Login Password** — when driver provides valid identity and password; user account exists and is active, then Driver receives a bearer token for authenticated API calls.
- **Driver Login Phone Step1** — when driver provides a registered phone number, then Driver receives an SMS code to confirm their identity.
- **Driver Login Phone Step2** — when driver submits the correct SMS verification code; code has not expired, then Driver is authenticated and receives a bearer token.
- **Device Registered** — when driver provides a device push token and platform, then Driver will receive push notifications for order pings and updates.
- **Order Accepted** — when driver receives an order ping notification; driver calls update-activity with the enroute activity code; order is still unaccepted (adhoc) or assigned to this driver, then Order progresses to driver_enroute; customer is notified.
- **Order Rejected** — when driver ignores the ping or explicitly declines, then Ping expires or is ignored; platform may re-ping other drivers or notify operator.
- **Activity Updated** — when driver calls update-activity with a valid activity code; the code is the expected next state in the order's flow, then Order advances to the next stage; customer sees updated status.
- **Organization Switched** — when driver requests to switch to a different organization; driver belongs to that organization, then Driver is now operating under the new organization context.

**❌ Failure paths**

- **Login Failed** — when credentials are invalid or user does not exist, then Authentication is rejected. *(error: `DRIVER_AUTH_FAILED`)*

## Errors it can return

- `DRIVER_AUTH_FAILED` — Authentication failed using the provided credentials.
- `DRIVER_NOT_FOUND` — No driver found for the provided identity.
- `INVALID_VERIFICATION_CODE` — Invalid verification code.
- `DEVICE_TOKEN_REQUIRED` — A device token is required to register the device.
- `ORGANIZATION_NOT_FOUND` — The specified organization could not be found.
- `NOT_ORGANIZATION_MEMBER` — You do not belong to this organization.

## Events

**`order.updated`** — Fired when driver advances the order activity.
  Payload: `order_id`, `status`, `activity_code`, `driver_id`, `location`

**`driver.location_changed`** — Fired as driver sends continuous location updates.
  Payload: `driver_id`, `latitude`, `longitude`, `heading`, `speed`

## Connects to

- **ride-request-lifecycle** *(required)* — Driver app drives the activity transitions that move an order through its lifecycle.
- **driver-location-streaming** *(required)* — Driver app sends GPS updates on a regular interval during active trips.
- **driver-assignment-dispatch** *(required)* — Driver receives order pings via dispatch notifications.
- **multi-tenant-organization** *(recommended)* — Drivers can belong to multiple organizations and switch between them.
- **fleet-ops-public-api** *(required)* — All driver app interactions go through the versioned public REST API.

## Quality fitness 🟡 74/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `███░░░░░░░` | 3/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/workflow/driver-app-flow/) · **Spec source:** [`driver-app-flow.blueprint.yaml`](./driver-app-flow.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
