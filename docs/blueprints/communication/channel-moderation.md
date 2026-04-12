---
title: "Channel Moderation Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Tools for channel administrators to control member participation, including muting channels, removing members, and managing posting permissions through role-bas"
---

# Channel Moderation Blueprint

> Tools for channel administrators to control member participation, including muting channels, removing members, and managing posting permissions through role-based moderation controls.


| | |
|---|---|
| **Feature** | `channel-moderation` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | moderation, channel-admin, mute, kick, ban, permissions |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/channel-moderation.blueprint.yaml) |
| **JSON API** | [channel-moderation.json]({{ site.baseurl }}/api/blueprints/communication/channel-moderation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `channel_admin` | Channel Administrator | human | Moderates membership, posting rights, and notification state for a channel |
| `team_admin` | Team Administrator | human | Can moderate all channels within a team |
| `member` | Channel Member | human | Regular participant; can mute the channel for themselves |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `channel_id` | hidden | Yes | Target channel for moderation actions |  |
| `user_id` | hidden | Yes | Target member for moderation actions |  |
| `mark_unread` | select | No | Controls the member's mute state — whether all messages or only mentions mark th |  |
| `roles` | text | No | Space-separated role IDs for the channel member |  |
| `scheme_guest` | boolean | No | True if this member participates as a guest in the channel |  |
| `scheme_admin` | boolean | No | True if this member is a channel administrator |  |
| `moderation_permissions` | json | No | Per-role permission overrides applied at the channel level, controlling which ro |  |

## States

**State field:** `member_moderation_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active_unmuted` | Yes |  |
| `active_muted` |  |  |
| `removed` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active_unmuted` | `active_muted` | member |  |
|  | `active_unmuted` | `active_muted` | channel_admin |  |
|  | `active_muted` | `active_unmuted` | member |  |
|  | `active_unmuted` | `removed` | channel_admin |  |
|  | `active_muted` | `removed` | channel_admin |  |

## Rules

- **rule_01:** Muting is implemented as a notification preference toggle (mark_unread = mention), not a suspension of membership; muted members are still visible in the member list and can still read the channel.
- **rule_02:** Removal from a channel is the mechanism for banning; there is no separate "banned" membership state.
- **rule_03:** A system-generated message is posted to the channel when a member is removed by a moderator.
- **rule_04:** Members cannot be removed from the default channel (typically the first channel all users join) unless they are guests.
- **rule_05:** Group-constrained channels reject removal of members who are in a linked directory group; removal is only permitted for members not in the synchronized group or for members being removed by the synchronization process.
- **rule_06:** Bots cannot be removed from group-constrained channels.
- **rule_07:** Channel moderation patches update role-based posting and reaction permissions for all members of a given role simultaneously (not per-user).
- **rule_08:** When a member is removed, their thread memberships within that channel are also cleared.
- **rule_09:** A channel admin can promote a member to channel admin or demote a channel admin to member.

## Outcomes

### Removal_from_default_channel_rejected (Priority: 3) — Error: `CHANNEL_CANNOT_REMOVE_DEFAULT`

**Given:**
- actor attempts to remove a non-guest member from the default channel

**Result:** Removal rejected

### Group_constrained_removal_rejected (Priority: 3) — Error: `CHANNEL_GROUP_CONSTRAINED_REMOVAL`

**Given:**
- channel is group-constrained
- target user is a member of a linked directory group for this channel

**Result:** Manual removal rejected; member must be removed via group synchronization

### Member_muted (Priority: 10)

**Given:**
- actor has permission to manage channel members or is the target user (self-mute)
- member is active in the channel

**Then:**
- **set_field** target: `channel_member.notify_props.mark_unread` value: `mention`
- **emit_event** event: `channel.member_updated`

**Result:** Only direct mentions mark the channel unread for this member

### Member_unmuted (Priority: 10)

**Given:**
- actor has permission to manage channel members or is the target user
- member is muted

**Then:**
- **set_field** target: `channel_member.notify_props.mark_unread` value: `all`
- **emit_event** event: `channel.member_updated`

**Result:** All messages mark the channel unread again for this member

### Member_removed (Priority: 10)

**Given:**
- actor has permission to manage channel members
- target user is a member of the channel
- channel is not the default channel (unless target is a guest)
- channel is not group-constrained with the user in a linked group

**Then:**
- **delete_record** target: `channel_membership` — Membership record removed; thread memberships in this channel cleared
- **emit_event** event: `channel.member_removed`

**Result:** User loses access to the channel; removal message posted in channel

### Channel_permissions_patched (Priority: 10)

**Given:**
- actor has permission to manage channel roles
- moderation_permissions specifies valid role and permission combinations

**Then:**
- **set_field** target: `channel_scheme_roles.permissions` — Role permissions at the channel level updated
- **emit_event** event: `channel.scheme_updated`

**Result:** Affected role holders immediately gain or lose the patched permissions in this channel

### Member_role_promoted (Priority: 10)

**Given:**
- actor has permission to manage channel roles
- target member is a regular member (not already an admin)

**Then:**
- **set_field** target: `channel_member.scheme_admin` value: `true`
- **emit_event** event: `channel.member_updated`

**Result:** Member becomes a channel administrator with moderation capabilities

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `CHANNEL_CANNOT_REMOVE_DEFAULT` | 403 | Members cannot be removed from the default channel. | No |
| `CHANNEL_GROUP_CONSTRAINED_REMOVAL` | 400 | This member can only be removed through group synchronization. | No |
| `CHANNEL_MEMBER_NOT_FOUND` | 404 | This user is not a member of the channel. | No |
| `CHANNEL_PERMISSION_DENIED` | 403 | You do not have permission to moderate this channel. | No |
| `CHANNEL_INVALID_MODERATION_PERMISSION` | 403 | Invalid permission specified for channel moderation. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `channel.member_removed` | A member was removed from the channel by a moderator | `channel_id`, `user_id`, `actor_id`, `timestamp` |
| `channel.member_updated` | A member's role or notification preferences were changed | `channel_id`, `user_id`, `changed_field`, `new_value`, `actor_id`, `timestamp` |
| `channel.scheme_updated` | Channel-level permission overrides were modified | `channel_id`, `changed_roles`, `actor_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| role-based-access-control | required | Channel moderation operates through the role and permission system |
| team-workspaces | required | Channels exist within teams; team context determines available permissions |
| notification-preferences-dnd | recommended | Muting a channel is an extension of notification preference control |
| guest-accounts | recommended | Guests have distinct channel membership rules (e.g., can be removed from default channels) |

## AGI Readiness

### Goals

#### Reliable Channel Moderation

Tools for channel administrators to control member participation, including muting channels, removing members, and managing posting permissions through role-based moderation controls.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| data_integrity | performance | data consistency must be maintained across all operations |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `role_based_access_control` | role-based-access-control | degrade |
| `team_workspaces` | team-workspaces | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| member_muted | `autonomous` | - | - |
| member_unmuted | `autonomous` | - | - |
| member_removed | `human_required` | - | - |
| removal_from_default_channel_rejected | `human_required` | - | - |
| group_constrained_removal_rejected | `human_required` | - | - |
| channel_permissions_patched | `autonomous` | - | - |
| member_role_promoted | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 5
  entry_points:
    - server/channels/app/channel.go
    - server/public/model/channel_member.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Channel Moderation Blueprint",
  "description": "Tools for channel administrators to control member participation, including muting channels, removing members, and managing posting permissions through role-bas",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "moderation, channel-admin, mute, kick, ban, permissions"
}
</script>
