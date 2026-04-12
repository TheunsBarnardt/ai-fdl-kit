---
title: "Read Receipts Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Track and display which users have read each message, providing per-user read confirmation for messages in conversations. 8 fields. 7 outcomes. 2 error codes. r"
---

# Read Receipts Blueprint

> Track and display which users have read each message, providing per-user read confirmation for messages in conversations

| | |
|---|---|
| **Feature** | `read-receipts` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | read-receipts, messages, tracking, confirmation, delivery |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/read-receipts.blueprint.yaml) |
| **JSON API** | [read-receipts.json]({{ site.baseurl }}/api/blueprints/communication/read-receipts.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `reader` | Reader | human | The user who reads messages, triggering read receipt creation |
| `message_sender` | Message Sender | human | The user who sent the message and can see who has read it |
| `receipt_service` | Receipt Service | system | Server-side service that records and queries read receipts |
| `administrator` | Administrator | human | Administrator who controls whether read receipts are enabled system-wide |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `message_id` | text | Yes | Message ID |  |
| `room_id` | text | Yes | Room ID |  |
| `user_id` | text | Yes | User ID |  |
| `read_at` | datetime | Yes | Read At |  |
| `thread_id` | text | No | Thread ID |  |
| `last_seen` | datetime | No | Last Seen |  |
| `pinned` | boolean | No | Pinned |  |
| `is_thread_reply` | boolean | No | Is Thread Reply |  |

## Rules

- **general:** Read receipts must be enabled by system configuration before any receipts are stored, A receipt is created for each message a user views, identified by user ID, message ID, and timestamp, Batch read: when a user opens a room, all visible unread messages up to their last-seen timestamp are marked as read, A message authored by the sender is automatically marked as read if the sender is the only participant in the room, Thread reads are tracked separately from main conversation reads, Once all subscribers have read messages up to a point, those messages are marked as globally read at the room level, Read receipts must not leak data: only the sender (and administrators) can see who read a specific message, Deleting a user's data must remove all their associated read receipts, Pinned messages retain their read receipt history even after pinning, Read receipts for a message are debounced per room to avoid write storms when many users open a room simultaneously

## Outcomes

### Messages_marked_as_read_on_open (Priority: 1)

**Given:**
- user opens or scrolls to a room and has unread messages
- `last_seen` (db) exists
- `read_receipts_enabled` (system) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `read_receipts.messages_read`

**Result:** Read receipts are stored for all unread messages up to the user's last-seen timestamp

### Thread_marked_as_read (Priority: 2)

**Given:**
- user reads messages inside a thread
- `thread_id` (input) exists
- `read_receipts_enabled` (system) eq `true`

**Then:**
- **create_record**
- **emit_event** event: `read_receipts.thread_read`

**Result:** Read receipts are recorded for thread messages independently from the main room

### Message_auto_read_by_sender (Priority: 3)

**Given:**
- sender is the only participant in the room
- `subscriber_count` (computed) eq `0`
- `read_receipts_enabled` (system) eq `true`

**Then:**
- **set_field** target: `message.unread` value: `false`
- **emit_event** event: `read_receipts.message_read`

**Result:** Message is automatically marked as read when the sender is alone in the room

### Room_last_message_read (Priority: 4)

**Given:**
- all subscribers have seen the room's last message
- `last_seen` (db) gte

**Then:**
- **set_field** target: `room.last_message_read` value: `true`
- **emit_event** event: `read_receipts.room_fully_read`

**Result:** Room is marked as fully read; the last message shows as read by everyone

### Receipts_fetched_for_message (Priority: 5)

**Given:**
- user requests the list of readers for a specific message
- `message_id` (input) exists
- `read_receipts_enabled` (system) eq `true`

**Then:**
- **emit_event** event: `read_receipts.receipts_fetched`

**Result:** List of users who have read the message is returned with their read timestamps

### Read_receipts_disabled (Priority: 6) — Error: `READ_RECEIPT_FEATURE_DISABLED`

**Given:**
- `read_receipts_enabled` (system) eq `false`

**Result:** No read receipts are stored or returned; feature is disabled by system configuration

### Receipt_not_found (Priority: 7) — Error: `READ_RECEIPT_NOT_FOUND`

**Given:**
- user queries receipts for a message that has no receipt records
- `message_id` (input) exists

**Result:** Empty receipt list returned; no users have read the message yet

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `READ_RECEIPT_FEATURE_DISABLED` | 400 | Message read receipts are not enabled on this server | No |
| `READ_RECEIPT_NOT_FOUND` | 404 | No read receipts found for this message | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `read_receipts.messages_read` | Fired when a batch of messages are marked as read by a user opening a room | `room_id`, `user_id`, `last_seen` |
| `read_receipts.thread_read` | Fired when thread messages are marked as read by a user | `thread_id`, `user_id` |
| `read_receipts.message_read` | Fired when a single message is marked as read | `message_id`, `room_id`, `user_id` |
| `read_receipts.room_fully_read` | Fired when all subscribers have read the room's last message | `room_id` |
| `read_receipts.receipts_fetched` | Fired when the read receipt list for a message is queried | `message_id`, `room_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| user-presence | recommended | Last-seen timestamps from presence can be reused for batch read marking |
| channel-messaging | required | Messages must exist before read receipts can be tracked |
| direct-messaging | recommended | Read receipts are especially meaningful in direct conversations |

## AGI Readiness

### Goals

#### Private Read Confirmation Tracking

Record and expose per-user read confirmations for messages while ensuring receipt data is only visible to the sender and administrators

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| receipt_privacy_compliance | 100% | Receipt queries restricted to sender or admin / total receipt queries |
| batch_read_accuracy | 99.9% | Messages correctly marked as read on room open / total unread messages |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before enabling read receipts for the first time on a high-volume workspace
- before bulk-deleting read receipt history

### Verification

**Invariants:**

- read receipts are only stored when the feature is enabled by system configuration
- only the message sender and administrators may query who read a specific message
- deleting a user's data removes all their associated read receipts

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| batch read on room open | user opens a room with 10 unread messages | room is opened | read receipts created for all 10 messages up to last-seen timestamp |
| feature disabled blocks receipt creation | read_receipts_enabled system setting is false | user opens a room | no read receipt records are created |

### Composability

**Capabilities:**

- `batch_read_marking`: Mark all visible unread messages as read when a user opens a room
- `per_message_reader_list`: Return the list of users who have read a specific message with timestamps

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| privacy | transparency | receipt data is restricted to sender and admins to prevent surveillance of user reading habits |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| query_message_readers | `supervised` | - | 1 |

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
  "name": "Read Receipts Blueprint",
  "description": "Track and display which users have read each message, providing per-user read confirmation for messages in conversations. 8 fields. 7 outcomes. 2 error codes. r",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "read-receipts, messages, tracking, confirmation, delivery"
}
</script>
