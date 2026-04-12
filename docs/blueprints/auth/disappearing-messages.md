---
title: "Disappearing Messages Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Per-conversation timer that automatically deletes messages on all participant devices after a configurable duration, with the server assisting by propagating ti"
---

# Disappearing Messages Blueprint

> Per-conversation timer that automatically deletes messages on all participant devices after a configurable duration, with the server assisting by propagating timer changes

| | |
|---|---|
| **Feature** | `disappearing-messages` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | messaging, privacy, ephemeral, timer, client-enforced |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/disappearing-messages.blueprint.yaml) |
| **JSON API** | [disappearing-messages.json]({{ site.baseurl }}/api/blueprints/auth/disappearing-messages.json) |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `conversation_id` | text | Yes | Conversation ID |  |
| `expire_timer_seconds` | number | Yes | Expire Timer (seconds) |  |
| `set_by` | text | No | Set By |  |
| `message_received_at` | number | No | Message Received At |  |
| `message_id` | text | No | Message ID |  |

## Rules

- **client_enforcement:** Disappearing message deletion is enforced entirely on client devices; the server does not delete message content, Clients must schedule local deletion at message_received_at + expire_timer_seconds * 1000; messages must be deleted even if the app is backgrounded or restarted, Clients must not rely on the server to confirm or enforce deletion; the server merely relays the timer value
- **timer_propagation:** The server propagates timer-change messages to all participant devices as standard encrypted messages so every device applies the same timer, A timer value of 0 disables disappearing messages for the conversation, Valid non-zero timer values are positive integers representing seconds; recommended presets include 5 seconds, 1 minute, 5 minutes, 1 hour, 1 day, and 1 week, When a new participant joins a group conversation they receive the current timer value as part of the group state, Timer-change messages must be delivered to all linked devices of each participant so deletion is consistent across devices, A timer-change by any participant overrides the previous timer for all participants; the last-writer-wins rule applies
- **group_rules:** Groups may restrict timer changes to administrators only; clients enforce this restriction, and the server passes through the encrypted control message without inspecting it

## Outcomes

### Invalid_timer_value (Priority: 2) — Error: `DISAPPEARING_INVALID_TIMER`

**Given:**
- `expire_timer_seconds` (input) lt `0`

**Result:** Timer-change message is rejected; negative timer values are not permitted

### Offline_queued (Priority: 7)

**Given:**
- participant device is offline when timer-change message is sent

**Then:**
- **create_record** target: `offline_message_queue`
- **emit_event** event: `disappearing.timer_queued`

**Result:** Timer-change message is stored in the offline queue and delivered when the device reconnects

### Message_expired_client (Priority: 8)

**Given:**
- client's local clock passes the calculated deletion deadline for a stored message
- `expire_timer_seconds` (db) gt `0`

**Then:**
- **delete_record** target: `local_message_store`
- **emit_event** event: `disappearing.message_deleted`

**Result:** Message content and metadata are removed from the device's local storage; no server action is taken

### Timer_disabled (Priority: 9)

**Given:**
- authenticated participant sends a timer-change control message
- `expire_timer_seconds` (input) eq `0`

**Then:**
- **create_record** target: `message_queue`
- **emit_event** event: `disappearing.timer_disabled`

**Result:** Disappearing messages are disabled for the conversation; all participant devices receive the change and stop scheduling future deletions

### Timer_updated (Priority: 10)

**Given:**
- authenticated participant sends a timer-change control message
- `expire_timer_seconds` (input) gte `0`

**Then:**
- **create_record** target: `message_queue`
- **emit_event** event: `disappearing.timer_changed`

**Result:** Timer-change control message is enqueued for delivery to all participant devices; each device updates its local conversation state

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DISAPPEARING_INVALID_TIMER` | 422 | Timer value must be zero or a positive number of seconds | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `disappearing.timer_changed` | A participant updated the disappearing-message timer for a conversation | `conversation_id`, `expire_timer_seconds`, `set_by` |
| `disappearing.timer_disabled` | A participant disabled the disappearing-message timer for a conversation | `conversation_id`, `set_by` |
| `disappearing.message_deleted` | A client deleted a message after its expiry timer elapsed (client-side event only) | `message_id`, `conversation_id` |
| `disappearing.timer_queued` | A timer-change control message was queued for offline delivery | `conversation_id`, `expire_timer_seconds` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| sealed-sender-delivery | recommended | Timer-change control messages travel as encrypted sealed-sender messages so the server cannot inspect the timer value |
| e2e-key-exchange | recommended | All messages carrying timer updates are encrypted end-to-end using keys managed by the key exchange feature |
| multi-device-linking | recommended | Timer changes must be delivered to all linked devices to keep deletion consistent across a user's devices |

## AGI Readiness

### Goals

#### Reliable Disappearing Messages

Per-conversation timer that automatically deletes messages on all participant devices after a configurable duration, with the server assisting by propagating timer changes

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before making irreversible changes

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- error messages never expose internal system details

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | performance | authentication must prioritize preventing unauthorized access |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| timer_updated | `supervised` | - | - |
| timer_disabled | `human_required` | - | - |
| message_expired_client | `autonomous` | - | - |
| invalid_timer_value | `autonomous` | - | - |
| offline_queued | `autonomous` | - | - |


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Disappearing Messages Blueprint",
  "description": "Per-conversation timer that automatically deletes messages on all participant devices after a configurable duration, with the server assisting by propagating ti",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, privacy, ephemeral, timer, client-enforced"
}
</script>
