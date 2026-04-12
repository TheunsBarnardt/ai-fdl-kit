---
title: "Message Pinning Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Pin important messages to a channel so members can quickly find key information without scrolling through history. 6 fields. 10 outcomes. 7 error codes. rules: "
---

# Message Pinning Blueprint

> Pin important messages to a channel so members can quickly find key information without scrolling through history

| | |
|---|---|
| **Feature** | `message-pinning` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | messaging, pinning, channel, moderation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/message-pinning.blueprint.yaml) |
| **JSON API** | [message-pinning.json]({{ site.baseurl }}/api/blueprints/communication/message-pinning.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `moderator` | Channel Moderator | human | User with permission to pin and unpin messages in a channel |
| `member` | Channel Member | human | Any user with access to the channel who can view pinned messages |
| `system` | Messaging System | system | Records pin state and broadcasts changes to channel members |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `message_id` | text | Yes | Message ID |  |
| `channel_id` | text | Yes | Channel ID |  |
| `pinned` | boolean | Yes | Pinned State |  |
| `pinned_at` | datetime | No | Pinned At |  |
| `pinned_by_user_id` | text | No | Pinned By |  |
| `pinned_by_username` | text | No | Pinned By Username |  |

## Rules

- **general:** Pinning must be enabled at the system/workspace level; if disabled, no pin or unpin actions are permitted, Only users with the pin-message permission for the target channel may pin or unpin messages, The acting user must be a member of the channel and have active access to it, A message that is already pinned is silently returned as-is without raising an error, When a message is pinned, a system notification message is posted in the channel to inform members, End-to-end encrypted messages are pinned using an encrypted system message type to preserve confidentiality, Nested quote attachments in the pinned message are included in the system notification up to the configured chain limit, When unpinning, the user must still be a subscribed member of the channel, If message history retention is enabled, a history clone is saved before unpinning, If the pinned message is the channel's last message, the channel's last-message metadata is updated immediately, Read receipt records are updated to reflect the new pin state when receipt storage is enabled, All pin and unpin actions trigger extensibility hooks so downstream integrations can react

## Outcomes

### Pinning_disabled (Priority: 1) — Error: `PIN_FEATURE_DISABLED`

**Given:**
- system-level message pinning setting is disabled

**Result:** Action rejected; pinning is not permitted in this workspace

### Message_not_found (Priority: 2) — Error: `PIN_MESSAGE_NOT_FOUND`

**Given:**
- message_id does not correspond to an existing message

**Result:** Action rejected; the target message could not be found

### Channel_not_found (Priority: 3) — Error: `PIN_CHANNEL_NOT_FOUND`

**Given:**
- channel_id does not correspond to an existing channel

**Result:** Action rejected; the target channel could not be found

### User_not_authenticated (Priority: 4) — Error: `PIN_NOT_AUTHENTICATED`

**Given:**
- no authenticated user session exists

**Result:** Action rejected; user must be logged in

### User_not_authorized (Priority: 5) — Error: `PIN_NOT_AUTHORIZED`

**Given:**
- authenticated user does not have pin-message permission in the channel

**Result:** Action rejected; user lacks the required permission

### User_no_channel_access (Priority: 6) — Error: `PIN_NO_CHANNEL_ACCESS`

**Given:**
- authenticated user cannot access the target channel

**Result:** Action rejected; user does not have access to this channel

### Already_pinned (Priority: 7)

**Given:**
- message is already in pinned state
- pinned is true

**Result:** No change made; message was already pinned

### Pin_successful (Priority: 8)

**Given:**
- pinning is enabled
- message exists and belongs to an accessible channel
- user has pin-message permission
- message is currently not pinned

**Then:**
- **set_field** target: `pinned` value: `true`
- **set_field** target: `pinned_at` value: `now`
- **set_field** target: `pinned_by_user_id` value: `authenticated_user_id`
- **emit_event** event: `message.pinned`

**Result:** Message is pinned; a system notification appears in the channel

### Unpin_user_not_subscribed (Priority: 9) — Error: `UNPIN_NOT_SUBSCRIBED`

**Given:**
- action is unpin
- user is not subscribed to the channel

**Result:** Action rejected; only subscribed members may unpin messages

### Unpin_successful (Priority: 10)

**Given:**
- pinning is enabled
- message exists and belongs to an accessible channel
- user has pin-message permission and is subscribed
- message is currently pinned

**Then:**
- **set_field** target: `pinned` value: `false`
- **emit_event** event: `message.unpinned`

**Result:** Message is unpinned; channel members see the updated pin list

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PIN_FEATURE_DISABLED` | 400 | Message pinning is not available in this workspace | No |
| `PIN_MESSAGE_NOT_FOUND` | 404 | The message you are trying to pin could not be found | No |
| `PIN_CHANNEL_NOT_FOUND` | 404 | The channel could not be found | No |
| `PIN_NOT_AUTHENTICATED` | 400 | You must be logged in to pin messages | No |
| `PIN_NOT_AUTHORIZED` | 400 | You do not have permission to pin messages in this channel | No |
| `PIN_NO_CHANNEL_ACCESS` | 400 | You do not have access to this channel | No |
| `UNPIN_NOT_SUBSCRIBED` | 400 | You must be a member of the channel to unpin messages | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `message.pinned` | Fired after a message is successfully pinned to a channel | `message_id`, `channel_id`, `pinned_by_user_id`, `pinned_at` |
| `message.unpinned` | Fired after a message is successfully unpinned from a channel | `message_id`, `channel_id`, `pinned_by_user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| direct-messaging | recommended | Pinning applies to channels and direct message threads |
| message-starring | optional | Starring is the personal counterpart to channel-level pinning |

## AGI Readiness

### Goals

#### Surface Important Messages

Allow moderators to pin key messages so channel members can quickly locate important information

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| pin_permission_compliance | 100% | Pin/unpin operations performed by authorised users / total pin attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before disabling the pinning feature workspace-wide

### Verification

**Invariants:**

- only users with pin-message permission may pin or unpin messages
- pinning is a no-op when the message is already pinned
- unpinning requires the user to still be subscribed to the channel

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| unauthorised pin attempt rejected | user without pin-message permission attempts to pin a message | pin request is submitted | PIN_NOT_AUTHORIZED error returned |
| already-pinned is idempotent | message is already pinned | pin is requested again | no error raised and state unchanged |

### Composability

**Capabilities:**

- `channel_pin_management`: Pin and unpin messages within a channel with permission enforcement

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| idempotency | strict_error_reporting | silently ignoring duplicate pin requests prevents noise in integrations that retry |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 3
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Message Pinning Blueprint",
  "description": "Pin important messages to a channel so members can quickly find key information without scrolling through history. 6 fields. 10 outcomes. 7 error codes. rules: ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, pinning, channel, moderation"
}
</script>
