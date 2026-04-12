---
title: "Message Starring Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Allow users to star or bookmark individual messages for personal reference, independent of channel-level pinning. 4 fields. 7 outcomes. 3 error codes. rules: ge"
---

# Message Starring Blueprint

> Allow users to star or bookmark individual messages for personal reference, independent of channel-level pinning

| | |
|---|---|
| **Feature** | `message-starring` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | messaging, bookmarks, personal, favorites |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/message-starring.blueprint.yaml) |
| **JSON API** | [message-starring.json]({{ site.baseurl }}/api/blueprints/communication/message-starring.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | Authenticated User | human | Any member who wants to bookmark messages for their own reference |
| `system` | Messaging System | system | Stores per-user star state and notifies clients of changes |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `message_id` | text | Yes | Message ID |  |
| `channel_id` | text | Yes | Channel ID |  |
| `starred` | boolean | Yes | Starred |  |
| `user_id` | text | Yes | User ID |  |

## Rules

- **general:** Starring must be enabled at the system/workspace level; if disabled, no star or unstar actions are permitted, The acting user must be authenticated and have an active session, The user must be subscribed to the channel that contains the target message, The user must have active read access to the channel, Star state is stored per-user — starring a message does not affect other users' views, The same message can be starred by multiple users independently, If the starred message is the channel's last message, the channel's last-message metadata is updated to reflect the new star state, All star and unstar actions trigger extensibility hooks for downstream integrations, Starring does not modify the message content or its visibility to other users, Users can retrieve all their starred messages as a personal bookmark list

## Outcomes

### Starring_disabled (Priority: 1) — Error: `STAR_FEATURE_DISABLED`

**Given:**
- system-level message starring setting is disabled

**Result:** Action rejected; starring is not available in this workspace

### User_not_authenticated (Priority: 2) — Error: `STAR_NOT_AUTHENTICATED`

**Given:**
- no authenticated user session exists

**Result:** Action rejected; user must be logged in

### Not_subscribed (Priority: 3)

**Given:**
- user is not subscribed to the channel containing the message

**Result:** Action silently rejected; no star change recorded (not a member)

### Message_not_in_channel (Priority: 4)

**Given:**
- no message matching message_id exists in channel_id

**Result:** Action silently rejected; message does not exist in the specified channel

### Channel_not_accessible (Priority: 5) — Error: `STAR_NO_CHANNEL_ACCESS`

**Given:**
- user cannot access the target channel

**Result:** Action rejected; user does not have access to this channel

### Star_added (Priority: 6)

**Given:**
- starring is enabled
- user is authenticated and subscribed to the channel
- message exists in the channel
- user has access to the channel
- starred is true

**Then:**
- **set_field** target: `user_star_on_message` value: `true`
- **emit_event** event: `message.starred`

**Result:** Star added; the message appears in the user's personal starred list

### Star_removed (Priority: 7)

**Given:**
- starring is enabled
- user is authenticated and subscribed to the channel
- message exists in the channel
- user has access to the channel
- starred is false

**Then:**
- **set_field** target: `user_star_on_message` value: `false`
- **emit_event** event: `message.unstarred`

**Result:** Star removed; the message is no longer in the user's starred list

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `STAR_FEATURE_DISABLED` | 400 | Message starring is not available in this workspace | No |
| `STAR_NOT_AUTHENTICATED` | 400 | You must be logged in to star messages | No |
| `STAR_NO_CHANNEL_ACCESS` | 400 | You do not have access to this channel | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `message.starred` | Fired when a user adds a personal star to a message | `message_id`, `channel_id`, `user_id` |
| `message.unstarred` | Fired when a user removes their personal star from a message | `message_id`, `channel_id`, `user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| message-pinning | optional | Pinning is the channel-level equivalent; starring is per-user and private |
| direct-messaging | recommended | Starred messages span channels and direct message threads |

## AGI Readiness

### Goals

#### Personal Message Bookmarking

Allow each user to maintain a private starred message list without affecting other users' views

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| star_isolation_rate | 100% | Star operations that affect only the acting user / total star operations |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before disabling starring workspace-wide for all users

### Verification

**Invariants:**

- starring a message does not modify the message content or its visibility to other users
- star state is per-user and isolated from all other users
- user must be subscribed to the channel to star messages within it

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| star is user-private | user A stars a message | user B views the same message | user B does not see user A's star |
| unsubscribed user cannot star | user is not subscribed to the channel containing the message | star request is made | star silently rejected without error |

### Composability

**Capabilities:**

- `personal_bookmark_list`: Track and retrieve a per-user list of starred messages across channels

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| privacy | social_features | starred messages are personal bookmarks and must never be visible to other users |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 2
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Message Starring Blueprint",
  "description": "Allow users to star or bookmark individual messages for personal reference, independent of channel-level pinning. 4 fields. 7 outcomes. 3 error codes. rules: ge",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, bookmarks, personal, favorites"
}
</script>
