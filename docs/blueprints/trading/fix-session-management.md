---
title: "Fix Session Management Blueprint"
layout: default
parent: "Trading"
grand_parent: Blueprint Catalog
description: "Manages stateful FIX protocol sessions including logon/logout lifecycle, heartbeat monitoring, sequence number integrity, and time-window enforcement. 11 fields"
---

# Fix Session Management Blueprint

> Manages stateful FIX protocol sessions including logon/logout lifecycle, heartbeat monitoring, sequence number integrity, and time-window enforcement

| | |
|---|---|
| **Feature** | `fix-session-management` |
| **Category** | Trading |
| **Version** | 1.0.0 |
| **Tags** | fix-protocol, session, heartbeat, sequence-numbers, financial-messaging |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/trading/fix-session-management.blueprint.yaml) |
| **JSON API** | [fix-session-management.json]({{ site.baseurl }}/api/blueprints/trading/fix-session-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `initiator` | Session Initiator | system | Client-side participant that initiates outbound FIX connections and sends Logon |
| `acceptor` | Session Acceptor | system | Server-side participant that listens for incoming FIX connections and responds to Logon |
| `application` | Application Layer | system | Business application that implements callbacks for session lifecycle events and message handling |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `sender_comp_id` | text | Yes |  |  |
| `target_comp_id` | text | Yes |  |  |
| `begin_string` | select | Yes |  |  |
| `session_qualifier` | text | No |  |  |
| `heartbeat_interval` | number | Yes |  |  |
| `logon_timeout` | number | No |  |  |
| `logout_timeout` | number | No |  |  |
| `next_sender_seq_num` | number | No |  |  |
| `next_target_seq_num` | number | No |  |  |
| `reset_seq_num_flag` | boolean | No |  |  |
| `default_appl_ver_id` | text | No |  |  |

## States

**State field:** `connection_state`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `disconnected` | Yes |  |
| `pending` |  |  |
| `connected` |  |  |
| `logged_on` |  |  |
| `logging_out` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `disconnected` | `pending` | initiator |  |
|  | `pending` | `connected` | initiator |  |
|  | `disconnected` | `connected` | acceptor |  |
|  | `connected` | `logged_on` | initiator |  |
|  | `connected` | `logged_on` | acceptor |  |
|  | `logged_on` | `logging_out` | application |  |
|  | `logging_out` | `disconnected` | system |  |
|  | `logged_on` | `disconnected` | system |  |

## Rules

- **session_identity:** Both SenderCompID and TargetCompID must match configured session identity on every received message, A SessionQualifier can be added to distinguish parallel sessions between the same counterparties
- **sequence_numbers:** All messages are numbered sequentially starting at 1; gaps trigger a ResendRequest, Out-of-sequence messages are queued until a Resend fills the gap, ResetSeqNumFlag=Y in a Logon message causes both parties to reset to sequence number 1, Application may manually set next sender or target sequence number before logon
- **heartbeat:** Heartbeat messages are sent at the configured interval when no other messages are sent, If no message is received within heartbeat_interval seconds, a TestRequest is sent, If no response to TestRequest arrives within heartbeat_interval, the session disconnects, Heartbeat interval is negotiated during Logon (sent by initiator, may be overridden by acceptor)
- **logon_time_window:** Sessions can be restricted to a time window (e.g., market hours) via StartTime/EndTime, A session received outside its valid logon window is immediately disconnected, NonStopSession=Y disables time-window enforcement for 24/7 operation
- **session_recovery:** {"ResetOnLogon":"reset sequence numbers each time a logon occurs"}, {"ResetOnLogout":"reset when a logout is processed"}, {"ResetOnDisconnect":"reset whenever the TCP connection drops"}

## SLA

| Scope | Max Duration | Escalation |
|-------|-------------|------------|
| logon_timeout | 10s |  |
| logout_timeout | 2s |  |
| max_latency | 120s |  |

## Flows

### Logon_flow

FIX session establishment between initiator and acceptor

1. **Send Logon message with HeartBtInt, EncryptMethod, and optional ResetSeqNumFlag** (initiator)
1. **Validate SenderCompID/TargetCompID, check logon time window, call application.fromAdmin()** (acceptor)
1. **Send Logon response (same HeartBtInt)** (acceptor)
1. **Receive Logon response; call application.onLogon(); session is now active** (initiator)
1. **Call application.onLogon(); session is now active** (acceptor)

### Heartbeat_flow

Keepalive mechanism to detect dead connections

1. **Track time since last sent/received message** (system)
1. **Send Heartbeat if heartbeat_interval elapsed since last outgoing message** (system)
1. **If heartbeat_interval elapsed since last incoming message, send TestRequest** (system)
1. **If TestRequest response not received within heartbeat_interval, disconnect** (system)

## Outcomes

### Session_disabled (Priority: 1) — Error: `SESSION_DISABLED`

**Given:**
- session enabled flag is false

**Then:**
- **emit_event** event: `fix.session.logon_rejected`

**Result:** Logon request is ignored; disconnect is triggered

### Logon_outside_time_window (Priority: 2) — Error: `LOGON_OUTSIDE_TIME_WINDOW`

**Given:**
- logon is received
- current time is outside configured logon time window

**Then:**
- **emit_event** event: `fix.session.logon_rejected`

**Result:** Connection is immediately terminated

### Logon_rejected_by_application (Priority: 3) — Error: `LOGON_REJECTED`

**Given:**
- logon is received
- application throws RejectLogon exception in fromAdmin callback

**Then:**
- **emit_event** event: `fix.session.logon_rejected`

**Result:** Logout message sent, then disconnected

### Comp_id_mismatch (Priority: 4) — Error: `COMP_ID_MISMATCH`

**Given:**
- message received
- SenderCompID or TargetCompID does not match configured session values

**Then:**
- **emit_event** event: `fix.session.message_rejected`

**Result:** Message rejected with SessionReject; may force logout

### Logon_timeout_elapsed (Priority: 5) — Error: `LOGON_TIMEOUT`

**Given:**
- logon request was sent
- no logon response received within logon_timeout seconds

**Then:**
- **transition_state** field: `connection_state` from: `connected` to: `disconnected`
- **emit_event** event: `fix.session.disconnected`

**Result:** Session disconnected; initiator will attempt reconnect after interval

### Heartbeat_timeout (Priority: 6) — Error: `HEARTBEAT_TIMEOUT`

**Given:**
- session is in logged_on state
- no message received for heartbeat_interval seconds
- TestRequest was sent but no response after heartbeat_interval more seconds

**Then:**
- **transition_state** field: `connection_state` from: `logged_on` to: `disconnected`
- **emit_event** event: `fix.session.disconnected`

**Result:** Session terminated due to heartbeat timeout

### Sequence_gap_detected (Priority: 7)

**Given:**
- message received with sequence number higher than expected

**Then:**
- **emit_event** event: `fix.session.resend_requested`

**Result:** ResendRequest sent for the missing range; message queued until gap filled

### Logon_successful (Priority: 10)

**Given:**
- session is enabled
- current time is within logon time window
- Logon message contains valid SenderCompID and TargetCompID
- application does not throw RejectLogon

**Then:**
- **transition_state** field: `connection_state` from: `connected` to: `logged_on`
- **emit_event** event: `fix.session.logged_on`

**Result:** Session is fully established; application receives onLogon callback

### Logout_successful (Priority: 11)

**Given:**
- Logout message received or application calls logout()
- session is in logged_on state

**Then:**
- **transition_state** field: `connection_state` from: `logged_on` to: `disconnected`
- **emit_event** event: `fix.session.logged_out`

**Result:** Session cleanly terminated; application receives onLogout callback

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SESSION_DISABLED` | 503 | Session is not enabled for logon | No |
| `LOGON_OUTSIDE_TIME_WINDOW` | 503 | Received logon outside of valid logon time | No |
| `LOGON_REJECTED` | 403 | Logon rejected by application | No |
| `COMP_ID_MISMATCH` | 400 | SenderCompID/TargetCompID mismatch | No |
| `LOGON_TIMEOUT` | 503 | Timed out waiting for logon response | No |
| `HEARTBEAT_TIMEOUT` | 503 | Timed out waiting for heartbeat | No |
| `SEQUENCE_GAP` | 500 | Message sequence gap detected | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `fix.session.logged_on` | FIX session successfully established after Logon exchange | `session_id`, `sender_comp_id`, `target_comp_id`, `begin_string` |
| `fix.session.logged_out` | Session cleanly terminated via Logout exchange | `session_id`, `reason` |
| `fix.session.disconnected` | Session terminated due to error, timeout, or network failure | `session_id`, `reason` |
| `fix.session.logon_rejected` | Incoming Logon was refused | `session_id`, `reason` |
| `fix.session.resend_requested` | Sequence gap detected; ResendRequest sent for missing messages | `session_id`, `begin_seq_no`, `end_seq_no` |
| `fix.session.message_rejected` | A message was rejected due to validation failure | `session_id`, `msg_seq_num`, `reject_reason` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| fix-message-building | required | Session sends and receives FIX messages structured by the message-building feature |
| fix-connection-management | required | Session requires an active TCP connection managed by the connection layer |
| fix-message-persistence | required | All sent and received messages are persisted for sequence number recovery |
| fix-protocol-validation | recommended | Incoming messages are validated against a DataDictionary before delivery |

## AGI Readiness

### Goals

#### Reliable Fix Session Management

Manages stateful FIX protocol sessions including logon/logout lifecycle, heartbeat monitoring, sequence number integrity, and time-window enforcement

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| policy_violation_rate | 0% | Operations that violate defined policies |
| audit_completeness | 100% | All decisions have complete audit trails |

**Constraints:**

- **regulatory** (non-negotiable): All operations must be auditable and traceable

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| accuracy | latency | trading operations require precise execution and full audit trails |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `fix_message_building` | fix-message-building | fail |
| `fix_connection_management` | fix-connection-management | fail |
| `fix_message_persistence` | fix-message-persistence | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| session_disabled | `human_required` | - | - |
| logon_outside_time_window | `autonomous` | - | - |
| logon_rejected_by_application | `supervised` | - | - |
| comp_id_mismatch | `autonomous` | - | - |
| logon_timeout_elapsed | `autonomous` | - | - |
| heartbeat_timeout | `autonomous` | - | - |
| sequence_gap_detected | `autonomous` | - | - |
| logon_successful | `autonomous` | - | - |
| logout_successful | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
tech_stack:
  language: C++
  framework: FIX Protocol Engine
  protocol: FIX 4.0–5.0 SP2 / FIXT 1.1
admin_message_types:
  - Logon (A)
  - Logout (5)
  - Heartbeat (0)
  - TestRequest (1)
  - ResendRequest (2)
  - Reject (3)
  - SequenceReset (4)
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Fix Session Management Blueprint",
  "description": "Manages stateful FIX protocol sessions including logon/logout lifecycle, heartbeat monitoring, sequence number integrity, and time-window enforcement. 11 fields",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "fix-protocol, session, heartbeat, sequence-numbers, financial-messaging"
}
</script>
