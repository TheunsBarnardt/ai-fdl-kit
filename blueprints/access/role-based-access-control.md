<!-- AUTO-GENERATED FROM role-based-access-control.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Role Based Access Control

> Three-tier RBAC system where permissions are granted through roles assigned at system, workspace, and channel scopes. Roles are additive and hierarchical.

**Category:** Access · **Version:** 1.0.0 · **Tags:** rbac · roles · permissions · authorization · multi-scope

## What this does

Three-tier RBAC system where permissions are granted through roles assigned at system, workspace, and channel scopes. Roles are additive and hierarchical.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **role_id** *(hidden, required)* — Unique role identifier
- **role_name** *(text, required)* — Machine-readable unique role name (e
- **display_name** *(text, required)* — Human-readable role label
- **permissions** *(json, required)* — Array of permission IDs granted by this role
- **scheme_managed** *(boolean, required)* — True if the role is created and managed by a permission scheme
- **built_in** *(boolean, required)* — True for platform-defined roles that cannot be deleted

## What must be true

- **rule_01:** Three permission scopes exist: system (platform-wide), team (per workspace), and channel (per channel). Permissions granted at higher scopes apply to lower scopes.
- **rule_02:** Built-in roles (system_admin, system_user, team_admin, team_user, channel_admin, channel_user, guest variants) cannot be deleted.
- **rule_03:** Scheme-managed roles are controlled by permission schemes and cannot be directly reassigned via explicit role assignment.
- **rule_04:** A user holds a system role (from their user record), zero or more team roles (from each team membership), and zero or more channel roles (from each channel membership).
- **rule_05:** Permission resolution is additive: if any role at any scope grants a permission, access is allowed.
- **rule_06:** A system administrator bypasses all permission checks unless the RestrictSystemAdmin setting is enabled.
- **rule_07:** A member cannot simultaneously hold both the user and guest roles within the same team or channel.
- **rule_08:** Explicit roles (non-scheme roles) can be assigned in addition to scheme-assigned defaults.
- **rule_09:** Role permission updates take effect immediately for all users currently holding that role.

## Success & failure scenarios

**✅ Success paths**

- **Permission Granted** — when actor requests access to a resource or action; actor holds at least one role that includes the required permission at the relevant scope, then Access granted; action proceeds.
- **Role Created** — when actor is system administrator; role name is unique; permissions list contains only valid permission IDs, then Custom role available for assignment.
- **Role Updated** — when actor is system administrator; role exists and is not a scheme-managed role being modified outside a scheme, then Permission change takes effect immediately for all role holders.
- **Team Member Role Assigned** — when actor has permission to manage team roles; target user is an active member of the team; new roles are valid and compatible (not both user and guest), then Role change reflected immediately in permission checks for that team.

**❌ Failure paths**

- **Built In Role Delete Rejected** — when actor attempts to delete a role with built_in or scheme_managed flag set, then Deletion rejected. *(error: `CANNOT_DELETE_BUILT_IN_ROLE`)*
- **Guest User Role Conflict** — when actor attempts to assign both guest and user roles to the same member, then Assignment rejected; a member may only be guest or user, not both. *(error: `GUEST_USER_ROLE_CONFLICT`)*
- **Permission Denied** — when actor requests access to a resource or action; no role held by the actor at any scope grants the required permission, then Access denied; action blocked with permission error. *(error: `PERMISSION_DENIED`)*

## Errors it can return

- `PERMISSION_DENIED` — You do not have permission to perform this action.
- `ROLE_NOT_FOUND` — The specified role does not exist.
- `CANNOT_DELETE_BUILT_IN_ROLE` — Built-in and scheme-managed roles cannot be deleted.
- `ROLE_NAME_CONFLICT` — A role with that name already exists.
- `INVALID_PERMISSION` — One or more permission IDs are not valid for this scope.
- `GUEST_USER_ROLE_CONFLICT` — A member cannot simultaneously hold both guest and user roles.

## Events

**`rbac.role_created`** — A new custom role was created
  Payload: `role_id`, `role_name`, `permissions`, `actor_id`, `timestamp`

**`rbac.role_updated`** — A role's permission set was modified
  Payload: `role_id`, `permissions`, `actor_id`, `timestamp`

**`rbac.role_deleted`** — A custom role was deleted
  Payload: `role_id`, `actor_id`, `timestamp`

**`rbac.permission_checked`** — An authorization check was performed (for audit/observability)
  Payload: `actor_id`, `permission_id`, `resource_id`, `scope`, `result`, `timestamp`

**`rbac.team_member_role_changed`** — A team member's roles were updated
  Payload: `team_id`, `user_id`, `old_roles`, `new_roles`, `actor_id`, `timestamp`

**`rbac.channel_member_role_changed`** — A channel member's roles were updated
  Payload: `channel_id`, `user_id`, `old_roles`, `new_roles`, `actor_id`, `timestamp`

## Connects to

- **team-workspaces** *(required)* — Teams are the primary boundary where team-scoped roles are applied
- **permission-scheme-management** *(required)* — Schemes define default role assignments for teams and channels
- **guest-accounts** *(required)* — Guest role is a special system-level role with restricted defaults
- **channel-moderation** *(recommended)* — Channel moderation patches role permissions at the channel scope

## Quality fitness 🟢 79/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `██████░░░░` | 6/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/role-based-access-control/) · **Spec source:** [`role-based-access-control.blueprint.yaml`](./role-based-access-control.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
