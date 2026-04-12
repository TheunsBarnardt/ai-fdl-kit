<!-- AUTO-GENERATED FROM mentions-notifications.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Mentions Notifications

> @mention users and user groups in messages to trigger targeted notifications

**Category:** Notification · **Version:** 1.0.0 · **Tags:** mentions · notifications · alerts · at-mention · all · here · groups · teams

## What this does

@mention users and user groups in messages to trigger targeted notifications

Specifies 8 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **message_id** *(text, required)* — Message ID
- **room_id** *(text, required)* — Room ID
- **sender_id** *(text, required)* — Sender User ID
- **mention_text** *(text, required)* — Mention Text
- **mention_type** *(select, required)* — Mention Type
- **mentioned_user_ids** *(json, optional)* — Resolved User IDs
- **message_text** *(rich_text, required)* — Message Text
- **max_all_members** *(number, optional)* — Max Members for @all
- **e2e_user_mentions** *(json, optional)* — E2E Encrypted Mentions

## What must be true

- **general:** A mention is triggered by the @ prefix followed by a username, group name, 'all', or 'here' in a message, The platform parses all @mentions from a message using a configured username pattern before the message is persisted, Resolved mention targets are stored on the message record so notification delivery does not require re-parsing, @all notifies every member of the room; it is suppressed when the room member count exceeds the max_all_members threshold, @here notifies only members who are currently active/online; it is also suppressed by the same threshold as @all, When @all or @here exceeds the threshold, the sender is notified that the mention was not delivered, Mentioning a user who is not a member of the room does not create a notification for that user, For end-to-end encrypted messages, mention targets are read from e2e_user_mentions rather than the encrypted message body, Channel mentions (#channel-name) create a link to the channel but do not generate notifications for that channel's members, Mentions resolve users by username; if no matching user is found the text is rendered as plain text without a notification, A user can be mentioned multiple times in the same message; only one notification is sent per mention event, Notification delivery method (push, email, in-app) is governed by each user's individual notification preferences

## Success & failure scenarios

**✅ Success paths**

- **Mention User Not Found** — when message contains @text where text does not match any user, group, or team, then Text is rendered as plain text with no mention link and no notification is sent.
- **Mention Non Member** — when message contains @username; the resolved user exists but is not a member of the room, then Mention link is rendered in the message but no notification is sent to the non-member.
- **E2e Mention Resolved** — when message is end-to-end encrypted; e2e_user_mentions field is present and non-empty, then Mentions are resolved from e2e_user_mentions instead of the encrypted body and notifications are dispatched normally.
- **Group Members Notified** — when message contains @team-name or @group-name referencing a defined user group or team; group or team exists and has resolvable members, then All members of the referenced group or team receive a notification.
- **All Members Notified** — when message contains @all; room member count is less than or equal to max_all_members, then All members of the room receive a notification.
- **Here Members Notified** — when message contains @here; room member count is less than or equal to max_all_members, then Currently active/online members of the room receive a notification.
- **User Notified** — when message is sent containing @username where username matches an existing user; mentioned user is a member of the room, then Notification is dispatched to the mentioned user via their configured notification channels.

**❌ Failure paths**

- **Mention Suppressed Threshold Exceeded** — when message contains @all or @here; room member count exceeds max_all_members, then Broadcast mention is not delivered; sender receives an ephemeral warning that the room is too large. *(error: `MENTION_THRESHOLD_EXCEEDED`)*

## Errors it can return

- `MENTION_THRESHOLD_EXCEEDED` — Your message mentions all room members, but the room is too large for broadcast notifications. Mention specific users instead.

## Connects to

- **messaging** *(required)* — Mentions are parsed from messages; the messaging feature provides the message context
- **notification-preferences** *(required)* — User notification preferences determine how and where mention notifications are delivered
- **channel-management** *(recommended)* — Room membership determines which users are valid targets for room-scoped mentions
- **user-groups** *(optional)* — Group and team mentions require user groups to be defined
- **push-notifications** *(recommended)* — Mobile push notifications are a primary delivery channel for mention alerts

## Quality fitness 🟢 82/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `███░░░░░░░` | 3/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/notification/mentions-notifications/) · **Spec source:** [`mentions-notifications.blueprint.yaml`](./mentions-notifications.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
