<!-- AUTO-GENERATED FROM channel-moderation.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Channel Moderation

> Tools for channel administrators to control member participation, including muting channels, removing members, and managing posting permissions through role-based moderation controls.

**Category:** Communication · **Version:** 1.0.0 · **Tags:** moderation · channel-admin · mute · kick · ban · permissions

## What this does

Tools for channel administrators to control member participation, including muting channels, removing members, and managing posting permissions through role-based moderation controls.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **channel_id** *(hidden, required)* — Target channel for moderation actions
- **user_id** *(hidden, required)* — Target member for moderation actions
- **mark_unread** *(select, optional)* — Controls the member's mute state — whether all messages or only mentions mark th
- **roles** *(text, optional)* — Space-separated role IDs for the channel member
- **scheme_guest** *(boolean, optional)* — True if this member participates as a guest in the channel
- **scheme_admin** *(boolean, optional)* — True if this member is a channel administrator
- **moderation_permissions** *(json, optional)* — Per-role permission overrides applied at the channel level, controlling which ro

## What must be true

- **rule_01:** Muting is implemented as a notification preference toggle (mark_unread = mention), not a suspension of membership; muted members are still visible in the member list and can still read the channel.
- **rule_02:** Removal from a channel is the mechanism for banning; there is no separate "banned" membership state.
- **rule_03:** A system-generated message is posted to the channel when a member is removed by a moderator.
- **rule_04:** Members cannot be removed from the default channel (typically the first channel all users join) unless they are guests.
- **rule_05:** Group-constrained channels reject removal of members who are in a linked directory group; removal is only permitted for members not in the synchronized group or for members being removed by the synchronization process.
- **rule_06:** Bots cannot be removed from group-constrained channels.
- **rule_07:** Channel moderation patches update role-based posting and reaction permissions for all members of a given role simultaneously (not per-user).
- **rule_08:** When a member is removed, their thread memberships within that channel are also cleared.
- **rule_09:** A channel admin can promote a member to channel admin or demote a channel admin to member.

## Success & failure scenarios

**✅ Success paths**

- **Member Muted** — when actor has permission to manage channel members or is the target user (self-mute); member is active in the channel, then Only direct mentions mark the channel unread for this member.
- **Member Unmuted** — when actor has permission to manage channel members or is the target user; member is muted, then All messages mark the channel unread again for this member.
- **Member Removed** — when actor has permission to manage channel members; target user is a member of the channel; channel is not the default channel (unless target is a guest); channel is not group-constrained with the user in a linked group, then User loses access to the channel; removal message posted in channel.
- **Channel Permissions Patched** — when actor has permission to manage channel roles; moderation_permissions specifies valid role and permission combinations, then Affected role holders immediately gain or lose the patched permissions in this channel.
- **Member Role Promoted** — when actor has permission to manage channel roles; target member is a regular member (not already an admin), then Member becomes a channel administrator with moderation capabilities.

**❌ Failure paths**

- **Removal From Default Channel Rejected** — when actor attempts to remove a non-guest member from the default channel, then Removal rejected. *(error: `CHANNEL_CANNOT_REMOVE_DEFAULT`)*
- **Group Constrained Removal Rejected** — when channel is group-constrained; target user is a member of a linked directory group for this channel, then Manual removal rejected; member must be removed via group synchronization. *(error: `CHANNEL_GROUP_CONSTRAINED_REMOVAL`)*

## Errors it can return

- `CHANNEL_CANNOT_REMOVE_DEFAULT` — Members cannot be removed from the default channel.
- `CHANNEL_GROUP_CONSTRAINED_REMOVAL` — This member can only be removed through group synchronization.
- `CHANNEL_MEMBER_NOT_FOUND` — This user is not a member of the channel.
- `CHANNEL_PERMISSION_DENIED` — You do not have permission to moderate this channel.
- `CHANNEL_INVALID_MODERATION_PERMISSION` — Invalid permission specified for channel moderation.

## Connects to

- **role-based-access-control** *(required)* — Channel moderation operates through the role and permission system
- **team-workspaces** *(required)* — Channels exist within teams; team context determines available permissions
- **notification-preferences-dnd** *(recommended)* — Muting a channel is an extension of notification preference control
- **guest-accounts** *(recommended)* — Guests have distinct channel membership rules (e.g., can be removed from default channels)

## Quality fitness 🟡 72/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `█████░░░░░` | 5/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `██░░░` | 2/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/channel-moderation/) · **Spec source:** [`channel-moderation.blueprint.yaml`](./channel-moderation.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
