---
title: "Driver Shift Management Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Manage driver availability through online/offline status toggling, controlling whether a driver appears as available for order dispatch and location tracking.. "
---

# Driver Shift Management Blueprint

> Manage driver availability through online/offline status toggling, controlling whether a driver appears as available for order dispatch and location tracking.

| | |
|---|---|
| **Feature** | `driver-shift-management` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | driver, shift, availability, online-offline, dispatch-eligibility |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/driver-shift-management.blueprint.yaml) |
| **JSON API** | [driver-shift-management.json]({{ site.baseurl }}/api/blueprints/workflow/driver-shift-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Sets their own availability status via the driver app. |
| `platform` | Platform | system | Uses driver online status to determine dispatch eligibility. |
| `operator` | Operator | human | Can view and manage driver availability from the operator console. |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `driver_id` | text | Yes | Identifier of the driver. |  |
| `online` | boolean | Yes | Whether the driver is currently available for orders. |  |
| `status` | select | No | Driver operational status. |  |
| `current_job_id` | text | No | Reference to the active order if the driver is currently on a job. |  |
| `city` | text | No | City the driver is currently operating in (auto-resolved from location). |  |
| `country` | text | No | Country the driver is currently in (auto-resolved from location). |  |

## States

**State field:** `online`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `true` |  |  |
| `[object Object]` | Yes |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `false` | `true` | driver |  |
|  | `true` | `false` | driver |  |

## Rules

- **rule_01:** Only drivers with online=true are eligible to receive adhoc order pings.
- **rule_02:** A driver going offline while on an active order retains the current job until it is completed or reassigned.
- **rule_03:** Driver online status is tracked as a boolean field on the driver record.
- **rule_04:** The platform filters for online drivers when computing nearby available drivers for adhoc dispatch.
- **rule_05:** A driver's city and country are automatically updated from reverse geocoding during location updates.
- **rule_06:** Driver status (active, inactive, on_break) provides finer-grained availability beyond the online boolean.

## Outcomes

### Driver_goes_online (Priority: 1)

**Given:**
- driver updates their status to online via the app

**Then:**
- **set_field** target: `driver.online` value: `true`

**Result:** Driver appears as available in dispatch queries and begins receiving order pings.

### Driver_goes_offline (Priority: 2)

**Given:**
- driver updates their status to offline via the app

**Then:**
- **set_field** target: `driver.online` value: `false`

**Result:** Driver is no longer dispatched new orders and disappears from active driver lists.

### Driver_available_for_dispatch (Priority: 3)

**Given:**
- platform queries for available drivers near a pickup location
- driver is online
- driver has no active current_job

**Then:**
- **set_field** target: `response.eligible_drivers` — Driver is included in the result set for dispatch consideration.

**Result:** Driver is a candidate for order assignment or adhoc ping.

### Driver_unavailable_for_dispatch (Priority: 4)

**Given:**
- driver is offline OR has an active current_job

**Result:** Driver is excluded from dispatch queries.

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DRIVER_NOT_FOUND` | 404 | Driver not found. | No |
| `DRIVER_OFFLINE` | 400 | This driver is currently offline. | No |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| driver-assignment-dispatch | required | Dispatch eligibility depends on driver online status. |
| driver-location-streaming | recommended | Location updates typically only flow when driver is online. |
| driver-app-flow | required | Driver app controls the online/offline toggle. |

## AGI Readiness

### Goals

#### Reliable Driver Shift Management

Manage driver availability through online/offline status toggling, controlling whether a driver appears as available for order dispatch and location tracking.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| processing_time | < 5s | Time from request to completion |
| success_rate | >= 99% | Successful operations divided by total attempts |

**Constraints:**

- **performance** (negotiable): Must not block dependent workflows

### Autonomy

**Level:** `semi_autonomous`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | speed | workflow steps must complete correctly before proceeding |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `driver_assignment_dispatch` | driver-assignment-dispatch | degrade |
| `driver_app_flow` | driver-app-flow | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| driver_goes_online | `autonomous` | - | - |
| driver_goes_offline | `autonomous` | - | - |
| driver_available_for_dispatch | `autonomous` | - | - |
| driver_unavailable_for_dispatch | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/fleetbase/fleetbase
  project: Fleetbase
  tech_stack: PHP / Laravel
  files_traced: 3
  entry_points:
    - src/Models/Driver.php
    - src/Http/Controllers/Api/v1/DriverController.php
    - migrations/2023_04_27_053456_create_drivers_table.php
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver Shift Management Blueprint",
  "description": "Manage driver availability through online/offline status toggling, controlling whether a driver appears as available for order dispatch and location tracking.. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "driver, shift, availability, online-offline, dispatch-eligibility"
}
</script>
