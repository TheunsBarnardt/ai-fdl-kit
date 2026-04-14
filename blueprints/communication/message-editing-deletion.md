<!-- AUTO-GENERATED FROM message-editing-deletion.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Message Editing Deletion

> Allow users to edit the content of sent messages and delete messages, with optional edit history preservation and configurable time windows

**Category:** Communication · **Version:** 1.0.0 · **Tags:** messaging · editing · deletion · moderation · history

## What this does

Allow users to edit the content of sent messages and delete messages, with optional edit history preservation and configurable time windows

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **message_id** *(text, required)* — Message ID
- **room_id** *(text, required)* — Room ID
- **original_text** *(rich_text, optional)* — Original Content
- **updated_text** *(rich_text, optional)* — Updated Content
- **edited_at** *(datetime, optional)* — Edited At
- **edited_by_user_id** *(text, optional)* — Edited By
- **deleted_at** *(datetime, optional)* — Deleted At
- **deleted_by_user_id** *(text, optional)* — Deleted By
- **keep_history** *(boolean, optional)* — Keep Edit/Delete History
- **show_deleted_status** *(boolean, optional)* — Show Deleted Placeholder
- **edit_window_seconds** *(number, optional)* — Edit Time Window (seconds)
- **delete_window_seconds** *(number, optional)* — Delete Time Window (seconds)

## What must be true

- **general:** A message author may edit their own messages within the configured time window; a window of 0 imposes no restriction, A message author may delete their own messages within the configured delete time window; a window of 0 imposes no restriction, Moderators and administrators may edit or delete any message in rooms they moderate, regardless of time window, When edit history retention is enabled, the previous content is saved as a historical record before applying the update, When the show-deleted-status setting is enabled, deleted messages display a placeholder; otherwise the message record is removed, Deleting a message that is the parent of a thread follows thread-aware deletion: the reply count is decremented and thread followers are notified, Attached files are removed from storage when a message is fully deleted (not just soft-deleted with a placeholder), When history retention is enabled for a thread parent, the message is soft-deleted regardless of the show-deleted-status setting, The room's last-message snapshot is updated after any edit or deletion affecting the most recent message, Editing a message re-runs URL preview parsing and custom-field validation on the updated content, Third-party integrations are notified via event hooks both before (pre-delete prevent) and after a deletion; an integration may veto the deletion, An edit records the editing user's ID and timestamp alongside the new content; the original author remains unchanged

## Success & failure scenarios

**✅ Success paths**

- **Message Edited** — when user is authenticated; message exists and has active or edited status; user is the message author, or has moderator/administrator role in the room; Current time is within the edit time window, or actor has elevated role, or window is unrestricted; updated content is not empty, or an attachment is still present, then Message content is updated; an edit indicator is shown to all room members.
- **Message Deleted Soft** — when user is authenticated; message exists and is not already deleted; user is the message author within the delete time window, or has moderator/administrator role; show_deleted_status is true, or keep_history is true, or message is a thread parent with replies, then Message content is replaced with a deletion placeholder visible to all room members.
- **Message Deleted Hard** — when user is authenticated; message exists and is not already deleted; user is the message author within the delete time window, or has moderator/administrator role; show_deleted_status is false; keep_history is false; message is not a thread parent with existing replies, then Message and its attachments are permanently removed; all room members see the message disappear.

**❌ Failure paths**

- **Edit Window Expired** — when user is the message author; Current time exceeds the configured edit window; user does not have moderator or administrator role, then User is informed the edit window for this message has closed. *(error: `EDIT_WINDOW_EXPIRED`)*
- **Delete Window Expired** — when user is the message author; Current time exceeds the configured delete window; user does not have moderator or administrator role, then User is informed the deletion window for this message has closed. *(error: `DELETE_WINDOW_EXPIRED`)*
- **Not Authorized** — when user is not the message author; user does not have moderator or administrator role in the room, then User is informed they are not permitted to edit or delete this message. *(error: `EDIT_DELETE_NOT_AUTHORIZED`)*
- **Message Not Found** — when the specified message ID does not exist or has already been deleted, then User is informed the message could not be found. *(error: `EDIT_DELETE_MESSAGE_NOT_FOUND`)*
- **Integration Prevented** — when a registered integration vetoed the operation via the pre-delete or pre-update event hook, then User is informed the action was blocked by an active integration. *(error: `EDIT_DELETE_BLOCKED_BY_INTEGRATION`)*

## Errors it can return

- `EDIT_WINDOW_EXPIRED` — The time window for editing this message has passed.
- `DELETE_WINDOW_EXPIRED` — The time window for deleting this message has passed.
- `EDIT_DELETE_NOT_AUTHORIZED` — You are not allowed to edit or delete this message.
- `EDIT_DELETE_MESSAGE_NOT_FOUND` — The message could not be found. It may have already been deleted.
- `EDIT_DELETE_BLOCKED_BY_INTEGRATION` — This action was prevented by an active integration. Please contact your administrator.

## Events

**`message_editing_deletion.message_edited`** — Fires after a message is successfully edited
  Payload: `message_id`, `room_id`, `edited_at`, `edited_by_user_id`

**`message_editing_deletion.message_deleted`** — Fires after a message is deleted (soft or hard)
  Payload: `message_id`, `room_id`, `deleted_at`, `deleted_by_user_id`

## Connects to

- **channel-messaging** *(required)* — Messages being edited or deleted originate from channel or direct message rooms
- **direct-messaging** *(required)* — Edit and delete operations apply equally to direct messages
- **message-threading** *(recommended)* — Deleting a thread parent requires special handling of reply count and follower notifications
- **message-reactions** *(optional)* — Reactions on a deleted message are cleared when the message is hard-deleted

## Quality fitness 🟢 81/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/message-editing-deletion/) · **Spec source:** [`message-editing-deletion.blueprint.yaml`](./message-editing-deletion.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
