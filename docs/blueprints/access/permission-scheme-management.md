---
title: "Permission Scheme Management Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Named collections of default role assignments that can be applied to workspaces or channels to customize the permission baseline for all members, replacing syst"
---

# Permission Scheme Management Blueprint

> Named collections of default role assignments that can be applied to workspaces or channels to customize the permission baseline for all members, replacing system-wide role defaults with...

| | |
|---|---|
| **Feature** | `permission-scheme-management` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | permissions, schemes, rbac, role-defaults, access-control, customization |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/permission-scheme-management.blueprint.yaml) |
| **JSON API** | [permission-scheme-management.json]({{ site.baseurl }}/api/blueprints/access/permission-scheme-management.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system_admin` | System Administrator | human | Creates, updates, deletes, and assigns permission schemes |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `scheme_id` | hidden | Yes | Unique identifier for the permission scheme |  |
| `name` | text | Yes | Unique machine-readable scheme name | Validations: maxLength |
| `display_name` | text | Yes | Human-readable label for the scheme | Validations: maxLength |
| `description` | text | No | Description of the scheme's purpose | Validations: maxLength |
| `scope` | select | Yes | What type of scope this scheme applies to |  |
| `default_team_admin_role` | text | No | Role ID applied to team administrators in workspaces using this scheme |  |
| `default_team_user_role` | text | No | Role ID applied to regular members in workspaces using this scheme |  |
| `default_team_guest_role` | text | No | Role ID applied to guests in workspaces using this scheme |  |
| `default_channel_admin_role` | text | No | Role ID applied to channel administrators in channels using this scheme |  |
| `default_channel_user_role` | text | No | Role ID applied to regular members in channels using this scheme |  |
| `default_channel_guest_role` | text | No | Role ID applied to guests in channels using this scheme |  |

## States

**State field:** `scheme_status`

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

- **rule_01:** A scheme may have either team scope (defines team-level defaults) or channel scope (defines channel-level defaults) but not both.
- **rule_02:** Each workspace may have at most one scheme assigned; each channel may have at most one scheme assigned.
- **rule_03:** When a scheme is assigned to a workspace, new members joining that workspace receive the scheme's default role for their membership type (admin, user, or guest).
- **rule_04:** Scheme-managed roles may not be directly assigned or removed as explicit roles; they are controlled exclusively through scheme assignment.
- **rule_05:** System-level permissions cannot be overridden by team or channel schemes.
- **rule_06:** Permission resolution is additive across scopes — if any role grants a permission at any scope, access is granted.
- **rule_07:** Deleting a scheme removes all team and channel assignments in the same transaction; affected scopes immediately revert to system defaults.
- **rule_08:** All referenced role IDs in a scheme must exist at the time the scheme is created or updated.
- **rule_09:** When scheme permissions are updated, changes take effect immediately for all current role holders.
- **rule_10:** The system provides a reset mechanism that wipes all custom schemes and roles, restoring factory defaults; this is typically used during major permission system migrations.

## Outcomes

### Scheme_name_conflict (Priority: 2) — Error: `SCHEME_NAME_ALREADY_EXISTS`

**Given:**
- new scheme name matches an existing active scheme

**Result:** Creation rejected

### Scheme_created (Priority: 10)

**Given:**
- actor is system administrator
- name is unique
- scope is valid (team or channel)
- all referenced role IDs exist

**Then:**
- **create_record** target: `permission_scheme` — Scheme record created with all specified default role references
- **emit_event** event: `scheme.created`

**Result:** Scheme available for assignment to workspaces or channels

### Scheme_assigned_to_workspace (Priority: 10)

**Given:**
- actor is system administrator
- scheme scope is 'team'
- workspace exists and is active

**Then:**
- **set_field** target: `workspace.scheme_id` — Workspace now references this scheme for default roles
- **emit_event** event: `scheme.assigned_to_workspace`

**Result:** All future members joining this workspace receive the scheme's default roles; existing members are updated to use scheme roles

### Scheme_assigned_to_channel (Priority: 10)

**Given:**
- actor is system administrator
- scheme scope is 'channel'
- channel exists and is active

**Then:**
- **set_field** target: `channel.scheme_id` — Channel now references this scheme for member role defaults
- **emit_event** event: `scheme.assigned_to_channel`

**Result:** Channel members receive the scheme's channel-level role defaults

### Scheme_permissions_updated (Priority: 10)

**Given:**
- actor is system administrator
- new permissions list contains only valid permission IDs for the scheme's scope

**Then:**
- **set_field** target: `scheme_roles.permissions` — Role permission sets updated; changes propagate to all role holders
- **emit_event** event: `scheme.updated`

**Result:** Permission changes take effect immediately across all workspaces and channels using this scheme

### Scheme_deleted (Priority: 10)

**Given:**
- actor is system administrator

**Then:**
- **set_field** target: `scheme.delete_at` value: `now`
- **set_field** target: `all_assigned_workspaces.scheme_id` value: `null`
- **set_field** target: `all_assigned_channels.scheme_id` value: `null`
- **emit_event** event: `scheme.deleted`

**Result:** All assignments removed; affected scopes revert to system permission defaults

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SCHEME_NAME_ALREADY_EXISTS` | 409 | A permission scheme with that name already exists. | No |
| `SCHEME_NOT_FOUND` | 404 | Permission scheme not found. | No |
| `SCHEME_INVALID_SCOPE` | 400 | Scheme scope must be either 'team' or 'channel'. | No |
| `SCHEME_INVALID_ROLE` | 400 | One or more referenced role IDs do not exist. | No |
| `SCHEME_DESCRIPTION_TOO_LONG` | 400 | Scheme description must be 1024 characters or fewer. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `scheme.created` | A new permission scheme was created | `scheme_id`, `name`, `scope`, `actor_id`, `timestamp` |
| `scheme.updated` | Scheme settings or role permissions were modified | `scheme_id`, `changed_fields`, `actor_id`, `timestamp` |
| `scheme.deleted` | Permission scheme was deleted and all assignments cleared | `scheme_id`, `actor_id`, `timestamp` |
| `scheme.assigned_to_workspace` | Scheme applied to a workspace to customize member role defaults | `scheme_id`, `workspace_id`, `actor_id`, `timestamp` |
| `scheme.assigned_to_channel` | Scheme applied to a channel to customize member role defaults | `scheme_id`, `channel_id`, `actor_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| role-based-access-control | required | Schemes reference and configure roles; RBAC is the underlying mechanism |
| team-workspaces | required | Workspaces reference schemes; scheme changes affect all members of assigned workspaces |
| channel-moderation | recommended | Channel moderation patches permissions at the channel level, working alongside channel schemes |

## AGI Readiness

### Goals

#### Reliable Permission Scheme Management

Named collections of default role assignments that can be applied to workspaces or channels to customize the permission baseline for all members, replacing system-wide role defaults with...

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
| `role_based_access_control` | role-based-access-control | fail |
| `team_workspaces` | team-workspaces | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| scheme_created | `supervised` | - | - |
| scheme_assigned_to_workspace | `autonomous` | - | - |
| scheme_assigned_to_channel | `autonomous` | - | - |
| scheme_permissions_updated | `supervised` | - | - |
| scheme_deleted | `human_required` | - | - |
| scheme_name_conflict | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 6
  entry_points:
    - server/public/model/scheme.go
    - server/public/model/permission.go
    - server/channels/app/permissions.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Permission Scheme Management Blueprint",
  "description": "Named collections of default role assignments that can be applied to workspaces or channels to customize the permission baseline for all members, replacing syst",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "permissions, schemes, rbac, role-defaults, access-control, customization"
}
</script>
