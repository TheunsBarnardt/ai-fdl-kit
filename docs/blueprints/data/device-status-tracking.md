---
title: "Device Status Tracking Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Continuously monitor whether GPS devices are actively reporting, and automatically transition them between online, offline, and unknown states based on configur"
---

# Device Status Tracking Blueprint

> Continuously monitor whether GPS devices are actively reporting, and automatically transition them between online, offline, and unknown states based on configurable inactivity thresholds, emitting notifications when devices go silent.

| | |
|---|---|
| **Feature** | `device-status-tracking` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, device-status, connectivity, fleet, monitoring |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/device-status-tracking.blueprint.yaml) |
| **JSON API** | [device-status-tracking.json]({{ site.baseurl }}/api/blueprints/data/device-status-tracking.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `device` | GPS Device | external | Physical hardware that transmits positions; its silence drives offline detection |
| `scheduler` | Inactivity Checker | system | Periodically scans devices whose last_update has exceeded the inactivity threshold |
| `fleet_user` | Fleet User | human | Views real-time device status in the fleet map or device list |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `status` | select | Yes |  |  |
| `last_update` | datetime | No |  |  |
| `inactivity_start` | number | No |  |  |
| `inactivity_period` | number | No |  |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unknown` | Yes |  |
| `online` |  |  |
| `offline` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `unknown` | `online` | device |  |
|  | `offline` | `online` | device |  |
|  | `online` | `offline` | scheduler |  |
|  | `unknown` | `offline` | scheduler |  |

## Rules

- **processing:**
  - **online_on_position_received:** Status transitions to online as soon as a new position is received, regardless of current status
  - **offline_on_inactivity_threshold:** Status transitions to offline when (current_time - last_update) > inactivity_start
  - **threshold_inheritance:** If inactivity_start is not set on the device, it inherits the value from the parent group or server default
  - **check_schedule:** The inactivity check runs on a configurable schedule (typically every few minutes); status is not updated in real time between check runs
  - **repeated_inactivity_events:** If inactivity_period is set, repeated inactivity events are generated each time the silence duration increases by another inactivity_period interval
- **event_emission:**
  - **transitions_trigger_notifications:** Status transitions are recorded as events and can trigger notifications to fleet users

## Outcomes

### Device_remains_inactive (Priority: 4)

**Given:**
- device continues to be silent beyond additional inactivity_period intervals
- `inactivity_period` (db) gt `0`

**Then:**
- **emit_event** event: `device.inactive`

**Result:** Repeated inactivity event emitted at each period boundary while device remains silent

### Device_goes_offline (Priority: 5)

**Given:**
- scheduler determines that (now - last_update) > inactivity_start
- `status` (db) eq `online`

**Then:**
- **set_field** target: `status` value: `offline`
- **emit_event** event: `device.offline`

**Result:** Device is marked offline; alert handlers can dispatch notifications to users

### Device_comes_online (Priority: 8)

**Given:**
- device transmits a new position
- `status` (db) neq `online`

**Then:**
- **set_field** target: `status` value: `online`
- **set_field** target: `last_update` value: `now`
- **emit_event** event: `device.online`

**Result:** Device status is updated to online and subscribers are notified

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEVICE_STATUS_NOT_FOUND` |  | The specified device does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.online` | Device has resumed transmitting positions after being offline or unknown | `device_id`, `last_update` |
| `device.offline` | Device has exceeded the inactivity threshold without transmitting | `device_id`, `last_update`, `silence_duration_ms` |
| `device.inactive` | Device remains silent beyond a repeated inactivity period boundary | `device_id`, `silence_duration_ms` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-device-registration |  |  |
| gps-position-ingestion |  |  |
| device-alarm-notifications |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Hibernate
  files_traced: 6
  entry_points:
    - src/main/java/org/traccar/model/Device.java
    - src/main/java/org/traccar/schedule/TaskDeviceInactivityCheck.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Device Status Tracking Blueprint",
  "description": "Continuously monitor whether GPS devices are actively reporting, and automatically transition them between online, offline, and unknown states based on configur",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, device-status, connectivity, fleet, monitoring"
}
</script>
