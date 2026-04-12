<!-- AUTO-GENERATED FROM team-workspaces.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# Team Workspaces

> Multi-tenant workspace model where users belong to isolated teams, each with their own channels, members, and permission configurations.

**Category:** Communication · **Version:** 1.0.0 · **Tags:** multi-tenant · workspaces · teams · collaboration · isolation

## What this does

Multi-tenant workspace model where users belong to isolated teams, each with their own channels, members, and permission configurations.

Specifies 7 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **team_id** *(hidden, required)* — Unique identifier for the team (auto-generated)
- **name** *(text, required)* — URL-friendly unique slug, 2–64 alphanumeric characters and hyphens
- **display_name** *(text, required)* — User-visible team name, up to 64 Unicode characters
- **description** *(text, optional)* — Team description shown to members
- **type** *(select, required)* — Membership model — open (anyone can join) or invite-only
- **allowed_domains** *(text, optional)* — Comma-separated email domains permitted to join; empty means no restriction
- **allow_open_invite** *(boolean, optional)* — Whether the team publishes an open invite link
- **group_constrained** *(boolean, optional)* — When true, membership is limited to members of linked identity provider groups
- **scheme_id** *(hidden, optional)* — Reference to the permission scheme applied to this team
- **invite_id** *(token, optional)* — Unique invite token used to join the team via link

## What must be true

- **rule_01:** Team name must be unique across the platform; duplicate names are rejected.
- **rule_02:** Team name may not start with reserved system prefixes.
- **rule_03:** Display name is required and must be between 1 and 64 Unicode characters.
- **rule_04:** When allowed_domains is set, users may only join if their email domain matches.
- **rule_05:** When group_constrained is true, membership changes are driven by the linked identity provider group sync; manual additions are rejected unless the user is in a synced group.
- **rule_06:** An invite_id is auto-generated at creation and can be regenerated to invalidate existing invite links.
- **rule_07:** Archiving a team preserves all messages, channels, and membership records.
- **rule_08:** When a subscription plan enforces a team limit, the system archives the oldest active teams first; teams are restored automatically if the limit increases.
- **rule_09:** A team may have at most one permission scheme assigned at a time.

## Success & failure scenarios

**✅ Success paths**

- **Team Created** — when actor has permission to create teams; team name is unique and valid; display name is provided, then Team is created and the creating user is added as team administrator.
- **Team Updated** — when actor has permission to manage this team; updated fields pass validation, then Team settings updated and all members notified in real time.
- **Team Archived** — when actor has permission to delete this team; team is currently active, then Team marked archived; members can no longer send messages.
- **Team Restored** — when actor is system administrator; team is currently archived, then Team returned to active state.
- **Invite Link Regenerated** — when actor has permission to manage this team, then All previous invite links are immediately revoked.

**❌ Failure paths**

- **Team Name Conflict** — when team name already used by another active team, then Creation rejected with conflict error. *(error: `TEAM_NAME_ALREADY_EXISTS`)*
- **Group Constrained Join Rejected** — when group_constrained is true; user is not a member of any linked identity provider group for this team, then Join attempt rejected; user must be added via group sync. *(error: `TEAM_GROUP_CONSTRAINED`)*

## Errors it can return

- `TEAM_NAME_ALREADY_EXISTS` — A team with that name already exists.
- `TEAM_INVALID_NAME` — Team name may only contain lowercase letters, numbers, and hyphens and must be 2–64 characters.
- `TEAM_DISPLAY_NAME_REQUIRED` — A display name is required.
- `TEAM_GROUP_CONSTRAINED` — This team only accepts members through group synchronization.
- `TEAM_DOMAIN_NOT_ALLOWED` — Your email domain is not permitted to join this team.
- `TEAM_NOT_FOUND` — Team not found.
- `TEAM_PERMISSION_DENIED` — You do not have permission to perform this action on this team.

## Connects to

- **role-based-access-control** *(required)* — Roles and permissions govern what team members can do
- **permission-scheme-management** *(optional)* — Schemes customize default role permissions per team
- **channel-workspaces** *(required)* — Teams contain channels where communication happens
- **ldap-authentication-sync** *(optional)* — Group-constrained teams sync membership from LDAP groups
- **guest-accounts** *(optional)* — Guests may be invited to specific channels within a team

## Quality fitness 🟢 77/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `███████████████████████░░` | 23/25 |
| Structured conditions | `████░░░░░░` | 4/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `███████░░░` | 7/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/communication/team-workspaces/) · **Spec source:** [`team-workspaces.blueprint.yaml`](./team-workspaces.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
