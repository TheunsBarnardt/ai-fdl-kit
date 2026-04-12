---
title: "Ldap Authentication Sync Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Directory service authentication and periodic synchronization that validates credentials against an LDAP/Active Directory server and keeps user profiles and gro"
---

# Ldap Authentication Sync Blueprint

> Directory service authentication and periodic synchronization that validates credentials against an LDAP/Active Directory server and keeps user profiles and group memberships current with the...

| | |
|---|---|
| **Feature** | `ldap-authentication-sync` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | ldap, active-directory, directory-sync, enterprise-auth, group-sync |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/ldap-authentication-sync.blueprint.yaml) |
| **JSON API** | [ldap-authentication-sync.json]({{ site.baseurl }}/api/blueprints/auth/ldap-authentication-sync.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | End User | human | Authenticates with directory credentials |
| `system_admin` | System Administrator | human | Configures LDAP settings, runs diagnostic tests, triggers manual syncs |
| `sync_job` | Sync Job | system | Background process that periodically synchronizes users and groups from the directory |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `server_url` | url | Yes | LDAP/AD server connection URL (ldap:// or ldaps://) |  |
| `bind_username` | text | Yes | Service account DN used to bind to the directory for searches |  |
| `bind_password` | password | Yes | Password for the bind service account |  |
| `base_dn` | text | Yes | Base distinguished name from which to search for users |  |
| `user_filter` | text | No | LDAP filter to restrict which directory entries are treated as users |  |
| `group_filter` | text | No | LDAP filter to restrict which directory entries are treated as groups |  |
| `attribute_username` | text | Yes | Directory attribute mapped to application username |  |
| `attribute_email` | text | Yes | Directory attribute mapped to user email address |  |
| `attribute_first_name` | text | No | Directory attribute mapped to first name |  |
| `attribute_last_name` | text | No | Directory attribute mapped to last name |  |
| `sync_interval_minutes` | number | No | How frequently the background sync job runs (in minutes) | Validations: min |
| `max_login_attempts` | number | No | Maximum consecutive failed login attempts before account lockout | Validations: min |

## States

**State field:** `user_ldap_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `deactivated` |  |  |
| `migrated` |  |  |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `deactivated` | sync_job |  |
|  | `deactivated` | `active` | sync_job |  |

## Rules

- **rule_01:** User passwords are never stored in the application; credentials are validated directly against the directory server on every login.
- **rule_02:** Failed login attempts are counted per user; exceeding the configured maximum triggers an account lockout.
- **rule_03:** A distributed lock prevents concurrent authentication attempts for the same user, eliminating race conditions.
- **rule_04:** On successful login, the failed attempt counter is reset to zero.
- **rule_05:** User profile attributes (email, first name, last name, username) are synchronized from directory attributes on every login and during background sync.
- **rule_06:** When a user is removed from the directory, the background sync deactivates their application account.
- **rule_07:** Group memberships in the directory are mapped to application group memberships during sync; group-constrained workspaces enforce this.
- **rule_08:** LDAP users can activate TOTP multi-factor authentication; after successful directory password validation, the TOTP code is checked before a session is created.
- **rule_09:** Non-LDAP accounts can be migrated to LDAP by providing valid directory credentials during a switch operation.
- **rule_10:** Diagnostic tests can be run against the live directory configuration without saving changes.

## Outcomes

### Ldap_account_locked (Priority: 2) — Error: `LDAP_ACCOUNT_LOCKED`

**Given:**
- failed login attempts equal or exceed max_login_attempts

**Result:** Login blocked until administrator resets the attempt counter

### Ldap_server_unreachable (Priority: 3) — Error: `LDAP_SERVER_UNAVAILABLE`

**Given:**
- LDAP server cannot be reached or connection refused

**Result:** Login rejected with temporary error; no change to attempt counter

### Ldap_login_invalid_credentials (Priority: 5) — Error: `LDAP_INVALID_CREDENTIALS`

**Given:**
- user provides incorrect directory password

**Then:**
- **set_field** target: `user.failed_attempts` — Increment failed login attempt counter

**Result:** Login rejected; attempt counter incremented

### User_deactivated_by_sync (Priority: 8)

**Given:**
- sync job runs
- user exists in the application but is no longer present in the directory

**Then:**
- **set_field** target: `user.delete_at` value: `now`
- **invalidate** target: `user_sessions` — All active sessions for the deactivated user are revoked
- **emit_event** event: `auth.ldap_user_deactivated`

**Result:** User account deactivated; existing sessions terminated

### Ldap_login_success (Priority: 10)

**Given:**
- LDAP authentication is enabled
- user provides valid directory username and password
- account is not locked due to excessive failed attempts
- MFA code is valid (if MFA is activated for this user)

**Then:**
- **set_field** target: `user.failed_attempts` value: `0`
- **create_record** target: `session` — Session created with configured web/LDAP session length
- **emit_event** event: `auth.ldap_login_success`

**Result:** User is authenticated and a session is established

### Sync_completed (Priority: 10)

**Given:**
- background sync job triggers at configured interval
- directory is reachable

**Then:**
- **set_field** target: `user_profiles` — Profile attributes updated from directory attributes for all active LDAP users
- **set_field** target: `group_memberships` — Application group memberships reconciled with directory group membership
- **emit_event** event: `auth.ldap_sync_completed`

**Result:** User profiles and group memberships reflect current directory state

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `LDAP_INVALID_CREDENTIALS` | 401 | Your username or password is incorrect. | No |
| `LDAP_ACCOUNT_LOCKED` | 423 | Your account has been locked due to too many failed login attempts. | No |
| `LDAP_SERVER_UNAVAILABLE` | 503 | Unable to reach the directory server. Please try again later. | No |
| `LDAP_NOT_ENABLED` | 403 | Directory authentication is not configured on this server. | No |
| `LDAP_INVALID_FILTER` | 401 | The directory search filter is invalid. Please contact your administrator. | No |
| `LDAP_USER_NOT_FOUND` | 404 | No matching account was found in the directory. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `auth.ldap_login_success` | User authenticated successfully via directory credentials | `user_id`, `timestamp` |
| `auth.ldap_login_failed` | Directory authentication attempt failed | `reason`, `attempt_count`, `timestamp` |
| `auth.ldap_sync_completed` | Background directory synchronization completed | `users_synced`, `users_deactivated`, `groups_synced`, `duration_ms`, `timestamp` |
| `auth.ldap_user_deactivated` | User account deactivated because directory entry was removed | `user_id`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multi-factor-authentication | recommended | LDAP users can activate TOTP MFA; MFA check occurs after directory password validation |
| session-management | required | Successful LDAP login creates a managed session |
| team-workspaces | optional | Group-constrained workspaces use LDAP group sync to manage membership |
| saml-sso | optional | SAML and LDAP can coexist; SAML may delegate attribute enrichment to LDAP |

## AGI Readiness

### Goals

#### Reliable Ldap Authentication Sync

Directory service authentication and periodic synchronization that validates credentials against an LDAP/Active Directory server and keeps user profiles and group memberships current with the...

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
| security | performance | authentication must prioritize preventing unauthorized access |

### Coordination

**Protocol:** `orchestrated`

**Consumes:**

| Capability | From | Fallback |
|------------|------|----------|
| `session_management` | session-management | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| ldap_login_success | `autonomous` | - | - |
| ldap_login_invalid_credentials | `autonomous` | - | - |
| ldap_account_locked | `autonomous` | - | - |
| ldap_server_unreachable | `autonomous` | - | - |
| sync_completed | `autonomous` | - | - |
| user_deactivated_by_sync | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 6
  entry_points:
    - server/channels/app/authentication.go
    - server/einterfaces/ldap.go
    - server/public/model/ldap.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Ldap Authentication Sync Blueprint",
  "description": "Directory service authentication and periodic synchronization that validates credentials against an LDAP/Active Directory server and keeps user profiles and gro",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "ldap, active-directory, directory-sync, enterprise-auth, group-sync"
}
</script>
