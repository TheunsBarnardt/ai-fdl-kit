<!-- AUTO-GENERATED FROM channel-messaging.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Channel Messaging

> Public and private group channels for team-wide or restricted conversations with membership, roles, and moderation controls

**Category:** Communication · **Version:** 1.0.0 · **Tags:** messaging · channels · groups · rooms · moderation

## What this does

Public and private group channels for team-wide or restricted conversations with membership, roles, and moderation controls

Specifies 9 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **channel_id** *(text, required)* — Channel ID
- **channel_name** *(text, required)* — Channel Name
- **display_name** *(text, optional)* — Display Name
- **channel_type** *(select, required)* — Channel Type
- **topic** *(text, optional)* — Topic
- **announcement** *(text, optional)* — Announcement
- **description** *(text, optional)* — Description
- **is_read_only** *(boolean, optional)* — Read-Only Mode
- **is_default** *(boolean, optional)* — Default Channel
- **encrypted** *(boolean, optional)* — End-to-End Encrypted
- **join_code** *(text, optional)* — Join Code
- **message_text** *(rich_text, optional)* — Message Content
- **message_id** *(text, required)* — Message ID
- **sent_at** *(datetime, required)* — Sent At
- **user_count** *(number, required)* — Member Count
- **message_count** *(number, required)* — Message Count
- **member_role** *(select, optional)* — Member Role

## What must be true

- **general:** Public channels are discoverable and joinable by any authenticated user without invitation, Private channels are only visible to and joinable by members; membership requires an invitation from an existing member, A channel name must be unique within the system and may only contain alphanumeric characters, hyphens, and underscores, Only owners and moderators may post in a read-only channel; regular members may react but not send messages, Muted users cannot send messages in any channel they have been muted in, Archived channels are read-only for all users; no new messages, reactions, or membership changes are accepted, Channel owners may assign moderator and owner roles to other members, Moderators may remove messages, mute members, and remove members from private channels, A channel requires at least one owner at all times; the last owner cannot leave without transferring ownership, Default channels automatically subscribe all new users upon account creation, A join code, when set, must be provided by any user attempting to join the channel directly, Broadcast channels allow only owners and moderators to post; members receive messages but cannot reply in the main channel

## Success & failure scenarios

**✅ Success paths**

- **Channel Created** — when authenticated user submits a valid channel name; Channel name is not already taken, then Channel is created and the creator is subscribed as owner.
- **Member Joined** — when user is authenticated and not already a member; channel is public, or user has received an invitation, or provides a valid join code; channel is not archived, then User is subscribed to the channel and a join system message is posted.
- **Message Sent** — when sender is an authenticated member of the channel; channel is not archived; channel is not read-only, or sender has moderator or owner role; sender is not muted in the channel; message content or attachment is present, then Message is stored and broadcast to all channel members.
- **Member Removed** — when actor is a moderator or owner; target user is a member of the channel, then User's subscription is removed and a system message is posted.
- **Channel Archived** — when actor is the channel owner; channel is in active or read_only state, then Channel is archived; all members see it as read-only.

**❌ Failure paths**

- **Channel Name Taken** — when A channel with this name already exists, then User is informed the channel name is already in use. *(error: `CHANNEL_NAME_TAKEN`)*
- **Access Denied Private** — when channel type is private; user has not received an invitation and does not provide a valid join code, then User is informed they do not have access to this channel. *(error: `CHANNEL_ACCESS_DENIED`)*
- **Posting Restricted** — when channel is in read_only state; sender does not have moderator or owner role, then User is informed they cannot post in a read-only channel. *(error: `CHANNEL_POST_RESTRICTED`)*
- **Channel Archived Error** — when channel status is archived; user attempts to post a message or modify membership, then User is informed the channel is archived and no longer accepts changes. *(error: `CHANNEL_ARCHIVED`)*

## Errors it can return

- `CHANNEL_NAME_TAKEN` — A channel with that name already exists. Please choose a different name.
- `CHANNEL_ACCESS_DENIED` — You do not have permission to access this channel.
- `CHANNEL_POST_RESTRICTED` — This channel is read-only. Only moderators and owners may post messages.
- `CHANNEL_ARCHIVED` — This channel has been archived and no longer accepts new messages.

## Connects to

- **direct-messaging** *(recommended)* — Shares the underlying message delivery and notification infrastructure
- **message-editing-deletion** *(optional)* — Allows members and moderators to edit or delete posted messages
- **message-reactions** *(optional)* — Allows emoji reactions on channel messages
- **message-threading** *(optional)* — Allows threaded replies to messages within channels

## Quality fitness 🟢 84/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `███████░░░` | 7/10 |
| Outcomes | `██████████████████████░░░` | 22/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████████` | 10/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `█████` | 5/5 |
| Simplicity | `█████` | 5/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/channel-messaging/) · **Spec source:** [`channel-messaging.blueprint.yaml`](./channel-messaging.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
