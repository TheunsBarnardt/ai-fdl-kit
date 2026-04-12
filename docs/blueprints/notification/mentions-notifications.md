---
title: "Mentions Notifications Blueprint"
layout: default
parent: "Notification"
grand_parent: Blueprint Catalog
description: "@mention users and user groups in messages to trigger targeted notifications. 9 fields. 8 outcomes. 1 error codes. rules: general. AGI: supervised"
---

# Mentions Notifications Blueprint

> @mention users and user groups in messages to trigger targeted notifications

| | |
|---|---|
| **Feature** | `mentions-notifications` |
| **Category** | Notification |
| **Version** | 1.0.0 |
| **Tags** | mentions, notifications, alerts, at-mention, all, here, groups, teams |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/notification/mentions-notifications.blueprint.yaml) |
| **JSON API** | [mentions-notifications.json]({{ site.baseurl }}/api/blueprints/notification/mentions-notifications.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `sender` | Message Sender | human | User who composes a message containing one or more @mentions |
| `mentioned_user` | Mentioned User | human | User or group member who receives a notification because they were mentioned |
| `platform` | Notification Service | system | Platform component that parses mentions, resolves targets, and dispatches notifications |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `message_id` | text | Yes | Message ID |  |
| `room_id` | text | Yes | Room ID |  |
| `sender_id` | text | Yes | Sender User ID |  |
| `mention_text` | text | Yes | Mention Text |  |
| `mention_type` | select | Yes | Mention Type |  |
| `mentioned_user_ids` | json | No | Resolved User IDs |  |
| `message_text` | rich_text | Yes | Message Text |  |
| `max_all_members` | number | No | Max Members for @all |  |
| `e2e_user_mentions` | json | No | E2E Encrypted Mentions |  |

## Rules

- **general:** A mention is triggered by the @ prefix followed by a username, group name, 'all', or 'here' in a message, The platform parses all @mentions from a message using a configured username pattern before the message is persisted, Resolved mention targets are stored on the message record so notification delivery does not require re-parsing, @all notifies every member of the room; it is suppressed when the room member count exceeds the max_all_members threshold, @here notifies only members who are currently active/online; it is also suppressed by the same threshold as @all, When @all or @here exceeds the threshold, the sender is notified that the mention was not delivered, Mentioning a user who is not a member of the room does not create a notification for that user, For end-to-end encrypted messages, mention targets are read from e2e_user_mentions rather than the encrypted message body, Channel mentions (#channel-name) create a link to the channel but do not generate notifications for that channel's members, Mentions resolve users by username; if no matching user is found the text is rendered as plain text without a notification, A user can be mentioned multiple times in the same message; only one notification is sent per mention event, Notification delivery method (push, email, in-app) is governed by each user's individual notification preferences

## Outcomes

### Mention_suppressed_threshold_exceeded (Priority: 3) — Error: `MENTION_THRESHOLD_EXCEEDED`

**Given:**
- message contains @all or @here
- room member count exceeds max_all_members

**Then:**
- **emit_event** event: `mention.suppressed`

**Result:** Broadcast mention is not delivered; sender receives an ephemeral warning that the room is too large

### Mention_user_not_found (Priority: 4)

**Given:**
- message contains @text where text does not match any user, group, or team

**Result:** Text is rendered as plain text with no mention link and no notification is sent

### Mention_non_member (Priority: 5)

**Given:**
- message contains @username
- the resolved user exists but is not a member of the room

**Result:** Mention link is rendered in the message but no notification is sent to the non-member

### E2e_mention_resolved (Priority: 6)

**Given:**
- message is end-to-end encrypted
- e2e_user_mentions field is present and non-empty

**Then:**
- **emit_event** event: `mention.user_notified`

**Result:** Mentions are resolved from e2e_user_mentions instead of the encrypted body and notifications are dispatched normally

### Group_members_notified (Priority: 7)

**Given:**
- message contains @team-name or @group-name referencing a defined user group or team
- group or team exists and has resolvable members

**Then:**
- **emit_event** event: `mention.group_notified`

**Result:** All members of the referenced group or team receive a notification

### All_members_notified (Priority: 8)

**Given:**
- message contains @all
- room member count is less than or equal to max_all_members

**Then:**
- **emit_event** event: `mention.all_notified`

**Result:** All members of the room receive a notification

### Here_members_notified (Priority: 9)

**Given:**
- message contains @here
- room member count is less than or equal to max_all_members

**Then:**
- **emit_event** event: `mention.here_notified`

**Result:** Currently active/online members of the room receive a notification

### User_notified (Priority: 10)

**Given:**
- message is sent containing @username where username matches an existing user
- mentioned user is a member of the room

**Then:**
- **emit_event** event: `mention.user_notified`

**Result:** Notification is dispatched to the mentioned user via their configured notification channels

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `MENTION_THRESHOLD_EXCEEDED` | 400 | Your message mentions all room members, but the room is too large for broadcast notifications. Mention specific users instead. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `mention.user_notified` | Fires when one or more individual users are notified via a direct @username mention | `message_id`, `room_id`, `sender_id`, `mentioned_user_ids` |
| `mention.all_notified` | Fires when @all successfully triggers notifications for all room members | `message_id`, `room_id`, `sender_id` |
| `mention.here_notified` | Fires when @here successfully triggers notifications for active room members | `message_id`, `room_id`, `sender_id` |
| `mention.group_notified` | Fires when a group or team @mention triggers notifications for its members | `message_id`, `room_id`, `sender_id`, `mentioned_user_ids` |
| `mention.suppressed` | Fires when a broadcast mention (@all or @here) is suppressed due to room size exceeding the configured threshold | `message_id`, `room_id`, `sender_id`, `mention_text` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| messaging | required | Mentions are parsed from messages; the messaging feature provides the message context |
| notification-preferences | required | User notification preferences determine how and where mention notifications are delivered |
| channel-management | recommended | Room membership determines which users are valid targets for room-scoped mentions |
| user-groups | optional | Group and team mentions require user groups to be defined |
| push-notifications | recommended | Mobile push notifications are a primary delivery channel for mention alerts |

## AGI Readiness

### Goals

#### Targeted Mention Delivery

Parse @mention tokens from messages and dispatch notifications to the correct users, groups, or active members respecting membership and threshold rules

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| mention_delivery_accuracy | 99.9% | Mention notifications delivered to correct targets / total expected notifications |
| non_member_notification_rate | 0% | Notifications sent to users not in the room / total notifications sent |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before changing the max_all_members threshold for a workspace

### Verification

**Invariants:**

- only room members receive mention notifications
- a user mentioned multiple times in one message receives exactly one notification
- broadcast mentions (@all, @here) are suppressed when room size exceeds threshold
- encrypted messages resolve mentions from e2e_user_mentions not the encrypted body

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| non-member mention produces no notification | mentioned user exists but is not a room member | message with @username is posted | mention link rendered but no notification sent |
| all mention suppressed at threshold | room has more members than max_all_members | @all is used | MENTION_THRESHOLD_EXCEEDED and sender receives ephemeral warning |

### Composability

**Capabilities:**

- `mention_parsing_and_resolution`: Parse @mention tokens from message text and resolve them to user IDs before message persistence
- `broadcast_threshold_enforcement`: Suppress @all and @here broadcasts when room size exceeds the configured maximum

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| scalability | reach | broadcast mention suppression at large room sizes prevents notification storms that would degrade platform performance |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 6
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Mentions Notifications Blueprint",
  "description": "@mention users and user groups in messages to trigger targeted notifications. 9 fields. 8 outcomes. 1 error codes. rules: general. AGI: supervised",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "mentions, notifications, alerts, at-mention, all, here, groups, teams"
}
</script>
