---
title: "Driver App Flow Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Driver mobile app interactions — authentication, order accept/reject, activity updates, and trip completion through the public API.. 10 fields. 9 outcomes. 6 er"
---

# Driver App Flow Blueprint

> Driver mobile app interactions — authentication, order accept/reject, activity updates, and trip completion through the public API.

| | |
|---|---|
| **Feature** | `driver-app-flow` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | driver, mobile, accept-reject, authentication, activity |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/driver-app-flow.blueprint.yaml) |
| **JSON API** | [driver-app-flow.json]({{ site.baseurl }}/api/blueprints/workflow/driver-app-flow.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Driver using the mobile app to receive and execute orders. |
| `platform` | Platform | system | API server managing driver sessions, order pings, and activity transitions. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `identity` | text | Yes | Driver login credential — email or phone number. |  |
| `password` | password | No | Password for email/password login flow. |  |
| `phone` | phone | No | Phone number for SMS verification login. |  |
| `verification_code` | text | No | One-time code sent via SMS for phone-based login. |  |
| `auth_token` | token | No | Bearer token issued after successful authentication. |  |
| `device_token` | text | No | Push notification token (FCM or APNS) registered for this device. |  |
| `device_platform` | select | No | Mobile OS of the device. |  |
| `order_id` | text | No | Identifier of the order the driver is acting on. |  |
| `activity_code` | text | No | Activity transition code (e.g., driver_enroute, arrived, in_progress, completed). |  |
| `organization_id` | text | No | Organization the driver wants to switch their session to. |  |

## Rules

- **rule_01:** A driver can log in with email + password, or phone + SMS verification code.
- **rule_02:** After successful login, a bearer token is issued and must be included in subsequent requests.
- **rule_03:** A driver must register their push notification device token so they can receive order pings.
- **rule_04:** When pinged with an order, the driver can accept (by updating activity) or ignore (ping times out).
- **rule_05:** In adhoc mode, the first driver to accept is assigned; subsequent accepts are rejected.
- **rule_06:** A driver advances the order through activities by calling update-activity with the next activity code.
- **rule_07:** The platform determines the valid next activity at each step; invalid activity codes are rejected.
- **rule_08:** A driver can belong to multiple organizations and switch between them during the session.
- **rule_09:** After completing or canceling an order, the driver's current_job is cleared.

## Outcomes

### Driver_login_password (Priority: 1)

**Given:**
- driver provides valid identity and password
- user account exists and is active

**Then:**
- **create_record** — A personal access token is issued for the driver's session.

**Result:** Driver receives a bearer token for authenticated API calls.

### Driver_login_phone_step1 (Priority: 2)

**Given:**
- driver provides a registered phone number

**Then:**
- **notify** target: `driver` — A one-time verification code is sent via SMS.

**Result:** Driver receives an SMS code to confirm their identity.

### Driver_login_phone_step2 (Priority: 3)

**Given:**
- driver submits the correct SMS verification code
- code has not expired

**Then:**
- **create_record** — A personal access token is issued.

**Result:** Driver is authenticated and receives a bearer token.

### Device_registered (Priority: 4)

**Given:**
- driver provides a device push token and platform

**Then:**
- **create_record** — Device token is stored and linked to the driver's user account.

**Result:** Driver will receive push notifications for order pings and updates.

### Order_accepted (Priority: 5)

**Given:**
- driver receives an order ping notification
- driver calls update-activity with the enroute activity code
- order is still unaccepted (adhoc) or assigned to this driver

**Then:**
- **set_field** target: `order.driver_assigned` — Driver is locked to the order (adhoc case).
- **transition_state** field: `order.status` from: `dispatched` to: `driver_enroute`
- **set_field** target: `driver.current_job` — Order is set as driver's active job.
- **emit_event** event: `order.updated`

**Result:** Order progresses to driver_enroute; customer is notified.

### Order_rejected (Priority: 6)

**Given:**
- driver ignores the ping or explicitly declines

**Result:** Ping expires or is ignored; platform may re-ping other drivers or notify operator.

### Activity_updated (Priority: 7)

**Given:**
- driver calls update-activity with a valid activity code
- the code is the expected next state in the order's flow

**Then:**
- **transition_state** field: `order.status` from: `current` to: `next` — Order status advances according to the configured flow.
- **create_record** — A tracking status entry is created recording the transition with location and timestamp.
- **emit_event** event: `order.updated`

**Result:** Order advances to the next stage; customer sees updated status.

### Organization_switched (Priority: 8)

**Given:**
- driver requests to switch to a different organization
- driver belongs to that organization

**Then:**
- **set_field** target: `session.company` — Driver's active company session is updated.

**Result:** Driver is now operating under the new organization context.

### Login_failed (Priority: 9) — Error: `DRIVER_AUTH_FAILED`

**Given:**
- credentials are invalid or user does not exist

**Result:** Authentication is rejected.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DRIVER_AUTH_FAILED` | 401 | Authentication failed using the provided credentials. | No |
| `DRIVER_NOT_FOUND` | 404 | No driver found for the provided identity. | No |
| `INVALID_VERIFICATION_CODE` | 400 | Invalid verification code. | No |
| `DEVICE_TOKEN_REQUIRED` | 400 | A device token is required to register the device. | No |
| `ORGANIZATION_NOT_FOUND` | 404 | The specified organization could not be found. | No |
| `NOT_ORGANIZATION_MEMBER` | 400 | You do not belong to this organization. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `order.updated` | Fired when driver advances the order activity. | `order_id`, `status`, `activity_code`, `driver_id`, `location` |
| `driver.location_changed` | Fired as driver sends continuous location updates. | `driver_id`, `latitude`, `longitude`, `heading`, `speed` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| ride-request-lifecycle | required | Driver app drives the activity transitions that move an order through its lifecycle. |
| driver-location-streaming | required | Driver app sends GPS updates on a regular interval during active trips. |
| driver-assignment-dispatch | required | Driver receives order pings via dispatch notifications. |
| multi-tenant-organization | recommended | Drivers can belong to multiple organizations and switch between them. |
| fleet-ops-public-api | required | All driver app interactions go through the versioned public REST API. |

## AGI Readiness

### Goals

#### Reliable Driver App Flow

Driver mobile app interactions — authentication, order accept/reject, activity updates, and trip completion through the public API.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before modifying sensitive data fields

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `ride_request_lifecycle` | ride-request-lifecycle | degrade |
| `driver_location_streaming` | driver-location-streaming | degrade |
| `driver_assignment_dispatch` | driver-assignment-dispatch | degrade |
| `fleet_ops_public_api` | fleet-ops-public-api | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| driver_login_password | `autonomous` | - | - |
| driver_login_phone_step1 | `autonomous` | - | - |
| driver_login_phone_step2 | `autonomous` | - | - |
| device_registered | `autonomous` | - | - |
| order_accepted | `autonomous` | - | - |
| order_rejected | `supervised` | - | - |
| activity_updated | `supervised` | - | - |
| organization_switched | `autonomous` | - | - |
| login_failed | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 5
  entry_points:
    - src/Http/Controllers/Api/v1/DriverController.php
    - src/Models/Driver.php
    - src/Http/Controllers/Api/v1/OrderController.php
    - src/Notifications/OrderPing.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver App Flow Blueprint",
  "description": "Driver mobile app interactions — authentication, order accept/reject, activity updates, and trip completion through the public API.. 10 fields. 9 outcomes. 6 er",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "driver, mobile, accept-reject, authentication, activity"
}
</script>
