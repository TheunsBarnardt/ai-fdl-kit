---
title: "Terminal Fleet Blueprint"
layout: default
parent: "Infrastructure"
grand_parent: Blueprint Catalog
description: "Fleet management for Android payment terminals — device registration, remote configuration, OTA updates, health monitoring, and alerting. 16 fields. 7 outcomes."
---

# Terminal Fleet Blueprint

> Fleet management for Android payment terminals — device registration, remote configuration, OTA updates, health monitoring, and alerting

| | |
|---|---|
| **Feature** | `terminal-fleet` |
| **Category** | Infrastructure |
| **Version** | 1.0.0 |
| **Tags** | fleet-management, terminal, device-management, monitoring, ota-updates |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/infrastructure/terminal-fleet.blueprint.yaml) |
| **JSON API** | [terminal-fleet.json]({{ site.baseurl }}/api/blueprints/infrastructure/terminal-fleet.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `fleet_admin` | Fleet Administrator | human | Manages terminal fleet — registers devices, pushes configs, triggers updates |
| `terminal_device` | Terminal Device | system | Android payment terminal running the terminal app |
| `mdm_system` | Device Management System | system | Mobile device management platform handling OTA updates and remote config |
| `monitoring_system` | Monitoring System | system | Collects heartbeats and health data, triggers alerts |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `terminal_id` | token | Yes | Terminal ID |  |
| `device_serial` | text | Yes | Device Serial Number | Validations: required |
| `merchant_id` | text | Yes | Merchant ID |  |
| `location_name` | text | Yes | Location Name |  |
| `location_coordinates` | json | No | Location Coordinates |  |
| `app_version` | text | Yes | App Version |  |
| `os_version` | text | No | Android OS Version |  |
| `terminal_status` | select | Yes | Terminal Status |  |
| `last_heartbeat` | datetime | No | Last Heartbeat |  |
| `heartbeat_interval_seconds` | number | Yes | Heartbeat Interval (seconds) | Validations: min, max |
| `config_version` | text | No | Configuration Version |  |
| `config_payload` | json | No | Configuration Payload |  |
| `scanner_status` | select | No | Palm Scanner Status |  |
| `card_reader_status` | select | No | Card Reader Status |  |
| `battery_level` | number | No | Battery Level (%) | Validations: min, max |
| `connectivity_type` | select | No | Connectivity Type |  |

## States

**State field:** `terminal_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `registered` | Yes |  |
| `active` |  |  |
| `offline` |  |  |
| `maintenance` |  |  |
| `decommissioned` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `registered` | `active` | terminal_device |  |
|  | `active` | `offline` | monitoring_system | missed_heartbeats >= 3 |
|  | `offline` | `active` | terminal_device |  |
|  | `active` | `maintenance` | fleet_admin |  |
|  | `maintenance` | `active` | terminal_device |  |
|  | `active` | `decommissioned` | fleet_admin |  |
|  | `offline` | `decommissioned` | fleet_admin |  |
|  | `maintenance` | `decommissioned` | fleet_admin |  |

## Rules

- **heartbeat:**
  - **interval:** Terminals send heartbeat every configured interval (default 60s)
  - **offline_threshold:** Terminal marked offline after 3 missed heartbeats
  - **payload:** Heartbeat includes battery level, connectivity type, scanner status, card reader status, app version
- **registration:**
  - **unique_serial:** Each device serial number can only be registered once
  - **merchant_required:** Every terminal must be associated with a merchant
- **configuration:**
  - **versioned:** All configuration changes are versioned for rollback
  - **staged_rollout:** Config updates can target individual terminals, locations, or entire fleet
  - **validation:** Config payload is validated before push — invalid configs are rejected
- **updates:**
  - **ota_only:** App updates delivered via OTA through device management system
  - **staged:** Updates roll out in stages — test group first, then wider fleet
  - **rollback:** Failed updates auto-rollback to previous version
- **security:**
  - **device_auth:** Terminals authenticate to backend via device certificates
  - **config_signed:** Configuration payloads are signed to prevent tampering
  - **decommission_wipe:** Decommissioned terminals must have all local data wiped

## Outcomes

### Terminal_registered (Priority: 1)

**Given:**
- Fleet admin registers a new terminal
- `device_serial` (input) exists
- `merchant_id` (input) exists

**Then:**
- **create_record** target: `terminals` — Create terminal record in fleet registry
- **transition_state** field: `terminal_status` to: `registered`
- **emit_event** event: `fleet.terminal.registered`

**Result:** Terminal registered and awaiting first heartbeat to activate

### Heartbeat_received (Priority: 2)

**Given:**
- `terminal_status` (db) in `active,registered`

**Then:**
- **set_field** target: `last_heartbeat` value: `current timestamp`
- **set_field** target: `battery_level` value: `from heartbeat payload`
- **set_field** target: `scanner_status` value: `from heartbeat payload`
- **set_field** target: `card_reader_status` value: `from heartbeat payload`
- **emit_event** event: `fleet.heartbeat.received`

**Result:** Terminal health data updated

### Terminal_went_offline (Priority: 3)

**Given:**
- `terminal_status` (db) eq `active`
- Terminal has missed 3 consecutive heartbeats

**Then:**
- **transition_state** field: `terminal_status` from: `active` to: `offline`
- **notify** — Alert fleet admin that terminal is offline
- **emit_event** event: `fleet.terminal.offline`

**Result:** Terminal marked offline — fleet admin notified

### Config_pushed (Priority: 4)

**Given:**
- Fleet admin pushes new configuration
- `terminal_status` (db) eq `active`

**Then:**
- **set_field** target: `config_version` value: `new config version`
- **set_field** target: `config_payload` value: `validated config data`
- **emit_event** event: `fleet.config.pushed`

**Result:** Configuration update pushed to terminal

### App_update_triggered (Priority: 5)

**Given:**
- Fleet admin triggers OTA app update
- `terminal_status` (db) eq `active`

**Then:**
- **transition_state** field: `terminal_status` from: `active` to: `maintenance`
- **call_service** target: `mdm_system.push_update` — Push app update via device management system
- **emit_event** event: `fleet.update.triggered`

**Result:** Terminal enters maintenance mode for app update

### Terminal_decommissioned (Priority: 6) | Transaction: atomic

**Given:**
- Fleet admin decommissions terminal
- `terminal_status` (db) in `active,offline,maintenance`

**Then:**
- **transition_state** field: `terminal_status` from: `active` to: `decommissioned`
- **call_service** target: `mdm_system.remote_wipe` — Wipe all local data from decommissioned terminal
- **emit_event** event: `fleet.terminal.decommissioned`

**Result:** Terminal decommissioned and local data wiped

### Hardware_degraded (Priority: 7)

**Given:**
- `terminal_status` (db) eq `active`
- ANY: `scanner_status` (db) eq `degraded` OR `card_reader_status` (db) eq `degraded`

**Then:**
- **notify** — Alert fleet admin about degraded hardware component
- **emit_event** event: `fleet.hardware.degraded`

**Result:** Fleet admin alerted about hardware degradation

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `FLEET_DUPLICATE_SERIAL` | 409 | A terminal with this serial number is already registered | No |
| `FLEET_TERMINAL_NOT_FOUND` | 404 | Terminal not found in fleet registry | No |
| `FLEET_TERMINAL_OFFLINE` | 503 | Terminal is offline and cannot receive updates | Yes |
| `FLEET_INVALID_CONFIG` | 400 | Configuration payload is invalid — check format and values | No |
| `FLEET_UPDATE_FAILED` | 500 | App update failed — terminal will rollback to previous version | Yes |
| `FLEET_UNAUTHORIZED` | 401 | Device authentication failed — invalid certificate | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fleet.terminal.registered` | New terminal registered in fleet | `terminal_id`, `device_serial`, `merchant_id`, `location_name` |
| `fleet.heartbeat.received` | Heartbeat received from terminal | `terminal_id`, `battery_level`, `scanner_status`, `card_reader_status` |
| `fleet.terminal.offline` | Terminal marked offline after missed heartbeats | `terminal_id`, `location_name`, `last_heartbeat` |
| `fleet.config.pushed` | Configuration update pushed to terminal | `terminal_id`, `config_version` |
| `fleet.update.triggered` | OTA app update triggered for terminal | `terminal_id`, `app_version` |
| `fleet.terminal.decommissioned` | Terminal permanently removed from fleet | `terminal_id`, `device_serial` |
| `fleet.hardware.degraded` | Hardware component degraded on active terminal | `terminal_id`, `scanner_status`, `card_reader_status`, `location_name` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| terminal-payment-flow | recommended | Terminal payment flow runs on devices managed by this fleet system |

## AGI Readiness

### Goals

#### Reliable Terminal Fleet

Fleet management for Android payment terminals — device registration, remote configuration, OTA updates, health monitoring, and alerting

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99% | Successful operations divided by total attempts |
| error_rate | < 1% | Failed operations divided by total attempts |

**Constraints:**

- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| availability | cost | infrastructure downtime impacts all dependent services |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| terminal_registered | `autonomous` | - | - |
| heartbeat_received | `autonomous` | - | - |
| terminal_went_offline | `autonomous` | - | - |
| config_pushed | `autonomous` | - | - |
| app_update_triggered | `supervised` | - | - |
| terminal_decommissioned | `autonomous` | - | - |
| hardware_degraded | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Terminal Fleet Blueprint",
  "description": "Fleet management for Android payment terminals — device registration, remote configuration, OTA updates, health monitoring, and alerting. 16 fields. 7 outcomes.",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fleet-management, terminal, device-management, monitoring, ota-updates"
}
</script>
