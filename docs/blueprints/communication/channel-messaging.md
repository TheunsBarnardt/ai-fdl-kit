---
title: "Channel Messaging Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Public and private group channels for team-wide or restricted conversations with membership, roles, and moderation controls. 17 fields. 9 outcomes. 4 error code"
---

# Channel Messaging Blueprint

> Public and private group channels for team-wide or restricted conversations with membership, roles, and moderation controls

| | |
|---|---|
| **Feature** | `channel-messaging` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | messaging, channels, groups, rooms, moderation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/channel-messaging.blueprint.yaml) |
| **JSON API** | [channel-messaging.json]({{ site.baseurl }}/api/blueprints/communication/channel-messaging.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `member` | Channel Member | human | Authenticated user who belongs to the channel |
| `owner` | Channel Owner | human | User who created the channel or has been granted owner role |
| `moderator` | Channel Moderator | human | User with moderation permissions within the channel |
| `guest` | Guest User | human | Unauthenticated or limited-access visitor |
| `system` | Messaging System | system | Handles room state, membership subscriptions, and event routing |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `channel_id` | text | Yes | Channel ID |  |
| `channel_name` | text | Yes | Channel Name |  |
| `display_name` | text | No | Display Name |  |
| `channel_type` | select | Yes | Channel Type |  |
| `topic` | text | No | Topic |  |
| `announcement` | text | No | Announcement |  |
| `description` | text | No | Description |  |
| `is_read_only` | boolean | No | Read-Only Mode |  |
| `is_default` | boolean | No | Default Channel |  |
| `encrypted` | boolean | No | End-to-End Encrypted |  |
| `join_code` | text | No | Join Code |  |
| `message_text` | rich_text | No | Message Content |  |
| `message_id` | text | Yes | Message ID |  |
| `sent_at` | datetime | Yes | Sent At |  |
| `user_count` | number | Yes | Member Count |  |
| `message_count` | number | Yes | Message Count |  |
| `member_role` | select | No | Member Role |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `read_only` |  |  |
| `archived` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `read_only` | owner |  |
|  | `read_only` | `active` | owner |  |
|  | `active` | `archived` | owner |  |
|  | `read_only` | `archived` | owner |  |

## Rules

- **general:** Public channels are discoverable and joinable by any authenticated user without invitation, Private channels are only visible to and joinable by members; membership requires an invitation from an existing member, A channel name must be unique within the system and may only contain alphanumeric characters, hyphens, and underscores, Only owners and moderators may post in a read-only channel; regular members may react but not send messages, Muted users cannot send messages in any channel they have been muted in, Archived channels are read-only for all users; no new messages, reactions, or membership changes are accepted, Channel owners may assign moderator and owner roles to other members, Moderators may remove messages, mute members, and remove members from private channels, A channel requires at least one owner at all times; the last owner cannot leave without transferring ownership, Default channels automatically subscribe all new users upon account creation, A join code, when set, must be provided by any user attempting to join the channel directly, Broadcast channels allow only owners and moderators to post; members receive messages but cannot reply in the main channel

## Outcomes

### Channel_created (Priority: 1)

**Given:**
- authenticated user submits a valid channel name
- `channel_name` (db) not_exists

**Then:**
- **create_record**
- **create_record**
- **emit_event** event: `channel_messaging.channel_created`

**Result:** Channel is created and the creator is subscribed as owner

### Member_joined (Priority: 2)

**Given:**
- user is authenticated and not already a member
- channel is public, or user has received an invitation, or provides a valid join code
- channel is not archived

**Then:**
- **create_record**
- **emit_event** event: `channel_messaging.member_joined`

**Result:** User is subscribed to the channel and a join system message is posted

### Message_sent (Priority: 3)

**Given:**
- sender is an authenticated member of the channel
- channel is not archived
- channel is not read-only, or sender has moderator or owner role
- sender is not muted in the channel
- message content or attachment is present

**Then:**
- **create_record**
- **set_field** target: `message_count` value: `incremented`
- **emit_event** event: `channel_messaging.message_sent`

**Result:** Message is stored and broadcast to all channel members

### Member_removed (Priority: 4)

**Given:**
- actor is a moderator or owner
- target user is a member of the channel

**Then:**
- **delete_record**
- **emit_event** event: `channel_messaging.member_removed`

**Result:** User's subscription is removed and a system message is posted

### Channel_archived (Priority: 5)

**Given:**
- actor is the channel owner
- channel is in active or read_only state

**Then:**
- **transition_state** field: `status` from: `active` to: `archived`
- **emit_event** event: `channel_messaging.channel_archived`

**Result:** Channel is archived; all members see it as read-only

### Channel_name_taken (Priority: 20) — Error: `CHANNEL_NAME_TAKEN`

**Given:**
- `channel_name` (db) exists

**Result:** User is informed the channel name is already in use

### Access_denied_private (Priority: 21) — Error: `CHANNEL_ACCESS_DENIED`

**Given:**
- channel type is private
- user has not received an invitation and does not provide a valid join code

**Result:** User is informed they do not have access to this channel

### Posting_restricted (Priority: 22) — Error: `CHANNEL_POST_RESTRICTED`

**Given:**
- channel is in read_only state
- sender does not have moderator or owner role

**Result:** User is informed they cannot post in a read-only channel

### Channel_archived_error (Priority: 23) — Error: `CHANNEL_ARCHIVED`

**Given:**
- channel status is archived
- user attempts to post a message or modify membership

**Result:** User is informed the channel is archived and no longer accepts changes

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CHANNEL_NAME_TAKEN` | 409 | A channel with that name already exists. Please choose a different name. | No |
| `CHANNEL_ACCESS_DENIED` | 403 | You do not have permission to access this channel. | No |
| `CHANNEL_POST_RESTRICTED` | 403 | This channel is read-only. Only moderators and owners may post messages. | No |
| `CHANNEL_ARCHIVED` | 400 | This channel has been archived and no longer accepts new messages. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `channel_messaging.channel_created` | Fires when a new channel is created | `channel_id`, `channel_name`, `channel_type` |
| `channel_messaging.member_joined` | Fires when a user joins a channel | `channel_id`, `message_id` |
| `channel_messaging.member_removed` | Fires when a user is removed from or leaves a channel | `channel_id`, `message_id` |
| `channel_messaging.message_sent` | Fires when a message is posted in a channel | `message_id`, `channel_id`, `sent_at` |
| `channel_messaging.channel_archived` | Fires when a channel is archived | `channel_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| direct-messaging | recommended | Shares the underlying message delivery and notification infrastructure |
| message-editing-deletion | optional | Allows members and moderators to edit or delete posted messages |
| message-reactions | optional | Allows emoji reactions on channel messages |
| message-threading | optional | Allows threaded replies to messages within channels |

## AGI Readiness

### Goals

#### Manage Channel Communications

Create and maintain public and private channels with correct membership, moderation, and message delivery

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| message_delivery_rate | 99.9% | Channel messages successfully broadcast / total messages posted |
| unauthorised_post_rate | 0% | Messages posted by muted or unauthorized users / total post attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before archiving a channel with more than 100 members
- before modifying default channels that auto-subscribe all users

### Verification

**Invariants:**

- private channels are never visible to non-members
- read-only channels reject posts from regular members
- archived channels reject all new messages and membership changes
- a channel must always have at least one owner

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| private channel access denied | a user without membership or invitation attempts to join a private channel | join request is made | CHANNEL_ACCESS_DENIED returned without revealing channel details |
| read-only channel blocks regular member post | channel is in read_only state and sender has member role | message is submitted | CHANNEL_POST_RESTRICTED error returned |

### Composability

**Capabilities:**

- `channel_lifecycle_management`: Create, configure, archive, and manage membership in channels
- `role_based_posting_control`: Enforce owner, moderator, and member posting restrictions per channel state

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| consistency | availability | message ordering and membership state must be consistent across all subscribers |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/RocketChat/Rocket.Chat
  project: Open-source team communication platform
  tech_stack: TypeScript, Meteor, React, MongoDB
  files_traced: 5
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Channel Messaging Blueprint",
  "description": "Public and private group channels for team-wide or restricted conversations with membership, roles, and moderation controls. 17 fields. 9 outcomes. 4 error code",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, channels, groups, rooms, moderation"
}
</script>
