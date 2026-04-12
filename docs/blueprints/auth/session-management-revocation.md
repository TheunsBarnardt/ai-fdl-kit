---
title: "Session Management Revocation Blueprint"
layout: default
parent: "Auth"
grand_parent: Blueprint Catalog
description: "Lifecycle management for authenticated user sessions including creation, activity-based expiry extension, idle timeout enforcement, and explicit revocation by u"
---

# Session Management Revocation Blueprint

> Lifecycle management for authenticated user sessions including creation, activity-based expiry extension, idle timeout enforcement, and explicit revocation by users or administrators.


| | |
|---|---|
| **Feature** | `session-management-revocation` |
| **Category** | Auth |
| **Version** | 1.0.0 |
| **Tags** | sessions, tokens, revocation, idle-timeout, security |
| **YAML Source** | [View on GitHub](https://github.com/TheunsBarnardt/ai-fdl-kit/blob/master/blueprints/auth/session-management-revocation.blueprint.yaml) |
| **JSON API** | [session-management-revocation.json]({{ site.baseurl }}/api/blueprints/auth/session-management-revocation.json) |

## Actors

| ID | Name | Type | Description |
|----|------|------|-------------|
| `user` | End User | human | Owns sessions created by their logins; can revoke their own sessions |
| `system_admin` | System Administrator | human | Can revoke any user's sessions including all sessions globally |
| `system` | System | system | Enforces expiry, idle timeout, and per-user session limits |

## Fields

| Name | Type | Required | Label | Description |
|------|------|----------|-------|-------------|
| `session_id` | hidden | Yes | Unique session identifier |  |
| `session_token` | token | Yes | Cryptographic bearer token presented on every authenticated request |  |
| `user_id` | hidden | Yes | Owner of the session |  |
| `roles` | text | Yes | Space-separated role identifiers captured at session creation time |  |
| `device_id` | text | No | Optional identifier for the mobile/desktop device that created the session |  |
| `expires_at` | datetime | Yes | Absolute timestamp after which the session is no longer valid |  |
| `last_activity_at` | datetime | Yes | Timestamp of the most recent authenticated request; used for idle timeout |  |
| `session_type` | select | Yes | Classification of the session |  |
| `csrf_token` | token | Yes | Per-session CSRF token validated on state-mutating requests |  |

## States

**State field:** `session_status`

**Values:**

| State | Initial | Terminal |
|-------|---------|----------|
| `active` | Yes |  |
| `expired` |  |  |
| `revoked` |  | Yes |

**Transitions:**

| Name | From | To | Actor | Condition |
|------|------|----|-------|-----------|
|  | `active` | `expired` | system |  |
|  | `active` | `revoked` | user |  |
|  | `active` | `revoked` | system_admin |  |
|  | `active` | `active` | system |  |

## Rules

- **rule_01:** Sessions are validated on every authenticated request by looking up the token in the database and an in-memory cache; a token not found in either is rejected.
- **rule_02:** The per-user maximum session count is 500; when exceeded, the least-recently-used sessions are revoked to make room.
- **rule_03:** Session length differs by type — mobile sessions, SSO sessions, and web sessions each have independently configurable maximum durations.
- **rule_04:** When activity-based extension is enabled, the expiry timestamp is extended on each request, but at most once per approximately 1% of the total session lifetime or once per day to limit write frequency.
- **rule_05:** Idle timeout is enforced separately from absolute expiry; if a configurable inactivity period elapses without requests, the session is revoked asynchronously.
- **rule_06:** User access tokens create sessions with a lifespan of 100 years; they are revoked by disabling or deleting the token, not by expiry.
- **rule_07:** When a session is revoked, the in-memory cache for that user is cleared to ensure all nodes reject the token immediately.
- **rule_08:** Revoking all sessions for a user also invalidates any associated OAuth access data.
- **rule_09:** Device-level revocation removes all sessions associated with a specific device ID, except optionally the current session.
- **rule_10:** A CSRF token is issued per session and validated on all state-mutating requests.

## Outcomes

### Session_token_invalid (Priority: 2) — Error: `SESSION_INVALID_TOKEN`

**Given:**
- session token not found in cache or database

**Result:** Request rejected with 401 Unauthorized

### Session_expired (Priority: 3) — Error: `SESSION_EXPIRED`

**Given:**
- token found but expires_at is in the past

**Then:**
- **delete_record** target: `session` — Expired session removed from database and cache

**Result:** Request rejected; client must re-authenticate

### Idle_timeout_exceeded (Priority: 3) — Error: `SESSION_IDLE_TIMEOUT`

**Given:**
- time since last_activity_at exceeds configured idle timeout
- activity-based extension is not enabled

**Then:**
- **delete_record** target: `session` — Session revoked asynchronously
- **emit_event** event: `session.revoked`

**Result:** Session terminated; user must log in again

### Session_limit_enforced (Priority: 5)

**Given:**
- new session would exceed the per-user maximum session count

**Then:**
- **delete_record** target: `oldest_session` — Least-recently-used session revoked to make room

**Result:** Oldest session silently terminated; new session proceeds

### Session_created (Priority: 10)

**Given:**
- user has successfully authenticated (password + optional MFA)
- user account is active
- session limit not exceeded or LRU revocation makes room

**Then:**
- **create_record** target: `session` — Session record created with token, expiry, and CSRF token; cached in memory
- **emit_event** event: `session.created`

**Result:** Session token returned to client for use on subsequent requests

### Request_authenticated (Priority: 10)

**Given:**
- request includes a valid session token
- token found in cache or database
- expires_at is in the future
- idle timeout has not elapsed

**Then:**
- **set_field** target: `session.last_activity_at` value: `now`
- **set_field** target: `session.expires_at` — Extended if activity-based extension is enabled and extension threshold met

**Result:** Request proceeds as authenticated

### Session_revoked_by_user (Priority: 10)

**Given:**
- user requests sign-out or revokes a specific session

**Then:**
- **delete_record** target: `session` — Session deleted from database; user cache invalidated
- **emit_event** event: `session.revoked`

**Result:** Token invalid on all subsequent requests

### All_sessions_revoked (Priority: 10)

**Given:**
- administrator or system revokes all sessions for a user (e.g., on deactivation)

**Then:**
- **delete_record** target: `all_user_sessions` — All session records for the user deleted; cache flushed
- **invalidate** target: `oauth_access_data` — OAuth access tokens associated with the user revoked
- **emit_event** event: `session.all_revoked`

**Result:** User is signed out everywhere immediately

## Errors

| Code | Status | Message | Retry |
|------|--------|---------|-------|
| `SESSION_INVALID_TOKEN` | 401 | Your session is invalid. Please sign in again. | No |
| `SESSION_EXPIRED` | 401 | Your session has expired. Please sign in again. | No |
| `SESSION_IDLE_TIMEOUT` | 401 | You have been signed out due to inactivity. | No |
| `SESSION_NOT_FOUND` | 404 | Session not found. | No |
| `SESSION_USER_DEACTIVATED` | 403 | Your account has been deactivated. | No |

## Events

| Event | Description | Payload |
|-------|-------------|----------|
| `session.created` | New authenticated session established | `session_id`, `user_id`, `session_type`, `device_id`, `expires_at`, `timestamp` |
| `session.revoked` | Session explicitly terminated | `session_id`, `user_id`, `reason`, `actor_id`, `timestamp` |
| `session.all_revoked` | All sessions for a user revoked in a single operation | `user_id`, `actor_id`, `reason`, `timestamp` |
| `session.extended` | Session expiry pushed forward due to user activity | `session_id`, `user_id`, `new_expires_at`, `timestamp` |

## Related Blueprints

| Feature | Relationship | Reason |
|---------|-------------|--------|
| multi-factor-authentication | required | Sessions are created only after MFA verification (when MFA is active) |
| saml-sso | required | SSO logins produce sessions with the SSO session type and extended lifetime |
| ldap-authentication-sync | required | LDAP logins create web-type sessions with directory-auth markers |
| user-deactivation-archiving | recommended | User deactivation triggers all-session revocation |

## AGI Readiness

### Goals

#### Reliable Session Management Revocation

Lifecycle management for authenticated user sessions including creation, activity-based expiry extension, idle timeout enforcement, and explicit revocation by users or administrators.


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
| `multi_factor_authentication` | multi-factor-authentication | fail |
| `saml_sso` | saml-sso | fail |
| `ldap_authentication_sync` | ldap-authentication-sync | fail |

### Safety

| Action | Permission | Cooldown | Max Auto |
|--------|------------|----------|----------|
| session_created | `supervised` | - | - |
| request_authenticated | `autonomous` | - | - |
| session_token_invalid | `autonomous` | - | - |
| session_expired | `autonomous` | - | - |
| idle_timeout_exceeded | `autonomous` | - | - |
| session_revoked_by_user | `human_required` | - | - |
| all_sessions_revoked | `human_required` | - | - |
| session_limit_enforced | `autonomous` | - | - |

<details>
<summary><strong>Extensions (framework-specific hints)</strong></summary>

```yaml
source:
  repo: https://github.com/mattermost/mattermost
  project: Mattermost
  tech_stack: Go (server), React + TypeScript (webapp)
  files_traced: 5
  entry_points:
    - server/public/model/session.go
    - server/channels/app/session.go
```

</details>


<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Session Management Revocation Blueprint",
  "description": "Lifecycle management for authenticated user sessions including creation, activity-based expiry extension, idle timeout enforcement, and explicit revocation by u",
  "programmingLanguage": "YAML",
  "codeRepository": "https://github.com/TheunsBarnardt/ai-fdl-kit",
  "license": "https://opensource.org/licenses/MIT",
  "keywords": "sessions, tokens, revocation, idle-timeout, security"
}
</script>
