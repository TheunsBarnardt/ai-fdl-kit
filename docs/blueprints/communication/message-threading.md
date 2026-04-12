---
title: "Message Threading Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Threaded replies to messages, keeping focused conversations nested under a parent message without cluttering the main channel timeline. 10 fields. 8 outcomes. 3"
---

# Message Threading Blueprint

> Threaded replies to messages, keeping focused conversations nested under a parent message without cluttering the main channel timeline

| | |
|---|---|
| **Feature** | `message-threading` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | messaging, threads, replies, conversations |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/message-threading.blueprint.yaml) |
| **JSON API** | [message-threading.json]({{ site.baseurl }}/api/blueprints/communication/message-threading.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `participant` | Thread Participant | human | Authenticated user who replies to or follows a thread |
| `author` | Parent Message Author | human | User who posted the original message that starts a thread |
| `follower` | Thread Follower | human | User who opted in to receive notifications for a thread without replying |
| `system` | Messaging System | system | Manages thread state, follower tracking, and unread notifications |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `thread_id` | text | Yes | Thread ID |  |
| `reply_id` | text | Yes | Reply Message ID |  |
| `room_id` | text | Yes | Room ID |  |
| `reply_text` | rich_text | No | Reply Content |  |
| `show_in_channel` | boolean | No | Also Post to Channel |  |
| `reply_count` | number | Yes | Reply Count |  |
| `follower_ids` | json | No | Follower IDs |  |
| `last_reply_at` | datetime | No | Last Reply At |  |
| `sent_at` | datetime | Yes | Sent At |  |
| `mentions` | json | No | Mentioned Users |  |

## Rules

- **general:** A thread is anchored to a single parent message; threads cannot be nested beyond one level, Any member with read access to the room containing the parent message may reply to its thread, Replying to a thread automatically makes the replier a follower and adds them to the unread tracking list, The parent message author is automatically added as a thread follower when the first reply is received, Users mentioned in a reply are added as followers and receive a mention-level notification, Thread followers receive notifications for new replies; the notification level respects the user's room and global preferences, Users may explicitly follow or unfollow any thread regardless of whether they have replied, Unfollowing a thread removes the user from the follower list and clears thread-specific unread counts, Reading a thread marks it as read for the current user and decrements the unread thread counter on the room subscription, Reply count on the parent message is kept in sync; deleting a reply decrements the count, Threads are disabled globally when the system setting is turned off; attempting to reply returns an error, A reply may optionally be cross-posted to the main channel timeline without affecting the thread

## Outcomes

### Thread_reply_posted (Priority: 1)

**Given:**
- user is authenticated and has read access to the room
- parent message exists and belongs to the same room
- threading is enabled at the system level
- reply content or attachment is present

**Then:**
- **create_record**
- **set_field** target: `reply_count` value: `incremented`
- **set_field** target: `last_reply_at` value: `sent_at`
- **emit_event** event: `message_threading.reply_posted`

**Result:** Reply is stored and thread followers receive unread notifications

### Follower_added_on_reply (Priority: 2)

**Given:**
- user posts a reply and is not already a thread follower

**Then:**
- **set_field** target: `follower_ids` value: `appended_with_user`
- **emit_event** event: `message_threading.follower_added`

**Result:** Replier is automatically subscribed to future thread notifications

### Thread_followed (Priority: 3)

**Given:**
- user explicitly follows a thread
- user is not already a follower
- parent message exists and user has read access to its room

**Then:**
- **set_field** target: `follower_ids` value: `appended_with_user`
- **emit_event** event: `message_threading.thread_followed`

**Result:** User is added to the follower list and will receive thread notifications

### Thread_unfollowed (Priority: 4)

**Given:**
- user explicitly unfollows a thread
- user is currently a follower

**Then:**
- **set_field** target: `follower_ids` value: `removed_user`
- **emit_event** event: `message_threading.thread_unfollowed`

**Result:** User is removed from the follower list and thread unread counts are cleared

### Thread_read (Priority: 5)

**Given:**
- user opens the thread panel or scrolls through thread replies

**Then:**
- **set_field** target: `follower_ids` value: `thread_marked_read_for_user`
- **emit_event** event: `message_threading.thread_read`

**Result:** Thread unread count is cleared for the user; subscription alert is updated if no other unread threads remain

### Threads_disabled (Priority: 20) — Error: `THREADING_DISABLED`

**Given:**
- threading is disabled at the system level
- user attempts to post a reply or follow a thread

**Result:** User is informed that threaded replies are not available

### Parent_message_not_found (Priority: 21) — Error: `THREAD_PARENT_NOT_FOUND`

**Given:**
- the specified parent message ID does not exist or has been deleted

**Result:** User is informed the original message could not be found

### Access_denied (Priority: 22) — Error: `THREAD_ACCESS_DENIED`

**Given:**
- user does not have read access to the room containing the parent message

**Result:** User is denied access without revealing the thread content

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `THREADING_DISABLED` | 400 | Threaded replies are currently disabled. Please contact your administrator. | No |
| `THREAD_PARENT_NOT_FOUND` | 404 | The original message could not be found. It may have been deleted. | No |
| `THREAD_ACCESS_DENIED` | 403 | You do not have access to this thread. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `message_threading.reply_posted` | Fires when a new reply is added to a thread | `reply_id`, `thread_id`, `room_id`, `sent_at` |
| `message_threading.follower_added` | Fires when a user is added to the thread follower list (manually or via reply) | `thread_id`, `follower_ids` |
| `message_threading.thread_followed` | Fires when a user explicitly follows a thread | `thread_id`, `follower_ids` |
| `message_threading.thread_unfollowed` | Fires when a user explicitly unfollows a thread | `thread_id`, `follower_ids` |
| `message_threading.thread_read` | Fires when a user marks a thread as read | `thread_id`, `room_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| channel-messaging | required | Threads are anchored to messages in channels or direct conversations |
| direct-messaging | recommended | Threading may also apply to direct message conversations |
| message-editing-deletion | optional | Thread replies may be edited or deleted like regular messages |
| message-reactions | optional | Emoji reactions may be applied to thread replies |

## AGI Readiness

### Goals

#### Maintain Threaded Conversations

Deliver threaded replies under parent messages and keep follower tracking and unread counts accurate

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| reply_count_accuracy | 100% | Parent messages with correct reply count / total threaded messages |
| follower_notification_delivery | 99% | Thread notifications delivered to followers / total expected notifications |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before disabling threading system-wide

### Verification

**Invariants:**

- threads cannot be nested beyond one level
- reply count on parent message is decremented when a reply is deleted
- unfollowing a thread removes the user from all thread unread tracking

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| auto-follow on reply | user posts a reply to a thread they do not follow | reply is created | user is automatically added to follower list |
| thread read clears unread | user has unread replies in a thread | user opens the thread panel | thread unread count cleared and room subscription updated |

### Composability

**Capabilities:**

- `threaded_reply_delivery`: Post and store replies anchored to a parent message
- `thread_follower_management`: Track followers and deliver unread notifications for thread activity

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| notification_accuracy | performance | follower lists and unread counts must stay in sync even under high reply volume |

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
  "name": "Message Threading Blueprint",
  "description": "Threaded replies to messages, keeping focused conversations nested under a parent message without cluttering the main channel timeline. 10 fields. 8 outcomes. 3",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, threads, replies, conversations"
}
</script>
