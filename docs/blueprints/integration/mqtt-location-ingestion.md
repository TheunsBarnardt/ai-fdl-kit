---
title: "Mqtt Location Ingestion Blueprint"
layout: default
parent: "Integration"
grand_parent: Blueprint Catalog
description: "Subscribe to a message broker for device location publishes, parse and normalize location payloads, and route each message by type to the appropriate storage or"
---

# Mqtt Location Ingestion Blueprint

> Subscribe to a message broker for device location publishes, parse and normalize location payloads, and route each message by type to the appropriate storage or processing handler.

| | |
|---|---|
| **Feature** | `mqtt-location-ingestion` |
| **Category** | Integration |
| **Version** | 1.0.0 |
| **Tags** | mqtt, location, ingestion, iot, real-time, device-tracking |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/integration/mqtt-location-ingestion.blueprint.yaml) |
| **JSON API** | [mqtt-location-ingestion.json]({{ site.baseurl }}/api/blueprints/integration/mqtt-location-ingestion.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `mobile_device` | Mobile Device | external | OwnTracks-compatible app publishing location JSON to a message broker topic |
| `message_broker` | Message Broker | system | MQTT-compatible broker that relays messages from devices to the recorder |
| `recorder_service` | Recorder Service | system | Subscribes to broker topics, processes payloads, and dispatches to storage |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `topic` | text | Yes | Publish Topic |  |
| `payload` | json | Yes | Raw Payload |  |
| `payload_type` | select | No | Payload Type |  |
| `tst` | number | No | Device Timestamp |  |
| `lat` | number | No | Latitude |  |
| `lon` | number | No | Longitude |  |
| `accuracy` | number | No | Accuracy (metres) |  |
| `tracker_id` | text | No | Tracker ID |  |
| `trigger` | select | No | Report Trigger |  |
| `is_retained` | boolean | No | Retained Flag |  |

## States

**State field:** `connection_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `connecting` |  |  |
| `connected` | Yes |  |
| `reconnecting` |  |  |
| `disconnected` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `connecting` | `connected` | message_broker |  |
|  | `connected` | `reconnecting` | message_broker |  |
|  | `reconnecting` | `connected` | message_broker |  |
|  | `reconnecting` | `disconnected` | recorder_service |  |

## Rules

- **topic_validation:**
  - **minimum_segments:** Topic must contain at least three slash-delimited segments (prefix/user/device); shorter topics are silently discarded
  - **segment_extraction:** User and device names are extracted from positions 1 and 2 (0-indexed); the first segment may be any prefix string
  - **leading_slash_tolerance:** An optional leading slash in the topic is tolerated; segment positions shift accordingly
- **payload_validation:**
  - **empty_discard:** Empty payloads (zero bytes) are discarded without processing
  - **retain_filter:** If the ignore-retained-messages option is enabled, messages with the retained flag set are discarded before parsing
  - **parse_order:** Payload is parsed as JSON first; if JSON fails a CSV-to-JSON conversion is attempted; if both fail the raw binary dump is stored as-is
  - **type_routing:** The _type field in the JSON payload determines routing; an absent or unrecognised _type stores the payload without further processing
- **coordinate_normalisation:**
  - **nan_discard:** For location and transition payloads, lat and lon are normalised to numbers; a NaN result causes the message to be discarded
  - **timestamp_fallback:** The tst field is normalised to a number; if absent or non-numeric the current server time is substituted
- **deduplication:**
  - **out_of_order:** Duplicate or out-of-order location publishes append to history but do not overwrite the last-position snapshot when the incoming tst is not newer than the stored one
- **encryption:**
  - **decrypt_before_process:** Encrypted payloads are decrypted before re-entering the processing pipeline; if decryption fails the message is dropped and logged

## Outcomes

### Empty_payload_discarded (Priority: 1) — Error: `INGESTION_EMPTY_PAYLOAD`

**Given:**
- `payload` (input) not_exists

**Result:** Message silently dropped; no storage operation performed

### Retained_ignored (Priority: 2)

**Given:**
- is_retained is true
- ignore_retained_messages configuration is enabled

**Result:** Retained message discarded; broker state replays do not pollute history

### Invalid_coordinates (Priority: 3) — Error: `INGESTION_INVALID_COORDINATES`

**Given:**
- payload_type is location or transition
- lat or lon cannot be parsed as a finite number

**Result:** Malformed location message dropped and logged; history not updated

### Short_topic_discarded (Priority: 4) — Error: `INGESTION_TOPIC_TOO_SHORT`

**Given:**
- topic has fewer than three slash-delimited segments

**Result:** Message discarded; cannot extract user or device identity

### Location_stored (Priority: 10)

**Given:**
- payload_type equals location
- lat and lon are valid numbers

**Then:**
- **create_record** target: `location_history` — Append the normalised location object to the append-only monthly history log for this user/device
- **set_field** target: `last_position` — Overwrite the last-position record for this user/device if tst is newer than the stored value
- **emit_event** event: `location.received`

**Result:** Location recorded in history log and last-position store; real-time subscribers notified

### Waypoint_received (Priority: 20)

**Given:**
- payload_type equals waypoint or waypoints

**Then:**
- **create_record** target: `waypoint_store` — Persist individual waypoint JSON files keyed by device timestamp
- **emit_event** event: `waypoint.received`

**Result:** Waypoint definitions stored for geofence evaluation; geofence state reloaded

### Transition_received (Priority: 30)

**Given:**
- payload_type equals transition
- lat and lon are valid numbers

**Then:**
- **create_record** target: `location_history` — Transition events appended to the history log like location records
- **emit_event** event: `region.transition.received`

**Result:** Device-reported geofence transition stored and forwarded

### Non_location_stored (Priority: 40)

**Given:**
- payload_type is one of: cmd, steps, lwt, beacon, status

**Then:**
- **create_record** target: `location_history` — Non-location payload stored in history log with its relative topic preserved

**Result:** Auxiliary message persisted for audit; no position update performed

### Card_stored (Priority: 50)

**Given:**
- payload_type equals card

**Then:**
- **create_record** target: `card_store` — User card JSON (display name, avatar) persisted and linked to user/device
- **emit_event** event: `card.updated`

**Result:** Display name and avatar available for map overlays and friend lists

### Unparseable_payload_stored (Priority: 60)

**Given:**
- JSON parsing fails
- CSV parsing also fails

**Then:**
- **create_record** target: `location_history` — Binary-encoded dump of raw payload stored using server time as timestamp

**Result:** Unrecognised payload preserved for manual inspection

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `INGESTION_EMPTY_PAYLOAD` | 400 | Empty message received and discarded | No |
| `INGESTION_INVALID_COORDINATES` | 422 | Location coordinates are missing or invalid | No |
| `INGESTION_TOPIC_TOO_SHORT` | 400 | Message topic is too short to identify a device | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `location.received` | A valid location payload was parsed, stored, and is ready for real-time forwarding | `topic`, `lat`, `lon`, `tst`, `tracker_id`, `trigger` |
| `waypoint.received` | A waypoint definition was received and stored; geofence state should be reloaded | `topic`, `tst` |
| `region.transition.received` | Device reported a geofence entry or exit event | `topic`, `lat`, `lon`, `tst` |
| `card.updated` | User display name or avatar was updated | `topic` |
| `connection.established` | Broker connection is up and subscriptions are active | `broker_host`, `broker_port` |
| `connection.lost` | Broker connection dropped; automatic reconnect will be attempted | `broker_host`, `reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| location-history-storage | required | Stores parsed location records and maintains last-position files |
| geofencing-regions | recommended | Evaluates device position against registered waypoints on each ingested location |
| shared-location-friends | optional | Distributes ingested positions to subscribed friend devices in HTTP mode |

## AGI Readiness

### Goals

#### Reliable Mqtt Location Ingestion

Subscribe to a message broker for device location publishes, parse and normalize location payloads, and route each message by type to the appropriate storage or processing handler.

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| success_rate | >= 99.5% | Successful operations divided by total attempts |
| error_recovery_rate | >= 95% | Errors that auto-recover without manual intervention |

**Constraints:**

- **availability** (non-negotiable): Must degrade gracefully when dependencies are unavailable

### Autonomy

**Level:** `supervised`

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| reliability | throughput | integration failures can cascade across systems |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `location_history_storage` | location-history-storage | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| location_stored | `autonomous` | - | - |
| waypoint_received | `autonomous` | - | - |
| transition_received | `autonomous` | - | - |
| non_location_stored | `autonomous` | - | - |
| card_stored | `autonomous` | - | - |
| empty_payload_discarded | `autonomous` | - | - |
| retained_ignored | `autonomous` | - | - |
| invalid_coordinates | `autonomous` | - | - |
| short_topic_discarded | `autonomous` | - | - |
| unparseable_payload_stored | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/owntracks/recorder
  project: OwnTracks Recorder
  tech_stack: C, libmosquitto, Mongoose HTTP, LMDB, Lua hooks
  files_traced: 5
  entry_points:
    - recorder.c (handle_message)
    - recorder.h
    - udata.h
    - storage.c (putrec, waypoints_dump)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Mqtt Location Ingestion Blueprint",
  "description": "Subscribe to a message broker for device location publishes, parse and normalize location payloads, and route each message by type to the appropriate storage or",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "mqtt, location, ingestion, iot, real-time, device-tracking"
}
</script>
