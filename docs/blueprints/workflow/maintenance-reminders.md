---
title: "Maintenance Reminders Blueprint"
layout: default
parent: "Workflow"
grand_parent: Blueprint Catalog
description: "Define maintenance tasks that trigger notifications when a tracked vehicle crosses a configured odometer, engine hours, or time threshold, with automatic repeat"
---

# Maintenance Reminders Blueprint

> Define maintenance tasks that trigger notifications when a tracked vehicle crosses a configured odometer, engine hours, or time threshold, with automatic repeat reminders at regular intervals for ongoing maintenance schedules.

| | |
|---|---|
| **Feature** | `maintenance-reminders` |
| **Category** | Workflow |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, maintenance, odometer, service, reminder, fleet |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/workflow/maintenance-reminders.blueprint.yaml) |
| **JSON API** | [maintenance-reminders.json]({{ site.baseurl }}/api/blueprints/workflow/maintenance-reminders.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_admin` | Fleet Administrator | human | Creates and manages maintenance task definitions per device or group |
| `pipeline` | Maintenance Event Handler | system | Evaluates each incoming position against all active maintenance definitions for the device |
| `mechanic` | Maintenance Team | human | Receives maintenance reminders and records service completion |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `name` | text | Yes |  |  |
| `tracking_type` | select | Yes |  |  |
| `start_value` | number | Yes |  |  |
| `period_value` | number | No |  |  |
| `device_id` | hidden | No |  |  |

## Rules

- The first reminder fires when the tracking metric crosses start_value (previous value < start_value <= current value)
- If period_value > 0, subsequent reminders fire each time the metric increases by another period_value interval beyond start_value
- Interval boundary crossing is detected mathematically; if a large GPS gap causes multiple intervals to be skipped, a reminder fires for the current crossing only
- Maintenance definitions can be assigned to individual devices, to groups (inherited by all devices in the group), or to a user account
- Only the latest position for each device is evaluated; outdated positions do not trigger maintenance reminders
- A reminder event stores the maintenance task ID and the current tracking value so the service record can be annotated with the relevant mileage or hours

## Outcomes

### No_threshold_crossed (Priority: 3)

**Given:**
- current tracking value has not crossed any maintenance boundary

**Result:** No reminder generated; maintenance is not yet due

### Periodic_reminder_fired (Priority: 8)

**Given:**
- current tracking value has crossed a period boundary beyond start_value
- {"when":"period_value > 0"}
- position is the latest for the device

**Then:**
- **create_record** target: `event` — Repeat maintenance reminder event recorded
- **emit_event** event: `maintenance.due`

**Result:** Repeat reminder fired; next service interval boundary has been reached

### Initial_reminder_fired (Priority: 10)

**Given:**
- previous tracking value < start_value
- current tracking value >= start_value
- position is the latest for the device

**Then:**
- **create_record** target: `event` — Maintenance reminder event recorded with type = maintenance, maintenance_id, current tracking value
- **emit_event** event: `maintenance.due`

**Result:** Maintenance reminder event stored; notification dispatched to assigned users

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MAINTENANCE_DEVICE_NOT_FOUND` |  | The device referenced does not exist | No |
| `MAINTENANCE_NOT_FOUND` |  | The specified maintenance definition does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `maintenance.due` | A maintenance threshold has been reached for a tracked vehicle | `device_id`, `maintenance_id`, `maintenance_name`, `tracking_type`, `current_value`, `threshold_value` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| odometer-tracking |  |  |
| engine-hours-tracking |  |  |
| gps-position-ingestion |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 4
  entry_points:
    - src/main/java/org/traccar/model/Maintenance.java
    - src/main/java/org/traccar/handler/events/MaintenanceEventHandler.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Maintenance Reminders Blueprint",
  "description": "Define maintenance tasks that trigger notifications when a tracked vehicle crosses a configured odometer, engine hours, or time threshold, with automatic repeat",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, maintenance, odometer, service, reminder, fleet"
}
</script>
