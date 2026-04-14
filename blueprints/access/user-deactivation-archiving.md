<!-- AUTO-GENERATED FROM user-deactivation-archiving.blueprint.yaml — DO NOT EDIT. Run `npm run generate:readmes` to refresh. -->

# User Deactivation Archiving

> Controlled suspension and permanent deletion of user accounts, preserving message history and audit trails on soft-deactivation while supporting hard deletion for GDPR right-to-erasure requests.

**Category:** Access · **Version:** 1.0.0 · **Tags:** deactivation · archiving · gdpr · erasure · soft-delete · account-lifecycle

## What this does

Controlled suspension and permanent deletion of user accounts, preserving message history and audit trails on soft-deactivation while supporting hard deletion for GDPR right-to-erasure requests.

Specifies 4 acceptance outcomes that any implementation must satisfy, regardless of language or framework.

## Fields

- **user_id** *(hidden, required)* — Unique identifier for the user account
- **delete_at** *(datetime, required)* — Timestamp when the account was soft-deactivated; zero means the account is activ
- **update_at** *(datetime, required)* — Timestamp of the last status change
- **disable_bots_on_owner_deactivation** *(boolean, optional)* — When true, bots owned by a deactivated user are also deactivated

## What must be true

- **rule_01:** Deactivation is a soft-delete — the delete_at timestamp is set but all message content, channel memberships, and audit records are preserved.
- **rule_02:** Deactivated users cannot log in; all existing sessions are immediately revoked upon deactivation.
- **rule_03:** Deactivated users' messages remain visible in channels with attribution to the original author.
- **rule_04:** Deactivated accounts cannot be added to channels or teams.
- **rule_05:** Reactivating a deactivated account is subject to the server's seat limit; activation is rejected if the limit is reached.
- **rule_06:** {"Permanent deletion is a hard-delete — all related records are removed":"sessions, OAuth data, webhooks, slash commands, preferences, channel memberships, and posts."}
- **rule_07:** Profile images and file uploads associated with the user are deleted from storage during permanent deletion.
- **rule_08:** When a user who owns bots is deactivated, bots they own are also deactivated if the relevant server setting is enabled.
- **rule_09:** Deactivating the only system administrator generates a warning; the operation is not blocked but should be done with caution.
- **rule_10:** Deactivation triggers a cache invalidation for all affected users across all teams.
- **rule_11:** Plugin hooks are notified asynchronously when a user is deactivated.

## Success & failure scenarios

**✅ Success paths**

- **User Deactivated** — when actor is system administrator or LDAP sync; user account is currently active, then User cannot log in; existing sessions terminated; messages and history preserved.
- **User Reactivated** — when actor is system administrator; user account is deactivated; seat limit is not exceeded, then User can log in again; history and memberships restored.
- **User Permanently Deleted** — when actor is system administrator; GDPR right-to-erasure request confirmed, then All user data removed; action is irreversible.

**❌ Failure paths**

- **Reactivation Seat Limit Exceeded** — when actor attempts to reactivate a deactivated user; server is at or above the licensed seat limit, then Reactivation blocked; administrator must free a seat first. *(error: `USER_SEAT_LIMIT_EXCEEDED`)*

## Errors it can return

- `USER_SEAT_LIMIT_EXCEEDED` — The server has reached its user limit. Please contact your administrator.
- `USER_NOT_FOUND` — User account not found.
- `USER_ALREADY_DEACTIVATED` — This account is already deactivated.
- `USER_CANNOT_DELETE_SELF` — Administrators cannot permanently delete their own account through this operation.

## Events

**`user.deactivated`** — User account suspended; all sessions revoked
  Payload: `user_id`, `actor_id`, `reason`, `timestamp`

**`user.reactivated`** — Suspended user account restored to active status
  Payload: `user_id`, `actor_id`, `timestamp`

**`user.permanently_deleted`** — User account and all associated data permanently removed
  Payload: `user_id`, `actor_id`, `timestamp`

**`user.bot_deactivated_on_owner_suspend`** — Bot deactivated because its owner was deactivated
  Payload: `bot_user_id`, `owner_user_id`, `timestamp`

## Connects to

- **session-management-revocation** *(required)* — Deactivation immediately revokes all active sessions
- **gdpr-data-export** *(recommended)* — GDPR export should be run before permanent deletion to satisfy portability requests
- **ldap-authentication-sync** *(optional)* — LDAP sync can trigger automatic deactivation when directory entries are removed
- **audit-logging** *(required)* — All deactivation and deletion events are recorded in the immutable audit log

## Quality fitness 🟢 75/100

Automated quality score measuring outcome coverage, rule structure, error binding, and field validation depth. Regenerated by `npm run fitness` — see [`scripts/fitness.js`](../../scripts/fitness.js) for the scoring model.

| Dimension | Score | Points |
|-----------|-------|--------|
| Description | `██████████` | 10/10 |
| Rules | `██████░░░░` | 6/10 |
| Outcomes | `████████████████████░░░░░` | 20/25 |
| Structured conditions | `██████░░░░` | 6/10 |
| Error binding | `████░░░░░░` | 4/10 |
| Field validation | `██████░░░░` | 6/10 |
| Relationships | `██████████` | 10/10 |
| Events | `█████` | 5/5 |
| AGI readiness | `████░` | 4/5 |
| Simplicity | `████░` | 4/5 |

---

**Full reference:** [docs site](https://theunsbarnardt.github.io/ai-fdl-kit/blueprints/access/user-deactivation-archiving/) · **Spec source:** [`user-deactivation-archiving.blueprint.yaml`](./user-deactivation-archiving.blueprint.yaml)

*Generated from YAML — any edits to this file will be overwritten. Update the blueprint YAML and re-run `npm run generate:readmes`.*
