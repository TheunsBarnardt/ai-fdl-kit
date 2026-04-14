<!-- AUTO-GENERATED FROM permission-scheme-management.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Permission Scheme Management

> Named collections of default role assignments that can be applied to workspaces or channels to customize the permission baseline for all members, replacing system-wide role defaults with...

**Category:** Access · **Version:** 1.0.0 · **Tags:** permissions · schemes · rbac · role-defaults · access-control · customization

## What this does

Named collections of default role assignments that can be applied to workspaces or channels to customize the permission baseline for all members, replacing system-wide role defaults with...

Specifies 6 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **scheme_id** *(hidden, required)* — Unique identifier for the permission scheme
- **name** *(text, required)* — Unique machine-readable scheme name
- **display_name** *(text, required)* — Human-readable label for the scheme
- **description** *(text, optional)* — Description of the scheme's purpose
- **scope** *(select, required)* — What type of scope this scheme applies to
- **default_team_admin_role** *(text, optional)* — Role ID applied to team administrators in workspaces using this scheme
- **default_team_user_role** *(text, optional)* — Role ID applied to regular members in workspaces using this scheme
- **default_team_guest_role** *(text, optional)* — Role ID applied to guests in workspaces using this scheme
- **default_channel_admin_role** *(text, optional)* — Role ID applied to channel administrators in channels using this scheme
- **default_channel_user_role** *(text, optional)* — Role ID applied to regular members in channels using this scheme
- **default_channel_guest_role** *(text, optional)* — Role ID applied to guests in channels using this scheme

## What must be true

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

## Success & failure scenarios

**✅ Success paths**

- **Scheme Created** — when actor is system administrator; name is unique; scope is valid (team or channel); all referenced role IDs exist, then Scheme available for assignment to workspaces or channels.
- **Scheme Assigned To Workspace** — when actor is system administrator; scheme scope is 'team'; workspace exists and is active, then All future members joining this workspace receive the scheme's default roles; existing members are updated to use scheme roles.
- **Scheme Assigned To Channel** — when actor is system administrator; scheme scope is 'channel'; channel exists and is active, then Channel members receive the scheme's channel-level role defaults.
- **Scheme Permissions Updated** — when actor is system administrator; new permissions list contains only valid permission IDs for the scheme's scope, then Permission changes take effect immediately across all workspaces and channels using this scheme.
- **Scheme Deleted** — when actor is system administrator, then All assignments removed; affected scopes revert to system permission defaults.

**❌ Failure paths**

- **Scheme Name Conflict** — when new scheme name matches an existing active scheme, then Creation rejected. *(error: `SCHEME_NAME_ALREADY_EXISTS`)*

## Errors it can return

- `SCHEME_NAME_ALREADY_EXISTS` — A permission scheme with that name already exists.
- `SCHEME_NOT_FOUND` — Permission scheme not found.
- `SCHEME_INVALID_SCOPE` — Scheme scope must be either 'team' or 'channel'.
- `SCHEME_INVALID_ROLE` — One or more referenced role IDs do not exist.
- `SCHEME_DESCRIPTION_TOO_LONG` — Scheme description must be 1024 characters or fewer.

## Events

**`scheme.created`** — A new permission scheme was created
  Payload: `scheme_id`, `name`, `scope`, `actor_id`, `timestamp`

**`scheme.updated`** — Scheme settings or role permissions were modified
  Payload: `scheme_id`, `changed_fields`, `actor_id`, `timestamp`

**`scheme.deleted`** — Permission scheme was deleted and all assignments cleared
  Payload: `scheme_id`, `actor_id`, `timestamp`

**`scheme.assigned_to_workspace`** — Scheme applied to a workspace to customize member role defaults
  Payload: `scheme_id`, `workspace_id`, `actor_id`, `timestamp`

**`scheme.assigned_to_channel`** — Scheme applied to a channel to customize member role defaults
  Payload: `scheme_id`, `channel_id`, `actor_id`, `timestamp`

## Connects to

- **role-based-access-control** *(required)* — Schemes reference and configure roles; RBAC is the underlying mechanism
- **team-workspaces** *(required)* — Workspaces reference schemes; scheme changes affect all members of assigned workspaces
- **channel-moderation** *(recommended)* — Channel moderation patches permissions at the channel level, working alongside channel schemes

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `█████████████████████░░░░` | 21/25 |
| Structured conditions | `█████░░░░░` | 5/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `█████████░` | 9/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/permission-scheme-management/) · **Spec source:** [`permission-scheme-management.blueprint.yaml`](./permission-scheme-management.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
