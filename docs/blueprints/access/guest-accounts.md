---
title: "Guest Accounts Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Restricted user accounts that can be invited to specific channels only, cannot access broader workspace content, and are automatically removed from a workspace "
---

# Guest Accounts Blueprint

> Restricted user accounts that can be invited to specific channels only, cannot access broader workspace content, and are automatically removed from a workspace when they have no remaining channel...

| | |
|---|---|
| **Feature** | `guest-accounts` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | guests, restricted-access, invitation, external-users, channel-scoped |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/guest-accounts.blueprint.yaml) |
| **JSON API** | [guest-accounts.json]({{ site.baseurl }}/api/blueprints/access/guest-accounts.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system_admin` | System Administrator | human | Configures guest policies, bulk-deactivates guests, invites guests |
| `team_admin` | Team Administrator | human | Invites guests to specific channels within their team |
| `guest` | Guest User | human | External participant with visibility limited to invited channels only |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | hidden | Yes | Unique identifier for the guest user account |  |
| `email` | email | Yes | Guest's email address; used for invitation and login | Validations: maxLength |
| `invite_token` | token | Yes | Single-use token included in the invitation link |  |
| `allowed_domains` | text | No | Optional comma-separated email domains permitted for guest accounts; empty means |  |
| `channel_ids` | json | Yes | Array of channel IDs the guest is being invited to |  |
| `auth_service` | select | Yes | Authentication method for the guest account |  |
| `scheme_guest` | boolean | Yes | Channel membership flag marking this member as a guest role holder |  |

## States

**State field:** `guest_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `invited` | Yes |  |
| `active` |  |  |
| `deactivated` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `invited` | `active` | guest |  |
|  | `active` | `deactivated` | system_admin |  |
|  | `active` | `deactivated` | system |  |

## Rules

- **rule_01:** Guests can only see and interact with the specific channels they have been explicitly invited to; other channels are invisible to them.
- **rule_02:** When a guest is removed from their last channel within a team, they are automatically removed from that team.
- **rule_03:** Guests cannot be converted to regular members and regular members cannot be converted to guests; the roles are mutually exclusive.
- **rule_04:** A guest cannot simultaneously hold both the guest and member roles in the same team or channel.
- **rule_05:** If allowed_domains is configured, the guest's email domain must match one of the permitted domains; invitations to other domains are rejected.
- **rule_06:** Magic-link guest accounts log in via passwordless email links; links expire after a configured duration.
- **rule_07:** Deactivating a guest revokes all active sessions; message content and channel history is preserved.
- **rule_08:** Bulk guest deactivation is available as a single administrative operation affecting all guest accounts system-wide.
- **rule_09:** Invitation tokens are single-use; once accepted or expired they cannot be reused.

## Outcomes

### Guest_domain_rejected (Priority: 2) — Error: `GUEST_DOMAIN_NOT_ALLOWED`

**Given:**
- allowed_domains is configured
- guest email domain does not match any permitted domain

**Result:** Invitation rejected

### Guest_role_change_rejected (Priority: 3) — Error: `GUEST_ROLE_CHANGE_NOT_ALLOWED`

**Given:**
- actor attempts to convert a guest to a regular member or vice versa

**Result:** Role change rejected; accounts must be managed through proper invitation flows

### Guest_removed_from_last_channel (Priority: 8)

**Given:**
- guest is removed from a channel
- guest has no remaining channel memberships in this team

**Then:**
- **delete_record** target: `team_membership` — Guest automatically removed from the team with no channels
- **emit_event** event: `guest.auto_removed_from_team`

**Result:** Guest loses team access; if no teams remain, account is effectively isolated

### Guest_invited (Priority: 10)

**Given:**
- actor has permission to invite guests
- guest email domain matches allowed_domains (if configured)
- channel_ids list is not empty and all channels exist
- guest account limits not exceeded

**Then:**
- **create_record** target: `guest_invitation` — Invitation record created with single-use token
- **notify** target: `guest_email` — Invitation email sent with link containing the invite token
- **emit_event** event: `guest.invited`

**Result:** Guest receives email invitation to join the specified channels

### Guest_account_created (Priority: 10)

**Given:**
- guest follows valid invitation link
- invite token has not been used or expired

**Then:**
- **create_record** target: `user` — Guest user account created with system_guest role
- **create_record** target: `channel_memberships` — Guest added to each invited channel with scheme_guest flag
- **emit_event** event: `guest.joined`

**Result:** Guest can access the invited channels; all other content is hidden

### Bulk_guest_deactivation (Priority: 10)

**Given:**
- actor is system administrator

**Then:**
- **set_field** target: `all_guest_accounts.delete_at` value: `now`
- **invalidate** target: `all_guest_sessions` — All sessions for all guest accounts revoked
- **emit_event** event: `guest.bulk_deactivated`

**Result:** All guest accounts deactivated system-wide; existing sessions terminated

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `GUEST_DOMAIN_NOT_ALLOWED` | 400 | Guests from that email domain are not permitted on this server. | No |
| `GUEST_ROLE_CHANGE_NOT_ALLOWED` | 400 | Guest and member roles cannot be converted between each other. | No |
| `GUEST_INVITE_TOKEN_INVALID` | 401 | This invitation link is invalid or has expired. | No |
| `GUEST_ACCOUNT_LIMIT_EXCEEDED` | 422 | The guest account limit for this server has been reached. | No |
| `GUEST_NOT_FOUND` | 404 | Guest account not found. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `guest.invited` | Invitation sent to a guest user | `invitee_email`, `channel_ids`, `team_id`, `actor_id`, `timestamp` |
| `guest.joined` | Guest accepted invitation and created their account | `user_id`, `channel_ids`, `team_id`, `timestamp` |
| `guest.auto_removed_from_team` | Guest automatically removed from team after leaving last channel | `user_id`, `team_id`, `timestamp` |
| `guest.deactivated` | Individual guest account deactivated | `user_id`, `actor_id`, `timestamp` |
| `guest.bulk_deactivated` | All guest accounts deactivated in a single administrative operation | `deactivated_count`, `actor_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| team-workspaces | required | Guests are scoped to specific teams and auto-removed when channel-less |
| role-based-access-control | required | The guest role determines restricted default permissions |
| session-management-revocation | required | Deactivating guests triggers session revocation |
| email-notifications | recommended | Invitation delivery relies on email notification infrastructure |

## AGI Readiness

### Goals

#### Reliable Guest Accounts

Restricted user accounts that can be invited to specific channels only, cannot access broader workspace content, and are automatically removed from a workspace when they have no remaining channel...

**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

### Tradeoffs

| Prefer | Over | Reason |
|--------|------|--------|
| security | usability | access control must enforce least-privilege principle |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `team_workspaces` | team-workspaces | fail |
| `role_based_access_control` | role-based-access-control | fail |
| `session_management_revocation` | session-management-revocation | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| guest_invited | `autonomous` | - | - |
| guest_account_created | `supervised` | - | - |
| guest_removed_from_last_channel | `human_required` | - | - |
| guest_role_change_rejected | `supervised` | - | - |
| guest_domain_rejected | `supervised` | - | - |
| bulk_guest_deactivation | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 6
  entry_points:
    - server/public/model/guest_invite.go
    - server/public/model/user.go
    - server/channels/app/user.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Guest Accounts Blueprint",
  "description": "Restricted user accounts that can be invited to specific channels only, cannot access broader workspace content, and are automatically removed from a workspace ",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "guests, restricted-access, invitation, external-users, channel-scoped"
}
</script>
