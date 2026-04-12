---
title: "Typing Indicators Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Real-time indicators showing which users are currently typing, recording, uploading, or performing other in-progress actions in a conversation. 6 fields. 6 outc"
---

# Typing Indicators Blueprint

> Real-time indicators showing which users are currently typing, recording, uploading, or performing other in-progress actions in a conversation

| | |
|---|---|
| **Feature** | `typing-indicators` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | typing, real-time, notifications, activity, presence |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/typing-indicators.blueprint.yaml) |
| **JSON API** | [typing-indicators.json]({{ site.baseurl }}/api/blueprints/communication/typing-indicators.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | The user performing an action (typing, recording, etc.) |
| `room_subscriber` | Room Subscriber | human | Other participants in the same room who receive activity notifications |
| `activity_service` | Activity Service | system | Service that broadcasts and tracks in-progress user activities per room |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `room_id` | text | Yes | Room ID |  |
| `user_id` | text | Yes | User ID |  |
| `username` | text | Yes | Username |  |
| `activity_type` | select | Yes | Activity Type |  |
| `thread_id` | text | No | Thread ID |  |
| `timeout_ms` | number | No | Activity Timeout (ms) |  |

## States

**State field:** `activity_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `idle` | Yes |  |
| `active` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `idle` | `active` | user |  |
|  | `active` | `active` | user |  |
|  | `active` | `idle` | activity_service |  |
|  | `active` | `idle` | user |  |

## Rules

- **general:** Activity signals auto-expire after a configurable timeout (default 15 seconds) if not renewed, Clients must renew the activity signal at regular intervals (approximately one-third of the timeout period) while the activity continues, Each room and thread tracks activity independently; thread activities are scoped to the thread ID, A user should not receive their own activity indicator in the UI, Multiple activity types can be active simultaneously for the same user in the same room, Activity notifications are broadcast to all room subscribers except the originating user, Display name shown in indicators follows the system-wide name display preference (username vs real name), Activity signals use debouncing to avoid flooding the broadcast channel, Continuously-performing activities (recording, uploading) must use a renewal interval to keep the indicator visible, When a user leaves a room or disconnects, all their active indicators for that room must be cleared

## Outcomes

### Activity_started (Priority: 1)

**Given:**
- user begins an in-progress activity in a room
- `room_id` (input) exists
- `activity_type` (input) exists

**Then:**
- **set_field** target: `activity_status` value: `active`
- **emit_event** event: `typing.activity_started`

**Result:** Activity indicator is broadcast to all other participants in the room

### Activity_renewed (Priority: 2)

**Given:**
- user sends a renewal signal before the previous signal expires
- `activity_status` (db) eq `active`

**Then:**
- **emit_event** event: `typing.activity_started`

**Result:** Activity indicator timer is reset; indicator remains visible to other participants

### Activity_stopped_explicitly (Priority: 3)

**Given:**
- user submits message, cancels action, or explicitly stops activity
- `activity_status` (db) eq `active`

**Then:**
- **set_field** target: `activity_status` value: `idle`
- **emit_event** event: `typing.activity_stopped`

**Result:** Activity indicator is cleared for this user in this room

### Activity_expired (Priority: 4)

**Given:**
- activity timeout elapses with no renewal signal received
- `activity_status` (db) eq `active`

**Then:**
- **set_field** target: `activity_status` value: `idle`
- **emit_event** event: `typing.activity_stopped`

**Result:** Stale activity indicator is automatically cleared for all subscribers

### Own_activity_suppressed (Priority: 5)

**Given:**
- subscriber receives an activity event for their own user ID

**Result:** Activity indicator is not displayed to the originating user

### Unauthenticated_activity (Priority: 6) — Error: `TYPING_NOT_AUTHENTICATED`

**Given:**
- `user_id` (session) not_exists

**Result:** Activity signal rejected because the sender is not authenticated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TYPING_NOT_AUTHENTICATED` | 400 | You must be signed in to send activity indicators | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `typing.activity_started` | Fired when a user begins or renews an in-progress activity in a room | `room_id`, `username`, `activity_type`, `thread_id` |
| `typing.activity_stopped` | Fired when a user's activity indicator expires or is explicitly cleared | `room_id`, `username`, `activity_type`, `thread_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| user-presence | recommended | Presence status provides broader availability context alongside typing indicators |
| direct-messaging | optional | Typing indicators are commonly used in direct message conversations |
| channel-messaging | optional | Typing indicators are commonly used in channel conversations |

## AGI Readiness

### Goals

#### Real Time Activity Indicators

Broadcast in-progress user activities (typing, recording, uploading) to room participants without showing indicators to the originating user

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| self_indicator_suppression_rate | 100% | Activity events suppressed for the originating user / total activity events |
| stale_indicator_clearance_rate | 100% | Expired activity indicators cleared within timeout period / total expired indicators |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before changing the global activity timeout policy

### Verification

**Invariants:**

- a user must not see their own activity indicator
- activity indicators auto-expire after timeout with no renewal
- disconnection clears all active indicators for the user in all rooms

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| own activity suppressed | user sends a typing activity signal | activity event is broadcast | event is not shown to the originating user in the UI |
| indicator expires on timeout | activity signal is sent with no renewal | timeout period elapses | activity_stopped event emitted and indicator cleared for all subscribers |

### Composability

**Capabilities:**

- `debounced_activity_broadcast`: Broadcast typed activity signals to room participants with debouncing to prevent flooding
- `auto_expiring_activity_state`: Automatically clear activity indicators after configurable timeout if not renewed

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| bandwidth_efficiency | update_frequency | debouncing activity signals reduces server load at the cost of minor indicator lag |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 4
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Typing Indicators Blueprint",
  "description": "Real-time indicators showing which users are currently typing, recording, uploading, or performing other in-progress actions in a conversation. 6 fields. 6 outc",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "typing, real-time, notifications, activity, presence"
}
</script>
