---
title: "Role Based Access Control Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Three-tier RBAC system where permissions are granted through roles assigned at system, workspace, and channel scopes. Roles are additive and hierarchical. . 6 f"
---

# Role Based Access Control Blueprint

> Three-tier RBAC system where permissions are granted through roles assigned at system, workspace, and channel scopes. Roles are additive and hierarchical.


| | |
|---|---|
| **Feature** | `role-based-access-control` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | rbac, roles, permissions, authorization, multi-scope |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/role-based-access-control.blueprint.yaml) |
| **JSON API** | [role-based-access-control.json]({{ site.baseurl }}/api/blueprints/access/role-based-access-control.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system_admin` | System Administrator | human | Holds unrestricted access; manages all roles and permissions globally |
| `team_admin` | Team Administrator | human | Manages roles and members within a specific team |
| `channel_admin` | Channel Administrator | human | Manages roles within a specific channel |
| `member` | Regular Member | human | Standard user with team and channel-level permissions |
| `guest` | Guest User | human | Restricted participant with limited cross-channel visibility |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `role_id` | hidden | Yes | Unique role identifier |  |
| `role_name` | text | Yes | Machine-readable unique role name (e | Validations: maxLength |
| `display_name` | text | Yes | Human-readable role label |  |
| `permissions` | json | Yes | Array of permission IDs granted by this role |  |
| `scheme_managed` | boolean | Yes | True if the role is created and managed by a permission scheme |  |
| `built_in` | boolean | Yes | True for platform-defined roles that cannot be deleted |  |

## States

**State field:** `role_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `deleted` | system_admin |  |

## Rules

- **rule_01:** Three permission scopes exist: system (platform-wide), team (per workspace), and channel (per channel). Permissions granted at higher scopes apply to lower scopes.
- **rule_02:** Built-in roles (system_admin, system_user, team_admin, team_user, channel_admin, channel_user, guest variants) cannot be deleted.
- **rule_03:** Scheme-managed roles are controlled by permission schemes and cannot be directly reassigned via explicit role assignment.
- **rule_04:** A user holds a system role (from their user record), zero or more team roles (from each team membership), and zero or more channel roles (from each channel membership).
- **rule_05:** Permission resolution is additive: if any role at any scope grants a permission, access is allowed.
- **rule_06:** A system administrator bypasses all permission checks unless the RestrictSystemAdmin setting is enabled.
- **rule_07:** A member cannot simultaneously hold both the user and guest roles within the same team or channel.
- **rule_08:** Explicit roles (non-scheme roles) can be assigned in addition to scheme-assigned defaults.
- **rule_09:** Role permission updates take effect immediately for all users currently holding that role.

## Outcomes

### Built_in_role_delete_rejected (Priority: 2) — Error: `CANNOT_DELETE_BUILT_IN_ROLE`

**Given:**
- actor attempts to delete a role with built_in or scheme_managed flag set

**Result:** Deletion rejected

### Guest_user_role_conflict (Priority: 3) — Error: `GUEST_USER_ROLE_CONFLICT`

**Given:**
- actor attempts to assign both guest and user roles to the same member

**Result:** Assignment rejected; a member may only be guest or user, not both

### Permission_denied (Priority: 5) — Error: `PERMISSION_DENIED`

**Given:**
- actor requests access to a resource or action
- no role held by the actor at any scope grants the required permission

**Then:**
- **emit_event** event: `rbac.permission_checked`

**Result:** Access denied; action blocked with permission error

### Permission_granted (Priority: 10)

**Given:**
- actor requests access to a resource or action
- actor holds at least one role that includes the required permission at the relevant scope

**Then:**
- **emit_event** event: `rbac.permission_checked`

**Result:** Access granted; action proceeds

### Role_created (Priority: 10)

**Given:**
- actor is system administrator
- role name is unique
- permissions list contains only valid permission IDs

**Then:**
- **create_record** target: `role` — Custom role persisted with given permissions
- **emit_event** event: `rbac.role_created`

**Result:** Custom role available for assignment

### Role_updated (Priority: 10)

**Given:**
- actor is system administrator
- role exists and is not a scheme-managed role being modified outside a scheme

**Then:**
- **set_field** target: `permissions` — Updated permissions list replaces existing
- **emit_event** event: `rbac.role_updated`

**Result:** Permission change takes effect immediately for all role holders

### Team_member_role_assigned (Priority: 10)

**Given:**
- actor has permission to manage team roles
- target user is an active member of the team
- new roles are valid and compatible (not both user and guest)

**Then:**
- **set_field** target: `team_member.roles` — Explicit roles updated for team membership record
- **emit_event** event: `rbac.team_member_role_changed`

**Result:** Role change reflected immediately in permission checks for that team

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `PERMISSION_DENIED` | 403 | You do not have permission to perform this action. | No |
| `ROLE_NOT_FOUND` | 404 | The specified role does not exist. | No |
| `CANNOT_DELETE_BUILT_IN_ROLE` | 403 | Built-in and scheme-managed roles cannot be deleted. | No |
| `ROLE_NAME_CONFLICT` | 409 | A role with that name already exists. | No |
| `INVALID_PERMISSION` | 403 | One or more permission IDs are not valid for this scope. | No |
| `GUEST_USER_ROLE_CONFLICT` | 409 | A member cannot simultaneously hold both guest and user roles. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `rbac.role_created` | A new custom role was created | `role_id`, `role_name`, `permissions`, `actor_id`, `timestamp` |
| `rbac.role_updated` | A role's permission set was modified | `role_id`, `permissions`, `actor_id`, `timestamp` |
| `rbac.role_deleted` | A custom role was deleted | `role_id`, `actor_id`, `timestamp` |
| `rbac.permission_checked` | An authorization check was performed (for audit/observability) | `actor_id`, `permission_id`, `resource_id`, `scope`, `result`, `timestamp` |
| `rbac.team_member_role_changed` | A team member's roles were updated | `team_id`, `user_id`, `old_roles`, `new_roles`, `actor_id`, `timestamp` |
| `rbac.channel_member_role_changed` | A channel member's roles were updated | `channel_id`, `user_id`, `old_roles`, `new_roles`, `actor_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| team-workspaces | required | Teams are the primary boundary where team-scoped roles are applied |
| permission-scheme-management | required | Schemes define default role assignments for teams and channels |
| guest-accounts | required | Guest role is a special system-level role with restricted defaults |
| channel-moderation | recommended | Channel moderation patches role permissions at the channel scope |

## AGI Readiness

### Goals

#### Reliable Role Based Access Control

Three-tier RBAC system where permissions are granted through roles assigned at system, workspace, and channel scopes. Roles are additive and hierarchical.


**Success Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| unauthorized_access_rate | 0% | Failed authorization attempts that succeed |
| response_time_p95 | < 500ms | 95th percentile response time |

**Constraints:**

- **security** (non-negotiable): Follow OWASP security recommendations

### Autonomy

**Level:** `supervised`

**Human Checkpoints:**

- before transitioning to a terminal state
- before permanently deleting records

**Escalation Triggers:**

- `error_rate > 5`
- `consecutive_failures > 3`

### Verification

**Invariants:**

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
| `permission_scheme_management` | permission-scheme-management | fail |
| `guest_accounts` | guest-accounts | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| permission_granted | `autonomous` | - | - |
| permission_denied | `autonomous` | - | - |
| role_created | `supervised` | - | - |
| role_updated | `supervised` | - | - |
| built_in_role_delete_rejected | `human_required` | - | - |
| team_member_role_assigned | `autonomous` | - | - |
| guest_user_role_conflict | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 6
  entry_points:
    - server/public/model/role.go
    - server/public/model/permission.go
    - server/channels/app/authorization.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Role Based Access Control Blueprint",
  "description": "Three-tier RBAC system where permissions are granted through roles assigned at system, workspace, and channel scopes. Roles are additive and hierarchical.\n. 6 f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "rbac, roles, permissions, authorization, multi-scope"
}
</script>
