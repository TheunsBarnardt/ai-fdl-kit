---
title: "Client Failure Recovery Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Systematic procedures for detecting and recovering from client or gateway failures with message replay and order state resynchronization. 5 fields. 4 outcomes. "
---

# Client Failure Recovery Blueprint

> Systematic procedures for detecting and recovering from client or gateway failures with message replay and order state resynchronization

| | |
|---|---|
| **Feature** | `client-failure-recovery` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | failure-recovery, session-management, message-replay |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/client-failure-recovery.blueprint.yaml) |
| **JSON API** | [client-failure-recovery.json]({{ site.baseurl }}/api/blueprints/trading/client-failure-recovery.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `failure_type` | select | Yes | Failure category |  |
| `detection_timestamp` | datetime | Yes | Failure detected at |  |
| `last_sequence_number` | number | Yes | Last received sequence |  |
| `messages_missed` | number | No | Count of missed messages |  |
| `orders_affected` | number | No | Orders with state changes |  |

## Rules

- **failure_detection:**
  - **connection_loss:** TCP connection terminated or timeout detected
  - **heartbeat_timeout:** No heartbeat response within configured interval
  - **automatic_detection:** System detects loss automatically
- **recovery_procedures:**
  - **phase_1:** Client establishes new TCP connection to gateway
  - **phase_2:** Client sends Logon with CompID and credentials
  - **phase_3:** Client connects to recovery channel
  - **phase_4:** Client requests missed messages via Missed Message Request
  - **phase_5:** Server replays messages in sequence order
  - **phase_6:** Client reconciles order and execution state
- **message_handling:**
  - **sequence_numbering:** All messages numbered for gap detection
  - **retention_policy:** Messages retained for 5-7 days typically
  - **replay_order:** Missed messages in original sequence

## Outcomes

### Failure_detection (Priority: 1)

_System detects connection loss or heartbeat timeout_

**Given:**
- TCP disconnection

**Then:**
- Mark session disconnected
- Queue subsequent messages

**Result:** System ready for reconnection

### Client_reconnection (Priority: 5)

_Client reconnects and authenticates_

**Given:**
- New connection initiated

**Then:**
- Authenticate client
- Establish session

**Result:** Client authenticated

### Message_recovery (Priority: 8)

_Client retrieves missed messages_

**Given:**
- Client on recovery channel

**Then:**
- Stream missed messages in sequence

**Result:** Client receives historical messages

### State_resync (Priority: 10)

_Client reconciles state with server_

**Given:**
- All messages retrieved

**Then:**
- Validate order and execution state

**Result:** Full resynchronization complete

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `RECOVERY_UNAVAILABLE` | 503 | Recovery channel unavailable | No |
| `MESSAGE_QUEUE_EXPIRED` | 410 | Requested messages older than retention period | No |
| `SEQUENCE_GAP` | 409 | Gap in message sequence detected | No |
| `STATE_MISMATCH` | 409 | Client state does not match server | No |
| `SYSTEM_SUSPENDED` | 503 | System or partition suspended | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `failure.detected` |  | `failure_type`, `timestamp` |
| `session.established` |  | `client_id` |
| `recovery.initiated` |  | `start_seq`, `end_seq` |
| `recovery.complete` |  | `client_id` |
| `reconciliation.required` |  | `discrepancy_type` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| native-trading-gateway-enhanced | required |  |
| native-trading-gateway-basic | required |  |
| drop-copy-gateway-fix | recommended |  |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
failure_scenarios:
  client_connection_loss: Network or client crash
  gateway_outage: Gateway or internal failure
  site_failure: Datacenter-level outage
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Client Failure Recovery Blueprint",
  "description": "Systematic procedures for detecting and recovering from client or gateway failures with message replay and order state resynchronization. 5 fields. 4 outcomes. ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "failure-recovery, session-management, message-replay"
}
</script>
