---
title: "Driver Identification Blueprint"
layout: default
parent: "Data"
grand_parent: Blueprint Catalog
description: "Identify the driver operating a vehicle by matching hardware-reported credentials (RFID tag or iButton key) against a registry of named drivers, and emit an eve"
---

# Driver Identification Blueprint

> Identify the driver operating a vehicle by matching hardware-reported credentials (RFID tag or iButton key) against a registry of named drivers, and emit an event whenever the driver assignment changes.

| | |
|---|---|
| **Feature** | `driver-identification` |
| **Category** | Data |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, driver, rfid, ibutton, fleet, identification |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/data/driver-identification.blueprint.yaml) |
| **JSON API** | [driver-identification.json]({{ site.baseurl }}/api/blueprints/data/driver-identification.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `driver` | Driver | human | Presents an RFID card or iButton key to the in-vehicle reader |
| `device` | GPS Device | external | Reads the hardware credential and includes the unique ID in position transmissions |
| `fleet_admin` | Fleet Administrator | human | Maintains the driver registry, mapping hardware credential IDs to driver names |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `unique_id` | text | Yes |  |  |
| `name` | text | Yes |  |  |
| `driver_unique_id_on_position` | text | No |  |  |

## Rules

- Each driver record has a unique hardware credential ID; duplicate IDs across drivers are not allowed
- When a position carries a driver credential ID, the platform resolves it against the driver registry and stores the association on the position
- If the device does not report a credential ID but the device has a linked driver configured, the platform automatically attributes that linked driver to every position from that device
- A driver change event is emitted when the credential ID in the current position differs from the credential ID in the previous position
- If neither the current nor the previous position carries a credential ID, no driver change event is generated
- Only latest positions (not outdated) trigger driver change detection

## Outcomes

### Unknown_credential (Priority: 3)

**Given:**
- position includes a credential ID that does not match any registered driver

**Then:**
- **set_field** target: `position.driver_unique_id` — Raw credential ID stored as-is; no name resolution

**Result:** Raw credential ID is stored on the position; fleet admin can later register the driver against it

### Linked_driver_applied (Priority: 5)

**Given:**
- position does not include a hardware credential ID
- device has a linked driver configured

**Then:**
- **set_field** target: `position.driver_unique_id` — Linked driver's credential ID applied to the position automatically

**Result:** Position is attributed to the linked driver without requiring hardware presentation

### Driver_changed (Priority: 8)

**Given:**
- current position has a different driver credential ID than the previous position
- position is the latest for the device

**Then:**
- **create_record** target: `event` — Driver change event recorded with type = driver_changed, new driver credential ID
- **emit_event** event: `driver.changed`

**Result:** Driver change event stored; fleet managers can track handovers between shifts

### Driver_identified (Priority: 10)

**Given:**
- position includes a driver credential ID
- credential ID matches a record in the driver registry

**Then:**
- **set_field** target: `position.driver_unique_id` — Driver credential ID attributed to the position

**Result:** Driver is linked to the position; trip and report data includes the identified driver

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DRIVER_DUPLICATE_UNIQUE_ID` |  | A driver with this credential ID is already registered | No |
| `DRIVER_NOT_FOUND` |  | The specified driver does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `driver.changed` | The driver associated with a vehicle has changed | `device_id`, `previous_driver_id`, `new_driver_id`, `position_id`, `fix_time` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion |  |  |
| gps-device-registration |  |  |
| trip-detection |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17
  files_traced: 5
  entry_points:
    - src/main/java/org/traccar/model/Driver.java
    - src/main/java/org/traccar/handler/DriverHandler.java
    - src/main/java/org/traccar/handler/events/DriverEventHandler.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Driver Identification Blueprint",
  "description": "Identify the driver operating a vehicle by matching hardware-reported credentials (RFID tag or iButton key) against a registry of named drivers, and emit an eve",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, driver, rfid, ibutton, fleet, identification"
}
</script>
