---
title: "Team Workspaces Blueprint"
layout: default
parent: "Communication"
grand_parent: Blueprint Catalog
description: "Multi-tenant workspace model where users belong to isolated teams, each with their own channels, members, and permission configurations. . 10 fields. 7 outcomes"
---

# Team Workspaces Blueprint

> Multi-tenant workspace model where users belong to isolated teams, each with their own channels, members, and permission configurations.


| | |
|---|---|
| **Feature** | `team-workspaces` |
| **Category** | Communication |
| **Version** | 1.0.0 |
| **Tags** | multi-tenant, workspaces, teams, collaboration, isolation |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/communication/team-workspaces.blueprint.yaml) |
| **JSON API** | [team-workspaces.json]({{ site.baseurl }}/api/blueprints/communication/team-workspaces.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system_admin` | System Administrator | human | Manages all teams across the platform |
| `team_admin` | Team Administrator | human | Manages a specific team's membership and settings |
| `member` | Team Member | human | Regular participant in a team |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `team_id` | hidden | Yes | Unique identifier for the team (auto-generated) |  |
| `name` | text | Yes | URL-friendly unique slug, 2–64 alphanumeric characters and hyphens | Validations: pattern, minLength, maxLength |
| `display_name` | text | Yes | User-visible team name, up to 64 Unicode characters | Validations: minLength, maxLength |
| `description` | text | No | Team description shown to members | Validations: maxLength |
| `type` | select | Yes | Membership model — open (anyone can join) or invite-only |  |
| `allowed_domains` | text | No | Comma-separated email domains permitted to join; empty means no restriction | Validations: maxLength |
| `allow_open_invite` | boolean | No | Whether the team publishes an open invite link |  |
| `group_constrained` | boolean | No | When true, membership is limited to members of linked identity provider groups |  |
| `scheme_id` | hidden | No | Reference to the permission scheme applied to this team |  |
| `invite_id` | token | No | Unique invite token used to join the team via link |  |

## States

**State field:** `status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `archived` |  |  |
| `cloud_limit_archived` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `archived` | team_admin |  |
|  | `archived` | `active` | system_admin |  |
|  | `active` | `cloud_limit_archived` | system |  |
|  | `cloud_limit_archived` | `active` | system_admin |  |

## Rules

- **rule_01:** Team name must be unique across the platform; duplicate names are rejected.
- **rule_02:** Team name may not start with reserved system prefixes.
- **rule_03:** Display name is required and must be between 1 and 64 Unicode characters.
- **rule_04:** When allowed_domains is set, users may only join if their email domain matches.
- **rule_05:** When group_constrained is true, membership changes are driven by the linked identity provider group sync; manual additions are rejected unless the user is in a synced group.
- **rule_06:** An invite_id is auto-generated at creation and can be regenerated to invalidate existing invite links.
- **rule_07:** Archiving a team preserves all messages, channels, and membership records.
- **rule_08:** When a subscription plan enforces a team limit, the system archives the oldest active teams first; teams are restored automatically if the limit increases.
- **rule_09:** A team may have at most one permission scheme assigned at a time.

## Outcomes

### Team_name_conflict (Priority: 2) — Error: `TEAM_NAME_ALREADY_EXISTS`

**Given:**
- team name already used by another active team

**Result:** Creation rejected with conflict error

### Group_constrained_join_rejected (Priority: 3) — Error: `TEAM_GROUP_CONSTRAINED`

**Given:**
- group_constrained is true
- user is not a member of any linked identity provider group for this team

**Result:** Join attempt rejected; user must be added via group sync

### Team_created (Priority: 10)

**Given:**
- actor has permission to create teams
- team name is unique and valid
- display name is provided

**Then:**
- **create_record** target: `team` — New team record created with active status and generated invite_id
- **emit_event** event: `team.created`

**Result:** Team is created and the creating user is added as team administrator

### Team_updated (Priority: 10)

**Given:**
- actor has permission to manage this team
- updated fields pass validation

**Then:**
- **set_field** target: `update_at` value: `now`
- **emit_event** event: `team.updated`

**Result:** Team settings updated and all members notified in real time

### Team_archived (Priority: 10)

**Given:**
- actor has permission to delete this team
- team is currently active

**Then:**
- **set_field** target: `delete_at` value: `now`
- **emit_event** event: `team.archived`

**Result:** Team marked archived; members can no longer send messages

### Team_restored (Priority: 10)

**Given:**
- actor is system administrator
- team is currently archived

**Then:**
- **set_field** target: `delete_at` value: `0`
- **emit_event** event: `team.restored`

**Result:** Team returned to active state

### Invite_link_regenerated (Priority: 10)

**Given:**
- actor has permission to manage this team

**Then:**
- **set_field** target: `invite_id` — New unique token generated, old invite links invalidated

**Result:** All previous invite links are immediately revoked

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `TEAM_NAME_ALREADY_EXISTS` | 409 | A team with that name already exists. | No |
| `TEAM_INVALID_NAME` | 400 | Team name may only contain lowercase letters, numbers, and hyphens and must be 2–64 characters. | No |
| `TEAM_DISPLAY_NAME_REQUIRED` | 400 | A display name is required. | No |
| `TEAM_GROUP_CONSTRAINED` | 400 | This team only accepts members through group synchronization. | No |
| `TEAM_DOMAIN_NOT_ALLOWED` | 400 | Your email domain is not permitted to join this team. | No |
| `TEAM_NOT_FOUND` | 404 | Team not found. | No |
| `TEAM_PERMISSION_DENIED` | 403 | You do not have permission to perform this action on this team. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `team.created` | A new team workspace was created | `team_id`, `name`, `type`, `actor_id`, `timestamp` |
| `team.updated` | Team settings were modified | `team_id`, `changed_fields`, `actor_id`, `timestamp` |
| `team.archived` | Team was soft-deleted | `team_id`, `actor_id`, `timestamp` |
| `team.restored` | Archived team was reactivated | `team_id`, `actor_id`, `timestamp` |
| `team.member_added` | A user joined or was added to the team | `team_id`, `user_id`, `roles`, `actor_id`, `timestamp` |
| `team.member_removed` | A user left or was removed from the team | `team_id`, `user_id`, `actor_id`, `timestamp` |
| `team.scheme_updated` | Permission scheme assignment for the team changed | `team_id`, `scheme_id`, `actor_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| role-based-access-control | required | Roles and permissions govern what team members can do |
| permission-scheme-management | optional | Schemes customize default role permissions per team |
| channel-workspaces | required | Teams contain channels where communication happens |
| ldap-authentication-sync | optional | Group-constrained teams sync membership from LDAP groups |
| guest-accounts | optional | Guests may be invited to specific channels within a team |

## AGI Readiness

### Goals

#### Reliable Team Workspaces

Multi-tenant workspace model where users belong to isolated teams, each with their own channels, members, and permission configurations.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| data_accuracy | 100% | Records matching source of truth |
| duplicate_rate | 0% | Duplicate records detected post-creation |

**Constraints:**

- **performance** (non-negotiable): Data consistency must be maintained across concurrent operations
- **security** (non-negotiable): Sensitive fields must be encrypted at rest and never logged in plaintext

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before modifying sensitive data fields
- before transitioning to a terminal state

**Escalation Triggers:**

- `error_rate > 5`

### Verification

**Invariants:**

- sensitive fields are never logged in plaintext
- all data access is authenticated and authorized
- error messages never expose internal system details
- state transitions follow the defined state machine — no illegal transitions

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
| `channel_workspaces` | channel-workspaces | degrade |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| team_created | `supervised` | - | - |
| team_name_conflict | `autonomous` | - | - |
| team_updated | `supervised` | - | - |
| team_archived | `autonomous` | - | - |
| team_restored | `autonomous` | - | - |
| invite_link_regenerated | `autonomous` | - | - |
| group_constrained_join_rejected | `supervised` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 8
  entry_points:
    - server/public/model/team.go
    - server/channels/app/team.go
    - server/public/model/team_member.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Team Workspaces Blueprint",
  "description": "Multi-tenant workspace model where users belong to isolated teams, each with their own channels, members, and permission configurations.\n. 10 fields. 7 outcomes",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "multi-tenant, workspaces, teams, collaboration, isolation"
}
</script>
