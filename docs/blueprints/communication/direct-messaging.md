---
title: "Direct Messaging Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "1:1 and small-group private conversations between users with read receipts and notification preferences. 10 fields. 7 outcomes. 3 error codes. rules: general. A"
---

# Direct Messaging Blueprint

> 1:1 and small-group private conversations between users with read receipts and notification preferences

| | |
|---|---|
| **Feature** | `direct-messaging` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | messaging, direct, private, real-time |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/direct-messaging.blueprint.yaml) |
| **JSON API** | [direct-messaging.json]({{ site.baseurl }}/api/blueprints/communication/direct-messaging.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `sender` | Message Sender | human | User initiating or participating in a direct conversation |
| `recipient` | Message Recipient | human | User receiving direct messages |
| `system` | Messaging System | system | Handles room creation, subscription management, and delivery |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `room_id` | text | Yes | Conversation ID |  |
| `participant_ids` | json | Yes | Participant User IDs |  |
| `participant_usernames` | json | Yes | Participant Usernames |  |
| `message_text` | rich_text | No | Message Content |  |
| `message_id` | text | Yes | Message ID |  |
| `sent_at` | datetime | Yes | Sent At |  |
| `unread_count` | number | No | Unread Count |  |
| `notification_preference` | select | No | Notification Preference |  |
| `is_open` | boolean | Yes | Conversation Open |  |
| `last_message_at` | datetime | No | Last Message At |  |

## States

**State field:** `is_open`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `open` | Yes |  |
| `closed` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `open` | `closed` | sender |  |
|  | `closed` | `open` | system |  |

## Rules

- **general:** A direct conversation is created on first message if one does not already exist between the participants, Only the participants of a direct conversation may read or send messages within it, The number of participants in a direct conversation must not exceed the system-configured maximum, Sending a message to a closed conversation automatically reopens it in the sender's and recipient's sidebars, Each participant has an independent unread count and notification preference for the same conversation, Muting a user suppresses notifications but does not remove access to the conversation, Blocking a user prevents them from sending new direct messages, Direct conversations persist even when a participant is deactivated; historical messages remain readable, End-to-end encryption may be enabled per conversation; all messages are encrypted before transmission when active, Read receipts record the timestamp of a participant's last read position

## Outcomes

### Conversation_created (Priority: 1)

**Given:**
- authenticated user requests a direct conversation with one or more valid users
- participant count does not exceed the system maximum
- `room_id` (db) not_exists

**Then:**
- **create_record**
- **emit_event** event: `direct_messaging.conversation_created`

**Result:** A new private conversation room is created and all participants are subscribed

### Conversation_reused (Priority: 2)

**Given:**
- authenticated user requests a direct conversation with one or more valid users
- `room_id` (db) exists

**Then:**
- **set_field** target: `is_open` value: `true`
- **emit_event** event: `direct_messaging.conversation_opened`

**Result:** The existing conversation is surfaced and reopened in the user's sidebar

### Message_sent (Priority: 3)

**Given:**
- sender is authenticated and a participant in the conversation
- conversation is not blocked by either participant
- message content or attachment is present

**Then:**
- **create_record**
- **set_field** target: `unread_count` value: `incremented`
- **set_field** target: `is_open` value: `true`
- **emit_event** event: `direct_messaging.message_sent`

**Result:** Message is delivered to all participants and unread counts are updated

### Message_read (Priority: 4)

**Given:**
- recipient opens the conversation or scrolls to a message

**Then:**
- **set_field** target: `unread_count` value: `0`
- **emit_event** event: `direct_messaging.messages_read`

**Result:** Unread count is cleared and read receipt is updated for the participant

### Participant_not_found (Priority: 10) — Error: `DM_PARTICIPANT_NOT_FOUND`

**Given:**
- one or more specified participant usernames do not resolve to active users

**Result:** User is informed that one or more recipients could not be found

### Participant_limit_exceeded (Priority: 11) — Error: `DM_PARTICIPANT_LIMIT_EXCEEDED`

**Given:**
- requested participant count exceeds the system-configured maximum for direct conversations

**Result:** User is informed of the participant limit and asked to reduce the number of recipients

### Access_denied (Priority: 12) — Error: `DM_ACCESS_DENIED`

**Given:**
- requesting user is not a participant in the target conversation

**Result:** Access to the conversation is denied without revealing its existence

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `DM_PARTICIPANT_NOT_FOUND` | 404 | One or more recipients could not be found. Please check the usernames and try again. | No |
| `DM_PARTICIPANT_LIMIT_EXCEEDED` | 429 | You cannot add more than the allowed number of users to a direct message. | No |
| `DM_ACCESS_DENIED` | 403 | You do not have access to this conversation. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `direct_messaging.conversation_created` | Fires when a new direct conversation room is first created | `room_id`, `participant_ids` |
| `direct_messaging.conversation_opened` | Fires when an existing conversation is reopened in a participant's sidebar | `room_id`, `participant_ids` |
| `direct_messaging.message_sent` | Fires when a message is successfully delivered to a direct conversation | `message_id`, `room_id`, `participant_ids`, `sent_at` |
| `direct_messaging.messages_read` | Fires when a participant reads messages, clearing their unread count | `room_id`, `participant_ids` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| channel-messaging | recommended | Shares the underlying message delivery and notification infrastructure |
| message-editing-deletion | optional | Allows participants to edit or delete sent direct messages |
| message-reactions | optional | Allows emoji reactions on direct messages |
| message-threading | optional | Allows threaded replies within direct conversations |

## AGI Readiness

### Goals

#### Deliver Private Messages

Ensure private 1:1 and small-group conversations are created, delivered, and tracked reliably with correct access control

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| message_delivery_rate | 99.9% | Messages successfully delivered / total messages sent |
| unauthorised_access_rate | 0% | Access attempts by non-participants that succeeded |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before blocking a user or suppressing their messages system-wide
- before purging conversation history for a participant

### Verification

**Invariants:**

- only participants of a conversation may read or write to it
- blocking a user suppresses notifications without exposing conversation existence
- unread counts are maintained independently per participant

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| conversation created on first message | no existing direct conversation between two users | sender posts the first message | new conversation room created and both participants subscribed |
| access denied for non-participant | a third user attempts to read a conversation they are not part of | access request is made | DM_ACCESS_DENIED returned without revealing conversation details |

### Composability

**Capabilities:**

- `private_conversation_routing`: Create or reuse a direct conversation room for a given set of participants
- `per_participant_unread_tracking`: Maintain independent unread counts and notification preferences per participant

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| privacy | discoverability | conversation existence must not be revealed to non-participants even on access denial |

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
  "name": "Direct Messaging Blueprint",
  "description": "1:1 and small-group private conversations between users with read receipts and notification preferences. 10 fields. 7 outcomes. 3 error codes. rules: general. A",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, direct, private, real-time"
}
</script>
