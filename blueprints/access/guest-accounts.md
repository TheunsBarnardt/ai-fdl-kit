<!-- AUTO-GENERATED FROM guest-accounts.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Guest Accounts

> Restricted user accounts that can be invited to specific channels only, cannot access broader workspace content, and are automatically removed from a workspace when they have no remaining channel...

**Category:** Access · **Version:** 1.0.0 · **Tags:** guests · restricted-access · invitation · external-users · channel-scoped

## What this does

Restricted user accounts that can be invited to specific channels only, cannot access broader workspace content, and are automatically removed from a workspace when they have no remaining channel...

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **user_id** *(hidden, required)* — Unique identifier for the guest user account
- **email** *(email, required)* — Guest's email address; used for invitation and login
- **invite_token** *(token, required)* — Single-use token included in the invitation link
- **allowed_domains** *(text, optional)* — Optional comma-separated email domains permitted for guest accounts; empty means
- **channel_ids** *(json, required)* — Array of channel IDs the guest is being invited to
- **auth_service** *(select, required)* — Authentication method for the guest account
- **scheme_guest** *(boolean, required)* — Channel membership flag marking this member as a guest role holder

## What must be true

- **rule_01:** Guests can only see and interact with the specific channels they have been explicitly invited to; other channels are invisible to them.
- **rule_02:** When a guest is removed from their last channel within a team, they are automatically removed from that team.
- **rule_03:** Guests cannot be converted to regular members and regular members cannot be converted to guests; the roles are mutually exclusive.
- **rule_04:** A guest cannot simultaneously hold both the guest and member roles in the same team or channel.
- **rule_05:** If allowed_domains is configured, the guest's email domain must match one of the permitted domains; invitations to other domains are rejected.
- **rule_06:** Magic-link guest accounts log in via passwordless email links; links expire after a configured duration.
- **rule_07:** Deactivating a guest revokes all active sessions; message content and channel history is preserved.
- **rule_08:** Bulk guest deactivation is available as a single administrative operation affecting all guest accounts system-wide.
- **rule_09:** Invitation tokens are single-use; once accepted or expired they cannot be reused.

## Success & failure scenarios

**✅ Success paths**

- **Guest Removed From Last Channel** — when guest is removed from a channel; guest has no remaining channel memberships in this team, then Guest loses team access; if no teams remain, account is effectively isolated.
- **Guest Invited** — when actor has permission to invite guests; guest email domain matches allowed_domains (if configured); channel_ids list is not empty and all channels exist; guest account limits not exceeded, then Guest receives email invitation to join the specified channels.
- **Guest Account Created** — when guest follows valid invitation link; invite token has not been used or expired, then Guest can access the invited channels; all other content is hidden.
- **Bulk Guest Deactivation** — when actor is system administrator, then All guest accounts deactivated system-wide; existing sessions terminated.

**❌ Failure paths**

- **Guest Domain Rejected** — when allowed_domains is configured; guest email domain does not match any permitted domain, then Invitation rejected. *(error: `GUEST_DOMAIN_NOT_ALLOWED`)*
- **Guest Role Change Rejected** — when actor attempts to convert a guest to a regular member or vice versa, then Role change rejected; accounts must be managed through proper invitation flows. *(error: `GUEST_ROLE_CHANGE_NOT_ALLOWED`)*

## Errors it can return

- `GUEST_DOMAIN_NOT_ALLOWED` — Guests from that email domain are not permitted on this server.
- `GUEST_ROLE_CHANGE_NOT_ALLOWED` — Guest and member roles cannot be converted between each other.
- `GUEST_INVITE_TOKEN_INVALID` — This invitation link is invalid or has expired.
- `GUEST_ACCOUNT_LIMIT_EXCEEDED` — The guest account limit for this server has been reached.
- `GUEST_NOT_FOUND` — Guest account not found.

## Events

**`guest.invited`** — Invitation sent to a guest user
  Payload: `invitee_email`, `channel_ids`, `team_id`, `actor_id`, `timestamp`

**`guest.joined`** — Guest accepted invitation and created their account
  Payload: `user_id`, `channel_ids`, `team_id`, `timestamp`

**`guest.auto_removed_from_team`** — Guest automatically removed from team after leaving last channel
  Payload: `user_id`, `team_id`, `timestamp`

**`guest.deactivated`** — Individual guest account deactivated
  Payload: `user_id`, `actor_id`, `timestamp`

**`guest.bulk_deactivated`** — All guest accounts deactivated in a single administrative operation
  Payload: `deactivated_count`, `actor_id`, `timestamp`

## Connects to

- **team-workspaces** *(required)* — Guests are scoped to specific teams and auto-removed when channel-less
- **role-based-access-control** *(required)* — The guest role determines restricted default permissions
- **session-management-revocation** *(required)* — Deactivating guests triggers session revocation
- **email-notifications** *(recommended)* — Invitation delivery relies on email notification infrastructure

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `█████░░░░░` | 5/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/guest-accounts/) · **Spec source:** [`guest-accounts.blueprint.yaml`](./guest-accounts.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
