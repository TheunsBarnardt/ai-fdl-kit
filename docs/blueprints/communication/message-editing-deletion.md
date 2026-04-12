---
title: "Message Editing Deletion Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Allow users to edit the content of sent messages and delete messages, with optional edit history preservation and configurable time windows. 12 fields. 8 outcom"
---

# Message Editing Deletion Blueprint

> Allow users to edit the content of sent messages and delete messages, with optional edit history preservation and configurable time windows

| | |
|---|---|
| **Feature** | `message-editing-deletion` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | messaging, editing, deletion, moderation, history |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/message-editing-deletion.blueprint.yaml) |
| **JSON API** | [message-editing-deletion.json]({{ site.baseurl }}/api/blueprints/communication/message-editing-deletion.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `author` | Message Author | human | User who originally sent the message |
| `moderator` | Room Moderator | human | User with moderation permissions who may edit or delete others' messages |
| `administrator` | Administrator | human | System administrator who can override time-window restrictions |
| `system` | Messaging System | system | Enforces time windows, history retention policy, and event broadcasting |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `message_id` | text | Yes | Message ID |  |
| `room_id` | text | Yes | Room ID |  |
| `original_text` | rich_text | No | Original Content |  |
| `updated_text` | rich_text | No | Updated Content |  |
| `edited_at` | datetime | No | Edited At |  |
| `edited_by_user_id` | text | No | Edited By |  |
| `deleted_at` | datetime | No | Deleted At |  |
| `deleted_by_user_id` | text | No | Deleted By |  |
| `keep_history` | boolean | No | Keep Edit/Delete History |  |
| `show_deleted_status` | boolean | No | Show Deleted Placeholder |  |
| `edit_window_seconds` | number | No | Edit Time Window (seconds) |  |
| `delete_window_seconds` | number | No | Delete Time Window (seconds) |  |

## States

**State field:** `message_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `edited` |  |  |
| `deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `edited` | author |  |
|  | `edited` | `edited` | author |  |
|  | `active` | `deleted` | author |  |
|  | `edited` | `deleted` | author |  |
|  | `active` | `deleted` | moderator |  |
|  | `edited` | `deleted` | moderator |  |

## Rules

- **general:** A message author may edit their own messages within the configured time window; a window of 0 imposes no restriction, A message author may delete their own messages within the configured delete time window; a window of 0 imposes no restriction, Moderators and administrators may edit or delete any message in rooms they moderate, regardless of time window, When edit history retention is enabled, the previous content is saved as a historical record before applying the update, When the show-deleted-status setting is enabled, deleted messages display a placeholder; otherwise the message record is removed, Deleting a message that is the parent of a thread follows thread-aware deletion: the reply count is decremented and thread followers are notified, Attached files are removed from storage when a message is fully deleted (not just soft-deleted with a placeholder), When history retention is enabled for a thread parent, the message is soft-deleted regardless of the show-deleted-status setting, The room's last-message snapshot is updated after any edit or deletion affecting the most recent message, Editing a message re-runs URL preview parsing and custom-field validation on the updated content, Third-party integrations are notified via event hooks both before (pre-delete prevent) and after a deletion; an integration may veto the deletion, An edit records the editing user's ID and timestamp alongside the new content; the original author remains unchanged

## Outcomes

### Message_edited (Priority: 1)

**Given:**
- user is authenticated
- message exists and has active or edited status
- user is the message author, or has moderator/administrator role in the room
- `edited_at` (computed) lte `edit_window_seconds`
- updated content is not empty, or an attachment is still present

**Then:**
- **set_field** target: `message_status` value: `edited`
- **set_field** target: `edited_at` value: `now`
- **set_field** target: `edited_by_user_id` value: `current_user`
- **emit_event** event: `message_editing_deletion.message_edited`

**Result:** Message content is updated; an edit indicator is shown to all room members

### Message_deleted_soft (Priority: 2)

**Given:**
- user is authenticated
- message exists and is not already deleted
- user is the message author within the delete time window, or has moderator/administrator role
- show_deleted_status is true, or keep_history is true, or message is a thread parent with replies

**Then:**
- **set_field** target: `message_status` value: `deleted`
- **set_field** target: `deleted_at` value: `now`
- **set_field** target: `deleted_by_user_id` value: `current_user`
- **emit_event** event: `message_editing_deletion.message_deleted`

**Result:** Message content is replaced with a deletion placeholder visible to all room members

### Message_deleted_hard (Priority: 3)

**Given:**
- user is authenticated
- message exists and is not already deleted
- user is the message author within the delete time window, or has moderator/administrator role
- show_deleted_status is false
- keep_history is false
- message is not a thread parent with existing replies

**Then:**
- **delete_record**
- **delete_record**
- **emit_event** event: `message_editing_deletion.message_deleted`

**Result:** Message and its attachments are permanently removed; all room members see the message disappear

### Edit_window_expired (Priority: 20) — Error: `EDIT_WINDOW_EXPIRED`

**Given:**
- user is the message author
- `edited_at` (computed) gt `edit_window_seconds`
- user does not have moderator or administrator role

**Result:** User is informed the edit window for this message has closed

### Delete_window_expired (Priority: 21) — Error: `DELETE_WINDOW_EXPIRED`

**Given:**
- user is the message author
- `deleted_at` (computed) gt `delete_window_seconds`
- user does not have moderator or administrator role

**Result:** User is informed the deletion window for this message has closed

### Not_authorized (Priority: 22) — Error: `EDIT_DELETE_NOT_AUTHORIZED`

**Given:**
- user is not the message author
- user does not have moderator or administrator role in the room

**Result:** User is informed they are not permitted to edit or delete this message

### Message_not_found (Priority: 23) — Error: `EDIT_DELETE_MESSAGE_NOT_FOUND`

**Given:**
- the specified message ID does not exist or has already been deleted

**Result:** User is informed the message could not be found

### Integration_prevented (Priority: 24) — Error: `EDIT_DELETE_BLOCKED_BY_INTEGRATION`

**Given:**
- a registered integration vetoed the operation via the pre-delete or pre-update event hook

**Result:** User is informed the action was blocked by an active integration

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `EDIT_WINDOW_EXPIRED` | 400 | The time window for editing this message has passed. | No |
| `DELETE_WINDOW_EXPIRED` | 400 | The time window for deleting this message has passed. | No |
| `EDIT_DELETE_NOT_AUTHORIZED` | 400 | You are not allowed to edit or delete this message. | No |
| `EDIT_DELETE_MESSAGE_NOT_FOUND` | 404 | The message could not be found. It may have already been deleted. | No |
| `EDIT_DELETE_BLOCKED_BY_INTEGRATION` | 403 | This action was prevented by an active integration. Please contact your administrator. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `message_editing_deletion.message_edited` | Fires after a message is successfully edited | `message_id`, `room_id`, `edited_at`, `edited_by_user_id` |
| `message_editing_deletion.message_deleted` | Fires after a message is deleted (soft or hard) | `message_id`, `room_id`, `deleted_at`, `deleted_by_user_id` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| channel-messaging | required | Messages being edited or deleted originate from channel or direct message rooms |
| direct-messaging | required | Edit and delete operations apply equally to direct messages |
| message-threading | recommended | Deleting a thread parent requires special handling of reply count and follower notifications |
| message-reactions | optional | Reactions on a deleted message are cleared when the message is hard-deleted |

## AGI Readiness

### Goals

#### Enforce Edit Delete Policy

Allow authors and moderators to edit or delete messages within configured time windows while preserving audit trails when required

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorised_edit_rate | 0% | Edit or delete operations by non-authors without moderator role / total attempts |
| history_retention_compliance | 100% | Edits that preserved history when keep_history is true / total edits |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before permanently hard-deleting messages in a channel with history retention enabled
- before changing workspace-level time window policies

### Verification

**Invariants:**

- only the message author or a moderator/administrator may edit or delete a message
- edit history is preserved when keep_history is enabled
- hard deletion removes attached files from storage
- third-party integrations can veto deletions via pre-delete hook

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| edit window expired for regular user | edit_window_seconds has elapsed since message creation | message author attempts to edit | EDIT_WINDOW_EXPIRED error returned |
| moderator ignores time window | edit_window_seconds has elapsed | moderator edits the message | edit succeeds regardless of time window |

### Composability

**Capabilities:**

- `time_windowed_editing`: Enforce configurable edit and delete time windows per workspace policy
- `soft_delete_with_placeholder`: Replace deleted message content with a placeholder when show_deleted_status is enabled

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| auditability | storage_efficiency | preserving edit history and deletion placeholders enables compliance and dispute resolution |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| hard_delete_message | `supervised` | - | - |
| edit_others_message | `supervised` | - | - |

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
  "name": "Message Editing Deletion Blueprint",
  "description": "Allow users to edit the content of sent messages and delete messages, with optional edit history preservation and configurable time windows. 12 fields. 8 outcom",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, editing, deletion, moderation, history"
}
</script>
