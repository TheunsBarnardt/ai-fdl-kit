---
title: "Device Alarm Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Process hardware alarm codes embedded in device position transmissions, generate individual alert events per alarm type (SOS, tamper, vibration, accident, jammi"
---

# Device Alarm Notifications Blueprint

> Process hardware alarm codes embedded in device position transmissions, generate individual alert events per alarm type (SOS, tamper, vibration, accident, jamming, etc.), and route notifications to subscribed users.

| | |
|---|---|
| **Feature** | `device-alarm-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, alarm, sos, panic, tamper, safety, fleet, alert |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/device-alarm-notifications.blueprint.yaml) |
| **JSON API** | [device-alarm-notifications.json]({{ site.baseurl }}/api/blueprints/notification/device-alarm-notifications.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `device` | GPS Device | external | Embeds alarm codes in position transmissions when triggered by sensors or driver input |
| `pipeline` | Alarm Event Handler | system | Parses alarm codes from positions and generates one alert event per active alarm |
| `fleet_user` | Fleet User | human | Receives alarm notifications and responds to emergencies |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `alarm` | text | No |  |  |
| `alarm_type` | select | No |  |  |
| `suppress_duplicates` | boolean | No |  |  |

## Rules

- A position may carry multiple simultaneous alarm codes; each alarm code generates a separate alert event
- If suppress_duplicates is enabled, an alarm code that was already present in the previous position does not generate a new event; only newly appearing codes trigger alerts
- Each alarm event is linked to the position where it was detected, preserving exact coordinates and time
- Alarm events can be routed to users via any configured notification channel (push, email, SMS, webhook)
- Alarm codes are device and protocol specific; the platform normalises known codes to standard identifiers

## Outcomes

### No_alarm_code (Priority: 3)

**Given:**
- position does not carry any alarm attribute

**Result:** No alarm event generated for this position

### Duplicate_alarm_suppressed (Priority: 5)

**Given:**
- alarm code is present in both the current and previous position
- `suppress_duplicates` (db) eq `true`

**Result:** Duplicate alarm suppressed; no redundant alert generated

### Alarm_event_generated (Priority: 10)

**Given:**
- position carries one or more alarm codes in the alarm attribute
- ANY: suppress_duplicates is false OR the alarm code was not present in the previous position

**Then:**
- **create_record** target: `event` — Alarm event recorded with type = alarm, alarm_type, device_id, position_id
- **emit_event** event: `alarm.triggered`

**Result:** Alarm event stored; notification handlers dispatch alerts to subscribed users

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `ALARM_DEVICE_NOT_FOUND` |  | The device referenced in the position record does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `alarm.triggered` | A device has transmitted an alarm code requiring operator attention | `device_id`, `alarm_type`, `position_id`, `fix_time`, `latitude`, `longitude` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| gps-position-ingestion |  |  |
| device-status-tracking |  |  |
| fleet-device-sharing |  |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 5
  entry_points:
    - src/main/java/org/traccar/handler/events/AlarmEventHandler.java
    - src/main/java/org/traccar/model/Position.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Device Alarm Notifications Blueprint",
  "description": "Process hardware alarm codes embedded in device position transmissions, generate individual alert events per alarm type (SOS, tamper, vibration, accident, jammi",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, alarm, sos, panic, tamper, safety, fleet, alert"
}
</script>
