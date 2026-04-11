---
title: "Driver Profile Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Manage driver profiles, license information, availability status, and hours-of-service compliance. 18 fields. 5 outcomes. 5 error codes. rules: valid_license_re"
---

# Driver Profile Blueprint

> Manage driver profiles, license information, availability status, and hours-of-service compliance

| | |
|---|---|
| **Feature** | `driver-profile` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | fleet, driver, license, hos, availability, compliance |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/driver-profile.blueprint.yaml) |
| **JSON API** | [driver-profile.json]({{ site.baseurl }}/api/blueprints/workflow/driver-profile.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_manager` | Fleet Manager | human | Administrator managing driver records |
| `driver` | Driver | human | Driver managing their own profile and availability |
| `system` | System | system | Automated HOS tracking and compliance monitoring |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `driver_id` | text | Yes | Driver ID |  |
| `internal_id` | text | No | Internal ID |  |
| `user_uuid` | text | Yes | User Account |  |
| `vehicle_uuid` | text | No | Default Vehicle |  |
| `vendor_uuid` | text | No | Vendor / Contractor |  |
| `drivers_license_number` | text | Yes | Driver License Number |  |
| `license_class` | select | No | License Class |  |
| `license_expiry` | date | No | License Expiry Date |  |
| `avatar_url` | url | No | Profile Photo |  |
| `location` | json | No | Current Location |  |
| `heading` | number | No | Heading (degrees) |  |
| `speed` | number | No | Current Speed |  |
| `altitude` | number | No | Altitude |  |
| `country` | text | No | Country |  |
| `city` | text | No | City |  |
| `online` | boolean | No | Online |  |
| `status` | select | Yes | Status |  |
| `current_job_uuid` | text | No | Current Active Order |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `unavailable` |  |  |
| `on_break` |  |  |
| `suspended` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `unavailable` | driver |  |
|  | `unavailable` | `active` | driver |  |
|  | `active` | `on_break` | driver |  |
|  | `on_break` | `active` | driver |  |
|  | `active` | `suspended` | fleet_manager |  |

## Rules

- **valid_license_required:** A driver must have a valid, non-expired license to be dispatched
- **available_to_dispatch:** Drivers can only be assigned orders when their status is active and online
- **hos_enforcement:** Hours-of-service limits must be enforced; exceeding configured limits blocks dispatch
- **continuous_location_update:** Driver location is updated continuously while online and on an active order
- **suspended_cannot_login:** Suspended drivers cannot log in to the driver app or be assigned orders
- **license_expiry_warning:** License expiry warnings must be generated 30 days before expiration
- **single_organization:** A driver belongs to exactly one organization; cross-organization assignment is prohibited
- **profile_change_approval:** Driver profile changes (license number, photo) require fleet manager approval
- **position_history:** Each location update is persisted as a position record for route history
- **earnings_tracking:** Driver earnings and payouts are tracked against the driver profile

## Outcomes

### Profile_created (Priority: 1)

**Given:**
- `drivers_license_number` (input) exists
- `user_uuid` (input) exists

**Then:**
- **create_record**
- **emit_event** event: `driver.created`

**Result:** Driver profile created and linked to user account

### License_expired (Priority: 1) — Error: `DRIVER_LICENSE_EXPIRED`

**Given:**
- `license_expiry` (db) lt `now`

**Then:**
- **set_field** target: `status` value: `unavailable`
- **emit_event** event: `driver.license_expired`

**Result:** Driver automatically made unavailable due to expired license

### Dispatch_blocked_offline (Priority: 1) — Error: `DRIVER_OFFLINE`

**Given:**
- `online` (db) eq `false`

**Result:** Cannot dispatch to offline driver

### Driver_goes_online (Priority: 2)

**Given:**
- `online` (input) eq `true`
- `status` (db) eq `active`

**Then:**
- **set_field** target: `online` value: `true`
- **emit_event** event: `driver.online`

**Result:** Driver is online and available for dispatch

### Driver_goes_offline (Priority: 3)

**Given:**
- `online` (input) eq `false`

**Then:**
- **set_field** target: `online` value: `false`
- **emit_event** event: `driver.offline`

**Result:** Driver is offline and unavailable for dispatch

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DRIVER_LICENSE_EXPIRED` | 422 | This driver's license has expired and cannot be dispatched. | No |
| `DRIVER_OFFLINE` | 422 | Driver is currently offline. | No |
| `DRIVER_SUSPENDED` | 403 | This driver account is suspended. | No |
| `DRIVER_ALREADY_ON_JOB` | 409 | Driver is already assigned to an active order. | No |
| `DRIVER_NOT_FOUND` | 404 | Driver profile not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `driver.created` | Fired when a new driver profile is created | `driver_id`, `user_uuid` |
| `driver.online` | Fired when driver comes online | `driver_id`, `location` |
| `driver.offline` | Fired when driver goes offline | `driver_id` |
| `driver.location_updated` | Fired on each GPS location update | `driver_id`, `location`, `speed`, `heading`, `timestamp` |
| `driver.license_expired` | Fired when a driver's license expires | `driver_id`, `drivers_license_number`, `license_expiry` |
| `driver.status_changed` | Fired when driver availability status changes | `driver_id`, `previous_status`, `new_status` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| dispatch-driver-assignment | required | Driver profile is the source of availability for dispatch |
| realtime-driver-tracking | required | Driver location updates are managed via tracking |
| driver-earnings-payouts | recommended | Earnings are tracked against driver profiles |
| driver-shift-scheduling | recommended | Shift schedules define when drivers are available |
| vehicle-fleet-registry | optional | Drivers may have a default vehicle assigned |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleet Management Platform
  tech_stack: PHP (API), JavaScript/Ember.js (Console)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver Profile Blueprint",
  "description": "Manage driver profiles, license information, availability status, and hours-of-service compliance. 18 fields. 5 outcomes. 5 error codes. rules: valid_license_re",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet, driver, license, hos, availability, compliance"
}
</script>
