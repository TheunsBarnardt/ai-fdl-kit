---
title: "Message Reactions Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Emoji reactions on messages, allowing users to express sentiment without posting a reply; supports toggle (add/remove) semantics. 7 fields. 8 outcomes. 5 error "
---

# Message Reactions Blueprint

> Emoji reactions on messages, allowing users to express sentiment without posting a reply; supports toggle (add/remove) semantics

| | |
|---|---|
| **Feature** | `message-reactions` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | messaging, reactions, emoji, engagement |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/message-reactions.blueprint.yaml) |
| **JSON API** | [message-reactions.json]({{ site.baseurl }}/api/blueprints/communication/message-reactions.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `reactor` | Reacting User | human | Authenticated user adding or removing an emoji reaction |
| `system` | Messaging System | system | Validates the emoji, checks room permissions, and persists the reaction state |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `message_id` | text | Yes | Message ID |  |
| `room_id` | text | Yes | Room ID |  |
| `emoji` | text | Yes | Emoji Code |  |
| `reactor_username` | text | Yes | Reactor Username |  |
| `reaction_usernames` | json | No | Reacted-By Usernames |  |
| `reacted_at` | datetime | Yes | Reacted At |  |
| `should_react` | boolean | No | Desired Reaction State |  |

## Rules

- **general:** A user may react to any message in a room they have read access to, Each user may add each emoji reaction at most once per message; reacting again with the same emoji removes the reaction (toggle), The emoji must be a valid standard or custom emoji registered in the system; unknown emoji codes are rejected, Users who are muted in the room cannot add reactions to messages in that room, In read-only channels, reactions are permitted only if the channel explicitly allows reacting when read-only, Users who have been manually unmuted in a read-only channel may react regardless of the read-only setting, When the last reaction for a given emoji is removed, the emoji entry is fully deleted from the message, Reactions are stored on the message record and propagated to the last-message snapshot of the room when applicable, The reaction list per message is unbounded in distinct emoji but each emoji tracks an ordered list of reacting usernames

## Outcomes

### Reaction_added (Priority: 1)

**Given:**
- user is authenticated and has access to the room
- message exists in the room
- emoji is valid (standard or custom)
- user has not already reacted with this emoji on this message
- user is not muted in the room
- room is not read-only, or the room allows reacting when read-only, or the user has been unmuted

**Then:**
- **set_field** target: `reaction_usernames` value: `appended_with_reactor`
- **emit_event** event: `message_reactions.reaction_added`

**Result:** Emoji reaction is recorded on the message and all room members see the updated reaction count

### Reaction_removed (Priority: 2)

**Given:**
- user is authenticated and has access to the room
- message exists in the room
- user has already reacted with this emoji on this message

**Then:**
- **set_field** target: `reaction_usernames` value: `removed_reactor`
- **emit_event** event: `message_reactions.reaction_removed`

**Result:** Emoji reaction is removed from the message; if no users remain for that emoji, the emoji entry is deleted

### Reaction_toggled (Priority: 3)

**Given:**
- user is authenticated and has access to the room
- message exists in the room
- emoji is valid
- should_react is not explicitly specified

**Then:**
- **emit_event** event: `message_reactions.reaction_toggled`

**Result:** System determines current state and either adds or removes the reaction accordingly

### Invalid_emoji (Priority: 10) — Error: `REACTION_INVALID_EMOJI`

**Given:**
- the specified emoji code does not match any registered standard or custom emoji

**Result:** User is informed the emoji is not recognized

### User_muted (Priority: 11) — Error: `REACTION_USER_MUTED`

**Given:**
- user is muted in the room

**Result:** User is informed they cannot react because they have been muted

### Room_readonly_no_react (Priority: 12) — Error: `REACTION_ROOM_READONLY`

**Given:**
- room is read-only
- room does not allow reacting when read-only
- user has not been explicitly unmuted

**Result:** User is informed they cannot react in this read-only room

### Message_not_found (Priority: 13) — Error: `REACTION_MESSAGE_NOT_FOUND`

**Given:**
- the specified message ID does not exist or has been deleted

**Result:** User is informed the message could not be found

### Access_denied (Priority: 14) — Error: `REACTION_ACCESS_DENIED`

**Given:**
- user does not have read access to the room

**Result:** User is denied access to react without revealing room details

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `REACTION_INVALID_EMOJI` | 400 | The selected emoji is not available. Please choose a valid emoji. | No |
| `REACTION_USER_MUTED` | 400 | You cannot react to messages because you have been muted in this room. | No |
| `REACTION_ROOM_READONLY` | 400 | Reactions are not allowed in this read-only room. | No |
| `REACTION_MESSAGE_NOT_FOUND` | 404 | The message could not be found. It may have been deleted. | No |
| `REACTION_ACCESS_DENIED` | 403 | You do not have permission to react in this room. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `message_reactions.reaction_added` | Fires when a user successfully adds an emoji reaction to a message | `message_id`, `room_id`, `emoji`, `reactor_username`, `reacted_at` |
| `message_reactions.reaction_removed` | Fires when a user removes their emoji reaction from a message | `message_id`, `room_id`, `emoji`, `reactor_username`, `reacted_at` |
| `message_reactions.reaction_toggled` | Fires after a toggle operation resolves to either an add or remove | `message_id`, `room_id`, `emoji`, `reactor_username`, `reacted_at` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| channel-messaging | required | Reactions are attached to messages in channels or direct conversations |
| direct-messaging | recommended | Reactions may also be applied to direct message content |
| message-threading | optional | Reactions can be applied to thread replies as well as parent messages |

## AGI Readiness

### Goals

#### Manage Emoji Reactions

Allow users to add and remove emoji reactions on messages with toggle semantics and correct permission checks

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| reaction_consistency_rate | 100% | Reactions stored once per user per emoji per message / total add attempts |

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before disabling reactions for an entire workspace

### Verification

**Invariants:**

- each user can only appear once per emoji per message
- when the last reaction for an emoji is removed the emoji entry is deleted from the message
- muted users cannot add reactions

**Acceptance Tests:**

| Scenario | Given | When | Expect |
|----------|-------|------|--------|
| toggle removes existing reaction | user has already reacted with thumbs-up to a message | user reacts with thumbs-up again | reaction is removed and reaction_removed event emitted |
| invalid emoji rejected | user submits an unknown emoji code | reaction is submitted | REACTION_INVALID_EMOJI error returned |

### Composability

**Capabilities:**

- `reaction_toggle`: Add or remove a per-user emoji reaction on a message with toggle semantics

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| simplicity | expressiveness | toggle semantics prevent duplicate reactions and simplify client state management |

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
  "name": "Message Reactions Blueprint",
  "description": "Emoji reactions on messages, allowing users to express sentiment without posting a reply; supports toggle (add/remove) semantics. 7 fields. 8 outcomes. 5 error ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "messaging, reactions, emoji, engagement"
}
</script>
