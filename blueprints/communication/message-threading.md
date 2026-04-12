<!-- AUTO-GENERATED FROM message-threading.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Message Threading

> Threaded replies to messages, keeping focused conversations nested under a parent message without cluttering the main channel timeline

**Category:** Communication · **Version:** 1.0.0 · **Tags:** messaging · threads · replies · conversations

## What this does

Threaded replies to messages, keeping focused conversations nested under a parent message without cluttering the main channel timeline

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **thread_id** *(text, required)* — Thread ID
- **reply_id** *(text, required)* — Reply Message ID
- **room_id** *(text, required)* — Room ID
- **reply_text** *(rich_text, optional)* — Reply Content
- **show_in_channel** *(boolean, optional)* — Also Post to Channel
- **reply_count** *(number, required)* — Reply Count
- **follower_ids** *(json, optional)* — Follower IDs
- **last_reply_at** *(datetime, optional)* — Last Reply At
- **sent_at** *(datetime, required)* — Sent At
- **mentions** *(json, optional)* — Mentioned Users

## What must be true

- **general:** A thread is anchored to a single parent message; threads cannot be nested beyond one level, Any member with read access to the room containing the parent message may reply to its thread, Replying to a thread automatically makes the replier a follower and adds them to the unread tracking list, The parent message author is automatically added as a thread follower when the first reply is received, Users mentioned in a reply are added as followers and receive a mention-level notification, Thread followers receive notifications for new replies; the notification level respects the user's room and global preferences, Users may explicitly follow or unfollow any thread regardless of whether they have replied, Unfollowing a thread removes the user from the follower list and clears thread-specific unread counts, Reading a thread marks it as read for the current user and decrements the unread thread counter on the room subscription, Reply count on the parent message is kept in sync; deleting a reply decrements the count, Threads are disabled globally when the system setting is turned off; attempting to reply returns an error, A reply may optionally be cross-posted to the main channel timeline without affecting the thread

## Success & failure scenarios

**✅ Success paths**

- **Thread Reply Posted** — when user is authenticated and has read access to the room; parent message exists and belongs to the same room; threading is enabled at the system level; reply content or attachment is present, then Reply is stored and thread followers receive unread notifications.
- **Follower Added On Reply** — when user posts a reply and is not already a thread follower, then Replier is automatically subscribed to future thread notifications.
- **Thread Followed** — when user explicitly follows a thread; user is not already a follower; parent message exists and user has read access to its room, then User is added to the follower list and will receive thread notifications.
- **Thread Unfollowed** — when user explicitly unfollows a thread; user is currently a follower, then User is removed from the follower list and thread unread counts are cleared.
- **Thread Read** — when user opens the thread panel or scrolls through thread replies, then Thread unread count is cleared for the user; subscription alert is updated if no other unread threads remain.

**❌ Failure paths**

- **Threads Disabled** — when threading is disabled at the system level; user attempts to post a reply or follow a thread, then User is informed that threaded replies are not available. *(error: `THREADING_DISABLED`)*
- **Parent Message Not Found** — when the specified parent message ID does not exist or has been deleted, then User is informed the original message could not be found. *(error: `THREAD_PARENT_NOT_FOUND`)*
- **Access Denied** — when user does not have read access to the room containing the parent message, then User is denied access without revealing the thread content. *(error: `THREAD_ACCESS_DENIED`)*

## Errors it can return

- `THREADING_DISABLED` — Threaded replies are currently disabled. Please contact your administrator.
- `THREAD_PARENT_NOT_FOUND` — The original message could not be found. It may have been deleted.
- `THREAD_ACCESS_DENIED` — You do not have access to this thread.

## Connects to

- **channel-messaging** *(required)* — Threads are anchored to messages in channels or direct conversations
- **direct-messaging** *(recommended)* — Threading may also apply to direct message conversations
- **message-editing-deletion** *(optional)* — Thread replies may be edited or deleted like regular messages
- **message-reactions** *(optional)* — Emoji reactions may be applied to thread replies

## Quality fitness 🟢 83/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/message-threading/) · **Spec source:** [`message-threading.blueprint.yaml`](./message-threading.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
