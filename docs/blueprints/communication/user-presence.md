---
title: "User Presence Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Track and broadcast user presence status (online, away, busy, offline) with automatic detection based on connection and activity. 6 fields. 8 outcomes. 3 error "
---

# User Presence Blueprint

> Track and broadcast user presence status (online, away, busy, offline) with automatic detection based on connection and activity

| | |
|---|---|
| **Feature** | `user-presence` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | presence, status, real-time, availability |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/user-presence.blueprint.yaml) |
| **JSON API** | [user-presence.json]({{ site.baseurl }}/api/blueprints/communication/user-presence.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | User | human | The user whose presence is being tracked |
| `presence_service` | Presence Service | system | Server-side service that manages connection tracking and status aggregation |
| `subscriber` | Status Subscriber | human | Any user or system observing another user's presence |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | text | Yes | User ID |  |
| `status` | select | Yes | Presence Status |  |
| `status_text` | text | No | Status Message |  |
| `connection_id` | text | No | Connection ID |  |
| `node_id` | text | No | Node ID |  |
| `last_login` | datetime | No | Last Login |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `online` | Yes |  |
| `away` |  |  |
| `busy` |  |  |
| `offline` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `offline` | `online` | presence_service |  |
|  | `online` | `away` | presence_service |  |
|  | `online` | `busy` | user |  |
|  | `away` | `online` | presence_service |  |
|  | `online` | `offline` | presence_service |  |
|  | `away` | `offline` | presence_service |  |
|  | `busy` | `offline` | presence_service |  |
|  | `any` | `online` | user |  |
|  | `any` | `away` | user |  |
|  | `any` | `busy` | user |  |

## Rules

- **general:** Each user connection is tracked independently; overall presence is derived from all active connections, When a user's last connection is removed, their presence transitions to offline automatically, Users may manually override auto-detected presence with online, away, or busy, Status text is user-controlled and persists independently of the connection state, An invisible or disabled status may be allowed or blocked by system configuration, Rate limiting must be applied to manual status changes to prevent abuse, Presence updates must be broadcast to all subscribers in real time, Stale connections on a node must be cleaned up when that node goes offline, Custom status names can be defined system-wide; each maps to one of the base status types, Status text changes require that the system allows user status message modifications

## Outcomes

### Connection_established (Priority: 1)

**Given:**
- user authenticates and opens a connection
- `connection_id` (system) not_exists

**Then:**
- **create_record**
- **set_field** target: `status` value: `online`
- **emit_event** event: `presence.connection_added`

**Result:** Connection is registered and user status is set to online

### Status_set_manually (Priority: 2)

**Given:**
- user submits a status change request
- `status` (input) in `online,away,busy,offline`

**Then:**
- **set_field** target: `status` value: `{{input.status}}`
- **emit_event** event: `presence.status_changed`

**Result:** User status is updated and broadcast to all subscribers

### Status_text_updated (Priority: 3)

**Given:**
- user submits a status text change
- `status_text` (input) exists

**Then:**
- **set_field** target: `status_text` value: `{{input.status_text}}`
- **emit_event** event: `presence.status_changed`

**Result:** Status message is persisted and broadcast

### Connection_removed (Priority: 4)

**Given:**
- a user connection is closed or timed out
- `connection_id` (system) exists

**Then:**
- **delete_record**
- **emit_event** event: `presence.connection_removed`

**Result:** Connection removed; if no connections remain, user transitions to offline

### Last_connection_removed (Priority: 5)

**Given:**
- last active connection for the user is closed

**Then:**
- **set_field** target: `status` value: `offline`
- **emit_event** event: `presence.status_changed`

**Result:** User status changes to offline and subscribers are notified

### Invisible_status_blocked (Priority: 6) — Error: `PRESENCE_INVISIBLE_NOT_ALLOWED`

**Given:**
- user requests offline/invisible status
- `allow_invisible` (system) eq `false`

**Result:** Status change rejected because invisible mode is disabled by system configuration

### Status_change_rate_limited (Priority: 7) — Error: `PRESENCE_RATE_LIMITED`

**Given:**
- user exceeds allowed rate of manual status changes

**Result:** Request rejected due to rate limiting; user must wait before changing status again

### Status_text_change_not_allowed (Priority: 8) — Error: `PRESENCE_STATUS_TEXT_NOT_ALLOWED`

**Given:**
- user attempts to change status text
- `allow_status_message_change` (system) eq `false`

**Result:** Status text change rejected because the feature is disabled by system configuration

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PRESENCE_INVISIBLE_NOT_ALLOWED` | 400 | Invisible status is not available on this server | No |
| `PRESENCE_RATE_LIMITED` | 429 | Too many status changes. Please wait before trying again | No |
| `PRESENCE_STATUS_TEXT_NOT_ALLOWED` | 400 | Status message changes are not allowed on this server | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `presence.status_changed` | Fired when a user's presence status or status text changes | `user_id`, `status`, `status_text` |
| `presence.connection_added` | Fired when a new user connection is registered | `user_id`, `connection_id`, `node_id` |
| `presence.connection_removed` | Fired when a user connection is closed or removed | `user_id`, `connection_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| user-profile | required | User identity is required to associate presence with an account |
| typing-indicators | recommended | Typing indicators complement presence by showing in-room activity |
| read-receipts | optional | Read receipts may use last-seen timestamps that relate to presence |

## AGI Readiness

### Goals

#### Accurate Presence Broadcast

Maintain and broadcast accurate user presence status in real time, reflecting connection and activity changes promptly

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| presence_staleness | < 5s | Maximum lag between connection event and status broadcast to subscribers |
| stale_connection_cleanup_rate | 100% | Stale connections cleared when node goes offline / total stale connections |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before disabling presence tracking workspace-wide

### Verification

**Invariants:**

- when the last connection is removed the user transitions to offline
- manual status overrides are preserved until explicitly changed or connection is lost
- rate limiting prevents abuse of manual status changes

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| last connection removal triggers offline | user has one active connection | connection is closed | status transitions to offline and subscribers are notified |
| invisible blocked when disabled | allow_invisible system setting is false | user requests offline/invisible status | PRESENCE_INVISIBLE_NOT_ALLOWED error returned |

### Composability

**Capabilities:**

- `connection_based_presence_tracking`: Derive user presence from active connection records and broadcast changes in real time
- `manual_status_override`: Allow users to manually set their status subject to system-level policy

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| eventual_consistency | strict_consistency | presence updates are best-effort broadcasts; brief staleness is acceptable over blocking message delivery |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 7
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "User Presence Blueprint",
  "description": "Track and broadcast user presence status (online, away, busy, offline) with automatic detection based on connection and activity. 6 fields. 8 outcomes. 3 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "presence, status, real-time, availability"
}
</script>
