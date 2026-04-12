---
title: "User Deactivation Archiving Blueprint"
layout: default
parent: "Access Control"
grand_parent: Blueprint Catalog
description: "Controlled suspension and permanent deletion of user accounts, preserving message history and audit trails on soft-deactivation while supporting hard deletion f"
---

# User Deactivation Archiving Blueprint

> Controlled suspension and permanent deletion of user accounts, preserving message history and audit trails on soft-deactivation while supporting hard deletion for GDPR right-to-erasure requests.


| | |
|---|---|
| **Feature** | `user-deactivation-archiving` |
| **Category** | Access Control |
| **Version** | 1.0.0 |
| **Tags** | deactivation, archiving, gdpr, erasure, soft-delete, account-lifecycle |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/access/user-deactivation-archiving.blueprint.yaml) |
| **JSON API** | [user-deactivation-archiving.json]({{ site.baseurl }}/api/blueprints/access/user-deactivation-archiving.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `system_admin` | System Administrator | human | Deactivates, reactivates, and permanently deletes user accounts |
| `user` | End User | human | May request their own account deletion for GDPR compliance |
| `ldap_sync` | LDAP Sync Job | system | Automatically deactivates users removed from the directory |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `user_id` | hidden | Yes | Unique identifier for the user account |  |
| `delete_at` | datetime | Yes | Timestamp when the account was soft-deactivated; zero means the account is activ |  |
| `update_at` | datetime | Yes | Timestamp of the last status change |  |
| `disable_bots_on_owner_deactivation` | boolean | No | When true, bots owned by a deactivated user are also deactivated |  |

## States

**State field:** `account_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `deactivated` |  |  |
| `permanently_deleted` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `deactivated` | system_admin |  |
|  | `active` | `deactivated` | ldap_sync |  |
|  | `deactivated` | `active` | system_admin |  |
|  | `active` | `permanently_deleted` | system_admin |  |
|  | `deactivated` | `permanently_deleted` | system_admin |  |

## Rules

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

## Outcomes

### Reactivation_seat_limit_exceeded (Priority: 3) — Error: `USER_SEAT_LIMIT_EXCEEDED`

**Given:**
- actor attempts to reactivate a deactivated user
- server is at or above the licensed seat limit

**Result:** Reactivation blocked; administrator must free a seat first

### User_deactivated (Priority: 10)

**Given:**
- actor is system administrator or LDAP sync
- user account is currently active

**Then:**
- **set_field** target: `user.delete_at` value: `now`
- **invalidate** target: `all_user_sessions` — All active sessions for this user revoked
- **set_field** target: `owned_bots.active` value: `false` — Owned bots deactivated (if policy enabled)
- **emit_event** event: `user.deactivated`

**Result:** User cannot log in; existing sessions terminated; messages and history preserved

### User_reactivated (Priority: 10)

**Given:**
- actor is system administrator
- user account is deactivated
- seat limit is not exceeded

**Then:**
- **set_field** target: `user.delete_at` value: `0`
- **emit_event** event: `user.reactivated`

**Result:** User can log in again; history and memberships restored

### User_permanently_deleted (Priority: 10)

**Given:**
- actor is system administrator
- GDPR right-to-erasure request confirmed

**Then:**
- **delete_record** target: `user_record` — User account and all directly associated records deleted
- **delete_record** target: `user_sessions`
- **delete_record** target: `user_oauth_data`
- **delete_record** target: `user_webhooks`
- **delete_record** target: `user_commands`
- **delete_record** target: `user_preferences`
- **delete_record** target: `user_posts`
- **delete_record** target: `user_profile_image`
- **emit_event** event: `user.permanently_deleted`

**Result:** All user data removed; action is irreversible

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `USER_SEAT_LIMIT_EXCEEDED` | 422 | The server has reached its user limit. Please contact your administrator. | No |
| `USER_NOT_FOUND` | 404 | User account not found. | No |
| `USER_ALREADY_DEACTIVATED` | 409 | This account is already deactivated. | No |
| `USER_CANNOT_DELETE_SELF` | 403 | Administrators cannot permanently delete their own account through this operation. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `user.deactivated` | User account suspended; all sessions revoked | `user_id`, `actor_id`, `reason`, `timestamp` |
| `user.reactivated` | Suspended user account restored to active status | `user_id`, `actor_id`, `timestamp` |
| `user.permanently_deleted` | User account and all associated data permanently removed | `user_id`, `actor_id`, `timestamp` |
| `user.bot_deactivated_on_owner_suspend` | Bot deactivated because its owner was deactivated | `bot_user_id`, `owner_user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| session-management-revocation | required | Deactivation immediately revokes all active sessions |
| gdpr-data-export | recommended | GDPR export should be run before permanent deletion to satisfy portability requests |
| ldap-authentication-sync | optional | LDAP sync can trigger automatic deactivation when directory entries are removed |
| audit-logging | required | All deactivation and deletion events are recorded in the immutable audit log |

## AGI Readiness

### Goals

#### Reliable User Deactivation Archiving

Controlled suspension and permanent deletion of user accounts, preserving message history and audit trails on soft-deactivation while supporting hard deletion for GDPR right-to-erasure requests.


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
| `session_management_revocation` | session-management-revocation | fail |
| `audit_logging` | audit-logging | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| user_deactivated | `autonomous` | - | - |
| user_reactivated | `autonomous` | - | - |
| reactivation_seat_limit_exceeded | `autonomous` | - | - |
| user_permanently_deleted | `human_required` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 5
  entry_points:
    - server/channels/app/user.go
    - server/public/model/user.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "User Deactivation Archiving Blueprint",
  "description": "Controlled suspension and permanent deletion of user accounts, preserving message history and audit trails on soft-deactivation while supporting hard deletion f",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "deactivation, archiving, gdpr, erasure, soft-delete, account-lifecycle"
}
</script>
