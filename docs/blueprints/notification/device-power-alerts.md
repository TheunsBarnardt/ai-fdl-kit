---
title: "Device Power Alerts Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "Monitor battery voltage, battery level percentage, and external power supply state transmitted by GPS tracking hardware, and emit alerts when power conditions t"
---

# Device Power Alerts Blueprint

> Monitor battery voltage, battery level percentage, and external power supply state transmitted by GPS tracking hardware, and emit alerts when power conditions threaten continuous device operation (...

| | |
|---|---|
| **Feature** | `device-power-alerts` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | gps, tracking, battery, power, alert, fleet, hardware |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/device-power-alerts.blueprint.yaml) |
| **JSON API** | [device-power-alerts.json]({{ site.baseurl }}/api/blueprints/notification/device-power-alerts.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `device` | GPS Device | external | Reports battery voltage, battery level, and power supply state in position transmissions |
| `pipeline` | Alarm Event Handler | system | Detects power-related alarm codes in positions and generates events |
| `fleet_user` | Fleet User | human | Receives power alerts to arrange battery replacement or investigate tampering |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `battery_level` | number | No | Battery charge level as a percentage (0–100%) |  |
| `battery_voltage` | number | No | Battery voltage in volts |  |
| `external_power_voltage` | number | No | External (vehicle) power supply voltage in volts |  |
| `alarm` | text | No | Comma-separated alarm codes in the position that may include power-related codes: low_battery, lo... |  |

## Rules

- **rule_1:** Power alarm codes are embedded in the position alarm attribute by the device; each code generates a separate alert event
- **rule_2:** low_battery indicates the internal battery is below a device-defined threshold; devices typically decide the threshold in firmware
- **rule_3:** power_cut indicates the vehicle external power supply has been disconnected (possible tampering or vehicle power failure)
- **rule_4:** power_restored indicates external power has been reconnected after a power_cut event
- **rule_5:** power_off and power_on reflect transitions detected by the device in the main power rail
- **rule_6:** Battery and power voltage readings are stored on every position and can be charted over time to identify degradation trends
- **rule_7:** Power alert events follow the same alarm processing pipeline as other alarm types (see device-alarm-notifications); duplicate suppression applies

## Outcomes

### No_power_data (Priority: 3)

**Given:**
- position does not include any power or battery attributes

**Result:** No power events generated for this position; device does not report power telemetry

### Battery_data_recorded (Priority: 5)

**Given:**
- position includes battery_level or battery_voltage attributes

**Then:**
- **set_field** target: `position.battery_level` — Battery level percentage stored on position
- **set_field** target: `position.battery_voltage` — Battery voltage stored on position

**Result:** Battery telemetry captured on position record; available for trend analysis and reporting

### Power_alarm_generated (Priority: 10)

**Given:**
- position alarm attribute contains a power-related alarm code
- ANY: duplicate suppression is disabled OR alarm code was not present in the previous position

**Then:**
- **create_record** target: `event` — Power alarm event recorded with type = alarm, alarm_type = power alarm code, device_id, position_id
- **emit_event** event: `device.power_alarm`

**Result:** Power alert event stored; notification handlers dispatch alerts to subscribed users

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `POWER_DEVICE_NOT_FOUND` | 404 | The device referenced does not exist | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `device.power_alarm` | Device has reported a power-related condition (low battery, power cut, power restored) | `device_id`, `alarm_type`, `battery_level`, `battery_voltage`, `external_power_voltage`, `fix_time`, `position_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| device-alarm-notifications | required | Power alarms are processed through the same alarm event pipeline |
| gps-position-ingestion | required | Power telemetry and alarm codes arrive as position attributes |
| device-status-tracking | recommended | Power cut may correlate with device going offline shortly after |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/traccar/traccar
  project: Traccar GPS Tracking Server
  tech_stack: Java 17, Netty
  files_traced: 4
  entry_points:
    - src/main/java/org/traccar/handler/events/AlarmEventHandler.java
    - src/main/java/org/traccar/model/Position.java
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Device Power Alerts Blueprint",
  "description": "Monitor battery voltage, battery level percentage, and external power supply state transmitted by GPS tracking hardware, and emit alerts when power conditions t",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "gps, tracking, battery, power, alert, fleet, hardware"
}
</script>
