---
title: "Gps Device Registration Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Register and identify GPS tracking devices by unique hardware ID (IMEI or custom identifier), with per-device metadata, grouping, and lifecycle management.. 11 "
---

# Gps Device Registration Blueprint

> Register and identify GPS tracking devices by unique hardware ID (IMEI or custom identifier), with per-device metadata, grouping, and lifecycle management.

| | |
|---|---|
| **Feature** | `gps-device-registration` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, device-management, iot, fleet |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/gps-device-registration.blueprint.yaml) |
| **JSON API** | [gps-device-registration.json]({{ site.baseurl }}/api/blueprints/data/gps-device-registration.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_admin` | Fleet Administrator | human | Manages the device registry, creates and configures tracking devices |
| `device` | GPS Device | external | Physical hardware unit that transmits position data |
| `system` | Tracking Platform | system | Receives registrations, maintains device state, validates uniqueness |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `unique_id` | text | Yes | Hardware identifier transmitted by the device (IMEI, serial number, or custom ID); must be trimme... |  |
| `name` | text | Yes | Human-readable label for the device |  |
| `phone` | phone | No | SIM card phone number for SMS-based commands |  |
| `model` | text | No | Device hardware model or type |  |
| `contact` | text | No | Contact person or note associated with this device |  |
| `category` | select | No | Device category (e.g., car, truck, motorcycle, asset tracker) |  |
| `group_id` | hidden | No | Parent group for hierarchical organisation and inherited configuration |  |
| `disabled` | boolean | No | When true, device data is accepted but ignored by event handlers and reports |  |
| `expiration_time` | datetime | No | Date after which the device is automatically treated as disabled |  |
| `status` | select | No | Runtime status: online, offline, or unknown |  |
| `last_update` | datetime | No | Timestamp of the most recently received position |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `unknown` | Yes |  |
| `online` |  |  |
| `offline` |  |  |

## Rules

- **validation:**
  - **unique_id_trimmed:** unique_id must be trimmed of leading and trailing whitespace before storage
  - **unique_id_uniqueness:** unique_id must be unique across all registered devices; duplicate registration is rejected
- **data:**
  - **group_inheritance:** A device inherits configuration attributes from its group hierarchy if not explicitly set
  - **disabled_behavior:** A disabled device continues to accept raw position data from hardware but suppresses all event processing, alerts, and inclusion in live views
  - **expiry_behavior:** An expired device (current time > expiration_time) is treated as disabled automatically
- **states:**
  - **status_transitions:** Status transitions are driven by the most recent position timestamp relative to a configurable inactivity window, not by explicit operator action

## Outcomes

### Duplicate_rejected (Priority: 1) — Error: `DEVICE_DUPLICATE_UNIQUE_ID`

**Given:**
- `unique_id` (db) exists

**Result:** Registration is rejected; operator is informed of the conflict

### Device_expired (Priority: 3)

**Given:**
- `expiration_time` (db) lt `now`

**Then:**
- **set_field** target: `status` value: `offline`
- **emit_event** event: `device.expired`

**Result:** Device is treated as disabled; no further event processing occurs

### Device_disabled (Priority: 5)

**Given:**
- fleet_admin sets disabled = true

**Then:**
- **set_field** target: `disabled` value: `true`
- **emit_event** event: `device.disabled`

**Result:** Device continues transmitting but all event and alert processing is suppressed

### Device_registered (Priority: 10)

**Given:**
- fleet_admin provides unique_id, name, and optional metadata
- `unique_id` (db) not_exists

**Then:**
- **create_record** target: `device` — Device record persisted with all provided fields and status = unknown
- **emit_event** event: `device.registered`

**Result:** Device is registered and visible in the fleet list with status unknown

### Device_updated (Priority: 10)

**Given:**
- fleet_admin submits updated metadata for an existing device
- `device_id` (db) exists

**Then:**
- **set_field** target: `name` — Updated name applied
- **set_field** target: `category` — Updated category applied
- **emit_event** event: `device.updated`

**Result:** Device record reflects the new metadata

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DEVICE_DUPLICATE_UNIQUE_ID` | 409 | A device with this identifier is already registered | No |
| `DEVICE_NOT_FOUND` | 404 | The specified device does not exist | No |
| `DEVICE_LIMIT_EXCEEDED` | 404 | The maximum number of devices allowed for this account has been reached | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.registered` | A new device has been added to the fleet | `device_id`, `unique_id`, `name`, `group_id` |
| `device.updated` | Device metadata has been modified | `device_id`, `changed_fields` |
| `device.disabled` | Device has been disabled | `device_id` |
| `device.expired` | Device subscription or licence has expired | `device_id`, `expiration_time` |
| `device.status_changed` | Device transitioned between online, offline, and unknown states | `device_id`, `old_status`, `new_status`, `last_update` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion | required | Devices must be registered before positions can be attributed to them |
| device-status-tracking | required | Status transitions are computed from position timestamps |
| fleet-device-sharing | recommended | Groups and user permissions govern who can see and manage each device |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty, Hibernate, H2/MySQL/PostgreSQL
  files_traced: 8
  entry_points:
    - src/main/java/org/traccar/model/Device.java
    - src/main/java/org/traccar/api/resource/DeviceResource.java
    - src/main/java/org/traccar/schedule/TaskDeviceInactivityCheck.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Gps Device Registration Blueprint",
  "description": "Register and identify GPS tracking devices by unique hardware ID (IMEI or custom identifier), with per-device metadata, grouping, and lifecycle management.. 11 ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, device-management, iot, fleet"
}
</script>
