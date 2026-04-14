<!-- AUTO-GENERATED FROM terminal-fleet.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Terminal Fleet

> Fleet management for Android payment terminals — device registration, remote configuration, OTA updates, health monitoring, and alerting

**Category:** Infrastructure · **Version:** 1.0.0 · **Tags:** fleet-management · terminal · device-management · monitoring · ota-updates

## What this does

Fleet management for Android payment terminals — device registration, remote configuration, OTA updates, health monitoring, and alerting

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **terminal_id** *(token, required)* — Terminal ID
- **device_serial** *(text, required)* — Device Serial Number
- **merchant_id** *(text, required)* — Merchant ID
- **location_name** *(text, required)* — Location Name
- **location_coordinates** *(json, optional)* — Location Coordinates
- **app_version** *(text, required)* — App Version
- **os_version** *(text, optional)* — Android OS Version
- **terminal_status** *(select, required)* — Terminal Status
- **last_heartbeat** *(datetime, optional)* — Last Heartbeat
- **heartbeat_interval_seconds** *(number, required)* — Heartbeat Interval (seconds)
- **config_version** *(text, optional)* — Configuration Version
- **config_payload** *(json, optional)* — Configuration Payload
- **scanner_status** *(select, optional)* — Palm Scanner Status
- **card_reader_status** *(select, optional)* — Card Reader Status
- **battery_level** *(number, optional)* — Battery Level (%)
- **connectivity_type** *(select, optional)* — Connectivity Type

## What must be true

- **heartbeat → interval:** Terminals send heartbeat every configured interval (default 60s)
- **heartbeat → offline_threshold:** Terminal marked offline after 3 missed heartbeats
- **heartbeat → payload:** Heartbeat includes battery level, connectivity type, scanner status, card reader status, app version
- **registration → unique_serial:** Each device serial number can only be registered once
- **registration → merchant_required:** Every terminal must be associated with a merchant
- **configuration → versioned:** All configuration changes are versioned for rollback
- **configuration → staged_rollout:** Config updates can target individual terminals, locations, or entire fleet
- **configuration → validation:** Config payload is validated before push — invalid configs are rejected
- **updates → ota_only:** App updates delivered via OTA through device management system
- **updates → staged:** Updates roll out in stages — test group first, then wider fleet
- **updates → rollback:** Failed updates auto-rollback to previous version
- **security → device_auth:** Terminals authenticate to backend via device certificates
- **security → config_signed:** Configuration payloads are signed to prevent tampering
- **security → decommission_wipe:** Decommissioned terminals must have all local data wiped

## Success & failure scenarios

**✅ Success paths**

- **Terminal Registered** — when Fleet admin registers a new terminal; Device serial number is provided; Merchant ID is provided, then Terminal registered and awaiting first heartbeat to activate.
- **Heartbeat Received** — when Terminal is active or newly registered, then Terminal health data updated.
- **Terminal Went Offline** — when Terminal was previously active; Terminal has missed 3 consecutive heartbeats, then Terminal marked offline — fleet admin notified.
- **Config Pushed** — when Fleet admin pushes new configuration; Terminal is active and reachable, then Configuration update pushed to terminal.
- **App Update Triggered** — when Fleet admin triggers OTA app update; Terminal is active, then Terminal enters maintenance mode for app update.
- **Terminal Decommissioned** — when Fleet admin decommissions terminal; Terminal is not already decommissioned, then Terminal decommissioned and local data wiped.
- **Hardware Degraded** — when terminal_status eq "active"; scanner_status eq "degraded" OR card_reader_status eq "degraded", then Fleet admin alerted about hardware degradation.

## Errors it can return

- `FLEET_DUPLICATE_SERIAL` — A terminal with this serial number is already registered
- `FLEET_TERMINAL_NOT_FOUND` — Terminal not found in fleet registry
- `FLEET_TERMINAL_OFFLINE` — Terminal is offline and cannot receive updates
- `FLEET_INVALID_CONFIG` — Configuration payload is invalid — check format and values
- `FLEET_UPDATE_FAILED` — App update failed — terminal will rollback to previous version
- `FLEET_UNAUTHORIZED` — Device authentication failed — invalid certificate

## Events

**`fleet.terminal.registered`** — New terminal registered in fleet
  Payload: `terminal_id`, `device_serial`, `merchant_id`, `location_name`

**`fleet.heartbeat.received`** — Heartbeat received from terminal
  Payload: `terminal_id`, `battery_level`, `scanner_status`, `card_reader_status`

**`fleet.terminal.offline`** — Terminal marked offline after missed heartbeats
  Payload: `terminal_id`, `location_name`, `last_heartbeat`

**`fleet.config.pushed`** — Configuration update pushed to terminal
  Payload: `terminal_id`, `config_version`

**`fleet.update.triggered`** — OTA app update triggered for terminal
  Payload: `terminal_id`, `app_version`

**`fleet.terminal.decommissioned`** — Terminal permanently removed from fleet
  Payload: `terminal_id`, `device_serial`

**`fleet.hardware.degraded`** — Hardware component degraded on active terminal
  Payload: `terminal_id`, `scanner_status`, `card_reader_status`, `location_name`

## Connects to

- **terminal-payment-flow** *(recommended)* — Terminal payment flow runs on devices managed by this fleet system

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████████` | 10/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `█████████░` | 9/10 |
| Error binding | `██░░░░░░░░` | 2/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `███████░░░` | 7/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/infrastructure/terminal-fleet/) · **Spec source:** [`terminal-fleet.blueprint.yaml`](./terminal-fleet.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
